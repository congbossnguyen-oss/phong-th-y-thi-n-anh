import { describe, it, expect } from "vitest";
import {
  xacDinhVuongSuy,
  calculateKhaiTruongCaoCapScore,
  type NguoiChuKhaiTruong,
} from "../../../src/scoring/ngayKhaiTruongCaoCap.js";
import { tinhThapThan } from "../../../src/scoring/kyHopDongCaoCap.js";
import { calculateKhaiTruongScore, type KhaiTruongResult } from "../../../src/scoring/ngayKhaiTruong.js";
import type { Data } from "@thien-anh/calendar-core";

// Nền tối giản để test lớp Bát Tự (không phụ thuộc thần sát cụ thể).
const NEN_INPUT = {
  trucName: "Định", hoangDaoHacDao: "hoàng đạo" as const, nhiThapBatTuCatHung: "cát" as const,
  thanSat: [], nguyetKy: false, tamNuong: false, duongCongKyNhat: false, satChu: false,
  thienDucHop: false, thienXa: false,
};
function nen(dayCan: Data.Can, dayChi: Data.Chi): KhaiTruongResult {
  return calculateKhaiTruongScore(NEN_INPUT, dayCan, dayChi, "Kim");
}

describe("Lõi 1 — Thập Thần (tinhThapThan tái dùng)", () => {
  it("Nhật Chủ Ất, ngày Mậu → Chính Tài (Thê Tài, cầu tài)", () => {
    expect(tinhThapThan("Ất", "Mậu")).toBe("Chính Tài");
  });
  it("Nhật Chủ Ất, ngày Đinh → Thực Thần (sinh Tài)", () => {
    expect(tinhThapThan("Ất", "Đinh")).toBe("Thực Thần");
  });
});

describe("Lõi 3 — vượng suy (điểm ngũ hành có trọng số)", () => {
  it("thiếu giờ sinh → trả null (KHÔNG đoán vượng suy)", () => {
    const r = xacDinhVuongSuy({ canNam: "Ất", chiNam: "Sửu", canThang: "Mậu", chiThang: "Dần", canNgay: "Ất", chiNgay: "Dậu" });
    expect(r).toBeNull();
  });
  it("đủ 4 trụ → xác định vượng/nhược + tỷ lệ", () => {
    const r = xacDinhVuongSuy({ canNam: "Ất", chiNam: "Sửu", canThang: "Nhâm", chiThang: "Ngọ", canNgay: "Ất", chiNgay: "Dậu", canGio: "Tân", chiGio: "Tỵ" })!;
    expect(["vượng", "nhược"]).toContain(r.vuongSuy);
    expect(r.tyLePheNhatChu).toBeGreaterThanOrEqual(0);
    expect(r.tyLePheNhatChu).toBeLessThanOrEqual(1);
  });
});

describe("BAO TRÙM — không nhập tuổi chủ thì tổng = nền (100% bản thường)", () => {
  it("nguoiChu = null → diemTong === diemNen === base.diem", () => {
    const base = nen("Mậu", "Tý");
    const r = calculateKhaiTruongCaoCapScore(base, "Mậu", "Tý", null);
    expect(r.hasBatTu).toBe(false);
    expect(r.diemNen).toBe(base.diem);
    expect(r.diemTong).toBe(base.diem);
  });
});

describe("Lõi 3 định hướng — thân nhược ưu Thực Thương hơn Tài thuần", () => {
  const chuNhuoc = (vs: "vượng" | "nhược" | null): NguoiChuKhaiTruong => ({
    canNhatChu: "Ất", chiNamSinh: "Sửu", chiNgaySinh: "Hợi", vuongSuy: vs,
  });
  it("thân nhược: điểm ngày Thực Thần (Đinh) ≥ điểm ngày Chính Tài (Mậu)", () => {
    const bt = calculateKhaiTruongCaoCapScore(nen("Đinh", "Mão"), "Đinh", "Mão", chuNhuoc("nhược")); // Thực Thần
    const tai = calculateKhaiTruongCaoCapScore(nen("Mậu", "Mão"), "Mậu", "Mão", chuNhuoc("nhược")); // Chính Tài
    expect(bt.loi1Diem!).toBeGreaterThanOrEqual(tai.loi1Diem!);
  });
  it("thiếu giờ (vượng suy null) → Lõi 3 không chạy + báo thiếu dữ liệu", () => {
    const r = calculateKhaiTruongCaoCapScore(nen("Mậu", "Mão"), "Mậu", "Mão", chuNhuoc(null));
    expect(r.loi3ApDung).toBe(false);
    expect(r.thieuDuLieu.some((s) => s.includes("Lõi 3"))).toBe(true);
  });
});

describe("Lõi 2 — quan hệ Nhật Chi (Chi năm KHÔNG lặp)", () => {
  const chu: NguoiChuKhaiTruong = { canNhatChu: "Giáp", chiNamSinh: "Tý", chiNgaySinh: "Ngọ", vuongSuy: null };
  it("ngày Xung Nhật Chi (Tý xung Ngọ) → điểm Lõi 2 thấp hơn ngày hợp", () => {
    const xung = calculateKhaiTruongCaoCapScore(nen("Giáp", "Tý"), "Giáp", "Tý", chu); // Tý xung Ngọ (nhật chi)
    const hop = calculateKhaiTruongCaoCapScore(nen("Giáp", "Mùi"), "Giáp", "Mùi", chu); // Mùi lục hợp Ngọ
    expect(xung.loi2Diem).toBeLessThan(hop.loi2Diem);
  });
});
