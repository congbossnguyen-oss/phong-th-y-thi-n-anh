import { describe, expect, it } from "vitest";

import { NAKSHATRA_NAMES, type NakshatraName } from "../../chart/types.js";
import { SwissEphemerisProvider } from "../../astronomical/providers/SwissEphemerisProvider.js";
import { fullWesternChart } from "../../chart/__tests__/fixtures.js";
import { calculateRashi } from "../rashi.js";
import {
  calculateNakshatraPosition,
  getNakshatraIndex,
  getNakshatraLord,
  getNakshatraPada,
  NAKSHATRA_PADA_SPAN_DEGREES,
  NAKSHATRA_SPAN_DEGREES,
} from "../nakshatra.js";

const HANOI_1985_UTC_INSTANT = new Date("1985-03-12T01:30:00.000Z");

describe("hằng số Nakshatra/Pada — đúng 27 x 13°20' và 108 x 3°20' (Section 3.B/3.C)", () => {
  it("NAKSHATRA_NAMES có ĐÚNG 27 phần tử, không trùng lặp", () => {
    expect(NAKSHATRA_NAMES).toHaveLength(27);
    expect(new Set(NAKSHATRA_NAMES).size).toBe(27);
  });

  it("NAKSHATRA_SPAN_DEGREES = 360/27 = 13°20'", () => {
    expect(NAKSHATRA_SPAN_DEGREES).toBeCloseTo(13.333333333333334, 12);
  });

  it("NAKSHATRA_PADA_SPAN_DEGREES = 360/108 = 3°20' = NAKSHATRA_SPAN_DEGREES/4", () => {
    expect(NAKSHATRA_PADA_SPAN_DEGREES).toBeCloseTo(3.3333333333333335, 12);
    expect(NAKSHATRA_PADA_SPAN_DEGREES * 4).toBeCloseTo(NAKSHATRA_SPAN_DEGREES, 12);
  });

  it("27 Nakshatra x 13°20' = đúng 360°, 108 pada x 3°20' = đúng 360° (Section 3.A)", () => {
    expect(NAKSHATRA_SPAN_DEGREES * 27).toBeCloseTo(360, 9);
    expect(NAKSHATRA_PADA_SPAN_DEGREES * 108).toBeCloseTo(360, 9);
  });
});

describe("getNakshatraIndex — ranh giới ĐÚNG TẠI mỗi điểm bắt đầu trong 27 Nakshatra (Section 7)", () => {
  it("đúng điểm bắt đầu của cả 27 Nakshatra (0°, 13°20', 26°40', ... qua hết 360°)", () => {
    for (let i = 0; i < 27; i++) {
      expect(getNakshatraIndex(i * NAKSHATRA_SPAN_DEGREES)).toBe(i);
    }
  });

  it("ngay TRƯỚC ranh giới Nakshatra kế tiếp vẫn thuộc Nakshatra hiện tại (biên trên MỞ)", () => {
    for (let i = 0; i < 27; i++) {
      const justBefore = (i + 1) * NAKSHATRA_SPAN_DEGREES - 1e-9;
      expect(getNakshatraIndex(justBefore)).toBe(i);
    }
  });

  it("ngay SAU ranh giới đã thuộc Nakshatra kế tiếp", () => {
    for (let i = 0; i < 26; i++) {
      const justAfter = (i + 1) * NAKSHATRA_SPAN_DEGREES + 1e-9;
      expect(getNakshatraIndex(justAfter)).toBe(i + 1);
    }
  });

  it("359°... vẫn thuộc Nakshatra cuối (Revati, index 26)", () => {
    expect(getNakshatraIndex(359.9999999)).toBe(26);
  });

  it("360° chuẩn hoá về 0° => quay lại Nakshatra đầu (Ashwini, index 0) — Section 7.H wrap", () => {
    expect(getNakshatraIndex(360)).toBe(0);
    expect(getNakshatraIndex(360 + 5)).toBe(getNakshatraIndex(5));
  });

  it("tự chuẩn hoá longitude âm/vượt 360 trước khi tính (giống signOfLongitude)", () => {
    expect(getNakshatraIndex(-1)).toBe(getNakshatraIndex(359));
    expect(getNakshatraIndex(720 + 45)).toBe(getNakshatraIndex(45));
  });
});

