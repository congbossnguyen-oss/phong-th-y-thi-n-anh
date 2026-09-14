# PHASE 4 — STEP 5: Vimshottari Dasha — Pre-flight / Design Only

**No implementation in this step.** Zero production code changes (confirmed: `git status` before and
after this investigation is identical; 397/397 tests, typecheck, build all unchanged). This document
resolves D5 through source/oracle investigation and proposes (but does not implement) the Step 6
schema and calculation design.

## 1. Architecture inspected

`chart/types.ts`, `chart/createNormalizedChart.ts`, `chart/validation.ts`, `chart/serialization.ts`,
`vedic/rashi.ts`, `vedic/nakshatra.ts`, `precision.ts`, `index.ts`, the Phase 4 Decision Gate's
already-approved decisions (D3, D4, D6) and implementation-order plan (Step 6 file path
`vedic/dasha/vimshottari.ts` was already named at the Decision Gate, not invented here).

Relevant conventions confirmed present and reusable without change:
- The `{ok: true, result} | {ok: false, errors: AstrologyCoreError[]}` result pattern
  (`calculateWesternHousesAndAngles`, `mapWesternPlanetPositions`, `calculateRashi`).
- Independent, self-contained schema versioning per top-level artifact — `NormalizedChart` already
  has its own `NORMALIZED_CHART_SCHEMA_VERSION`, separate from the package version. A new top-level
  Dasha structure (D4: "outside `NormalizedChart`") should get its **own** independent version
  lineage, not share `NORMALIZED_CHART_SCHEMA_VERSION`.
- `createNormalizedChart()`'s "optional input, defaulted, always-present output" pattern — not
  directly reusable here since Dasha lives outside `NormalizedChart` entirely, but useful precedent
  for how the eventual `VimshottariDashaResult`'s array fields should behave.
- Closed unions for fixed, universal, non-school-forkable catalogs (`ZodiacSign`, `NakshatraName`)
  vs. open `string` for genuinely school-variable vocabularies (`AspectType`, `DignityTypeId`).

**Confirmed reusable without modification:** `vedic/nakshatra.ts` already exposes everything Step 6
needs to find the starting Nakshatra/lord — `getNakshatraIndex`, `getNakshatraLord`. No changes
needed there. `vedic/rashi.ts::calculateRashi` already supplies the sidereal Moon longitude Step 6
needs. **Neither file requires modification for Step 6.**

## 2. Oracle source locations (Section 4/5 of the task)

- PyJHora: `jhora/horoscope/dhasa/graha/vimsottari.py` (`vimsottari_dasha_start_date`,
  `vimsottari_mahadasa`, `get_vimsottari_dhasa_bhukthi`, `_vimsottari_bhukti` for Antardasha),
  `jhora/const.py` (`vimsottari_dict`, `vimsottari_adhipati_list`, `human_life_span_for_vimsottari_dhasa`,
  `sidereal_year`, `DHASA_YEAR_DURATION` enum), `jhora/panchanga/drik.py`
  (`dhasa_year_duration`, `true_sidereal_year`, `get_chart_element_longitude`'s
  `dhasa_starting_planet` default).
- vedic-calc: `vedic_calc/dasha/calculator.py` (`calculate_dasha`, `get_current_dasha`),
  `vedic_calc/core/constants.py` (`VIMSOTTARI_YEARS`, `VIMSOTTARI_ORDER`, `VIMSOTTARI_TOTAL_YEARS`,
  `NAKSHATRA_SPAN`), `vedic_calc/core/types.py` (`DashaPeriod`).

## 3. Empirical verification results (task's 13 numbered questions)

**1. Starting-point Nakshatra:** the **Moon's** Nakshatra at birth, confirmed in both oracles by
reading source, not assumed: PyJHora's `get_chart_element_longitude(..., dhasa_starting_planet=1)`
docstring states `1=Moon (default)`; vedic-calc's `calculate_dasha` reads `chart.planets[Planet.MOON]`
directly with no alternative path.

