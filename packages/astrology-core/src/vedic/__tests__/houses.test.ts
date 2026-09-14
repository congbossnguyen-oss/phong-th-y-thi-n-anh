import { describe, expect, it } from "vitest";

import { ZODIAC_SIGNS, type ZodiacSign } from "../../chart/types.js";
import { getWholeSignHouseNumber } from "../houses.js";

describe("getWholeSignHouseNumber — Rashi-index arithmetic thuần, KHÔNG dùng cusp-degree nào", () => {
  it("Lagna Aries: mỗi Rashi tiếp theo là Nhà 1..12 theo ĐÚNG thứ tự hoàng đạo", () => {
    for (let i = 0; i < 12; i++) {
      const bodyRashi = ZODIAC_SIGNS[i]!;
      expect(getWholeSignHouseNumber(bodyRashi, "aries")).toBe(i + 1);
    }
  });

  it("cùng Rashi với Lagna => LUÔN là Nhà 1, bất kể Lagna là cung nào", () => {
    for (const lagna of ZODIAC_SIGNS) {
      expect(getWholeSignHouseNumber(lagna, lagna)).toBe(1);
    }
  });

  it("Lagna Leo (không phải Aries) — kiểm tra vòng qua điểm nối 12->1", () => {
    // Leo=index4. Aries(0) cách Leo 8 cung về sau => Nhà 9. Cancer(3) ngay TRƯỚC Leo => Nhà 12.
    expect(getWholeSignHouseNumber("aries", "leo")).toBe(9);
    expect(getWholeSignHouseNumber("cancer", "leo")).toBe(12);
    expect(getWholeSignHouseNumber("leo", "leo")).toBe(1);
    expect(getWholeSignHouseNumber("virgo", "leo")).toBe(2);
  });

  it("Lagna Pisces (cung CUỐI, index 11) — vòng qua điểm nối KHÔNG lệch 1", () => {
    expect(getWholeSignHouseNumber("pisces", "pisces")).toBe(1);
    expect(getWholeSignHouseNumber("aries", "pisces")).toBe(2); // Aries ngay SAU Pisces theo vòng hoàng đạo.
    expect(getWholeSignHouseNumber("aquarius", "pisces")).toBe(12); // Aquarius ngay TRƯỚC Pisces.
  });

  it("kết quả LUÔN trong [1,12] cho mọi cặp (bodyRashi, lagnaRashi) trong 144 tổ hợp", () => {
    for (const body of ZODIAC_SIGNS) {
      for (const lagna of ZODIAC_SIGNS) {
        const house = getWholeSignHouseNumber(body, lagna);
        expect(house).toBeGreaterThanOrEqual(1);
        expect(house).toBeLessThanOrEqual(12);
        expect(Number.isInteger(house)).toBe(true);
      }
    }
  });

  it("tính xác định (deterministic) — gọi lại nhiều lần cho cùng kết quả", () => {
    expect(getWholeSignHouseNumber("scorpio" as ZodiacSign, "aries" as ZodiacSign)).toBe(
      getWholeSignHouseNumber("scorpio" as ZodiacSign, "aries" as ZodiacSign),
    );
  });
});
