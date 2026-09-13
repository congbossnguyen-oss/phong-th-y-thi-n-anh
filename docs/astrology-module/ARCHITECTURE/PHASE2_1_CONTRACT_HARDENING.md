# PHASE 2.1 — Contract Hardening

Resolves the two `ARCHITECTURE DECISION REQUIRED` findings from `PHASE3_GATE_AUDIT.md` §13. Both decisions below were approved before implementation; this document records what was actually built and why, per that approval. This document does not rewrite `DOMAIN_MODEL.md`, `ADR-001`, or `ADR-004` — it is an implementation-level hardening pass, same convention as `PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md`.

## Approved Decision 1 — `CelestialBody`

**Before**: closed 10-value union (`"sun" | "moon" | ... | "pluto"`), defined in `astronomical/AstronomicalProvider.ts`. Missing Chiron despite the frozen `DOMAIN_MODEL.md` §3 explicitly listing it, and provided no extension mechanism at all — contradicting that same spec's own "extensible, not exhaustive" framing.

**After**:
```ts
export type KnownCelestialBody =
  | "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"
  | "chiron" | "mean_lilith" | "true_lilith";

export type CelestialBody = KnownCelestialBody | (string & {});
```
The `(string & {})` idiom keeps IDE autocomplete/documentation for the 13 known identifiers while making the type accept **any** string — required because bodies like asteroids (800,000+ named) and fixed stars cannot be enumerated in a closed union at all, and because school-specific points must not require a change to this shared type every time a new one is needed.

**Why this is not a breaking change**: this is a pure *widening* of an accepted-value set. Every value that was valid before (`"sun"`…`"pluto"`) remains exactly as valid; no existing code path, fixture, or test that ever constructed a `CelestialBody` literal needs to change. `UnimplementedAstronomicalProvider`'s method signatures needed no edits — they already only reference the type name, not its literal members.

**Scope discipline**: no calculation logic was added for Chiron, Lilith, or any other body — `MockAstronomicalProvider` (test-only) simply echoes back whatever body identifier it's given, proving the *type* accepts it, nothing more.

## Approved Decision 2 — `NormalizedDignityResult`

**Before**:
```ts
export type DignityType = "domicile" | "exaltation" | "detriment" | "fall" | "triplicity" | "term" | "decan";

export interface NormalizedDignityResult {
  planet: string;
  sign: ZodiacSign;
  type: DignityType;
  score: number;
}
```
`DignityType` was exclusively Hellenistic/Western traditional-astrology vocabulary. There was no way to populate `dignities[]` with a Vedic result (own-sign/moolatrikona/exalted/debilitated/friend-enemy tiers, or any of Shadbala's six components) without either abusing a Western label to mean something else, or leaving the array permanently empty for non-Western charts.

**After**:
```ts
export type DignitySchemeId = string; // e.g. "western_traditional", "vedic_shadbala"
export type DignityTypeId = string;   // meaning defined by scheme

export interface NormalizedDignityResult {
  scheme: DignitySchemeId;
  type: DignityTypeId;
  body: string;         // renamed from `planet` — Vedic strength can apply to non-planet points (e.g. Lagna)
  sign?: ZodiacSign;     // NOW OPTIONAL — see rationale below
  score: number;
}
```

**Why `sign` became optional, not just retyped**: Western essential dignity (domicile/exaltation/etc.) is inherently sign-based, so Western results will always populate it. But three of Vedic Shadbala's six components — Dig Bala (directional strength, based on **house**), Kaala Bala (time-based strength), and Cheshta Bala (motion-based strength) — are not tied to a zodiac sign at all. Making `sign` mandatory would have re-introduced a Western assumption through the back door even after fixing `type`. This was confirmed as the correct read by writing an actual (structural-only, no real calculation) Vedic-shaped fixture in the new test suite and observing it needed `sign: undefined`.

**Why `planet` → `body`**: consistent with `CelestialBody`/`NormalizedPlanetPosition.body` naming elsewhere in this same package, and because Vedic dignity/strength can target non-classical-planet points.

**Scope discipline**: no Western or Vedic dignity *calculation* was implemented. `chart/validation.ts::validateDignity` was updated to check only structural integrity (non-empty `scheme`/`type`/`body`, finite `score`, valid `sign` **when present**) — it does not know or care what any particular scheme's `type` values mean.

## Versioning Decision

**`NORMALIZED_CHART_SCHEMA_VERSION`: `1.0.0` → `2.0.0`.**

Per the versioning policy already established in `PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md` (major = breaking change to a field's shape, minor = additive/optional-only): `NormalizedDignityResult` — a field nested inside `NormalizedChart.dignities[]` — had a field renamed (`planet`→`body`), a field's optionality changed (`sign` mandatory→optional), and a field's underlying type changed (`DignityType` closed union → open `DignityTypeId`, plus the new mandatory `scheme` field). This is unambiguously a breaking shape change per the already-established policy, so **major** was incremented. This was determined by applying the existing policy literally, not by judgment call — the instruction to "not guess" was followed by re-reading `PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md`'s own versioning section before deciding.

**Decision 1 (`CelestialBody`) required no version change at all** — it is not a field of `NormalizedChart`'s own schema; it belongs to `astronomical/AstronomicalProvider.ts` (Phase 1), which has no version constant of its own. Even if it did, the change is additive/widening, not breaking.

**Practical impact of the major bump**: verified to be zero for any *existing* data, because `dignities[]` has never shipped with non-empty content in any fixture or test prior to this change (dignity content was always documented as "Phase 3+"). The version bump exists to correctly protect against a *hypothetical* future scenario — a chart serialized under the old `1.0.0` shape being deserialized by `2.0.0`-runtime code and silently misinterpreted. This is directly tested: `chart/__tests__/serialization.test.ts` now includes a regression test that constructs an explicit `schemaVersion: "1.0.0"` envelope with the *old* `NormalizedDignityResult` shape (`planet`/closed `type`) and confirms `deserializeNormalizedChart` correctly throws `NormalizedChartVersionMismatchError` rather than silently accepting it.

## Backward Compatibility Assessment

| Change | Backward compatible? | Evidence |
|---|---|---|
| `CelestialBody` widened | Yes, fully | Existing 10-value fixtures/tests unchanged, all still pass |
| `NormalizedDignityResult` reshaped | No (by design, hence major bump) | No existing non-test data ever populated this field; one existing test using the old shape was updated, not preserved-as-is (the old shape is structurally impossible to satisfy the new required `scheme` field) |
| `NormalizedChart` top-level shape | Unchanged | Only the nested `dignities[]` element type changed |
| All other Phase 1/2 fields | Unchanged | 108 pre-existing tests (Phase 1 + Phase 2, plus the Phase 3-gate DST fix) still pass unmodified |

## What Was Deliberately Not Touched

Per explicit scope guard: no Swiss Ephemeris/pysweph/pyswisseph/`SwissEphemerisProvider`, no Western or Vedic *calculation* of any kind (dignity, chart, rules, factors, evidence, scoring, interpretation, AI), no web/API/database work, no other unresolved architecture question (`MIN_YEAR`/`MAX_YEAR` false-justification, fractional-second truncation) was touched — both remain documented in `packages/astrology-core/FUTURE_WORK.md` exactly as the audit left them, not modified during this pass.
