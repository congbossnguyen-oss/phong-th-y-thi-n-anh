/**
 * VẬN MAY TRONG NGÀY — đánh giá mức độ vận may của 1 cá nhân trong 1 ngày cụ thể, kết hợp 2
 * tầng: NỀN TRẠCH CÁT CỦA NGÀY (dùng chung, xem `trachCatDayBase.ts`) và TƯƠNG TÁC NGÀY ↔ CÁ
 * NHÂN (Can/Chi/Ngũ Hành, dùng chung, xem `canChiRelationScoring.ts`). Không phải "tử vi ngày
 * mai", không phải "ngày tốt chung" — là MỨC ĐỘ CÁT HUNG CỦA 1 NGÀY ĐỐI VỚI 1 CÁ NHÂN.
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA — KHÔNG trích dẫn từ 1 trang sách cụ
 * thể. Nạp Âm: hệ thống chưa có bảng đối chiếu riêng theo TỪNG CẶP TÊN Nạp Âm cụ thể — giữ
 * trung tính, cùng cách xử lý đã áp dụng ở `tuoiHopLamAn.ts`.
 *
 * Các chỉ số phụ (Tài lộc/Công việc/Giao tế/Tình cảm/Bình an) dùng lại `tinhTrachCatDayBase`
 * NHƯNG với bộ `tenUuTien` (thần sát ưu tiên) RIÊNG cho từng nhóm — đúng yêu cầu "không được
 * lấy điểm tổng rồi chia tùy ý". Vì hệ thống chưa có bảng "thần sát theo chủ đề" tách bạch,
 * việc chọn thần sát ưu tiên cho mỗi nhóm dựa trên Ý NGHĨA TÊN GỌI đã biết của các thần sát
 * hiện có (Sinh Khí (cầu tài) → tài lộc; Thiên Hỷ/Tam Hợp/Thiên Thành → hỷ khánh/giao tế/tình
 * cảm; Địa Giải → giải trừ/bình an) — quy ước hệ thống, có thể chỉnh khi có nguồn chính xác hơn.
 */
import type { Data } from "@thien-anh/calendar-core";
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
} from "./canChiRelationScoring.js";
import { tinhTrachCatDayBase, type TrachCatDayBaseInput, type TrachCatDayBaseRules, type TrachCatDayBaseResult } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";
import { tinhCatTinhCaNhan } from "../trach-nhat/catTinhCaNhan.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

function round1(diem: number): number {
  return Math.round(diem * 10) / 10;
}

const TRACH_CAT_DAY_BASE_MAC_DINH: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 1.5, "hắc đạo": -1.5, "không xác định": 0 },
  nhiThapBatTu: { cat: 1, hung: -1 },
  trucTot: ["Mãn", "Thành", "Khai"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 1,
  diemTrucXau: -1,
  thanSat: { diemMoiCat: 0.5, diemMoiHung: -0.5, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

function trachCatVoiUuTien(tenUuTien: Record<string, number>): TrachCatDayBaseRules {
  return { ...TRACH_CAT_DAY_BASE_MAC_DINH, thanSat: { ...TRACH_CAT_DAY_BASE_MAC_DINH.thanSat, tenUuTien } };
}

export const VAN_MAY_SCORING_RULES = {
  trongSo: { trachCat: 0.5, caNhan: 0.5 },
  trachCatDayBase: TRACH_CAT_DAY_BASE_MAC_DINH,
  personal: {
    trongSoPhu: { can: 0.25, chi: 0.45, nguHanh: 0.3 },
    can: { diemNenTang: 5, hopDiem: 2, sinhDiem: 1, binhHoaDiem: 0, khacDiem: -1.5, khacManhDiem: -2.5 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 2.5, lucHopDiem: 2, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3 } satisfies ChiRelationRules,
    nguHanh: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -1.5 } satisfies NguHanhRelationRules,
  },
  daiKy: { diemTranNeuPham: 3 },
  phuTro: {
    taiLoc: trachCatVoiUuTien({ "Sinh Khí (cầu tài)": 2 }),
    congViec: trachCatVoiUuTien({ "Thiên Thành": 1.5 }),
    giaoTe: trachCatVoiUuTien({ "Thiên Hỷ": 2, "Tam Hợp": 1 }),
    tinhCam: trachCatVoiUuTien({ "Thiên Hỷ": 2 }),
    binhAn: trachCatVoiUuTien({ "Địa Giải": 1.5 }),
  },
} as const;

export type VanMayHang = "dai-cat" | "rat-tot" | "tot" | "kha-tot" | "trung-binh" | "kem" | "rat-kem";

const NHAN_THEO_HANG: Record<VanMayHang, string> = {
  "dai-cat": "⭐ ĐẠI CÁT — Vận may rất cao",
  "rat-tot": "⭐ RẤT TỐT",
  "tot": "🟢 TỐT",
  "kha-tot": "🟢 KHÁ TỐT",
  "trung-binh": "🟡 TRUNG BÌNH",
  "kem": "🟠 KÉM",
  "rat-kem": "🔴 RẤT KÉM",
};

export function getVanMayRating(diem: number): VanMayHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 8) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 6) return "kha-tot";
  if (diem >= 4) return "trung-binh";
  if (diem >= 2) return "kem";
  return "rat-kem";
}

