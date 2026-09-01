import { describe, it, expect } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";
import { phanTichBatTu, type TuTruInput } from "../src/lib/bat-tu-engine/engine";
import { findingsJ } from "../src/lib/luan-giai-toan-dien/findings-co-ban";

// Khóa Tầng 1 "Bù Khuyết Ngũ Hành" (mở rộng Giai đoạn J) theo đúng lá số chuẩn anh Công xác nhận tay:
// Nữ Mậu Dần/Canh Thân/Quý Tỵ/Nhâm Tuất — không Điều Hậu; 2026 (Bính Ngọ) + Đại Vận Đinh Tỵ 23-32t
// = nặng nhất; Đại Vận 43-62t + Lưu Niên 2034-2035 = nhẹ hơn (Cừu Thần Mộc); Trụ Ngày (Tỵ) Hình với
// Dần+Thân, Hại với Dần → hôn nhân/bản thân.
function laSoHa() {
  const chart = tinhBatTu({ year: 1998, month: 8, day: 14, hour: 20, gender: "Nữ" });
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: "Nữ",
  };
  return { chart, analysis: phanTichBatTu(tt) };
}

describe("Bù Khuyết Ngũ Hành — Tầng 1 (lá số Hà)", () => {
  const { chart, analysis } = laSoHa();
  // namSinh=1998, namXem=2026 cố định để test không phụ thuộc đồng hồ.
  const bk = (findingsJ(chart, analysis, undefined, 1998, 2026).ketQua as any).buKhuyet as {
    coDieuHau: boolean;
    mucDoUuTien: { loai: string; canChi: string; namHoacTuoi: string; mucDo: string }[];
    vanDeCauTruc: { tru: string; loaiQuanHe: string; doiTac: string[]; linhVucAnhHuong: string; vungCoThe: string }[];
  };

  it("coDieuHau = false (sinh tháng Thân, không cực đoan)", () => {
    expect(bk.coDieuHau).toBe(false);
  });

  it("Đại Vận Đinh Tỵ (23-32t) = nang_nhat", () => {
    const m = bk.mucDoUuTien.find((x) => x.loai === "DaiVan" && x.canChi === "Đinh Tỵ");
    expect(m?.mucDo).toBe("nang_nhat");
  });

  it("Lưu Niên 2026 (Bính Ngọ) = nang_nhat", () => {
    const m = bk.mucDoUuTien.find((x) => x.loai === "LuuNien" && x.namHoacTuoi === "2026");
    expect(m?.canChi).toBe("Bính Ngọ");
    expect(m?.mucDo).toBe("nang_nhat");
  });

  it("Lưu Niên 2034, 2035 = nhe_hon (Cừu Thần Mộc)", () => {
    expect(bk.mucDoUuTien.find((x) => x.namHoacTuoi === "2034")?.mucDo).toBe("nhe_hon");
    expect(bk.mucDoUuTien.find((x) => x.namHoacTuoi === "2035")?.mucDo).toBe("nhe_hon");
  });

  it("Đại Vận Ất Mão (43-52) + Giáp Dần (53-62) = nhe_hon", () => {
    expect(bk.mucDoUuTien.find((x) => x.canChi === "Ất Mão" && x.loai === "DaiVan")?.mucDo).toBe("nhe_hon");
    expect(bk.mucDoUuTien.find((x) => x.canChi === "Giáp Dần" && x.loai === "DaiVan")?.mucDo).toBe("nhe_hon");
  });

  it("vanDeCauTruc: Trụ Ngày Hình với Dần+Thân, Hại với Dần, lĩnh vực hôn nhân/bản thân", () => {
    const ngayHinh = bk.vanDeCauTruc.find((v) => v.tru === "Ngay" && v.loaiQuanHe === "Hinh");
    expect(ngayHinh).toBeDefined();
    expect(ngayHinh!.doiTac.sort()).toEqual(["Dần", "Thân"]);
    expect(ngayHinh!.linhVucAnhHuong).toContain("hôn nhân");
    const ngayHai = bk.vanDeCauTruc.find((v) => v.tru === "Ngay" && v.loaiQuanHe === "Hai");
    expect(ngayHai?.doiTac).toContain("Dần");
  });

  it("có đủ Đại Vận + Lưu Niên trong mucDoUuTien", () => {
    expect(bk.mucDoUuTien.some((x) => x.loai === "DaiVan")).toBe(true);
    expect(bk.mucDoUuTien.filter((x) => x.loai === "LuuNien").length).toBe(10);
  });
});
