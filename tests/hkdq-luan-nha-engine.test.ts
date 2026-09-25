/**
 * Test engine Luận Nhà HKĐQ (Bước 0–8). Đối chiếu 4 ca thật trong `data/vi-du-tham-khao.md`
 * (VD1 140°, VD3 180° biên Càn/Cấu, VD4 253° biên Hoán/Khảm, case Chương I quẻ Cổ/Thăng) +
 * bảng Vận + Chính/Linh Thần + hợp thập + các chỗ "thiếu dữ liệu" phải để null (không đoán).
 *
 * Chạy: npx vitest run tests/hkdq-luan-nha-engine.test.ts
 */
import { describe, expect, it } from "vitest";
import { XemNgayCaoCap } from "@thien-anh/rule-engine";
import {
  chinhLinhThan,
  lapQuaiToaHuong,
  luanNha,
  xacDinhVan,
  xetCua,
  NGUONG_KHONG_VONG_DEFAULT,
} from "../src/lib/hkdq-luan-nha/engine";

describe("Tái sử dụng bảng 64 quẻ từ rule-engine (không viết lại)", () => {
  it("bảng có đúng 64 quẻ, mỗi quẻ 5.625°", () => {
    expect(XemNgayCaoCap.BANG_64_QUE_MASTER.length).toBe(64);
    expect(XemNgayCaoCap.DO_RONG_MOI_QUE).toBeCloseTo(5.625, 6);
  });
});

describe("Bước 1 — xacDinhVan (Nhị Nguyên Bát Vận)", () => {
  it("2026 → Vận 9, Hạ Nguyên, Càn", () => {
    const { out, trongBang } = xacDinhVan(2026);
    expect(trongBang).toBe(true);
    expect(out).toMatchObject({ so: 9, nguyen: "ha", quaiChuVan: "Càn", namBatDau: 2017, namKetThuc: 2043 });
  });
  it("2003 → Vận 8 Chấn; 1976 → Vận 7 Khảm; 1930 → Vận 4 Thượng Đoài", () => {
    expect(xacDinhVan(2003).out).toMatchObject({ so: 8, quaiChuVan: "Chấn", nguyen: "ha" });
    expect(xacDinhVan(1976).out).toMatchObject({ so: 7, quaiChuVan: "Khảm" });
    expect(xacDinhVan(1930).out).toMatchObject({ so: 4, quaiChuVan: "Đoài", nguyen: "thuong" });
  });
  it("Vận 3 (1906–1929): số Vận có, nhưng tên quẻ chủ vận = null (KHÔNG bịa)", () => {
    const { out } = xacDinhVan(1912);
    expect(out.so).toBe(3);
    expect(out.quaiChuVan).toBeNull();
  });
  it("ngoài bảng (1850, 2044) → trongBang=false, so=null", () => {
    expect(xacDinhVan(1850).trongBang).toBe(false);
    expect(xacDinhVan(2044).out.so).toBeNull();
  });
});

describe("Bước 3 — chinhLinhThan (2 nhóm cố định, đã xác nhận qua la kinh)", () => {
  it("Vận 9 (nhóm B): Khí 6/7/8/9 = Chính Thần; 1/2/3/4 = Linh Thần", () => {
    for (const k of [6, 7, 8, 9]) expect(chinhLinhThan(9, k)).toBe("chinh_than");
    for (const k of [1, 2, 3, 4]) expect(chinhLinhThan(9, k)).toBe("linh_than");
  });
  it("Vận 4 (nhóm A): đảo lại — 1/2/3/4 = Chính Thần", () => {
    for (const k of [1, 2, 3, 4]) expect(chinhLinhThan(4, k)).toBe("chinh_than");
    for (const k of [6, 7, 8, 9]) expect(chinhLinhThan(4, k)).toBe("linh_than");
  });
});

describe("Bước 2 — lapQuaiToaHuong khớp tên quẻ + Quái Vận với 4 ca tham khảo", () => {
  const n = NGUONG_KHONG_VONG_DEFAULT;
  it("VD4: 253° = Hoán (Quái Vận 6); 253.2° = Khảm (Quái Vận 1)", () => {
    expect(lapQuaiToaHuong(253, 253, n).toa).toMatchObject({ que: "Hoán", quaiVan: 6 });
    expect(lapQuaiToaHuong(253.2, 253.2, n).toa).toMatchObject({ que: "Khảm", quaiVan: 1 });
  });
  it("VD1: 140° = Thái (Quái Vận 9)", () => {
    expect(lapQuaiToaHuong(140, 140, n).toa).toMatchObject({ que: "Thái", quaiVan: 9 });
  });
  it("Case Chương I: 216° = Cổ (Quái Vận 7); 221° = Thăng (Quái Vận 2)", () => {
    expect(lapQuaiToaHuong(216, 216, n).toa).toMatchObject({ que: "Cổ", quaiVan: 7 });
    expect(lapQuaiToaHuong(221, 221, n).toa).toMatchObject({ que: "Thăng", quaiVan: 2 });
  });
});

describe("Bước 7 — không vong (đối chiếu VD3 180° + VD4 253°)", () => {
  it("VD4 253° (Tọa) sát biên Hoán/Khảm, khác Quái Vận, không hợp thập → gần như không hóa giải", () => {
    const kq = luanNha({ toaDo: 253, huongDo: 70, namLuanHienTai: 2026 });
    expect(kq.cachCucDacBiet.khongVong?.phamPhai).toBe(true);
    expect(kq.cachCucDacBiet.khongVong?.viTri).toContain("toa");
    expect(kq.cachCucDacBiet.khongVong?.moTa).toContain("Hoán");
    expect(kq.cachCucDacBiet.khongVong?.moTa).toContain("Khảm");
    expect(kq.cachCucDacBiet.khongVong?.moTa).toContain("không hóa giải");
  });
  it("VD3 180° = ĐẠI KHÔNG VONG biên Càn/Cấu", () => {
    const kq = luanNha({ toaDo: 180, huongDo: 70, namLuanHienTai: 2026 });
    const mo = kq.cachCucDacBiet.khongVong?.moTa ?? "";
    expect(kq.cachCucDacBiet.khongVong?.phamPhai).toBe(true);
    expect(mo).toContain("ĐẠI KHÔNG VONG");
    expect(mo).toContain("Càn");
    expect(mo).toContain("Cấu");
  });
});

