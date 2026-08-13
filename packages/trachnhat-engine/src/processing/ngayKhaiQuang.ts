/**
 * NGÀY GIỜ KHAI QUANG – AN VỊ VẬT PHẨM — quét 1 khoảng ngày, chấm điểm theo
 * `rule-engine/scoring/ngayKhaiQuang.ts` (5 mục đích: KHAI_QUANG/AN_VI/THINH/DAT_VAT_PHAM/
 * BAT_DAU_SU_DUNG), xếp hạng giảm dần. Năm sinh + giới tính chủ BẮT BUỘC (khác các module trước
 * — không có nhánh "không tuổi") vì lớp cá nhân hóa luôn được tính theo đúng spec module.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export type KhaiQuangPurpose = Scoring.KhaiQuangPurpose;
export type KhaiQuangItemType = Scoring.KhaiQuangItemType;
export type KhaiQuangGender = Scoring.KhaiQuangGender;

export interface NgayKhaiQuangRangeInput {
  purpose: KhaiQuangPurpose;
  itemType: KhaiQuangItemType;
  namSinhChu: number;
  gioiTinhChu: KhaiQuangGender;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
}

export interface NgayKhaiQuangNgay extends Scoring.KhaiQuangResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
}

export interface NgayKhaiQuangRangeResult {
  purpose: KhaiQuangPurpose;
  itemType: KhaiQuangItemType;
  ngayXepHang: NgayKhaiQuangNgay[];
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  purpose: KhaiQuangPurpose,
  itemType: KhaiQuangItemType,
  nguoi: Scoring.NguoiTuoi,
): NgayKhaiQuangNgay {
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

  const ketQua = Scoring.calculateKhaiQuangScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    purpose,
    itemType,
    nguoi,
  );

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua };
}

export function calculateNgayKhaiQuangRange(input: NgayKhaiQuangRangeInput): NgayKhaiQuangRangeResult {
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
  if (!Number.isInteger(input.namSinhChu) || input.namSinhChu < 1900 || input.namSinhChu > 2100) {
    throw new Error("Năm sinh chủ không hợp lệ.");
  }

  const nguoi = Scoring.getNguoiTuoi(input.namSinhChu);

  const days: NgayKhaiQuangNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, input.purpose, input.itemType, nguoi));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { purpose: input.purpose, itemType: input.itemType, ngayXepHang };
}
