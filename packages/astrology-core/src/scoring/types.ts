/**
 * Layer 10 — Scoring Engine (shared contract). Phase 7, human-approved frozen contract.
 * Đúng `INTERPRETATION_SPEC.md` §Scoring + `ARCHITECTURE_FREEZE.md` §3 (Layer 10).
 *
 * Generic deterministic weighted-sum: gộp các rule ĐÃ fired có `weighting` thành điểm theo domain.
 * KHÔNG AI, KHÔNG randomness, KHÔNG interpretation/narrative. KHÔNG import kiến thức
 * Western/Vedic/astronomy (Model A: engine dùng chung + domain/weight nằm trong RuleSet data).
 *
 * Domain vocabulary CHƯA ratified (D2 deferred): engine KHÔNG áp đặt domain nào — nó chỉ đọc
 * `Rule.weighting.domain` từ RuleSet. RuleSet Tây phương V1 hiện tại không có weighting ⇒ kết quả []
 * (đúng contract).
 */

import type { RuleEvaluation, RuleSet } from "../rule/types.js";

/** Phiên bản Scoring Engine — spec chưa quy định giá trị cụ thể nên chọn định danh tối thiểu, deterministic. */
export const SCORING_ENGINE_VERSION = "scoring.v1";

/** Ngữ cảnh truyền vào (KHÔNG tự sinh timestamp) — deterministic. */
export interface ScoringContext {
  chartId: string;
  /** Lấy từ chart metadata bởi caller — KHÔNG dùng Date.now(). */
  computedAt: Date;
}

/** Điểm gộp cho một domain (`INTERPRETATION_SPEC.md` §Scoring schema; camelCase theo repo). */
export interface DomainScore {
  domain: string;
  chartId: string;
  /** Tổng có dấu = Σ (RuleEvaluation.strength × Rule.weighting.weight) của các rule fired thuộc domain. KHÔNG normalize. */
  score: number;
  contributingRuleIds: string[];
  computedAt: Date;
  version: string;
}

export interface ScoringEngine {
  score(ruleEvaluations: readonly RuleEvaluation[], ruleset: RuleSet, context: ScoringContext): DomainScore[];
}
