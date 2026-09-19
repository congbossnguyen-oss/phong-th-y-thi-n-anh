import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { computeHeavenEarthPlate, heavenPlateAt } from "../../../src/heaven-earth-plate/compute.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { computeNobleSpirit } from "../../../src/noble-spirit/compute.js";
import { computeTwelveGenerals } from "../../../src/twelve-generals/compute.js";
import { TwelveGeneralsError } from "../../../src/twelve-generals/errors.js";
import {
  TWELVE_GENERALS_ANCHOR_PROVENANCE,
  TWELVE_GENERALS_DIRECTION_PROVENANCE,
  TWELVE_GENERALS_ORDER_PROVENANCE,
} from "../../../src/twelve-generals/provenance.js";
import { GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE, GUI_REN_PAIR_PROVENANCE } from "../../../src/noble-spirit/provenance.js";
import type { MonthGeneral } from "../../../src/types/month-general.js";
import type { TwelveGeneralName } from "../../../src/types/twelve-generals.js";

/**
 * Golden cases (Phase 9D) — dùng Giáp-day (CHỈ Can có confidence B cho Quý Nhân day/night, xem
 * noble-spirit/provenance.ts) + lá số monthGeneral=Tý/hourChi=Sửu ĐÃ verify heavenPlate đầy đủ
 * từ Phase 9B/9C (Test B của nine-methods). Anchor + thuận/nghịch đã XÁC MINH ĐỘC LẬP bằng
 * CHẠY THẬT `d1210182010/daliuren-web-engine` shipan.py `天将盘` (Phase 9D — dùng đúng biến
 * `guiRenDiPan` + phép thử thuận/nghịch của repo A, KHÔNG dùng output thô của `__getitem__` vì
 * lý do đã ghi ở provenance.ts). 12-vị-trí đầy đủ được hoàn thiện bằng cách áp thứ tự 12 tướng
 * (CONFIDENCE A độc lập, không phải phần đang tranh cãi) lên anchor+direction đã xác minh.
 */
