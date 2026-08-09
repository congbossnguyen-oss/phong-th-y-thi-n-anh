/**
 * Validation ở biên API công khai (index.ts) — đúng nguyên tắc "chỉ validate ở biên"
 * (xem docs/13-coding-standards.md mục 5). Các hàm nội bộ astronomy/calendar KHÔNG tự
 * validate lại — chúng tin tưởng dữ liệu đã qua lớp này.
 *
 * Bổ sung theo yêu cầu đối chiếu với calendar-engine-spec.md (mục "Validation": ngày hợp lệ,
 * năm nhuận Gregory, timezone hợp lệ, tháng nhuận hợp lệ) — KHÔNG đổi chữ ký hàm nào đã có,
 * chỉ thêm kiểm tra input trước khi tính.
 */

import { julianDayNumber, julianDayNumberToCalendarDate } from "./astronomy/julianDay.js";
import { isValidTimeZone } from "./timezone/timezone.js";
import type { DateTimeInput } from "./types.js";

export class InvalidDateTimeInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDateTimeInputError";
  }
}

/**
 * Kiểm tra (year, month, day) có phải một ngày lịch CÓ THẬT hay không — bao gồm đúng quy tắc
 * năm nhuận (Gregorian sau 15/10/1582, Julian trước đó), dùng chính công thức JDN đã có thay
 * vì viết lại logic nhuận riêng: chuyển ngày → JDN → chuyển ngược lại, nếu khớp nguyên trạng
 * thì ngày đó có thật (JDN không tự "tràn" ngày/tháng, nên ngày ảo như 30/2 sẽ tràn sang
 * tháng 3 khi chuyển ngược, không khớp lại input gốc).
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;

  const jdn = julianDayNumber(year, month, day);
  const roundTrip = julianDayNumberToCalendarDate(jdn);
  return roundTrip.year === year && roundTrip.month === month && roundTrip.day === day;
}

/** Validate toàn bộ `DateTimeInput`; throw {@link InvalidDateTimeInputError} với thông điệp rõ nếu sai. */
export function validateDateTimeInput(input: DateTimeInput): void {
  if (!isValidCalendarDate(input.year, input.month, input.day)) {
    throw new InvalidDateTimeInputError(
      `Ngày không hợp lệ: ${input.year}-${input.month}-${input.day} không tồn tại trong lịch.`,
    );
  }

  const hour = input.hour ?? 0;
  const minute = input.minute ?? 0;
  const second = input.second ?? 0;

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new InvalidDateTimeInputError(`Giờ không hợp lệ: ${hour} (phải là số nguyên 0-23).`);
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new InvalidDateTimeInputError(`Phút không hợp lệ: ${minute} (phải là số nguyên 0-59).`);
  }
  if (!Number.isFinite(second) || second < 0 || second >= 60) {
    throw new InvalidDateTimeInputError(`Giây không hợp lệ: ${second} (phải trong khoảng 0-59.999...).`);
  }

  if (!isValidTimeZone(input.timeZone)) {
    throw new InvalidDateTimeInputError(`Múi giờ IANA không hợp lệ: "${input.timeZone}".`);
  }
}

/** Validate riêng phần Âm lịch dùng cho {@link getSolarDateFromLunar} (không đi qua DateTimeInput). */
export function validateLunarDateInput(
  lunar: { day: number; month: number; year: number; isLeapMonth: boolean },
  timeZone: string,
): void {
  if (!Number.isInteger(lunar.year)) {
    throw new InvalidDateTimeInputError(`Năm âm lịch không hợp lệ: ${lunar.year}.`);
  }
  if (!Number.isInteger(lunar.month) || lunar.month < 1 || lunar.month > 12) {
    throw new InvalidDateTimeInputError(`Tháng âm lịch không hợp lệ: ${lunar.month} (phải 1-12).`);
  }
  if (!Number.isInteger(lunar.day) || lunar.day < 1 || lunar.day > 30) {
    throw new InvalidDateTimeInputError(`Ngày âm lịch không hợp lệ: ${lunar.day} (phải 1-30).`);
  }
  if (!isValidTimeZone(timeZone)) {
    throw new InvalidDateTimeInputError(`Múi giờ IANA không hợp lệ: "${timeZone}".`);
  }
  // Tháng nhuận hợp lệ hay không (isLeapMonth=true nhưng năm đó không nhuận tháng này) đã
  // được `convertLunarToSolar` tự kiểm tra và throw Error rõ ràng — không kiểm tra lại ở đây
  // để tránh trùng lặp logic (xem calendar/lunarCalendar.ts).
}
