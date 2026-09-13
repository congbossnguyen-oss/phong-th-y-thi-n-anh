import { describe, expect, it } from "vitest";

import { resolveBirthDataInstant } from "../../timezone/resolveBirthDataInstant.js";
import type { BirthData } from "../../types.js";
import { validateNormalizedChart } from "../../chart/validation.js";
import { deserializeNormalizedChart, serializeNormalizedChart } from "../../chart/serialization.js";
import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { buildWesternChart } from "../chart.js";
import { signOfLongitude } from "../zodiac.js";

const HANOI_BIRTH_DATA: BirthData = {
  date: { year: 1985, month: 3, day: 12 },
  localTime: { hour: 8, minute: 30 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 10.7626,
  longitude: 106.6602,
};

function freshProvider(): SwissEphemerisProvider {
  return new SwissEphemerisProvider();
}

describe("buildWesternChart — pipeline đầy đủ: BirthData -> resolveBirthDataInstant -> NormalizedChart Tây phương thật", () => {
  it("cho ra chart hợp lệ (validateNormalizedChart sạch), đủ 10 hành tinh + 12 house cusps + 4 góc, mỗi hành tinh có sign/signDegree/house", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) return;

    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(validateNormalizedChart(result.chart)).toEqual([]);
    expect(result.chart.planets).toHaveLength(10);
    expect(result.chart.houseCusps).toHaveLength(12);
    expect(result.chart.angles.map((a) => a.type).sort()).toEqual(["ASC", "DESC", "IC", "MC"]);
    expect(result.chart.houseSystem).toBe("placidus");
    expect(result.chart.zodiacType).toBe("tropical");
    expect(result.chart.ayanamsa).toBeNull();

    for (const planet of result.chart.planets) {
      expect(planet.house).not.toBeNull();
    }
  });

  it("aspects[] (Phase 3C) được điền — khớp CHÍNH XÁC 2 aspect đã có trong fixture Phase 2 (Sun trine Saturn, Moon conjunction Saturn), tính từ CHÍNH 10 hành tinh thật của chart này (không chỉ 3 hành tinh của fixture)", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");
    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3c-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    if (!result.ok) throw new Error("unreachable");

    const sunSaturn = result.chart.aspects.find((a) => a.planetA === "sun" && a.planetB === "saturn");
    expect(sunSaturn?.type).toBe("trine");
    const moonSaturn = result.chart.aspects.find((a) => a.planetA === "moon" && a.planetB === "saturn");
    expect(moonSaturn?.type).toBe("conjunction");

    // KHÔNG có interpretation nào rò rỉ vào aspect — chỉ 7 field hình học đã định nghĩa.
    for (const aspect of result.chart.aspects) {
      expect(Object.keys(aspect).sort()).toEqual(["actualAngle", "exactAngle", "orb", "planetA", "planetB", "type", "withinOrb"]);
    }
  });

  it("Sun/Moon trong chart lắp ráp khớp CHÍNH XÁC fixture Phase 2 đã xác nhận đúng (cùng benchmark Hanoi)", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");
    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    if (!result.ok) throw new Error("unreachable");

    const sun = result.chart.planets.find((p) => p.body === "sun")!;
    const moon = result.chart.planets.find((p) => p.body === "moon")!;
    expect(sun.sign).toBe("pisces");
    expect(sun.house).toBe(11);
    expect(moon.sign).toBe("sagittarius");
    expect(moon.house).toBe(7);
  });

  it("ASC/MC/DESC/IC → Sign tính được qua signOfLongitude trên chính longitude đã lưu trong angles[] (KHÔNG có field 'sign' riêng trên NormalizedAngle — derived on demand, đúng nguyên tắc 'derived, not independently stored' đã áp dụng cho planets.sign)", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");
    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    if (!result.ok) throw new Error("unreachable");

    const byType = Object.fromEntries(result.chart.angles.map((a) => [a.type, a.longitude]));
    const ascSign = signOfLongitude(byType.ASC!);
    const mcSign = signOfLongitude(byType.MC!);
    const descSign = signOfLongitude(byType.DESC!);
    const icSign = signOfLongitude(byType.IC!);

    // DESC/IC luôn ở cung ĐỐI DIỆN (cách 6 cung / 180°) với ASC/MC theo hình học — kiểm tra bất biến này thay vì hardcode tên cung cụ thể.
    const ZODIAC_ORDER = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
    const oppositeSign = (s: string) => ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(s) + 6) % 12];
    expect(descSign).toBe(oppositeSign(ascSign));
    expect(icSign).toBe(oppositeSign(mcSign));
  });

  it("serialize/deserialize round-trip giữ nguyên planets/houseCusps/angles/houseSystem", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");
    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    if (!result.ok) throw new Error("unreachable");

    const roundTrip = deserializeNormalizedChart(serializeNormalizedChart(result.chart));
    expect(roundTrip.planets).toEqual(result.chart.planets);
    expect(roundTrip.houseCusps).toEqual(result.chart.houseCusps);
    expect(roundTrip.angles).toEqual(result.chart.angles);
    expect(roundTrip.aspects).toEqual(result.chart.aspects);
    expect(roundTrip.houseSystem).toBe(result.chart.houseSystem);
  });

  it("KHÔNG bịa field ngoài phạm vi đã implement: houses[]/points[]/nodes[]/dignities[] vẫn rỗng (aspects[] ĐÃ điền từ Phase 3C, không còn rỗng — xem test riêng ở trên)", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");
    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    if (!result.ok) throw new Error("unreachable");
    expect(result.chart.houses).toEqual([]);
    expect(result.chart.points).toEqual([]);
    expect(result.chart.nodes).toEqual([]);
    expect(result.chart.dignities).toEqual([]);
  });
});

