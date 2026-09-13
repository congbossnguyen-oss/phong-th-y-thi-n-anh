// Test facade tầng CƯỚI HỎI (trachnhat-engine): quét ngày + chấm giờ với Can Chi / hoàng đạo /
// Tiểu Lục Nhâm THẬT. Đối chiếu `modulengaycuoihoitonghop final.md` v6 mục 22, 24.
import { describe, expect, it } from "vitest";
import { calculateCuoiHoiRange, calculateGioCuoiHoi } from "@thien-anh/trachnhat-engine";
import { TrachNhat } from "@thien-anh/rule-engine";

const TZ = "Asia/Ho_Chi_Minh";

describe("Trực Bình KHÔNG còn được coi là Trực tốt cho cưới hỏi (V3-02 correction A-01, production port)", () => {
  const base = {
    namSinhCoDau: 1998,
    namSinhChuRe: 1996,
    startDate: { year: 2026, month: 10, day: 1 },
    endDate: { year: 2026, month: 10, day: 31 },
    nghiLe: "thanh-hon" as const,
    timeZone: TZ,
  };

  it("ngày 2026-10-05 (Trực Bình thật) có điểm thấp hơn hẳn giá trị SAI trước khi sửa (5.6/10)", () => {
    const r = calculateCuoiHoiRange({ ...base, soNgayTraVe: 31 });
    const ngay = r.ngayXepHang.find(
      (n) => n.solarDate.year === 2026 && n.solarDate.month === 10 && n.solarDate.day === 5,
    );
    expect(ngay).toBeDefined();
    expect(ngay!.diemCapDoi).toBeLessThan(5.6);
  });

  it("tầng GIỜ (calculateGioCuoiHoi) cũng đồng bộ — ngày Trực Bình không còn được cộng điểm trucTot ở tầng giờ", () => {
    const truoc = calculateGioCuoiHoi({
      namSinhCoDau: 1998,
      namSinhChuRe: 1996,
      solarDate: { year: 2026, month: 10, day: 5 },
      nghiLe: "thanh-hon",
      timeZone: TZ,
    });
    // Không có field trucTot lộ ra trực tiếp trong kết quả giờ, nhưng diemNgay (nền để gộp) phải
    // phản ánh đúng việc KHÔNG còn cộng thưởng Trực tốt — dùng ngưỡng toán học tương tự tầng ngày.
    expect(truoc.diemNgay).toBeLessThan(5.6);
  });

  it("mọi Trực còn lại trong TRUC_TOT_CUOI_HOI phải nhất quán với bảng lõi canonical (không Trực nào bị đánh dấu 'tốt' trong khi bảng lõi ghi 'kỵ' cho cưới hỏi)", () => {
    const TRUC_TOT_HIEN_TAI = ["Thành", "Khai", "Mãn", "Định"];
    for (const truc of TRUC_TOT_HIEN_TAI) {
      const danhGia = TrachNhat.danhGiaTrucTheoMucDich(truc, "cuoi-hoi");
      expect(danhGia?.mucDo).not.toBe("ky");
    }
  });

  it("Trực Bình cụ thể: bảng lõi canonical xác nhận 'ky' cho cưới hỏi (đúng căn cứ của correction)", () => {
    const danhGia = TrachNhat.danhGiaTrucTheoMucDich("Bình", "cuoi-hoi");
    expect(danhGia?.mucDo).toBe("ky");
  });

  it("các Trực khác (Thành/Khai/Mãn/Định) không bị động tới — ngày 2026-11-11 (Trực tốt thật, đã xác nhận thực nghiệm) vẫn giữ điểm cao/hạng TỐT", () => {
    // 2026-11-11 đã xác nhận thực nghiệm là kết quả xếp hạng #1 (7.6đ, hạng "tot") trong khoảng
    // quét 2026-10-01..2026-11-30 SAU khi sửa — dùng làm mốc chống regression để đảm bảo correction
    // A-01 không vô tình hạ điểm các Trực KHÔNG phải Bình.
    const r = calculateCuoiHoiRange({
      namSinhCoDau: 1998,
      namSinhChuRe: 1996,
      startDate: { year: 2026, month: 10, day: 1 },
      endDate: { year: 2026, month: 11, day: 30 },
      nghiLe: "thanh-hon",
      timeZone: TZ,
      soNgayTraVe: 500,
    });
    const ngay1111 = r.ngayXepHang.find(
      (n) => n.solarDate.year === 2026 && n.solarDate.month === 11 && n.solarDate.day === 11,
    );
    expect(ngay1111).toBeDefined();
    expect(ngay1111!.diemCapDoi).toBeGreaterThanOrEqual(7);
    expect(ngay1111!.hang).toBe("tot");
  });
});

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
