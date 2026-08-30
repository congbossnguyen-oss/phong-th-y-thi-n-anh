// Port vitest của self_test() trong scripts/engine.py gốc (huyền không phi tinh).
// 4 mốc kiểm chứng bắt buộc PASS (xem TRANG-THAI-MODULE.md mục 3):
//   Tinh bàn 432/432 | Thành Môn 3/3 | Niên tinh 5/5 | Không Vong 8/8
// Dữ liệu đối chiếu copy nguyên văn từ DU_LIEU_KIEM_CHUNG trong engine.py — không tự sửa.

import { describe, expect, it } from "vitest";
import {
  CHIEU_THAN,
  CHINH_LINH_THAN,
  CUNG_INFO,
  SON_24,
  bayTinh,
  canhBaoDaKiep,
  chinhLinhThan,
  kiemTraSon,
  lapTinhBan,
  nhanDienCachCuc,
  nienTinhNhapTrung,
  phanLoaiDoLech,
  phanTichCung,
  thuSonXuatSat,
  timThanhMon,
  tinhToanHuyenKhong,
  vanTuNam,
  xetMoCuaPhu,
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

describe("Chính Thần / Linh Thần / Chiếu Thần — i-thu-son-xuat-sat-cua-chinh-duong-khi.md mục 4", () => {
  it("hợp thập giữa Chính Thần và Linh Thần đúng cho cả 9 vận (Vận 5 bỏ qua vì không có số cố định)", () => {
    for (let van = 1; van <= 9; van++) {
      const [ct, lt] = CHINH_LINH_THAN[van];
      if (lt === null) {
        expect(van).toBe(5);
        continue;
      }
      expect(ct + lt).toBe(10);
    }
  });

  it("Vận 9: Chính Thần ở Nam (Ly), Linh Thần ở Bắc (Khảm) — đúng theo nguồn", () => {
    const kq = chinhLinhThan(9);
    expect(kq.chinh_than_so).toBe(9);
    expect(kq.chinh_than_cung).toBe("Nam");
    expect(kq.linh_than_so).toBe(1);
    expect(kq.linh_than_cung).toBe("Bắc");
  });

  it.each([
    [1, 6], [2, 7], [3, 8], [4, 9], [5, null], [6, 1], [7, 2], [8, 3], [9, 4],
  ] as Array<[number, number | null]>)("Chiếu Thần vận %i = sao %s", (van, mongDoi) => {
    expect(CHIEU_THAN[van]).toBe(mongDoi);
  });
});

describe("Thu Sơn Xuất Sát — Tọa Bính Hướng Nhâm Vận 9 (đối chiếu tinh bàn đã verify ở trên)", () => {
  const tb = lapTinhBan(SON_24["Nhâm"][0], 9);
  const ketQua = thuSonXuatSat(tb);

  it("trả về 8 cung (bỏ Trung Cung)", () => {
    expect(ketQua).toHaveLength(8);
  });

  it("cung Nam (Sơn 9 VƯỢNG, Hướng 9 VƯỢNG) → cả 2 khuyến nghị đều THU SƠN", () => {
    const nam = ketQua.find((k) => k.cung === "Nam")!;
    expect(nam.tt_son).toBe("VƯỢNG");
    expect(nam.tt_huong).toBe("VƯỢNG");
    expect(nam.khuyen_nghi[0]).toMatch(/^THU SƠN/);
    expect(nam.khuyen_nghi[1]).toMatch(/^THU SƠN/);
  });

  it("cung Tây Nam (Sơn 7 TỬ, Hướng 2 TỬ\\/XA) → cả 2 khuyến nghị đều XUẤT SÁT", () => {
    const tayNam = ketQua.find((k) => k.cung === "Tây Nam")!;
    expect(tayNam.khuyen_nghi[0]).toMatch(/^XUẤT SÁT/);
    expect(tayNam.khuyen_nghi[1]).toMatch(/^XUẤT SÁT/);
  });
});

describe("Thành Môn — trường mới (Chân/Giả) nhất quán với engine nội bộ", () => {
  const tb = lapTinhBan(SON_24["Nhâm"][0], 9);
  const ds = timThanhMon(tb);

  it("mỗi mục có son_tinh_tai_do khớp đúng Sơn Bàn tại cung đó", () => {
    for (const tm of ds) {
      const cung = Object.entries(CUNG_INFO).find(([, v]) => v.ten === tm.cung)![0];
      expect(tm.son_tinh_tai_do).toBe(tb.son_ban[Number(cung)]);
    }
  });

  it("Tuất (Tây Bắc, Thành Môn Chính) — sao về không phải vượng tinh 9 → kha_dung=false (điều kiện 1 fail)", () => {
    const tuat = ds.find((tm) => tm.son === "Tuất")!;
    expect(tuat.sao_ve_cung).not.toBe(9);
    expect(tuat.kha_dung).toBe(false);
  });

  it("Sửu (Đông Bắc, Thành Môn Phụ) — cũng không phải vượng tinh 9 → kha_dung=false", () => {
    const suu = ds.find((tm) => tm.son === "Sửu")!;
    expect(suu.sao_ve_cung).not.toBe(9);
    expect(suu.kha_dung).toBe(false);
  });
});

describe("Tách vận nhà vs vận đương lệnh — nhà thoái vận (ca thật anh Công báo 30/8/2026)", () => {
  // Nhà nhập trạch 2003 = Vận 7. Xem trong Vận 9 (hiện tại) → nhà đã thoái vận.
  const vanNha = vanTuNam(2003);
  const vanHienTai = 9;

  it("2003 → Vận nhà = 7", () => {
    expect(vanNha).toBe(7);
  });

  it("tinh bàn vẫn lập theo VẬN NHÀ (7), không đổi theo vận đương lệnh", () => {
    const kq = tinhToanHuyenKhong(SON_24["Mão"][0], vanNha, { vanHienTai });
    // Vận tinh nhập trung = vận nhà 7 (không phải 9)
    expect(kq.tinh_ban.van_ban[5]).toBe(7);
    expect(kq.van_nha).toBe(7);
    expect(kq.van_hien_tai).toBe(9);
    expect(kq.da_thoai_van).toBe(true);
  });

  it("Hướng tinh 7 KHÔNG còn VƯỢNG khi xét theo Vận 9 (nhà Vận 7 đã thoái vận)", () => {
    const tb = lapTinhBan(SON_24["Mão"][0], vanNha);
    // Xét theo vận nhà (cũ, sai): sao 7 = VƯỢNG
    const cungCu = phanTichCung(tb, vanNha);
    const coVuong7Cu = cungCu.some((c) => c.huong_tinh === 7 && c.tt_huong === "VƯỢNG");
    expect(coVuong7Cu).toBe(true);
    // Xét theo vận đương lệnh 9 (đúng): sao 7 KHÔNG được là VƯỢNG ở bất kỳ cung nào
    const cungMoi = phanTichCung(tb, vanHienTai);
    const coVuong7Moi = cungMoi.some((c) => c.huong_tinh === 7 && c.tt_huong === "VƯỢNG");
    expect(coVuong7Moi).toBe(false);
    // Trong Vận 9 chỉ có sao 9 là VƯỢNG
    for (const c of cungMoi) {
      if (c.tt_huong === "VƯỢNG") expect(c.huong_tinh).toBe(9);
      if (c.tt_son === "VƯỢNG") expect(c.son_tinh).toBe(9);
    }
  });

  it("ý nghĩa cặp Vận 9 hiện theo VẬN ĐƯƠNG LỆNH (nhà Vận 7 xem ở Vận 9 vẫn có)", () => {
    const tb = lapTinhBan(SON_24["Mão"][0], vanNha);
    const cungTheoVan9 = phanTichCung(tb, 9);
    expect(cungTheoVan9.some((c) => c.y_nghia_cap !== null)).toBe(true);
    // Nếu (nhầm) xét theo vận nhà 7 thì mục này trống
    const cungTheoVan7 = phanTichCung(tb, 7);
    expect(cungTheoVan7.every((c) => c.y_nghia_cap === null)).toBe(true);
  });

  it("Chính/Linh Thần lấy theo vận đương lệnh (9): Chính Thần Nam, Linh Thần Bắc — không theo vận nhà 7", () => {
    const kq = tinhToanHuyenKhong(SON_24["Mão"][0], vanNha, { vanHienTai: 9 });
    expect(kq.chinh_linh_than.chinh_than_so).toBe(9);
    expect(kq.chinh_linh_than.linh_than_so).toBe(1);
  });

  it("Thu Sơn Xuất Sát xét theo vận đương lệnh (9): chỉ sao 9 (và sinh khí 1) mới được THU SƠN", () => {
    const tb = lapTinhBan(SON_24["Mão"][0], vanNha);
    const tss = thuSonXuatSat(tb, 9);
    for (const t of tss) {
      for (const k of t.khuyen_nghi) {
        if (k.startsWith("THU SƠN")) {
          // THU SƠN chỉ dành cho sao VƯỢNG (9) hoặc SINH (1) trong Vận 9
          const so = Number(k.match(/tinh (\d)/)![1]);
          expect([9, 1]).toContain(so);
        }
      }
    }
  });

  it("nhà ĐÚNG vận hiện tại (Vận 9 nhập trạch 2024): da_thoai_van=false, không tách vận", () => {
    const kq = tinhToanHuyenKhong(SON_24["Mão"][0], 9, { vanHienTai: 9 });
    expect(kq.da_thoai_van).toBe(false);
    expect(kq.van_nha).toBe(9);
    expect(kq.van_hien_tai).toBe(9);
  });

  it("mặc định không truyền vanHienTai → dùng luôn vận nhà (tương thích ngược)", () => {
    const kq = tinhToanHuyenKhong(SON_24["Mão"][0], 7);
    expect(kq.van_hien_tai).toBe(7);
    expect(kq.da_thoai_van).toBe(false);
  });
});

describe("Thành Môn / mở cửa phụ xét theo VẬN HIỆN TẠI (nhà thoái vận) — anh Công 30/8/2026", () => {
  // Nhà Mão hướng, nhập trạch 2003 = Vận 7. Xem ở Vận 9.
  const tb = lapTinhBan(SON_24["Mão"][0], vanTuNam(2003));

  it("mở cửa phụ theo Vận 9: sơn đắc vượng THEO CÔNG THỨC phải là nơi vượng tinh 9 bay về (không phải sao 7)", () => {
    const theoVan9 = xetMoCuaPhu(tb, 9);
    expect(theoVan9.length).toBeGreaterThan(0);
    for (const m of theoVan9.filter((x) => x.dac_vuong)) expect(m.sao_ve_cung).toBe(9);
    // Nếu (nhầm) xét theo vận nhà 7 thì đắc vượng theo công thức là nơi sao 7 bay về.
    const theoVan7 = xetMoCuaPhu(tb, 7);
    for (const m of theoVan7.filter((x) => x.dac_vuong)) expect(m.sao_ve_cung).toBe(7);
  });

  it("Thành Môn: khả dụng xét theo Vận 9 — sao về đúng cung là vượng tinh 9 (dùng vận bàn Vận 9)", () => {
    const tm9 = timThanhMon(tb, 9);
    for (const tm of tm9) {
      // van_tinh trong kết quả lấy từ vận bàn Vận 9, không phải vận bàn Vận 7 của nhà
      if (tm.kha_dung) expect(tm.sao_ve_cung).toBe(9);
    }
  });

  it("nhà đúng vận (Vận 9): mặc định không truyền vanHienTai = xét theo vận nhà, không đổi kết quả", () => {
    const tb9 = lapTinhBan(SON_24["Mão"][0], 9);
    // timThanhMon(tb9) mặc định vanHienTai = tb9.van = 9 → giống timThanhMon(tb9, 9)
    expect(timThanhMon(tb9)).toEqual(timThanhMon(tb9, 9));
    expect(xetMoCuaPhu(tb9)).toEqual(xetMoCuaPhu(tb9, 9));
  });
});

describe("xetMoCuaPhu — ví dụ gốc thanh-mon.md mục 7 (tọa Giáp hướng Canh, Vận 8)", () => {
  const tb = lapTinhBan(SON_24["Canh"][0], 8);

  it("cung Dậu đắc đúng vượng tinh 8 (khớp ví dụ nguồn: 'vượng tinh 8 tới Dậu')", () => {
    const kq = xetMoCuaPhu(tb, 8);
    const dau = kq.find((m) => m.son === "Dậu");
    expect(dau).toBeDefined();
    expect(dau!.sao_ve_cung).toBe(8);
    expect(dau!.dac_vuong).toBe(true);
  });

  it("không bao giờ liệt kê sơn Hướng chính hoặc sơn Tọa (đó là cửa chính/mặt sau, không phải cửa phụ)", () => {
    const kq = xetMoCuaPhu(tb, 8);
    for (const m of kq) {
      expect(m.son).not.toBe(tb.son_huong);
      expect(m.son).not.toBe(tb.son_toa);
    }
  });

  it("bất biến: kha_dung=false luôn đi kèm ít nhất 1 lý do trong canh_bao, kha_dung=true thì canh_bao rỗng", () => {
    for (const van of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const son of Object.keys(SON_24)) {
        const t = lapTinhBan(SON_24[son][0], van);
        for (const m of xetMoCuaPhu(t, van)) {
          expect(m.kha_dung).toBe(m.canh_bao.length === 0);
        }
      }
    }
  });

  it("cung có Hướng tinh thật = Ngũ Hoàng (ngoài Vận 5) luôn bị cảnh báo, dù đắc vượng theo công thức mở cửa phụ", () => {
    for (const van of [1, 2, 3, 4, 6, 7, 8, 9]) {
      for (const son of Object.keys(SON_24)) {
        const t = lapTinhBan(SON_24[son][0], van);
        for (const m of xetMoCuaPhu(t, van)) {
          if (m.huong_tinh_thuc_te === 5) {
            expect(m.kha_dung).toBe(false);
            expect(m.canh_bao.some((c) => c.includes("Ngũ Hoàng"))).toBe(true);
          }
        }
      }
    }
  });

  it("cung có Hướng tinh THẬT đang SUY/TỬ/TỬ-XA luôn bị loại (anh Công 31/8/2026: không tin số cục bộ nếu khí thật đã chết)", () => {
    for (const van of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const son of Object.keys(SON_24)) {
        const t = lapTinhBan(SON_24[son][0], van);
        for (const m of xetMoCuaPhu(t, van)) {
          if (m.tt_huong_tinh === "SUY" || m.tt_huong_tinh === "TỬ" || m.tt_huong_tinh === "TỬ/XA") {
            expect(m.kha_dung).toBe(false);
          }
        }
      }
    }
  });

  it("kha_dung=true chỉ khi Hướng tinh thật đang VƯỢNG hoặc SINH và không phải Ngũ Hoàng thất vận", () => {
    for (const van of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const son of Object.keys(SON_24)) {
        const t = lapTinhBan(SON_24[son][0], van);
        for (const m of xetMoCuaPhu(t, van)) {
          if (m.kha_dung) {
            expect(["VƯỢNG", "SINH"]).toContain(m.tt_huong_tinh);
          }
        }
      }
    }
  });
});