describe("Bước 7 — hợp thập (Quái Khí Tọa + Hướng = 10)", () => {
  it("Tọa Ly 75° (Khí 3) + Hướng Khảm 255° (Khí 7) → hợp thập", () => {
    const kq = luanNha({ toaDo: 75, huongDo: 255, namLuanHienTai: 2026 });
    expect(kq.toa).toMatchObject({ que: "Ly", quaiKhi: 3 });
    expect(kq.huong).toMatchObject({ que: "Khảm", quaiKhi: 7 });
    expect(kq.cachCucDacBiet.hopThap).toMatchObject({ co: true, tong: 10 });
    // Vận 9: Tọa Khí 3 = Linh Thần (suy); Hướng Khí 7 = Chính Thần (vượng)
    expect(kq.toa.chinhLinhThan).toBe("linh_than");
    expect(kq.huong.chinhLinhThan).toBe("chinh_than");
    expect(kq.tongHop.some((t) => t.yeuTo === "toa_huong" && t.mucDo === "vuong")).toBe(true);
  });
});

describe("Bước 5 — cửa: thuần/tạp khí theo soCanhMo (heuristic có ghi chú)", () => {
  const cua = xetCua(
    [
      { ten: "2canh_bien", doSo: 135, soCanhMo: 2 },
      { ten: "1canh_bien", doSo: 135, soCanhMo: 1 },
      { ten: "2canh_giua", doSo: 100, soCanhMo: 2 },
      { ten: "thieu_canh", doSo: 216, soCanhMo: null },
    ],
    9,
    NGUONG_KHONG_VONG_DEFAULT,
  );
  it("2 cánh sát biên 135° → tạp, chạm thêm quẻ Lý", () => {
    expect(cua[0]).toMatchObject({ khiChat: "tap" });
    expect(cua[0].queLienQuan).toContain("Lý");
  });
  it("1 cánh → thuần; 2 cánh giữa quẻ → thuần", () => {
    expect(cua[1].khiChat).toBe("thuan");
    expect(cua[2].khiChat).toBe("thuan");
  });
  it("thiếu soCanhMo → khong_xac_dinh (không đoán)", () => {
    expect(cua[3].khiChat).toBe("khong_xac_dinh");
  });
});

describe("Bước 6 — nội cục chỉ chạy khi có mục đích cụ thể (khác tong_quat)", () => {
  const noiCuc = [{ loai: "bep" as const, doSo: 120 }];
  it("tong_quat → bỏ qua nội cục (null) + ghi thieuDuLieu", () => {
    const kq = luanNha({ toaDo: 75, huongDo: 255, namLuanHienTai: 2026, noiCuc, mucDichLuan: "tong_quat" });
    expect(kq.noiCuc).toBeNull();
    expect(kq.thieuDuLieu.some((t) => t.buoc === 6)).toBe(true);
  });
  it("tai_loc → có tính nội cục", () => {
    const kq = luanNha({ toaDo: 75, huongDo: 255, namLuanHienTai: 2026, noiCuc, mucDichLuan: "tai_loc" });
    expect(kq.noiCuc?.length).toBe(1);
    expect(kq.noiCuc?.[0]).toMatchObject({ loai: "bep", que: "Khuê" });
  });
});

describe("Không đoán — các chỗ thiếu dữ liệu để null + nguồn = engine", () => {
  const kq = luanNha({ toaDo: 75, huongDo: 255, namLuanHienTai: 2026 });
  it("Thất Tinh Đả Kiếp = null (thiếu cấu trúc hào); Phản/Phục Ngâm, Đồng Nguyên Long = null", () => {
    expect(kq.cachCucDacBiet.thatTinhDaKiep.co).toBeNull();
    expect(kq.cachCucDacBiet.thatTinhDaKiep.lyDoKhongTinhDuoc).toContain("hào");
    expect(kq.cachCucDacBiet.phanNgam).toBeNull();
    expect(kq.cachCucDacBiet.phucNgam).toBeNull();
    expect(kq.cachCucDacBiet.dongNguyenLong).toBeNull();
  });
  it("Field reserved (SPEC mục 8): haoCauTruc, soanTaiQuanNiem = null; nguon = engine", () => {
    expect(kq.toa.haoCauTruc).toBeNull();
    expect(kq.soanTaiQuanNiem).toBeNull();
    expect(kq.nguon).toBe("engine");
  });
});

describe("Bước 1 tham số hóa năm luận + validate", () => {
  it("namLuanHienTai=1912 → Vận 3, quaiChuVan null, có thieuDuLieu Vận 3", () => {
    const kq = luanNha({ toaDo: 75, huongDo: 255, namLuanHienTai: 1912 });
    expect(kq.van.so).toBe(3);
    expect(kq.van.quaiChuVan).toBeNull();
    expect(kq.thieuDuLieu.some((t) => t.buoc === 1)).toBe(true);
  });
  it("thiếu toaDo → ném lỗi (Bước 0 chặn)", () => {
    // @ts-expect-error thiếu trường bắt buộc để test validate
    expect(() => luanNha({ huongDo: 100 })).toThrow();
  });
});
