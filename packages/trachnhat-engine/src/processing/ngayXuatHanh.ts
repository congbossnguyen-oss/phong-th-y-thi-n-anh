/**
 * NGÀY TỐT XUẤT HÀNH — quét 1 khoảng ngày, chấm điểm theo `rule-engine/scoring/ngayXuatHanh.ts`,
 * xếp hạng giảm dần. Năm sinh KHÔNG bắt buộc — để trống vẫn tính được ngày xuất hành chung,
 * không phải lỗi validation (đúng yêu cầu đặc tả).
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export interface NgayXuatHanhRangeInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Năm sinh người xuất hành — không bắt buộc, để trống thì chỉ tính ngày chung. */
  namSinh?: number;
}

export interface NgayXuatHanhNgay extends Scoring.XuatHanhResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
}

export interface NgayXuatHanhRangeResult {
  ngayXepHang: NgayXuatHanhNgay[];
}

function tinhMotNgay(year: number, month: number, day: number, timeZone: string, nguoi: Scoring.NguoiTuoi | undefined): NgayXuatHanhNgay {
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

  const ketQua = Scoring.calculateXuatHanhScore(dayInput, tuTru.tuTru.ngay.can as Data.Can, tuTru.tuTru.ngay.chi as Data.Chi, nguoi);

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua };
}

export function calculateNgayXuatHanhRange(input: NgayXuatHanhRangeInput): NgayXuatHanhRangeResult {
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

  const nguoi = input.namSinh !== undefined ? Scoring.getNguoiTuoi(input.namSinh) : undefined;

  const days: NgayXuatHanhNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, nguoi));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { ngayXepHang };
}
