/**
 * CHỌN NGÀY GIAO DỊCH / NHẬN TÀI SẢN — quét 1 khoảng ngày, chấm điểm theo
 * `rule-engine/scoring/chonNgayGiaoDich.ts` (1 engine chung, phân biệt bằng assetType/purpose),
 * xếp hạng giảm dần. Chế độ theo tuổi chủ khi có `namSinhChu`.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring, TrachNhat } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export type AssetType = Scoring.AssetType;
export type TransactionPurpose = Scoring.Purpose;

export interface ChonNgayGiaoDichRangeInput {
  assetType: AssetType;
  purpose: TransactionPurpose;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Năm sinh chủ — bỏ trống nếu chỉ cần quét ngày chung. */
  namSinhChu?: number;
}

export interface ChonNgayGiaoDichNgay extends Scoring.TransactionAssetResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  /** Tiêu chí cát tinh cá nhân theo tuổi chủ (nếu có nhập năm sinh) — để dễ lọc ngày. */
  catCaNhan?: TrachNhat.CatTinhCaNhan | null;
}

export interface ChonNgayGiaoDichRangeResult {
  assetType: AssetType;
  purpose: TransactionPurpose;
  ngayXepHang: ChonNgayGiaoDichNgay[];
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  assetType: AssetType,
  purpose: TransactionPurpose,
  chu: Scoring.NguoiTuoi | undefined,
): ChonNgayGiaoDichNgay {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);

  const dayInput = {
    trucName: ngayInfo.truc.name,
    hoangDaoHacDao: ngayInfo.hoangDaoHacDaoNgay,
    nhiThapBatTuCatHung: ngayInfo.nhiThapBatTu.catHung,
    thanSat: ngayInfo.thanSat,
    nguyetKy: ngayInfo.nguyetKy,
    tamNuong: ngayInfo.tamNuong,
    duongCongKyNhat: ngayInfo.duongCongKyNhat,
    satChu: ngayInfo.satChu,
    thienDucHop: ngayInfo.thienDucHop,
    thienXa: ngayInfo.thienXa,
  };

  const ketQua = Scoring.calculateTransactionAssetScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    tuTru.napAmNgay.element,
    assetType,
    purpose,
    chu,
  );

  const catCaNhan = chu
    ? TrachNhat.tinhCatTinhCaNhan(tuTru.tuTru.ngay.can as Data.Can, tuTru.tuTru.ngay.chi as Data.Chi, chu.can, chu.chi)
    : null;

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua, catCaNhan };
}

export function calculateChonNgayGiaoDichRange(input: ChonNgayGiaoDichRangeInput): ChonNgayGiaoDichRangeResult {
  const startMs = Date.UTC(input.startDate.year, input.startDate.month - 1, input.startDate.day);
  const endMs = Date.UTC(input.endDate.year, input.endDate.month - 1, input.endDate.day);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error("startDate/endDate không hợp lệ.");
  }
  if (endMs < startMs) {
    throw new Error("endDate phải sau hoặc bằng startDate.");
  }
  const soNgay = Math.round((endMs - startMs) / 86_400_000) + 1;
  if (soNgay > SO_NGAY_TOI_DA) {
    throw new Error(`Khoảng ngày tối đa ${SO_NGAY_TOI_DA} ngày cho 1 lần tính.`);
  }

  const chu = input.namSinhChu !== undefined ? Scoring.getNguoiTuoi(input.namSinhChu) : undefined;

  const days: ChonNgayGiaoDichNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(
      tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, input.assetType, input.purpose, chu),
    );
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { assetType: input.assetType, purpose: input.purpose, ngayXepHang };
}
