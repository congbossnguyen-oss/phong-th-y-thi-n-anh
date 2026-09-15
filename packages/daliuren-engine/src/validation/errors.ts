/**
 * Lỗi tường minh cho mọi vi phạm ràng buộc domain — KHÔNG nuốt lỗi âm thầm (Phase 5A mục 17
 * "explicit errors"). Dùng `code` ổn định (không đổi theo bản dịch message) để code gọi có
 * thể switch theo loại lỗi thay vì so khớp chuỗi.
 */
export type DaLiuRenValidationErrorCode =
  | "ORPHAN_SIGNAL_RULE_REF"
  | "ORPHAN_RULE_PROVENANCE_REF"
  | "ORPHAN_CALCULATION_PROVENANCE_REF"
  | "ORPHAN_CONFLICT_SIGNAL_REF"
  | "INVALID_CONFLICT_RESOLUTION"
  | "CONFIDENCE_SUMMARY_MISMATCH"
  | "QUESTION_TYPE_NOT_ALLOWED"
  | "RULE_DEPENDENCY_UNAVAILABLE"
  | "DUPLICATE_ID"
  | "MISSING_EVALUATOR"
  | "DUPLICATE_EVALUATOR"
  | "EVALUATOR_FOR_UNKNOWN_RULE";

export class DaLiuRenValidationError extends Error {
  readonly code: DaLiuRenValidationErrorCode;

  constructor(code: DaLiuRenValidationErrorCode, message: string) {
    super(message);
    this.name = "DaLiuRenValidationError";
    this.code = code;
  }
}
