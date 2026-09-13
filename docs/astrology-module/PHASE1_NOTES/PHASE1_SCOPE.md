# PHASE 1 SCOPE — Astrology Module, Phongthuy.vn

Status: **SPECIFICATION ONLY. No code, no implementation, no deployment.**

This document defines the boundary of Phase 1. Everything outside this boundary is explicitly deferred, not forgotten — deferred items are named so Phase 2+ can start without renegotiating scope or refactoring Phase 1's core.

Phase 1's single goal: **produce a verifiable, reproducible, vendor-independent Western tropical natal-chart calculation core**, with the astronomical engine (Swiss Ephemeris) fully abstracted behind a replaceable interface and licensing status explicitly unresolved (see `LICENSE_DECISION_GATE.md`).

## In scope (Phase 1)

| Area | Included |
|---|---|
| Input model | `BirthData` (date, local time, timezone, latitude, longitude, location metadata) |
| Input validation | Impossible dates, invalid coordinates, invalid timezone identifiers, ambiguous/nonexistent local time at DST transitions |
| Timezone/DST engine | Custom component converting local birth time + IANA timezone (+ historical DST rules) → canonical UTC instant |
| Astronomical abstraction | `AstronomicalProvider` interface — domain code never imports an ephemeris library directly |
| Swiss Ephemeris adapter | `SwissEphemerisProvider` — **specification only, not implemented**, gated on `LICENSE_DECISION_GATE.md` |
| Canonical chart model | Vendor-independent `Chart`, `PlanetPosition`, `House`, `HouseCusp`, `Angle`, `Node`, `CalculationMetadata` |
| Western natal calculation | Tropical zodiac; Sun→Pluto; North/South Node; ASC/MC/DESC/IC; one house system (chosen and justified below); 5 major aspects (conjunction, opposition, square, trine, sextile) with configurable orbs |
| Precision policy | Internal vs. display precision, comparison tolerances — defined before any test is written |
| Golden test architecture | Oracle-based cross-validation strategy (Swiss Ephemeris direct, stellium, mayaastrolib — run out-of-process, never imported into production runtime) |
| Test matrix | Timezone, DST, historical timezone, boundary (sign/house-cusp/retrograde-station/midnight/leap-day), geography (N/S/equator/high-latitude) coverage |
| Reproducibility | Same `BirthData` + configuration + engine version ⇒ same output, always |
| School isolation | Western configuration lives in its own isolated module; no cross-references to Vedic or other schools |
| Interface boundaries (not implemented) | `FactorEngine`, interpretation boundary, `InterpretationObject → LLM` boundary — named and typed, zero logic behind them |
| Internal service boundary | `calculate_chart(BirthData) → CanonicalChart` — internal only, no public production API |
| Security spec | Untrusted-input handling, dependency security, ephemeris file access, deserialization, command-execution prevention |
| Performance spec | What to measure (cold/warm/batch calculation, memory, ephemeris init) — no optimization |
| License gate | Explicit, standalone `LICENSE_DECISION_GATE.md` — Swiss Ephemeris Professional License status is UNKNOWN until Astrodienst AG is contacted |

## Explicitly out of scope for Phase 1 (deferred, not forgotten)

| Area | Deferred to |
|---|---|
| Rule engine implementation | Phase 2 — Phase 1 only defines the `Chart → FactorEngine` interface boundary |
| Factor engine implementation | Phase 2 |
| Interpretation engine implementation | Phase 2/3 |
| AI narrative generation | Phase 3+ — Phase 1 only reserves the `InterpretationObject → LLM` boundary; the LLM never receives a raw `Chart` |
| Vedic / sidereal / Hellenistic / KP / Jaimini calculation | Phase 2+ (school-isolated, will not touch Western code) |
| Transits, synastry, progressions, returns | Phase 2+ |
| Additional house systems beyond the Phase 1 default | Phase 2+ (architecture must allow adding them without refactor — see `PHASE1_ARCHITECTURE.md`) |
| Minor/harmonic aspects, applying/separating logic, aspect scoring | Phase 2+ |
| Public production API, authentication, rate limiting | Phase 2+ |
| Production database schema | Deferred — Phase 1 only defines serialization shape and schema versioning (see `DOMAIN_MODEL.md`) |
| Performance optimization | Deferred until benchmarks exist (see `PERFORMANCE_SPEC.md`) |
| Bát Trạch / Huyền Không / Tử Vi / Bát Tự (phong-thủy-specific schools) | Future phase, entirely separate school module — no dependency on Western astrology code |

## Non-negotiable architectural constraints carried over from the audit

These are binding for Phase 1 and must not be violated by any later phase without a documented, deliberate architecture change:

1. **No domain code may import Swiss Ephemeris (or any ephemeris library) directly.** All access goes through `AstronomicalProvider`. See `ASTRONOMICAL_PROVIDER.md`.
2. **Swiss Ephemeris licensing is not resolved.** No document, comment, or configuration in this codebase may assert that commercial closed-source use is cleared. See `LICENSE_DECISION_GATE.md`.
3. **Timezone/DST resolution is never delegated to the astronomical core.** It is a distinct, testable component. See `TIMEZONE_ENGINE.md`.
4. **Calculation, Factors, Rules, Interpretation, and AI narrative are five distinct layers.** Phase 1 builds only the first; the boundaries for the rest are typed and named, never implemented, never merged.
5. **Western, Vedic, and any future school's configuration/rules must never reference each other.** Phase 1 builds only Western, but the module boundary for future schools is established now, not retrofitted later.
6. **No repo audited in `ASTROLOGY_REPO_AUDIT/` may be vendored, forked, or copied from.** All of it is reference/oracle material only. See `GOLDEN_TEST_STRATEGY.md`.
