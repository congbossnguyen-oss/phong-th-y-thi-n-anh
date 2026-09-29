/**
 * LÁT CẮT SO SÁNH ĐẦU-CUỐI — 眉長過目 (mày dài hơn mắt).
 *
 * Đây là con đường luận giải THẬT đầu tiên chạy được từ đầu tới cuối:
 *   nguồn đã xác minh (神相全編 卷三 相眉, pin tận ảnh scan trang 141)
 *   → resolver thật mở đúng hiện vật
 *   → luật so sánh (không ngưỡng số)
 *   → engine khớp khi mày > mắt CÙNG BÊN
 *   → tầng luận giải chép nguyên văn mệnh đề 兄弟 của cổ thư.
 *
 * Và quan trọng ngang thế: MỌI nhánh khác vẫn FAIL-CLOSED. Bộ test chứng minh cả hai.
 *
 * Ngữ nghĩa được khoá ở đây là 兄弟 (anh em) — KHÔNG phải tài lộc; xem nguồn đã pin.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KNOWLEDGE_SOURCES,
  NO_EVIDENCE_RESOLVER,
  PINNED_EVIDENCE_RESOLVER,
  rejectSource,
  isUsableSource,
} from "../src/knowledge/physiognomy/source";
import {
  BROW_LONGER_THAN_EYE_SIBLINGS_001,
  isRunnable,
} from "../src/rules/physiognomy/rule";
import { evaluate, type EngineFeature } from "../src/rules/physiognomy/engine";
import { interpret } from "../src/interpretation/physiognomy/index";
import { POLICY_VERSION, type EligibilityVerdict } from "../src/features/physiognomy/measurement-contract/policy";
import { runPhysiognomyPipeline } from "../src/features/physiognomy/pipeline";
import { buildFeatureProfile } from "../src/features/physiognomy/features/extract";

const RULE = BROW_LONGER_THAN_EYE_SIBLINGS_001;
const KEYS = {
  browL: "face.eyebrows.left_length",
  browR: "face.eyebrows.right_length",
  eyeL: "face.eyes.left_width",
  eyeR: "face.eyes.right_width",
} as const;

/** Bốn feature mày/mắt, tỉ lệ chuẩn hoá theo faceWidth (giống contract thật). */
function browEyeFeatures(browLongerThanEye: boolean): EngineFeature[] {
  const brow = browLongerThanEye ? 0.46 : 0.24;
  const eye = 0.3;
  const f = (key: string, value: number): EngineFeature => ({
    key, value, unit: "normalized_ratio", confidence: 0.9,
    status: "measured", method: "euclidean2d(...)/faceWidth", sourceView: "front",
  });
  return [f(KEYS.browL, brow), f(KEYS.eyeL, eye), f(KEYS.browR, brow), f(KEYS.eyeR, eye)];
}

/** Cổng mở cho 4 khoá — chỉ dùng trong test, đường thật không bao giờ tự đạt tới đây. */
function eligibleFor(keys: string[], eligible = true): Record<string, EligibilityVerdict> {
  const out: Record<string, EligibilityVerdict> = {};
  for (const k of keys) {
    out[k] = {
      featureKey: k, eligible,
      reasons: eligible ? [] : ["validation_not_validated"],
      explanation: "", policyVersion: POLICY_VERSION,
    };
  }
  return out;
}
const ALL = Object.values(KEYS);
const ruleText = (id: string) => (id === RULE.ruleId ? RULE.interpretation : "");

// ─────────────────────────────────────────── A. đủ điều kiện + đúng → KHỚP

