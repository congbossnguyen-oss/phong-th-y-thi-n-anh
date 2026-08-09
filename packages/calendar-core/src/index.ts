/**
 * @thien-anh/calendar-core — Core Calendar Engine.
 *
 * Điểm vào công khai của thư viện. Cung cấp hai tầng API:
 *
 * 1. TẦNG THÂN THIỆN (các hàm `get*` xuất trực tiếp ở file này): nhận vào ngày-giờ dân sự
 *    + tên múi giờ IANA (`DateTimeInput`), tự lo mọi quy đổi Julian Day/UTC offset bên
 *    trong. Đây là API mà các module nghiệp vụ (Bát Tự, Tử Vi, Kinh Dịch, Mai Hoa Dịch Số,
 *    Lục Hào, Kỳ Môn Độn Giáp, Trạch Nhật, Huyền Không...) nên dùng.
 *
 * 2. TẦNG LÕI (namespace `Astronomy`, `Calendar`, `Timezone`, `Utils`, `Data`): expose toàn
 *    bộ hàm cấp thấp thao tác trực tiếp trên Julian Day/kinh độ mặt trời, dành cho các
 *    module cần kiểm soát chi tiết hơn (vd. Kỳ Môn Độn Giáp cần trực tiếp astronomy/solar.ts
 *    để tính Cục số, hoặc Huyền Không cần Calendar.getSolarTerms() độc lập với timezone).
 */

import {
  dateTimeToJulianDay,
  julianDayNumber as computeJulianDayNumber,
} from "./astronomy/julianDay.js";
import {
  getGanzhiYear as coreGetGanzhiYear,
  getGanzhiMonth as coreGetGanzhiMonth,
  getGanzhiDay as coreGetGanzhiDay,
  getGanzhiHour as coreGetGanzhiHour,
  type GanzhiPillar,
  type GanzhiYearOptions,
  type GanzhiHourOptions,
} from "./calendar/ganzhi.js";
import { convertSolarToLunar, convertLunarToSolar, type LunarDate } from "./calendar/lunarCalendar.js";
import { getSolarTerms as coreGetSolarTerms, type SolarTermOccurrence } from "./calendar/solarTerms.js";
import { zonedTimeToUtc, getUtcOffsetMinutes, type WallClockDateTime } from "./timezone/timezone.js";
import type { CalendarDate } from "./astronomy/julianDay.js";
import type { DateTimeInput, GetCanChiOptions, FullCanChiResult, JulianDayResult } from "./types.js";
import { validateDateTimeInput, validateLunarDateInput, InvalidDateTimeInputError } from "./validation.js";

export * from "./types.js";
export type { GanzhiPillar } from "./calendar/ganzhi.js";
export type { LunarDate } from "./calendar/lunarCalendar.js";
export type { SolarTermOccurrence } from "./calendar/solarTerms.js";
export { InvalidDateTimeInputError, isValidCalendarDate } from "./validation.js";

// ---------------------------------------------------------------------------------------
// Tầng lõi: expose theo namespace để tránh xung đột tên với các hàm thân thiện bên dưới,
// đồng thời phản ánh đúng kiến trúc module bắt buộc (astronomy/calendar/timezone/utils/data).
// ---------------------------------------------------------------------------------------
import * as Astronomy from "./astronomy/index.js";
import * as Calendar from "./calendar/index.js";
import * as Timezone from "./timezone/index.js";
import * as Utils from "./utils/index.js";
import * as Data from "./data/index.js";
export { Astronomy, Calendar, Timezone, Utils, Data };

/** Quy đổi `DateTimeInput` (giờ dân sự + timezone IANA) sang các mốc Julian Day cần thiết nội bộ. */
function resolveDateTime(input: DateTimeInput): {
  jdUT: number;
  jdn: number;
  utcOffsetHours: number;
  localHour: number;
} {
  validateDateTimeInput(input);

  const local: WallClockDateTime = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour ?? 0,
    minute: input.minute ?? 0,
    second: input.second ?? 0,
  };

  const utcInstant = zonedTimeToUtc(local, input.timeZone);
  const utcOffsetHours = getUtcOffsetMinutes(input.timeZone, utcInstant) / 60;
  const jdUT = dateTimeToJulianDay(local, utcOffsetHours);
  const jdn = computeJulianDayNumber(input.year, input.month, input.day);

  return { jdUT, jdn, utcOffsetHours, localHour: local.hour };
}

