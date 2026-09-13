/**
 * Bảng mã lỗi ổn định cho Astrology Module — đúng danh sách đã freeze ở
 * docs/astrology-module/ARCHITECTURE/ARCHITECTURE_FREEZE.md mục 5. Phase 1 chỉ dùng 7 mã đầu
 * (input/timezone). Phase 3B-1 (Western houses/angles) bổ sung 3 mã còn lại của bảng freeze:
 * `UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE` (Placidus/Koch trong vòng cực), `UNSUPPORTED_FEATURE`
 * (house system không được provider hỗ trợ), `CALCULATION_ERROR` (lỗi native Swiss Ephemeris
 * khác không lường trước). `UNSUPPORTED_SCHOOL`/`EPHEMERIS_ERROR` vẫn CHƯA dùng (Phase 4+/khi
 * ephemeris file thiếu theo cách khác với vĩ độ cực — house calculation không cần file .se1 nên
 * chưa có tình huống nào kích hoạt EPHEMERIS_ERROR ở Phase 3B-1).
 *
 * Hình dạng `AstrologyCoreError` là SUPERSET tương thích cấu trúc với `EngineError` của
 * `@thien-anh/engine-contract` ({code, message, field}) — một Engine ở Phase 3+ bọc package
 * này có thể ánh xạ thẳng 1-1 sang `EngineError`, bỏ field `details` nếu không cần. Package
 * này KHÔNG import `@thien-anh/engine-contract` vì đây không phải một "Engine" (chưa có
 * `calculate()` sinh business output) — xem ARCHITECTURE_FREEZE.md §6.D.
 */

export type AstrologyCoreErrorCode =
  | "INVALID_BIRTH_DATE"
  | "INVALID_BIRTH_TIME"
  | "INVALID_COORDINATES"
  | "INVALID_TIMEZONE"
  | "TIMEZONE_NOT_FOUND"
  | "AMBIGUOUS_LOCAL_TIME"
  | "NONEXISTENT_LOCAL_TIME"
  | "UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE"
  | "UNSUPPORTED_FEATURE"
  | "CALCULATION_ERROR";

/** Một lỗi input: mã ổn định (dùng cho xử lý tự động/i18n) + message tiếng Việt (debug/log) + field gây lỗi + chi tiết máy đọc được tuỳ mã lỗi. */
export interface AstrologyCoreError {
  code: AstrologyCoreErrorCode;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Chỉ dùng nội bộ khi một lời gọi hàm ở BIÊN công khai (public API của package) cần throw thay
 * vì trả mảng lỗi — vd. `resolveLocalTimeToUtc` hoặc các hàm tiện ích không có chỗ tự nhiên để
 * trả `AstrologyCoreError[]`. Theo đúng quy ước `calendar-core` (throw Error có `.name` ổn định)
 * nhưng bọc thêm `.astrologyError` để nơi gọi lấy được mã lỗi có cấu trúc mà không phải parse
 * `.message`.
 */
export class AstrologyCoreValidationError extends Error {
  readonly astrologyError: AstrologyCoreError;

  constructor(astrologyError: AstrologyCoreError) {
    super(astrologyError.message);
    this.name = "AstrologyCoreValidationError";
    this.astrologyError = astrologyError;
  }
}
