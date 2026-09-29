/**
 * MVP-02 — tầng THAM KHẢO (advisory), tách hẳn verified path.
 *
 * Khoá các bất biến an toàn: advisory KHÔNG cần eligibility, KHÔNG gọi verified engine,
 * KHÔNG là outcome "ok", luôn LOW + unverified, và chỉ hiện khi mày > mắt ở cả hai bên.
 */
import { describe, expect, it } from "vitest";

import {
  composeBrowEyeAdvisory,
  ADVISORY_VERSION,
  runPipelineOnFeatures,
} from "../src/features/physiognomy/pipeline";
import type { EngineFeature } from "../src/rules/physiognomy/engine";

function feat(key: string, value: number | null): EngineFeature {
  return { key, value, unit: "normalized_ratio", confidence: 0.4,
    status: value === null ? "unsupported" : "low_confidence", method: "m", sourceView: "front" };
}
function features(bL: number | null, eL: number | null, bR: number | null, eR: number | null): EngineFeature[] {
  return [
    feat("face.eyebrows.left_length", bL), feat("face.eyes.left_width", eL),
    feat("face.eyebrows.right_length", bR), feat("face.eyes.right_width", eR),
  ];
}

// ─────────────────────────────────────────── A. mày > mắt → advisory

describe("A — mày > mắt (cả hai bên) → advisory THAM KHẢO", () => {
  const adv = composeBrowEyeAdvisory(features(0.46, 0.30, 0.46, 0.30));

  it("có advisory, status ADVISORY (KHÔNG phải 'ok'), pattern đúng", () => {
    expect(adv).not.toBeNull();
    expect(adv!.status).toBe("ADVISORY");
    expect((adv as unknown as { outcome?: string }).outcome).toBeUndefined();
    expect(adv!.observation.pattern).toBe("brow_longer_than_eye");
    expect(adv!.observation.holds).toBe(true);
    expect(adv!.version).toBe(ADVISORY_VERSION);
  });

  it("kèm giá trị đo thật + confidence LOW", () => {
    expect(adv!.confidence).toBe("LOW");
    expect(adv!.observation.observed).toHaveLength(4);
    expect(adv!.observation.observed.map((o) => o.key)).toContain("face.eyebrows.left_length");
  });

  it("câu chữ CHÉP từ thư viện skill-derived, giữ nguyên unverified + attribution", () => {
    expect(adv!.references.length).toBeGreaterThan(0);
    for (const r of adv!.references) {
      expect(r.verificationStatus).toBe("unverified");
      expect(r.attribution.trim()).not.toBe("");
      expect(r.text.trim()).not.toBe("");
    }
    // Một trong các item mày phải nói tới quan hệ "dài hơn mắt".
    expect(adv!.references.some((r) => r.text.includes("dài hơn mắt"))).toBe(true);
  });

  it("có disclaimer THAM KHẢO / CHƯA xác thực", () => {
    expect(adv!.disclaimer).toContain("THAM KHẢO");
    expect(adv!.disclaimer).toContain("CHƯA");
  });
});

// ─────────────────────────────────────────── B. mày <= mắt → KHÔNG advisory

describe("B — mày KHÔNG dài hơn mắt → KHÔNG advisory", () => {
  it("một bên không đạt → null", () => {
    expect(composeBrowEyeAdvisory(features(0.46, 0.30, 0.24, 0.30))).toBeNull();
  });
  it("bằng nhau (không >) → null", () => {
    expect(composeBrowEyeAdvisory(features(0.30, 0.30, 0.30, 0.30))).toBeNull();
  });
});

// ─────────────────────────────────────────── C. thiếu đo → KHÔNG advisory

describe("C — thiếu measurement → KHÔNG advisory", () => {
  it("mày trái null → null", () => {
    expect(composeBrowEyeAdvisory(features(null, 0.30, 0.46, 0.30))).toBeNull();
  });
  it("mắt phải null → null", () => {
    expect(composeBrowEyeAdvisory(features(0.46, 0.30, 0.46, null))).toBeNull();
  });
  it("rỗng → null", () => {
    expect(composeBrowEyeAdvisory([])).toBeNull();
  });
});

// ─────────────────────────────────────────── D. low confidence vẫn advisory được

describe("D — feature low_confidence vẫn ra advisory, nhưng LOW + unverified", () => {
  it("confidence LOW, mọi reference unverified", () => {
    const adv = composeBrowEyeAdvisory(features(0.46, 0.30, 0.46, 0.30))!;
    expect(adv.confidence).toBe("LOW");
    expect(adv.references.every((r) => r.verificationStatus === "unverified")).toBe(true);
  });
});

// ─────────────────────────────────────────── E. advisory ĐỘC LẬP với verified gate

describe("E — advisory không phụ thuộc eligibility/verified", () => {
  it("cùng feature low_confidence: verified → INSUFFICIENT, nhưng advisory VẪN hiện", () => {
    const fs = features(0.46, 0.30, 0.46, 0.30); // status low_confidence
    // Đường verified thật: qua eligibility → mày/mắt low_confidence → không luận.
    const out = runPipelineOnFeatures(fs);
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.summary.rulesMatched).toBe(0);
    // Advisory KHÔNG cần eligibility → vẫn quan sát được, nhưng chỉ là THAM KHẢO.
    const adv = composeBrowEyeAdvisory(fs);
    expect(adv).not.toBeNull();
    expect(adv!.status).toBe("ADVISORY");
    expect(adv!.confidence).toBe("LOW");
  });
});
