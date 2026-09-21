# INTERPRETATION SPEC — Scoring Engine + Interpretation Engine (not implemented)

This document covers two adjacent layers (`ARCHITECTURE_FREEZE.md` §3, layers 10–11), specified together because Scoring exists solely to feed Interpretation and the two are always exercised together in every real pipeline the audit found.

## Part A — Scoring Engine

### Purpose
Aggregate weighted `Factor`s (via fired `RuleEvaluation.weighting`) into per-domain scores (career, wealth, relationship, health, education, personality, ...) — **before** any interpretation text is composed, and strictly separated from it.

### Why this layer exists (audit grounding)
opastro's `section_weights`/`_score_section` mechanism (`../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`) is the only audited implementation that keeps scoring numerically separate from phrase composition — this spec extracts that pattern into its own explicit layer rather than folding it into a renderer, as opastro does.

### Schema
```
DomainScore {
  domain:        string          // "career", "wealth", ...
  chart_id:      ChartId
  score:         number          // aggregated, signed
  contributing_rule_ids: RuleId[]
  computed_at:   UTCInstant
  version:       string
}
```

### Interface
```
interface ScoringEngine {
  score(rule_evaluations: RuleEvaluation[]) -> DomainScore[]
}
```
Deterministic, weighted-sum aggregation only. **No AI, no randomness, no LLM involvement anywhere in this layer** — this is a hard constraint restated from `ARCHITECTURE_FREEZE.md` §17 (AI must never invent or override a score).

## Part B — Interpretation Engine

### Purpose
Compose structured `InterpretationObject`s from Chart + Factors + Rules + Evidence + Scores. **Output is still not prose** — it is the last fully-structured, fully-deterministic object before the AI Narrative layer.

### Why this layer exists (audit grounding)
This is exactly opastro's `SectionInsight`/highlight-with-provenance pattern (`../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md` §5.4), generalized. opastro proves this is buildable and works end-to-end (verified live, deterministic, SHA-256-seeded reproducibility) — the one thing this spec does differently is keep `InterpretationObject` a clean data object rather than opastro's approach of directly emitting template-composed English sentences at this stage; final-language prose is deferred one more layer, to AI Narrative, so the same `InterpretationObject` can drive Vietnamese (or any language) output without re-running the deterministic pipeline.

### Schema

> **Phase 8 FROZEN** — this schema is reconciled to the human-ratified, frozen Phase 8 contract in
> `PHASE8_DECISIONS.md` (H1/H3/H4/H5/H6 + D-series). It supersedes the pre-ratification draft that
> previously carried `confidence`, `strength`, and free-form conclusion keys. Fields are camelCase
> (repo convention); the implementation lives in `packages/astrology-core/src/interpretation/`.

```
InterpretationObject {
  interpretationId:  string          // D-ID-CONSTRUCT: `${calculationId}:${domain}` — deterministic, no UUID/timestamp/hash
  domain:            CanonicalDomain  // exactly one of the 15 H1 keys
  conclusion:        { key: "domain_activated" | "domain_not_indicated", params: Record<string, unknown> }
  supportingFactors: FactorId[]       // provenance (from Evidence.factorIds of activated rules); deterministic, sorted
  rules:             RuleId[]         // contributing RuleIds; deterministic, sorted
  evidence:          EvidenceId[]     // deterministic, sorted; see D-EVIDENCE-SCOPE below
  caveats:           Caveat[]         // structural container; not populated in v1
  version:           string           // "interpretation.v1"
}

Caveat { code: string, detailParams: Record<string, unknown> }
```

- **NO `confidence` (D-CONF, removed).** **NO `strength` (D-STRENGTH, removed).** Not reintroducible
  under any other name; no polarity/intensity/prediction/probability/severity/risk.
- **Conclusion keys (H3):** exactly `domain_activated` and `domain_not_indicated` — structural only, no
  third key, no prose. Natural-language rendering is deferred to the AI Narrative layer (Phase 9).
- **D-EVIDENCE-SCOPE:** a `domain_activated` object MUST have `evidence.length > 0`; a
  `domain_not_indicated` object MAY have an empty `evidence` array (structural absence; Phase 7B
  records no Evidence for non-fired rules — absence Evidence is never manufactured).
- **D-EMIT (emission scope):** per canonical domain — 0 bound rules ⇒ emit nothing (not assessed);
  ≥1 bound rule, none fired+evidenced ⇒ `domain_not_indicated`; ≥1 fired+evidenced ⇒ `domain_activated`.
  Western RuleSet V1 is unassigned, so `interpret()` against it emits `[]` (intentional).

### Interface
```
// Phase 8 FROZEN signature (D-INTERPRET-INPUT): `ruleset` is required to resolve Rule.domain
// (RuleEvaluation carries no domain). Scores are NOT consumed — DomainScore is inactive/deferred (H6/D-SCORE).
interpret(chart, factors, ruleEvaluations, evidence, ruleset) -> InterpretationObject[]
```
Deterministic (output ordered by the canonical domain order; arrays sorted). A consumer/assembly layer:
it does not recalculate the chart or factors, rerun the Rule Engine, recreate Evidence, or activate
Scoring.

### Why `conclusion` is a typed key, not a string
This is the one deliberate deviation from opastro's own implementation, made because opastro's approach (compose the English sentence at this stage) hard-couples interpretation content to the English language. By keeping `conclusion.key` + `params` structured, the same `InterpretationObject` can be rendered into Vietnamese (Phongthuy.vn's actual target language — confirmed as absent from every audited repo except partial multi-language support in PyJHora, which has no Vietnamese either, per `../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`) without touching the deterministic pipeline. Localization becomes a template-table concern, not a re-computation concern.

### Phase placement
Interface + schema only (Phase 8, per `ROADMAP.md`). No conclusion-key vocabulary or localization templates are authored during Architecture Freeze.

### Resolved decisions (Phase 8, HUMAN RATIFIED — see `PHASE8_DECISIONS.md`)
- Conclusion vocabulary is frozen to `domain_activated` / `domain_not_indicated` (H3). Vietnamese
  localization templates and prose remain deferred to the AI Narrative layer (Phase 9).
- `confidence` is **removed** (D-CONF); `strength` is **removed** (D-STRENGTH). No numeric/ordinal
  confidence or interpretation strength exists in Phase 8. The earlier "DECISION REQUIRED" notes about
  a confidence formula are therefore closed — no such field exists to define.
- Scoring / `DomainScore` (Part A) is **inactive / deferred** for Phase 8 (H6, D-SCORE): no numeric
  weighting, no aggregation, no cross-domain comparison; `interpret()` does not consume scores.
