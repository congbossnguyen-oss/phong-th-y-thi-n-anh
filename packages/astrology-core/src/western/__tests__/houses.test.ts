import { describe, expect, it } from "vitest";

import { resolveBirthDataInstant } from "../../timezone/resolveBirthDataInstant.js";
import type { BirthData } from "../../types.js";
import { isWithinTolerance } from "../../precision.js";
import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { calculateWesternHousesAndAngles, WESTERN_DEFAULT_HOUSE_SYSTEM } from "../houses.js";
import { createNormalizedChart } from "../../chart/createNormalizedChart.js";
import { validateNormalizedChart } from "../../chart/validation.js";
import { serializeNormalizedChart, deserializeNormalizedChart } from "../../chart/serialization.js";
import { ASC_MC_GOLDEN_TOLERANCE_DEGREES, GOLDEN_HOUSE_SCENARIOS } from "./goldenHouseFixtures.js";
import { computeIndependentAscMc } from "./independentAscMc.js";

function buildBirthData(scenario: (typeof GOLDEN_HOUSE_SCENARIOS)[number]): BirthData {
  return {
    date: scenario.birthData.date,
    localTime: scenario.birthData.localTime,
    timezoneId: scenario.birthData.timezoneId,
    latitude: scenario.latitude,
    longitude: scenario.longitude,
  };
}

function freshProvider(): SwissEphemerisProvider {
  return new SwissEphemerisProvider();
}

describe("WESTERN_DEFAULT_HOUSE_SYSTEM", () => {
  it("là Placidus — quyết định kiến trúc đã duyệt tường minh cho Phase 3B-1 (DOMAIN_MODEL.md để 'default TBD')", () => {
    expect(WESTERN_DEFAULT_HOUSE_SYSTEM).toBe("placidus");
  });
});

describe("calculateWesternHousesAndAngles — golden test: BirthData thật → resolveBirthDataInstant → houses/angles, cross-check công thức thiên văn độc lập", () => {
  for (const scenario of GOLDEN_HOUSE_SCENARIOS) {
    describe(scenario.label, () => {
      it(`resolveBirthDataInstant cho đúng UTC kỳ vọng (${scenario.localDescription})`, () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        expect(resolution.ok).toBe(true);
        if (!resolution.ok) return;
        expect(resolution.utc.toISOString()).toBe(scenario.expectedUtcIso);
      });

      it("Ascendant khớp công thức độc lập (GMST/obliquity trung bình + RAMC) trong dung sai đã hiệu chỉnh", () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        if (!resolution.ok) throw new Error("BirthData resolution failed unexpectedly");
        const result = calculateWesternHousesAndAngles({
          provider: freshProvider(),
          utcInstant: resolution.utc,
          latitude: scenario.latitude,
          longitude: scenario.longitude,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const asc = result.angles.find((a) => a.type === "ASC");
        expect(asc).toBeDefined();
        expect(isWithinTolerance(asc!.longitude, scenario.ascendant, ASC_MC_GOLDEN_TOLERANCE_DEGREES)).toBe(true);

        const independent = computeIndependentAscMc(resolution.utc, scenario.latitude, scenario.longitude);
        expect(isWithinTolerance(asc!.longitude, independent.ascendant, ASC_MC_GOLDEN_TOLERANCE_DEGREES)).toBe(true);
      });

      it("Midheaven khớp công thức độc lập trong dung sai đã hiệu chỉnh", () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        if (!resolution.ok) throw new Error("BirthData resolution failed unexpectedly");
        const result = calculateWesternHousesAndAngles({
          provider: freshProvider(),
          utcInstant: resolution.utc,
          latitude: scenario.latitude,
          longitude: scenario.longitude,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const mc = result.angles.find((a) => a.type === "MC");
        expect(mc).toBeDefined();
        expect(isWithinTolerance(mc!.longitude, scenario.midheaven, ASC_MC_GOLDEN_TOLERANCE_DEGREES)).toBe(true);

        const independent = computeIndependentAscMc(resolution.utc, scenario.latitude, scenario.longitude);
        expect(isWithinTolerance(mc!.longitude, independent.midheaven, ASC_MC_GOLDEN_TOLERANCE_DEGREES)).toBe(true);
      });

      it("trả đúng 12 house cusps, houseSystem mặc định Placidus", () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        if (!resolution.ok) throw new Error("BirthData resolution failed unexpectedly");
        const result = calculateWesternHousesAndAngles({
          provider: freshProvider(),
          utcInstant: resolution.utc,
          latitude: scenario.latitude,
          longitude: scenario.longitude,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.houseSystem).toBe("placidus");
        expect(result.houseCusps).toHaveLength(12);
        expect(result.houseCusps.map((c) => c.houseNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      });
    });
  }
});

describe("calculateWesternHousesAndAngles — quan hệ hình học ASC/DESC, MC/IC", () => {
  const scenario = GOLDEN_HOUSE_SCENARIOS[0]!;

  it("Descendant xấp xỉ đối diện Ascendant (lệch đúng 180°, dung sai độ chính xác dấu phẩy động)", () => {
    const resolution = resolveBirthDataInstant(buildBirthData(scenario));
    if (!resolution.ok) throw new Error("unreachable");
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: resolution.utc,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
    });
    if (!result.ok) throw new Error("unreachable");
    const asc = result.angles.find((a) => a.type === "ASC")!.longitude;
    const desc = result.angles.find((a) => a.type === "DESC")!.longitude;
    const diff = Math.abs(asc - desc);
    expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 9);
  });

  it("IC xấp xỉ đối diện MC (lệch đúng 180°)", () => {
    const resolution = resolveBirthDataInstant(buildBirthData(scenario));
    if (!resolution.ok) throw new Error("unreachable");
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: resolution.utc,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
    });
    if (!result.ok) throw new Error("unreachable");
    const mc = result.angles.find((a) => a.type === "MC")!.longitude;
    const ic = result.angles.find((a) => a.type === "IC")!.longitude;
    const diff = Math.abs(mc - ic);
    expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 9);
  });

  it("đủ đúng 4 góc, không thiếu không thừa", () => {
    const resolution = resolveBirthDataInstant(buildBirthData(scenario));
    if (!resolution.ok) throw new Error("unreachable");
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: resolution.utc,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
    });
    if (!result.ok) throw new Error("unreachable");
    expect(result.angles.map((a) => a.type).sort()).toEqual(["ASC", "DESC", "IC", "MC"]);
  });
});

