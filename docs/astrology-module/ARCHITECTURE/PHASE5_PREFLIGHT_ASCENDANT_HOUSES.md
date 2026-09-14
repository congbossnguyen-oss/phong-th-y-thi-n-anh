# PHASE 5 — PREFLIGHT: Vedic Ascendant / Lagna + Houses

**No implementation in this step.** Zero production code changes (all verification below used the
already-committed, unmodified `SwissEphemerisProvider` and existing exports — `getSiderealLongitude`,
`signOfLongitude`, `signDegreeOfLongitude` — through disposable scratch scripts only, and Python
oracle work in the existing out-of-process venv). Checkpoint preserved:
`5dbb7cf96fdc4888b910c4969afca68491007cff`.

## 1. Current architecture — what already exists and is directly reusable

Read: `chart/types.ts`, `chart/createNormalizedChart.ts`, `chart/validation.ts`,
`chart/serialization.ts`, chart tests, `astronomical/AstronomicalProvider.ts`,
`SwissEphemerisProvider.ts`, `precision.ts`, `vedic/rashi.ts`, `vedic/nakshatra.ts`,
`vedic/dasha/vimshottari.ts`, `vedic/chart.ts`, `index.ts`, all Phase 4 architecture documents.

**Major finding — the provider interface already supports everything Ascendant/Houses need, with
zero changes:**
- `AstronomicalProvider.getAscendant(utcInstant, latitude, longitude, houseSystem): AngleResult` —
  already exists (Phase 1 interface, Phase 3B-1 implementation), already used by Western.
- `AstronomicalProvider.getHouseCusps(...)` — same.
- `KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE` in `SwissEphemerisProvider.ts` **already maps
  `"whole_sign"` to Swiss Ephemeris's `"W"` code** — added during Phase 3B-1 for completeness,
  never exercised by Western (`WESTERN_DEFAULT_HOUSE_SYSTEM = "placidus"`), but fully functional
  today. Confirmed by reading the constant directly, not assumed.
- `getAscendant()`'s returned tropical longitude is **provably independent of the `houseSystem`
  parameter** — verified empirically (see §4): calling it with `"whole_sign"` vs `"placidus"` for
  the same instant/location returns bit-identical values. This matches the geometric fact that the
  Ascendant is a single well-defined point regardless of which house-cusp convention is applied
  afterward.
- `getSiderealLongitude()` (Step 3), `signOfLongitude()`/`signDegreeOfLongitude()` (Step 2/3,
  neutral `precision.ts`) — already exist, already frozen, directly reusable for the Ascendant
  exactly as they already are for planets. No new sidereal-conversion or sign-mapping code is
  needed.

**Major finding — `NormalizedChart` already has a fully adequate, pre-existing, neutral home for
Ascendant/Houses, unlike Nakshatra and Dasha:** `NormalizedChart.angles: NormalizedAngle[]`
(`type: "ASC"|"MC"|"DESC"|"IC"`), `.houseCusps: NormalizedHouseCusp[]`, `.houses: NormalizedHouse[]`
(sign + ruler per house), and `NormalizedPlanetPosition.house: HouseNumber | null` are **already
school-neutral fields Western already populates**. Unlike Nakshatra (which needed a brand-new
`nakshatraPositions` field because no neutral home existed) and unlike Dasha (a genuinely
Vedic-only, time-series concept correctly kept standalone), Ascendant/Angles/Houses are universal
astronomical/astrological concepts — Vedic "Lagna" and Western "Ascendant" are the same geometric
point, interpreted in a different zodiac. **This means Vedic Ascendant/Houses likely need zero
`NormalizedChart` schema changes** — see §7.

**Finding — even Western hasn't populated `NormalizedHouse.ruler` yet.** Confirmed by reading
`western/chart.ts::buildWesternChart` directly: it never passes `houses` to
`createNormalizedChart()`, so it defaults to `[]`. Sign-rulership is content (a lookup table), not
geometry, and remains an explicitly deferred decision for *both* schools (see `FUTURE_WORK.md`
mention already on file for Western). V1 Vedic should follow the same precedent — see §14.