describe("getNakshatraPada — ranh giới 4 pada TRONG một Nakshatra (Section 7)", () => {
  it("đúng 4 điểm bắt đầu pada TRONG Nakshatra đầu tiên (Ashwini: 0°, 3°20', 6°40', 10°)", () => {
    expect(getNakshatraPada(0)).toBe(1);
    expect(getNakshatraPada(NAKSHATRA_PADA_SPAN_DEGREES)).toBe(2); // 3°20'
    expect(getNakshatraPada(NAKSHATRA_PADA_SPAN_DEGREES * 2)).toBe(3); // 6°40'
    expect(getNakshatraPada(NAKSHATRA_PADA_SPAN_DEGREES * 3)).toBe(4); // 10°
  });

  it("đúng điểm bắt đầu pada 1 (biên dưới Nakshatra) của mọi Nakshatra trong 27", () => {
    for (let i = 0; i < 27; i++) {
      expect(getNakshatraPada(i * NAKSHATRA_SPAN_DEGREES)).toBe(1);
    }
  });

  it("ranh giới pada trong Nakshatra thứ 18 (Jyeshtha, index 17) — không chỉ Nakshatra đầu", () => {
    const nakStart = 17 * NAKSHATRA_SPAN_DEGREES;
    expect(getNakshatraPada(nakStart)).toBe(1);
    expect(getNakshatraPada(nakStart + NAKSHATRA_PADA_SPAN_DEGREES)).toBe(2);
    // ĐẶC ĐIỂM FLOATING-POINT ĐÃ XÁC NHẬN (Section 7.I, cùng tinh thần "-0" đã characterize ở
    // normalizeDegrees Step 2, KHÔNG phải bug): `nakStart + PADA*2` (17*SPAN rồi cộng dồn 2*PADA)
    // làm tròn thành 233.33333333333334, thấp hơn ranh giới toán học ĐÚNG (233.33...345) một
    // lượng ~1e-14 — nên rơi vào pada 2 (đúng theo floor()), KHÔNG lỡ sang pada 3. Test "ngay
    // TRƯỚC ranh giới pada kế tiếp" bên dưới đã phủ đúng hành vi biên bằng epsilon tường minh,
    // không phụ thuộc kết quả cộng dồn số học kiểu này.
    expect(getNakshatraPada(nakStart + NAKSHATRA_PADA_SPAN_DEGREES * 2)).toBe(2);
    expect(getNakshatraPada(nakStart + NAKSHATRA_PADA_SPAN_DEGREES * 2 + 1e-9)).toBe(3);
    expect(getNakshatraPada(nakStart + NAKSHATRA_PADA_SPAN_DEGREES * 3)).toBe(4);
  });

  it("ngay TRƯỚC ranh giới pada kế tiếp vẫn thuộc pada hiện tại (biên trên MỞ)", () => {
    const nakStart = 5 * NAKSHATRA_SPAN_DEGREES;
    expect(getNakshatraPada(nakStart + NAKSHATRA_PADA_SPAN_DEGREES - 1e-9)).toBe(1);
    expect(getNakshatraPada(nakStart + NAKSHATRA_PADA_SPAN_DEGREES * 2 - 1e-9)).toBe(2);
    expect(getNakshatraPada(nakStart + NAKSHATRA_SPAN_DEGREES - 1e-9)).toBe(4);
  });

  it("ngay TRƯỚC ranh giới Nakshatra kế tiếp vẫn là pada 4 (KHÔNG lỡ tràn sang pada 5)", () => {
    for (let i = 0; i < 27; i++) {
      expect(getNakshatraPada((i + 1) * NAKSHATRA_SPAN_DEGREES - 1e-9)).toBe(4);
    }
  });

  it("wraparound 360°/0°: pada của Ashwini tại 0° = pada của 360°", () => {
    expect(getNakshatraPada(360)).toBe(getNakshatraPada(0));
  });

  it("floating-point: kết quả xác định (deterministic), không dao động giữa các lần gọi", () => {
    const longitude = 123.456789;
    expect(getNakshatraPada(longitude)).toBe(getNakshatraPada(longitude));
  });
});

/**
 * LORD MAPPING (Section 9) — bảng đầy đủ 27 Nakshatra, xác nhận KHỚP TUYỆT ĐỐI giữa vedic-calc's
 * `NAKSHATRA_LORDS` và PyJHora's `nakshatra_lords`/`vimsottari_adhipati_list` (đối chiếu qua
 * `utils.PLANET_NAMES`) — xem PHASE4_STEP4_NAKSHATRA.md cho bằng chứng đầy đủ. Đây LÀ artifact
 * spec được yêu cầu ghi lại (Section 9), KHÔNG suy ra chỉ từ chu kỳ 9 rồi giả định.
 */
