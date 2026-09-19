/**
 * ProvenanceEntry — nguồn của 1 RuleDefinition. Thiết kế theo
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_PACKAGE.md mục 2, mở rộng thêm `ruleId`/`sourceId`/
 * `sourceTitle`/`sourceLocation`/`notes` để khớp đủ danh sách tối thiểu ở Phase 5A mục 4
 * (rule_id, source_id, source_title, source_location, source_type, confidence, notes).
 */
import type { Confidence } from "./confidence.js";

export type SourceType = "classical-fact" | "modern-interpretation" | "implementation-detail" | "unverified-claim";

export interface ProvenanceEntry {
  /** Khoá của chính entry này — RuleDefinition.provenanceId (hoặc ProfileDecision.provenanceIds) trỏ vào đây. */
  id: string;
  /**
   * Back-reference tiện tra cứu — rule nào đang dùng provenance này. OPTIONAL vì Provenance
   * không chỉ backing cho RuleDefinition (Tầng 2) mà còn cho CalculationProfile decisions
   * (Tầng 1/profile, xem profiles/types.ts) — 2 khái niệm khác nhau, không ép cùng 1 field bắt buộc.
   */
  ruleId?: string;
  /**
   * Định danh ỔN ĐỊNH cho VĂN BẢN NGUỒN (không phải cho từng trích dẫn) — cho phép nhiều
   * ProvenanceEntry khác nhau cùng trỏ tới 1 nguồn (vd nhiều rule cùng trích 六壬大全).
   * Quy ước: kebab-case, vd 'liu-ren-da-quan-siku' (六壬大全, bản Tứ Khố Toàn Thư).
   */
  sourceId: string;
  /** Tên sách/bài viết, vd "六壬大全 (欽定四庫全書本)". */
  sourceTitle: string;
  /** Vị trí cụ thể trong nguồn, vd "卷三 軒轅肘後經". Optional vì không phải nguồn nào cũng chia chương rõ. */
  sourceLocation?: string;
  sourceType: SourceType;
  /** Chỉ điền nếu `sourceType==='modern-interpretation'` và có tác giả rõ, vd "程樹勳". */
  author?: string;
  /** Trích nguyên văn nếu có — KHÔNG bịa nếu không có (xem AI Spec — cấm bịa citation). */
  quote?: string;
  url?: string;
  confidence: Confidence;
  /** Ghi chú tự do — vd "trùng khớp qua ≥2 nguồn độc lập" hoặc "chỉ 1 nguồn, chưa kiểm chứng". */
  notes?: string;
}
