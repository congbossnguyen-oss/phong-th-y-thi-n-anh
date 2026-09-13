import { describe, expect, it } from "vitest";

import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { calculateWesternHousesAndAngles } from "../houses.js";
import { mapWesternPlanetPositions, WESTERN_CORE_BODIES } from "../planets.js";
import { signDegreeOfLongitude, signOfLongitude } from "../zodiac.js";

/** QUAN TRỌNG: xem ghi chú process-wide state ở `SwissEphemerisProvider.test.ts` — mỗi test tự dựng provider mới. */
function freshProvider(): SwissEphemerisProvider {
  return new SwissEphemerisProvider();
}

const HANOI_UTC = new Date("1985-03-12T01:30:00.000Z");
const HANOI_LAT = 10.7626;
const HANOI_LON = 106.6602;

function hanoiHouseCusps() {
  const result = calculateWesternHousesAndAngles({
    provider: freshProvider(),
    utcInstant: HANOI_UTC,
    latitude: HANOI_LAT,
    longitude: HANOI_LON,
  });
  if (!result.ok) throw new Error("unreachable");
  return result.houseCusps;
}

describe("mapWesternPlanetPositions — pipeline đầy đủ: provider thật -> sign/signDegree/house", () => {
  it("trả đúng 10 hành tinh (WESTERN_CORE_BODIES), mỗi hành tinh có sign/signDegree/house khớp CHÍNH XÁC signOfLongitude/signDegreeOfLongitude của chính longitude đó", () => {
    const houseCusps = hanoiHouseCusps();
    const result = mapWesternPlanetPositions({
      provider: freshProvider(),
      utcInstant: HANOI_UTC,
      bodies: WESTERN_CORE_BODIES,
      houseCusps,
      precisionClass: "file_based",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.planets).toHaveLength(10);
    for (const p of result.planets) {
      expect(p.sign).toBe(signOfLongitude(p.longitude));
      expect(p.signDegree).toBeCloseTo(signDegreeOfLongitude(p.longitude), 9);
      expect(p.house).not.toBeNull();
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(p.precision).toBe(0.0001); // file_based
      expect(p.source).toBe("astronomical_core");
    }
  });

  it("longitude/latitude/speed/isRetrograde GIỮ NGUYÊN số liệu thô từ provider — KHÔNG làm tròn, KHÔNG tính lại", () => {
    const houseCusps = hanoiHouseCusps();
    const provider = freshProvider();
    const raw = provider.getPlanetPosition(HANOI_UTC, "sun");
    const result = mapWesternPlanetPositions({
      provider: freshProvider(),
      utcInstant: HANOI_UTC,
      bodies: ["sun"],
      houseCusps,
      precisionClass: "file_based",
    });
    if (!result.ok) throw new Error("unreachable");
    const sun = result.planets[0]!;
    expect(sun.longitude).toBe(raw.longitude);
    expect(sun.latitude).toBe(raw.latitude);
    expect(sun.distanceAu).toBe(raw.distanceAu);
    expect(sun.speedDegreesPerDay).toBe(raw.speedDegreesPerDay);
    expect(sun.isRetrograde).toBe(raw.isRetrograde);
  });

  it("Sun/Moon khớp CHÍNH XÁC 2 giá trị đã xác nhận đúng của fixture Phase 2 (cùng benchmark Hanoi)", () => {
    const houseCusps = hanoiHouseCusps();
    const result = mapWesternPlanetPositions({
      provider: freshProvider(),
      utcInstant: HANOI_UTC,
      bodies: ["sun", "moon"],
      houseCusps,
      precisionClass: "file_based",
    });
    if (!result.ok) throw new Error("unreachable");
    const sun = result.planets.find((p) => p.body === "sun")!;
    const moon = result.planets.find((p) => p.body === "moon")!;
    expect(sun.sign).toBe("pisces");
    expect(sun.house).toBe(11);
    expect(moon.sign).toBe("sagittarius");
    expect(moon.house).toBe(7);
  });
});

describe("mapWesternPlanetPositions — chart KHÔNG rõ giờ sinh (houseCusps rỗng) -> house luôn null", () => {
  it("houseCusps=[] khiến MỌI hành tinh có house=null, sign/signDegree vẫn tính được bình thường (không phụ thuộc giờ)", () => {
    const result = mapWesternPlanetPositions({
      provider: freshProvider(),
      utcInstant: HANOI_UTC,
      bodies: ["sun", "moon"],
      houseCusps: [],
      precisionClass: "file_based",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const p of result.planets) {
      expect(p.house).toBeNull();
      expect(p.sign).toBeDefined();
    }
  });
});

describe("mapWesternPlanetPositions — precisionClass quyết định field precision", () => {
  it("analytic_fallback -> precision = 0.01", () => {
    const result = mapWesternPlanetPositions({
      provider: freshProvider(),
      utcInstant: HANOI_UTC,
      bodies: ["sun"],
      houseCusps: [],
      precisionClass: "analytic_fallback",
    });
    if (!result.ok) throw new Error("unreachable");
    expect(result.planets[0]!.precision).toBe(0.01);
  });
});

describe("mapWesternPlanetPositions — lỗi thiên thể không hỗ trợ dịch sang UNSUPPORTED_FEATURE", () => {
  it("body lạ trả { ok: false } với code UNSUPPORTED_FEATURE, KHÔNG throw exception thô ra ngoài", () => {
    const result = mapWesternPlanetPositions({
      provider: freshProvider(),
      utcInstant: HANOI_UTC,
      bodies: ["sun", "not_a_real_body"],
      houseCusps: [],
      precisionClass: "file_based",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]!.code).toBe("UNSUPPORTED_FEATURE");
    expect(result.errors[0]!.field).toBe("body");
  });
});

describe("mapWesternPlanetPositions — deterministic", () => {
  it("gọi lại nhiều lần cho cùng input luôn cho cùng output tuyệt đối", () => {
    const houseCusps = hanoiHouseCusps();
    const input = { provider: freshProvider(), utcInstant: HANOI_UTC, bodies: WESTERN_CORE_BODIES, houseCusps, precisionClass: "file_based" as const };
    const first = mapWesternPlanetPositions(input);
    const second = mapWesternPlanetPositions({ ...input, provider: freshProvider() });
    expect(first).toEqual(second);
  });
});
