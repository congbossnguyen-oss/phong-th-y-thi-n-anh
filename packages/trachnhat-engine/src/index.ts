/**
 * Trạch Nhật Engine — điểm vào duy nhất. Xem docs/15-trach-nhat-engine.md (đã chủ dự án
 * duyệt kiến trúc/module/dependency 2026-08-09) để biết thiết kế đầy đủ.
 */

import { fail, ok } from "@thien-anh/engine-contract";
import type { EngineMeta, EngineResult } from "@thien-anh/engine-contract";
import { ENGINE_NAME, ENGINE_VERSION } from "./engine-metadata.js";
import { tinhGio12 } from "./processing/gioBang.js";
import { tinhNgayInfo } from "./processing/ngayInfo.js";
import { calculateMonthGrid } from "./processing/monthGrid.js";
import { calculateGiaoTeTiecTungRange } from "./processing/giaoTeTiecTung.js";
import { calculateDongPhongRange } from "./processing/dongPhong.js";
import { calculateTuoiHopLamAn } from "./processing/tuoiHopLamAn.js";
import { calculateGioTotTrongNgay } from "./processing/gioTotTrongNgay.js";
import { calculateVanMayTrongNgay, calculateVanMayRange } from "./processing/vanMayTrongNgay.js";
import { calculateNgayKhaiTruongRange } from "./processing/ngayKhaiTruong.js";
import { calculateNgayKyHopDongRange } from "./processing/ngayKyHopDong.js";
import { calculateNgayDaiCatCaNhan } from "./processing/ngayDaiCatCaNhan.js";
import { tinhTuTru } from "./processing/tuTru.js";
import type { TrachNhatInput, TrachNhatOutput } from "./types.js";
import { validateTrachNhatInput } from "./validation.js";

export type { MonthGridInput, MonthGridResult, MonthGridDay } from "./processing/monthGrid.js";
export { calculateMonthGrid };
export type {
  GiaoTeTiecTungRangeInput,
  GiaoTeTiecTungRangeResult,
  GiaoTeTiecTungNgay,
} from "./processing/giaoTeTiecTung.js";
export { calculateGiaoTeTiecTungRange };
export type { DongPhongRangeInput, DongPhongRangeResult, DongPhongNgay } from "./processing/dongPhong.js";
export { calculateDongPhongRange };
export type { TuoiHopLamAnInput, TuoiHopLamAnResult } from "./processing/tuoiHopLamAn.js";
export { calculateTuoiHopLamAn };
export type { GioTotTrongNgayInput, GioTotTrongNgayResult, GioTotTrongNgayGio } from "./processing/gioTotTrongNgay.js";
export { calculateGioTotTrongNgay };
export type { VanMayTrongNgayInput, VanMayTrongNgayResult, VanMayRangeInput, VanMayRangeResult } from "./processing/vanMayTrongNgay.js";
export { calculateVanMayTrongNgay, calculateVanMayRange };
export type { NgayKhaiTruongRangeInput, NgayKhaiTruongRangeResult, NgayKhaiTruongNgay } from "./processing/ngayKhaiTruong.js";
export { calculateNgayKhaiTruongRange };
export type { NgayKyHopDongRangeInput, NgayKyHopDongRangeResult, NgayKyHopDongNgay } from "./processing/ngayKyHopDong.js";
export { calculateNgayKyHopDongRange };
export type { NgayDaiCatCaNhanInput, NgayDaiCatCaNhanResult, NgayDaiCatCaNhanNgay } from "./processing/ngayDaiCatCaNhan.js";
export { calculateNgayDaiCatCaNhan };

export * from "./types.js";

/** Version `@thien-anh/calendar-core` đang dùng — giữ đồng bộ tay với calendar-core/package.json. */
const CORE_CALENDAR_VERSION = "0.1.0";

function buildMeta(): EngineMeta {
  return {
    engine: ENGINE_NAME,
    engineVersion: ENGINE_VERSION,
    coreCalendarVersion: CORE_CALENDAR_VERSION,
    calculatedAt: new Date().toISOString(),
  };
}

export function calculate(input: TrachNhatInput): EngineResult<TrachNhatOutput> {
  const errors = validateTrachNhatInput(input);
  if (errors.length > 0) {
    return fail(errors, buildMeta());
  }

  const tuTru = tinhTuTru(input);
  const ngayInfo = tinhNgayInfo(tuTru);
  const gio12 = tinhGio12({
    julianDayNumber: tuTru.julianDayNumber,
    dayChiIndex: tuTru.dayChiIndex,
    lunarMonth: tuTru.lunarDate.month,
    lunarDay: tuTru.lunarDate.day,
  });

  const output: TrachNhatOutput = {
    solarDate: input.solarDate,
    lunarDate: tuTru.lunarDate,
    julianDayNumber: tuTru.julianDayNumber,
    tietKhi: tuTru.tietKhi,
    tuTru: tuTru.tuTru,
    truc: ngayInfo.truc,
    nhiThapBatTu: ngayInfo.nhiThapBatTu,
    hoangDaoHacDaoNgay: ngayInfo.hoangDaoHacDaoNgay,
    thanSat: ngayInfo.thanSat,
    tuoiXungNgay: ngayInfo.tuoiXungNgay,
    nguyetKy: ngayInfo.nguyetKy,
    tamNuong: ngayInfo.tamNuong,
    duongCongKyNhat: ngayInfo.duongCongKyNhat,
    nhomTuoiPhamTamTai: ngayInfo.nhomTuoiPhamTamTai,
    satChu: ngayInfo.satChu,
    canNamSinhKyKimThanThatSat: ngayInfo.canNamSinhKyKimThanThatSat,
    chiNgayKyKimThanThatSatTheoNam: ngayInfo.chiNgayKyKimThanThatSatTheoNam,
    bachKyNgay: ngayInfo.bachKyNgay,
    catTocDep: ngayInfo.catTocDep,
    thienDucHop: ngayInfo.thienDucHop,
    thienXa: ngayInfo.thienXa,
    phamThaiTue: ngayInfo.phamThaiTue,
    gio12,
  };

  return ok(output, buildMeta());
}
