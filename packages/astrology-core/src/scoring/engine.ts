/**
 * Generic deterministic Scoring Engine (Layer 10) — Phase 7.
 * score(ruleEvaluations, ruleset, context) -> DomainScore[]. HÀM THUẦN, deterministic.
 * Import CHỈ rule/scoring types — KHÔNG astrology/astronomy/interpretation.
 *
 * Thuật toán (contract đã freeze): duyệt `ruleset.rules` theo thứ tự (deterministic); với mỗi rule
 * có `weighting`, nếu RuleEvaluation tương ứng `fired === true` thì cộng
 * `strength × weighting.weight` vào domain của nó và ghi ruleId vào contributingRuleIds. Rule không
 * fired / không có weighting / không có evaluation ⇒ bỏ qua. Factor.strength KHÔNG được dùng.
 * Output sắp theo domain (tăng dần) để deterministic; contributingRuleIds giữ thứ tự ruleset.
 */

import type { RuleEvaluation, RuleSet } from "../rule/types.js";
import type { DomainScore, ScoringContext, ScoringEngine } from "./types.js";
import { SCORING_ENGINE_VERSION } from "./types.js";

interface DomainBucket {
  score: number;
  contributingRuleIds: string[];
}

export function scoreDomains(
  ruleEvaluations: readonly RuleEvaluation[],
  ruleset: RuleSet,
  context: ScoringContext,
): DomainScore[] {
  const evalById = new Map<string, RuleEvaluation>();
  for (const e of ruleEvaluations) {
    evalById.set(e.ruleId, e);
  }

  const buckets = new Map<string, DomainBucket>();
  for (const rule of ruleset.rules) {
    const weighting = rule.weighting;
    if (weighting === undefined) continue; // D3: rule không có weighting → không đóng góp.
    const evaluation = evalById.get(rule.id);
    if (evaluation === undefined || !evaluation.fired) continue;

    const contribution = evaluation.strength * weighting.weight; // strength là fired-gate multiplier (1.0 khi fired).
    let bucket = buckets.get(weighting.domain);
    if (bucket === undefined) {
      bucket = { score: 0, contributingRuleIds: [] };
      buckets.set(weighting.domain, bucket);
    }
    bucket.score += contribution;
    bucket.contributingRuleIds.push(rule.id);
  }

  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([domain, bucket]) => ({
      domain,
      chartId: context.chartId,
      score: bucket.score,
      contributingRuleIds: bucket.contributingRuleIds,
      computedAt: context.computedAt,
      version: SCORING_ENGINE_VERSION,
    }));
}

/** Engine dùng chung (Model A). */
export const scoringEngine: ScoringEngine = {
  score: scoreDomains,
};
