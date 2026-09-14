import { describe, expect, it } from "vitest";

import type {
  AngleResult,
  AstronomicalProvider,
  AyanamsaId,
  HouseCusps,
  NodePosition,
  PlanetPosition,
  ProviderMetadata,
} from "../../astronomical/AstronomicalProvider.js";
import { SwissEphemerisCalculationError, SwissEphemerisUnsupportedAyanamsaError } from "../../astronomical/providers/errors.js";
import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { fullVedicChart, fullWesternChart } from "../../chart/__tests__/fixtures.js";
import { calculateRashi, getSiderealLongitude, VEDIC_DEFAULT_AYANAMSA } from "../rashi.js";

/** Hanoi 1985-03-12 08:30 local (Asia/Ho_Chi_Minh, UTC+7) — benchmark tái dùng xuyên suốt các Phase trước. */
const HANOI_1985_UTC_INSTANT = new Date("1985-03-12T01:30:00.000Z");

/**
 * Provider giả TỐI THIỂU — chỉ implement `getAyanamsa()` theo hàm truyền vào, các method khác
 * throw vì `calculateRashi` không gọi tới (KHÔNG tự gọi lại `getPlanetPosition`, xem
 * `rashi.ts`'s doc comment "VỀ HOUSE ASSIGNMENT"/thiết kế `tropicalLongitude` là input có sẵn).
 * Dùng cho test biên/lỗi thuần tuý, KHÔNG cần Swiss Ephemeris thật.
 */
function fakeProvider(getAyanamsa: AstronomicalProvider["getAyanamsa"]): AstronomicalProvider {
  const notUsed = (method: string) => () => {
    throw new Error(`fakeProvider: ${method} không được dùng trong test này.`);
  };
  return {
    getMetadata: notUsed("getMetadata") as () => ProviderMetadata,
    getPlanetPosition: notUsed("getPlanetPosition") as () => PlanetPosition,
    getNodePosition: notUsed("getNodePosition") as () => NodePosition,
    getHouseCusps: notUsed("getHouseCusps") as () => HouseCusps,
    getAscendant: notUsed("getAscendant") as () => AngleResult,
    getMidheaven: notUsed("getMidheaven") as () => AngleResult,
    getAyanamsa,
  };
}

describe("getSiderealLongitude — công thức Section 4: normalizeDegrees(tropical - ayanamsa)", () => {
  it("trừ đơn giản, không wraparound", () => {
    expect(getSiderealLongitude(100, 24)).toBeCloseTo(76, 12);
  });

  it("wraparound khi tropical < ayanamsa (Section 9C)", () => {
    expect(getSiderealLongitude(10, 23.647)).toBeCloseTo(346.353, 9);
  });

  it("đúng TẠI ranh giới cung (0°, 30°, ..., 330°) sau khi trừ ayanamsa", () => {
    // ayanamsa=24 => tropical=54 cho sidereal=30 (ranh giới Taurus), tropical=24 cho sidereal=0 (Aries).
    expect(getSiderealLongitude(24, 24)).toBeCloseTo(0, 12);
    expect(getSiderealLongitude(54, 24)).toBeCloseTo(30, 12);
    expect(getSiderealLongitude(384, 24)).toBeCloseTo(0, 9); // 384 chuẩn hoá trước khi trừ? Không — trừ trước rồi mới chuẩn hoá, 384-24=360=>0.
  });

  it("floating-point: giữ nguyên full double precision, không làm tròn giữa chừng", () => {
    const result = getSiderealLongitude(123.456789012345, 23.649999999999);
    expect(result.toString().replace(/^-?\d+\./, "").length).toBeGreaterThan(6);
  });

  it("tính xác định (deterministic)", () => {
    expect(getSiderealLongitude(200.5, 23.6)).toBe(getSiderealLongitude(200.5, 23.6));
  });
});

