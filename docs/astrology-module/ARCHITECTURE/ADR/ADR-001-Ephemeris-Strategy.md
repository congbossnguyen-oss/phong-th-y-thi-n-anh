# ADR-001: Ephemeris Strategy

## Status
Proposed (interface decided; concrete adapter gated — see ADR-002)

## Context
Every accurate astrology calculation repo audited depends on Swiss Ephemeris, directly or via a wrapper (`pyswisseph`/`sweph`/Kerykeion) — `../../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md`. Swiss Ephemeris provides 25 house systems, 46 ayanamsas, and JPL DE441-grade precision, confirmed by direct source inspection and live execution in the audit. No alternative of matching precision/breadth was found. However: (1) its license is AGPL-or-paid-Professional (see ADR-002), and (2) `pyswisseph`, the most common Python binding, is de facto abandoned (last commit 2024) — its actively-maintained fork is `pysweph`.

## Decision
1. Domain code depends only on the `AstronomicalProvider` interface (`../DOMAIN_MODEL.md` §3) — never on Swiss Ephemeris, `pysweph`, or any ephemeris library's types directly.
2. If/when a concrete Swiss-Ephemeris-backed provider is implemented, it uses **`pysweph`, not `pyswisseph`**, per the audit's explicit recommendation.
3. `AstronomicalProvider.getProviderMetadata()` must surface `precision_class` (`file_based` | `analytic_fallback` | `unknown`) because Swiss Ephemeris silently falls back to lower-precision Moshier computation when data files are missing — a confirmed, non-obvious risk (`SWISS_EPHEMERIS_AUDIT.md` "Critical finding: silent Moshier fallback").

## Consequences
- Positive: the ephemeris backend is swappable without touching chart-calculation, rule, or interpretation code.
- Positive: the abandoned-dependency risk (`pyswisseph`) is avoided by design, not by discipline.
- Negative: an abstraction layer adds indirection and a small performance cost (to be measured, `../PERFORMANCE_MODEL.md`), not optimized preemptively.
- Open: no alternative ephemeris backend has been evaluated in depth — if `SwissEphemerisProvider` is blocked indefinitely by ADR-002's gate, evaluating an alternative is a `VALIDATION GAP` requiring its own audit pass.
