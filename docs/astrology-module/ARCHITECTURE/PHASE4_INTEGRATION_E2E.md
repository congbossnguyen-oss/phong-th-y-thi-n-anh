# PHASE 4 — Integration / E2E Validation

Proves the complete Vedic V1 calculation path works coherently end-to-end, using only already-built
Step 1–6 modules. No new mathematical decisions, no D5 reopening, no scope expansion.

## Complete pipeline

```
Birth input (BirthData, Phase 1)
  → resolveBirthDataInstant() — exact UTC instant (or a midnight-substituted date-only instant
    when localTime is null — see "Unknown birth time" below)
  → AstronomicalProvider (SwissEphemerisProvider) — Julian Day internally, tropical planetary
    positions (provider.getPlanetPosition)
  → provider.getAyanamsa("lahiri") — configured Lahiri ayanamsa (Step 1)
  → calculateRashi() — sidereal longitude = normalizeDegrees(tropical − ayanamsa) (Step 3, frozen
    formula — extended ayanamsa API, manual subtraction, NOT native SEFLG_SIDEREAL)
  → calculateNakshatraPosition() — Rashi/D1 sign+degree (Step 3) and Nakshatra+Pada+Lord (Step 4)
  → calculateVimshottariDasha() — Moon's Nakshatra lord → starting Mahadasha → full 9-period,
    120-year Vimshottari sequence (Step 6, 365.256364 days/year)
```

## Integration entry point

`src/vedic/chart.ts::calculateVedicCore()` — the single new file this step adds. It is a pure
orchestrator: it calls `calculateRashi` (Step 3), `calculateNakshatraPosition` (Step 4), and
`calculateVimshottariDasha` (Step 6) exactly as they already exist, adding **zero** new
astronomical/mathematical logic — the only new code is wiring (looping over requested bodies,
assembling the result, deciding whether to call Dasha).

```ts
export interface CalculateVedicCoreInput {
  provider: AstronomicalProvider;
  utcInstant: Date;
  hasKnownLocalTime?: boolean;   // default true; see "Unknown birth time"
  bodies: readonly CelestialBody[]; // no default — caller must be explicit
  ayanamsaId?: AyanamsaId;       // default "lahiri"
}

export interface VedicCoreResult {
  ayanamsaId: AyanamsaId;
  utcInstant: Date;
  hasKnownLocalTime: boolean;
  planets: VedicRashiPosition[];             // Rashi/D1 per requested body, in input order
  nakshatraPositions: NormalizedNakshatraPosition[]; // Nakshatra/Pada/Lord per requested body
  dasha: VimshottariMahadashaSequence | null; // null iff hasKnownLocalTime === false
}
```

### Why this does *not* build a `NormalizedChart`