describe("calculateWesternHousesAndAngles — lỗi vĩ độ cực dịch sang mã lỗi ổn định UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE", () => {
  it("Placidus tại vĩ độ 70°N trả { ok: false } với code UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE, KHÔNG throw exception thô", () => {
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: new Date("2000-06-21T12:00:00.000Z"),
      latitude: 70,
      longitude: 25,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe("UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE");
    expect(result.errors[0]!.field).toBe("houseSystem");
  });

  it("chọn houseSystem khác (whole_sign) cho cùng vĩ độ cực đó thì tính được bình thường (ok: true) — người gọi tự chọn hệ phù hợp thay vì bị chặn hoàn toàn", () => {
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: new Date("2000-06-21T12:00:00.000Z"),
      latitude: 70,
      longitude: 25,
      houseSystem: "whole_sign",
    });
    expect(result.ok).toBe(true);
  });
});

describe("calculateWesternHousesAndAngles — house system không hỗ trợ dịch sang UNSUPPORTED_FEATURE", () => {
  it("một chuỗi houseSystem lạ trả { ok: false } với code UNSUPPORTED_FEATURE", () => {
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: new Date("2000-01-01T00:00:00.000Z"),
      latitude: 21.0285,
      longitude: 105.8542,
      houseSystem: "not_a_real_system",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]!.code).toBe("UNSUPPORTED_FEATURE");
  });
});

describe("calculateWesternHousesAndAngles — tái lập được (reproducibility)", () => {
  it("gọi lại nhiều lần cho cùng input luôn cho cùng output tuyệt đối (hàm thuần)", () => {
    const scenario = GOLDEN_HOUSE_SCENARIOS[0]!;
    const resolution = resolveBirthDataInstant(buildBirthData(scenario));
    if (!resolution.ok) throw new Error("unreachable");
    const input = { provider: freshProvider(), utcInstant: resolution.utc, latitude: scenario.latitude, longitude: scenario.longitude };
    const first = calculateWesternHousesAndAngles(input);
    const second = calculateWesternHousesAndAngles({ ...input, provider: freshProvider() });
    expect(first).toEqual(second);
  });
});

describe("calculateWesternHousesAndAngles — tích hợp NormalizedChart (chỉ houseSystem/houseCusps/angles, KHÔNG bịa field khác)", () => {
  it("gắn được vào NormalizedChart qua createNormalizedChart, validate sạch, serialize/deserialize round-trip đúng", () => {
    const scenario = GOLDEN_HOUSE_SCENARIOS[0]!;
    const resolution = resolveBirthDataInstant(buildBirthData(scenario));
    if (!resolution.ok) throw new Error("unreachable");
    const result = calculateWesternHousesAndAngles({
      provider: freshProvider(),
      utcInstant: resolution.utc,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
    });
    if (!result.ok) throw new Error("unreachable");

    const chart = createNormalizedChart({
      metadata: {
        engine: "swiss-ephemeris",
        engineVersion: "2.10.03",
        ephemerisVersion: null,
        precisionClass: "file_based",
        zodiacConfigVersion: "1.0.0",
        houseSystem: result.houseSystem,
        ayanamsa: null,
        precisionPolicyVersion: "1.0.0",
      },
      birthDataRef: "test-birth-data-1",
      school: "western",
      zodiacType: "tropical",
      ayanamsa: null,
      houseSystem: result.houseSystem,
      houseCusps: result.houseCusps,
      angles: result.angles,
    });

    expect(validateNormalizedChart(chart)).toEqual([]);
    // KHÔNG bịa field ngoài phạm vi Phase 3B-1: planets/houses/aspects/dignities/nodes/points vẫn rỗng.
    expect(chart.planets).toEqual([]);
    expect(chart.houses).toEqual([]);
    expect(chart.aspects).toEqual([]);
    expect(chart.dignities).toEqual([]);

    const serialized = serializeNormalizedChart(chart);
    const roundTrip = deserializeNormalizedChart(serialized);
    expect(roundTrip.houseCusps).toEqual(chart.houseCusps);
    expect(roundTrip.angles).toEqual(chart.angles);
    expect(roundTrip.houseSystem).toBe(chart.houseSystem);
  });
});
