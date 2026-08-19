/**
 * NGÀY ĐẠI CÁT CÁ NHÂN — quét 1 tháng, tìm 3-5 ngày tốt nhất CHO RIÊNG 1 CÁ NHÂN (không phải
 * danh sách ngày tốt chung), tùy chọn theo mục đích (TONG_VAN/CAU_TAI/CONG_VIEC/
 * GIAO_TIEP_TIEC_TUNG/TINH_CAM). 3 tầng: PERSONAL_DAY_BASE_SCORE (nền Trạch Cát, dùng chung
 * `trachCatDayBase.ts`) + PERSONAL_COMPATIBILITY_SCORE (Can/Chi/Ngũ Hành, dùng chung
 * `canChiRelationScoring.ts`) + điểm theo mục đích.
 *
 * ⚠️ Đặc tả gốc thu thập Ngày/Tháng/Năm sinh đầy đủ nhưng mục 5 "TẦNG 2" chỉ định rõ tương tác
 * cá nhân dựa trên "Thiên Can NĂM SINH, Địa Chi NĂM SINH" (không dùng trụ Ngày sinh) — cùng cơ
 * chế suy tuổi/mệnh như `tuoiHopLamAn.ts`/`vanMayTrongNgay.ts`, KHÔNG tự suy diễn thêm 1 hệ Bát
 * Tự đầy đủ theo ngày sinh mà đặc tả không yêu cầu. Trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA.
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

export const NGAY_DAI_CAT_PURPOSE_LIST = ["TONG_VAN", "CAU_TAI", "CONG_VIEC", "GIAO_TIEP_TIEC_TUNG", "TINH_CAM"] as const;
export type NgayDaiCatPurpose = (typeof NGAY_DAI_CAT_PURPOSE_LIST)[number];

const NEN_TRACH_CAT_RULES: TrachCatDayBaseRules = {
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

function trachCatVoiUuTien(uuTien: { tenUuTien: Record<string, number>; trucTot?: readonly string[]; diemTrucTot?: number }): TrachCatDayBaseRules {
  return {
    ...NEN_TRACH_CAT_RULES,
    trucTot: uuTien.trucTot ?? NEN_TRACH_CAT_RULES.trucTot,
    diemTrucTot: uuTien.diemTrucTot ?? NEN_TRACH_CAT_RULES.diemTrucTot,
    thanSat: { ...NEN_TRACH_CAT_RULES.thanSat, tenUuTien: uuTien.tenUuTien },
  };
}

export const NGAY_DAI_CAT_SCORING_RULES = {
  trongSo: { nenTrachCat: 0.4, caNhan: 0.4, mucDich: 0.2 },
  nenTrachCat: NEN_TRACH_CAT_RULES,
  caNhan: {
    trongSoPhu: { can: 0.25, chi: 0.45, nguHanh: 0.3 },
    can: { diemNenTang: 5, hopDiem: 2, sinhDiem: 1, binhHoaDiem: 0, khacDiem: -1.5, khacManhDiem: -2.5 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 2.5, lucHopDiem: 2, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3 } satisfies ChiRelationRules,
    nguHanh: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -1.5 } satisfies NguHanhRelationRules,
  },
  purposeRules: {
    TONG_VAN: NEN_TRACH_CAT_RULES,
    CAU_TAI: trachCatVoiUuTien({ tenUuTien: { "Sinh Khí (cầu tài)": 2.5 } }),
    CONG_VIEC: trachCatVoiUuTien({ tenUuTien: { "Thiên Thành": 2 }, trucTot: ["Khai", "Thành", "Kiến"], diemTrucTot: 1.5 }),
    GIAO_TIEP_TIEC_TUNG: trachCatVoiUuTien({ tenUuTien: { "Thiên Hỷ": 2, "Tam Hợp": 1 }, trucTot: ["Mãn", "Thành"], diemTrucTot: 1.5 }),
    TINH_CAM: trachCatVoiUuTien({ tenUuTien: { "Thiên Hỷ": 2.5 } }),
  } satisfies Record<NgayDaiCatPurpose, TrachCatDayBaseRules>,
} as const;

export type NgayDaiCatHang = "dai-cat" | "rat-tot" | "tot" | "kha-tot" | "trung-binh" | "kem" | "rat-kem";

const NHAN_THEO_HANG: Record<NgayDaiCatHang, string> = {
  "dai-cat": "⭐ Đại cát",
  "rat-tot": "⭐ Rất tốt",
  "tot": "🟢 Tốt",
  "kha-tot": "🟢 Khá tốt",
  "trung-binh": "🟡 Trung bình",
  "kem": "🟠 Kém",
  "rat-kem": "🔴 Rất kém",
};

export function getPersonalDayRating(diem: number): NgayDaiCatHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 8) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 6) return "kha-tot";
  if (diem >= 4) return "trung-binh";
  if (diem >= 2) return "kem";
  return "rat-kem";
}

export function calculatePersonalDayBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, NGAY_DAI_CAT_SCORING_RULES.nenTrachCat);
}

export interface PersonalCompatibilityResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
  nguHanh: NguHanhRelationResult;
}

export function calculatePersonalCompatibility(nguoi: NguoiTuoi, dayCan: Can, dayChi: Chi, dayNguHanhMenh: NguHanh): PersonalCompatibilityResult {
  const R = NGAY_DAI_CAT_SCORING_RULES.caNhan;
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const nguHanh = tinhQuanHeNguHanh(dayNguHanhMenh, nguoi.nguHanhMenh, R.nguHanh);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi + nguHanh.diem * R.trongSoPhu.nguHanh;
  return { diem: round1(clamp10(diem)), can, chi, nguHanh };
}

export function calculatePurposeScore(input: TrachCatDayBaseInput, purpose: NgayDaiCatPurpose): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, NGAY_DAI_CAT_SCORING_RULES.purposeRules[purpose]);
}

export interface PersonalDayScoreResult {
  diem: number;
  hang: NgayDaiCatHang;
  nhan: string;
  nenTrachCat: TrachCatDayBaseResult;
  caNhan: PersonalCompatibilityResult;
  mucDich: TrachCatDayBaseResult;
}

export function calculatePersonalDayScore(
  nguoi: NguoiTuoi,
  dayCan: Can,
  dayChi: Chi,
  dayNguHanhMenh: NguHanh,
  dayInput: TrachCatDayBaseInput,
  purpose: NgayDaiCatPurpose,
): PersonalDayScoreResult {
  const R = NGAY_DAI_CAT_SCORING_RULES.trongSo;
  const nenTrachCat = calculatePersonalDayBaseScore(dayInput);
  const caNhan = calculatePersonalCompatibility(nguoi, dayCan, dayChi, dayNguHanhMenh);
  const mucDich = calculatePurposeScore(dayInput, purpose);

  let diem = nenTrachCat.diem * R.nenTrachCat + caNhan.diem * R.caNhan + mucDich.diem * R.mucDich;
  // Sao cát cá nhân (Chân Lộc/Quý Nhân/Lộc) — cộng TRƯỚC trần đại kỵ. Tam/Lục Hợp đã có trong
  // `caNhan` nên chỉ lấy diemCongChanLoc (tránh cộng trùng).
  diem += tinhCatTinhCaNhan(dayCan, dayChi, nguoi.can, nguoi.chi).diemCongChanLoc;
  if (nenTrachCat.phamDaiKy) {
    diem = Math.min(diem, NGAY_DAI_CAT_SCORING_RULES.nenTrachCat.ngayDaiKy.diemTranNeuPham);
  }
  diem = round1(clamp10(diem));
  const hang = getPersonalDayRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], nenTrachCat, caNhan, mucDich };
}

export function formatPersonalDayResult(ngayStr: string, result: PersonalDayScoreResult): string {
  return [ngayStr, `${result.nhan} — ${result.diem}/10`].join("\n");
}
