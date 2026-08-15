/**
 * CHỌN NGÀY & GIỜ XUẤT HÀNH CÁ NHÂN – TỔNG HỢP TRẠCH CÁT — lớp ĐIỂM NGÀY của module tổng hợp
 * (`XUAT_HANH_CA_NHAN_TONG_HOP`). Lớp ĐIỂM GIỜ tái dùng nguyên `calculateHourScore` của
 * `gioTotTrongNgay.ts` (đã có Tiểu Lục Nhâm + Hoàng Đạo giờ + Giờ↔người + mục đích, đã kiểm
 * thử qua ~9 module khác) — KHÔNG viết lại ở đây để tránh rủi ro hồi quy trên các module đang
 * dùng chung hàm đó. Việc gộp dayScore + hourScore + hướng thành finalScore nằm ở tầng
 * trachnhat-engine (`processing/xuatHanhCaNhanTongHop.ts`), vì cần dữ liệu Can/Chi giờ theo
 * từng ngày cụ thể.
 *
 * ⚠️ Đặc tả gốc (mục 8) đưa ra ví dụ ưu tiên NGÀY bằng tên Tiểu Lục Nhâm ("Tiểu Cát", "Tốc Hỷ").
 * Trong hệ thống này, Tiểu Lục Nhâm CHỈ tồn tại ở cấp độ GIỜ (`getTieuLucNham` cần tháng/ngày âm
 * + chi giờ) — không có "Tiểu Lục Nhâm theo ngày". Vì vậy lớp Ngày↔Mục đích ở đây dùng đúng kiến
 * trúc đã thống nhất toàn hệ thống: ưu tiên Trực + thần sát cát theo mục đích (giống
 * `ngayKhaiQuang.ts`), còn Tiểu Lục Nhâm áp dụng đúng ở lớp Giờ (mục 9-10 của đặc tả) — không
 * suy diễn thêm 1 bảng ngày mới không có nguồn.
 *
 * ⚠️ "Hướng Thần Tài/Hỷ Thần/Quý Thần theo ngày" (mục 13) KHÔNG có bảng xác thực trong hệ thống
 * — chỉ tính được Hướng↔Người qua Cung Mệnh Bát Trạch (`huongXuatHanh.ts`). Bỏ qua phần thần sát
 * phương vị chưa có dữ liệu, đúng nguyên tắc "không tự bịa dữ liệu còn thiếu" (mục 33).
 */
import {
  tinhQuanHeCan,
  tinhQuanHeChi,
  tinhQuanHeNguHanh,
  type CanRelationRules,
  type CanRelationResult,
  type ChiRelationRules,
  type ChiRelationResult,
  type NguHanhRelationRules,
  type NguHanhRelationResult,
  nguHanhCuaChi,
} from "./canChiRelationScoring.js";
import { tinhTrachCatDayBase, type TrachCatDayBaseInput, type TrachCatDayBaseRules, type TrachCatDayBaseResult } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";
import type { GioPurpose } from "./gioTotTrongNgay.js";
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

/** 12 mục đích đúng theo dropdown mục 2 của đặc tả. */
export const XUAT_HANH_CA_NHAN_PURPOSE_LIST = [
  "XUAT_HANH_CHUNG",
  "DI_CONG_VIEC",
  "GAP_KHACH_HANG",
  "GAP_DOI_TAC",
  "KY_HOP_DONG",
  "CAU_TAI",
  "DI_LAM_AN",
  "DI_XA",
  "PHONG_VAN",
  "DOI_NO",
  "GIAO_DICH",
  "GIAO_TIEP_TIEC_TUNG",
] as const;
export type XuatHanhCaNhanPurpose = (typeof XUAT_HANH_CA_NHAN_PURPOSE_LIST)[number];

/** Map sang `GioPurpose` để tái dùng nguyên lớp điểm giờ đã có — 1:1, không cần khóa riêng. */
export const XUAT_HANH_CA_NHAN_TO_GIO_PURPOSE: Record<XuatHanhCaNhanPurpose, GioPurpose> = {
  XUAT_HANH_CHUNG: "XUAT_HANH",
  DI_CONG_VIEC: "DI_CONG_VIEC",
  GAP_KHACH_HANG: "GAP_KHACH_HANG",
  GAP_DOI_TAC: "GAP_DOI_TAC",
  KY_HOP_DONG: "KY_HOP_DONG",
  CAU_TAI: "CAU_TAI",
  DI_LAM_AN: "DI_LAM_AN",
  DI_XA: "DI_XA",
  PHONG_VAN: "PHONG_VAN",
  DOI_NO: "DOI_NO",
  GIAO_DICH: "GIAO_DICH",
  GIAO_TIEP_TIEC_TUNG: "GIAO_TIEP_TIEC_TUNG",
};

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}
function round1(diem: number): number {
  return Math.round(diem * 10) / 10;
}

