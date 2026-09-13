# RULE ENGINE — Specification (not implemented)

**This is the single most important improvement opportunity identified across the entire audit.** Every audited repo with any rule logic at all (PyJHora's 130+ yoga functions, vedic-calc's 24 `_detect_*` functions, mayaastrolib's yoga detectors, openastrology-library's yoga engine) implements it as **hardcoded conditionals scattered through application code** — none of them are data-driven (`../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`, `INTERPRETATION_AUDIT.md`). This does not scale to hundreds of yogas/rules and makes correctness auditing, versioning, and localization all harder than necessary. This spec deliberately does better.

## Purpose

Evaluate declarative, versioned, data-driven rules against a set of `Factor`s, producing structured determinations (fired/not-fired, strength, confidence) — never prose, never a hardcoded `if` chain buried in application logic.

## Schema

```
Rule {
  id:              RuleId              // e.g. "WESTERN.CAREER.001"
  school:          SchoolId
  version:         string              // semantic version of this individual rule
  ruleset_version: string              // version of the rule collection this belongs to (ADR-008)
  prerequisites:   RuleId[]            // rules that must have been evaluated first (dependency ordering)
  conditions:      ConditionExpr       // declarative boolean expression tree over Factors — see below
  weighting:       WeightingSpec       // how this rule's firing contributes to a domain score
  interpretation:  InterpretationTemplateRef   // reference into the Interpretation layer's template store, NOT inline prose
  evidence:        EvidenceSpec        // what must be recorded when this rule fires — see EVIDENCE_ENGINE_SPEC.md
  source:          SourceRef | null    // classical-text citation, if applicable (see EVIDENCE_ENGINE_SPEC.md bibliography fields)
}

ConditionExpr =
    FactorPresent(factor_id_pattern)
  | FactorThreshold(factor_id_pattern, comparator, value)
  | And(ConditionExpr[])
  | Or(ConditionExpr[])
  | Not(ConditionExpr)

WeightingSpec {
  domain:  string      // "career", "wealth", ... — must match a Factor.category vocabulary entry
  weight:  number
}
```

Example, matching the brief's own illustration:
```
Rule:
  id: WESTERN.CAREER.001
  school: western
  version: 1.0.0
  ruleset_version: western.rules.v1
  prerequisites: []
  conditions:
    And([
      FactorPresent("mars_10th_house"),
      FactorThreshold("mars_10th_house.strength", ">=", 0.5)
    ])
  weighting: { domain: "career", weight: 0.6 }
  interpretation: "WESTERN.CAREER.001.TEMPLATE"
  evidence: { record: ["mars_10th_house"] }
  source: null   // no classical citation needed for a purely geometric placement rule
```

## Interface

```
interface RuleEngine {
  evaluate(factors: Factor[], ruleset: RuleSet) -> RuleEvaluation[]
}

RuleEvaluation {
  rule_id:   RuleId
  fired:     boolean
  strength:  number
  factor_ids_used: FactorId[]     // exact inputs that caused this evaluation — feeds directly into EvidenceEngine
}
```

- The engine itself is a small, generic condition evaluator — it has **zero embedded astrological knowledge**. All astrological knowledge lives in the `RuleSet` data (versioned JSON/YAML-equivalent content, authored and reviewed like content, not like code).
- One `RuleSet` per school, loaded and validated against a schema before evaluation (see `SECURITY_MODEL.md` — rule files are untrusted-until-validated input, never `eval`'d).
- `RuleEngine` never calls the Astronomical Core, the Chart Calculation layer, or any ephemeris library — its only input is `Factor[]`. This is what makes it swappable, versionable, and testable in complete isolation from astronomical calculation correctness.

## Traceability (binding requirement, restated from `ARCHITECTURE_FREEZE.md`)

```
Report → Interpretation → Rule → Factor → Chart → Astronomical Calculation → Birth Data
```
Every `RuleEvaluation` with `fired: true` **must** produce a corresponding `Evidence` record (see `EVIDENCE_ENGINE_SPEC.md`) before it may be consumed by the Interpretation layer. A rule evaluation with no evidence record is treated as a defect, not a valid state — there must never be an "orphaned conclusion" with no traceable source, which the audit found as a real, concrete failure mode in `astro-natal-chart`'s and `zodiac-engine`'s AI-conclusion paths (`../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`).

## Rule content vs. rule engine (explicit separation)

This spec defines the **engine** (the evaluator) at Architecture Freeze time. **Rule content** (which specific yogas/aspect-patterns map to which career/wealth/relationship themes) is explicitly out of scope here — it is content-authoring work, sequenced in `ROADMAP.md` Phase 6, informed by (never copied from) the audited oracles' *documented conditions* (e.g. PyJHora's cited "BVR-22 Ruchaka Yoga" condition text, which is a public-domain classical rule, not copyrightable expression — see `../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md` for why this distinction matters).

## Phase placement

Interface + schema only (Phase 6). No `RuleSet` content is authored, no evaluator is implemented, during Architecture Freeze.

## Open decisions

- **DECISION REQUIRED**: `ConditionExpr` needs a concrete serialization format (JSON Schema vs. a small DSL) — not decided here; whichever is chosen must be schema-validated before load (see `SECURITY_MODEL.md`).
- **VALIDATION GAP**: no audited oracle provides a declarative rule table to translate from — Phase 6 rule authoring must derive conditions from classical primary sources (BPHS, Tetrabiblos, etc., all public domain) or from the *documented condition text* of an oracle (not its code), verified independently against the oracle's *output* using the golden-test strategy in `VALIDATION_ORACLES.md`.
