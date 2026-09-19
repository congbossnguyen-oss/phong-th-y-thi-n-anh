import { describe, expect, it } from "vitest";
import { GUI_REN_TRADITIONAL_TABLE } from "../../../src/noble-spirit/table.js";

/**
 * MECHANICAL/DATA-FIDELITY TEST — đối chiếu TỪNG DÒNG với bảng hiện hành (Algorithm Spec §4,
 * ĐÃ SỬA dòng Giáp ở Phase 5B-3R — xem docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md).
 * KHÔNG phải bằng chứng cổ điển độc lập — chỉ xác nhận code KHÔNG gõ sai/tự đổi bảng đã chốt.
 * Xem noble-spirit/provenance.ts cho cảnh báo quan trọng về độ tin cậy YẾU (confidence D) của
 * 9/10 dòng còn lại (Mậu/Canh/Ất/Kỷ/Bính/Đinh/Nhâm/Quý/Tân) trong chính bảng này.
 */
const EXPECTED_ROWS: ReadonlyArray<[string, string, string]> = [
  ["Giáp", "Sửu", "Mùi"], // ĐÃ SỬA Phase 5B-3R — 六壬大全 卷一 xác nhận trực tiếp (xem audit doc)
  ["Mậu", "Mùi", "Sửu"],
  ["Canh", "Sửu", "Mùi"],
  ["Ất", "Thân", "Tý"],
  ["Kỷ", "Thân", "Tý"],
  ["Bính", "Dậu", "Hợi"],
  ["Đinh", "Hợi", "Dậu"],
  ["Nhâm", "Mão", "Tỵ"],
  ["Quý", "Tỵ", "Mão"],
  ["Tân", "Dần", "Ngọ"],
];

describe("daliuren-engine/noble-spirit/table — GUI_REN_TRADITIONAL_TABLE", () => {
  it("có đúng 10 dòng (10 Can), khớp CHÍNH XÁC Algorithm Spec §4", () => {
    expect(Object.keys(GUI_REN_TRADITIONAL_TABLE)).toHaveLength(10);
    for (const [can, day, night] of EXPECTED_ROWS) {
      expect(GUI_REN_TRADITIONAL_TABLE[can as keyof typeof GUI_REN_TRADITIONAL_TABLE]).toEqual({ day, night });
    }
  });

  it("5 nhóm khẩu quyết dùng ĐÚNG cặp Chi chung (bất kể chiều ngày/đêm) — 甲/戊/庚 dùng {未,丑}, 乙/己 dùng {申,子}, 丙/丁 dùng {酉,亥}, 壬/癸 dùng {卯,巳}", () => {
    const pairAsSet = (can: keyof typeof GUI_REN_TRADITIONAL_TABLE) => {
      const { day, night } = GUI_REN_TRADITIONAL_TABLE[can];
      return new Set([day, night]);
    };
    expect(pairAsSet("Giáp")).toEqual(pairAsSet("Mậu"));
    expect(pairAsSet("Giáp")).toEqual(pairAsSet("Canh"));
    expect(pairAsSet("Ất")).toEqual(pairAsSet("Kỷ"));
    expect(pairAsSet("Bính")).toEqual(pairAsSet("Đinh"));
    expect(pairAsSet("Nhâm")).toEqual(pairAsSet("Quý"));
  });
});
