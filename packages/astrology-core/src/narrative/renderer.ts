/**
 * MVP narrative renderer — deterministic assembly: InterpretationObject → NarrativeInput → Narrative.
 * Pure/deterministic except for the provider call (provider decides text). Preserves interpret()'s
 * deterministic ordering. Does NOT re-derive astrology, rules, factors, or evidence.
 */

import type { InterpretationObject } from "../interpretation/types.js";
import type { Narrative, NarrativeInput, NarrativeProvider } from "./types.js";
import { NARRATIVE_RENDERER_VERSION } from "./types.js";

/** Deterministic projection of an InterpretationObject onto the grounded narrative input. */
export function toNarrativeInput(interpretation: InterpretationObject): NarrativeInput {
  return {
    interpretationId: interpretation.interpretationId,
    domain: interpretation.domain,
    conclusionKey: interpretation.conclusion.key,
    ruleIds: [...interpretation.rules],
    evidenceIds: [...interpretation.evidence],
    supportingFactorIds: [...interpretation.supportingFactors],
  };
}

/** Constrained prompt (English is fine for the model; OUTPUT must be Vietnamese). Kept short. */
export function buildNarrativePrompt(input: NarrativeInput): string {
  return [
    "You are a constrained astrology narrative renderer.",
    "Use ONLY the supplied InterpretationObject and provenance data.",
    "Do not invent: facts, rules, factors, evidence, predictions, probabilities, confidence, strength, recommendations.",
    "Preserve the exact semantic meaning of domain and conclusion.key.",
    "Return Vietnamese prose only.",
    "",
    `domain: ${input.domain}`,
    `conclusion: ${input.conclusionKey}`,
    `rules: ${input.ruleIds.join(", ") || "(none)"}`,
    `evidence: ${input.evidenceIds.join(", ") || "(none)"}`,
  ].join("\n");
}

/** Render narratives for interpretations, preserving order. */
export async function renderNarratives(
  interpretations: readonly InterpretationObject[],
  provider: NarrativeProvider,
): Promise<Narrative[]> {
  const out: Narrative[] = [];
  for (const interpretation of interpretations) {
    const input = toNarrativeInput(interpretation);
    const text = await provider.generateNarrative(input);
    out.push({
      interpretationId: interpretation.interpretationId,
      domain: interpretation.domain,
      text,
      evidenceIds: [...interpretation.evidence],
      version: NARRATIVE_RENDERER_VERSION,
    });
  }
  return out;
}