**Finding — Phase 1's `validateBirthData` already validates coordinates.** `latitude ∈ [-90, 90]`,
`longitude ∈ [-180, 180]`, confirmed by reading `validation/birthData.ts` directly. Ascendant/House
code sits downstream of this validation (same as every other Chart Calculation function) and does
not need to re-validate coordinates itself.

## 2. Ascendant / Lagna — exact calculation used by each source

**PyJHora** (`jhora/panchanga/drik.py::ascendant()`): computes the sidereal Ascendant using the
**native `SEFLG_SIDEREAL` flag** passed directly into `swe.houses_ex()` — the same "native flag"
method already found and documented for planetary longitudes in Phase 4 Step 3. This is *not* a
new discrepancy category; it is the same already-known one recurring for a different astronomical
point.

**vedic-calc** (`core/ephemeris.py::get_ascendant()`, already read in Phase 4 Step 3 and
re-confirmed here): computes the **tropical** Ascendant via `swe.houses_ex(jd, lat, lon, b"W")`,
then applies **manual subtraction** — `(tropical_asc - ayanamsa) % 360.0` — exactly matching its
own documented planetary convention and, not coincidentally, exactly matching this project's own
Step 3 frozen formula.

**This project's existing (unmodified) provider**: `SwissEphemerisProvider.getAscendant()` returns
a **tropical** longitude via `houses_ex2()` (internally, regardless of the `houseSystem` argument
supplied), using the provider's own leap-second-aware `utc_to_jd()` conversion. Applying the
already-frozen Step 3 formula (`getSiderealLongitude(tropical, ayanamsa)`) produces the sidereal
Ascendant with **zero new provider code**.

**Required inputs**: exact UTC instant + latitude + longitude (both required — Ascendant is the
first calculation in this entire Vedic module that is genuinely location-dependent; Rashi/Nakshatra/
Dasha for planets never needed latitude/longitude at all). Timezone/DST handling is entirely the
already-existing Phase 1 Timezone/DST Engine's responsibility — by the time any Ascendant
calculation runs, `utcInstant` is already an exact, unambiguous UTC `Date`; no new timezone-aware
code is needed here.

## 3. House-system analysis — four genuinely distinct conventions found, not one

**Critical finding, directly answering this preflight's explicit warning not to assume "Whole
Sign" covers every convention:** PyJHora's own `_bhaava_madhya_new()`/`bhaava_madhya()` functions
enumerate (and name) **five** distinct Bhava Madhya (house-cusp) methods:

1. "Equal Housing — Lagna in the middle" (its own documented default) — Ascendant sits at the
   *middle* of house 1; degree-based, equal 30° spans.
