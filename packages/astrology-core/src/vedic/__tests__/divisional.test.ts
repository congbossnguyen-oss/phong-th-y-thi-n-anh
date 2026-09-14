import { describe, expect, it } from "vitest";

import { ZODIAC_SIGNS, type ZodiacSign } from "../../chart/types.js";
import { countSignsForward, getD2HoraSign, getD3DrekkanaSign, getD4ChaturthamsaSign, getDivisionalSign } from "../divisional.js";

describe("countSignsForward — primitive dùng chung (D3/D4 batch này, D7/D9/... batch sau)", () => {
  it("offset 0 => giữ nguyên cung gốc", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(countSignsForward(sign, 0)).toBe(sign);
    }
  });

  it("đếm tới không vòng qua điểm nối", () => {
    expect(countSignsForward("aries", 4)).toBe("leo");
    expect(countSignsForward("aries", 8)).toBe("sagittarius");
  });

  it("vòng qua điểm nối 12->1 đúng", () => {
    expect(countSignsForward("sagittarius", 4)).toBe("aries"); // Sagittarius(8) + 4 = 12 % 12 = 0 = Aries
    expect(countSignsForward("pisces", 1)).toBe("aries");
    expect(countSignsForward("pisces", 3)).toBe("gemini");
  });

  it("tính xác định (deterministic)", () => {
    expect(countSignsForward("scorpio", 5)).toBe(countSignsForward("scorpio", 5));
  });
});

describe("getD2HoraSign — Traditional Parasara (Only Leo & Cancer), D2 METHOD RESOLUTION", () => {
  it("cung lẻ (Aries), nửa đầu [0,15) => Leo", () => {
    expect(getD2HoraSign("aries", 0)).toBe("leo");
    expect(getD2HoraSign("aries", 7.5)).toBe("leo");
    expect(getD2HoraSign("aries", 14.9999999)).toBe("leo");
  });

  it("cung lẻ (Aries), nửa sau [15,30) => Cancer — biên 15° THUỘC nửa sau (open-upper)", () => {
    expect(getD2HoraSign("aries", 15)).toBe("cancer");
    expect(getD2HoraSign("aries", 15.0000001)).toBe("cancer");
    expect(getD2HoraSign("aries", 29.9999999)).toBe("cancer");
  });

  it("cung chẵn (Taurus), nửa đầu [0,15) => Cancer (ngược cung lẻ)", () => {
    expect(getD2HoraSign("taurus", 0)).toBe("cancer");
    expect(getD2HoraSign("taurus", 7.5)).toBe("cancer");
    expect(getD2HoraSign("taurus", 14.9999999)).toBe("cancer");
  });

  it("cung chẵn (Taurus), nửa sau [15,30) => Leo", () => {
    expect(getD2HoraSign("taurus", 15)).toBe("leo");
    expect(getD2HoraSign("taurus", 29.9999999)).toBe("leo");
  });

  it("mọi cung lẻ khác cho CÙNG kết quả theo độ (không phụ thuộc cung cụ thể, chỉ phụ thuộc lẻ/chẵn)", () => {
    const oddSigns: ZodiacSign[] = ["aries", "gemini", "leo", "libra", "sagittarius", "aquarius"];
    for (const sign of oddSigns) {
      expect(getD2HoraSign(sign, 5)).toBe("leo");
      expect(getD2HoraSign(sign, 20)).toBe("cancer");
    }
  });

  it("mọi cung chẵn khác cho CÙNG kết quả theo độ", () => {
    const evenSigns: ZodiacSign[] = ["taurus", "cancer", "virgo", "scorpio", "capricorn", "pisces"];
    for (const sign of evenSigns) {
      expect(getD2HoraSign(sign, 5)).toBe("cancer");
      expect(getD2HoraSign(sign, 20)).toBe("leo");
    }
  });

  it("chỉ có 2 cung kết quả khả dĩ trên toàn bộ 12 cung x mọi độ", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 5, 14.999, 15, 15.001, 29.999]) {
        const result = getD2HoraSign(sign, degree);
        expect(["leo", "cancer"]).toContain(result);
      }
    }
  });

  it("case thực tế (benchmark Hanoi 1985-03-12, oracle-verified — xem V1_1_DIVISIONAL_CHARTS_IMPLEMENTATION.md)", () => {
    // Sun sidereal Aquarius 27.7812° — Aquarius là cung LẺ (vị trí 1-indexed thứ 11), nửa sau => cancer.
    expect(getD2HoraSign("aquarius", 27.7812)).toBe("cancer");
    expect(getD2HoraSign("scorpio", 6.3647)).toBe("cancer");
    expect(getD2HoraSign("aries", 4.0685)).toBe("leo");
    expect(getD2HoraSign("pisces", 14.7802)).toBe("cancer");
    expect(getD2HoraSign("capricorn", 13.6031)).toBe("cancer");
    expect(getD2HoraSign("pisces", 28.5919)).toBe("leo");
    expect(getD2HoraSign("scorpio", 4.4617)).toBe("cancer");
  });
});

