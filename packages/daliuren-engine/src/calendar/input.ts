/**
 * Input normalization — biên DUY NHẤT giữa dữ liệu bên ngoài (`ChartInput`, có thể tới từ
 * JSON không được TypeScript kiểm tra tại runtime) và `@thien-anh/calendar-core`.
 *
 * Phân biệt tường minh 3 khái niệm hay bị lẫn (Phase 5B-1 mục "Input Normalization"):
 * - LOCAL TIME: giờ dân sự treo tường tại `timeZone` (`localDate`/`localHour`/`localMinute`).
 * - TIMEZONE: tên IANA đã qua validate — KHÔNG BAO GIỜ suy đoán ngầm.
 * - UTC INSTANT: `utcInstant` — DẪN XUẤT từ (local time + timezone), không phải input độc lập.
 */
import { isValidCalendarDate, Timezone, type DateTimeInput } from "@thien-anh/calendar-core";
import type { ChartInput } from "../types/chart.js";
import { CalendarFoundationError } from "./errors.js";

export interface NormalizedChartInstant {
  localDate: { year: number; month: number; day: number };
  localHour: number;
  localMinute: number;
  timeZone: string;
  /** Instant UTC tương ứng — tính bằng `Timezone.zonedTimeToUtc` của calendar-core, không viết lại logic offset. */
  utcInstant: Date;
  /** Dạng `DateTimeInput` calendar-core cần cho mọi lệnh gọi tiếp theo. */
  toDateTimeInput(): DateTimeInput;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDateOnly(date: string): { year: number; month: number; day: number } {
  const match = DATE_ONLY_PATTERN.exec(date);
  if (!match) {
    throw new CalendarFoundationError(
      "INVALID_DATE_FORMAT",
      `Định dạng ngày không hợp lệ: "${date}" (bắt buộc YYYY-MM-DD).`,
    );
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * Chuẩn hóa `ChartInput` thành `NormalizedChartInstant`. BẮT BUỘC gọi hàm này TRƯỚC MỌI lệnh
 * gọi calendar-core khác trong package — đây là điểm chặn DUY NHẤT cho lỗ hổng runtime sau:
 *
 * ⚠️ PHÁT HIỆN QUAN TRỌNG (Phase 5B-1): `new Intl.DateTimeFormat(locale, { timeZone: undefined })`
 * KHÔNG throw — nó âm thầm dùng timezone CỦA MÁY CHẠY CODE (đã kiểm chứng thực nghiệm bằng
 * Node.js REPL). `calendar-core`'s `isValidTimeZone()` (và do đó toàn bộ `validateDateTimeInput`
 * nội bộ của mọi hàm `get*`) vì vậy KHÔNG bắt được `timeZone` bị thiếu — vi phạm trực tiếp yêu
 * cầu "Không silently assume UTC" / "Không phụ thuộc machine timezone" (Phase 5B-1 mục
 * Determinism). Vì sửa `calendar-core` nằm NGOÀI phạm vi Phase 5B-1 ("Không refactor unrelated
 * packages"), lỗ hổng được chặn Ở ĐÂY, TRƯỚC KHI gọi bất kỳ hàm calendar-core nào.
 */
export function normalizeChartInstant(input: ChartInput): NormalizedChartInstant {
  if (input.date === undefined || input.date === null || (input.date as unknown) === "") {
    throw new CalendarFoundationError("MISSING_REQUIRED_FIELD", "Thiếu trường bắt buộc: date.");
  }
  if (input.hour === undefined || input.hour === null) {
    throw new CalendarFoundationError("MISSING_REQUIRED_FIELD", "Thiếu trường bắt buộc: hour.");
  }
  if (input.timeZone === undefined || input.timeZone === null || (input.timeZone as unknown) === "") {
    throw new CalendarFoundationError(
      "MISSING_TIMEZONE",
      "Thiếu timeZone — không được suy đoán ngầm theo múi giờ máy chủ hay UTC (xem ghi chú lỗ hổng Intl.DateTimeFormat trong input.ts).",
    );
  }
  if (!Timezone.isValidTimeZone(input.timeZone)) {
    throw new CalendarFoundationError(
      "INVALID_DATETIME_INPUT",
      `Múi giờ IANA không hợp lệ: "${input.timeZone}".`,
    );
  }

  const localDate = parseIsoDateOnly(input.date);
  if (!isValidCalendarDate(localDate.year, localDate.month, localDate.day)) {
    throw new CalendarFoundationError(
      "INVALID_DATETIME_INPUT",
      `Ngày không hợp lệ: "${input.date}" không tồn tại trong lịch.`,
    );
  }

  const localHour = input.hour;
  if (!Number.isInteger(localHour) || localHour < 0 || localHour > 23) {
    throw new CalendarFoundationError(
      "INVALID_DATETIME_INPUT",
      `Giờ không hợp lệ: ${String(localHour)} (phải là số nguyên 0-23).`,
    );
  }

  const localMinute = input.minute ?? 0;
  if (!Number.isInteger(localMinute) || localMinute < 0 || localMinute > 59) {
    throw new CalendarFoundationError(
      "INVALID_DATETIME_INPUT",
      `Phút không hợp lệ: ${String(localMinute)} (phải là số nguyên 0-59).`,
    );
  }

  const timeZone = input.timeZone;

  function toDateTimeInput(): DateTimeInput {
    return {
      year: localDate.year,
      month: localDate.month,
      day: localDate.day,
      hour: localHour,
      minute: localMinute,
      second: 0,
      timeZone,
    };
  }

  const utcInstant = Timezone.zonedTimeToUtc(
    {
      year: localDate.year,
      month: localDate.month,
      day: localDate.day,
      hour: localHour,
      minute: localMinute,
      second: 0,
    },
    timeZone,
  );

  return { localDate, localHour, localMinute, timeZone, utcInstant, toDateTimeInput };
}
