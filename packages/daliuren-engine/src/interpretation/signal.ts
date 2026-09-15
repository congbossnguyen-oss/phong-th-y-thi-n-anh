/**
 * Signal — kết quả ÁP DỤNG 1 RuleDefinition lên 1 Chart cụ thể, runtime data đưa vào
 * InterpretationPackage. Theo docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 2,
 * mở rộng thêm `category`/`subject`/`object`/`relation`/`descriptionKey` theo Phase 5A mục 6
 * (thay `shortLabel` văn xuôi cố định bằng `descriptionKey` — khoá tra cứu, để Tầng 3 tự
 * diễn đạt theo văn phong thay vì hard-code câu tiếng Việt vào Tầng 2).
 *
 * TUYỆT ĐỐI KHÔNG có field số (score/weight/percentage) — chỉ `polarity` (định tính) và
 * `confidence` (A/B/C/D, xem confidence.ts).
 */
import type { Confidence } from "./confidence.js";
import type { RuleLayer } from "./rule.js";
import type { QuestionType } from "./question-type.js";

export type SignalPolarity = "auspicious" | "inauspicious" | "neutral" | "unclear";

/** Quan hệ giữa `subject` và `object`, nếu signal mô tả 1 quan hệ sinh/khắc/hình/xung/hợp/hại cụ thể. */
export type SignalRelation = "sheng" | "ke" | "bihe" | "he" | "chong" | "xing" | "hai" | "presence";

export interface Signal {
  /** Unique cho 1 lượt chiêm — quy ước `${chartId}-${ruleId}-${index}`. */
  signalId: string;
  /** = "source_rule" (Phase 5A mục 6) — chuỗi truy vết Signal→Rule bắt buộc. */
  ruleId: string;
  /** Copy từ RuleDefinition.topic — không cần join lại khi lọc theo nhóm hiển thị. */
  category: string;
  /** FACT chủ ngữ, vd "初傳" — optional vì không phải rule nào cũng mô tả quan hệ chủ-khách. */
  subject?: string;
  /** FACT tân ngữ, vd "日干". */
  object?: string;
  relation?: SignalRelation;
  polarity: SignalPolarity;
  /** Khoá tra cứu văn bản hiển thị — KHÔNG PHẢI câu văn hoàn chỉnh. Vd "sanchuan.initial_ke_day". */
  descriptionKey: string;
  triggered: boolean;
  /** Copy từ RuleDefinition.layer — không cần join lại. */
  layer: RuleLayer;
  /** Copy từ RuleResult.ruleConfidence TẠI THỜI ĐIỂM tạo signal (để version cũ vẫn tái hiện đúng) — bằng chứng cổ điển của RULE. */
  ruleConfidence: Confidence;
  /** Copy từ RuleResult.calculationConfidence — bằng chứng của FACT Calculation Layer signal này dựa vào. KHÔNG được gộp/đánh đồng với ruleConfidence (Model C, Phase 10.4 Section 5). */
  calculationConfidence: Confidence;
  /** → ProvenanceEntry.id — nguồn CỔ ĐIỂN của rule (KHÔNG PHẢI provenance Calculation Layer, xem calculationProvenanceIds). */
  provenanceId: string;
  /**
   * → ProvenanceEntry.id[] của Calculation Layer đã quyết định `calculationConfidence` ở trên —
   * cho phép auditor lần ngược tới ĐÚNG fact yếu (vd D-confidence của
   * nobleSpiritDayNightAssignmentProvenanceId) thay vì chỉ thấy 1 chữ cái grade trần trụi.
   * Optional vì không phải rule nào cũng có calculation dependency mang provenance riêng biệt.
   */
  calculationProvenanceIds?: readonly string[];
  appliesTo?: QuestionType;
}
