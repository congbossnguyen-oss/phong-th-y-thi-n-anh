/**
 * Test tích hợp qua ĐÚNG bề mặt public API (`../index.js`), không import trực tiếp file nội
 * bộ — bảo đảm mọi export cần thiết thực sự được wire đúng ở `index.ts`, và bảo đảm
 * reproducibility ở cấp "package công khai" (không chỉ ở cấp hàm nội bộ).
 */
import { describe, expect, it } from "vitest";
import {
  angularSeparation,
  buildWesternChart,
  calculateWesternHousesAndAngles,
  computeWesternAspects,
  isWithinTolerance,
  resolveBirthDataInstant,
  roundForDisplay,
  SwissEphemerisProvider,
  UnimplementedAstronomicalProvider,
  validateBirthData,
  validateNormalizedChart,
  WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY,
  type BirthData,
  // Phase 4 Step 3 — Vedic Rashi (D1)
  calculateRashi,
  getSiderealLongitude,
  VEDIC_DEFAULT_AYANAMSA,
  // Phase 4 Step 4 — Vedic Nakshatra + Pada
  calculateNakshatraPosition,
  getNakshatraIndex,
  getNakshatraDegree,
  getNakshatraPada,
  getNakshatraLord,
  NAKSHATRA_SPAN_DEGREES,
  NAKSHATRA_PADA_SPAN_DEGREES,
  NAKSHATRA_NAMES,
  // Phase 4 Step 6 — Vimshottari Mahadasha
  calculateVimshottariDasha,
  validateVimshottariMahadashaSequence,
  serializeVimshottariMahadashaSequence,
  deserializeVimshottariMahadashaSequence,
  VIMSHOTTARI_DASHA_SCHEMA_VERSION,
  VIMSHOTTARI_YEAR_CONVENTION_ID,
  VIMSHOTTARI_DAYS_PER_YEAR,
  VIMSHOTTARI_LORD_YEARS,
  VIMSHOTTARI_LORD_SEQUENCE,
  // Phase 4 Integration/E2E — Vedic Core Pipeline
  calculateVedicCore,
} from "../index.js";

