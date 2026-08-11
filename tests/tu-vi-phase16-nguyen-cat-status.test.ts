// Phase 16 — LOCK & IMPLEMENT NGUYÊN CÁT STATUS TABLE: 168/168 assertions cho toàn bộ bảng
// Miếu/Vượng/Đắc/Bình/Hãm, tra thẳng qua getStarStatus(star, chiIndex), không suy luận ngũ hành.
// Nguồn DUY NHẤT: TuVi_Profile_NguyenCat_V1.md §3 — xem docs/TUVI_PHASE16_NGUYEN_CAT_STATUS_IMPLEMENTATION.md.

import { describe, expect, it } from "vitest";
import { getStarStatus, MAIN_STAR_STATUS, type TrangThaiSao } from "../src/lib/tu-vi/rules";

// Thứ tự chỉ số Chi: Tý0 Sửu1 Dần2 Mão3 Thìn4 Tỵ5 Ngọ6 Mùi7 Thân8 Dậu9 Tuất10 Hợi11.
const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

// Bảng chuẩn duy nhất theo đúng yêu cầu Phase 16 (nguồn Nguyên Cát), 14 sao x 12 Chi.
const EXPECTED: Record<string, TrangThaiSao[]> = {
  "Tử Vi": ["Bình", "Đắc", "Miếu", "Bình", "Vượng", "Miếu", "Miếu", "Đắc", "Miếu", "Bình", "Vượng", "Bình"],
  "Thiên Cơ": ["Đắc", "Đắc", "Hãm", "Miếu", "Miếu", "Vượng", "Đắc", "Đắc", "Vượng", "Miếu", "Miếu", "Hãm"],
  "Thái Dương": ["Hãm", "Đắc", "Vượng", "Vượng", "Vượng", "Miếu", "Miếu", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm"],
  "Vũ Khúc": ["Vượng", "Miếu", "Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Miếu", "Vượng", "Đắc", "Miếu", "Hãm"],
  "Thiên Đồng": ["Vượng", "Hãm", "Miếu", "Đắc", "Hãm", "Đắc", "Hãm", "Hãm", "Miếu", "Hãm", "Hãm", "Đắc"],
  "Liêm Trinh": ["Vượng", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm", "Vượng", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm"],
  "Thiên Phủ": ["Miếu", "Bình", "Miếu", "Bình", "Vượng", "Đắc", "Miếu", "Đắc", "Miếu", "Bình", "Vượng", "Đắc"],
  "Thái Âm": ["Vượng", "Đắc", "Hãm", "Hãm", "Hãm", "Hãm", "Hãm", "Đắc", "Vượng", "Miếu", "Miếu", "Miếu"],
  "Tham Lang": ["Hãm", "Miếu", "Đắc", "Hãm", "Vượng", "Hãm", "Hãm", "Miếu", "Đắc", "Hãm", "Vượng", "Hãm"],
  "Cự Môn": ["Vượng", "Hãm", "Vượng", "Miếu", "Hãm", "Hãm", "Vượng", "Hãm", "Đắc", "Miếu", "Hãm", "Đắc"],
  "Thiên Tướng": ["Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Đắc", "Vượng", "Đắc", "Miếu", "Hãm", "Vượng", "Đắc"],
  "Thiên Lương": ["Vượng", "Đắc", "Vượng", "Vượng", "Miếu", "Hãm", "Miếu", "Đắc", "Vượng", "Hãm", "Miếu", "Hãm"],
  "Thất Sát": ["Miếu", "Đắc", "Miếu", "Hãm", "Hãm", "Vượng", "Miếu", "Đắc", "Miếu", "Hãm", "Hãm", "Vượng"],
  "Phá Quân": ["Miếu", "Vượng", "Hãm", "Hãm", "Đắc", "Hãm", "Miếu", "Vượng", "Hãm", "Hãm", "Đắc", "Hãm"],
};

const STAR_NAMES = Object.keys(EXPECTED);

describe("Phase 16 — 168/168 status assertions (getStarStatus, tra thẳng star+branch)", () => {
  for (const star of STAR_NAMES) {
    for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
      const expected = EXPECTED[star][chiIndex];
      it(`${star} @ ${CHI_NAMES[chiIndex]} (index ${chiIndex}) = ${expected}`, () => {
        expect(getStarStatus(star, chiIndex)).toBe(expected);
      });
    }
  }
});

describe("Phase 16 — guard tests: toàn vẹn cấu trúc bảng", () => {
  it("Đủ đúng 14 sao trong MAIN_STAR_STATUS, không thừa không thiếu", () => {
    expect(Object.keys(MAIN_STAR_STATUS).sort()).toEqual(STAR_NAMES.sort());
  });

  it("Mỗi sao có đúng 12 ô (14 x 12 = 168 entries), không sao nào thiếu/thừa Chi", () => {
    for (const star of STAR_NAMES) {
      expect(MAIN_STAR_STATUS[star].length).toBe(12);
    }
    const totalEntries = Object.values(MAIN_STAR_STATUS).reduce((sum, row) => sum + row.length, 0);
    expect(totalEntries).toBe(168);
  });

  it("Không có ô nào undefined trong toàn bộ bảng", () => {
    for (const star of STAR_NAMES) {
      for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
        expect(MAIN_STAR_STATUS[star][chiIndex]).toBeDefined();
      }
    }
  });

  it("Không còn ô nào 'Chưa xác định' trong toàn bộ bảng", () => {
    const all = Object.values(MAIN_STAR_STATUS).flat();
    expect(all.filter((s) => s === "Chưa xác định").length).toBe(0);
  });

  it("Mỗi ô chỉ nhận đúng 1 trong 5 giá trị hợp lệ: Miếu/Vượng/Đắc/Bình/Hãm", () => {
    const VALID = new Set(["Miếu", "Vượng", "Đắc", "Bình", "Hãm"]);
    const all = Object.values(MAIN_STAR_STATUS).flat();
    for (const status of all) {
      expect(VALID.has(status)).toBe(true);
    }
  });

  it("getStarStatus ném lỗi rõ ràng cho star ngoài bảng (không trả về giá trị đoán)", () => {
    expect(() => getStarStatus("Sao Không Tồn Tại", 0)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("getStarStatus ném lỗi rõ ràng cho chiIndex ngoài phạm vi 0-11 (không trả về giá trị đoán)", () => {
    expect(() => getStarStatus("Tử Vi", -1)).toThrow(/RULE_NOT_DEFINED/);
    expect(() => getStarStatus("Tử Vi", 12)).toThrow(/RULE_NOT_DEFINED/);
  });

  it("5 ô trước đây khóa 'Chưa xác định' (Phase 8) nay đúng giá trị Nguyên Cát theo yêu cầu Phase 16", () => {
    expect(getStarStatus("Vũ Khúc", 3)).toBe("Đắc"); // Mão
    expect(getStarStatus("Thiên Cơ", 6)).toBe("Đắc"); // Ngọ
    expect(getStarStatus("Thái Âm", 2)).toBe("Hãm"); // Dần
    expect(getStarStatus("Thất Sát", 7)).toBe("Đắc"); // Mùi
    expect(getStarStatus("Thiên Lương", 7)).toBe("Đắc"); // Mùi
  });
});