**2. Nakshatra lord → starting Mahadasha lord:** direct 1:1 — the Moon's Nakshatra lord (Step 4's
already-implemented `getNakshatraLord`) *is* the starting Mahadasha lord. No extra mapping step.

**3. Full Mahadasha sequence:** the fixed Vimshottari order, confirmed identical in both oracles'
source: Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury (cyclic).

**4. Standard Mahadasha durations (years):** Ketu=7, Venus=20, Sun=6, Moon=10, Mars=7, Rahu=18,
Jupiter=16, Saturn=19, Mercury=17. **Byte-identical** between `jhora/const.py::vimsottari_dict` and
`vedic_calc/core/constants.py::VIMSOTTARI_YEARS` — confirmed by reading both, not memory.

**5. Total cycle length:** 120 years exactly (sum of #4) — matches
`human_life_span_for_vimsottari_dhasa`/`VIMSOTTARI_TOTAL_YEARS` in both.

**6. Elapsed-Nakshatra-fraction → starting-Mahadasha balance:** identical linear formula in both:
```
elapsed_fraction = degree_elapsed_in_nakshatra / NAKSHATRA_SPAN_DEGREES   # NAKSHATRA_SPAN_DEGREES = 360/27
elapsed_years     = elapsed_fraction * full_years_for_starting_lord
dasha_start        = birth_instant − elapsed_years (converted to days)
```
**Pada plays no role in this formula in either oracle** — a common assumption worth explicitly
recording as false: Vimshottari balance depends only on the raw degree-within-Nakshatra, not on
which of the 4 padas that degree falls into.

**7/8. Year-length convention — the one genuine oracle disagreement (quantified below):**
- **vedic-calc**: a **fixed constant, 365.25 days/year** (`_DAYS_PER_YEAR = 365.25`, the Julian
  calendar year — vedic-calc's own comment calls this "standard astronomical convention," which is
  true for the Julian year specifically, though it is not itself "the sidereal year"). No ephemeris
  call, no date-dependence, no ayanamsa-dependence.
- **PyJHora**: **configurable**, via `const.DHASA_YEAR_DURATION` (8 named options: mean/true ×
  sidereal/tropical, savana, mean/true lunar, Gregorian). **Default is `TRUE_SIDEREAL_YEAR`**
  (`dhasa_year_duration_default = DHASA_YEAR_DURATION.JHORA_DEFAULT = TRUE_SIDEREAL_YEAR`) — a
  **dynamically computed, date-dependent** value: `true_sidereal_year(jd, place)` finds the actual
  previous and next real-ephemeris moments the Sun crosses sidereal 0° Aries and returns the elapsed
  days between them. For our Hanoi 1985-03-12 benchmark this evaluated to `365.260814324487` days —
  **not** 365, not 365.25, and not even PyJHora's own `MEAN_SIDEREAL_YEAR` constant
  (`sidereal_year = 365.256364`, "From JHora" per its own comment) exactly, though close to it
  (differs by ~0.0044 days ≈ 6.4 minutes for this date).

**9. Years → calendar-date conversion:** `date = birth_instant ± (years × days_per_year)`, applied
as plain day arithmetic on top of the chosen year-length constant/function — identical mechanism in
both oracles, differing only in which `days_per_year` value feeds it (#7/8).

**10. Rounding/truncation:** neither oracle rounds/truncates mid-calculation. vedic-calc keeps full
`datetime`/float precision throughout and only rounds `duration_years` to 6 decimal places for
display (`round(duration_years, 6)`) — the underlying `start`/`end` datetimes themselves are never
rounded. PyJHora similarly keeps full Julian-day float precision and only rounds at
`dhasa_year_duration`'s own `round_to_digits=6` parameter (which, notably, is **not actually applied**
in the `true_sidereal_year`/`MEAN_SIDEREAL_YEAR` return paths — both return the unrounded value; the
`round_to_digits` parameter is effectively vestigial in the current source). Matches this project's
own precision doctrine (`precision.ts`'s "no rounding mid-calculation, only at display boundary").

**11. Antardasha — recommend OUT of V1/Step 6 scope.** PyJHora implements it, but with **6 different
configurable variants** (`antardhasa_option` 1-6, spanning "North Indian" vs. "South Indian"
tradition orderings and forward/reverse direction choices) plus an entirely separate
`use_rasi_bhukthi_variation` alternative algorithm — meaning Antardasha itself is not a single
settled convention even within one oracle, unlike Mahadasha (which both oracles compute identically
apart from the year-length constant). Adding Antardasha now would require resolving which of at
least 6+ variants to support — a materially larger, separate decision that the task's own scope
freeze already excludes ("Do NOT design beyond the V1 Dasha scope"). vedic-calc's `calculate_dasha`
signature already anticipates this via its `levels` parameter (1=Mahadasha only), confirming
"Mahadasha-only" is itself a recognized, valid, minimal configuration in the reference
implementations, not an artificial restriction invented for this project.

**12. Does Dasha require exact birth time? Yes, unconditionally.** The Moon moves roughly
0.5°–0.6°/hour; the elapsed-fraction formula (#6) is continuous and sensitive to the Moon's exact
sidereal longitude at the exact birth instant. A few minutes of time uncertainty shifts the
computed balance measurably, and near a Nakshatra boundary (rem ≈ 0 or rem ≈ NAKSHATRA_SPAN) could
flip the **starting Mahadasha lord itself**, not just its balance.

**13. Unknown birth time — neither oracle has a fallback.** Both `vimsottari_dasha_start_date` and
`calculate_dasha` unconditionally require a specific Julian day / `datetime` — there is no "unknown
time" branch, optional parameter, or degraded-mode return value in either source. This absence is
itself evidence, not an oversight on my part: it confirms the already-approved D6 rule (never infer
a birth time; Dasha is UNAVAILABLE, not degraded, when time is unknown) is the *only* mathematically
honest choice — there is no oracle precedent for a partial/approximate Vimshottari calculation
without exact time.

## 4. Oracle discrepancy — reproduced, quantified, attributed (task's "ORACLE DIFFERENCES" section)

Two Hanoi/Mumbai benchmark fixtures were run through both oracles' **own** internal sidereal-Moon
computation (never mixing one oracle's longitude with the other's formula):

| Fixture | vedic-calc Mahadasha start | PyJHora (default TRUE_SIDEREAL_YEAR) Mahadasha start | Gap |
|---|---|---|---|
| Hanoi 1985-03-12 08:30 (+7) — Saturn, 19y | 1980-11-17 11:50:02 | 1980-11-15 11:49:15 | ~2.00 days |
| Mumbai 1990-06-15 12:00 (+5.5) — Rahu, 18y | 1974-05-15 11:03:55 | 1974-05-17 01:41:45 | ~1.65 days |

**Root-cause isolation** (holding the year-length constant fixed at 365.25 for both, varying only
the input Moon longitude): switching the elapsed-fraction calculation's input longitude from
vedic-calc's own sidereal Moon (216.361°, manual subtraction, no-nutation ayanamsa) to PyJHora's own
sidereal Moon (216.365°, native `SEFLG_SIDEREAL`) — a mere ~0.0038° difference — by itself shifts the
computed Mahadasha start by **~1.8 of the observed ~2.0-day gap**. The remaining ~0.2 days comes from
the year-length constant difference (365.25 vs. 365.256–365.261) compounded over Saturn's 19-year
period. **Conclusion: the dominant driver of this Dasha-level discrepancy is not a new Dasha
algorithm difference — it is the *same* Step 3 sidereal-longitude oracle delta already found,
quantified, and explained (nutation-inclusion / native-flag-vs-manual-subtraction), now amplified
by a Mahadasha's multi-year span.** The year-length convention (#7/8) is a real, independent,
smaller secondary source, worth ~hours per Mahadasha and (by extrapolation) under a day across the
full 120-year cycle between vedic-calc's 365.25 and PyJHora's MEAN_SIDEREAL_YEAR.

This is an **upstream/API convention difference**, not a bug in either oracle or a flaw in the
Vimshottari algorithm itself — both oracles agree exactly on the algorithm (#1-6, #9-10); they only
diverge on (a) which of two already-known-and-accepted sidereal-longitude conventions feeds it, and
(b) which of several valid year-length definitions converts years to calendar days.

## 5. Proposed schema (NOT implemented — pending your review)

Standalone, outside `NormalizedChart`, per D4 and the already-named Step 6 path
`src/vedic/dasha/vimshottari.ts` (a `types.ts` alongside it if the shape grows past what's
comfortable in one file — a call for Step 6, not this preflight).

```ts
export const VIMSHOTTARI_DASHA_SCHEMA_VERSION = "1.0.0"; // independent of NORMALIZED_CHART_SCHEMA_VERSION

// Closed union: Vimshottari's 9 grahas are a fixed, non-extensible traditional set —
// same reasoning as NakshatraName (Section 3.2 of PHASE4_STEP4_NAKSHATRA.md).
export type VimshottariLord = "ketu" | "venus" | "sun" | "moon" | "mars" | "rahu" | "jupiter" | "saturn" | "mercury";

export interface VimshottariMahadashaPeriod {
  lord: VimshottariLord;
  startUtc: Date;   // matches CalculationMetadata.calculatedAt's precedent (native Date, not an ISO string field)
  endUtc: Date;
  durationYears: number; // full double precision — no mid-calculation rounding, matches precision.ts's doctrine
  // Intentionally NO `antardashas` field yet (Section 3.11) — left for a later step to add as an
  // optional array here, without needing to restructure this type or bump a MAJOR version.
}

export interface VimshottariMahadashaSequence {
  ayanamsaId: AyanamsaId;             // traceability — which ayanamsa produced the sidereal Moon longitude used
  yearConvention: string;              // named, configured choice (see AspectOrbPolicy's "policy has an id" precedent) — NOT hardcoded silently
  startingMahadashaLord: VimshottariLord; // == mahadashas[0].lord; explicit top-level convenience field
  mahadashas: VimshottariMahadashaPeriod[]; // exactly 9 (one full 120-year cycle from birth)
}

export type CalculateVimshottariDashaResult =
  | { ok: true; result: VimshottariMahadashaSequence }
  | { ok: false; errors: AstrologyCoreError[] };

export function calculateVimshottariDasha(input: {
  provider: AstronomicalProvider;
  utcInstant: Date;        // ALWAYS required — no "unknown time" input mode (see below)
  ayanamsaId?: AyanamsaId; // defaults to VEDIC_DEFAULT_AYANAMSA ("lahiri"), matching calculateRashi
}): CalculateVimshottariDashaResult { /* Step 6 */ }
```

**Nullable/unavailable semantics (addressing D6 directly):** the function signature *always*
requires an exact `utcInstant` — there is no `utcInstant: Date | null` input mode, mirroring exactly
how `calculateWesternHousesAndAngles`/`mapWesternPlanetPositions` already work (they too always
require exact coordinates/instants; the *caller* decides whether to invoke them at all when
`BirthData.localTime === null`, passing an empty `houseCusps` array upstream instead of teaching the
function itself a "null" mode). This keeps `calculateVimshottariDasha` mathematically honest (it
never silently produces a number from an absent input) and pushes the "is Dasha available at all
for this chart" decision to a future chart-integration layer — exactly where D4's "outside
NormalizedChart" framing already puts the associated storage decision. **No further design work is
needed here** for the unknown-time case; it falls out directly from an established pattern.

**Serialization/validation (proposed, not built):** a `serializeVimshottariDasha`/
`deserializeVimshottariDasha` pair mirroring `chart/serialization.ts`'s envelope-with-major-version
pattern (`{schemaVersion, dasha}`, reject on major mismatch), and a `validateVimshottariDashaResult`
mirroring `chart/validation.ts`'s style: exactly 9 periods, each `durationYears` matches the fixed
lord-year table for its `lord`, periods chronologically contiguous (each `startUtc` equals the
previous period's `endUtc`), lords follow the fixed cyclic order starting from
`startingMahadashaLord`, sum of `durationYears` ≈ 120 (within floating-point tolerance).

## 6. Explicit recommendations for every unresolved D5 decision

| Decision | Recommendation | Why |
|---|---|---|
| Starting point | Moon's Nakshatra (Step 4's `getNakshatraLord`/`getNakshatraIndex`, fed by Step 3's `calculateRashi`) | Unanimous in both oracles; already fully built |
| Elapsed-balance formula | `elapsed_fraction = degreeInNakshatra / NAKSHATRA_SPAN_DEGREES`, linear | Identical in both oracles |
| Year-length convention | **Needs your decision** — candidates: (a) fixed `365.25` (vedic-calc, simplest, zero extra ephemeris calls), (b) fixed `365.256364` "mean sidereal year" (PyJHora's own non-default constant, closer to the traditional literature value), (c) PyJHora's dynamic `TRUE_SIDEREAL_YEAR` (most "astronomically real," requires 2 extra ephemeris root-finding calls per computation, and its magnitude of improvement over (b) is ~6 minutes for our benchmark — likely not worth the added complexity for V1) | Genuine, quantified, upstream convention difference — not guessable from "general astrology knowledge" |
| Antardasha | Exclude from V1 (Step 6) | 6+ competing conventions even within one oracle; task's own scope freeze already excludes it |
| Unknown birth time | Function always requires exact `utcInstant`; never a "null" input mode; caller decides whether to invoke | Matches established Western pattern exactly; no oracle precedent for a degraded/partial calculation |
| Schema location | New file(s) under `src/vedic/dasha/`, NOT inside `chart/types.ts` | D4: "outside NormalizedChart"; unlike Nakshatra, Dasha has no NormalizedChart-level storage field at all |
| Schema versioning | New, independent `VIMSHOTTARI_DASHA_SCHEMA_VERSION`, starting at `1.0.0` | Genuinely separate top-level artifact, not nested inside `NormalizedChart` |
| Pada's role in Dasha | None — confirmed not used by either oracle's Mahadasha-balance formula | Prevents a plausible but wrong assumption from leaking into Step 6 |

## 7. Test matrix for Step 6

- **Formula correctness:** elapsed-fraction/balance formula against both empirical fixtures above
  (Hanoi Saturn/19y, Mumbai Rahu/18y), using the project's own Step 3/4 sidereal Moon + Nakshatra
  output as input — golden-compare each Mahadasha's `startUtc`/`durationYears` against both oracles
  under the **same, explicitly chosen** year-length convention (not two different conventions
  compared against each other — that would re-litigate the already-quantified #7/8 finding, not
  test correctness).
- **Sequence correctness:** all 9 Mahadashas present, lords follow the fixed cyclic order starting
  from the Nakshatra lord, `durationYears` for each matches the fixed lord-year table exactly, sum
  of all 9 ≈ 120 years.
- **Boundary — Nakshatra start** (`degreeInNakshatra = 0`): elapsed_fraction = 0, `startUtc` of the
  first Mahadasha equals `utcInstant` exactly (zero elapsed balance).
- **Boundary — Nakshatra end** (`degreeInNakshatra` → `NAKSHATRA_SPAN_DEGREES`, just below):
  elapsed_fraction → 1, first Mahadasha's remaining balance → ~0, next Mahadasha imminent — verify
  no negative duration, no divide-by-zero (formula divides by the *constant* span, never by a
  variable, so this is structurally safe — still worth an explicit regression test).
- **Pada irrelevance:** two synthetic longitudes with the same Nakshatra/degree-in-Nakshatra but
  landing in different padas produce identical Dasha output (proves pada is correctly ignored).
- **Exact-timestamp reproducibility:** same input called twice yields byte-identical output
  (no `Date.now()`, no hidden randomness) — same discipline as every prior step's pure functions.
- **Fractional-day/sub-second precision:** birth times differing by seconds produce measurably
  (not truncated-away) different `startUtc` values for the elapsed portion.
- **Date rollover:** at least one fixture whose computed Mahadasha boundary crosses a calendar
  year-end and at least one crossing a leap-year Feb 29, to exercise native `Date` arithmetic (not a
  custom day-counter that could mishandle either).
- **Ayanamsa configurability:** same instant, `ayanamsaId: "lahiri"` vs. `"raman"` produce different
  `startingMahadashaLord`/balances where the two ayanamsas' longitude difference (~1.45°, from Step
  3's own test) is large enough to cross a Nakshatra boundary — reuses Step 3's already-established
  fixture rather than inventing a new one.
- **Provider-error mapping:** unsupported `ayanamsaId` → `{ok:false, errors:[...]}` with
  `UNSUPPORTED_FEATURE`, matching `calculateRashi`'s established convention — no new error taxonomy
  needed.
- **Oracle agreement, explicit tolerance:** once the year-length decision (Section 6) is made,
  compare against **whichever oracle uses the same convention** with a tight tolerance (sub-hour),
  and against the other oracle with a tolerance wide enough to cover the ~2-day gap **only if
  explicitly labeled as covering a known, already-documented convention difference** — never a
  silent blanket tolerance.
- **School isolation / sweph isolation greps:** re-run exactly as in Steps 3-4 — `vedic/dasha/` must
  not import `western/`, must not import `sweph` directly.

## 8. Exact files Step 6 would need to modify

- **New:** `src/vedic/dasha/vimshottari.ts` (the name already fixed at the Phase 4 Decision Gate).
- **New:** `src/vedic/dasha/__tests__/vimshottari.test.ts`.
- **New (optional, if the schema doc above turns out to need it as its own file):**
  `src/vedic/dasha/types.ts` — a call for Step 6 to make, not this preflight.
- **Modified:** `src/index.ts` (export wiring only — same pattern as Steps 3/4).
- **Not modified:** `chart/types.ts`, `chart/createNormalizedChart.ts`, `chart/validation.ts`,
  `chart/serialization.ts`, `chart/__tests__/fixtures.ts`, `chart/__tests__/schoolCompatibility.test.ts`
  — Dasha lives entirely outside `NormalizedChart` (D4), so **none of Step 4's schema-touching files
  need to change again**. This is a meaningfully smaller, more contained change than Step 4's.
- **New doc (Step 6, not this preflight):** `docs/astrology-module/ARCHITECTURE/PHASE4_STEP6_DASHA_IMPLEMENTATION.md`.

## 9. Baseline confirmation

Before this investigation: 397/397 tests passing, typecheck clean (both variants), build clean,
school isolation clean, `git status` showing only Steps 1-4's already-reported changes. After this
investigation (zero code touched, research only): **identical** — re-run and confirmed unchanged.

## 10. D5 year-length decision — RESOLVED

**Approved:** fixed **mean sidereal year, 365.256364 days** (PyJHora's own `MEAN_SIDEREAL_YEAR`
constant, `sidereal_year` in `jhora/const.py`, "From JHora"). Rationale accepted: closest to the
traditionally-cited sidereal year value in Vedic astrology literature, zero extra ephemeris calls,
fully deterministic, and the ~6-minute difference from PyJHora's own dynamic default
(`TRUE_SIDEREAL_YEAR`, ~365.2608 days for our benchmark) is far smaller than the already-accepted
Step 3 sidereal-longitude deltas (~13″–33″, amplified to ~2 days over a Mahadasha span — see
Section 4). **Not** vedic-calc's 365.25 (Julian year), **not** PyJHora's dynamic default.

This closes the one open D5 sub-decision from this preflight. `VimshottariMahadashaSequence`'s
proposed `yearConvention: string` field (Section 5) should be set to a stable identifier for this
specific choice when Step 6 is implemented — e.g. `"mean_sidereal_year.365_256364"` — matching the
project's established "named, configured policy" pattern (`AspectOrbPolicy.id`), so a different
convention could be added later without silently changing this one's meaning.

Step 5 preflight is complete. Step 6 (implementation) awaits its own explicit task instruction,
per this engagement's established one-step-at-a-time discipline — no code has been written yet.
