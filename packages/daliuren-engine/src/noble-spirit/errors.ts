/** Lỗi tường minh cho Noble Spirit — không silent fallback (Phase 5B-3 mục "ERROR HANDLING"). */
export type NobleSpiritErrorCode = "UNSUPPORTED_MAPPING_TABLE" | "UNKNOWN_DAY_CAN";

export class NobleSpiritError extends Error {
  readonly code: NobleSpiritErrorCode;

  constructor(code: NobleSpiritErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "NobleSpiritError";
    this.code = code;
  }
}