/** Tầng 1 — NỀN TRẠCH CÁT CỦA NGÀY (`TRACH_CAT_DAY_SCORE`), chưa xét cá nhân. */
export function calculateTrachCatDayScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, VAN_MAY_SCORING_RULES.trachCatDayBase);
}

export interface PersonalDayCompatibilityResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
  nguHanh: NguHanhRelationResult;
}

/** Tầng 2 — TƯƠNG TÁC NGÀY ↔ CÁ NHÂN (`PERSONAL_DAY_COMPATIBILITY_SCORE`). */
export function calculatePersonalDayCompatibility(
  nguoi: NguoiTuoi,
  dayCan: Can,
  dayChi: Chi,
  dayNguHanhMenh: NguHanh,
): PersonalDayCompatibilityResult {
  const R = VAN_MAY_SCORING_RULES.personal;
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const nguHanh = tinhQuanHeNguHanh(dayNguHanhMenh, nguoi.nguHanhMenh, R.nguHanh);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi + nguHanh.diem * R.trongSoPhu.nguHanh;
  return { diem: round1(clamp10(diem)), can, chi, nguHanh };
}

export function calculateMoneyLuckScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, VAN_MAY_SCORING_RULES.phuTro.taiLoc);
}
export function calculateWorkLuckScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, VAN_MAY_SCORING_RULES.phuTro.congViec);
}
export function calculateSocialLuckScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, VAN_MAY_SCORING_RULES.phuTro.giaoTe);
}
export function calculateLoveLuckScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, VAN_MAY_SCORING_RULES.phuTro.tinhCam);
}
export function calculateSafetyLuckScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, VAN_MAY_SCORING_RULES.phuTro.binhAn);
}

export function calculateVanMayScore(trachCatDiem: number, personalDiem: number, phamDaiKy: boolean, bonusCaNhan = 0): number {
  const R = VAN_MAY_SCORING_RULES;
  // `bonusCaNhan`: điểm sao cát cá nhân (Chân Lộc/Quý Nhân/Lộc) — cộng TRƯỚC trần đại kỵ.
  let diem = trachCatDiem * R.trongSo.trachCat + personalDiem * R.trongSo.caNhan + bonusCaNhan;
  if (phamDaiKy) {
    diem = Math.min(diem, R.daiKy.diemTranNeuPham);
  }
  return round1(clamp10(diem));
}

export interface VanMayResult {
  diem: number;
  hang: VanMayHang;
  nhan: string;
  trachCat: TrachCatDayBaseResult;
  caNhan: PersonalDayCompatibilityResult;
  phuTro: {
    taiLoc: number;
    congViec: number;
    giaoTe: number;
    tinhCam: number;
    binhAn: number;
  };
}

/** Hàm tổng hợp: tính đủ 2 tầng + điểm tổng + phân loại + chỉ số phụ trong 1 lần gọi. */
export function calculateVanMay(nguoi: NguoiTuoi, dayCan: Can, dayChi: Chi, dayNguHanhMenh: NguHanh, dayInput: TrachCatDayBaseInput): VanMayResult {
  const trachCat = calculateTrachCatDayScore(dayInput);
  const caNhan = calculatePersonalDayCompatibility(nguoi, dayCan, dayChi, dayNguHanhMenh);
  const bonusCaNhan = tinhCatTinhCaNhan(dayCan, dayChi, nguoi.can, nguoi.chi).diemCongChanLoc;
  const diem = calculateVanMayScore(trachCat.diem, caNhan.diem, trachCat.phamDaiKy, bonusCaNhan);
  const hang = getVanMayRating(diem);

  return {
    diem,
    hang,
    nhan: NHAN_THEO_HANG[hang],
    trachCat,
    caNhan,
    phuTro: {
      taiLoc: calculateMoneyLuckScore(dayInput).diem,
      congViec: calculateWorkLuckScore(dayInput).diem,
      giaoTe: calculateSocialLuckScore(dayInput).diem,
      tinhCam: calculateLoveLuckScore(dayInput).diem,
      binhAn: calculateSafetyLuckScore(dayInput).diem,
    },
  };
}

export function formatVanMayResult(ngayStr: string, result: VanMayResult): string {
  return [`${ngayStr}`, "", `${result.nhan.split(" ")[0]} ${result.diem}/10`, result.nhan].join("\n");
}
