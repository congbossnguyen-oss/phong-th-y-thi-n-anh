# V1.1 Batch 1 — Vedic Divisional Charts (Varga) Implementation: D2 + D3 + D4

**Status: implementation complete, NOT committed.** Checkpoint preserved: HEAD
`95c171e3ec7e042b17306572a0c15c4acdcea63f` (Phase 5, closed). Builds on
[`V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`](V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md) (status: RESOLUTION
COMPLETE — D2/D3/D4 method-resolved, D30 boundary-resolved and reference-only in this batch, D60
deferred). This document does not rewrite that preflight's history — it records what was actually
built against the already-frozen contracts.

## Scope

**In this batch:** D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa) — sign-placement calculation only.
**Explicitly not in this batch:** D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45 (contract
already resolved in the preflight, implementation deferred to later batches), D60 (contract itself
still deferred). No Rule Engine, no interpretation/yoga/prediction logic, no house-lord logic, no
full nested mini-chart, no UI, no API server, no schema migration — none of these were touched or
started.

## Architecture

### Generic primitive

`countSignsForward(fromSign: ZodiacSign, offset: number): ZodiacSign` — counts forward `offset`
signs from `fromSign`, wrapping mod 12. This is the one piece of arithmetic shared by every Varga
whose rule has the shape "which part of the sign the degree falls in → count forward N signs from
some starting sign" — used here by D3 and D4, and intentionally left in a shape that D7, D9, D10,
D12, D16, D20, D24, D27, D40, D45 (all confirmed in the preflight to share this exact shape) can
reuse without modification in later batches. D2 does **not** use this primitive — its rule is a
fixed two-value (Leo/Cancer) lookup, not a sign-counting operation, so forcing it through
`countSignsForward` would have been artificial.

No generic "element/modality classification" table (e.g. `_ELEMENT_STARTS`/`_MODALITY_STARTS`,
needed by D9/D16/D20/D24/D27/D40/D45) was built in this batch — none of D2/D3/D4 needs it, and
building it now would be exactly the kind of "abstraction for a future that isn't needed yet"
Section 7 of the task explicitly forbade.

### Chart-specific rules

Three small, independent functions, each documented with its own formula/source citation:
`getD2HoraSign`, `getD3DrekkanaSign`, `getD4ChaturthamsaSign` — plus a dispatcher
`getDivisionalSign(varga, sign, signDegree)` keyed by the closed `VargaId = 2 | 3 | 4` union.
`VargaId` is intentionally not widened to `number` or to all 15 planned vargas — TypeScript itself
rejects an out-of-batch call at compile time, and widening it is a one-line change for whichever
batch implements the next varga.

### Public API

All in `packages/astrology-core/src/vedic/divisional.ts`, re-exported from `index.ts` under a new
"V1.1 Batch 1" section (mirroring the existing per-phase export-grouping convention). Every
function is pure (no `AstronomicalProvider`, no `Date`, no I/O) — same shape as
`vedic/houses.ts::getWholeSignHouseNumber`. Nothing here touches `NormalizedChart`, `chart/types.ts`,
or `vedic/chart.ts` — the API is a standalone calculation surface consumed by future integration
work, not integrated itself (CF.4/CF.10, both unchanged by this batch).

```ts
export type VargaId = 2 | 3 | 4;
export function countSignsForward(fromSign: ZodiacSign, offset: number): ZodiacSign;
export function getD2HoraSign(sign: ZodiacSign, signDegree: number): ZodiacSign;
export function getD3DrekkanaSign(sign: ZodiacSign, signDegree: number): ZodiacSign;
export function getD4ChaturthamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign;
export function getDivisionalSign(varga: VargaId, sign: ZodiacSign, signDegree: number): ZodiacSign;
```

**Precondition (documented in the file, not enforced by a runtime guard):** `signDegree` must be in
`[0, 30)` — the same invariant `precision.ts::signDegreeOfLongitude()` already guarantees for every
existing caller (`RashiResult.rashiDegree`, `VedicAscendantResult.rashiDegree`). No new validation
layer was added; this follows the same "trust the established invariant" convention already used by
`getWholeSignHouseNumber`/`getNakshatraLord`.

## D2 Formula (Hora)

**Selected contract (frozen in the preflight's "D2 METHOD RESOLUTION"):** the two-sign
Leo/Cancer rule — PyJHora's `chart_method=2` ("Traditional Parasara, Only Le & Cn"), bit-for-bit
identical to vedic-calc's sole D2 implementation.

- Odd sign: `[0°,15°)` → Leo, `[15°,30°)` → Cancer.
- Even sign: `[0°,15°)` → Cancer, `[15°,30°)` → Leo.
- Boundary: 15.0° exactly belongs to the **second** half (open-upper), consistent with the
  project-wide `signOfLongitude`-style convention.
- **Not** implemented: PyJHora's own *default* `chart_method=1` ("Uma Shambu"/"PVR") — deliberately
  excluded per the frozen method resolution; it spreads Hora placements across all 12 signs and is
  not the contract this project adopted.

## D3 Formula (Drekkana)

**Contract:** matches PyJHora's default `chart_method` (`_drekkana_chart_parasara`) and vedic-calc's
`_d3_drekkana` exactly (confirmed both by static source comparison in the preflight's Appendix A
and by re-running both oracles live in this implementation task — see Oracle Validation below).

- `part = floor(signDegree / 10)`, three parts per sign (0-10°, 10-20°, 20-30°).
- Offset per part: `[0, 4, 8]` — same sign, 5th sign, 9th sign (the trine/same-element triad).
- Boundary: 10.0° and 20.0° belong to the **next** part (open-upper), consistent with D30's
  already-frozen boundary resolution and the rest of the codebase's floor-division convention.

## D4 Formula (Chaturthamsa)

**Contract:** matches PyJHora's default `chart_method` (`_chaturthamsa_parasara`) and vedic-calc's
generic-engine D4 branch exactly (same dual confirmation as D3).

- `part = floor(signDegree / 7.5)`, four parts per sign (0-7.5°, 7.5-15°, 15-22.5°, 22.5-30°).
- Offset: `part × 3` signs forward from the D1 sign — no odd/even distinction (unlike D2/D7/D10).
- Boundary: 7.5°, 15.0°, 22.5° each belong to the **next** part (open-upper), same convention.

## Boundary Policy

No intermediate rounding anywhere in `divisional.ts` — every function operates on the `signDegree`
double as received. All three vargas' internal boundaries (D2: one at 15°; D3: two at 10°/20°; D4:
three at 7.5°/15°/22.5°) use the closed-lower/open-upper convention frozen for D30 and already
established project-wide by `precision.ts::signOfLongitude`. No epsilon/tolerance is used anywhere
in the boundary classification — every comparison is an exact `<`/floor-division check against the
literal mathematical boundary value.

## Precision Policy

No rounding, no truncation beyond the documented `Math.floor` part-index computation (itself not a
precision loss — it is the intentional "which part of the sign" classification, the same category
of operation as `getNakshatraIndex`/`signOfLongitude`). `Math.min(2, …)`/`Math.min(3, …)` defensive
clamps exist only to satisfy `noUncheckedIndexedAccess` for a theoretical edge case
(`signDegree` arriving at exactly 30 despite the documented precondition) — mathematically
unreachable given the precondition, same defensive style as `getNakshatraIndex`'s `Math.min(26, …)`.

## Oracle Validation

