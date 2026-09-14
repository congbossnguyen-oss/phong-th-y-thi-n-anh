import { describe, expect, it } from "vitest";

import type {
  AngleResult,
  AstronomicalProvider,
  AyanamsaId,
  HouseCusps,
  HouseSystemId,
  NodePosition,
  PlanetPosition,
  ProviderMetadata,
} from "../../astronomical/AstronomicalProvider.js";
import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { SwissEphemerisUnsupportedAyanamsaError } from "../../astronomical/providers/errors.js";
import { ZODIAC_SIGNS } from "../../chart/types.js";
import { calculateRashi } from "../rashi.js";
import { getWholeSignHouseNumber } from "../houses.js";
import { calculateVedicAscendant } from "../ascendant.js";

const HANOI_1985_UTC_INSTANT = new Date("1985-03-12T01:30:00.000Z");
const HANOI = { latitude: 21.0285, longitude: 105.8542 };
const MUMBAI_1990_UTC_INSTANT = new Date("1990-06-15T06:30:00.000Z");
const MUMBAI = { latitude: 19.076, longitude: 72.878 };
const SYDNEY_1978_UTC_INSTANT = new Date("1978-11-05T03:15:00.000Z");
const SYDNEY = { latitude: -33.8688, longitude: 151.2093 };

/**
 * Provider giả — Ascendant tropical + ayanamsa CỐ ĐỊNH, cho phép kiểm biên chính xác tuyệt đối mà
 * KHÔNG cần Swiss Ephemeris thật (cùng phong cách `fakeProvider` ở `rashi.test.ts`/
 * `fakeMoonProvider` ở `dasha/__tests__/vimshottari.test.ts`).
 */
function fakeAscendantProvider(tropicalAscendant: number, ayanamsa: number): AstronomicalProvider {
  const notUsed = (method: string) => () => {
    throw new Error(`fakeAscendantProvider: ${method} không được dùng trong test này.`);
  };
  return {
    getMetadata: notUsed("getMetadata") as () => ProviderMetadata,
    getPlanetPosition: notUsed("getPlanetPosition") as () => PlanetPosition,
    getNodePosition: notUsed("getNodePosition") as () => NodePosition,
    getHouseCusps: notUsed("getHouseCusps") as () => HouseCusps,
    getAscendant: ((_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult => ({
      longitude: tropicalAscendant,
    })) as AstronomicalProvider["getAscendant"],
    getMidheaven: notUsed("getMidheaven") as () => AngleResult,
    getAyanamsa: ((_utcInstant: Date, _ayanamsaId: AyanamsaId): number => ayanamsa) as AstronomicalProvider["getAyanamsa"],
  };
}

const FIXED_AYANAMSA = 24; // số tròn, dễ tính tay ranh giới (sidereal = tropical - 24).
const SOME_INSTANT = new Date("2000-01-01T00:00:00.000Z");
const SOME_LOCATION = { latitude: 21, longitude: 105 };

function siderealToTropical(siderealLongitude: number): number {
  return siderealLongitude + FIXED_AYANAMSA;
}

describe("calculateVedicAscendant — biên Rashi qua fakeAscendantProvider (Ascendant near 0°/30°/359°→0°, mọi Rashi)", () => {
  it("Ascendant ĐÚNG TẠI 0° (Ashwini/Aries) => rashi=aries, rashiDegree=0", () => {
    const provider = fakeAscendantProvider(siderealToTropical(0), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.rashi).toBe("aries");
      expect(result.result.rashiDegree).toBeCloseTo(0, 9);
      expect(result.result.siderealLongitude).toBeCloseTo(0, 9);
    }
  });

  it("Ascendant NGAY TRƯỚC 30° (biên trên MỞ) => vẫn Aries", () => {
    const provider = fakeAscendantProvider(siderealToTropical(29.9999999), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.rashi).toBe("aries");
  });

  it("Ascendant ĐÚNG TẠI 30° => Taurus (biên dưới ĐÓNG)", () => {
    const provider = fakeAscendantProvider(siderealToTropical(30), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.rashi).toBe("taurus");
      expect(result.result.rashiDegree).toBeCloseTo(0, 9);
    }
  });

  it("Ascendant NGAY SAU 30° => vẫn Taurus", () => {
    const provider = fakeAscendantProvider(siderealToTropical(30.0000001), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.rashi).toBe("taurus");
  });

  it("Ascendant NGAY TRƯỚC 360° (359.9999999°) => vẫn Pisces, KHÔNG lỡ vòng sang Aries", () => {
    const provider = fakeAscendantProvider(siderealToTropical(359.9999999), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.rashi).toBe("pisces");
  });

  it("Ascendant ĐÚNG TẠI 360° (chuẩn hoá về 0°) => Aries, KHÔNG phải Pisces", () => {
    const provider = fakeAscendantProvider(siderealToTropical(360), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.rashi).toBe("aries");
      expect(result.result.siderealLongitude).toBeCloseTo(0, 9);
    }
  });

  it("wraparound: tropical < ayanamsa (sidereal âm trước khi chuẩn hoá) vẫn ra kết quả đúng", () => {
    const provider = fakeAscendantProvider(5, FIXED_AYANAMSA); // sidereal = 5-24 = -19 => chuẩn hoá 341.
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.siderealLongitude).toBeCloseTo(341, 9);
      expect(result.result.rashi).toBe("pisces"); // 341 nằm trong [330,360).
    }
  });

  it("cả 12 điểm bắt đầu Rashi đều đúng (Lagna sign transition qua từng ranh giới)", () => {
    for (let i = 0; i < 12; i++) {
      const provider = fakeAscendantProvider(siderealToTropical(i * 30), FIXED_AYANAMSA);
      const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.result.rashi).toBe(ZODIAC_SIGNS[i]);
    }
  });
});

