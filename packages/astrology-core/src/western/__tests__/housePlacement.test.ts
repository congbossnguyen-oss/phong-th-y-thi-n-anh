import { describe, expect, it } from "vitest";

import type { NormalizedHouseCusp } from "../../chart/types.js";
import { fullWesternChart } from "../../chart/__tests__/fixtures.js";
import { assignHouseNumber } from "../housePlacement.js";

/** House cusps thật của benchmark Hanoi 1985-03-12 08:30 — TÁI DÙNG nguyên văn từ fixture Phase 2 (`fullWesternChart()`), KHÔNG bịa số riêng. */
function benchmarkCusps(): NormalizedHouseCusp[] {
  return fullWesternChart().houseCusps;
}

describe("assignHouseNumber — khớp CHÍNH XÁC 3 hành tinh đã xác nhận đúng của fixture Phase 2 (Hanoi 1985-03-12 08:30)", () => {
  it("Sun (longitude=351.4222) -> nhà 11 (giữa cusp 11=323.9131 và cusp 12=357.5471)", () => {
    expect(assignHouseNumber(351.4222, benchmarkCusps())).toBe(11);
  });

  it("Moon (longitude=240.0111) -> nhà 7 (giữa cusp 7=215.5425 và cusp 8=243.5154)", () => {
    expect(assignHouseNumber(240.0111, benchmarkCusps())).toBe(7);
  });

  it("Saturn (longitude=238.1087) -> nhà 7 (cùng cung với Moon — ĐÚNG bất kể lỗi nhãn 'sign' đã phát hiện riêng ở fixture đó, vì house KHÔNG liên quan tới sign)", () => {
    expect(assignHouseNumber(238.1087, benchmarkCusps())).toBe(7);
  });
});

describe("assignHouseNumber — quy ước biên (boundary): [cusp[N], cusp[N+1]), biên dưới ĐÓNG, biên trên MỞ", () => {
  const cusps = benchmarkCusps();

  it("ĐÚNG TẠI một cusp thuộc nhà BẮT ĐẦU từ cusp đó, không thuộc nhà trước", () => {
    expect(assignHouseNumber(215.5425, cusps)).toBe(7); // đúng tại cusp nhà 7
    expect(assignHouseNumber(35.5425, cusps)).toBe(1); // đúng tại cusp nhà 1 (== Ascendant)
  });

  it("ngay TRƯỚC cusp kế tiếp (một lượng cực nhỏ) vẫn thuộc nhà hiện tại", () => {
    expect(assignHouseNumber(243.5154 - 0.0000001, cusps)).toBe(7);
  });

  it("ngay SAU cusp kế tiếp một lượng cực nhỏ đã sang nhà mới", () => {
    expect(assignHouseNumber(243.5154 + 0.0000001, cusps)).toBe(8);
  });

  it("cung vòng qua điểm nối 360°/0° (nhà 12, từ cusp 12=357.5471 tới cusp 1=35.5425) hoạt động đúng", () => {
    expect(assignHouseNumber(0, cusps)).toBe(12);
    expect(assignHouseNumber(359.9999, cusps)).toBe(12);
    expect(assignHouseNumber(10, cusps)).toBe(12);
    expect(assignHouseNumber(35.5425 - 0.0001, cusps)).toBe(12); // ngay trước khi sang nhà 1
  });
});

describe("assignHouseNumber — hoạt động đúng với cusps KHÔNG được sắp xếp sẵn theo houseNumber", () => {
  it("thứ tự phần tử trong mảng đầu vào không ảnh hưởng kết quả (hàm tự sắp xếp lại)", () => {
    const shuffled = [...benchmarkCusps()].reverse();
    expect(assignHouseNumber(351.4222, shuffled)).toBe(11);
  });
});

describe("assignHouseNumber — bảo vệ đầu vào không hợp lệ", () => {
  it("ném lỗi rõ ràng nếu KHÔNG đúng 12 cusp (bảo vệ lỗi lập trình, không phải tình huống runtime bình thường)", () => {
    expect(() => assignHouseNumber(0, [])).toThrow(/12 house cusps/);
    expect(() => assignHouseNumber(0, benchmarkCusps().slice(0, 5))).toThrow(/12 house cusps/);
  });
});

describe("assignHouseNumber — deterministic", () => {
  it("gọi lại nhiều lần cho cùng kết quả", () => {
    const cusps = benchmarkCusps();
    expect(assignHouseNumber(123.45, cusps)).toBe(assignHouseNumber(123.45, cusps));
  });
});
