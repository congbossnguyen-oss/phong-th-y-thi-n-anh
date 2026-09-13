/**
 * Fixture DÙNG CHUNG cho test Phase 2 — KHÔNG export ra public API (chỉ dùng nội bộ test),
 * đúng quy ước Phase 1 (mock provider cũng chỉ sống trong `__tests__`).
 *
 * Số liệu hành tinh/góc lấy đúng benchmark đã dùng xuyên suốt audit + Phase 1 (1985-03-12
 * 08:30 Hanoi, xem docs/astrology-module/AUDIT/BENCHMARK.md) — KHÔNG bịa số, tái dùng số đã
 * verify bằng thực thi thật trong audit.
 */
import type { CalculationMetadata, NormalizedChart } from "../types.js";
import { createNormalizedChart } from "../createNormalizedChart.js";

export const FIXED_CALCULATION_ID = "00000000-0000-4000-8000-000000000001";
export const FIXED_CALCULATED_AT = new Date("2026-09-13T00:00:00.000Z");

export function fixedMetadata(overrides: Partial<CalculationMetadata> = {}): CalculationMetadata {
  return {
    calculationId: FIXED_CALCULATION_ID,
    calculatedAt: FIXED_CALCULATED_AT,
    engine: "test-fixture",
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

/** Chart tối thiểu hợp lệ — chỉ có field bắt buộc, mọi mảng rỗng (chart chưa có houses vì unknown-time, ví dụ). */
export function minimalValidChart(): NormalizedChart {
  return createNormalizedChart({
    metadata: fixedMetadata(),
    birthDataRef: "sha256:test-minimal",
    school: "western",
    zodiacType: "tropical",
    ayanamsa: null,
    houseSystem: "placidus",
  });
}

/** Chart Western đầy đủ — dùng đúng số liệu benchmark Hanoi 1985-03-12 08:30 (tropical, Placidus). */
export function fullWesternChart(): NormalizedChart {
  return createNormalizedChart({
    metadata: fixedMetadata(),
    birthDataRef: "sha256:test-western-full",
    school: "western",
    zodiacType: "tropical",
    ayanamsa: null,
    houseSystem: "placidus",
    planets: [
      {
        body: "sun",
        longitude: 351.4222,
        latitude: -0.0001,
        distanceAu: 0.9937,
        speedDegreesPerDay: 0.9979,
        isRetrograde: false,
        sign: "pisces",
        signDegree: 21.4222,
        house: 11,
        source: "astronomical_core",
        precision: 0.0001,
      },
      {
        body: "moon",
        longitude: 240.0111,
        latitude: -0.8932,
        distanceAu: null,
        speedDegreesPerDay: 14.1258,
        isRetrograde: false,
        sign: "sagittarius",
        signDegree: 0.0111,
        house: 7,
        source: "astronomical_core",
        precision: 0.0001,
      },
      {
        body: "saturn",
        longitude: 238.1087,
        latitude: 2.2674,
        distanceAu: 9.4879,
        speedDegreesPerDay: -0.0076,
        isRetrograde: true,
        sign: "scorpio",
        signDegree: 28.1087,
        house: 7,
        source: "astronomical_core",
        precision: 0.0001,
      },
    ],
    points: [{ name: "part_of_fortune", longitude: 100.0, source: "computed" }],
    houses: [
      { number: 1, sign: "taurus", ruler: "venus" },
      { number: 7, sign: "scorpio", ruler: "mars" },
      { number: 10, sign: "capricorn", ruler: "saturn" },
      { number: 11, sign: "aquarius", ruler: "saturn" },
    ],
    houseCusps: [
      { houseNumber: 1, longitude: 35.5425, houseSystem: "placidus" },
      { houseNumber: 2, longitude: 63.5154, houseSystem: "placidus" },
      { houseNumber: 3, longitude: 91.0864, houseSystem: "placidus" },
      { houseNumber: 4, longitude: 116.0035, houseSystem: "placidus" },
      { houseNumber: 5, longitude: 143.9131, houseSystem: "placidus" },
      { houseNumber: 6, longitude: 177.5471, houseSystem: "placidus" },
      { houseNumber: 7, longitude: 215.5425, houseSystem: "placidus" },
      { houseNumber: 8, longitude: 243.5154, houseSystem: "placidus" },
      { houseNumber: 9, longitude: 271.0864, houseSystem: "placidus" },
      { houseNumber: 10, longitude: 296.0035, houseSystem: "placidus" },
      { houseNumber: 11, longitude: 323.9131, houseSystem: "placidus" },
      { houseNumber: 12, longitude: 357.5471, houseSystem: "placidus" },
    ],
    angles: [
      { type: "ASC", longitude: 35.5425 },
      { type: "MC", longitude: 296.0035 },
      { type: "DESC", longitude: 215.5425 },
      { type: "IC", longitude: 116.0035 },
    ],
    aspects: [
      { planetA: "sun", planetB: "saturn", type: "trine", exactAngle: 120, actualAngle: 113.3135, orb: 6.6865, withinOrb: true },
      { planetA: "moon", planetB: "saturn", type: "conjunction", exactAngle: 0, actualAngle: 1.9024, orb: 1.9024, withinOrb: true },
    ],
    dignities: [],
    nodes: [
      { nodeType: "true", pole: "north", longitude: 49.96 },
      { nodeType: "true", pole: "south", longitude: 229.96 },
    ],
  });
}

/** Chart Vedic đầy đủ — cùng thời điểm, sidereal Lahiri, Whole Sign — chứng minh contract KHÔNG thiên vị Western. */
export function fullVedicChart(): NormalizedChart {
  return createNormalizedChart({
    metadata: fixedMetadata({ houseSystem: "whole_sign", ayanamsa: "lahiri", zodiacConfigVersion: "vedic.core.v1" }),
    birthDataRef: "sha256:test-vedic-full",
    school: "vedic",
    zodiacType: "sidereal",
    ayanamsa: "lahiri",
    houseSystem: "whole_sign",
    planets: [
      {
        body: "sun",
        longitude: 327.7755,
        latitude: -0.0001,
        distanceAu: 0.9937,
        speedDegreesPerDay: 0.9979,
        isRetrograde: false,
        sign: "aquarius",
        signDegree: 27.7755,
        house: 11,
        source: "astronomical_core",
        precision: 0.0001,
      },
      {
        body: "moon",
        longitude: 216.3645,
        latitude: -0.8932,
        distanceAu: null,
        speedDegreesPerDay: 14.1258,
        isRetrograde: false,
        sign: "scorpio",
        signDegree: 6.3645,
        house: 8,
        source: "astronomical_core",
        precision: 0.0001,
      },
    ],
    points: [],
    houses: [{ number: 1, sign: "aries", ruler: "mars" }],
    houseCusps: [],
    angles: [{ type: "ASC", longitude: 11.8959 }],
    aspects: [],
    dignities: [],
    nodes: [{ nodeType: "mean", pole: "north", longitude: 51.4381 }],
  });
}