const BASE_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 1.2, "hắc đạo": -1.2, "không xác định": 0 },
  nhiThapBatTu: { cat: 0.8, hung: -0.8 },
  // "Mãn" = đầy đủ, sung túc — chủ dự án chốt 2026-08-15 xếp nhóm tốt cho mọi loại việc.
  trucTot: ["Mãn", "Thành", "Khai", "Kiến", "Định", "Trừ"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

// 5 cụm mục đích dùng chung 1 bộ luật Ngày↔Mục đích — gộp theo tính chất gần nhau (đúng cách đã
// làm ở `GIO_PURPOSE_RULES`), tránh bịa 12 bảng riêng biệt không có căn cứ khác nhau thật sự.
function purposeRules(purpose: XuatHanhCaNhanPurpose): TrachCatDayBaseRules {
  const khungChung = {
    diemNenTang: 5,
    hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
    nhiThapBatTu: { cat: 0, hung: 0 },
    ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
    ngayCatKhac: { diemMoiNgayCat: 1.2 },
  };

  // Xuất hành/đi xa/đi công việc/đi làm ăn — nhóm "khởi hành" cổ điển, ưu tiên Lộc Mã/Thiên Hỷ
  // (2 thần sát có thật trong `trach-nhat/thanSat.ts`, đúng ý nghĩa cổ điển gắn với đi xa).
  const diChuyen: TrachCatDayBaseRules = {
    ...khungChung,
    trucTot: ["Khai", "Kiến", "Thành"],
    trucXau: ["Phá", "Bế", "Nguy"],
    diemTrucTot: 2.2,
    diemTrucXau: -2.2,
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Lộc Mã": 2, "Thiên Hỷ": 1 } },
  };

  // Gặp khách hàng/đối tác/giao tiếp-tiệc tùng/phỏng vấn — nhóm "gặp gỡ, trình diện", ưu tiên
  // Trực Thành (hoàn thành trang trọng)/Định (ổn định) và cát thần Thiên Đức/Nguyệt Đức chung.
  const giaoTiep: TrachCatDayBaseRules = {
    ...khungChung,
    trucTot: ["Thành", "Định", "Trừ"],
    trucXau: ["Phá", "Nguy", "Bế"],
    diemTrucTot: 2,
    diemTrucXau: -2,
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Thiên Đức": 1.5, "Nguyệt Đức": 1.2 } },
  };

  // Ký hợp đồng/giao dịch — nhóm "ký kết chính thức", ưu tiên Trực Thành/Định/Kiến.
  const hopDong: TrachCatDayBaseRules = {
    ...khungChung,
    trucTot: ["Thành", "Định", "Kiến"],
    trucXau: ["Phá", "Nguy", "Bế"],
    diemTrucTot: 2.2,
    diemTrucXau: -2.2,
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Nguyệt Đức": 1.5, "Thiên Đức": 1.5 } },
  };

  // Cầu tài — ưu tiên cao nhất cho "Sinh Khí (cầu tài)", đúng tên thần sát có sẵn (không suy diễn).
  const cauTai: TrachCatDayBaseRules = {
    ...khungChung,
    trucTot: ["Khai", "Thành", "Kiến"],
    trucXau: ["Phá", "Nguy", "Bế"],
    diemTrucTot: 1.8,
    diemTrucXau: -1.8,
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Sinh Khí (cầu tài)": 2, "Thiên Đức": 1 } },
  };

  // Đòi nợ — hệ thống KHÔNG có bảng "ngày tốt đòi nợ" cổ truyền xác thực; chỉ dùng khung chung
  // trung tính (Trực Trừ = dọn dẹp/thu dọn, Kiến = khởi việc), không thêm thần sát suy diễn. Lớp
  // tránh Xích Khẩu cho việc này được xử lý đúng chỗ ở lớp GIỜ (`GIO_PURPOSE_RULES.DOI_NO`).
  const doiNo: TrachCatDayBaseRules = {
    ...khungChung,
    trucTot: ["Trừ", "Kiến", "Thành"],
    trucXau: ["Phá", "Nguy", "Bế"],
    diemTrucTot: 1.5,
    diemTrucXau: -1.5,
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: {} },
  };

  switch (purpose) {
    case "XUAT_HANH_CHUNG":
    case "DI_CONG_VIEC":
    case "DI_LAM_AN":
    case "DI_XA":
      return diChuyen;
    case "GAP_KHACH_HANG":
    case "GAP_DOI_TAC":
    case "GIAO_TIEP_TIEC_TUNG":
    case "PHONG_VAN":
      return giaoTiep;
    case "KY_HOP_DONG":
    case "GIAO_DICH":
      return hopDong;
    case "CAU_TAI":
      return cauTai;
    case "DOI_NO":
      return doiNo;
  }
}

