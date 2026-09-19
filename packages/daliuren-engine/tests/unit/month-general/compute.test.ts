import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { getSolarTermsWindow } from "../../../src/calendar/solar-terms.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { CalculationProfile } from "../../../src/profiles/types.js";
import type { ChartInput } from "../../../src/types/chart.js";
import type { CalendarData } from "../../../src/types/calendar-data.js";
import { computeMonthGeneral } from "../../../src/month-general/compute.js";
import { MonthGeneralError } from "../../../src/month-general/errors.js";
import { MONTH_GENERAL_TABLE_PROVENANCE } from "../../../src/month-general/provenance.js";

/** Helper: dựng CalendarData thật (qua pipeline Phase 5B-1) rồi suy Nguyệt Tướng. */
function monthGeneralFor(input: ChartInput, profile: CalculationProfile = CLASSICAL_V1_PROFILE) {
  const calendarData = computeCalendarData(input, profile);
  return computeMonthGeneral(calendarData);
}

describe("daliuren-engine/month-general/compute — computeMonthGeneral", () => {
  describe("PUBLIC ASTRONOMICAL REFERENCE — 1 case mỗi mùa, dùng ngày AN TOÀN giữa 2 trung khí (biên độ nhiều ngày, xa mọi mốc chuyển)", () => {
    // Ngày phân/chí (equinox/solstice) là SỰ KIỆN THIÊN VĂN CÔNG KHAI, sai số tối đa 1 ngày so
    // với mốc chính xác — biên độ an toàn dùng ở đây (~1-3 tuần) LỚN HƠN NHIỀU sai số đó.
    it("Xuân (sau Xuân Phân ~20/3, trước Cốc Vũ ~20/4): 2024-04-01 -> Tuất/hàKhôi", () => {
      const { monthGeneral } = monthGeneralFor({ date: "2024-04-01", hour: 12, timeZone: "UTC" });
      expect(monthGeneral.zhi).toBe("Tuất");
      expect(monthGeneral.classicalName).toBe("hàKhôi");
    });

    it("Hạ (sau Hạ Chí ~21/6, trước Đại Thử ~23/7): 2024-07-01 -> Mùi/tiểuCát", () => {
      const { monthGeneral } = monthGeneralFor({ date: "2024-07-01", hour: 12, timeZone: "UTC" });
      expect(monthGeneral.zhi).toBe("Mùi");
      expect(monthGeneral.classicalName).toBe("tiểuCát");
    });

    it("Thu (sau Thu Phân ~23/9, trước Sương Giáng ~23/10): 2024-10-01 -> Thìn/thiênCương", () => {
      const { monthGeneral } = monthGeneralFor({ date: "2024-10-01", hour: 12, timeZone: "UTC" });
      expect(monthGeneral.zhi).toBe("Thìn");
      expect(monthGeneral.classicalName).toBe("thiênCương");
    });

    it("Đông (sau Đông Chí 2023 ~22/12, trước Đại Hàn 2024 ~20/1): 2024-01-05 -> Sửu/đạiCát", () => {
      const { monthGeneral } = monthGeneralFor({ date: "2024-01-05", hour: 3, timeZone: "UTC" });
      expect(monthGeneral.zhi).toBe("Sửu");
      expect(monthGeneral.classicalName).toBe("đạiCát");
    });
  });

  describe("BOUNDARY TEST — sát mốc chuyển trung khí (Đông Chí 2023 ≈ 2023-12-22 03:25-03:27 UTC theo Phase 4, dung sai ±30 phút)", () => {
    it("NGAY TRƯỚC boundary (30 phút trước): vẫn là trung khí TRƯỚC (Tiểu Tuyết) -> Dần/côngTào", () => {
      const { monthGeneral, triggeringMajorTerm } = monthGeneralFor({
        date: "2023-12-22",
        hour: 2,
        minute: 55,
        timeZone: "UTC",
      });
      expect(triggeringMajorTerm.nameHan).toBe("小雪");
      expect(monthGeneral.zhi).toBe("Dần");
      expect(monthGeneral.classicalName).toBe("côngTào");
    });

    it("NGAY SAU boundary (30 phút sau): đã chuyển sang Đông Chí -> Sửu/đạiCát", () => {
      const { monthGeneral, triggeringMajorTerm } = monthGeneralFor({
        date: "2023-12-22",
        hour: 3,
        minute: 55,
        timeZone: "UTC",
      });
      expect(triggeringMajorTerm.nameHan).toBe("冬至");
      expect(monthGeneral.zhi).toBe("Sửu");
      expect(monthGeneral.classicalName).toBe("đạiCát");
    });

    it("MECHANICAL/PROPERTY TEST — ĐÚNG BOUNDARY: khi precedingMajorTerm = CHÍNH XÁC đối tượng mốc Đông Chí, dùng giá trị SAU khi chuyển (Algorithm Spec §2)", () => {
      // LƯU Ý KIẾN TRÚC: `computeMonthGeneral` KHÔNG tự làm phép so sánh biên (<=) — nó CHỈ
      // tra bảng từ `calendarData.precedingMajorTerm` đã có sẵn. Phép so sánh "TẠI ĐÚNG mốc
      // trung khí thì coi như đã chuyển" là trách nhiệm của calendar/solar-terms.ts
      // (`getPrecedingSolarTerm` dùng `<=`), ĐÃ test ở Phase 5B-1. Test này xác nhận hợp đồng
      // RIÊNG của Month General: nếu được đưa CHÍNH XÁC đối tượng mốc đã chuyển (không lệch
      // giây — `ChartInput` không có field giây nên KHÔNG dựng lại qua đó), nó tra đúng dòng
      // SAU, không lùi về dòng TRƯỚC (小雪).
      const dongChi2023 = getSolarTermsWindow(2023).find((t) => t.nameHan === "冬至" && t.occurredAt.startsWith("2023-12"));
      expect(dongChi2023).toBeDefined();

      const calendarData = computeCalendarData({ date: "2023-12-22", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const exactBoundary: CalendarData = { ...calendarData, precedingMajorTerm: dongChi2023! };

      const { monthGeneral, triggeringMajorTerm } = computeMonthGeneral(exactBoundary);
      expect(triggeringMajorTerm.nameHan).toBe("冬至"); // SAU khi chuyển, không phải 小雪 (trước)
      expect(monthGeneral.zhi).toBe("Sửu");
      expect(monthGeneral.classicalName).toBe("đạiCát");
    });
  });

  describe("YEAR CROSSING — không giả định calendar year = 月將 year (Phase 5B-2 mục 4)", () => {
    it("cuối năm dương lịch (2023-12-31 23:00 UTC, đã qua Đông Chí 2023) -> Sửu/đạiCát", () => {
      const { monthGeneral } = monthGeneralFor({ date: "2023-12-31", hour: 23, timeZone: "UTC" });
      expect(monthGeneral.zhi).toBe("Sửu");
      expect(monthGeneral.classicalName).toBe("đạiCát");
    });

    it("đầu năm dương lịch mới (2024-01-01 00:00 UTC) -> VẪN Sửu/đạiCát (trung khí quản lý là Đông Chí NĂM DƯƠNG LỊCH TRƯỚC, không phải năm hiện tại)", () => {
      const { monthGeneral, triggeringMajorTerm } = monthGeneralFor({ date: "2024-01-01", hour: 0, timeZone: "UTC" });
      expect(triggeringMajorTerm.occurredAt.startsWith("2023-12")).toBe(true); // regression: KHÔNG giả định calendar year = 月將 year
      expect(monthGeneral.zhi).toBe("Sửu");
      expect(monthGeneral.classicalName).toBe("đạiCát");
    });

    it("小寒 (Tiểu Hàn, LÀ TIẾT không phải trung khí) KHÔNG làm đổi Nguyệt Tướng — trước và sau Tiểu Hàn 2024 (~05/01 20:43 UTC) đều vẫn Sửu/đạiCát", () => {
      const before = monthGeneralFor({ date: "2024-01-05", hour: 18, timeZone: "UTC" });
      const after = monthGeneralFor({ date: "2024-01-06", hour: 2, timeZone: "UTC" });
      expect(before.monthGeneral.zhi).toBe("Sửu");
      expect(after.monthGeneral.zhi).toBe("Sửu");
      expect(before.triggeringMajorTerm.nameHan).toBe("冬至");
      expect(after.triggeringMajorTerm.nameHan).toBe("冬至");
    });

    it("大寒 (Đại Hàn, LÀ trung khí): trước ngày 15/1 (an toàn, còn Đông Chí quản) vs sau ngày 25/1 (an toàn, đã sang Đại Hàn) phải khác nhau", () => {
      const before = monthGeneralFor({ date: "2024-01-15", hour: 12, timeZone: "UTC" });
      const after = monthGeneralFor({ date: "2024-01-25", hour: 12, timeZone: "UTC" });
      expect(before.monthGeneral.zhi).toBe("Sửu");
      expect(after.monthGeneral.zhi).toBe("Tý");
      expect(after.monthGeneral.classicalName).toBe("thầnHậu");
    });

    it("立春 (Lập Xuân, LÀ TIẾT — ranh giới NĂM CAN CHI, không phải ranh giới trung khí): Nguyệt Tướng KHÔNG đổi qua mốc Lập Xuân dù trụ Năm đổi", () => {
      const beforeLapXuan = monthGeneralFor({ date: "2024-02-04", hour: 7, timeZone: "UTC" });
      const afterLapXuan = monthGeneralFor({ date: "2024-02-04", hour: 10, timeZone: "UTC" });
      // Cả 2 vẫn nằm giữa Đại Hàn (20/1) và Vũ Thủy (~19/2) -> cùng 1 Nguyệt Tướng, bất kể trụ Năm đổi phía nào.
      expect(beforeLapXuan.monthGeneral.zhi).toBe("Tý");
      expect(afterLapXuan.monthGeneral.zhi).toBe("Tý");
    });
  });

  describe("TIMEZONE TEST", () => {
    it("cùng LOCAL TIME, timezone khác nhau (UTC instant lệch 16h) trên 1 ngày AN TOÀN giữa mùa -> vẫn cùng 1 Nguyệt Tướng", () => {
      const shanghai = monthGeneralFor({ date: "2024-07-01", hour: 10, timeZone: "Asia/Shanghai" });
      const losAngeles = monthGeneralFor({ date: "2024-07-01", hour: 10, timeZone: "America/Los_Angeles" });
      expect(shanghai.monthGeneral).toEqual(losAngeles.monthGeneral);
    });

    it("cùng UTC INSTANT, timezone khác nhau (ngày dân sự khác nhau) -> vẫn cùng 1 Nguyệt Tướng (Nguyệt Tướng neo theo trung khí = UTC instant thật, không theo ngày dân sự)", () => {
      // 2 input này quy về CÙNG 1 UTC instant (2024-01-01T17:00:00Z) — xem
      // tests/unit/calendar/foundation.test.ts Scenario A (đã verify utcInstant khớp nhau ở đó).
      const shanghai = monthGeneralFor({ date: "2024-01-02", hour: 1, timeZone: "Asia/Shanghai" });
      const losAngeles = monthGeneralFor({ date: "2024-01-01", hour: 9, timeZone: "America/Los_Angeles" });
      expect(shanghai.monthGeneral).toEqual(losAngeles.monthGeneral);
      expect(shanghai.triggeringMajorTerm).toEqual(losAngeles.triggeringMajorTerm);
    });
  });

  describe("PROFILE — Month General KHÔNG phụ thuộc ziHourDayBoundary (không có dependency giả)", () => {
    it("cùng input, đổi ziHourDayBoundary sang 'shift-both-halves' (ảnh hưởng trụ Ngày/Giờ) -> Nguyệt Tướng KHÔNG đổi", () => {
      const input: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };
      const altProfile: CalculationProfile = {
        ...CLASSICAL_V1_PROFILE,
        ziHourDayBoundary: { ...CLASSICAL_V1_PROFILE.ziHourDayBoundary, value: "shift-both-halves" },
      };

      const withDefault = monthGeneralFor(input, CLASSICAL_V1_PROFILE);
      const withAlt = monthGeneralFor(input, altProfile);

      // Xác nhận 2 profile THẬT SỰ khác nhau ở trụ Ngày (Calendar Foundation, Phase 5B-1) —
      // nếu không, test này không chứng minh được gì.
      const calendarDefault = computeCalendarData(input, CLASSICAL_V1_PROFILE);
      const calendarAlt = computeCalendarData(input, altProfile);
      expect(calendarAlt.dayPillar.cycleIndex).not.toBe(calendarDefault.dayPillar.cycleIndex);

      expect(withAlt.monthGeneral).toEqual(withDefault.monthGeneral);
    });
  });

  describe("DETERMINISM — Scenario E (same instant, same profile -> same MonthGeneral)", () => {
    it("gọi nhiều lần cùng CalendarData cho kết quả hệt nhau", () => {
      const calendarData = computeCalendarData({ date: "2024-06-15", hour: 14, minute: 22, timeZone: "Asia/Ho_Chi_Minh" }, CLASSICAL_V1_PROFILE);
      const first = computeMonthGeneral(calendarData);
      const second = computeMonthGeneral(calendarData);
      const third = computeMonthGeneral(calendarData);
      expect(second).toEqual(first);
      expect(third).toEqual(first);
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("MonthGeneralComputation JSON round-trip không mất dữ liệu", () => {
      const calendarData = computeCalendarData({ date: "2024-07-01", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const result = computeMonthGeneral(calendarData);
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });

  describe("PROVENANCE", () => {
    it("provenanceId trỏ đúng tới MONTH_GENERAL_TABLE_PROVENANCE thật (không phải chuỗi rời rạc)", () => {
      const calendarData = computeCalendarData({ date: "2024-07-01", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const result = computeMonthGeneral(calendarData);
      expect(result.provenanceId).toBe(MONTH_GENERAL_TABLE_PROVENANCE.id);
      expect(MONTH_GENERAL_TABLE_PROVENANCE.confidence).toBe("B");
    });
  });

  describe("NO HIDDEN FALLBACK — lỗi tường minh, không đoán giá trị", () => {
    it("INVALID_PRECEDING_TERM: precedingMajorTerm.kind = 'tiet' (không phải trung khí) -> throw, không tự chọn Nguyệt Tướng gần đúng", () => {
      const calendarData = computeCalendarData({ date: "2024-07-01", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const malformed: CalendarData = {
        ...calendarData,
        precedingMajorTerm: { ...calendarData.precedingMajorTerm, kind: "tiet" },
      };
      try {
        computeMonthGeneral(malformed);
        expect.fail("Kỳ vọng ném MonthGeneralError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(MonthGeneralError);
        expect((error as MonthGeneralError).code).toBe("INVALID_PRECEDING_TERM");
      }
    });

    it("UNKNOWN_MAJOR_TERM: nameHan không có trong bảng 12 -> throw, không fallback", () => {
      const calendarData = computeCalendarData({ date: "2024-07-01", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const malformed: CalendarData = {
        ...calendarData,
        precedingMajorTerm: { ...calendarData.precedingMajorTerm, nameHan: "不存在" },
      };
      try {
        computeMonthGeneral(malformed);
        expect.fail("Kỳ vọng ném MonthGeneralError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(MonthGeneralError);
        expect((error as MonthGeneralError).code).toBe("UNKNOWN_MAJOR_TERM");
      }
    });
  });
});
