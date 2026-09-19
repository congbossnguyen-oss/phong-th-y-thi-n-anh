import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { computeMonthGeneral } from "../../../src/month-general/compute.js";
import { computeHeavenEarthPlate } from "../../../src/heaven-earth-plate/compute.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { ChartInput } from "../../../src/types/chart.js";
import type { CalendarData } from "../../../src/types/calendar-data.js";
import { computeFourLessons } from "../../../src/four-lessons/compute.js";
import { FourLessonsError } from "../../../src/four-lessons/errors.js";
import { FOUR_LESSONS_PROVENANCE } from "../../../src/four-lessons/provenance.js";

/**
 * GOLDEN CASE (Test D) — CÙNG lá số golden case với heaven-earth-plate/compute.test.ts:
 * 2024-01-01 00:30 Asia/Shanghai (no-shift) => dayCan=Giáp, dayChi=Tý, monthGeneral=Sửu,
 * hourChi=Tý. Expected 4 khóa cho ĐÚNG input này đã XÁC MINH ĐỘC LẬP bằng cách dò tay qua
 * source code THẬT của repo B (`kentang2017/kinliuren`, commit `3ba45a9`, hàm `all_sike` dòng
 * 199-205 — KHÔNG chạy code implementation mới của chính dự án này để lấy giá trị kỳ vọng):
 *   Khóa1 (一課) = upper:卯(Mão), lower:甲(Giáp)   — 寄宮(甲)=寅, Thiên Bàn tại 寅 = 卯.
 *   Khóa2 (二課) = upper:辰(Thìn), lower:卯(Mão)   — Thiên Bàn tại 卯 = 辰.
 *   Khóa3 (三課) = upper:丑(Sửu), lower:子(Tý)     — Thiên Bàn tại 子 (Chi Ngày) = 丑.
 *   Khóa4 (四課) = upper:寅(Dần), lower:丑(Sửu)    — Thiên Bàn tại 丑 = 寅.
 * Xem four-lessons/provenance.ts để biết chi tiết đối chiếu.
 */
const GOLDEN_INPUT: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };

function fourLessonsForGoldenCase() {
  const calendarData = computeCalendarData(GOLDEN_INPUT, CLASSICAL_V1_PROFILE);
  const { monthGeneral } = computeMonthGeneral(calendarData);
  const { heavenEarthPlate } = computeHeavenEarthPlate(monthGeneral, calendarData);
  return { calendarData, heavenEarthPlate, result: computeFourLessons(calendarData, heavenEarthPlate) };
}

describe("daliuren-engine/four-lessons/compute — computeFourLessons", () => {
  describe("Test D — GOLDEN CASE (độc lập, xem provenance.ts) + Test E — thứ tự 1->2->3->4", () => {
    it("dayCan=Giáp, dayChi=Tý -> 4 khóa khớp CHÍNH XÁC kết quả dò tay từ repo B, ĐÚNG thứ tự", () => {
      const { calendarData, result } = fourLessonsForGoldenCase();
      expect(calendarData.dayPillar.can).toBe("Giáp");
      expect(calendarData.dayPillar.chi).toBe("Tý");

      const { fourLessons } = result;
      expect(fourLessons.lesson1).toEqual({ upper: "Mão", lower: "Giáp" });
      expect(fourLessons.lesson2).toEqual({ upper: "Thìn", lower: "Mão" });
      expect(fourLessons.lesson3).toEqual({ upper: "Sửu", lower: "Tý" });
      expect(fourLessons.lesson4).toEqual({ upper: "Dần", lower: "Sửu" });

      // Test E — object key order tự thân đã cố định 1->2->3->4 ở type FourLessons (không có
      // mảng nào để "reverse" — nhưng vẫn kiểm tường minh key order để chặn regression nếu
      // sau này đổi cấu trúc sang mảng.
      expect(Object.keys(fourLessons)).toEqual(["lesson1", "lesson2", "lesson3", "lesson4"]);
    });
  });

  describe("Test F — DETERMINISM", () => {
    it("gọi nhiều lần cùng input cho kết quả hệt nhau", () => {
      const calendarData = computeCalendarData(GOLDEN_INPUT, CLASSICAL_V1_PROFILE);
      const { monthGeneral } = computeMonthGeneral(calendarData);
      const { heavenEarthPlate } = computeHeavenEarthPlate(monthGeneral, calendarData);
      const first = computeFourLessons(calendarData, heavenEarthPlate);
      const second = computeFourLessons(calendarData, heavenEarthPlate);
      expect(second).toEqual(first);
    });
  });

  describe("Test G — NO HIDDEN FALLBACK", () => {
    it("UNKNOWN_DAY_CAN: dayPillar.can không hợp lệ -> throw, không đoán cung ký thác", () => {
      const { calendarData, heavenEarthPlate } = fourLessonsForGoldenCase();
      const malformed: CalendarData = { ...calendarData, dayPillar: { ...calendarData.dayPillar, can: "KhongTonTai" as CalendarData["dayPillar"]["can"] } };
      try {
        computeFourLessons(malformed, heavenEarthPlate);
        expect.fail("Kỳ vọng ném FourLessonsError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(FourLessonsError);
        expect((error as FourLessonsError).code).toBe("UNKNOWN_DAY_CAN");
      }
    });

    it("Chi Ngày không hợp lệ -> lỗi lộ ra từ heavenPlateAt (HeavenEarthPlateError), KHÔNG bị nuốt/silent fallback", () => {
      const { calendarData, heavenEarthPlate } = fourLessonsForGoldenCase();
      const malformed: CalendarData = { ...calendarData, dayPillar: { ...calendarData.dayPillar, chi: "KhongTonTai" as CalendarData["dayPillar"]["chi"] } };
      expect(() => computeFourLessons(malformed, heavenEarthPlate)).toThrow();
    });
  });

  describe("PROVENANCE", () => {
    it("provenanceId trỏ đúng FOUR_LESSONS_PROVENANCE thật, confidence A", () => {
      const { result } = fourLessonsForGoldenCase();
      expect(result.provenanceId).toBe(FOUR_LESSONS_PROVENANCE.id);
      expect(FOUR_LESSONS_PROVENANCE.confidence).toBe("A");
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("FourLessonsComputation JSON round-trip không mất dữ liệu", () => {
      const { result } = fourLessonsForGoldenCase();
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });
});
