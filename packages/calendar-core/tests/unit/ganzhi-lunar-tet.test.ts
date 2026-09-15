// V3-17 (D8=B) — GANZHI_LUNAR_TET: trụ Can Chi NĂM theo ranh giới Mùng 1 Tết (âm lịch), dùng cho Tử Vi
// Natal. Quy ước MỚI, THÊM (additive) — KHÔNG đổi semantics LUNAR_TET (vẫn pillar=null).
import { describe, expect, it } from "vitest";
import {
  birthDateFromGregorian,
  birthDateFromGregorianYear,
  resolveYearContext,
  BirthDatePrecisionError,
  YEAR_CONVENTIONS,
} from "../../src/index.js";

const TZ = "Asia/Ho_Chi_Minh";
const bd = (y: number, m: number, d: number) => birthDateFromGregorian({ year: y, month: m, day: d, timeZone: TZ });

describe("GANZHI_LUNAR_TET — khai báo & trả về trụ Can Chi", () => {
  it("có trong tập YEAR_CONVENTIONS", () => {
    expect(YEAR_CONVENTIONS).toContain("GANZHI_LUNAR_TET");
  });

  // [nhãn, y, m, d, năm âm lịch kỳ vọng, Can Chi kỳ vọng]
  const cases: [string, number, number, number, number, string][] = [
    ["giữa năm 1980-08-31", 1980, 8, 31, 1980, "Canh Thân"],
    ["1990-02-01 sau Tết(27/01) trước Lập Xuân(04/02)", 1990, 2, 1, 1990, "Canh Ngọ"],
    ["2005-02-06 sau Lập Xuân trước Tết(09/02)", 2005, 2, 6, 2004, "Giáp Thân"],
    ["2026-02-10 sau Lập Xuân trước Tết(17/02)", 2026, 2, 10, 2025, "Ất Tỵ"],
    ["2026-01-20 trước cả Tết lẫn Lập Xuân", 2026, 1, 20, 2025, "Ất Tỵ"],
  ];
  for (const [label, y, m, d, namAL, canChi] of cases) {
    it(`${label} → năm ${namAL}, trụ ${canChi}`, () => {
      const r = resolveYearContext(bd(y, m, d), "GANZHI_LUNAR_TET");
      expect(r.convention).toBe("GANZHI_LUNAR_TET");
      expect(r.year).toBe(namAL);
      expect(r.pillar).not.toBeNull();
      expect(`${r.pillar!.can} ${r.pillar!.chi}`).toBe(canChi);
      expect(r.lunarDate).not.toBeNull();
      expect(r.boundaryRule).toMatch(/Tết/);
    });
  }
});

describe("GANZHI_LUNAR_TET — an toàn & không đụng LUNAR_TET", () => {
  it("năm-đơn (precision year) → ném BirthDatePrecisionError (không bịa 1/1)", () => {
    const yearOnly = birthDateFromGregorianYear(1990, TZ);
    expect(() => resolveYearContext(yearOnly, "GANZHI_LUNAR_TET")).toThrow(BirthDatePrecisionError);
  });

  it("LUNAR_TET KHÔNG đổi: vẫn trả pillar=null, year=năm âm lịch", () => {
    const lt = resolveYearContext(bd(2026, 2, 10), "LUNAR_TET");
    expect(lt.pillar).toBeNull();
    expect(lt.year).toBe(2025);
  });

  it("GANZHI_LUNAR_TET và LUNAR_TET cùng NĂM (chỉ khác việc có/không trụ)", () => {
    const g = resolveYearContext(bd(2026, 2, 10), "GANZHI_LUNAR_TET");
    const l = resolveYearContext(bd(2026, 2, 10), "LUNAR_TET");
    expect(g.year).toBe(l.year);
    expect(g.pillar).not.toBeNull();
    expect(l.pillar).toBeNull();
  });

  it("KHÁC GANZHI_LICH_XUAN ở ca biên (Lập Xuân vs Tết) — 2026-02-10", () => {
    const tet = resolveYearContext(bd(2026, 2, 10), "GANZHI_LUNAR_TET");
    const lx = resolveYearContext(bd(2026, 2, 10), "GANZHI_LICH_XUAN");
    expect(tet.year).toBe(2025); // Tết chưa qua
    expect(lx.year).toBe(2026); // Lập Xuân đã qua
    expect(`${tet.pillar!.can} ${tet.pillar!.chi}`).toBe("Ất Tỵ");
    expect(`${lx.pillar!.can} ${lx.pillar!.chi}`).toBe("Bính Ngọ");
  });
});
