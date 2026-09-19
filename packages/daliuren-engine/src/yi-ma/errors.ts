/** Lỗi tường minh cho 驛馬 (Yi Ma) — cùng quy ước với mọi module trước, tự vệ trước Chi không hợp lệ từ nguồn khác. */
export type YiMaErrorCode = "UNKNOWN_CHI";

export class YiMaError extends Error {
  readonly code: YiMaErrorCode;

  constructor(code: YiMaErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "YiMaError";
    this.code = code;
  }
}