/** Julian Day (UT, số thực) và Julian Day Number (số nguyên) của một thời điểm dân sự. */
export function getJulianDay(input: DateTimeInput): JulianDayResult {
  const { jdUT, jdn } = resolveDateTime(input);
  return { julianDay: jdUT, julianDayNumber: jdn };
}

/** Can Chi Năm (mặc định: ranh giới Lập Xuân, chuẩn Tứ Trụ/Bát Tự). */
export function getGanzhiYear(input: DateTimeInput, options?: GanzhiYearOptions): GanzhiPillar {
  const { jdUT } = resolveDateTime(input);
  return coreGetGanzhiYear(jdUT, options);
}

/** Can Chi Tháng (ranh giới 12 Tiết, tính theo kinh độ mặt trời). */
export function getGanzhiMonth(input: DateTimeInput): GanzhiPillar {
  const { jdUT } = resolveDateTime(input);
  return coreGetGanzhiMonth(jdUT);
}

/** Can Chi Ngày. */
export function getGanzhiDay(input: DateTimeInput): GanzhiPillar {
  const { jdn } = resolveDateTime(input);
  return coreGetGanzhiDay(jdn);
}

/** Can Chi Giờ. */
export function getGanzhiHour(input: DateTimeInput, options?: GanzhiHourOptions): GanzhiPillar {
  const { jdn, localHour } = resolveDateTime(input);
  return coreGetGanzhiHour(jdn, localHour, options);
}

/** Tứ Trụ đầy đủ (Năm-Tháng-Ngày-Giờ Can Chi) trong một lần gọi. */
export function getCanChi(input: DateTimeInput, options: GetCanChiOptions = {}): FullCanChiResult {
  const { jdUT, jdn, localHour } = resolveDateTime(input);
  return {
    year: coreGetGanzhiYear(jdUT, options.yearOptions),
    month: coreGetGanzhiMonth(jdUT),
    day: coreGetGanzhiDay(jdn),
    hour: coreGetGanzhiHour(jdn, localHour, options.hourOptions),
    julianDay: jdUT,
    julianDayNumber: jdn,
  };
}

/** Âm lịch Việt Nam tương ứng một ngày Dương lịch (theo giờ địa phương của `timeZone`). */
export function getLunarDate(input: DateTimeInput): LunarDate {
  const { utcOffsetHours } = resolveDateTime(input);
  return convertSolarToLunar(input.year, input.month, input.day, utcOffsetHours);
}

/**
 * Ngày Dương lịch tương ứng một ngày Âm lịch cho trước, quy đổi theo múi giờ `timeZone`.
 * Vì bản thân offset UTC phụ thuộc thời điểm chính xác (chưa biết trước khi giải bài toán
 * ngược), hàm dùng offset tại giữa trưa ngày 15/6 của năm dương lịch trùng với năm âm lịch
 * làm mốc tính offset — đủ chính xác cho các múi giờ không đổi lịch DST theo mùa như
 * Asia/Ho_Chi_Minh; với múi giờ có DST, nên truyền `timeZone` không áp dụng DST cho lịch
 * truyền thống (thường không phải vấn đề trong thực tế vì Âm lịch chỉ dùng ở các múi giờ
 * Đông Á, vốn không dùng DST).
 */
export function getSolarDateFromLunar(
  lunar: { day: number; month: number; year: number; isLeapMonth: boolean },
  timeZone: string,
): CalendarDate {
  validateLunarDateInput(lunar, timeZone);

  const referenceInstant = zonedTimeToUtc(
    { year: lunar.year, month: 6, day: 15, hour: 12, minute: 0, second: 0 },
    timeZone,
  );
  const utcOffsetHours = getUtcOffsetMinutes(timeZone, referenceInstant) / 60;
  return convertLunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeapMonth, utcOffsetHours);
}

/** Toàn bộ 24 Tiết Khí của một năm dương lịch, tính chính xác bằng thuật toán thiên văn. */
export function getSolarTerms(year: number): SolarTermOccurrence[] {
  if (!Number.isInteger(year)) {
    throw new InvalidDateTimeInputError(`Năm không hợp lệ: ${year} (phải là số nguyên).`);
  }
  return coreGetSolarTerms(year);
}
