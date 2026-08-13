import { describe, expect, it } from "vitest";
import {
  calculateXuatHanhCaNhanDayBaseScore,
  calculateXuatHanhCaNhanDayPurposeScore,
  calculateXuatHanhCaNhanDayPersonal,
  calculateXuatHanhCaNhanDayScore,
  getXuatHanhCaNhanRating,
  XUAT_HANH_CA_NHAN_PURPOSE_LIST,
  XUAT_HANH_CA_NHAN_TO_GIO_PURPOSE,
} from "../../../src/scoring/xuatHanhCaNhanTongHop.js";
import { GIO_PURPOSE_LIST } from "../../../src/scoring/gioTotTrongNgay.js";
import { getNguoiTuoi } from "../../../src/scoring/tuoiHopLamAn.js";
import type { TrachCatDayBaseInput } from "../../../src/scoring/trachCatDayBase.js";

const NGAY_TOT: TrachCatDayBaseInput = {
  trucName: "Khai",
  hoangDaoHacDao: "hoàng đạo",
  nhiThapBatTuCatHung: "cát",
  thanSat: [],
  nguyetKy: false,
  tamNuong: false,
  duongCongKyNhat: false,
  satChu: false,
  thienDucHop: false,
  thienXa: false,
};

describe("scoring/xuatHanhCaNhanTongHop", () => {
  it("mọi khóa trong XUAT_HANH_CA_NHAN_TO_GIO_PURPOSE đều trỏ tới 1 GioPurpose có thật", () => {
    for (const purpose of XUAT_HANH_CA_NHAN_PURPOSE_LIST) {
      expect(GIO_PURPOSE_LIST).toContain(XUAT_HANH_CA_NHAN_TO_GIO_PURPOSE[purpose]);
    }
  });

  it("điểm nền trong khoảng 0-10", () => {
    const result = calculateXuatHanhCaNhanDayBaseScore(NGAY_TOT);
    expect(result.diem).toBeGreaterThanOrEqual(0);
    expect(result.diem).toBeLessThanOrEqual(10);
  });

  it("thần sát Lộc Mã cộng điểm cho nhóm mục đích di chuyển (XUAT_HANH_CHUNG/DI_XA)", () => {
    const ngayCoLocMa: TrachCatDayBaseInput = { ...NGAY_TOT, thanSat: [{ name: "Lộc Mã", catHung: "cát" }] };
    for (const purpose of ["XUAT_HANH_CHUNG", "DI_XA", "DI_CONG_VIEC", "DI_LAM_AN"] as const) {
      const co = calculateXuatHanhCaNhanDayPurposeScore(ngayCoLocMa, purpose);
      const khong = calculateXuatHanhCaNhanDayPurposeScore(NGAY_TOT, purpose);
      expect(co.diem).toBeGreaterThan(khong.diem);
    }
  });

  it("thần sát Sinh Khí (cầu tài) cộng điểm riêng cho CAU_TAI", () => {
    const ngayCoSinhKhi: TrachCatDayBaseInput = { ...NGAY_TOT, thanSat: [{ name: "Sinh Khí (cầu tài)", catHung: "cát" }] };
    const co = calculateXuatHanhCaNhanDayPurposeScore(ngayCoSinhKhi, "CAU_TAI");
    const khong = calculateXuatHanhCaNhanDayPurposeScore(NGAY_TOT, "CAU_TAI");
    expect(co.diem).toBeGreaterThan(khong.diem);
  });

  it("điểm cá nhân (Ngũ Hành + Can + Chi) trong khoảng 0-10", () => {
    const nguoi = getNguoiTuoi(1996);
    const result = calculateXuatHanhCaNhanDayPersonal(nguoi, "Bính", "Tý");
    expect(result.diem).toBeGreaterThanOrEqual(0);
    expect(result.diem).toBeLessThanOrEqual(10);
  });

  it("Chi ngày Tam Hợp với Chi người cho điểm cá nhân cao hơn Chi ngày Xung", () => {
    // 1996 = Bính Tý -> chi người = Tý. Tam hợp Tý: Thân-Tý-Thìn. Xung Tý: Ngọ.
    const nguoi = getNguoiTuoi(1996);
    expect(nguoi.chi).toBe("Tý");
    const tamHop = calculateXuatHanhCaNhanDayPersonal(nguoi, "Bính", "Thìn");
    const xung = calculateXuatHanhCaNhanDayPersonal(nguoi, "Bính", "Ngọ");
    expect(tamHop.diem).toBeGreaterThan(xung.diem);
  });

  it("phạm đại kỵ (Sát Chủ) bị chặn trần điểm dù mục đích/cá nhân tốt", () => {
    const nguoi = getNguoiTuoi(1996);
    const ngayDaiKy: TrachCatDayBaseInput = { ...NGAY_TOT, satChu: true };
    const ket = calculateXuatHanhCaNhanDayScore(ngayDaiKy, "Bính", "Tý", "XUAT_HANH_CHUNG", nguoi);
    expect(ket.diem).toBeLessThanOrEqual(3);
  });

  it("phân loại đúng ngưỡng", () => {
    expect(getXuatHanhCaNhanRating(9.5)).toBe("rat-tot");
    expect(getXuatHanhCaNhanRating(8.5)).toBe("tot");
    expect(getXuatHanhCaNhanRating(7.5)).toBe("kha-tot");
    expect(getXuatHanhCaNhanRating(5.5)).toBe("co-the-dung");
    expect(getXuatHanhCaNhanRating(3.5)).toBe("khong-thuan");
    expect(getXuatHanhCaNhanRating(1)).toBe("khong-nen-chon");
  });

  it("đủ 12 mục đích đều tính được điểm hợp lệ, không lỗi", () => {
    const nguoi = getNguoiTuoi(1996);
    for (const purpose of XUAT_HANH_CA_NHAN_PURPOSE_LIST) {
      const ket = calculateXuatHanhCaNhanDayScore(NGAY_TOT, "Bính", "Tý", purpose, nguoi);
      expect(ket.diem).toBeGreaterThanOrEqual(0);
      expect(ket.diem).toBeLessThanOrEqual(10);
    }
  });
});
