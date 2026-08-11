// Golden Master #001 — theo TuVi_Engine_V2.md mục 37 (người dùng cung cấp): sinh Dương lịch
// 31/8/1980, 11:30, GMT+7, Hà Nội, Nam, năm xem 2026, Âm lịch 21/7/1980, năm Canh Thân.
// Test này KHÔNG bao phủ toàn bộ 168 ô Miếu/Vượng hay toàn bộ phụ tinh (những phần DERIVED không có
// Golden Master riêng) — chỉ kiểm chứng đúng các giá trị mà chính tài liệu spec đã nêu rõ.

import { describe, expect, it } from "vitest";
import { getPalace, getStar, tinhTuVi } from "../src/lib/tu-vi/engine";

const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });

describe("Golden Master #001 — Calendar / Thiên Bàn", () => {
  it("Âm lịch 21/7/1980", () => {
    expect(chart.lunarDay).toBe(21);
    expect(chart.lunarMonth).toBe(7);
    expect(chart.lunarYear).toBe(1980);
  });
  it("Năm sinh Canh Thân, Dương Nam", () => {
    expect(chart.yearCanName).toBe("Canh");
    expect(chart.yearChiName).toBe("Thân");
    expect(chart.amDuongNam).toBe("Dương Nam");
  });
  it("Tuổi năm xem 2026 = 47", () => {
    expect(chart.tuoiNamXem).toBe(47);
  });
  it("Bản mệnh Thạch Lựu Mộc", () => {
    expect(chart.banMenhNapAm).toBe("Thạch Lựu Mộc");
  });
  it("Cục = Thổ Ngũ Cục (số 5)", () => {
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.cucSo).toBe(5);
  });
  it("Mệnh Quái = Khôn", () => {
    expect(chart.menhQuai).toBe("Khôn");
  });
  it("Chủ Mệnh = Liêm Trinh, Chủ Thân = Thiên Lương", () => {
    expect(chart.chuMenh).toBe("Liêm Trinh");
    expect(chart.chuThan).toBe("Thiên Lương");
  });
});

describe("Golden Master #001 — 12 cung (mục 37)", () => {
  const expected: [string, string][] = [
    ["Dần", "Mệnh"], ["Mão", "Phụ Mẫu"], ["Thìn", "Phúc Đức"], ["Tỵ", "Điền Trạch"],
    ["Ngọ", "Quan Lộc"], ["Mùi", "Nô Bộc"], ["Thân", "Thiên Di"], ["Dậu", "Tật Ách"],
    ["Tuất", "Tài Bạch"], ["Hợi", "Tử Tức"], ["Tý", "Phu Thê"], ["Sửu", "Huynh Đệ"],
  ];
  for (const [chi, name] of expected) {
    it(`${chi} = ${name}`, () => {
      expect(getPalace(chart, chi).cungName).toBe(name);
    });
  }
  it("Mệnh và Thân cùng tại Dần (đồng cung)", () => {
    const dan = getPalace(chart, "Dần");
    expect(dan.isMenh).toBe(true);
    expect(dan.isThan).toBe(true);
  });
});

