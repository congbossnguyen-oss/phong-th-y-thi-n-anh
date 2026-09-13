# PHASE 3C — Western Aspects Implementation

Implements aspect calculation and integrates it into the existing Western chart pipeline.
Target flow achieved:
```
NormalizedPlanetPosition[] (Phase 3B-2, from buildWesternChart's own planets[])
  → computeWesternAspects() → NormalizedAspectInstance[] → NormalizedChart.aspects[]
```
No interpretation, evidence, scoring, AI, predictive techniques, or Vedic aspects. No pure
mathematical judgment is attached to any result — every field is a geometric fact (angle name,
degree, orb), never "harmonious"/"difficult"/"good"/"bad".

## Aspect types

**Conjunction, opposition, square, trine, sextile** — the 5 major Western aspects. This set is
not invented for this phase: it traces directly to `PHASE1_NOTES/PHASE1_SCOPE.md` ("5 major
aspects (conjunction, opposition, square, trine, sextile) with configurable orbs"), which
`ARCHITECTURE_FREEZE.md` §7 explicitly confirms is "not superseded on substance, only on phase
numbering" when the same content moved from "Phase 1" to "Phase 3" in the later freeze.
`DOMAIN_MODEL.md` §4/§6 and `ROADMAP.md` both restate "5 major aspects" for Phase 3 without
re-listing the names, but nothing in the frozen corpus contradicts or replaces this list. No minor
aspects (semisextile, quincunx, etc.) were added — not authorized by the frozen scope.

## Orb policy — an explicit, approved architecture decision (not a frozen constant)

The frozen architecture never specifies orb *numbers* anywhere — every mention (`DOMAIN_MODEL.md`,
`ROADMAP.md`, `TEST_ARCHITECTURE.md` §Precision) uses "configurable"/"school-specific" language,
and the `AspectRuleSet` type named in `DOMAIN_MODEL.md` §5 is never itself defined with actual
fields anywhere in the corpus. This was flagged and an explicit decision was requested before
writing any code (matching the pattern already established for Phase 3B-1's house-system default).
**Approved**: a fixed per-aspect-type orb table (not Ptolemaic per-planet orbs):

| Aspect | Exact angle | Orb |
|---|---|---|
| Conjunction | 0° | 8° |
| Sextile | 60° | 6° |
| Square | 90° | 7° |
| Trine | 120° | 8° |
| Opposition | 180° | 8° |

This table is `WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY` (`western/aspects.ts`), explicitly
identified as **a configured, versioned Western default for Phase 3C — not a universal astrology
constant**. Its shape (`AspectOrbPolicy { id, description, definitions }`) is deliberately generic:
`id` is a stable string identifier (`"western.major_aspects.modern_default.v1"`) so a *different*
policy (looser/tighter orbs, a different school's table, eventually a Ptolemaic per-planet table)
can be added later as its own named `AspectOrbPolicy` value without touching the matching engine at
all. `computeWesternAspects()` takes the policy as a parameter (defaulting to the Western policy
for convenience) — the aspect-matching algorithm has zero knowledge of any specific degree value;
it only knows how to compare a measured separation against whatever `AspectDefinition[]` it's
given. Verified directly by test: swapping in a different, deliberately narrow test-only policy on
identical input data produces a different (smaller) result set.

Ptolemaic per-planet orbs were explicitly **not** implemented in Phase 3C, per instruction — the
per-aspect-type table above is the only orb model this phase ships.

## Angular separation algorithm

`angularSeparation(longitudeA, longitudeB)` (`western/aspects.ts`) — a pure geometric function with
**no knowledge of aspects or orbs at all** (deliberately separated from the aspect-matching logic,
per the architecture requirement to keep the algorithm independent of configuration). Both inputs
are normalized into `[0,360)` first (handles negative values and values ≥360 without requiring the
caller to pre-normalize); the result is `|a-b|`, or `360-|a-b|` when that exceeds 180° (handling
the 0°/360° wraparound, e.g. 359° and 1° are 2° apart, not 358°). Result is always in `[0,180]` —
exact conjunction is exactly `0`, exact opposition is exactly `180`.

**Independent validation**: `western/__tests__/independentAngularSeparation.ts` implements the same
quantity via a completely different algorithm — the trigonometric identity
`degrees(acos(cos(radians(a-b))))`, which needs no explicit wraparound branch at all (`acos` always
returns `[0,π]`). This is a genuinely different computational approach to the same mathematical
definition, not a restatement of the production algorithm — cross-checked against 9 sample pairs
including the wraparound and boundary cases, agreeing to within floating-point precision (1e-9°).
This satisfies "do not validate the implementation only against itself."

## Aspect matching

`computeWesternAspects(points, orbPolicy)` iterates every unordered pair once (nested loop `i<j`
over the input array), computes `angularSeparation`, and checks it against each
`AspectDefinition` in the policy in declaration order; the first definition whose orb (`|separation
- exactAngle|`) is `<=` its allowed `orbDegrees` produces one `NormalizedAspectInstance`. The orb
boundary is **closed/inclusive** — a separation exactly at the orb edge (e.g. exactly 8.0° from an
exact conjunction) is treated as a valid aspect, not excluded. With the approved orb table above,
no two aspect definitions' orb windows can ever overlap (the smallest gap between adjacent exact
angles is 30°, and no two adjacent orbs sum to more than 15°), so declaration order has no
practical effect on the result for this specific policy — the code still respects order explicitly
so it stays correct if a future, looser policy does have overlapping windows.

Pairs whose separation matches **no** definition simply produce no entry — there is no "no aspect"
placeholder in the output array.

## Pair uniqueness

Guaranteed structurally, not by a separate de-duplication pass: the nested loop always has `j > i`,
so every unordered pair `{A,B}` is visited exactly once (never both `(A,B)` and `(B,A)`), and
`i === j` never occurs (no self-aspects are structurally possible). Verified by test with 4 points
at 90° increments (expects exactly `C(4,2) = 6` results, each pair key unique).

## Deterministic ordering

The output array's order is **exactly the order pairs are generated by the `i<j` nested loop over
the input `points` array's own order** — `planetA` is always `points[i]`, `planetB` is always
`points[j]`, for the first `i` in ascending order, then the next, etc. This means the order is
fully determined by the *caller's* input order (e.g. `WESTERN_CORE_BODIES`'s fixed sequence when
called from `buildWesternChart`) — the function does **not** re-sort output alphabetically or by
any other criterion. Reversing the input array's order correspondingly reverses which pairs appear
first (tested explicitly). For a fixed input array, output is byte-identical across repeated calls
(verified via `JSON.stringify` equality) — no `Date.now()`, no randomness anywhere in this module.

## Integration

`western/chart.ts::buildWesternChart()` now also computes aspects among the already-computed
`planets[]` (mapping each to `{body, longitude}`) and passes the result into
`createNormalizedChart({..., aspects})` — the same, unmodified Phase 2 constructor, which already
accepted an optional `aspects` field. `BuildWesternChartInput` gained one new optional field,
`aspectOrbPolicy` (defaults to `WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY`). No other
`NormalizedChart` field is touched by this phase — `houses[]`/`points[]`/`nodes[]`/`dignities[]`
remain empty, unchanged from Phase 3B-2.

Aspects are computed **only among the planets already present in `planets[]`** (i.e. whatever
`bodies` list `buildWesternChart`/`mapWesternPlanetPositions` was given, normally the 10 classical
planets) — not against angles (ASC/MC/DESC/IC) or nodes. This matches `DOMAIN_MODEL.md` §4's own
field naming (`planet_a`/`planet_b`, typed `CelestialBody`, not a broader "point" type) taken
literally. Extending to angle/node aspects is a real, common feature in other astrology software,
but is a scope extension this phase does not make on its own — see `FUTURE_WORK.md` item 24.

## Applying/separating — not implemented (per instruction, matches the frozen schema)

An early audit-stage document (`AUDIT/ARCHITECTURE_PROPOSAL.md`) sketched a candidate `applying:
bool` field and explicitly listed "applying/separating logic" as out of scope for the initial
Western build ("Phase 2+"). That candidate field was **not** carried into the frozen
`DOMAIN_MODEL.md`/`NormalizedAspectInstance` schema — the actual, current type has no such field.
Per the task's explicit instruction ("if it is NOT defined, DO NOT invent a methodology"), Phase 3C
implements no applying/separating logic and does not add a field for it. See `FUTURE_WORK.md`
item 23 — this is a real, open, future architecture decision (which methodology: relative angular
velocity, like `stellium`'s audited approach; station detection, like `mayaastrolib`'s; or
something else), not something this phase quietly resolved.

## Metadata (what's preserved for later layers)

Every `NormalizedAspectInstance` produced carries: `planetA`, `planetB`, `type` (the geometric
aspect name only — no interpretive label), `exactAngle` (the aspect's ideal angle), `actualAngle`
(the real measured separation, full precision, no rounding), `orb` (the deviation from exact, also
full precision), and `withinOrb` (always `true` for entries actually produced by this phase — see
below). This is exactly the pre-existing, unmodified `NormalizedAspectInstance` shape from Phase 2
— sufficient for a later Evidence/Interpretation layer to know, without recalculating anything,
exactly how tight an aspect is and what it geometrically is. No good/bad/harmonious/difficult/
personality judgment is present anywhere in this data.

`withinOrb` is always `true` for every produced entry, by construction — this module only ever
emits an aspect when the measured orb is within the policy's allowed orb, so there is no
"out-of-orb but still recorded" case in this phase's output. This is a deliberate design choice
(matching how virtually all astrology software's "aspect list" only shows aspects actually in
effect), not an oversight that made the field's `false` branch unreachable by accident.

## Test coverage

- `western/__tests__/aspects.test.ts` (34 tests): exact aspects for all 5 types; orb boundaries
  (just inside / exactly at / just outside, for both a tight orb — sextile 6° — and a wide one —
  conjunction 8°); angular edge cases (0°, 360° normalization, near-0°/near-180°, the 359°/1°
  wraparound pair); pair rules (no self-aspect, no duplicate unordered pairs, exact pair count for
  a known configuration); deterministic ordering (explicit rule test, input-reversal test,
  byte-identical-repeat test); orb-policy independence (swapping policies changes results, proving
  the engine doesn't hardcode any specific table); and the independent trigonometric cross-check.
- `western/__tests__/chart.test.ts`: end-to-end `buildWesternChart` now also asserts the 2
  aspects present in the real 10-planet Hanoi chart match the pre-existing Phase 2 fixture's
  values, that no interpretive fields leak into the object shape, serialize/deserialize round-trip
  including `aspects[]`, determinism including `aspects[]`, and custom-`aspectOrbPolicy`
  integration.
- `src/__tests__/publicApi.test.ts`: extended with `computeWesternAspects`/`angularSeparation`/
  `WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY` through the package's public surface.
- All 273 pre-existing tests continue passing unmodified; total 310/310.

## Independent validation method

Two independent sources, per the task's requirement not to validate only against the
implementation itself:
1. **Trigonometric cross-check** (`independentAngularSeparation.ts`, described above) — a
   different algorithm for the same mathematical quantity.
2. **The pre-existing Phase 2 benchmark fixture** (`chart/__tests__/fixtures.ts::fullWesternChart()`,
   Hanoi 1985-03-12 08:30) — written before this phase, containing real, previously-computed
   aspect data (Sun trine Saturn, orb 6.6865°; Moon conjunction Saturn, orb 1.9024°) using exactly
   the now-approved orb values (8° conjunction, 8° trine). Recomputing from that fixture's own
   planet longitudes reproduces both values exactly (to floating-point precision) and confirms the
   third possible pair in that fixture (Sun-Moon, 111.4111° separation) correctly produces *no*
   aspect (just outside the trine orb by 0.5889°) — matching the fixture's own aspects array, which
   lists only 2 entries for 3 planets.

## Known limitations

- Only the 5 major aspects; no minor/harmonic aspects.
- Fixed per-aspect-type orb only; no per-planet (Ptolemaic) orb table.
- No applying/separating determination.
- Aspects computed only among `planets[]`, not against angles/nodes/points.
- No `CalculationMetadata` field records which `AspectOrbPolicy.id` produced a given chart's
  aspects (`FUTURE_WORK.md` item 25) — not an issue today (only one policy exists), but would
  matter once multiple orb policies coexist in practice.

## Explicit future work

See `FUTURE_WORK.md` items 23-25: applying/separating methodology (needs its own architecture
decision), aspects-to-angles/nodes extension (needs its own scope decision), and an
`AspectOrbPolicy` traceability field in `CalculationMetadata` (needs its own schema-change
decision) — none resolved here, none silently assumed.
