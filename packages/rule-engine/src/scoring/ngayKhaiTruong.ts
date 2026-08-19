/**
 * NGÀY KHAI TRƯƠNG — tìm và xếp hạng ngày đẹp cho khai trương/cầu tài/mở cửa kinh doanh. Hỗ
 * trợ 2 chế độ: khai trương chung (không cần tuổi chủ) và khai trương theo tuổi chủ (bổ sung
 * lớp NGÀY ↔ TUỔI CHỦ, dùng chung Can/Chi/Ngũ Hành scorer với `canChiRelationScoring.ts`).
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA. Đặc tả gốc liệt kê 6 dòng trọng số
 * (Nền Trạch Cát 25% / Tài lộc-Sinh khí-Khai mở 25% / Trực+28 Tú 15% / Hoàng-Hắc 10% / Cát-Hung
 * tinh 15% / Tuổi chủ 10%) NHƯNG kiến trúc code chỉ đặt tên 3 hàm nội dung
 * (`calculateKhaiTruongBaseScore`/`FinancialScore`/`OpeningScore`) — hệ thống gộp 4 dòng đầu
 * (Nền + Trực/28 Tú + Hoàng-Hắc + Cát-Hung chung, tổng 65%) vào `calculateKhaiTruongBaseScore`
 * (dùng nguyên `tinhTrachCatDayBase` không ưu tiên riêng), rồi tách dòng "Tài lộc/Sinh
 * khí/Khai mở" (25%) thành 2 hàm riêng theo đúng tên đã yêu cầu:
 * `calculateKhaiTruongFinancialScore` (15%, ưu tiên Sinh Khí) và `calculateKhaiTruongOpeningScore`
 * (10%, ưu tiên Trực Khai/khai mở). Tổng vẫn = 100% (65+15+10+10 tuổi chủ).
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
import { tinhCatTinhCaNhan, type CatTinhCaNhan } from "../trach-nhat/catTinhCaNhan.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

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
  trucTot: ["Mãn", "Thành", "Khai", "Kiến"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

const FINANCIAL_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: [],
  trucXau: [],
  diemTrucTot: 0,
  diemTrucXau: 0,
  thanSat: { diemMoiCat: 0.5, diemMoiHung: -0.5, tenUuTien: { "Sinh Khí (cầu tài)": 3, "Thiên Thành": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1 },
};

const OPENING_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Khai"],
  trucXau: ["Bế"],
  diemTrucTot: 3,
  diemTrucXau: -3,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Thiên Đức Hợp": 1, "Thiên Xá": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1.5 },
};

export const KHAI_TRUONG_SCORING_RULES = {
  trongSoCoTuoiChu: { base: 0.65, taiLoc: 0.15, khaiMo: 0.1, tuoiChu: 0.1 },
  trongSoKhongTuoiChu: { base: 0.68, taiLoc: 0.17, khaiMo: 0.15 },
  base: BASE_RULES,
  taiLoc: FINANCIAL_RULES,
  khaiMo: OPENING_RULES,
  tuoiChu: {
    trongSoPhu: { can: 0.3, chi: 0.45, nguHanh: 0.25 },
    can: { diemNenTang: 5, hopDiem: 2, sinhDiem: 1, binhHoaDiem: 0, khacDiem: -1.5, khacManhDiem: -2.5 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 2.5, lucHopDiem: 2, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3 } satisfies ChiRelationRules,
    nguHanh: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -1.5 } satisfies NguHanhRelationRules,
  },
} as const;

export type KhaiTruongHang = "dai-cat" | "rat-tot" | "tot" | "co-the-dung" | "khong-thuan" | "khong-nen";

const NHAN_THEO_HANG: Record<KhaiTruongHang, string> = {
  "dai-cat": "⭐ Đại cát — Rất tốt",
  "rat-tot": "⭐ Rất tốt",
  "tot": "🟢 Tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen": "🔴 Không nên chọn",
};

export function getKhaiTruongRating(diem: number): KhaiTruongHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 8) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen";
}

export function calculateKhaiTruongBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KHAI_TRUONG_SCORING_RULES.base);
}
export function calculateKhaiTruongFinancialScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KHAI_TRUONG_SCORING_RULES.taiLoc);
}
export function calculateKhaiTruongOpeningScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KHAI_TRUONG_SCORING_RULES.khaiMo);
}

export interface KhaiTruongPersonalResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
  nguHanh: NguHanhRelationResult;
}

export function calculateKhaiTruongPersonalCompatibility(chu: NguoiTuoi, dayCan: Can, dayChi: Chi, dayNguHanh: NguHanh): KhaiTruongPersonalResult {
  const R = KHAI_TRUONG_SCORING_RULES.tuoiChu;
  const can = tinhQuanHeCan(dayCan, chu.can, R.can);
  const chi = tinhQuanHeChi(dayChi, chu.chi, R.chi);
  const nguHanh = tinhQuanHeNguHanh(dayNguHanh, chu.nguHanhMenh, R.nguHanh);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi + nguHanh.diem * R.trongSoPhu.nguHanh;
  return { diem: round1(clamp10(diem)), can, chi, nguHanh };
}

export interface KhaiTruongResult {
  diem: number;
  hang: KhaiTruongHang;
  nhan: string;
  base: TrachCatDayBaseResult;
  taiLoc: TrachCatDayBaseResult;
  khaiMo: TrachCatDayBaseResult;
  tuoiChu: KhaiTruongPersonalResult | null;
  /** Cát tinh cá nhân (Chân Lộc/Quý Nhân/Lộc/Tam-Lục Hợp) theo tuổi chủ — null nếu không nhập tuổi. */
  catCaNhan: CatTinhCaNhan | null;
}