Both PyJHora (local clone, `C:\ccaudit\repos\PyJHora`) and vedic-calc (local venv,
`vedic_oracle_venv\vedic-calc`) were **executed live** in this implementation task (not just
re-read as static source, going beyond the preflight's own stated limits in Appendix A.8) —
`charts.hora_chart(pp, chart_method=2)`, `charts.drekkana_chart(pp)` (default), and
`charts.chaturthamsa_chart(pp)` (default) against vedic-calc's `_get_divisional_sign(sign, degree,
division)` for:

- 17 synthetic boundary/representative degree cases per varga (sign-parity pairs, exact half/part
  boundaries, immediately-below/above each boundary, near-360° values).
- The full 7-planet benchmark chart already used in the Phase 5 preflight/audit (Hanoi,
  1985-03-12 08:30 local, Lahiri sidereal longitudes: Sun 27.7812° Aquarius, Moon 6.3647° Scorpio,
  Mars 4.0685° Aries, Mercury 14.7802° Pisces, Jupiter 13.6031° Capricorn, Venus 28.5919° Pisces,
  Saturn 4.4617° Scorpio).

**Result: 100% agreement between both oracles on every one of the 24 cases × 3 vargas (72 checks
total)** — zero discrepancies found. The TypeScript implementation's own test suite
(`divisional.test.ts`) encodes these same oracle-verified values as regression fixtures (see Tests
below), so the oracle comparison is captured permanently, not just a one-off script output.

No discrepancy required tracing/resolution in this batch — the D2 method-selection and D30
boundary-convention questions that *were* genuine divergences were already resolved in the
preflight before this implementation began; no new divergence was found for D2/D3/D4 specifically.

## Tests

New file: `packages/astrology-core/src/vedic/__tests__/divisional.test.ts` — **30 tests**, all
passing:
- `countSignsForward`: identity offset, non-wrapping count, wraparound at the 12→1 boundary,
  determinism.
- `getD2HoraSign`: odd-sign lower/upper half, even-sign lower/upper half, exact 15° boundary
  (both parities), sign-identity independence (parity-only dependence) across all 12 signs,
  categorical-output invariant, 7-case oracle-verified benchmark.
- `getD3DrekkanaSign`: each of the 3 segments, exact 10°/20° boundaries, 12→1 wraparound,
  7-case oracle-verified benchmark, determinism.
- `getD4ChaturthamsaSign`: each of the 4 segments, exact 7.5°/15°/22.5° boundaries, odd/even
  sign-independence, 12→1 wraparound, 7-case oracle-verified benchmark, determinism.
- `getDivisionalSign`: dispatch-correctness against each dedicated function for varga 2/3/4,
  categorical-output invariant across all 12 signs × 3 vargas × 7 degree probes.

### Regression

Full existing suite re-run unchanged alongside the new tests — **529/529 passing** (499 pre-existing
+ 30 new, zero regressions). Phase 4 regression suites (`rashi.test.ts` 19, `nakshatra.test.ts` 51,
`vimshottari.test.ts` 53, `chart.test.ts` 19, `publicApi.test.ts` 12) and Phase 5 regression suites
(`ascendant.test.ts` 20, `houses.test.ts` 6) all pass unchanged — confirming Phase 4/Phase 5
behavior was not touched.

## Validation Gate

- `tsc -p tsconfig.json --noEmit` (project typecheck): clean.
- Strict test-inclusive invocation (`tsc --strict --noUncheckedIndexedAccess
  --exactOptionalPropertyTypes --noImplicitOverride --noFallthroughCasesInSwitch --noUnusedLocals
  --noUnusedParameters --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck
  --resolveJsonModule --esModuleInterop --noEmit src/**/*.ts`, covering `__tests__` files the
  project tsconfig excludes): clean.
- `npm run build` (`tsc -p tsconfig.json`): clean.
- `npx vitest run`: 529/529 passing, 28/28 test files passing.

## Explicit Non-Scope (confirmed, not touched) — Batch 1

**Correction (post-Batch-2):** D7/D9/D10 listed below as "not implemented" describes Batch 1's own
scope at the time this document was first written — they were implemented in Batch 2 (see section
below) and are no longer non-scope. This line is corrected here rather than silently left stale.

D12, D16, D20, D24, D27, D30, D40, D45 calculation code — not implemented. D60 —
remains DEFERRED, no research or implementation performed. `NormalizedChart`/`chart/types.ts` —
unchanged, no schema bump. `vedic/chart.ts` (Phase 4 integration) — unchanged, divisional charts not
wired into the assembled chart pipeline. Phase 4 (`rashi.ts`, `nakshatra.ts`, `dasha/vimshottari.ts`)
and Phase 5 (`ascendant.ts`, `houses.ts`) source files — unchanged (confirmed by `git diff`: zero
lines touched in any of them). No Rule Engine, interpretation, yoga, prediction, or house-lord logic.
No UI, no API server. No dependency added or upgraded (`package.json`/`package-lock.json` for
`astrology-core` unchanged). No commit made (Batch 1 was committed separately afterward, per its own
Human Decision Gate — see `51b5b86f15f51684947f11552710c4792999fdf8`).

---

# Batch 2 — D7 + D9 + D10 Implementation

**Status: implementation complete, NOT committed.** Checkpoint preserved: HEAD
`51b5b86f15f51684947f11552710c4792999fdf8` (Batch 1, closed + committed). Builds on
[`V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`](V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md) §"Batch 2 — D7/D9/D10
Preflight" (status: `BATCH 2 READY`). This section is additive to this document — Batch 1's sections
above are otherwise unchanged, aside from the one stale-claim correction noted immediately above.

## Scope

**In this batch:** D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa) — sign-placement calculation only,
each using the project's selected `chart_method=1` ("Traditional Parasara") contract, frozen in the
preflight. **Explicitly not in this batch:** D12, D16, D20, D24, D27, D30, D40, D45 (contract
resolved in Batch 1's preflight, implementation deferred), D60 (contract itself still deferred). No
Rule Engine, interpretation, yoga, prediction, house-lord logic, full nested mini-chart, UI, API
server, or schema migration — none touched.

## D7 Formula (Saptamsa)

**Contract:** PyJHora `chart_method=1` (`PARASARA_EVEN_START_7TH_GO_FORWARD`, self-labeled
"Traditional Parasara") == vedic-calc's only implementation.

- `part = floor(signDegree / (30/7))` — 7 unequal-in-decimal-but-equal-in-value parts per sign.
- Odd sign: `(signIndex + part) mod 12`.
- Even sign: `(signIndex + part + 6) mod 12` (6 = 7th house, 0-indexed).
- Boundary: closed-lower/open-upper at each `k×30/7` for k=1..6, same convention as every other
  varga in this file.
- Implemented as `getD7SaptamsaSign(sign, signDegree)` in `divisional.ts`, reusing the existing
  `isOddSign` helper (Batch 1) and `countSignsForward` primitive unchanged.

## D9 Formula (Navamsa)

**Contract:** PyJHora `chart_method=1` (`PARASARA_TRADITIONAL`) == vedic-calc's only implementation.

- `part = floor(signDegree / (30/9))` — 9 parts of 3°20' each.
- Starting sign by **element** (fire→Aries, water→Cancer, air→Libra, earth→Capricorn) — **not**
  modality/movable-fixed-dual, confirmed directly from both oracles' source this task (the
  preflight's own §8 already corrected this same assumption; the implementation independently
  reconfirms it — `getD9NavamsaSign`'s test suite explicitly verifies that Aries/Leo/Sagittarius,
  three different modalities sharing the fire element, produce identical D9 results).
- Always counted forward from the element's starting sign — no direction reversal (unlike D7/D10's
  even-sign case, D9 has no odd/even branch at all).
- New helper added (the only new primitive this batch required, per the preflight's own
  architecture-impact finding): `getElementIndex(sign)` (private, `ZODIAC_SIGNS.indexOf(sign) % 4`)
  and `D9_ELEMENT_START_SIGNS` (a 4-entry lookup table), feeding into the existing
  `countSignsForward` primitive unchanged.
- Boundary: closed-lower/open-upper at each `k×30/9` for k=1..8.

## D10 Formula (Dasamsa)

**Contract:** PyJHora `chart_method=1` (`TRADITIONAL_PARASARA_START_9TH_FORWARD`) == vedic-calc's
only implementation.

- `part = floor(signDegree / 3)` — 10 exact 3° parts, no repeating-fraction concern (unlike D7/D9).
- Odd sign: `(signIndex + part) mod 12`.
- Even sign: `(signIndex + part + 8) mod 12` (8 = 9th house, 0-indexed).
- Boundary: closed-lower/open-upper at each `k×3` for k=1..9 — every boundary is an exact,
  cleanly-representable decimal, and (confirmed by the cross-oracle experiment below) zero
  discrepancies with either oracle at any of them.
- Implemented as `getD10DasamsaSign`, reusing `isOddSign` and `countSignsForward` unchanged.

## Selected Methods / Variant Policy

Exactly as frozen in the preflight — no method-selection parameter is exposed. `getD7SaptamsaSign`,
`getD9NavamsaSign`, `getD10DasamsaSign` each hard-code the single selected "Traditional Parasara"
contract; the documented alternate PyJHora methods (direction-reversal variants, Kalachakra
Navamsa, Rangacharya/Sanjay Rath Nadi Navamsa, Parivritti/Somanatha schemes) are not implemented and
not exposed as options, matching the task's explicit instruction not to add a method-selection
parameter unless the architecture absolutely requires it (it does not).

## Boundary Policy

Unchanged from Batch 1: closed-lower/open-upper throughout, no epsilon anywhere. D7/D9's part
widths (`30/7`, `30/9`) are the first repeating-binary-fraction part widths this project has
implemented — see the Precision Policy section below for the specific finding this required.

## Precision Policy — D7/D9 Repeating-Fraction Resolution (Critical)

**No `Math.round`, `toFixed`, epsilon, or tolerance was added anywhere in this batch.** Every part
index is computed as `Math.floor(signDegree / partWidth)` — the exact same shape already used by
Batch 1's D3/D4, extended verbatim to D7 (`partWidth = 30/7`), D9 (`partWidth = 30/9`), and D10
(`partWidth = 3`).

**The repeating-fraction question, resolved per the preflight's frozen decision:** `30/7` and `30/9`
have no finite binary representation. The preflight found that PyJHora computes its part index via
Python's `//` operator, which — confirmed by direct interactive reproduction — does **not** always
equal `Math.floor(a/b)` at exact-integer-quotient boundary values for these specific part widths
(e.g. `(5*30/7) // (30.0/7)` evaluates to `4.0` in Python even though the true quotient is exactly
`5.0`). This is a **CPython floating-point floor-division quirk**, not a deliberate astrological
convention. The frozen contract is: use `Math.floor(signDegree / partWidth)`, matching vedic-calc's
`int(degree/part_size)` approach and the project's own pre-existing open-upper boundary convention
— explicitly **not** reproducing PyJHora's Python-specific artifact. `divisional.test.ts` includes a
dedicated test (`"KNOWN DISCREPANCY: ..."`, in both the D7 and D9 describe blocks) that asserts the
project-consistent (vedic-calc-matching) result at exactly these boundary values, with the reasoning
documented inline.

## Oracle Validation

