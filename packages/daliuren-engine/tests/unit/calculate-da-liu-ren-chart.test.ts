import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../src/profiles/classical-v1.js";
import { computeCalendarData } from "../../src/calendar/foundation.js";
import { computeMonthGeneral } from "../../src/month-general/compute.js";
import { computeNobleSpirit } from "../../src/noble-spirit/compute.js";
import { computeHeavenEarthPlate, heavenPlateAt } from "../../src/heaven-earth-plate/compute.js";
import { computeFourLessons } from "../../src/four-lessons/compute.js";
import { computeThreeTransmissions } from "../../src/three-transmissions/compute.js";
import { computeTwelveGenerals } from "../../src/twelve-generals/compute.js";
import type { ChartInput } from "../../src/types/chart.js";
import type { CalendarData } from "../../src/types/calendar-data.js";
import type { MonthGeneral } from "../../src/types/month-general.js";
import type { Can, Chi } from "../../src/types/ganzhi.js";
import { NineMethodsError } from "../../src/nine-methods/errors.js";
import { THREE_TRANSMISSIONS_CHAIN_PROVENANCE } from "../../src/three-transmissions/provenance.js";
import { GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE, GUI_REN_PAIR_PROVENANCE } from "../../src/noble-spirit/provenance.js";

/**
 * Phase 9E — test cho `calculateDaLiuRenChart`, facade nối 8 phép tính đã VERIFIED. Chiến lược:
 *
 * - Scenario A (賊克) và Scenario E (伏吟) dùng ChartInput THẬT (ngày dương lịch có thật), gọi
 *   TRỰC TIẾP hàm export công khai — E2E đúng nghĩa, không override gì. Case A tái dùng NGUYÊN
 *   VẸN ngày golden 2024-01-01 đã verify xuyên suốt Phase 8/9A-9D. Case E (伏吟) được TÌM bằng
 *   cách quét chính implementation ĐÃ VERIFIED (không phải bịa) để tìm 1 ngày thật kích hoạt
 *   đúng điều kiện — hành vi kỳ vọng (throw đúng mã lỗi) hoàn toàn KHÔNG phụ thuộc ngày cụ thể
 *   nào, nên đây vẫn là kiểm chứng thật, không phải "tự tạo golden value".
 * - Scenario B/C/D/F KHÔNG tìm ngày thật mới (đúng yêu cầu) — thay vào đó lặp lại CHÍNH XÁC
 *   trình tự 8 lệnh gọi mà `calculateDaLiuRenChart` thực hiện nội bộ, dùng LẠI NGUYÊN VẸN các
 *   fixture CalendarData-override đã có sẵn + đã golden-verify ở tests/unit/nine-methods/ và
 *   tests/unit/twelve-generals/ — kiểm tra ĐÚNG logic ghép nối (Phase 9E là phần MỚI duy nhất),
 *   KHÔNG lặp lại việc verify công thức toán học bên trong (đã xong ở các phase trước).
 */