2. "Equal Housing — Lagna as start" — Ascendant is the *start* of house 1; degree-based, equal 30°
   spans (different from #1 by a 15° offset).
3. "Sripati method" — traditional unequal, proportional (rise-time-based) cusp division.
4. "KP Method (aka Swiss Ephemeris method)" — Placidus-family, time-based, degree cusps.
5. "Each Rasi is the house" — **this is what "Whole Sign" means**: the Ascendant's *entire sign* is
   house 1, no cusp degree involved at all beyond the 0°/30° sign boundaries.

**vedic-calc independently confirms the same A/B split**, via two entirely separate modules:
- `chart/calculator.py::build_houses(ascendant_sign)` — pure sign-index arithmetic
  (`house_sign = (ascendant_sign.value - 1 + i) % 12 + 1`), no degrees at all. This is what
  `calculate_chart()` (its main pipeline) actually uses for `chart.houses`.
- `chart/chalit.py::calculate_chalit_chart()` — a **separate**, optional calculation:
  `bhav_madhya = ascendant_longitude + (N-1)*30°` (Ascendant *degree*, not sign, matching PyJHora's
  method #1 exactly), with ±15° "Bhava Sandhi" cusp boundaries. This is Bhava/Chalit — degree-based
  — and is *not* part of vedic-calc's default `BirthChart`.

**Explicit A/B/C/D distinction, per this preflight's requirement:**
- **A. Rashi / sign-based houses** — not a separate system; this is the *underlying* Rashi/D1 chart
  itself (already built, Step 3), where "house" isn't even a concept yet.
- **B. Whole Sign houses** — PyJHora method 5 ("Each Rasi is the house"), vedic-calc's
  `build_houses()`. Pure Rashi-index arithmetic from the sidereal Ascendant's sign. **This is the
  D2-approved V1 default**, and both oracles treat it as their primary/default house
  representation.
- **C. Bhava/degree-based cusps (Chalit)** — PyJHora methods 1–4, vedic-calc's separate
  `chalit.py`. A genuinely different mathematical object (needs actual cusp *degrees*, arc-contains
  checks per planet, not simple sign counting). Both oracles keep this **separate** from their main
  chart output.
- **D. Other conventions** — KP sub-lord Bhava (method 4) and Sripati (method 3) are two further
  named variants within category C, not yet evaluated in depth since C itself is out of V1 scope.

**Recommendation for V1: implement only B (Whole Sign)**, matching the already-approved D2
decision, matching both oracles' own default/primary representation, and requiring the least new
code (no cusp-arc math, no Swiss Ephemeris house-cusp call at all — see §7). C (Bhava/Chalit) is a
real, legitimate, separately-scoped future feature, explicitly excluded from V1 (§14).

## 4. Oracle empirical verification — 3 independent fixtures

Fixtures: **Hanoi** (1985-03-12 08:30 +7, 21.0285°N 105.8542°E — reused from Phase 4), **Mumbai**
(1990-06-15 12:00 +5.5, 19.076°N 72.878°E — reused from Phase 4), **Sydney** (1978-11-05 14:15
+11, −33.8688°S 151.2093°E — new, Southern Hemisphere, geographically distinct as required).

| Fixture | Tropical Asc. | Ayanamsa (Lahiri) | PyJHora native sidereal | vedic-calc sidereal | This project's sidereal (existing code) | Sign (all 3 agree) |
|---|---|---|---|---|---|---|
| Hanoi | 35.542535° (naive JD) / 35.541212° (leap-sec JD) | 23.650255° (legacy) / 23.646670° (extended, project) | 11.895865° | 11.892280° | 11.894542° | **aries** |
| Mumbai | 164.554327° / 164.554402° | 23.723727° / 23.727292° | 140.827035° | 140.830600° | 140.827109° | **leo** |
| Sydney | 338.089177° / 338.088333° | 23.561575° / 23.560688° | 314.528489° | 314.527602° | 314.527644° | **aquarius** |

**Zero sign-level (house-1) disagreement across all three fixtures and all three independent
computation paths.** This is strong support for the Whole-Sign design, though not a guarantee near
a literal sign boundary (§5).

## 5. Discrepancies quantified and attributed — three distinct sources, not one

**(A) Already-known — ayanamsa-API/nutation delta (Step 3's finding, now confirmed to recur for
Ascendant):** vedic-calc's legacy (no-nutation) ayanamsa vs. this project's extended
(nutation-included) ayanamsa differs by the same ~0.003–0.004° magnitude already documented in
Phase 4. Not new; same root cause, same conclusion (keep the extended API, per Step 3's frozen
decision).

**(B) Already-known — native-`SEFLG_SIDEREAL`-flag vs. manual-subtraction delta:** PyJHora's native
sidereal Ascendant vs. a manual-subtraction Ascendant computed from PyJHora's *own* tropical value
and *own* ayanamsa differs by 12.91″ (Hanoi), 12.84″ (Mumbai), 3.19″ (Sydney) — same magnitude and
mechanism as Step 3's planetary finding, confirmed via direct isolation (holding tropical longitude
and ayanamsa fixed, varying only the sidereal-conversion method). Not new.

**(C) NEW to this preflight — JD-conversion-method delta, Ascendant-specific in practical
significance:** Isolated by direct experiment (holding house-system-function choice constant —
`houses_ex` vs `houses_ex2` were confirmed to produce **bit-identical** results, ruling that
variable out entirely): Swiss Ephemeris's naive `swe_julday()` (used internally by **both**
PyJHora's `utils.julian_day_number()` and vedic-calc's `_to_julian_day()`) differs from this
project's own leap-second-aware `swe_utc_to_jd()` (`SwissEphemerisProvider::toJulianDayUt`) by a
sub-second amount (−0.264s for the Hanoi date). For slow-moving classical planets (Sun ~1°/day,
Moon ~13°/day) this is astronomically negligible — it was already present but invisible inside
Steps 3/4/6's findings. For the **Ascendant**, which moves roughly 0.25°/minute (≈360° in ~23h56m),
the same sub-second time offset becomes a measurable ~3–13″ longitude difference (1.3–4.8″ from
this specific effect alone, isolated from (B) above). **This is a genuine, new, third systematic
difference class, specific to time-sensitive quantities (Ascendant, MC, house cusps) — it does not
apply meaningfully to planets, and must not be conflated with (A) or (B).**