The pipeline this step is asked to validate stops at Dasha — it never mentions Ascendant, house
cusps, or angles. No Vedic Ascendant/Whole-Sign house-assignment implementation exists anywhere in
Steps 1–6 (D2 only chose "whole_sign" as a house-system *label*; no code was ever written to
compute it). Forcing the existing Rashi/Nakshatra/Dasha data into a `NormalizedChart` would require
either inventing that missing Ascendant/house logic (out of this step's scope) or populating
`houseCusps: []` / `house: null` on every planet purely to satisfy the type — neither of which the
architecture "genuinely requires." Per this task's own instruction ("do not modify `NormalizedChart`
unless the existing architecture proves it is genuinely required" / "do not introduce a broad
refactor just to make integration easier"), `calculateVedicCore` returns a standalone result
instead. Its `nakshatraPositions` field reuses the *exact* `NormalizedNakshatraPosition[]` type
`NormalizedChart.nakshatraPositions` already uses, so a future step that *does* build Vedic houses
can slot this output straight into a `NormalizedChart` without any conversion.

### Why `hasKnownLocalTime` is a required, explicit input (not inferred)

Reading `timezone/resolveBirthDataInstant.ts` confirmed: when `BirthData.localTime === null`, that
function *itself* substitutes `00:00:00` local time as a date-only reference point and returns an
ordinary-looking `Date` — it does **not** flag the result as "inferred." An orchestrator that only
received the resolved `utcInstant` would have no way to tell a genuine midnight birth from this
placeholder, and could silently feed a fabricated instant into Dasha's minute-sensitive elapsed-
fraction formula. `calculateVedicCore` therefore requires `hasKnownLocalTime` as a separate,
explicit input — the exact same pattern `western/chart.ts::buildWesternChart` already established
for the identical problem.

## Fixtures used (no new oracle fixtures invented)

Both fixtures were already validated in Steps 3–6; reused verbatim here, not recomputed from
scratch:
- **Hanoi**, 1985-03-12 08:30 (+7) → `1985-03-12T01:30:00.000Z` — Sun, Moon, Saturn.
- **Mumbai**, 1990-06-15 12:00 (+5.5) → `1990-06-15T06:30:00.000Z` — Moon (the only body the Step 5
  preflight validated for this fixture; not extended to Sun/Saturn here to avoid inventing new
  unvalidated oracle numbers).

## Full 17-checkpoint chain (Hanoi fixture)

| # | Checkpoint | Value |
|---|---|---|
| 1 | UTC instant | `1985-03-12T01:30:00.000Z` |
| 2 | Julian Day | not a public field anywhere in this package (internal to `SwissEphemerisProvider`) — correctness proven *transitively*: the resulting tropical Sun longitude (351.4222°) was independently validated against JPL Horizons in Phase 3A to ~0.00003°, which is only possible if the JD conversion feeding that calculation is correct |
| 3 | Ayanamsa ID / value | `"lahiri"` / 23.64666977104784° |
| 4 | Tropical Moon longitude | 240.01110535266437° |
| 5 | Sidereal Moon longitude | 216.36443558161653° |
| 6 | Rashi | scorpio |
| 7 | Rashi degree | ≈6.3644° |
| 8 | Nakshatra | anuradha |
| 9 | Pada | 1 |
| 10 | Nakshatra lord | saturn |
| 11 | Starting Mahadasha lord | saturn |
| 12 | Starting elapsed Nakshatra fraction | 0.227333 |
| 13 | Starting Mahadasha balance | Mahadasha starts 1980-11-15T09:40:29.980Z (before birth), ends 1999-11-16T06:34:37.123Z — ≈14.67 years remain at birth |
| 14 | Full 9-Mahadasha sequence | saturn→mercury→ketu→venus→sun→moon→mars→rahu→jupiter, years 19/17/7/20/6/10/7/18/16 (sum 120) |
| 15 | Period ordering | matches `VIMSHOTTARI_LORD_SEQUENCE` rotated to start at `saturn` |
| 16 | Period boundaries | each period's `endUtc` exactly equals the next period's `startUtc` (bit-identical, tested) |
| 17 | Year convention identifier | `"mean_sidereal_year.365_256364"` |

All 17 checkpoints are asserted directly in `vedic/__tests__/chart.test.ts`'s Hanoi E2E test group,
against the real `SwissEphemerisProvider` (no fakes) — not just re-derived from lower-level unit
tests.

## Oracle comparison

**(A) Astronomical/structural agreement** — exact match, both oracles, both fixtures (already
established in Steps 3–5, re-confirmed here through the orchestrator rather than re-derived):
Nakshatra, Pada, Nakshatra lord, Dasha starting lord, full 9-lord sequence, per-lord durations
(BPHS table), and the linear elapsed-balance formula. Zero discrepancy at this level.

**(B) Known convention differences** — reproduced through the orchestrator and bounded with the
same explicitly-justified (not blanket) tolerances established in Step 6:

| Fixture | vs. PyJHora (dynamic `TRUE_SIDEREAL_YEAR`) | vs. vedic-calc (fixed 365.25) |
|---|---|---|
| Hanoi | 0.089 days | 2.090 days |
| Mumbai | 0.204 days | 1.394 days |

Both gaps are the composition of two already-documented, already-accepted sources: (1) the residual
sidereal-longitude delta from Step 3's ayanamsa-API choice (extended/nutation-included vs. each
oracle's own convention), and (2) the deliberate D5 year-length choice (365.256364) vs. each
oracle's own (365.25 fixed, or a dynamically-computed ~365.2608–365.2611). **No discrepancy was
found that isn't attributable to these two frozen, evidenced conventions** — nothing triggered a
STOP condition.

## Boundary / regression coverage added at the integration level

To avoid re-testing math already exhaustively covered at the unit level (Steps 3/4/6), the
integration suite (`vedic/__tests__/chart.test.ts`, 19 tests) focuses on **orchestration wiring**
rather than re-deriving boundary formulas:
- A Nakshatra boundary and a 360°/0° wraparound case, each checked for consistency *across* Rashi,
  Nakshatra, and Dasha simultaneously (proving all three consume the *same* sidereal longitude
  without drift between them).
- Multiple planets with deliberately distinct longitudes, confirming `planets[]`/
  `nakshatraPositions[]` are correctly keyed by body (not accidentally transposed) and preserve
  input order.
- Dasha balance near 0% and near 100%, propagated correctly through the orchestrator.
- Sub-minute birth-time precision propagating undistorted into `dasha.mahadashas[0].startUtc`.
- Date rollover across century-scale spans (real Hanoi fixture, 120-year cycle).
- Provider-error mapping (`UNSUPPORTED_FEATURE` returned as `{ok:false}`, an unrecognized error
  rethrown, not swallowed) and fail-fast-on-first-error ordering.

All 9 starting Vimshottari lords and all 27 Nakshatra boundary starts were already exhaustively
tested in `vedic/dasha/__tests__/vimshottari.test.ts` (Step 6) — not duplicated here, per this
task's own "without duplicating lower-level tests" instruction.

## Unknown birth-time behavior (verified at the orchestration level)

`calculateVedicCore({ ..., hasKnownLocalTime: false })`:
- **Never infers a time.** `utcInstant` is used exactly as given (even if it is
  `resolveBirthDataInstant`'s midnight-substituted placeholder) — no `Date.now()`, no alternate
  default.
- **Rashi/Nakshatra still compute**, per the already-approved D6 rule ("Rashi/D1 still computable,
  Nakshatra/Pada per-contract with boundary care") — verified with two different `utcInstant`
  values (both `hasKnownLocalTime: false`) producing two genuinely different Nakshatra results,
  proving the instant is actually used, not silently ignored in favor of some hidden default.
- **`dasha` is exactly `null`** — never a fabricated "unavailable" object with placeholder fields.
  `calculateVimshottariDasha` (Step 6) is simply not called at all in this branch.

## Vietnamese-first UI language requirement

No new user-facing strings were introduced by this step. `vedic/chart.ts` adds zero new
`message:` literals — every error it can produce is either propagated unchanged from
`calculateRashi`/`calculateVimshottariDasha`, or produced by the *existing* (Vietnamese)
`mapPlanetProviderError` helper (generalized from Step 6's Moon-only version to accept any body,
verbatim Vietnamese text otherwise unchanged: `Thiên thể "${body}" chưa được provider hỗ trợ.` /
`Tính vị trí thiên thể "${body}" thất bại.`). Confirmed via direct grep of every `message:` literal
touched or added in this step. All internal identifiers (`calculateVedicCore`, `VedicCoreResult`,
schema/field names) remain English, per repository convention for code-level identifiers.

## Validation run

- Full test suite: 469/469 passing (450 → 469; +19 new integration tests, zero regressions).
- Typecheck: clean (`tsc -p tsconfig.json --noEmit` and the strict test-inclusive invocation).
- Build: clean.
- Serialization/validation: unaffected — `calculateVedicCore` does not touch
  `NormalizedChart`'s or `VimshottariMahadashaSequence`'s serialize/validate functions; both were
  re-run as part of the full suite and remain green.
- School compatibility (`schoolCompatibility.test.ts`): unaffected, still green — this step made no
  `NormalizedChart` changes for the school-key-set invariant to interact with.
- School isolation: `western/`↔`vedic/` grep matches are doc-comment-only (individually inspected);
  `sweph` import remains isolated to exactly `SwissEphemerisProvider.ts`.
- Leakage: `package.json` unchanged; no oracle source introduced.
- Unrelated Western code: confirmed byte-identical to the pre-integration state (`git diff --stat`
  on `src/western/` shows only the pre-existing Step 2/3 diffs, nothing new).
- Public exports: `calculateVedicCore`, `VedicCoreResult`, `VedicRashiPosition`,
  `CalculateVedicCoreInput`, `CalculateVedicCoreResult` added to `index.ts` and exercised through it
  by `vedic/__tests__/chart.test.ts` importing from `../chart.js` directly and (indirectly) via the
  package build succeeding with these symbols exported.
- `NormalizedChart`: confirmed unmodified by this step (`git diff --stat chart/types.ts` shows only
  Step 4's already-reported diff, nothing added here).

## Remaining limitations (explicitly out of scope, not defects)

- No Vedic Ascendant, house cusps, or house assignment — no `NormalizedChart` can yet be built for
  the Vedic school. This is a real capability gap for a future phase, not a bug in what exists.
- No Antardasha (V1 scope freeze, unchanged since Step 5/6).
- No divisional charts, KP, Shadbala, Ashtakavarga, Yoga/Dosha, interpretation, scoring, or AI
  reasoning — none of this was in scope for Phase 4 at any step.
- The Mumbai fixture's oracle validation covers only the Moon (matching what Step 5's preflight
  actually validated) — Sun/Saturn were not independently oracle-checked for that fixture, and this
  step did not invent new oracle numbers to extend that coverage.
