/**
 * Trực, 28 Tú, Hoàng-Hắc theo ngày, Thần Sát, tuổi xung — theo docs/15-trach-nhat-engine.md
 * mục 2.3, gọi thuần `rule-engine` (nhóm `trach-nhat`) với Chi/tháng âm lịch/JDN đã có từ
 * `tuTru.ts`.
 */

import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { CatHungValue } from "../types.js";
import type { TuTruResult } from "./tuTru.js";

type Chi = Data.Chi;
type Can = Data.Can;

export interface NgayInfoResult {
  truc: { index: number; name: string };
  nhiThapBatTu: { index: number; name: string; catHung: "cát" | "hung" };
  hoangDaoHacDaoNgay: "hoàng đạo" | "hắc đạo" | "không xác định";
  thanSat: CatHungValue[];
  tuoiXungNgay: string[];
  nguyetKy: boolean;
  tamNuong: boolean;
  duongCongKyNhat: boolean;
  nhomTuoiPhamTamTai: string[][];
  satChu: boolean;
  canNamSinhKyKimThanThatSat: string[];
  bachKyNgay: { nhan: string; viec: string }[];
  ngayGoiDauTot: boolean;
  catTocDep: boolean;
  thienDucHop: boolean;
  thienXa: boolean;
}

export function tinhNgayInfo(tuTru: TuTruResult): NgayInfoResult {
  const dayChi = tuTru.tuTru.ngay.chi as Chi;
  const dayCan = tuTru.tuTru.ngay.can as Can;
  const lunarMonth = tuTru.lunarDate.month;

  const truc = TrachNhat.getTruc(tuTru.dayChiIndex, tuTru.monthOrderIndex);
  const nhiThapBatTu = TrachNhat.getNhiThapBatTu(tuTru.julianDayNumber);
  const hoangDaoHacDaoNgay = TrachNhat.getNgayHoangDaoHacDao(lunarMonth, tuTru.dayChiIndex);
  const thanSat = TrachNhat.getThanSatTrongNgay(lunarMonth, dayChi);
  const xungChi = TrachNhat.getLucXungChi(dayChi);
  const nguyetKy = TrachNhat.isNguyetKy(tuTru.lunarDate.day);
  const tamNuong = TrachNhat.isTamNuong(tuTru.lunarDate.day);
  const duongCongKyNhat = TrachNhat.isDuongCongKyNhat(tuTru.lunarDate.month, tuTru.lunarDate.day);
  const nhomTuoiPhamTamTai = TrachNhat.getNhomTuoiPhamTamTai(tuTru.tuTru.nam.chi as Chi);
  const satChu = TrachNhat.isSatChuNgay(dayChi, tuTru.monthOrderIndex);
  const canNamSinhKyKimThanThatSat = TrachNhat.getCanNamSinhKyKimThanThatSat(dayChi);
  const bachKyNgay = TrachNhat.getBachKyNgay(dayCan, dayChi);
  const ngayGoiDauTot = TrachNhat.isNgayGoiDauTot(tuTru.lunarDate.day, truc.name);
  const catTocDep = TrachNhat.isNgayDepCatToc(
    truc.name,
    thanSat.map((entry) => entry.name),
  );
  const thienDucHop = TrachNhat.isThienDucHopNgay(lunarMonth, dayCan, dayChi);
  const thienXa = TrachNhat.isThienXaNgay(lunarMonth, dayCan, dayChi);

  return {
    truc: { index: truc.index, name: truc.name },
    nhiThapBatTu: { index: nhiThapBatTu.index, name: nhiThapBatTu.name, catHung: nhiThapBatTu.catHung },
    hoangDaoHacDaoNgay,
    thanSat: thanSat.map((entry) => ({ name: entry.name, catHung: entry.catHung })),
    tuoiXungNgay: [xungChi],
    nguyetKy,
    tamNuong,
    duongCongKyNhat,
    nhomTuoiPhamTamTai: nhomTuoiPhamTamTai.map((g) => [...g]),
    satChu,
    canNamSinhKyKimThanThatSat: [...canNamSinhKyKimThanThatSat],
    bachKyNgay,
    ngayGoiDauTot,
    catTocDep,
    thienDucHop,
    thienXa,
  };
}