describe("xetMoCuaPhu — liệt kê thêm cung có Hướng tinh THẬT vốn đã vượng/sinh sẵn (anh Công 31/8/2026)", () => {
  it("nhà Đông/2003 xem Vận 9: Bắc (Hướng tinh thật = 9, VƯỢNG) và Nam (= 1, SINH) phải xuất hiện dù không qua công thức mở cửa phụ", () => {
    const tb = lapTinhBan(SON_24["Mão"][0], vanTuNam(2003));
    const kq = xetMoCuaPhu(tb, 9);
    const bac = kq.filter((m) => TEN_TO_CUNG[m.cung_ten] === 1);
    const nam = kq.filter((m) => TEN_TO_CUNG[m.cung_ten] === 9);
    expect(bac.length).toBeGreaterThan(0);
    expect(nam.length).toBeGreaterThan(0);
    for (const m of bac) {
      expect(m.huong_tinh_thuc_te).toBe(9);
      expect(m.tt_huong_tinh).toBe("VƯỢNG");
      expect(m.huong_tinh_da_vuong_sinh_san).toBe(true);
      expect(m.kha_dung).toBe(true);
    }
    for (const m of nam) {
      expect(m.huong_tinh_thuc_te).toBe(1);
      expect(m.tt_huong_tinh).toBe("SINH");
      expect(m.huong_tinh_da_vuong_sinh_san).toBe(true);
      expect(m.kha_dung).toBe(true);
    }
  });

  it("bất biến: huong_tinh_da_vuong_sinh_san=true luôn khớp tt_huong_tinh VƯỢNG/SINH; false thì không", () => {
    for (const van of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const son of Object.keys(SON_24)) {
        const t = lapTinhBan(SON_24[son][0], van);
        for (const m of xetMoCuaPhu(t, van)) {
          expect(m.huong_tinh_da_vuong_sinh_san).toBe(m.tt_huong_tinh === "VƯỢNG" || m.tt_huong_tinh === "SINH");
        }
      }
    }
  });
});

