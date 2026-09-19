import { describe, expect, it } from "vitest";
import { EARTH_PLATE } from "../../../src/heaven-earth-plate/table.js";

describe("daliuren-engine/heaven-earth-plate/table — EARTH_PLATE (Địa Bàn)", () => {
  it("Test A — 12 địa chi map đúng position (0=Tý..11=Hợi, Algorithm Spec §5 mục 1)", () => {
    expect(EARTH_PLATE).toEqual(["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]);
  });

  it("đúng 12 phần tử, không thiếu không trùng", () => {
    expect(EARTH_PLATE).toHaveLength(12);
    expect(new Set(EARTH_PLATE).size).toBe(12);
  });
});
