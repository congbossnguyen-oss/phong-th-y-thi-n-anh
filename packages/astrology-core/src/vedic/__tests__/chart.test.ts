import { describe, expect, it } from "vitest";

import type {
  AngleResult,
  AstronomicalProvider,
  AyanamsaId,
  CelestialBody,
  HouseCusps,
  NodePosition,
  PlanetPosition,
  ProviderMetadata,
} from "../../astronomical/AstronomicalProvider.js";
import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { SwissEphemerisUnsupportedBodyError } from "../../astronomical/providers/errors.js";
import { NAKSHATRA_SPAN_DEGREES } from "../nakshatra.js";
import { VIMSHOTTARI_DAYS_PER_YEAR, VIMSHOTTARI_YEAR_CONVENTION_ID } from "../dasha/vimshottari.js";
import { calculateVedicCore } from "../chart.js";

const HANOI_1985_UTC_INSTANT = new Date("1985-03-12T01:30:00.000Z");
const MUMBAI_1990_UTC_INSTANT = new Date("1990-06-15T06:30:00.000Z");

/**
 * Provider giả cho toàn bộ pipeline (Rashi + Nakshatra + Dasha đều cần) — mỗi `body` có tropical
 * longitude RIÊNG (Map), ayanamsa CỐ ĐỊNH — dùng để kiểm WIRING của orchestrator (thứ tự
 * planets[]/nakshatraPositions[], KHÔNG lẫn lộn hành tinh này với hành tinh khác), KHÔNG kiểm lại
 * công thức biên (đã kiểm kỹ ở unit test Step 3/4/6).
 */
function fakeVedicProvider(longitudesByBody: Record<string, number>, ayanamsa: number): AstronomicalProvider {
  const notUsed = (method: string) => () => {
    throw new Error(`fakeVedicProvider: ${method} không được dùng trong test này.`);
  };
  return {
    getMetadata: notUsed("getMetadata") as () => ProviderMetadata,
    getPlanetPosition: ((_utcInstant: Date, body: CelestialBody): PlanetPosition => {
      const longitude = longitudesByBody[body];
      if (longitude === undefined) throw new Error(`fakeVedicProvider: không có longitude cấu hình cho "${body}".`);
      return { body, longitude, latitude: 0, distanceAu: null, speedDegreesPerDay: 1, isRetrograde: false };
    }) as AstronomicalProvider["getPlanetPosition"],
    getNodePosition: notUsed("getNodePosition") as () => NodePosition,
    getHouseCusps: notUsed("getHouseCusps") as () => HouseCusps,
    getAscendant: notUsed("getAscendant") as () => AngleResult,
    getMidheaven: notUsed("getMidheaven") as () => AngleResult,
    getAyanamsa: ((_utcInstant: Date, _ayanamsaId: AyanamsaId): number => ayanamsa) as AstronomicalProvider["getAyanamsa"],
  };
}

/**
 * PIPELINE E2E (17 checkpoint theo yêu cầu task): UTC instant → Julian Day (chứng minh GIÁN TIẾP
 * qua longitude tropical đã validate JPL Horizons ở Phase 3A, JD không phải field công khai nào
 * — xem PHASE4_INTEGRATION_E2E.md) → ayanamsa ID/giá trị → tropical Mặt Trăng → sidereal Mặt
 * Trăng → Rashi/độ → Nakshatra/Pada/Lord → starting Mahadasha lord/elapsed/balance → chu kỳ 9
 * Mahadasha → thứ tự/liền mạch → year convention.
 */
