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
```
InterpretationObject {
  interpretation_id: UUID
  domain:            string
  conclusion:        StructuredConclusion   // NOT a free string — a typed key + parameters, e.g. { key: "ELEVATED_CAREER_PRESSURE", params: {...} }
  supporting_factors: FactorId[]
  rules:             RuleId[]
  evidence:          EvidenceId[]
  strength:          number
  confidence:        number (0..1)          // reflects oracle/validation-strength tier from VALIDATION_ORACLES.md, NOT model confidence
  caveats:           Caveat[]               // e.g. "unknown birth time — house-dependent factors excluded"
}

StructuredConclusion {
  key:    string     // stable identifier into a localization/template table — the ONLY place natural language enters before AI Narrative
  params: map<string, any>
}

Caveat { code: string, detail_params: map<string, any> }
```

### Interface
```
interface InterpretationEngine {
  interpret(chart: Chart, factors: Factor[], rule_evaluations: RuleEvaluation[], evidence: Evidence[], scores: DomainScore[]) -> InterpretationObject[]
}
```

### Why `conclusion` is a typed key, not a string
This is the one deliberate deviation from opastro's own implementation, made because opastro's approach (compose the English sentence at this stage) hard-couples interpretation content to the English language. By keeping `conclusion.key` + `params` structured, the same `InterpretationObject` can be rendered into Vietnamese (Phongthuy.vn's actual target language — confirmed as absent from every audited repo except partial multi-language support in PyJHora, which has no Vietnamese either, per `../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`) without touching the deterministic pipeline. Localization becomes a template-table concern, not a re-computation concern.

### Phase placement
Interface + schema only (Phase 8, per `ROADMAP.md`). No conclusion-key vocabulary or localization templates are authored during Architecture Freeze.

### Open decisions
- **DECISION REQUIRED**: `StructuredConclusion.key` vocabulary and its Vietnamese template table are content work, not architecture work — sequenced into `ROADMAP.md` Phase 8.
- **DECISION REQUIRED**: `confidence` field's exact formula tying it to `VALIDATION_ORACLES.md`'s oracle-strength tiers (strong/moderate/weak/none) is not yet defined — flagged so it isn't accidentally conflated with an LLM's own token-probability confidence, which it must never be.
