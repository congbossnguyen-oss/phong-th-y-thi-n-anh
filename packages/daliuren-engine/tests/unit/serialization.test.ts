import { describe, expect, it } from "vitest";
import { validateInterpretationPackage } from "../../src/validation/interpretation-package.js";
import { buildSyntheticPackage } from "./fixtures.js";
import { CLASSICAL_V1_PROFILE } from "../../src/profiles/classical-v1.js";

describe("daliuren-engine/serialization (JSON round-trip)", () => {
  it("InterpretationPackage: JSON.stringify -> JSON.parse giữ nguyên dữ liệu, kể cả resolutionStatus literal", () => {
    const original = buildSyntheticPackage();
    const roundTripped = JSON.parse(JSON.stringify(original));
    expect(roundTripped).toEqual(original);
    expect(roundTripped.conflicts[0].resolutionStatus).toBe("UNRESOLVED");
  });

  it("InterpretationPackage sau round-trip vẫn PASS validator (không mất field bắt buộc)", () => {
    const roundTripped = JSON.parse(JSON.stringify(buildSyntheticPackage()));
    expect(() => validateInterpretationPackage(roundTripped)).not.toThrow();
  });

  it("CalculationProfile: JSON round-trip giữ nguyên evidenceStatus/confidence — không bị rơi rớt field optional", () => {
    const roundTripped = JSON.parse(JSON.stringify(CLASSICAL_V1_PROFILE));
    expect(roundTripped).toEqual(CLASSICAL_V1_PROFILE);
    expect(roundTripped.ziHourDayBoundary.evidenceStatus).toBe("DEFAULT_PENDING_CONSENSUS");
  });

  it("`resolutionRule` (kiểu never) không xuất hiện trong JSON vì luôn undefined — JSON.stringify tự loại field undefined", () => {
    const original = buildSyntheticPackage();
    const json = JSON.stringify(original);
    expect(json).not.toContain("resolutionRule");
  });
});
