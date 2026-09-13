# PHASE 3B-2 — Western Chart Mapping: Sign + House Assignment

Transforms raw astronomical longitudes (Phase 3A) and Placidus house cusps (Phase 3B-1) into
canonical Western chart coordinates: `longitude → zodiac sign + degree`, `planet → house`. Target
flow achieved:
```
PlanetPosition[] (Phase 3A) ─┐
                              ├─→ mapWesternPlanetPositions() → NormalizedPlanetPosition[] (sign/signDegree/house filled)
houseCusps (Phase 3B-1) ─────┘

buildWesternChart(): BirthData → resolveBirthDataInstant → calculateWesternHousesAndAngles
                    → mapWesternPlanetPositions → createNormalizedChart → NormalizedChart
```
This is the first phase that makes `NormalizedChart` genuinely useful as a Western natal-chart
data structure — a caller can now get planets placed in real signs and houses, not just raw
ephemeris facts. No aspects, dignity, interpretation, or Vedic content — unchanged from prior
phases' scope guards.

## 1. Longitude → ZodiacSign

`western/zodiac.ts::signOfLongitude()`. Pure mathematics, not an astrological judgment call: sign
index = `floor(normalizedLongitude / 30)`, where `normalizedLongitude` is the input wrapped into
`[0,360)` first (handles negative input and values ≥360 without requiring the caller to
pre-normalize). This is a universal convention shared by tropical (Phase 3B-2's own scope) and
sidereal (Vedic, Phase 4+) zodiacs alike — the only difference for sidereal is that the longitude
must have ayanamsa subtracted *before* reaching this function, which is explicitly out of this
function's — and this phase's — responsibility.

Boundary convention, tested explicitly: lower bound closed, upper bound open — longitude exactly
`30.0` is Taurus, not Aries; longitude `29.999999...` is still Aries. `360` normalizes to `0`
(Aries). Verified against two independently-correct values from the pre-existing Phase 2 benchmark
fixture (`chart/__tests__/fixtures.ts::fullWesternChart()`, Hanoi 1985-03-12 08:30) — Sun
(351.4222° → Pisces) and Moon (240.0111° → Sagittarius) — not fabricated data.

## 2. Longitude → degree/minute/second — contract does NOT support it, added as a display utility only

Checked before implementing (per the task's explicit "if the existing contract supports it"
condition): `NormalizedPlanetPosition`, `NormalizedAngle`, and `NormalizedHouseCusp` store only
decimal-degree `longitude`/`signDegree` fields — **no DMS field exists anywhere in the frozen
schema**. `precision.ts::toDegreesMinutesSeconds()` was added as a standalone display utility
(same category as the pre-existing `roundForDisplay()`) — it is **not** wired into any
`NormalizedChart` field, and none was added. This is a deliberate scope decision (`FUTURE_WORK.md`
item 21), not an oversight.

## 3. Planet → Sign assignment

`western/planets.ts::mapWesternPlanetPositions()`. For each requested `CelestialBody`, calls
`provider.getPlanetPosition()` (Phase 3A, unmodified) and fills `sign`/`signDegree` via the
functions from item 1, while copying `longitude`/`latitude`/`distanceAu`/`speedDegreesPerDay`/
`isRetrograde` through unchanged (no recalculation, no rounding). `WESTERN_CORE_BODIES` (the 10
classical planets, matching `DOMAIN_MODEL.md` §6's frozen `western.core` scope) is exposed as a
convenience default — callers must still pass `bodies` explicitly (not hardcoded inside the
function), per the "make the calculation method explicit" principle already established in Phase
3B-1.

## 4. Planet → House assignment

`western/housePlacement.ts::assignHouseNumber()`. Uses the standard, most common Western-software
method: a longitude belongs to house *N* if it falls in the half-open arc `[cusp[N], cusp[N+1])`
going in the direction of increasing longitude (wrapping through 360°/0° as needed). **Not** Swiss
Ephemeris's `house_pos()` (which additionally accounts for a point's ecliptic latitude/declination
for a "visually accurate" placement) — deliberately, since the task's scope explicitly frames this
as a mapping from "longitude + house cusps" only, and adding the extra ARMC/obliquity/declination
plumbing `house_pos()` needs would be an unrequested dependency. Documented as a real limitation
in `FUTURE_WORK.md` item 19 (matters mainly for planets with several degrees of ecliptic latitude,
e.g. Pluto).

Verified against the **same pre-existing Phase 2 fixture**, cross-checking all 3 of its planet
entries (Sun → house 11, Moon → house 7, Saturn → house 7) against its own real Placidus house
cusps — all 3 reproduce exactly. (Saturn's *sign* label in that same fixture was separately found
to be a pre-existing data-entry error — see "Data quality finding" below — but its *house* value
is correct and independently confirms this function's boundary logic.)

## 5-8. ASC/DESC/MC/IC → Sign

**Not stored as new fields** — `DOMAIN_MODEL.md` §4's `Angle { type, longitude }` has no `sign`
field, matching the same "derived, not independently stored" principle already documented for
`PlanetPosition.sign`. Adding a `sign` field to `NormalizedAngle` would be an undisclosed contract
change, which this phase does not make. Instead, the exact same `signOfLongitude()` used for
planets is applied to each angle's already-computed `longitude` — tested explicitly for all 4
angles in `western/__tests__/chart.test.ts`, confirming (as a geometric invariant, not a
hardcoded expectation) that Descendant's sign is always exactly opposite Ascendant's, and IC's is
always exactly opposite MC's (both angle pairs are 180° apart by construction, from Phase 3B-1).
See `FUTURE_WORK.md` item 20.

## 9. House metadata population — where actually supported

`NormalizedChart.houses[]` (`{ number, sign, ruler }`) is **not** populated in this phase.
`number` and `sign` are pure geometry (trivial to derive from a house's own cusp longitude), but
`ruler` requires a classical-vs-modern rulership table — a genuine Western-content decision with
real disagreement in the community (e.g. does Pluto or Mars rule Scorpio?), structurally identical
to the house-system-default decision that required explicit approval in Phase 3B-1. This gap was
already flagged in `FUTURE_WORK.md` item 14 (written during Phase 3B-1, before this phase started)
— not populating `houses[]` here is consistent with, not a new decision on top of, that existing
flag. `points[]`/`nodes[]`/`aspects[]`/`dignities[]` remain empty for the same "not this phase's
scope" reason as every prior phase.

## 10. Deterministic chart mapping

Every function introduced this phase (`signOfLongitude`, `signDegreeOfLongitude`,
`assignHouseNumber`, `mapWesternPlanetPositions`, `buildWesternChart`) is a pure function — no
`Date.now()`, no randomness, in any calculation path. The one accepted exception, inherited
unchanged from Phase 2's `createNormalizedChart()`, is `CalculationMetadata.calculationId`/
`.calculatedAt` defaulting to a fresh UUID/timestamp when not explicitly supplied — provenance
metadata about *when the calculation ran*, not astrological data, and excluded from every
reproducibility test's equality check (same convention as every prior phase).

## 11. Boundary handling

- **Sign boundaries**: tested at every exact multiple of 30° (all 12 sign starts), the value just
  below each boundary, and wraparound at 360°/negative input.
- **House cusp boundaries**: tested at a cusp longitude exactly (belongs to the house that
  *starts* there, not the one ending there), a tiny amount before/after a cusp, and the arc that
  wraps through 360°/0° (house 12 in the benchmark fixture).
- Both use half-open intervals (`[start, end)`) consistently — the same convention in both
  `signOfLongitude` and `assignHouseNumber`, not two different rules for two similar problems.

## 12. Tests

- `western/__tests__/zodiac.test.ts` — sign boundaries, wraparound, cross-check against the
  pre-existing Phase 2 fixture, and the Saturn data-quality finding (asserted as the *correct*
  value, not the fixture's wrong one).
- `western/__tests__/housePlacement.test.ts` — cross-check against the same fixture's real house
  cusps (all 3 planets), boundary tests, cusp-order independence, invalid-input guard,
  determinism.
- `western/__tests__/planets.test.ts` — full pipeline with a real `SwissEphemerisProvider`,
  raw-field pass-through verification, unknown-time (`houseCusps: []` → `house: null` for every
  planet), precision-class mapping, unsupported-body error translation, determinism.
- `western/__tests__/chart.test.ts` — end-to-end `buildWesternChart`: validates clean, correct
  counts, ASC/MC/DESC/IC sign-opposition invariant, serialize/deserialize round-trip, unknown-time
  chart, polar-latitude error propagation through the whole pipeline, determinism.
- `src/__tests__/precision.test.ts` — the two new `precision.ts` additions.
- `src/__tests__/publicApi.test.ts` — extended with one `buildWesternChart` test through the
  package's public surface.

## Data quality finding (reported separately, fixed in a follow-up commit)

While cross-validating `signOfLongitude()` against the pre-existing Phase 2 benchmark fixture,
Saturn's `sign: "sagittarius"` was found to be inconsistent with its own `longitude: 238.1087`/
`signDegree: 28.1087` in the same fixture entry (both values imply Scorpio, 210°-240°, not
Sagittarius, 240°-270°) — a data-entry error from Phase 2, unrelated to this phase's own work. Not
fixed inside this phase's own commit (not this phase's file to modify at the time); reported via a
separate spawned task and corrected in a dedicated follow-up commit (`fix(astrology): correct
Saturn fixture sign`) that also added a standing regression assertion
(`western/__tests__/zodiac.test.ts`: every planet in `fullWesternChart()` must have `sign` matching
`signOfLongitude(longitude)`) so this class of error is caught automatically going forward.

## Explicitly out of scope (unchanged from task brief)

No aspects, dignity calculations/interpretation, chart interpretation, factors, rules, evidence,
scoring, AI, Vedic astrology, sidereal zodiac, ayanamsa, transits, synastry, progressions, or
predictive astrology. `NormalizedChart.houses[]`/`points[]`/`nodes[]`/`aspects[]`/`dignities[]`
remain empty, same as every prior phase.