describe("A — verified + eligible + mày>mắt → KHỚP và luận được", () => {
  const results = evaluate({
    features: browEyeFeatures(true),
    eligibility: eligibleFor(ALL),
    rules: [RULE],
    resolver: PINNED_EVIDENCE_RESOLVER,
  });

  it("luật khớp, không bị bỏ qua", () => {
    expect(results[0].matched).toBe(true);
    expect(results[0].skipped).toBe(false);
    expect(results[0].skipReasons).toEqual([]);
  });

  it("mang đúng provenance: nguồn 神相全編 đã xác minh + 4 feature đo được", () => {
    expect(results[0].sourceEvidence.map((s) => s.sourceId)).toEqual([
      "SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001",
    ]);
    expect(results[0].sourceEvidence[0].verificationStatus).toBe("verified");
    expect(results[0].featureEvidence).toHaveLength(4);
    expect(results[0].featureEvidence.every((f) => f.eligible)).toBe(true);
  });

  it("tầng luận giải chép nguyên văn mệnh đề 兄弟, gắn nguồn — KHÔNG phải tài lộc", () => {
    const out = interpret(results, [], ruleText);
    expect(out.outcome).toBe("ok");
    expect(out.statements).toHaveLength(1);
    const st = out.statements[0];
    // Sự kiện ĐO: khoá feature. Mệnh đề CỔ THƯ: câu chữ + nguồn. Ba lớp tách bạch.
    expect(st.featureKeys.sort()).toEqual(ALL.slice().sort());
    expect(st.sourceIds).toEqual(["SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001"]);
    expect(st.text).toContain("眉長過眼"); // nguyên văn cổ thư
    expect(st.text).toContain("兄弟"); // ngữ nghĩa đúng
    expect(st.text).toContain("không phải tài lộc"); // nói THẲNG đây KHÔNG phải tướng tài lộc
    expect(st.text).toContain("KHÔNG phải suy luận của phần mềm"); // gắn cho cổ thư, không cho hệ
  });
});

// ─────────────────────────────────────────── B. đúng cổng nhưng SO SÁNH SAI → không khớp

describe("B — mày KHÔNG dài hơn mắt → không khớp (khác hẳn bị bỏ qua)", () => {
  const results = evaluate({
    features: browEyeFeatures(false),
    eligibility: eligibleFor(ALL),
    rules: [RULE],
    resolver: PINNED_EVIDENCE_RESOLVER,
  });

  it("matched=false, KHÔNG skip, KHÔNG sinh câu luận", () => {
    expect(results[0].matched).toBe(false);
    expect(results[0].skipped).toBe(false);
    const out = interpret(results, [], ruleText);
    expect(out.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.statements).toEqual([]);
  });
});

// ─────────────────────────────────────────── C. hiện vật không mở được → bỏ qua

describe("C — resolver không mở được hiện vật → bỏ qua vì nguồn", () => {
  it("resolver mặc định TỪ CHỐI → source_not_verified, dù đo hoàn hảo", () => {
    const results = evaluate({
      features: browEyeFeatures(true),
      eligibility: eligibleFor(ALL),
      rules: [RULE],
      resolver: NO_EVIDENCE_RESOLVER, // = gọi engine mà không cắm resolver thật
    });
    expect(results[0].skipped).toBe(true);
    expect(results[0].matched).toBeNull();
    expect(results[0].skipReasons).toContain("source_not_verified");
    expect(results[0].sourceEvidence).toEqual([]);
  });
});

// ─────────────────────────────────────────── D. sai hash → coi như chưa kiểm

describe("D — resolver thật khoá bằng sha256, đổi hash là loại", () => {
  const src = KNOWLEDGE_SOURCES.SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001;

  it("đúng tham chiếu đã pin → resolved", () => {
    expect(PINNED_EVIDENCE_RESOLVER.resolve(src.evidenceRef!)).toBe("resolved");
  });

  it("cùng dạng nhưng hash lạ → missing (hiểu ref, nhưng chưa ai kiểm)", () => {
    const wrong = src.evidenceRef!.replace(
      /sha256=[0-9a-f]{64}/,
      "sha256=" + "0".repeat(64),
    );
    expect(PINNED_EVIDENCE_RESOLVER.resolve(wrong)).toBe("missing");
    expect(rejectSource({ ...src, evidenceRef: wrong }, PINNED_EVIDENCE_RESOLVER)).toBe(
      "evidence_missing",
    );
  });

  it("scheme lạ → unresolvable", () => {
    expect(PINNED_EVIDENCE_RESOLVER.resolve("http://example.com/x")).toBe("unresolvable");
  });
});

