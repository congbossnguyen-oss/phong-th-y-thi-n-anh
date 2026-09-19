/**
 * Lỗi tường minh cho Month General — không silent fallback (Phase 5B-2 mục "NO HIDDEN
 * FALLBACK"). `computeMonthGeneral` chỉ nhận `CalendarData` đã được `computeCalendarData`
 * (Phase 5B-1) dựng đúng, nhưng vẫn phải tự vệ trước dữ liệu tới từ nguồn khác (JSON đã
 * lưu/deserialize, test tự dựng tay) — không được đoán/silently pick 1 giá trị mặc định.
 */
export type MonthGeneralErrorCode = "INVALID_PRECEDING_TERM" | "UNKNOWN_MAJOR_TERM";

export class MonthGeneralError extends Error {
  readonly code: MonthGeneralErrorCode;

  constructor(code: MonthGeneralErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MonthGeneralError";
    this.code = code;
  }
}
