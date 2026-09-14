# PHASE 4 — STEP 2: Shared `normalizeDegrees()` Extraction

**Scope note (evidence-based, not assumed):** this document covers exactly what Step 2 did —
extracting `normalizeDegrees()` into the neutral `src/precision.ts` layer. `signOfLongitude()` and
`signDegreeOfLongitude()` were **not** part of Step 2 — they were extracted one step later, at
**Step 3**, for a different, later-discovered reason (enabling `vedic/rashi.ts` to reuse Western's
sign-mapping math without violating school isolation). This is confirmed by the source code's own
contemporaneous doc comments in `precision.ts` (`normalizeDegrees`: "Trích xuất ở Phase 4 Step 2";
`signOfLongitude`: "ở Phase 4 Step 3"), not reconstructed after the fact. See
`PHASE4_STEP3_RASHI.md` §"Architecture inspection, Finding 2" for that extraction's own record —
it is not repeated here as Step 2 history.

## What Step 2 did

Extracted `normalizeDegrees(value: number): number` — a pure geometry function normalizing any
degree value to `[0, 360)` — out of **five independent, byte-for-byte identical implementations**
into a single definition in `src/precision.ts`.

## The five original duplicate implementations (verified by direct repository search, not assumed)

Per the engagement's own working rule at the time ("Không giả định số lượng là 5 chỉ dựa trên
audit. Xác minh bằng repository search" — do not assume the count of 5 from a prior audit alone;
verify by fresh repository search), the count and byte-identical nature of all five copies was
re-confirmed via direct grep/read immediately before extraction, not carried over from an earlier
audit's claim:

1. `src/western/aspects.ts`
2. `src/western/housePlacement.ts`
3. `src/western/houses.ts`
4. `src/western/zodiac.ts`
5. `src/astronomical/providers/SwissEphemerisProvider.ts`

All five were confirmed identical before any file was touched. Since they matched exactly, there
was no discrepancy to resolve — the task's own rule ("Nếu phát hiện các duplicate implementation
KHÔNG hoàn toàn giống nhau: STOP") never triggered.

## Extraction target and rationale

`src/precision.ts` — not `western/`, not `astronomical/providers/`, and not a new `vedic/` file
(which didn't exist yet at Step 2). This follows ADR-003 (School Isolation) directly: the ADR
requires that "genuinely shared math (e.g. generic angle-difference/orb-matching utilities) must
live in a neutral shared utility module, not duplicated per school," and that "this utility module
must contain zero astrological judgment, only geometry." `normalizeDegrees()` fits this exactly —
pure modular arithmetic, no sign/house/aspect/ayanamsa/Nakshatra knowledge — and `precision.ts` was
already the project's established neutral-utility file (angular tolerance constants, rounding
helpers) since Phase 1, making it the natural home rather than a new module.

## Behavior preservation — the `-0` edge case, explicitly characterized and kept, not "fixed"

The extraction was a pure refactor: the algorithm was carried over verbatim, including one
pre-existing floating-point edge case, confirmed by direct execution *before* extraction, not
assumed from reading the code:

```js
const wrapped = value % 360;
return wrapped < 0 ? wrapped + 360 : wrapped;
```

For an exact negative multiple of 360 (e.g. `-360`, `-720`), JavaScript's `%` operator itself
returns `-0` (negative zero), and `-0 < 0` evaluates to `false` — so the `+ 360` branch never runs,
and the function returns `-0`, not positive `0`. This behavior was deliberately **preserved, not
corrected**: no evidence was found of any call site depending on the sign of zero, `-0 === 0` holds
in every normal JavaScript comparison/arithmetic context, and changing it would have been an
unrequested behavior change during what was scoped as a pure extraction.

## Migration of callers

All five original files had their local `function normalizeDegrees(...)` definition deleted
outright and replaced with an import:
- `western/aspects.ts`, `western/housePlacement.ts`, `western/houses.ts`, `western/zodiac.ts` →
  `import { normalizeDegrees } from "../precision.js";`
- `astronomical/providers/SwissEphemerisProvider.ts` →
  `import { normalizeDegrees } from "../../precision.js";` (deeper relative path)

No caller's own logic changed beyond this import swap — each file's use of `normalizeDegrees(...)`
at its call sites is untouched.

## Tests added

A dedicated characterization suite was written in `src/__tests__/precision.test.ts` **before** any
caller was migrated (the required order for this engagement: characterize existing behavior first,
then migrate, so the tests prove behavior preservation rather than describe a new implementation).
Nine tests: positive values in `[0, 360)` unchanged; negative values wrapped by one `+360`; values
`> 360` reduced correctly; values `< -360` reduced correctly (multiple negative wraps); exactly `0`;
exactly `360` (confirmed positive `0`, not `-0`); the `-0` quirk for exact negative multiples of 360
explicitly asserted (`Object.is(normalizeDegrees(-360), -0) === true`); floating-point precision
preserved (no intermediate rounding); determinism (repeated calls with the same input agree).

## Validation result

After migration, confirmed by direct grep (not assumed): exactly one remaining
`function normalizeDegrees` definition in the entire `src/` tree (in `precision.ts`), and all five
former call-site files import it rather than defining their own copy. `sweph`'s import remained
isolated to exactly `SwissEphemerisProvider.ts` throughout — Step 2 did not touch that boundary.
Full test suite green, typecheck clean, build clean at the time (Step 2 was reviewed and accepted
before Step 3 began).

## School-isolation rationale

Placing the function in `precision.ts` — a file both `western/` and (from Step 3 onward) `vedic/`
import from — rather than in either school's own directory, means neither school has to duplicate
this geometry or import from the other school's code to get it. This is the same principle Step 3
later applied to `signOfLongitude`/`signDegreeOfLongitude` for the identical reason, one step later
and for a concrete, then-newly-arising need (Vedic Rashi calculation) — not something Step 2 itself
anticipated or built ahead of time.

## No Vedic calculation feature was introduced by Step 2

Step 2 was a pure internal refactor of an already-existing, already-tested piece of Western/
provider-layer geometry. No `vedic/` directory, file, type, or calculation existed yet at this
point in the engagement — Step 2 predates Step 3 (the first actual Vedic calculation code) entirely.
Nothing about ayanamsa, Rashi, Nakshatra, or Dasha was touched, added, or anticipated by this step.
