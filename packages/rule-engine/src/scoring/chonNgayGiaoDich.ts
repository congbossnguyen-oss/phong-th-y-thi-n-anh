/**
 * CHỌN NGÀY GIAO DỊCH / NHẬN TÀI SẢN — 1 engine chung cho 4 trường hợp (Mua Nhà / Mua Xe / Nhận
 * Nhà / Nhận Xe), phân biệt bằng `assetType` (NHA/XE) và `purpose` (MUA/NHAN), KHÔNG tạo 4
 * module riêng. Cùng kiến trúc "nền Trạch Cát + lớp theo mục đích + lớp theo tuổi chủ" đã dùng
 * ở `ngayKhaiTruong.ts`/`ngayKyHopDong.ts`.
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA — hệ thống CHƯA có bảng thần sát/Nghi-Kỵ
 * phân loại riêng theo "mua nhà"/"mua xe"/"nhận nhà"/"nhận xe" (đúng như đã ghi nhận ở
 * `ngayKyHopDong.ts`), nên 4 bộ quy tắc dưới đây chỉ khác nhau ở việc ưu tiên Trực và thần sát
 * NÀO trong số các thần sát TỔNG QUÁT đã có sẵn (không bịa thần sát mới):
 * - Mua Nhà/Mua Xe (giao dịch): ưu tiên Trực Thành/Định/Kiến (xác lập, ổn định), Thiên Đức Hợp/
 *   Thiên Xá.
 * - Nhận Nhà (an cư, nhập trạch): ưu tiên Trực Mãn/Khai, Thiên Hỷ/Tam Hợp (đoàn tụ, ổn định).
 * - Nhận Xe (xuất hành, bắt đầu dùng): ưu tiên Trực Khai, "Lộc Mã" (thần sát gắn trực tiếp với
 *   xuất hành/xe cộ — tên có sẵn trong bảng thần sát chung) và Thiên Hỷ.
 * Không có bảng `VEHICLE_COLOR_RULES` — màu xe (nếu UI có hỏi) không được tính vào điểm.
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

export type AssetType = "NHA" | "XE";
export type Purpose = "MUA" | "NHAN";

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
  trucTot: ["Mãn", "Thành", "Khai", "Kiến", "Định"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

const NHA_MUA_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Thành", "Định", "Kiến"],
  trucXau: ["Phá", "Bế"],
  diemTrucTot: 3,
  diemTrucXau: -3,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Thiên Đức Hợp": 1, "Thiên Xá": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1.5 },
};

const XE_MUA_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Thành", "Kiến"],
  trucXau: ["Phá", "Bế"],
  diemTrucTot: 2.5,
  diemTrucXau: -2.5,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Lộc Mã": 1.5, "Sinh Khí (cầu tài)": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1 },
};

const NHA_NHAN_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Mãn", "Khai"],
  trucXau: ["Bế"],
  diemTrucTot: 3,
  diemTrucXau: -3,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Thiên Hỷ": 1.5, "Tam Hợp": 1.5 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1 },
};

const XE_NHAN_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Khai"],
  trucXau: ["Bế"],
  diemTrucTot: 3,
  diemTrucXau: -3,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Lộc Mã": 1.5, "Thiên Hỷ": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1 },
};

function purposeRules(assetType: AssetType, purpose: Purpose): TrachCatDayBaseRules {
  if (assetType === "NHA" && purpose === "MUA") return NHA_MUA_RULES;
  if (assetType === "NHA" && purpose === "NHAN") return NHA_NHAN_RULES;
  if (assetType === "XE" && purpose === "MUA") return XE_MUA_RULES;
  return XE_NHAN_RULES;
}

export const TRANSACTION_ASSET_SCORING_RULES = {
  trongSoCoChu: { base: 0.65, mucDich: 0.25, chu: 0.1 },
  trongSoKhongChu: { base: 0.7, mucDich: 0.3 },
  base: BASE_RULES,
  chu: {
    trongSoPhu: { can: 0.3, chi: 0.45, nguHanh: 0.25 },
    can: { diemNenTang: 5, hopDiem: 2, sinhDiem: 1, binhHoaDiem: 0, khacDiem: -1.5, khacManhDiem: -2.5 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 2.5, lucHopDiem: 2, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3 } satisfies ChiRelationRules,
    nguHanh: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -1.5 } satisfies NguHanhRelationRules,
  },
} as const;

export type TransactionAssetHang = "dai-cat" | "rat-tot" | "tot" | "co-the-dung" | "khong-thuan" | "khong-nen";

const NHAN_THEO_HANG: Record<TransactionAssetHang, string> = {
  "dai-cat": "⭐ Rất tốt",
  "rat-tot": "⭐ Rất tốt",
  tot: "🟢 Tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen": "🔴 Không nên chọn",
};

export function getTransactionAssetRating(diem: number): TransactionAssetHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 8) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen";
}

export function calculateTransactionAssetBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, TRANSACTION_ASSET_SCORING_RULES.base);
}

export function calculatePurposeCompatibility(input: TrachCatDayBaseInput, assetType: AssetType, purpose: Purpose): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, purposeRules(assetType, purpose));
}

export interface TransactionAssetOwnerResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
  nguHanh: NguHanhRelationResult;
}

export function calculateOwnerDayCompatibility(chu: NguoiTuoi, dayCan: Can, dayChi: Chi, dayNguHanh: NguHanh): TransactionAssetOwnerResult {
  const R = TRANSACTION_ASSET_SCORING_RULES.chu;
  const can = tinhQuanHeCan(dayCan, chu.can, R.can);
  const chi = tinhQuanHeChi(dayChi, chu.chi, R.chi);
  const nguHanh = tinhQuanHeNguHanh(dayNguHanh, chu.nguHanhMenh, R.nguHanh);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi + nguHanh.diem * R.trongSoPhu.nguHanh;
  return { diem: round1(clamp10(diem)), can, chi, nguHanh };
}

export interface TransactionAssetResult {
  diem: number;
  hang: TransactionAssetHang;
  nhan: string;
  base: TrachCatDayBaseResult;
  mucDich: TrachCatDayBaseResult;
  chu: TransactionAssetOwnerResult | null;
}

export function calculateTransactionAssetScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  dayNguHanh: NguHanh,
  assetType: AssetType,
  purpose: Purpose,
  chu?: NguoiTuoi,
): TransactionAssetResult {
  const base = calculateTransactionAssetBaseScore(dayInput);
  const mucDich = calculatePurposeCompatibility(dayInput, assetType, purpose);
  const chuResult = chu ? calculateOwnerDayCompatibility(chu, dayCan, dayChi, dayNguHanh) : null;

  let diem: number;
  if (chuResult) {
    const T = TRANSACTION_ASSET_SCORING_RULES.trongSoCoChu;
    diem = base.diem * T.base + mucDich.diem * T.mucDich + chuResult.diem * T.chu;
  } else {
    const T = TRANSACTION_ASSET_SCORING_RULES.trongSoKhongChu;
    diem = base.diem * T.base + mucDich.diem * T.mucDich;
  }

  // Sao cát cá nhân theo tuổi chủ (Chân Lộc/Quý Nhân/Lộc) — chỉ khi có chủ, cộng TRƯỚC trần đại kỵ.
  if (chu) diem += tinhCatTinhCaNhan(dayCan, dayChi, chu.can, chu.chi).diemCongChanLoc;

  if (base.phamDaiKy) {
    diem = Math.min(diem, TRANSACTION_ASSET_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getTransactionAssetRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], base, mucDich, chu: chuResult };
}