describe("getD3DrekkanaSign — offset (0,4,8) = cung gốc/thứ 5/thứ 9 (tam hợp)", () => {
  it("phần 1 [0,10) => cung gốc (offset 0)", () => {
    expect(getD3DrekkanaSign("aries", 0)).toBe("aries");
    expect(getD3DrekkanaSign("aries", 9.9999999)).toBe("aries");
  });

  it("phần 2 [10,20) => cung thứ 5 (offset 4) — biên 10° THUỘC phần 2", () => {
    expect(getD3DrekkanaSign("aries", 10)).toBe("leo");
    expect(getD3DrekkanaSign("aries", 15)).toBe("leo");
    expect(getD3DrekkanaSign("aries", 19.9999999)).toBe("leo");
  });

  it("phần 3 [20,30) => cung thứ 9 (offset 8) — biên 20° THUỘC phần 3", () => {
    expect(getD3DrekkanaSign("aries", 20)).toBe("sagittarius");
    expect(getD3DrekkanaSign("aries", 29.9999999)).toBe("sagittarius");
  });

  it("vòng qua điểm nối 12->1 khi cung gốc gần cuối hoàng đạo", () => {
    expect(getD3DrekkanaSign("scorpio", 0)).toBe("scorpio"); // offset0
    expect(getD3DrekkanaSign("scorpio", 15)).toBe("pisces"); // +4 => Scorpio(7)+4=11=Pisces
    expect(getD3DrekkanaSign("scorpio", 25)).toBe("cancer"); // +8 => Scorpio(7)+8=15%12=3=Cancer
  });

  it("case thực tế (benchmark Hanoi 1985-03-12, oracle-verified)", () => {
    expect(getD3DrekkanaSign("aquarius", 27.7812)).toBe("libra");
    expect(getD3DrekkanaSign("scorpio", 6.3647)).toBe("scorpio");
    expect(getD3DrekkanaSign("aries", 4.0685)).toBe("aries");
    expect(getD3DrekkanaSign("pisces", 14.7802)).toBe("cancer");
    expect(getD3DrekkanaSign("capricorn", 13.6031)).toBe("taurus");
    expect(getD3DrekkanaSign("pisces", 28.5919)).toBe("scorpio");
    expect(getD3DrekkanaSign("scorpio", 4.4617)).toBe("scorpio");
  });

  it("tính xác định (deterministic)", () => {
    expect(getD3DrekkanaSign("gemini", 12.3)).toBe(getD3DrekkanaSign("gemini", 12.3));
  });
});

describe("getD4ChaturthamsaSign — offset = part × 3, KHÔNG phân biệt lẻ/chẵn", () => {
  it("phần 1 [0,7.5) => offset 0 (cung gốc)", () => {
    expect(getD4ChaturthamsaSign("aries", 0)).toBe("aries");
    expect(getD4ChaturthamsaSign("aries", 7.4999999)).toBe("aries");
  });

  it("phần 2 [7.5,15) => offset 3 — biên 7.5° THUỘC phần 2", () => {
    expect(getD4ChaturthamsaSign("aries", 7.5)).toBe("cancer");
    expect(getD4ChaturthamsaSign("aries", 14.9999999)).toBe("cancer");
  });

  it("phần 3 [15,22.5) => offset 6 — biên 15° THUỘC phần 3", () => {
    expect(getD4ChaturthamsaSign("aries", 15)).toBe("libra");
    expect(getD4ChaturthamsaSign("aries", 22.4999999)).toBe("libra");
  });

  it("phần 4 [22.5,30) => offset 9 — biên 22.5° THUỘC phần 4", () => {
    expect(getD4ChaturthamsaSign("aries", 22.5)).toBe("capricorn");
    expect(getD4ChaturthamsaSign("aries", 29.9999999)).toBe("capricorn");
  });

  it("cung lẻ và cung chẵn dùng CÙNG công thức (không có nhánh lẻ/chẵn cho D4)", () => {
    expect(getD4ChaturthamsaSign("taurus", 0)).toBe("taurus");
    expect(getD4ChaturthamsaSign("taurus", 10)).toBe("leo");
    expect(getD4ChaturthamsaSign("taurus", 29.9999999)).toBe("aquarius");
  });

  it("vòng qua điểm nối 12->1", () => {
    expect(getD4ChaturthamsaSign("cancer", 29.9999999)).toBe("aries"); // Cancer(3)+9=12%12=0=Aries
  });

  it("case thực tế (benchmark Hanoi 1985-03-12, oracle-verified)", () => {
    expect(getD4ChaturthamsaSign("aquarius", 27.7812)).toBe("scorpio");
    expect(getD4ChaturthamsaSign("scorpio", 6.3647)).toBe("scorpio");
    expect(getD4ChaturthamsaSign("aries", 4.0685)).toBe("aries");
    expect(getD4ChaturthamsaSign("pisces", 14.7802)).toBe("gemini");
    expect(getD4ChaturthamsaSign("capricorn", 13.6031)).toBe("aries");
    expect(getD4ChaturthamsaSign("pisces", 28.5919)).toBe("sagittarius");
    expect(getD4ChaturthamsaSign("scorpio", 4.4617)).toBe("scorpio");
  });

  it("tính xác định (deterministic)", () => {
    expect(getD4ChaturthamsaSign("virgo", 3.7)).toBe(getD4ChaturthamsaSign("virgo", 3.7));
  });
});

describe("getDivisionalSign — điểm vào chung, dispatch đúng theo VargaId", () => {
  it("varga=2 khớp getD2HoraSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(2, sign, degree)).toBe(getD2HoraSign(sign, degree));
      }
    }
  });

  it("varga=3 khớp getD3DrekkanaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(3, sign, degree)).toBe(getD3DrekkanaSign(sign, degree));
      }
    }
  });

  it("varga=4 khớp getD4ChaturthamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(4, sign, degree)).toBe(getD4ChaturthamsaSign(sign, degree));
      }
    }
  });

  it("mọi kết quả LUÔN là một ZodiacSign hợp lệ trên toàn bộ 12 cung x 3 varga", () => {
    const vargas = [2, 3, 4] as const;
    for (const varga of vargas) {
      for (const sign of ZODIAC_SIGNS) {
        for (const degree of [0, 5, 10, 15, 20, 25, 29.9999]) {
          const result = getDivisionalSign(varga, sign, degree);
          expect(ZODIAC_SIGNS).toContain(result);
        }
      }
    }
  });
});
