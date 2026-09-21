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
import type { ConclusionKey, InterpretationObject } from "../interpretation/types.js";

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

/** Minimal provider abstraction — no vendor hard-coded into astrology-core (D3). */
export interface NarrativeProvider {
  /** Metadata surfaced into `Report` (never a runtime toggle). */
  readonly modelProvider: string;
  readonly modelVersion: string;
  generateNarrative(input: NarrativeInput): Promise<string>;
}

// ---------------------------------------------------------------------------------------
// Phase 9 — NarrativeEngine per AI_GROUNDING_CONTRACT.md (Report + deterministic grounding).
// ---------------------------------------------------------------------------------------

/** Phase 9 engine version (ADR-008 `<name>.vN`). */
export const NARRATIVE_ENGINE_VERSION = "narrative.engine.v1";

/** Narrow stylistic instructions (contract §Interface). Carries no astrological content. */
export interface NarrativeStyle {
  tone: string;
  targetLanguage: string;
  maxLength: number | null;
}

/**
 * Served narrative artifact (contract §Interface). `interpretationRefs` is MANDATORY for traceability
 * (EVIDENCE_ENGINE_SPEC). `groundingCheckPassed=false` ⇒ NOT serveable as success (D4); on failure the
 * hallucinated text is discarded and `narrativeText` carries a fixed block notice — never the invented prose.
 */
export interface Report {
  reportId: string;
  narrativeText: string;
  interpretationRefs: string[];
  generatedAt: string;
  modelProvider: string;
  modelVersion: string;
  groundingCheckPassed: boolean;
}

/** Contract engine interface. Provider is a construction dependency (see `createNarrativeEngine`). */
export interface NarrativeEngine {
  generate(interpretations: readonly InterpretationObject[], style: NarrativeStyle): Promise<Report>;
  generateForTopic(
    interpretations: readonly InterpretationObject[],
    domain: CanonicalDomain,
    style: NarrativeStyle,
  ): Promise<Report>;
}
