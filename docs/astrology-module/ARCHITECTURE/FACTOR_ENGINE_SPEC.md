# FACTOR ENGINE — Specification (not implemented)

## Purpose

Extract structured, typed, machine-readable facts-with-astrological-significance from a Normalized `Chart`. A Factor is data, never prose. This is the layer immediately above Chart Calculation and immediately below the Rule Engine — see `ARCHITECTURE_FREEZE.md` §3, layer 7.

## Why this layer exists (audit grounding)

Every audited repo either has no discrete Factor layer at all (most of them go straight from Chart to hardcoded rule conditionals) or, in the one case that does it well, proves the pattern works: **opastro's `FactorDetail`** (`../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`) is a real, execution-verified structured intermediate representation computed *before* any rule or text logic runs. This spec generalizes that proven pattern across schools.

## Schema

```
Factor {
  id:          FactorId              // stable, human-readable, e.g. "mars_10th_house"
  chart_id:    ChartId                // traces back to the exact Chart + CalculationMetadata that produced it
  school:      SchoolId
  category:    string                 // e.g. "career", "wealth", "relationship", "health", "education", "personality" — an open, versioned vocabulary, not a hardcoded enum (new categories must not require a schema migration)
  inputs:      FactorInput[]          // the chart elements this factor is derived from
  strength:    number (-1.0..1.0)     // signed magnitude; sign carries "benefic/malefic" polarity where applicable, magnitude carries confidence/intensity
  computed_at: UTCInstant
  version:     string                 // FactorEngine ruleset/formula version (see ADR-008 Versioning Strategy)
}

FactorInput {
  type:  "planet" | "house" | "aspect" | "sign" | "dignity" | "point" | "dasha_period" | ...
  ref:   string    // e.g. "mars", "house_10", "aspect:mars-saturn:square"
}
```

Example (matches the brief's own illustration exactly):
```json
{
  "id": "mars_10th_house",
  "chart_id": "chart_9f2a...",
  "school": "western",
  "category": "career",
  "inputs": [
    { "type": "planet", "ref": "mars" },
    { "type": "house", "ref": "house_10" }
  ],
  "strength": 0.82,
  "computed_at": "2026-09-13T08:00:00Z",
  "version": "western.factors.v1"
}
```

## Interface

```
interface FactorEngine {
  extractFactors(chart: Chart, school_config: AstrologySchool) -> Factor[]
}
```

- One `FactorEngine` implementation per school (`western.FactorEngine`, `vedic.FactorEngine`, ...) — never a shared cross-school implementation, per `ADR/ADR-003-Astrology-School-Isolation.md`.
- Deterministic: identical `Chart` + `school_config` + engine version must always produce identical `Factor[]` (see `ADR/ADR-008-Versioning-Strategy.md` for how version pinning guarantees this across time).
- `Factor.strength` is computed by declarative formula/weighting, never by the Rule Engine or any later layer — this keeps "how strong is this placement" and "what does this placement mean" cleanly separated, matching `ARCHITECTURE_FREEZE.md`'s FACT vs RULE distinction.

## What a Factor is NOT

- Not a verdict ("this is bad for career") — that is a Rule Engine output.
- Not prose — that is an Interpretation/AI Narrative output.
- Not itself evidence — a `Factor` is *referenced by* Evidence, but Evidence additionally records which Rule fired and why (see `EVIDENCE_ENGINE_SPEC.md`).

## Phase placement

Factor Engine **interface only** is specified now (Phase 5 per `ROADMAP.md`); no factor-extraction logic is implemented until Phase 5. This spec exists at Architecture Freeze time so Phase 1–4 (astronomical core through chart calculation) is built with the correct seam already in place, avoiding a retrofit.

## Open decisions

- **DECISION REQUIRED**: exact `category` vocabulary for V1 (career/wealth/relationship/health/education/personality is the audit-suggested starting set, mirroring opastro's `section_weights` categories — not yet ratified).
- **VALIDATION GAP**: `strength` formula for Vedic factors (Shadbala-derived vs. simple dignity-derived) has no single agreed convention across the audited oracles (PyJHora, vedic-calc, mayaastrolib each compute strength slightly differently) — must be a deliberate design choice at Phase 5/Vedic-factor time, not inherited uncritically from any one oracle.
