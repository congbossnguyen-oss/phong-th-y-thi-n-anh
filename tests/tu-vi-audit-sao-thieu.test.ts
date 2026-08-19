// Audit 2026-08 — bổ sung sao thiếu / sửa công thức sai: Thiên Trù (mới), Phá Toái (sửa hoán đổi),
// Lưu Tứ Hóa (mới). Đối chiếu bảng chuẩn Công cung cấp + lá số mẫu 22/11/1984 04:30 Nam (Giáp Tý).
import { describe, it, expect } from "vitest";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { getTapDieu, THIEN_TRU_BY_CAN, PHA_TOAI_BY_CHI, amSatIndex } from "../src/lib/tu-vi/tap-dieu";
import { getLuuTuHoa, applyLuuTuHoa, canOfYear } from "../src/lib/tu-vi/luu-nien";

// chiIndex: Tý0 Sửu1 Dần2 Mão3 Thìn4 Tỵ5 Ngọ6 Mùi7 Thân8 Dậu9 Tuất10 Hợi11
const LA_MAU = { day: 22, month: 11, year: 1984, hour: 4, gender: "Nam" as const, viewingYear: 2026 };

describe("Thiên Trù — bảng theo Can năm sinh (chuẩn Công)", () => {
  const EXP: [string, number][] = [
    ["Giáp", 5], ["Ất", 6], ["Bính", 0], ["Đinh", 5], ["Mậu", 6],
    ["Kỷ", 8], ["Canh", 2], ["Tân", 6], ["Nhâm", 9], ["Quý", 10],
  ];
  for (const [can, idx] of EXP) {
    it(`Can ${can} → Thiên Trù chiIndex ${idx}`, () => expect(THIEN_TRU_BY_CAN[can]).toBe(idx));
  }
  it("lá mẫu Giáp Tý: Thiên Trù tại Tỵ(5) = Tài Bạch, xuất hiện trong getTapDieu", () => {
    const chart = tinhTuVi(LA_MAU);
    const tt = getTapDieu(chart).find((s) => s.name === "Thiên Trù");
    expect(tt).toBeDefined();
    expect(tt!.chiIndex).toBe(5);
    expect(chart.cungs.find((c) => c.chiIndex === 5)!.cungName).toBe("Tài Bạch");
  });
});

describe("Phá Toái — SỬA hoán đổi Tứ Chính↔Tứ Sinh (chuẩn Công)", () => {
  it("Tứ Chính Tý/Ngọ/Mão/Dậu → Tỵ(5)", () => {
    for (const c of ["Tý", "Ngọ", "Mão", "Dậu"]) expect(PHA_TOAI_BY_CHI[c]).toBe(5);
  });
  it("Tứ Sinh Dần/Thân/Tỵ/Hợi → Dậu(9)", () => {
    for (const c of ["Dần", "Thân", "Tỵ", "Hợi"]) expect(PHA_TOAI_BY_CHI[c]).toBe(9);
  });
  it("Tứ Mộ Thìn/Tuất/Sửu/Mùi → Sửu(1)", () => {
    for (const c of ["Thìn", "Tuất", "Sửu", "Mùi"]) expect(PHA_TOAI_BY_CHI[c]).toBe(1);
  });
  it("lá mẫu Giáp Tý: Phá Toái tại Tỵ(5) = Tài Bạch (trước sửa là Dậu)", () => {
    const chart = tinhTuVi(LA_MAU);
    const pt = getTapDieu(chart).find((s) => s.name === "Phá Toái")!;
    expect(pt.chiIndex).toBe(5);
  });
});

describe("Âm Sát — sanity (KHÔNG đổi): tháng 10 → Thân(8)", () => {
  it("amSatIndex(10) = 8 (Thân, Huynh Đệ)", () => expect(amSatIndex(10)).toBe(8));
  it("lá mẫu: Âm Sát tại Thân(8) = Huynh Đệ", () => {
    const chart = tinhTuVi(LA_MAU);
    const as = getTapDieu(chart).find((s) => s.name === "Âm Sát")!;
    expect(as.chiIndex).toBe(8);
    expect(chart.cungs.find((c) => c.chiIndex === 8)!.cungName).toBe("Huynh Đệ");
  });
});

