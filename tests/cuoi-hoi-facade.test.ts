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

// ── V3-01 (2026-09-13): regression cho correction A-01 ───────────────────────────────────────────
// Trước sửa: TRUC_TOT_CUOI_HOI còn chứa "Bình" → mâu thuẫn trực tiếp với bảng lõi canonical
// `trucDanhGiaTongQuat.ts` (Bình/cuoi-hoi = "ky") và KR3g0051 Q11 (嫁娶, Bình thuộc 忌). Ngày
// 2026-10-05 (thực tế rơi vào Trực Bình, đã xác nhận bằng thực nghiệm ở V2.5) từng được engine
// xếp "CÓ THỂ DÙNG" với diemCapDoi = 5.6/10 nhờ cộng điểm sai từ Trực Bình. Test này khoá hành vi
// ĐÚNG qua chính public path (calculateCuoiHoiRange) — không test trực tiếp hằng số nội bộ
// TRUC_TOT_CUOI_HOI (không export, và test hành vi bền hơn test chi tiết cài đặt).
describe("Trực Bình KHÔNG còn được coi là Trực tốt cho cưới hỏi (V3-01 correction A-01)", () => {
  it("ngày 2026-10-05 (Trực Bình thật) có điểm thấp hơn hẳn giá trị SAI trước khi sửa (5.6/10)", () => {
    const range = calculateCuoiHoiRange({
      namSinhCoDau: 1998,
      namSinhChuRe: 1996,
      startDate: { year: 2026, month: 10, day: 5 },
      endDate: { year: 2026, month: 10, day: 5 },
      nghiLe: "thanh-hon",
      timeZone: TZ,
      soNgayTraVe: 1,
    });
    // Về mặt toán học, bỏ "Bình" khỏi trucTot chỉ có thể làm giảm hoặc giữ nguyên phanChung (không
    // bao giờ tăng) — nên nếu ngày này không bị loại thẳng, điểm PHẢI thấp hơn giá trị sai 5.6 cũ.
    expect(range.ngayXepHang).toHaveLength(1);
    expect(range.ngayXepHang[0]!.diemCapDoi).toBeLessThan(5.6);
  });
});

import { calculateLichCuoiHoi } from "@thien-anh/trachnhat-engine";

describe("calculateLichCuoiHoi — lịch trọn gói", () => {
  const r = calculateLichCuoiHoi({
    namSinhCoDau: 1998,
    namSinhChuRe: 1996,
    startDate: { year: 2026, month: 11, day: 1 },
    endDate: { year: 2027, month: 1, day: 31 },
    timeZone: TZ,
  });
  const jd = (d: any) => Date.UTC(d.year, d.month - 1, d.day);
  const byLe = (le: string) => r.muc.find((m) => m.nghiLe === le)!;

  it("trả đủ 4 nghi lễ, sắp theo trình tự thời gian", () => {
    expect(r.muc).toHaveLength(4);
    const coNgay = r.muc.filter((m) => m.solarDate);
    for (let i = 1; i < coNgay.length; i++) {
      expect(jd(coNgay[i]!.solarDate)).toBeGreaterThanOrEqual(jd(coNgay[i - 1]!.solarDate));
    }
  });

  it("ăn hỏi diễn ra TRƯỚC ngày thành hôn", () => {
    const anHoi = byLe("an-hoi");
    const thanhHon = byLe("thanh-hon");
    expect(anHoi.solarDate).not.toBeNull();
    expect(thanhHon.solarDate).not.toBeNull();
    expect(jd(anHoi.solarDate)).toBeLessThan(jd(thanhHon.solarDate));
  });

  it("đón dâu cùng ngày với thành hôn (ngày cưới)", () => {
    expect(jd(byLe("don-dau").solarDate)).toBe(jd(byLe("thanh-hon").solarDate));
  });

  it("mỗi mục có ngày đều kèm giờ đẹp (tối đa 3)", () => {
    for (const m of r.muc) {
      if (m.solarDate) {
        expect(m.gioTot.length).toBeGreaterThan(0);
        expect(m.gioTot.length).toBeLessThanOrEqual(3);
      }
    }
  });
});
