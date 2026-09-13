# ARCHITECTURE FREEZE — Astrology Module, Phongthuy.vn

**Status: SPECIFICATION ONLY. No production code exists or is authorized by this document.**

This freeze is built directly on the deep audit in `../ASTROLOGY_REPO_AUDIT/` (`EXECUTIVE_SUMMARY.md`, `LICENSE_AUDIT.md`, `SWISS_EPHEMERIS_AUDIT.md`, `WESTERN_AUDIT.md`, `VEDIC_AUDIT.md`, `AI_ARCHITECTURE_AUDIT.md`, `SECURITY_AUDIT.md`, `TEST_AUDIT.md`, `BENCHMARK.md`, `ARCHITECTURE_PROPOSAL.md`, `RECOMMENDATION.md`). Every architectural decision below traces to a specific audit finding — none of this is invented in a vacuum. Where the audit did not produce a definitive answer, this document says so explicitly (`UNKNOWN`, `DECISION REQUIRED`, `LEGAL REVIEW REQUIRED`, `VALIDATION GAP`) rather than guessing.

## 1. Prohibition restated

This freeze authorizes: design, specification, schema, interfaces, dependency architecture, validation strategy, test strategy, license boundary definition, ADRs, and an implementation roadmap. It does **not** authorize: production code, forking any audited repo, copying code from any audited repo, modifying the live website, deployment, database migration, or any committed production implementation. See `../ASTROLOGY_PHASE1/` for a narrower, code-adjacent Phase-1 scope note written before this freeze — this document's `ROADMAP.md` is the authoritative phase breakdown going forward (see §7 below for reconciliation).

## 2. The architecture, end to end

```
                     ASTROLOGY MODULE
                            │
             ┌──────────────┴──────────────┐
             │                              │
       INPUT / VALIDATION             CONFIGURATION
             │                              │
             └──────────────┬───────────────┘
                            ↓
                  ASTRONOMICAL CORE
                            ↓
                    CHART CALCULATION
                            ↓
                    NORMALIZED CHART
                            ↓
                 ASTROLOGICAL FACTORS
                            ↓
                      RULE ENGINE
                            ↓
                    EVIDENCE ENGINE
                            ↓
                    SCORING ENGINE
                            ↓
                 INTERPRETATION ENGINE
                            ↓
                      AI NARRATIVE
                            ↓
                         REPORT
```

This is a hard constraint, not a suggestion: **the module must never collapse to `Birth Data → LLM → Reading`.** The audit found this exact collapsed shape live and broken in two real repos (`astro-natal-chart`, `zodiac-engine` — see `AI_ARCHITECTURE_AUDIT.md`); it is the negative case this architecture is designed to make structurally impossible, not just discouraged by convention.

## 3. Layer responsibilities (binding contract between layers)

| # | Layer | Responsibility | Must NOT do | Spec doc |
|---|---|---|---|---|
| 1 | Input | Accept `date, time, timezone, latitude, longitude, location, birth-time-uncertainty?` | Validate, resolve time, or calculate anything | `DOMAIN_MODEL.md` |
| 2 | Validation | Reject impossible dates/times, invalid coordinates, invalid/unknown timezones; flag DST ambiguity/nonexistence for the Time Resolution layer to handle | Silently coerce or "fix" bad input | `DOMAIN_MODEL.md`, error codes in this doc §6 |
| 3 | Time Resolution (custom-built) | Turn `local time + timezone + historical DST` into a canonical UTC instant | Delegate to the astronomical core; guess an offset when ambiguous/nonexistent | `../ASTROLOGY_PHASE1/TIMEZONE_ENGINE.md` (superseded in detail by `ADR/ADR-010-Timezone-DST-Architecture.md`) |
| 4 | Astronomical Core | Wrap an ephemeris engine (Swiss Ephemeris candidate) behind `AstronomicalProvider`; return raw astronomical facts only | Know about signs, houses-as-meaning, dignities, yogas, or any astrological judgment | `DOMAIN_MODEL.md` §AstronomicalProvider, `ADR/ADR-001-Ephemeris-Strategy.md` |
| 5 | Chart Calculation | Apply a school's configuration (zodiac, house system, ayanamsa) to astronomical facts to produce planet-in-sign, planet-in-house, angles, aspects | Apply any other school's configuration; attach interpretive meaning | `DOMAIN_MODEL.md`, `ADR/ADR-003-Astrology-School-Isolation.md` |
| 6 | Normalized Chart | Vendor-independent, immutable representation of a calculated chart | Reference any specific ephemeris library's types directly | `DOMAIN_MODEL.md` |
| 7 | Astrological Factors | Extract structured, typed facts-with-astrological-significance from a Normalized Chart (e.g. "Mars in 10th house") | Attach a verdict, score, or prose | `FACTOR_ENGINE_SPEC.md` |
| 8 | Rule Engine | Evaluate declarative, versioned rules against Factors, producing boolean/weighted determinations | Hardcode astrological logic as scattered `if` statements in application code; generate prose | `RULE_ENGINE_SPEC.md` |
| 9 | Evidence Engine | Record, per rule firing, exactly which factors/calculations/sources produced it | Discard provenance for the sake of a simpler payload | `EVIDENCE_ENGINE_SPEC.md` |
| 10 | Scoring Engine | Aggregate weighted factors into domain scores (career, wealth, relationship, health...) | Let the AI narrative layer invent or override a score | `INTERPRETATION_SPEC.md` §Scoring |
| 11 | Interpretation Engine | Compose structured `InterpretationObject`s (conclusion + supporting factors/rules/evidence/strength/confidence/caveats) — still not prose | Emit free-form natural-language paragraphs | `INTERPRETATION_SPEC.md` |
| 12 | AI Narrative | Turn `InterpretationObject`s into readable prose, strictly grounded | Recalculate, invent facts/rules/evidence, override scores or conclusions | `AI_GROUNDING_CONTRACT.md` |
| 13 | Report | Assemble narrative + traceability metadata into the final user-facing artifact | — | `API_SPEC.md` |

