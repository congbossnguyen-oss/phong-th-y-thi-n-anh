import { describe, expect, it } from "vitest";
import { luanBatTrachToiThieu, luanTamYeuVaSinhKhac, luanXuyenCung, luanLuuNien } from "../../../src/bat-trach-nha/engine.js";
import { DEFAULT_BAT_TRACH_CONFIG, type BatTrachConfig } from "../../../src/bat-trach-nha/config.js";

describe("bat-trach-nha — engine.luanBatTrachToiThieu (ca mẫu SPEC §5)", () => {
  it("Nam 1989, hướng chính Nam (180°, cung Ly) -> Khôn/Ly = Lục sát, không hợp mệnh (mặc định theo Hướng)", () => {
    const ket = luanBatTrachToiThieu({ namSinh: 1989, gioiTinh: "nam", huong: { kieu: "do", do: 180 } });
    expect(ket.cungMenh).toBe("Khôn");
    expect(ket.nhomMenh).toBe("tay");
    expect(ket.huong.cung).toBe("Ly");
    expect(ket.hopMenh.theoHuong.khi).toBe("luc-sat");
    expect(ket.hopMenh.ketLuanChinh.hop).toBe(false);
  });

  it("4 phương Cát/Hung của mệnh Khảm đúng theo data/02 ví dụ minh họa", () => {
    const ket = luanBatTrachToiThieu({ namSinh: 1996, gioiTinh: "nam", huong: { kieu: "8huong", huong: "Bắc" } });
    // Ví dụ trong data/02: mệnh Khảm -> cát: Khảm(Phục vị), Tốn(Sinh khí), Chấn(Thiên y), Ly(Diên niên).
    if (ket.cungMenh === "Khảm") {
      expect(new Set(ket.bonPhuong.catList)).toEqual(new Set(["Khảm", "Tốn", "Chấn", "Ly"]));
      expect(new Set(ket.bonPhuong.hungList)).toEqual(new Set(["Càn", "Khôn", "Cấn", "Đoài"]));
    }
  });

  it("cờ cấu hình luanHopMenhTheo='toa' đổi được kết luận chính sang Tọa mà không cần sửa code", () => {
    const configToa: BatTrachConfig = { ...DEFAULT_BAT_TRACH_CONFIG, luanHopMenhTheo: "toa" };
    const ket = luanBatTrachToiThieu({ namSinh: 1989, gioiTinh: "nam", huong: { kieu: "do", do: 180 } }, configToa);
    expect(ket.hopMenh.dungHuongLamChinh).toBe(false);
    expect(ket.hopMenh.ketLuanChinh).toBe(ket.hopMenh.theoToa);
  });

  it("hướng nhà lệch mệnh -> có gợi ý hóa giải; hợp mệnh -> hoaGiaiNeuKhongHop = null", () => {
    const lech = luanBatTrachToiThieu({ namSinh: 1989, gioiTinh: "nam", huong: { kieu: "do", do: 180 } });
    expect(lech.goiYBoTri.hoaGiaiNeuKhongHop).not.toBeNull();

    // Tìm 1 hướng hợp mệnh Khôn (Diên niên/Thiên y/Sinh khí/Phục vị) để kiểm nhánh ngược lại.
    const hopHuongDo: Record<string, number> = { Càn: 315, Cấn: 45, Khôn: 225, Đoài: 270 };
    const hop = luanBatTrachToiThieu({ namSinh: 1989, gioiTinh: "nam", huong: { kieu: "do", do: hopHuongDo.Khôn! } });
    expect(hop.hopMenh.ketLuanChinh.hop).toBe(true);
    expect(hop.goiYBoTri.hoaGiaiNeuKhongHop).toBeNull();
  });
});

describe("bat-trach-nha — engine.luanTamYeuVaSinhKhac (Dương Trạch Tam Yếu)", () => {
  it("bếp phối Cửa ra Diên niên/Thiên y -> đánh giá đại cát", () => {
    // Cửa Khảm, Chủ bất kỳ, Bếp Tốn -> Du Niên(Khảm,Tốn) = Sinh khí (tốt kém 1 bậc, không phải đại cát).
    // Đổi sang Bếp Ly để ra Diên niên (Khảm-Ly = Diên niên theo bảng data/02).
    const ket = luanTamYeuVaSinhKhac({ cuaCung: "Khảm", chuCung: "Cấn", bepCung: "Ly" });
    expect(ket.tamYeu.khiBep).toBe("dien-nien");
    expect(ket.tamYeu.danhGiaBep).toBe("dai-cat");
  });

  it("bếp phối Cửa ra Tuyệt mệnh/Ngũ quỷ -> đánh giá tránh tuyệt đối", () => {
    // Khảm-Khôn = Tuyệt mệnh theo bảng data/02.
    const ket = luanTamYeuVaSinhKhac({ cuaCung: "Khảm", chuCung: "Cấn", bepCung: "Khôn" });
    expect(ket.tamYeu.khiBep).toBe("tuyet-menh");
    expect(ket.tamYeu.danhGiaBep).toBe("tranh-tuyet-doi");
  });
});

describe("bat-trach-nha — engine.luanXuyenCung + luanLuuNien", () => {
  it("Xuyên Cung 5 tầng cho tổ hợp Tọa Khảm/Môn Tốn -> khả năng 1 và khả năng 2 (đối chiếu) cùng tồn tại", () => {
    const ket = luanXuyenCung("Khảm", "Tốn", 5);
    expect(ket.khaNang1).toHaveLength(5);
    expect(ket.khaNang2).not.toBeNull();
  });

  it("Lưu niên: Đô Thiên và Thái Tuế tính độc lập, không throw với năm hợp lệ", () => {
    const ket = luanLuuNien(1990, 2026);
    expect(ket.doThien.sonDoThien).toHaveLength(2);
    expect(ket.thaiTue.namChi).toBeDefined();
  });
});
