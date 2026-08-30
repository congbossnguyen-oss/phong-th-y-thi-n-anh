// Port vitest của self_test() trong scripts/engine.py gốc (huyền không phi tinh).
// 4 mốc kiểm chứng bắt buộc PASS (xem TRANG-THAI-MODULE.md mục 3):
//   Tinh bàn 432/432 | Thành Môn 3/3 | Niên tinh 5/5 | Không Vong 8/8
// Dữ liệu đối chiếu copy nguyên văn từ DU_LIEU_KIEM_CHUNG trong engine.py — không tự sửa.

import { describe, expect, it } from "vitest";
import {
  CUNG_INFO,
  SON_24,
  bayTinh,
  kiemTraSon,
  lapTinhBan,
  nienTinhNhapTrung,
  phanLoaiDoLech,
  vanTuNam,
} from "../src/lib/huyen-khong-phi-tinh/engine";

const TEN_TO_CUNG: Record<string, number> = Object.fromEntries(
  Object.entries(CUNG_INFO).map(([k, v]) => [v.ten, Number(k)])
);

// 24 mục vận 9: [tọa, hướng, {vị trí cung: "sơn-hướng"}]
const DU_LIEU_KIEM_CHUNG: Array<[string, string, Record<string, string>]> = [
  ["Bính", "Nhâm", { "Trung Cung": "4-5", "Nam": "9-9", "Tây Nam": "7-2", "Tây": "2-7", "Tây Bắc": "3-6", "Bắc": "8-1", "Đông Bắc": "1-8", "Đông": "6-3", "Đông Nam": "5-4" }],
  ["Ngọ", "Tý", { "Trung Cung": "4-5", "Nam": "8-1", "Tây Nam": "1-8", "Tây": "6-3", "Tây Bắc": "5-4", "Bắc": "9-9", "Đông Bắc": "7-2", "Đông": "2-7", "Đông Nam": "3-6" }],
  ["Đinh", "Quý", { "Trung Cung": "4-5", "Nam": "8-1", "Tây Nam": "1-8", "Tây": "6-3", "Tây Bắc": "5-4", "Bắc": "9-9", "Đông Bắc": "7-2", "Đông": "2-7", "Đông Nam": "3-6" }],
  ["Mùi", "Sửu", { "Trung Cung": "6-3", "Nam": "2-7", "Tây Nam": "9-9", "Tây": "4-5", "Tây Bắc": "5-4", "Bắc": "1-8", "Đông Bắc": "3-6", "Đông": "8-1", "Đông Nam": "7-2" }],
  ["Khôn", "Cấn", { "Trung Cung": "6-3", "Nam": "1-8", "Tây Nam": "3-6", "Tây": "8-1", "Tây Bắc": "7-2", "Bắc": "2-7", "Đông Bắc": "9-9", "Đông": "4-5", "Đông Nam": "5-4" }],
  ["Thân", "Dần", { "Trung Cung": "6-3", "Nam": "1-8", "Tây Nam": "3-6", "Tây": "8-1", "Tây Bắc": "7-2", "Bắc": "2-7", "Đông Bắc": "9-9", "Đông": "4-5", "Đông Nam": "5-4" }],
  ["Canh", "Giáp", { "Trung Cung": "2-7", "Nam": "7-2", "Tây Nam": "5-4", "Tây": "9-9", "Tây Bắc": "1-8", "Bắc": "6-3", "Đông Bắc": "8-1", "Đông": "4-5", "Đông Nam": "3-6" }],
  ["Dậu", "Mão", { "Trung Cung": "2-7", "Nam": "6-3", "Tây Nam": "8-1", "Tây": "4-5", "Tây Bắc": "3-6", "Bắc": "7-2", "Đông Bắc": "5-4", "Đông": "9-9", "Đông Nam": "1-8" }],
  ["Tân", "Ất", { "Trung Cung": "2-7", "Nam": "6-3", "Tây Nam": "8-1", "Tây": "4-5", "Tây Bắc": "3-6", "Bắc": "7-2", "Đông Bắc": "5-4", "Đông": "9-9", "Đông Nam": "1-8" }],
  ["Tuất", "Thìn", { "Trung Cung": "1-8", "Nam": "5-4", "Tây Nam": "7-2", "Tây": "3-6", "Tây Bắc": "2-7", "Bắc": "6-3", "Đông Bắc": "4-5", "Đông": "8-1", "Đông Nam": "9-9" }],
  ["Càn", "Tốn", { "Trung Cung": "1-8", "Nam": "6-3", "Tây Nam": "4-5", "Tây": "8-1", "Tây Bắc": "9-9", "Bắc": "5-4", "Đông Bắc": "7-2", "Đông": "3-6", "Đông Nam": "2-7" }],
  ["Hợi", "Tỵ", { "Trung Cung": "1-8", "Nam": "6-3", "Tây Nam": "4-5", "Tây": "8-1", "Tây Bắc": "9-9", "Bắc": "5-4", "Đông Bắc": "7-2", "Đông": "3-6", "Đông Nam": "2-7" }],
  ["Nhâm", "Bính", { "Trung Cung": "5-4", "Nam": "9-9", "Tây Nam": "2-7", "Tây": "7-2", "Tây Bắc": "6-3", "Bắc": "1-8", "Đông Bắc": "8-1", "Đông": "3-6", "Đông Nam": "4-5" }],
  ["Tý", "Ngọ", { "Trung Cung": "5-4", "Nam": "1-8", "Tây Nam": "8-1", "Tây": "3-6", "Tây Bắc": "4-5", "Bắc": "9-9", "Đông Bắc": "2-7", "Đông": "7-2", "Đông Nam": "6-3" }],
  ["Quý", "Đinh", { "Trung Cung": "5-4", "Nam": "1-8", "Tây Nam": "8-1", "Tây": "3-6", "Tây Bắc": "4-5", "Bắc": "9-9", "Đông Bắc": "2-7", "Đông": "7-2", "Đông Nam": "6-3" }],
  ["Sửu", "Mùi", { "Trung Cung": "3-6", "Nam": "7-2", "Tây Nam": "9-9", "Tây": "5-4", "Tây Bắc": "4-5", "Bắc": "8-1", "Đông Bắc": "6-3", "Đông": "1-8", "Đông Nam": "2-7" }],
  ["Cấn", "Khôn", { "Trung Cung": "3-6", "Nam": "8-1", "Tây Nam": "6-3", "Tây": "1-8", "Tây Bắc": "2-7", "Bắc": "7-2", "Đông Bắc": "9-9", "Đông": "5-4", "Đông Nam": "4-5" }],
  ["Dần", "Thân", { "Trung Cung": "3-6", "Nam": "8-1", "Tây Nam": "6-3", "Tây": "1-8", "Tây Bắc": "2-7", "Bắc": "7-2", "Đông Bắc": "9-9", "Đông": "5-4", "Đông Nam": "4-5" }],
  ["Giáp", "Canh", { "Trung Cung": "7-2", "Nam": "2-7", "Tây Nam": "4-5", "Tây": "9-9", "Tây Bắc": "8-1", "Bắc": "3-6", "Đông Bắc": "1-8", "Đông": "5-4", "Đông Nam": "6-3" }],
  ["Mão", "Dậu", { "Trung Cung": "7-2", "Nam": "3-6", "Tây Nam": "1-8", "Tây": "5-4", "Tây Bắc": "6-3", "Bắc": "2-7", "Đông Bắc": "4-5", "Đông": "9-9", "Đông Nam": "8-1" }],
  ["Ất", "Tân", { "Trung Cung": "7-2", "Nam": "3-6", "Tây Nam": "1-8", "Tây": "5-4", "Tây Bắc": "6-3", "Bắc": "2-7", "Đông Bắc": "4-5", "Đông": "9-9", "Đông Nam": "8-1" }],
  ["Thìn", "Tuất", { "Trung Cung": "8-1", "Nam": "4-5", "Tây Nam": "2-7", "Tây": "6-3", "Tây Bắc": "7-2", "Bắc": "3-6", "Đông Bắc": "5-4", "Đông": "1-8", "Đông Nam": "9-9" }],
  ["Tốn", "Càn", { "Trung Cung": "8-1", "Nam": "3-6", "Tây Nam": "5-4", "Tây": "1-8", "Tây Bắc": "9-9", "Bắc": "4-5", "Đông Bắc": "2-7", "Đông": "6-3", "Đông Nam": "7-2" }],
  ["Tỵ", "Hợi", { "Trung Cung": "8-1", "Nam": "3-6", "Tây Nam": "5-4", "Tây": "1-8", "Tây Bắc": "9-9", "Bắc": "4-5", "Đông Bắc": "2-7", "Đông": "6-3", "Đông Nam": "7-2" }],
];

