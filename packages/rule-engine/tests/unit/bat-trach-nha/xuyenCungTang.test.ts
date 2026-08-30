import { describe, expect, it } from "vitest";
import { tinhXuyenCungTangKhaNang2, tinhXuyenCungTang, SO_TANG_TOI_DA } from "../../../src/bat-trach-nha/xuyenCungTang.js";

// 2 ví dụ xác thực nguyên văn trong data/07 mục 3 — cả 2 đều "Tốn môn - Khảm trạch".
describe("bat-trach-nha — Xuyên Cung Cửu Tinh (data/07, 2 ví dụ xác thực)", () => {
  it("Ví dụ A (5 tầng, khả năng 2 theo đúng sách): Thiên y, Diên niên, Lục sát, Sinh khí, Ngũ quỷ", () => {
    const ket = tinhXuyenCungTangKhaNang2("Khảm", "Tốn", 5)!;
    expect(ket.map((t) => t.tenKhi)).toEqual(["Thiên Y", "Diên Niên", "Lục Sát", "Sinh Khí", "Ngũ Quỷ"]);
  });

  it("Ví dụ B (8 tầng, khả năng 2 theo đúng sách): Thiên y, Họa hại, Tuyệt mệnh, Diên niên, Lục sát, Phục vị, Sinh khí, Ngũ quỷ", () => {
    const ket = tinhXuyenCungTangKhaNang2("Khảm", "Tốn", 8)!;
    expect(ket.map((t) => t.tenKhi)).toEqual(["Thiên Y", "Họa Hại", "Tuyệt Mệnh", "Diên Niên", "Lục Sát", "Phục Vị", "Sinh Khí", "Ngũ Quỷ"]);
  });

  it("Khả năng 2 trả null cho tổ hợp Tọa/Môn KHÔNG có ví dụ xác thực trong nguồn", () => {
    expect(tinhXuyenCungTangKhaNang2("Càn", "Ly", 5)).toBeNull();
  });

  it("Khả năng 1 (mặc định) luôn tính được cho MỌI tổ hợp Tọa/Môn, không throw", () => {
    const cungs = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"] as const;
    for (const toa of cungs) {
      for (const mon of cungs) {
        expect(() => tinhXuyenCungTang(toa, mon, SO_TANG_TOI_DA)).not.toThrow();
      }
    }
  });

  it("báo lệch đúng khi Khả năng 1 và Khả năng 2 cho kết quả khác nhau (ca Khảm/Tốn)", () => {
    const ket = tinhXuyenCungTang("Khảm", "Tốn", 5);
    // Khả năng 1 = Sinh khí (Du Niên Khảm-Tốn), Khả năng 2 = Thiên y (theo sách) -> phải lệch.
    expect(ket.khaNang1[0]!.tenKhi).toBe("Sinh Khí");
    expect(ket.khaNang2![0]!.tenKhi).toBe("Thiên Y");
    expect(ket.lech).toBe(true);
  });

  it("giới hạn tối đa 10 tầng — quá số này phải throw, không tự suy diễn tiếp", () => {
    expect(() => tinhXuyenCungTang("Khảm", "Tốn", SO_TANG_TOI_DA + 1)).toThrow();
  });
});
