# PHASE 3B-1 — Western Houses + Angles

Implements the frozen `AstronomicalProvider.getHouseCusps()`/`getAscendant()`/`getMidheaven()`
(Phase 1 interface, unmodified) for real, and adds a new Western Chart Calculation layer
(`src/western/houses.ts`) that turns raw house cusps/angles into `NormalizedChart`-shaped data.
Target flow achieved:
```
BirthData → resolveBirthDataInstant() (Phase 1) → SwissEphemerisProvider.getHouseCusps/getAscendant/getMidheaven()
          → calculateWesternHousesAndAngles() → { houseSystem, houseCusps, angles }
          → createNormalizedChart() (Phase 2, unmodified)
```
Nothing beyond that — no aspects, no dignity, no interpretation, no planet-in-sign/planet-in-house
assignment, no Vedic calculation.

## House system: Placidus (approved architecture decision)

`DOMAIN_MODEL.md` explicitly left the default Western house system as **"TBD, see ADR/ADR-001"**
— and ADR-001 never actually decides it either (it only covers the ephemeris *backend* choice,
not a house system default). `ROADMAP.md` only says "one house system" without naming it. This
is a real, confirmed gap, not an oversight — per the task's explicit instruction, this was not
silently decided; it was asked and approved before any code was written: **Placidus**, because it
is the most common default assumed by modern Western astrology software.

Consequence of this choice: Placidus (and Koch) are mathematically undefined inside the polar
circles (a well-known limitation, already anticipated in `ARCHITECTURE_FREEZE.md` §5's
`UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE` error code, reserved since Phase 1 but unused until now).
This phase implements and tests that exact error path — see "Edge cases" below.

`WESTERN_DEFAULT_HOUSE_SYSTEM = "placidus"` lives in `src/western/houses.ts` (the Western Chart
Calculation layer), **not** in `AstronomicalProvider` or `SwissEphemerisProvider` — the provider
has no concept of a "default," it always requires an explicit `houseSystem` argument (unchanged
Phase 1 interface). Choosing a default is a Western-school decision (`DOMAIN_MODEL.md §5
AstrologySchool.default_house_system`), which is exactly why it lives in the school-specific
`western/` module, not the school-neutral provider.

## Provider/API used

`AstronomicalProvider.getHouseCusps(utcInstant, latitude, longitude, houseSystem)`,
`.getAscendant(...)`, `.getMidheaven(...)` — the exact Phase 1 interface, confirmed sufficient
before writing any code (per the task's explicit "verify before coding" instruction). No change
was needed or made. Descendant/IC are **not** separate provider methods — per `DOMAIN_MODEL.md`
§4, `Angle { type: "ASC"|"MC"|"DESC"|"IC" }` is one array with 4 entries; DESC/IC are exactly
ASC+180°/MC+180° **by geometric definition** in any quadrant-based house system, computed by plain
arithmetic in `western/houses.ts`, not queried from the provider a second time.

Underlying Swiss Ephemeris call: `houses_ex2(jd_ut, SEFLG_SWIEPH, geolat, geolon, hsysCode)` (the
`sweph` binding already installed in Phase 3A — no new dependency). Chosen over the plainer
`houses()`/`houses_ex()` because it's the only variant returning both a `flag` and a human-readable
`error` string, needed for "do not hide Swiss Ephemeris errors."

## House cusp implementation

`SwissEphemerisProvider.computeHouses()` (private) validates `houseSystem` against a fixed lookup
table (`KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE`) **before** calling Swiss Ephemeris — required
because Swiss Ephemeris does **not** reject an unrecognized house-system letter itself (confirmed
by direct experiment: passing `"Z"` returns `flag=OK` with *some* silently-computed result, not an
error). 12 well-known systems are mapped, confirmed via `sweph.house_name()` (querying the actual
library, not guessing from memory): `placidus`(P), `koch`(K), `equal`(A), `whole_sign`(W),
`porphyry`(O), `campanus`(C), `regiomontanus`(R), `topocentric`(T), `morinus`(M), `alcabitius`(B),
`krusinski`(U), `vehlow_equal`(V). Gauquelin sectors (`"G"`, which returns 36 values, not 12) is
deliberately excluded — incompatible with the interface's fixed 12-element `HouseCusps.cusps`
tuple. The list is extensible (one line per new system), matching `HouseSystemId`'s existing
open-`string` design — no interface change.

`getHouseCusps()` returns exactly 12 cusps (defensively re-checked at runtime), each normalized to
`[0,360)`, tagged with the caller's own `houseSystem` string (not Swiss Ephemeris's internal
letter code).

## Angle implementation

Empirically confirmed (not assumed): in `houses_ex2`'s output, `points[0]` (Ascendant) always
equals `houses[0]` (house-1 cusp), and `points[1]` (Midheaven) always equals `houses[9]`
(house-10 cusp) — the defining property of any quadrant-based house system. `getAscendant()`/
`getMidheaven()` reuse the same `computeHouses()` call and extract those two points; Descendant/IC
are derived arithmetically (`+180°, wrapped`) in `western/houses.ts`.

