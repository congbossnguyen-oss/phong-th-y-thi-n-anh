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

## Explicit Non-Scope (confirmed, not touched)

D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45 calculation code — not implemented. D60 —
remains DEFERRED, no research or implementation performed. `NormalizedChart`/`chart/types.ts` —
unchanged, no schema bump. `vedic/chart.ts` (Phase 4 integration) — unchanged, divisional charts not
wired into the assembled chart pipeline. Phase 4 (`rashi.ts`, `nakshatra.ts`, `dasha/vimshottari.ts`)
and Phase 5 (`ascendant.ts`, `houses.ts`) source files — unchanged (confirmed by `git diff`: zero
lines touched in any of them). No Rule Engine, interpretation, yoga, prediction, or house-lord logic.
No UI, no API server. No dependency added or upgraded (`package.json`/`package-lock.json` for
`astrology-core` unchanged). No commit made.
