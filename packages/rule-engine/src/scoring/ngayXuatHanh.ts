/**
 * NGÀY TỐT XUẤT HÀNH — 1 mục đích duy nhất (đi xa/khởi hành), tái dùng kiến trúc nền Trạch Cát
 * + lớp mục đích + lớp tuổi TÙY CHỌN đã dùng ở `ngayLeViengMo.ts`/`chonNgayGiaoDich.ts`.
 *
 * Năm sinh KHÔNG bắt buộc (đúng yêu cầu đặc tả): để trống thì chỉ tính ngày xuất hành chung,
 * có năm sinh thì cộng thêm lớp cá nhân hóa — tái dùng `tinhQuanHeCan`/`tinhQuanHeChi` (đã có
 * đủ Tương Hợp/Tương Sinh/Bình/Khắc cho Can và Tam Hợp/Lục Hợp/Bình/Xung/Hình/Hại/Phá cho Chi,
 * đúng toàn bộ danh sách quan hệ đặc tả yêu cầu — không cần viết thêm bảng quan hệ mới).
 *
 * ⚠️ Trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA. "Lộc Mã" (thần sát có sẵn trong hệ thống,
 * `trach-nhat/thanSat.ts`) được ưu tiên cao nhất cho mục đích này vì đúng ý nghĩa cổ điển gắn
 * với đi xa/xuất hành — không phải suy diễn thêm.
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  tinhQuanHeCan,
  tinhQuanHeChi,
  type CanRelationRules,
  type CanRelationResult,
  type ChiRelationRules,
  type ChiRelationResult,
} from "./canChiRelationScoring.js";
import { tinhTrachCatDayBase, type TrachCatDayBaseInput, type TrachCatDayBaseRules, type TrachCatDayBaseResult } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";

type Can = Data.Can;
type Chi = Data.Chi;

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
  trucTot: ["Khai", "Kiến", "Thành"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

const XUAT_HANH_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Khai", "Kiến"],
  trucXau: ["Phá", "Bế"],
  diemTrucTot: 2.5,
  diemTrucXau: -2.5,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Lộc Mã": 2, "Thiên Hỷ": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1.2 },
};

export const XUAT_HANH_SCORING_RULES = {
  trongSoCoTuoi: { base: 0.6, mucDich: 0.25, canNhan: 0.15 },
  trongSoKhongTuoi: { base: 0.7, mucDich: 0.3 },
  base: BASE_RULES,
  mucDich: XUAT_HANH_RULES,
  canNhan: {
    trongSoPhu: { can: 0.4, chi: 0.6 },
    can: { diemNenTang: 5, hopDiem: 3, sinhDiem: 1.5, binhHoaDiem: 0, khacDiem: -2, khacManhDiem: -3 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 5, lucHopDiem: 3, binhHoaDiem: 0, hinhHaiPhaDiem: -3.5, xungDiem: -8 } satisfies ChiRelationRules,
  },
} as const;

export type XuatHanhHang = "dai-cat" | "cat" | "binh" | "khong-uu-tien" | "khong-nen-dung";

const NHAN_THEO_HANG: Record<XuatHanhHang, string> = {
  "dai-cat": "⭐ Đại Cát",
  cat: "🟢 Cát",
  binh: "🟡 Bình",
  "khong-uu-tien": "🟠 Không ưu tiên",
  "khong-nen-dung": "🔴 Không nên dùng",
};

export function getXuatHanhRating(diem: number): XuatHanhHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 7) return "cat";
  if (diem >= 5) return "binh";
  if (diem >= 3) return "khong-uu-tien";
  return "khong-nen-dung";
}

export function calculateXuatHanhBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, XUAT_HANH_SCORING_RULES.base);
}

export function calculateXuatHanhPurposeScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, XUAT_HANH_SCORING_RULES.mucDich);
}

export interface XuatHanhPersonalResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
}

export function calculateXuatHanhPersonalCompatibility(nguoi: NguoiTuoi, dayCan: Can, dayChi: Chi): XuatHanhPersonalResult {
  const R = XUAT_HANH_SCORING_RULES.canNhan;
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi;
  return { diem: round1(clamp10(diem)), can, chi };
}

export interface XuatHanhResult {
  diem: number;
  hang: XuatHanhHang;
  nhan: string;
  base: TrachCatDayBaseResult;
  mucDich: TrachCatDayBaseResult;
  canNhan: XuatHanhPersonalResult | null;
}

export function calculateXuatHanhScore(dayInput: TrachCatDayBaseInput, dayCan: Can, dayChi: Chi, nguoi?: NguoiTuoi): XuatHanhResult {
  const base = calculateXuatHanhBaseScore(dayInput);
  const mucDich = calculateXuatHanhPurposeScore(dayInput);
  const canNhan = nguoi ? calculateXuatHanhPersonalCompatibility(nguoi, dayCan, dayChi) : null;

  let diem: number;
  if (canNhan) {
    const T = XUAT_HANH_SCORING_RULES.trongSoCoTuoi;
    diem = base.diem * T.base + mucDich.diem * T.mucDich + canNhan.diem * T.canNhan;
  } else {
    const T = XUAT_HANH_SCORING_RULES.trongSoKhongTuoi;
    diem = base.diem * T.base + mucDich.diem * T.mucDich;
  }

  if (base.phamDaiKy) {
    diem = Math.min(diem, XUAT_HANH_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getXuatHanhRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], base, mucDich, canNhan };
}
