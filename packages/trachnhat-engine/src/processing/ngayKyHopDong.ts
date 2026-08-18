/**
 * NGÀY KÝ HỢP ĐỒNG — quét 1 khoảng ngày, chấm điểm theo `rule-engine/scoring/ngayKyHopDong.ts`,
 * xếp hạng giảm dần. Chế độ theo người ký khi có `namSinhNguoiKy`.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export interface NgayKyHopDongRangeInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Năm sinh người ký — bỏ trống nếu chỉ cần ngày ký hợp đồng chung. */
  namSinhNguoiKy?: number;
}

export interface NgayKyHopDongNgay extends Scoring.KyHopDongResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
}

export interface NgayKyHopDongRangeResult {
  ngayXepHang: NgayKyHopDongNgay[];
}

function tinhMotNgay(year: number, month: number, day: number, timeZone: string, nguoiKy: Scoring.NguoiTuoi | undefined): NgayKyHopDongNgay {
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

  const ketQua = Scoring.calculateKyHopDongScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    tuTru.napAmNgay.element,
    nguoiKy,
  );

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua };
}

export function calculateNgayKyHopDongRange(input: NgayKyHopDongRangeInput): NgayKyHopDongRangeResult {
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

  const nguoiKy = input.namSinhNguoiKy !== undefined ? Scoring.getNguoiTuoi(input.namSinhNguoiKy) : undefined;

  const days: NgayKyHopDongNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, nguoiKy));
  }

  let ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  // XUNG tuổi người ký = LOẠI HẲN (chủ dự án chốt 2026-08-19). Chỉ loại trực xung Địa Chi;
  // Hình/Hại/Phá vẫn giữ. Chỉ áp khi có năm sinh người ký.
  if (nguoiKy) ngayXepHang = ngayXepHang.filter((d) => !d.nguoiKy?.chi.xung);
  return { ngayXepHang };
}
