/**
 * Test riêng cho Phase 2.1 Approved Decision 2 — `NormalizedDignityResult` phải trung lập
 * trường phái. KHÔNG implement bất kỳ phép tính dignity/strength thật nào (Western hay Vedic)
 * — chỉ chứng minh CONTRACT DỮ LIỆU chấp nhận được cả hai, có cấu trúc, không phải chấm điểm
 * thật.
 */
import { describe, expect, it } from "vitest";
import { validateNormalizedChart } from "../validation.js";
import { serializeNormalizedChart } from "../serialization.js";
import { fullWesternChart } from "./fixtures.js";
import type { NormalizedDignityResult } from "../types.js";

describe("NormalizedDignityResult — vẫn biểu diễn được dignity Tây phương hiện có", () => {
  it("scheme='western_traditional' với type domicile/exaltation/detriment/fall/triplicity/term/decan đều hợp lệ", () => {
    const westernTypes = ["domicile", "exaltation", "detriment", "fall", "triplicity", "term", "decan"];
    const chart = fullWesternChart();
    chart.dignities = westernTypes.map(
      (type): NormalizedDignityResult => ({ scheme: "western_traditional", body: "mars", type, sign: "aries", score: 5 }),
    );
    expect(validateNormalizedChart(chart)).toEqual([]);
  });

  it("dignity Tây phương LUÔN gắn với 1 cung cụ thể — sign có mặt và hợp lệ", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "western_traditional", body: "mars", type: "domicile", sign: "aries", score: 5 }];
    const [d] = chart.dignities;
    expect(d?.sign).toBe("aries");
    expect(validateNormalizedChart(chart)).toEqual([]);
  });
});

describe("NormalizedDignityResult — biểu diễn được một hệ strength KHÔNG PHẢI Tây phương (cấu trúc thôi, KHÔNG tính toán thật)", () => {
  it("scheme giả lập kiểu Vedic Shadbala, type không gắn cung cụ thể (sign vắng mặt hợp lệ)", () => {
    // "vedic_shadbala_hypothetical" chỉ là MỘT VÍ DỤ cấu trúc cho test này — Phase 2.1 KHÔNG
    // implement Shadbala thật, không có ý nghĩa tính toán nào đằng sau các con số dưới đây.
    const chart = fullWesternChart(); // dùng chart Western sẵn có làm khung sườn hợp lệ, chỉ thay dignities[]
    chart.dignities = [
      { scheme: "vedic_shadbala_hypothetical", body: "mars", type: "dig_bala", score: 42.5 }, // không có sign — Dig Bala dựa theo NHÀ, không theo cung
      { scheme: "vedic_shadbala_hypothetical", body: "mars", type: "kaala_bala", score: 18.2 }, // không có sign — dựa theo THỜI ĐIỂM
    ];
    const errors = validateNormalizedChart(chart);
    expect(errors).toEqual([]);
    expect(chart.dignities.every((d) => d.sign === undefined)).toBe(true);
  });

  it("hai hệ dignity khác nhau (western_traditional và một hệ giả lập khác) CÙNG tồn tại được trong một chart mà không xung đột", () => {
    const chart = fullWesternChart();
    chart.dignities = [
      { scheme: "western_traditional", body: "venus", type: "exaltation", sign: "pisces", score: 4 },
      { scheme: "vedic_shadbala_hypothetical", body: "venus", type: "sthana_bala", score: 33.1 },
    ];
    expect(validateNormalizedChart(chart)).toEqual([]);
  });
});

describe("NormalizedDignityResult — định danh hỏng/rỗng vẫn bị từ chối (không phải mọi thứ đều được chấp nhận)", () => {
  it("scheme rỗng bị từ chối", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "", body: "mars", type: "domicile", score: 5 }];
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("EMPTY_DIGNITY_SCHEME");
  });

  it("type rỗng bị từ chối", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "western_traditional", body: "mars", type: "", score: 5 }];
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("EMPTY_DIGNITY_TYPE");
  });

  it("body rỗng bị từ chối", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "western_traditional", body: "", type: "domicile", score: 5 }];
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("EMPTY_DIGNITY_BODY");
  });

  it("score không phải số hữu hạn bị từ chối", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "western_traditional", body: "mars", type: "domicile", score: Number.NaN }];
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_DIGNITY_SCORE");
  });

  it("sign SAI (khi có mặt) vẫn bị từ chối — tuỳ chọn không có nghĩa là không kiểm tra khi có", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "western_traditional", body: "mars", type: "domicile", sign: "not_a_real_sign" as never, score: 5 }];
    expect(validateNormalizedChart(chart).map((e) => e.code)).toContain("INVALID_ZODIAC_SIGN");
  });

  it("một scheme/type LẠ nhưng ĐÚNG cấu trúc (không rỗng) KHÔNG bị từ chối chỉ vì lạ", () => {
    const chart = fullWesternChart();
    chart.dignities = [{ scheme: "some_future_school_nobody_has_invented_yet", body: "mars", type: "some_future_concept", score: 1 }];
    expect(validateNormalizedChart(chart)).toEqual([]);
  });
});

describe("NormalizedDignityResult — serialization vẫn ổn định khi có dignity thật", () => {
  it("chart có dignities (cả 2 scheme) serialize ra CHUỖI GIỐNG HỆT NHAU giữa 2 lần gọi", () => {
    const build = () => {
      const chart = fullWesternChart();
      chart.dignities = [
        { scheme: "western_traditional", body: "mars", type: "domicile", sign: "aries", score: 5 },
        { scheme: "vedic_shadbala_hypothetical", body: "mars", type: "dig_bala", score: 42.5 },
      ];
      return chart;
    };
    expect(serializeNormalizedChart(build())).toBe(serializeNormalizedChart(build()));
  });
});
