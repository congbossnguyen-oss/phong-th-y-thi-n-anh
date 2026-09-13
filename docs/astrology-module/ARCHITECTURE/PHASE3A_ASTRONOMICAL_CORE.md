# PHASE 3A — Astronomical Core + Swiss Ephemeris Provider

**Update (Phase 3B-1)**: `getHouseCusps()`/`getAscendant()`/`getMidheaven()`, listed below as "not
implemented" (correct as of Phase 3A), are now implemented — see
`PHASE3B1_HOUSES_ANGLES.md`. This document is left as an accurate historical record of Phase 3A's
own scope, not rewritten.

Implements the first real (non-placeholder) `AstronomicalProvider`, per `ADR-001-Ephemeris-Strategy.md`
and the interface frozen in `packages/astrology-core/src/astronomical/AstronomicalProvider.ts`
(Phase 1) and widened in Phase 2.1 (`PHASE2_1_CONTRACT_HARDENING.md`). This document records what
was built, the conventions/decisions made, and what remains deliberately unimplemented.

Target flow achieved by this phase:
```
BirthData → resolveBirthDataInstant() (Phase 1, unchanged) → deterministic UTC instant
          → SwissEphemerisProvider.getPlanetPosition()/getNodePosition() → raw astronomical result
```
Nothing beyond that — no houses, no aspects, no dignity, no interpretation, no Vedic calculation.

## License decision

See `LICENSE_BOUNDARY.md` "Phase 3A interim decision" and `ADR-002-License-Boundary.md` for the
full reasoning. Summary: `sweph@2.10.3-8` (AGPL-3.0-or-later) was selected, justified strictly by
this project's current personal-research/non-commercial/non-distributed scope (per repository
`CLAUDE.md`), matching Swiss Ephemeris's own license text's stated trigger conditions
("distributing software ... or activating any public service"). This does **not** resolve the
license question for any future commercial/distributed/public-service use — that gate remains
open and blocking.

`npm`'s install-script approval gate (`allowScripts`, npm 11+) was explicitly approved for
`sweph@2.10.3-8` only (root `package.json` `"allowScripts": {"sweph@2.10.3-8": true}`) — required
because `sweph` is a native addon whose `node-gyp-build` install step selects the correct
prebuilt binary; without approval the package installs but its native binary is never wired up.

## Swiss Ephemeris binding: `sweph`

- Package: `sweph` (npm), repository `github.com/timotejroiko/sweph`, author Timotej Valentin Rojko.
- Version pinned: `2.10.3-8` (`packages/astrology-core/package.json` dependency `"sweph": "^2.10.3-8"`).
  Corresponds to Swiss Ephemeris core `2.10.03` revision 7/8 (`sweph`'s own versioning convention:
  library version tracks the wrapped Swiss Ephemeris version + its own revision suffix).
- Windows compatibility: confirmed working WITHOUT any native compiler — `sweph`'s npm tarball
  bundles prebuilt N-API binaries (via `prebuildify`) for `win32-x64`, `linux-x64`, `linux-arm64`,
  `darwin-arm64`. `node-gyp-build` selects the matching prebuild automatically; a native build
  (requiring Visual C++ Build Tools) is only needed as a fallback for unsupported platforms.
- Maintenance: actively released (latest tag `2.10.3-8`, 2026-08-24); dependency tree is minimal
  (`node-addon-api`, `node-gyp-build` — both small, no known conflicting license).
- Dependency tree/transitive license risk: none identified — `node-addon-api` (MIT) and
  `node-gyp-build` (MIT) are both permissive; only `sweph` itself carries the AGPL/LGPL choice
  described above.

### Architecture rule enforcement

`SwissEphemerisProvider.ts` is the ONLY file in `astrology-core` that imports `sweph`. All other
code (chart/, validation/, timezone/, and any future Phase 3B+ business logic) depends only on
the `AstronomicalProvider` interface — verified by `grep -r "from \"sweph\"" src/` matching
exactly one file.

## `AstronomicalProvider` implementation status

The frozen interface (Phase 1) was implemented **without any change** — confirming it was
sufficient for Phase 3A's scope, per the scope guard ("STOP if interface must change" — it did
not need to).

| Method | Phase 3A status |
|---|---|
| `getMetadata()` | Implemented — real `sweph.version()`, and a precision probe (see below). |
| `getPlanetPosition()` | Implemented — Sun..Pluto, Chiron, mean_lilith, true_lilith. |
| `getNodePosition()` | Implemented — mean and true lunar node, both poles. |
| `getHouseCusps()` | **Not implemented.** Throws `SwissEphemerisPhase3AScopeError`. Deferred — "houses" is explicitly out of Phase 3A scope per the task brief's WESTERN SCOPE LIMIT, and is not in the CALCULATION SCOPE list. |
| `getAscendant()` | **Not implemented.** Same reason as `getHouseCusps()`. |
| `getMidheaven()` | **Not implemented.** Same reason. |
| `getAyanamsa()` | **Not implemented.** Vedic/ayanamsa is explicitly zero-scope for Phase 3A. |