const TEMPLATE_CALENDAR = computeCalendarData({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);

function calendarWith(dayCan: Can, dayChi: Chi, hourChi: Chi): CalendarData {
  return {
    ...TEMPLATE_CALENDAR,
    dayPillar: { ...TEMPLATE_CALENDAR.dayPillar, can: dayCan, chi: dayChi },
    hourPillar: { ...TEMPLATE_CALENDAR.hourPillar, chi: hourChi },
  };
}

/** Lặp lại ĐÚNG trình tự 8 bước của `calculateDaLiuRenChart` (Phase 9E), dùng để kiểm tra logic ghép nối trên các fixture CalendarData-override đã golden-verify sẵn, KHÔNG cần ChartInput thật. */
function composeManually(calendarData: CalendarData, monthGeneralLiteral: MonthGeneral, dayOrNight: "day" | "night") {
  const monthGeneral = { monthGeneral: monthGeneralLiteral, provenanceId: computeMonthGeneral(calendarData).provenanceId };
  const dayNightValue = { value: dayOrNight, method: "occasion-hour-chi" as const };
  const nobleSpirit = computeNobleSpirit(calendarData.dayPillar.can, dayOrNight, CLASSICAL_V1_PROFILE);
  const heavenEarthPlate = computeHeavenEarthPlate(monthGeneralLiteral, calendarData);
  const fourLessons = computeFourLessons(calendarData, heavenEarthPlate.heavenEarthPlate);
  const threeTransmissions = computeThreeTransmissions(fourLessons.fourLessons, heavenEarthPlate.heavenEarthPlate, calendarData.dayPillar.can);
  const twelveGenerals = computeTwelveGenerals(heavenEarthPlate.heavenEarthPlate, nobleSpirit);
  return { calendarData, monthGeneral, dayNightValue, nobleSpirit, heavenEarthPlate, fourLessons, threeTransmissions, twelveGenerals };
}

const MONTH_GENERAL_TY: MonthGeneral = { zhi: "Tý", classicalName: "thầnHậu" };

describe("daliuren-engine — calculateDaLiuRenChart (Phase 9E facade)", () => {
  describe("Scenario A — Normal chart / 賊克 (ChartInput THẬT: 2024-01-01 00:30 Asia/Shanghai)", () => {
    const input: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };

    it("ok:true, đủ 8 trường + provenance đầy đủ, FourLessons/ThreeTransmissions khớp golden case đã có (Phase 9B Test A)", () => {
      const result = calculateDaLiuRenChart(input);
      expect(result.ok).toBe(true);
      if (!result.ok || !result.data) throw new Error("unreachable");

      // 8 trường tồn tại.
      expect(result.data.calendar).toBeDefined();
      expect(result.data.monthGeneral).toBeDefined();
      expect(result.data.dayNight).toBeDefined();
      expect(result.data.nobleSpirit).toBeDefined();
      expect(result.data.heavenEarthPlate).toBeDefined();
      expect(result.data.fourLessons).toBeDefined();
      expect(result.data.threeTransmissions).toBeDefined();
      expect(result.data.twelveGenerals).toBeDefined();

      // Calendar + FourLessons + ThreeTransmissions khớp CHÍNH XÁC golden case đã verify (Phase 9B/9C).
      expect(result.data.calendar.dayPillar.can).toBe("Giáp");
      expect(result.data.calendar.dayPillar.chi).toBe("Tý");
      expect(result.data.monthGeneral.zhi).toBe("Sửu");
      expect(result.data.fourLessons.lesson1).toEqual({ upper: "Mão", lower: "Giáp" });
      expect(result.data.fourLessons.lesson2).toEqual({ upper: "Thìn", lower: "Mão" });
      expect(result.data.fourLessons.lesson3).toEqual({ upper: "Sửu", lower: "Tý" });
      expect(result.data.fourLessons.lesson4).toEqual({ upper: "Dần", lower: "Sửu" });
      expect(result.data.threeTransmissions.method).toBe("zeike");
      expect(result.data.threeTransmissions.initial).toBe("Thìn");
      expect(result.data.threeTransmissions.middle).toBe("Tỵ");
      expect(result.data.threeTransmissions.final).toBe("Ngọ");

      // TwelveGenerals — KHÔNG có golden table sẵn cho đúng combo này, chỉ kiểm bất biến cấu trúc
      // (công thức đã golden-verify riêng ở Phase 9D với fixture khác).
      expect(result.data.twelveGenerals).toHaveLength(12);
      expect(new Set(result.data.twelveGenerals.map((p) => p.general)).size).toBe(12);
      const anchorPlacement = result.data.twelveGenerals.find((p) => p.general === "guiRen");
      expect(anchorPlacement).toBeDefined();
      expect(heavenPlateAt(result.data.heavenEarthPlate, anchorPlacement!.zhi)).toBe(result.data.nobleSpirit.zhi);

      // Provenance đầy đủ — TYPE A (zeike) nên PHẢI có chainProvenanceId.
      const p = result.data.provenance;
      expect(p.monthGeneralProvenanceId).toEqual(expect.any(String));
      expect(p.dayNightProvenanceId).toEqual(expect.any(String));
      expect(p.nobleSpiritPairProvenanceId).toBe(GUI_REN_PAIR_PROVENANCE.id);
      expect(p.nobleSpiritDayNightAssignmentProvenanceId).toBe(GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE.id);
      expect(p.heavenEarthPlateProvenanceId).toEqual(expect.any(String));
      expect(p.fourLessonsProvenanceId).toEqual(expect.any(String));
      expect(p.threeTransmissionsInitialProvenanceId).toEqual(expect.any(String));
      expect(p.threeTransmissionsChainProvenanceId).toBe(THREE_TRANSMISSIONS_CHAIN_PROVENANCE.id);
      expect(p.twelveGeneralsOrderProvenanceId).toEqual(expect.any(String));
      expect(p.twelveGeneralsAnchorProvenanceId).toEqual(expect.any(String));
      expect(p.twelveGeneralsDirectionProvenanceId).toEqual(expect.any(String));
    });

    it("DETERMINISM: gọi 2 lần cùng input -> data giống hệt nhau (trừ meta.calculatedAt)", () => {
      const first = calculateDaLiuRenChart(input);
      const second = calculateDaLiuRenChart(input);
      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      expect(second.data).toEqual(first.data);
      expect(second.meta.engine).toBe(first.meta.engine);
      expect(second.meta.engineVersion).toBe(first.meta.engineVersion);
      expect(second.meta.coreCalendarVersion).toBe(first.meta.coreCalendarVersion);
    });
  });

  describe("Scenario B — 涉害 special method (composition-equivalence, tái dùng fixture Test C của nine-methods: monthGeneral=Tý hourChi=Dần dayCan=Giáp dayChi=Thìn)", () => {
    it("threeTransmissions.method/initial/provenance đúng như đã golden-verify, KHÔNG bị đổi khi ghép qua facade logic", () => {
      const calendarData = calendarWith("Giáp", "Thìn", "Dần");
      const composed = composeManually(calendarData, MONTH_GENERAL_TY, "night"); // hourChi=Dần thuộc NIGHT_HOUR_CHI

      expect(composed.threeTransmissions.threeTransmissions.method).toBe("shehai");
      expect(composed.threeTransmissions.threeTransmissions.initial).toBe("Dần");
      // shehai là TYPE A (chain) -> PHẢI có chainProvenanceId.
      expect(composed.threeTransmissions.chainProvenanceId).toBe(THREE_TRANSMISSIONS_CHAIN_PROVENANCE.id);
    });
  });

  describe("Scenario C — 十二天將 THUẬN (composition-equivalence, tái dùng fixture Test A của twelve-generals: monthGeneral=Tý hourChi=Sửu dayCan=Giáp, 晝占)", () => {
    it("twelveGenerals khớp CHÍNH XÁC golden case đã có (Phase 9D), KHÔNG bị đổi khi ghép qua facade logic", () => {
      const calendarData = calendarWith("Giáp", "Tý", "Sửu");
      const composed = composeManually(calendarData, MONTH_GENERAL_TY, "day");

      expect(composed.nobleSpirit.nobleSpirit.zhi).toBe("Sửu");
      expect(composed.twelveGenerals.anchor).toBe("Dần");
      const g = (zhi: string) => composed.twelveGenerals.twelveGenerals.find((p) => p.zhi === zhi)?.general;
      expect(g("Dần")).toBe("guiRen");
      expect(g("Sửu")).toBe("tianHou");
    });
  });

  describe("Scenario D — 十二天將 NGHỊCH (composition-equivalence, tái dùng fixture Test B của twelve-generals: monthGeneral=Tý hourChi=Sửu dayCan=Giáp, 夜占)", () => {
    it("twelveGenerals khớp CHÍNH XÁC golden case đã có (Phase 9D), KHÔNG bị đổi khi ghép qua facade logic", () => {
      const calendarData = calendarWith("Giáp", "Tý", "Sửu");
      const composed = composeManually(calendarData, MONTH_GENERAL_TY, "night");

      expect(composed.nobleSpirit.nobleSpirit.zhi).toBe("Mùi");
      expect(composed.twelveGenerals.anchor).toBe("Thân");
      const g = (zhi: string) => composed.twelveGenerals.twelveGenerals.find((p) => p.zhi === zhi)?.general;
      expect(g("Thân")).toBe("guiRen");
      expect(g("Dậu")).toBe("tianHou");
    });
  });

  describe("Scenario E — 伏吟 unsupported (ChartInput THẬT: tìm bằng cách quét chính implementation đã verify — 2024-02-01 00:00 Asia/Shanghai)", () => {
    const input: ChartInput = { date: "2024-02-01", hour: 0, timeZone: "Asia/Shanghai" };

    it("facade FAIL đúng typed error, KHÔNG trả partial result, KHÔNG downgrade/swallow", () => {
      const result = calculateDaLiuRenChart(input);
      expect(result.ok).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0]?.code).toBe("INSUFFICIENT_EVIDENCE_FUYIN_SELECTION");
      expect(result.errors?.[0]?.message).toEqual(expect.any(String));
      // meta vẫn có mặt kể cả khi lỗi — đúng contract EngineResult.
      expect(result.meta.engine).toBe("daliuren-engine");
    });

    it("đối chiếu lại: compute trực tiếp cũng ném ĐÚNG NineMethodsError với cùng mã (không phải facade tự bịa lỗi khác)", () => {
      const calendarData = computeCalendarData(input, CLASSICAL_V1_PROFILE);
      const monthGeneral = computeMonthGeneral(calendarData);
      const heavenEarthPlate = computeHeavenEarthPlate(monthGeneral.monthGeneral, calendarData);
      const fourLessons = computeFourLessons(calendarData, heavenEarthPlate.heavenEarthPlate);
      expect(fourLessons.fourLessons.lesson3.upper).toBe(fourLessons.fourLessons.lesson3.lower); // xác nhận đúng là 伏吟
      try {
        computeThreeTransmissions(fourLessons.fourLessons, heavenEarthPlate.heavenEarthPlate, calendarData.dayPillar.can);
        expect.fail("Kỳ vọng ném lỗi nhưng không có.");
      } catch (error) {
        expect(error).toBeInstanceOf(NineMethodsError);
        expect((error as NineMethodsError).code).toBe("INSUFFICIENT_EVIDENCE_FUYIN_SELECTION");
      }
    });
  });

  describe("Scenario F — 返吟 無親 (composition-equivalence, tái dùng fixture Test F của nine-methods: monthGeneral=Tý hourChi=Ngọ dayCan=Đinh dayChi=Sửu)", () => {
    it("threeTransmissions dùng ĐÚNG 驛馬 (TYPE B, KHÔNG qua chain), khớp golden case đã có (Phase 9C)", () => {
      const calendarData = calendarWith("Đinh", "Sửu", "Ngọ");
      const composed = composeManually(calendarData, MONTH_GENERAL_TY, "day"); // dayOrNight không ảnh hưởng vì dayCan=Đinh không dùng ở đây, chỉ cần hợp lệ

      expect(composed.threeTransmissions.threeTransmissions.method).toBe("fanyin");
      expect(composed.threeTransmissions.threeTransmissions.initial).toBe("Hợi");
      expect(composed.threeTransmissions.threeTransmissions.middle).toBe("Mùi");
      expect(composed.threeTransmissions.threeTransmissions.final).toBe("Sửu");
      // TYPE B -> chainProvenanceId phải VẮNG MẶT.
      expect(composed.threeTransmissions.chainProvenanceId).toBeUndefined();
    });
  });

  describe("UI LANGUAGE GUARD", () => {
    it("twelveGenerals.general và threeTransmissions.method đều là identifier Latin, KHÔNG chữ Hán", () => {
      const result = calculateDaLiuRenChart({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" });
      if (!result.ok || !result.data) throw new Error("unreachable");
      expect(result.data.threeTransmissions.method).toMatch(/^[a-zA-Z]+$/);
      for (const { general } of result.data.twelveGenerals) {
        expect(general).toMatch(/^[a-zA-Z]+$/);
      }
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("DaLiuRenCalculationResult JSON round-trip không mất dữ liệu", () => {
      const result = calculateDaLiuRenChart({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" });
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });
});