describe("Golden Master #001 — 14 chính tinh + trạng thái (mục 37)", () => {
  it("Mệnh Dần: Liêm Trinh (Vượng)", () => {
    expect(getStar(chart, "Dần", "Liêm Trinh").trangThai).toBe("Vượng");
  });
  it("Quan Lộc Ngọ: Vũ Khúc (Vượng), Thiên Phủ (Miếu)", () => {
    expect(getStar(chart, "Ngọ", "Vũ Khúc").trangThai).toBe("Vượng");
    expect(getStar(chart, "Ngọ", "Thiên Phủ").trangThai).toBe("Miếu");
  });
  it("Nô Bộc Mùi: Thái Dương (Đắc), Thái Âm (Đắc)", () => {
    expect(getStar(chart, "Mùi", "Thái Dương").trangThai).toBe("Đắc");
    expect(getStar(chart, "Mùi", "Thái Âm").trangThai).toBe("Đắc");
  });
  it("Thiên Di Thân: Tham Lang (Đắc)", () => {
    expect(getStar(chart, "Thân", "Tham Lang").trangThai).toBe("Đắc");
  });
  it("Tật Ách Dậu: Thiên Cơ (Miếu), Cự Môn (Miếu)", () => {
    expect(getStar(chart, "Dậu", "Thiên Cơ").trangThai).toBe("Miếu");
    expect(getStar(chart, "Dậu", "Cự Môn").trangThai).toBe("Miếu");
  });
  it("Tài Bạch Tuất: Tử Vi có mặt, Thiên Tướng (Vượng)", () => {
    expect(getPalace(chart, "Tuất").chinhTinh.some((s) => s.name === "Tử Vi")).toBe(true);
    expect(getStar(chart, "Tuất", "Thiên Tướng").trangThai).toBe("Vượng");
  });
  it("Tử Tức Hợi: Thiên Lương (Hãm)", () => {
    expect(getStar(chart, "Hợi", "Thiên Lương").trangThai).toBe("Hãm");
  });
  it("Phu Thê Tý: Thất Sát (Miếu)", () => {
    expect(getStar(chart, "Tý", "Thất Sát").trangThai).toBe("Miếu");
  });
  it("Phúc Đức Thìn: Phá Quân (Đắc)", () => {
    expect(getStar(chart, "Thìn", "Phá Quân").trangThai).toBe("Đắc");
  });
  it("Điền Trạch Tỵ: Thiên Đồng (Đắc)", () => {
    expect(getStar(chart, "Tỵ", "Thiên Đồng").trangThai).toBe("Đắc");
  });
});

describe("Invariant — mỗi chính tinh trong 14 sao xuất hiện đúng 1 lần (mục 39.2)", () => {
  const CHINH_TINH_14 = [
    "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
    "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân",
  ];
  it("14/14 chính tinh, mỗi sao 1 lần", () => {
    const all = chart.cungs.flatMap((c) => c.chinhTinh.map((s) => s.name));
    expect(all.length).toBe(14);
    for (const name of CHINH_TINH_14) {
      expect(all.filter((n) => n === name).length).toBe(1);
    }
  });
});

describe("Golden Master #001 — Tứ Hóa Canh (mục 17)", () => {
  it("Thái Dương=Lộc, Vũ Khúc=Quyền, Thái Âm=Khoa, Thiên Đồng=Kỵ", () => {
    expect(chart.tuHoa.loc).toBe("Thái Dương");
    expect(chart.tuHoa.quyen).toBe("Vũ Khúc");
    expect(chart.tuHoa.khoa).toBe("Thái Âm");
    expect(chart.tuHoa.ky).toBe("Thiên Đồng");
  });
  it("Tứ Hóa được gắn đúng vào sao tương ứng trong lá số", () => {
    expect(getStar(chart, "Mùi", "Thái Dương").tuHoa).toBe("Lộc");
    expect(getStar(chart, "Ngọ", "Vũ Khúc").tuHoa).toBe("Quyền");
    expect(getStar(chart, "Mùi", "Thái Âm").tuHoa).toBe("Khoa");
    expect(getStar(chart, "Tỵ", "Thiên Đồng").tuHoa).toBe("Kỵ");
  });
});

describe("Golden Master #001 — Đại Vận (mục 28)", () => {
  it("Đại vận Mệnh khởi tuổi 5 (đúng số Cục)", () => {
    expect(getPalace(chart, "Dần").daiVanTuoi).toEqual([5, 14]);
  });
  it("Quan Lộc (Ngọ) có Đại Vận 45-54", () => {
    expect(getPalace(chart, "Ngọ").daiVanTuoi).toEqual([45, 54]);
  });
  it("Đại Vận 12 cung liên tục, cách nhau 10 tuổi, không chồng lấn (mục 39.5)", () => {
    const sorted = [...chart.cungs].sort((a, b) => a.daiVanTuoi[0] - b.daiVanTuoi[0]);
    for (let i = 0; i < sorted.length; i++) {
      expect(sorted[i].daiVanTuoi[1] - sorted[i].daiVanTuoi[0]).toBe(9);
      if (i > 0) expect(sorted[i].daiVanTuoi[0]).toBe(sorted[i - 1].daiVanTuoi[1] + 1);
    }
  });
});