## 4. Non-negotiable constraints (from the audit, restated as binding rules)

1. **No domain code imports an ephemeris library directly.** Confirmed necessary by `SWISS_EPHEMERIS_AUDIT.md` (licensing) and by `WESTERN_AUDIT.md`/`VEDIC_AUDIT.md` (every audited repo that mixes calculation and licensing concerns in one module paid for it in flexibility). Enforced via `AstronomicalProvider` (see `DOMAIN_MODEL.md`).
2. **Swiss Ephemeris licensing is UNRESOLVED.** No document in this architecture may assert commercial closed-source clearance. See `LICENSE_BOUNDARY.md` and `ADR/ADR-002-License-Boundary.md`. This is restated in the license doc, not just here, on purpose — it must be impossible to miss.
3. **Timezone/DST resolution is never the astronomical core's job.** Confirmed as a universal gap across all 10 audited repos (`../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md` §3.4: Swiss Ephemeris has zero timezone/DST knowledge). This is the one component every audited repo either skips or bolts on badly — it gets a dedicated custom-built layer here.
4. **Calculation, Factors, Rules, Evidence, Scoring, Interpretation, and AI Narrative are seven distinct layers**, not two or three collapsed together. Confirmed as achievable and valuable by `opastro`'s working (if unlicensed-for-reuse) implementation — see `AI_ARCHITECTURE_AUDIT.md`. This architecture goes one step further than opastro by separating Evidence and Scoring as their own explicit layers rather than folding them into the interpretation renderer.
5. **Every school (Western, Vedic, Hellenistic, Traditional, KP, future phong-thủy schools) has independent configuration and rules.** No cross-references. See `ADR/ADR-003-Astrology-School-Isolation.md`.
6. **No audited repo's code is vendored, forked, or copied.** All of it — Swiss Ephemeris excepted, pending the license decision — is validation-oracle/reference material only. See `VALIDATION_ORACLES.md`.
7. **The AI Narrative layer never receives a raw Chart and never performs astrological reasoning.** It receives only `InterpretationObject`s and must refuse (not guess) when grounding is insufficient. See `AI_GROUNDING_CONTRACT.md`.
8. **Every conclusion is traceable**: `Report → Interpretation → Rule → Factor → Chart → Astronomical Calculation → Birth Data`, with no orphaned conclusions. See `EVIDENCE_ENGINE_SPEC.md`.

## 5. Error taxonomy (binding, referenced by every layer's spec)

```
INVALID_BIRTH_DATE
INVALID_BIRTH_TIME
INVALID_COORDINATES
INVALID_TIMEZONE
TIMEZONE_NOT_FOUND
AMBIGUOUS_LOCAL_TIME       (DST fall-back overlap)
NONEXISTENT_LOCAL_TIME     (DST spring-forward gap)
EPHEMERIS_ERROR
CALCULATION_ERROR
UNSUPPORTED_SCHOOL
UNSUPPORTED_FEATURE
UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE   (e.g. Placidus undefined inside the polar circle)
```
No layer may substitute a best-guess value for any of these — every one of them is a hard stop returned to the caller, never silently patched. This directly addresses the confirmed defect pattern found in `openastrology-library` (`WESTERN_AUDIT.md`/`SECURITY_AUDIT.md`: Vedic and Western calculators handled a missing-ephemeris-file condition *inconsistently*, one silently degrading and one throwing) — this architecture requires **one** consistent, explicit error contract across every school and every layer.