describe("Tinh bàn 24 sơn hướng Vận 9 — đối chiếu g-tinh-ban-24-son-huong-van9.md", () => {
  let dung = 0;
  let tong = 0;

  for (const [toa, huong, mongDoi] of DU_LIEU_KIEM_CHUNG) {
    it(`Tọa ${toa} Hướng ${huong} — khớp 9/9 cung (sơn + hướng)`, () => {
      const doHuong = SON_24[huong][0];
      const tb = lapTinhBan(doHuong, 9);
      expect(tb.son_toa).toBe(toa);

      for (const [vt, cap] of Object.entries(mongDoi)) {
        const c = TEN_TO_CUNG[vt];
        const [sExp, hExp] = cap.split("-").map(Number);
        tong += 2;
        if (tb.son_ban[c] === sExp) dung++;
        else expect(tb.son_ban[c], `${toa}/${huong} ${vt} sơn`).toBe(sExp);
        if (tb.huong_ban[c] === hExp) dung++;
        else expect(tb.huong_ban[c], `${toa}/${huong} ${vt} hướng`).toBe(hExp);
      }
    });
  }

  it("tổng kết: 432/432 điểm khớp (100%)", () => {
    expect(tong).toBe(432);
    expect(dung).toBe(432);
  });
});

describe("Thành Môn — 3 ví dụ gốc trong sách Văn Hoài", () => {
  it("Vận 8, sơn Tý: vận tinh 4, bay thuận, KHÔNG đắc vượng", () => {
    const vb8 = bayTinh(8, true);
    const kt = kiemTraSon("Tý", 8, vb8);
    expect(kt.van_tinh).toBe(4);
    expect(kt.chieu).toBe("thuận");
    expect(kt.dac_vuong).toBe(false);
  });

  it("Vận 9, sơn Tý: vận tinh 5, bay nghịch, sao 9 về (đắc vượng)", () => {
    const vb9 = bayTinh(9, true);
    const kt = kiemTraSon("Tý", 9, vb9);
    expect(kt.van_tinh).toBe(5);
    expect(kt.chieu).toBe("nghịch");
    expect(kt.sao_ve_cung).toBe(9);
  });

  it("Vận 8, sơn Dậu: vận tinh 1, bay nghịch, vượng khí 8 tới", () => {
    const vb8 = bayTinh(8, true);
    const kt = kiemTraSon("Dậu", 8, vb8);
    expect(kt.van_tinh).toBe(1);
    expect(kt.chieu).toBe("nghịch");
    expect(kt.sao_ve_cung).toBe(8);
  });
});

