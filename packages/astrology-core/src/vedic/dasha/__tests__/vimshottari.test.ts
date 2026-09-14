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
} from "../../../astronomical/AstronomicalProvider.js";
import { SwissEphemerisProvider } from "../../../astronomical/providers/SwissEphemerisProvider.js";
import { SwissEphemerisUnsupportedAyanamsaError } from "../../../astronomical/providers/errors.js";
import { NAKSHATRA_NAMES } from "../../../chart/types.js";
import { getNakshatraLord, NAKSHATRA_SPAN_DEGREES } from "../../nakshatra.js";
import {
  calculateVimshottariDasha,
  deserializeVimshottariMahadashaSequence,
  serializeVimshottariMahadashaSequence,
  validateVimshottariMahadashaSequence,
  VIMSHOTTARI_DASHA_SCHEMA_VERSION,
  VIMSHOTTARI_DAYS_PER_YEAR,
  VIMSHOTTARI_LORD_SEQUENCE,
  VIMSHOTTARI_LORD_YEARS,
  VIMSHOTTARI_YEAR_CONVENTION_ID,
  type VimshottariLord,
} from "../vimshottari.js";

const HANOI_1985_UTC_INSTANT = new Date("1985-03-12T01:30:00.000Z");
const MUMBAI_1990_UTC_INSTANT = new Date("1990-06-15T06:30:00.000Z");

/**
 * Provider giả — Moon tropical longitude + ayanamsa CỐ ĐỊNH, cho phép kiểm biên chính xác tuyệt
 * đối mà KHÔNG cần Swiss Ephemeris thật (cùng phong cách `fakeProvider` ở `rashi.test.ts`, mở
 * rộng thêm `getPlanetPosition("moon")` vì `calculateVimshottariDasha` cần cả 2).
 */
function fakeMoonProvider(moonTropicalLongitude: number, ayanamsa: number): AstronomicalProvider {
  const notUsed = (method: string) => () => {
    throw new Error(`fakeMoonProvider: ${method} không được dùng trong test này.`);
  };
  return {
    getMetadata: notUsed("getMetadata") as () => ProviderMetadata,
    getPlanetPosition: ((_utcInstant: Date, body: CelestialBody): PlanetPosition => {
      if (body !== "moon") throw new Error(`fakeMoonProvider: chỉ hỗ trợ "moon", nhận "${body}".`);
      return { body: "moon", longitude: moonTropicalLongitude, latitude: 0, distanceAu: null, speedDegreesPerDay: 13.2, isRetrograde: false };
    }) as AstronomicalProvider["getPlanetPosition"],
    getNodePosition: notUsed("getNodePosition") as () => NodePosition,
    getHouseCusps: notUsed("getHouseCusps") as () => HouseCusps,
    getAscendant: notUsed("getAscendant") as () => AngleResult,
    getMidheaven: notUsed("getMidheaven") as () => AngleResult,
    getAyanamsa: ((_utcInstant: Date, _ayanamsaId: AyanamsaId): number => ayanamsa) as AstronomicalProvider["getAyanamsa"],
  };
}

const FIXED_AYANAMSA = 24; // số tròn, dễ tính tay ranh giới (sidereal = tropical - 24).
const BIRTH_INSTANT = new Date("2000-01-01T00:00:00.000Z");

function siderealToTropical(siderealLongitude: number): number {
  return siderealLongitude + FIXED_AYANAMSA;
}

describe("hằng số Vimshottari — đúng bảng D5 đã đóng băng (PHASE4_STEP5_DASHA_PREFLIGHT.md)", () => {
  it("VIMSHOTTARI_LORD_YEARS đúng BPHS Chương 46, tổng = 120", () => {
    expect(VIMSHOTTARI_LORD_YEARS).toEqual({ ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 });
    expect(Object.values(VIMSHOTTARI_LORD_YEARS).reduce((a, b) => a + b, 0)).toBe(120);
  });

  it("VIMSHOTTARI_LORD_SEQUENCE đúng 9 lord, ĐÚNG THỨ TỰ Ketu→Venus→Sun→Moon→Mars→Rahu→Jupiter→Saturn→Mercury", () => {
    expect(VIMSHOTTARI_LORD_SEQUENCE).toEqual(["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"]);
  });

  it("VIMSHOTTARI_DAYS_PER_YEAR = 365.256364 (D5, KHÔNG phải 365.25 hay giá trị động)", () => {
    expect(VIMSHOTTARI_DAYS_PER_YEAR).toBe(365.256364);
  });

  it("VIMSHOTTARI_YEAR_CONVENTION_ID đúng định danh D5 đã duyệt", () => {
    expect(VIMSHOTTARI_YEAR_CONVENTION_ID).toBe("mean_sidereal_year.365_256364");
  });
});

