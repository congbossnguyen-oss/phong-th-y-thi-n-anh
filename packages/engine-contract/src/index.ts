/**
 * @thien-anh/engine-contract — Quy ước kỹ thuật dùng chung cho mọi Engine bộ môn.
 *
 * Thiết kế theo đúng docs/16-engine-contract.md (đã duyệt 2026-08-09). Package này CHỈ chứa
 * kiểu dữ liệu (types/interfaces) — không có hàm tính toán, không có business logic của bất
 * kỳ bộ môn huyền học nào. Mọi Engine bộ môn (`trachnhat-engine`, `batu-engine`...) import
 * types từ đây để định hình Output theo đúng 1 khuôn chung.
 */

/** Khung bọc ngoài BẮT BUỘC cho mọi Output của mọi Engine bộ môn. */
export interface EngineResult<TOutput> {
  ok: boolean;
  /** Chỉ có khi ok === true. */
  data?: TOutput;
  /** Chỉ có khi ok === false. */
  errors?: EngineError[];
  meta: EngineMeta;
}

export interface EngineMeta {
  /** Tên package Engine, vd. "trachnhat-engine". */
  engine: string;
  /** Semver riêng của Engine đó. */
  engineVersion: string;
  /**
   * Version Core Calendar Engine đã dùng để tính — truy vết khi thuật toán lịch pháp thay
   * đổi, giúp biết kết quả cũ có cần tính lại hay không.
   */
  coreCalendarVersion: string;
  /** ISO 8601 — thời điểm THỰC HIỆN phép tính, khác với ngày sự kiện nằm trong Input. */
  calculatedAt: string;
}

export interface EngineError {
  /** Mã lỗi ổn định, dùng được cho i18n/xử lý tự động ở tầng API. */
  code: string;
  /** Mô tả lỗi bằng tiếng Việt, dành cho log/debug. */
  message: string;
  /** Tên trường Input gây lỗi, nếu xác định được. */
  field?: string;
}

/** Chữ ký hàm bắt buộc mà mọi Engine bộ môn phải export ở `index.ts`. */
export type EngineCalculate<TInput, TOutput> = (input: TInput) => EngineResult<TOutput>;

/** Tiện ích dựng nhanh 1 `EngineResult` thành công. */
export function ok<TOutput>(data: TOutput, meta: EngineMeta): EngineResult<TOutput> {
  return { ok: true, data, meta };
}

/** Tiện ích dựng nhanh 1 `EngineResult` lỗi. */
export function fail(errors: EngineError[], meta: EngineMeta): EngineResult<never> {
  return { ok: false, errors, meta };
}
