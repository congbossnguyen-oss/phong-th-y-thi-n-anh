/**
 * RuleDefinition (tĩnh, sống trong Rule Registry — chưa xây ở Checkpoint 1) và RuleResult
 * (runtime, kết quả 1 lần ÁP DỤNG 1 rule lên 1 Chart cụ thể). Theo
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 2 + Phase 5A mục 5.
 *
 * RuleResult là bước TRUNG GIAN giữa RuleDefinition (định nghĩa) và Signal (dữ liệu đưa vào
 * InterpretationPackage) — một lần evaluate() có thể sinh 0, 1, hoặc nhiều Signal (vd rule
 * kiểm tra "có Không Vong ở vị trí nào trong Tam Truyền" có thể sinh tối đa 3 signal).
 */
import type { Confidence } from "./confidence.js";
import type { QuestionType } from "./question-type.js";
import type { Signal } from "./signal.js";
import type { RuleDependencyDeclaration } from "./rule-dependencies.js";

export type RuleLayer = "core" | "secondary" | "auxiliary";

export interface RuleDefinition {
  /** Định danh ổn định, KHÔNG đổi giữa các version — vd "R-SANCHUAN-002". */
  ruleId: string;
  layer: RuleLayer;
  /** Nhóm hiển thị Expert Mode, vd "三傳", "課體", "旺衰". */
  topic: string;
  /** Mô tả NGẮN bằng tiếng Việt — KHÔNG PHẢI văn xuôi luận giải (đó là việc của Tầng 3). */
  description: string;
  /** Mô tả điều kiện kích hoạt bằng TÀI LIỆU — hàm evaluate() thật gắn với ruleId qua Rule Registry. */
  condition: string;
  /** → ProvenanceEntry.id — nguồn CỔ ĐIỂN của chính rule (KHÁC provenance của Calculation Layer nó đọc, xem Signal.calculationProvenanceIds). */
  provenanceId: string;
  /** Confidence cổ điển/học thuật của RULE — KHÔNG lẫn với calculationConfidence (Signal/RuleResult), xem Phase 10.4 Section 5. */
  confidence: Confidence;
  /** Nếu rule CHỈ áp dụng cho 1 số question_type cụ thể (vd Bạch Hổ hành nhân chỉ cho 'xuat-hanh'). */
  questionTypes?: readonly QuestionType[];
  /** Field Calculation Layer rule đọc + thành phần chưa implement/ngoài phạm vi rule cần — Rule Registry (Level 2) từ chối đăng ký nếu unimplementedComponents/externalContext khác rỗng. */
  dependencies: RuleDependencyDeclaration;
}

export type RuleResultStatus = "triggered" | "not-triggered" | "not-applicable" | "error";

export interface RuleResult<TInputs = unknown, TOutputs = unknown> {
  ruleId: string;
  status: RuleResultStatus;
  /** Các giá trị FACT (đọc từ Chart) mà rule này đã xét — phục vụ audit "rule đã nhìn vào đâu". */
  inputs: TInputs;
  /** Giá trị suy ra được, CHỈ có khi `status === 'triggered'`. */
  outputs?: TOutputs;
  /** 0+ signal sinh ra từ evaluation này — thường 0 hoặc 1, để mảng cho các rule đa vị trí (vd Không Vong). */
  signals: readonly Signal[];
  provenanceId: string;
  /** = RuleDefinition.confidence tại thời điểm evaluate() — bằng chứng cổ điển của CHÍNH rule. */
  ruleConfidence: Confidence;
  /**
   * Confidence THẤP NHẤT (worst-of, xem confidence.ts `worstConfidence`) trong số các
   * ProvenanceEntry của Calculation Layer mà `dependencies.calculationFields` của rule này thực
   * sự chạm tới cho lượt evaluate() này — Model C (Phase 10.4 Section 5/10.5 Audit #1): KHÔNG
   * được suy ra bằng quan hệ phụ thuộc bắc cầu (vd KHÔNG lấy provenance của field A gán cho
   * field B chỉ vì B cần A) — evaluator PHẢI tự tra đúng provenance của TỪNG field nó đọc.
   */
  calculationConfidence: Confidence;
  /** Chỉ có khi `status === 'error'` — KHÔNG được nuốt lỗi âm thầm (Phase 5A mục 17 "explicit errors"). */
  errorMessage?: string;
}