const TEMPLATE_CALENDAR = computeCalendarData({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
const MONTH_GENERAL_TY: MonthGeneral = { zhi: "Tý", classicalName: "thầnHậu" };

function heavenEarthPlateFor(hourChi: "Sửu") {
  const calendarData = { ...TEMPLATE_CALENDAR, hourPillar: { ...TEMPLATE_CALENDAR.hourPillar, chi: hourChi } };
  return computeHeavenEarthPlate(MONTH_GENERAL_TY, calendarData).heavenEarthPlate;
}

function generalAt(twelveGenerals: readonly { zhi: string; general: TwelveGeneralName }[], zhi: string): TwelveGeneralName {
  const placement = twelveGenerals.find((p) => p.zhi === zhi);
  if (!placement) throw new Error(`test fixture lỗi: không tìm thấy vị trí ${zhi}`);
  return placement.general;
}

describe("daliuren-engine/twelve-generals/compute — computeTwelveGenerals", () => {
  describe("Test A — Giáp NGÀY (THUẬN, golden case độc lập: monthGeneral=Tý hourChi=Sửu dayCan=Giáp, 晝占)", () => {
    it("anchor=Dần (khớp guiRenDiPan thật của repo A), direction=thuận, đủ 12 vị trí phân biệt khớp CHÍNH XÁC", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      expect(nobleSpirit.nobleSpirit.zhi).toBe("Sửu");

      const result = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      expect(result.anchor).toBe("Dần");

      const g = (zhi: string) => generalAt(result.twelveGenerals, zhi);
      expect(g("Dần")).toBe("guiRen");
      expect(g("Mão")).toBe("tengShe");
      expect(g("Thìn")).toBe("zhuQue");
      expect(g("Tỵ")).toBe("liuHe");
      expect(g("Ngọ")).toBe("gouChen");
      expect(g("Mùi")).toBe("qingLong");
      expect(g("Thân")).toBe("tianKong");
      expect(g("Dậu")).toBe("baiHu");
      expect(g("Tuất")).toBe("taiChang");
      expect(g("Hợi")).toBe("xuanWu");
      expect(g("Tý")).toBe("taiYin");
      expect(g("Sửu")).toBe("tianHou");
    });

    it("provenance chain đầy đủ — nobleSpiritDayNightAssignmentProvenanceId trỏ ĐÚNG Giáp (confidence B)", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const result = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);

      expect(result.orderProvenanceId).toBe(TWELVE_GENERALS_ORDER_PROVENANCE.id);
      expect(TWELVE_GENERALS_ORDER_PROVENANCE.confidence).toBe("A");
      expect(result.anchorProvenanceId).toBe(TWELVE_GENERALS_ANCHOR_PROVENANCE.id);
      expect(TWELVE_GENERALS_ANCHOR_PROVENANCE.confidence).toBe("A");
      expect(result.directionProvenanceId).toBe(TWELVE_GENERALS_DIRECTION_PROVENANCE.id);
      expect(TWELVE_GENERALS_DIRECTION_PROVENANCE.confidence).toBe("B");
      expect(result.nobleSpiritDayNightAssignmentProvenanceId).toBe(GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE.id);
      expect(result.nobleSpiritPairProvenanceId).toBe(GUI_REN_PAIR_PROVENANCE.id);
    });
  });

  describe("Test B — Giáp ĐÊM (NGHỊCH, golden case độc lập: monthGeneral=Tý hourChi=Sửu dayCan=Giáp, 夜占)", () => {
    it("anchor=Thân (khớp guiRenDiPan thật của repo A), direction=nghịch, đủ 12 vị trí phân biệt khớp CHÍNH XÁC", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "night", CLASSICAL_V1_PROFILE);
      expect(nobleSpirit.nobleSpirit.zhi).toBe("Mùi");

      const result = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      expect(result.anchor).toBe("Thân");

      const g = (zhi: string) => generalAt(result.twelveGenerals, zhi);
      expect(g("Thân")).toBe("guiRen");
      expect(g("Mùi")).toBe("tengShe");
      expect(g("Ngọ")).toBe("zhuQue");
      expect(g("Tỵ")).toBe("liuHe");
      expect(g("Thìn")).toBe("gouChen");
      expect(g("Mão")).toBe("qingLong");
      expect(g("Dần")).toBe("tianKong");
      expect(g("Sửu")).toBe("baiHu");
      expect(g("Tý")).toBe("taiChang");
      expect(g("Hợi")).toBe("xuanWu");
      expect(g("Tuất")).toBe("taiYin");
      expect(g("Dậu")).toBe("tianHou");
    });
  });

  describe("STRUCTURAL INVARIANTS", () => {
    it("đủ đúng 12 vị trí, mỗi tướng xuất hiện đúng 1 lần, mỗi Chi nhận đúng 1 tướng", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const { twelveGenerals } = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);

      expect(twelveGenerals).toHaveLength(12);
      expect(new Set(twelveGenerals.map((p) => p.general)).size).toBe(12);
      expect(new Set(twelveGenerals.map((p) => p.zhi)).size).toBe(12);
    });

    it("KHÔNG có field cát/hung hay luận giải nào trên placement (chỉ zhi/general)", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const { twelveGenerals } = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      for (const placement of twelveGenerals) {
        expect(Object.keys(placement).sort()).toEqual(["general", "zhi"]);
      }
    });
  });

  describe("ANCHOR — dùng ĐÚNG heavenPlateAt(anchor) === nobleSpirit.zhi (KHÔNG suy luận anchor khác)", () => {
    it("heavenPlateAt(anchor) khớp lại đúng nobleSpirit.zhi ban đầu (round-trip)", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const result = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      expect(heavenPlateAt(heavenEarthPlate, result.anchor)).toBe(nobleSpirit.nobleSpirit.zhi);
    });
  });

  describe("DETERMINISM", () => {
    it("gọi nhiều lần cùng input cho kết quả hệt nhau", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const first = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      const second = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      expect(second).toEqual(first);
    });
  });

  describe("SERIALIZATION TEST", () => {
    it("TwelveGeneralsComputation JSON round-trip không mất dữ liệu", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const result = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
      expect(roundTripped).toEqual(result);
    });
  });

  describe("NO HIDDEN FALLBACK", () => {
    it("nobleSpirit.zhi không hợp lệ -> throw tường minh (từ earthChiOfHeavenValue), không đoán anchor", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const malformed = { ...nobleSpirit, nobleSpirit: { ...nobleSpirit.nobleSpirit, zhi: "KhongTonTai" as never } };
      expect(() => computeTwelveGenerals(heavenEarthPlate, malformed)).toThrow();
    });
  });

  describe("CROSS-CONTAMINATION / SCOPE GUARD", () => {
    it("TwelveGeneralName KHÔNG chứa chữ Hán nào (identifier Latin, sẵn sàng cho UI tiếng Việt sau này)", () => {
      const heavenEarthPlate = heavenEarthPlateFor("Sửu");
      const nobleSpirit = computeNobleSpirit("Giáp", "day", CLASSICAL_V1_PROFILE);
      const { twelveGenerals } = computeTwelveGenerals(heavenEarthPlate, nobleSpirit);
      for (const { general } of twelveGenerals) {
        expect(general).toMatch(/^[a-zA-Z]+$/);
      }
    });
  });
});
