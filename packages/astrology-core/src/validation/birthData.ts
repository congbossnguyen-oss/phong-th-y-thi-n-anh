/**
 * Validate `BirthData` ở BIÊN công khai — trả `AstrologyCoreError[]` (rỗng nếu hợp lệ),
 * KHÔNG throw. Đúng quy ước "validate ở biên, hàm nội bộ tin tưởng dữ liệu đã qua đây" của
 * `calendar-core` (xem packages/calendar-core/src/validation.ts) và quy ước trả mảng lỗi có
 * cấu trúc (không throw) của Engine Contract (xem packages/trachnhat-engine/src/validation.ts).
 *
 * Tái dùng `isValidCalendarDate`/`Timezone.isValidTimeZone` đã có của calendar-core thay vì
 * viết lại — hai hàm này đã được kiểm chứng và dùng bởi mọi Engine khác trong repo.
 */

import { isValidCalendarDate, Timezone } from "@thien-anh/calendar-core";
import type { AstrologyCoreError } from "../errors.js";
import type { BirthData } from "../types.js";

const MIN_YEAR = -4712; // giới hạn dưới của thuật toán Julian Day (calendar-core) — ngày trước mốc này không tính được JDN dương.
const MAX_YEAR = 9999;

export function validateBirthData(input: BirthData): AstrologyCoreError[] {
  const errors: AstrologyCoreError[] = [];

  errors.push(...validateDate(input));
  errors.push(...validateLocalTime(input));
  errors.push(...validateCoordinates(input));
  errors.push(...validateTimezone(input));

  return errors;
}

function validateDate(input: BirthData): AstrologyCoreError[] {
  const { date } = input;

  if (
    !date ||
    !Number.isInteger(date.year) ||
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day)
  ) {
    return [
      {
        code: "INVALID_BIRTH_DATE",
        message: "birthData.date.year/month/day phải là số nguyên.",
        field: "date",
      },
    ];
  }

  if (date.year < MIN_YEAR || date.year > MAX_YEAR) {
    return [
      {
        code: "INVALID_BIRTH_DATE",
        message: `Năm ${date.year} nằm ngoài phạm vi hỗ trợ (${MIN_YEAR}..${MAX_YEAR}).`,
        field: "date.year",
        details: { minYear: MIN_YEAR, maxYear: MAX_YEAR, actual: date.year },
      },
    ];
  }

  if (!isValidCalendarDate(date.year, date.month, date.day)) {
    return [
      {
        code: "INVALID_BIRTH_DATE",
        message: `Ngày không hợp lệ: ${date.year}-${date.month}-${date.day} không tồn tại trong lịch.`,
        field: "date",
        details: { year: date.year, month: date.month, day: date.day },
      },
    ];
  }

  return [];
}

function validateLocalTime(input: BirthData): AstrologyCoreError[] {
  const { localTime } = input;

  // null = không rõ giờ sinh, một trạng thái HỢP LỆ (xem types.ts) — không phải lỗi.
  if (localTime === null) return [];

  const errors: AstrologyCoreError[] = [];
  const { hour, minute, second = 0 } = localTime;

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    errors.push({
      code: "INVALID_BIRTH_TIME",
      message: `Giờ không hợp lệ: ${String(hour)} (phải là số nguyên 0-23).`,
      field: "localTime.hour",
      details: { actual: hour },
    });
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    errors.push({
      code: "INVALID_BIRTH_TIME",
      message: `Phút không hợp lệ: ${String(minute)} (phải là số nguyên 0-59).`,
      field: "localTime.minute",
      details: { actual: minute },
    });
  }
  if (!Number.isFinite(second) || second < 0 || second >= 60) {
    errors.push({
      code: "INVALID_BIRTH_TIME",
      message: `Giây không hợp lệ: ${String(second)} (phải trong khoảng 0-59.999...).`,
      field: "localTime.second",
      details: { actual: second },
    });
  }

  return errors;
}

function validateCoordinates(input: BirthData): AstrologyCoreError[] {
  const errors: AstrologyCoreError[] = [];
  const { latitude, longitude, altitudeMeters } = input;

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.push({
      code: "INVALID_COORDINATES",
      message: `Vĩ độ không hợp lệ: ${String(latitude)} (phải trong khoảng -90..90).`,
      field: "latitude",
      details: { actual: latitude },
    });
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.push({
      code: "INVALID_COORDINATES",
      message: `Kinh độ không hợp lệ: ${String(longitude)} (phải trong khoảng -180..180).`,
      field: "longitude",
      details: { actual: longitude },
    });
  }
  if (altitudeMeters !== undefined && !Number.isFinite(altitudeMeters)) {
    errors.push({
      code: "INVALID_COORDINATES",
      message: `Độ cao không hợp lệ: ${String(altitudeMeters)} (phải là số hữu hạn nếu có).`,
      field: "altitudeMeters",
      details: { actual: altitudeMeters },
    });
  }

  return errors;
}

function validateTimezone(input: BirthData): AstrologyCoreError[] {
  const { timezoneId } = input;

  if (typeof timezoneId !== "string" || timezoneId.length === 0) {
    return [
      {
        code: "INVALID_TIMEZONE",
        message: "timezoneId phải là chuỗi IANA không rỗng (vd. \"Asia/Ho_Chi_Minh\"), không phải offset số.",
        field: "timezoneId",
      },
    ];
  }

  // ICU/Intl (theo đặc tả ECMA-402) chấp nhận cú pháp offset thô như "+07:00" là một
  // "TimeZoneIdentifier" hợp lệ về mặt CÚ PHÁP — nhưng nó là offset CỐ ĐỊNH, không mang lịch
  // sử DST/đổi múi giờ như một vùng IANA thật (vd. "Asia/Ho_Chi_Minh" biết offset đã đổi từ
  // +8 sang +7 trước 1985 — xem test lịch sử). Chấp nhận cú pháp này sẽ mở đúng lỗ hổng
  // ADR-010 yêu cầu tránh ("không hardcode UTC+7"), chỉ là do NGƯỜI DÙNG gõ vào thay vì do
  // code hardcode — nên vẫn phải chặn ở đây, không dựa hoàn toàn vào `isValidTimeZone`.
  if (/^[+-]\d{1,2}:?\d{2}$/.test(timezoneId) || /^(UTC|GMT)[+-]\d{1,2}(:\d{2})?$/i.test(timezoneId)) {
    return [
      {
        code: "INVALID_TIMEZONE",
        message: `"${timezoneId}" là offset cố định, không phải tên vùng IANA — không biểu diễn được lịch sử DST/đổi múi giờ. Dùng tên vùng như "Asia/Ho_Chi_Minh".`,
        field: "timezoneId",
        details: { actual: timezoneId },
      },
    ];
  }

  if (!Timezone.isValidTimeZone(timezoneId)) {
    return [
      {
        code: "TIMEZONE_NOT_FOUND",
        message: `Múi giờ IANA không hợp lệ hoặc không tồn tại: "${timezoneId}".`,
        field: "timezoneId",
        details: { actual: timezoneId },
      },
    ];
  }

  return [];
}
