// Phase 38 — Tạp Diệu bổ sung (FUTURE MODULE, không thuộc Natal Core). Expected value TÍNH TAY (offline)
// từ công thức nguồn (xem src/lib/tu-vi/tap-dieu.ts và docs/TUVI_PHASE38_TAP_DIEU.md), viết literal cố
// định — KHÔNG gọi hàm đang test để tự sinh expected.

import { describe, expect, it } from "vitest";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { vanXuongIndex, vanKhucIndex, taPhuIndex, huuBatIndex, mod12 } from "../src/lib/tu-vi/rules";
import { CHI } from "../src/lib/menh-nap-am";
import {
  longTriIndex, phuongCacIndex, thienKhocIndex, thienHuIndex, thienDucIndex, nguyetDucIndex,
  thienTaiIndex, thienThoIndex, thienKhongIndex, thienGiaiIndex, diaGiaiIndex, giaiThanIndex,
  thienSuIndex, thienThuongIndex, quocAnIndex, duongPhuIndex,
  anQuangIndex, thienQuyIndex, tamThaiIndex, batToaIndex, amSatIndex,
  getTuongTinhRing, getTapDieu,
  CO_THAN_BY_CHI, QUA_TU_BY_CHI, LUU_HA_BY_CAN, PHA_TOAI_BY_CHI,
  THIEN_LA_CHI_INDEX, DIA_VONG_CHI_INDEX,
} from "../src/lib/tu-vi/tap-dieu";

// ============================================================================================
// PHẦN A — 6 sao công thức thuần túy (Long Trì, Phượng Các, Thiên Khốc, Thiên Hư, Thiên Đức, Nguyệt
// Đức): kiểm đủ 12 Chi năm sinh, expected tính tay từ công thức nguồn (khởi + thuận/nghịch).
// ============================================================================================
describe("Phase 38 — 6 sao công thức thuần túy: đủ 12 Chi năm sinh", () => {
  const CASES: [string, (i: number) => number, number[]][] = [
    ["Long Trì (khởi Thìn=4, thuận)", longTriIndex, [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3]],
    ["Phượng Các (khởi Tuất=10, nghịch)", phuongCacIndex, [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11]],
    ["Thiên Khốc (khởi Ngọ=6, nghịch)", thienKhocIndex, [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7]],
    ["Thiên Hư (khởi Ngọ=6, thuận — đồng cung Tuế Phá)", thienHuIndex, [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5]],
    ["Thiên Đức (khởi Dậu=9, thuận)", thienDucIndex, [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]],
    ["Nguyệt Đức (khởi Tỵ=5, thuận)", nguyetDucIndex, [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4]],
  ];
  for (const [label, fn, expected] of CASES) {
    it(label, () => {
      for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
        expect(fn(chiIndex)).toBe(expected[chiIndex]);
      }
    });
  }

  it("Thiên Hư luôn đồng cung với Tuế Phá (cross-check nguồn, Tuế Phá = mod12(yearChiIndex+6), đã LOCKED ở vòng Thái Tuế)", () => {
    for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
      const tuePha = (chiIndex + 6) % 12;
      expect(thienHuIndex(chiIndex)).toBe(tuePha);
    }
  });
});

