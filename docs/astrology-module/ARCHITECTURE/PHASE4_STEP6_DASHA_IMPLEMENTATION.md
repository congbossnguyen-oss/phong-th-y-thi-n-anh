# PHASE 4 — STEP 6: Vimshottari Mahadasha — Implementation

Implements the V1 Vimshottari Mahadasha calculation, per the frozen D5 contract from
`PHASE4_STEP5_DASHA_PREFLIGHT.md` (accepted, not reopened). No Antardasha, no interpretation, no
`NormalizedChart` changes.

## Schema

`src/vedic/dasha/vimshottari.ts` — standalone, outside `NormalizedChart` (D4). Independent
`VIMSHOTTARI_DASHA_SCHEMA_VERSION = "1.0.0"`.

```ts
export type VimshottariLord = "ketu" | "venus" | "sun" | "moon" | "mars" | "rahu" | "jupiter" | "saturn" | "mercury"; // moved into vedic/nakshatra.ts, re-exported here (see below)

export interface VimshottariMahadashaPeriod {
  lord: VimshottariLord;
  startUtc: Date;
  endUtc: Date;
  durationYears: number; // always the FULL canonical years for `lord` — see "Balance representation" below
}

export interface VimshottariMahadashaSequence {
  schemaVersion: "1.0.0";
  yearConventionId: string;              // "mean_sidereal_year.365_256364"
  ayanamsaId: AyanamsaId;
  utcInstant: Date;                       // exact birth instant used
  startingNakshatra: NakshatraName;
  startingNakshatraLord: VimshottariLord;
  startingMahadashaLord: VimshottariLord; // == startingNakshatraLord, explicit per task's RESULT requirements
  startingNakshatraElapsedFraction: number; // 0..1, audit field for the balance calculation
  mahadashas: VimshottariMahadashaPeriod[]; // exactly 9
}
```

