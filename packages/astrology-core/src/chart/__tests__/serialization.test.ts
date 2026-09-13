import { describe, expect, it } from "vitest";
import { deserializeNormalizedChart, NormalizedChartVersionMismatchError, serializeNormalizedChart } from "../serialization.js";
import { NORMALIZED_CHART_SCHEMA_VERSION } from "../types.js";
import { fullVedicChart, fullWesternChart, minimalValidChart } from "./fixtures.js";

describe("serializeNormalizedChart — determinism", () => {
  it("cùng nội dung nhưng khác reference object (2 lần gọi factory riêng) cho ra CHUỖI JSON GIỐNG HỆT NHAU", () => {
    const a = serializeNormalizedChart(fullWesternChart());
    const b = serializeNormalizedChart(fullWesternChart());
    expect(a).toBe(b);
  });

  it("thứ tự field trong object KHÔNG ảnh hưởng chuỗi ra (key luôn sắp xếp)", () => {
    const chart = fullWesternChart();
    const reordered = {
      nodes: chart.nodes,
      dignities: chart.dignities,
      aspects: chart.aspects,
      angles: chart.angles,
      houseCusps: chart.houseCusps,
      houses: chart.houses,
      points: chart.points,
      planets: chart.planets,
      houseSystem: chart.houseSystem,
      ayanamsa: chart.ayanamsa,
      zodiacType: chart.zodiacType,
      school: chart.school,
      birthDataRef: chart.birthDataRef,
      metadata: chart.metadata,
    };
    expect(serializeNormalizedChart(chart)).toBe(serializeNormalizedChart(reordered as typeof chart));
  });

  it("gọi lặp lại nhiều lần liên tiếp cho cùng 1 chuỗi (reproducibility)", () => {
    const chart = fullVedicChart();
    const outputs = Array.from({ length: 5 }, () => serializeNormalizedChart(chart));
    expect(new Set(outputs).size).toBe(1);
  });

  it("chuỗi ra chứa schemaVersion đúng hằng số hiện hành", () => {
    const json = serializeNormalizedChart(minimalValidChart());
    const parsed = JSON.parse(json) as { schemaVersion: string };
    expect(parsed.schemaVersion).toBe(NORMALIZED_CHART_SCHEMA_VERSION);
  });
});

describe("serializeNormalizedChart / deserializeNormalizedChart — round-trip", () => {
  it("round-trip chart Western giữ nguyên toàn bộ giá trị", () => {
    const original = fullWesternChart();
    const restored = deserializeNormalizedChart(serializeNormalizedChart(original));
    expect(restored).toEqual(original);
  });

  it("round-trip chart Vedic giữ nguyên toàn bộ giá trị", () => {
    const original = fullVedicChart();
    const restored = deserializeNormalizedChart(serializeNormalizedChart(original));
    expect(restored).toEqual(original);
  });

  it("round-trip khôi phục ĐÚNG KIỂU Date cho calculatedAt (không phải string)", () => {
    const restored = deserializeNormalizedChart(serializeNormalizedChart(minimalValidChart()));
    expect(restored.metadata.calculatedAt).toBeInstanceOf(Date);
  });

  it("round-trip chart tối thiểu (mọi mảng rỗng) không mất field nào", () => {
    const original = minimalValidChart();
    const restored = deserializeNormalizedChart(serializeNormalizedChart(original));
    expect(restored).toEqual(original);
  });
});

describe("deserializeNormalizedChart — version handling", () => {
  it("chấp nhận đúng schemaVersion hiện hành", () => {
    expect(() => deserializeNormalizedChart(serializeNormalizedChart(minimalValidChart()))).not.toThrow();
  });

  it("từ chối major version khác (breaking change) bằng NormalizedChartVersionMismatchError", () => {
    const json = serializeNormalizedChart(minimalValidChart());
    const tampered = JSON.stringify({ ...JSON.parse(json), schemaVersion: "2.0.0" });
    expect(() => deserializeNormalizedChart(tampered)).toThrow(NormalizedChartVersionMismatchError);
  });

  it("chấp nhận minor version khác (field mới không bắt buộc, không breaking)", () => {
    const json = serializeNormalizedChart(minimalValidChart());
    const currentMajor = NORMALIZED_CHART_SCHEMA_VERSION.split(".")[0];
    const tampered = JSON.stringify({ ...JSON.parse(json), schemaVersion: `${currentMajor}.99.0` });
    expect(() => deserializeNormalizedChart(tampered)).not.toThrow();
  });
});