Both PyJHora and vedic-calc were **executed live in this implementation task** (fresh re-execution,
not values copied from the preflight) via the same local clones used throughout this engagement.
Test matrix, independently constructed (not reused from Batch 1's fixtures):

- D7: 20 boundary/probe cases × 2 sign parities (odd Aries, even Taurus) + 12 representative-sign
  probes = 52 cases.
- D9: 26 boundary/probe cases (odd sign only — D9 has no odd/even branch) + 12 representative-sign
  probes = 38 cases.
- D10: 29 boundary/probe cases × 2 sign parities + 12 representative-sign probes = 70 cases.
- A fresh independent synthetic benchmark chart (7 points, distinct from Batch 1's Hanoi 1985 chart
  already embedded in production tests) — 7 cases × 3 vargas = 21 checks.
- **Total: 181 comparisons** against vedic-calc, cross-checked again against PyJHora.

**Result:** the compiled TypeScript implementation was run through the identical case matrix (via a
scratch Node script, not committed) and diffed byte-for-byte against vedic-calc's fresh output —
**zero differences across all 181 comparisons**. Diffed against PyJHora's fresh output separately:
**exactly the 4 previously-identified discrepancies reappear** (D7 at the `5×30/7` boundary for both
Aries and Taurus; D9 at exactly `10.0°` and `20.0°`), **and no new, unexplained discrepancy was
found**. All 4 are the CPython `//`-operator artifact described above; the TypeScript implementation
correctly does **not** reproduce them.

## Architecture Reuse

- `countSignsForward(fromSign, offset)` — reused unchanged for D7, D9, D10 (no modification).
- `isOddSign(sign)` (private, Batch 1) — reused unchanged for D7 and D10.
- `getElementIndex(sign)` (private, new this batch) + `D9_ELEMENT_START_SIGNS` (new this batch) —
  the *only* new primitive, exactly matching the preflight's own architecture-impact prediction (one
  small element-classification helper, not a general element/modality framework).
- No generalized Varga engine, no Rule Engine infrastructure, no data-driven rule table beyond the
  one 4-entry array D9 actually needs.

## API Expansion

- `VargaId` widened from `2 | 3 | 4` to `2 | 3 | 4 | 7 | 9 | 10` — a closed union, still rejecting
  any other value at compile time.
- `getDivisionalSign(varga, sign, signDegree)` extended with 3 new `switch` cases (`7`, `9`, `10`),
  each delegating to the corresponding new function — no change to the function's existing shape,
  no method-selection parameter added, no change to any existing case (2/3/4 unchanged).
- No change to `NormalizedChart`, `chart/types.ts`, or `vedic/chart.ts` — standalone calculation
  surface only, unchanged from Batch 1's CF.4/CF.10 decision.

## Input Contract

Unchanged from Batch 1 — `signDegree` precondition (`[0, 30)`, sourced from
`RashiResult.rashiDegree`/`VedicAscendantResult.rashiDegree`) still applies identically to D7/D9/D10.
No date-only input, no guessed birth time, no noon/midnight fallback introduced or contemplated.

## Tests

Extended `packages/astrology-core/src/vedic/__tests__/divisional.test.ts` — **33 new tests** (30
Batch 1 tests unchanged + 33 new = 63 total in this file), all passing:
- `getD7SaptamsaSign`: all 7 segments on an odd sign, boundary-below/at/above, near-30° stability,
  even-sign offset behavior with wraparound, the known `5×30/7` discrepancy case (asserting the
  project-consistent, not PyJHora-matching, result), 12-sign representative sweep, independent
  benchmark-chart cases, determinism.
- `getD9NavamsaSign`: all 4 elements (with 3 representative signs each), an explicit
  same-element-different-modality equivalence test (proving element-based, not modality-based), all
  9 segments, the known `10.0°`/`20.0°` discrepancy cases plus their immediate below/above neighbors,
  near-30° stability, 12-sign representative sweep, independent benchmark-chart cases, determinism.
- `getD10DasamsaSign`: all 10 segments, a loop over all 9 integer boundaries asserting the
  boundary-value classifies with the segment above (not below), even-sign offset with wraparound,
  near-30° stability, an explicit "no discrepancy" confirmation, 12-sign representative sweep,
  independent benchmark-chart cases, determinism.
- `getDivisionalSign`: dispatch-correctness for varga 7/9/10 against their dedicated functions, an
  explicit Batch-1-non-regression check (D2/D3/D4 benchmark values re-asserted), categorical-output
  invariant extended to all 6 vargas.

**Test independence:** expected values for boundary/segment tests were hand-derived from the frozen
formula (not copied from oracle output); expected values for the "case thực tế" benchmark blocks and
the two "KNOWN DISCREPANCY" tests were taken from this task's own fresh, independently-executed
oracle runs (not reused from the preflight's saved output, not reimplementations of the production
formula) — the oracle scripts call the real PyJHora/vedic-calc library functions directly.

### Regression

Full suite re-run alongside the new tests — **562/562 passing** (529 pre-existing + 33 new, zero
regressions). Phase 4 (`rashi.test.ts` 19, `nakshatra.test.ts` 51, `vimshottari.test.ts` 53,
`chart.test.ts` 19, `publicApi.test.ts` 12) and Phase 5 (`ascendant.test.ts` 20, `houses.test.ts` 6)
regression suites all pass unchanged. Batch 1's own D2/D3/D4 tests (30 tests, unchanged) all still
pass, plus an explicit new non-regression assertion in the dispatch describe block.

## Validation Gate

- `tsc -p tsconfig.json --noEmit`: clean.
- Strict test-inclusive invocation (same flags as Batch 1, covering `__tests__` files): clean.
- `npm run build`: clean.
- `npx vitest run`: 562/562 passing, 28/28 test files passing.

## Explicit Non-Scope (Batch 2, confirmed, not touched) — Batch 2's own scope at the time

**Correction (post-Batch-3):** D12/D16/D20 listed below as "not implemented" described Batch 2's
own scope — they were implemented in Batch 3 (see section below) and are no longer non-scope. This
line is corrected here rather than silently left stale, matching the same practice used for the
Batch 1→2 transition above.

D24, D27, D30, D40, D45 calculation code — not implemented. D60 — remains DEFERRED,
not researched in this task. `NormalizedChart`/`chart/types.ts` — unchanged, no schema bump.
`vedic/chart.ts` — unchanged. Phase 4/Phase 5 source files — unchanged (confirmed by `git diff`:
zero lines touched). No Rule Engine, interpretation, yoga, prediction, or house-lord logic. No UI,
no API server. No dependency added or upgraded (`package.json`/`package-lock.json` for
`astrology-core` unchanged). No method-selection parameter exposed. No commit made (Batch 2 was
committed separately afterward, per its own Human Decision Gate — see
`831adc02b95518eec187ca38a38e58097422aa53`).

---

# Batch 3 — D12 + D16 + D20 Implementation

**Status: implementation complete, NOT committed.** Checkpoint preserved: HEAD
`831adc02b95518eec187ca38a38e58097422aa53` (Batch 2, closed + committed). Builds on
[`V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`](V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md) §"Batch 3 —
D12/D16/D20 Preflight" (status: `BATCH 3 READY`). This section is additive — Batch 1/2's sections
above are otherwise unchanged, aside from the one stale-claim correction noted immediately above.

## Scope

**In this batch:** D12 (Dwadasamsa), D16 (Shodasamsa/Kalamsa), D20 (Vimsamsa) — sign-placement
calculation only, each using the project's selected `chart_method=1` ("Traditional Parasara")
contract, frozen in the preflight. **Explicitly not in this batch:** D24, D27, D30, D40, D45
(contract resolved in Batch 1's preflight, implementation deferred), D60 (contract itself still
deferred). No Rule Engine, interpretation, yoga, prediction, house-lord logic, full nested
mini-chart, UI, API server, or schema migration — none touched.

## D12 Formula (Dwadasamsa)

**Contract:** PyJHora `chart_method=1` (`TRADITIONAL_PARASARA`) == vedic-calc's only implementation.