// ============================================================================================
// PHẦN B — Thiên Tài / Thiên Thọ: phụ thuộc Mệnh/Thân, kiểm qua vài lá số thực tế (đọc menhChiIndex/
// thanChiIndex có sẵn từ chart — Natal Core đã LOCKED — không tính lại).
// ============================================================================================
describe("Phase 38 — Thiên Tài (khởi Mệnh, thuận) / Thiên Thọ (khởi Thân, thuận)", () => {
  const INPUTS: Parameters<typeof tinhTuVi>[0][] = [
    { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
    { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" },
    { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" },
  ];
  for (const input of INPUTS) {
    it(`${JSON.stringify(input)}: Thiên Tài/Thiên Thọ tính đúng theo công thức từ menhChiIndex/thanChiIndex`, () => {
      const chart = tinhTuVi(input);
      const yearChiIndex = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"].indexOf(chart.yearChiName);
      const expectedThienTai = (chart.menhChiIndex + yearChiIndex) % 12;
      const expectedThienTho = (chart.thanChiIndex + yearChiIndex) % 12;
      expect(thienTaiIndex(chart.menhChiIndex, yearChiIndex)).toBe(expectedThienTai);
      expect(thienThoIndex(chart.thanChiIndex, yearChiIndex)).toBe(expectedThienTho);
    });
  }
});

// ============================================================================================
// PHẦN C — Bảng tra cứu đầy đủ: Cô Thần/Quả Tú (12 Chi), Lưu Hà (10 Can), Phá Toái (12 Chi). Literal
// tính tay từ nguồn, đối chiếu trực tiếp với export const (giống pattern TRIET_TABLE Phase 29).
// ============================================================================================
describe("Phase 38 — Cô Thần / Quả Tú: đủ 12 Chi, đúng nhóm 3 Chi liên tiếp", () => {
  const EXPECTED: [string, number, number][] = [
    // [Chi, Cô Thần chiIndex, Quả Tú chiIndex]
    ["Dần", 5, 1], ["Mão", 5, 1], ["Thìn", 5, 1],
    ["Tỵ", 8, 4], ["Ngọ", 8, 4], ["Mùi", 8, 4],
    ["Thân", 11, 7], ["Dậu", 11, 7], ["Tuất", 11, 7],
    ["Hợi", 2, 10], ["Tý", 2, 10], ["Sửu", 2, 10],
  ];
  for (const [chi, coThan, quaTu] of EXPECTED) {
    it(`Chi ${chi}: Cô Thần tại chiIndex ${coThan}, Quả Tú tại chiIndex ${quaTu}`, () => {
      expect(CO_THAN_BY_CHI[chi]).toBe(coThan);
      expect(QUA_TU_BY_CHI[chi]).toBe(quaTu);
    });
  }
});

// Phase 42 — Lưu Hà: RULE ĐỔI THẬT (đủ 10/10 GM-verified, không còn CONFLICTED). 3 nguồn văn bản (Thiên
// Lương, "bài 10", Tam Hợp Phái Minh Việt) mâu thuẫn nhau nên đã kiểm tra trực tiếp cả 10 Can bằng cách
// lập 10 lá số thật qua https://hocvienlyso.org/la-so-tu-vi.html (mỗi lá số 1 năm liên tiếp 1974-1983,
// ứng đúng 1 Can, 31/8 giờ Ngọ Dương Nam) và đọc trực tiếp vị trí "Lưu Hà" trên ảnh lá số — có kiểm chéo
// bằng Đẩu Quân (công thức đã LOCKED) trên từng lá số để xác nhận độ tin cậy nguồn. Xem chú thích đầy đủ
// tại LUU_HA_BY_CAN trong tap-dieu.ts.
describe("Phase 42 — Lưu Hà: GM-verified đủ 10/10 Can (kiểm trực tiếp qua hocvienlyso.org)", () => {
  const GM_VERIFIED: [string, number][] = [
    ["Giáp", 9], ["Ất", 10], ["Bính", 7], ["Đinh", 4], ["Mậu", 5],
    ["Kỷ", 6], ["Canh", 8], ["Tân", 3], ["Nhâm", 11], ["Quý", 2],
  ];
  for (const [can, expected] of GM_VERIFIED) {
    it(`Can ${can}: GM-verified chiIndex ${expected} (${CHI[expected]})`, () => {
      expect(LUU_HA_BY_CAN[can]).toBe(expected);
    });
  }

  it("3 Can Đinh/Canh/Tân KHÁC bảng 'Thiên Lương' cũ (8/3/4) — lỗi dịch chuyển vòng qua 3 Can liền nhau trong nguồn cũ, đã sửa theo lá số thật", () => {
    expect(LUU_HA_BY_CAN["Đinh"]).not.toBe(8);
    expect(LUU_HA_BY_CAN["Canh"]).not.toBe(3);
    expect(LUU_HA_BY_CAN["Tân"]).not.toBe(4);
  });

  it("GM-LUUHA-CANH (Nam Canh Thân, 31/8/1980 giờ Ngọ): Lưu Hà = Thân, Đẩu Quân = Thân (kiểm chéo)", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const result = getTapDieu(chart);
    expect(result.find((s) => s.name === "Lưu Hà")?.chiIndex).toBe(CHI.indexOf("Thân"));
    expect(result.find((s) => s.name === "Đẩu Quân")?.chiIndex).toBe(CHI.indexOf("Thân"));
  });

  it("GM-LUUHA-TAN (Nam Tân Dậu, 31/8/1981 giờ Ngọ): Lưu Hà = Mão, Mệnh = Mão (kiểm chéo)", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1981, hour: 11, gender: "Nam" });
    const result = getTapDieu(chart);
    expect(result.find((s) => s.name === "Lưu Hà")?.chiIndex).toBe(CHI.indexOf("Mão"));
    expect(chart.menhChiIndex).toBe(CHI.indexOf("Mão"));
  });

  it("getTapDieu() nay CÓ chứa 'Lưu Hà' (đã gỡ CONFLICTED)", () => {
    const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" });
    expect(getTapDieu(chart).some((s) => s.name === "Lưu Hà")).toBe(true);
  });
});