describe("calculateVedicCore — pipeline E2E đầy đủ, benchmark Hanoi 1985-03-12 08:30 (Lahiri)", () => {
  const provider = new SwissEphemerisProvider();
  const result = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["sun", "moon", "saturn"] });

  it("thành công, đúng ayanamsaId/utcInstant/hasKnownLocalTime", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.ayanamsaId).toBe("lahiri");
      expect(result.result.utcInstant.getTime()).toBe(HANOI_1985_UTC_INSTANT.getTime());
      expect(result.result.hasKnownLocalTime).toBe(true);
    }
  });

  it("Rashi/D1 đúng cho cả 3 hành tinh, ĐÚNG thứ tự đã truyền vào bodies", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.planets.map((p) => p.body)).toEqual(["sun", "moon", "saturn"]);
      const sun = result.result.planets[0]!;
      const moon = result.result.planets[1]!;
      const saturn = result.result.planets[2]!;
      expect(sun.siderealLongitude).toBeCloseTo(327.7755, 3);
      expect(sun.rashi).toBe("aquarius");
      expect(moon.siderealLongitude).toBeCloseTo(216.3644, 3);
      expect(moon.rashi).toBe("scorpio");
      expect(saturn.siderealLongitude).toBeCloseTo(214.4621, 3);
      expect(saturn.rashi).toBe("scorpio");
      expect(sun.ayanamsaId).toBe("lahiri");
    }
  });

  it("Nakshatra/Pada/Lord đúng cho cả 3 hành tinh, ĐÚNG thứ tự, khớp fixture Step 4 đã duyệt", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.nakshatraPositions.map((n) => n.body)).toEqual(["sun", "moon", "saturn"]);
      expect(result.result.nakshatraPositions[0]).toMatchObject({ body: "sun", name: "purva_bhadrapada", pada: 3, lord: "jupiter" });
      expect(result.result.nakshatraPositions[1]).toMatchObject({ body: "moon", name: "anuradha", pada: 1, lord: "saturn" });
      expect(result.result.nakshatraPositions[2]).toMatchObject({ body: "saturn", name: "anuradha", pada: 1, lord: "saturn" });
    }
  });

  it("Vimshottari Dasha: starting lord/elapsed fraction/9 Mahadasha khớp Step 6 đã duyệt", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      const dasha = result.result.dasha;
      expect(dasha).not.toBeNull();
      expect(dasha!.startingNakshatra).toBe("anuradha");
      expect(dasha!.startingNakshatraLord).toBe("saturn");
      expect(dasha!.startingMahadashaLord).toBe("saturn");
      expect(dasha!.startingNakshatraElapsedFraction).toBeCloseTo(0.227333, 5);
      expect(dasha!.yearConventionId).toBe(VIMSHOTTARI_YEAR_CONVENTION_ID);
      expect(dasha!.mahadashas).toHaveLength(9);
      expect(dasha!.mahadashas.map((p) => p.lord)).toEqual(["saturn", "mercury", "ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter"]);
      expect(dasha!.mahadashas[0]!.startUtc.toISOString()).toBe("1980-11-15T09:40:29.980Z");
      // Liền mạch tuyệt đối + tổng đúng 120 năm.
      for (let i = 1; i < 9; i++) {
        expect(dasha!.mahadashas[i]!.startUtc.getTime()).toBe(dasha!.mahadashas[i - 1]!.endUtc.getTime());
      }
      expect(dasha!.mahadashas.reduce((sum, p) => sum + p.durationYears, 0)).toBe(120);
    }
  });
});

describe("calculateVedicCore — pipeline E2E, benchmark Mumbai 1990-06-15 12:00 (Lahiri) — fixture ĐỘC LẬP thứ 2", () => {
  const provider = new SwissEphemerisProvider();
  const result = calculateVedicCore({ provider, utcInstant: MUMBAI_1990_UTC_INSTANT, bodies: ["moon"] });

  it("Moon Nakshatra/Pada/Lord + Dasha khớp Step 5 Preflight/Step 6 đã tính", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.nakshatraPositions[0]).toMatchObject({ body: "moon", name: "shatabhisha", pada: 4, lord: "rahu" });
      const dasha = result.result.dasha!;
      expect(dasha.startingMahadashaLord).toBe("rahu");
      expect(dasha.startingNakshatraElapsedFraction).toBeCloseTo(0.893348, 5);
      expect(dasha.mahadashas.map((p) => p.lord)).toEqual(["rahu", "jupiter", "saturn", "mercury", "ketu", "venus", "sun", "moon", "mars"]);
      expect(dasha.mahadashas[0]!.startUtc.toISOString()).toBe("1974-05-16T20:31:10.710Z");
    }
  });
});

/**
 * ORACLE COMPARISON (A) cấu trúc / (B) sai khác quy ước đã biết — tái dùng NGUYÊN VĂN bằng chứng
 * đã có ở Step 3 (sidereal), Step 4 (Nakshatra/lord), Step 5 Preflight + Step 6 (Dasha), KHÔNG
 * tính lại từ đầu. Mục đích của bộ test này là xác nhận orchestrator KHÔNG làm hỏng/lệch những gì
 * từng lớp bên dưới ĐÃ chứng minh đúng, không phải re-derive bằng chứng oracle mới.
 */
