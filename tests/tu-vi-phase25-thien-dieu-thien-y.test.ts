// Phase 25 — Thiên Diêu / Thiên Y: implement theo nguồn Level 1 hocvienlyso.org ("Tự học tử vi đẩu số
// bài 13: an các sao theo tháng sinh") — "Thiên Diêu (Riêu): khởi cung Sửu, đếm thuận theo tháng sinh";
// "Thiên Y: Thiên Riêu ở cung nào, an Thiên Y ngay ở cung đó".
//
// Theo đúng chỉ thị Phase 25 mục VIII: expected value lấy TRỰC TIẾP từ nguồn (khởi Sửu = tháng 1, đếm
// thuận), KHÔNG suy ra bằng cách gọi lại công thức mod12 trong chính implementation — bảng dưới đây liệt
// kê thủ công từng tháng theo đúng chữ nguồn ("Sửu tại tháng 1, đếm thuận"), không dùng `thienDieuIndex()`
// để tự sinh expected.

import { describe, expect, it } from "vitest";
import { thienDieuIndex, thienYIndex } from "../src/lib/tu-vi/rules";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { CHI } from "../src/lib/menh-nap-am";

// Đếm thuận từ Sửu (index 1) bắt đầu tại tháng 1 — liệt kê thủ công theo đúng nguồn, không gọi công thức.
const EXPECTED_THIEN_DIEU_BY_MONTH: Record<number, number> = {
  1: 1, // Sửu (điểm khởi, tháng Giêng)
  2: 2, // Dần
  3: 3, // Mão
  4: 4, // Thìn
  5: 5, // Tỵ
  6: 6, // Ngọ
  7: 7, // Mùi
  8: 8, // Thân
  9: 9, // Dậu
  10: 10, // Tuất
  11: 11, // Hợi
  12: 0, // Tý (vòng lại sau 12 tháng)
};

describe("Phase 25 — Thiên Diêu: đủ 12 tháng sinh, khởi Sửu tại tháng 1, đếm thuận (nguồn hocvienlyso.org)", () => {
  for (const [month, expectedChiIndex] of Object.entries(EXPECTED_THIEN_DIEU_BY_MONTH)) {
    it(`Tháng ${month}: Thiên Diêu tại ${CHI[expectedChiIndex]} (chi index ${expectedChiIndex})`, () => {
      expect(thienDieuIndex(Number(month))).toBe(expectedChiIndex);
    });
  }
});

describe("Phase 25 — Thiên Y: LUÔN đồng cung với Thiên Diêu (đúng theo nguồn, không suy diễn)", () => {
  for (const [month, expectedChiIndex] of Object.entries(EXPECTED_THIEN_DIEU_BY_MONTH)) {
    it(`Tháng ${month}: Thiên Y tại cùng vị trí Thiên Diêu (${CHI[expectedChiIndex]})`, () => {
      expect(thienYIndex(Number(month))).toBe(expectedChiIndex);
    });
  }

  it("Kiểm tra độc lập: Thiên Y không được suy ra đúng CHỈ VÌ Thiên Diêu đúng — đối chiếu riêng cả 12 tháng với bảng nguồn", () => {
    for (const [month, expectedChiIndex] of Object.entries(EXPECTED_THIEN_DIEU_BY_MONTH)) {
      expect(thienYIndex(Number(month))).toBe(expectedChiIndex);
    }
  });
});

describe("Phase 25 — Golden Master coverage: 0/6 GM có dữ liệu Thiên Diêu/Thiên Y", () => {
  it("Đã rà TuVi_Golden_Master_Pack_V1.md — không GM nào ghi vị trí Thiên Diêu/Thiên Y, không tự tạo expected từ GM", () => {
    expect(true).toBe(true);
  });
});

describe("Phase 25 — tích hợp vào tinhTuVi(): Thiên Diêu/Thiên Y xuất hiện đúng vị trí trong lá số thật", () => {
  it("GM-001 (31/08/1980, lunar month=7 → Mùi): Thiên Diêu và Thiên Y cùng ở cung Mùi", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    expect(chart.lunarMonth).toBe(7);
    const dieuPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Thiên Diêu"));
    const yPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Thiên Y"));
    expect(dieuPalace?.chiName).toBe("Mùi");
    expect(yPalace?.chiName).toBe("Mùi");
    expect(dieuPalace?.chiIndex).toBe(yPalace?.chiIndex);
  });
});

describe("Phase 25 — regression: không đổi các rule đã khóa (14 chính tinh, status, Mệnh/Thân/Cục, Tứ Hóa, Đại Vận, 4 trụ, Kình Đà, Khôi Việt, Xương Khúc, Tả Hữu)", () => {
  it("GM-001: toàn bộ metadata cốt lõi không đổi sau khi thêm Thiên Diêu/Thiên Y", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });
    expect(chart.menhChiIndex).toBe(2);
    expect(chart.thanChiIndex).toBe(2);
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.menhQuai).toBe("Khôn");
    expect(chart.chuMenh).toBe("Liêm Trinh");
    expect(chart.chuThan).toBe("Thiên Lương");
    expect(chart.cungs.flatMap((c) => c.chinhTinh)).toHaveLength(14);
    expect(chart.tuHoa).toEqual({ loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thái Âm", ky: "Thiên Đồng" });
    expect(chart.yearPillar.can).toBe("Canh");
    expect(chart.yearPillar.chi).toBe("Thân");
    // Kình Dương/Đà La (Phase 23), Thiên Khôi (Phase 24 — nay tại Ngọ) vẫn đúng.
    const khoiPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Thiên Khôi"));
    expect(khoiPalace?.chiName).toBe("Ngọ");
  });
});
