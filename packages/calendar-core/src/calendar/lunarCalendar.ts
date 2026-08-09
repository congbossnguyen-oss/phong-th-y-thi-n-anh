/**
 * Âm Lịch Việt Nam — chuyển đổi hai chiều Dương lịch <-> Âm lịch, có xử lý tháng nhuận.
 *
 * Quy tắc truyền thống được cài đặt CHÍNH XÁC (không suy luận gần đúng):
 *
 * 1. Mỗi tháng âm lịch bắt đầu vào đúng ngày (theo giờ địa phương) chứa thời điểm Sóc
 *    (New Moon) — astronomy/lunar.ts.
 * 2. "Tháng 11" của một năm âm lịch luôn là tháng CHỨA Đông Chí (kinh độ mặt trời 270°).
 *    Đây là điểm neo (anchor) để tính lùi/tính tiến ra toàn bộ 12 (hoặc 13) tháng còn lại.
 * 3. Tháng nhuận: nếu khoảng cách giữa "tháng 11" năm nay và "tháng 11" năm sau chứa TỚI
 *    13 kỳ trăng non (thay vì 12) thì năm đó có 1 tháng nhuận. Tháng nhuận là tháng đầu
 *    tiên (sau tháng 11) KHÔNG chứa Trung Khí (12 mốc 30° kinh độ: Xuân Phân, Cốc Vũ,...).
 *
 * Thuật toán này tương đương về bản chất với thuật toán âm lịch Việt Nam được công bố bởi
 * Hồ Ngọc Đức (Đại học Leipzig), vốn dựa trên Jean Meeus "Astronomical Algorithms" — cài
 * đặt lại ở đây bằng các hàm thiên văn tự viết trong astronomy/ thay vì bảng tra.
 *
 * Về múi giờ: âm lịch truyền thống dùng một OFFSET UTC CỐ ĐỊNH (không có giờ mùa hè/DST)
 * làm mốc quy đổi "ngày Sóc rơi vào ngày dương lịch nào". Việt Nam dùng UTC+7 từ 13/8/1968
 * trở về sau; TRƯỚC đó dùng UTC+8 (cùng múi giờ Trung Quốc). Việc chọn offset đúng theo
 * mốc lịch sử này là trách nhiệm của tầng gọi (xem timezone/), module này chỉ nhận một
 * `utcOffsetHours` cho trước và tính đúng theo offset đó.
 */

import {
  julianDayNumber,
  julianDayNumberToCalendarDate,
  type CalendarDate,
} from "../astronomy/julianDay.js";
import {
  newMoonJulianDay,
  SYNODIC_MONTH_DAYS,
  approximateLunationNumber,
  nearestLunationNumber,
} from "../astronomy/lunar.js";
import { majorTermSector } from "./solarTerms.js";

export interface LunarDate {
  day: number;
  month: number; // 1-12
  year: number;
  isLeapMonth: boolean;
}

/** JDN (quy ước lịch địa phương) của lần Sóc thứ `k`, quy đổi theo `utcOffsetHours` cố định. */
function newMoonDayJdn(k: number, utcOffsetHours: number): number {
  const jdUT = newMoonJulianDay(k);
  return Math.floor(jdUT + 0.5 + utcOffsetHours / 24);
}

/** Sector 30° kinh độ mặt trời (0-11) tại 0h giờ địa phương của ngày JDN `dayNumberJdn`. */
function sunSectorAtLocalMidnight(dayNumberJdn: number, utcOffsetHours: number): number {
  const jdUT = dayNumberJdn - 0.5 - utcOffsetHours / 24;
  return majorTermSector(jdUT);
}

/**
 * JDN của ngày bắt đầu "tháng 11" âm lịch (tháng chứa Đông Chí) của năm dương lịch `yyyy`.
 * Tìm bằng cách: ước lượng lần Sóc gần 31/12 nhất, rồi kiểm tra xem Sóc đó có nằm TRƯỚC
 * Đông Chí hay không (sector mặt trời tại ngày Sóc >= 9, tức đã qua Đại Tuyết) — nếu Sóc
 * ước lượng rơi sau Đông Chí thì lùi lại 1 tháng.
 */
function lunarMonth11Jdn(yyyy: number, utcOffsetHours: number): number {
  const dec31Jdn = julianDayNumber(yyyy, 12, 31);
  const k = approximateLunationNumber(dec31Jdn);

  let newMoonDay = newMoonDayJdn(k, utcOffsetHours);
  const sector = sunSectorAtLocalMidnight(newMoonDay, utcOffsetHours);

  if (sector >= 9) {
    // Sóc này đã ở sector Tiểu Hàn/Đại Hàn trở lên (>= sector 9 = Tiểu Hàn) -> quá muộn,
    // "tháng 11" thực sự phải là lần Sóc TRƯỚC đó.
    newMoonDay = newMoonDayJdn(k - 1, utcOffsetHours);
  }

  return newMoonDay;
}