describe("calculateVedicCore — oracle comparison (A) cấu trúc + (B) sai khác quy ước đã biết (KHÔNG dung sai tuỳ tiện)", () => {
  const provider = new SwissEphemerisProvider();

  it("(A) Structural: Nakshatra/lord/pada khớp TUYỆT ĐỐI PyJHora + vedic-calc (cả 2 oracle, cả 2 fixture) — xem PHASE4_STEP4_NAKSHATRA.md + PHASE4_STEP5_DASHA_PREFLIGHT.md", () => {
    const hanoi = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["moon"] });
    const mumbai = calculateVedicCore({ provider, utcInstant: MUMBAI_1990_UTC_INSTANT, bodies: ["moon"] });
    expect(hanoi.ok && mumbai.ok).toBe(true);
    if (hanoi.ok && mumbai.ok) {
      // Hanoi Moon = Anuradha #17 Pada 1 Lord Saturn — khớp CẢ PyJHora VÀ vedic-calc (Step 4).
      expect(hanoi.result.nakshatraPositions[0]).toMatchObject({ name: "anuradha", pada: 1, lord: "saturn" });
      // Mumbai Moon = Shatabhisha #24 Pada 4 Lord Rahu — khớp CẢ PyJHora VÀ vedic-calc (Step 5 Preflight).
      expect(mumbai.result.nakshatraPositions[0]).toMatchObject({ name: "shatabhisha", pada: 4, lord: "rahu" });
    }
  });

  it("(B) Known convention differences: sai khác ngày Mahadasha đầu tiên so PyJHora(TRUE_SIDEREAL_YEAR)/vedic-calc(365.25) nằm ĐÚNG trong biên đã quy kết ở Step 6 — KHÔNG dùng dung sai chung chung", () => {
    const MAX_DAYS_VS_PYJHORA_TRUE_SIDEREAL = 0.5; // Step 6: quan sát 0.089/0.204 ngày.
    const MAX_DAYS_VS_VEDIC_CALC = 3; // Step 6: quan sát 2.090/1.394 ngày.
    const pyjhoraTrueHanoi = Date.UTC(1980, 10, 15, 11, 49, 15);
    const vedicCalcHanoi = new Date("1980-11-17T11:50:02.634Z").getTime();

    const hanoi = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["moon"] });
    expect(hanoi.ok).toBe(true);
    if (hanoi.ok) {
      const projectStart = hanoi.result.dasha!.mahadashas[0]!.startUtc.getTime();
      expect(Math.abs(projectStart - pyjhoraTrueHanoi) / 86400000).toBeLessThan(MAX_DAYS_VS_PYJHORA_TRUE_SIDEREAL);
      expect(Math.abs(projectStart - vedicCalcHanoi) / 86400000).toBeLessThan(MAX_DAYS_VS_VEDIC_CALC);
    }
  });
});