const benchmarkBirthData: BirthData = {
  date: { year: 1985, month: 3, day: 12 },
  localTime: { hour: 8, minute: 30 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 21.0285,
  longitude: 105.8542,
};

describe("public API — pipeline đầy đủ Phase 1 (validate -> resolve UTC)", () => {
  it("validateBirthData + resolveBirthDataInstant hoạt động nhất quán cho cùng input hợp lệ", () => {
    expect(validateBirthData(benchmarkBirthData)).toEqual([]);
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    expect(resolved.utc.toISOString()).toBe("1985-03-12T01:30:00.000Z");
  });

  it("reproducibility ở cấp public API: gọi lại nhiều lần cho cùng kết quả tuyệt đối", () => {
    const first = resolveBirthDataInstant(benchmarkBirthData);
    const second = resolveBirthDataInstant({ ...benchmarkBirthData });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error("unreachable");
    expect(first.utc.getTime()).toBe(second.utc.getTime());
  });

  it("UnimplementedAstronomicalProvider export đúng, dùng được từ public API mà KHÔNG kéo theo Swiss Ephemeris", () => {
    const provider = new UnimplementedAstronomicalProvider();
    expect(provider.getMetadata().precisionClass).toBe("unknown");
  });

  it("precision helpers hoạt động đúng qua public API", () => {
    expect(roundForDisplay(35.542535, 4)).toBe(35.5425);
    expect(isWithinTolerance(35.5425, 35.54253500624649, 0.0001)).toBe(true);
    expect(isWithinTolerance(35.5, 35.9, 0.0001)).toBe(false);
  });

  it("SwissEphemerisProvider export đúng qua public API, pipeline đầy đủ BirthData -> UTC -> vị trí thiên văn thật", () => {
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const provider = new SwissEphemerisProvider();
    expect(provider.getMetadata().precisionClass).toBe("file_based");
    const sun = provider.getPlanetPosition(resolved.utc, "sun");
    expect(sun.longitude).toBeGreaterThanOrEqual(0);
    expect(sun.longitude).toBeLessThan(360);
  });

  it("calculateWesternHousesAndAngles export đúng qua public API, pipeline đầy đủ BirthData -> UTC -> house cusps + ASC/MC/DESC/IC thật", () => {
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const result = calculateWesternHousesAndAngles({
      provider: new SwissEphemerisProvider(),
      utcInstant: resolved.utc,
      latitude: benchmarkBirthData.latitude,
      longitude: benchmarkBirthData.longitude,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.houseSystem).toBe("placidus");
    expect(result.houseCusps).toHaveLength(12);
    expect(result.angles.map((a) => a.type).sort()).toEqual(["ASC", "DESC", "IC", "MC"]);
  });

  it("buildWesternChart export đúng qua public API, pipeline đầy đủ BirthData -> NormalizedChart Tây phương thật với sign/house đã gán", () => {
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const result = buildWesternChart({
      provider: new SwissEphemerisProvider(),
      birthDataRef: "sha256:test-public-api",
      utcInstant: resolved.utc,
      latitude: benchmarkBirthData.latitude,
      longitude: benchmarkBirthData.longitude,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(validateNormalizedChart(result.chart)).toEqual([]);
    expect(result.chart.planets).toHaveLength(10);
    for (const planet of result.chart.planets) {
      expect(planet.sign).toBeDefined();
      expect(planet.house).not.toBeNull();
    }
    // aspects[] (Phase 3C) đã được điền qua public API, không cần gọi computeWesternAspects riêng.
    expect(result.chart.aspects.length).toBeGreaterThan(0);
  });

  it("computeWesternAspects/angularSeparation/WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY export đúng qua public API", () => {
    expect(angularSeparation(0, 180)).toBe(180);
    expect(WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY.id).toBe("western.major_aspects.modern_default.v1");
    const result = computeWesternAspects([
      { body: "a", longitude: 0 },
      { body: "b", longitude: 120 },
    ]);
    expect(result[0]?.type).toBe("trine");
  });
});

/**
 * Phase 4 (Steps 3/4/6 + Integration) — Vedic V1, qua ĐÚNG public barrel `../index.js`, KHÔNG
 * import trực tiếp `vedic/*.ts` nào. Bổ sung theo Phase 4 Closure Audit's finding: file này tồn
 * tại để bắt lỗi wiring export ở `index.ts`, nhưng trước bản sửa này chưa có test Phase 4 nào
 * chạy qua export public thật — chỉ dựa vào build/typecheck. Tái dùng ĐÚNG benchmark Hanoi đã có
 * ở trên (`benchmarkBirthData`) và các giá trị vàng đã xác nhận qua oracle ở Step 3/4/5/6, KHÔNG
 * tính lại/bịa số liệu mới.
 */
describe("public API — Phase 4 Vedic V1 (Rashi + Nakshatra/Pada + Vimshottari Dasha + Integration)", () => {
  it("calculateRashi/getSiderealLongitude/VEDIC_DEFAULT_AYANAMSA export đúng qua public API", () => {
    expect(VEDIC_DEFAULT_AYANAMSA).toBe("lahiri");
    expect(getSiderealLongitude(100, 24)).toBeCloseTo(76, 12);

    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const provider = new SwissEphemerisProvider();
    const sunTropical = provider.getPlanetPosition(resolved.utc, "sun").longitude;
    const rashi = calculateRashi({ provider, utcInstant: resolved.utc, tropicalLongitude: sunTropical });
    expect(rashi.ok).toBe(true);
    if (!rashi.ok) throw new Error("unreachable");
    expect(rashi.result.ayanamsaId).toBe("lahiri");
    expect(rashi.result.siderealLongitude).toBeCloseTo(327.7755, 3);
    expect(rashi.result.rashi).toBe("aquarius");
  });

  it("calculateNakshatraPosition/getNakshatraIndex/getNakshatraDegree/getNakshatraPada/getNakshatraLord + hằng số export đúng qua public API", () => {
    expect(NAKSHATRA_SPAN_DEGREES).toBeCloseTo(13.333333333333334, 9);
    expect(NAKSHATRA_PADA_SPAN_DEGREES).toBeCloseTo(3.3333333333333335, 9);
    expect(NAKSHATRA_NAMES).toHaveLength(27);

    const moonSidereal = 216.36443558161653; // Hanoi benchmark, khớp Step 3/4.
    const index = getNakshatraIndex(moonSidereal);
    expect(getNakshatraDegree(moonSidereal)).toBeCloseTo(3.031102, 5);
    expect(getNakshatraPada(moonSidereal)).toBe(1);
    expect(getNakshatraLord(index)).toBe("saturn");

    const position = calculateNakshatraPosition("moon", moonSidereal);
    expect(position).toMatchObject({ body: "moon", name: "anuradha", pada: 1, lord: "saturn" });
  });

  it("calculateVimshottariDasha + validate/serialize/deserialize + hằng số export đúng qua public API, khớp benchmark Hanoi đã duyệt Step 6", () => {
    expect(VIMSHOTTARI_DASHA_SCHEMA_VERSION).toBe("1.0.0");
    expect(VIMSHOTTARI_YEAR_CONVENTION_ID).toBe("mean_sidereal_year.365_256364");
    expect(VIMSHOTTARI_DAYS_PER_YEAR).toBe(365.256364);
    expect(VIMSHOTTARI_LORD_SEQUENCE).toEqual(["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"]);
    expect(Object.values(VIMSHOTTARI_LORD_YEARS).reduce((a, b) => a + b, 0)).toBe(120);

    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const provider = new SwissEphemerisProvider();
    const dashaResult = calculateVimshottariDasha({ provider, utcInstant: resolved.utc });
    expect(dashaResult.ok).toBe(true);
    if (!dashaResult.ok) throw new Error("unreachable");

    expect(dashaResult.result.startingNakshatra).toBe("anuradha");
    expect(dashaResult.result.startingMahadashaLord).toBe("saturn");
    expect(dashaResult.result.mahadashas).toHaveLength(9);
    expect(validateVimshottariMahadashaSequence(dashaResult.result)).toEqual([]);

    const json = serializeVimshottariMahadashaSequence(dashaResult.result);
    const roundTripped = deserializeVimshottariMahadashaSequence(json);
    expect(roundTripped.utcInstant.getTime()).toBe(dashaResult.result.utcInstant.getTime());
    expect(roundTripped.mahadashas[0]?.startUtc).toBeInstanceOf(Date);
  });

  it("calculateVedicCore (Integration/E2E) export đúng qua public API — pipeline đầy đủ BirthData -> Rashi + Nakshatra + Dasha thật", () => {
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const result = calculateVedicCore({
      provider: new SwissEphemerisProvider(),
      utcInstant: resolved.utc,
      bodies: ["sun", "moon", "saturn"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");

    expect(result.result.ayanamsaId).toBe("lahiri");
    expect(result.result.planets.map((p) => p.body)).toEqual(["sun", "moon", "saturn"]);
    expect(result.result.nakshatraPositions[1]).toMatchObject({ body: "moon", name: "anuradha", pada: 1, lord: "saturn" });
    expect(result.result.dasha).not.toBeNull();
    expect(result.result.dasha?.startingMahadashaLord).toBe("saturn");

    // giờ sinh không rõ qua public API: Dasha PHẢI là null, KHÔNG bịa object.
    const unknownTimeResult = calculateVedicCore({
      provider: new SwissEphemerisProvider(),
      utcInstant: resolved.utc,
      bodies: ["moon"],
      hasKnownLocalTime: false,
    });
    expect(unknownTimeResult.ok).toBe(true);
    if (!unknownTimeResult.ok) throw new Error("unreachable");
    expect(unknownTimeResult.result.dasha).toBeNull();
  });
});
