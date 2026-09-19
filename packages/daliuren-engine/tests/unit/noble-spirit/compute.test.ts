import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { computeMonthGeneral } from "../../../src/month-general/compute.js";
import { computeDayNight } from "../../../src/day-night/compute.js";
import { computeGuiRenPair, computeNobleSpirit, resolveGuiRenForDayNight } from "../../../src/noble-spirit/compute.js";
import { NobleSpiritError } from "../../../src/noble-spirit/errors.js";
import { GUI_REN_TRADITIONAL_TABLE } from "../../../src/noble-spirit/table.js";
import { GUI_REN_PAIR_PROVENANCE, GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE } from "../../../src/noble-spirit/provenance.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { CalculationProfile } from "../../../src/profiles/types.js";
import type { ChartInput } from "../../../src/types/chart.js";
import type { Chi } from "../../../src/types/ganzhi.js";

/** 10 ngày liên tiếp 2024-01-01..10 quét đủ 10 Can (2024-01-01 = Giáp Tý, CLASSICAL/PUBLIC FACT — xem Phase 5B-1/5B-2) theo đúng vòng lặp 10-Can cơ học, không cần hard-code Can nào ứng ngày nào — đọc trực tiếp từ calendarData đã dựng. */
const TEN_CONSECUTIVE_DAYS: readonly string[] = [
  "2024-01-01",
  "2024-01-02",
  "2024-01-03",
  "2024-01-04",
  "2024-01-05",
  "2024-01-06",
  "2024-01-07",
  "2024-01-08",
  "2024-01-09",
  "2024-01-10",
];