**Deviation from `NormalizedChart`'s versioning pattern, deliberate:** `NORMALIZED_CHART_SCHEMA_VERSION`
is kept *out* of `NormalizedChart` itself (only present in the serialize envelope). This task's
RESULT requirements explicitly ask the *returned structure* to make "schema version" explicit, so
`schemaVersion` is a real field on `VimshottariMahadashaSequence`, not only in the later
serialization envelope. Both the struct field and the envelope carry it (harmless duplication, and
`deserializeVimshottariMahadashaSequence` checks the envelope's copy, matching
`deserializeNormalizedChart`'s major-version-gate convention).

**Balance representation — matches both oracles' own data model, not an assumption:** reading
`vimsottari_mahadasa` (PyJHora) and `calculate_dasha` (vedic-calc) confirmed neither reduces
`duration_years` for the first (birth) Mahadasha — both always store the *full* canonical years for
every entry, and instead push the first period's `start` *before* the birth instant by the elapsed
amount, so its `end` still lands at the astronomically correct point. `durationYears` here follows
the identical convention. The "how much was elapsed / how much balance remains" question is
answered by the explicit `startingNakshatraElapsedFraction` field plus
`mahadashas[0].startUtc`/`endUtc` — not by a divergent, invented "reduced first period" convention.

## API

```ts
export interface CalculateVimshottariDashaInput {
  provider: AstronomicalProvider;
  utcInstant: Date;        // always required — no null/unavailable input mode, see below
  ayanamsaId?: AyanamsaId; // defaults to "lahiri"
}
export function calculateVimshottariDasha(input: CalculateVimshottariDashaInput): CalculateVimshottariDashaResult;
```

Orchestrates, reusing every existing piece rather than recomputing anything:
1. `provider.getPlanetPosition(utcInstant, "moon")` — the one new provider call this file makes
   (Moon's tropical longitude); errors mapped with the *same* error classes/codes
   `western/planets.ts::mapPlanetProviderError` uses (`UNSUPPORTED_FEATURE`, `CALCULATION_ERROR`) —
   not a new taxonomy, and not an import of `western/planets.ts` itself (would violate school
   isolation) — the mapping function is re-declared locally against the shared, neutral error
   classes in `astronomical/providers/errors.ts`.
2. `calculateRashi(...)` (Step 3, unmodified) — sidereal Moon longitude + ayanamsa.
3. `getNakshatraIndex`/`getNakshatraDegree`/`getNakshatraLord` (Step 4, see below for the one small
   change made there) — starting Nakshatra, elapsed degree, starting lord.
4. New Step 6 logic only: elapsed-fraction → back-calculated first-Mahadasha start → the 9-period
   sequence.

**No second ayanamsa implementation, no second `normalizeDegrees`/`signOfLongitude`/
`signDegreeOfLongitude`/Nakshatra-mapping/Nakshatra-lord-mapping was written** — confirmed by the
import list at the top of `vimshottari.ts`: everything astronomical comes from `vedic/rashi.ts` and
`vedic/nakshatra.ts`.

## Minimal change to `vedic/nakshatra.ts` (Step 4's file) — backward-compatible, not reopening D5/D3/D4

Two small, purely-additive refinements, made specifically to satisfy this task's "do not duplicate
Nakshatra lord mapping" / "do not introduce a separate modulo calculation" instructions:

1. **`getNakshatraDegree(siderealLongitude)` extracted** from what was previously inline logic
   inside `getNakshatraPada` — same computation, now a named, exported, reusable function.
   `getNakshatraPada`'s own behavior and tests are unchanged (it now calls the extracted function
   internally). `calculateVimshottariDasha` calls the *same* function for its elapsed-fraction
   calculation — literally impossible for the two to disagree at a boundary, since there is only
   one implementation.
2. **`getNakshatraLord`'s return type narrowed** from `string` to a new `VimshottariLord` closed
   union (9 values), and `NAKSHATRA_LORD_CYCLE` exported (was module-private) so
   `VIMSHOTTARI_LORD_SEQUENCE` in `vimshottari.ts` is a direct re-export, not a second array of the
   same 9 strings. **Zero breaking change**: `VimshottariLord` is a subtype of `string`, so
   `NormalizedNakshatraPosition.lord: string` (Step 4's frozen, unchanged public schema) still
   accepts it everywhere unmodified — confirmed by the full existing `nakshatra.test.ts` suite
   passing unchanged (51/51, same as before this step).

No other file from Steps 1-5 was touched.

## Formula (D5, frozen)

```
elapsedFraction  = getNakshatraDegree(siderealMoonLongitude) / NAKSHATRA_SPAN_DEGREES   // NAKSHATRA_SPAN_DEGREES = 360/27, from Step 4
elapsedYears     = VIMSHOTTARI_LORD_YEARS[startingLord] * elapsedFraction
elapsedDays      = elapsedYears * 365.256364
mahadashas[0].startUtc = utcInstant − elapsedDays
mahadashas[i].endUtc   = mahadashas[i].startUtc + VIMSHOTTARI_LORD_YEARS[mahadashas[i].lord] * 365.256364 days
mahadashas[i+1].startUtc = mahadashas[i].endUtc
```
9 periods total, lords cycling through `VIMSHOTTARI_LORD_SEQUENCE` starting at the Nakshatra's
lord. Pada plays no role (confirmed absent from both oracles' formula, Step 5 preflight §3.6).

## Year convention (D5, frozen)

`VIMSHOTTARI_DAYS_PER_YEAR = 365.256364` (mean sidereal year), identifier
`VIMSHOTTARI_YEAR_CONVENTION_ID = "mean_sidereal_year.365_256364"`. Not vedic-calc's 365.25, not
PyJHora's dynamic `TRUE_SIDEREAL_YEAR` — no extra ephemeris calls are made for this, confirmed by
`vimshottari.ts` importing nothing from `SwissEphemerisProvider.ts` beyond what `calculateRashi`
already needed.

## Oracle evidence and known date differences (quantified, not hidden behind tolerance)

Both benchmark fixtures from the Step 5 preflight were re-verified against this actual
implementation (real `SwissEphemerisProvider`, not a stub):

| Fixture | Structural (Nakshatra/lord/sequence/years) | vs. PyJHora (dynamic `TRUE_SIDEREAL_YEAR`) | vs. vedic-calc (365.25) |
|---|---|---|---|
| Hanoi 1985-03-12 08:30 (+7) | Anuradha / Saturn — exact match, both oracles | project 0.089 days *earlier* | project 2.090 days *earlier* |
| Mumbai 1990-06-15 12:00 (+5.5) | Shatabhisha / Rahu — exact match, both oracles | project 0.204 days *earlier* | project 1.394 days *later* |

**Attribution:** these date gaps are the composition of two already-understood, already-quantified
effects, neither of which is a Dasha-specific bug:
1. The residual sidereal-longitude delta between this project's ayanamsa convention (extended API,
   nutation-included) and each oracle's own (Step 3's finding — a few hundredths of a degree at
   most), amplified over a multi-year Mahadasha span.
2. The deliberate D5 year-length choice (365.256364) vs. vedic-calc's 365.25 and PyJHora's dynamic
   default (~365.2608–365.2611 for these dates) — a difference measured in minutes per year,
   compounding to the sub-day/low-single-day magnitudes observed here.

The much closer agreement with PyJHora's dynamic default (well under a quarter-day in both cases)
than with vedic-calc's fixed 365.25 (1.4–2.1 days) is itself informative: it confirms this
project's ayanamsa/longitude convention is closer to PyJHora's than to vedic-calc's (consistent
with Step 3's own finding), and that the *year-length* choice, not the longitude, is the dominant
remaining source of the vedic-calc gap specifically. **No disagreement was found that isn't
attributable to these two already-documented, already-accepted conventions** — nothing here
triggered a STOP condition.

## Unknown birth time (D6, unchanged)

`calculateVimshottariDasha` always requires an exact `utcInstant` — there is no `Date | null` input
and the function never fabricates an "unavailable" result object. This mirrors
`calculateWesternHousesAndAngles`/`mapWesternPlanetPositions` exactly: the decision of whether to
call this function at all when `BirthData.localTime === null` belongs to a future chart-integration
layer, not to this calculation. No code in this step branches on "unknown time" — there was nothing
to implement here beyond calling the function or not.

## Precision policy

No intermediate rounding. `startingNakshatraElapsedFraction` and every internal year/day value stay
full double precision. Period boundaries are computed from cumulative fractional-day offsets
against a *single* origin (`utcInstant`), each materialized into a `Date` (millisecond resolution,
the platform's native instant type, same as `CalculationMetadata.calculatedAt` elsewhere in this
package) only once per boundary — not by chaining 9 successive `Date`-rounded additions, which would
let sub-millisecond rounding compound across the cycle. This guarantees adjacent periods are
bit-identical at their shared boundary (`mahadashas[i].endUtc.getTime() === mahadashas[i+1].startUtc.getTime()`
always, tested explicitly).

## Boundary policy

Nakshatra boundaries are closed-lower/open-upper, exactly as Step 4 established
(`getNakshatraIndex`) — reused unchanged. A longitude exactly at a Nakshatra's upper edge belongs to
the *next* Nakshatra with `elapsedFraction = 0`, not to the previous one at 100%.

## Validation & serialization

`validateVimshottariMahadashaSequence` (new, mirrors `chart/validation.ts`'s style): exactly 9
periods, lords follow the fixed cyclic order from `startingMahadashaLord`, each `durationYears`
matches the fixed table exactly, periods perfectly contiguous, `startingNakshatraElapsedFraction`
in `[0, 1)`. `serializeVimshottariMahadashaSequence`/`deserializeVimshottariMahadashaSequence`
reuse the *existing* `chart/stableStringify.ts` (a genuinely neutral utility already shared between
`NormalizedChart` serialization and `BirthData` fingerprinting — no new stringification logic
written), with the same envelope-plus-major-version-gate pattern as
`serializeNormalizedChart`/`deserializeNormalizedChart`.

## V1 exclusions (unchanged from the preflight, restated for this document's own completeness)

No Antardasha (and no dormant Antardasha field was added — `VimshottariMahadashaPeriod` has exactly
the four fields listed above, nothing held in reserve). No D2-D60, no KP, no Shadbala, no
Ashtakavarga, no Yoga/Dosha, no interpretation, no scoring, no favorable/unfavorable judgment, no
UI, no chart integration (a future step would decide how/whether a `NormalizedChart` and a
`VimshottariMahadashaSequence` get associated by an application — out of this package's scope by
D4).

## Tests

`vedic/dasha/__tests__/vimshottari.test.ts` (53 tests): constants sanity (lord-years table, sum
120, sequence order, year constant/identifier); Nakshatra-boundary tests via a fake provider (start,
just-below, upper-boundary exact/just-above, near-0%/near-100% balance); all 27 Nakshatra starting
points and all 9 starting lords; full 120-year sequence correctness (count, order, contiguity,
`validateVimshottariMahadashaSequence` clean); date-rollover sanity; fractional-minute precision;
determinism; provider-error mapping (ayanamsa unsupported, unrecognized error rethrown);
serialize/deserialize round-trip; and the oracle-comparison suite above (both fixtures, both
oracles, structural exact-match plus explicitly-bounded, explicitly-attributed date tolerances).
