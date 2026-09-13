# ADR-004: Canonical Chart Model

## Status
Proposed

## Context
No audited repo defines a chart model fully independent of its own ephemeris library's types — even the best-architected repo (stellium) couples its `CelestialPosition` model reasonably cleanly to its own engine abstractions but was still audited as a single library, not as a vendor-neutral interchange format (`../../ASTROLOGY_REPO_AUDIT/WESTERN_AUDIT.md`). Phongthuy.vn's architecture explicitly requires the astronomical core to be replaceable (ADR-001) — this requires a chart model with zero fields typed against any specific ephemeris library.

## Decision
1. Define `Chart`, `PlanetPosition`, `House`, `HouseCusp`, `Angle`, `NodePosition`, `PointPosition`, `AspectInstance`, `DignityResult`, and `CalculationMetadata` as fully specified in `../DOMAIN_MODEL.md` §4, using only primitive types (numbers, strings, enums) — never a type imported from `AstronomicalProvider`'s underlying implementation.
2. Every numeric field carries an implicit unit (documented in the schema) and traces back to `CalculationMetadata` (engine, version, precision class) via its parent `Chart`.
3. Internal precision is always full double-precision float; rounding/display formatting happens only at the presentation boundary (`../TEST_ARCHITECTURE.md` §Precision).

## Consequences
- Positive: swapping `SwissEphemerisProvider` for an alternative provider (per ADR-001) requires zero changes to `Chart` or anything downstream of it.
- Positive: golden tests (`../VALIDATION_ORACLES.md`) compare against this canonical model, not against any vendor's own output shape, so cross-oracle comparison is straightforward.
- Negative: every provider implementation must do its own mapping work from the ephemeris library's native output into this canonical shape — this mapping code is exactly where a `precision_class` misreport or a units bug could hide, so it is a first-class target for Astronomical Tests (`../TEST_ARCHITECTURE.md`).
