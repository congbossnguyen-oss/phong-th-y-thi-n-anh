import { describe, expect, it } from "vitest";

import { ZODIAC_SIGNS, type ZodiacSign } from "../../chart/types.js";
import {
  countSignsForward,
  getD2HoraSign,
  getD3DrekkanaSign,
  getD4ChaturthamsaSign,
  getD7SaptamsaSign,
  getD9NavamsaSign,
  getD10DasamsaSign,
  getDivisionalSign,
} from "../divisional.js";

describe("countSignsForward — primitive dùng chung (D3/D4/D7/D9/D10; D12/D16/... batch sau)", () => {
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

describe("getD7SaptamsaSign — offset lẻ=part, chẵn=part+6 (nhà thứ 7), part width = 30/7", () => {
  const w = 30 / 7; // độ rộng mỗi phần — dùng biểu thức, KHÔNG literal thập phân, để khớp đúng double runtime sẽ tính.

  it("7 phần trên cung lẻ (Aries) — mỗi phần offset = part (đếm từ chính cung)", () => {
    expect(getD7SaptamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD7SaptamsaSign("aries", w)).toBe("taurus"); // part1, biên đúng thuộc phần sau
    expect(getD7SaptamsaSign("aries", 2 * w)).toBe("gemini"); // part2
    expect(getD7SaptamsaSign("aries", 3 * w)).toBe("cancer"); // part3
    expect(getD7SaptamsaSign("aries", 4 * w)).toBe("leo"); // part4
    expect(getD7SaptamsaSign("aries", 5 * w)).toBe("virgo"); // part5 — biên có discrepancy đã biết với PyJHora, xem test riêng dưới
    expect(getD7SaptamsaSign("aries", 6 * w)).toBe("libra"); // part6
  });

  it("biên NGAY DƯỚI mỗi phần vẫn thuộc phần TRƯỚC (closed-lower/open-upper)", () => {
    expect(getD7SaptamsaSign("aries", w - 1e-9)).toBe("aries");
    expect(getD7SaptamsaSign("aries", 2 * w - 1e-9)).toBe("taurus");
    expect(getD7SaptamsaSign("aries", 6 * w - 1e-9)).toBe("virgo"); // vẫn part5=[5w,6w) → Virgo, chưa sang part6
  });

  it("biên NGAY TRÊN mỗi phần đã thuộc phần SAU", () => {
    expect(getD7SaptamsaSign("aries", w + 1e-9)).toBe("taurus");
    expect(getD7SaptamsaSign("aries", 6 * w + 1e-9)).toBe("libra");
  });

  it("gần 30° (phần cuối, part6) vẫn ổn định, không tràn sang phần 7 không tồn tại", () => {
    expect(getD7SaptamsaSign("aries", 30 - 1e-9)).toBe("libra");
  });

  it("cung chẵn (Taurus) — offset = part + 6 (đếm từ nhà thứ 7 tính từ chính cung)", () => {
    expect(getD7SaptamsaSign("taurus", 0)).toBe("scorpio"); // part0: Taurus(1)+0+6=7=Scorpio
    expect(getD7SaptamsaSign("taurus", w)).toBe("sagittarius"); // part1: Taurus(1)+1+6=8=Sagittarius
    expect(getD7SaptamsaSign("taurus", 6 * w)).toBe("taurus"); // part6: Taurus(1)+6+6=13%12=1=Taurus — vòng qua điểm nối
  });

  it("KNOWN DISCREPANCY: biên chính xác 5×30/7° (~21.42857142857°) — dùng hành vi project-consistent (Math.floor), KHÔNG tái tạo lỗi Python `//` của PyJHora", () => {
    // Đã xác nhận trong preflight ("Batch 2 — D7/D9/D10 Preflight"): PyJHora's Python `//` cho part=4
    // (sai) tại đúng giá trị này thay vì part=5 (đúng, khớp vedic-calc) — lỗi floating-point CỦA
    // PYTHON, không phải khác biệt trường phái. `Math.floor` trong JavaScript KHÔNG có lỗi này.
    const exactBoundary = (5 * 30) / 7;
    expect(getD7SaptamsaSign("aries", exactBoundary)).toBe("virgo"); // part5 → offset5 → Aries+5=Virgo. Khớp vedic-calc, KHÔNG khớp PyJHora ("leo", part4).
    expect(getD7SaptamsaSign("taurus", exactBoundary)).toBe("aries"); // part5+6=11 → Taurus(1)+11=12%12=0=Aries. Khớp vedic-calc, KHÔNG khớp PyJHora ("pisces").
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/direction sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "cancer",
      taurus: "aquarius",
      gemini: "virgo",
      cancer: "aries",
      leo: "scorpio",
      virgo: "gemini",
      libra: "capricorn",
      scorpio: "leo",
      sagittarius: "pisces",
      capricorn: "libra",
      aquarius: "taurus",
      pisces: "sagittarius",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD7SaptamsaSign(sign, 16.0)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này — không trùng benchmark Batch 1)", () => {
    expect(getD7SaptamsaSign("gemini", 24.1567)).toBe("scorpio"); // sun
    expect(getD7SaptamsaSign("capricorn", 2.931)).toBe("cancer"); // moon
    expect(getD7SaptamsaSign("leo", 19.4402)).toBe("sagittarius"); // mars
    expect(getD7SaptamsaSign("gemini", 8.7765)).toBe("leo"); // mercury
    expect(getD7SaptamsaSign("scorpio", 27.0021)).toBe("scorpio"); // jupiter
    expect(getD7SaptamsaSign("taurus", 3.33)).toBe("scorpio"); // venus
    expect(getD7SaptamsaSign("virgo", 11.1187)).toBe("taurus"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD7SaptamsaSign("libra", 9.1)).toBe(getD7SaptamsaSign("libra", 9.1));
  });
});

describe("getD9NavamsaSign — cung bắt đầu theo NGUYÊN TỐ (element), luôn đếm tới trước, part width = 30/9", () => {
  const w = 30 / 9;

  it("Hoả (fire, vd. Aries) → bắt đầu từ Aries", () => {
    expect(getD9NavamsaSign("aries", 0)).toBe("aries");
    expect(getD9NavamsaSign("leo", 0)).toBe("aries");
    expect(getD9NavamsaSign("sagittarius", 0)).toBe("aries");
  });

  it("Thổ (earth, vd. Taurus) → bắt đầu từ Capricorn", () => {
    expect(getD9NavamsaSign("taurus", 0)).toBe("capricorn");
    expect(getD9NavamsaSign("virgo", 0)).toBe("capricorn");
    expect(getD9NavamsaSign("capricorn", 0)).toBe("capricorn");
  });

  it("Khí (air, vd. Gemini) → bắt đầu từ Libra", () => {
    expect(getD9NavamsaSign("gemini", 0)).toBe("libra");
    expect(getD9NavamsaSign("libra", 0)).toBe("libra");
    expect(getD9NavamsaSign("aquarius", 0)).toBe("libra");
  });

  it("Thuỷ (water, vd. Cancer) → bắt đầu từ Cancer", () => {
    expect(getD9NavamsaSign("cancer", 0)).toBe("cancer");
    expect(getD9NavamsaSign("scorpio", 0)).toBe("cancer");
    expect(getD9NavamsaSign("pisces", 0)).toBe("cancer");
  });

  it("KHÔNG dùng movable/fixed/dual — Aries(movable)/Leo(fixed)/Sagittarius(dual) đều cùng element Hoả nên cho CÙNG kết quả tại cùng độ (xác nhận element-based, không phải modality-based)", () => {
    expect(getD9NavamsaSign("aries", 12.0)).toBe(getD9NavamsaSign("leo", 12.0));
    expect(getD9NavamsaSign("leo", 12.0)).toBe(getD9NavamsaSign("sagittarius", 12.0));
  });

  it("9 phần trên Aries — đếm tới trước từ Aries theo part", () => {
    expect(getD9NavamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD9NavamsaSign("aries", w)).toBe("taurus"); // part1
    expect(getD9NavamsaSign("aries", 2 * w)).toBe("gemini"); // part2
    expect(getD9NavamsaSign("aries", 8 * w)).toBe("sagittarius"); // part8 (phần cuối)
  });

  it("KNOWN DISCREPANCY: biên chính xác 10° và 20° (= 3×30/9, 6×30/9) — dùng Math.floor, KHÔNG tái tạo lỗi Python `//` của PyJHora", () => {
    expect(getD9NavamsaSign("aries", 10.0)).toBe("cancer"); // part3 → Aries+3=Cancer. Khớp vedic-calc, KHÔNG khớp PyJHora ("gemini", part2 sai).
    expect(getD9NavamsaSign("aries", 20.0)).toBe("libra"); // part6 → Aries+6=Libra. Khớp vedic-calc, KHÔNG khớp PyJHora ("virgo", part5 sai).
  });

  it("biên NGAY DƯỚI/TRÊN 10° và 20° phân loại đúng (không dùng epsilon che lỗi)", () => {
    expect(getD9NavamsaSign("aries", 10.0 - 1e-9)).toBe("gemini"); // vẫn part2
    expect(getD9NavamsaSign("aries", 10.0 + 1e-9)).toBe("cancer"); // đã sang part3
    expect(getD9NavamsaSign("aries", 20.0 - 1e-9)).toBe("virgo"); // vẫn part5
    expect(getD9NavamsaSign("aries", 20.0 + 1e-9)).toBe("libra"); // đã sang part6
  });

  it("gần 30° vẫn ổn định (phần cuối, part8)", () => {
    expect(getD9NavamsaSign("aries", 30 - 1e-9)).toBe("sagittarius");
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/direction sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "taurus",
      taurus: "aquarius",
      gemini: "scorpio",
      cancer: "leo",
      leo: "taurus",
      virgo: "aquarius",
      libra: "scorpio",
      scorpio: "leo",
      sagittarius: "taurus",
      capricorn: "aquarius",
      aquarius: "scorpio",
      pisces: "leo",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD9NavamsaSign(sign, 5.0)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này)", () => {
    expect(getD9NavamsaSign("gemini", 24.1567)).toBe("taurus"); // sun
    expect(getD9NavamsaSign("capricorn", 2.931)).toBe("capricorn"); // moon
    expect(getD9NavamsaSign("leo", 19.4402)).toBe("virgo"); // mars
    expect(getD9NavamsaSign("gemini", 8.7765)).toBe("sagittarius"); // mercury
    expect(getD9NavamsaSign("scorpio", 27.0021)).toBe("pisces"); // jupiter
    expect(getD9NavamsaSign("taurus", 3.33)).toBe("capricorn"); // venus
    expect(getD9NavamsaSign("virgo", 11.1187)).toBe("aries"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD9NavamsaSign("pisces", 27.4)).toBe(getD9NavamsaSign("pisces", 27.4));
  });
});