This is a deliberate, documented design choice within the frozen interface's existing shape — not
an interface change and not a STOP condition. A future Phase 3B (Western houses/angles) or
Phase 4 (Vedic/ayanamsa) will replace these four throwing stubs with real Swiss Ephemeris calls
(`swe_houses_ex`/`swe_houses_ex2` and `swe_get_ayanamsa_ut` — both already available in `sweph`,
just not exercised yet).

## Bodies implemented

Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, mean lunar node, true
lunar node, Chiron, mean Lilith (`SE_MEAN_APOG`), true Lilith (`SE_OSCU_APOG`, i.e. the
**osculating** apogee — this is one of several competing "True Lilith" conventions in astrology
software; documented explicitly in `SwissEphemerisProvider.ts` because it is a real convention
choice, not a universal definition). All 13 satisfy the CALCULATION SCOPE requirement ("at
least" the 10 classical planets + mean node + true node + Chiron); Lilith was added because it
was already a `KnownCelestialBody` since Phase 2.1 and required zero extra calculation logic
(same `calc_ut()` call, different body ID).

Any other `CelestialBody` string (asteroids beyond Chiron, fixed stars, school-specific points)
throws `SwissEphemerisUnsupportedBodyError` — the type remains open (Phase 2.1), but Phase 3A's
actual computable set is this fixed table. Extending it later is a one-line addition to
`KNOWN_BODY_TO_SWISS_EPH_ID`, not an architecture change.

For each body, all fields the interface supports are populated with real (non-fabricated, non-
rounded) values: `longitude`, `latitude`, `distanceAu` (real AU distance — never `null`, since
`sweph` always returns it for these bodies), `speedDegreesPerDay`, `isRetrograde` (derived, never
independently guessed).

## Coordinate conventions

- **Geocentric** (Earth-centered), not heliocentric.
- **Ecliptic longitude/latitude** (not equatorial right ascension/declination).
- **Apparent** position (light-time + gravitational deflection + stellar aberration included) —
  `sweph`'s default when neither `SEFLG_TRUEPOS` nor `SEFLG_NOABERR`/`SEFLG_NOGDEFL` is set (none
  of those flags are used here).
- **Ecliptic/equinox of date** (not J2000) — default when `SEFLG_J2000` is not set (not used here).
- Distance in astronomical units (AU); speed in degrees/day (longitude) as the interface requires.

All of this is documented at the top of `SwissEphemerisProvider.ts` itself, not only here.

## Time conversion

`resolveBirthDataInstant()` (Phase 1, unmodified) produces the canonical UTC `Date`. Conversion
to Julian Day happens via Swiss Ephemeris's OWN `utc_to_jd()` function — never a manually-written
Julian Day formula — specifically so historical delta-T/leap-second handling matches exactly what
the rest of Swiss Ephemeris's internal calculations assume. `utc_to_jd()` returns two Julian Days
(`jd_et` for ephemeris/terrestrial time, `jd_ut` for universal time); `calc_ut()` (not `calc()`)
is used with `jd_ut`, since `calc_ut` internally handles the ET-UT delta itself.

Sub-second precision from the source `Date` (milliseconds) is passed through to `utc_to_jd`'s
fractional-seconds parameter — no additional truncation is introduced at this layer. (The
pre-existing `Date.UTC()` fractional-second truncation documented in `FUTURE_WORK.md` item 10
happens earlier, when `resolveLocalTimeToUtc` first constructs the `Date` from `LocalTime` — by
the time a `Date` reaches this provider, its own millisecond precision is preserved as-is.)

## Julian Day / calendar handling

`CalendarDate` (`types.ts`, Phase 1) is documented as **proleptic Gregorian** across its entire
range. Swiss Ephemeris's `utc_to_jd()` takes an explicit `gregflag` (`SE_GREG_CAL` or
`SE_JUL_CAL`). This provider **always** passes `SE_GREG_CAL`, matching `CalendarDate`'s own
documented semantics exactly — there is no calendar switch at 1582, avoiding two different
calendar interpretations existing between `calendar-core`/`BirthData` and the astronomical layer.

## Ephemeris data

- **Source**: downloaded directly from Astrodienst's own `github.com/aloistr/swisseph` repository
  (`ephe/` folder) — the same entity that publishes the Swiss Ephemeris license, not a third-party
  audited repo.