**Design choice, documented as such**: when Swiss Ephemeris reports the polar-circle fallback
(house system undefined at this latitude), `getAscendant()`/`getMidheaven()` **also** throw —
even though Ascendant/Midheaven are, in principle, latitude-independent of how the *intermediate*
cusps are divided. This was a deliberate, conservative choice for consistency and to avoid
asserting an unverified claim about Swiss Ephemeris's internal fallback behavior beyond what was
directly observed. Flagged in `FUTURE_WORK.md` item 16 for future revisit if a real need arises.

## Coordinate conventions

- **Longitude sign convention: EAST POSITIVE** (matches `BirthData.longitude`, ISO 6709, and every
  existing fixture — Vietnam/Kolkata positive, New York/London/Los Angeles negative). This was not
  assumed — it was **verified empirically**: an independent formula (below) using an explicit
  East-positive convention reproduces Swiss Ephemeris's own Ascendant/Midheaven output within
  ~0.001°-0.005° across all 7 golden scenarios, including scenarios with both positive and
  negative longitude. No silent sign inversion exists between `BirthData` and the Swiss Ephemeris
  call.
- **Latitude sign convention**: North positive, South negative (standard, matches `BirthData`) —
  confirmed via the Southern-hemisphere polar test (`getHouseCusps` at latitude -70° also triggers
  the polar-circle error, exactly as at +70°).
- **Reference frame**: same as Phase 3A's planet positions — geocentric, ecliptic-of-date (not
  J2000), tropical zodiac (implicit — Phase 3B-1 does not touch ayanamsa/sidereal at all).

## Time handling

Identical to Phase 3A: `resolveBirthDataInstant()` (Phase 1, unmodified) produces the UTC instant;
`SwissEphemerisProvider`'s existing `toJulianDayUt()` (unmodified, shared with planet-position
calculation) converts it via Swiss Ephemeris's own `utc_to_jd()`. No second time-conversion path
was introduced. Notably, house/angle calculation does **not** need ephemeris `.se1` files at all
(pure spherical trigonometry from sidereal time + obliquity) — confirmed by testing a date
(2500 AD) outside the 1800-2400 range that Phase 3A's ephemeris files cover: planet-position
calculation correctly refuses this date (`SwissEphemerisPrecisionDegradedError`), but house/angle
calculation succeeds normally, because it never touches the `.se1` files in the first place.

## Edge cases (tested)

