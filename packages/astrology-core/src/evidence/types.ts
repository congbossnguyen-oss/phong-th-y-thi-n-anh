/**
 * Layer (Phase 7B) — Evidence Engine (shared contract). Human-approved frozen contract H2-A..H2-G.
 * Đúng `docs/astrology-module/ARCHITECTURE/EVIDENCE_ENGINE_SPEC.md` (schema camelCase theo repo).
 *
 * Evidence Engine là plumbing PROVENANCE thuần xác định (H2-A): nó KHÔNG tính toán chiêm tinh,
 * KHÔNG diễn giải, KHÔNG score, KHÔNG prose/LLM. Nó chỉ lắp ráp và truy vết các liên kết đã có:
 * RuleEvaluation → Rule(source) / Factor → Chart → BirthData.
 *
 * KHÔNG lưu trữ (H2-G): không persistence backend — "store" chỉ là mảng Evidence[] do caller giữ.
 * KHÔNG randomness, KHÔNG Date.now, KHÔNG env/locale/fs/network. Cùng input ⇒ cùng Evidence.
 */

import type { FactorId } from "../factor/types.js";
import type { RuleId, SourceRef } from "../rule/types.js";

/**
 * Một mảnh provenance (H2-B). CHỈ chứa ID tham chiếu + nguồn của rule — KHÔNG chứa dữ kiện chart thô
 * (H2-D: raw chart facts truy về qua calculationId, không sao chép vào Evidence), KHÔNG strength,
 * confidence, interpretation text, hay prose.
 */
export interface Evidence {
  /** Xác định = `${calculationId}:${ruleId}` (H2-B): deterministic, KHÔNG random UUID. */
  evidenceId: string;
  /** null cho đến khi một InterpretationObject (Phase 8) đính Evidence này vào (H2-E). */
  interpretationId: string | null;
  ruleId: RuleId;
  /** = RuleEvaluation.factorIdsUsed (copy). */
  factorIds: FactorId[];
  /** = NormalizedChart.metadata.calculationId. Cầu nối duy nhất về Chart/BirthData (H2-D). */
  calculationId: string;
  /** Trích từ Rule.source của rule tương ứng; null nếu rule không khai báo nguồn (geometric_rule). */
  source: SourceRef | null;
}

/** Chuỗi truy vết Evidence → Rule → Factor → Chart → BirthData đã resolve đầy đủ (traceToBirthData). */
export interface TraceChain {
  evidence: Evidence;
  ruleId: RuleId;
  factorIds: FactorId[];
  calculationId: string;
  /** = NormalizedChart.birthDataRef — điểm cuối chuỗi provenance. */
  birthDataRef: string;
}

/**
 * Ném khi một liên kết provenance bắt buộc không resolve được (evidence/rule/factor/chart thiếu hoặc
 * lệch). KHÔNG fabricate, KHÔNG fallback — đứt xích là lỗi cứng.
 */
export class EvidenceTraceIntegrityError extends Error {
  readonly code = "TRACE_INTEGRITY_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "EvidenceTraceIntegrityError";
  }
}
