import { describe, expect, it } from "vitest";
import { MONTH_GENERAL_TABLE } from "../../../src/month-general/table.js";

/**
 * CLASSICAL FACT — bảng 12 dòng sao chép nguyên vẹn từ docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md
 * §2 (nguồn report-G mục 9, đối chiếu report-A/B/C/F — xem month-general/provenance.ts).
 */
const EXPECTED_ENTRIES: ReadonlyArray<[string, string, string]> = [
  ["雨水", "Hợi", "đăngMinh"],
  ["春分", "Tuất", "hàKhôi"],
  ["穀雨", "Dậu", "tùngKhôi"],
  ["小滿", "Thân", "truyềnTống"],
  ["夏至", "Mùi", "tiểuCát"],
  ["大暑", "Ngọ", "thắngQuang"],
  ["處暑", "Tỵ", "tháiẤt"],
  ["秋分", "Thìn", "thiênCương"],
  ["霜降", "Mão", "tháiXung"],
  ["小雪", "Dần", "côngTào"],
  ["冬至", "Sửu", "đạiCát"],
  ["大寒", "Tý", "thầnHậu"],
];

describe("daliuren-engine/month-general/table — MONTH_GENERAL_TABLE", () => {
  it("có đúng 12 dòng, khớp CHÍNH XÁC Algorithm Spec §2", () => {
    expect(Object.keys(MONTH_GENERAL_TABLE)).toHaveLength(12);
    for (const [nameHan, zhi, classicalName] of EXPECTED_ENTRIES) {
      expect(MONTH_GENERAL_TABLE[nameHan]).toEqual({ zhi, classicalName });
    }
  });

  it("12 chi trong bảng đôi một khác nhau (không trùng vị trí Địa Chi nào)", () => {
    const zhiValues = Object.values(MONTH_GENERAL_TABLE).map((entry) => entry.zhi);
    expect(new Set(zhiValues).size).toBe(12);
  });

  it("12 classicalName trong bảng đôi một khác nhau", () => {
    const names = Object.values(MONTH_GENERAL_TABLE).map((entry) => entry.classicalName);
    expect(new Set(names).size).toBe(12);
  });
});
