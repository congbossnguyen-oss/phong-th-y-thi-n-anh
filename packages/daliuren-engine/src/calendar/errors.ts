/**
 * Lỗi tường minh cho Calendar Foundation — không silently fallback (Phase 5B-1 mục 10).
 * Bọc lỗi gốc của `@thien-anh/calendar-core` (`InvalidDateTimeInputError`) vào 1 taxonomy
 * riêng của daliuren-engine (giữ nguyên bản gốc qua `cause`) để tầng gọi không phải phụ
 * thuộc trực tiếp vào kiểu lỗi nội bộ của 1 package khác.
 */
export type CalendarFoundationErrorCode =
  | "MISSING_REQUIRED_FIELD"
  | "MISSING_TIMEZONE"
  | "INVALID_DATE_FORMAT"
  | "INVALID_DATETIME_INPUT"
  | "INVALID_PROFILE"
  | "UNSUPPORTED_ZI_HOUR_POLICY";

export class CalendarFoundationError extends Error {
  readonly code: CalendarFoundationErrorCode;

  constructor(code: CalendarFoundationErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CalendarFoundationError";
    this.code = code;
  }
}
