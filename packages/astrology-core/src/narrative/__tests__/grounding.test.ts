import { describe, expect, it } from "vitest";

import type { InterpretationObject } from "../../interpretation/types.js";
import { checkGrounding } from "../grounding.js";

const INTERP: InterpretationObject = {
  interpretationId: "calc-mvp-1:vocation",
  domain: "vocation",
  conclusion: { key: "domain_activated", params: {} },
  supportingFactors: ["sun_in_house_10"], // allowed provenance: contains "sun"/"house"/"10" but is grounded
  rules: ["MVP.VOCATION.001"],
  evidence: ["calc-mvp-1:MVP.VOCATION.001"],
  caveats: [],
  version: "interpretation.v1",
};

const GROUNDED =
  "Lĩnh vực Nghề nghiệp được kích hoạt bởi 1 quy tắc (MVP.VOCATION.001), " +
  "dựa trên bằng chứng: calc-mvp-1:MVP.VOCATION.001.";

describe("Phase 9 grounding check — A..F adversarial coverage", () => {
  it("A. valid grounded narrative → PASS", () => {
    const r = checkGrounding(GROUNDED, [INTERP]);
    expect(r.grounded).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it("A2. allowed provenance id (sun_in_house_10) is NOT flagged as invented", () => {
    const r = checkGrounding("Bằng chứng sun_in_house_10 và MVP.VOCATION.001 được ghi nhận.", [INTERP]);
    expect(r.grounded).toBe(true);
  });

  it("B. invented planet/entity → FAIL", () => {
    for (const text of ["Lĩnh vực Nghề nghiệp liên quan Sao Hỏa.", "This is driven by Mars."]) {
      const r = checkGrounding(text, [INTERP]);
      expect(r.grounded).toBe(false);
      expect(r.violations.some((v) => v.code === "invented_entity")).toBe(true);
    }
  });

  it("C. invented house → FAIL", () => {
    const r = checkGrounding("Ngôi nhà 5 được kích hoạt.", [INTERP]);
    expect(r.grounded).toBe(false);
    expect(r.violations.some((v) => v.code === "invented_house")).toBe(true);
  });

  it("D. invented date → FAIL", () => {
    for (const text of ["Sự kiện vào năm 2024.", "Vào ngày 12/05/2026."]) {
      const r = checkGrounding(text, [INTERP]);
      expect(r.grounded).toBe(false);
      expect(r.violations.some((v) => v.code === "invented_date")).toBe(true);
    }
  });

  it("E. invented number/score → FAIL", () => {
    const r = checkGrounding("Điểm số là 0.85.", [INTERP]);
    expect(r.grounded).toBe(false);
    expect(r.violations.some((v) => v.code === "invented_number")).toBe(true);
  });

  it("F. forbidden prediction/probability/recommendation semantics → FAIL", () => {
    for (const text of [
      "Bạn nên đầu tư.",
      "Khả năng thành công.",
      "Xác suất cao.",
      "Bạn sẽ giàu.",
      "Confidence is high; strength strong.",
    ]) {
      const r = checkGrounding(text, [INTERP]);
      expect(r.grounded).toBe(false);
      expect(r.violations.some((v) => v.code === "forbidden_semantics")).toBe(true);
    }
  });

  it("determinism — same input → identical result", () => {
    expect(checkGrounding(GROUNDED, [INTERP])).toEqual(checkGrounding(GROUNDED, [INTERP]));
  });

  it("does not mutate interpretation data", () => {
    const snapshot = JSON.stringify(INTERP);
    checkGrounding("Lĩnh vực Nghề nghiệp liên quan Sao Hỏa.", [INTERP]);
    expect(JSON.stringify(INTERP)).toBe(snapshot);
  });
});
