import { describe, expect, it } from "vitest";

import { ZODIAC_SIGNS } from "../../chart/types.js";
import { signDegreeOfLongitude, signOfLongitude } from "../zodiac.js";

describe("signOfLongitude — ranh giới chính xác của 12 cung (quy ước toán học phổ quát 0°-30° Aries, ...)", () => {
  it("đúng điểm bắt đầu của cả 12 cung (bội số của 30°)", () => {
    for (let i = 0; i < 12; i++) {
      expect(signOfLongitude(i * 30)).toBe(ZODIAC_SIGNS[i]);
    }
  });

  it("ngay TRƯỚC điểm bắt đầu cung kế tiếp vẫn thuộc cung hiện tại (biên trên MỞ)", () => {
    expect(signOfLongitude(29.9999999)).toBe("aries");
    expect(signOfLongitude(59.9999999)).toBe("taurus");
    expect(signOfLongitude(359.9999999)).toBe("pisces");
  });

  it("ĐÚNG TẠI điểm bắt đầu thuộc cung MỚI, không phải cung trước (biên dưới ĐÓNG)", () => {
    expect(signOfLongitude(30)).toBe("taurus");
    expect(signOfLongitude(90)).toBe("cancer");
    expect(signOfLongitude(360)).toBe("aries"); // 360 chuẩn hoá về 0
  });

  it("tự chuẩn hoá longitude ngoài [0,360) trước khi tính (âm, > 360)", () => {
    expect(signOfLongitude(-1)).toBe("pisces"); // -1 chuẩn hoá thành 359
    expect(signOfLongitude(370)).toBe("aries"); // 370 chuẩn hoá thành 10
    expect(signOfLongitude(720 + 45)).toBe("taurus"); // nhiều vòng 360°
  });

  it("khớp CHÍNH XÁC 2 giá trị đã xác nhận đúng từ fixture Phase 2 (Hanoi 1985-03-12 08:30, chart/__tests__/fixtures.ts::fullWesternChart) — Sun và Moon (KHÔNG dùng Saturn của fixture đó, xem test riêng bên dưới về lỗi dữ liệu đã phát hiện)", () => {
    expect(signOfLongitude(351.4222)).toBe("pisces"); // Sun
    expect(signOfLongitude(240.0111)).toBe("sagittarius"); // Moon
  });

  it("PHÁT HIỆN: fixture Phase 2 fullWesternChart() gán sign='sagittarius' cho Saturn (longitude=238.1087°) — về mặt toán học đây là 'scorpio' (210°-240°), không phải sagittarius (240°-270°); signDegree=28.1087 của chính fixture đó (238.1087-210) cũng xác nhận scorpio, không phải sagittarius. Đây là lỗi dữ liệu fixture CÓ TRƯỚC Phase 3B-2, KHÔNG sửa ở đây (không phải file của phase này) — đã báo cáo riêng qua spawn_task.", () => {
    expect(signOfLongitude(238.1087)).toBe("scorpio");
  });
});

describe("signDegreeOfLongitude — luôn trong [0,30), khớp signOfLongitude", () => {
  it("khớp 2 giá trị đã xác nhận đúng từ fixture Phase 2 (Sun, Moon)", () => {
    expect(signDegreeOfLongitude(351.4222)).toBeCloseTo(21.4222, 9);
    expect(signDegreeOfLongitude(240.0111)).toBeCloseTo(0.0111, 9);
  });

  it("luôn trong [0,30) cho mọi longitude hợp lệ, kể cả ngay tại ranh giới cung", () => {
    for (let lon = 0; lon < 360; lon += 7.3) {
      const degree = signDegreeOfLongitude(lon);
      expect(degree).toBeGreaterThanOrEqual(0);
      expect(degree).toBeLessThan(30);
    }
    expect(signDegreeOfLongitude(30)).toBe(0);
    expect(signDegreeOfLongitude(0)).toBe(0);
  });

  it("tính xác định (deterministic) — gọi lại nhiều lần cho cùng kết quả", () => {
    expect(signDegreeOfLongitude(123.456)).toBe(signDegreeOfLongitude(123.456));
  });
});
