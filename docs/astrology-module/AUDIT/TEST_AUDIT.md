# TEST SUITE AUDIT

Per-repo test rigor, classified per the brief's requested categories: unit, integration, golden/reference, astronomical-reference, timezone/DST, boundary-date, leap-year, historical-timezone, polar-latitude, midnight, retrograde-station, sign-boundary, house-cusp-boundary. Where a category was not found, it is marked NOT PRESENT rather than assumed.

## Swiss Ephemeris core / pysweph

- **Swiss Ephemeris C core**: ships a genuine native regression-test harness (`setest/setest.c`, `testdata.c`, `.m4`-generated suite) with reference test data — a real golden-value framework. Coverage extent not independently measured (would require a full C build) → **NOT VERIFIED BY EXECUTION** for coverage %, but existence confirmed by source inspection.
- **pysweph/pyswisseph**: one test file per wrapped `swe_*` function. **pysweph's own maintainers currently flag this suite as deprecated/stale** (as of 2026-02-06, per its own README) due to a breaking API patch (house-cusp tuple shape) not yet reflected in tests — **IMPLEMENTED, TEST COVERAGE CURRENTLY UNRELIABLE per maintainer's own admission.**
- No dedicated leap-year/DST/polar-latitude/sign-boundary tests found in either wrapper's suite specifically (SE core's own suite may cover some of this at the C level — not independently confirmed).

## Per-repo summary

| Repo | Test count (live-run) | Golden/reference values? | Cross-validated vs. independent source? | Notable gaps |
|---|---|---|---|---|
| stellium | 91 files; 162 executed live (0 fail) + 47/43 pass/skip on ground-truth suite | ✅ — dedicated `test_astronomical_ground_truth.py`: geometric impossibilities, periodicities, NASA JPL Horizons cross-checks (worst disagreement claimed 2 arcsec, not independently re-derived here) | ✅ Horizons (claimed, partially verified) | No dedicated DST/polar-latitude/leap-year test files found by name, though the ground-truth suite's "impossibilities" tests are conceptually adjacent |
| PyJHora | 3,104 tests observed passing live (0 fail, suite not run to completion — file is 9,114 lines) | ✅ — textbook golden values (BV Raman/VP Jain books), literal numeric/date expected values | ✅ — real historical/public figures' charts used as fixtures (e.g. "A.B. Vajpayee") | Suite requires interactive confirmation by default; not wired into standard pytest/CI; coupled to global mutable config (fragile for parallel CI) |
| vedic-calc | 455/459 passed locally (4 failures = Windows `strftime` bug in SVG rendering, not calculation) | ✅ — hand-computed/pinned expected values (e.g. KP star/sub/sub-sub lord chains) | ✅✅ — **the most rigorous cross-validation found in this audit**: an optional suite against PyJHora directly, PLUS a disclosed benchmark against two **commercial APIs** (AstrologyAPI.com, Prokerala) across 1,015 assertions on 10 real charts, 99.0% pass with the 10 failures itemized by chart (not hidden) | Benchmark is a frozen March-2026 snapshot, not continuously re-run |
| mayaastrolib | 660/664 passed locally (4 failures = concurrency/floating-point divergence on unsupported Python 3.14) | ✅ — golden tests vs. **Skyfield/JPL DE440s** for 7 real historical charts (Einstein, Kahlo, Amundsen, Jung, Monroe, Diana Spencer, Obama), ±2 arcmin tolerance | ✅ — independent ephemeris (Skyfield), not just Swiss-Ephemeris-self-consistency | mypy-clean, ruff-clean (independently verified); self-consistency invariant tests (houses sum 360°, cusps ordered) |
| openastrology-library | 316/526 passed with no `.se1` files present (210 failures traced to missing-ephemeris-file handling, not formula bugs) | ✅ — hardcoded DMS reference values per divisional chart (18 dedicated per-varga test files) | Not verified against a source outside Swiss Ephemeris itself | Full-precision correctness (with real `.se1` files) **NOT VERIFIED BY EXECUTION** in this audit |
| opastro | 59/65 passed (6 failures = Windows console/file-encoding artifacts, not logic) | Partial — golden-snapshot SHA-256 hash assertions prove determinism, not astronomical accuracy per se | Not applicable (no separate rules to validate against an external source) | No dedicated `test_ephemeris.py`/`test_renderer.py` unit files — everything tested indirectly through the CLI |
| jyotish-flutter-library-fork | 170 tests across 11 files (**NOT VERIFIED BY EXECUTION** — no Dart/Flutter runtime in this environment) | Some — hand-specified mock charts with known expected dignities/houses | Not verified in this audit | Native/ephemeris-dependent tests require external `.se1` files + native library not bundled — cannot run out of the box even with a Flutter toolchain |
| astrology-engine | Custom hand-rolled script (not pytest), all assertions passed live for the Oprah Winfrey fixture | Partial — internal self-consistency checks (Cusp 1 = Ascendant, etc.) and boundary-crossing edge cases, but **not** cross-checked against an independently published ephemeris | ❌ Not present | One tier below professional-grade regression testing per its own audit's assessment |
| astro-natal-chart | **NO TEST SUITE FOUND** | — | — | Confirmed by recursive search; no `test_*.py`, no CI config anywhere |
| zodiac-engine | 7 files, ~640 lines, all calculation/configuration-focused | Partial — asserts specific string content in generated SVGs, real HTTP status-code checks | ❌ Not present | **Zero tests for the interpretation/LLM code path** — the confirmed-broken interpretation endpoint (§AI_ARCHITECTURE_AUDIT) is entirely unexercised by the project's own test suite |

## Boundary/edge-case category coverage (explicit check against the brief's list)

| Category | Repos with dedicated coverage found |
|---|---|
| Leap year | Not explicitly named/found as a dedicated test in any repo (may be implicitly covered by date-range tests; not independently confirmed) |
| DST transitions | **NOT PRESENT** as a dedicated test in any audited repo — consistent with the finding that none of these libraries handle DST/timezone resolution themselves (see `SWISS_EPHEMERIS_AUDIT.md` §3.4) |
| Historical timezone changes | **NOT PRESENT** anywhere audited |
| Polar latitude | stellium's ground-truth suite conceptually adjacent (geometric impossibility tests); PyJHora's own house-calc code has a documented historical bug fix for high-latitude Placidus precision (Swiss Ephemeris core, pre-2.09) but no dedicated polar-latitude *test* file found in the wrapper repos |
| Midnight/date-boundary | Not explicitly named; astrology-engine's edge-case test (355°/2° aspect wraparound) is angle-boundary, not date-boundary |
| Retrograde station | Not a dedicated named test in any repo, though several (stellium, vedic-calc, PyJHora) compute and correctly flag retrograde as part of their broader suites, cross-validated in this audit's own benchmark (Saturn retrograde, unanimous across 6 engines) |
| Sign boundary (0°/30° crossing) | astrology-engine has an explicit test (355°/2° conjunction across the 0° seam); stellium's CHANGELOG documents a **past real bug** here (`% 180` folding oppositions into conjunctions, undetected for 7 months because tests never checked 180° specifically) — now fixed and covered |
| House-cusp boundary | Not a dedicated named test category in any repo; general house-cusp tests exist broadly |

**Conclusion**: none of the 10 repos has a comprehensive suite covering all the boundary/DST/timezone edge cases the brief lists — this is a **gap the commercial engine's own test suite must fill from scratch**, regardless of which calculation backend is chosen (see `ARCHITECTURE_PROPOSAL.md` for where this responsibility sits — it belongs above the astronomical-core layer, since Swiss Ephemeris itself has no timezone/DST awareness at all).