describe("calculateVimshottariDasha — biên Nakshatra qua fakeMoonProvider (Section 'BOUNDARY TESTS')", () => {
  it("Moon ĐÚNG TẠI điểm bắt đầu Nakshatra (Ashwini, sidereal=0) => elapsedFraction=0, Mahadasha đầu tiên bắt đầu NGAY LÚC SINH", () => {
    const provider = fakeMoonProvider(siderealToTropical(0), FIXED_AYANAMSA);
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.startingNakshatra).toBe("ashwini");
      expect(result.result.startingNakshatraLord).toBe("ketu");
      expect(result.result.startingNakshatraElapsedFraction).toBeCloseTo(0, 12);
      expect(result.result.mahadashas[0]?.startUtc.getTime()).toBe(BIRTH_INSTANT.getTime());
    }
  });

  it("Moon NGAY TRƯỚC điểm bắt đầu Nakshatra kế tiếp (biên trên MỞ) => vẫn thuộc Nakshatra hiện tại, elapsedFraction gần 1", () => {
    const justBefore = NAKSHATRA_SPAN_DEGREES - 1e-9;
    const provider = fakeMoonProvider(siderealToTropical(justBefore), FIXED_AYANAMSA);
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.startingNakshatra).toBe("ashwini");
      expect(result.result.startingNakshatraElapsedFraction).toBeGreaterThan(0.999999);
      expect(result.result.startingNakshatraElapsedFraction).toBeLessThan(1);
    }
  });

  it("Moon ĐÚNG TẠI ranh giới trên (điểm bắt đầu Bharani) => thuộc Bharani, elapsedFraction=0 (KHÔNG phải Ashwini 100%)", () => {
    const provider = fakeMoonProvider(siderealToTropical(NAKSHATRA_SPAN_DEGREES), FIXED_AYANAMSA);
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.startingNakshatra).toBe("bharani");
      expect(result.result.startingNakshatraElapsedFraction).toBeCloseTo(0, 9);
    }
  });

  it("Moon NGAY SAU ranh giới trên => vẫn Bharani, elapsedFraction gần 0", () => {
    const provider = fakeMoonProvider(siderealToTropical(NAKSHATRA_SPAN_DEGREES + 1e-9), FIXED_AYANAMSA);
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.startingNakshatra).toBe("bharani");
      expect(result.result.startingNakshatraElapsedFraction).toBeGreaterThan(0);
      expect(result.result.startingNakshatraElapsedFraction).toBeLessThan(0.000001);
    }
  });

  it("balance gần 0% (elapsedFraction ~0.0001) — Mahadasha đầu gần như ĐẦY ĐỦ còn lại", () => {
    const tinyDegree = NAKSHATRA_SPAN_DEGREES * 0.0001;
    const provider = fakeMoonProvider(siderealToTropical(tinyDegree), FIXED_AYANAMSA);
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.startingNakshatraElapsedFraction).toBeCloseTo(0.0001, 6);
      const balanceYears = (result.result.mahadashas[0]!.endUtc.getTime() - BIRTH_INSTANT.getTime()) / (VIMSHOTTARI_DAYS_PER_YEAR * 86400000);
      expect(balanceYears).toBeCloseTo(7 * 0.9999, 2); // Ashwini lord = Ketu = 7 năm
    }
  });

  it("balance gần 100% (elapsedFraction ~0.9999) — Mahadasha đầu gần như hết hạn ngay tại sinh", () => {
    const nearFullDegree = NAKSHATRA_SPAN_DEGREES * 0.9999;
    const provider = fakeMoonProvider(siderealToTropical(nearFullDegree), FIXED_AYANAMSA);
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.startingNakshatraElapsedFraction).toBeCloseTo(0.9999, 6);
      const balanceYears = (result.result.mahadashas[0]!.endUtc.getTime() - BIRTH_INSTANT.getTime()) / (VIMSHOTTARI_DAYS_PER_YEAR * 86400000);
      expect(balanceYears).toBeCloseTo(7 * 0.0001, 2);
    }
  });
});