describe("calculateVedicAscendant — độ chính xác, giữ nguyên tropical/ayanamsa/sidereal đầy đủ (KHÔNG làm tròn trung gian)", () => {
  it("trả kèm tropicalLongitude/ayanamsaId để audit, không chỉ siderealLongitude", () => {
    const provider = fakeAscendantProvider(siderealToTropical(123.456789012345), FIXED_AYANAMSA);
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.ayanamsaId).toBe("lahiri");
      expect(result.result.tropicalLongitude).toBeCloseTo(siderealToTropical(123.456789012345), 9);
      expect(result.result.siderealLongitude.toString().replace(/^-?\d+\./, "").length).toBeGreaterThan(6);
    }
  });
});

describe("calculateVedicAscendant — ánh xạ lỗi provider (đúng quy ước calculateRashi/calculateVimshottariDasha)", () => {
  it("ayanamsa không hỗ trợ (lan truyền từ calculateRashi) => UNSUPPORTED_FEATURE, KHÔNG throw", () => {
    const provider: AstronomicalProvider = {
      ...fakeAscendantProvider(siderealToTropical(0), FIXED_AYANAMSA),
      getAyanamsa: (() => {
        throw new SwissEphemerisUnsupportedAyanamsaError("does_not_exist");
      }) as AstronomicalProvider["getAyanamsa"],
    };
    const result = calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION, ayanamsaId: "does_not_exist" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe("UNSUPPORTED_FEATURE");
    }
  });

  it("lỗi lạ không nhận diện được từ getAscendant => throw nguyên văn, KHÔNG nuốt", () => {
    const provider: AstronomicalProvider = {
      ...fakeAscendantProvider(0, FIXED_AYANAMSA),
      getAscendant: (() => {
        throw new RangeError("lỗi lập trình không liên quan");
      }) as AstronomicalProvider["getAscendant"],
    };
    expect(() => calculateVedicAscendant({ provider, utcInstant: SOME_INSTANT, ...SOME_LOCATION })).toThrow(RangeError);
  });
});

/**
 * ORACLE COMPARISON (mandatory, cả 2 oracle, dung sai 0.01° — quyết định #13) + BIÊN VĨ ĐỘ THẬT
 * (Bắc bán cầu, Nam bán cầu, xích đạo, vĩ độ cao). Tái dùng NGUYÊN VĂN 3 fixture đã dùng ở
 * PHASE5_PREFLIGHT_ASCENDANT_HOUSES.md §4 — KHÔNG bịa fixture/số liệu oracle mới. Dung sai PHẢN
 * ÁNH ĐÚNG 3 nguồn sai khác đã quy kết (A: ayanamsa API, B: native flag vs manual subtraction,
 * C: swe_julday() vs project's utc_to_jd()) — KHÔNG phải số tuỳ tiện, và KHÔNG được nới rộng chỉ
 * để test pass (quyết định #17 "Do not loosen tolerance merely to make tests pass").
 */
