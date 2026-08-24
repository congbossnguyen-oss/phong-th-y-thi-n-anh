// Kiểm tra pipeline đầy đủ `tinhVanKhi()` (src/lib/quan-su/luan-van-khi/index.ts) — SPEC.md §6 output.
//
// Môi trường test KHÔNG có ANTHROPIC_API_KEY (kiểm tra thật ở đầu file) → lời luận luôn đi qua đường
// câu mẫu an toàn (mauCauAnToan), tự động thỏa luôn SPEC §7 case 1/2 qua đường THẬT của pipeline
// (không chỉ test hàm mauCauAnToan() đơn lẻ như tests/luan-van-khi-an-toan.test.ts).
import { describe, expect, it } from "vitest";
import { coAnthropicApiKey } from "../src/lib/chart-profile/api-key";
import { tinhVanKhi } from "../src/lib/quan-su/luan-van-khi/index";
import { TU_KHOA_CAM_TUYET_DOI } from "../src/lib/quan-su/luan-van-khi/an-toan-noi-dung";

const NGUOI_MAU = { day: 15, month: 6, year: 1990, hour: 10, gender: "Nam" as const, nowYear: 2026 };

describe("tinhVanKhi() — pipeline đầy đủ", () => {
  it("môi trường test không có ANTHROPIC_API_KEY (đảm bảo các case dưới đi qua đường fallback an toàn)", () => {
    expect(coAnthropicApiKey()).toBe(false);
  });

  it("trả đủ cấu trúc VanKhiOutput: laSo, vuongSuyGoc, dungThanGoc, 10 Đại Vận, disclaimer", async () => {
    const out = await tinhVanKhi(NGUOI_MAU);
    expect(out.laSo.nhatChu).toBe("Tân");
    expect(out.laSo.nhatChuHanh).toBe("Kim");
    expect(out.laSo.gioSinhKnown).toBe(true);
    expect(out.vuongSuyGoc.capDo).toBe("Nhược");
    expect(out.vuongSuyGoc.nhom).toBe(2);
    expect(out.dungThanGoc.dungThan).toBe("Thổ");
    expect(out.danhSachDaiVan).toHaveLength(10);
    expect(out.disclaimer.length).toBeGreaterThan(20);
    for (const dv of out.danhSachDaiVan) {
      expect(dv.tongQuan).toHaveLength(4);
    }
  });

  it("chỉ Đại Vận đang chọn (chiTietDaiVanIndex) có đủ 10 Lưu Niên; các Đại Vận khác để trống", async () => {
    const out = await tinhVanKhi(NGUOI_MAU);
    out.danhSachDaiVan.forEach((dv, i) => {
      if (i === out.chiTietDaiVanIndex) expect(dv.luuNien).toHaveLength(10);
      else expect(dv.luuNien).toHaveLength(0);
    });
  });

  it("mỗi Lưu Niên có đủ lời luận 4 lĩnh vực, KHÔNG chứa bất kỳ từ cấm nào (đường fallback thật, không mock)", async () => {
    const out = await tinhVanKhi(NGUOI_MAU);
    const dv = out.danhSachDaiVan[out.chiTietDaiVanIndex]!;
    for (const ln of dv.luuNien) {
      expect(ln.loiLuanTuAI).toBe(false); // không có API key → chắc chắn dùng câu mẫu
      for (const lv of ["tai_van", "quan_van", "suc_khoe", "tinh_duyen"] as const) {
        const cau = ln.loiLuan[lv];
        expect(cau.length).toBeGreaterThan(0);
        for (const tu of TU_KHOA_CAM_TUYET_DOI) expect(cau).not.toContain(tu);
      }
    }
  });

  it("không có giờ sinh → vẫn chạy được (dùng 12h mặc định), gắn cờ gioSinhKnown=false", async () => {
    const out = await tinhVanKhi({ day: 15, month: 6, year: 1990, gender: "Nam", nowYear: 2026 });
    expect(out.laSo.gioSinhKnown).toBe(false);
    expect(out.danhSachDaiVan).toHaveLength(10);
  });

  it("có thể chọn Đại Vận khác để xem chi tiết qua chiTietDaiVanIndex", async () => {
    const out = await tinhVanKhi({ ...NGUOI_MAU, chiTietDaiVanIndex: 2 });
    expect(out.chiTietDaiVanIndex).toBe(2);
    expect(out.danhSachDaiVan[2]!.luuNien).toHaveLength(10);
    expect(out.danhSachDaiVan[0]!.luuNien).toHaveLength(0);
  });
});
