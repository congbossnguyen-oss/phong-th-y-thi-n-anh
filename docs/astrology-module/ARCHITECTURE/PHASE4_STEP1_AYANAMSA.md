# PHASE 4 — STEP 1: `SwissEphemerisProvider.getAyanamsa()`

Implements the one previously-unimplemented method of the Phase 1 `AstronomicalProvider`
interface needed before any Vedic calculation is possible. No interface change — the method
signature (`getAyanamsa(utcInstant: Date, ayanamsaId: AyanamsaId): number`) already existed,
unused, since Phase 1.

## Scope

Returns the raw ayanamsa value (degrees) at a UTC instant for a known ayanamsa identifier. Does
**not** subtract this value from any longitude — that arithmetic belongs to the `vedic/` Rashi
module (Step 3), not the provider. No Rashi, Nakshatra, or Dasha knowledge exists in this file —
the provider remains a pure astronomical-fact boundary, per `DOMAIN_MODEL.md` §3.

## Ayanamsa mapping

4 ayanamsas supported, matching exactly the set the Phase 4 preflight's oracle research confirmed
both vedic-calc (which supports exactly these 4) and PyJHora (which supports all 4 within its
20-mode list) provide:

| `ayanamsaId` | Swiss Ephemeris `sid_mode` | Confirmed via |
|---|---|---|
| `lahiri` | `SE_SIDM_LAHIRI` (1) | `sweph.get_ayanamsa_name(1)` → `"Lahiri"` |
| `raman` | `SE_SIDM_RAMAN` (3) | `sweph.get_ayanamsa_name(3)` → `"Raman"` |
| `kp` | `SE_SIDM_KRISHNAMURTI` (5) | `sweph.get_ayanamsa_name(5)` → `"Krishnamurti"` |
| `true_chitrapaksha` | `SE_SIDM_TRUE_CITRA` (27) | `sweph.get_ayanamsa_name(27)` → `"True Citra"` |

Confirmed by direct execution against the already-installed `sweph` dependency (no new dependency
added) — not guessed from documentation. `AyanamsaId` remains `string` (unchanged, still open);
this table is an implementation detail of `SwissEphemerisProvider`, extensible by adding one line,
matching the same pattern already used for `KNOWN_BODY_TO_SWISS_EPH_ID`/
`KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE`.

Default ayanamsa for the Vedic school (Lahiri) and default house system (Whole Sign) are approved
architecture decisions (D1/D2, this checkpoint) — the provider itself has no concept of a
"default," exactly as `SwissEphemerisProvider` never had a house-system default (that lived in
`western/houses.ts`); the Vedic default will live in the future `vedic/` module, not here.

## Validation before calling native

Same pattern as `KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE`: an unrecognized `ayanamsaId` is rejected
by `SwissEphemerisUnsupportedAyanamsaError` **before** calling native — Swiss Ephemeris's
`set_sid_mode()` takes a raw integer `sid_mode` and does not itself validate/reject an
out-of-range or unexpected value the way this provider's own lookup table does.

## Process-wide state (new interaction, verified)

`set_sid_mode()` is **process-wide global state**, independent of (but the same category of
gotcha as) `set_ephe_path()`. Unlike the ephemeris path (set once per provider construction),
`getAyanamsa()`'s `ayanamsaId` parameter varies **per call**, so `set_sid_mode()` is called fresh
on every `getAyanamsa()` invocation, not just at construction — verified by test that alternating
`lahiri`/`raman`/`lahiri` calls on the same provider instance never returns a stale value from an
intervening call with a different `ayanamsaId`.

## Precision policy — no "silent fallback" check needed (verified empirically, not assumed)

Unlike `getPlanetPosition()` (Phase 3A), `getAyanamsa()` does **not** compare requested vs.
returned calculation flags to detect a silent Moshier-style fallback. Verified directly: computing
Lahiri at J2000.0 with the real ephemeris files present vs. with `ephemerisPath` pointed at a
directory containing no `.se1` files produces the **identical** value and the **same** flag —
ayanamsa is a pure precession/trigonometric calculation that Swiss Ephemeris computes identically
regardless of `.se1` file availability, the same category of finding already established for
house-cusp calculation in Phase 3B-1. A defensive `flag === ERR` check remains (for any genuinely
unexpected native failure), consistent with every other method in this file, but no
`SwissEphemerisPrecisionDegradedError`-style check applies here.

## What this step deliberately does NOT do

- No Rashi/sign derivation from a sidereal longitude (Step 3).
- No Nakshatra/Pada (Step 4).
- No Dasha (Steps 5-6).
- No oracle (PyJHora/vedic-calc) cross-validation of the ayanamsa *values themselves* — that
  validation is meaningful once Step 3 produces actual sidereal longitudes to compare against both
  oracles' D1 output, not for a bare ayanamsa degree figure in isolation. This step's own tests are
  internal-consistency checks only (plausible range, mode-differentiation, monotonic precession
  increase over time, process-wide-state safety, determinism) — deliberately not claimed as
  oracle-level golden validation.

## Tests

`astronomical/providers/__tests__/SwissEphemerisProvider.ayanamsa.test.ts` (9 tests): basic shape
and plausible-range check for Lahiri, mode-differentiation (Raman/KP/True Chitrapaksha differ from
Lahiri), full double precision preserved (not rounded), precession-direction sanity check (a later
date has a larger ayanamsa than an earlier one, by a plausible ~1°/70-years magnitude), alternating
multi-mode process-wide-state safety, unsupported-ayanamsa rejection, determinism, and the
no-ephemeris-file-dependency finding.

`SwissEphemerisProvider.test.ts`'s prior placeholder test (asserting `getAyanamsa` threw a
now-removed `SwissEphemerisPhase3AScopeError`) was removed, since the method is real now — not
replaced in place, since the dedicated ayanamsa test file above supersedes it entirely, matching
the precedent set when Phase 3B-1 created a dedicated `SwissEphemerisProvider.houses.test.ts`
rather than growing the original file. `SwissEphemerisPhase3AScopeError` itself was deleted (not
just unused-but-kept) since implementing `getAyanamsa` left it with zero remaining callers.
