// V3-07B — TRẠCH NHẬT PILOT MIGRATION (Phase D).
//
// Chứng minh: (a) Trạch Nhật suy Can/Chi/Nạp Âm từ năm sinh nay đi qua MethodYearContract tường minh
// (convention GANZHI_CALENDAR_BOUNDARY), (b) hành vi GIỮ NGUYÊN 100% so với trước migrate.
//
// Import SOURCE (../../../src) để thấy ngay bản đã migrate, không phụ thuộc build dist.
import { describe, expect, it } from "vitest";
import { getNguoiTuoi, getCan, getChi, getNapAm } from "../../../src/scoring/tuoiHopLamAn.js";
import { birthDateFromGregorianYear, resolveMethodYear } from "@thien-anh/calendar-core";

// Baseline đã chụp TRƯỚC migrate (scratchpad v307b-baseline-BEFORE.json) — vài mốc tiêu biểu.
const BASELINE: Record<number, { can: string; chi: string; menh: string; napAm: string }> = {
  1900: { can: "Canh", chi: "Tý", menh: "Thổ", napAm: "Bích Thượng Thổ" },
  1990: { can: "Canh", chi: "Ngọ", menh: "Thổ", napAm: "Lộ Bàng Thổ" },
  2000: { can: "Canh", chi: "Thìn", menh: "Kim", napAm: "Bạch Lạp Kim" },
  2026: { can: "Bính", chi: "Ngọ", menh: "Thủy", napAm: "Thiên Hà Thủy" },
};

describe("Trạch Nhật — Can/Chi/Nạp Âm từ năm sinh GIỮ NGUYÊN sau khi migrate qua MethodYearContract", () => {
  for (const [yStr, exp] of Object.entries(BASELINE)) {
    const y = Number(yStr);
    it(`năm ${y} → ${exp.can} ${exp.chi}, mệnh ${exp.menh}, nạp âm ${exp.napAm}`, () => {
      const n = getNguoiTuoi(y);
      expect(n.can).toBe(exp.can);
      expect(n.chi).toBe(exp.chi);
      expect(n.nguHanhMenh).toBe(exp.menh);
      expect(n.napAm.name).toBe(exp.napAm);
      // các hàm lẻ nhất quán với getNguoiTuoi
      expect(getCan(y)).toBe(exp.can);
      expect(getChi(y)).toBe(exp.chi);
      expect(getNapAm(y).name).toBe(exp.napAm);
    });
  }
});

describe("Trạch Nhật — derivation THẬT SỰ đi qua contract GANZHI_CALENDAR_BOUNDARY", () => {
  it("getNguoiTuoi(y) khớp CHÍNH XÁC pillar do resolveMethodYear(GANZHI_CALENDAR_BOUNDARY) trả về", () => {
    for (const y of [1911, 1975, 1984, 2003, 2024, 2026, 2044]) {
      const viaContract = resolveMethodYear(
        { method: "trach-nhat.tuoi-can-chi", convention: "GANZHI_CALENDAR_BOUNDARY" },
        birthDateFromGregorianYear(y, "Asia/Ho_Chi_Minh"),
      ).resolved.pillar!;
      const viaTrachNhat = getNguoiTuoi(y);
      expect(viaTrachNhat.can).toBe(viaContract.can);
      expect(viaTrachNhat.chi).toBe(viaContract.chi);
      expect(viaTrachNhat.napAm.name).toBe(viaContract.napAm.name);
    }
  });
});
