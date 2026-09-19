import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { computeHeavenEarthPlate } from "../../../src/heaven-earth-plate/compute.js";
import { computeFourLessons } from "../../../src/four-lessons/compute.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { CalendarData } from "../../../src/types/calendar-data.js";
import type { MonthGeneral } from "../../../src/types/month-general.js";
import type { Can, Chi } from "../../../src/types/ganzhi.js";
import { computeThreeTransmissions } from "../../../src/three-transmissions/compute.js";
import { THREE_TRANSMISSIONS_CHAIN_PROVENANCE } from "../../../src/three-transmissions/provenance.js";
import { NineMethodsError } from "../../../src/nine-methods/errors.js";

/** Cùng golden cases với tests/unit/nine-methods/compute.test.ts — xem file đó cho nguồn xác minh độc lập đầy đủ (repo A, dò tay + chạy thật). */
const TEMPLATE_CALENDAR = computeCalendarData({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);

function calendarWith(dayCan: Can, dayChi: Chi, hourChi: Chi): CalendarData {
  return {
    ...TEMPLATE_CALENDAR,
    dayPillar: { ...TEMPLATE_CALENDAR.dayPillar, can: dayCan, chi: dayChi },
    hourPillar: { ...TEMPLATE_CALENDAR.hourPillar, chi: hourChi },
  };
}

const MONTH_GENERAL_SUU: MonthGeneral = { zhi: "Sửu", classicalName: "đạiCát" };

function threeTransmissionsFor(monthGeneral: MonthGeneral, dayCan: Can, dayChi: Chi, hourChi: Chi) {
  const calendarData = calendarWith(dayCan, dayChi, hourChi);
  const { heavenEarthPlate } = computeHeavenEarthPlate(monthGeneral, calendarData);
  const { fourLessons } = computeFourLessons(calendarData, heavenEarthPlate);
  return computeThreeTransmissions(fourLessons, heavenEarthPlate, dayCan);
}

describe("daliuren-engine/three-transmissions/compute — computeThreeTransmissions", () => {
  describe("Test F — 三傳 CORE (chuỗi tra heavenPlateAt 2 lần) — golden case tái dùng Test A của nine-methods (賊克, monthGeneral=Sửu hourChi=Tý dayCan=Giáp dayChi=Tý)", () => {
    it("initial/middle/final khớp CHÍNH XÁC output thật của repo A: (Thìn, Tỵ, Ngọ)", () => {
      const result = threeTransmissionsFor(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      expect(result.threeTransmissions.method).toBe("zeike");
      expect(result.threeTransmissions.initial).toBe("Thìn");
      expect(result.threeTransmissions.middle).toBe("Tỵ");
      expect(result.threeTransmissions.final).toBe("Ngọ");
    });

    it("provenance: initialProvenanceId theo pháp đã chọn, chainProvenanceId luôn CONFIDENCE A", () => {
      const result = threeTransmissionsFor(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      expect(result.chainProvenanceId).toBe(THREE_TRANSMISSIONS_CHAIN_PROVENANCE.id);
      expect(THREE_TRANSMISSIONS_CHAIN_PROVENANCE.confidence).toBe("A");
      expect(result.initialProvenanceId).toEqual(expect.any(String));
    });
  });

  describe("Test P (Phase 9C) — TYPE B (別責, tái dùng golden case Dương của nine-methods: monthGeneral=Tý hourChi=Hợi dayCan=Bính dayChi=Thìn)", () => {
    it("middle/final LẤY THẲNG từ nine-methods (không tự tra `heavenPlateAt` lại), chainProvenanceId VẮNG MẶT (không tự nhận vơ cơ chế chain không được dùng)", () => {
      const MONTH_GENERAL_TY: MonthGeneral = { zhi: "Tý", classicalName: "thầnHậu" };
      const result = threeTransmissionsFor(MONTH_GENERAL_TY, "Bính", "Thìn", "Hợi");

      expect(result.threeTransmissions.method).toBe("bieze");
      expect(result.threeTransmissions.initial).toBe("Hợi");
      expect(result.threeTransmissions.middle).toBe("Ngọ");
      expect(result.threeTransmissions.final).toBe("Ngọ");
      expect(result.chainProvenanceId).toBeUndefined();
      expect(result.initialProvenanceId).toEqual(expect.any(String));
    });
  });

  describe("Test H — nhánh chưa đủ evidence PHẢI ném lỗi, KHÔNG trả `ThreeTransmissions` giả (伏吟, monthGeneral=Tý hourChi=Tý dayCan=Giáp dayChi=Tý)", () => {
    it("throw NineMethodsError nguyên trạng (KHÔNG bị nuốt/bọc lại), KHÔNG trả object rỗng/giả", () => {
      const MONTH_GENERAL_TY: MonthGeneral = { zhi: "Tý", classicalName: "thầnHậu" };
      try {
        threeTransmissionsFor(MONTH_GENERAL_TY, "Giáp", "Tý", "Tý");
        expect.fail("Kỳ vọng ném lỗi nhưng không có lỗi nào.");
      } catch (error) {
        expect(error).toBeInstanceOf(NineMethodsError);
        expect((error as NineMethodsError).code).toBe("INSUFFICIENT_EVIDENCE_FUYIN_SELECTION");
      }
    });
  });

  describe("DETERMINISM", () => {
    it("gọi nhiều lần cùng input cho kết quả hệt nhau", () => {
      const first = threeTransmissionsFor(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      const second = threeTransmissionsFor(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      expect(second).toEqual(first);
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("ThreeTransmissionsComputation JSON round-trip không mất dữ liệu", () => {
      const result = threeTransmissionsFor(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });

  describe("CROSS-CONTAMINATION GUARD", () => {
    it("methodSubcase (nếu có) KHÔNG được chứa khung 'beginning/process/result' hay '動心起念'", () => {
      const result = threeTransmissionsFor(MONTH_GENERAL_SUU, "Giáp", "Tý", "Tý");
      const subcase = result.threeTransmissions.methodSubcase ?? "";
      expect(subcase).not.toMatch(/beginning|process|result|動心起念/i);
    });
  });
});