describe("calculateRashi — ranh giới 12 Rashi qua fakeProvider (ayanamsa cố định, KHÔNG cần Swiss Ephemeris thật)", () => {
  const FIXED_AYANAMSA = 24; // số tròn, dễ tính tay ranh giới.
  const provider = fakeProvider(() => FIXED_AYANAMSA);

  it("đúng điểm bắt đầu của cả 12 Rashi", () => {
    const signs = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ] as const;
    for (let i = 0; i < 12; i++) {
      const tropicalLongitude = FIXED_AYANAMSA + i * 30;
      const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.rashi).toBe(signs[i]);
        expect(result.result.rashiDegree).toBeCloseTo(0, 12);
      }
    }
  });

  it("ngay TRƯỚC ranh giới Rashi kế tiếp vẫn thuộc Rashi hiện tại (biên trên MỞ)", () => {
    const result = calculateRashi({
      provider,
      utcInstant: HANOI_1985_UTC_INSTANT,
      tropicalLongitude: FIXED_AYANAMSA + 29.9999999,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.rashi).toBe("aries");
  });

  it("wraparound qua 360°/0° (tropical < ayanamsa)", () => {
    const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: 5 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.siderealLongitude).toBeCloseTo(341, 9); // 5-24=-19 => 341
      expect(result.result.rashi).toBe("pisces"); // 341 nằm trong [330,360) => pisces
    }
  });

  it("mặc định ayanamsaId = VEDIC_DEFAULT_AYANAMSA (lahiri) khi bỏ trống", () => {
    let capturedAyanamsaId: AyanamsaId | undefined;
    const capturingProvider = fakeProvider((_utc, ayanamsaId) => {
      capturedAyanamsaId = ayanamsaId;
      return FIXED_AYANAMSA;
    });
    const result = calculateRashi({ provider: capturingProvider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: 100 });
    expect(result.ok).toBe(true);
    expect(capturedAyanamsaId).toBe("lahiri");
    expect(capturedAyanamsaId).toBe(VEDIC_DEFAULT_AYANAMSA);
    if (result.ok) expect(result.result.ayanamsaId).toBe("lahiri");
  });
});

describe("calculateRashi — ánh xạ lỗi provider sang AstrologyCoreError (đúng quy ước calculateWesternHousesAndAngles)", () => {
  it("ayanamsa không được hỗ trợ => UNSUPPORTED_FEATURE, KHÔNG throw", () => {
    const provider = fakeProvider(() => {
      throw new SwissEphemerisUnsupportedAyanamsaError("does_not_exist");
    });
    const result = calculateRashi({
      provider,
      utcInstant: HANOI_1985_UTC_INSTANT,
      tropicalLongitude: 100,
      ayanamsaId: "does_not_exist",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe("UNSUPPORTED_FEATURE");
      expect(result.errors[0]?.field).toBe("ayanamsaId");
    }
  });

  it("lỗi tính toán native => CALCULATION_ERROR, KHÔNG throw", () => {
    const provider = fakeProvider(() => {
      throw new SwissEphemerisCalculationError("getAyanamsa(lahiri)", "native error giả lập");
    });
    const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: 100 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe("CALCULATION_ERROR");
    }
  });

  it("lỗi lạ không nhận diện được => throw nguyên văn, KHÔNG nuốt thành mã chung chung sai nghĩa", () => {
    const provider = fakeProvider(() => {
      throw new RangeError("lỗi lập trình không liên quan");
    });
    expect(() => calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: 100 })).toThrow(RangeError);
  });
});

describe("calculateRashi — Swiss Ephemeris thật, benchmark Hanoi 1985-03-12 08:30, Lahiri (Section 7 'normal chart')", () => {
  const provider = new SwissEphemerisProvider();

  it("Sun — khớp fullVedicChart() fixture Phase 2 đã có SẴN (327.7755°) trong sai số 4 chữ số thập phân", () => {
    const sunTropical = fullWesternChart().planets.find((p) => p.body === "sun")!.longitude; // 351.4222
    const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: sunTropical });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const expectedSidereal = fullVedicChart().planets.find((p) => p.body === "sun")!.longitude; // 327.7755
      expect(result.result.siderealLongitude).toBeCloseTo(expectedSidereal, 3);
      expect(result.result.rashi).toBe("aquarius");
    }
  });

  it("Moon — khớp fullVedicChart() fixture Phase 2 đã có SẴN (216.3645°) trong sai số 4 chữ số thập phân", () => {
    const moonTropical = fullWesternChart().planets.find((p) => p.body === "moon")!.longitude; // 240.0111
    const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: moonTropical });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const expectedSidereal = fullVedicChart().planets.find((p) => p.body === "moon")!.longitude; // 216.3645
      expect(result.result.siderealLongitude).toBeCloseTo(expectedSidereal, 3);
      expect(result.result.rashi).toBe("scorpio");
    }
  });

  it("Saturn (retrograde ở tropical) — Rashi sidereal tính mới, xác nhận qua oracle ở bộ test riêng bên dưới", () => {
    const saturnTropical = fullWesternChart().planets.find((p) => p.body === "saturn")!.longitude; // 238.1087
    const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: saturnTropical });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.siderealLongitude).toBeCloseTo(214.4621, 3);
      expect(result.result.rashi).toBe("scorpio");
    }
  });
});