- **Files** (exactly 3, ~2MB total): `sepl_18.se1` (planets Sun..Pluto + mean/true node, main file),
  `semo_18.se1` (Moon), `seas_18.se1` (main asteroids, including Chiron). The `_18` suffix denotes
  the file's covered range: 1800-2400 (600 years per file, Swiss Ephemeris's own convention) — a
  personal research tool has no realistic need for dates outside this range.
- **Storage**: `packages/astrology-core/ephe/` — committed to the repository (small, ~2MB,
  ensures reproducibility without a network fetch at install/build/test time).
- **Path resolution**: `astronomical/providers/ephemerisPath.ts::resolveDefaultEphemerisPath()`
  computes `<package root>/ephe` from the running module's own file location
  (`import.meta.url`) — works identically whether running from `src/` (via vitest) or compiled
  `dist/` (both are the same directory depth from package root). No developer-specific absolute
  path is ever hardcoded. `SwissEphemerisProviderOptions.ephemerisPath` allows overriding this
  (used by tests to deliberately force the Moshier-fallback path).
- **Missing files**: NOT silently tolerated. See "Precision policy" below —
  `SwissEphemerisPrecisionDegradedError` is thrown rather than returning a lower-precision result
  under the same label as a file-based one.
- **Supported date range**: file-based precision guaranteed for 1800-01-01 through 2400-01-01
  (approximately — exact boundary is the files' own internal range, not independently re-verified
  bit-for-bit here). Outside this range, `SwissEphemerisPrecisionDegradedError` is thrown (see
  below) rather than silently returning Moshier-fallback data.
