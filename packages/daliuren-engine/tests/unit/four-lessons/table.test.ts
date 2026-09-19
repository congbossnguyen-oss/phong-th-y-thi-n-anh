import { describe, expect, it } from "vitest";
import { JI_GONG_TABLE } from "../../../src/four-lessons/table.js";

describe("daliuren-engine/four-lessons/table — JI_GONG_TABLE (寄宮)", () => {
  it("Test C — 10 Can mapping đúng, khớp CHÍNH XÁC Algorithm Spec §6", () => {
    expect(JI_GONG_TABLE).toEqual({
      Giáp: "Dần",
      Ất: "Thìn",
      Bính: "Tỵ",
      Đinh: "Mùi",
      Mậu: "Tỵ",
      Kỷ: "Mùi",
      Canh: "Thân",
      Tân: "Tuất",
      Nhâm: "Hợi",
      Quý: "Sửu",
    });
  });

  it("đúng 10 dòng (10 Thiên Can), không thiếu Can nào", () => {
    expect(Object.keys(JI_GONG_TABLE)).toHaveLength(10);
  });
});
