import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { computeMonthGeneral } from "../../../src/month-general/compute.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { ChartInput } from "../../../src/types/chart.js";
import type { CalendarData } from "../../../src/types/calendar-data.js";
import { computeHeavenEarthPlate, heavenPlateAt } from "../../../src/heaven-earth-plate/compute.js";
import { HeavenEarthPlateError } from "../../../src/heaven-earth-plate/errors.js";
import { HEAVEN_EARTH_PLATE_PROVENANCE } from "../../../src/heaven-earth-plate/provenance.js";

/**
 * GOLDEN CASE (Test B) — tái dùng lá số ĐÃ VERIFIED ở Phase 5B-1/5B-2/8B: 2024-01-01 00:30
 * Asia/Shanghai (no-shift) => dayPillar=Giáp Tý, hourPillar.chi=Tý, monthGeneral.zhi=Sửu.
 * Expected 天盤/四課 cho ĐÚNG input này (monthGeneral=丑, hourChi=子) đã được XÁC MINH ĐỘC LẬP
 * bằng cách dò tay qua source code THẬT của repo B (`kentang2017/kinliuren`, commit `3ba45a9`,
 * hàm `sky_n_earth_list` dòng 189-192 — KHÔNG chạy code implementation mới của chính dự án này
 * để lấy giá trị kỳ vọng) — xem heaven-earth-plate/provenance.ts để biết chi tiết đối chiếu.
 * Địa Bàn cố định 0=Tý..11=Hợi; Thiên Bàn kỳ vọng (đặt Sửu tại vị trí Tý rồi xoay tự nhiên):
 *   Tý->Sửu, Sửu->Dần, Dần->Mão, Mão->Thìn, Thìn->Tỵ, Tỵ->Ngọ,
 *   Ngọ->Mùi, Mùi->Thân, Thân->Dậu, Dậu->Tuất, Tuất->Hợi, Hợi->Tý.
 */
const GOLDEN_INPUT: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };

function heavenEarthPlateForGoldenCase() {
  const calendarData = computeCalendarData(GOLDEN_INPUT, CLASSICAL_V1_PROFILE);
  const { monthGeneral } = computeMonthGeneral(calendarData);
  return { calendarData, monthGeneral, result: computeHeavenEarthPlate(monthGeneral, calendarData) };
}

describe("daliuren-engine/heaven-earth-plate/compute — computeHeavenEarthPlate", () => {
  describe("Test B — GOLDEN CASE (độc lập, xem provenance.ts)", () => {
    it("monthGeneral=Sửu, hourChi=Tý -> Thiên Bàn khớp CHÍNH XÁC kết quả dò tay từ repo B", () => {
      const { calendarData, monthGeneral, result } = heavenEarthPlateForGoldenCase();
      expect(monthGeneral.zhi).toBe("Sửu");
      expect(calendarData.hourPillar.chi).toBe("Tý");

      expect(result.heavenEarthPlate.earthPlate).toEqual(["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]);
      expect(result.heavenEarthPlate.heavenPlate).toEqual(["Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý"]);
    });

    it("heavenPlateAt tra đúng: vị trí Tý -> Sửu, vị trí Ngọ -> Mùi (giữa vòng)", () => {
      const { result } = heavenEarthPlateForGoldenCase();
      expect(heavenPlateAt(result.heavenEarthPlate, "Tý")).toBe("Sửu");
      expect(heavenPlateAt(result.heavenEarthPlate, "Ngọ")).toBe("Mùi");
    });
  });

  describe("Test F — DETERMINISM", () => {
    it("gọi nhiều lần cùng input cho kết quả hệt nhau", () => {
      const calendarData = computeCalendarData(GOLDEN_INPUT, CLASSICAL_V1_PROFILE);
      const { monthGeneral } = computeMonthGeneral(calendarData);
      const first = computeHeavenEarthPlate(monthGeneral, calendarData);
      const second = computeHeavenEarthPlate(monthGeneral, calendarData);
      expect(second).toEqual(first);
    });
  });

  describe("Test G — NO HIDDEN FALLBACK", () => {
    it("UNKNOWN_MONTH_GENERAL_ZHI: monthGeneral.zhi không hợp lệ -> throw, không đoán vị trí", () => {
      const calendarData = computeCalendarData(GOLDEN_INPUT, CLASSICAL_V1_PROFILE);
      const { monthGeneral } = computeMonthGeneral(calendarData);
      const malformed = { ...monthGeneral, zhi: "KhongTonTai" as typeof monthGeneral.zhi };
      try {
        computeHeavenEarthPlate(malformed, calendarData);
        expect.fail("Kỳ vọng ném HeavenEarthPlateError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(HeavenEarthPlateError);
        expect((error as HeavenEarthPlateError).code).toBe("UNKNOWN_MONTH_GENERAL_ZHI");
      }
    });

    it("UNKNOWN_HOUR_CHI: hourPillar.chi không hợp lệ -> throw, không đoán vị trí", () => {
      const calendarData = computeCalendarData(GOLDEN_INPUT, CLASSICAL_V1_PROFILE);
      const { monthGeneral } = computeMonthGeneral(calendarData);
      const malformed: CalendarData = { ...calendarData, hourPillar: { ...calendarData.hourPillar, chi: "KhongTonTai" as CalendarData["hourPillar"]["chi"] } };
      try {
        computeHeavenEarthPlate(monthGeneral, malformed);
        expect.fail("Kỳ vọng ném HeavenEarthPlateError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(HeavenEarthPlateError);
        expect((error as HeavenEarthPlateError).code).toBe("UNKNOWN_HOUR_CHI");
      }
    });

    it("heavenPlateAt: Chi tra cứu không hợp lệ -> throw UNKNOWN_EARTH_CHI", () => {
      const { result } = heavenEarthPlateForGoldenCase();
      try {
        heavenPlateAt(result.heavenEarthPlate, "KhongTonTai" as Parameters<typeof heavenPlateAt>[1]);
        expect.fail("Kỳ vọng ném HeavenEarthPlateError nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(HeavenEarthPlateError);
        expect((error as HeavenEarthPlateError).code).toBe("UNKNOWN_EARTH_CHI");
      }
    });
  });

  describe("PROVENANCE", () => {
    it("provenanceId trỏ đúng HEAVEN_EARTH_PLATE_PROVENANCE thật, confidence A", () => {
      const { result } = heavenEarthPlateForGoldenCase();
      expect(result.provenanceId).toBe(HEAVEN_EARTH_PLATE_PROVENANCE.id);
      expect(HEAVEN_EARTH_PLATE_PROVENANCE.confidence).toBe("A");
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("HeavenEarthPlateComputation JSON round-trip không mất dữ liệu", () => {
      const { result } = heavenEarthPlateForGoldenCase();
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });
});
