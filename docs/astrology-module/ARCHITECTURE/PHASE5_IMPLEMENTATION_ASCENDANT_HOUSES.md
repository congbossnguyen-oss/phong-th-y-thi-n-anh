# PHASE 5 — IMPLEMENTATION: Vedic Ascendant (Lagna) + Whole Sign Houses

Implements the V1 Vedic Ascendant/Lagna calculation and Whole Sign house assignment, per
`PHASE5_PREFLIGHT_ASCENDANT_HOUSES.md` (approved, not reopened) and the Phase 5 Final Decisions.
No Phase 4 contract touched. No `NormalizedChart` schema change — version stays `2.1.0`.

## Scope

Implemented: (A) Vedic Ascendant/Lagna calculation, (B) sidereal conversion via the frozen Phase 4
Lahiri contract, (C) Lagna Rashi identification, (D) Whole Sign house numbering, (E) planet → Whole
Sign house assignment. **Not implemented** (deferred per Final Decisions #8–#11): house rulers, MC/
IC/Descendant, Bhava/degree-based cusps, house-cusp calculation, and integration into
`vedic/chart.ts`'s orchestrator (`calculateVedicCore`) — this step is the calculation layer only,
mirroring exactly how Rashi (Step 3) was built and tested standalone before Integration wired it in.

## Files added

- `src/vedic/ascendant.ts` — `calculateVedicAscendant()`.
- `src/vedic/houses.ts` — `getWholeSignHouseNumber()`.
- `src/vedic/__tests__/ascendant.test.ts` (20 tests), `src/vedic/__tests__/houses.test.ts` (6 tests).

## Files modified

- `src/index.ts` — export wiring only (`calculateVedicAscendant`, `getWholeSignHouseNumber`, and
  their types). No other file touched.

## Ascendant contract / pipeline

```
provider.getPlanetPosition(...) — NOT called here (Ascendant is not a planet)
provider.getAscendant(utcInstant, latitude, longitude, "whole_sign") → tropical Ascendant
  ↓ (reuses Step 3's calculateRashi() verbatim — no new sidereal/ayanamsa/sign-mapping code)
provider.getAyanamsa(utcInstant, "lahiri") → ayanamsa value (extended API, frozen Step 1/3)
getSiderealLongitude(tropical, ayanamsa) = normalizeDegrees(tropical − ayanamsa) → sidereal Ascendant
signOfLongitude(sidereal) → Rashi (Lagna)
signDegreeOfLongitude(sidereal) → degree within Rashi
```

`houseSystem: "whole_sign"` is passed to `provider.getAscendant()` as a fixed internal constant
(not a public parameter — V1 has no other house system to choose from, per decision #10). This is
safe because the Ascendant's returned longitude was empirically confirmed (preflight §1/§4) to be
identical regardless of which `houseSystem` value is passed — it only affects house-cusp logic
internal to the provider, which this module never calls (see "Whole Sign contract" below).

**No second timezone conversion, no UTC/JD pipeline change.** `calculateVedicAscendant` consumes
whatever already-resolved `utcInstant: Date` it is given — exactly like every other Vedic
calculation function (`calculateRashi`, `calculateVimshottariDasha`) — and never touches timezone
resolution itself. The provider's existing `toJulianDayUt()` (leap-second-aware `utc_to_jd()`) is
unchanged and untouched, per decision #15/#16 — no switch to `swe_julday()` was made or considered.

## Lahiri contract

Reused verbatim via `calculateRashi()` (Step 3) — no competing ayanamsa implementation was written.
`VEDIC_DEFAULT_AYANAMSA` ("lahiri"), the extended-ayanamsa-API + manual-subtraction principle, and
the precision policy are all imported, not reimplemented. No conflict was found with Phase 4's
frozen contract, so no STOP was needed here.

## Whole Sign contract

**House derivation is pure Rashi-index arithmetic — no Swiss Ephemeris house-cusp call, no cusp
degrees anywhere in this module**, per decisions #11/#12:

```
house = ((bodyRashiIndex − lagnaRashiIndex + 12) % 12) + 1
```

Verified against both oracles in the preflight (vedic-calc's `build_houses()`, PyJHora's "Each Rasi
is the house" method) — not re-derived from scratch, the formula in `houses.ts` is the direct
algebraic inverse of vedic-calc's own `house_sign = (lagna_sign_value − 1 + house_index) % 12 + 1`.

`getWholeSignHouseNumber(bodyRashi: ZodiacSign, lagnaRashi: ZodiacSign): HouseNumber` takes
`ZodiacSign` values directly (not raw longitudes or indices) — callers already have a `ZodiacSign`
from `calculateRashi()`/`calculateVedicAscendant()`, so no redundant index-extraction step leaks
into the public API.

**Clear separation of concepts, per the task's explicit requirement:**
- *Ascendant degree* — `VedicAscendantResult.siderealLongitude` (a raw sidereal longitude, 0–360°).
- *Lagna sign* — `VedicAscendantResult.rashi` (Rashi containing the Ascendant degree).
- *House number* — the integer 1–12 returned by `getWholeSignHouseNumber()`.
- *House sign* — not materialized as its own value in V1 (no `houseCusps`/`houses[]` population,
  decision #11) — it is implicitly `ZODIAC_SIGNS[(lagnaIndex + houseNumber − 1) % 12]` if ever
  needed, but no function currently exposes this since nothing in V1 scope consumes it.
- *Planet house assignment* — `getWholeSignHouseNumber(planetRashi, lagnaRashi)`, always derived
  from two already-known Rashi values, never from cusp-degree comparison.

## Precision

No intermediate rounding anywhere in `ascendant.ts`/`houses.ts`. `tropicalLongitude` and
`siderealLongitude` are carried at full double precision through to the returned
`VedicAscendantResult` — rounding, if ever needed, belongs only at a future
presentation/serialization boundary, matching `precision.ts`'s established doctrine and every prior
Vedic module's convention.

## Timezone behavior

Unchanged — no new timezone code was written or needed. `calculateVedicAscendant` operates purely
on an already-resolved `utcInstant`, exactly like `calculateRashi`/`calculateVimshottariDasha`.
Timezone/DST resolution remains entirely Phase 1's `resolveLocalTimeToUtc`/`resolveBirthDataInstant`
responsibility, upstream of this module.

## Unknown birth-time behavior

`calculateVedicAscendant` **always** requires an exact `utcInstant`, `latitude`, and `longitude` —
there is no `null`-accepting overload, no fallback, no noon/midnight substitution, no guessed
coordinates. This is enforced at the TypeScript type level (all three fields are non-optional), not
just by convention. Because this step does not modify `vedic/chart.ts`, there is no orchestrator-
level "unknown time → Ascendant is `null`" branch yet — that decision belongs to whichever future
step integrates Ascendant/Houses into `calculateVedicCore` (exactly mirroring how `calculateRashi`
existed standalone for one full step before `calculateVedicCore` decided when to call it). No new
fallback representation was invented anywhere in this step.

## Boundary behavior — tested

Ascendant near 0°/30°/359°→0°/360°-wrap, all 12 Rashi transitions, sidereal wraparound (tropical <
ayanamsa), full double-precision preservation, provider-error mapping (unsupported ayanamsa
propagated from `calculateRashi`; unrecognized errors rethrown, never swallowed), all 144
`(bodyRashi, lagnaRashi)` house-number combinations (always in `[1,12]`), a planet exactly at vs.
just before a Rashi boundary (house number shifts by exactly 1), a full worked Hanoi chart
(Lagna=Aries; Sun/Aquarius=House 11; Moon,Saturn/Scorpio=House 8 — Sun/Moon/Saturn Rashi values
reused unchanged from Phase 4, not recomputed), Northern hemisphere (Hanoi, Mumbai), Southern
hemisphere (Sydney), equator, four high-latitude locations up to 89°N/−75°S (Whole Sign confirmed
to have **no polar-circle failure mode**, unlike Placidus — empirically re-verified in this step's
own tests, not just cited from the preflight), longitude extremes (±180°, 179.9999°), and a
UTC-date-boundary instant pair (23:59:59.9Z / 00:00:00.1Z) confirming no rollover discontinuity.

Both **categorical** (Rashi/house-number identity) and **numerical** (≤0.01° oracle tolerance)
assertions are present side by side wherever an oracle fixture is used — numerical tolerance never
substitutes for a categorical assertion, per decision #14.

## Oracle strategy and known discrepancies (unchanged from preflight, re-confirmed here)

No oracle output is hardcoded into production logic — `PyJHora`/`vedic-calc` values appear only as
literal expected numbers inside test files, exactly matching every prior Vedic step's convention.
Three known, already-documented discrepancy sources apply to Ascendant exactly as characterized in
the preflight, and were not altered or "fixed" by this implementation:

- **(A)** ayanamsa-API delta (extended vs. legacy) — same root cause as Step 3.
- **(B)** native `SEFLG_SIDEREAL` flag vs. manual subtraction — same root cause as Step 3.
- **(C)** `swe_julday()` (both oracles) vs. this project's leap-second-aware `utc_to_jd()` —
  negligible for planets, measurable (single-digit arcseconds) for the fast-moving Ascendant. The
  project's existing, more correct `utc_to_jd()` pipeline was **not** changed to chase oracle
  agreement, per decisions #15/#16.

All three fixtures (Hanoi, Mumbai, Sydney) landed within 0.01° of both oracles for every case
tested — the default tolerance from decision #13 was sufficient without needing to be loosened.

## Schema / API

No `NormalizedChart` field added, no version bump — `NORMALIZED_CHART_SCHEMA_VERSION` remains
`2.1.0`. The public API added is exactly:

```ts
export interface CalculateVedicAscendantInput { provider, utcInstant, latitude, longitude, ayanamsaId? }
export interface VedicAscendantResult { ayanamsaId, tropicalLongitude, siderealLongitude, rashi, rashiDegree }
export type CalculateVedicAscendantResult = { ok: true; result: VedicAscendantResult } | { ok: false; errors: AstrologyCoreError[] };
export function calculateVedicAscendant(input: CalculateVedicAscendantInput): CalculateVedicAscendantResult;

export function getWholeSignHouseNumber(bodyRashi: ZodiacSign, lagnaRashi: ZodiacSign): HouseNumber;
```

## Architecture

`SwissEphemerisProvider` remains the only file importing `sweph` (verified: exactly one match for
`from "sweph"` in `src/`). No Swiss-specific type leaked into the public Vedic contract — both new
functions expose only `AstronomicalProvider`-level and `chart/types.ts`-level types. School
isolation verified: zero real `western/`↔`vedic/` imports in either direction (grep matches, if
any, were not even doc-comment references this time — this module never needed to mention
`western/` at all). No unrelated Western file was touched.

## Deferred (explicitly, not silently)

- **House rulers** (`NormalizedHouse.ruler`) — matches Western's own current gap
  (`buildWesternChart` never populates `houses[]` either); a sign-rulership lookup table is content,
  not geometry, and remains a cross-school decision for a future phase.
- **MC / IC / Descendant** — `getMidheaven()` exists on the provider and would follow an analogous
  pattern, but was not implemented or investigated here; no scope expansion beyond the Ascendant.
- **Bhava / degree-based houses (Chalit, Sripati, KP-style)** — confirmed (preflight §3) to be a
  genuinely different mathematical object from Whole Sign in both oracles, correctly out of V1.
- **House-cusp population** (`NormalizedChart.houseCusps`) — decision #11 confirmed no cusp
  calculation is required for V1; this module never calls `provider.getHouseCusps()`.
- **Integration into `vedic/chart.ts`** — a future step's responsibility, matching the established
  one-step-at-a-time pattern from Phase 4.

## Vietnamese-first

Every doc comment and error message introduced in `ascendant.ts`/`houses.ts` is in Vietnamese,
matching the existing codebase convention exactly (e.g. `mapAscendantProviderError`'s messages:
`"Không xác định được Lagna..."`, `"Hệ nhà ... chưa được provider hỗ trợ."`, `"Tính Ascendant (Lagna)
thất bại."`). No English user-facing string and no Chinese character was introduced anywhere.
Internal TypeScript identifiers remain English, per repository convention.

## Validation results

- Full suite: 499/499 passing (473 → 499; +26 new tests, zero regressions).
- Typecheck: clean (`tsc -p tsconfig.json --noEmit` and the strict test-inclusive invocation).
- Build: clean.
- School isolation: zero real cross-school imports.
- `sweph` import: isolated to exactly `SwissEphemerisProvider.ts`.
- Dependencies: `packages/astrology-core/package.json` diff is empty — no new dependency.
- Phase 4 regression: confirmed zero diff on every Phase 4 file except `index.ts` (export wiring
  only) — `git diff --stat` on `chart/`, `vedic/rashi.ts`, `vedic/nakshatra.ts`, `vedic/dasha/`,
  `western/`, `precision.ts`, `astronomical/` all empty.
- Unrelated worktree changes: confirmed untouched (root `package.json`, `public/*`, `src/lib/*`,
  `packages/daliuren-engine/`, etc. all unchanged by this step).

No commit made.
