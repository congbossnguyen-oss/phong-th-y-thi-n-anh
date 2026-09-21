/**
 * Phase 9 — NarrativeEngine (AI_GROUNDING_CONTRACT.md, PHASE9_DECISIONS.md).
 *
 * Pipeline: trusted InterpretationObject[] → NarrativeInput → provider.generateNarrative (UNTRUSTED)
 * → deterministic post-generation grounding check → Report.
 *
 * - The provider never receives a Chart / Factor / ephemeris value (contract layer-13 boundary): only the
 *   deterministic NarrativeInput projection reaches it.
 * - Empty / topic-absent input ⇒ deterministic refusal (D4).
 * - Grounding failure ⇒ Report with groundingCheckPassed=false and a fixed BLOCK notice; the hallucinated
 *   text is discarded (never served, never silently rewritten) (D4).
 * - No LLM/vendor here; provider is an injected abstraction (D3).
 */

import type { CanonicalDomain } from "../domain/types.js";
import type { InterpretationObject } from "../interpretation/types.js";
import type { NarrativeEngine, NarrativeProvider, NarrativeStyle, Report } from "./types.js";
import { toNarrativeInput } from "./renderer.js";
import { checkGrounding } from "./grounding.js";

/** Fixed refusal / block notices (Vietnamese). Entity-free by construction → pass the grounding check. */
export const NARRATIVE_REFUSAL_TEXT =
  "Không đủ dữ liệu diễn giải có căn cứ cho chủ đề này.";
export const NARRATIVE_BLOCKED_TEXT =
  "Nội dung tạo sinh không vượt qua kiểm tra căn cứ và đã bị chặn, không phục vụ.";

export interface NarrativeEngineOptions {
  /** Injected clock (the only nondeterministic value; never affects grounding). Default: system time ISO. */
  now?: () => string;
  /** Injected report-id factory. Default: deterministic, content-derived from the sorted interpretation refs. */
  makeReportId?: (refs: readonly string[]) => string;
}

function defaultReportId(refs: readonly string[]): string {
  return `report:${[...refs].sort().join("|")}`;
}

/** Construct a NarrativeEngine bound to a provider (mock in Phase 9; real provider only at the edge). */
export function createNarrativeEngine(
  provider: NarrativeProvider,
  options: NarrativeEngineOptions = {},
): NarrativeEngine {
  const now = options.now ?? (() => new Date().toISOString());
  const makeReportId = options.makeReportId ?? defaultReportId;

  function buildReport(text: string, refs: string[], groundingCheckPassed: boolean): Report {
    return {
      reportId: makeReportId(refs),
      narrativeText: text,
      interpretationRefs: refs,
      generatedAt: now(),
      modelProvider: provider.modelProvider,
      modelVersion: provider.modelVersion,
      groundingCheckPassed,
    };
  }

  function refusal(): Report {
    // Refusal text is grounded against an empty allowed set (no entities/numbers) → passes.
    const passed = checkGrounding(NARRATIVE_REFUSAL_TEXT, []).grounded;
    return buildReport(NARRATIVE_REFUSAL_TEXT, [], passed);
  }

  async function generate(
    interpretations: readonly InterpretationObject[],
    _style: NarrativeStyle,
  ): Promise<Report> {
    if (interpretations.length === 0) return refusal();

    const parts: string[] = [];
    for (const it of interpretations) {
      // Only the deterministic grounded projection reaches the provider — never Chart/Factor/ephemeris.
      parts.push(await provider.generateNarrative(toNarrativeInput(it)));
    }
    const text = parts.join("\n\n");
    const refs = interpretations.map((it) => it.interpretationId);

    const grounding = checkGrounding(text, interpretations);
    if (!grounding.grounded) {
      // Hallucination discarded — never served, never rewritten into plausible prose.
      return buildReport(NARRATIVE_BLOCKED_TEXT, refs, false);
    }
    return buildReport(text, refs, true);
  }

  async function generateForTopic(
    interpretations: readonly InterpretationObject[],
    domain: CanonicalDomain,
    style: NarrativeStyle,
  ): Promise<Report> {
    const subset = interpretations.filter((it) => it.domain === domain);
    if (subset.length === 0) return refusal();
    return generate(subset, style);
  }

  return { generate, generateForTopic };
}