**No fundamental disagreement found.** All three sources are well-understood, small (single-digit
to low-double-digit arcseconds), and already-precedented in kind (A and B repeat Step 3's pattern;
C is new but mechanistically clean and fully isolated, not mysterious). None of this triggers the
"PyJHora and vedic-calc fundamentally disagree" Hard Stop condition — the two oracles disagree with
*each other* by nothing beyond ordinary floating-point noise once their own JD/sidereal methods are
each held internally consistent; the discrepancies above are entirely oracle-vs-project, not
oracle-vs-oracle.

**Recommendation:** keep the project's existing `utc_to_jd()`-based conversion unchanged (it is the
more astronomically correct choice, exactly the same reasoning already applied to keeping the
extended ayanamsa API in Step 3) and document an appropriately small, explicitly-justified
Ascendant/house-cusp oracle-comparison tolerance in the next step's tests (on the order of
0.01°–0.02°, matching the combined magnitude of A+B+C observed here) — not a blanket "close enough"
number.

## 6. Boundary analysis

- **Ascendant exactly at 0°/near a 30° sign boundary:** not present in the three organic fixtures
  above (closest was Sydney at 14.53° into Aquarius). Given the combined worst-case magnitude of
  differences A+B+C (~0.01–0.02°, well under 1 arcminute), **any real Ascendant landing within
  ~0.02° of a sign boundary is at genuine risk of cross-method sign disagreement** — this must be
  covered with a synthetic, crafted fixture (not an organic birth date) in the next step's test
  suite, mirroring exactly how Steps 3/4 tested Rashi/Nakshatra boundaries with fake providers
  rather than hunting for a naturally-occurring boundary case.
- **360° wraparound:** already fully handled by the existing `normalizeDegrees()`/
  `getSiderealLongitude()` — no new logic needed; verified implicitly (Sydney's Ascendant, at
  338–359°, exercises normal wraparound already).
- **High latitude / Arctic Circle / near-pole:** **empirically verified** (Reykjavik 64.15°N,
  Tromsø 69.65°N, 89°N near-pole, Antarctica −75°S) using the existing, unmodified provider:
  `getAscendant()`/`getHouseCusps()` with `"whole_sign"` succeed at **every** latitude tested,
  including 89°N — while `"placidus"` correctly throws `SwissEphemerisHouseSystemUndefinedAtLatitudeError`
  at 69.65°N, 89°N, and −75°S (the already-documented polar-circle guard from Phase 3B-1). **Whole
  Sign has no polar-circle failure mode** — a genuine structural advantage over Western's
  time-based house systems, not something V1 needs to design a fallback for.
- **Equator:** verified working normally (0°N test case, no special-casing needed).
- **Timezone/date-boundary longitude, near-midnight birth, DST transition:** all already fully
  handled by the existing, unmodified Phase 1 Timezone/DST Engine
  (`resolveLocalTimeToUtc`/`resolveBirthDataInstant`) — ambiguous/nonexistent local times already
  hard-stop before any Ascendant code would ever run. No new work needed; Ascendant/Houses consume
  only the already-resolved exact UTC instant, with no timezone awareness of their own (same as
  every other Chart Calculation function in this codebase).