describe("getD10DasamsaSign — offset lẻ=part, chẵn=part+8 (nhà thứ 9), part width = 3° (chia hết, không có vấn đề phân số tuần hoàn)", () => {
  it("10 phần trên cung lẻ (Aries) — offset = part (đếm từ chính cung)", () => {
    expect(getD10DasamsaSign("aries", 0)).toBe("aries");
    expect(getD10DasamsaSign("aries", 3)).toBe("taurus");
    expect(getD10DasamsaSign("aries", 6)).toBe("gemini");
    expect(getD10DasamsaSign("aries", 27)).toBe("capricorn"); // part9 (phần cuối)
  });

  it("mọi biên nguyên (3,6,...,27) đều phân loại đúng vào phần SAU (open-upper), không dùng epsilon", () => {
    for (let k = 1; k <= 9; k++) {
      const boundary = k * 3;
      const below = getD10DasamsaSign("aries", boundary - 1e-9);
      const at = getD10DasamsaSign("aries", boundary);
      const above = getD10DasamsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above); // biên chính xác thuộc phần SAU, giống ngay trên biên
      expect(at).not.toBe(below); // và khác phần TRƯỚC
    }
  });

  it("cung chẵn (Taurus) — offset = part + 8 (đếm từ nhà thứ 9, tức Capricorn)", () => {
    expect(getD10DasamsaSign("taurus", 0)).toBe("capricorn"); // Taurus(1)+8=9=Capricorn
    expect(getD10DasamsaSign("taurus", 3)).toBe("aquarius");
    expect(getD10DasamsaSign("taurus", 12)).toBe("taurus"); // part4: Taurus(1)+8+4=13%12=1=Taurus — vòng qua điểm nối
  });

  it("gần 30° vẫn ổn định (phần cuối, part9)", () => {
    expect(getD10DasamsaSign("aries", 30 - 1e-9)).toBe("capricorn");
    expect(getD10DasamsaSign("taurus", 30 - 1e-9)).toBe("libra");
  });

  it("không có discrepancy với PyJHora (part width 3° chia hết, không phải phân số tuần hoàn)", () => {
    // Đối lập D7/D9 — xác nhận trong preflight rằng D10 khớp 100% cả hai oracle tại mọi boundary.
    expect(getD10DasamsaSign("aries", 9)).toBe("cancer");
    expect(getD10DasamsaSign("aries", 21)).toBe("scorpio");
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/direction sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "virgo",
      taurus: "gemini",
      gemini: "scorpio",
      cancer: "leo",
      leo: "capricorn",
      virgo: "libra",
      libra: "pisces",
      scorpio: "sagittarius",
      sagittarius: "taurus",
      capricorn: "aquarius",
      aquarius: "cancer",
      pisces: "aries",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD10DasamsaSign(sign, 16.0)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này)", () => {
    expect(getD10DasamsaSign("gemini", 24.1567)).toBe("aquarius"); // sun
    expect(getD10DasamsaSign("capricorn", 2.931)).toBe("virgo"); // moon
    expect(getD10DasamsaSign("leo", 19.4402)).toBe("aquarius"); // mars
    expect(getD10DasamsaSign("gemini", 8.7765)).toBe("leo"); // mercury
    expect(getD10DasamsaSign("scorpio", 27.0021)).toBe("aries"); // jupiter
    expect(getD10DasamsaSign("taurus", 3.33)).toBe("aquarius"); // venus
    expect(getD10DasamsaSign("virgo", 11.1187)).toBe("leo"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD10DasamsaSign("cancer", 17.7)).toBe(getD10DasamsaSign("cancer", 17.7));
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

  it("varga=7 khớp getD7SaptamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(7, sign, degree)).toBe(getD7SaptamsaSign(sign, degree));
      }
    }
  });

  it("varga=9 khớp getD9NavamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(9, sign, degree)).toBe(getD9NavamsaSign(sign, degree));
      }
    }
  });

  it("varga=10 khớp getD10DasamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(10, sign, degree)).toBe(getD10DasamsaSign(sign, degree));
      }
    }
  });

  it("Batch 1 (D2/D3/D4) KHÔNG bị regress bởi việc thêm D7/D9/D10 — case thực tế benchmark Batch 1 vẫn đúng", () => {
    expect(getDivisionalSign(2, "aquarius", 27.7812)).toBe("cancer");
    expect(getDivisionalSign(3, "aquarius", 27.7812)).toBe("libra");
    expect(getDivisionalSign(4, "aquarius", 27.7812)).toBe("scorpio");
  });

  it("mọi kết quả LUÔN là một ZodiacSign hợp lệ trên toàn bộ 12 cung x 6 varga", () => {
    const vargas = [2, 3, 4, 7, 9, 10] as const;
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
