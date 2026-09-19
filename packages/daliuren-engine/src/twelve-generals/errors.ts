/** Lỗi tường minh cho Twelve Generals (十二天將) — không silent fallback, tự vệ trước Chi không hợp lệ từ nguồn khác. */
export type TwelveGeneralsErrorCode = "UNKNOWN_CHI";

export class TwelveGeneralsError extends Error {
  readonly code: TwelveGeneralsErrorCode;

  constructor(code: TwelveGeneralsErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "TwelveGeneralsError";
    this.code = code;
  }
}
