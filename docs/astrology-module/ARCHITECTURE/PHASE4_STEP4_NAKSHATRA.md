# PHASE 4 — STEP 4: Vedic Nakshatra + Pada

Implements Nakshatra (1-27) + Pada (1-4) + Lord derivation from an already-known sidereal
longitude. No Dasha (Steps 5-6), no divisional charts, no interpretation/scoring.

## Architecture inspection (Section 2)

Read before writing any code: `chart/types.ts`, `chart/createNormalizedChart.ts`,
`chart/validation.ts`, `chart/serialization.ts`, `chart/__tests__/fixtures.ts`,
`chart/__tests__/schoolCompatibility.test.ts`, `vedic/rashi.ts`, `precision.ts`, `index.ts`.

**Finding — a real conflict between the approved contract and an existing Phase 2 test.**
`chart/__tests__/schoolCompatibility.test.ts` asserted (before this step) that Western and Vedic
charts expose an *identical* `NormalizedChart` key set, and its own comment named `'nakshatra'`
as the paradigm example of a forbidden school-specific leak — written before the Vedic Decision
Gate approved `NormalizedChart.nakshatraPositions` (D3) existed as a concept. Reading
`chart/serialization.ts` surfaced a second wrinkle: the project's own versioning policy defines a
MINOR bump as "new field not required," and `deserializeNormalizedChart` performs no runtime
shape-check — a genuinely *required* new field would let pre-Step-4 serialized charts silently
deserialize with the field missing. Presented to the user as a schema question; **approved
resolution**: `nakshatraPositions?: NormalizedNakshatraPosition[]` (optional, MINOR bump,
`NORMALIZED_CHART_SCHEMA_VERSION` 2.0.0 → 2.1.0), with `createNormalizedChart()` still defaulting
it to `[]` for every chart it builds (Western included) — so the "identical key set" invariant
holds in practice for every chart the factory produces, and `GENERIC_CHART_KEYS` was updated
rather than that invariant being weakened.

**Naming-convention finding.** The task's suggested pseudotype used `planetOrPoint` — but the
codebase already has an established name for exactly this concept: `NormalizedPlanetPosition.body`
and `NormalizedDignityResult.body` (the latter explicitly renamed from `planet` for the same
reason — to cover non-classical points). `NormalizedNakshatraPosition` uses `body: string`, not
`planetOrPoint`, to match. `pada` is typed as a closed `1 | 2 | 3 | 4` union, matching
`HouseNumber`'s precedent for small fixed-range integers. `lord` stays a plain `string` (not
`CelestialBody`) since Rahu/Ketu aren't part of `KnownCelestialBody`'s autocomplete list, matching
how `NormalizedDignityResult.body`/`NormalizedAspectInstance.planetA` are already plain `string`.

**Schema location.** `NakshatraName` (closed 27-value union), `NAKSHATRA_NAMES`, `NakshatraPada`,
and `NormalizedNakshatraPosition` all live in `chart/types.ts`, next to `NormalizedChart` — the
same neutral layer `ZodiacSign`/`HouseNumber` already live in, even though only Vedic populates
this particular field (exactly how `AyanamsaId`/`HouseSystemId` already work: neutral-layer types
that only some schools give non-default values). `NakshatraName` is a **closed** union (unlike
`AspectType`/`DignityTypeId`, which stay open) because — unlike aspects/dignity schemes, where
different schools genuinely want different vocabularies for the same slot — the 27 Nakshatra names
are fixed across every Vedic sub-tradition (KP, Jaimini included); there is no competing catalog
that closing the union would block.

## Oracle formula verification (Section 3 — mandatory, both oracles)

Read directly from source, not from memory:

- **vedic-calc** (`vedic_calc/chart/calculator.py::longitude_to_nakshatra_info`):
  `nak_index = int(longitude / NAKSHATRA_SPAN)` (clamped to 26), `pada = int(degree_in_nak /
  PADA_SPAN) + 1` (clamped to 4), `NAKSHATRA_SPAN = 360/27`, `PADA_SPAN = NAKSHATRA_SPAN/4`.
