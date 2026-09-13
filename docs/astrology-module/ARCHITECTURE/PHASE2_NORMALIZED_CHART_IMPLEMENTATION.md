# PHASE 2 — Normalized Chart: Implementation Notes

**This document does not modify the frozen `DOMAIN_MODEL.md` or `ADR-004-Canonical-Chart-Model.md`.** It records the concrete implementation decisions made while translating that frozen specification into TypeScript inside `packages/astrology-core/src/chart/`. Where this document adds something the frozen spec left open, it says so explicitly.

## Purpose

`NormalizedChart` is the stable internal contract at the pipeline boundary `Chart Calculation → NORMALIZED CHART → Factors` (`ARCHITECTURE_FREEZE.md` §2). It is the vendor-independent, school-independent snapshot of a calculated chart — the shape every future Western (Phase 3) and Vedic (Phase 4) calculation engine must produce, and the shape every future Factor Engine (Phase 5) consumes. It corresponds 1:1 to `DOMAIN_MODEL.md` §4's `Chart` type, renamed to match the pipeline diagram's stage name.

## What explicitly does NOT belong here (enforced, not just documented)

No field in `NormalizedChart` may hold: personality descriptions, meanings, yogas, aspects interpreted as text, house meanings, sign meanings, predictions, rules, scores, AI prompts, or LLM output. This is verified by a runtime test (`chart/__tests__/schoolCompatibility.test.ts`) that a fully-populated fixture contains no interpretive prose (heuristic pattern match) and that a chart with every optional array empty still validates — proving no field forces interpretive content to exist.

## Field semantics and invariants

All types live in `chart/types.ts`. Semantics match `DOMAIN_MODEL.md` §4 exactly; invariants enforced by `chart/validation.ts::validateNormalizedChart()`:

| Field | Invariant enforced |
|---|---|
| `planets[].longitude`, `points[].longitude`, `nodes[].longitude`, `angles[].longitude`, `houseCusps[].longitude` | `[0, 360)` |
| `planets[].latitude` | `[-90, 90]` |
| `planets[].signDegree` | `[0, 30)` |
| `planets[].sign`, `houses[].sign`, `dignities[].sign` | one of the 12 `ZodiacSign` values |
| `planets[].isRetrograde` | must exactly equal `speedDegreesPerDay < 0` — never independently settable |
| `planets[]`, `houses[]`, `houseCusps[]`, `angles[]` | no duplicate identifiers (body / house number / angle type) |
| `houseCusps[]` | either exactly 12 entries or exactly 0 (unknown-time chart) — partial cusps are rejected |
| `aspects[].orb` | `>= 0` |
| `aspects[].planetA !== planetB` | self-referential aspects rejected |
| `zodiacType === "sidereal"` | `ayanamsa` must be non-null |
| `zodiacType === "tropical"` | `ayanamsa` must be null |
| `birthDataRef`, `school` | non-empty strings |

Validation checks **structural integrity only** — it never recomputes an astrological value to check it (e.g., it does not re-derive `withinOrb` from `orb`). Recomputation-as-validation would make `NormalizedChart` a calculator, which it explicitly must not be.

## Two points where the frozen spec was extended (not contradicted)

1. **Naming collision, resolved by renaming, not by changing Phase 1.** `DOMAIN_MODEL.md` §3 (`AstronomicalProvider`) and §4 (`Chart`) both use the name `PlanetPosition` for two different shapes (raw provider output vs. chart-level output with `sign`/`house` attached) — harmless in prose, but Phase 1 already exports a `PlanetPosition` type from `astronomical/AstronomicalProvider.ts`. Phase 2's chart-level type is named `NormalizedPlanetPosition` to avoid the collision. No Phase 1 export was renamed or changed.
2. **`birthDataRef` needs a value with no database in Phase 1/2.** `DOMAIN_MODEL.md` describes `birth_data_ref: BirthDataId` assuming some external system assigns IDs — no such system exists yet (Phase 10 only). `chart/birthDataFingerprint.ts::computeBirthDataFingerprint()` provides a deterministic SHA-256 content fingerprint (over `date`, `localTime`, `timezoneId`, `latitude`, `longitude`, `altitudeMeters` — explicitly excluding the display-only `locationLabel` and the currently-unused `timeUncertaintyMinutes`) that callers may use as `birthDataRef` until a real database assigns opaque IDs in a later phase. `birthDataRef`'s type remains a plain `string` — this is an additive utility, not a schema change, and a future database ID can be substituted with zero changes to `NormalizedChart` itself.