describe("Phase 38 — Phá Toái: đủ 12 Chi, đúng nhóm Tứ Chính/Tứ Sinh/Tứ Mộ", () => {
  // SỬA (audit 2026-08) theo bảng chuẩn Công: Tứ Chính(Tý Ngọ Mão Dậu)→Tỵ(5), Tứ Sinh(Dần Thân Tỵ
  // Hợi)→Dậu(9), Tứ Mộ(Thìn Tuất Sửu Mùi)→Sửu(1). Bản cũ khóa nhầm giá trị hoán đổi Chính↔Sinh.
  const EXPECTED: [string, number][] = [
    ["Tý", 5], ["Ngọ", 5], ["Mão", 5], ["Dậu", 5],
    ["Dần", 9], ["Thân", 9], ["Tỵ", 9], ["Hợi", 9],
    ["Thìn", 1], ["Tuất", 1], ["Sửu", 1], ["Mùi", 1],
  ];
  for (const [chi, expected] of EXPECTED) {
    it(`Chi ${chi}: Phá Toái tại chiIndex ${expected}`, () => {
      expect(PHA_TOAI_BY_CHI[chi]).toBe(expected);
    });
  }
});

// ============================================================================================
// PHẦN C.2 — 10 sao mới (Batch 2): Thiên Không, Thiên Giải/Địa Giải/Giải Thần, Thiên La/Địa Võng (cố
// định), Thiên Sứ/Thiên Thương (tương đối theo cung Tật Ách/Nô Bộc), Quốc Ấn/Đường Phù (theo Lộc Tồn).
// ============================================================================================
describe("Phase 38 batch 2 — Thiên Không: đủ 12 Chi (khởi đằng trước Thái Tuế)", () => {
  const EXPECTED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
  for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
    it(`Chi index ${chiIndex}: Thiên Không tại chiIndex ${EXPECTED[chiIndex]}`, () => {
      expect(thienKhongIndex(chiIndex)).toBe(EXPECTED[chiIndex]);
    });
  }
  it("Khớp ví dụ nguồn: Thái Tuế Mùi(7) → Thiên Không Thân(8)", () => {
    expect(thienKhongIndex(7)).toBe(8);
  });
});

describe("Phase 38 batch 2 — Thiên Giải / Địa Giải: đủ 12 tháng âm lịch", () => {
  const THIEN_GIAI_EXPECTED = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7]; // tháng 1..12
  const DIA_GIAI_EXPECTED = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6];
  for (let m = 1; m <= 12; m++) {
    it(`Tháng ${m}: Thiên Giải tại ${THIEN_GIAI_EXPECTED[m - 1]}, Địa Giải tại ${DIA_GIAI_EXPECTED[m - 1]}`, () => {
      expect(thienGiaiIndex(m)).toBe(THIEN_GIAI_EXPECTED[m - 1]);
      expect(diaGiaiIndex(m)).toBe(DIA_GIAI_EXPECTED[m - 1]);
    });
  }
});

describe("Phase 38 batch 2 — Giải Thần = vị trí Phượng Các (tái dùng công thức, không tính lại)", () => {
  for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
    it(`Chi index ${chiIndex}: Giải Thần === Phượng Các`, () => {
      expect(giaiThanIndex(chiIndex)).toBe(phuongCacIndex(chiIndex));
    });
  }
});

describe("Phase 38 batch 2 — Thiên La (luôn Thìn) / Địa Võng (luôn Tuất): vị trí cố định", () => {
  it("Thiên La = 4 (Thìn), Địa Võng = 10 (Tuất)", () => {
    expect(THIEN_LA_CHI_INDEX).toBe(4);
    expect(DIA_VONG_CHI_INDEX).toBe(10);
  });
});

