import { describe, expect, it } from "vitest";
import { getGanzhiDay } from "@thien-anh/calendar-core";
import type { Chart } from "../../../src/types/chart.js";

/**
 * Checkpoint 1 KHÔNG có hàm calculate() — test này CHỈ xác nhận domain contract `Chart` LẮP
 * RÁP ĐƯỢC từ dữ liệu Can/Chi thật của calendar-core (không phải type Chinese-character tự
 * chế), và toàn bộ field bắt buộc có mặt. Đây là "schema validation" ở mức compile-time +
 * 1 smoke test runtime tối thiểu, KHÔNG PHẢI test thuật toán (Calendar Layer chưa xây).
 */
describe("daliuren-engine/types/Chart (shape only, no calculation)", () => {
  it("dựng thủ công 1 Chart hợp lệ dùng Can/Chi thật từ calendar-core", () => {
    const dayPillar = getGanzhiDay({ year: 2026, month: 1, day: 1, timeZone: "Asia/Ho_Chi_Minh" });

    const chart: Chart = {
      input: { date: "2026-01-01", hour: 12, timeZone: "Asia/Ho_Chi_Minh" },
      calendar: {
        yearPillar: dayPillar,
        monthPillar: dayPillar,
        dayPillar,
        hourPillar: dayPillar,
        precedingMajorTerm: { nameHan: "小寒", name: "Tiểu Hàn", kind: "tiet", occurredAt: "2026-01-05T20:43:00Z" },
      },
      monthGeneral: { zhi: "Tý", classicalName: "thầnHậu" },
      dayNight: { value: "day", method: "occasion-hour-chi" },
      nobleSpirit: { zhi: "Mùi", mappingTable: "traditional" },
      heavenEarthPlate: {
        earthPlate: ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"],
        heavenPlate: ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"],
      },
      fourLessons: {
        lesson1: { upper: "Dần", lower: "Giáp" },
        lesson2: { upper: "Dần", lower: "Dần" },
        lesson3: { upper: "Tý", lower: "Tý" },
        lesson4: { upper: "Tý", lower: "Tý" },
      },
      threeTransmissions: { method: "bazhuan", initial: "Dần", middle: "Tý", final: "Tuất" },
      twelveGenerals: [
        { zhi: "Tý", general: "guiRen" },
        { zhi: "Sửu", general: "tengShe" },
        { zhi: "Dần", general: "zhuQue" },
        { zhi: "Mão", general: "liuHe" },
        { zhi: "Thìn", general: "gouChen" },
        { zhi: "Tỵ", general: "qingLong" },
        { zhi: "Ngọ", general: "tianKong" },
        { zhi: "Mùi", general: "baiHu" },
        { zhi: "Thân", general: "taiChang" },
        { zhi: "Dậu", general: "xuanWu" },
        { zhi: "Tuất", general: "taiYin" },
        { zhi: "Hợi", general: "tianHou" },
      ],
      keType: { primary: { method: "bazhuan" }, secondary: [] },
      voidBranches: { pair: ["Tuất", "Hợi"], affects: { initial: false, middle: false, final: false } },
      shenSha: [],
      wangShuai: { wood: "wang", fire: "xiang", earth: "xiu", metal: "qiu", water: "si" },
    };

    // "Shape only": chỉ xác nhận calendar-core trả về 1 trụ Can/Chi thật (chuỗi khác rỗng) —
    // KHÔNG assert giá trị Can/Chi cụ thể nào (đó là việc của Calendar Layer test, chưa xây).
    expect(chart.calendar.dayPillar.can.length).toBeGreaterThan(0);
    expect(chart.calendar.dayPillar.chi.length).toBeGreaterThan(0);
    expect(chart.keType.secondary).toHaveLength(0); // cách cục phụ LUÔN rỗng ở Checkpoint 1
    expect(chart.shenSha).toHaveLength(0); // hợp lệ: shenSha optional theo nghĩa "có thể rỗng"
    expect(chart.benMing).toBeUndefined(); // không có birthDate -> không có benMing/xingNian
  });
});
