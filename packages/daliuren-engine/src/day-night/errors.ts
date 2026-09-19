/** Lỗi tường minh cho Day/Night — không silent fallback (Phase 5B-3 mục "ERROR HANDLING"). */
export type DayNightErrorCode = "INVALID_HOUR_CHI";

export class DayNightError extends Error {
  readonly code: DayNightErrorCode;

  constructor(code: DayNightErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DayNightError";
    this.code = code;
  }
}