- **Sub-minute birth-time changes:** the Ascendant's fast motion (~0.25°/minute) makes it *more*
  sensitive to sub-minute precision than any planet or even the Moon — full double-precision
  `Date`/JD handling (already the codebase's universal convention) is necessary and sufficient; no
  new precision work required, just discipline in the next step's tests to include an explicit
  sub-minute-precision regression case (mirroring Step 6's equivalent Dasha test).
- **Unknown birth time:** see §7 below (dedicated section, as required).
- **Missing/invalid coordinates:** already fully handled — Phase 1's `validateBirthData` rejects
  out-of-range latitude/longitude before any Ascendant code is reachable (§1).

## 7. Unknown birth time — contract

Preserving the existing, already-approved D6 pattern exactly (never infer time, never default to
noon/midnight, never invent coordinates):

- **Ascendant and Houses require an exact UTC instant AND exact coordinates — full stop.** Unlike
  Rashi/Nakshatra (which remain computable, with documented boundary caveats, using
  `resolveBirthDataInstant`'s midnight-substituted date-only instant when `localTime === null`),
  the Ascendant moves far too fast (~0.25°/minute vs. the Moon's ~0.009°/minute) for a
  midnight-substituted instant to produce anything meaningful — it would not be "less precise," it
  would be **essentially a different, unrelated Ascendant**, with no astrological validity
  whatsoever. **Ascendant/Houses must be treated as fully UNAVAILABLE whenever `localTime === null`
  — there is no degraded/partial mode, unlike Rashi/Nakshatra's "computable with boundary care."**
  This is a stricter contract than Rashi/Nakshatra's, and should be documented as such rather than
  silently inheriting Rashi/Nakshatra's more permissive rule.
- **Coordinates are a second, independent required input** that Rashi/Nakshatra/Dasha never
  needed. A future orchestrator must treat "coordinates present and valid" and "exact time known"
  as two *separate* gates, both required for Ascendant/Houses, matching exactly how
  `buildWesternChart`'s `hasKnownLocalTime` flag already works for the identical Western problem —
  no new pattern needs to be invented, only reused.
- Matches `calculateWesternHousesAndAngles`/`mapWesternPlanetPositions`'s established convention:
  the calculation function itself always requires exact inputs (never a `null` mode); the *caller*
  (a future chart-integration orchestrator) decides whether to invoke it at all.

## 8. Proposed schema (NOT implemented — pending your review)

**Recommendation: (A) — reuse `NormalizedChart` as-is, extended minimally if at all**, in sharp
contrast to Nakshatra (needed a new field) and Dasha (needed a wholly separate structure):

- `NormalizedChart.angles: NormalizedAngle[]` — already exists, already neutral. A future
  `calculateVedicAscendant()`-equivalent would populate exactly one entry,
  `{ type: "ASC", longitude: <sidereal Ascendant> }` (MC/DESC/IC could follow the same pattern
  later, though this preflight's scope is Ascendant + Whole-Sign houses specifically, not MC/angles
  generally — a scope call for the next step to confirm, not decided here).
- `NormalizedChart.houseCusps: NormalizedHouseCusp[]` — already exists. For Whole Sign, each of the
  12 entries is *trivially derivable* (`30° × ((ascendantRashiIndex + i) % 12)`, `houseSystem:
  "whole_sign"`) with **no Swiss Ephemeris house-cusp call needed at all** — see the important
  correction in the next paragraph.
- `NormalizedPlanetPosition.house: HouseNumber | null` — already exists, already used by Western.
  Whole-Sign assignment is pure Rashi-index arithmetic:
  `house = ((planetRashiIndex − ascendantRashiIndex + 12) % 12) + 1` — verified to exactly match
  vedic-calc's own `build_houses()`/`sign_to_house` logic by direct inversion of its formula.
- `NormalizedChart.houses: NormalizedHouse[]` (sign + ruler per house) — **recommend leaving empty
  for V1**, exactly matching Western's own current, already-shipped precedent (`buildWesternChart`
  never populates this either). Sign rulership is a content/lookup-table decision, not geometry,
  and deferred identically for both schools — not a Vedic-specific gap to solve now.

**Important correction to an initial hypothesis, found and self-corrected during this
investigation:** the existing `SwissEphemerisProvider.getHouseCusps(utcInstant, lat, lon,
"whole_sign")` **already returns clean, 30°-aligned cusps** — but they are aligned to the
**tropical** Ascendant's sign, not the sidereal one. Subtracting a constant ayanamsa from each of
those 12 tropical cusps would **not** yield valid sidereal whole-sign cusps (it would shift each
cusp by a non-30°-multiple offset, breaking the whole-sign alignment entirely). **The correct V1
approach is to derive all 12 sidereal cusps purely from the sidereal Ascendant's Rashi index (pure
arithmetic), and to never call `provider.getHouseCusps()` for the Vedic path at all** — only
`provider.getAscendant()` is needed. This is a materially smaller footprint than initially assumed
and is called out explicitly so the next step does not default to reusing `getHouseCusps()`
naively.

**No `NORMALIZED_CHART_SCHEMA_VERSION` bump anticipated** if the above holds — every field involved
already exists in the 2.1.0 schema; V1 Vedic Ascendant/Houses would simply be the *first* Vedic
code to populate already-existing, already-neutral fields that only Western has used until now. If
the next step's actual implementation reveals a real need for a new field (e.g., if `angles`/
`houseCusps`/`houses` turn out to need a Vedic-specific wrinkle not yet foreseen), that would be a
genuine, reportable finding requiring the same "ask before implementing" discipline already
established — not something to decide in this preflight.

## 9. Proposed API (NOT implemented — pending your review)

Mirroring `vedic/rashi.ts::calculateRashi`'s established shape exactly:

```ts
// New file, e.g. src/vedic/ascendant.ts (naming/location a call for the next step)
export interface CalculateVedicAscendantInput {
  provider: AstronomicalProvider;
  utcInstant: Date;   // always required — no null mode, see §7
  latitude: number;   // always required — new second required geometry input vs. Rashi/Nakshatra/Dasha
  longitude: number;
  ayanamsaId?: AyanamsaId; // defaults to "lahiri", matches every existing Vedic function
}

export interface VedicAscendantResult {
  ayanamsaId: AyanamsaId;
  tropicalLongitude: number;
  siderealLongitude: number;
  rashi: ZodiacSign;         // reuses existing signOfLongitude — no new type
  rashiDegree: number;       // reuses existing signDegreeOfLongitude
}

export type CalculateVedicAscendantResult = { ok: true; result: VedicAscendantResult } | { ok: false; errors: AstrologyCoreError[] };

// Whole-Sign house derivation — pure arithmetic, no provider call, matches §8's correction
export function getWholeSignHouseNumber(planetRashiIndex: number, ascendantRashiIndex: number): HouseNumber;
export function getWholeSignHouseCusps(ascendantRashiIndex: number): NormalizedHouseCusp[]; // 12 entries, trivial
```

Calculation responsibilities stay strictly separate from interpretation, matching every prior Vedic
module — no house "meaning" (kendra/trikona/dusthana categorization, as seen in vedic-calc's own
`houses.py`), no rulership judgments, no scoring anywhere in this proposed surface.

## 10. Versioning recommendation

No `NORMALIZED_CHART_SCHEMA_VERSION` bump expected (§8). If the next step's implementation confirms
zero new/changed fields, the version stays at `2.1.0`. This would be the first Vedic Phase 5 step in
this entire engagement that does **not** require a schema version change — worth flagging as a
positive, evidence-based outcome, not an oversight.

## 11. Exact V1 scope

- Sidereal Ascendant (Lagna) longitude, Rashi, and Rashi-degree — same shape/rigor as Step 3's
  Rashi calculation, applied to the Ascendant point instead of a planet.
- Whole-Sign house number for a given planet (pure Rashi-index arithmetic).
- Whole-Sign house cusps (12 trivially-derived values), if the next step's schema decision confirms
  populating `NormalizedChart.houseCusps` is wanted for V1.

## 12. Explicit exclusions

Bhava/Chalit (degree-based cusps, all of PyJHora's methods 1–4 and vedic-calc's `chalit.py`), MC/
Descendant/IC computation (Ascendant only was investigated in depth; MC follows an analogous but
separate pattern via the already-existing `getMidheaven()` — a call for the next step, not decided
here), `NormalizedHouse.ruler` (sign-rulership table, deferred identically to Western), D2–D60,
divisional charts, Antardasha, KP, Shadbala, Ashtakavarga, Yoga/Dosha interpretation, Rule Engine,
Interpretation Engine, AI synthesis, scoring — none of this is touched or designed here.

## 13. Implementation plan for the next step

1. Create `vedic/ascendant.ts` (or a name the next step's task confirms) implementing
   `calculateVedicAscendant()` exactly per §9 — reusing `calculateRashi`'s pattern, not duplicating
   its formula (it may even be implementable as a thin wrapper that calls `provider.getAscendant()`
   then delegates straight into the existing `calculateRashi`-style sidereal+sign logic).
2. Add pure Whole-Sign house arithmetic (§8's corrected approach — no `getHouseCusps()` call).
3. Golden-fixture tests against the same 3 fixtures used here (Hanoi/Mumbai/Sydney), plus a
   synthetic near-boundary Ascendant case (§6).
4. Oracle-comparison tests with the tolerance recommended in §5 (0.01–0.02°), explicitly citing
   which of the three known sources (A/B/C) the tolerance is covering — never a blanket number.
5. Confirm whether populating `NormalizedChart.angles`/`.houseCusps` is in the next step's scope or
   deferred further (a real open question — see §17).

## 14–16. (Vietnamese-first UI language, strict scope, deliverable format — addressed inline above and below)

Proposed Vietnamese terminology for future user-facing surfaces (not implemented, no UI exists
yet): Ascendant/Lagna → **"Cung Mọc"** (already the standard term used for the Western Ascendant in
Vietnamese astrology writing, naturally reused for Vedic since it is the same geometric concept) or
**"Điểm Mọc (Lagna)"** where the Sanskrit term itself needs to stay visible; House → **"Nhà"**
(already the term used throughout this codebase's own Vietnamese comments); Whole Sign → **"Nguyên
Cung"** (whole/entire-sign house) as a working proposal, not a final decision — no Chinese
characters anywhere in this proposal or in any future UI. All internal TypeScript identifiers stay
English per repository convention, matching every prior phase.

## 17. Unresolved decisions requiring your approval before implementation

1. **Scope of "Houses" for V1**: should the next step populate `NormalizedChart.houseCusps`
   (12 trivially-derived Whole-Sign values) and `NormalizedPlanetPosition.house`, or should V1 stop
   at the Ascendant/Rashi/Rashi-degree alone and defer house *assignment* to a later step? Both are
   defensible; this preflight recommends including houseCusps + house assignment since they add
   near-zero implementation cost once the Ascendant is known (pure arithmetic, no new provider
   calls) — but this is a scope call for you to confirm, not something to decide unilaterally.
2. **MC/Descendant/IC**: in scope for the next step, or Ascendant-only for now? `getMidheaven()`
   already exists and would follow an analogous sidereal-conversion pattern, but was not
   empirically investigated in this preflight (Ascendant was the named focus) — recommend treating
   MC as a follow-on, not silently bundling it in without its own oracle verification.
3. **Oracle tolerance for Ascendant/house-cusp comparisons**: this preflight recommends 0.01–0.02°
   (§5), but the exact number should be confirmed once real synthetic boundary fixtures are built
   in the next step, the same way Step 6's tolerance was only finalized after seeing real numbers.
4. **`NormalizedHouse.ruler`**: confirmed deferred (matches Western's own gap) — flagging for
   explicit acknowledgment rather than silently leaving it out.

## Validation

No test/typecheck/build changes were needed or made — zero production code touched. Re-confirmed
before and after this investigation: 473/473 tests, `tsc -p tsconfig.json --noEmit` clean, strict
test-inclusive typecheck clean, build clean, `git status` for `packages/astrology-core/` and
`docs/astrology-module/` empty both before and after (only this new document was added), unrelated
working-tree changes (root `package.json`, `public/*`, `src/lib/*`, `packages/daliuren-engine/`,
etc.) untouched throughout.