- **Reproducibility**: given the same `BirthData`, the same `sweph` version, and the same 3 ephemeris
  files (all committed, all pinned), `SwissEphemerisProvider` produces bit-for-bit identical output
  — no hidden randomness, no `Date.now()` in any calculation path (matches the "Engine phải là HÀM
  THUẦN" convention established in Phase 1/2, extended here to the first real calculation code).

## Precision policy

Reuses the tolerances already defined in Phase 1's `precision.ts` (not redefined here):
- `ANGULAR_TOLERANCE_FILE_BASED_DEGREES` (0.0001°) — used for all golden-test comparisons against
  JPL Horizons (a genuinely independent, same-quality oracle). Empirically, observed differences
  between this provider's `file_based` output and JPL Horizons at every golden fixture were
  ~0.00001°-0.00003° (0.05-0.1 arcseconds) — an order of magnitude inside this tolerance, not a
  tolerance loosened to make tests pass.
- `ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES` (0.01°) — used ONLY for the mean lunar node
  cross-check against the Meeus analytic formula, because that comparison is cross-theory (two
  different published secular-series truncations of "mean node"), not a same-theory oracle
  mismatch — a tighter tolerance there would not be meaningful.
- **Per-call enforcement, not just a policy document**: every `getPlanetPosition`/`getNodePosition`
  call compares Swiss Ephemeris's requested calculation flags (`SEFLG_SWIEPH | SEFLG_SPEED`)
  against the flags actually returned. A mismatch (silent fallback to Moshier or another
  ephemeris) throws `SwissEphemerisPrecisionDegradedError` immediately, rather than returning a
  degraded result labeled as if nothing happened — this is the concrete fix for
  `docs/astrology-module/AUDIT/SWISS_EPHEMERIS_AUDIT.md`'s "Critical finding: silent Moshier
  fallback". `getMetadata().precisionClass` additionally performs an independent one-shot probe
  (Sun at J2000.0) for a coarse startup/health-check signal — this does not replace the per-call
  check, since the interface's `getMetadata()` takes no date parameter and therefore cannot report
  per-call precision on its own.
- House-related tolerance: not applicable — no house calculation in Phase 3A.

## Golden fixture provenance

Independent oracle: **NASA JPL Horizons System** (`ssd.jpl.nasa.gov`), queried directly via its
public API — this plays the same role as `VALIDATION_ORACLES.md`'s "mayaastrolib" oracle
(independent-ephemeris cross-check, JPL DE-series), but queries JPL directly rather than through
mayaastrolib's Python/Skyfield wrapper, avoiding any AGPL-licensed third-party code entirely.
Query parameters (recorded in full in
`packages/astrology-core/src/astronomical/providers/__tests__/goldenFixtures.ts`):
`EPHEM_TYPE=OBSERVER`, `CENTER=500@399` (geocentric), `QUANTITIES=31` (apparent ecliptic-of-date
longitude/latitude, matching this provider's own coordinate convention exactly), source ephemeris
DE441. Retrieved 2026-09-13.

Seven required scenarios (Sun + Moon cross-checked in each, full `BirthData → resolveBirthDataInstant
→ SwissEphemerisProvider` pipeline exercised, not just direct UTC `Date` construction):
1. Modern Gregorian date — Asia/Tokyo (UTC+9, no DST).
2. A DST date — America/New_York, July (EDT, UTC-4).
3. A Vietnam example — Asia/Ho_Chi_Minh (UTC+7).
4. A historical timezone-transition date — Asia/Ho_Chi_Minh, 1970, during the historical 1967-1975
   Hanoi/Saigon UTC+8 era (confirmed present in the running Node's own ICU tzdata before use).
5. A UTC birth example (offset 0).
6. A negative UTC offset example — America/New_York, December (EST, UTC-5).
7. A positive non-integer UTC offset example — Asia/Kolkata (UTC+5:30).

Plus one comprehensive cross-check at the J2000.0 epoch (2000-01-01T12:00:00Z) covering all 10
classical planets and Chiron simultaneously against JPL Horizons.

Mean lunar node: cross-checked against Meeus's published mean-node secular formula (*Astronomical
Algorithms*, 2nd ed., ch. 47), since JPL Horizons does not track the mean node as an observable
body. True lunar node: no independent low-effort authoritative oracle was found for this exact
osculating quantity within this phase's scope — validated only via internal consistency (north/south
180° antipodal, and bounded deviation from the mean node, ~1.5-2° physically expected amplitude).
Flagged in `FUTURE_WORK.md` as a validation gap, per `VALIDATION_ORACLES.md`'s own rule that a
missing/weak oracle is recorded, not silently accepted as "good enough."

## Error handling

All Phase 3A error classes live in `astronomical/providers/errors.ts`, distinct from the
input-validation `AstrologyCoreErrorCode` table (a different layer/phase of error):
- `SwissEphemerisUnsupportedBodyError` — body has no Swiss Ephemeris ID mapping.
- `SwissEphemerisCalculationError` — `utc_to_jd`/`calc_ut` returned a hard error (invalid Julian
  day, provider-level native failure). Carries `.nativeError` (the raw Swiss Ephemeris string) for
  debugging, never surfaced in the main `.message` — satisfies "do not leak native library
  internals unnecessarily" while keeping the detail available to whoever needs it.
- `SwissEphemerisPrecisionDegradedError` — silent-fallback detector described above.
- `SwissEphemerisPhase3AScopeError` — house/ascendant/midheaven/ayanamsa, not implemented yet.

Not separately handled because not reachable given upstream validation: "invalid coordinates" —
`getPlanetPosition`/`getNodePosition` never take latitude/longitude (geocentric only); the
methods that would (`getHouseCusps` etc.) are unimplemented in this phase.

## Process-wide native state (documented gotcha)

Swiss Ephemeris's native library holds its ephemeris path as **process-wide** state (`sweph`'s own
README: "process-wide settings... affect the entire process, including all worker_threads"). A
`SwissEphemerisProvider` constructed with a different `ephemerisPath` will silently change the
effective path for every other instance in the same Node process. `SwissEphemerisProvider`'s own
constructor re-asserts its configured path every time it runs, so the safe pattern is: construct
exactly one instance per desired ephemeris configuration (the normal case — one instance for the
whole app's lifetime), or reconstruct immediately before use if genuinely testing multiple
configurations in one process (exactly what this phase's own test suite does, documented inline
there).

## Tests

- `astronomical/providers/__tests__/SwissEphemerisProvider.test.ts` (45 tests): golden fixtures
  (7 scenarios × Sun/Moon + UTC-resolution check, J2000 comprehensive × 10 planets + Chiron,
  Saturn retrograde-at-J2000 sanity check using real historical data — Saturn genuinely was
  retrograde on 2000-01-01, not a fabricated example), node antipodal/theory cross-check, Lilith
  sanity checks, unsupported-body rejection, precision-degradation detection (both "no ephemeris
  files" and "date outside file range" triggers), Phase 3A scope-guard errors for the four
  unimplemented methods, and a project-relative-path sanity check.
- `src/__tests__/publicApi.test.ts`: extended with one test exercising `SwissEphemerisProvider`
  through the package's public `index.ts` surface (not just internal imports).

## Explicitly out of scope (unchanged from task brief)

No Western interpretation, no Vedic interpretation, no houses, no aspects, no dignity, no chart
patterns, no transits, no synastry, no progressions, no solar return, no ayanamsa/nakshatra/
dasha/varga/yoga, no AI, no report generation, no web UI, no API, no changes to `NormalizedChart`
(not touched at all in this phase — Phase 3A stops at the provider layer, one step before
`NormalizedChart` population, which is explicitly a later phase's responsibility).
