import { describe, expect, it } from "vitest";

import type { CalculationMetadata, NormalizedChart, NormalizedPlanetPosition, ZodiacSign } from "../../chart/types.js";
import { createNormalizedChart } from "../../chart/createNormalizedChart.js";
import type { Factor, FactorSchoolConfig } from "../../factor/types.js";
import { WESTERN_FACTORS_VERSION, extractWesternFactors, westernFactorEngine } from "../factors.js";

// ---------------------------------------------------------------------------------------
// Test fixtures — độc lập với implementation. Expected values hand-derived từ hợp đồng FROZEN
// (element = ZODIAC index % 4 [fire,earth,air,water]; modality = index % 3 [cardinal,fixed,
// mutable]), KHÔNG sinh bằng cách gọi hàm dưới test.
// ---------------------------------------------------------------------------------------

const FIXED_ID = "00000000-0000-4000-8000-0000000000f5";
const FIXED_AT = new Date("2026-09-17T00:00:00.000Z");
const WESTERN_CONFIG: FactorSchoolConfig = { school: "western" };

function meta(overrides: Partial<CalculationMetadata> = {}): CalculationMetadata {
  return {
    calculationId: FIXED_ID,
    calculatedAt: FIXED_AT,
    engine: "test",
    engineVersion: "0.0.0",
    ephemerisVersion: null,
    precisionClass: "file_based",
    zodiacConfigVersion: "western.core.v1",
    houseSystem: "placidus",
    ayanamsa: null,
    precisionPolicyVersion: "1.0.0",
    ...overrides,
  };
}

function planet(body: string, sign: ZodiacSign, house: NormalizedPlanetPosition["house"]): NormalizedPlanetPosition {
  return {
    body,
    longitude: 0,
    latitude: 0,
    distanceAu: null,
    speedDegreesPerDay: 1,
    isRetrograde: false,
    sign,
    signDegree: 0,
    house,
    source: "astronomical_core",
    precision: 0.0001,
  };
}

function westernChart(overrides: Partial<Parameters<typeof createNormalizedChart>[0]> = {}): NormalizedChart {
  return createNormalizedChart({
    metadata: meta(),
    birthDataRef: "sha256:test-factor",
    school: "western",
    zodiacType: "tropical",
    ayanamsa: null,
    houseSystem: "placidus",
    ...overrides,
  });
}

function byId(factors: Factor[], id: string): Factor | undefined {
  return factors.find((f) => f.id === id);
}

describe("extractWesternFactors — planet-in-sign (họ 1, category placement)", () => {
  it("phát ra một factor placement cho MỖI hành tinh, id = `<body>_in_<sign>`", () => {
    const chart = westernChart({ planets: [planet("sun", "leo", 10), planet("moon", "taurus", 7)] });
    const factors = extractWesternFactors(chart, WESTERN_CONFIG);
    const sun = byId(factors, "sun_in_leo");
    const moon = byId(factors, "moon_in_taurus");
    expect(sun).toBeDefined();
    expect(moon).toBeDefined();
    expect(sun?.category).toBe("placement");
    expect(moon?.category).toBe("placement");
  });

  it("provenance inputs = planet + sign", () => {
    const chart = westernChart({ planets: [planet("mars", "scorpio", 1)] });
    const f = byId(extractWesternFactors(chart, WESTERN_CONFIG), "mars_in_scorpio");
    expect(f?.inputs).toEqual([
      { type: "planet", ref: "mars" },
      { type: "sign", ref: "scorpio" },
    ]);
  });
});

describe("extractWesternFactors — planet-in-house (họ 2, category placement) + ABSENT vs strength=0", () => {
  it("id = `<body>_in_house_<n>`, inputs = planet + house", () => {
    const chart = westernChart({ planets: [planet("mars", "scorpio", 10)] });
    const f = byId(extractWesternFactors(chart, WESTERN_CONFIG), "mars_in_house_10");
    expect(f?.category).toBe("placement");
    expect(f?.inputs).toEqual([
      { type: "planet", ref: "mars" },
      { type: "house", ref: "house_10" },
    ]);
  });

  it("house = null (unknown-time) ⇒ factor planet-in-house ABSENT — KHÔNG phát ra với strength=0", () => {
    const chart = westernChart({ planets: [planet("sun", "leo", null)] });
    const factors = extractWesternFactors(chart, WESTERN_CONFIG);
    // sign/element/modality vẫn còn (không phụ thuộc nhà); house factor biến mất hoàn toàn.
    expect(byId(factors, "sun_in_leo")).toBeDefined();
    expect(byId(factors, "sun_element_fire")).toBeDefined();
    expect(byId(factors, "sun_modality_fixed")).toBeDefined();
    expect(factors.some((f) => f.id.startsWith("sun_in_house_"))).toBe(false);
  });

  it("chart RỖNG (không hành tinh — vd. unknown-time không có positions) ⇒ Factor[] rỗng, KHÔNG bịa factor nào", () => {
    expect(extractWesternFactors(westernChart({ planets: [] }), WESTERN_CONFIG)).toEqual([]);
  });
});

