/**
 * Layer 11 — Interpretation Engine (shared contract). Phase 8, CONTRACT FROZEN (GREEN).
 * Đúng `docs/astrology-module/ARCHITECTURE/PHASE8_DECISIONS.md` (H1/H3/H4/H5/H6 + D-series).
 *
 * InterpretationObject là data object cấu trúc-hoá, deterministic, TIỀN-prose (prose để Phase 9).
 * KHÔNG confidence (D-CONF), KHÔNG strength (D-STRENGTH), KHÔNG polarity/intensity/prediction/
 * probability/severity/risk dưới bất kỳ tên nào. Chỉ 2 conclusion key (H3): domain_activated /
 * domain_not_indicated. Field camelCase theo quy ước repo (spec dùng snake_case chỉ để mô tả hình dạng).
 */

import type { CanonicalDomain } from "../domain/types.js";
import type { FactorId } from "../factor/types.js";
import type { RuleId } from "../rule/types.js";

/** Phiên bản Interpretation Engine (ADR-008, D — quy ước `<name>.vN`). */
export const INTERPRETATION_ENGINE_VERSION = "interpretation.v1";

/** H3: đúng hai conclusion key. KHÔNG có key thứ ba, KHÔNG alias, KHÔNG prose. */
export type ConclusionKey = "domain_activated" | "domain_not_indicated";

/** Kết luận cấu trúc-hoá. `key` là định danh máy-đọc; `params` tối thiểu/rỗng ở v1 (H3, không mã hoá semantics). */
export interface InterpretationConclusion {
  key: ConclusionKey;
  params: Record<string, unknown>;
}

/**
 * Caveat cấu trúc-hoá (contract-compatible container). v1 KHÔNG populate (deferred) — KHÔNG mã hoá
 * uncertainty/confidence/risk/probability/favorable-unfavorable làm caveat.
 */
export interface Caveat {
  code: string;
  detailParams: Record<string, unknown>;
}

/**
 * Kết quả diễn giải cho MỘT domain của MỘT chart. `evidence` là EvidenceId[] (= Evidence.evidenceId, string).
 * Bất biến D-EVIDENCE-SCOPE: domain_activated ⇒ evidence.length > 0; domain_not_indicated ⇒ có thể rỗng.
 */
export interface InterpretationObject {
  /** D-ID-CONSTRUCT: `${calculationId}:${domain}` — deterministic, không UUID/timestamp/hash. */
  interpretationId: string;
  domain: CanonicalDomain;
  conclusion: InterpretationConclusion;
  /** Provenance: FactorId từ Evidence của các rule đã activated (deterministic, dedup, sorted). */
  supportingFactors: FactorId[];
  /** RuleId đóng góp (activated: fired+evidenced; not_indicated: tập bound rule đã đánh giá). Sorted. */
  rules: RuleId[];
  /** EvidenceId (= Evidence.evidenceId). Sorted. Rỗng chỉ hợp lệ cho domain_not_indicated. */
  evidence: string[];
  caveats: Caveat[];
  version: string;
}

/** Ném khi construction vi phạm contract (validation boundary — D-EVIDENCE-SCOPE, D-ID-CONSTRUCT, ...). */
export class InterpretationValidationError extends Error {
  readonly code = "INTERPRETATION_VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "InterpretationValidationError";
  }
}
