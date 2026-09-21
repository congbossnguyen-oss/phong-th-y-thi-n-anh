/**
 * runPipeline — MVP end-to-end convenience API (orchestration only, no astrological logic).
 * Chỉ nối các layer đã có, mỗi layer giữ trách nhiệm của mình:
 *   Factor[] → RuleEngine.evaluate → RuleEvaluation[] → EvidenceEngine.record → Evidence[]
 *            → interpret → InterpretationObject[] → renderNarratives → Narrative[]
 *
 * Deterministic: KHÔNG Date.now/Math.random/UUID/network/env. `calculationId` lấy từ
 * `chart.metadata.calculationId` (single source of truth — dùng chung cho Evidence và Interpretation).
 * KHÔNG nuốt lỗi: bất kỳ layer nào throw thì propagate nguyên trạng.
 */

import type { NormalizedChart } from "./chart/types.js";
import type { Evidence } from "./evidence/types.js";
import { recordEvidence } from "./evidence/engine.js";
import type { Factor } from "./factor/types.js";
import type { InterpretationObject } from "./interpretation/types.js";
import { interpret } from "./interpretation/engine.js";
import type { Narrative, NarrativeProvider } from "./narrative/types.js";
import { renderNarratives } from "./narrative/renderer.js";
import type { RuleEvaluation, RuleSet } from "./rule/types.js";
import { evaluateRules } from "./rule/engine.js";

export interface RunPipelineInput {
  chart: NormalizedChart;
  factors: readonly Factor[];
  ruleset: RuleSet;
  narrativeProvider: NarrativeProvider;
  /** Tuỳ chọn: Evidence đã dựng sẵn. Bỏ trống ⇒ record từ các RuleEvaluation đã fired. */
  evidence?: readonly Evidence[];
}

export interface PipelineResult {
  ruleEvaluations: RuleEvaluation[];
  evidence: Evidence[];
  interpretations: InterpretationObject[];
  narratives: Narrative[];
}

export async function runPipeline(input: RunPipelineInput): Promise<PipelineResult> {
  const { chart, factors, ruleset, narrativeProvider } = input;
  const calculationId = chart.metadata.calculationId;

  const ruleEvaluations = evaluateRules(factors, ruleset);
  const evidence =
    input.evidence !== undefined
      ? [...input.evidence]
      : ruleEvaluations.filter((e) => e.fired).map((e) => recordEvidence(e, ruleset, calculationId));
  const interpretations = interpret(chart, factors, ruleEvaluations, evidence, ruleset);
  const narratives = await renderNarratives(interpretations, narrativeProvider);

  return { ruleEvaluations, evidence, interpretations, narratives };
}
