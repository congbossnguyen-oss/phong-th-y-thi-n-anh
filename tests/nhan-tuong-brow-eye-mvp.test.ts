/**
 * MVP-01 — brow > eye → 兄弟, KHOÁ HỢP ĐỒNG ĐẦU-CUỐI của capability.
 *
 * Bổ sung đúng phần ma trận §9 mà `nhan-tuong-comparative-slice` CHƯA khoá:
 *   · tổ hợp trái/phải (ngữ nghĩa VÀ — luật đòi CẢ HAI bên, không phải HOẶC)
 *   · thiếu landmark → giá trị null → bỏ qua, KHÔNG luận bừa
 *   · đường production thật vẫn fail-closed
 *
 * KHÔNG chạm production: không đổi measurement/eligibility/rule/source. Chỉ chạy đúng
 * `evaluate` + `interpret` (chính hàm pipeline dùng) và `runPhysiognomyPipeline`.
 *
 * Ngữ nghĩa luật (đã xác minh, giữ nguyên theo §13): engine AND mọi comparison
 * (`if !(l>r) matched=false`), nên rule chỉ khớp khi mày > mắt Ở CẢ HAI BÊN.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BROW_LONGER_THAN_EYE_SIBLINGS_001 } from "../src/rules/physiognomy/rule";
import { evaluate, type EngineFeature } from "../src/rules/physiognomy/engine";
import { interpret } from "../src/interpretation/physiognomy/index";
import { PINNED_EVIDENCE_RESOLVER } from "../src/knowledge/physiognomy/source";
import { POLICY_VERSION, type EligibilityVerdict } from "../src/features/physiognomy/measurement-contract/policy";
import { runPhysiognomyPipeline } from "../src/features/physiognomy/pipeline";
import { buildFeatureProfile } from "../src/features/physiognomy/features/extract";
import type { Pt } from "../src/features/physiognomy/features/landmarks";

const RULE = BROW_LONGER_THAN_EYE_SIBLINGS_001;
const K = {
  browL: "face.eyebrows.left_length", browR: "face.eyebrows.right_length",
  eyeL: "face.eyes.left_width", eyeR: "face.eyes.right_width",
} as const;
const ALL = Object.values(K);
const ruleText = (id: string) => (id === RULE.ruleId ? RULE.interpretation : "");

/** Feature đo được với giá trị chỉ định (null = thiếu landmark). */
function feat(key: string, value: number | null): EngineFeature {
  return { key, value, unit: "normalized_ratio", confidence: 0.9,
    status: value === null ? "unsupported" : "measured", method: "m", sourceView: "front" };
}
/** browL,eyeL,browR,eyeR → 4 feature. */
function features(bL: number | null, eL: number, bR: number | null, eR: number): EngineFeature[] {
  return [feat(K.browL, bL), feat(K.eyeL, eL), feat(K.browR, bR), feat(K.eyeR, eR)];
}
function eligibleAll(): Record<string, EligibilityVerdict> {
  const o: Record<string, EligibilityVerdict> = {};
  for (const k of ALL) o[k] = { featureKey: k, eligible: true, reasons: [], explanation: "", policyVersion: POLICY_VERSION };
  return o;
}
const run = (fs: EngineFeature[]) =>
  evaluate({ features: fs, eligibility: eligibleAll(), rules: [RULE], resolver: PINNED_EVIDENCE_RESOLVER });

// ─────────────────────────────────────────── C. tổ hợp trái/phải (AND)

describe("MVP-01 — ngữ nghĩa VÀ (cả hai bên phải mày > mắt)", () => {
  it("cả hai bên qualify → khớp, luận ra 兄弟", () => {
    const r = run(features(0.46, 0.30, 0.46, 0.30));
    expect(r[0].matched).toBe(true);
    const out = interpret(r, [], ruleText);
    expect(out.outcome).toBe("ok");
    expect(out.statements[0].text).toContain("兄弟");
  });

  it("CHỈ trái qualify (phải không) → KHÔNG khớp", () => {
    const r = run(features(0.46, 0.30, 0.24, 0.30)); // browR < eyeR
    expect(r[0].matched).toBe(false);
    expect(r[0].skipped).toBe(false);
    expect(interpret(r, [], ruleText).outcome).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("CHỈ phải qualify (trái không) → KHÔNG khớp", () => {
    const r = run(features(0.24, 0.30, 0.46, 0.30)); // browL < eyeL
    expect(r[0].matched).toBe(false);
    expect(interpret(r, [], ruleText).outcome).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("không bên nào qualify → KHÔNG khớp", () => {
    const r = run(features(0.24, 0.30, 0.24, 0.30));
    expect(r[0].matched).toBe(false);
  });

  it("bằng nhau (không >) → KHÔNG khớp (so sánh nghiêm ngặt)", () => {
    const r = run(features(0.30, 0.30, 0.30, 0.30));
    expect(r[0].matched).toBe(false);
  });
});

// ─────────────────────────────────────────── D. thiếu landmark

describe("MVP-01 — thiếu landmark → bỏ qua, KHÔNG luận bừa", () => {
  it("mày trái thiếu (value null) → skipped, feature_value_null, matched null", () => {
    const r = run(features(null, 0.30, 0.46, 0.30));
    expect(r[0].skipped).toBe(true);
    expect(r[0].matched).toBeNull();
    expect(r[0].skipReasons).toContain("feature_value_null");
    expect(interpret(r, [], ruleText).outcome).toBe("INSUFFICIENT_EVIDENCE");
  });
});

// ─────────────────────────────────────────── an toàn: đường production thật

describe("MVP-01 — đường production thật vẫn fail-closed", () => {
  const FIX = JSON.parse(
    readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
  ) as { frameWidth: number; frameHeight: number; landmarks: Pt[] };

  it("runPhysiognomyPipeline trên khuôn mặt thật → INSUFFICIENT_EVIDENCE (mày/mắt low_confidence)", () => {
    const out = runPhysiognomyPipeline(
      buildFeatureProfile({
        sessionId: "MVP0000001", capturedAt: 1_700_000_000_000,
        observations: [{
          step: "front", landmarks: FIX.landmarks,
          frameWidth: FIX.frameWidth, frameHeight: FIX.frameHeight,
          pose: { yaw: 0, pitch: 0, roll: 0 },
          quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
        }],
      }),
    );
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.summary.rulesMatched).toBe(0);
    const brow = out.ruleResults.find((r) => r.ruleId === RULE.ruleId)!;
    expect(brow.skipped).toBe(true);
    expect(brow.skipReasons).toContain("feature_not_eligible");
  });
});
