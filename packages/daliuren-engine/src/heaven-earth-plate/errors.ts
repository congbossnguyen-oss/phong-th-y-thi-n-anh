/**
 * Lỗi tường minh cho Heaven/Earth Plate (天地盤) — không silent fallback, cùng quy ước với
 * `month-general/errors.ts`/`day-night/errors.ts`. Về mặt TYPE, `Chi` là union đóng nên
 * `monthGeneral.zhi`/`hourChi` không thể sai lệch nếu tới từ `computeMonthGeneral`/
 * `computeCalendarData` thật — nhưng vẫn tự vệ trước dữ liệu tới từ nguồn khác (JSON
 * deserialize hỏng, test tự dựng tay sai), đúng bài học đã áp dụng cho mọi module trước.
 */
export type HeavenEarthPlateErrorCode = "UNKNOWN_MONTH_GENERAL_ZHI" | "UNKNOWN_HOUR_CHI" | "UNKNOWN_EARTH_CHI";

export class HeavenEarthPlateError extends Error {
  readonly code: HeavenEarthPlateErrorCode;

  constructor(code: HeavenEarthPlateErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "HeavenEarthPlateError";
    this.code = code;
  }
}
