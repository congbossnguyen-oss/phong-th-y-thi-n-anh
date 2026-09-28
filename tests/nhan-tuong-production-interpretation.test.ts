/**
 * PHASE 1D-5 SLICE — đường PRODUCTION đi qua tầng luận giải.
 *
 * Slice này đưa `runPipelineOnFeatures()` (vốn chỉ chạy trong bảng chẩn đoán DEV) vào
 * đường production user flow: sau khi có featureProfile, `renderInterpretation()` gọi
 * chính pipeline đó và hiển thị kết quả có cấu trúc.
 *
 * Với kho nguồn rỗng + eligible 0/29, kết quả PHẢI là INSUFFICIENT_EVIDENCE — không có
 * câu luận tướng khẳng định nào. Nhóm test này khoá điều đó, và khoá cả ranh giới dữ
 * liệu thô (engine/luận giải không thấy landmark/ảnh).
 *
 * Component `.astro` không import được vào vitest, nên phần UI được kiểm bằng cách quét
 * mã nguồn (cùng cách các test collection/ux-patch vẫn làm). Phần logic được kiểm bằng
 * cách chạy THẬT pipeline trên payload transport — kể cả payload người thật A-01 nếu có
 * trên đĩa.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runPipelineOnFeatures } from "../src/features/physiognomy/pipeline";
import { payload as fixturePayload } from "./fixtures/research-samples";

const DESKTOP = readFileSync(
  join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
  "utf-8",
);

/** Map payload transport (k/v/u/c/s/m/w/l) → EngineFeature, GIỐNG HỆT production. */
function toEngineInput(features: { k: string; v: number | null; u: string; c: number; s: string; m: string; w: string | null }[]) {
  return features.map((f) => ({
    key: f.k, value: f.v, unit: f.u, confidence: f.c,
    status: f.s, method: f.m, sourceView: f.w,
  }));
}

// ─────────────────────────────────────────── logic: pipeline production

describe("đường production chạy CHÍNH runPipelineOnFeatures", () => {
  it("payload fixture → INSUFFICIENT_EVIDENCE, không câu luận nào", () => {
    const p = fixturePayload("SESSPROD01");
    const out = runPipelineOnFeatures(toEngineInput(p.features as never));
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.interpretation.statements).toEqual([]); // KHÔNG có câu luận tướng
    expect(out.interpretation.reasons.length).toBeGreaterThan(0); // phải nói được VÌ SAO
  });

  it("evidence rỗng: eligible 0, không rule nào khớp", () => {
    const p = fixturePayload("SESSPROD02");
    const out = runPipelineOnFeatures(toEngineInput(p.features as never));
    expect(out.summary.eligible).toBe(0);
    expect(out.summary.rulesMatched).toBe(0);
    expect(out.summary.validated).toBe(0);
  });

  it("KHÔNG nâng trạng thái: mọi feature vẫn provisional/real_image hoặc thấp hơn", () => {
    const p = fixturePayload("SESSPROD03");
    const out = runPipelineOnFeatures(toEngineInput(p.features as never));
    for (const rel of Object.values(out.reliability)) {
      expect(rel.validationStatus).not.toBe("validated");
      expect(rel.evidenceLevel).not.toBe("multi_device");
    }
  });

  it("payload NGƯỜI THẬT A-01 (nếu có trên đĩa) cũng → INSUFFICIENT_EVIDENCE", () => {
    const f = join(import.meta.dirname, "..", "mau-nghien-cuu", "A__run1.json");
    if (!existsSync(f)) {
      // Không có dataset thật ở môi trường CI — bỏ qua, không giả lập.
      return;
    }
    const run = JSON.parse(readFileSync(f, "utf-8"));
    const out = runPipelineOnFeatures(toEngineInput(run.featureProfile.features));
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.summary.eligible).toBe(0);
    expect(out.summary.totalFeatures).toBe(29);
    expect(out.interpretation.statements).toEqual([]);
  });
});

// ─────────────────────────────────────────── ranh giới dữ liệu thô

describe("ranh giới: engine/luận giải KHÔNG thấy media/landmark", () => {
  it("input pipeline chỉ có 7 trường engine, KHÔNG có landmark `l`", () => {
    const p = fixturePayload("SESSPROD04");
    const input = toEngineInput(p.features as never);
    for (const f of input) {
      expect(Object.keys(f).sort()).toEqual(
        ["confidence", "key", "method", "sourceView", "status", "unit", "value"],
      );
      expect(f).not.toHaveProperty("l");
    }
  });

  it("output pipeline không rò mảng landmark / media thô", () => {
    const p = fixturePayload("SESSPROD05");
    const out = runPipelineOnFeatures(toEngineInput(p.features as never));
    const j = JSON.stringify(out);
    // KHÔNG mảng landmark `"l":`, KHÔNG media thô. (Không cấm "image" vì evidenceLevel
    // hợp lệ là `real_image` — đó là nhãn mức bằng chứng, không phải ảnh.)
    for (const cam of ['"l":', "base64", "data:", "blob", "dataUrl", "video/", "image/"]) {
      expect(j.includes(cam), cam).toBe(false);
    }
  });

  it("payload transport CÓ landmark `l`, nhưng mapping production đã bỏ nó đi", () => {
    // Chứng minh việc loại `l` là có chủ ý: nguồn CÓ, đầu vào engine thì KHÔNG.
    const p = fixturePayload("SESSPROD06");
    expect(p.features[0]).toHaveProperty("l");
    expect(toEngineInput(p.features as never)[0]).not.toHaveProperty("l");
  });
});

// ─────────────────────────────────────────── UI production (quét mã nguồn)

describe("UI production gọi luận giải, KHÔNG bọc DEV", () => {
  it("renderInterpretation tồn tại và KHÔNG nằm sau cổng import.meta.env.DEV", () => {
    expect(DESKTOP).toContain("async function renderInterpretation(");
    // Vị trí khai báo renderInterpretation phải NGOÀI mọi khối `if (import.meta.env.DEV)`.
    // Kiểm thô: renderDone (production) gọi nó bằng `void renderInterpretation(`.
    expect(DESKTOP).toContain("void renderInterpretation(r?.featureProfile ?? null)");
  });

  it("renderInterpretation gọi CHÍNH runPipelineOnFeatures, không dựng pipeline song song", () => {
    const i = DESKTOP.indexOf("async function renderInterpretation(");
    const than = DESKTOP.slice(i, i + 2200);
    expect(than).toContain("runPipelineOnFeatures");
    expect(than).toContain('import("../../features/physiognomy/pipeline")');
    // KHÔNG tự đấu lại contract/gate/engine trong hàm này.
    expect(than).not.toContain("evaluateAll");
    expect(than).not.toContain("buildReliability");
    expect(than).not.toContain("evaluate(");
  });

  it("UI hiển thị outcome + lý do, KHÔNG có câu luận tướng cứng", () => {
    const i = DESKTOP.indexOf("async function renderInterpretation(");
    const than = DESKTOP.slice(i, i + 2200);
    expect(than).toContain("out.interpretation.outcome");
    expect(than).toContain("out.interpretation.reasons");
    expect(than).toContain("Chưa đủ bằng chứng để luận giải");
  });

  it("renderInterpretation chỉ nhận payload transport, không chạm view/snapshot thô", () => {
    const i = DESKTOP.indexOf("async function renderInterpretation(");
    const than = DESKTOP.slice(i, i + 2200);
    // Chỉ đọc `.features`; không đọc snapshots/landmarks/ảnh.
    expect(than).toContain("p.features");
    expect(than).not.toContain("snapshots");
    expect(than).not.toContain("landmarks");
  });
});