describe("calculateVimshottariDasha — cả 27 điểm bắt đầu Nakshatra / 9 lord khởi đầu (Section 'BOUNDARY TESTS')", () => {
  for (let i = 0; i < 27; i++) {
    it(`Nakshatra #${i + 1} (${NAKSHATRA_NAMES[i]}) => startingLord đúng ${getNakshatraLord(i)}, elapsedFraction=0`, () => {
      const provider = fakeMoonProvider(siderealToTropical(i * NAKSHATRA_SPAN_DEGREES), FIXED_AYANAMSA);
      const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.startingNakshatra).toBe(NAKSHATRA_NAMES[i]);
        expect(result.result.startingNakshatraLord).toBe(getNakshatraLord(i));
        expect(result.result.startingMahadashaLord).toBe(getNakshatraLord(i));
      }
    });
  }

  it("cả 9 lord Vimshottari đều xuất hiện làm starting lord (index 0-8 của 27 Nakshatra)", () => {
    const seenLords = new Set<VimshottariLord>();
    for (let i = 0; i < 9; i++) {
      const provider = fakeMoonProvider(siderealToTropical(i * NAKSHATRA_SPAN_DEGREES), FIXED_AYANAMSA);
      const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
      expect(result.ok).toBe(true);
      if (result.ok) seenLords.add(result.result.startingNakshatraLord);
    }
    expect(seenLords.size).toBe(9);
    expect([...seenLords].sort()).toEqual([...VIMSHOTTARI_LORD_SEQUENCE].sort());
  });
});

describe("calculateVimshottariDasha — chu kỳ 120 năm đầy đủ, đúng thứ tự, liền mạch (Mathematical Requirements #6-9)", () => {
  const provider = fakeMoonProvider(siderealToTropical(0), FIXED_AYANAMSA); // Ashwini, elapsedFraction=0
  const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });

  it("đúng 9 Mahadasha, tổng durationYears = 120, mỗi lord đúng bảng cố định", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.mahadashas).toHaveLength(9);
      expect(result.result.mahadashas.reduce((sum, p) => sum + p.durationYears, 0)).toBe(120);
      for (const p of result.result.mahadashas) {
        expect(p.durationYears).toBe(VIMSHOTTARI_LORD_YEARS[p.lord]);
      }
    }
  });

  it("thứ tự lord ĐÚNG chu kỳ Vimshottari bắt đầu từ Ketu (Ashwini's lord)", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.mahadashas.map((p) => p.lord)).toEqual(["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"]);
    }
  });

  it("liền mạch tuyệt đối: endUtc của Mahadasha này == startUtc của Mahadasha kế tiếp", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      for (let i = 1; i < result.result.mahadashas.length; i++) {
        expect(result.result.mahadashas[i]!.startUtc.getTime()).toBe(result.result.mahadashas[i - 1]!.endUtc.getTime());
      }
    }
  });

  it("validateVimshottariMahadashaSequence() không báo lỗi nào", () => {
    expect(result.ok).toBe(true);
    if (result.ok) expect(validateVimshottariMahadashaSequence(result.result)).toEqual([]);
  });

  it("date rollover: chu kỳ 120 năm trải qua nhiều năm nhuận và nhiều điểm giao năm dương lịch (JS Date xử lý đúng, không cần bộ đếm ngày riêng)", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      const last = result.result.mahadashas.at(-1)!;
      expect(last.endUtc.getUTCFullYear()).toBeGreaterThan(BIRTH_INSTANT.getUTCFullYear() + 100);
      // Ít nhất 1 Mahadasha kết thúc vào tháng 1 hoặc 12 (giao năm) trong toàn bộ chu kỳ.
      const crossesYearBoundary = result.result.mahadashas.some((p) => p.endUtc.getUTCMonth() === 0 || p.endUtc.getUTCMonth() === 11);
      expect(crossesYearBoundary).toBe(true);
    }
  });
});

