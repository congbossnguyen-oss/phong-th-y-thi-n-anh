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

export interface NgayInfoResult {
  truc: { index: number; name: string };
  nhiThapBatTu: { index: number; name: string; catHung: "cát" | "hung" };
  hoangDaoHacDaoNgay: "hoàng đạo" | "hắc đạo" | "không xác định";
  thanSat: CatHungValue[];
  tuoiXungNgay: string[];
}

export function tinhNgayInfo(tuTru: TuTruResult): NgayInfoResult {
  const dayChi = tuTru.tuTru.ngay.chi as Chi;
  const lunarMonth = tuTru.lunarDate.month;

  const truc = TrachNhat.getTruc(tuTru.dayChiIndex, tuTru.monthOrderIndex);
  const nhiThapBatTu = TrachNhat.getNhiThapBatTu(tuTru.julianDayNumber);
  const hoangDaoHacDaoNgay = TrachNhat.getNgayHoangDaoHacDao(lunarMonth, tuTru.dayChiIndex);
  const thanSat = TrachNhat.getThanSatTrongNgay(lunarMonth, dayChi);
  const xungChi = TrachNhat.getLucXungChi(dayChi);

  return {
    truc: { index: truc.index, name: truc.name },
    nhiThapBatTu: { index: nhiThapBatTu.index, name: nhiThapBatTu.name, catHung: nhiThapBatTu.catHung },
    hoangDaoHacDaoNgay,
    thanSat: thanSat.map((entry) => ({ name: entry.name, catHung: entry.catHung })),
    tuoiXungNgay: [xungChi],
  };
}
