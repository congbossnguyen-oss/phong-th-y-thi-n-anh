/**
 * Trạch Nhật Engine — điểm vào duy nhất. Xem docs/15-trach-nhat-engine.md (đã chủ dự án
 * duyệt kiến trúc/module/dependency 2026-08-09) để biết thiết kế đầy đủ.
 */

import { fail, ok } from "@thien-anh/engine-contract";
import type { EngineMeta, EngineResult } from "@thien-anh/engine-contract";
import { ENGINE_NAME, ENGINE_VERSION } from "./engine-metadata.js";
import { tinhGio12 } from "./processing/gioBang.js";
import { tinhNgayInfo } from "./processing/ngayInfo.js";
import { tinhTuTru } from "./processing/tuTru.js";
import type { TrachNhatInput, TrachNhatOutput } from "./types.js";
import { validateTrachNhatInput } from "./validation.js";

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
    gio12,
  };

  return ok(output, buildMeta());
}