describe("buildWesternChart — chart KHÔNG rõ giờ sinh (hasKnownLocalTime=false)", () => {
  it("houseCusps/angles rỗng, mọi hành tinh có house=null, vẫn validate sạch (đúng hệ quả đã tài liệu ở resolveBirthDataInstant.ts)", () => {
    const unknownTimeBirthData: BirthData = { ...HANOI_BIRTH_DATA, localTime: null };
    const resolution = resolveBirthDataInstant(unknownTimeBirthData);
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) return;

    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-unknown-time",
      utcInstant: resolution.utc,
      latitude: unknownTimeBirthData.latitude,
      longitude: unknownTimeBirthData.longitude,
      hasKnownLocalTime: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.chart.houseCusps).toEqual([]);
    expect(result.chart.angles).toEqual([]);
    for (const planet of result.chart.planets) {
      expect(planet.house).toBeNull();
      expect(planet.sign).toBeDefined(); // sign KHÔNG phụ thuộc giờ sinh, vẫn tính được
    }
    expect(validateNormalizedChart(result.chart)).toEqual([]);
  });
});

describe("buildWesternChart — vĩ độ cực dịch đúng lỗi UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE qua toàn bộ pipeline", () => {
  it("Placidus tại vĩ độ 70°N trả { ok: false } thay vì throw exception thô", () => {
    const result = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3b2-polar",
      utcInstant: new Date("2000-06-21T12:00:00.000Z"),
      latitude: 70,
      longitude: 25,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]!.code).toBe("UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE");
  });
});

describe("buildWesternChart — deterministic (ngoại trừ metadata.calculationId/calculatedAt, đúng ngoại lệ đã chấp nhận từ Phase 2)", () => {
  it("gọi lại nhiều lần cho cùng input luôn cho cùng planets/houseCusps/angles tuyệt đối", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");
    const input = {
      birthDataRef: "sha256:test-3b2-hanoi",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    };
    const first = buildWesternChart({ ...input, provider: freshProvider() });
    const second = buildWesternChart({ ...input, provider: freshProvider() });
    if (!first.ok || !second.ok) throw new Error("unreachable");
    expect(first.chart.planets).toEqual(second.chart.planets);
    expect(first.chart.houseCusps).toEqual(second.chart.houseCusps);
    expect(first.chart.angles).toEqual(second.chart.angles);
    expect(first.chart.aspects).toEqual(second.chart.aspects);
  });
});

describe("buildWesternChart — aspectOrbPolicy tuỳ chỉnh (Phase 3C)", () => {
  it("truyền một orb policy KHÁC (hẹp hơn) cho ra ÍT aspect hơn CHÍNH XÁC trên cùng chart thật", () => {
    const resolution = resolveBirthDataInstant(HANOI_BIRTH_DATA);
    if (!resolution.ok) throw new Error("unreachable");

    const withDefaultOrb = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3c-default-orb",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
    });
    const withNarrowOrb = buildWesternChart({
      provider: freshProvider(),
      birthDataRef: "sha256:test-3c-narrow-orb",
      utcInstant: resolution.utc,
      latitude: HANOI_BIRTH_DATA.latitude,
      longitude: HANOI_BIRTH_DATA.longitude,
      aspectOrbPolicy: {
        id: "test.narrow.v1",
        description: "Test-only: orb rất hẹp (1°) để xác nhận buildWesternChart truyền policy đúng, không hardcode.",
        definitions: [
          { type: "conjunction", exactAngle: 0, orbDegrees: 1 },
          { type: "sextile", exactAngle: 60, orbDegrees: 1 },
          { type: "square", exactAngle: 90, orbDegrees: 1 },
          { type: "trine", exactAngle: 120, orbDegrees: 1 },
          { type: "opposition", exactAngle: 180, orbDegrees: 1 },
        ],
      },
    });
    if (!withDefaultOrb.ok || !withNarrowOrb.ok) throw new Error("unreachable");
    expect(withDefaultOrb.chart.aspects.length).toBeGreaterThan(withNarrowOrb.chart.aspects.length);
    // Sun-Saturn trine có orb thật ~6.6865° — vượt quá orb hẹp 1° nên biến mất; Moon-Saturn conjunction (~1.9°) cũng vượt quá 1° nên cũng biến mất
    // (một cặp khác, Neptune-Saturn hoặc Neptune-Pluto, có thể vẫn còn vì orb thật của nó tình cờ < 1° — không giả định policy hẹp luôn cho ra mảng rỗng).
    expect(withNarrowOrb.chart.aspects.find((a) => a.planetA === "sun" && a.planetB === "saturn")).toBeUndefined();
    expect(withNarrowOrb.chart.aspects.find((a) => a.planetA === "moon" && a.planetB === "saturn")).toBeUndefined();
    for (const aspect of withNarrowOrb.chart.aspects) {
      expect(aspect.orb).toBeLessThanOrEqual(1);
    }
  });
});
