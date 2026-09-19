import { describe, expect, it } from "vitest";
import { DAY_HOUR_CHI, NIGHT_HOUR_CHI, lookupDayOrNight } from "../../../src/day-night/table.js";
import type { Chi } from "../../../src/types/ganzhi.js";

const ALL_12_CHI: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

describe("daliuren-engine/day-night/table", () => {
  it("Mão->Thân (6 chi) = ngày, Dậu->Dần (6 chi) = đêm, khớp Algorithm Spec §3 + Phase 4 Phần C", () => {
    expect([...DAY_HOUR_CHI].sort()).toEqual(["Mão", "Mùi", "Ngọ", "Thân", "Thìn", "Tỵ"].sort());
    expect([...NIGHT_HOUR_CHI].sort()).toEqual(["Dần", "Dậu", "Hợi", "Sửu", "Tuất", "Tý"].sort());
  });

  it("12 chi phủ đầy đủ, không thiếu không trùng giữa 2 tập ngày/đêm", () => {
    expect(DAY_HOUR_CHI.size + NIGHT_HOUR_CHI.size).toBe(12);
    for (const chi of ALL_12_CHI) {
      const inDay = DAY_HOUR_CHI.has(chi);
      const inNight = NIGHT_HOUR_CHI.has(chi);
      expect(inDay !== inNight).toBe(true); // đúng 1 trong 2, không cả 2 không cả 0
      expect(lookupDayOrNight(chi)).toBe(inDay ? "day" : "night");
    }
  });
});
