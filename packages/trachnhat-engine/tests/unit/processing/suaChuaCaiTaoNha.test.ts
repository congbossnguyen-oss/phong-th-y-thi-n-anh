import { describe, expect, it } from "vitest";
import { calculateSuaChuaCaiTaoNhaRange, calculateSuaChuaCaiTaoNhaMotNgay } from "../../../src/processing/suaChuaCaiTaoNha.js";

const INPUT_CHUNG = {
  namSinh: 1990,
  renovationType: "medium" as const,
  affectsStructure: false,
  digsGround: false,
  affectedCungList: ["Chấn"] as const,
  timeZone: "Asia/Ho_Chi_Minh",
};

describe("trachnhat-engine/processing/suaChuaCaiTaoNha", () => {
  it("quét 1 khoảng ngày × 12 giờ, xếp hạng giảm dần, đúng số tổ hợp = số ngày × 12", () => {
    const result = calculateSuaChuaCaiTaoNhaRange({
      ...INPUT_CHUNG,
      startDate: { year: 2026, month: 9, day: 1 },
      endDate: { year: 2026, month: 9, day: 5 },
    });
    expect(result.xepHang).toHaveLength(5 * 12);
    for (let i = 1; i < result.xepHang.length; i++) {
      expect(result.xepHang[i]!.finalDiem).toBeLessThanOrEqual(result.xepHang[i - 1]!.finalDiem);
    }
  });

  it("siteSafety/ownerYear giống hệt nhau trên mọi tổ hợp (chỉ phụ thuộc năm + phương vị, không đổi theo ngày)", () => {
    const result = calculateSuaChuaCaiTaoNhaRange({
      ...INPUT_CHUNG,
      startDate: { year: 2026, month: 9, day: 1 },
      endDate: { year: 2026, month: 9, day: 3 },
    });
    expect(result.siteSafety.phamNghiemTrong).toBe(false);
    expect(result.ownerYear.diem).toBeGreaterThanOrEqual(0);
  });

  it("sửa đúng phương Thái Tuế/Tuế Phá/Tam Sát + động thổ -> điểm bị chặn trần thấp trên MỌI tổ hợp", () => {
    // 2026 = Bính Ngọ -> Thái Tuế tại Ly (Ngọ), Tuế Phá tại Khảm (Tý), Tam Sát tại Khảm (cục Dần-Ngọ-Tuất).
    const result = calculateSuaChuaCaiTaoNhaRange({
      namSinh: 1990,
      renovationType: "ground_breaking",
      affectsStructure: true,
      digsGround: true,
      affectedCungList: ["Ly"],
      timeZone: "Asia/Ho_Chi_Minh",
      startDate: { year: 2026, month: 9, day: 1 },
      endDate: { year: 2026, month: 9, day: 3 },
    });
    expect(result.siteSafety.phamNghiemTrong).toBe(true);
    for (const t of result.xepHang) {
      expect(t.finalDiem).toBeLessThanOrEqual(3);
    }
  });

  it("chế độ chỉ xem giờ trả đủ 12 giờ cho 1 ngày cụ thể", () => {
    const result = calculateSuaChuaCaiTaoNhaMotNgay({
      ...INPUT_CHUNG,
      solarDate: { year: 2026, month: 9, day: 18 },
    });
    expect(result).toHaveLength(12);
  });

  it("2 chủ khác Can/Chi/Mệnh cho ra dayScore cá nhân khác nhau trên cùng 1 ngày/phương vị", () => {
    const a = calculateSuaChuaCaiTaoNhaMotNgay({ ...INPUT_CHUNG, namSinh: 1988, solarDate: { year: 2026, month: 9, day: 18 } });
    const b = calculateSuaChuaCaiTaoNhaMotNgay({ ...INPUT_CHUNG, namSinh: 1995, solarDate: { year: 2026, month: 9, day: 18 } });
    expect(a[0]!.dayScore.base.diem).toBe(b[0]!.dayScore.base.diem);
    expect(a[0]!.dayScore.canNhan.diem).not.toBe(b[0]!.dayScore.canNhan.diem);
  });

  it("ném lỗi khi khoảng ngày khác năm dương lịch", () => {
    expect(() =>
      calculateSuaChuaCaiTaoNhaRange({
        ...INPUT_CHUNG,
        startDate: { year: 2026, month: 12, day: 20 },
        endDate: { year: 2027, month: 1, day: 5 },
      }),
    ).toThrow();
  });

  it("ném lỗi khi khoảng ngày quá 31 ngày", () => {
    expect(() =>
      calculateSuaChuaCaiTaoNhaRange({
        ...INPUT_CHUNG,
        startDate: { year: 2026, month: 1, day: 1 },
        endDate: { year: 2026, month: 3, day: 1 },
      }),
    ).toThrow();
  });

  it("ném lỗi khi không chọn phương vị bị động nào", () => {
    expect(() =>
      calculateSuaChuaCaiTaoNhaMotNgay({
        ...INPUT_CHUNG,
        affectedCungList: [],
        solarDate: { year: 2026, month: 9, day: 1 },
      }),
    ).toThrow();
  });

  it("ném lỗi khi năm sinh không hợp lệ", () => {
    expect(() =>
      calculateSuaChuaCaiTaoNhaMotNgay({
        ...INPUT_CHUNG,
        namSinh: 1800,
        solarDate: { year: 2026, month: 9, day: 1 },
      }),
    ).toThrow();
  });
});
