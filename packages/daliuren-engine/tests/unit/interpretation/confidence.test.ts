import { describe, expect, it } from "vitest";
import { CONFIDENCE_DISPLAY_ORDER, confidenceRank, worstConfidence } from "../../../src/interpretation/confidence.js";

describe("daliuren-engine/interpretation/confidence — worstConfidence/confidenceRank", () => {
  it("confidenceRank khớp đúng vị trí trong CONFIDENCE_DISPLAY_ORDER", () => {
    expect(confidenceRank("A")).toBe(0);
    expect(confidenceRank("B")).toBe(1);
    expect(confidenceRank("C")).toBe(2);
    expect(confidenceRank("D")).toBe(3);
    expect(CONFIDENCE_DISPLAY_ORDER).toEqual(["A", "B", "C", "D"]);
  });

  it("worstConfidence trả về giá trị KÉM HƠN (rank cao hơn) trong 2 giá trị", () => {
    expect(worstConfidence("A", "D")).toBe("D");
    expect(worstConfidence("D", "A")).toBe("D");
    expect(worstConfidence("A", "B")).toBe("B");
    expect(worstConfidence("C", "B")).toBe("C");
  });

  it("worstConfidence(x, x) = x (idempotent)", () => {
    for (const c of CONFIDENCE_DISPLAY_ORDER) {
      expect(worstConfidence(c, c)).toBe(c);
    }
  });

  it("KHÔNG có phép cộng/nhân/chuyển đổi số nào — chỉ so sánh thứ hạng thuần tuý", () => {
    // Xác nhận qua hành vi: worst của 2 giá trị BẰNG NHAU không "tệ hơn" giá trị gốc (không có tích luỹ kiểu điểm số).
    expect(worstConfidence("A", "A")).toBe("A");
    expect(worstConfidence(worstConfidence("A", "A"), "A")).toBe("A");
  });
});