describe("Niên tinh nhập trung — 3 mốc lịch sử Tứ Bạch Quyết + 2 mốc gần đây", () => {
  it.each([
    [1870, 4],
    [1930, 7],
    [1992, 8],
    [2024, 3],
    [2026, 1],
  ])("năm %i -> niên tinh %i", (nam, mongDoi) => {
    expect(nienTinhNhapTrung(nam)).toBe(mongDoi);
  });
});

describe("vanTuNam — Tam Nguyên Cửu Vận suy từ năm nhập trạch", () => {
  it.each([
    [1864, 1], [1883, 1],
    [1884, 2],
    [1944, 5],
    [1984, 7],
    [2004, 8], [2023, 8],
    [2024, 9], [2043, 9],
    [2044, 1], // chu kỳ mới
    [1863, 9], [1844, 9], // trước mốc gốc — vẫn phải quay vòng đúng
  ] as Array<[number, number]>)("năm %i -> vận %i", (nam, mongDoi) => {
    expect(vanTuNam(nam)).toBe(mongDoi);
  });
});

describe("Phân loại Không Vong — 8 ca biên", () => {
  it.each([
    [165.0, "CHÍNH HƯỚNG", "đúng tâm sơn Bính"],
    [168.0, "CHÍNH HƯỚNG", "lệch 3° — vẫn thuần khí"],
    [170.0, "KIÊM HƯỚNG", "lệch 5° — kiêm sang Ngọ"],
    [172.5, "TIỂU KHÔNG VONG", "lằn ranh Bính|Ngọ, CÙNG cung Ly"],
    [157.5, "ĐẠI KHÔNG VONG", "ranh giới cung Tốn|Ly"],
    [22.5, "ĐẠI KHÔNG VONG", "ranh giới cung Khảm|Cấn"],
    [352.5, "TIỂU KHÔNG VONG", "lằn ranh Nhâm|Tý, CÙNG cung Khảm"],
    [337.5, "ĐẠI KHÔNG VONG", "ranh giới cung Càn|Khảm"],
  ] as Array<[number, string, string]>)("%s° -> %s (%s)", (do_, mong) => {
    expect(phanLoaiDoLech(do_).loai).toBe(mong);
  });
});
