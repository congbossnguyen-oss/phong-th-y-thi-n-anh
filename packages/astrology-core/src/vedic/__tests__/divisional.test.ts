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
  getD12DwadasamsaSign,
  getD16ShodasamsaSign,
  getD20VimsamsaSign,
  getD24ChaturvimsamsaSign,
  getD27NakshatramsaSign,
  getD30TrimsamsaSign,
  getD40KhavedamsaSign,
  getD45AkshavedamsaSign,
  getD60ShashtiamsaSign,
  getDivisionalSign,
} from "../divisional.js";

/**
 * TEST-ONLY IEEE-754 ULP utility — dùng RIÊNG cho D45 (30/45 = 2/3° không có biểu diễn nhị phân
 * hữu hạn). Trả về số double biểu diễn được GẦN NHẤT phía trên/dưới `x`, thao tác trực tiếp trên
 * 64 bit của double qua DataView (big-endian trong buffer, không phụ thuộc endianness máy thật) —
 * KHÔNG dùng epsilon/tolerance tuỳ ý nào. Độc lập hoàn toàn với `divisional.ts` (không import gì
 * từ production code). Chỉ đúng với x hữu hạn, khác 0 — đủ cho phạm vi test (0° < x < 30°).
 */
function nextAfter(x: number, towardsPositive: boolean): number {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, x, false);
  let hi = view.getUint32(0, false);
  let lo = view.getUint32(4, false);
  const increasingMagnitude = x > 0 === towardsPositive;
  if (increasingMagnitude) {
    lo = (lo + 1) >>> 0;
    if (lo === 0) hi = (hi + 1) >>> 0;
  } else {
    if (lo === 0) hi = (hi - 1) >>> 0;
    lo = (lo - 1) >>> 0;
  }
  view.setUint32(0, hi, false);
  view.setUint32(4, lo, false);
  return view.getFloat64(0, false);
}
const nextUp = (x: number): number => nextAfter(x, true);
const nextDown = (x: number): number => nextAfter(x, false);

