// V3-17 — GOLDEN BOUNDARY MATRIX cho Year Contracts (V3-16 plan).
// Kiểm ĐỒNG THỜI: Tử Vi Natal (Tết) · Bát Tự Trụ Năm (Lập Xuân) · Lưu Niên (1/1) · metadata quy ước ·
// parity giữa calendar-core GANZHI_LUNAR_TET và hành vi Natal hiện hữu. KHÔNG đổi thuật toán.
import { describe, expect, it } from "vitest";
import { birthDateFromGregorian, resolveYearContext } from "@thien-anh/calendar-core";
import { tinhTuVi } from "./engine";
import { tinhBatTu } from "../bat-tu";
import { canOfYear } from "./luu-nien";

const TZ = "Asia/Ho_Chi_Minh";

// [nhãn, y, m, d, TV natal (Tết), Bát Tự trụ năm (Lập Xuân), diverge?]
const MATRIX: [string, number, number, number, string, string, boolean][] = [
  ["1990-02-01 sau Tết, trước Lập Xuân", 1990, 2, 1, "Canh Ngọ", "Kỷ Tỵ", true],
  ["1990-02-05 sau Lập Xuân & Tết", 1990, 2, 5, "Canh Ngọ", "Canh Ngọ", false],
  ["1990-02-06 sau Lập Xuân & Tết", 1990, 2, 6, "Canh Ngọ", "Canh Ngọ", false],
  ["2005-02-06 sau Lập Xuân, trước Tết", 2005, 2, 6, "Giáp Thân", "Ất Dậu", true],
  ["2005-02-07 sau Lập Xuân, trước Tết", 2005, 2, 7, "Giáp Thân", "Ất Dậu", true],
  ["2026-02-10 sau Lập Xuân, trước Tết", 2026, 2, 10, "Ất Tỵ", "Bính Ngọ", true],
  ["2026-02-11 sau Lập Xuân, trước Tết", 2026, 2, 11, "Ất Tỵ", "Bính Ngọ", true],
  ["1980-08-31 giữa năm (GM-001)", 1980, 8, 31, "Canh Thân", "Canh Thân", false],
  ["2000-07-15 giữa năm", 2000, 7, 15, "Canh Thìn", "Canh Thìn", false],
];

describe("Golden matrix — 3 hệ quy ước năm song song", () => {
  for (const [label, y, m, d, tvNatal, btPillar, diverge] of MATRIX) {
    it(`${label}`, () => {
      const chart = tinhTuVi({ day: d, month: m, year: y, hour: 10, gender: "Nam" });
      const bt = tinhBatTu({ day: d, month: m, year: y, hour: 10, gender: "Nam" });
      // Tử Vi Natal (Tết)
      expect(`${chart.yearCanName} ${chart.yearChiName}`).toBe(tvNatal);
      // Bát Tự Trụ Năm (Lập Xuân)
      expect(`${bt.year.can} ${bt.year.chi}`).toBe(btPillar);
      // phân kỳ đúng như dự kiến
      expect(`${chart.yearCanName} ${chart.yearChiName}` !== `${bt.year.can} ${bt.year.chi}`).toBe(diverge);
    });
  }
});

describe("Parity — GANZHI_LUNAR_TET (calendar-core) ≡ Tử Vi Natal hiện hữu (trên golden set)", () => {
  for (const [label, y, m, d, tvNatal] of MATRIX) {
    it(`${label} → ${tvNatal}`, () => {
      const chart = tinhTuVi({ day: d, month: m, year: y, hour: 10, gender: "Nam" });
      const r = resolveYearContext(birthDateFromGregorian({ year: y, month: m, day: d, timeZone: TZ }), "GANZHI_LUNAR_TET");
      expect(`${r.pillar!.can} ${r.pillar!.chi}`).toBe(`${chart.yearCanName} ${chart.yearChiName}`);
    });
  }
});

describe("Lưu Niên — quy ước 1/1 (Can theo năm dương lịch, năm−4)", () => {
  const cases: [number, string][] = [[1990, "Canh"], [2005, "Ất"], [2026, "Bính"], [1980, "Canh"], [2000, "Canh"]];
  for (const [year, can] of cases) {
    it(`${year} → Can ${can}`, () => expect(canOfYear(year)).toBe(can));
  }
});

describe("Metadata quy ước năm Natal (D6)", () => {
  it("chart.namQuyUoc mô tả đúng LUNAR_TET/Tết, RECOMMENDED≠PROVEN, nam=năm âm lịch", () => {
    const chart = tinhTuVi({ day: 10, month: 2, year: 2026, hour: 10, gender: "Nam" });
    expect(chart.namQuyUoc.he).toBe("tu-vi");
    expect(chart.namQuyUoc.convention).toBe("GANZHI_LUNAR_TET");
    expect(chart.namQuyUoc.nhan).toMatch(/Tết/);
    expect(chart.namQuyUoc.recommendedNotProven).toBe(true);
    expect(chart.namQuyUoc.nam).toBe(2025); // năm âm lịch (sinh trước Tết 2026)
    expect(chart.namQuyUoc.nam).toBe(chart.lunarYear);
  });
});