describe("calculateVedicAscendant — so oracle CẢ HAI (PyJHora + vedic-calc), benchmark Hanoi/Mumbai/Sydney (Bắc/Nam bán cầu)", () => {
  const provider = new SwissEphemerisProvider();
  const MAX_DEGREES_VS_ORACLE = 0.01; // quyết định #13 — dung sai số mặc định.

  const cases = [
    { label: "Hanoi (Bắc bán cầu)", utcInstant: HANOI_1985_UTC_INSTANT, ...HANOI, expectedRashi: "aries" as const, pyjhora: 11.895865235052064, vedicCalc: 11.892280032832254 },
    { label: "Mumbai (Bắc bán cầu)", utcInstant: MUMBAI_1990_UTC_INSTANT, ...MUMBAI, expectedRashi: "leo" as const, pyjhora: 140.82703503452535, vedicCalc: 140.83060033684362 },
    { label: "Sydney (Nam bán cầu)", utcInstant: SYDNEY_1978_UTC_INSTANT, ...SYDNEY, expectedRashi: "aquarius" as const, pyjhora: 314.52848856826347, vedicCalc: 314.52760159467357 },
  ];

  for (const { label, utcInstant, latitude, longitude, expectedRashi, pyjhora, vedicCalc } of cases) {
    it(`${label}: Rashi (khẳng định phân loại) khớp CẢ 2 oracle, độ lệch số <= 0.01°`, () => {
      const result = calculateVedicAscendant({ provider, utcInstant, latitude, longitude });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Khẳng định PHÂN LOẠI (categorical) — bắt buộc, KHÔNG thay thế bằng dung sai số (quyết định #14).
        expect(result.result.rashi).toBe(expectedRashi);
        // Khẳng định SỐ (numerical), độ lệch tuyệt đối.
        expect(Math.abs(result.result.siderealLongitude - pyjhora)).toBeLessThanOrEqual(MAX_DEGREES_VS_ORACLE);
        expect(Math.abs(result.result.siderealLongitude - vedicCalc)).toBeLessThanOrEqual(MAX_DEGREES_VS_ORACLE);
      }
    });
  }

  it("xích đạo (0°) — Ascendant tính được bình thường, không có xử lý đặc biệt nào cần thiết", () => {
    const result = calculateVedicAscendant({ provider, utcInstant: new Date("2000-06-21T00:00:00.000Z"), latitude: 0, longitude: 0 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.siderealLongitude).toBeGreaterThanOrEqual(0);
      expect(result.result.siderealLongitude).toBeLessThan(360);
      expect(ZODIAC_SIGNS).toContain(result.result.rashi);
    }
  });

  it("vĩ độ cao (Reykjavik 64.15°N, Tromsø 69.65°N trong vòng Bắc Cực, gần cực 89°N, Nam Cực -75°S) — Whole Sign KHÔNG có lỗi 'undefined at latitude' (khác Placidus)", () => {
    const highLatitudeCases = [
      { label: "Reykjavik", latitude: 64.15, longitude: -21.9 },
      { label: "Tromsø (Vòng Bắc Cực)", latitude: 69.65, longitude: 18.96 },
      { label: "Gần Bắc Cực", latitude: 89, longitude: 0 },
      { label: "Nam Cực", latitude: -75, longitude: 0 },
    ];
    for (const { latitude, longitude } of highLatitudeCases) {
      // Whole Sign không được phép có lỗi vĩ độ cực (khác Placidus) — xem PHASE5_PREFLIGHT §6.
      const result = calculateVedicAscendant({ provider, utcInstant: new Date("2000-06-21T00:00:00.000Z"), latitude, longitude });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.siderealLongitude).toBeGreaterThanOrEqual(0);
        expect(result.result.siderealLongitude).toBeLessThan(360);
      }
    }
  });

  it("kinh độ cực trị hợp lệ (-180°, 180°, 179.9999°) — không lỗi, không tràn số", () => {
    for (const longitude of [-180, 180, 179.9999]) {
      const result = calculateVedicAscendant({ provider, utcInstant: new Date("2000-01-01T00:00:00.000Z"), latitude: 30, longitude });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.siderealLongitude).toBeGreaterThanOrEqual(0);
        expect(result.result.siderealLongitude).toBeLessThan(360);
      }
    }
  });

  it("thời điểm sát ranh giới ngày UTC (23:59:59.900Z và 00:00:00.100Z) — không có lỗi rollover", () => {
    const before = calculateVedicAscendant({ provider, utcInstant: new Date("1999-12-31T23:59:59.900Z"), latitude: 21, longitude: 105 });
    const after = calculateVedicAscendant({ provider, utcInstant: new Date("2000-01-01T00:00:00.100Z"), latitude: 21, longitude: 105 });
    expect(before.ok && after.ok).toBe(true);
    if (before.ok && after.ok) {
      // Ascendant di chuyển ~0.25°/phút — 0.2 giây lệch nhau phải cho ra longitude RẤT gần nhau, không nhảy vô lý.
      const diff = Math.abs(before.result.siderealLongitude - after.result.siderealLongitude);
      expect(Math.min(diff, 360 - diff)).toBeLessThan(0.01);
    }
  });
});

