/**
 * MVP AI-Narrative layer (Phase 9 vertical slice — MINIMAL, not production).
 * Renders Vietnamese prose from InterpretationObject[] ONLY, under the AI Grounding Contract
 * (`docs/astrology-module/ARCHITECTURE/AI_GROUNDING_CONTRACT.md`): narrative may restate the frozen
 * conclusion (domain + conclusion.key + provenance ids) and NOTHING else — no invented facts/rules/
 * factors/evidence, no prediction/probability/confidence/strength/recommendation.
 *
 * MVP scope only: proves the pipeline runs Interpretation → Vietnamese narrative. Not a production
 * provider system, not localization infrastructure.
 */

import type { CanonicalDomain } from "../domain/types.js";
import type { ConclusionKey } from "../interpretation/types.js";

export const NARRATIVE_RENDERER_VERSION = "narrative.v1";

/** Grounded, structured input handed to a provider — derived deterministically from an InterpretationObject. */
export interface NarrativeInput {
  interpretationId: string;
  domain: CanonicalDomain;
  conclusionKey: ConclusionKey;
  ruleIds: string[];
  evidenceIds: string[];
  supportingFactorIds: string[];
}

/** Structured narrative output (Vietnamese `text`), carrying provenance back to Evidence. */
export interface Narrative {
  interpretationId: string;
  domain: CanonicalDomain;
  text: string;
  evidenceIds: string[];
  version: string;
}

/** Minimal provider abstraction — no vendor hard-coded into astrology-core. */
export interface NarrativeProvider {
  generateNarrative(input: NarrativeInput): Promise<string>;
}
