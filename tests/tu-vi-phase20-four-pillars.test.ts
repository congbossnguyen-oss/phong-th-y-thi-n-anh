// Phase 20 — tích hợp 4 trụ Can Chi (yearPillar/monthPillar/dayPillar/hourPillar) vào tinhTuVi(), tái sử
// dụng NGUYÊN VẸN tinhBatTu() (bat-tu.ts) — không viết công thức Can Chi thứ hai.
//
// Nguyên tắc test (theo đúng chỉ thị Phase 20 mục X): KHÔNG tự bịa expected value cho các mốc chưa có
// nguồn xác nhận độc lập. Có 2 lớp kiểm chứng:
//   (1) yearPillar + hourPillar.chi: CÓ SẴN Golden Master gián tiếp — đối chiếu với yearCanName/
//       yearChiName/gioChiName hiện tại của chính tinhTuVi() (đã VERIFIED qua GM-001..006 từ trước).
//   (2) monthPillar/dayPillar (và hourPillar.can): CHƯA có Golden Master độc lập cho riêng 2 trụ này —
//       chỉ test "tồn tại + format hợp lệ + nhất quán với tinhBatTu() gọi trực tiếp", không khẳng định
//       đúng/sai tuyệt đối.

import { describe, expect, it } from "vitest";
import { tinhTuVi, type TuViInput } from "../src/lib/tu-vi/engine";
import { tinhBatTu } from "../src/lib/bat-tu";
import { CAN, CHI } from "../src/lib/menh-nap-am";