describe("countSignsForward — primitive dùng chung (D3/D4/D7/D9/D10/D12/D16/D20; D24/... batch sau)", () => {
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

describe("getD12DwadasamsaSign — offset = part, KHÔNG phân biệt lẻ/chẵn/modality/element", () => {
  const w = 30 / 12; // 2.5°

  it("12 phần trên Aries — mỗi phần offset = part (đếm từ chính cung)", () => {
    expect(getD12DwadasamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD12DwadasamsaSign("aries", w)).toBe("taurus"); // part1
    expect(getD12DwadasamsaSign("aries", 5 * w)).toBe("virgo"); // part5
    expect(getD12DwadasamsaSign("aries", 11 * w)).toBe("pisces"); // part11 (phần cuối)
  });

  it("mọi biên (2.5°, 5°, ..., 27.5°) đều phân loại đúng vào phần SAU (open-upper), không dùng epsilon", () => {
    for (let k = 1; k <= 11; k++) {
      const boundary = k * w;
      const below = getD12DwadasamsaSign("aries", boundary - 1e-9);
      const at = getD12DwadasamsaSign("aries", boundary);
      const above = getD12DwadasamsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("KHÔNG có nhánh lẻ/chẵn — cung lẻ (Aries) và cung chẵn (Taurus) dùng CÙNG công thức offset=part", () => {
    expect(getD12DwadasamsaSign("taurus", 0)).toBe("taurus"); // Taurus(1)+0=Taurus
    expect(getD12DwadasamsaSign("taurus", w)).toBe("gemini"); // Taurus(1)+1=Gemini
    expect(getD12DwadasamsaSign("taurus", 5 * w)).toBe("libra"); // Taurus(1)+5=Libra
  });

  it("KHÔNG có nhánh modality — movable (Aries), fixed (Leo), dual (Gemini) đều dùng offset=part từ CHÍNH cung, không dùng cung bắt đầu chung", () => {
    // Nếu D12 vô tình dùng modality (như D16/D20), Leo/Gemini sẽ không bắt đầu từ chính nó.
    expect(getD12DwadasamsaSign("leo", 0)).toBe("leo"); // Leo(4)+0=Leo, KHÔNG phải Aries/Sagittarius
    expect(getD12DwadasamsaSign("gemini", 0)).toBe("gemini"); // Gemini(2)+0=Gemini, KHÔNG phải Libra
  });

  it("vòng qua điểm nối 12->1", () => {
    expect(getD12DwadasamsaSign("scorpio", 15)).toBe("taurus"); // Scorpio(7)+6=13%12=1=Taurus
  });

  it("gần 30° vẫn ổn định (phần cuối, part11)", () => {
    expect(getD12DwadasamsaSign("aries", 30 - 1e-9)).toBe("pisces");
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "sagittarius",
      taurus: "capricorn",
      gemini: "aquarius",
      cancer: "pisces",
      leo: "aries",
      virgo: "taurus",
      libra: "gemini",
      scorpio: "cancer",
      sagittarius: "leo",
      capricorn: "virgo",
      aquarius: "libra",
      pisces: "scorpio",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD12DwadasamsaSign(sign, 21.6)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này — không trùng benchmark Batch 1/2)", () => {
    expect(getD12DwadasamsaSign("sagittarius", 5.55)).toBe("aquarius"); // sun
    expect(getD12DwadasamsaSign("cancer", 23.45)).toBe("aries"); // moon
    expect(getD12DwadasamsaSign("aquarius", 1.1)).toBe("aquarius"); // mars
    expect(getD12DwadasamsaSign("sagittarius", 19.9)).toBe("cancer"); // mercury
    expect(getD12DwadasamsaSign("libra", 28.28)).toBe("virgo"); // jupiter
    expect(getD12DwadasamsaSign("pisces", 9.99)).toBe("gemini"); // venus
    expect(getD12DwadasamsaSign("gemini", 15.15)).toBe("sagittarius"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD12DwadasamsaSign("virgo", 6.66)).toBe(getD12DwadasamsaSign("virgo", 6.66));
  });
});

describe("getD16ShodasamsaSign — cung bắt đầu theo MODALITY (movable/fixed/dual), part width = 30/16 = 1.875 (phân số nhị phân hữu hạn)", () => {
  const w = 30 / 16;

  it("Movable (vd. Aries/Cancer/Libra/Capricorn) → bắt đầu từ Aries", () => {
    expect(getD16ShodasamsaSign("aries", 0)).toBe("aries");
    expect(getD16ShodasamsaSign("cancer", 0)).toBe("aries");
    expect(getD16ShodasamsaSign("libra", 0)).toBe("aries");
    expect(getD16ShodasamsaSign("capricorn", 0)).toBe("aries");
  });

  it("Fixed (vd. Taurus/Leo/Scorpio/Aquarius) → bắt đầu từ Leo", () => {
    expect(getD16ShodasamsaSign("taurus", 0)).toBe("leo");
    expect(getD16ShodasamsaSign("leo", 0)).toBe("leo");
    expect(getD16ShodasamsaSign("scorpio", 0)).toBe("leo");
    expect(getD16ShodasamsaSign("aquarius", 0)).toBe("leo");
  });

  it("Dual (vd. Gemini/Virgo/Sagittarius/Pisces) → bắt đầu từ Sagittarius", () => {
    expect(getD16ShodasamsaSign("gemini", 0)).toBe("sagittarius");
    expect(getD16ShodasamsaSign("virgo", 0)).toBe("sagittarius");
    expect(getD16ShodasamsaSign("sagittarius", 0)).toBe("sagittarius");
    expect(getD16ShodasamsaSign("pisces", 0)).toBe("sagittarius");
  });

  it("16 phần trên Aries (movable) — đếm tới trước từ Aries theo part", () => {
    expect(getD16ShodasamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD16ShodasamsaSign("aries", w)).toBe("taurus"); // part1
    expect(getD16ShodasamsaSign("aries", 15 * w)).toBe("cancer"); // part15 (phần cuối): Aries+15=Cancer
  });

  it("mọi biên (1.875°, 3.75°, ..., 28.125°) đều phân loại đúng vào phần SAU (open-upper) — width là phân số nhị phân hữu hạn, không cần lưu ý đặc biệt như D7/D9", () => {
    for (let k = 1; k <= 15; k++) {
      const boundary = k * w;
      const below = getD16ShodasamsaSign("aries", boundary - 1e-9);
      const at = getD16ShodasamsaSign("aries", boundary);
      const above = getD16ShodasamsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("gần 30° vẫn ổn định (phần cuối, part15)", () => {
    expect(getD16ShodasamsaSign("aries", 30 - 1e-9)).toBe("cancer");
  });

  it("vòng qua điểm nối 12->1", () => {
    expect(getD16ShodasamsaSign("sagittarius", 5 * w)).toBe("taurus"); // dual→start Sagittarius(8), +5=13%12=1=Taurus — vòng qua điểm nối
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/modality sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "capricorn",
      taurus: "taurus",
      gemini: "virgo",
      cancer: "capricorn",
      leo: "taurus",
      virgo: "virgo",
      libra: "capricorn",
      scorpio: "taurus",
      sagittarius: "virgo",
      capricorn: "capricorn",
      aquarius: "taurus",
      pisces: "virgo",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD16ShodasamsaSign(sign, 17.8)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này)", () => {
    expect(getD16ShodasamsaSign("sagittarius", 5.55)).toBe("aquarius"); // sun
    expect(getD16ShodasamsaSign("cancer", 23.45)).toBe("aries"); // moon
    expect(getD16ShodasamsaSign("aquarius", 1.1)).toBe("leo"); // mars
    expect(getD16ShodasamsaSign("sagittarius", 19.9)).toBe("libra"); // mercury
    expect(getD16ShodasamsaSign("libra", 28.28)).toBe("cancer"); // jupiter
    expect(getD16ShodasamsaSign("pisces", 9.99)).toBe("taurus"); // venus
    expect(getD16ShodasamsaSign("gemini", 15.15)).toBe("leo"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD16ShodasamsaSign("scorpio", 12.34)).toBe(getD16ShodasamsaSign("scorpio", 12.34));
  });
});

describe("getD20VimsamsaSign — cung bắt đầu theo MODALITY (movable/fixed/dual), part width = 30/20 = 1.5", () => {
  const w = 30 / 20;

  it("Movable → bắt đầu từ Aries (giống D16)", () => {
    expect(getD20VimsamsaSign("aries", 0)).toBe("aries");
    expect(getD20VimsamsaSign("cancer", 0)).toBe("aries");
  });

  it("Fixed → bắt đầu từ Sagittarius (KHÁC D16 — D16 gán fixed→Leo)", () => {
    expect(getD20VimsamsaSign("taurus", 0)).toBe("sagittarius");
    expect(getD20VimsamsaSign("leo", 0)).toBe("sagittarius");
    expect(getD20VimsamsaSign("scorpio", 0)).toBe("sagittarius");
    expect(getD20VimsamsaSign("aquarius", 0)).toBe("sagittarius");
  });

  it("Dual → bắt đầu từ Leo (KHÁC D16 — D16 gán dual→Sagittarius)", () => {
    expect(getD20VimsamsaSign("gemini", 0)).toBe("leo");
    expect(getD20VimsamsaSign("virgo", 0)).toBe("leo");
    expect(getD20VimsamsaSign("sagittarius", 0)).toBe("leo");
    expect(getD20VimsamsaSign("pisces", 0)).toBe("leo");
  });

  it("REGRESSION GUARD — xác nhận tường minh D16 và D20 hoán đổi vai trò fixed/dual (không phải bảng giống nhau bị copy-paste nhầm)", () => {
    // Leo là FIXED: D16 cho Leo chính nó làm cung bắt đầu (fixed→Leo); D20 cho Sagittarius (fixed→Sagittarius).
    expect(getD16ShodasamsaSign("leo", 0)).toBe("leo");
    expect(getD20VimsamsaSign("leo", 0)).toBe("sagittarius");
    expect(getD16ShodasamsaSign("leo", 0)).not.toBe(getD20VimsamsaSign("leo", 0));

    // Gemini là DUAL: D16 cho Sagittarius (dual→Sagittarius); D20 cho Leo (dual→Leo).
    expect(getD16ShodasamsaSign("gemini", 0)).toBe("sagittarius");
    expect(getD20VimsamsaSign("gemini", 0)).toBe("leo");
    expect(getD16ShodasamsaSign("gemini", 0)).not.toBe(getD20VimsamsaSign("gemini", 0));
  });

  it("20 phần trên Aries (movable) — đếm tới trước từ Aries theo part", () => {
    expect(getD20VimsamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD20VimsamsaSign("aries", w)).toBe("taurus"); // part1
    expect(getD20VimsamsaSign("aries", 19 * w)).toBe("scorpio"); // part19 (phần cuối): Aries(0)+19=19%12=7=Scorpio
  });

  it("mọi biên (1.5°, 3°, ..., 28.5°) đều phân loại đúng vào phần SAU (open-upper)", () => {
    for (let k = 1; k <= 19; k++) {
      const boundary = k * w;
      const below = getD20VimsamsaSign("aries", boundary - 1e-9);
      const at = getD20VimsamsaSign("aries", boundary);
      const above = getD20VimsamsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("gần 30° vẫn ổn định (phần cuối, part19)", () => {
    expect(getD20VimsamsaSign("aries", 30 - 1e-9)).toBe(getD20VimsamsaSign("aries", 19 * w));
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/modality sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "gemini",
      taurus: "aquarius",
      gemini: "libra",
      cancer: "gemini",
      leo: "aquarius",
      virgo: "libra",
      libra: "gemini",
      scorpio: "aquarius",
      sagittarius: "libra",
      capricorn: "gemini",
      aquarius: "aquarius",
      pisces: "libra",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD20VimsamsaSign(sign, 4.4)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này)", () => {
    expect(getD20VimsamsaSign("sagittarius", 5.55)).toBe("scorpio"); // sun
    expect(getD20VimsamsaSign("cancer", 23.45)).toBe("cancer"); // moon
    expect(getD20VimsamsaSign("aquarius", 1.1)).toBe("sagittarius"); // mars
    expect(getD20VimsamsaSign("sagittarius", 19.9)).toBe("virgo"); // mercury
    expect(getD20VimsamsaSign("libra", 28.28)).toBe("libra"); // jupiter
    expect(getD20VimsamsaSign("pisces", 9.99)).toBe("aquarius"); // venus
    expect(getD20VimsamsaSign("gemini", 15.15)).toBe("gemini"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD20VimsamsaSign("capricorn", 8.88)).toBe(getD20VimsamsaSign("capricorn", 8.88));
  });
});

describe("getD24ChaturvimsamsaSign — cung lẻ đếm tới trước từ Leo, cung chẵn đếm tới trước từ Cancer, LUÔN đếm tới trước", () => {
  const w = 30 / 24; // 1.25°

  it("cung lẻ (Aries/Gemini/Leo/Libra/Sagittarius/Aquarius) — seed CỐ ĐỊNH là Leo, KHÔNG phải chính cung", () => {
    expect(getD24ChaturvimsamsaSign("aries", 0)).toBe("leo");
    expect(getD24ChaturvimsamsaSign("gemini", 0)).toBe("leo");
    expect(getD24ChaturvimsamsaSign("leo", 0)).toBe("leo");
    expect(getD24ChaturvimsamsaSign("libra", 0)).toBe("leo");
    expect(getD24ChaturvimsamsaSign("sagittarius", 0)).toBe("leo");
    expect(getD24ChaturvimsamsaSign("aquarius", 0)).toBe("leo");
  });

  it("cung chẵn (Taurus/Cancer/Virgo/Scorpio/Capricorn/Pisces) — seed CỐ ĐỊNH là Cancer, KHÔNG phải chính cung", () => {
    expect(getD24ChaturvimsamsaSign("taurus", 0)).toBe("cancer");
    expect(getD24ChaturvimsamsaSign("cancer", 0)).toBe("cancer");
    expect(getD24ChaturvimsamsaSign("virgo", 0)).toBe("cancer");
    expect(getD24ChaturvimsamsaSign("scorpio", 0)).toBe("cancer");
    expect(getD24ChaturvimsamsaSign("capricorn", 0)).toBe("cancer");
    expect(getD24ChaturvimsamsaSign("pisces", 0)).toBe("cancer");
  });

  it("24 phần trên Leo (odd, seed=Leo) — đếm tới trước theo part", () => {
    expect(getD24ChaturvimsamsaSign("leo", 0)).toBe("leo"); // part0
    expect(getD24ChaturvimsamsaSign("leo", w)).toBe("virgo"); // part1
    expect(getD24ChaturvimsamsaSign("leo", 23 * w)).toBe("cancer"); // part23 (phần cuối): Leo(4)+23=27%12=3=Cancer
  });

  it("mọi 23 biên (1.25°,2.5°,...,28.75°) đều phân loại đúng vào phần SAU (open-upper), không dùng epsilon", () => {
    for (let k = 1; k <= 23; k++) {
      const boundary = k * w;
      const below = getD24ChaturvimsamsaSign("leo", boundary - 1e-9);
      const at = getD24ChaturvimsamsaSign("leo", boundary);
      const above = getD24ChaturvimsamsaSign("leo", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("gần 30° vẫn ổn định (phần cuối, part23)", () => {
    expect(getD24ChaturvimsamsaSign("leo", 30 - 1e-9)).toBe("cancer");
    expect(getD24ChaturvimsamsaSign("taurus", 30 - 1e-9)).toBe("gemini"); // Cancer(3)+23=26%12=2=Gemini
  });

  it("vòng qua điểm nối 12->1 (part khiến seed+part vượt quá 11)", () => {
    expect(getD24ChaturvimsamsaSign("leo", 8 * w)).toBe("aries"); // Leo(4)+8=12%12=0=Aries
  });

  it("KHÔNG đảo hướng — chỉ implement chart_method=1 (method 2/3 KHÔNG được expose)", () => {
    // Nếu vô tình implement method 2 (even reversal), Taurus (even) tại part lớn sẽ đếm NGƯỢC từ Cancer thay vì tới trước.
    // Xác nhận cung chẵn luôn đếm TỚI (forward), khớp method 1 duy nhất.
    expect(getD24ChaturvimsamsaSign("taurus", w)).toBe("leo"); // Cancer(3)+1=4=Leo (forward, KHÔNG phải Cancer(3)-1=2=Gemini)
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/seed sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "aries",
      taurus: "pisces",
      gemini: "aries",
      cancer: "pisces",
      leo: "aries",
      virgo: "pisces",
      libra: "aries",
      scorpio: "pisces",
      sagittarius: "aries",
      capricorn: "pisces",
      aquarius: "aries",
      pisces: "pisces",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD24ChaturvimsamsaSign(sign, 11.1)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này — không trùng benchmark Batch 1/2/3)", () => {
    expect(getD24ChaturvimsamsaSign("scorpio", 8.8)).toBe("aquarius"); // sun
    expect(getD24ChaturvimsamsaSign("leo", 19.19)).toBe("scorpio"); // moon
    expect(getD24ChaturvimsamsaSign("pisces", 27.27)).toBe("aries"); // mars
    expect(getD24ChaturvimsamsaSign("scorpio", 2.2)).toBe("leo"); // mercury
    expect(getD24ChaturvimsamsaSign("aquarius", 13.13)).toBe("gemini"); // jupiter
    expect(getD24ChaturvimsamsaSign("cancer", 5.5)).toBe("scorpio"); // venus
    expect(getD24ChaturvimsamsaSign("libra", 24.24)).toBe("pisces"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD24ChaturvimsamsaSign("virgo", 17.5)).toBe(getD24ChaturvimsamsaSign("virgo", 17.5));
  });
});

describe("getD27NakshatramsaSign — cung bắt đầu theo NGUYÊN TỐ (element, KHÔNG phải modality), part width = 30/27 (phân số tuần hoàn — mức độ nặng nhất đã nghiên cứu)", () => {
  const w = 30 / 27; // dùng biểu thức, KHÔNG literal thập phân — bắt buộc theo phương pháp kiểm thử biên đã freeze cho D27.

  it("Hoả (fire) → bắt đầu từ Aries", () => {
    expect(getD27NakshatramsaSign("aries", 0)).toBe("aries");
    expect(getD27NakshatramsaSign("leo", 0)).toBe("aries");
    expect(getD27NakshatramsaSign("sagittarius", 0)).toBe("aries");
  });

  it("Thổ (earth) → bắt đầu từ Cancer (KHÁC D9 — D9 gán Thổ→Capricorn)", () => {
    expect(getD27NakshatramsaSign("taurus", 0)).toBe("cancer");
    expect(getD27NakshatramsaSign("virgo", 0)).toBe("cancer");
    expect(getD27NakshatramsaSign("capricorn", 0)).toBe("cancer");
  });

  it("Khí (air) → bắt đầu từ Libra", () => {
    expect(getD27NakshatramsaSign("gemini", 0)).toBe("libra");
    expect(getD27NakshatramsaSign("libra", 0)).toBe("libra");
    expect(getD27NakshatramsaSign("aquarius", 0)).toBe("libra");
  });

  it("Thuỷ (water) → bắt đầu từ Capricorn (KHÁC D9 — D9 gán Thuỷ→Cancer)", () => {
    expect(getD27NakshatramsaSign("cancer", 0)).toBe("capricorn");
    expect(getD27NakshatramsaSign("scorpio", 0)).toBe("capricorn");
    expect(getD27NakshatramsaSign("pisces", 0)).toBe("capricorn");
  });

  it("KHÔNG dùng modality — Aries(movable)/Leo(fixed)/Sagittarius(dual) đều cùng Hoả nên cho CÙNG kết quả tại cùng độ (xác nhận element-based, không phải D16/D20's modality-based)", () => {
    expect(getD27NakshatramsaSign("aries", 9.0)).toBe(getD27NakshatramsaSign("leo", 9.0));
    expect(getD27NakshatramsaSign("leo", 9.0)).toBe(getD27NakshatramsaSign("sagittarius", 9.0));
  });

  it("27 phần trên Aries — đếm tới trước từ Aries theo part", () => {
    expect(getD27NakshatramsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD27NakshatramsaSign("aries", w)).toBe("taurus"); // part1
    expect(getD27NakshatramsaSign("aries", 26 * w)).toBe("gemini"); // part26 (phần cuối): Aries(0)+26=26%12=2=Gemini
  });

  it("mọi 26 biên (dựng bằng k*partWidth — KHÔNG dùng k*30/27) đều phân loại đúng vào phần SAU, không dùng epsilon", () => {
    for (let k = 1; k <= 26; k++) {
      const boundary = k * w; // BẮT BUỘC k*w, KHÔNG phải k*30/27 — xem ghi chú precision-methodology đầu file divisional.ts.
      const below = getD27NakshatramsaSign("aries", boundary - 1e-9);
      const at = getD27NakshatramsaSign("aries", boundary);
      const above = getD27NakshatramsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("KNOWN DISCREPANCY: 10 biên nơi PyJHora's Python `//` sai (k=5,9,10,13,17,18,19,20,25,26) — dùng hành vi project-consistent (Math.floor + k*partWidth), KHÔNG tái tạo lỗi PyJHora", () => {
    // Đã xác nhận trong preflight ("Batch 4 — D24/D27/D30 Preflight"): đây là lỗi floating-point CỦA
    // PYTHON (Python's `//` operator), KHÔNG PHẢI khác biệt truyền thống — verified bằng thực thi
    // trực tiếp cả implementation này VÀ vedic-calc, cả hai khớp tuyệt đối tại các điểm này.
    const knownDiscrepancyKs = [5, 9, 10, 13, 17, 18, 19, 20, 25, 26];
    const expectedAtK: Record<number, ZodiacSign> = {
      5: "virgo",
      9: "capricorn",
      10: "aquarius",
      13: "taurus",
      17: "virgo",
      18: "libra",
      19: "scorpio",
      20: "sagittarius",
      25: "taurus",
      26: "gemini",
    };
    for (const k of knownDiscrepancyKs) {
      const boundary = k * w;
      expect(getD27NakshatramsaSign("aries", boundary)).toBe(expectedAtK[k]);
    }
  });

  it("gần 30° vẫn ổn định (phần cuối, part26)", () => {
    expect(getD27NakshatramsaSign("aries", 30 - 1e-9)).toBe(getD27NakshatramsaSign("aries", 26 * w));
  });

  it("12 cung đại diện tại cùng một độ — phát hiện offset/modulo/element sai nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "gemini",
      taurus: "virgo",
      gemini: "sagittarius",
      cancer: "pisces",
      leo: "gemini",
      virgo: "virgo",
      libra: "sagittarius",
      scorpio: "pisces",
      sagittarius: "gemini",
      capricorn: "virgo",
      aquarius: "sagittarius",
      pisces: "pisces",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD27NakshatramsaSign(sign, 16.6)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này)", () => {
    expect(getD27NakshatramsaSign("scorpio", 8.8)).toBe("leo"); // sun
    expect(getD27NakshatramsaSign("leo", 19.19)).toBe("virgo"); // moon
    expect(getD27NakshatramsaSign("pisces", 27.27)).toBe("capricorn"); // mars
    expect(getD27NakshatramsaSign("scorpio", 2.2)).toBe("aquarius"); // mercury
    expect(getD27NakshatramsaSign("aquarius", 13.13)).toBe("virgo"); // jupiter
    expect(getD27NakshatramsaSign("cancer", 5.5)).toBe("taurus"); // venus
    expect(getD27NakshatramsaSign("libra", 24.24)).toBe("cancer"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD27NakshatramsaSign("capricorn", 21.1)).toBe(getD27NakshatramsaSign("capricorn", 21.1));
  });
});

describe("getD30TrimsamsaSign — tra bảng khoảng độ KHÔNG đều theo lẻ/chẵn, KHÔNG dùng countSignsForward (đặc thù như D2/D3)", () => {
  it("cung lẻ (Gemini) — toàn bộ 5 khoảng khớp bảng Parashari", () => {
    expect(getD30TrimsamsaSign("gemini", 0)).toBe("aries");
    expect(getD30TrimsamsaSign("gemini", 4.9999999)).toBe("aries");
    expect(getD30TrimsamsaSign("gemini", 7)).toBe("aquarius");
    expect(getD30TrimsamsaSign("gemini", 15)).toBe("sagittarius");
    expect(getD30TrimsamsaSign("gemini", 22)).toBe("gemini");
    expect(getD30TrimsamsaSign("gemini", 27)).toBe("libra");
  });

  it("cung chẵn (Cancer) — toàn bộ 5 khoảng khớp bảng Parashari", () => {
    expect(getD30TrimsamsaSign("cancer", 0)).toBe("taurus");
    expect(getD30TrimsamsaSign("cancer", 4.9999999)).toBe("taurus");
    expect(getD30TrimsamsaSign("cancer", 8)).toBe("virgo");
    expect(getD30TrimsamsaSign("cancer", 15)).toBe("pisces");
    expect(getD30TrimsamsaSign("cancer", 22)).toBe("capricorn");
    expect(getD30TrimsamsaSign("cancer", 27)).toBe("scorpio");
  });

  it("mọi 4 biên nội bộ cung lẻ (5°,10°,18°,25°) đều phân loại đúng vào khoảng SAU (open-upper) — KHÔNG tái tạo lỗi inclusive-both-ends-list-scan của PyJHora", () => {
    for (const boundary of [5, 10, 18, 25]) {
      const below = getD30TrimsamsaSign("gemini", boundary - 1e-9);
      const at = getD30TrimsamsaSign("gemini", boundary);
      const above = getD30TrimsamsaSign("gemini", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("mọi 4 biên nội bộ cung chẵn (5°,12°,20°,25°) đều phân loại đúng vào khoảng SAU (open-upper)", () => {
    for (const boundary of [5, 12, 20, 25]) {
      const below = getD30TrimsamsaSign("cancer", boundary - 1e-9);
      const at = getD30TrimsamsaSign("cancer", boundary);
      const above = getD30TrimsamsaSign("cancer", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("KNOWN ORACLE ARTIFACT: PyJHora's inclusive-both-ends scan cho biên thuộc khoảng TRƯỚC — project dùng khoảng SAU (đã freeze, không đổi)", () => {
    // Tại đúng 5°: PyJHora (nếu chạy trực tiếp) trả về Aries (khoảng trước); project trả về Aquarius (khoảng sau, ĐÚNG hợp đồng).
    expect(getD30TrimsamsaSign("gemini", 5)).toBe("aquarius");
    expect(getD30TrimsamsaSign("gemini", 5)).not.toBe("aries");
  });

  it("0° và gần 30° ổn định ở cả hai đầu", () => {
    expect(getD30TrimsamsaSign("gemini", 0)).toBe("aries");
    expect(getD30TrimsamsaSign("gemini", 29.9999999)).toBe("libra");
    expect(getD30TrimsamsaSign("cancer", 0)).toBe("taurus");
    expect(getD30TrimsamsaSign("cancer", 29.9999999)).toBe("scorpio");
  });

  it("12 cung đại diện tại cùng một độ — phát hiện lỗi tra bảng nếu có", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "gemini",
      taurus: "capricorn",
      gemini: "gemini",
      cancer: "capricorn",
      leo: "gemini",
      virgo: "capricorn",
      libra: "gemini",
      scorpio: "capricorn",
      sagittarius: "gemini",
      capricorn: "capricorn",
      aquarius: "gemini",
      pisces: "capricorn",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD30TrimsamsaSign(sign, 21.2)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập, oracle-verified trực tiếp task này)", () => {
    expect(getD30TrimsamsaSign("scorpio", 8.8)).toBe("virgo"); // sun
    expect(getD30TrimsamsaSign("leo", 19.19)).toBe("gemini"); // moon
    expect(getD30TrimsamsaSign("pisces", 27.27)).toBe("scorpio"); // mars
    expect(getD30TrimsamsaSign("scorpio", 2.2)).toBe("taurus"); // mercury
    expect(getD30TrimsamsaSign("aquarius", 13.13)).toBe("sagittarius"); // jupiter
    expect(getD30TrimsamsaSign("cancer", 5.5)).toBe("virgo"); // venus
    expect(getD30TrimsamsaSign("libra", 24.24)).toBe("gemini"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD30TrimsamsaSign("aquarius", 3.3)).toBe(getD30TrimsamsaSign("aquarius", 3.3));
  });
});

describe("getD40KhavedamsaSign — cung lẻ đếm tới trước từ Aries, cung chẵn đếm tới trước từ Libra, part width = 30/40 = 0.75° (phân số nhị phân hữu hạn, KHÔNG có hazard)", () => {
  const w = 30 / 40;

  it("cung lẻ (Aries/Gemini/Leo/Libra/Sagittarius/Aquarius) — seed CỐ ĐỊNH là Aries, KHÔNG phải chính cung", () => {
    expect(getD40KhavedamsaSign("aries", 0)).toBe("aries");
    expect(getD40KhavedamsaSign("gemini", 0)).toBe("aries");
    expect(getD40KhavedamsaSign("leo", 0)).toBe("aries");
    expect(getD40KhavedamsaSign("libra", 0)).toBe("aries");
    expect(getD40KhavedamsaSign("sagittarius", 0)).toBe("aries");
    expect(getD40KhavedamsaSign("aquarius", 0)).toBe("aries");
  });

  it("cung chẵn (Taurus/Cancer/Virgo/Scorpio/Capricorn/Pisces) — seed CỐ ĐỊNH là Libra, KHÔNG phải chính cung", () => {
    expect(getD40KhavedamsaSign("taurus", 0)).toBe("libra");
    expect(getD40KhavedamsaSign("cancer", 0)).toBe("libra");
    expect(getD40KhavedamsaSign("virgo", 0)).toBe("libra");
    expect(getD40KhavedamsaSign("scorpio", 0)).toBe("libra");
    expect(getD40KhavedamsaSign("capricorn", 0)).toBe("libra");
    expect(getD40KhavedamsaSign("pisces", 0)).toBe("libra");
  });

  it("40 phần trên Aries (cung lẻ, seed=Aries) — đếm tới trước theo part", () => {
    expect(getD40KhavedamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD40KhavedamsaSign("aries", w)).toBe("taurus"); // part1
    expect(getD40KhavedamsaSign("aries", 39 * w)).toBe("cancer"); // part39 (phần cuối): Aries(0)+39=39%12=3=Cancer
  });

  it("mọi 39 biên (0.75°,1.5°,...,29.25°) đều phân loại đúng vào phần SAU (open-upper), không dùng epsilon — 0.75 là phân số nhị phân hữu hạn nên không có hazard dựng biên nào (KHÁC D45)", () => {
    for (let k = 1; k <= 39; k++) {
      const boundary = k * w;
      const below = getD40KhavedamsaSign("aries", boundary - 1e-9);
      const at = getD40KhavedamsaSign("aries", boundary);
      const above = getD40KhavedamsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("gần 30° vẫn ổn định (phần cuối, part39) — cả hai cung lẻ khác nhau đều hội tụ về cùng kết quả vì cùng seed", () => {
    expect(getD40KhavedamsaSign("aries", 30 - 1e-9)).toBe("cancer");
    expect(getD40KhavedamsaSign("libra", 30 - 1e-9)).toBe("cancer"); // Libra cũng là cung lẻ (seed=Aries) — cùng part39
    expect(getD40KhavedamsaSign("taurus", 30 - 1e-9)).toBe(getD40KhavedamsaSign("cancer", 30 - 1e-9)); // 2 cung chẵn, cùng seed=Libra
  });

  it("vòng qua điểm nối 12->1 (part khiến seed+part vượt quá 11)", () => {
    expect(getD40KhavedamsaSign("aries", 25 * w)).toBe("taurus"); // Aries(0)+25=25%12=1=Taurus — vòng qua
  });

  it("midpoint 15.0° trên Pisces (cung chẵn, seed=Libra)", () => {
    expect(getD40KhavedamsaSign("pisces", 15.0)).toBe("gemini"); // part=floor(15/0.75)=20; Libra(6)+20=26%12=2=Gemini
  });

  it("12 cung đại diện tại cùng một độ (5.7°) — phát hiện offset/modulo/seed sai nếu có (oracle-verified: khớp tuyệt đối vedic-calc, probe MỚI không trùng preflight)", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "scorpio",
      taurus: "taurus",
      gemini: "scorpio",
      cancer: "taurus",
      leo: "scorpio",
      virgo: "taurus",
      libra: "scorpio",
      scorpio: "taurus",
      sagittarius: "scorpio",
      capricorn: "taurus",
      aquarius: "scorpio",
      pisces: "taurus",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD40KhavedamsaSign(sign, 5.7)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập MỚI của Batch 5, oracle-verified trực tiếp task này — không trùng benchmark Batch 1-4)", () => {
    expect(getD40KhavedamsaSign("cancer", 6.6)).toBe("gemini"); // sun
    expect(getD40KhavedamsaSign("sagittarius", 18.18)).toBe("aries"); // moon
    expect(getD40KhavedamsaSign("taurus", 24.5)).toBe("gemini"); // mars
    expect(getD40KhavedamsaSign("cancer", 1.1)).toBe("scorpio"); // mercury
    expect(getD40KhavedamsaSign("scorpio", 29.99)).toBe("capricorn"); // jupiter
    expect(getD40KhavedamsaSign("aquarius", 12.3)).toBe("leo"); // venus
    expect(getD40KhavedamsaSign("virgo", 20.05)).toBe("sagittarius"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD40KhavedamsaSign("virgo", 17.5)).toBe(getD40KhavedamsaSign("virgo", 17.5));
  });
});

describe("getD45AkshavedamsaSign — cung bắt đầu theo MODALITY (TÁI DÙNG bảng D16, KHÔNG PHẢI D20), part width = 30/45 = 2/3° (phân số tuần hoàn — CẢ HAI hiện tượng floating-point: lỗi PyJHora Python `//` VÀ lỗi dựng biên k*partWidth lệch 1 ULP)", () => {
  const w = 30 / 45;

  it("Movable (vd. Aries/Cancer/Libra/Capricorn) → bắt đầu từ Aries (giống D16)", () => {
    expect(getD45AkshavedamsaSign("aries", 0)).toBe("aries");
    expect(getD45AkshavedamsaSign("cancer", 0)).toBe("aries");
    expect(getD45AkshavedamsaSign("libra", 0)).toBe("aries");
    expect(getD45AkshavedamsaSign("capricorn", 0)).toBe("aries");
  });

  it("Fixed (vd. Taurus/Leo/Scorpio/Aquarius) → bắt đầu từ Leo (giống D16, KHÁC D20 gán fixed→Sagittarius)", () => {
    expect(getD45AkshavedamsaSign("taurus", 0)).toBe("leo");
    expect(getD45AkshavedamsaSign("leo", 0)).toBe("leo");
    expect(getD45AkshavedamsaSign("scorpio", 0)).toBe("leo");
    expect(getD45AkshavedamsaSign("aquarius", 0)).toBe("leo");
  });

  it("Dual (vd. Gemini/Virgo/Sagittarius/Pisces) → bắt đầu từ Sagittarius (giống D16, KHÁC D20 gán dual→Leo)", () => {
    expect(getD45AkshavedamsaSign("gemini", 0)).toBe("sagittarius");
    expect(getD45AkshavedamsaSign("virgo", 0)).toBe("sagittarius");
    expect(getD45AkshavedamsaSign("sagittarius", 0)).toBe("sagittarius");
    expect(getD45AkshavedamsaSign("pisces", 0)).toBe("sagittarius");
  });

  it("XÁC NHẬN TƯỜNG MINH: D45 dùng CHUNG bảng modality với D16 (bit-for-bit, KHÔNG PHẢI bảng riêng, KHÔNG PHẢI bảng D20)", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(getD45AkshavedamsaSign(sign, 0)).toBe(getD16ShodasamsaSign(sign, 0));
    }
    // Xác nhận KHÁC D20 (D20 hoán đổi vai trò fixed/dual so với D16/D45) tại mỗi nhóm bị hoán đổi:
    expect(getD45AkshavedamsaSign("leo", 0)).not.toBe(getD20VimsamsaSign("leo", 0)); // fixed: D45/D16=Leo, D20=Sagittarius
    expect(getD45AkshavedamsaSign("gemini", 0)).not.toBe(getD20VimsamsaSign("gemini", 0)); // dual: D45/D16=Sagittarius, D20=Leo
  });

  it("45 phần trên Aries (movable, seed=Aries) — đếm tới trước theo part", () => {
    expect(getD45AkshavedamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD45AkshavedamsaSign("aries", (2 * 1) / 3)).toBe("taurus"); // part1 — biên hữu tỉ đúng (2k)/3, thuộc phần SAU
    expect(getD45AkshavedamsaSign("aries", 30 - 1e-9)).toBe("sagittarius"); // part44 (phần cuối): Aries(0)+44=44%12=8=Sagittarius
  });

  it("TEST-ONLY nextUp/nextDown (IEEE-754, KHÔNG epsilon tuỳ ý) — tự kiểm chứng utility không skip/lặp bit nào", () => {
    const b = (2 * 7) / 3;
    expect(nextDown(b)).toBeLessThan(b);
    expect(nextUp(b)).toBeGreaterThan(b);
    expect(nextUp(nextDown(b))).toBe(b);
    expect(nextDown(nextUp(b))).toBe(b);
  });

  it("PHÁT HIỆN MỚI Ở BATCH 5: dựng biên bằng k*partWidth (đã đủ an toàn cho D7/D9/D27) KHÔNG đủ an toàn cho D45 — lệch 1 ULP xuống DƯỚI giá trị hữu tỉ đúng tại đúng 5 điểm rời rạc (k=7,14,25,28,31)", () => {
    // Nếu vô tình dùng k*w làm biên (như D27), giá trị này bị vô tình phân vào phần TRƯỚC boundary
    // thay vì phần SAU (sai hợp đồng closed-lower/open-upper) — vì bản thân nó (do làm tròn 2 bước:
    // 30/45 rồi nhân k) đã là 1 ULP dưới giá trị hữu tỉ k*(2/3) thật. (2k)/3 (1 phép chia làm tròn
    // đúng duy nhất) không có vấn đề này tại bất kỳ k nào trong 1..44.
    const hazardKs = [7, 14, 25, 28, 31];
    for (const k of hazardKs) {
      const naive = k * w;
      const rational = (2 * k) / 3;
      expect(naive).not.toBe(rational);
      expect(naive).toBe(nextDown(rational));
      expect(getD45AkshavedamsaSign("capricorn", naive)).not.toBe(getD45AkshavedamsaSign("capricorn", rational));
    }
  });

  it("mọi 44 biên (dựng bằng (2k)/3 — KHÔNG dùng k*partWidth) đều phân loại đúng vào phần SAU (open-upper), kể cả 5 điểm hazard ở trên", () => {
    for (let k = 1; k <= 44; k++) {
      const boundary = (2 * k) / 3;
      const below = getD45AkshavedamsaSign("capricorn", boundary - 1e-9);
      const at = getD45AkshavedamsaSign("capricorn", boundary);
      const above = getD45AkshavedamsaSign("capricorn", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("PROJECT-CONSISTENT BEHAVIOR tại 12 biên có lịch sử oracle-discrepancy (k=5,10,13,17,20,23,26,29,34,37,40,43) — dùng hành vi project-consistent (Math.floor + (2k)/3); CHỈ 3/12 (k=13,26,29) là genuine PyJHora discrepancy độc lập-với-cách-dựng — 9/12 còn lại KHÔNG khác PyJHora khi dùng đúng (2k)/3", () => {
    // LỊCH SỬ: oracle probe ban đầu (preflight + Batch 5 Oracle Validation trong
    // V1_1_DIVISIONAL_CHARTS_IMPLEMENTATION.md) dùng cách dựng THÔ `k*(30/45)` để feed PyJHora, và
    // tìm thấy 12 biên khác biệt tại đúng các k này — được ghi là "12 discrepancies" trong tài liệu
    // gốc.
    //
    // CLOSURE AUDIT BATCH 5 (đã sửa lại evidence này): PyJHora's Python `//` bản thân CŨNG nhạy cảm
    // với bit-pattern chính xác của input degree — khi feed PyJHora bằng ĐÚNG giá trị `(2*k)/3` mà
    // test này thực sự dùng (KHÔNG phải `k*(30/45)` của probe gốc), Closure Audit xác nhận trực
    // tiếp (2 cung khác nhau, kết quả nhất quán): CHỈ 3 điểm (k=13,26,29) còn thực sự khác PyJHora;
    // 9 điểm còn lại (k=5,10,17,20,23,34,37,40,43) PyJHora ĐỒNG Ý với project khi dùng đúng
    // `(2*k)/3` — khác biệt trước đó chỉ do bit-pattern khác nhau giữa `k*(30/45)` và `(2*k)/3` tại
    // các điểm đó, KHÔNG PHẢI 5 điểm hazard construction đã test riêng ở trên (đây là MỘT hiện
    // tượng floating-point khác, chỉ ảnh hưởng input feed vào PyJHora — KHÔNG ảnh hưởng
    // `Math.floor` của chính implementation này).
    //
    // Ý NGHĨA CỦA TEST NÀY: khẳng định TS luôn cho hành vi project-consistent, khớp vedic-calc, tại
    // toàn bộ 12 điểm này (dù chỉ 3/12 thực sự khác PyJHora) — KHÔNG khẳng định cả 12 đều là genuine
    // PyJHora discrepancy. Xem `V1_1_DIVISIONAL_CHARTS_IMPLEMENTATION.md` §"D45 Oracle Artifact
    // Classification" để biết phân loại chính xác 3 genuine / 9 construction-dependent.
    const projectConsistentKs = [5, 10, 13, 17, 20, 23, 26, 29, 34, 37, 40, 43];
    const expectedAtK: Record<number, ZodiacSign> = {
      5: "virgo",
      10: "aquarius",
      13: "taurus",
      17: "virgo",
      20: "sagittarius",
      23: "pisces",
      26: "gemini",
      29: "virgo",
      34: "aquarius",
      37: "taurus",
      40: "leo",
      43: "scorpio",
    };
    for (const k of projectConsistentKs) {
      const boundary = (2 * k) / 3;
      expect(getD45AkshavedamsaSign("capricorn", boundary)).toBe(expectedAtK[k]);
    }
  });

  it("gần 30° vẫn ổn định (phần cuối, part44) trên cả movable/fixed/dual", () => {
    expect(getD45AkshavedamsaSign("aries", 30 - 1e-9)).toBe("sagittarius");
    expect(getD45AkshavedamsaSign("leo", 30 - 1e-9)).toBe("aries");
    expect(getD45AkshavedamsaSign("sagittarius", 30 - 1e-9)).toBe("leo");
  });

  it("vòng qua điểm nối 12->1 (part khiến seed+part vượt quá 11) — cung dual", () => {
    expect(getD45AkshavedamsaSign("pisces", (2 * 5) / 3)).toBe("taurus"); // Sagittarius(8)+5=13%12=1=Taurus — vòng qua
  });

  it("midpoint 15.0° trên Scorpio (fixed, seed=Leo)", () => {
    expect(getD45AkshavedamsaSign("scorpio", 15.0)).toBe("gemini"); // part=floor(15/(30/45))=22; Leo(4)+22=26%12=2=Gemini
  });

  it("12 cung đại diện tại cùng một độ (27.9°) — phát hiện offset/modulo/modality sai nếu có (oracle-verified: khớp tuyệt đối vedic-calc, probe MỚI không trùng preflight)", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "virgo",
      taurus: "capricorn",
      gemini: "taurus",
      cancer: "virgo",
      leo: "capricorn",
      virgo: "taurus",
      libra: "virgo",
      scorpio: "capricorn",
      sagittarius: "taurus",
      capricorn: "virgo",
      aquarius: "capricorn",
      pisces: "taurus",
    };
    for (const sign of ZODIAC_SIGNS) {
      expect(getD45AkshavedamsaSign(sign, 27.9)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập MỚI của Batch 5, oracle-verified trực tiếp task này — không trùng benchmark Batch 1-4)", () => {
    expect(getD45AkshavedamsaSign("cancer", 6.6)).toBe("capricorn"); // sun
    expect(getD45AkshavedamsaSign("sagittarius", 18.18)).toBe("pisces"); // moon
    expect(getD45AkshavedamsaSign("taurus", 24.5)).toBe("leo"); // mars
    expect(getD45AkshavedamsaSign("cancer", 1.1)).toBe("taurus"); // mercury
    expect(getD45AkshavedamsaSign("scorpio", 29.99)).toBe("aries"); // jupiter
    expect(getD45AkshavedamsaSign("aquarius", 12.3)).toBe("aquarius"); // venus
    expect(getD45AkshavedamsaSign("virgo", 20.05)).toBe("gemini"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD45AkshavedamsaSign("aquarius", 9.99)).toBe(getD45AkshavedamsaSign("aquarius", 9.99));
  });
});

describe("getD60ShashtiamsaSign — đếm tới trước từ CHÍNH cung gốc theo part (cùng dạng D12), part width = 30/60 = 0.5° (phân số nhị phân hữu hạn); KHÔNG lẻ/chẵn, KHÔNG đảo chiều — contract FROZEN từ worked example Santhanam BPHS", () => {
  const w = 30 / 60; // 0.5° — số nhị phân hữu hạn, KHÔNG có hazard như D45.

  it("NEO WORKED-EXAMPLE (Santhanam BPHS Ch.6, sloka 33-41): Venus tại Capricorn 13°25′ → Pisces — bằng chứng cổ điển đã freeze, KHÔNG phải oracle-derived", () => {
    // 13°25′ = 13 + 25/60. Santhanam: ×2 = 26°50′; 26 chia 12 dư 2; +1 = 3; đếm 3 cung TỪ CAPRICORN
    // (inclusive) = Capricorn→Aquarius→Pisces = Pisces. Đây là expected value độc lập với production
    // formula VÀ độc lập với oracle — lấy trực tiếp từ chính worked example trong bản dịch cổ văn.
    expect(getD60ShashtiamsaSign("capricorn", 13 + 25 / 60)).toBe("pisces");
  });

  it("đếm tới trước TỪ CHÍNH cung gốc, KHÔNG phải seed cố định Aries (loại trừ Candidate B)", () => {
    // part0 luôn = chính cung gốc (khác hẳn seed-Aries: nếu từ Aries thì mọi cung part0 đều = Aries).
    expect(getD60ShashtiamsaSign("aries", 0)).toBe("aries");
    expect(getD60ShashtiamsaSign("taurus", 0)).toBe("taurus");
    expect(getD60ShashtiamsaSign("leo", 0)).toBe("leo");
    expect(getD60ShashtiamsaSign("scorpio", 0)).toBe("scorpio");
    expect(getD60ShashtiamsaSign("capricorn", 0)).toBe("capricorn");
    expect(getD60ShashtiamsaSign("pisces", 0)).toBe("pisces");
  });

  it("KHÔNG có nhánh lẻ/chẵn, KHÔNG đảo chiều cho cung đích (loại trừ Candidate C/E) — cung chẵn đếm TỚI TRƯỚC giống hệt cung lẻ", () => {
    // Capricorn (chẵn) part1 = Aquarius (tới trước), KHÔNG phải đảo ngược và KHÔNG dời sang cung thứ 7.
    expect(getD60ShashtiamsaSign("capricorn", w)).toBe("aquarius"); // Capricorn(9)+1=10=Aquarius
    expect(getD60ShashtiamsaSign("taurus", w)).toBe("gemini"); // Taurus(1)+1=2=Gemini (tới trước)
    // Cùng offset part=3 cho cả cung lẻ (Aries) và cung chẵn (Taurus) đều là +3 tới trước:
    expect(getD60ShashtiamsaSign("aries", 3 * w)).toBe("cancer"); // Aries(0)+3=3=Cancer
    expect(getD60ShashtiamsaSign("taurus", 3 * w)).toBe("leo"); // Taurus(1)+3=4=Leo
  });

  it("60 phần trên Aries — đếm tới trước từ Aries, quấn vòng đúng 5 lần qua 12 cung", () => {
    for (let k = 0; k < 60; k++) {
      const expectedIndex = (0 + k) % 12; // Aries index 0
      expect(getD60ShashtiamsaSign("aries", k * w + 0.01)).toBe(ZODIAC_SIGNS[expectedIndex]);
    }
  });

  it("60 phần trên Capricorn — đếm tới trước từ Capricorn, quấn vòng 5 lần", () => {
    for (let k = 0; k < 60; k++) {
      const expectedIndex = (9 + k) % 12; // Capricorn index 9
      expect(getD60ShashtiamsaSign("capricorn", k * w + 0.01)).toBe(ZODIAC_SIGNS[expectedIndex]);
    }
  });

  it("mọi 59 biên nội bộ (0.5°,1.0°,...,29.5°) đều phân loại đúng vào phần SAU (open-upper), không epsilon — 0.5 là nhị phân hữu hạn nên k*w an toàn (KHÁC D45)", () => {
    for (let k = 1; k <= 59; k++) {
      const boundary = k * w;
      const below = getD60ShashtiamsaSign("aries", boundary - 1e-9);
      const at = getD60ShashtiamsaSign("aries", boundary);
      const above = getD60ShashtiamsaSign("aries", boundary + 1e-9);
      expect(at).toBe(above);
      expect(at).not.toBe(below);
    }
  });

  it("biên exact 0°, 0.5°, 29.5°, gần-30° ổn định", () => {
    expect(getD60ShashtiamsaSign("aries", 0)).toBe("aries"); // part0
    expect(getD60ShashtiamsaSign("aries", 0.5)).toBe("taurus"); // part1 (0.5° thuộc phần SAU)
    expect(getD60ShashtiamsaSign("aries", 29.5)).toBe("pisces"); // part59 (phần cuối): Aries(0)+59=59%12=11=Pisces
    expect(getD60ShashtiamsaSign("aries", 30 - 1e-9)).toBe("pisces"); // vẫn part59, không tràn part60
  });

  it("vòng qua điểm nối 12->1 (part ≥ 12 — D60 quấn vòng nhiều lần nhất trong mọi Varga)", () => {
    expect(getD60ShashtiamsaSign("aries", 12 * w)).toBe("aries"); // part12: Aries(0)+12=12%12=0=Aries (vòng 1)
    expect(getD60ShashtiamsaSign("aries", 13 * w)).toBe("taurus"); // part13: +13=13%12=1=Taurus
    expect(getD60ShashtiamsaSign("pisces", 1 * w)).toBe("aries"); // Pisces(11)+1=12%12=0=Aries — vòng qua nối
  });

  it("midpoint 15.0° trên Leo (part30)", () => {
    expect(getD60ShashtiamsaSign("leo", 15.0)).toBe("aquarius"); // part=floor(15/0.5)=30; Leo(4)+30=34%12=10=Aquarius
  });

  it("12 cung đại diện tại cùng một độ (7.3°) — phát hiện offset/modulo/seed sai nếu có (oracle-verified: khớp tuyệt đối PyJHora method1 VÀ vedic-calc; validation-only, KHÔNG phải bằng chứng cổ điển)", () => {
    const expected: Record<ZodiacSign, ZodiacSign> = {
      aries: "gemini",
      taurus: "cancer",
      gemini: "leo",
      cancer: "virgo",
      leo: "libra",
      virgo: "scorpio",
      libra: "sagittarius",
      scorpio: "capricorn",
      sagittarius: "aquarius",
      capricorn: "pisces",
      aquarius: "aries",
      pisces: "taurus",
    };
    // part = floor(7.3/0.5) = 14; mỗi cung + 14 tới trước. Hand-derived, oracle-verified (validation only).
    for (const sign of ZODIAC_SIGNS) {
      expect(getD60ShashtiamsaSign(sign, 7.3)).toBe(expected[sign]);
    }
  });

  it("case thực tế (benchmark độc lập MỚI của Batch 6, oracle-verified validation-only — không trùng benchmark Batch 1-5)", () => {
    expect(getD60ShashtiamsaSign("leo", 11.11)).toBe("gemini"); // sun
    expect(getD60ShashtiamsaSign("libra", 23.23)).toBe("leo"); // moon
    expect(getD60ShashtiamsaSign("aries", 17.77)).toBe("pisces"); // mars
    expect(getD60ShashtiamsaSign("capricorn", 2.02)).toBe("taurus"); // mercury
    expect(getD60ShashtiamsaSign("gemini", 28.28)).toBe("aquarius"); // jupiter
    expect(getD60ShashtiamsaSign("virgo", 9.09)).toBe("pisces"); // venus
    expect(getD60ShashtiamsaSign("pisces", 14.14)).toBe("cancer"); // saturn
  });

  it("tính xác định (deterministic)", () => {
    expect(getD60ShashtiamsaSign("sagittarius", 22.2)).toBe(getD60ShashtiamsaSign("sagittarius", 22.2));
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

  it("varga=12 khớp getD12DwadasamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(12, sign, degree)).toBe(getD12DwadasamsaSign(sign, degree));
      }
    }
  });

  it("varga=16 khớp getD16ShodasamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(16, sign, degree)).toBe(getD16ShodasamsaSign(sign, degree));
      }
    }
  });

  it("varga=20 khớp getD20VimsamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(20, sign, degree)).toBe(getD20VimsamsaSign(sign, degree));
      }
    }
  });

  it("varga=24 khớp getD24ChaturvimsamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(24, sign, degree)).toBe(getD24ChaturvimsamsaSign(sign, degree));
      }
    }
  });

  it("varga=27 khớp getD27NakshatramsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(27, sign, degree)).toBe(getD27NakshatramsaSign(sign, degree));
      }
    }
  });

  it("varga=30 khớp getD30TrimsamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(30, sign, degree)).toBe(getD30TrimsamsaSign(sign, degree));
      }
    }
  });

  it("Batch 1 (D2/D3/D4) KHÔNG bị regress bởi việc thêm D7..D30 — case thực tế benchmark Batch 1 vẫn đúng", () => {
    expect(getDivisionalSign(2, "aquarius", 27.7812)).toBe("cancer");
    expect(getDivisionalSign(3, "aquarius", 27.7812)).toBe("libra");
    expect(getDivisionalSign(4, "aquarius", 27.7812)).toBe("scorpio");
  });

  it("Batch 2 (D7/D9/D10) KHÔNG bị regress bởi việc thêm D12..D30 — case thực tế benchmark Batch 2 vẫn đúng", () => {
    expect(getDivisionalSign(7, "gemini", 24.1567)).toBe("scorpio");
    expect(getDivisionalSign(9, "gemini", 24.1567)).toBe("taurus");
    expect(getDivisionalSign(10, "gemini", 24.1567)).toBe("aquarius");
  });

  it("Batch 3 (D12/D16/D20) KHÔNG bị regress bởi việc thêm D24/D27/D30 — case thực tế benchmark Batch 3 vẫn đúng", () => {
    expect(getDivisionalSign(12, "sagittarius", 5.55)).toBe("aquarius");
    expect(getDivisionalSign(16, "sagittarius", 5.55)).toBe("aquarius");
    expect(getDivisionalSign(20, "sagittarius", 5.55)).toBe("scorpio");
  });

  it("varga=40 khớp getD40KhavedamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(40, sign, degree)).toBe(getD40KhavedamsaSign(sign, degree));
      }
    }
  });

  it("varga=45 khớp getD45AkshavedamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(45, sign, degree)).toBe(getD45AkshavedamsaSign(sign, degree));
      }
    }
  });

  it("Batch 4 (D24/D27/D30) KHÔNG bị regress bởi việc thêm D40/D45 — case thực tế benchmark Batch 4 vẫn đúng", () => {
    expect(getDivisionalSign(24, "scorpio", 8.8)).toBe("aquarius");
    expect(getDivisionalSign(27, "scorpio", 8.8)).toBe("leo");
    expect(getDivisionalSign(30, "scorpio", 8.8)).toBe("virgo");
  });

  it("varga=60 khớp getD60ShashtiamsaSign", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const degree of [0, 10, 15, 20, 29.9]) {
        expect(getDivisionalSign(60, sign, degree)).toBe(getD60ShashtiamsaSign(sign, degree));
      }
    }
  });

  it("Batch 5 (D40/D45) KHÔNG bị regress bởi việc thêm D60 — case thực tế benchmark Batch 5 vẫn đúng", () => {
    expect(getDivisionalSign(40, "cancer", 6.6)).toBe("gemini");
    expect(getDivisionalSign(45, "cancer", 6.6)).toBe("capricorn");
  });

  it("mọi kết quả LUÔN là một ZodiacSign hợp lệ trên toàn bộ 12 cung x 15 varga", () => {
    const vargas = [2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60] as const;
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