| Case | Result |
|---|---|
| Equator (latitude 0) | Computes normally |
| High northern latitude, inside polar circle (70°N–90°N) | `SwissEphemerisHouseSystemUndefinedAtLatitudeError` for Placidus/Koch |
| High southern latitude, inside polar circle (-70° to -90°) | Same error — confirmed symmetric, not a Northern-only bug |
| Exactly at the poles (±90°) | Same error, confirmed as an absolute boundary case |
| Right at the polar circle boundary (66.5°) | Still computes normally (empirically the threshold is just past 66.5°, not hardcoded — Swiss Ephemeris's own internal boundary is authoritative, not re-implemented here) |
| High latitude with Whole Sign/Equal/Porphyry/Campanus/Regiomontanus | Always computes normally — empirically confirmed only Placidus and Koch (the two *time-based/diurnal-arc-trisection* systems) fail inside the polar circle; the other 10 mapped systems remain defined at any latitude, including exactly at the poles |
| Eastern longitude vs. Western longitude (same latitude/time) | Produces distinctly different Ascendant (confirms sign is not silently ignored or collapsed) |
| Midnight vs. one second after midnight | Ascendant changes by a tiny, physically-consistent amount (~0.004°/second), not a discontinuous jump |
| Date outside ephemeris file range (2500 AD) | Computes normally (house calculation doesn't need `.se1` files) — a deliberate, documented contrast with Phase 3A's planet-position behavior for the same date |
| Unrecognized `houseSystem` string | `SwissEphemerisUnsupportedHouseSystemError` — Swiss Ephemeris itself does *not* reject unknown codes (confirmed by direct experiment), so this package validates before calling it |

## Golden fixture provenance

**JPL Horizons (Phase 3A's oracle) does not apply here** — it does not track Ascendant/Midheaven/
house cusps at all (they are observer-dependent geometric constructs, not ephemeris bodies), per
the task's explicit warning. Instead:

**Independent oracle**: standard positional-astronomy formulas — Greenwich Mean Sidereal Time and
mean obliquity of the ecliptic (Meeus, *Astronomical Algorithms* 2nd ed., formulas 12.4 and 22.2),
combined with the standard closed-form Ascendant/Midheaven formulas from Right Ascension of the
Midheaven (RAMC = Local Sidereal Time):
```
MC:  atan2(sin(RAMC), cos(RAMC)·cos(ε))
ASC: atan2(cos(RAMC), -(sin(ε)·tan(φ) + cos(ε)·sin(RAMC)))
```
Implemented independently in `src/western/__tests__/independentAscMc.ts` — imports nothing from
`sweph` or any file under `astronomical/`, uses only `Date`/`Math`. **The exact sign of the
Ascendant formula was not assumed from memory** — it was calibrated by testing multiple documented
sign variants against one known-good Swiss Ephemeris value, then the winning variant was
**independently re-validated** against all 6 other golden scenarios (different hemispheres,
different longitude signs, different RAMC quadrants) before being trusted — a 180°-mirrored
variant was caught and rejected this way, not silently shipped.

This plays the same *role* as Phase 3A's JPL Horizons cross-check (an oracle independent of Swiss
Ephemeris's own internal algorithm), adapted to a quantity JPL doesn't track.

**Tolerance**: 0.01° (`ASC_MC_GOLDEN_TOLERANCE_DEGREES`), matching Phase 1's pre-existing
`ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES`. Not arbitrary: the independent formula uses *mean*
sidereal time/obliquity (no nutation correction) while Swiss Ephemeris returns *apparent* values
(full nutation correction) — a well-understood, consistent theoretical difference, empirically
observed at ~0.001°-0.005° across all 7 scenarios (2-9x inside the chosen tolerance).

**7 required scenarios** (each run through the full `BirthData → resolveBirthDataInstant →
calculateWesternHousesAndAngles` pipeline, not directly-constructed UTC `Date`s):

1. **Modern Vietnam birth** — Ho Chi Minh City, 1985-03-12 08:30 (UTC+7).
2. **DST case** — New York, 2023-07-04 10:00 (EDT, UTC-4).
3. **UTC case** — `timezoneId: "UTC"`, 2005-01-01 00:00, Greenwich coordinates.
4. **Positive non-integer timezone case** — Kolkata, 2001-08-20 12:00 (UTC+5:30).
5. **Western longitude case** — Los Angeles, 1998-04-10 09:15 (PDT, UTC-7).
6. **High-latitude case** — Reykjavik (64.15°N — high, but *not* inside the polar circle where
   Placidus fails; that case is covered separately as a behavioral/error-path test, not a golden
   numeric fixture, since Placidus has no valid numeric answer there), 2000-06-21 14:00 (UTC+0).
7. **Historical birth case** — Ho Chi Minh City, 1970-05-01 10:00, during the confirmed historical
   1967-1975 UTC+8 era (same historical-timezone mechanism validated in Phase 3A).

Full birth data, coordinates, timezone, expected UTC, and expected Ascendant/Midheaven for each
scenario are recorded with citations in
`packages/astrology-core/src/western/__tests__/goldenHouseFixtures.ts`.

**Not independently oracle-verified** (documented limitation, not silently assumed correct):
Placidus's 8 intermediate cusps (2,3,5,6,8,9,11,12) use an iterative time-trisection with no
simple closed form; only structural invariants are checked (monotonic ordering around the circle,
no duplicates, in-range) — see `FUTURE_WORK.md` item 18.

## Precision

Full `double` precision preserved throughout — no display rounding anywhere in
`SwissEphemerisProvider` or `western/houses.ts` (rounding, if ever needed, belongs only at a
presentation boundary, per `DOMAIN_MODEL.md` §8 — none exists yet since no UI/API layer exists).

## Error handling

Provider-level (`astronomical/providers/errors.ts`, thrown by `SwissEphemerisProvider`):
- `SwissEphemerisUnsupportedHouseSystemError` — unrecognized house-system string.
- `SwissEphemerisHouseSystemUndefinedAtLatitudeError` — known system, undefined at this latitude
  (detected by matching Swiss Ephemeris's own `"within polar circle"` error string — not a
  hardcoded 66.5° threshold reimplemented here).
- `SwissEphemerisHouseCalculationError` — any other unexpected native failure.

Top-level (`errors.ts`, `AstrologyCoreErrorCode`, the frozen `ARCHITECTURE_FREEZE.md` §5 taxonomy):
`western/houses.ts::calculateWesternHousesAndAngles()` translates the above into
`UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE`, `UNSUPPORTED_FEATURE`, and `CALCULATION_ERROR`
respectively, returned as `{ ok: false, errors: AstrologyCoreError[] }` (matching Phase 1's
`resolveBirthDataInstant` convention) rather than thrown — any *unrecognized* error type is
re-thrown, never silently swallowed into a generic code. This is the first real use of these 3
error codes, reserved in the frozen taxonomy since Phase 1 but unused until now.

## Limitations / known gaps (see `FUTURE_WORK.md` for full detail)

- `NormalizedChart.houses[]` (sign + ruler) and `planets[].sign/house` are **not** populated —
  out of Phase 3B-1's explicit scope (ruler tables are a separate Western content decision).
- No shared error contract exists across `AstronomicalProvider` implementations; the Chart
  Calculation layer currently couples to `SwissEphemerisProvider`'s specific error classes.
- Only 12 of Swiss Ephemeris's 25 house systems are mapped (easily extensible).
- Intermediate Placidus cusps lack an independent numeric oracle (structural checks only).
- `getAscendant`/`getMidheaven` conservatively fail at polar latitudes even though ASC/MC are, in
  principle, latitude-independent of the house-division method.
