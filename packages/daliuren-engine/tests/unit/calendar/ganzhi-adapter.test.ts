import { describe, expect, it } from "vitest";
import type { DateTimeInput } from "@thien-anh/calendar-core";
import { computeGanzhiPillars } from "../../../src/calendar/ganzhi-adapter.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { CalculationProfile } from "../../../src/profiles/types.js";

/**
 * Golden Cases — theo Golden Case Principle (Phase 5B-1): KHÔNG expected nào ở file này được
 * tạo bằng cách chạy chính implementation rồi lấy output làm expected. Mỗi case ghi rõ NGUỒN
 * ĐỘC LẬP + loại bằng chứng.
 */

/** Profile test-local (KHÔNG export, KHÔNG phải 1 "school" mới của package) — chỉ dùng để chứng minh CalculationProfile thật sự đổi được kết quả (Phase 5B-1 mục "Early/Late Zi"). */
function withZiPolicy(policy: CalculationProfile["ziHourDayBoundary"]["value"]): CalculationProfile {
  return {
    ...CLASSICAL_V1_PROFILE,
    ziHourDayBoundary: { ...CLASSICAL_V1_PROFILE.ziHourDayBoundary, value: policy },
  };
}

describe("daliuren-engine/calendar/ganzhi-adapter — computeGanzhiPillars", () => {
  describe("Golden Case CB-3 — CLASSICAL/PUBLIC FACT (bảng tra Can Chi phổ biến, almanac)", () => {
    // Nguồn: docs/daliuren/DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md §2c, §3 (CB-3) — đối chiếu
    // bảng tra Can Chi phổ biến cho 01/01/2000, KHÔNG phải suy ra từ chạy chính engine này.
    const input: DateTimeInput = { year: 2000, month: 1, day: 1, hour: 0, timeZone: "Asia/Shanghai" };

    it("2000-01-01 00:00 giờ Bắc Kinh: Năm Kỷ Mão, Tháng Bính Tý, Ngày Mậu Ngọ", () => {
      const pillars = computeGanzhiPillars(input, CLASSICAL_V1_PROFILE);
      expect(pillars.yearPillar.can).toBe("Kỷ");
      expect(pillars.yearPillar.chi).toBe("Mão");
      expect(pillars.monthPillar.can).toBe("Bính");
      expect(pillars.monthPillar.chi).toBe("Tý");
      expect(pillars.dayPillar.can).toBe("Mậu");
      expect(pillars.dayPillar.chi).toBe("Ngọ");
    });
  });

  describe("Golden Case CB-4 — CLASSICAL/PUBLIC FACT (sự kiện lan truyền công khai, không phải nguồn nội bộ)", () => {
    // Nguồn: docs/daliuren/DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md §2c, §3 (CB-4) — "ngày đầu
    // năm dương lịch 2024 đúng vào ngày Giáp Tý" lan truyền rộng trên MXH Trung Quốc đầu 2024.
    it("2024-01-01 00:00 giờ Bắc Kinh: Ngày Giáp Tý", () => {
      const input: DateTimeInput = { year: 2024, month: 1, day: 1, hour: 0, timeZone: "Asia/Shanghai" };
      const pillars = computeGanzhiPillars(input, CLASSICAL_V1_PROFILE);
      expect(pillars.dayPillar.can).toBe("Giáp");
      expect(pillars.dayPillar.chi).toBe("Tý");
    });
  });

  describe("MATHEMATICAL TEST — neo vào CB-4 (Giáp Tý) + phép cộng/trừ 1 ngày trong vòng Lục Thập Hoa Giáp (định nghĩa, không phụ thuộc implementation)", () => {
    // Vòng 60 Giáp Tý: mỗi ngày kế tiếp tăng CẢ Can (mod 10) LẪN Chi (mod 12) thêm 1 — đây là
    // ĐỊNH NGHĨA toán học của hệ Can Chi (SGK/almanac bất kỳ), không phải kết quả suy ra từ
    // package này. Giáp Tý (Can#0,Chi#0) → hôm sau Ất Sửu (Can#1,Chi#1) → hôm trước Quý Hợi
    // (Can#9,Chi#11).
    const NOON = { hour: 12 } as const; // giờ bất kỳ giữa ngày, không dính khung Tý, dùng để dựng "trụ Ngày của 1 ngày dân sự" làm mốc đối chiếu độc lập với mọi policy Tý.

    it("2024-01-02 (hôm sau Giáp Tý) = Ất Sửu", () => {
      const input: DateTimeInput = { year: 2024, month: 1, day: 2, ...NOON, timeZone: "Asia/Shanghai" };
      const pillars = computeGanzhiPillars(input, CLASSICAL_V1_PROFILE);
      expect(pillars.dayPillar.can).toBe("Ất");
      expect(pillars.dayPillar.chi).toBe("Sửu");
    });

    it("2023-12-31 (hôm trước Giáp Tý) = Quý Hợi", () => {
      const input: DateTimeInput = { year: 2023, month: 12, day: 31, ...NOON, timeZone: "Asia/Shanghai" };
      const pillars = computeGanzhiPillars(input, CLASSICAL_V1_PROFILE);
      expect(pillars.dayPillar.can).toBe("Quý");
      expect(pillars.dayPillar.chi).toBe("Hợi");
    });
  });

  describe("PROFILE TEST — Scenario E (early Zi, 00:00-00:59): cùng input, khác CalculationProfile.ziHourDayBoundary → có thể khác trụ Ngày", () => {
    const input: DateTimeInput = { year: 2024, month: 1, day: 1, hour: 0, minute: 30, timeZone: "Asia/Shanghai" };

    it("'no-shift' (profile mặc định classical-v1): trụ Ngày = Giáp Tý (khớp CB-4 trực tiếp, không dịch chuyển gì)", () => {
      const pillars = computeGanzhiPillars(input, withZiPolicy("no-shift"));
      expect(pillars.dayPillar.can).toBe("Giáp");
      expect(pillars.dayPillar.chi).toBe("Tý");
    });

    it("'shift-both-halves': nửa Tý sớm (00:30) thuộc ngày KẾ TIẾP → trụ Ngày = Ất Sửu (2024-01-02, theo phép cộng 60-Giáp-Tý ở trên)", () => {
      const pillars = computeGanzhiPillars(input, withZiPolicy("shift-both-halves"));
      expect(pillars.dayPillar.can).toBe("Ất");
      expect(pillars.dayPillar.chi).toBe("Sửu");
    });

    it("'shift-late-half-only': nửa Tý sớm KHÔNG dịch (chỉ nửa muộn 23h mới dịch) → trụ Ngày vẫn = Giáp Tý", () => {
      const pillars = computeGanzhiPillars(input, withZiPolicy("shift-late-half-only"));
      expect(pillars.dayPillar.can).toBe("Giáp");
      expect(pillars.dayPillar.chi).toBe("Tý");
    });

    it("3 profile trên KHÔNG cho cùng 1 kết quả hệt nhau (chứng minh CalculationProfile thật sự ảnh hưởng output)", () => {
      const noShift = computeGanzhiPillars(input, withZiPolicy("no-shift")).dayPillar;
      const bothHalves = computeGanzhiPillars(input, withZiPolicy("shift-both-halves")).dayPillar;
      const lateOnly = computeGanzhiPillars(input, withZiPolicy("shift-late-half-only")).dayPillar;
      expect([noShift.cycleIndex, bothHalves.cycleIndex, lateOnly.cycleIndex]).not.toEqual([
        noShift.cycleIndex,
        noShift.cycleIndex,
        noShift.cycleIndex,
      ]);
    });
  });

  describe("PROFILE TEST — Scenario F (late Zi, 23:00-23:59): cả 'shift-both-halves' lẫn 'shift-late-half-only' đều dịch, 'no-shift' thì không", () => {
    const input: DateTimeInput = { year: 2023, month: 12, day: 31, hour: 23, minute: 30, timeZone: "Asia/Shanghai" };

    it("'no-shift': trụ Ngày = Quý Hợi (2023-12-31, không dịch)", () => {
      const pillars = computeGanzhiPillars(input, withZiPolicy("no-shift"));
      expect(pillars.dayPillar.can).toBe("Quý");
      expect(pillars.dayPillar.chi).toBe("Hợi");
    });

    it("'shift-both-halves': trụ Ngày = Giáp Tý (dịch sang 2024-01-01, khớp CB-4)", () => {
      const pillars = computeGanzhiPillars(input, withZiPolicy("shift-both-halves"));
      expect(pillars.dayPillar.can).toBe("Giáp");
      expect(pillars.dayPillar.chi).toBe("Tý");
    });

    it("'shift-late-half-only': trụ Ngày = Giáp Tý (dịch sang 2024-01-01, khớp CB-4)", () => {
      const pillars = computeGanzhiPillars(input, withZiPolicy("shift-late-half-only"));
      expect(pillars.dayPillar.can).toBe("Giáp");
      expect(pillars.dayPillar.chi).toBe("Tý");
    });
  });

  describe("SYNTHETIC MECHANICAL TEST — trụ Năm/Tháng KHÔNG bị ảnh hưởng bởi ziHourDayBoundary (chỉ trụ Ngày/Giờ mới liên quan ranh giới Tý)", () => {
    it("trụ Năm và Tháng giống hệt nhau giữa 'no-shift' và 'shift-both-halves' dù trụ Ngày khác nhau", () => {
      const input: DateTimeInput = { year: 2024, month: 1, day: 1, hour: 0, minute: 30, timeZone: "Asia/Shanghai" };
      const noShift = computeGanzhiPillars(input, withZiPolicy("no-shift"));
      const bothHalves = computeGanzhiPillars(input, withZiPolicy("shift-both-halves"));
      expect(bothHalves.yearPillar.cycleIndex).toBe(noShift.yearPillar.cycleIndex);
      expect(bothHalves.monthPillar.cycleIndex).toBe(noShift.monthPillar.cycleIndex);
      expect(bothHalves.dayPillar.cycleIndex).not.toBe(noShift.dayPillar.cycleIndex);
    });
  });

  describe("UNSUPPORTED_ZI_HOUR_POLICY — bảo vệ khỏi giá trị policy không hợp lệ lọt qua type system (dữ liệu JSON ngoài kiểm soát)", () => {
    it("ném lỗi tường minh thay vì âm thầm fallback", () => {
      const input: DateTimeInput = { year: 2024, month: 1, day: 1, hour: 0, timeZone: "Asia/Shanghai" };
      const brokenProfile = withZiPolicy("some-unknown-policy" as CalculationProfile["ziHourDayBoundary"]["value"]);
      expect(() => computeGanzhiPillars(input, brokenProfile)).toThrowError(/không được hỗ trợ/);
    });
  });
});
