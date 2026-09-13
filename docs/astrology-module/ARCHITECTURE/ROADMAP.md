# ROADMAP — Astrology Module

**This is the authoritative phase breakdown**, superseding the single-"Phase 1" framing in `../ASTROLOGY_PHASE1/PHASE1_SCOPE.md` (see `ARCHITECTURE_FREEZE.md` §7 for reconciliation). No phase after Phase 0 may be started before the prior phase's Definition of Done is met. **No phase may jump to Phase 10 early.**

## Phase 0 — Architecture + legal decision
- Deliverable: this entire `ASTROLOGY_ARCHITECTURE/` document set (in progress/complete as of this freeze).
- Legal: `LICENSE_BOUNDARY.md` gate opened; Astrodienst AG contact initiated (outside engineering's control to complete).
- DoD: All documents in this folder exist, are internally consistent, and contain no unresolved `TODO`s that block Phase 1 design (open `DECISION REQUIRED`/`VALIDATION GAP` items are acceptable and expected — they are tracked, not silently ignored).

## Phase 1 — Astronomical Core
- Deliverable: `AstronomicalProvider` interface finalized; `SwissEphemerisProvider` **specification** (dependency boundary, API mapping, data files, configuration, precision, errors, resource lifecycle) complete but **not implemented**, explicitly gated `LEGAL DECISION REQUIRED`; Timezone/DST engine design finalized (library candidate, data source, error policy) but **not implemented**.
- Depends on: Phase 0.
- DoD: See `ARCHITECTURE_FREEZE.md` §6.G. No code written.

## Phase 2 — Normalized Chart
- Deliverable: `Chart`/`PlanetPosition`/`House`/`HouseCusp`/`Angle`/`Node`/`CalculationMetadata` schemas implemented and unit-tested against a stub `AstronomicalProvider` (no real ephemeris calls needed to validate the model's own invariants).
- Depends on: Phase 1 interface (not its concrete implementation).
- DoD: Normalization tests (per `TEST_ARCHITECTURE.md`) pass against synthetic provider output.

## Phase 3 — Western Calculation
- Deliverable: `western.core` (tropical zodiac, Sun→Pluto, Nodes, ASC/MC/DESC/IC, one house system, 5 major aspects with configurable orbs) implemented against a **real** `SwissEphemerisProvider` — this is the first phase that requires the license gate to be resolved, or an explicit interim decision (e.g. development-only use pending the gate, clearly separated from anything shipped to production).
- Depends on: Phase 1 (concrete provider), Phase 2.
- DoD: Golden tests (per `TEST_ARCHITECTURE.md`/`VALIDATION_ORACLES.md`) pass against stellium + direct-Swiss-Ephemeris oracles at the specified tolerance, across the full test matrix in `VALIDATION_ORACLES.md`.

## Phase 4 — Vedic Calculation
- Deliverable: `vedic` school's V1 module set (Rashi/D1, Nakshatra+Pada, Vimshottari Dasha — see `DOMAIN_MODEL.md` §7 for the oracle-strength-prioritized module list).
- Depends on: Phase 3 (proves the school-isolation pattern works for a second school without touching Western code).
- DoD: Golden tests pass against PyJHora + vedic-calc oracles; `ADR/ADR-003-Astrology-School-Isolation.md` compliance verified (zero cross-references between `western/` and `vedic/` modules).

## Phase 5 — Factor Engine
- Deliverable: `FactorEngine` implemented for `western.core` (Vedic factors deferred to align with whichever Vedic V-tag is complete).
- Depends on: Phase 3.
- DoD: Deterministic, versioned factor extraction verified reproducible (same Chart + config + version ⇒ same Factor[], always).

## Phase 6 — Rule Engine
- Deliverable: `RuleEngine` evaluator implemented (generic, zero embedded astrological knowledge) + first authored `western.rules.v1` content set (a small number of well-understood rules, e.g. angular-house placements, major-aspect patterns).
- Depends on: Phase 5.
- DoD: Rule content authored from public-domain classical sources or independently-verified geometric conditions (never copied from an oracle's expression); `RuleSet` schema validation enforced (`SECURITY_MODEL.md`).

## Phase 7 — Evidence + Scoring
- Deliverable: `EvidenceEngine` + `ScoringEngine` implemented.
- Depends on: Phase 6.
- DoD: `traceToBirthData()` resolves fully for every fired rule in the Phase 6 content set; no orphaned conclusions possible even by construction.

## Phase 8 — Interpretation
- Deliverable: `InterpretationEngine` implemented; `StructuredConclusion` vocabulary + Vietnamese localization templates authored for the Phase 6 rule set.
- Depends on: Phase 7.
- DoD: `InterpretationObject`s produced end-to-end from a real Chart, fully traceable, in Vietnamese.

## Phase 9 — AI Narrative
- Deliverable: `NarrativeEngine` implemented per `AI_GROUNDING_CONTRACT.md`; post-generation grounding check implemented and adversarially tested.
- Depends on: Phase 8.
- DoD: AI Grounding Tests (per `TEST_ARCHITECTURE.md`) pass, including the negative case (forced hallucination is caught, not shipped).

## Phase 10 — Web Integration
- Deliverable: Public API (per `API_SPEC.md`), authentication/authorization, rate limiting, production database.
- Depends on: Phase 9.
- DoD: Not specified at Architecture Freeze time — out of scope for this document; a separate specification pass is required before Phase 10 begins.

## Repository structure (proposed, may change with justification)

```
astrology/
│
├── domain/           # BirthData, Chart, Factor, Rule, Evidence, Interpretation, Report schemas
├── input/            # Input model + validation
├── timezone/         # Timezone/DST resolution engine
├── astronomical/      # AstronomicalProvider interface + provider implementations
├── chart/            # Chart Calculation layer
├── schools/
│   ├── western/
│   ├── vedic/
│   ├── hellenistic/
│   └── traditional/
├── factors/
├── rules/
├── evidence/
├── scoring/
├── interpretation/
├── narrative/
├── validation/       # Input validation rules (distinct from golden-test validation)
├── api/
└── tests/
    ├── astronomical/
    ├── calculation/
    ├── normalization/
    ├── rules/
    ├── factors/
    ├── interpretation/
    ├── ai_grounding/
    └── e2e/
```

This structure mirrors the layer diagram in `ARCHITECTURE_FREEZE.md` §2 one-to-one — no folder exists that doesn't correspond to a named layer, and no layer lacks a folder. `schools/` enforces the isolation requirement (`ADR/ADR-003`) at the filesystem level: nothing under `schools/western/` may import from `schools/vedic/` or vice versa.

## Versioning strategy (summary — full detail in `ADR/ADR-008-Versioning-Strategy.md`)

- Every `Rule` has its own `version`; every school's rule collection has a `ruleset_version` (e.g. `western.rules.v1`).
- Every `Chart`'s `CalculationMetadata` records `engine_version`, `ephemeris_version`, `zodiac_config_version`.
- Every `Interpretation`/`Report` records which `school_version`, `rule_version`, and `calculation_version` produced it.
- **Goal**: given the same birth data, if a rule set changes and the report changes, that change is fully explainable by diffing the recorded versions — never a mystery.