describe("calculateVimshottariDasha — độ chính xác phân số ngày, tính xác định (Mathematical Requirements #9-10)", () => {
  it("2 utcInstant lệch nhau vài phút cho ra mahadashas[0].startUtc lệch ĐÚNG cùng khoảng đó (không bị cắt về ngày tròn)", () => {
    const provider = fakeMoonProvider(siderealToTropical(5), FIXED_AYANAMSA); // giữa Ashwini, elapsedFraction cố định
    const instantA = new Date("2000-01-01T00:00:00.000Z");
    const instantB = new Date("2000-01-01T00:07:30.000Z"); // lệch 7 phút 30 giây
    const resultA = calculateVimshottariDasha({ provider, utcInstant: instantA });
    const resultB = calculateVimshottariDasha({ provider, utcInstant: instantB });
    expect(resultA.ok && resultB.ok).toBe(true);
    if (resultA.ok && resultB.ok) {
      const deltaMs = resultB.result.mahadashas[0]!.startUtc.getTime() - resultA.result.mahadashas[0]!.startUtc.getTime();
      expect(deltaMs).toBe(instantB.getTime() - instantA.getTime());
    }
  });

  it("tính xác định (deterministic) — gọi lại nhiều lần cho cùng kết quả tuyệt đối", () => {
    const provider = fakeMoonProvider(siderealToTropical(123.456), FIXED_AYANAMSA);
    const first = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    const second = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      for (let i = 0; i < 9; i++) {
        expect(first.result.mahadashas[i]!.startUtc.getTime()).toBe(second.result.mahadashas[i]!.startUtc.getTime());
        expect(first.result.mahadashas[i]!.endUtc.getTime()).toBe(second.result.mahadashas[i]!.endUtc.getTime());
      }
    }
  });
});

describe("calculateVimshottariDasha — ánh xạ lỗi provider (đúng quy ước calculateRashi/calculateWesternHousesAndAngles)", () => {
  it("ayanamsa không hỗ trợ => UNSUPPORTED_FEATURE, KHÔNG throw (lỗi lan truyền từ calculateRashi)", () => {
    const provider: AstronomicalProvider = {
      ...fakeMoonProvider(siderealToTropical(0), FIXED_AYANAMSA),
      getAyanamsa: (() => {
        throw new SwissEphemerisUnsupportedAyanamsaError("does_not_exist");
      }) as AstronomicalProvider["getAyanamsa"],
    };
    const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT, ayanamsaId: "does_not_exist" });
    expect(result.ok).toBe(false);
  });

  it("lỗi lấy vị trí Mặt Trăng lạ không nhận diện được => throw nguyên văn, KHÔNG nuốt", () => {
    const provider: AstronomicalProvider = {
      ...fakeMoonProvider(siderealToTropical(0), FIXED_AYANAMSA),
      getPlanetPosition: (() => {
        throw new RangeError("lỗi lập trình không liên quan");
      }) as AstronomicalProvider["getPlanetPosition"],
    };
    expect(() => calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT })).toThrow(RangeError);
  });
});

describe("serializeVimshottariMahadashaSequence / deserializeVimshottariMahadashaSequence", () => {
  const provider = fakeMoonProvider(siderealToTropical(50), FIXED_AYANAMSA);
  const result = calculateVimshottariDasha({ provider, utcInstant: BIRTH_INSTANT });

  it("round-trip serialize -> deserialize cho ra chart giống hệt (kể cả kiểu Date, không phải string)", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      const json = serializeVimshottariMahadashaSequence(result.result);
      const roundTripped = deserializeVimshottariMahadashaSequence(json);
      expect(roundTripped.utcInstant).toBeInstanceOf(Date);
      expect(roundTripped.utcInstant.getTime()).toBe(result.result.utcInstant.getTime());
      expect(roundTripped.mahadashas[0]!.startUtc).toBeInstanceOf(Date);
      expect(serializeVimshottariMahadashaSequence(roundTripped)).toBe(json);
      expect(validateVimshottariMahadashaSequence(roundTripped)).toEqual([]);
    }
  });

  it("chuỗi JSON có đúng schemaVersion trong envelope", () => {
    expect(result.ok).toBe(true);
    if (result.ok) {
      const json = serializeVimshottariMahadashaSequence(result.result);
      expect(JSON.parse(json).schemaVersion).toBe(VIMSHOTTARI_DASHA_SCHEMA_VERSION);
    }
  });
});

