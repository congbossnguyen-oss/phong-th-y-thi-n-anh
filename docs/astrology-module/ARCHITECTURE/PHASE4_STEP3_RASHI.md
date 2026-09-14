# PHASE 4 — STEP 3: Vedic Rashi (D1) Calculation

Implements the smallest correct Vedic Rashi/D1 layer: sidereal longitude, Rashi (12-sign
mapping), sign degree. No Nakshatra/Pada (Step 4), no Dasha (Steps 5-6), no divisional charts, no
KP/Shadbala/Ashtakavarga/Yoga/Dosha/Jaimini, no interpretation/scoring, no UI.

## Architecture inspection (Section 3)

Read before writing any code: `western/zodiac.ts`, `western/planets.ts`, `western/houses.ts`,
`chart/types.ts` (`NormalizedPlanetPosition`, `AyanamsaId`, `HouseSystemId`), `precision.ts`,
`AstronomicalProvider.ts`, `chart/__tests__/fixtures.ts` (`fullVedicChart()`/`fullWesternChart()`).

**Finding 1 — house assignment is not required at this layer.** `NormalizedPlanetPosition.house`
is populated at chart-integration time (`western/planets.ts::mapWesternPlanetPositions`, calling
`assignHouseNumber` against already-computed house cusps) — a layer above `western/zodiac.ts`,
which needs no house cusps/Ascendant to determine a planet's sign. The Vedic Rashi layer is the
same kind of layer as `zodiac.ts`, not `planets.ts`/`houses.ts` — the Vedic equivalent of
`mapWesternPlanetPositions` (which will fill `NormalizedPlanetPosition.house` using Whole Sign,
D2) is `vedic/chart.ts`, Step 7, not this step. No house field was invented here.

**Finding 2 — sign-mapping math must move to a neutral layer before Vedic can use it.**
`western/zodiac.ts`'s own doc comment already anticipated Vedic reuse of
`signOfLongitude`/`signDegreeOfLongitude` after subtracting ayanamsa (identical 30°-per-sign
convention for tropical and sidereal — `ZodiacSign`'s own doc comment in `chart/types.ts` already
called this "giống nhau ở cả tropical lẫn sidereal"). But `vedic/` importing `western/` directly
violates the non-negotiable school-isolation rule, and duplicating the function violates ADR-003
(the same principle Phase 4 Step 2 already fixed for `normalizeDegrees`). **Presented to the user
as a blocker; approved resolution: extract `signOfLongitude`/`signDegreeOfLongitude` into
`precision.ts`** (same neutral layer as `normalizeDegrees`), with `western/zodiac.ts` reduced to a
compatibility re-export (zero logic of its own) so existing imports/tests are unaffected. See
`precision.ts`'s doc comments on both functions for the extraction rationale.

## Sidereal formula (Section 4)

```
sidereal_longitude = normalizeDegrees(tropical_longitude - ayanamsa)
```