## 6. Final Architect Decision (answers to the required questions)

**A. Is this architecture sufficient to begin implementation?**
Yes, for the astronomical-core → chart-calculation → normalized-chart → Western-factors slice (Phases 1–5 in `ROADMAP.md`). Rule/Evidence/Scoring/Interpretation/AI layers are specified at the interface/schema level (sufficient to start Phase 6+ without re-architecting), but their internal rule *content* (which yogas, which aspect-to-theme mappings) is not yet authored — that is content work, not architecture work, and is correctly sequenced after the calculation core per `ROADMAP.md`.

**B. Is there any dependency that should be removed?**
Not from this specification (it names no concrete package dependency yet beyond "an ephemeris provider" and "an IANA tzdata source" — both abstracted). The one thing to actively avoid, per the audit, is depending on `pyswisseph` directly instead of its maintained fork `pysweph` (see `SWISS_EPHEMERIS_AUDIT.md` — `pyswisseph` is de facto abandoned) *if and when* Swiss Ephemeris is chosen as the concrete adapter — this is recorded in `ADR/ADR-001-Ephemeris-Strategy.md`, not decided here.

**C. Is there any unresolved license blocker?**
Yes — the single largest one: **Swiss Ephemeris Professional License status is UNKNOWN.** See `LICENSE_BOUNDARY.md`. Nothing in this architecture may proceed to a production ephemeris adapter until this is resolved. The architecture is deliberately built so this resolution, whenever it lands, changes exactly one component (`SwissEphemerisProvider`) and nothing else.

**D. Is anything over-designed relative to what's needed now?**
The Evidence Engine's bibliography fields (`tradition/author/work/edition/page`) are speculative for schools with no authored rules yet (Vedic, Hellenistic) — flagged in `EVIDENCE_ENGINE_SPEC.md` as schema-supported-but-not-required-at-V1, to avoid blocking Western rule authoring on a bibliography standard nobody has written yet. Everything else in this freeze maps directly to a named audit finding or a stated Phase 1–3 need; nothing else was found to be speculative padding.

**E. Is anything missing that production would need?**
Yes, explicitly deferred, not missing by oversight: production authentication/authorization on the API surface, rate limiting, a real database schema (only serialization shape + versioning is specified here), and all rule *content* beyond the 5 Phase-1 major aspects. These are named in `ROADMAP.md` under their respective phases.

**F. What must Phase 1 build, exactly?**
Astronomical Core only: `AstronomicalProvider` interface, `Chart`/`CalculationMetadata` skeleton sufficient to hold provider output, and the Timezone/DST engine — with `SwissEphemerisProvider` specified but **not implemented** pending the license decision, and no Western/Vedic school logic yet. See `ROADMAP.md` Phase 1.

**G. What is Phase 1's Definition of Done?**
1. `AstronomicalProvider` interface is fully specified and reviewed. 2. `SwissEphemerisProvider`'s specification (not implementation) is complete and explicitly gated `LEGAL DECISION REQUIRED`. 3. The Timezone/DST engine's design (library candidate, data source, error policy) is complete, unimplemented, and testable-by-spec. 4. `LICENSE_BOUNDARY.md` and `ADR-002` exist and are unambiguous about current UNKNOWN status. 5. No code has been written. See `ROADMAP.md` for the full per-phase Definition of Done ladder.

## 7. Reconciling this freeze with the earlier `ASTROLOGY_PHASE1/` note

The `../ASTROLOGY_PHASE1/PHASE1_SCOPE.md` file (written earlier in this session, before this freeze was requested) described a single "Phase 1" that bundled the astronomical core, timezone engine, *and* a full Western tropical natal calculation (planets/houses/angles/aspects). **This freeze's `ROADMAP.md` supersedes that framing**: it splits the same work into Phase 1 (astronomical core + timezone only) through Phase 3 (Western calculation), which is the more disciplined sequencing and is what this document now treats as authoritative. The content already drafted under `ASTROLOGY_PHASE1/` is not wasted — it maps directly onto Phases 1–3 here and can be reconciled into this structure at implementation time; it is not superseded on substance, only on phase numbering.