- `part = floor(signDegree / 2.5)` — 12 parts, each an exact terminating decimal boundary.
- `(signIndex + part) mod 12` for **every** sign — no odd/even, no modality, no element branch of
  any kind in the canonical form (verified directly from both oracles' source, not assumed).
- Implemented as `getD12DwadasamsaSign(sign, signDegree)` — the simplest of all 9 vargas
  implemented so far, requiring no lookup table at all (offset is `part` directly).

## D16 Formula (Shodasamsa / Kalamsa)

**Contract:** PyJHora `chart_method=1` (`PARASARA_TRADITIONAL`) == vedic-calc's only implementation.
"Kalamsa" is an alternate classical name for the same chart, not a competing method (PyJHora
literally aliases `kalamsa_chart()` to `shodasamsa_chart()`).

- `part = floor(signDegree / 1.875)` — 16 parts. `1.875 = 15/8`, an exact terminating binary
  fraction (denominator a power of 2) — **not** a repeating-fraction case like D7/D9.
- Starting sign by **modality**: movable→Aries, fixed→Leo, dual→Sagittarius.
- `(startIndex + part) mod 12`, always forward — no odd/even branch.
- New helper: private `getModalityIndex(sign)` (`ZODIAC_SIGNS.indexOf(sign) % 3`) plus
  `D16_MODALITY_START_SIGNS = [aries, leo, sagittarius]` (indexed 0=movable, 1=fixed, 2=dual).

## D20 Formula (Vimsamsa)

**Contract:** PyJHora `chart_method=1` (`PARASARA_TRADITIONAL`) == vedic-calc's only implementation.

- `part = floor(signDegree / 1.5)` — 20 parts, `1.5 = 3/2`, exact terminating binary fraction.
- Starting sign by modality: movable→Aries, **dual→Leo, fixed→Sagittarius**.
- `(startIndex + part) mod 12`, always forward.
- Reuses `getModalityIndex` (unchanged) with a **separate** table:
  `D20_MODALITY_START_SIGNS = [aries, sagittarius, leo]` (0=movable, 1=fixed, 2=dual).

## D16 vs. D20 — Confirmed Intentional Difference

D16 assigns fixed→Leo, dual→Sagittarius. D20 assigns fixed→Sagittarius, dual→Leo — the **roles are
swapped**, verified independently from both oracles' source side-by-side (PyJHora's
`charts.py:1011-1014` vs. `charts.py:1048-1051`; vedic-calc's `_MODALITY_STARTS[16]` vs.
`_MODALITY_STARTS[20]`). This is not a typo risk left implicit: `divisional.test.ts` includes a
dedicated `"REGRESSION GUARD"` test that calls both `getD16ShodasamsaSign` and
`getD20VimsamsaSign` on the same fixed sign (Leo) and the same dual sign (Gemini) and asserts the
results differ, specifically to catch a future accidental copy-paste of one table into the other's
slot.

## Precision Policy — No Repeating-Fraction Concern

Unlike Batch 2's D7/D9, **D12/D16/D20 have zero floating-point hazard.** All three part widths
(2.5°, 1.875°, 1.5°) are exact, terminating binary fractions — confirmed both mathematically (each
denominator, when the width is expressed as a fraction, is a power of 2: `2.5=5/2`, `1.875=15/8`,
`1.5=3/2`) and empirically (a 5,000,000-sample dense sweep per width comparing
`Math.floor(v/partWidth)` against `Math.floor(v×N/30)` found zero mismatches for N=12, 16, and 20).
No epsilon, no rounding, no PyJHora-`//`-artifact concern applies to this batch — `Math.floor` is
fully sufficient with no caveat.

## Oracle Validation

Both PyJHora and vedic-calc were **executed live in this implementation task** (fresh execution,
independently constructed — not reused from the preflight or Batch 1/2's fixtures):

- D12: 11 boundary points × 3 probes on Scorpio + 12 representative-sign probes at 21.6° = 45 cases.
- D16: 15 boundary points × 3 probes on Cancer (movable) + 12 representative-sign probes at 17.8° =
  57 cases.
- D20: 19 boundary points × 3 probes on Virgo (dual) + 12 representative-sign probes at 4.4° = 69
  cases.
- A fresh independent synthetic benchmark chart (7 points, distinct from every prior batch's
  fixtures) — 7 cases × 3 vargas = 21 checks.
- **Total: 192 comparisons.**

**Result: the compiled TypeScript implementation was diffed byte-for-byte against fresh output from
both PyJHora and vedic-calc — zero differences across all 192 comparisons, against both oracles.**
This is a materially cleaner result than Batch 2 (which had 4 confirmed, explained discrepancies) —
consistent with the Precision Policy finding above.

## Architecture Reuse

- `countSignsForward(fromSign, offset)` — reused unchanged for all three vargas.
- `isOddSign(sign)` — **not used by any of D12/D16/D20** (none has an odd/even branch in its
  canonical form; D12 was double-checked for this specifically, per the preflight's own explicit
  audit finding).
- `getElementIndex(sign)` (Batch 2) — not used by this batch.
- `getModalityIndex(sign)` (new, private, this batch) + two separate 3-entry tables
  (`D16_MODALITY_START_SIGNS`, `D20_MODALITY_START_SIGNS`) — the only new primitives, exactly
  matching the preflight's own architecture-impact prediction (one small, reusable modality helper,
  not a generalized element/modality framework).

## API Expansion

- `VargaId` widened from `2 | 3 | 4 | 7 | 9 | 10` to `2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20`.
- `getDivisionalSign(varga, sign, signDegree)` extended with 3 new `switch` cases (`12`, `16`,
  `20`) — no change to any existing case.
- No change to `NormalizedChart`, `chart/types.ts`, or `vedic/chart.ts`.
- Carried-forward note (unresolved, out of scope for this batch, same as Batch 2's own closure
  audit recorded): the individual per-varga functions for D7/D9/D10/D12/D16/D20 are still not
  re-exported from `index.ts` — only Batch 1's D2/D3/D4 functions and the generic
  `getDivisionalSign` dispatcher are part of the package's public surface today.

## Input Contract

Unchanged — `signDegree` precondition (`[0, 30)`) applies identically. No date-only input, no
guessed birth time, no noon/midnight fallback.

## Tests

Extended `packages/astrology-core/src/vedic/__tests__/divisional.test.ts` — **33 new tests** (96
total in this file), all passing:
- `getD12DwadasamsaSign`: all 12 segments, a full 11-boundary loop, explicit "no odd/even branch"
  and "no modality/element branch" proofs, wraparound, near-30° stability, 12-sign representative
  sweep, independent benchmark-chart cases, determinism.
- `getD16ShodasamsaSign`: all 3 modality groups (4 signs each), all 16 segments, a full 15-boundary
  loop, wraparound, near-30° stability, 12-sign representative sweep, independent benchmark-chart
  cases, determinism.
- `getD20VimsamsaSign`: all 3 modality groups, an explicit `"REGRESSION GUARD"` test proving the
  D16/D20 fixed/dual swap is intentional (not a shared-table bug), all 20 segments, a full
  19-boundary loop, near-30° stability, 12-sign representative sweep, independent benchmark-chart
  cases, determinism.
- `getDivisionalSign`: dispatch-correctness for varga 12/16/20, explicit Batch-1 and Batch-2
  non-regression checks (benchmark values re-asserted for both), categorical-output invariant
  extended to all 9 vargas.

**Test independence:** boundary/segment expected values hand-derived from the frozen formula; the
representative-sign-sweep and benchmark-chart expected values were taken from this task's own
fresh, independently-executed oracle runs (not reused from the preflight), with one round of
self-correction — three hand-derived "12 representative signs" tables initially contained
arithmetic slips, caught by the test run itself and corrected against the independently-verified
oracle output before this report was written.

### Regression

Full suite re-run alongside the new tests — **595/595 passing** (562 pre-existing + 33 new, zero
regressions). Phase 4/Phase 5 regression suites, Batch 1 (D2/D3/D4, 30 tests) and Batch 2 (D7/D9/D10,
33 tests) all pass unchanged, plus two new explicit non-regression assertions (one per batch) in
the dispatch describe block.

## Validation Gate

- `tsc -p tsconfig.json --noEmit`: clean.
- Strict test-inclusive invocation (same flags as Batch 1/2): clean.
- `npm run build`: clean.
- `npx vitest run`: 595/595 passing, 28/28 test files passing.

## Explicit Non-Scope (Batch 3, confirmed, not touched) — Batch 3's own scope at the time

**Correction (post-Batch-4):** D24/D27/D30 listed below as "not implemented" described Batch 3's
own scope — they were implemented in Batch 4 (see section below) and are no longer non-scope,
matching the same correction practice used at every prior batch transition.

D40, D45 calculation code — not implemented. D60 — remains DEFERRED, not researched
in this task. `NormalizedChart`/`chart/types.ts` — unchanged, no schema bump. `vedic/chart.ts` —
unchanged. Phase 4/Phase 5 source files — unchanged (confirmed by `git diff`: zero lines touched).
No Rule Engine, interpretation, yoga, prediction, or house-lord logic. No UI, no API server. No
dependency added or upgraded (`package.json`/`package-lock.json` for `astrology-core` unchanged).
No method-selection parameter exposed. No commit made (Batch 3 was committed separately afterward,
per its own Human Decision Gate — see `653a20cfc690dfd58c957b764cf316c6c7149254`).

---

# Batch 4 — D24 + D27 + D30 Implementation

**Status: implementation complete, NOT committed.** Checkpoint preserved: HEAD
`653a20cfc690dfd58c957b764cf316c6c7149254` (Batch 3, closed + committed). Builds on
[`V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`](V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md) §"Batch 4 —
D24/D27/D30 Preflight" (status: `CONTRACT READY WITH VARIANT NOTE`, human-approved and frozen).
This section is additive — Batch 1/2/3's sections above are otherwise unchanged, aside from the one
stale-claim correction noted immediately above.

## Scope

**In this batch:** D24 (Chaturvimsamsa/Siddhamsha), D27 (Nakshatramsa/Bhamsa), D30 (Trimsamsa) —
sign-placement calculation only, each using the frozen `chart_method=1` ("Traditional Parasara")
contract. **Explicitly not in this batch:** D40, D45 (contract resolved in Batch 1's preflight,
implementation deferred), D60 (contract itself still deferred). No Rule Engine, interpretation,
yoga, prediction, house-lord logic, full nested mini-chart, UI, API server, or schema migration —
none touched.

## D24 Formula (Chaturvimsamsa / Siddhamsha)

**Contract:** PyJHora `chart_method=1` (`TRADITIONAL_PARASARA`) == vedic-calc's only implementation.

