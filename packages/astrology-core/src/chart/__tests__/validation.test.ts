import { describe, expect, it } from "vitest";
import { validateNormalizedChart } from "../validation.js";
import { fullWesternChart } from "./fixtures.js";
import type { NormalizedChart } from "../types.js";

describe("validateNormalizedChart — invalid numeric ranges", () => {
  it("báo INVALID_LONGITUDE cho longitude ngoài [0,360)", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.longitude = 360;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_LONGITUDE");
  });

  it("báo INVALID_LONGITUDE cho longitude âm", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.longitude = -1;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_LONGITUDE");
  });

  it("báo INVALID_LATITUDE cho latitude ngoài [-90,90]", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.latitude = 91;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_LATITUDE");
  });

  it("báo INVALID_SIGN_DEGREE cho signDegree = 30 (phải < 30)", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.signDegree = 30;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_SIGN_DEGREE");
  });

  it("báo INVALID_ASPECT_ORB cho orb âm", () => {
    const chart = fullWesternChart();
    chart.aspects[0]!.orb = -1;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_ASPECT_ORB");
  });

  it("báo INVALID_HOUSE_NUMBER cho house = 13 trên một hành tinh", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.house = 13 as never;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_HOUSE_NUMBER");
  });
});

describe("validateNormalizedChart — invalid enum values", () => {
  it("báo INVALID_ZODIAC_SIGN cho sign không nằm trong 12 cung", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.sign = "ophiuchus" as never;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_ZODIAC_SIGN");
  });

  it("báo INVALID_ZODIAC_SIGN cho dignities[].sign sai", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ planet: "mars", sign: "not_a_sign" as never, type: "domicile", score: 5 }];
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_ZODIAC_SIGN");
  });
});

describe("validateNormalizedChart — missing/inconsistent required data", () => {
  it("báo EMPTY_BIRTH_DATA_REF khi birthDataRef rỗng", () => {
    const chart = fullWesternChart();
    chart.birthDataRef = "";
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("EMPTY_BIRTH_DATA_REF");
  });

  it("báo EMPTY_SCHOOL khi school rỗng", () => {
    const chart = fullWesternChart();
    chart.school = "";
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("EMPTY_SCHOOL");
  });

  it("báo MISSING_AYANAMSA_FOR_SIDEREAL khi zodiacType=sidereal nhưng ayanamsa=null", () => {
    const chart = fullWesternChart();
    chart.zodiacType = "sidereal";
    chart.ayanamsa = null;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("MISSING_AYANAMSA_FOR_SIDEREAL");
  });

  it("báo UNEXPECTED_AYANAMSA_FOR_TROPICAL khi zodiacType=tropical nhưng có ayanamsa", () => {
    const chart = fullWesternChart();
    chart.ayanamsa = "lahiri";
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("UNEXPECTED_AYANAMSA_FOR_TROPICAL");
  });

  it("báo INCONSISTENT_RETROGRADE_FLAG khi isRetrograde không khớp dấu speed", () => {
    const chart = fullWesternChart();
    chart.planets[0]!.isRetrograde = true; // sun trong fixture có speed dương
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INCONSISTENT_RETROGRADE_FLAG");
  });

  it("báo ASPECT_SELF_REFERENCE khi planetA === planetB", () => {
    const chart = fullWesternChart();
    chart.aspects[0]!.planetB = chart.aspects[0]!.planetA;
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("ASPECT_SELF_REFERENCE");
  });

  it("báo INCOMPLETE_HOUSE_CUSPS khi houseCusps không rỗng nhưng không đủ 12", () => {
    const chart = fullWesternChart();
    chart.houseCusps = chart.houseCusps.slice(0, 5);
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INCOMPLETE_HOUSE_CUSPS");
  });

  it("houseCusps RỖNG (unknown-time chart) KHÔNG bị coi là thiếu dữ liệu", () => {
    const chart = fullWesternChart();
    chart.houseCusps = [];
    expect(validateNormalizedChart(chart).map((e) => e.code)).not.toContain("INCOMPLETE_HOUSE_CUSPS");
  });
});

describe("validateNormalizedChart — duplicate identifiers", () => {
  it("báo DUPLICATE_PLANET khi cùng 1 hành tinh xuất hiện 2 lần", () => {
    const chart = fullWesternChart();
    chart.planets.push({ ...chart.planets[0]! });
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("DUPLICATE_PLANET");
  });

  it("báo DUPLICATE_HOUSE_NUMBER khi 2 phần tử houses[] cùng number", () => {
    const chart = fullWesternChart();
    chart.houses.push({ ...chart.houses[0]! });
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("DUPLICATE_HOUSE_NUMBER");
  });

  it("báo DUPLICATE_HOUSE_CUSP khi 2 cusp cùng houseNumber", () => {
    const chart = fullWesternChart();
    chart.houseCusps[1] = { ...chart.houseCusps[0]! };
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("DUPLICATE_HOUSE_CUSP");
  });

  it("báo DUPLICATE_ANGLE_TYPE khi 2 góc cùng type", () => {
    const chart = fullWesternChart();
    chart.angles.push({ ...chart.angles[0]! });
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("DUPLICATE_ANGLE_TYPE");
  });
});

describe("validateNormalizedChart — nhiều lỗi cùng lúc, không dừng ở lỗi đầu tiên", () => {
  it("gộp đủ lỗi từ nhiều phần khác nhau của chart trong 1 lần validate", () => {
    const chart: NormalizedChart = fullWesternChart();
    chart.birthDataRef = "";
    chart.planets[0]!.longitude = 400;
    chart.aspects[0]!.orb = -5;
    const codes = validateNormalizedChart(chart).map((e) => e.code);
    expect(codes).toContain("EMPTY_BIRTH_DATA_REF");
    expect(codes).toContain("INVALID_LONGITUDE");
    expect(codes).toContain("INVALID_ASPECT_ORB");
  });
});