describe("daliuren-engine/noble-spirit/compute", () => {
  describe("(A) computeGuiRenPair — mỗi nhóm Can cần thiết cho 貴人 (golden case: đối chiếu bảng đã duyệt)", () => {
    it.each(TEN_CONSECUTIVE_DAYS)("ngày %s: pair khớp GUI_REN_TRADITIONAL_TABLE[dayCan] + đúng 2 provenanceId", (date) => {
      const calendarData = computeCalendarData({ date, hour: 12, timeZone: "UTC" }, CLASSICAL_V1_PROFILE);
      const dayCan = calendarData.dayPillar.can;
      const { pair, pairProvenanceId, dayNightAssignmentProvenanceId } = computeGuiRenPair(dayCan, CLASSICAL_V1_PROFILE);

      expect(pair).toEqual(GUI_REN_TRADITIONAL_TABLE[dayCan]);
      expect(pairProvenanceId).toBe(GUI_REN_PAIR_PROVENANCE.id);
      expect(dayNightAssignmentProvenanceId).toBe(GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE.id);
    });

    it("UNSUPPORTED_MAPPING_TABLE: 'guopo-kangxi' chưa có giá trị xác minh -> throw, không tự bịa bảng hay fallback sang 'traditional'", () => {
      const altProfile: CalculationProfile = {
        ...CLASSICAL_V1_PROFILE,
        guiRenMappingTable: { ...CLASSICAL_V1_PROFILE.guiRenMappingTable, value: "guopo-kangxi" },
      };
      try {
        computeGuiRenPair("Giáp", altProfile);
        expect.fail("Kỳ vọng ném NobleSpiritError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(NobleSpiritError);
        expect((error as NobleSpiritError).code).toBe("UNSUPPORTED_MAPPING_TABLE");
      }
    });
  });

  describe("(B) resolveGuiRenForDayNight — thuần selection, không có bảng/nguồn riêng", () => {
    it("chọn .day khi dayOrNight='day', .night khi 'night'", () => {
      const pair = { day: "Mùi" as Chi, night: "Sửu" as Chi };
      expect(resolveGuiRenForDayNight(pair, "day")).toBe("Mùi");
      expect(resolveGuiRenForDayNight(pair, "night")).toBe("Sửu");
    });
  });

  describe("Compose (A)+(B) qua computeNobleSpirit — cùng 1 Can, khác 晝/夜 -> khác zhi", () => {
    it("Can=Giáp, day -> Sửu; Can=Giáp, night -> Mùi (ĐÃ SỬA Phase 5B-3R — xem docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md)", () => {
      const dayResult = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const nightResult = computeNobleSpirit("Giáp", "night", CLASSICAL_V1_PROFILE);
      expect(dayResult.nobleSpirit.zhi).toBe("Sửu");
      expect(nightResult.nobleSpirit.zhi).toBe("Mùi");
      expect(dayResult.nobleSpirit.mappingTable).toBe("traditional");
    });
  });

  describe("PROFILE TEST — ziHourDayBoundary ảnh hưởng THẬT tới Noble Spirit (qua dayPillar.can, không phải dependency giả)", () => {
    it("2023-12-31 23:30: 'no-shift' -> dayCan=Quý (Quý Hợi) -> Quý Nhân khác với 'shift-both-halves' -> dayCan=Giáp (Giáp Tý)", () => {
      const input: ChartInput = { date: "2023-12-31", hour: 23, minute: 30, timeZone: "Asia/Shanghai" };
      const altProfile: CalculationProfile = {
        ...CLASSICAL_V1_PROFILE,
        ziHourDayBoundary: { ...CLASSICAL_V1_PROFILE.ziHourDayBoundary, value: "shift-both-halves" },
      };

      const noShiftCalendar = computeCalendarData(input, CLASSICAL_V1_PROFILE);
      const shiftedCalendar = computeCalendarData(input, altProfile);
      expect(noShiftCalendar.dayPillar.can).toBe("Quý");
      expect(shiftedCalendar.dayPillar.can).toBe("Giáp");

      const noShiftDayNight = computeDayNight(noShiftCalendar);
      const shiftedDayNight = computeDayNight(shiftedCalendar);
      // Chi giờ (23h -> Tý) không đổi giữa 2 profile (xem day-night/compute.test.ts) -> cả 2 đều 'night'.
      expect(noShiftDayNight.dayNight.value).toBe("night");
      expect(shiftedDayNight.dayNight.value).toBe("night");

      const noShiftResult = computeNobleSpirit(noShiftCalendar.dayPillar.can, noShiftDayNight.dayNight.value, CLASSICAL_V1_PROFILE);
      const shiftedResult = computeNobleSpirit(shiftedCalendar.dayPillar.can, shiftedDayNight.dayNight.value, altProfile);

      expect(noShiftResult.nobleSpirit.zhi).toBe("Mão"); // Quý, night
      expect(shiftedResult.nobleSpirit.zhi).toBe("Mùi"); // Giáp, night (ĐÃ SỬA Phase 5B-3R)
      expect(noShiftResult.nobleSpirit.zhi).not.toBe(shiftedResult.nobleSpirit.zhi);
    });
  });

  describe("COMBINED TEST — CalendarData -> 月將 + 晝夜 + 貴人 (Phase 5B-3 mục 12): 3 tầng không làm thay đổi lẫn nhau", () => {
    it("tính cả 3 từ CÙNG 1 calendarData, nhiều lần, cho kết quả hệt nhau mỗi lần và không phụ thuộc thứ tự gọi", () => {
      const calendarData = computeCalendarData({ date: "2024-06-15", hour: 14, minute: 22, timeZone: "Asia/Ho_Chi_Minh" }, CLASSICAL_V1_PROFILE);

      // Thứ tự A: 月將 trước, rồi 晝夜, rồi 貴人.
      const monthGeneralA = computeMonthGeneral(calendarData);
      const dayNightA = computeDayNight(calendarData);
      const nobleSpiritA = computeNobleSpirit(calendarData.dayPillar.can, dayNightA.dayNight.value, CLASSICAL_V1_PROFILE);

      // Thứ tự B: 貴人 trước (qua 晝夜 trước), rồi 月將 sau cùng — calendarData KHÔNG bị mutate bởi bất kỳ hàm nào ở trên.
      const dayNightB = computeDayNight(calendarData);
      const nobleSpiritB = computeNobleSpirit(calendarData.dayPillar.can, dayNightB.dayNight.value, CLASSICAL_V1_PROFILE);
      const monthGeneralB = computeMonthGeneral(calendarData);

      expect(monthGeneralB).toEqual(monthGeneralA);
      expect(dayNightB).toEqual(dayNightA);
      expect(nobleSpiritB).toEqual(nobleSpiritA);

      // calendarData bản thân không bị 3 hàm trên làm thay đổi (đối chiếu lại 1 lần build độc lập).
      const freshCalendarData = computeCalendarData({ date: "2024-06-15", hour: 14, minute: 22, timeZone: "Asia/Ho_Chi_Minh" }, CLASSICAL_V1_PROFILE);
      expect(calendarData).toEqual(freshCalendarData);
    });
  });

  describe("DETERMINISM", () => {
    it("gọi computeNobleSpirit nhiều lần cùng input cho kết quả hệt nhau", () => {
      const first = computeNobleSpirit("Bính", "day", CLASSICAL_V1_PROFILE);
      const second = computeNobleSpirit("Bính", "day", CLASSICAL_V1_PROFILE);
      expect(second).toEqual(first);
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("NobleSpiritComputation JSON round-trip không mất dữ liệu", () => {
      const result = computeNobleSpirit("Đinh", "night", CLASSICAL_V1_PROFILE);
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });

  describe("NO HIDDEN FALLBACK", () => {
    it("UNKNOWN_DAY_CAN: Can không hợp lệ -> throw, không tự chọn Quý Nhân gần đúng", () => {
      try {
        computeGuiRenPair("KhongTonTai" as Parameters<typeof computeGuiRenPair>[0], CLASSICAL_V1_PROFILE);
        expect.fail("Kỳ vọng ném NobleSpiritError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(NobleSpiritError);
        expect((error as NobleSpiritError).code).toBe("UNKNOWN_DAY_CAN");
      }
    });
  });
});