describe("Lưu Tứ Hóa — bảng + Can theo năm lưu niên", () => {
  it("canOfYear: 2026→Bính, 2027→Đinh, 2034→Giáp, 2035→Ất", () => {
    expect(canOfYear(2026)).toBe("Bính");
    expect(canOfYear(2027)).toBe("Đinh");
    expect(canOfYear(2034)).toBe("Giáp");
    expect(canOfYear(2035)).toBe("Ất");
  });

  it("2026 Bính → Lộc Thiên Đồng, Quyền Thiên Cơ, Khoa Văn Xương, Kỵ Liêm Trinh", () => {
    const t = getLuuTuHoa(2026);
    expect(t).toEqual({ can: "Bính", hoaLoc: "Thiên Đồng", hoaQuyen: "Thiên Cơ", hoaKhoa: "Văn Xương", hoaKy: "Liêm Trinh" });
  });

  // Regression 10 Can — sao Hóa Lộc mỗi năm (cột Lộc của bảng chuẩn).
  const HOA_LOC_10: [number, string, string][] = [
    [2026, "Bính", "Thiên Đồng"], [2027, "Đinh", "Thái Âm"], [2028, "Mậu", "Tham Lang"],
    [2029, "Kỷ", "Vũ Khúc"], [2030, "Canh", "Thái Dương"], [2031, "Tân", "Cự Môn"],
    [2032, "Nhâm", "Thiên Lương"], [2033, "Quý", "Phá Quân"], [2034, "Giáp", "Liêm Trinh"],
    [2035, "Ất", "Thiên Cơ"],
  ];
  for (const [year, can, loc] of HOA_LOC_10) {
    it(`${year} ${can} → Hóa Lộc = ${loc}`, () => {
      const t = getLuuTuHoa(year);
      expect(t.can).toBe(can);
      expect(t.hoaLoc).toBe(loc);
    });
  }
});

describe("applyLuuTuHoa — đặt tại cung natal chứa sao gốc (lá mẫu 2026)", () => {
  const chart = tinhTuVi(LA_MAU);
  const placed = applyLuuTuHoa(chart, 2026);
  const cungCua = (chiIndex: number) => chart.cungs.find((c) => c.chiIndex === chiIndex)!.cungName;
  const viTri = (name: string) => placed.find((p) => p.name === name)!;

  it("L.Hóa Lộc → cung natal của Thiên Đồng = Tử Tức", () => {
    expect(cungCua(viTri("L.Hóa Lộc").chiIndex)).toBe("Tử Tức");
  });
  it("L.Hóa Quyền → cung natal của Thiên Cơ = Phụ Mẫu", () => {
    expect(cungCua(viTri("L.Hóa Quyền").chiIndex)).toBe("Phụ Mẫu");
  });
  it("L.Hóa Khoa → cung natal của Văn Xương = Huynh Đệ", () => {
    expect(cungCua(viTri("L.Hóa Khoa").chiIndex)).toBe("Huynh Đệ");
  });
  it("L.Hóa Kỵ → cung natal của Liêm Trinh = Thiên Di", () => {
    expect(cungCua(viTri("L.Hóa Kỵ").chiIndex)).toBe("Thiên Di");
  });

  it("KHÔNG đổi Tứ Hóa nguyên cục: natal Hóa Lộc vẫn trên Liêm Trinh (Giáp)", () => {
    expect(chart.tuHoa.loc).toBe("Liêm Trinh");
    // L.Hóa Lộc (Thiên Đồng) khác cung với Hóa Lộc nguyên cục (Liêm Trinh) → 2 record độc lập.
    expect(viTri("L.Hóa Lộc").chiIndex).not.toBe(chart.cungs.find((c) => c.chinhTinh.some((s) => s.name === "Liêm Trinh"))!.chiIndex);
  });

  it("đủ 4 Lưu Tứ Hóa, không trùng tên", () => {
    expect(placed.map((p) => p.name).sort()).toEqual(["L.Hóa Khoa", "L.Hóa Kỵ", "L.Hóa Lộc", "L.Hóa Quyền"]);
  });
});