export const XUAT_HANH_CA_NHAN_DAY_SCORING_RULES = {
  // Quy đổi từ mục 16 của đặc tả: "Trạch Cát ngày 25% + Hoàng Đạo/Cát tinh 10% + Yếu tố phụ 10%"
  // gộp chung vào lớp "base" (= 45%) vì `tinhTrachCatDayBase` đã tính Hoàng Đạo/thần sát/Trực
  // trong CÙNG 1 hàm, không tách được thành layer riêng — giữ nguyên "Ngày↔người 30%" và
  // "Ngày↔mục đích 25%" đúng như đặc tả.
  trongSo: { base: 0.45, mucDich: 0.25, canNhan: 0.3 },
  base: BASE_RULES,
  canNhan: {
    trongSoPhu: { nguHanh: 0.4, can: 0.3, chi: 0.3 },
    nguHanh: { diemNenTang: 5, sinhDiem: 2, tuongHoaDiem: 1, khacDiem: -3 } satisfies NguHanhRelationRules,
    can: { diemNenTang: 5, hopDiem: 3, sinhDiem: 1.5, binhHoaDiem: 0, khacDiem: -2, khacManhDiem: -3 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 5, lucHopDiem: 3, binhHoaDiem: 0, hinhHaiPhaDiem: -3.5, xungDiem: -8 } satisfies ChiRelationRules,
  },
} as const;

export type XuatHanhCaNhanHang = "rat-tot" | "tot" | "kha-tot" | "co-the-dung" | "khong-thuan" | "khong-nen-chon";

const NHAN_THEO_HANG: Record<XuatHanhCaNhanHang, string> = {
  "rat-tot": "⭐ Rất tốt",
  tot: "⭐ Tốt",
  "kha-tot": "🟢 Khá tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen-chon": "🔴 Không nên chọn",
};

/** Dùng chung 1 thang xếp hạng cho cả điểm ngày, điểm giờ và điểm tổng — đúng mục 30 của đặc tả. */
export function getXuatHanhCaNhanRating(diem: number): XuatHanhCaNhanHang {
  if (diem >= 9) return "rat-tot";
  if (diem >= 8) return "tot";
  if (diem >= 7) return "kha-tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen-chon";
}
export function xuatHanhCaNhanNhan(diem: number): string {
  return NHAN_THEO_HANG[getXuatHanhCaNhanRating(diem)];
}

export function calculateXuatHanhCaNhanDayBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, XUAT_HANH_CA_NHAN_DAY_SCORING_RULES.base);
}

export function calculateXuatHanhCaNhanDayPurposeScore(input: TrachCatDayBaseInput, purpose: XuatHanhCaNhanPurpose): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, purposeRules(purpose));
}

export interface XuatHanhCaNhanDayPersonalResult {
  diem: number;
  nguHanh: NguHanhRelationResult;
  can: CanRelationResult;
  chi: ChiRelationResult;
}

/** Ngày ↔ Người: Ngũ Hành (bản Mệnh) + Thiên Can + Địa Chi — đúng mục 7 của đặc tả (3 lớp bắt buộc). */
export function calculateXuatHanhCaNhanDayPersonal(nguoi: NguoiTuoi, dayCan: Can, dayChi: Chi): XuatHanhCaNhanDayPersonalResult {
  const R = XUAT_HANH_CA_NHAN_DAY_SCORING_RULES.canNhan;
  const nguHanhNgay = nguHanhCuaChi(dayChi);
  const nguHanh = tinhQuanHeNguHanh(nguHanhNgay, nguoi.nguHanhMenh, R.nguHanh);
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const diem = nguHanh.diem * R.trongSoPhu.nguHanh + can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi;
  return { diem: round1(clamp10(diem)), nguHanh, can, chi };
}

export interface XuatHanhCaNhanDayResult {
  diem: number;
  hang: XuatHanhCaNhanHang;
  nhan: string;
  base: TrachCatDayBaseResult;
  mucDich: TrachCatDayBaseResult;
  canNhan: XuatHanhCaNhanDayPersonalResult;
}

/** Điểm NGÀY (dayScore) — độc lập hoàn toàn với điểm giờ, đúng nguyên tắc tách bạch mục 5. */
export function calculateXuatHanhCaNhanDayScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  purpose: XuatHanhCaNhanPurpose,
  nguoi: NguoiTuoi,
): XuatHanhCaNhanDayResult {
  const base = calculateXuatHanhCaNhanDayBaseScore(dayInput);
  const mucDich = calculateXuatHanhCaNhanDayPurposeScore(dayInput, purpose);
  const canNhan = calculateXuatHanhCaNhanDayPersonal(nguoi, dayCan, dayChi);

  const T = XUAT_HANH_CA_NHAN_DAY_SCORING_RULES.trongSo;
  let diem = base.diem * T.base + mucDich.diem * T.mucDich + canNhan.diem * T.canNhan;

  if (base.phamDaiKy) {
    diem = Math.min(diem, XUAT_HANH_CA_NHAN_DAY_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getXuatHanhCaNhanRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], base, mucDich, canNhan };
}