describe("Phase 38 batch 2 — Thiên Sứ (luôn tại Tật Ách) / Thiên Thương (luôn tại Nô Bộc)", () => {
  const INPUTS: Parameters<typeof tinhTuVi>[0][] = [
    { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
    { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" },
    { day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" },
  ];
  for (const input of INPUTS) {
    it(`${JSON.stringify(input)}: Thiên Sứ đúng tại cung tên "Tật Ách", Thiên Thương đúng tại cung tên "Nô Bộc"`, () => {
      const chart = tinhTuVi(input);
      const tatAch = chart.cungs.find((c) => c.cungName === "Tật Ách")!;
      const noBoc = chart.cungs.find((c) => c.cungName === "Nô Bộc")!;
      expect(thienSuIndex(chart)).toBe(tatAch.chiIndex);
      expect(thienThuongIndex(chart)).toBe(noBoc.chiIndex);
    });
  }
});

describe("Phase 38 batch 2 — Quốc Ấn (Lộc Tồn+8) / Đường Phù (Lộc Tồn-7)", () => {
  const CASES: [number, number, number][] = [
    // [locTonChiIndex, expectedQuocAn, expectedDuongPhu]
    [2, 10, 7], // Giáp: Lộc Tồn Dần(2) → Quốc Ấn Tuất(10), Đường Phù Mùi(7)
    [8, 4, 1], // Canh: Lộc Tồn Thân(8) → Quốc Ấn Thìn(4), Đường Phù Sửu(1)
    [0, 8, 5], // Quý: Lộc Tồn Tý(0) → Quốc Ấn Thân(8), Đường Phù Ngọ(5)
  ];
  for (const [locTon, expectedQuocAn, expectedDuongPhu] of CASES) {
    it(`Lộc Tồn tại chiIndex ${locTon}: Quốc Ấn tại ${expectedQuocAn}, Đường Phù tại ${expectedDuongPhu}`, () => {
      expect(quocAnIndex(locTon)).toBe(expectedQuocAn);
      expect(duongPhuIndex(locTon)).toBe(expectedDuongPhu);
    });
  }

  it("Trên lá số thực tế: Quốc Ấn/Đường Phù tính đúng từ vị trí Lộc Tồn thật có trong chart", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    const locTonPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Lộc Tồn"))!;
    expect(quocAnIndex(locTonPalace.chiIndex)).toBe((locTonPalace.chiIndex + 8) % 12);
    expect(duongPhuIndex(locTonPalace.chiIndex)).toBe(((locTonPalace.chiIndex - 7) % 12 + 12) % 12);
  });
});

// ============================================================================================
// PHẦN D — Vòng Tướng Tinh: đủ 4 nhóm tam hợp, đủ 11 sao (Đào Hoa lọc bỏ), expected tính tay + cross-
// check khớp Đào Hoa đã LOCKED sẵn (DAO_HOA_START) tại đúng offset 9 (không gọi lại DAO_HOA_START).
// ============================================================================================
describe("Phase 38 — Vòng Tướng Tinh: đủ 4 nhóm, đủ 11 sao (không lặp Đào Hoa)", () => {
  const CASES: [string, string, [string, number][]][] = [
    ["Dần/Ngọ/Tuất (khởi Ngọ=6)", "Ngọ", [
      ["Tướng Tinh", 6], ["Phan Án", 7], ["Tuế Dịch", 8], ["Tức Thần", 9], ["Hoa Cái", 10],
      ["Kiếp Sát", 11], ["Tai Sát", 0], ["Thiên Sát", 1], ["Chỉ Bối", 2], ["Nguyệt Sát", 4], ["Vong Thần", 5],
    ]],
    ["Thân/Tý/Thìn (khởi Tý=0)", "Tý", [
      ["Tướng Tinh", 0], ["Phan Án", 1], ["Tuế Dịch", 2], ["Tức Thần", 3], ["Hoa Cái", 4],
      ["Kiếp Sát", 5], ["Tai Sát", 6], ["Thiên Sát", 7], ["Chỉ Bối", 8], ["Nguyệt Sát", 10], ["Vong Thần", 11],
    ]],
    ["Tỵ/Dậu/Sửu (khởi Dậu=9)", "Dậu", [
      ["Tướng Tinh", 9], ["Phan Án", 10], ["Tuế Dịch", 11], ["Tức Thần", 0], ["Hoa Cái", 1],
      ["Kiếp Sát", 2], ["Tai Sát", 3], ["Thiên Sát", 4], ["Chỉ Bối", 5], ["Nguyệt Sát", 7], ["Vong Thần", 8],
    ]],
    ["Hợi/Mão/Mùi (khởi Mão=3)", "Mão", [
      ["Tướng Tinh", 3], ["Phan Án", 4], ["Tuế Dịch", 5], ["Tức Thần", 6], ["Hoa Cái", 7],
      ["Kiếp Sát", 8], ["Tai Sát", 9], ["Thiên Sát", 10], ["Chỉ Bối", 11], ["Nguyệt Sát", 1], ["Vong Thần", 2],
    ]],
  ];
  for (const [label, chiName, expected] of CASES) {
    it(label, () => {
      const ring = getTuongTinhRing(chiName);
      expect(ring).toHaveLength(11);
      expect(ring.every((s) => s.name !== "Đào Hoa")).toBe(true);
      expect(ring.map((s) => [s.name, s.chiIndex])).toEqual(expected);
    });
  }

  it("Kiếp Sát khớp nguồn trực tiếp (Thiên Lương): Dần Ngọ Tuất→Hợi, Thân Tý Thìn→Tỵ, Tỵ Dậu Sửu→Dần, Hợi Mão Mùi→Thân", () => {
    expect(getTuongTinhRing("Ngọ").find((s) => s.name === "Kiếp Sát")!.chiIndex).toBe(11);
    expect(getTuongTinhRing("Tý").find((s) => s.name === "Kiếp Sát")!.chiIndex).toBe(5);
    expect(getTuongTinhRing("Dậu").find((s) => s.name === "Kiếp Sát")!.chiIndex).toBe(2);
    expect(getTuongTinhRing("Mão").find((s) => s.name === "Kiếp Sát")!.chiIndex).toBe(8);
  });
});

// ============================================================================================
// PHẦN E — getTapDieu(): hàm tổng hợp, kiểm qua lá số thực tế — đủ sao, không NaN/undefined, không
// trùng Đào Hoa với Natal Core.
// ============================================================================================
describe("Phase 38 — getTapDieu(): hàm tổng hợp trên lá số thực tế", () => {
  const INPUTS: Parameters<typeof tinhTuVi>[0][] = [
    { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" },
    { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" },
    { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" },
    { day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" },
  ];
  for (const input of INPUTS) {
    it(`${JSON.stringify(input)}: đủ 44 sao (43 cũ + Thiên Trù, audit 2026-08), không NaN/undefined, không trùng "Đào Hoa"`, () => {
      const chart = tinhTuVi(input);
      const result = getTapDieu(chart);
      expect(result).toHaveLength(44);
      expect(result.some((s) => s.name === "Thiên Trù")).toBe(true);
      expect(result.every((s) => s.name !== "Đào Hoa")).toBe(true);
      const names = result.map((s) => s.name);
      expect(new Set(names).size).toBe(names.length); // không trùng tên sao nào
      for (const s of result) {
        expect(Number.isNaN(s.chiIndex)).toBe(false);
        expect(s.chiIndex).toBeGreaterThanOrEqual(0);
        expect(s.chiIndex).toBeLessThanOrEqual(11);
        expect(s.name).toBeTruthy();
      }
    });
  }
});

// ============================================================================================
// PHẦN E2 — Ân Quang/Thiên Quý/Tam Thai/Bát Tọa (nguồn "Tử Vi Tam Hợp Phái Tập 1" — Minh Việt): công
// thức tương đối theo vị trí Văn Xương/Văn Khúc/Tả Phù/Hữu Bật (đã LOCKED trong rules.ts) + ngày sinh.
// Expected tính tay bằng chính công thức rules.ts (vanXuongIndex/vanKhucIndex/taPhuIndex/huuBatIndex —
// các hàm khác, không phải hàm đang test), KHÔNG gọi anQuangIndex/thienQuyIndex/tamThaiIndex/batToaIndex
// để tự sinh expected.
// ============================================================================================
describe("Phase 38+ — Ân Quang/Thiên Quý/Tam Thai/Bát Tọa (nguồn Tam Hợp Phái Minh Việt)", () => {
  const CASES: { day: number; month: number; year: number; hour: number; gender: "Nam" | "Nữ" }[] = [
    { day: 15, month: 8, year: 1990, hour: 11, gender: "Nam" },
    { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" },
    { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" },
    { day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" },
  ];
  for (const input of CASES) {
    it(`${JSON.stringify(input)}: khớp công thức Văn Xương/Khúc ± (ngày sinh-2), Tả Phù/Hữu Bật ± (ngày sinh-1)`, () => {
      const chart = tinhTuVi(input);
      const gioChiIndex = CHI.indexOf(chart.gioChiName);
      // Ân Quang/Thiên Quý: offset = lunarDay-2 (câu nguồn có 2 lớp trừ 1 — xem ghi chú tap-dieu.ts, đã
      // xác nhận bằng lá số thật Học Viện Lý Số Nguyên Cát ở test golden-master riêng bên dưới).
      const expectedAnQuang = mod12(vanXuongIndex(gioChiIndex) + (chart.lunarDay - 2));
      const expectedThienQuy = mod12(vanKhucIndex(gioChiIndex) - (chart.lunarDay - 2));
      // Tam Thai/Bát Tọa: offset = lunarDay-1 ("Tả Phù là mùng 1... đến ngày sinh").
      const expectedTamThai = mod12(taPhuIndex(chart.lunarMonth) + (chart.lunarDay - 1));
      const expectedBatToa = mod12(huuBatIndex(chart.lunarMonth) - (chart.lunarDay - 1));

      const result = getTapDieu(chart);
      const byName = (name: string) => result.find((s) => s.name === name)?.chiIndex;

      expect(byName("Ân Quang")).toBe(expectedAnQuang);
      expect(byName("Thiên Quý")).toBe(expectedThienQuy);
      expect(byName("Tam Thai")).toBe(expectedTamThai);
      expect(byName("Bát Tọa")).toBe(expectedBatToa);

      // Đối chiếu trực tiếp với hàm thuần túy (không qua chart) cho cùng input đã tính ở trên.
      expect(anQuangIndex(vanXuongIndex(gioChiIndex), chart.lunarDay)).toBe(expectedAnQuang);
      expect(thienQuyIndex(vanKhucIndex(gioChiIndex), chart.lunarDay)).toBe(expectedThienQuy);
      expect(tamThaiIndex(taPhuIndex(chart.lunarMonth), chart.lunarDay)).toBe(expectedTamThai);
      expect(batToaIndex(huuBatIndex(chart.lunarMonth), chart.lunarDay)).toBe(expectedBatToa);
    });
  }

  // Golden Master: lá số thật "Học Viện Lý Số Nguyên Cát" (hocvienlyso.org) — Nữ Đinh Sửu, DL 31/8/1997
  // giờ Ngọ (ÂL tháng 7 ngày 29) — dùng để PHÁT HIỆN và xác nhận sửa lỗi offset Ân Quang/Thiên Quý (bản
  // đầu dùng lunarDay-1 cho ra Thân/Ngọ, SAI — bản sửa dùng lunarDay-2 cho đúng Mùi/Mùi như lá số mẫu).
  it("GM-TAPDIEU-01 (Nữ Đinh Sửu, 31/8/1997 giờ Ngọ): Ân Quang=Mùi, Thiên Quý=Mùi, Tam Thai=Dần, Bát Tọa=Tý, Thai Phụ=Tý, Phong Cáo=Thân, Thiên Quan=Dần, Thiên Phúc=Hợi, Hoa Cái=Sửu", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1997, hour: 11, gender: "Nữ" });
    const result = getTapDieu(chart);
    const byName = (name: string) => result.find((s) => s.name === name)?.chiIndex;

    expect(byName("Ân Quang")).toBe(CHI.indexOf("Mùi"));
    expect(byName("Thiên Quý")).toBe(CHI.indexOf("Mùi"));
    expect(byName("Tam Thai")).toBe(CHI.indexOf("Dần"));
    expect(byName("Bát Tọa")).toBe(CHI.indexOf("Tý"));
    expect(byName("Thai Phụ")).toBe(CHI.indexOf("Tý"));
    expect(byName("Phong Cáo")).toBe(CHI.indexOf("Thân"));
    expect(byName("Thiên Quan")).toBe(CHI.indexOf("Dần"));
    expect(byName("Thiên Phúc")).toBe(CHI.indexOf("Hợi"));
    expect(byName("Hoa Cái")).toBe(CHI.indexOf("Sửu"));
  });

  // Golden Master 2: lá số thật "Học Viện Lý Số Nguyên Cát" — Nam Ất Tỵ, DL 4/2/2026 giờ Sửu (ÂL 2025
  // tháng 12 ngày 17) — dùng để XÁC NHẬN công thức Đẩu Quân mới (2 bước: nghịch tháng từ Thái Tuế, rồi
  // thuận giờ) và cross-check lại Ân Quang/Tam Thai/Bát Tọa/Thai Phụ/Thiên Quý/Thiên Quan/Thiên Phúc/
  // Phong Cáo trên 1 lá số hoàn toàn khác (Can/Chi/giới tính/mùa sinh khác GM-TAPDIEU-01).
  it("GM-TAPDIEU-02 (Nam Ất Tỵ, 4/2/2026 giờ Sửu): Đẩu Quân=Mùi, Ân Quang=Tý, Tam Thai=Bát Tọa=Thai Phụ=Mùi, Thiên Quý=Dần, Thiên Quan=Thìn, Thiên Phúc=Thân, Phong Cáo=Mão", () => {
    const chart = tinhTuVi({ day: 4, month: 2, year: 2026, hour: 1, gender: "Nam" });
    const result = getTapDieu(chart);
    const byName = (name: string) => result.find((s) => s.name === name)?.chiIndex;

    expect(byName("Đẩu Quân")).toBe(CHI.indexOf("Mùi"));
    expect(byName("Ân Quang")).toBe(CHI.indexOf("Tý"));
    expect(byName("Tam Thai")).toBe(CHI.indexOf("Mùi"));
    expect(byName("Bát Tọa")).toBe(CHI.indexOf("Mùi"));
    expect(byName("Thai Phụ")).toBe(CHI.indexOf("Mùi"));
    expect(byName("Thiên Quý")).toBe(CHI.indexOf("Dần"));
    expect(byName("Thiên Quan")).toBe(CHI.indexOf("Thìn"));
    expect(byName("Thiên Phúc")).toBe(CHI.indexOf("Thân"));
    expect(byName("Phong Cáo")).toBe(CHI.indexOf("Mão"));
  });
});

// ============================================================================================
// PHẦN E3 — Âm Sát (Phase 42, bảng tra Công cung cấp trực tiếp — KHÔNG phải tài liệu Tử Vi Hàm Số hay
// Tam Hợp Phái, cả 2 nguồn đó đều không có công thức cho sao này).
// ============================================================================================
describe("Phase 42 — Âm Sát: bảng tra đủ 12 tháng âm lịch", () => {
  const EXPECTED_BY_MONTH: [number, string][] = [
    [1, "Dần"], [2, "Tý"], [3, "Tuất"], [4, "Thân"], [5, "Ngọ"], [6, "Thìn"],
    [7, "Dần"], [8, "Tý"], [9, "Tuất"], [10, "Thân"], [11, "Ngọ"], [12, "Thìn"],
  ];
  for (const [month, chiName] of EXPECTED_BY_MONTH) {
    it(`Tháng ${month} → ${chiName}`, () => {
      expect(amSatIndex(month)).toBe(CHI.indexOf(chiName));
    });
  }

  // Golden Master do Công cung cấp trực tiếp: lá số Nam Bính Tý, DL 13/8/1996 giờ Ngọ (ÂL tháng 6) →
  // Âm Sát tại Thìn.
  it("GM-AMSAT-01 (Nam Bính Tý, 13/8/1996 giờ Ngọ, tháng 6 âm): Âm Sát = Thìn", () => {
    const chart = tinhTuVi({ day: 13, month: 8, year: 1996, hour: 11, gender: "Nam" });
    expect(chart.lunarMonth).toBe(6);
    const result = getTapDieu(chart);
    expect(result.find((s) => s.name === "Âm Sát")?.chiIndex).toBe(CHI.indexOf("Thìn"));
  });
});

// ============================================================================================
// PHẦN F — Architecture regression: getTapDieu() không mutate chart, không thay đổi Natal Core.
// ============================================================================================
describe("Phase 38 — Architecture regression: Tạp Diệu không thay đổi Natal Core", () => {
  it("chartBefore vs chartAfter: mọi field Natal Core giữ nguyên sau khi gọi getTapDieu() nhiều lần", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });
    const before = JSON.stringify(chart);
    getTapDieu(chart);
    getTapDieu(chart);
    const after = JSON.stringify(chart);
    expect(after).toBe(before);
  });

  it("Không mutate reference của chart.cungs", () => {
    const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" });
    const cungsRefBefore = chart.cungs;
    getTapDieu(chart);
    expect(chart.cungs).toBe(cungsRefBefore);
  });
});
