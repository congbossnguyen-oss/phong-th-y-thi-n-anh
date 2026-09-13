# ADR-006: Evidence Model

## Status
Proposed

## Context
`opastro` is the only audited repo with a working, execution-verified traceability mechanism (`opastro explain`, confirmed live to link every output sentence to its source factor — `../../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`), but it folds this directly into its interpretation renderer rather than treating it as a distinct layer. The two negative-example repos (`astro-natal-chart`, `zodiac-engine`) have no equivalent mechanism at all and produce untraceable conclusions.

## Decision
1. Evidence is a distinct layer (`../EVIDENCE_ENGINE_SPEC.md`) between Rule Engine and Scoring/Interpretation, not folded into either.
2. Every fired `RuleEvaluation` must produce an `Evidence` record before being consumed downstream — a rule evaluation without evidence is a defect state, not a valid one.
3. `Evidence.trace()`/`traceToBirthData()` must resolve the full chain `Evidence → Rule → Factor → Chart → BirthData` or raise `TRACE_INTEGRITY_ERROR` — partial traces are never returned silently.
4. `SourceRef` (classical-text bibliography) fields are schema-supported now but not required at V1 content (see `../EVIDENCE_ENGINE_SPEC.md` "Bibliography fields").

## Consequences
- Positive: generalizes opastro's proven pattern into a reusable layer usable by every school and every future rule set, not just one renderer's internal logic.
- Positive: makes the `AI_GROUNDING_CONTRACT.md` refusal requirement enforceable — the AI Narrative layer can only cite what Evidence actually links.
- Negative: adds a genuinely new layer with no direct precedent to copy — its correctness (the `TRACE_INTEGRITY_ERROR` behavior especially) is unproven until Phase 7 testing exercises it end-to-end.