describe("getNakshatraLord — bảng đầy đủ 27 Nakshatra, xác nhận khớp CẢ HAI oracle (Section 9)", () => {
  const EXPECTED_LORDS: readonly [NakshatraName, string][] = [
    ["ashwini", "ketu"],
    ["bharani", "venus"],
    ["krittika", "sun"],
    ["rohini", "moon"],
    ["mrigashira", "mars"],
    ["ardra", "rahu"],
    ["punarvasu", "jupiter"],
    ["pushya", "saturn"],
    ["ashlesha", "mercury"],
    ["magha", "ketu"],
    ["purva_phalguni", "venus"],
    ["uttara_phalguni", "sun"],
    ["hasta", "moon"],
    ["chitra", "mars"],
    ["swati", "rahu"],
    ["vishakha", "jupiter"],
    ["anuradha", "saturn"],
    ["jyeshtha", "mercury"],
    ["mula", "ketu"],
    ["purva_ashadha", "venus"],
    ["uttara_ashadha", "sun"],
    ["shravana", "moon"],
    ["dhanishta", "mars"],
    ["shatabhisha", "rahu"],
    ["purva_bhadrapada", "jupiter"],
    ["uttara_bhadrapada", "saturn"],
    ["revati", "mercury"],
  ];

  it("EXPECTED_LORDS tự nó khớp đúng thứ tự NAKSHATRA_NAMES (bảo vệ khỏi lỗi transcription của chính bảng test)", () => {
    expect(EXPECTED_LORDS.map(([name]) => name)).toEqual(NAKSHATRA_NAMES);
  });

  for (const [index, [name, expectedLord]] of EXPECTED_LORDS.entries()) {
    it(`Nakshatra #${index + 1} (${name}) => lord "${expectedLord}"`, () => {
      expect(getNakshatraLord(index)).toBe(expectedLord);
    });
  }

  it("chu kỳ lặp lại đúng mỗi 9 Nakshatra (index i và i+9 và i+18 cùng lord)", () => {
    for (let i = 0; i < 9; i++) {
      expect(getNakshatraLord(i)).toBe(getNakshatraLord(i + 9));
      expect(getNakshatraLord(i)).toBe(getNakshatraLord(i + 18));
    }
  });
});

describe("calculateNakshatraPosition — HÀM THUẦN, không cần AstronomicalProvider", () => {
  it("kết hợp đúng index/pada/lord cho 1 longitude cụ thể", () => {
    const result = calculateNakshatraPosition("moon", 216.36443558161653);
    expect(result.body).toBe("moon");
    expect(result.name).toBe("anuradha");
    expect(result.pada).toBe(1);
    expect(result.lord).toBe("saturn");
  });

  it("body được truyền nguyên văn, không tự suy ra", () => {
    expect(calculateNakshatraPosition("some_point", 0).body).toBe("some_point");
  });
});

/**
 * ORACLE GOLDEN FIXTURES (Section 8 — mandatory). Benchmark Hanoi 1985-03-12 08:30, Lahiri.
 * Sidereal longitude lấy từ implementation THẬT của Step 3 (`calculateRashi`, KHÔNG hardcode lại
 * số benchmark một lần nữa) — Nakshatra/Pada/Lord kết quả sau đó SO VỚI CẢ HAI oracle, tính độc
 * lập trên longitude sidereal CỦA CHÍNH oracle đó (method riêng — SEFLG_SIDEREAL native cho
 * PyJHora, trừ thủ công cho vedic-calc — đúng ghi chú Section 4 "known Step 3 oracle/API delta,
 * không được nhầm là lỗi Nakshatra"). CẢ HAI oracle + project ĐỀU cho ra CÙNG Nakshatra/Pada/Lord
 * cho benchmark này (sai số sidereal ~13-33 giây cung nhỏ hơn NHIỀU so với bề rộng pada 3°20') —
 * xem PHASE4_STEP4_NAKSHATRA.md cho số liệu đầy đủ của cả 2 oracle. Moon = Anuradha #17 Pada 1
 * KHỚP ĐÚNG giá trị preflight đã nêu, nhưng được TÍNH LẠI ĐỘC LẬP ở đây, không copy thẳng.
 */
describe("calculateNakshatraPosition — benchmark Hanoi 1985-03-12 08:30, Lahiri, đối chiếu CẢ HAI oracle (Section 8)", () => {
  const provider = new SwissEphemerisProvider();

  const cases = [
    { body: "sun", tropical: fullWesternChart().planets.find((p) => p.body === "sun")!.longitude, expectedName: "purva_bhadrapada" as const, expectedPada: 3 as const, expectedLord: "jupiter" },
    { body: "moon", tropical: fullWesternChart().planets.find((p) => p.body === "moon")!.longitude, expectedName: "anuradha" as const, expectedPada: 1 as const, expectedLord: "saturn" },
    { body: "saturn", tropical: fullWesternChart().planets.find((p) => p.body === "saturn")!.longitude, expectedName: "anuradha" as const, expectedPada: 1 as const, expectedLord: "saturn" },
  ];

  for (const { body, tropical, expectedName, expectedPada, expectedLord } of cases) {
    it(`${body}: khớp CẢ HAI oracle (PyJHora native + vedic-calc manual subtraction) — ${expectedName} pada ${expectedPada}`, () => {
      const rashi = calculateRashi({ provider, utcInstant: HANOI_1985_UTC_INSTANT, tropicalLongitude: tropical });
      expect(rashi.ok).toBe(true);
      if (rashi.ok) {
        const nakshatra = calculateNakshatraPosition(body, rashi.result.siderealLongitude);
        expect(nakshatra.name).toBe(expectedName);
        expect(nakshatra.pada).toBe(expectedPada);
        expect(nakshatra.lord).toBe(expectedLord);
      }
    });
  }
});