// ─────────────────────────────────────────── E. feature chưa đủ tư cách → bỏ qua

describe("E — một feature chưa đủ tư cách → bỏ qua, KHÔNG đoán", () => {
  it("mắt trái không eligible → feature_not_eligible", () => {
    const elig = eligibleFor(ALL);
    elig[KEYS.eyeL] = { ...elig[KEYS.eyeL], eligible: false, reasons: ["validation_not_validated"] };
    const results = evaluate({
      features: browEyeFeatures(true),
      eligibility: elig,
      rules: [RULE],
      resolver: PINNED_EVIDENCE_RESOLVER,
    });
    expect(results[0].skipped).toBe(true);
    expect(results[0].skipReasons).toContain("feature_not_eligible");
    expect(results[0].matched).toBeNull();
  });
});

// ─────────────────────────────────────────── F. nguồn chưa verified → bị loại

describe("F — hạ verified xuống là nguồn bị loại ngay", () => {
  const src = KNOWLEDGE_SOURCES.SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001;

  it("verificationStatus != verified → not_verified", () => {
    for (const st of ["unverified", "disputed"] as const) {
      expect(rejectSource({ ...src, verificationStatus: st }, PINNED_EVIDENCE_RESOLVER), st).toBe(
        "not_verified",
      );
    }
  });

  it("nguồn thật + resolver thật → dùng được; nhưng resolver TỪ CHỐI thì không", () => {
    expect(isUsableSource(src, PINNED_EVIDENCE_RESOLVER)).toBe(true);
    expect(isUsableSource(src, NO_EVIDENCE_RESOLVER)).toBe(false);
  });
});

// ─────────────────────────────────────────── G. media thô không tới được luận giải

describe("G — không media thô nào đi qua engine/luận giải", () => {
  it("kết quả đã khớp vẫn chỉ có số + khoá, không landmark/ảnh", () => {
    const results = evaluate({
      features: browEyeFeatures(true),
      eligibility: eligibleFor(ALL),
      rules: [RULE],
      resolver: PINNED_EVIDENCE_RESOLVER,
    });
    const out = interpret(results, [], ruleText);
    const s = JSON.stringify(out).toLowerCase();
    for (const bad of ["landmark", "image/", "video/", "audio/", "base64", "getusermedia", "blob"]) {
      expect(s, bad).not.toContain(bad);
    }
  });

  it("EngineFeature không có trường landmark/ảnh nào để lọt qua", () => {
    const f = browEyeFeatures(true)[0];
    expect(Object.keys(f).sort()).toEqual(
      ["confidence", "key", "method", "sourceView", "status", "unit", "value"].sort(),
    );
  });
});

// ─────────────────────────────────────────── H. contract 29 feature KHÔNG đổi

describe("H — thêm luật này KHÔNG đụng contract 29 feature", () => {
  const FIX = JSON.parse(
    readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
  ) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };
  const out = runPhysiognomyPipeline(
    buildFeatureProfile({
      sessionId: "CMPSLICE01", capturedAt: 1_700_000_000_000,
      observations: [{
        step: "front", landmarks: FIX.landmarks,
        frameWidth: FIX.frameWidth, frameHeight: FIX.frameHeight,
        pose: { yaw: 0, pitch: 0, roll: 0 },
        quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
      }],
    }),
  );

  it("vẫn đúng 29 feature, và 4 khoá luật cần đều có mặt", () => {
    expect(out.summary.totalFeatures).toBe(29);
    for (const k of ALL) expect(out.reliability[k], k).toBeDefined();
  });

  it("SẢN PHẨM THẬT vẫn fail-closed: mày/mắt low_confidence → luật này bị bỏ qua", () => {
    const rr = out.ruleResults.find((r) => r.ruleId === RULE.ruleId)!;
    expect(rr.skipped).toBe(true);
    expect(rr.skipReasons).toContain("feature_not_eligible");
    expect(out.summary.rulesMatched).toBe(0);
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("luật so sánh runnable về hình dạng (khác với bị chặn ở cổng đo)", () => {
    expect(isRunnable(RULE)).toBe(true);
  });
});