export function calculateKhaiTruongScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  dayNguHanh: NguHanh,
  chu?: NguoiTuoi,
): KhaiTruongResult {
  const base = calculateKhaiTruongBaseScore(dayInput);
  const taiLoc = calculateKhaiTruongFinancialScore(dayInput);
  const khaiMo = calculateKhaiTruongOpeningScore(dayInput);
  const tuoiChu = chu ? calculateKhaiTruongPersonalCompatibility(chu, dayCan, dayChi, dayNguHanh) : null;

  let diem: number;
  if (tuoiChu) {
    const T = KHAI_TRUONG_SCORING_RULES.trongSoCoTuoiChu;
    diem = base.diem * T.base + taiLoc.diem * T.taiLoc + khaiMo.diem * T.khaiMo + tuoiChu.diem * T.tuoiChu;
  } else {
    const T = KHAI_TRUONG_SCORING_RULES.trongSoKhongTuoiChu;
    diem = base.diem * T.base + taiLoc.diem * T.taiLoc + khaiMo.diem * T.khaiMo;
  }

  // Cộng điểm cát tinh cá nhân theo tuổi (engine dùng chung). Khai Trương đã chấm Tam/Lục Hợp trong
  // `tuoiChu` nên chỉ cộng phần Chân Lộc/Quý Nhân/Lộc (`diemCongChanLoc`) — tránh cộng trùng. Cộng
  // TRƯỚC trần đại kỵ để ngày phạm nặng theo cách khác vẫn bị chặn.
  const catCaNhan = chu ? tinhCatTinhCaNhan(dayCan, dayChi, chu.can, chu.chi) : null;
  if (catCaNhan) diem += catCaNhan.diemCongChanLoc;

  if (base.phamDaiKy) {
    diem = Math.min(diem, KHAI_TRUONG_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getKhaiTruongRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], base, taiLoc, khaiMo, tuoiChu, catCaNhan };
}

export function formatKhaiTruongResult(ngayStr: string, result: KhaiTruongResult): string {
  return [`${ngayStr}`, `${result.nhan} — ${result.diem}/10`].join("\n");
}
