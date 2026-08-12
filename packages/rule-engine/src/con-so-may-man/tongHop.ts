/**
 * CON SỐ MAY MẮN 00-99 — quét toàn bộ 100 số, chấm điểm theo Ngũ Hành số ↔ bản mệnh người,
 * cấu trúc cặp số, và Ngũ Hành số ↔ Nạp Âm ngày, trả về Top N. Không dùng bảng 3 số cố định.
 *
 * ⚠️ Lớp "Số ↔ Cung" và "Ngày Trạch Cát" trong đặc tả gốc CHƯA được tính (hệ thống chưa có
 * Cung Mệnh Bát Trạch — xem ghi chú tương tự ở `trung-tang/tuoiCanTranh.ts`; lớp Trạch Cát ngày
 * chỉ mang tính bổ trợ theo đặc tả, không bắt buộc). Trọng số 2 lớp này được loại bỏ và phân bổ
 * lại cho 3 lớp còn lại theo đúng nguyên tắc "thiếu dữ liệu thì chuẩn hóa lại trọng số, không
 * cho điểm giả" — xem `LUCKY_NUMBER_SCORING_RULES`.
 */
import type { Data } from "@thien-anh/calendar-core";
import { getNguHanhQuanHe } from "../trach-nhat/nguHanhQuanHe.js";
import { getNguoiTuoi, type NguoiTuoi } from "../scoring/tuoiHopLamAn.js";
import { calculateNumberElement, formatSoMayMan } from "./nguHanhSo.js";
import { calculateNumberPairStructure, type CauTrucCapSoResult } from "./cauTrucCapSo.js";

type NguHanh = Data.NguHanh;

export type LuckyNumberPurpose = "TONG_VAN" | "TAI_LOC" | "CONG_VIEC" | "GIAO_TIEP" | "TINH_CAM";

/**
 * Trọng số gốc theo đặc tả (mục 12) — 2 lớp "Cung" và "Ngày Trạch Cát" tạm không dùng (xem ghi
 * chú đầu file), giữ lại trong config để biết đặc tả gốc, nhưng `trongSoDangDung` mới là trọng
 * số thực tế áp dụng (đã chuẩn hóa lại tổng = 1 trên 3 lớp có dữ liệu).
 */
export const LUCKY_NUMBER_SCORING_RULES = {
  trongSoGoc: {
    banMenh: 0.35,
    cauTrucCapSo: 0.2,
    ngayNguHanh: 0.2,
    cung: 0.1, // chưa dùng — thiếu dữ liệu Cung Mệnh Bát Trạch
    ngayTrachCat: 0.15, // chưa dùng — lớp bổ trợ theo đặc tả, không bắt buộc
  },
  /** Hệ số nhân trọng số theo mục đích — điều chỉnh nhẹ tương quan giữa 3 lớp đang dùng. Đây
   * là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA (không trích nguồn sách cụ thể), có thể chỉnh sau này. */
  heSoTheoMucDich: {
    TONG_VAN: { banMenh: 1, cauTrucCapSo: 1, ngayNguHanh: 1 },
    TAI_LOC: { banMenh: 1.2, cauTrucCapSo: 1, ngayNguHanh: 0.8 },
    CONG_VIEC: { banMenh: 1.15, cauTrucCapSo: 1.1, ngayNguHanh: 0.85 },
    GIAO_TIEP: { banMenh: 0.9, cauTrucCapSo: 1.2, ngayNguHanh: 1.1 },
    TINH_CAM: { banMenh: 0.9, cauTrucCapSo: 1.3, ngayNguHanh: 0.9 },
  } satisfies Record<LuckyNumberPurpose, { banMenh: number; cauTrucCapSo: number; ngayNguHanh: number }>,
} as const;

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

/** Điểm quan hệ Ngũ Hành đơn giản (không phân biệt chiều) — dùng cho Số↔Bản mệnh, Số↔Ngày. */
function diemQuanHeNguHanhDonGian(a: NguHanh, b: NguHanh): number {
  const quanHe = getNguHanhQuanHe(a, b);
  switch (quanHe) {
    case "tuong-hoa":
      return 6.5;
    case "a-sinh-b":
    case "b-sinh-a":
      return 8;
    case "a-khac-b":
    case "b-khac-a":
      return 2;
  }
}

