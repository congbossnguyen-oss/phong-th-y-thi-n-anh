/**
 * GIỜ TỐT TRONG NGÀY — tính đủ 12 giờ Địa Chi của 1 ngày rồi xếp hạng, theo
 * `rule-engine/scoring/gioTotTrongNgay.ts`. Dùng lại `tinhTuTru`/`tinhNgayInfo`/`tinhGio12` đã
 * có — module này chỉ đưa dữ liệu qua hàm chấm điểm, không tự tính lại Can Chi/Hoàng-Hắc.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";
import { tinhGio12 } from "./gioBang.js";

type Chi = Data.Chi;

const KHUNG_GIO: readonly string[] = [
  "23:00–01:00",
  "01:00–03:00",
  "03:00–05:00",
  "05:00–07:00",
  "07:00–09:00",
  "09:00–11:00",
  "11:00–13:00",
  "13:00–15:00",
  "15:00–17:00",
  "17:00–19:00",
  "19:00–21:00",
  "21:00–23:00",
];

export interface GioTotTrongNgayInput {
  solarDate: { year: number; month: number; day: number };
  timeZone: string;
  purpose?: Scoring.GioPurpose;
  /** Năm sinh cá nhân — bỏ trống nếu chỉ cần giờ tốt chung. */
  namSinh?: number;
}

export interface GioTotTrongNgayGio extends Scoring.GioTotResult {
  chiGio: Chi;
  canGio: string;
  khungGio: string;
}

export interface GioTotTrongNgayResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  purpose: Scoring.GioPurpose;
  gioXepHang: GioTotTrongNgayGio[];
}

export function calculateGioTotTrongNgay(input: GioTotTrongNgayInput): GioTotTrongNgayResult {
  const tuTru = tinhTuTru({ solarDate: input.solarDate, timeZone: input.timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const gio12 = tinhGio12({
    julianDayNumber: tuTru.julianDayNumber,
    dayChiIndex: tuTru.dayChiIndex,
    lunarMonth: tuTru.lunarDate.month,
    lunarDay: tuTru.lunarDate.day,
  });

  const nenTrachCatNgayDiem = Scoring.tinhTrachCatDayBase(
    {
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
    },
    Scoring.GIO_SCORING_RULES.nenTrachCatNgay,
  ).diem;

  const nguoi = input.namSinh !== undefined ? Scoring.getNguoiTuoi(input.namSinh) : undefined;
  const purpose = input.purpose ?? "GENERAL";

  const gioXepHang: GioTotTrongNgayGio[] = gio12.map((g, chiIndex) => {
    const ketQua = Scoring.calculateHourScore({
      dayCan: tuTru.tuTru.ngay.can as Data.Can,
      dayChi: tuTru.tuTru.ngay.chi as Chi,
      gioCan: g.canChiGio.can as Data.Can,
      gioChi: g.chiGio as Chi,
      hoangHacGio: g.hoangDaoHacDaoGio,
      tieuLucNhamGio: g.tieuLucNhamGio,
      nenTrachCatNgayDiem,
      purpose,
      nguoi,
    });

    return {
      chiGio: g.chiGio as Chi,
      canGio: g.canChiGio.can,
      khungGio: KHUNG_GIO[chiIndex]!,
      ...ketQua,
    };
  });

  gioXepHang.sort((a, b) => b.diem - a.diem);

  return {
    solarDate: input.solarDate,
    lunarDate: tuTru.lunarDate,
    purpose,
    gioXepHang,
  };
}
