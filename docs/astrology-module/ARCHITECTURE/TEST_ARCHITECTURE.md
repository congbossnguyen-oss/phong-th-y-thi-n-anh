# TEST ARCHITECTURE — Specification (not implemented)

## Test layers (one per architecture layer)

```
Astronomical Tests      — AstronomicalProvider output vs. oracle, no school logic involved
Calculation Tests        — Chart Calculation layer (sign/house/angle/aspect derivation from astronomical facts)
Normalization Tests      — Chart model invariants (e.g. houses sum to 360°, cusps monotonic per house system's own geometry)
Rule Tests                — RuleEngine evaluator correctness against hand-authored condition/factor fixtures (no astronomy involved)
Factor Tests              — FactorEngine extraction correctness against hand-built Charts
Interpretation Tests      — InterpretationEngine composition correctness against hand-built Rule/Factor/Evidence fixtures
AI Grounding Tests        — verifies AI_GROUNDING_CONTRACT.md's post-generation validation catches ungrounded content (adversarial fixtures: force the LLM stage — or a stub — to hallucinate and confirm the check fires)
End-to-End Tests          — full BirthData → Report pipeline, golden-value asserted only at the Astronomical/Calculation layers (interpretation/narrative content is not golden-testable — it is deterministic-but-content-dependent at best, probabilistic at the AI layer)
```

Each layer's tests are independently runnable without the layers above or below it — e.g. Rule Tests never need a real ephemeris call, matching the audit's own finding that the best-tested repos (mayaastrolib, vedic-calc) keep ephemeris-dependent and ephemeris-independent tests in clearly separate files (`../ASTROLOGY_REPO_AUDIT/TEST_AUDIT.md`).

## Precision policy (binding for all layers)

| Concept | Definition |
|---|---|
| **Internal precision** | IEEE-754 double, degrees, no rounding anywhere inside `Chart`/`PlanetPosition`/`Factor`/etc. Confirmed necessary because several audited repos blur calculation and display precision (`../ASTROLOGY_REPO_AUDIT/WESTERN_AUDIT.md` notes on astro-natal-chart's coupled renderer). |
| **Display precision** | Applied only at the API/presentation boundary (e.g. DMS format, 2-decimal degrees) — never stored back into the domain model. |
| **Comparison tolerance (golden tests)** | Angular values: **≤ 0.0001°** agreement required against a `file_based`-precision oracle (matches the tightest cross-engine agreement actually observed in the audit's own benchmark — `../ASTROLOGY_REPO_AUDIT/BENCHMARK.md` found ≤0.0002° max disagreement among Swiss-Ephemeris-backed engines). A wider tolerance (**≤ 0.01°**) is used only when comparing against an `analytic_fallback` (Moshier)-precision oracle, since the audit confirmed Moshier-vs-file-based drift up to ~0.36° can occur in propagated divisional-chart calculations (`BENCHMARK.md` §Discrepancies, item 1) — the engine's `precision_class` metadata (see `DOMAIN_MODEL.md`) determines which tolerance applies, never a single blanket number. |
| **House cusp tolerance** | Same as angular tolerance above; additionally, near the polar circle, Placidus-family systems are mathematically undefined — tests must assert `UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE` is raised, not a wrong number silently returned. |
| **Aspect tolerance** | Orb comparisons compare against the *configured* orb (school-specific, see `DOMAIN_MODEL.md` `AspectRuleSet`), not a hardcoded value — golden tests must assert the aspect-detection boundary condition (exactly at orb edge) explicitly. |

No layer may call `round()` (or equivalent) before this stage. This directly closes a gap found in the audit: no dedicated rounding/precision-boundary test category existed in any of the 10 audited repos (`../ASTROLOGY_REPO_AUDIT/TEST_AUDIT.md`).

## Golden test structure (every test must record all five fields)

```
GoldenTestResult {
  expected:    value
  actual:      value
  difference:  value
  tolerance:   value
  oracle:      OracleId    // which external reference produced `expected` — see VALIDATION_ORACLES.md
}
```
A golden test that only asserts pass/fail without recording all five fields is non-compliant with this architecture — the audit found that even the best-tested audited repos (mayaastrolib, stellium) log this level of detail specifically because it made real historical bugs diagnosable (e.g. stellium's own documented 7-month-undetected `% 180` opposition/conjunction bug, `../ASTROLOGY_REPO_AUDIT/TEST_AUDIT.md`).

## Phase placement

Test architecture applies starting Phase 1 (Astronomical Tests can run the moment `AstronomicalProvider` has any implementation — even a stub against a known oracle value). Golden tests specifically require at least one working provider implementation, which is gated on the license decision (`LICENSE_BOUNDARY.md`) — until then, Astronomical Tests exist as specified fixtures with no implementation to run them against.
