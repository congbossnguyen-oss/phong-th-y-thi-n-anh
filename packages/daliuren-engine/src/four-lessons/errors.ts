/**
 * Lỗi tường minh cho Four Lessons (四課) — không silent fallback, cùng quy ước với các module
 * trước. Về mặt TYPE, `Can` là union đóng nên `dayCan` không thể sai lệch nếu tới từ
 * `computeCalendarData` thật — nhưng vẫn tự vệ trước dữ liệu tới từ nguồn khác.
 */
export type FourLessonsErrorCode = "UNKNOWN_DAY_CAN";

export class FourLessonsError extends Error {
  readonly code: FourLessonsErrorCode;

  constructor(code: FourLessonsErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FourLessonsError";
    this.code = code;
  }
}
