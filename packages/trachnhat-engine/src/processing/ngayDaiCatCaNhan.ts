/**
 * NGÀY ĐẠI CÁT CÁ NHÂN — quét 1 khoảng ngày (thực tế dùng ranh giới THÁNG DƯƠNG LỊCH, cùng quy
 * ước với các module quét-tháng khác trên trang — đặc tả gốc nói "tháng âm lịch" nhưng để nhất
 * quán với `giao-te-tiec-tung`/`dong-phong`/`ngay-khai-truong`/`ngay-ky-hop-dong` đã có, chọn
 * theo tháng dương lịch), chấm điểm theo `rule-engine/scoring/ngayDaiCatCaNhan.ts`, trả về xếp
 * hạng đầy đủ + top 3-5 ngày tốt nhất + (nếu có) 2-3 ngày nên tránh.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;
const SO_NGAY_TOT_NHAT = 5;
const SO_NGAY_NEN_TRANH = 3;
const NGUONG_NEN_TRANH = 4;

export interface NgayDaiCatCaNhanInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  namSinh: number;
  purpose?: Scoring.NgayDaiCatPurpose;
}

export interface NgayDaiCatCaNhanNgay extends Scoring.PersonalDayScoreResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
}

export interface NgayDaiCatCaNhanResult {
  purpose: Scoring.NgayDaiCatPurpose;
  ngayXepHang: NgayDaiCatCaNhanNgay[];
  ngayTotNhat: NgayDaiCatCaNhanNgay[];
  ngayNenTranh: NgayDaiCatCaNhanNgay[];
}

function tinhMotNgay(year: number, month: number, day: number, timeZone: string, namSinh: number, purpose: Scoring.NgayDaiCatPurpose): NgayDaiCatCaNhanNgay {
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

  const ketQua = Scoring.calculatePersonalDayScore(
    nguoi,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    tuTru.napAmNgay.element,
    dayInput,
    purpose,
  );

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, ...ketQua };
}

export function calculateNgayDaiCatCaNhan(input: NgayDaiCatCaNhanInput): NgayDaiCatCaNhanResult {
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

  const purpose = input.purpose ?? "TONG_VAN";

  const days: NgayDaiCatCaNhanNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, input.namSinh, purpose));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  const ngayTotNhat = ngayXepHang.slice(0, SO_NGAY_TOT_NHAT);
  const ngayNenTranh = [...days]
    .filter((n) => n.diem < NGUONG_NEN_TRANH || n.nenTrachCat.phamDaiKy)
    .sort((a, b) => a.diem - b.diem)
    .slice(0, SO_NGAY_NEN_TRANH);

  return { purpose, ngayXepHang, ngayTotNhat, ngayNenTranh };
}