Implemented as the pure function `vedic/rashi.ts::getSiderealLongitude(tropicalLongitude,
ayanamsa)`. `ayanamsa` comes from `AstronomicalProvider.getAyanamsa()` (Step 1) — `vedic/` never
imports `sweph` directly. Default ayanamsa is `"lahiri"` (`VEDIC_DEFAULT_AYANAMSA`, D1), but any
provider-supported `AyanamsaId` can be passed explicitly (`calculateRashi`'s `ayanamsaId` param) —
not hardcoded internally, confirmed via a dedicated Lahiri-vs-Raman test with the real provider
(difference ≈ 1.45° at the benchmark instant, far larger than any rounding/tolerance noise).

## Rashi mapping (Section 5)

`calculateRashi()` reuses the shared `signOfLongitude`/`signDegreeOfLongitude` (now in
`precision.ts`) against the computed sidereal longitude — no separate Vedic sign-mapping
implementation. All 12 sign boundaries (0°, 30°, ..., 330°, plus the 360° wrap and floating-point
neighbors just below/above each) are covered by `precision.test.ts`'s existing
`signOfLongitude`/`signDegreeOfLongitude` characterization tests (unaffected by the move — same
implementation, same behavior) plus new `vedic/__tests__/rashi.test.ts` boundary tests that go
through `calculateRashi()` itself with a fixed ayanamsa.

## Oracle validation (Section 6 — mandatory, both oracles, Lahiri explicit)

**Setup.** Both oracles run out-of-process (ADR-009) in an isolated Python 3.14 venv
(`$TEMP/vedic_oracle_venv`), never added as a project/runtime dependency:

- **PyJHora** 4.8.7 (PyPI), with `pyswisseph` 2.10.3.2 as its actual Swiss Ephemeris binding.
- **vedic-calc**, cloned from `https://github.com/atolat/vedic-calc` at the exact audited commit
  `620d5456` (same commit the Phase 4 preflight audited), same venv's `pyswisseph`.

Lahiri was configured **explicitly** on both — the preflight had already established PyJHora
defaults to `TRUE_PUSHYA`, not Lahiri, so an unconfigured comparison would have been meaningless.

**Benchmark.** Hanoi, 1985-03-12 08:30 local (Asia/Ho_Chi_Minh, UTC+7) =
`1985-03-12T01:30:00.000Z` UTC — the same benchmark used throughout every prior phase. Sun/Moon
tropical longitudes (351.4222°/240.0111°) and their expected sidereal values (327.7755°/216.3645°)
were **already present** in the Phase 2 `chart/__tests__/fixtures.ts::fullVedicChart()` fixture,
reused rather than inventing new numbers — the project's real Step 1/Step 3 implementation now
independently reproduces both to 4 decimal places, which is itself a strong internal check.

**Two discrepancies found, isolated, and explained — not bugs:**

| | vs. vedic-calc | vs. PyJHora (native) |
|---|---|---|
| Observed gap (Sun/Moon/Saturn) | ≈0.0036° (~13″) | ≈0.0093° (~33″) |
| Root cause | ayanamsa **value** itself differs | sidereal **method** differs |
| Mechanism | vedic-calc calls `swe.get_ayanamsa_ut()` (legacy, **no nutation**); the project's `getAyanamsa()` (Step 1) calls `swe.get_ayanamsa_ex_ut()` (extended, **nutation included** by default) | PyJHora's `sidereal_longitude()` uses Swiss Ephemeris's native `SEFLG_SIDEREAL` calc flag internally; the project (and vedic-calc) do manual subtraction per Section 4 |

Both mechanisms were isolated with controlled same-JD, same-`sid_mode` tests directly in
`pyswisseph` (bypassing all language/version differences — see conversation history for the raw
isolation runs) and then confirmed against the **official Swiss Ephemeris programmer's
documentation** (`swephprg.htm` §12.2, "swe_get_ayanamsa_ex_ut(), swe_get_ayanamsa_ex(),
swe_get_ayanamsa() and swe_get_ayanamsa_ut()"):

- The legacy functions "provide the ayanamsha without nutation"; the extended functions provide it
  "with or without nutation depending on the parameter iflag" (with, by default, absent
  `SEFLG_NONUT`) — this exactly explains the ~13″ gap (nutation's typical amplitude).
- The same section calls the extended functions "better" than the legacy ones, and separately
  states manual subtraction for sidereal *planetary positions* is discouraged in favor of
  `SEFLG_SIDEREAL` — meaning PyJHora's method is the one the ephemeris library's own author
  recommends, while Section 4's mandated formula (matching vedic-calc) is the one it discourages.

**Resolution (asked, approved, not silently decided):** keep Section 4's manual-subtraction
formula and Step 1's `getAyanamsa()` (extended, nutation-included) exactly as already implemented.
Both discrepancies are documented, upstream-explained deltas, not implementation defects — oracle
comparison tolerances are widened accordingly (see below) rather than changing the architecture.

## Golden fixtures (Section 7)

Reused: `fullVedicChart()`/`fullWesternChart()` (Sun, Moon — Hanoi benchmark). Added: Saturn at
the same instant (retrograde in tropical, new sidereal value cross-checked against both oracles).
Sign-boundary/wraparound/floating-point cases use synthetic crafted longitudes with a fixed
`ayanamsa=24` via a fake provider (`vedic/__tests__/rashi.test.ts`), mirroring
`western/__tests__/zodiac.test.ts`'s existing style — no ephemeris call needed for pure boundary
math. Lahiri-vs-Raman (real provider) demonstrates configuration is honored with a clearly
material difference (~1.45°).

## Tolerance policy

- **vs. vedic-calc: 0.01°.** Covers the ~0.0036° nutation-inclusion gap with comfortable margin
  (nutation's amplitude varies with date, up to ~17″/0.0047° peak-to-peak).
- **vs. PyJHora (native `SEFLG_SIDEREAL`): 0.02°.** Covers the ~0.0093° method gap with margin.

Both are test-local constants in `vedic/__tests__/rashi.test.ts`, not public exports — they apply
only to oracle-comparison tests, not runtime tolerance/precision policy.

## What this step deliberately does NOT do

- No Nakshatra/Pada, no Dasha, no divisional charts, no Ascendant/house cusps, no chart
  integration (`vedic/chart.ts`, Step 7) — `calculateRashi()` takes an already-known tropical
  longitude, it does not call `provider.getPlanetPosition()` itself.
- No vendoring of PyJHora or vedic-calc source, no runtime dependency on either (`package.json`
  unchanged) — both live only in an out-of-process, non-project venv used for this validation.

## Tests

`vedic/__tests__/rashi.test.ts` (19 tests): pure `getSiderealLongitude` math (simple subtraction,
wraparound, sign-boundary values, floating-point precision, determinism); `calculateRashi` sign
boundaries via a fake provider (all 12 starts, open-upper-boundary, wraparound); default-ayanamsa
behavior; provider-error mapping (`UNSUPPORTED_FEATURE`, `CALCULATION_ERROR`, unrecognized errors
rethrown, matching `western/houses.ts`'s established convention); real-provider tests against the
Hanoi benchmark (Sun/Moon matching the pre-existing `fullVedicChart()` fixture, Saturn newly
added); ayanamsa-configurability (Lahiri vs. Raman); and the oracle-comparison suite described
above (vs. vedic-calc and vs. PyJHora, both with Lahiri explicit).
