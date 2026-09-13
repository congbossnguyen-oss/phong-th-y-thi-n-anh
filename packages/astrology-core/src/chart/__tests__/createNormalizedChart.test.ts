import { describe, expect, it } from "vitest";
import { createNormalizedChart } from "../createNormalizedChart.js";
import { validateNormalizedChart } from "../validation.js";
import { fullVedicChart, fullWesternChart, minimalValidChart } from "./fixtures.js";

describe("createNormalizedChart — minimal valid NormalizedChart", () => {
  it("chỉ truyền field bắt buộc, mọi mảng mặc định rỗng và HỢP LỆ", () => {
    const chart = minimalValidChart();
    expect(chart.planets).toEqual([]);
    expect(chart.points).toEqual([]);
    expect(chart.houses).toEqual([]);
    expect(chart.houseCusps).toEqual([]);
    expect(chart.angles).toEqual([]);
    expect(chart.aspects).toEqual([]);
    expect(chart.dignities).toEqual([]);
    expect(chart.nodes).toEqual([]);
    expect(validateNormalizedChart(chart)).toEqual([]);
  });

  it("tự sinh calculationId/calculatedAt nếu không truyền vào (khác nhau giữa 2 lần gọi liên tiếp)", () => {
    const buildAuto = () =>
      createNormalizedChart({
        metadata: {
          engine: "e",
          engineVersion: "1",
          ephemerisVersion: null,
          precisionClass: "unknown",
          zodiacConfigVersion: "v1",
          houseSystem: "placidus",
          ayanamsa: null,
          precisionPolicyVersion: "1.0.0",
        },
        birthDataRef: "sha256:x",
        school: "western",
        zodiacType: "tropical",
        ayanamsa: null,
        houseSystem: "placidus",
      });
    const a = buildAuto();
    const b = buildAuto();
    expect(typeof a.metadata.calculationId).toBe("string");
    expect(a.metadata.calculationId.length).toBeGreaterThan(0);
    expect(a.metadata.calculatedAt).toBeInstanceOf(Date);
    // Mỗi lần gọi PHẢI sinh calculationId khác nhau (đây là ID phiên tính, không phải fingerprint nội dung).
    expect(a.metadata.calculationId).not.toBe(b.metadata.calculationId);
  });

  it("dùng đúng calculationId/calculatedAt truyền vào, KHÔNG tự sinh đè lên (bắt buộc để test tái lập được)", () => {
    const chart = minimalValidChart();
    expect(chart.metadata.calculationId).toBe("00000000-0000-4000-8000-000000000001");
    expect(chart.metadata.calculatedAt.toISOString()).toBe("2026-09-13T00:00:00.000Z");
  });
});

describe("createNormalizedChart — full valid fixture", () => {
  it("chart Western đầy đủ hợp lệ (0 lỗi validate)", () => {
    expect(validateNormalizedChart(fullWesternChart())).toEqual([]);
  });

  it("chart Vedic đầy đủ hợp lệ (0 lỗi validate)", () => {
    expect(validateNormalizedChart(fullVedicChart())).toEqual([]);
  });
});
