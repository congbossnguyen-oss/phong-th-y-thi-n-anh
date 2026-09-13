# VALIDATION ORACLES — Strategy Specification

## Binding rule (restated, non-negotiable)

**Oracles are used to validate correctness during development and CI. They are never a production runtime dependency, never imported into the shipped module, and never vendored/forked.** See `ADR/ADR-009-Validation-Oracle-Strategy.md`.

## Oracle roster (from the audit, with justification)

| Oracle | Use for | Why (audit citation) |
|---|---|---|
| **Swiss Ephemeris (direct, via `pysweph`)** | Ground-truth astronomical positions/houses/angles | The astronomical-core candidate itself — used here as its own correctness reference when run with real `.se1` data files vs. Moshier fallback (`../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md`) |
| **stellium** | Western tropical calculation cross-check (planets, houses, aspects, dignities, sect, profections) | Broadest, best-tested Western engine audited; agreed with other Swiss-Ephemeris-backed engines to 4 decimals on the benchmark chart (`../ASTROLOGY_REPO_AUDIT/BENCHMARK.md`) |
| **mayaastrolib** | Independent-ephemeris cross-check (Skyfield/JPL DE440s golden tests) | The only audited repo validating against a **non**-Swiss-Ephemeris source — useful to catch a hypothetical systemic Swiss-Ephemeris-wrapping bug that a Swiss-Ephemeris-only cross-check would miss (`../ASTROLOGY_REPO_AUDIT/TEST_AUDIT.md`) |
| **PyJHora** | Vedic calculation cross-check (vargas, dashas, nakshatra, yoga/dosha conditions) | Richest, most textbook-golden-value-tested Vedic engine audited (3,104 tests observed passing live) — `../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md` |
| **vedic-calc** | Vedic cross-check, especially KP (most complete independently-verified KP engine found) | Disclosed 99% cross-validation against 2 commercial astrology APIs, with failures itemized not hidden — the strongest *methodology* to imitate, not just a data source (`../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`) |
| **openastrology-library** | Secondary Western/Vedic cross-check | 526-test golden-value suite; useful as a third data point but has a confirmed house-lord-mapping bug in its yoga engine — do not trust blindly, cross-check against 2+ other oracles before treating a disagreement as "our bug" (`../ASTROLOGY_REPO_AUDIT/raw/openastrology-library.md`) |

**Phase 3 (Western) resolution status**: this roster's Western row (stellium) was not actually run
as an oracle during Phase 3A/3B-1/3B-2/3C — layer-appropriate substitutes were used instead (JPL
Horizons for planets, an independent mathematical formula for houses/angles, an independent
algorithm plus a pre-existing fixture for aspects) and formally accepted as satisfying the
validation *intent* for Phase 3, per the post-Phase-3C audit. Full reasoning:
`ADR/ADR-009-Validation-Oracle-Strategy.md` "Amendment: Phase 3 oracle substitution". This row and
the roster above are left unchanged as the historical specification — stellium remains a valid
future comparative oracle, not retracted.

## How oracles are actually used (process, not a dependency)

1. Run each oracle **out-of-process**, in its own isolated environment (own venv/container), never imported into the module's own dependency tree.
2. Generate golden fixture files (`{input, expected_by_oracle, oracle_id, oracle_version}`) checked into the test suite as static data.
3. `TEST_ARCHITECTURE.md`'s golden tests compare the module's own calculation against these static fixtures, at the tolerance defined in `TEST_ARCHITECTURE.md` §Precision.
4. When two or more oracles disagree with each other by more than tolerance, this is a `VALIDATION GAP` to flag and investigate, not something to silently average or pick-a-winner on.

## Test matrix (input scenarios each oracle-backed golden test suite must cover)

| Category | Cases |
|---|---|
| **Normal** | Daytime birth; nighttime birth |
| **Timezone** | UTC; UTC+7 (Vietnam); a negative-offset zone (e.g. UTC-5) |
| **DST** | Just before a DST transition; during the ambiguous/nonexistent transition window itself; just after |
| **Historical timezone** | A date predating a country's current timezone/DST rules (tests the Timezone/DST engine's historical-rule resolution, not the astronomical core) |
| **Boundary** | Sign boundary (0°/30° crossing — stellium's own audit-documented historical bug here, `../ASTROLOGY_REPO_AUDIT/TEST_AUDIT.md`); house-cusp boundary; retrograde station (velocity crossing zero); midnight birth; leap-day birth (Feb 29) |
| **Geography** | Northern high latitude; southern hemisphere; equator; extreme/polar latitude (must assert `UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE` per `ARCHITECTURE_FREEZE.md` §5, not a silently-wrong cusp) |

None of the 10 audited repos has a test suite covering all of these categories together (`../ASTROLOGY_REPO_AUDIT/TEST_AUDIT.md` "Boundary/edge-case category coverage" — DST/historical-timezone/polar-latitude tests were found in **zero** audited repos). This matrix is therefore new work, not adapted from any oracle's existing suite, and should be treated as `VALIDATION GAP` (unproven) until Phase 1–3 testing actually exercises it.

**Status as of the post-Phase-3C audit**: most of this matrix is now exercised (Normal, Timezone, Historical timezone, sign/house-cusp boundary, midnight, and the full Geography row are all covered by Phase 3A/3B-1/3B-2/3C tests). **Retrograde station (velocity crossing zero) and leap-day birth (Feb 29) remain untested** — this is a separate, still-open `VALIDATION GAP`, distinct from and not resolved by the stellium-substitution decision above (that decision addresses *which oracle* was used; this gap is about *which scenarios* were exercised at all).

## Explicit non-goal

This document does not select a "winning" oracle to copy code from. Every oracle in this roster remains reference-only per `ARCHITECTURE_FREEZE.md` §4.6 and `../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md` (all are AGPL or otherwise not clear for direct commercial reuse).
