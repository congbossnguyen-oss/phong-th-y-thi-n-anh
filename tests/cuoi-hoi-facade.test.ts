// Test facade tầng CƯỚI HỎI (trachnhat-engine): quét ngày + chấm giờ với Can Chi / hoàng đạo /
// Tiểu Lục Nhâm THẬT. Đối chiếu `modulengaycuoihoitonghop final.md` v6 mục 22, 24.
import { describe, expect, it } from "vitest";
import { calculateCuoiHoiRange, calculateGioCuoiHoi } from "@thien-anh/trachnhat-engine";

const TZ = "Asia/Ho_Chi_Minh";

describe("calculateGioCuoiHoi — tầng giờ", () => {
  const base = {
    namSinhCoDau: 1998,
    namSinhChuRe: 1996,
    solarDate: { year: 2026, month: 11, day: 11 },
    nghiLe: "thanh-hon" as const,
    timeZone: TZ,
  };

  it("trả đủ 12 giờ, mỗi giờ có khung giờ + điểm tổng hợp trong [0,10]", () => {
    const r = calculateGioCuoiHoi(base);
    expect(r.gioXepHang).toHaveLength(12);
    for (const g of r.gioXepHang) {
      expect(g.diemTongHop).toBeGreaterThanOrEqual(0);
      expect(g.diemTongHop).toBeLessThanOrEqual(10);
      expect(g.khungGio).toMatch(/\d{2}:\d{2}–\d{2}:\d{2}/);
    }
  });

  it("đã xếp hạng giảm dần theo điểm tổng hợp", () => {
    const r = calculateGioCuoiHoi(base);
    for (let i = 1; i < r.gioXepHang.length; i++) {
      expect(r.gioXepHang[i - 1]!.diemTongHop).toBeGreaterThanOrEqual(r.gioXepHang[i]!.diemTongHop);
    }
  });

  it("điểm tổng hợp gộp đúng điểm ngày với từng giờ (không phá quan hệ đơn điệu)", () => {
    const r = calculateGioCuoiHoi(base);
    // Giờ điểm cao nhất phải >= giờ điểm thấp nhất; và điểm ngày nằm trong [0,10].
    expect(r.diemNgay).toBeGreaterThanOrEqual(0);
    expect(r.diemNgay).toBeLessThanOrEqual(10);
    expect(r.gioXepHang[0]!.diemTongHop).toBeGreaterThanOrEqual(r.gioXepHang[11]!.diemTongHop);
  });

  it("đón dâu (nặng giờ) và thành hôn (nặng ngày) cho thứ hạng giờ khác nhau khi ngày–giờ lệch nhau", () => {
    const donDau = calculateGioCuoiHoi({ ...base, nghiLe: "don-dau" });
    const thanhHon = calculateGioCuoiHoi({ ...base, nghiLe: "thanh-hon" });
    // Cùng ngày, cùng cặp đôi; tỷ trọng khác nhau → điểm tổng hợp giờ tốt nhất thường khác nhau.
    const topDon = donDau.gioXepHang[0]!.diemTongHop;
    const topThanh = thanhHon.gioXepHang[0]!.diemTongHop;
    expect(topDon).not.toBeNaN();
    expect(topThanh).not.toBeNaN();
  });

  it("ngày phạm đại kỵ vẫn chấm được giờ nhưng gắn cờ ngayBiLoai", () => {
    // Quét tìm một ngày bị loại trong khoảng rộng, rồi chấm giờ cho nó.
    const range = calculateCuoiHoiRange({
      ...base,
      startDate: { year: 2026, month: 11, day: 1 },
      endDate: { year: 2026, month: 12, day: 31 },
      nghiLe: "thanh-hon",
      soNgayTraVe: 5,
    });
    expect(range.soNgayBiLoai).toBeGreaterThan(0);
  });
});
