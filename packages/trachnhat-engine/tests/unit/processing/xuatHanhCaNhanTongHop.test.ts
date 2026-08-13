import { describe, expect, it } from "vitest";
import { calculateXuatHanhCaNhanRange, calculateXuatHanhCaNhanMotNgay } from "../../../src/processing/xuatHanhCaNhanTongHop.js";

describe("trachnhat-engine/processing/xuatHanhCaNhanTongHop", () => {
  it("quét 1 khoảng ngày × 12 giờ, xếp hạng giảm dần, đúng số tổ hợp = số ngày × 12", () => {
    const result = calculateXuatHanhCaNhanRange({
      namSinh: 1996,
      gioiTinh: "Nam",
      purpose: "XUAT_HANH_CHUNG",
      timeZone: "Asia/Ho_Chi_Minh",
      startDate: { year: 2026, month: 9, day: 1 },
      endDate: { year: 2026, month: 9, day: 5 },
    });
    expect(result.xepHang).toHaveLength(5 * 12);
    for (let i = 1; i < result.xepHang.length; i++) {
      expect(result.xepHang[i]!.finalDiem).toBeLessThanOrEqual(result.xepHang[i - 1]!.finalDiem);
    }
    expect(result.purpose).toBe("XUAT_HANH_CHUNG");
    expect(result.huong).toBeNull();
  });

  it("mỗi tổ hợp có điểm tổng hợp lệ và điểm ngày/giờ độc lập trong 0-10", () => {
    const result = calculateXuatHanhCaNhanRange({
      namSinh: 1990,
      gioiTinh: "Nữ",
      purpose: "CAU_TAI",
      timeZone: "Asia/Ho_Chi_Minh",
      startDate: { year: 2026, month: 9, day: 1 },
      endDate: { year: 2026, month: 9, day: 1 },
    });
    expect(result.xepHang).toHaveLength(12);
    for (const t of result.xepHang) {
      expect(t.finalDiem).toBeGreaterThanOrEqual(0);
      expect(t.finalDiem).toBeLessThanOrEqual(10);
      expect(t.dayScore.diem).toBeGreaterThanOrEqual(0);
      expect(t.dayScore.diem).toBeLessThanOrEqual(10);
      expect(t.hourScore.diem).toBeGreaterThanOrEqual(0);
      expect(t.hourScore.diem).toBeLessThanOrEqual(10);
    }
    // Cả 12 tổ hợp cùng 1 ngày phải có dayScore giống hệt nhau (điểm ngày không phụ thuộc giờ).
    const diemNgayDuyNhat = new Set(result.xepHang.map((t) => t.dayScore.diem));
    expect(diemNgayDuyNhat.size).toBe(1);
  });

  it("cả 12 mục đích đều tính được, không lỗi", () => {
    const purposes = [
      "XUAT_HANH_CHUNG",
      "DI_CONG_VIEC",
      "GAP_KHACH_HANG",
      "GAP_DOI_TAC",
      "KY_HOP_DONG",
      "CAU_TAI",
      "DI_LAM_AN",
      "DI_XA",
      "PHONG_VAN",
      "DOI_NO",
      "GIAO_DICH",
      "GIAO_TIEP_TIEC_TUNG",
    ] as const;
    for (const purpose of purposes) {
      const result = calculateXuatHanhCaNhanMotNgay({
        namSinh: 1996,
        gioiTinh: "Nam",
        purpose,
        timeZone: "Asia/Ho_Chi_Minh",
        solarDate: { year: 2026, month: 9, day: 18 },
      });
      expect(result).toHaveLength(12);
    }
  });

  it("có nhập hướng thì mọi tổ hợp cùng ngày đều có cùng 1 huong result", () => {
    const result = calculateXuatHanhCaNhanMotNgay({
      namSinh: 1996,
      gioiTinh: "Nam",
      purpose: "DI_XA",
      huong: "Bắc",
      timeZone: "Asia/Ho_Chi_Minh",
      solarDate: { year: 2026, month: 9, day: 18 },
    });
    for (const t of result) {
      expect(t.huong).not.toBeNull();
      expect(t.huong!.cungHuong).toBe("Khảm");
    }
  });

  it("không nhập hướng thì huong = null trên mọi tổ hợp", () => {
    const result = calculateXuatHanhCaNhanMotNgay({
      namSinh: 1996,
      gioiTinh: "Nam",
      purpose: "DI_XA",
      timeZone: "Asia/Ho_Chi_Minh",
      solarDate: { year: 2026, month: 9, day: 18 },
    });
    for (const t of result) {
      expect(t.huong).toBeNull();
    }
  });

  it("2 người khác Can/Chi/Mệnh cho ra dayScore cá nhân khác nhau trên cùng 1 ngày/mục đích", () => {
    const a = calculateXuatHanhCaNhanMotNgay({
      namSinh: 1988,
      gioiTinh: "Nam",
      purpose: "XUAT_HANH_CHUNG",
      timeZone: "Asia/Ho_Chi_Minh",
      solarDate: { year: 2026, month: 9, day: 18 },
    });
    const b = calculateXuatHanhCaNhanMotNgay({
      namSinh: 1995,
      gioiTinh: "Nữ",
      purpose: "XUAT_HANH_CHUNG",
      timeZone: "Asia/Ho_Chi_Minh",
      solarDate: { year: 2026, month: 9, day: 18 },
    });
    expect(a[0]!.dayScore.base.diem).toBe(b[0]!.dayScore.base.diem);
    expect(a[0]!.dayScore.mucDich.diem).toBe(b[0]!.dayScore.mucDich.diem);
    expect(a[0]!.dayScore.canNhan.diem).not.toBe(b[0]!.dayScore.canNhan.diem);
  });

  it("ném lỗi khi khoảng ngày quá 31 ngày", () => {
    expect(() =>
      calculateXuatHanhCaNhanRange({
        namSinh: 1996,
        gioiTinh: "Nam",
        purpose: "XUAT_HANH_CHUNG",
        timeZone: "Asia/Ho_Chi_Minh",
        startDate: { year: 2026, month: 1, day: 1 },
        endDate: { year: 2026, month: 3, day: 1 },
      }),
    ).toThrow();
  });

  it("ném lỗi khi năm sinh không hợp lệ", () => {
    expect(() =>
      calculateXuatHanhCaNhanMotNgay({
        namSinh: 1800,
        gioiTinh: "Nam",
        purpose: "XUAT_HANH_CHUNG",
        timeZone: "Asia/Ho_Chi_Minh",
        solarDate: { year: 2026, month: 9, day: 1 },
      }),
    ).toThrow();
  });
});
