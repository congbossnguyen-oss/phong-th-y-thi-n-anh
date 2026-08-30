import { describe, expect, it } from "vitest";
import { KIEP_SAT_THEO_TOA, kiemKiepSat } from "../../../src/bat-trach-nha/kiepSat.js";
import { SON_24_LIST, type Son24 } from "../../../src/bat-trach-nha/toaHuong.js";

// Bảng chép tay của anh Công (đã xác nhận từng ô 30/8/2026). Test này khóa nguyên bản để lỡ ai
// sửa nhầm 1 ô là gãy ngay.
const BANG_ANH_CONG: Record<Son24, Son24> = {
  Nhâm: "Thân", Tý: "Tỵ", Quý: "Tỵ", Sửu: "Thìn", Cấn: "Đinh", Dần: "Mùi",
  Giáp: "Bính", Mão: "Đinh", Ất: "Thân", Thìn: "Mùi", Tốn: "Quý", Tỵ: "Dậu",
  Bính: "Tân", Ngọ: "Dậu", Đinh: "Dần", Mùi: "Quý", Khôn: "Ất", Thân: "Quý",
  Canh: "Ngọ", Dậu: "Dần", Tân: "Sửu", Tuất: "Sửu", Càn: "Mão", Hợi: "Ất",
};

describe("bat-trach-nha — Kiếp Sát theo Tọa (bảng 24 sơn của anh Công)", () => {
  it("đủ 24 sơn, khớp 100% nguyên bản bảng chép tay", () => {
    for (const son of SON_24_LIST) {
      expect(KIEP_SAT_THEO_TOA[son]).toBe(BANG_ANH_CONG[son]);
    }
    expect(Object.keys(KIEP_SAT_THEO_TOA)).toHaveLength(24);
  });

  it("kiemKiepSat trả đúng sơn + cung chứa sơn đó", () => {
    // Tọa Nhâm -> Kiếp Sát sơn Thân, Thân thuộc cung Khôn.
    const r = kiemKiepSat("Nhâm");
    expect(r.sonKiepSat).toBe("Thân");
    expect(r.cungKiepSat).toBe("Khôn");
  });

  it("3 ô anh Công sửa em đọc sai đã đúng: Cấn->Đinh, Tỵ->Dậu, Ngọ->Dậu", () => {
    expect(kiemKiepSat("Cấn").sonKiepSat).toBe("Đinh");
    expect(kiemKiepSat("Tỵ").sonKiepSat).toBe("Dậu");
    expect(kiemKiepSat("Ngọ").sonKiepSat).toBe("Dậu");
  });
});
