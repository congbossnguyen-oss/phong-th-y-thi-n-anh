// Kiểm tra TẦNG ĐỘNG (src/lib/quan-su/luan-van-khi/tang-dong.ts) — SPEC.md §2.
//
// Case gốc: Dương Nam, 10:00 15/6/1990 → Nhật Chủ Tân Kim, Nhược (Nhóm 2), Dụng Thần Thổ (Ấn),
// Hỷ Hỏa, Kỵ Mộc — đối chiếu tay bằng phanTichBatTu() trực tiếp (bat-tu-engine), không hardcode số.
import { describe, expect, it } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";
import { phanTichBatTu, type TuTruInput } from "../src/lib/bat-tu-engine/engine";
import { tinhTrangThaiThoiDiem } from "../src/lib/quan-su/luan-van-khi/tang-dong";

function ttCuaNguoi(day: number, month: number, year: number, hour: number, gender: "Nam" | "Nữ") {
  const chart = tinhBatTu({ day, month, year, hour, gender });
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: gender,
  };
  return { chart, tt, pt: phanTichBatTu(tt) };
}

describe("Tầng động — lá số tham chiếu 15/6/1990 10:00 Dương Nam (Tân Kim nhược, Nhóm 2)", () => {
  const { chart, tt, pt } = ttCuaNguoi(15, 6, 1990, 10, "Nam");

  it("khớp đúng mô tả tham chiếu: Nhật Chủ Tân Kim, Nhược, Nhóm 2", () => {
    expect(chart.nhatChu.can).toBe("Tân");
    expect(chart.nhatChu.nguHanh).toBe("Kim");
    expect(pt.vuongSuy.capDo).toBe("Nhược");
    expect(pt.vuongSuy.nhom).toBe(2);
  });

  it("mỗi Đại Vận trả về TrangThaiThoiDiem hợp lệ: capDo/dụng thần là giá trị thật, không rỗng", () => {
    for (const dv of chart.daiVan) {
      const ts = tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
      });
      expect(ts.vuongSuyTaiThoiDiem.length).toBeGreaterThan(0);
      expect(["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"]).toContain(ts.dungThanTaiThoiDiem);
      expect(Array.isArray(ts.quanHeKichHoat)).toBe(true);
      expect(ts.dienGiai.length).toBeGreaterThan(0);
    }
  });

  it("Lưu Niên 'Tuế Vận cùng gặp' được gắn cờ đúng khi Can Chi Lưu Niên trùng hệt Đại Vận đang đi", () => {
    const dv = chart.daiVan[0]!;
    const ts = tinhTrangThaiThoiDiem({
      tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "LuuNien",
      canChi: { can: dv.can, chi: dv.chi }, nam: dv.startDate.y, canChiDaiVanChua: { can: dv.can, chi: dv.chi },
    });
    expect(ts.quanHeKichHoat).toContain("tue_van_cung_gap");
  });
});

describe("Tầng động — Nhóm 1 (Trung hòa/Vượng, đủ lực đôi bên) → Dụng Thần CÓ THỂ đổi giữa các Đại Vận", () => {
  // Dò được bằng script quét (không hardcode ngày sinh tùy tiện): 10/1/1970 3h Dương Nam.
  const { chart, tt, pt } = ttCuaNguoi(10, 1, 1970, 3, "Nam");

  it("nguyên cục đúng là Nhóm 1", () => {
    expect(pt.vuongSuy.nhom).toBe(1);
  });

  it("Dụng Thần tại thời điểm khác nhau giữa ít nhất 2 Đại Vận (chứng minh tầng động hoạt động)", () => {
    const dungThanMoiDaiVan = chart.daiVan.map((dv) =>
      tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
      }).dungThanTaiThoiDiem,
    );
    const coDoiThat = new Set(dungThanMoiDaiVan).size > 1;
    expect(coDoiThat).toBe(true);
    // Ít nhất 1 Đại Vận phải tự báo dungThanDaDoi = true (so với dụng thần gốc).
    const coDaDoi = chart.daiVan.some((dv) =>
      tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
      }).dungThanDaDoi,
    );
    expect(coDaDoi).toBe(true);
  });
});

describe("Tầng động — Nhóm 3 (Tòng cách, cực đoan) → Dụng Thần giữ nguyên xuyên suốt", () => {
  // Dò được bằng script quét: 25/11/1974 2h Dương Nam → Cực nhược, Tòng Sát (Kim).
  const { chart, tt, pt } = ttCuaNguoi(25, 11, 1974, 2, "Nam");

  it("nguyên cục đúng là Nhóm 3", () => {
    expect(pt.vuongSuy.nhom).toBe(3);
  });

  it("Dụng Thần KHÔNG đổi ở bất kỳ Đại Vận nào (chưa đủ mức phá vỡ cấu trúc hoàn toàn)", () => {
    for (const dv of chart.daiVan) {
      const ts = tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
      });
      expect(ts.dungThanTaiThoiDiem).toBe(pt.dungThan.dungThan);
      expect(ts.dungThanDaDoi).toBe(false);
    }
  });
});
