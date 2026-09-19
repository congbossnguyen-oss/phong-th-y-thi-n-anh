import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { CalculationProfile } from "../../../src/profiles/types.js";
import type { ChartInput } from "../../../src/types/chart.js";
import type { CalendarData } from "../../../src/types/calendar-data.js";
import { computeDayNight } from "../../../src/day-night/compute.js";
import { DayNightError } from "../../../src/day-night/errors.js";
import { DAY_NIGHT_BOUNDARY_PROVENANCE } from "../../../src/profiles/provenance-seed.js";

function dayNightFor(input: ChartInput, profile: CalculationProfile = CLASSICAL_V1_PROFILE) {
  return computeDayNight(computeCalendarData(input, profile));
}

describe("daliuren-engine/day-night/compute — computeDayNight", () => {
  describe("RULE-APPLICATION TEST — 晝/夜, theo đúng Algorithm Spec §3 (Mão->Thân=ngày, Dậu->Dần=đêm)", () => {
    it("giờ chiêm Chi=Ngọ (giữa khối 晝) -> day", () => {
      const { dayNight } = dayNightFor({ date: "2024-06-15", hour: 12, timeZone: "UTC" }); // hour=12 -> Ngọ
      expect(dayNight.value).toBe("day");
      expect(dayNight.method).toBe("occasion-hour-chi");
    });

    it("giờ chiêm Chi=Tý (giữa khối 夜) -> night", () => {
      const { dayNight } = dayNightFor({ date: "2024-06-15", hour: 0, timeZone: "UTC" }); // hour=0 -> Tý
      expect(dayNight.value).toBe("night");
    });
  });

  describe("BOUNDARY TEST — calendar-core cắt Chi giờ theo GIỜ NGUYÊN (phút bị bỏ qua hoàn toàn, xem calendar/ganzhi.ts hourChiIndex), nên ranh giới thật sự nằm ĐÚNG tại mốc giờ nguyên", () => {
    it("Dần(đêm)->Mão(ngày): 04:59 vẫn Dần/đêm, 05:00 đã Mão/ngày", () => {
      const before = dayNightFor({ date: "2024-06-15", hour: 4, minute: 59, timeZone: "UTC" });
      const atBoundary = dayNightFor({ date: "2024-06-15", hour: 5, minute: 0, timeZone: "UTC" });
      expect(before.dayNight.value).toBe("night");
      expect(atBoundary.dayNight.value).toBe("day");
    });

    it("phút KHÔNG ảnh hưởng Chi giờ trong cùng 1 giờ nguyên — 04:00 và 04:59 cho cùng kết quả (thuộc tính cơ chế calendar-core, không phải giả định)", () => {
      const early = dayNightFor({ date: "2024-06-15", hour: 4, minute: 0, timeZone: "UTC" });
      const late = dayNightFor({ date: "2024-06-15", hour: 4, minute: 59, timeZone: "UTC" });
      expect(early.dayNight.value).toBe(late.dayNight.value);
    });

    it("Thân(ngày)->Dậu(đêm): 16:59 vẫn Thân/ngày, 17:00 đã Dậu/đêm", () => {
      const before = dayNightFor({ date: "2024-06-15", hour: 16, minute: 59, timeZone: "UTC" });
      const atBoundary = dayNightFor({ date: "2024-06-15", hour: 17, minute: 0, timeZone: "UTC" });
      expect(before.dayNight.value).toBe("day");
      expect(atBoundary.dayNight.value).toBe("night");
    });
  });

  describe("TIMEZONE TEST", () => {
    it("cùng LOCAL HOUR, timezone khác nhau -> cùng dayNight (Chi giờ tính từ giờ dân sự local, không phải UTC)", () => {
      const shanghai = dayNightFor({ date: "2024-06-15", hour: 12, timeZone: "Asia/Shanghai" });
      const losAngeles = dayNightFor({ date: "2024-06-15", hour: 12, timeZone: "America/Los_Angeles" });
      expect(shanghai.dayNight).toEqual(losAngeles.dayNight);
    });

    it("cùng UTC instant, timezone khác nhau -> local hour khác nhau -> dayNight CÓ THỂ khác nhau", () => {
      // 2024-01-01T17:00:00Z: Asia/Shanghai (UTC+8) -> 2024-01-02 01:00 (Tý, đêm); America/Los_Angeles (UTC-8, không DST tháng 1) -> 2024-01-01 09:00 (Tỵ, ngày).
      const shanghai = dayNightFor({ date: "2024-01-02", hour: 1, timeZone: "Asia/Shanghai" });
      const losAngeles = dayNightFor({ date: "2024-01-01", hour: 9, timeZone: "America/Los_Angeles" });
      expect(shanghai.dayNight.value).toBe("night");
      expect(losAngeles.dayNight.value).toBe("day");
    });
  });

  describe("PROFILE — Day/Night KHÔNG phụ thuộc ziHourDayBoundary (Chi giờ chỉ tính từ giá trị hour, không phụ thuộc ngày nào đang cầm quyền)", () => {
    it("cùng input sát Tý, đổi ziHourDayBoundary -> dayNight KHÔNG đổi (luôn 'night' vì Chi giờ luôn là Tý)", () => {
      const input: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };
      const altProfile: CalculationProfile = {
        ...CLASSICAL_V1_PROFILE,
        ziHourDayBoundary: { ...CLASSICAL_V1_PROFILE.ziHourDayBoundary, value: "shift-both-halves" },
      };
      const withDefault = dayNightFor(input, CLASSICAL_V1_PROFILE);
      const withAlt = dayNightFor(input, altProfile);
      expect(withAlt.dayNight).toEqual(withDefault.dayNight);
    });
  });

  describe("PROVENANCE", () => {
    it("provenanceId trỏ đúng DAY_NIGHT_BOUNDARY_PROVENANCE thật (dùng chung với CalculationProfile.dayNightBoundary)", () => {
      const { provenanceId } = dayNightFor({ date: "2024-06-15", hour: 12, timeZone: "UTC" });
      expect(provenanceId).toBe(DAY_NIGHT_BOUNDARY_PROVENANCE.id);
      expect(DAY_NIGHT_BOUNDARY_PROVENANCE.confidence).toBe("B");
    });
  });

  describe("DETERMINISM", () => {
    it("gọi nhiều lần cùng CalendarData cho kết quả hệt nhau", () => {
      const calendarData = computeCalendarData({ date: "2024-06-15", hour: 14, minute: 22, timeZone: "Asia/Ho_Chi_Minh" }, CLASSICAL_V1_PROFILE);
      const first = computeDayNight(calendarData);
      const second = computeDayNight(calendarData);
      expect(second).toEqual(first);
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("DayNightComputation JSON round-trip không mất dữ liệu", () => {
      const calendarData = computeCalendarData({ date: "2024-06-15", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const result = computeDayNight(calendarData);
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });

  describe("NO HIDDEN FALLBACK", () => {
    it("INVALID_HOUR_CHI: hourPillar.chi không hợp lệ -> throw, không mặc định day/night", () => {
      const calendarData = computeCalendarData({ date: "2024-06-15", hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const malformed: CalendarData = {
        ...calendarData,
        hourPillar: { ...calendarData.hourPillar, chi: "KhongTonTai" as CalendarData["hourPillar"]["chi"] },
      };
      try {
        computeDayNight(malformed);
        expect.fail("Kỳ vọng ném DayNightError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(DayNightError);
        expect((error as DayNightError).code).toBe("INVALID_HOUR_CHI");
      }
    });
  });
});
