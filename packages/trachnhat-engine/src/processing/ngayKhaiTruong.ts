/**
 * NGÀY KHAI TRƯƠNG — quét 1 khoảng ngày, chấm điểm theo `rule-engine/scoring/ngayKhaiTruong.ts`,
 * xếp hạng giảm dần. Chế độ theo tuổi chủ khi có `namSinhChu`.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export interface NgayKhaiTruongRangeInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Năm sinh chủ — bỏ trống nếu chỉ cần khai trương chung. */
  namSinhChu?: number;
}

export interface NgayKhaiTruongNgay extends Scoring.KhaiTruongResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
}

export interface NgayKhaiTruongRangeResult {
  ngayXepHang: NgayKhaiTruongNgay[];
}

function tinhMotNgay(year: number, month: number, day: number, timeZone: string, chu: Scoring.NguoiTuoi | undefined): NgayKhaiTruongNgay {
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

  const ketQua = Scoring.calculateKhaiTruongScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    tuTru.napAmNgay.element,
    chu,
  );

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua };
}

export function calculateNgayKhaiTruongRange(input: NgayKhaiTruongRangeInput): NgayKhaiTruongRangeResult {
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

  const days: NgayKhaiTruongNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, chu));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { ngayXepHang };
}