- **PyJHora** (`jhora/panchanga/drik.py::nakshatra_pada`): `one_star = 360/27`, `one_pada =
  360/108`, `quotient = int(longitude / one_star)`, `pada = int(reminder / one_pada)` — no
  defensive clamp at exactly 360° (vedic-calc clamps; PyJHora doesn't — moot for this project
  since `normalizeDegrees()` is always applied first, so longitude is always in `[0, 360)` before
  either formula runs, and the clamp in `vedic/nakshatra.ts` is kept anyway, matching vedic-calc's
  defensive style).

**Both formulas are mathematically identical** (floor-based, no rounding/snapping at boundaries).

## Pada mapping (Section 3.B/3.C)

27 × 13°20' = 27 × (360/27) = 360° exactly (verified in JS: `27 * (360/27) === 360` is `true`, no
floating-point drift at the full-circle level). 108 × 3°20' = 360° exactly likewise.

## Lord mapping (Section 3.F, Section 9 — full 27-entry cross-check)

vedic-calc's `NAKSHATRA_LORDS` dict (27 explicit entries, citing BPHS Chapter 46) and PyJHora's
`nakshatra_lords`/`vimsottari_adhipati_list = [8,5,0,1,2,7,4,6,3]` (a 9-cycle, repeated 3×) were
decoded to planet names via PyJHora's own `utils.PLANET_NAMES` resource list (`['Sun', 'Moon',
'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', ...]`, confirming index 0=Sun ...
8=Ketu) and cross-checked against vedic-calc's table for **all 27 Nakshatras** — **exact match**,
recorded as the `EXPECTED_LORDS` table in `vedic/__tests__/nakshatra.test.ts`. The lord sequence is
the fixed 9-planet cycle Ketu→Venus→Sun→Moon→Mars→Rahu→Jupiter→Saturn→Mercury, repeating every 9
Nakshatras (`vedic/nakshatra.ts::NAKSHATRA_LORD_CYCLE`, indexed via `nakshatraIndex % 9` rather
than a 27-entry lookup table — the modulo directly encodes the verified repeating rule).

**Display-name mismatch, not a data mismatch:** PyJHora's default (English-locale) `NAKSHATRA_LIST`
uses Tamil transliterations ("Karthigai", "Thiruvaathirai", "Punarpoosam", ...), not the Sanskrit
names ("Krittika", "Ardra", "Punarvasu") vedic-calc and this project use. Both oracles agree
exactly on **sequence position** (1-27) and **lord** — only the display string differs. The
project uses Sanskrit names, matching vedic-calc and the task brief's own reference to "Anuradha".

## Boundary behavior / 0°-360° wrap (Section 3.G/3.H, Section 7)

`normalizeDegrees()` is applied first in every function (`getNakshatraIndex`, `getNakshatraPada`),
so `longitude = 360` always becomes `0` before any Nakshatra math runs — the wrap lands on Ashwini
(index 0), not a hypothetical 28th Nakshatra. `getNakshatraPada` derives degree-within-Nakshatra
from the *same* already-computed `index` (not an independent `% NAKSHATRA_SPAN_DEGREES`), so index
and pada can never disagree even at floating-point edges — same "always paired" principle as
`signOfLongitude`/`signDegreeOfLongitude`.

## Floating-point characterization (Section 3.I, Section 7)

A synthetic boundary test constructed as `17 * NAKSHATRA_SPAN_DEGREES + 2 *
NAKSHATRA_PADA_SPAN_DEGREES` evaluates to `233.33333333333334` — a value that, compounded through
two separate irrational-decimal roundings, lands a hair (~1e-14°) *below* the true mathematical
pada-2/pada-3 boundary, so it correctly floors into pada 2, not pada 3. This is a characterized
floating-point compounding effect in the test's own boundary construction, not a defect in
`getNakshatraPada` (which faithfully floors whatever value it is given) — same category as the
`-0` quirk `normalizeDegrees` already documents (Phase 4 Step 2). The test asserts the correct,
actual behavior and documents why, plus a `+1e-9` case immediately after to robustly confirm the
boundary crossing.

## Golden fixtures (Section 8 — mandatory, both oracles)

Benchmark: Hanoi, 1985-03-12 08:30 local = `1985-03-12T01:30:00.000Z` UTC, Lahiri. Sidereal
longitudes for Sun/Moon/Saturn were obtained from the **project's own Step 3 implementation**
(`calculateRashi`, not re-hardcoded), then independently reproduced on each oracle using *that
oracle's own* sidereal longitude for the same benchmark (PyJHora: native `SEFLG_SIDEREAL`;
vedic-calc: manual subtraction) — never mixing a longitude computed by one source with a formula
from another (Section 4's explicit warning):

| Body | Project sidereal | Project Nakshatra/Pada/Lord | PyJHora sidereal | PyJHora N/P/L | vedic-calc sidereal | vedic-calc N/P/L |
|---|---|---|---|---|---|---|
| Sun | 327.775519° | Purva Bhadrapada, 3, Jupiter | 327.781254° | Purva Bhadrapada, 3, Jupiter | 327.771942° | Purva Bhadrapada, 3, Jupiter |
| Moon | 216.364436° | Anuradha, 1, Saturn | 216.364787° | Anuradha, 1, Saturn | 216.361000° | Anuradha, 1, Saturn |
| Saturn | 214.462077° | Anuradha, 1, Saturn | 214.461646° | Anuradha, 1, Saturn | 214.458486° | Anuradha, 1, Saturn |

**Zero disagreement** — all three sources land on the identical Nakshatra/Pada/Lord for every
body, despite the already-known, already-documented Step 3 sidereal deltas (~13″ ayanamsa-API
delta vs. vedic-calc, ~33″ method delta vs. PyJHora — see `PHASE4_STEP3_RASHI.md`). This is
expected: both deltas are two to three orders of magnitude smaller than a Pada's 3°20' width, so
they never approach a genuine boundary-flip risk for this benchmark. Moon = Anuradha #17, Pada 1
matches the preflight's own claim, but was independently recomputed here, not copied — the closest
margin from a pada boundary among the three bodies is Moon's ≈3.03° into its pada (pada-1/pada-2
boundary at 3.333°), still a comfortable ≈0.3° safety margin across all three sources.

## Unknown birth time (Section 10)

Not ambiguous at this layer: `calculateNakshatraPosition()` is a pure function of an
already-known sidereal longitude — it never touches birth time, `AstronomicalProvider`, or
`BirthData.localTime`. The question of *whether* and *for which bodies* a chart with
`localTime === null` gets a `NormalizedNakshatraPosition` entry belongs entirely to chart-level
integration (`vedic/chart.ts`, Step 7, not yet built) — same reasoning already established for
Rashi/D1 in Step 3 (`PHASE4_STEP3_RASHI.md` "VỀ HOUSE ASSIGNMENT").

## What this step deliberately does NOT do

- No Dasha, no divisional charts, no house assignment, no interpretation/scoring, no chart
  integration (Step 7).
- No vendoring of PyJHora or vedic-calc source, no runtime dependency on either (`package.json`
  unchanged) — both live only in the out-of-process venv used for validation.

## Tests

`vedic/__tests__/nakshatra.test.ts` (51 tests): span/pada-span sanity (27×13°20'=360°,
108×3°20'=360°); all 27 Nakshatra start boundaries, open-upper-boundary, wraparound (359.999...,
360→0); all 4 pada boundaries within a Nakshatra (both the first and an arbitrary later one, plus
the documented floating-point case); full 27-entry lord table (`EXPECTED_LORDS`, cross-checked
against `NAKSHATRA_NAMES`'s own order to guard against a transcription error in the test itself);
lord-cycle repetition (index `i`, `i+9`, `i+18` agree); `calculateNakshatraPosition`'s pure
composition; and the oracle golden-fixture suite above (Sun/Moon/Saturn, both oracles, zero
disagreement).
