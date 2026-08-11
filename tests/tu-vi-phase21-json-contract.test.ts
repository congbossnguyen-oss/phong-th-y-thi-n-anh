// Phase 21 — schema contract test cho toJsonContract() (src/lib/tu-vi/json-contract.ts). Đây là adapter
// THUẦN reshape, không tính toán — test dưới đây kiểm tra SHAPE/TYPE/ENUM đúng schema §34/§35/§36, và xác
// nhận toJsonContract() không tính lại giá trị nào (khớp 100% với TuViChart nguồn). Không sửa Golden
// Master, không sửa expected value để ép pass.

import { describe, expect, it } from "vitest";
import { tinhTuVi, type TuViInput } from "../src/lib/tu-vi/engine";
import { toJsonContract } from "../src/lib/tu-vi/json-contract";

const GM_CASES: [string, TuViInput][] = [
  ["GM-001", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 }],
  ["GM-002", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ", viewingYear: 2026 }],
  ["GM-003", { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam", viewingYear: 2026 }],
  ["GM-004", { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ", viewingYear: 2026 }],
  ["GM-005", { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam", viewingYear: 2026 }],
  ["GM-006", { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam", viewingYear: 2026 }],
];

const PALACE_NAME_ENUM = new Set([
  "MỆNH", "PHỤ_MẪU", "PHÚC_ĐỨC", "ĐIỀN_TRẠCH", "QUAN_LỘC", "NÔ_BỘC",
  "THIÊN_DI", "TẬT_ÁCH", "TÀI_BẠCH", "TỬ_TỨC", "PHU_THÊ", "HUYNH_ĐỆ",
]);
const STATUS_ENUM = new Set(["MIEU", "VUONG", "DAC", "BINH", "HAM"]);
const TRANSFORMATION_ENUM = new Set(["LOC", "QUYEN", "KHOA", "KY"]);
const AM_DUONG_ENUM = new Set(["DUONG_NAM", "AM_NAM", "DUONG_NU", "AM_NU"]);

for (const [label, input] of GM_CASES) {
  describe(`Phase 21 — JSON contract cho ${label}`, () => {
    const chart = tinhTuVi(input);
    const json = toJsonContract(chart);

    it("meta: đủ field, đúng type", () => {
      expect(json.meta.engineVersion).toBe("2.0.0");
      expect(json.meta.profile).toBe("NAM_PHAI_NGUYEN_CAT");
      expect(json.meta.timezone).toBe("Asia/Ho_Chi_Minh");
    });

    it("input: đúng enum gender, solarDate/time đúng format, khớp TuViInput gốc", () => {
      expect(["NAM", "NU"]).toContain(json.input.gender);
      expect(json.input.gender).toBe(input.gender === "Nam" ? "NAM" : "NU");
      expect(json.input.solarDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(json.input.solarDate).toBe(`${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`);
      expect(json.input.time).toMatch(/^\d{2}:\d{2}$/);
      expect(json.input.viewingYear).toBe(input.viewingYear);
    });

    it("calendar: 4 trụ Can Chi dạng string ĐÚNG khớp 4 pillar object (Phase 20), không tính lại", () => {
      expect(json.calendar.yearCanChi).toBe(`${chart.yearPillar.can} ${chart.yearPillar.chi}`);
      expect(json.calendar.monthCanChi).toBe(`${chart.monthPillar.can} ${chart.monthPillar.chi}`);
      expect(json.calendar.dayCanChi).toBe(`${chart.dayPillar.can} ${chart.dayPillar.chi}`);
      expect(json.calendar.hourCanChi).toBe(`${chart.hourPillar.can} ${chart.hourPillar.chi}`);
      expect(json.calendar.yearPillar).toEqual(chart.yearPillar);
      expect(json.calendar.monthPillar).toEqual(chart.monthPillar);
      expect(json.calendar.dayPillar).toEqual(chart.dayPillar);
      expect(json.calendar.hourPillar).toEqual(chart.hourPillar);
    });

    it("thienBan: đúng enum amDuong, khớp 100% giá trị gốc trong TuViChart", () => {
      expect(AM_DUONG_ENUM.has(json.thienBan.amDuong)).toBe(true);
      expect(json.thienBan.banMenh).toBe(chart.banMenhNapAm);
      expect(json.thienBan.cuc).toBe(chart.cucName);
      expect(json.thienBan.cucNumber).toBe(chart.cucSo);
      expect(json.thienBan.menhQuai).toBe(chart.menhQuai);
      expect(json.thienBan.chuMenh).toBe(chart.chuMenh);
      expect(json.thienBan.chuThan).toBe(chart.chuThan);
      expect(json.thienBan.menhIndex).toBe(chart.menhChiIndex);
      expect(json.thienBan.thanIndex).toBe(chart.thanChiIndex);
    });

    it("palaces: đúng 12 phần tử, mỗi phần tử đúng shape §34, palaceName đúng enum", () => {
      expect(json.palaces).toHaveLength(12);
      for (const p of json.palaces) {
        expect(PALACE_NAME_ENUM.has(p.palaceName)).toBe(true);
        expect(typeof p.index).toBe("number");
        expect(typeof p.branch).toBe("string");
        expect(typeof p.stem).toBe("string");
        expect(typeof p.isMenh).toBe("boolean");
        expect(typeof p.isThan).toBe("boolean");
        expect(Array.isArray(p.stars)).toBe(true);
        expect(p.markers).toEqual({ tuan: expect.any(Boolean), triet: expect.any(Boolean) });
      }
    });

    it("palaces: đúng 1 cung isMenh=true, đúng 1 cung isThan=true, khớp menhIndex/thanIndex", () => {
      const menhPalace = json.palaces.find((p) => p.isMenh);
      const thanPalace = json.palaces.find((p) => p.isThan);
      expect(menhPalace?.index).toBe(json.thienBan.menhIndex);
      expect(thanPalace?.index).toBe(json.thienBan.thanIndex);
      expect(json.palaces.filter((p) => p.isMenh)).toHaveLength(1);
    });

    it("palaces[].stars: tổng đúng 14 chính tinh (không hơn không kém) trên toàn bộ 12 cung", () => {
      const chinhTinhCount = json.palaces.flatMap((p) => p.stars).filter((s) => s.category === "CHINH_TINH").length;
      expect(chinhTinhCount).toBe(14);
    });

    it("palaces[].stars: mỗi sao chính tinh có status đúng enum, isNatal=true, isAnnual=false", () => {
      for (const star of json.palaces.flatMap((p) => p.stars).filter((s) => s.category === "CHINH_TINH")) {
        expect(star.status).toBeDefined();
        expect(STATUS_ENUM.has(star.status!)).toBe(true);
        expect(star.isNatal).toBe(true);
        expect(star.isAnnual).toBe(false);
        expect(typeof star.sourceRule).toBe("string");
      }
    });

    it("palaces[].stars: đúng 4 sao có transformation (Tứ Hóa), đúng enum, khớp chart.tuHoa", () => {
      const withTransformation = json.palaces.flatMap((p) => p.stars).filter((s) => s.transformation);
      expect(withTransformation).toHaveLength(4);
      for (const star of withTransformation) {
        expect(TRANSFORMATION_ENUM.has(star.transformation!)).toBe(true);
      }
      const names = withTransformation.map((s) => s.name).sort();
      const expected = [chart.tuHoa.loc, chart.tuHoa.quyen, chart.tuHoa.khoa, chart.tuHoa.ky].sort();
      expect(names).toEqual(expected);
    });

    it("palaces[].daiVan: đúng khớp daiVanTuoi gốc, label đúng format 'Can Chi'", () => {
      for (let i = 0; i < 12; i++) {
        const p = json.palaces[i];
        const c = chart.cungs[i];
        expect(p.daiVan).toEqual({ startAge: c.daiVanTuoi[0], endAge: c.daiVanTuoi[1], label: `${c.canName} ${c.chiName}` });
      }
    });

    it("tuHoa (top-level, EXTRA_FIELD): khớp 100% chart.tuHoa gốc, không tính lại", () => {
      expect(json.tuHoa).toEqual(chart.tuHoa);
    });
  });
}

describe("Phase 21 — regression: toJsonContract() không đổi TuViChart nguồn (adapter thuần đọc)", () => {
  it("Gọi toJsonContract() nhiều lần không làm thay đổi chart gốc (không mutate)", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const before = JSON.stringify(chart);
    toJsonContract(chart);
    toJsonContract(chart);
    const after = JSON.stringify(chart);
    expect(after).toBe(before);
  });
});