const GM_CASES: [string, TuViInput][] = [
  ["GM-001", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" }],
  ["GM-002", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ" }],
  ["GM-003", { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam" }],
  ["GM-004", { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" }],
  ["GM-005", { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" }],
  ["GM-006", { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" }],
];

const BOUNDARY_YEARS = [1800, 1900, 2000, 2001, 2021, 2026];

function isValidPillar(p: { can: string; chi: string; canIndex: number; chiIndex: number }): boolean {
  return (
    CAN.includes(p.can) && CHI.includes(p.chi) &&
    p.canIndex >= 0 && p.canIndex <= 9 && p.chiIndex >= 0 && p.chiIndex <= 11 &&
    CAN[p.canIndex] === p.can && CHI[p.chiIndex] === p.chi
  );
}

describe("Phase 20 — 4 trụ Can Chi cho GM-001..006", () => {
  for (const [label, input] of GM_CASES) {
    describe(label, () => {
      const chart = tinhTuVi(input);

      it("yearPillar: format hợp lệ VÀ khớp yearCanName/yearChiName hiện có (VERIFIED gián tiếp qua GM)", () => {
        expect(isValidPillar(chart.yearPillar)).toBe(true);
        expect(chart.yearPillar.can).toBe(chart.yearCanName);
        expect(chart.yearPillar.chi).toBe(chart.yearChiName);
      });

      it("hourPillar.chi: khớp gioChiName hiện có (VERIFIED gián tiếp qua GM)", () => {
        expect(chart.hourPillar.chi).toBe(chart.gioChiName);
      });

      it("monthPillar/dayPillar/hourPillar.can: format hợp lệ, không khẳng định đúng/sai (chưa có GM riêng)", () => {
        expect(isValidPillar(chart.monthPillar)).toBe(true);
        expect(isValidPillar(chart.dayPillar)).toBe(true);
        expect(isValidPillar(chart.hourPillar)).toBe(true);
      });

      it("nhất quán 100% với gọi tinhBatTu() trực tiếp (KHÔNG có công thức Can Chi thứ hai)", () => {
        const bt = tinhBatTu({ day: input.day, month: input.month, year: input.year, hour: input.hour, gender: input.gender });
        expect(chart.yearPillar).toEqual({ can: bt.year.can, chi: bt.year.chi, canIndex: bt.year.canIndex, chiIndex: bt.year.chiIndex });
        expect(chart.monthPillar).toEqual({ can: bt.month.can, chi: bt.month.chi, canIndex: bt.month.canIndex, chiIndex: bt.month.chiIndex });
        expect(chart.dayPillar).toEqual({ can: bt.day.can, chi: bt.day.chi, canIndex: bt.day.canIndex, chiIndex: bt.day.chiIndex });
        expect(chart.hourPillar).toEqual({ can: bt.hour.can, chi: bt.hour.chi, canIndex: bt.hour.canIndex, chiIndex: bt.hour.chiIndex });
      });
    });
  }
});

describe("Phase 20 — boundary năm (1800/1900/2000/2001/2021/2026): output tồn tại + format hợp lệ + nhất quán bat-tu.ts", () => {
  for (const year of BOUNDARY_YEARS) {
    it(`Năm ${year}: 4 trụ đều hợp lệ, yearPillar khớp yearCanName/yearChiName`, () => {
      const input: TuViInput = { day: 15, month: 6, year, hour: 11, gender: "Nam" };
      const chart = tinhTuVi(input);
      expect(isValidPillar(chart.yearPillar)).toBe(true);
      expect(isValidPillar(chart.monthPillar)).toBe(true);
      expect(isValidPillar(chart.dayPillar)).toBe(true);
      expect(isValidPillar(chart.hourPillar)).toBe(true);
      expect(chart.yearPillar.can).toBe(chart.yearCanName);
      expect(chart.yearPillar.chi).toBe(chart.yearChiName);
      expect(chart.hourPillar.chi).toBe(chart.gioChiName);
    });
  }
});

describe("Phase 20 — boundary giờ Tý (23h-00h59, dayPillar phải đổi ngày đúng behavior bat-tu.ts hiện tại)", () => {
  it("Giờ 22h (Hợi, chưa qua Tý) và giờ 23h30 (Tý, đã qua 23h): dayPillar khác nhau đúng như bat-tu.ts", () => {
    const base = { day: 15, month: 6, year: 1990, gender: "Nam" as const };
    const truoc = tinhTuVi({ ...base, hour: 22 });
    const sau = tinhTuVi({ ...base, hour: 23 });
    const btTruoc = tinhBatTu({ ...base, hour: 22 });
    const btSau = tinhBatTu({ ...base, hour: 23 });
    // Không khẳng định đúng/sai tuyệt đối — chỉ khẳng định tinhTuVi() PHẢN ÁNH ĐÚNG behavior hiện tại
    // của bat-tu.ts (không tự đổi quy tắc, không tự tính lại).
    expect(truoc.dayPillar.chiIndex).toBe(btTruoc.day.chiIndex);
    expect(sau.dayPillar.chiIndex).toBe(btSau.day.chiIndex);
    expect(sau.dayPillar.chiIndex).not.toBe(truoc.dayPillar.chiIndex);
  });

  it("GM-005 (giờ Tý 00:30) — dayPillar/hourPillar tồn tại hợp lệ, khớp bat-tu.ts (không tự bịa expected)", () => {
    const input: TuViInput = { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" };
    const chart = tinhTuVi(input);
    const bt = tinhBatTu({ day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" });
    expect(chart.dayPillar.can).toBe(bt.day.can);
    expect(chart.dayPillar.chi).toBe(bt.day.chi);
    expect(chart.hourPillar.can).toBe(bt.hour.can);
    expect(chart.hourPillar.chi).toBe(bt.hour.chi);
  });
});

describe("Phase 20 — boundary tiết khí / năm âm lịch (GM-006: Dương 2026 nhưng Can Chi năm Ất Tỵ)", () => {
  it("GM-006 (04/02/2026 02:30, sát ranh giới Lập Xuân): yearPillar = Ất Tỵ, khớp cả tinhTuVi lẫn tinhBatTu", () => {
    const input: TuViInput = { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" };
    const chart = tinhTuVi(input);
    const bt = tinhBatTu({ day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" });
    expect(chart.yearPillar.can).toBe("Ất");
    expect(chart.yearPillar.chi).toBe("Tỵ");
    expect(bt.year.can).toBe("Ất");
    expect(bt.year.chi).toBe("Tỵ");
    expect(chart.yearPillar.can).toBe(bt.year.can);
    expect(chart.yearPillar.chi).toBe(bt.year.chi);
  });
});

describe("Phase 20 — regression: KHÔNG đổi các field/rule đã khóa", () => {
  it("GM-001: Mệnh/Thân/Cục/12 cung/14 chính tinh/Tứ Hóa/Đại Vận không đổi sau khi thêm 4 trụ", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });
    expect(chart.menhChiIndex).toBe(2); // Dần
    expect(chart.thanChiIndex).toBe(2);
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.menhQuai).toBe("Khôn");
    expect(chart.chuMenh).toBe("Liêm Trinh");
    expect(chart.chuThan).toBe("Thiên Lương");
    expect(chart.tuHoa).toEqual({ loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thái Âm", ky: "Thiên Đồng" });
    const menh = chart.cungs.find((c) => c.chiIndex === 2)!;
    expect(menh.chinhTinh.find((s) => s.name === "Liêm Trinh")?.trangThai).toBe("Vượng");
    expect(menh.daiVanTuoi).toEqual([5, 14]);
  });
});