describe("extractWesternFactors — element/modality (họ 4, category sign_quality)", () => {
  // Hand-derived: element = index%4 (fire,earth,air,water); modality = index%3 (cardinal,fixed,mutable).
  const cases: { sign: ZodiacSign; element: string; modality: string }[] = [
    { sign: "aries", element: "fire", modality: "cardinal" }, // idx0
    { sign: "taurus", element: "earth", modality: "fixed" }, // idx1
    { sign: "gemini", element: "air", modality: "mutable" }, // idx2
    { sign: "cancer", element: "water", modality: "cardinal" }, // idx3
    { sign: "leo", element: "fire", modality: "fixed" }, // idx4
    { sign: "virgo", element: "earth", modality: "mutable" }, // idx5
    { sign: "libra", element: "air", modality: "cardinal" }, // idx6
    { sign: "scorpio", element: "water", modality: "fixed" }, // idx7
    { sign: "sagittarius", element: "fire", modality: "mutable" }, // idx8
    { sign: "capricorn", element: "earth", modality: "cardinal" }, // idx9
    { sign: "aquarius", element: "air", modality: "fixed" }, // idx10
    { sign: "pisces", element: "water", modality: "mutable" }, // idx11
  ];

  it("phủ toàn bộ 12 cung — element/modality đúng bảng phổ quát, category sign_quality, inputs planet+sign", () => {
    for (const { sign, element, modality } of cases) {
      const chart = westernChart({ planets: [planet("x", sign, 1)] });
      const factors = extractWesternFactors(chart, WESTERN_CONFIG);
      const el = byId(factors, `x_element_${element}`);
      const mod = byId(factors, `x_modality_${modality}`);
      expect(el, `element for ${sign}`).toBeDefined();
      expect(mod, `modality for ${sign}`).toBeDefined();
      expect(el?.category).toBe("sign_quality");
      expect(mod?.category).toBe("sign_quality");
      expect(el?.inputs).toEqual([
        { type: "planet", ref: "x" },
        { type: "sign", ref: sign },
      ]);
    }
  });
});

describe("extractWesternFactors — aspect (họ 3, category aspect)", () => {
  it("id = `aspect:<a>-<b>:<type>`, inputs = planetA + planetB + aspect, tái dùng chart.aspects", () => {
    const chart = westernChart({
      planets: [planet("sun", "leo", 10), planet("saturn", "scorpio", 1)],
      aspects: [
        { planetA: "sun", planetB: "saturn", type: "square", exactAngle: 90, actualAngle: 88.1, orb: 1.9, withinOrb: true },
      ],
    });
    const f = byId(extractWesternFactors(chart, WESTERN_CONFIG), "aspect:sun-saturn:square");
    expect(f?.category).toBe("aspect");
    expect(f?.inputs).toEqual([
      { type: "planet", ref: "sun" },
      { type: "planet", ref: "saturn" },
      { type: "aspect", ref: "sun-saturn:square" },
    ]);
  });
});

describe("extractWesternFactors — FROZEN strength/version/provenance invariants", () => {
  const chart = westernChart({
    planets: [planet("sun", "leo", 10), planet("moon", "taurus", 7)],
    aspects: [{ planetA: "sun", planetB: "moon", type: "trine", exactAngle: 120, actualAngle: 119, orb: 1, withinOrb: true }],
  });
  const factors = extractWesternFactors(chart, WESTERN_CONFIG);

  it("MỌI factor strength = 0 và ∈ [-1,1] (v1: không polarity xác định-không-diễn-giải)", () => {
    for (const f of factors) {
      expect(f.strength).toBe(0);
      expect(f.strength).toBeGreaterThanOrEqual(-1);
      expect(f.strength).toBeLessThanOrEqual(1);
    }
  });

  it("MỌI factor version = western.factors.v1", () => {
    expect(WESTERN_FACTORS_VERSION).toBe("western.factors.v1");
    for (const f of factors) expect(f.version).toBe("western.factors.v1");
  });

  it("MỌI factor school = western; chartId = metadata.calculationId; computedAt = metadata.calculatedAt", () => {
    for (const f of factors) {
      expect(f.school).toBe("western");
      expect(f.chartId).toBe(FIXED_ID);
      expect(f.computedAt).toBe(FIXED_AT);
    }
  });

  it("category CHỈ thuộc từ vựng cấu trúc FROZEN {placement, aspect, sign_quality} — KHÔNG career/wealth/...", () => {
    const allowed = new Set(["placement", "aspect", "sign_quality"]);
    for (const f of factors) expect(allowed.has(f.category)).toBe(true);
  });
});

