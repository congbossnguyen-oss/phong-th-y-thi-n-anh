/**
 * VẬN MAY TRONG NGÀY — theo `rule-engine/scoring/vanMayTrongNgay.ts`. Dùng lại
 * `tinhTuTru`/`tinhNgayInfo` đã có; "Ngũ hành ngày" lấy từ Nạp Âm của trụ Ngày (cùng cơ chế
 * suy Ngũ hành bản mệnh như `tuoiHopLamAn.ts`, để so sánh đồng nhất với Mệnh cá nhân).
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring, TrachNhat } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export interface VanMayTrongNgayInput {
  solarDate: { year: number; month: number; day: number };
  timeZone: string;
  namSinh: number;
}

export interface VanMayTrongNgayResult extends Scoring.VanMayResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  /** Tiêu chí cát tinh cá nhân (Chân Lộc/Quý Nhân/Lộc/Tam-Lục Hợp) để dễ lọc ngày. */
  catCaNhan: TrachNhat.CatTinhCaNhan;
}

function tinhMotNgay(year: number, month: number, day: number, timeZone: string, namSinh: number): VanMayTrongNgayResult {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const nguoi = Scoring.getNguoiTuoi(namSinh);

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

  const ketQua = Scoring.calculateVanMay(
    nguoi,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    tuTru.napAmNgay.element,
    dayInput,
  );

  const catCaNhan = TrachNhat.tinhCatTinhCaNhan(
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    nguoi.can,
    nguoi.chi,
  );

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua, catCaNhan };
}

export function calculateVanMayTrongNgay(input: VanMayTrongNgayInput): VanMayTrongNgayResult {
  return tinhMotNgay(input.solarDate.year, input.solarDate.month, input.solarDate.day, input.timeZone, input.namSinh);
}

export interface VanMayRangeInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  namSinh: number;
}

export interface VanMayRangeResult {
  ngayXepHang: VanMayTrongNgayResult[];
}

export function calculateVanMayRange(input: VanMayRangeInput): VanMayRangeResult {
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

  const days: VanMayTrongNgayResult[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, input.namSinh));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { ngayXepHang };
}
