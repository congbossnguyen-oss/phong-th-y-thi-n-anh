/**
 * RuleDependencyDeclaration — Phase 10.4 Section 2 / Phase 10.6.1. Mỗi `RuleDefinition` phải
 * khai báo TƯỜNG MINH nó đọc field Calculation nào (AVAILABLE), cần thành phần nào CHƯA
 * implement (UNIMPLEMENTED), hoặc cần bối cảnh ngoài Calculation Layer (EXTERNAL) — đây là dữ
 * liệu, không phải logic thực thi (evaluator thật nằm ở evaluator registry riêng, KHÔNG ở đây).
 *
 * `validateRuleRegistry` (Level 2 gating, xem validation/rule-registry.ts) từ chối đăng ký bất
 * kỳ rule nào có `unimplementedComponents`/`externalContext` khác rỗng — KHÔNG có runtime
 * fallback, KHÔNG có "đăng ký rồi báo unresolved sau" (Phase 10.5 Audit #2/#3: rule bị từ chối
 * không tồn tại ở đâu tại runtime, kể cả trong `unresolved_items`).
 */
import type { DaLiuRenCalculationResult } from "../da-liu-ren-calculation-result.js";

/** 8 field top-level đã freeze của DaLiuRenCalculationResult (Phase 9F) — nguồn sự thật duy nhất cho AVAILABLE. */
export type CalculationTopLevelField = keyof Omit<DaLiuRenCalculationResult, "provenance">;

/**
 * Cho phép ghi sub-path (vd "fourLessons.lesson1", "calendar.dayPillar") CHỈ để tài liệu hoá —
 * capability validation (Level 2) CHỈ xét phần top-level trước dấu chấm (xem
 * `calculationTopLevelFieldOf` trong validation/rule-registry.ts).
 */
export type CalculationFieldPath = CalculationTopLevelField | `${CalculationTopLevelField}.${string}`;

/**
 * Thành phần Calculation ĐƯỢC NÊU TÊN nhưng CHƯA implement — đóng union theo đúng danh sách đã
 * xác nhận qua Phase 9F/10.1-10.5 (không thêm phần tử nào không có bằng chứng từ các phase đó):
 * 帘幕貴人(lianMuGuiRen)/12 Trường Sinh(shiErChangSheng)/病符(bingFu)/本命(benMing)/行年(xingNian)/
 * 空亡(kongWang)/課體(keType)/旺衰(wangShuai)/應期(yingQi).
 */
export type UnimplementedComponentId =
  | "lianMuGuiRen"
  | "shiErChangSheng"
  | "bingFu"
  | "benMing"
  | "xingNian"
  | "kongWang"
  | "keType"
  | "wangShuai"
  | "yingQi";

/**
 * Bối cảnh KHÔNG nằm trong `DaLiuRenCalculationResult` (dù có thể có mặt tuỳ chọn trên
 * `ChartInput`) — có mặt trên `ChartInput` KHÔNG đồng nghĩa "available": chỉ 8 field frozen của
 * `DaLiuRenCalculationResult` mới được coi là AVAILABLE (Phase 10.4 Section 2).
 */
export type ExternalContextId = "gender" | "birthDateBeyondCalendar";

export interface RuleDependencyDeclaration {
  /** Field Calculation Layer rule ĐỌC — mọi phần tử phải nằm trong 8 field frozen (AVAILABLE). */
  readonly calculationFields: readonly CalculationFieldPath[];
  /** Thành phần chưa implement rule cần — KHÔNG rỗng = rule KHÔNG được đăng ký (Level 2). */
  readonly unimplementedComponents?: readonly UnimplementedComponentId[];
  /** Bối cảnh ngoài Calculation Layer rule cần — KHÔNG rỗng = rule KHÔNG được đăng ký (Level 2). */
  readonly externalContext?: readonly ExternalContextId[];
}

/** Phần top-level (trước dấu `.` đầu tiên, nếu có) của 1 `CalculationFieldPath`. */
export function calculationTopLevelFieldOf(path: CalculationFieldPath): CalculationTopLevelField {
  const dotIndex = path.indexOf(".");
  return (dotIndex === -1 ? path : path.slice(0, dotIndex)) as CalculationTopLevelField;
}