- `part = floor(signDegree / 1.25)` — 24 parts, exact terminating binary fraction (`1.25 = 5/4`).
- Odd sign → `(4 + part) mod 12` — seed is the **fixed sign Leo**, not the D1 sign itself.
- Even sign → `(3 + part) mod 12` — seed is the **fixed sign Cancer**.
- Always counted forward — the frozen contract explicitly excludes PyJHora's methods 2/3
  (direction-reversal, seed-double-reversal); neither is implemented or exposed.
- Implemented as `getD24ChaturvimsamsaSign(sign, signDegree)`, reusing the existing `isOddSign`
  helper (unchanged since Batch 1) and `countSignsForward` primitive (unchanged).

## D27 Formula (Nakshatramsa / Bhamsa)

**Contract:** PyJHora `chart_method=1` (`TRADITIONAL_PARASARA`) == vedic-calc's only implementation.

- `part = floor(signDegree / (30/27))` — 27 parts, `30/27 = 10/9`, a genuinely repeating fraction.
- Starting sign by **element** (fire→Aries, earth→Cancer, air→Libra, water→Capricorn) — **not**
  modality; confirmed directly from source, not inferred from D16/D20's shape. This mapping is
  distinct from D9's own element table (D9: earth→Capricorn, water→Cancer — the earth/water seeds
  are swapped relative to D27); the two tables are separate constants, never shared.
- `(startIndex + part) mod 12`, always forward — no odd/even branch of any kind.
- New helper: `D27_ELEMENT_START_SIGNS = [aries, cancer, libra, capricorn]`, reusing the existing
  `getElementIndex(sign)` helper (Batch 2) unchanged.

## D30 Formula (Trimsamsa)

**Contract:** unchanged from the original D30 Boundary Resolution, re-verified fresh in the Batch 4
preflight with no contract change.

- D30 is **not** a `part = floor(...)` + `countSignsForward` calculation at all — it is a dedicated
  degree-range lookup, distinct per sign parity, matching this project's own special-case precedent
  (D2/D3).
- Odd sign ranges: `[0,5)→Aries, [5,10)→Aquarius, [10,18)→Sagittarius, [18,25)→Gemini,
  [25,30)→Libra`.
- Even sign ranges: `[0,5)→Taurus, [5,12)→Virgo, [12,20)→Pisces, [20,25)→Capricorn,
  [25,30)→Scorpio`.
- Implemented as `getD30TrimsamsaSign(sign, signDegree)` via an explicit ordered range table per
  parity (`D30_ODD_SIGN_RANGES`, `D30_EVEN_SIGN_RANGES`) and a `signDegree < upperBound` scan — the
  first matching (upperBound, sign) pair wins, giving closed-lower/open-upper semantics identical
  to vedic-calc's `if/elif` chain, and explicitly **not** PyJHora's inclusive-both-ends artifact
  (see Precision Policy below).

## Precision Policy — D27's Repeating Fraction (Most Severe Case Yet) and a New Test-Methodology Finding

**No `Math.round`, `toFixed`, epsilon, or tolerance was added anywhere in this batch.** D24's part
width is an exact terminating binary fraction (`1.25 = 5/4`) with no hazard. D27's part width
(`30/27 = 10/9 = 1.1111...`) is a genuinely repeating fraction — the preflight found this affects
**10 of 26 internal boundaries (~38%)** under PyJHora's Python `//` operator, the most severe case
researched in this engagement (worse than D7's 1/6 and D9's 2/8). The frozen resolution is
identical in kind to D7/D9's: `Math.floor(signDegree / partWidth)`, matching vedic-calc, **not**
reproducing PyJHora's artifact.

**A new, generally-applicable precision-methodology finding from the preflight, now reflected in
this batch's tests:** a boundary test value must be constructed as `k * partWidth` (multiplying the
already-computed part-width constant), **not** `k * 30 / N` (an independently re-derived
expression) — the two are mathematically equivalent but can round to different IEEE-754 doubles,
and only the former is guaranteed self-consistent with the production formula. Every D27 boundary
test in this batch's suite uses the `k * w` construction explicitly, with an inline comment citing
this requirement.