export interface LuckyNumberSimpleResult {
  diem: number;
  moTa: string;
}

export function calculateNumberPersonCompatibility(soMay: number, nguoi: NguoiTuoi): LuckyNumberSimpleResult {
  const { hangChuc, hangDonVi } = calculateNumberElement(soMay);
  const diem = (diemQuanHeNguHanhDonGian(hangChuc, nguoi.nguHanhMenh) + diemQuanHeNguHanhDonGian(hangDonVi, nguoi.nguHanhMenh)) / 2;
  return { diem: clamp10(diem), moTa: `${hangChuc}/${hangDonVi} ↔ bản mệnh ${nguoi.nguHanhMenh}` };
}

export function calculateNumberDayCompatibility(soMay: number, nguHanhNgay: NguHanh): LuckyNumberSimpleResult {
  const { hangChuc, hangDonVi } = calculateNumberElement(soMay);
  const diem = (diemQuanHeNguHanhDonGian(hangChuc, nguHanhNgay) + diemQuanHeNguHanhDonGian(hangDonVi, nguHanhNgay)) / 2;
  return { diem: clamp10(diem), moTa: `${hangChuc}/${hangDonVi} ↔ Nạp Âm ngày ${nguHanhNgay}` };
}

export interface LuckyNumberResult {
  soMay: number;
  nhan: string;
  diem: number;
  banMenh: LuckyNumberSimpleResult;
  cauTrucCapSo: CauTrucCapSoResult;
  ngay: LuckyNumberSimpleResult;
}

function tinhTrongSoDaChuanHoa(purpose: LuckyNumberPurpose): { banMenh: number; cauTrucCapSo: number; ngayNguHanh: number } {
  const R = LUCKY_NUMBER_SCORING_RULES;
  const heSo = R.heSoTheoMucDich[purpose];
  const goc = R.trongSoGoc;
  const banMenh = goc.banMenh * heSo.banMenh;
  const cauTrucCapSo = goc.cauTrucCapSo * heSo.cauTrucCapSo;
  const ngayNguHanh = goc.ngayNguHanh * heSo.ngayNguHanh;
  const tong = banMenh + cauTrucCapSo + ngayNguHanh;
  return { banMenh: banMenh / tong, cauTrucCapSo: cauTrucCapSo / tong, ngayNguHanh: ngayNguHanh / tong };
}

export function calculateLuckyNumberScore(
  soMay: number,
  nguoi: NguoiTuoi,
  nguHanhNgay: NguHanh,
  purpose: LuckyNumberPurpose = "TONG_VAN",
): LuckyNumberResult {
  const banMenh = calculateNumberPersonCompatibility(soMay, nguoi);
  const cauTrucCapSo = calculateNumberPairStructure(soMay);
  const ngay = calculateNumberDayCompatibility(soMay, nguHanhNgay);
  const trongSo = tinhTrongSoDaChuanHoa(purpose);

  const diem = clamp10(banMenh.diem * trongSo.banMenh + cauTrucCapSo.diem * trongSo.cauTrucCapSo + ngay.diem * trongSo.ngayNguHanh);

  return {
    soMay,
    nhan: formatSoMayMan(soMay),
    diem: Math.round(diem * 10) / 10,
    banMenh,
    cauTrucCapSo,
    ngay,
  };
}

export function rankLuckyNumbers(
  nguoi: NguoiTuoi,
  nguHanhNgay: NguHanh,
  purpose: LuckyNumberPurpose = "TONG_VAN",
): LuckyNumberResult[] {
  const results: LuckyNumberResult[] = [];
  for (let so = 0; so <= 99; so++) {
    results.push(calculateLuckyNumberScore(so, nguoi, nguHanhNgay, purpose));
  }
  return results.slice().sort((a, b) => b.diem - a.diem || a.soMay - b.soMay);
}

export function getTopLuckyNumbers(
  nguoi: NguoiTuoi,
  nguHanhNgay: NguHanh,
  purpose: LuckyNumberPurpose = "TONG_VAN",
  limit = 3,
): LuckyNumberResult[] {
  return rankLuckyNumbers(nguoi, nguHanhNgay, purpose).slice(0, limit);
}

export { getNguoiTuoi };
export type { NguoiTuoi };