describe("calculateVedicCore — biên Nakshatra/Pada/wraparound qua fakeVedicProvider (kiểm WIRING, không lặp lại toán học biên đã kiểm ở Step 3/4/6)", () => {
  const FIXED_AYANAMSA = 24;

  it("Moon ĐÚNG TẠI 1 ranh giới Nakshatra: Rashi + Nakshatra + Dasha ĐỀU nhất quán từ CÙNG 1 sidereal longitude", () => {
    const siderealBoundary = 5 * NAKSHATRA_SPAN_DEGREES; // điểm bắt đầu Nakshatra #6 (Ardra), lord=rahu.
    const provider = fakeVedicProvider({ moon: siderealBoundary + FIXED_AYANAMSA }, FIXED_AYANAMSA);
    const result = calculateVedicCore({ provider, utcInstant: new Date("2000-01-01T00:00:00.000Z"), bodies: ["moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.planets[0]!.siderealLongitude).toBeCloseTo(siderealBoundary, 9);
      expect(result.result.nakshatraPositions[0]!.name).toBe("ardra");
      expect(result.result.nakshatraPositions[0]!.lord).toBe("rahu");
      expect(result.result.dasha!.startingMahadashaLord).toBe("rahu");
      expect(result.result.dasha!.startingNakshatraElapsedFraction).toBeCloseTo(0, 9);
    }
  });

  it("wraparound 360°/0°: Moon ở longitude tropical khiến sidereal âm (< 0 trước chuẩn hoá) vẫn ra kết quả đúng, nhất quán Rashi/Nakshatra/Dasha", () => {
    const provider = fakeVedicProvider({ moon: 2 }, FIXED_AYANAMSA); // sidereal = 2 - 24 = -22 => chuẩn hoá 338.
    const result = calculateVedicCore({ provider, utcInstant: new Date("2000-01-01T00:00:00.000Z"), bodies: ["moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.planets[0]!.siderealLongitude).toBeCloseTo(338, 9);
      expect(result.result.planets[0]!.rashi).toBe("pisces"); // 338 nằm trong [330,360).
      expect(result.result.nakshatraPositions[0]!.name).toBe("uttara_bhadrapada"); // 338/13.333=25.35 => index 25.
    }
  });

  it("nhiều hành tinh KHÔNG bị lẫn lộn longitude của nhau (kiểm wiring theo body, không phải theo thứ tự mảng)", () => {
    const provider = fakeVedicProvider({ sun: 24, moon: 24 + NAKSHATRA_SPAN_DEGREES * 10, saturn: 24 + NAKSHATRA_SPAN_DEGREES * 20 }, FIXED_AYANAMSA);
    const result = calculateVedicCore({ provider, utcInstant: new Date("2000-01-01T00:00:00.000Z"), bodies: ["saturn", "sun", "moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const byBody = Object.fromEntries(result.result.nakshatraPositions.map((n) => [n.body, n.name]));
      expect(byBody["sun"]).toBe("ashwini"); // index 0
      expect(byBody["moon"]).toBe("purva_phalguni"); // index 10, xem NAKSHATRA_NAMES thứ tự Step 4.
      expect(byBody["saturn"]).toBe("uttara_ashadha"); // index 20.
      expect(result.result.planets.map((p) => p.body)).toEqual(["saturn", "sun", "moon"]); // giữ ĐÚNG thứ tự input, KHÔNG tự sắp xếp lại.
    }
  });
});

describe("calculateVedicCore — Dasha balance gần 0%/100% qua orchestrator (kiểm wiring, công thức đã kiểm ở Step 6)", () => {
  const FIXED_AYANAMSA = 24;

  it("balance gần 0% (elapsedFraction nhỏ) lan truyền đúng vào dasha.startingNakshatraElapsedFraction", () => {
    const provider = fakeVedicProvider({ moon: FIXED_AYANAMSA + NAKSHATRA_SPAN_DEGREES * 0.0002 }, FIXED_AYANAMSA);
    const result = calculateVedicCore({ provider, utcInstant: new Date("2000-01-01T00:00:00.000Z"), bodies: ["moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.dasha!.startingNakshatraElapsedFraction).toBeCloseTo(0.0002, 5);
  });

  it("balance gần 100% (elapsedFraction gần 1) lan truyền đúng, Mahadasha đầu SẮP hết ngay tại sinh", () => {
    const provider = fakeVedicProvider({ moon: FIXED_AYANAMSA + NAKSHATRA_SPAN_DEGREES * 0.9998 }, FIXED_AYANAMSA);
    const utcInstant = new Date("2000-01-01T00:00:00.000Z");
    const result = calculateVedicCore({ provider, utcInstant, bodies: ["moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.dasha!.startingNakshatraElapsedFraction).toBeCloseTo(0.9998, 5);
      const remainingDays = (result.result.dasha!.mahadashas[0]!.endUtc.getTime() - utcInstant.getTime()) / 86400000;
      expect(remainingDays).toBeGreaterThan(0);
      expect(remainingDays / VIMSHOTTARI_DAYS_PER_YEAR).toBeLessThan(1); // Ashwini lord Ketu = 7 năm đầy đủ, còn lại < 1 năm.
    }
  });
});

describe("calculateVedicCore — độ chính xác giờ sinh + date rollover (kiểm wiring)", () => {
  it("2 utcInstant lệch vài phút => mahadashas[0].startUtc lệch ĐÚNG cùng khoảng (không cắt về ngày tròn)", () => {
    const provider = fakeVedicProvider({ moon: 30 + 24 }, 24);
    const a = new Date("2000-01-01T00:00:00.000Z");
    const b = new Date("2000-01-01T00:05:00.000Z");
    const resultA = calculateVedicCore({ provider, utcInstant: a, bodies: ["moon"] });
    const resultB = calculateVedicCore({ provider, utcInstant: b, bodies: ["moon"] });
    expect(resultA.ok && resultB.ok).toBe(true);
    if (resultA.ok && resultB.ok) {
      const delta = resultB.result.dasha!.mahadashas[0]!.startUtc.getTime() - resultA.result.dasha!.mahadashas[0]!.startUtc.getTime();
      expect(delta).toBe(b.getTime() - a.getTime());
    }
  });

  it("chu kỳ 120 năm thật (Hanoi) trải qua nhiều lần giao năm dương lịch — JS Date xử lý đúng", () => {
    const provider = new SwissEphemerisProvider();
    const result = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const last = result.result.dasha!.mahadashas.at(-1)!;
      expect(last.endUtc.getUTCFullYear()).toBeGreaterThan(HANOI_1985_UTC_INSTANT.getUTCFullYear() + 100);
    }
  });
});

/**
 * UNKNOWN BIRTH TIME (mandatory). Xác nhận orchestrator KHÔNG bao giờ tự bịa giờ sinh: Rashi/
 * Nakshatra vẫn tính được (D6 đã duyệt — dùng longitude/utcInstant đã cho, kể cả nếu đó là mốc
 * nửa đêm thay thế từ `resolveBirthDataInstant`), nhưng Dasha LUÔN là `null` khi
 * `hasKnownLocalTime=false` — KHÔNG BAO GIỜ là một object "unavailable" bịa ra.
 */
describe("calculateVedicCore — giờ sinh KHÔNG rõ (hasKnownLocalTime=false), KHÔNG suy đoán giờ (mandatory)", () => {
  const provider = new SwissEphemerisProvider();

  it("hasKnownLocalTime=false => dasha === null (KHÔNG phải object 'unavailable' bịa ra), Rashi/Nakshatra VẪN tính", () => {
    const result = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["sun", "moon", "saturn"], hasKnownLocalTime: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.hasKnownLocalTime).toBe(false);
      expect(result.result.dasha).toBeNull();
      expect(result.result.planets).toHaveLength(3);
      expect(result.result.planets[1]!.rashi).toBe("scorpio"); // Moon vẫn tính Rashi bình thường.
      expect(result.result.nakshatraPositions[1]).toMatchObject({ body: "moon", name: "anuradha" }); // Nakshatra vẫn tính bình thường.
    }
  });

  it("hasKnownLocalTime mặc định true khi bỏ trống — Dasha ĐƯỢC tính", () => {
    const result = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["moon"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.hasKnownLocalTime).toBe(true);
      expect(result.result.dasha).not.toBeNull();
    }
  });

  it("KHÔNG có nhánh nào trong calculateVedicCore gọi Date.now()/suy đoán giờ khi hasKnownLocalTime=false — 2 utcInstant KHÁC NHAU (cùng hasKnownLocalTime=false) vẫn cho Rashi/Nakshatra KHÁC NHAU tương ứng, chứng minh utcInstant thật sự được dùng chứ không bị bỏ qua để dùng giờ mặc định ẩn nào khác", () => {
    const resultA = calculateVedicCore({ provider, utcInstant: HANOI_1985_UTC_INSTANT, bodies: ["moon"], hasKnownLocalTime: false });
    const resultB = calculateVedicCore({ provider, utcInstant: MUMBAI_1990_UTC_INSTANT, bodies: ["moon"], hasKnownLocalTime: false });
    expect(resultA.ok && resultB.ok).toBe(true);
    if (resultA.ok && resultB.ok) {
      expect(resultA.result.nakshatraPositions[0]!.name).not.toBe(resultB.result.nakshatraPositions[0]!.name);
      expect(resultA.result.dasha).toBeNull();
      expect(resultB.result.dasha).toBeNull();
    }
  });
});

describe("calculateVedicCore — ánh xạ lỗi provider (đúng quy ước calculateRashi/calculateVimshottariDasha)", () => {
  it("hành tinh không được provider hỗ trợ => UNSUPPORTED_FEATURE, KHÔNG throw, dừng ở lỗi ĐẦU TIÊN (dừng tại body gây lỗi, KHÔNG tính tiếp các body sau)", () => {
    const provider: AstronomicalProvider = {
      ...fakeVedicProvider({ sun: 24 }, 24),
      getPlanetPosition: ((_utcInstant: Date, body: CelestialBody): PlanetPosition => {
        if (body === "sun") return { body, longitude: 24, latitude: 0, distanceAu: null, speedDegreesPerDay: 1, isRetrograde: false };
        throw new SwissEphemerisUnsupportedBodyError(body);
      }) as AstronomicalProvider["getPlanetPosition"],
    };
    const result = calculateVedicCore({ provider, utcInstant: new Date(), bodies: ["sun", "moon"] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe("UNSUPPORTED_FEATURE");
    }
  });

  it("lỗi lạ không nhận diện được => throw nguyên văn, KHÔNG nuốt thành mã chung chung sai nghĩa", () => {
    const provider = fakeVedicProvider({ sun: 24 }, 24); // "moon" không được cấu hình => fakeVedicProvider tự throw Error thường (không phải SwissEphemeris*Error nào).
    expect(() => calculateVedicCore({ provider, utcInstant: new Date(), bodies: ["sun", "moon"] })).toThrow();
  });
});