/**
 * PLANET -> WHOLE SIGN HOUSE (kiểm hợp nhất Ascendant + Rashi hành tinh + getWholeSignHouseNumber)
 * — benchmark Hanoi, tái dùng Rashi hành tinh ĐÃ xác nhận oracle ở Phase 4 (Sun/Moon/Saturn).
 */
describe("Lagna + Rashi hành tinh + Whole Sign house — chuỗi đầy đủ, benchmark Hanoi (khẳng định PHÂN LOẠI bắt buộc)", () => {
  const provider = new SwissEphemerisProvider();

  it("Lagna=Aries (Nhà 1); Sun(Aquarius)=Nhà 11; Moon(Scorpio)=Nhà 8; Saturn(Scorpio)=Nhà 8", () => {
    const ascendant = calculateVedicAscendant({ provider, utcInstant: HANOI_1985_UTC_INSTANT, ...HANOI });
    expect(ascendant.ok).toBe(true);
    if (!ascendant.ok) return;
    expect(ascendant.result.rashi).toBe("aries");

    const sunTropical = provider.getPlanetPosition(HANOI_1985_UTC_INSTANT, "sun").longitude;
    const moonTropical = provider.getPlanetPosition(HANOI_1985_UTC_INSTANT, "moon").longitude;
    const saturnTropical = provider.getPlanetPosition(HANOI_1985_UTC_INSTANT, "saturn").longitude;

    const sun = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: sunTropical });
    const moon = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: moonTropical });
    const saturn = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: saturnTropical });
    expect(sun.ok && moon.ok && saturn.ok).toBe(true);
    if (!sun.ok || !moon.ok || !saturn.ok) return;

    expect(sun.result.rashi).toBe("aquarius");
    expect(moon.result.rashi).toBe("scorpio");
    expect(saturn.result.rashi).toBe("scorpio");

    expect(getWholeSignHouseNumber(sun.result.rashi, ascendant.result.rashi)).toBe(11);
    expect(getWholeSignHouseNumber(moon.result.rashi, ascendant.result.rashi)).toBe(8);
    expect(getWholeSignHouseNumber(saturn.result.rashi, ascendant.result.rashi)).toBe(8);
    expect(getWholeSignHouseNumber(ascendant.result.rashi, ascendant.result.rashi)).toBe(1);
  });

  it("hành tinh NGAY TRƯỚC/SAU ranh giới cung => house lệch ĐÚNG 1 (qua fake provider, kiểm wiring biên)", () => {
    const lagnaProvider = fakeAscendantProvider(siderealToTropical(0), FIXED_AYANAMSA); // Lagna=Aries.
    const ascendant = calculateVedicAscendant({ provider: lagnaProvider, utcInstant: SOME_INSTANT, ...SOME_LOCATION });
    expect(ascendant.ok).toBe(true);
    if (!ascendant.ok) return;

    // Hành tinh NGAY TRƯỚC ranh giới Taurus (vẫn Aries) => cùng Nhà 1 với Lagna.
    const justBeforeTaurus = calculateRashi({ provider: lagnaProvider, utcInstant: SOME_INSTANT, tropicalLongitude: siderealToTropical(29.9999999) });
    // Hành tinh NGAY TẠI ranh giới Taurus => Nhà 2.
    const atTaurus = calculateRashi({ provider: lagnaProvider, utcInstant: SOME_INSTANT, tropicalLongitude: siderealToTropical(30) });
    expect(justBeforeTaurus.ok && atTaurus.ok).toBe(true);
    if (!justBeforeTaurus.ok || !atTaurus.ok) return;

    expect(getWholeSignHouseNumber(justBeforeTaurus.result.rashi, ascendant.result.rashi)).toBe(1);
    expect(getWholeSignHouseNumber(atTaurus.result.rashi, ascendant.result.rashi)).toBe(2);
  });
});