D30 has no part-width floating-point concern at all (its boundary values — 5, 10, 12, 18, 20, 25 —
are all exact integers); its only precision-relevant property is the closed-lower/open-upper
boundary *convention*, which is a deliberate implementation choice (matching vedic-calc, rejecting
PyJHora's inclusive-scan artifact), not a floating-point representation issue.

## Oracle Validation

Both PyJHora and vedic-calc were **executed live in this implementation task** (fresh execution on
an independently-constructed probe set — different signs and degrees than either the preflight's or
any prior batch's fixtures):

- D24: 23 boundary points × 3 probes on **both** Sagittarius (odd) and Capricorn (even) + 12
  representative-sign probes at 11.1° = 150 cases.
- D27: 26 boundary points × 3 probes on Scorpio (water), constructed via `k * partWidth` + 12
  representative-sign probes at 16.6° = 90 cases.
- D30: 4 boundary points × 3 probes on Libra (odd) + 4 boundary points × 3 probes on Scorpio (even)
  + explicit 0°/near-30° checks + 12 representative-sign probes at 21.2° = 44 cases.
- A fresh independent synthetic benchmark chart (7 points, distinct from every prior fixture) — 7
  cases × 3 vargas = 21 checks.
- **Total: 305 comparisons.**

**Result: the compiled TypeScript implementation was diffed byte-for-byte against fresh output from
both PyJHora and vedic-calc.**
- **Against vedic-calc: 0 differences across all 305 comparisons.**
- **Against PyJHora: exactly the 18 already-classified discrepancies reappear** (10 for D27, 8 for
  D30, now reproduced on entirely different signs than the preflight used), **and no new,
  unexplained discrepancy was found.** D24 shows zero discrepancies against either oracle.

## D27/D30 Oracle Artifact Classification (per the frozen contract's explicit requirement)

Both discrepancy classes are **library implementation artifacts, not traditional-method or
mathematical disagreements** — re-confirmed by direct interactive reproduction this task, not
inferred:

- **D27 (10 points, e.g. `k=5,9,10,13,17,18,19,20,25,26`):** PyJHora's Python `//` operator does
  not always equal `math.floor(a/b)` at exact-integer-quotient boundaries of a repeating fraction
  (same root cause class already documented for D7/D9 in Batch 2). **Classification: floating-point
  / library implementation discrepancy.**
- **D30 (8 points, all tested exact boundaries):** PyJHora's inclusive-both-ends list scan resolves
  ties to the lower range; vedic-calc's `<` chain resolves to the upper range. **Classification:
  library implementation discrepancy (boundary-convention artifact)**, not a repeating-fraction
  floating-point issue (D30's boundary values are exact integers) and not a traditional-method
  dispute.

Neither classification is a mathematical or traditional-method discrepancy — no case in either
varga reflects disagreement about the underlying formula or which classical rule applies.

## Architecture Reuse

- `countSignsForward(fromSign, offset)` — reused unchanged for D24 and D27.
- `isOddSign(sign)` — reused unchanged for D24 and D30.
- `getElementIndex(sign)` (Batch 2) — reused unchanged for D27, with a new, separate 4-entry table.
- `getModalityIndex(sign)` (Batch 3) — **not used by this batch** (D24/D27/D30 are odd/even- and
  element-based, not modality-based).
- D30 required **no new helper**, but a dedicated special-case function with two literal range
  tables — matching the preflight's own architecture-impact prediction exactly (D30 cannot be
  forced into the generic `part = floor(...)` shape).
- No generalized "all Vargas" formula engine, no Rule Engine, no architecture expansion beyond
  divisional calculation — every helper this batch needed already existed from prior batches.

## API Expansion

- `VargaId` widened from `2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20` to `2 | 3 | 4 | 7 | 9 | 10 | 12 |
  16 | 20 | 24 | 27 | 30`.
- `getDivisionalSign(varga, sign, signDegree)` extended with 3 new `switch` cases (`24`, `27`,
  `30`) — no change to any existing case.
- No change to `NormalizedChart` or `chart/types.ts`. No schema bump — remains 2.1.0.
- Carried-forward note (unresolved, out of scope for this batch, same as recorded in every prior
  batch's closure audit): the individual per-varga functions for D7 through D30 are still not
  re-exported from `index.ts` — only Batch 1's D2/D3/D4 functions and the generic
  `getDivisionalSign` dispatcher are part of the package's public surface today; `getDivisionalSign`
  still has no `default` throw branch.

## Input Contract

Unchanged — `signDegree` precondition (`[0, 30)`) applies identically. No date-only input, no
guessed birth time, no noon/midnight fallback.

## Tests

Extended `packages/astrology-core/src/vedic/__tests__/divisional.test.ts` — **35 new tests** (131
total in this file), all passing:
- `getD24ChaturvimsamsaSign`: explicit fixed-seed proofs (odd→Leo, even→Cancer, independent of
  which specific sign), all 24 segments, a full 23-boundary loop, near-30° stability, wraparound, an
  explicit "no direction reversal" proof (confirming methods 2/3 are not accidentally active),
  12-sign representative sweep, independent benchmark-chart cases, determinism.
- `getD27NakshatramsaSign`: all 4 element groups (3 signs each), a same-element-different-modality
  equivalence proof, all 27 segments, a full 26-boundary loop using the `k * w` construction
  required by the frozen precision methodology, a dedicated `"KNOWN DISCREPANCY"` test asserting
  the project-consistent result at all 10 identified PyJHora-artifact boundaries, near-30°
  stability, 12-sign representative sweep, independent benchmark-chart cases, determinism.
- `getD30TrimsamsaSign`: both full odd/even range tables exercised end-to-end, all 8 boundary
  points (4 odd + 4 even) with explicit "at equals above, differs from below" assertions, a
  dedicated `"KNOWN ORACLE ARTIFACT"` test asserting the upper-range (not PyJHora's lower-range)
  result at the 5° boundary, explicit 0°/near-30° checks for both parities, 12-sign representative
  sweep, independent benchmark-chart cases, determinism.
- `getDivisionalSign`: dispatch-correctness for varga 24/27/30, explicit Batch-1/2/3
  non-regression checks (benchmark values re-asserted for all three prior batches), categorical-
  output invariant extended to all 12 vargas.

**Test independence:** boundary/segment/wraparound expected values hand-derived from the frozen
formula; representative-sign-sweep, benchmark-chart, and known-discrepancy expected values taken
from this task's own fresh, independently-executed oracle runs (not reused from the preflight's
saved output, not reimplementations of the production formula) — the oracle scripts call the real
PyJHora/vedic-calc library functions directly. Two self-corrections were needed and applied before
this report was written: two hand-derived wraparound comments initially disagreed with their own
adjacent assertions (a copy/paste slip caught while re-reading the file, not by a failing test —
both were arithmetically re-verified and fixed prior to running the suite).

### Regression

Full suite re-run alongside the new tests — **630/630 passing** (595 pre-existing + 35 new, zero
regressions). Phase 4/Phase 5 regression suites, Batch 1 (D2/D3/D4), Batch 2 (D7/D9/D10), and
Batch 3 (D12/D16/D20) all pass unchanged, plus a new explicit Batch-3 non-regression assertion in
the dispatch describe block (Batch 1/2's own non-regression assertions were already present and
remain unchanged).

## Validation Gate

- `tsc -p tsconfig.json --noEmit`: clean.
- Strict test-inclusive invocation (same flags as every prior batch): clean.
- `npm run build`: clean.
- `npx vitest run`: 630/630 passing, 28/28 test files passing.

## Evidence Wording — Confidence Accuracy Note

Per the frozen contract's explicit instruction: this document does **not** claim direct BPHS
primary-text confirmation for D24/D27/D30. The tradition evidence is, as for every prior varga in
this engagement, source-code self-labeling (PyJHora's own docstring/enum naming its default
"Traditional Parasara") corroborated by an independently-authored second implementation
(vedic-calc) producing bit-for-bit identical results — high confidence that this is each oracle's
own self-declared canonical Parashari form, not independent verification against a primary Sanskrit
text.

## Explicit Non-Scope (Batch 4, confirmed, not touched) — Batch 4's own scope at the time

**Correction (post-Batch-5):** D40/D45 listed below as "not implemented" described Batch 4's own
scope — they were implemented in Batch 5 (see section below) and are no longer non-scope, matching
the same correction practice used at every prior batch transition.

D40, D45 calculation code — not implemented. D60 — remains DEFERRED, not researched in this task.
`NormalizedChart`/`chart/types.ts` — unchanged, no schema bump. `vedic/chart.ts` — unchanged.
Phase 4/Phase 5 source files — unchanged (confirmed by `git diff`: zero lines touched). No Rule
Engine, interpretation, yoga, prediction, or house-lord logic. No UI, no API server. No dependency
added or upgraded (`package.json`/`package-lock.json` for `astrology-core` unchanged). No
method-selection parameter exposed (PyJHora's D24 methods 2/3, D27 methods 2/3, and D30 methods
2-5 are all documented but not implemented, per the frozen contract). No commit made.

---

# Batch 5 — D40 + D45 Implementation

**Status: implementation complete, NOT committed.** Checkpoint preserved: HEAD `f983b96` (Batch 4,
closed + committed). Builds on
[`V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`](V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md) §"Batch 5 — D40/D45
Preflight" (status: `CONTRACT READY WITH VARIANT NOTE`, human-approved and frozen with an explicit
precision-methodology caveat for D45). This section is additive — Batch 1/2/3/4's sections above are
otherwise unchanged, aside from the one stale-claim correction noted immediately above.

## Scope

**In this batch:** D40 (Khavedamsa), D45 (Akshavedamsa) — sign-placement calculation only, each
using the frozen `chart_method=1` ("Traditional Parasara") contract. **Explicitly not in this
batch:** D60 (contract itself still DEFERRED — not researched in this task). No Rule Engine,
interpretation, yoga, prediction, house-lord logic, full nested mini-chart, UI, API server, or
schema migration — none touched.

## D40 Formula (Khavedamsa)

**Contract:** PyJHora `chart_method=1` (`PARASARA_TRADITIONAL`) == vedic-calc's only implementation.

- `part = floor(signDegree / 0.75)` — 40 parts, `0.75 = 3/4`, an exact terminating binary fraction
  with no repeating-fraction hazard of any kind.
- Odd sign → count `part` signs forward from **Aries** (fixed seed, not the D1 sign itself).
- Even sign → count `part` signs forward from **Libra** (fixed seed).
- Always counted forward — only `chart_method=1` is implemented; PyJHora's alternate,
  non-Parashari methods are not exposed.
- Implemented as `getD40KhavedamsaSign(sign, signDegree)`, reusing the existing `isOddSign` helper
  (unchanged since Batch 1) and `countSignsForward` primitive (unchanged since Batch 1).

## D45 Formula (Akshavedamsa)

**Contract:** PyJHora `chart_method=1` (`PARASARA_TRADITIONAL`) == vedic-calc's only implementation.

- `part = floor(signDegree / (30/45))` — 45 parts, `30/45 = 2/3`, a genuinely repeating binary
  fraction.
- Starting sign by **modality** (movable→Aries, fixed→Leo, dual→Sagittarius) — **bit-for-bit the
  same table as D16's** (`D16_MODALITY_START_SIGNS`), confirmed directly from both oracles, and
  explicitly **not** D20's table (D20 swaps the fixed/dual roles relative to D16/D45).
- `(startIndex + part) mod 12`, always forward.
- No new modality table was created — `getD45AkshavedamsaSign` reuses `D16_MODALITY_START_SIGNS`
  and `getModalityIndex` directly, per the frozen contract's explicit instruction against
  duplicating an identical table.

## Precision Policy — D45's Repeating Fraction Has TWO Independent Floating-Point Phenomena

**No `Math.round`, `toFixed`, epsilon, or tolerance was added anywhere in this batch.** D40's part
width (`0.75 = 3/4`) is an exact terminating binary fraction with zero hazard — confirmed and
tested with the same simple `k * partWidth ± 1e-9` boundary-loop pattern used for D16/D20/D24.

D45's part width (`30/45 = 2/3 = 0.6666666666666666...`) is a genuinely repeating fraction, and this
batch's research surfaced **two distinct, independent floating-point phenomena**, not one:

1. **The familiar PyJHora Python `//` artifact** (same root cause already documented for D7, D9,
   and D27): Python's `//` operator does not always equal `math.floor(a/b)` at exact-integer-quotient
   boundaries of a repeating fraction. The original oracle probe (constructed via naive `k *
   (30/45)`, see Oracle Validation below) found apparent differences at **12 of 44 boundaries** (`k
   = 5,10,13,17,20,23,26,29,34,37,40,43`). **Correction (post-Closure-Audit):** PyJHora's own `//`
   computation is itself sensitive to the exact input bit pattern — 9 of these 12 (`k =
   5,10,17,20,23,34,37,40,43`) turn out to be an artifact of the naive `k * (30/45)` probe
   construction, not of PyJHora disagreeing with the project's contract. When PyJHora is fed the
   same `(2 * k) / 3` value the shipped tests actually use, it **agrees** with the project at those
   9 points. Only **3 of 44 boundaries (`k = 13, 26, 29`)** are a genuine, construction-independent
   PyJHora discrepancy — see "D45 Oracle Artifact Classification" below for the full re-derivation.
   Resolution is identical in kind to every prior batch: `Math.floor(signDegree / partWidth)`,
   matching vedic-calc, not reproducing PyJHora's artifact.

2. **A second, previously-unseen phenomenon, newly discovered in this batch's research:** the
   `k * partWidth` boundary-construction convention established as "safe" in Batch 4 (for D27) is
   **not** reliably safe for every repeating fraction. For D45, `k * (30/45)` lands **exactly 1 ULP
   below** the true rational value `k * (2/3)` at 5 specific, disjoint k-values (`k = 7, 14, 25, 28,
   31`) — e.g. at `k=7`: `7 * (30/45) = 4.666666666666666`, while the true rational value
   `14/3 = 4.666666666666667`. Because production code applies closed-lower/open-upper semantics,
   this 1-ULP-low construction would silently classify the boundary itself into the **wrong (lower)
   segment** if used naively as a test's "at-boundary" value — not a production bug (the production
   formula itself was never wrong), but a **test-construction** hazard that this batch's research
   caught before it could produce a false-positive test.

**Resolution, verified by exhaustive check across all 44 boundaries:** construct the D45 boundary
test value as `(2 * k) / 3` — a single correctly-rounded division representing the exact rational
value `k * (2/3)`, rather than the two-step `k * (30/45)` (which introduces two independent rounding
steps). This construction has **zero** misclassifications at any of the 44 boundaries, including all
5 of the k-values that break the naive `k * partWidth` construction. It is combined with a
TEST-ONLY, independently-implemented IEEE-754 `nextUp`/`nextDown` ULP utility (direct 64-bit
manipulation via `DataView`, no library dependency) used to prove, at the bit level, that the naive
construction is exactly one representable value below the correct one — without introducing any
arbitrary epsilon tolerance anywhere, in tests or production.

This finding is scoped **only** to test construction; it changes nothing about the production
formula, which was correct (and independently oracle-verified as matching vedic-calc 100%) from the
first implementation attempt.

## Oracle Validation

Both PyJHora and vedic-calc were **executed live in this implementation task** (fresh execution on
an independently-constructed probe set — different signs and degrees than the preflight's or any
prior batch's fixtures):

- D40: 39 boundary points × 3 probes, on **both** an odd-classified sign and an even-classified sign
  (234 cases) + 1 midpoint probe + 12 representative-sign probes at 5.7° = 247 cases.
- D45: 44 boundary points × 3 probes on Capricorn (movable), constructed via `k * (30/45)` in the
  probe script (132 cases) + 1 midpoint probe + 12 representative-sign probes at 27.9° = 145 cases.
- A fresh independent synthetic benchmark chart (7 points, distinct from every prior fixture) — 7
  cases × 2 vargas = 14 checks.
- **Total: 406 comparisons**, executed fresh against both oracles.

**Result: the compiled TypeScript implementation was diffed byte-for-byte against fresh output from
both PyJHora and vedic-calc.**
- **Against vedic-calc: 0 differences across all 406 comparisons** (D40 and D45 both).
- **Against PyJHora, using this probe's `k * (30/45)` construction: exactly the 12
  already-classified D45 differences reappear** (reproduced on an entirely different sign —
  Capricorn — than the preflight used), and no new, unexplained difference was found. D40 shows
  zero discrepancies against either oracle. **See the Correction below: only 3 of these 12 hold up
  as genuine discrepancies once re-verified against the `(2 * k) / 3` construction the shipped
  tests actually use.**

## D45 Oracle Artifact Classification (per the frozen contract's explicit requirement)

**Correction (post-Closure-Audit — see the Batch 5 Closure Audit report):** the paragraph below, as
originally written, classified all 12 of `{5,10,13,17,20,23,26,29,34,37,40,43}` as genuine PyJHora
discrepancies. That classification was verified only against a probe that fed PyJHora the naive `k *
(30/45)` construction. The Closure Audit independently re-verified all 12 points feeding PyJHora the
exact `(2 * k) / 3` value the shipped test suite actually asserts against (on two different signs —
Capricorn and Aquarius — with identical results), and found:

- **3 of 44 boundaries (`k = 13, 26, 29`) are genuine, construction-independent PyJHora
  discrepancies** — PyJHora disagrees with the project regardless of which mathematically-equivalent
  double is used to represent the boundary.
- **9 of the originally-listed 12 (`k = 5,10,17,20,23,34,37,40,43`) are not genuine PyJHora
  discrepancies at all.** PyJHora's own `//`-based computation is itself sensitive to the exact
  input bit pattern (the same class of fragility this batch already documented for the project's
  own naive `k * partWidth` test-construction hazard, §Precision Policy above) — when fed the
  corrected `(2 * k) / 3` double instead of the naive `k * (30/45)` double, PyJHora computes the
  same result as the project at these 9 points. The apparent "12-point" discrepancy was an artifact
  of the original oracle probe's construction choice, not evidence of 12 genuine points of
  disagreement under the contract the shipped code and tests actually use.

**Corrected classification:** the 3 genuine points (`k = 13, 26, 29`) are a **library implementation
artifact, not a traditional-method or mathematical disagreement** — PyJHora's Python `//` operator
does not always equal `math.floor(a/b)` at exact-integer-quotient boundaries of D45's repeating
fraction (same root-cause class already documented for D7, D9, and D27 in prior batches).
**Classification: floating-point / library implementation discrepancy.** It is not a mathematical or
traditional-method discrepancy — no case reflects disagreement about the underlying formula or which
classical rule applies, and this 3-point set is a **distinct, unrelated phenomenon** from the
separate 5-point test-construction ULP hazard documented above (`{13,26,29}` and `{7,14,25,28,31}`
are fully disjoint).

## Architecture Reuse

- `isOddSign(sign)` — reused unchanged for D40.
- `countSignsForward(fromSign, offset)` — reused unchanged for D40 and D45.
- `getModalityIndex(sign)` (Batch 3) — reused unchanged for D45.
- `D16_MODALITY_START_SIGNS` (Batch 3) — reused **directly, with no new table**, for D45, per the
  frozen contract's explicit instruction. D45 does **not** reuse D20's modality table (D20 swaps the
  fixed/dual roles).
- No generalized "all Vargas" formula engine, no Rule Engine, no architecture expansion beyond
  divisional calculation — every helper this batch needed already existed from prior batches.

## API Expansion

- `VargaId` widened from `2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20 | 24 | 27 | 30` to `2 | 3 | 4 | 7 |
  9 | 10 | 12 | 16 | 20 | 24 | 27 | 30 | 40 | 45`.
- `getDivisionalSign(varga, sign, signDegree)` extended with 2 new `switch` cases (`40`, `45`) — no
  change to any existing case.
- No change to `NormalizedChart` or `chart/types.ts`. No schema bump — remains 2.1.0.
- Carried-forward note (unresolved, out of scope for this batch, same as recorded in every prior
  batch's closure audit): the individual per-varga functions are still not re-exported from
  `index.ts` — only Batch 1's D2/D3/D4 functions and the generic `getDivisionalSign` dispatcher are
  part of the package's public surface today; `getDivisionalSign` still has no `default` throw
  branch.

## Input Contract

Unchanged — `signDegree` precondition (`[0, 30)`) applies identically. No date-only input, no
guessed birth time, no noon/midnight fallback.

## Tests

Extended `packages/astrology-core/src/vedic/__tests__/divisional.test.ts` — **28 new tests** (159
total in this file), all passing:

- `getD40KhavedamsaSign`: explicit fixed-seed proofs (odd→Aries, even→Libra, independent of which
  specific sign), all 40 segments, a full 39-boundary loop (exact binary fraction, no hazard),
  near-30° stability, wraparound, 12-sign representative sweep, independent benchmark-chart cases,
  determinism.
- `getD45AkshavedamsaSign`: all 3 modality-group seed proofs, an explicit bit-for-bit
  reuses-D16/differs-from-D20 verification, all 45 segments, a self-verifying `nextUp`/`nextDown`
  sanity check, a dedicated test proving the naive `k * partWidth` construction is exactly 1 ULP
  below the correct `(2*k)/3` value at all 5 hazard k-values and would misclassify if used, a full
  44-boundary loop using the `(2*k)/3` construction, a dedicated `"PROJECT-CONSISTENT BEHAVIOR"` test
  asserting the project-consistent result at 12 boundaries with a history of oracle discrepancy
  (only 3 of the 12 — see the Oracle Artifact Classification correction above — are genuine,
  construction-independent PyJHora artifacts), near-30° stability across all 3 modality groups,
  wraparound, 12-sign representative sweep, independent benchmark-chart cases, determinism.
- `getDivisionalSign`: dispatch-correctness for varga 40/45, an explicit Batch-4 non-regression
  check (benchmark values re-asserted), categorical-output invariant extended to all 14 vargas.

**Test independence:** boundary/segment/wraparound expected values hand-derived from the frozen
formula (pure `seed + part mod 12` arithmetic, using the same already-tested `countSignsForward`
primitive every prior batch relies on); representative-sign-sweep and benchmark-chart expected
values taken from this task's own fresh, independently-executed oracle runs (not reused from the
preflight's saved output, not reimplementations of the production formula) — the oracle scripts call
the real PyJHora/vedic-calc library functions directly. The D45 boundary-loop test does not use the
production formula, or its own output, as the source of its expected classification: it asserts the
self-consistent, contract-derived property that a value on the far side of the true rational
boundary must classify differently from one on the near side, using an independently-implemented
ULP utility to construct those values as tightly as the contract required.

### Regression

Full suite re-run alongside the new tests — **658/658 passing** (630 pre-existing + 28 new, zero
regressions). Phase 4/Phase 5 regression suites, Batch 1 (D2/D3/D4), Batch 2 (D7/D9/D10), Batch 3
(D12/D16/D20), and Batch 4 (D24/D27/D30) all pass unchanged, plus a new explicit Batch-4
non-regression assertion in the dispatch describe block (Batch 1/2/3's own non-regression assertions
were already present and remain unchanged).

## Validation Gate

- `tsc -p tsconfig.json --noEmit`: clean.
- Strict test-inclusive invocation (same flags as every prior batch): clean.
- `npm run build`: clean.
- `npx vitest run`: 658/658 passing, 28/28 test files passing.

## Evidence Wording — Confidence Accuracy Note

Per the frozen contract's explicit instruction: this document does **not** claim direct BPHS
primary-text confirmation for D40/D45. The tradition evidence is, as for every prior varga in this
engagement, source-code self-labeling (PyJHora's own docstring/enum naming its default "Traditional
Parasara") corroborated by an independently-authored second implementation (vedic-calc) producing
bit-for-bit identical results — high confidence that this is each oracle's own self-declared
canonical Parashari form, not independent verification against a primary Sanskrit text.

## Explicit Non-Scope (Batch 5, confirmed, not touched) — Batch 5's own scope at the time

**Correction (post-Batch-6):** D60 listed below as "remains DEFERRED" described Batch 5's own scope —
it was researched (Batch 6 preflight), human-reviewed, contract-frozen, and implemented in Batch 6
(see section below), and is no longer non-scope. This matches the same correction practice used at
every prior batch transition.

D60 — remains DEFERRED, not researched in this task. `NormalizedChart`/`chart/types.ts` —
unchanged, no schema bump. `vedic/chart.ts` — unchanged. Phase 4/Phase 5 source files — unchanged
(confirmed by `git diff`: zero lines touched). No Rule Engine, interpretation, yoga, prediction, or
house-lord logic. No UI, no API server. No dependency added or upgraded
(`package.json`/`package-lock.json` for `astrology-core` unchanged). No method-selection parameter
exposed (PyJHora's D40/D45 alternate, non-Parashari methods are documented but not implemented, per
the frozen contract). No commit made.

---

# Batch 6 — D60 Implementation (Shashtiamsa) — V1.1 COMPLETE (15/15)

**Status: implementation complete, NOT committed.** Checkpoint: Batch 5 (D40/D45) closed + committed
as `63e37a7`. Builds on [`V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`](V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md)
§"Batch 6 (cont.) — D60 OPUS METHOD-RESOLUTION REPORT" (status: **CANONICAL METHOD RESOLVED —
Candidate A**, then **human-reviewed and FROZEN** as the D60 contract). This is the **final** Varga
of the V1.1 divisional-chart scope: all 15 (D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30,
D40, D45, D60) are now implemented. This section is additive — Batches 1–5 above are unchanged aside
from the one stale-scope correction noted immediately above.

## Scope

**In this batch:** D60 (Shashtiamsa) — sign-placement calculation only. **Explicitly not in this
batch:** the 60-named-deity/Shashtiamsa-lord layer (out of V1.1 scope — the classical odd/even name
reversal belongs to that layer, not to sign placement); no Rule Engine, interpretation, yoga,
prediction, house-lord logic, full nested mini-chart, UI, API server, or schema migration.

## D60 Formula (Shashtiamsa) — FROZEN CONTRACT

**Source of truth:** the worked example in the reviewed Santhanam translation of BPHS Ch. 6, ślokas
33–41 (see the preflight's Batch 6 report for the verbatim verse and worked example). Human decision:
**freeze Candidate A** (count from the occupied sign).

- `part = Math.min(59, Math.floor(signDegree / (30/60)))` — i.e. `floor(signDegree / 0.5)`; 60
  parts, `30/60 = 0.5 = 1/2`, an exact terminating binary fraction.
- `destination = countSignsForward(sign, part)` — count `part` signs **forward from the planet's own
  D1 sign**. No odd/even branch, no reversal, no fixed-Aries seed. Structurally identical to D12.
- **Worked-example anchor (frozen):** Venus at Capricorn 13°25′ → intra-sign degrees ×2 = 26°50′ →
  26 ÷ 12 remainder 2 → +1 = 3 → count 3 signs from Capricorn (inclusive) → **Pisces**. The
  implementation reproduces this exactly, and it is asserted as a dedicated, non-oracle-derived test.
- **Interpretation note (frozen):** the verse's "ignore the sign position" applies only to computing
  the intra-sign portion count (use degrees within the sign, not absolute longitude); the resulting
  count is then applied **from the occupied natal sign** — *not* from a fixed Aries seed. The
  odd/even reversal in the classical text concerns the deity/name sequence only ("insomuch as these
  names are concerned"), which is out of scope.
- **Explicitly rejected** for V1.1 D60 sign placement (per the frozen contract): fixed-Aries seed
  (PyJHora `chart_method=2`); odd/even 7th-sign shift; odd/even destination reversal (PyJHora
  `chart_method=4`, untested even by PyJHora's own authors); any deity-name-based sign-placement.

Implemented as `getD60ShashtiamsaSign(sign, signDegree)`, reusing the existing `countSignsForward`
primitive (unchanged since Batch 1) — **zero new helpers**.

## Precision Policy

`30/60 = 0.5 = 1/2` is an exact terminating binary fraction — the cleanest of any Varga. **No**
`Math.round`, `toFixed`, epsilon, or tolerance. Unlike D7/D9/D27/D45, there is **no** PyJHora Python
`//` repeating-fraction artifact; unlike D45, there is **no** `k*partWidth` boundary-construction
hazard (so tests use the plain `k*0.5 ± 1e-9` pattern, no `nextUp`/`nextDown` scaffolding). Boundary
convention: closed-lower/open-upper — exact `k*0.5` belongs to the upper part, matching every prior
Varga and both oracles.

## Oracle Validation (validation only — not the source of the contract)

Per the human directive, oracle agreement is **validation, not proof of classical correctness** (the
contract was frozen from the reviewed Santhanam worked example). Fresh checks this task, expected
values hand-derived from the frozen formula:
- 12-sign representative sweep at 7.3° + a fresh 7-point benchmark chart (distinct from every prior
  batch's fixtures): **PyJHora `chart_method=1` — 0 discrepancies; vedic-calc — 0 discrepancies.**
- The Santhanam worked-example anchor (Capricorn 13°25′ → Pisces) reproduced by both oracles and by
  the implementation.

## Architecture Reuse

- `countSignsForward(fromSign, offset)` — reused unchanged.
- No `isOddSign`, no element/modality helper, no lookup table, no new helper of any kind — the
  simplest Varga in the engagement, identical in shape to `getD12DwadasamsaSign`.
- No generalized formula engine, no Rule Engine, no architecture change.

## API Expansion

- `VargaId` widened from `2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20 | 24 | 27 | 30 | 40 | 45` to add
  `| 60` — the complete 15-Varga V1.1 closed union.
- `getDivisionalSign` extended with exactly one new `switch` case (`60`) — no change to any existing
  case.
- No change to `NormalizedChart` or `chart/types.ts`. No schema bump — remains **2.1.0**. No
  dependency change. The 60-named-deity layer was **not** introduced.
- Carried-forward note (pre-existing, unchanged): per-varga functions are still not re-exported from
  `index.ts`; `getDivisionalSign` still has no `default` throw branch (its closed union makes the
  switch exhaustive).

## Tests

Extended `packages/astrology-core/src/vedic/__tests__/divisional.test.ts` — **14 new tests** (173
total in this file), all passing:
- `getD60ShashtiamsaSign`: the frozen Santhanam worked-example anchor (Capricorn 13°25′ → Pisces, a
  non-oracle-derived classical expected value); a from-occupied-sign proof (part0 = own sign, not
  Aries — rejecting Candidate B); a no-parity/no-reversal proof on even signs (rejecting Candidate
  C/E); all 60 parts on Aries and on Capricorn (index-derived expectations, zodiac wraps 5×); a full
  59-boundary loop; exact 0°/0.5°/29.5°/near-30° edges; wraparound (part ≥ 12); midpoint; a 12-sign
  representative sweep at 7.3°; an independent benchmark-chart case; determinism.
- `getDivisionalSign`: dispatch-correctness for varga 60; an explicit Batch-5 non-regression
  assertion; the categorical-output invariant extended to all 15 vargas.

**Test independence:** boundary/segment/wraparound/all-60-parts expected values are hand-derived from
the frozen formula (index arithmetic on `ZODIAC_SIGNS`, not calls to the function under test); the
worked-example anchor is taken from the classical text itself; the representative-sweep and
benchmark values are hand-derived and independently oracle-verified (validation only). No expected
value for formula correctness is generated by calling the production formula under test.

### Regression

Full suite re-run — **672/672 passing** (658 pre-existing + 14 new, zero regressions). D2–D45 behavior
is unchanged (explicit per-varga dispatch-equality tests and per-batch benchmark non-regression
assertions all pass, including a new Batch-5 non-regression assertion).

## Validation Gate

- `tsc -p tsconfig.json --noEmit`: clean.
- Strict test-inclusive invocation (same flags as every prior batch): clean.
- `npm run build`: clean.
- `npx vitest run`: 672/672 passing, 28/28 test files passing.

## Evidence Wording — Confidence Accuracy Note

Unlike D2–D45 (resolved on self-labeled-"Traditional" oracle defaults), D60's contract was frozen
from an **actual primary-text worked example** (Santhanam BPHS Ch. 6). This document does not
overclaim beyond that: the resolution rests on the single Santhanam edition + its worked example,
corroborated by independent secondary worked examples and two software oracles — see the preflight's
Batch 6 §13 "Remaining Risks" (single-primary-edition residual risk) for the honest confidence bound.

## Explicit Non-Scope (Batch 6, confirmed, not touched)

The 60-named-deity/Shashtiamsa-lord layer and its odd/even name reversal — out of V1.1 scope.
`NormalizedChart`/`chart/types.ts` — unchanged, no schema bump. `vedic/chart.ts` — unchanged. Phase
4/Phase 5 source files — unchanged. No Rule Engine, interpretation, yoga, prediction, or house-lord
logic. No UI, no API server. No dependency added or upgraded. No PyJHora alternate D60 methods
(2/3/4) exposed. No commit made.