Both are recorded as **architecture decisions made** in the Phase 2 final report, not silent guesses — see that report for the full reasoning.

## Versioning strategy

`NORMALIZED_CHART_SCHEMA_VERSION` (currently `"1.0.0"`) is embedded in every serialized payload's envelope. Per `ADR-008-Versioning-Strategy.md`:
- **Major** version bump: any breaking change (field removed, field type changed, a previously-optional invariant becomes mandatory in an incompatible way).
- **Minor** version bump: additive, non-breaking (new optional field).
- `deserializeNormalizedChart()` throws `NormalizedChartVersionMismatchError` on a major-version mismatch, and silently accepts a minor/patch difference — this is enforced by test, not just documented.

## Serialization strategy

`chart/stableStringify.ts` recursively sorts every object's keys alphabetically and converts `Date` to ISO 8601 explicitly before calling `JSON.stringify` — never relying on `Date.prototype.toJSON`'s implicit behavior or on object insertion order. This one function backs both `serializeNormalizedChart()` (chart snapshots/golden fixtures) and `computeBirthDataFingerprint()` (content hashing) so there is exactly one definition of "stable" in the package. `deserializeNormalizedChart()` restores `metadata.calculatedAt` to a real `Date` instance (not a string) so round-tripping preserves the original runtime type, not just the displayed value — verified by round-trip tests.

## Extension strategy (how Phase 3+ adds content without breaking Phase 2)

- **New school**: add a new `SchoolId` string value and populate the exact same `NormalizedChart` shape — no schema change needed, since `SchoolId`, `HouseSystemId`, `AyanamsaId`, and `AspectType` are all intentionally open `string` types, never closed unions, per `ADR-003-Astrology-School-Isolation.md`.
- **New aspect type / house system / ayanamsa**: same reason — these are configuration values owned by each school's `AstrologySchool` object (Phase 3+), not enumerated in the generic contract.
- **Dignity content (Phase 3+ Western), Dasha/Varga content (Phase 4+ Vedic)**: `dignities[]` already exists in the contract (populated starting Phase 3); **Dasha/Varga are deliberately NOT added to `NormalizedChart`** — they are Vedic-specific *timing* overlays, not part of a natal chart snapshot, and the frozen `DOMAIN_MODEL.md` does not include them. They will need their own data structure in Phase 4, referencing `NormalizedChart` by `birthDataRef`/a future chart ID, not embedded inside it. Recorded in `packages/astrology-core/FUTURE_WORK.md`.

## Western/Vedic compatibility (verified by test, not just asserted)

`chart/__tests__/schoolCompatibility.test.ts` constructs one full Western fixture (tropical, Placidus, `school: "western"`) and one full Vedic fixture (sidereal, Lahiri ayanamsa, whole-sign houses, `school: "vedic"`) and proves:
1. Both validate successfully through the **exact same** `validateNormalizedChart()` function — no school-specific branch exists or is needed.
2. Both fixtures have **exactly the same set of object keys** — neither school's fixture carries an extra, school-specific field the other lacks (e.g., no `dasha` field sneaks into the Vedic fixture, no `firdaria` field sneaks into the Western one).
3. `MISSING_AYANAMSA_FOR_SIDEREAL`/`UNEXPECTED_AYANAMSA_FOR_TROPICAL` checks correctly allow the Vedic fixture's `sidereal` + `ayanamsa: "lahiri"` combination without being flagged as inconsistent with a Western-shaped default.

## Open item carried forward (not blocking Phase 2, flagged for Phase 4)

`CalculationMetadata.ayanamsa` stores only the ayanamsa **identifier** (e.g., `"lahiri"`), not the resolved numeric **value** in degrees at the calculation instant. The audit found this matters in practice — PyJHora's default ayanamsa differs from an explicitly-set Lahiri by ~1.1° (`docs/astrology-module/AUDIT/VEDIC_AUDIT.md`). This was deliberately **not** added as a new field in Phase 2 (it would be inventing a field the frozen spec doesn't mention), but is flagged here for a real decision before Phase 4 Vedic calculation work begins, so two charts both labeled `ayanamsa: "lahiri"` can be confirmed to have used the identical numeric offset.
