import { describe, expect, it } from "vitest";
import { calculateHuongCompatibility, HUONG_TOI_QUAI, type HuongXuatHanh } from "../../../src/scoring/huongXuatHanh.js";
import { calculateCungPhi } from "../../../src/cung-menh-bat-trach/cungPhi.js";

describe("scoring/huongXuatHanh", () => {
  it("điểm trong khoảng 0-10", () => {
    for (const huong of ["Đông", "Tây", "Nam", "Bắc", "Đông Bắc", "Đông Nam", "Tây Bắc", "Tây Nam"] as const) {
      const result = calculateHuongCompatibility(1996, "nam", huong);
      expect(result.diem).toBeGreaterThanOrEqual(0);
      expect(result.diem).toBeLessThanOrEqual(10);
    }
  });

  it("hướng dẫn tới đúng cung Mệnh của người thì luôn ra khí Phục Vị (cát, bình hòa)", () => {
    // Tự suy ra hướng ứng với cung Mệnh (thay vì hardcode 1 cung cụ thể) để không phụ thuộc vào
    // việc công thức Cung Phi có thay đổi hay không — chỉ kiểm tra tính NHẤT QUÁN nội bộ giữa
    // `calculateCungPhi` và bảng `HUONG_TOI_QUAI`.
    const cungMenh = calculateCungPhi(1996, "nam");
    const huongTrungCung = (Object.keys(HUONG_TOI_QUAI) as HuongXuatHanh[]).find((h) => HUONG_TOI_QUAI[h] === cungMenh)!;
    const ketQua = calculateHuongCompatibility(1996, "nam", huongTrungCung);
    expect(ketQua.khi).toBe("Phục Vị");
    expect(ketQua.cat).toBe(true);
  });

  it("khí cát (sinh-khi/thien-y) luôn cho điểm cao hơn khí hung nặng (ngu-quy/tuyet-menh)", () => {
    const tatCa = (["Đông", "Tây", "Nam", "Bắc", "Đông Bắc", "Đông Nam", "Tây Bắc", "Tây Nam"] as const).map((h) =>
      calculateHuongCompatibility(2000, "nu", h),
    );
    const cat = tatCa.filter((r) => r.khi === "Sinh Khí" || r.khi === "Thiên Y");
    const hungNang = tatCa.filter((r) => r.khi === "Ngũ Quỷ" || r.khi === "Tuyệt Mệnh");
    expect(cat.length).toBeGreaterThan(0);
    expect(hungNang.length).toBeGreaterThan(0);
    for (const c of cat) {
      for (const h of hungNang) {
        expect(c.diem).toBeGreaterThan(h.diem);
      }
    }
  });

  it("đủ 8 hướng cho ra đúng 8 quái khác nhau, phủ toàn bộ Cung Bát Trạch", () => {
    const quaiSet = new Set(
      (["Đông", "Tây", "Nam", "Bắc", "Đông Bắc", "Đông Nam", "Tây Bắc", "Tây Nam"] as const).map(
        (h) => calculateHuongCompatibility(1996, "nam", h).cungHuong,
      ),
    );
    expect(quaiSet.size).toBe(8);
  });
});