/**
 * Độ lệch (tính bằng số tháng) của tháng nhuận so với "tháng 11" `a11Jdn`, trong năm âm
 * lịch có 13 kỳ trăng non. Dò tiến từng tháng kể từ sau tháng 11, tìm tháng đầu tiên có
 * cùng sector Trung Khí với tháng liền trước nó (nghĩa là tháng đó "không có Trung Khí
 * riêng" — bị tháng sau đè lên số Trung Khí — chính là dấu hiệu tháng nhuận).
 */
function leapMonthOffset(a11Jdn: number, utcOffsetHours: number): number {
  const k = nearestLunationNumber(a11Jdn);

  // Sector Trung Khí (0-11) của từng tháng liên tiếp sau tháng 11, bắt đầu từ i=1.
  // Dò tới khi gặp 2 tháng liên tiếp CÙNG sector (tháng ở giữa không có Trung Khí riêng,
  // bị "nhảy cóc" qua một mốc Trung Khí) — đó chính là dấu hiệu tháng nhuận.
  let i = 1;
  let arc = sunSectorAtLocalMidnight(newMoonDayJdn(k + i, utcOffsetHours), utcOffsetHours);
  let last: number;

  do {
    last = arc;
    i++;
    arc = sunSectorAtLocalMidnight(newMoonDayJdn(k + i, utcOffsetHours), utcOffsetHours);
  } while (arc !== last && i < 14);

  return i - 1;
}

/**
 * Chuyển một ngày Dương lịch sang Âm lịch Việt Nam.
 * @param utcOffsetHours Offset UTC cố định dùng làm mốc quy đổi (vd. 7 cho Việt Nam hiện đại).
 */
export function convertSolarToLunar(
  year: number,
  month: number,
  day: number,
  utcOffsetHours: number,
): LunarDate {
  const dayNumber = julianDayNumber(year, month, day);
  const k = approximateLunationNumber(dayNumber);

  let monthStart = newMoonDayJdn(k + 1, utcOffsetHours);
  if (monthStart > dayNumber) {
    monthStart = newMoonDayJdn(k, utcOffsetHours);
  }

  let a11 = lunarMonth11Jdn(year, utcOffsetHours);
  let b11 = a11;
  let lunarYear: number;

  if (a11 >= monthStart) {
    lunarYear = year;
    a11 = lunarMonth11Jdn(year - 1, utcOffsetHours);
  } else {
    lunarYear = year + 1;
    b11 = lunarMonth11Jdn(year + 1, utcOffsetHours);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);

  let isLeapMonth = false;
  let lunarMonth = diff + 11;

  const yearHasLeapMonth = b11 - a11 > 365;
  if (yearHasLeapMonth) {
    const leapDiff = leapMonthOffset(a11, utcOffsetHours);
    if (diff >= leapDiff) {
      lunarMonth = diff + 10;
      if (diff === leapDiff) isLeapMonth = true;
    }
  }

  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth };
}

/**
 * Chuyển một ngày Âm lịch Việt Nam sang Dương lịch.
 * @throws Nếu `isLeapMonth=true` nhưng năm âm lịch đó không có tháng nhuận, hoặc tháng
 * nhuận không khớp với tháng nhuận thực sự của năm đó.
 */
export function convertLunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeapMonth: boolean,
  utcOffsetHours: number,
): CalendarDate {
  let a11: number;
  let b11: number;

  if (lunarMonth < 11) {
    a11 = lunarMonth11Jdn(lunarYear - 1, utcOffsetHours);
    b11 = lunarMonth11Jdn(lunarYear, utcOffsetHours);
  } else {
    a11 = lunarMonth11Jdn(lunarYear, utcOffsetHours);
    b11 = lunarMonth11Jdn(lunarYear + 1, utcOffsetHours);
  }

  let monthOffset = lunarMonth - 11;
  if (monthOffset < 0) monthOffset += 12;

  const yearHasLeapMonth = b11 - a11 > 365;

  if (yearHasLeapMonth) {
    const leapDiff = leapMonthOffset(a11, utcOffsetHours);
    let leapMonthNumber = leapDiff - 2;
    if (leapMonthNumber < 0) leapMonthNumber += 12;

    if (isLeapMonth && lunarMonth !== leapMonthNumber) {
      throw new Error(
        `Năm âm lịch ${lunarYear} không có tháng nhuận ${lunarMonth} (tháng nhuận thực sự là tháng ${leapMonthNumber}).`,
      );
    } else if (isLeapMonth || monthOffset >= leapDiff) {
      monthOffset += 1;
    }
  } else if (isLeapMonth) {
    throw new Error(`Năm âm lịch ${lunarYear} không có tháng nhuận.`);
  }

  const k = nearestLunationNumber(a11) + monthOffset;
  const monthStart = newMoonDayJdn(k, utcOffsetHours);

  return julianDayNumberToCalendarDate(monthStart + lunarDay - 1);
}

/** Số lần giao hội trung bình mỗi năm âm lịch — hằng số tham chiếu, không dùng trong tính toán chính. */
export const AVERAGE_LUNAR_MONTHS_PER_SOLAR_YEAR = 365.2425 / SYNODIC_MONTH_DAYS;