describe("Thất Tinh Đả Kiếp / Tam Ban Xảo Quái — cập nhật 31/8/2026 (k-cac-cach-cuc-tot-nhat.md)", () => {
  it("bất biến: chỉ xuất hiện khi có Song Tinh Đáo Hướng/Tọa; đúng cung đích → đúng tên loại", () => {
    let daThayLy = false, daThayKham = false, daThayXaoQuai = false;
    for (const van of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const son of Object.keys(SON_24)) {
        const tb = lapTinhBan(SON_24[son][0], van);
        const cc = nhanDienCachCuc(tb);
        const laSongTinhHuong = cc.some(([ten]) => ten === "Song Tinh Đáo Hướng");
        const laSongTinhToa = cc.some(([ten]) => ten === "Song Tinh Đáo Tọa");
        const dk = cc.find(([ten]) => ten.includes("ĐẢ KIẾP") || ten.includes("XẢO QUÁI"));

        if (!laSongTinhHuong && !laSongTinhToa) {
          expect(dk).toBeUndefined();
          continue;
        }
        expect(dk).toBeDefined();
        expect(dk![1]).toBe("ĐẠI CÁT — CÓ ĐIỀU KIỆN");
        const cungDich = laSongTinhHuong ? tb.cung_huong : tb.cung_toa;
        if ([9, 3, 6].includes(cungDich)) {
          expect(dk![0]).toBe("LY CUNG ĐẢ KIẾP (ĐẢ KIẾP THẬT)");
          daThayLy = true;
        } else if ([1, 4, 7].includes(cungDich)) {
          expect(dk![0]).toBe("KHẢM CUNG ĐẢ KIẾP (ĐẢ KIẾP GIẢ)");
          daThayKham = true;
        } else {
          expect(dk![0]).toBe("TAM BAN XẢO QUÁI");
          daThayXaoQuai = true;
        }
      }
    }
    // Đảm bảo cả 3 loại đều xuất hiện ít nhất 1 lần trong toàn bộ 216 tổ hợp (van x son) —
    // nếu không thì test trên chỉ đang kiểm chứng nhánh else một cách vô nghĩa.
    expect(daThayLy).toBe(true);
    expect(daThayKham).toBe(true);
    expect(daThayXaoQuai).toBe(true);
  });

  it("canhBaoDaKiep() vẫn trả về ghi chú riêng (CẦN NGƯỜI LUẬN TỰ XÉT) về bộ số tam ban cấu trúc, không phải điều kiện phân biệt Đả Kiếp", () => {
    const [, tc] = canhBaoDaKiep();
    expect(tc).toBe("CẦN NGƯỜI LUẬN TỰ XÉT");
  });
});
