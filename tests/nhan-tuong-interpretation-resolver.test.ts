/**
 * PHASE 1D-7 — nối THƯ VIỆN LUẬN GIẢI vào production qua resolveInterpretations().
 *
 * Resolver deterministic, fail-closed: chỉ cấp câu chữ SAU khi có luật MATCH hợp lệ
 * (matched===true, không skipped, feature eligible). Kho nguồn rỗng → 0 match → [].
 *
 * Nhóm A–G theo yêu cầu. Dùng PipelineOutput dựng tay để bơm trạng thái match (C/D) mà
 * KHÔNG cần verified source thật — chứng minh CƠ CHẾ resolver, không phải mở rule thật.
 */
import { describe, expect, it } from "vitest";

import {
  resolveInterpretations,
  runPipelineOnFeatures,
  type PipelineOutput,
} from "../src/features/physiognomy/pipeline";
import { INTERPRETATION_LIBRARY } from "../src/knowledge/physiognomy/interpretation-library";
import { KNOWLEDGE_SOURCES } from "../src/knowledge/physiognomy/source";
import { payload as fixturePayload } from "./fixtures/research-samples";

/** PipelineOutput tối thiểu để test resolver — chỉ ruleResults là phần resolver đọc. */
function fakeOutput(ruleResults: PipelineOutput["ruleResults"]): PipelineOutput {
  return {
    pipelineVersion: "physiognomy-pipeline-v1",
    reliability: {},
    eligibility: {},
    ruleResults,
    interpretation: {
      outcome: "INSUFFICIENT_EVIDENCE",
      statements: [],
      reasons: [],
      bundle: { ruleResults, featureEvidence: [], sourceEvidence: [], blocked: [] },
      version: "physiognomy-interpretation-v1",
    },
    summary: {
      totalFeatures: 0, measured: 0, validated: 0, eligible: 0,
      rulesConsidered: ruleResults.length, rulesSkipped: 0, rulesMatched: 0,
    },
  };
}

function ruleResult(over: Partial<PipelineOutput["ruleResults"][number]>): PipelineOutput["ruleResults"][number] {
  return {
    ruleId: "R1", matched: true, skipped: false, skipReasons: [],
    featureEvidence: [], sourceEvidence: [], confidence: 0.5, limitations: [],
    engineVersion: "physiognomy-engine-v1",
    ...over,
  };
}
function featEv(featureKey: string, eligible: boolean) {
  return { featureKey, value: 0.4, confidence: 0.7, measurementStatus: "measured", method: "m", sourceView: "front", eligible };
}

// ─────────────────────────────────────────── A. no evidence → zero

describe("A — không evidence → 0 interpretation", () => {
  it("pipeline thật trên payload fixture → resolver trả []", () => {
    const p = fixturePayload("SESSRES01");
    const out = runPipelineOnFeatures(
      (p.features as { k: string; v: number | null; u: string; c: number; s: string; m: string; w: string | null }[]).map((f) => ({
        key: f.k, value: f.v, unit: f.u, confidence: f.c, status: f.s, method: f.m, sourceView: f.w,
      })),
    );
    expect(out.summary.rulesMatched).toBe(0);
    expect(resolveInterpretations(out)).toEqual([]);
  });
});

// ─────────────────────────────────────────── B. unverified không tự mở conclusion

describe("B — item unverified KHÔNG tự mở kết luận", () => {
  it("luật bị skip (source_not_verified) → resolver bỏ, dù feature map có item", () => {
    const out = fakeOutput([
      ruleResult({
        matched: null, skipped: true, skipReasons: ["source_not_verified"],
        featureEvidence: [featEv("face.three_courts.middle", true)],
      }),
    ]);
    expect(resolveInterpretations(out)).toEqual([]);
  });
});

// ─────────────────────────────────────────── C. feature không eligible → không activate

