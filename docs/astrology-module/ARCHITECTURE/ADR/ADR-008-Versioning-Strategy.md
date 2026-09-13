# ADR-008: Versioning Strategy

## Status
Proposed

## Context
Rules, calculation engines, and school configurations will all change over time. Without explicit versioning, a changed report for the same birth data is unexplainable — the audit found this concern absent from every reviewed repo's design entirely (none of them version rule content independently of code releases).

## Decision
1. Every `Rule` carries its own `version`; every school's rule collection carries a `ruleset_version` (e.g. `western.rules.v1`).
2. Every `Chart.metadata` (`CalculationMetadata`) records `engine`, `engine_version`, `ephemeris_version`, `zodiac_config_version`, `house_system`, `ayanamsa`, `precision_policy_version`.
3. Every `Report` records `interpretation_refs`, which transitively resolve to the exact `school_version`/`rule_version`/`calculation_version` used, via the Evidence chain (ADR-006).
4. `FactorEngine`/`RuleEngine`/`InterpretationEngine` implementations are themselves versioned, and `Factor`/`RuleEvaluation`/`InterpretationObject` records carry the producing version.

## Consequences
- Positive: reproducibility (`../ROADMAP.md` DoD requirement, `../ARCHITECTURE_FREEZE.md` §4) is enforceable and testable: same `BirthData` + same pinned versions ⇒ byte-identical `Chart`/`Factor[]`/`RuleEvaluation[]` (deterministic layers only — `Report` is excepted per ADR-007).
- Positive: a future rule-content change's effect on historical reports is fully explainable via version diffing, without re-deriving anything from scratch.
- Negative: every schema gains version fields that must be threaded through every layer consistently — a discipline cost, not a technical one, but a real one that must be enforced in code review once implementation begins.
