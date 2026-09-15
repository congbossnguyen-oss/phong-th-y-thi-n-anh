/**
 * InterpretationPackage — schema chính thức, implement ĐÚNG theo
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 2 (giữ nguyên tên field snake_case
 * ở TOP LEVEL đúng như bản thiết kế đã duyệt — các type lồng bên trong dùng camelCase theo
 * convention chung của dự án). Đây là dữ liệu Tầng 2 (rule engine, CHƯA xây ở Checkpoint 1)
 * đưa cho Tầng 3 (AI, CHƯA xây).
 */
import type { Confidence } from "./confidence.js";
import type { QuestionType } from "./question-type.js";
import type { Signal } from "./signal.js";
import type { Conflict } from "./conflict.js";
import type { ProvenanceEntry } from "./provenance.js";

export interface ChartReference {
  /** ID/hash của Chart đã tính — KHÔNG embed toàn bộ Chart vào package. */
  chartId: string;
  engineVersion: string;
  coreCalendarVersion: string;
  calculatedAt: string;
}

export type UnresolvedReason =
  | "NO_CLASSICAL_SOURCE"
  | "INSUFFICIENT_EVIDENCE"
  | "FEATURE_NOT_IMPLEMENTED"
  | "CONFLICTING_SCHOOLS";

export interface UnresolvedItem {
  topic: string;
  reason: UnresolvedReason;
}

export interface InterpretationPackage {
  chart_reference: ChartReference;
  question_type: QuestionType;

  /** Toàn bộ rule ĐÃ ĐƯỢC ĐÁNH GIÁ (kể cả không trigger) — cho phép audit "đã xét đủ chưa". */
  verified_rules: ReadonlyArray<{ ruleId: string; triggered: boolean }>;

  signals: readonly Signal[];
  conflicts: readonly Conflict[];
  unresolved_items: readonly UnresolvedItem[];

  /** provenanceId → entry — tra cứu ngược từ bất kỳ rule/signal nào. */
  provenance: Readonly<Record<string, ProvenanceEntry>>;

  confidence_summary: {
    /**
     * Confidence THẤP NHẤT (worst-of `ruleConfidence`/`calculationConfidence`, xem
     * confidence.ts `worstConfidence`) trong mọi signal đã trigger — để UI/AI biết mức thận
     * trọng cần có. `null` nghĩa là KHÔNG CÓ signal nào triggered (vd chưa có rule nào đăng ký
     * cho question_type này) — đây là trạng thái "không tồn tại giá trị để báo cáo", KHÔNG
     * PHẢI "mặc định A/an toàn" (Phase 10.5 §4, Phase 10.6.1 §7) — `null` là giá trị BẮT BUỘC
     * trong trường hợp này, không phải optional bị bỏ qua.
     */
    overallLowestConfidence: Confidence | null;
  };

  /**
   * Danh sách TƯỜNG MINH những gì AI (Tầng 3) KHÔNG được tự suy ra thêm cho ĐÚNG lượt luận này
   * — vd ['ung-ky', 'luc-than', 'scoring']. Khớp `forbidden_inferences` trong AI Spec.
   */
  forbidden_inferences: readonly string[];
}