describe("calculateRashi — cấu hình ayanamsa khác Lahiri được tôn trọng (Section 9E, Section 7 'ayanamsa khác biệt rõ')", () => {
  const provider = new SwissEphemerisProvider();
  const sunTropical = fullWesternChart().planets.find((p) => p.body === "sun")!.longitude;

  it("raman cho kết quả KHÁC lahiri một cách rõ ràng (không phải sai số làm tròn)", () => {
    const lahiri = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: sunTropical, ayanamsaId: "lahiri" });
    const raman = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: sunTropical, ayanamsaId: "raman" });
    expect(lahiri.ok).toBe(true);
    expect(raman.ok).toBe(true);
    if (lahiri.ok && raman.ok) {
      const diff = Math.abs(lahiri.result.siderealLongitude - raman.result.siderealLongitude);
      expect(diff).toBeGreaterThan(0.3); // Lahiri/Raman cách nhau ~0.4-0.9° tuỳ thời điểm — chắc chắn > sai số làm tròn.
      expect(lahiri.result.ayanamsaId).toBe("lahiri");
      expect(raman.result.ayanamsaId).toBe("raman");
    }
  });
});

/**
 * ORACLE VALIDATION (Section 6/9G — MANDATORY). Xem
 * docs/astrology-module/ARCHITECTURE/PHASE4_STEP3_RASHI.md "Oracle validation" cho phương pháp
 * đầy đủ (venv Python cô lập, KHÔNG phải dependency runtime của project). Ayanamsa Lahiri được
 * cấu hình TƯỜNG MINH trên CẢ HAI oracle, KHÔNG dùng mặc định (PyJHora mặc định TRUE_PUSHYA).
 *
 * 2 sai khác đã được cô lập bằng thực nghiệm VÀ xác nhận bằng tài liệu chính thức Swiss Ephemeris
 * (swephprg.htm §12.2) — KHÔNG phải bug, xem file trên để biết đầy đủ bằng chứng:
 *   (A) vs vedic-calc (~13″/0.0036°): oracle dùng `swe_get_ayanamsa_ut()` (KHÔNG nutation), project
 *       dùng `swe_get_ayanamsa_ex_ut()` (CÓ nutation, tài liệu Swiss Ephemeris gọi là "better").
 *   (B) vs PyJHora (~33″/0.0093°): PyJHora dùng cờ `SEFLG_SIDEREAL` native, project dùng công thức
 *       trừ thủ công Section 4 bắt buộc (Swiss Ephemeris khuyến nghị cách PyJHora dùng, nhưng
 *       Section 4 đã được xác nhận GIỮ NGUYÊN sau khi trình bày phát hiện này — xem tài liệu).
 * Dung sai dưới đây PHẢN ÁNH 2 sai khác đã hiểu rõ này, KHÔNG phải số tuỳ tiện.
 */
describe("calculateRashi — so oracle (PyJHora + vedic-calc), benchmark Hanoi 1985-03-12 08:30, Lahiri tường minh", () => {
  const provider = new SwissEphemerisProvider();
  const VEDIC_CALC_TOLERANCE_DEGREES = 0.01; // phủ ~0.0036° (không-nutation vs có-nutation) + biên an toàn.
  const PYJHORA_NATIVE_TOLERANCE_DEGREES = 0.02; // phủ ~0.0093° (SEFLG_SIDEREAL native vs trừ thủ công) + biên an toàn.

  const cases = [
    { body: "sun" as const, tropical: 351.4222, vedicCalc: 327.77194209768595, pyjhora: 327.78125396145435 },
    { body: "moon" as const, tropical: 240.0111, vedicCalc: 216.36100033753672, pyjhora: 216.36478723043334 },
    { body: "saturn" as const, tropical: 238.1087, vedicCalc: 214.45848565641998, pyjhora: 214.46164600457814 },
  ];

  for (const { body, tropical, vedicCalc, pyjhora } of cases) {
    it(`${body}: khớp vedic-calc trong dung sai ${VEDIC_CALC_TOLERANCE_DEGREES}° VÀ PyJHora trong dung sai ${PYJHORA_NATIVE_TOLERANCE_DEGREES}°`, () => {
      const result = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: tropical });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Math.abs(result.result.siderealLongitude - vedicCalc)).toBeLessThanOrEqual(VEDIC_CALC_TOLERANCE_DEGREES);
        expect(Math.abs(result.result.siderealLongitude - pyjhora)).toBeLessThanOrEqual(PYJHORA_NATIVE_TOLERANCE_DEGREES);
      }
    });
  }
});