describe("C — feature mapping hợp lệ nhưng KHÔNG eligible → không activate", () => {
  it("matched nhưng featureEvidence.eligible=false → bỏ", () => {
    const out = fakeOutput([
      ruleResult({ matched: true, featureEvidence: [featEv("face.three_courts.middle", false)] }),
    ]);
    expect(resolveInterpretations(out)).toEqual([]);
  });
});

// ─────────────────────────────────────────── D. valid eligible evidence → chỉ item được phép

describe("D — luật match + feature eligible → CHỈ activate item của feature đó", () => {
  it("map đúng feature key, không lấy item của feature khác", () => {
    const out = fakeOutput([
      ruleResult({
        ruleId: "THREE_COURTS_MIDDLE_001",
        matched: true, skipped: false,
        featureEvidence: [featEv("face.three_courts.middle", true)],
      }),
    ]);
    const resolved = resolveInterpretations(out);
    expect(resolved.length).toBeGreaterThan(0);
    // Mọi item trả về phải map đúng face.three_courts.middle
    for (const r of resolved) {
      expect(r.featureKey).toBe("face.three_courts.middle");
      for (const it of r.items) expect(it.featureConcepts).toContain("face.three_courts.middle");
    }
    // KHÔNG lẫn item của feature khác (ví dụ mũi)
    const allIds = resolved.flatMap((r) => r.items.map((i) => i.id));
    expect(allIds).not.toContain("bo-vi-mui");
  });

  it("mọi item trả về vẫn skill-derived/unverified — resolver KHÔNG nâng cấp", () => {
    const out = fakeOutput([
      ruleResult({ matched: true, featureEvidence: [featEv("face.three_courts.middle", true)] }),
    ]);
    for (const r of resolveInterpretations(out)) {
      for (const it of r.items) {
        expect(it.provenance.type).toBe("skill-derived");
        expect(it.provenance.verificationStatus).toBe("unverified");
      }
    }
  });
});

// ─────────────────────────────────────────── E. không raw media

describe("E — output resolver KHÔNG chứa landmark/media", () => {
  it("không có mảng landmark / base64 / blob trong resolved", () => {
    const out = fakeOutput([
      ruleResult({ matched: true, featureEvidence: [featEv("face.nose.length", true)] }),
    ]);
    const j = JSON.stringify(resolveInterpretations(out));
    for (const cam of ['"l":', "base64", "data:image", "blob", "landmarks"]) {
      expect(j.includes(cam), cam).toBe(false);
    }
  });
});

// ─────────────────────────────────────────── F. production insufficient không đổi

describe("F — production insufficient-evidence KHÔNG đổi vì resolver", () => {
  it("pipeline outcome vẫn INSUFFICIENT_EVIDENCE (resolver không đụng interpret)", () => {
    const p = fixturePayload("SESSRES02");
    const out = runPipelineOnFeatures(
      (p.features as { k: string; v: number | null; u: string; c: number; s: string; m: string; w: string | null }[]).map((f) => ({
        key: f.k, value: f.v, unit: f.u, confidence: f.c, status: f.s, method: f.m, sourceView: f.w,
      })),
    );
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.interpretation.statements).toEqual([]);
    // Gọi resolver KHÔNG làm thay đổi out.interpretation.
    resolveInterpretations(out);
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
  });
});

// ─────────────────────────────────────────── G. library giữ nguyên verificationStatus

describe("G — toàn bộ library giữ nguyên verificationStatus", () => {
  it("KNOWLEDGE_SOURCES chỉ có nguồn cổ thư đã xác minh; thư viện luận giải vẫn skill-derived", () => {
    // Kho nguồn (cổ thư) và thư viện luận giải (skill-derived) là HAI thứ tách biệt: thêm một
    // nguồn cổ thư đã xác minh KHÔNG được phép nâng cấp bất kỳ mục luận giải nào.
    expect(Object.keys(KNOWLEDGE_SOURCES)).toEqual(["SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001"]);
    for (const it of INTERPRETATION_LIBRARY) {
      expect(it.provenance.verificationStatus, it.id).toBe("unverified");
      expect(it.provenance.type, it.id).toBe("skill-derived");
    }
  });
});