describe("extractWesternFactors — determinism + stable ordering (DoD ADR-008)", () => {
  it("cùng Chart + config ⇒ Factor[] ĐỒNG NHẤT (deep equal, cùng thứ tự)", () => {
    const chart = westernChart({
      planets: [planet("sun", "aries", 1), planet("moon", "cancer", 4), planet("mars", "gemini", 3)],
      aspects: [{ planetA: "sun", planetB: "moon", type: "square", exactAngle: 90, actualAngle: 91, orb: 1, withinOrb: true }],
    });
    expect(extractWesternFactors(chart, WESTERN_CONFIG)).toEqual(extractWesternFactors(chart, WESTERN_CONFIG));
  });

  it("thứ tự bám theo chart.planets (mỗi hành tinh: sign, element, modality, house) rồi chart.aspects", () => {
    const chart = westernChart({
      planets: [planet("sun", "aries", 1)],
      aspects: [{ planetA: "sun", planetB: "moon", type: "trine", exactAngle: 120, actualAngle: 120, orb: 0, withinOrb: true }],
    });
    const ids = extractWesternFactors(chart, WESTERN_CONFIG).map((f) => f.id);
    expect(ids).toEqual([
      "sun_in_aries",
      "sun_element_fire",
      "sun_modality_cardinal",
      "sun_in_house_1",
      "aspect:sun-moon:trine",
    ]);
  });
});

describe("extractWesternFactors — full audited chart (independently hand-derived, benchmark reuse)", () => {
  it("Hanoi 1985 fixture: 3 planets × 4 + 2 aspects = 14 factors, đúng id/element/modality", () => {
    const chart = westernChart({
      planets: [planet("sun", "pisces", 11), planet("moon", "sagittarius", 7), planet("saturn", "scorpio", 7)],
      aspects: [
        { planetA: "sun", planetB: "saturn", type: "trine", exactAngle: 120, actualAngle: 113.3, orb: 6.7, withinOrb: true },
        { planetA: "moon", planetB: "saturn", type: "conjunction", exactAngle: 0, actualAngle: 1.9, orb: 1.9, withinOrb: true },
      ],
    });
    const ids = extractWesternFactors(chart, WESTERN_CONFIG).map((f) => f.id);
    expect(ids).toEqual([
      "sun_in_pisces",
      "sun_element_water",
      "sun_modality_mutable",
      "sun_in_house_11",
      "moon_in_sagittarius",
      "moon_element_fire",
      "moon_modality_mutable",
      "moon_in_house_7",
      "saturn_in_scorpio",
      "saturn_element_water",
      "saturn_modality_fixed",
      "saturn_in_house_7",
      "aspect:sun-saturn:trine",
      "aspect:moon-saturn:conjunction",
    ]);
  });
});

describe("extractWesternFactors — school isolation guard (ADR-003)", () => {
  it("ném lỗi nếu chart.school KHÔNG phải western", () => {
    const vedicChart = createNormalizedChart({
      metadata: meta({ houseSystem: "whole_sign", ayanamsa: "lahiri" }),
      birthDataRef: "sha256:test-vedic",
      school: "vedic",
      zodiacType: "sidereal",
      ayanamsa: "lahiri",
      houseSystem: "whole_sign",
      planets: [planet("sun", "aquarius", 11)],
    });
    expect(() => extractWesternFactors(vedicChart, WESTERN_CONFIG)).toThrow();
  });

  it("ném lỗi nếu schoolConfig.school KHÔNG phải western", () => {
    const chart = westernChart({ planets: [planet("sun", "leo", 1)] });
    expect(() => extractWesternFactors(chart, { school: "vedic" })).toThrow();
  });
});

describe("westernFactorEngine — implement FactorEngine interface", () => {
  it("extractFactors khớp hàm extractWesternFactors", () => {
    const chart = westernChart({ planets: [planet("sun", "leo", 10)] });
    expect(westernFactorEngine.extractFactors(chart, WESTERN_CONFIG)).toEqual(extractWesternFactors(chart, WESTERN_CONFIG));
  });
});