/**
 * ORACLE COMPARISON (Section "ORACLE COMPARISON" — mandatory). Benchmark tái dùng ĐÚNG 2 fixture
 * đã dùng ở Phase 4 Step 5 Preflight (Hanoi Saturn/19y, Mumbai Rahu/18y) — KHÔNG bịa fixture mới.
 *
 * (A) STRUCTURAL — Nakshatra bắt đầu, lord bắt đầu, thứ tự 9 lord, số năm mỗi lord: PHẢI khớp
 * TUYỆT ĐỐI cả 2 oracle (đã xác nhận ở Step 5, KHÔNG có bất đồng nào ở tầng này).
 *
 * (B) NGÀY THÁNG — dự án dùng 365.256364 ngày/năm (D5, đã đóng băng), vedic-calc dùng 365.25,
 * PyJHora mặc định dùng TRUE_SIDEREAL_YEAR ĐỘNG (~365.2608 ngày cho benchmark này). KHÔNG kỳ vọng
 * trùng ngày tuyệt đối. Sai khác đã tính CHÍNH XÁC (xem PHASE4_STEP6_DASHA_IMPLEMENTATION.md):
 *   Hanoi:  project sớm hơn PyJHora(TRUE)   ~0.089 ngày; sớm hơn vedic-calc ~2.090 ngày.
 *   Mumbai: project sớm hơn PyJHora(TRUE)   ~0.204 ngày; TRỄ HƠN vedic-calc  ~1.394 ngày.
 * Dung sai dưới đây PHẢN ÁNH ĐÚNG các con số đã tính này (biên an toàn, KHÔNG phải số tuỳ tiện).
 */
describe("calculateVimshottariDasha — so oracle CẢ HAI (PyJHora + vedic-calc), benchmark Step 5", () => {
  const provider = new SwissEphemerisProvider();
  const MAX_DAYS_VS_PYJHORA_TRUE_SIDEREAL = 0.5; // phủ ~0.089 và ~0.204 ngày quan sát được, biên an toàn.
  const MAX_DAYS_VS_VEDIC_CALC = 3; // phủ ~2.090 và ~1.394 ngày quan sát được, biên an toàn.

  const cases = [
    {
      label: "Hanoi 1985-03-12 08:30 (+7)",
      utcInstant: HANOI_1985_UTC_INSTANT,
      expectedNakshatra: "anuradha" as const,
      expectedLord: "saturn" as const,
      pyjhoraTrueSiderealStart: Date.UTC(1980, 10, 15, 11, 49, 15), // "Saturn♄ (1980, 11, 15, 11.8209)"
      vedicCalcStart: new Date("1980-11-17T11:50:02.634Z").getTime(),
    },
    {
      label: "Mumbai 1990-06-15 12:00 (+5.5)",
      utcInstant: MUMBAI_1990_UTC_INSTANT,
      expectedNakshatra: "shatabhisha" as const,
      expectedLord: "rahu" as const,
      pyjhoraTrueSiderealStart: Date.UTC(1974, 4, 17, 1, 25, 3), // "Raagu☊ (1974, 5, 17, 1.4176)"
      vedicCalcStart: new Date("1974-05-15T11:03:55.152Z").getTime(),
    },
  ];

  for (const { label, utcInstant, expectedNakshatra, expectedLord, pyjhoraTrueSiderealStart, vedicCalcStart } of cases) {
    it(`${label}: (A) khớp cấu trúc TUYỆT ĐỐI với cả 2 oracle`, () => {
      const result = calculateVimshottariDasha({ provider, utcInstant });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.result.startingNakshatra).toBe(expectedNakshatra);
        expect(result.result.startingNakshatraLord).toBe(expectedLord);
        expect(result.result.mahadashas.map((p) => p.lord)).toEqual(
          Array.from({ length: 9 }, (_, i) => VIMSHOTTARI_LORD_SEQUENCE[(VIMSHOTTARI_LORD_SEQUENCE.indexOf(expectedLord) + i) % 9]),
        );
        for (const p of result.result.mahadashas) {
          expect(p.durationYears).toBe(VIMSHOTTARI_LORD_YEARS[p.lord]);
        }
      }
    });

    it(`${label}: (B) sai khác ngày tháng nằm trong biên đã tính chính xác cho quy ước năm (KHÔNG che giấu bằng dung sai tuỳ tiện)`, () => {
      const result = calculateVimshottariDasha({ provider, utcInstant });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const projectStart = result.result.mahadashas[0]!.startUtc.getTime();
        const diffVsPyJHoraDays = Math.abs(projectStart - pyjhoraTrueSiderealStart) / 86400000;
        const diffVsVedicCalcDays = Math.abs(projectStart - vedicCalcStart) / 86400000;
        expect(diffVsPyJHoraDays).toBeLessThan(MAX_DAYS_VS_PYJHORA_TRUE_SIDEREAL);
        expect(diffVsVedicCalcDays).toBeLessThan(MAX_DAYS_VS_VEDIC_CALC);
      }
    });
  }
});
