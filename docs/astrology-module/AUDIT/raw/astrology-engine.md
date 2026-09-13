# Source-Code Audit: `astrology-engine` (Dominec369/astrology-engine)

Local clone: `C:\ccaudit\repos\astrology-engine` (shallow, depth=1; single commit `6074945` visible, dated `Thu Jul 2 11:54:03 2026 -0600`, author "Dominec369" `dominec369@users.noreply.github.com`). The entire repository is **3 Python source files** (`calculator.py`, `config.py`, `formatter.py`) plus `setup.py` and one test file — every line of source in the repo was read in full for this audit.

## Summary Verdict

`astrology-engine` is a small, single-file-per-concern Python wrapper around Swiss Ephemeris (via `swisseph`/`pyswisseph`) that computes natal charts, transits, aspects, synastry, and transit-to-natal comparisons across 11 house systems, with a permissive MIT license that poses no commercial-use obstacle. It is honestly scoped — the README explicitly lists returns, progressions, harmonics, and a web API as unimplemented roadmap items — and it ran successfully end-to-end for this audit's benchmark input, producing planetary longitudes and an Ascendant that agree with the independently-implemented `stellium` repo to four decimal places. However, it shows clear signs of being a **stripped extraction of a larger, non-open-sourced project** rather than a ground-up open-source library: the shipped test file hardcodes an absolute path unique to the original author's private machine (`/home/dominec369/deerflow-output/astrology-engine-open-source`), its own `requirements.txt`/`setup.py`/README all specify the wrong PyPI package name for its core dependency (`swisseph`, which resolves to an unrelated, empty, "claimed for future use" placeholder package rather than the real Swiss Ephemeris binding, `pyswisseph`) — meaning a user who follows the README's own install instructions verbatim (`pip install swisseph pytz`) gets a broken library — and it ships zero ephemeris data files, so optional bodies like Chiron fail silently. Its code is clean and readable but architecturally shallow (three flat modules, no class hierarchy, no protocol/engine abstraction, no essential-dignities/sect/traditional-astrology support at all), and its "29 years of astrological practice" marketing framing in the README is unverifiable from source and should be treated as **CLAIMED BUT NOT VERIFIED**.

## License

- File: `LICENSE` (1,088 bytes) — full text of the **MIT License**, copyright "(c) 2025 Dominec369" (verified by reading the file: `MIT License\n\nCopyright (c) 2025 Dominec369\n\nPermission is hereby granted, free of charge...`).
- `setup.py` line 36: `license="MIT"`, and classifier `"License :: OSI Approved :: MIT License"`.
- **Commercial/closed-source SaaS compatibility: NO BLOCKER.** MIT is one of the most permissive licenses available — it permits commercial use, modification, and closed-source redistribution, with the only obligation being to retain the copyright/permission notice. This is straightforwardly compatible with a closed-source commercial web backend. (Standard caveat: this is not a substitute for the user's own legal counsel confirming compliance, e.g. retaining the LICENSE notice in distributed copies, but there is no ambiguous or copyleft term here requiring escalation.)

## Dependencies

`requirements.txt` (16 bytes, verbatim):
```
swisseph
pytz
```
`setup.py` `install_requires=["swisseph", "pytz"]`. README says: `pip install swisseph pytz`.

**Critical dependency defect, verified by execution**: the PyPI package literally named `swisseph` is **not** the Swiss Ephemeris binding this code needs. We ran `pip download swisseph --no-deps` during this audit and it resolved to `swisseph-0.0.0.dev1`, whose own `PKG-INFO` reads:
```
Name: swisseph
Version: 0.0.0.dev1
Summary: Alternate package to pyswisseph (claimed for future use)
Home-page: https://pypi.org/project/pyswisseph/
Author: Jonathan de Jong
```
Unpacking that sdist shows it contains **no Python module and no compiled extension at all** — just packaging metadata. `calculator.py` line 15 does `import swisseph as swe`; if a user installs exactly what this repo's own `requirements.txt`/`setup.py`/README tell them to install, that import fails immediately (`ModuleNotFoundError` or an empty stub, depending on pip resolution). The real, actively-maintained package that provides the `swisseph` module with actual Swiss Ephemeris bindings is **`pyswisseph`** (author Stanislas Marquis / astrorigin.com) — we had to substitute `pip install pyswisseph pytz` ourselves to get this repo running at all in this audit (resolved version `2.10.3.2`). **This is a concrete, reproducible packaging bug, not a documentation nitpick**: as shipped, the library's stated installation instructions do not produce a working install.
- `pytz` — correctly specified, current version resolves fine (`2026.3.post1` in our test env), actively maintained.
- No other dependencies. The library is deliberately "dependency-free beyond `swisseph` and `pytz`" per its own README Contributing section — a reasonable minimalist choice once the naming defect above is fixed.
- No ephemeris data files ship with the repo (no `data/` or `.se1` files anywhere) — the library relies entirely on `pyswisseph`'s bundled Moshier/JPL fallback support, which is sufficient for the classical 10 planets + nodes but **not** for Chiron (see Feature Table).

## Feature Table

| Feature | Supported | Implementation evidence | Tested | Notes |
|---|---|---|---|---|
| Tropical zodiac | SUPPORTED | `formatter.py` `get_sign()` — fixed 30°-per-sign lookup against `config.SIGNS`; `config.py` docstring: "This module contains public-domain astrological reference data... Tropical zodiac" | Yes (`test_open_source.py::test_formatter`, ran live) | |
| Sidereal zodiac | **NOT PRESENT** | No ayanamsa constant, no `swe.set_sid_mode` call, no sidereal parameter anywhere in `calculator.py`/`config.py` | N/A | Not mentioned in README either — honestly absent, not falsely claimed |
| Planets Sun–Pluto | SUPPORTED | `calculator.py` lines 30–41, `PLANETS` dict mapping all 10 classical+modern planets to `swe.*` constants | Yes, ran live for benchmark input | |
| Nodes (True/Mean) | SUPPORTED | `calculator.py` lines 44–48, `ADDITIONAL_POINTS = {"True Node": swe.TRUE_NODE, "Mean Node": swe.MEAN_NODE, "Chiron": swe.CHIRON}` | Yes, ran live (both nodes returned correctly) | |
| Chiron | **CLAIMED BUT BROKEN IN PRACTICE** | Same `ADDITIONAL_POINTS` dict includes Chiron, wrapped in `try/except Exception: pass` (lines 230–237, 287–293) | Executed and confirmed failing | Verified live: `swe.calc_ut(jd, swe.CHIRON, ...)` raises `SwissEph file 'seas_18.se1' not found` because no ephemeris data ships with the repo; the bare `except Exception: pass` swallows this, so Chiron **silently disappears from chart output** with no warning to the caller — a real correctness/UX defect, not just a missing-file inconvenience |
| Lilith / Part of Fortune / Vertex / other lots | **NOT PRESENT** | No entry in `PLANETS`, `ADDITIONAL_POINTS`, or anywhere in `config.py`; `_calc_houses()` in `calculator.py` (lines 117–154) returns `vertex` from `swe.houses()`'s `ascmc[3]` array slot but it is **never surfaced** by `calculate_natal()`'s returned dict beyond the raw `houses` sub-dict — not exposed as a first-class point, no lots/Arabic Parts calculation exists at all | N/A | Vertex is technically computed (present in the `houses` dict returned by `_calc_houses`) but not treated as a chart point/aspect participant anywhere |
| Houses — exact list | SUPPORTED, **11 systems** | `calculator.py` lines 64–78, `HOUSE_SYSTEMS` dict: Placidus (P), Equal (E), Whole Sign (W), Regiomontanus (R), Koch (K), Campanus (C), Equal (MC) (A), Alcabitius (B), Morinus (M), Horizontal (H), Meridian (X) | Yes — `test_open_source.py::test_multiple_house_systems` asserts exactly 11 systems and iterates all of them; independently confirmed live for all 11 in this audit | Thin wrapper directly over `swe.houses(jd, lat, lon, code)` — correct but adds no logic beyond system-code validation |
| Ascendant / MC | SUPPORTED | `_calc_houses()` returns `ascendant`/`mc` straight from `swe.houses()`'s `ascmc` array | Yes, ran live; also cross-validated: `29°Sagittarius 40'` for the README's own Oprah-Winfrey-style demo matches the library's self-test assertion `abs(h["ascendant"] - 269.68) < 2.0` | |
| Aspects — major | SUPPORTED | `config.py` `ASPECTS` dict: Conjunction, Opposition, Trine, Square, Sextile (lines 100–129) | Yes, ran live (26 aspects found for benchmark chart) | |
| Aspects — minor | SUPPORTED | Same `ASPECTS` dict also includes Quincunx, Semi-square, Sesquiquadrate (lines 130–147) | Yes, ran live | No quintile/biquintile/septile/novile family |
| Orb rules | SUPPORTED, fixed (not planet-weighted) | `config.py` — flat orb per aspect type only (Conjunction/Opposition/Trine/Square 8°, Sextile 6°, Quincunx 3°, Semi-square/Sesquiquadrate 2°); `ASPECT_MATCH_ORDER` sorts widest-orb-first so a borderline case matches the widest qualifying aspect first | Yes (`test_open_source.py::test_edge_cases` checks boundary cases at 355°/2° and exact 90°) | No per-planet orb variation (contrast with Stellium's Lilly/Ptolemy moiety tables) — simpler, less traditionally rigorous |
| Applying/separating logic | **NOT PRESENT** | `_check_aspect()` (lines 340–364) computes only static angular separation and orb; no use of `speed_long` (which is captured in `_calc_position()` but only surfaced as `is_retrograde`) to determine applying/separating | N/A | A real gap versus professional astrology software |
| Aspect strength/scoring | **NOT PRESENT** (beyond orb tightness itself) | No weighting/scoring function found; `config.py` does define `PLANET_WEIGHTS` (lines 158–169) but it is **never referenced or used anywhere in `calculator.py` or `formatter.py`** — dead/unused data | N/A | `PLANET_WEIGHTS` is CLAIMED (present in config, implies "used for overall chart interpretation" per its own comment) BUT NOT VERIFIED / actually wired into any function — grep-confirmed unused |
| Dignity: domicile/exaltation/detriment/fall | **NOT PRESENT** (beyond a bare rulers table) | `config.py` `RULERS` dict (lines 70–83) gives sign rulers only (with inline comments noting modern-vs-traditional divergence for Scorpio/Aquarius/Pisces); `TRIPLICITY_RULERS` dict (lines 87–92) exists but is **also never used anywhere** in `calculator.py`; no exaltation, detriment, or fall tables exist at all; the module's own comment (line 85) literally says `"Dignities (Essential Dignities by Triplicity, Term, etc. - placeholder)"` | N/A | Self-documented as a placeholder — not a hidden gap, an admitted one |
| Traditional astrology: sect, bounds/terms, decans, profections, zodiacal releasing, lots | **NOT PRESENT** | No sect calculation (no day/night determination anywhere), no terms/bounds table, no decan table, no profection/time-lord logic, no releasing, no Arabic Parts/lots calculation in any of the 3 modules | N/A | None of these are claimed in the README either — an honest gap |
| Transit | SUPPORTED | `calculator.py` `calculate_transits()` (lines 251–300) | Yes, ran live | |
| Synastry | SUPPORTED | `calculate_aspects(positions1, positions2)` (lines 303–337) explicitly supports two-chart comparison; README labels this "Synastry" | Yes (`test_open_source.py::test_synastry_aspects`, ran live) | |
| Transit-to-natal | SUPPORTED | `calculate_transit_to_natal()` (lines 367–423) — combines `calculate_transits()` + `calculate_aspects()` against stored natal data | Yes (`test_open_source.py::test_transit_to_natal`, ran live) | |
| Progressions (secondary/solar arc) | **NOT PRESENT** | Explicitly listed under README's own "Roadmap" as unimplemented: "Primary and secondary progressions" | N/A | Honestly disclosed as not-yet-built |
| Return charts (solar/lunar) | **NOT PRESENT** | Explicitly listed under README's own "Roadmap": "Solar and lunar returns" | N/A | Honestly disclosed as not-yet-built |
| Retrograde detection | SUPPORTED | `_calc_position()` sets `is_retrograde = speed_long < 0` | Yes, ran live (Saturn/Pluto correctly flagged retrograde for benchmark chart) | |

## Calculation vs Rule vs Interpretation Layers

This is almost entirely a **calculation layer** with a thin sliver of rule logic and essentially no interpretation layer:

1. **Calculation** — `calculator.py::_calc_position()` and `_calc_houses()` call `swe.calc_ut()`/`swe.houses()` directly and return bare numeric dicts (longitude, latitude, distance, speed). This is the bulk of the codebase.
2. **Rule logic** — very minimal. The clearest example is `_check_aspect()`'s orb-matching loop (`config.py`'s `ASPECT_MATCH_ORDER`, widest-orb-first, "only match the tightest applicable aspect" — `calculator.py` line 364's `break`), and `_get_house_of_position()`'s cusp-interval containment test with wraparound handling (lines 157–180). Both are genuine if/then astrological rules operating on calculated numbers, but there is no dignity/sect/traditional rule layer at all — `TRIPLICITY_RULERS` and `PLANET_WEIGHTS` exist as *data* in `config.py` but are dead code, never consumed by any rule function.
3. **Interpretation** — `formatter.py::format_aspect()` returns a single canned sentence per aspect type from a fixed `keyword` string in `config.py` (e.g., `"Conjunction... Union, blending, intensity"`) — this is the closest thing to "interpretation," and it is a static one-line keyword per aspect *type*, not a synthesized reading of the actual chart. There is no natural-language chart narrative, no LLM-prompt export analogous to Stellium's `to_prompt_text()`, and no template system. A commercial product would need to build essentially the entire rule and interpretation layer on top of this repo's raw calculations.

## Tests

`test_open_source.py` exists — **not** "NO TEST SUITE FOUND." It is a single 470-line script (not a `pytest`-discovered suite; run via `python test_open_source.py`, using bare `assert` statements and a hand-rolled `main()` runner) that tests against **one real public figure's birth data** (Oprah Winfrey, Jan 29 1954, sourced to AstroDatabank per its own comment) plus synthetic edge cases.

Quoted directly from the file's own module docstring:
```
Tests all core calculation functions using a well-known public figure's
birth data to verify internal consistency and correctness.

Key verifications:
- Placidus house calculation produces correct ASC (= Cusp 1) and MC (= Cusp 10)
- Planetary positions are within valid ranges
- Aspects are calculated correctly
- Transits and transit-to-natal work
- Retrogrades are detected
```
Concrete quoted test (boundary-crossing aspect logic):
```python
def test_edge_cases():
    ...
    p1 = {"PlanetA": {"longitude": 355.0}}
    p2 = {"PlanetB": {"longitude": 2.0}}
    aspects = calculate_aspects(p1, p2)
    matching_conj = [a for a in aspects if a["aspect"] == "Conjunction"]
    assert len(matching_conj) > 0, \
        "Planets at 355° and 2° should form a conjunction (7° apart)"
```
**What these tests actually verify**: internal self-consistency (does Cusp 1 equal the reported Ascendant? do angle/orb computations match a hand-computed expected value? are outputs in valid numeric ranges?) and a few hardcoded numeric assertions tied to one specific chart (e.g. `assert abs(h["ascendant"] - 269.68) < 2.0`). **This is not the same as astronomical-reference-value testing** (there is no cross-check against an independently published ephemeris, no NASA JPL Horizons comparison, no test asserting Mercury never exceeds ~28° elongation from the Sun, etc., the way Stellium's ground-truth suite does). It is a reasonable, non-trivial internal-consistency test script, one tier below a professional-grade regression/ground-truth suite.

**Hardcoded environment path defect**: `test_open_source.py` line 20 reads:
```python
sys.path.insert(0, "/home/dominec369/deerflow-output/astrology-engine-open-source")
```
This is an absolute path on the original author's own machine/environment (note the directory name `astrology-engine-open-source`, and `deerflow-output` — suggestive of an automated agent-driven extraction/build pipeline). It is dead code in the sense that `sys.path.insert(0, ".")` (the actual working directory) is what makes imports succeed when run from the repo root — this line does nothing useful for any other user and is direct evidence this file (and plausibly the whole repo) is a **generated/extracted artifact from a larger private project**, not code written natively for public GitHub.

**Executed in this audit**: ran `test_open_source.py`'s full `main()` against the repository's own Oprah Winfrey fixture (not the Vietnam benchmark, which the test file does not use) — **all tests passed** (`ALL TESTS PASSED ✓`, confirmed via direct execution with `PYTHONIOENCODING=utf-8` to work around a Windows-console Unicode issue in the test's own print statements — not a bug in the library, just a console-encoding mismatch for `✓`/`°` characters on Windows).

## Execution Attempt Results — VERIFIED BY EXECUTION

Environment: fresh venv (`C:\ccaudit\venv_ae`), Python 3.14.6 (Windows). `requirements.txt`/README's stated install command (`pip install swisseph pytz`) was attempted first and confirmed broken as described above; we substituted `pip install pyswisseph pytz` (resolved `pyswisseph 2.10.3.2`, `pytz 2026.3.post1`) to proceed.

Benchmark input: Birth Date 1985-03-12, Time 08:30, Lat 21.0285, Lon 105.8542, `Asia/Ho_Chi_Minh`.

```python
from calculator import calculate_natal
chart = calculate_natal(
    birth_date=date(1985,3,12), birth_time=time(8,30,0),
    latitude=21.0285, longitude=105.8542, timezone_str="Asia/Ho_Chi_Minh",
)
```

**Actual output (planet longitudes, tropical, Placidus houses):**

| Planet/Point | Sign | Sign° | Longitude° | House | Retrograde |
|---|---|---|---|---|---|
| Sun | Pisces | 21°25′ | 351.4222 | 11 | No |
| Moon | Sagittarius | 0°0′ | 240.0113 | 7 | No |
| Mercury | Aries | 8°25′ | 8.4178 | 12 | No |
| Venus | Aries | 22°14′ | 22.2384 | 12 | No |
| Mars | Aries | 27°42′ | 27.7061 | 12 | No |
| Jupiter | Aquarius | 7°14′ | 307.2432 | 10 | No |
| Saturn | Scorpio | 28°6′ | 238.1087 | 7 | **Yes** |
| Uranus | Sagittarius | 17°56′ | 257.9333 | 8 | No |
| Neptune | Capricorn | 3°27′ | 273.4562 | 9 | No |
| Pluto | Scorpio | 4°25′ | 214.4195 | 6 | **Yes** |
| True Node | Taurus | 19°57′ | 49.9600 | 1 | No |
| Mean Node | Taurus | 21°26′ | 51.4381 | 1 | **Yes** |
| **Ascendant** | Taurus | 5°32′ | 35.5425 | — | — |
| **MC** | Capricorn | 26°0′ | 296.0035 | — | — |

Chiron: **absent from output** — confirmed by direct testing that `swe.calc_ut(jd, swe.CHIRON, ...)` raises `SwissEph file 'seas_18.se1' not found in PATH '/usr/share/swisseph:/usr/local/share/swisseph'`, silently caught by the library's `except Exception: pass`.

House system: Placidus. Julian day: `2446136.5625`. Full 12-cusp array captured during this audit.

**Cross-validation**: independently-implemented `stellium` repo (separate audit, separate codebase, same Swiss Ephemeris backend) computed the same benchmark input and returned Sun = 351.4222°, Moon = 240.0111°, Ascendant = 35.5425° — agreeing with this repo's output to 4 decimal places (the tiny Moon discrepancy, 240.0113 vs 240.0111, is within normal floating-point/flag-configuration noise). As noted in the Stellium report, this cross-check confirms application-level correctness (Julian day conversion, timezone handling, house-cusp math) for this input on both sides; it is not an independent astronomical proof since both tools call the same underlying `swisseph` C library.

## Maintenance

- Shallow clone limits git history to one commit (`6074945`, dated `Jul 2 2026`); **cannot verify true commit cadence or contributor count from git alone.**
- No `CHANGELOG.md`, no `CITATION.cff`, no `.github/workflows` (no CI configured at all — confirmed by directory listing: the only top-level items are `LICENSE`, `README.md`, `calculator.py`, `config.py`, `formatter.py`, `requirements.txt`, `setup.py`, `test_open_source.py`).
- Single named contributor visible ("Dominec369"); README claims "29 years of astrological practice distilled into code" — **CLAIMED BUT NOT VERIFIED** from source; nothing in the code itself substantiates or contradicts this personal/biographical claim.
- README's own Roadmap section lists 8 unimplemented items (lunar phases/VOC Moon, solar/lunar returns, progressions, harmonics/midpoints, fixed stars, CLI, PDF reports, web API) — an honestly-labeled early-stage project, not a feature-complete product.
- The hardcoded `/home/dominec369/deerflow-output/astrology-engine-open-source` path in the test file (see Tests section) and the README's mirrored GitHub/Gitee (China-accessible mirror) publishing strongly suggest this is a **deliberately-carved-out open-source subset of a larger private codebase** ("No business logic, no proprietary algorithms" appears verbatim in both `calculator.py`'s and `formatter.py`'s module docstrings) rather than an from-scratch community project — consistent with the README's own framing ("由 Dominec369 开发" / "由... 开发" = "developed by") of this as one person's release cut from bigger private work.

**Classification: EXPERIMENTAL / EARLY-STAGE.** One commit visible, no CI, no changelog, a broken default dependency install, and an explicit unimplemented-features roadmap — this reads as a young, single-purpose extraction rather than an actively maintained open-source project, though nothing in the evidence suggests it is abandoned (it is simply too new/thin to classify as ACTIVE or STABLE with confidence, and the missing CI/history means "abandoned" cannot be ruled in or out either — treat activity level as **UNKNOWN / NOT VERIFIED** beyond "young").

## Code Quality

| Dimension | Score (0–10) | Justification |
|---|---|---|
| Architecture | 4 | Flat, functional (three modules, no classes except implicit dict-based "config objects"); reasonable for its current scope but has no abstraction layer for swapping house systems, ephemeris backends, or aspect rule sets — every consumer must work directly with `calculator.py`'s function signatures |
| Modularity | 6 | Clean 3-way split (calculation / config-data / formatting) is sensible and the docstrings explicitly state each module's single responsibility ("No business logic, no proprietary algorithms" in `calculator.py` and `formatter.py`) — but there is no package structure (flat top-level `.py` files, `py_modules=` not `packages=` in `setup.py`), which will not scale past its current 3-file size |
| Typing | 6 | Consistent use of `from __future__ import annotations`, `Optional`/`List`/`Dict`/`Any`/`Tuple` type hints on every public function signature in `calculator.py` — genuinely typed for its size; no static type checker (mypy/pyright) configured anywhere to verify these hints are correct |
| Docs | 6 | Every function has a docstring with Args/Returns; README is thorough with real example output blocks and a module table — but there is no generated API reference site, no Sphinx/MkDocs config, and (per the Dependencies/Tests sections) the README's own install instructions are unverified and in fact broken |
| Separation of concerns | 5 | Calculation vs. formatting is cleanly separated (`calculator.py` never formats strings, `formatter.py` never calls `swe.*`); but rule-layer data (`TRIPLICITY_RULERS`, `PLANET_WEIGHTS`) sits in `config.py` unused and disconnected from any actual rule function — a half-finished layer, not a clean one |
| Extensibility | 3 | Adding a new house system, dignity table, or points requires directly editing `calculator.py`'s hardcoded `PLANETS`/`ADDITIONAL_POINTS` dicts and `HOUSE_SYSTEMS` dict; no plugin/protocol mechanism exists, unlike Stellium's engine-swap architecture |
| Error handling | 4 | `_calc_houses()` does raise a proper `ValueError` with a clear message for an invalid house-system code (verified live in this audit); but the `ADDITIONAL_POINTS` loop in both `calculate_natal()` and `calculate_transits()` uses a bare `except Exception: pass` (lines 235–237, 292–293) that **silently drops any body that fails to compute** (confirmed live: this is exactly what happens to Chiron) with zero logging or warning surfaced to the caller — a real defect for a chart-calculation library, since a caller has no way to know a requested point is missing from the result short of checking dict membership themselves |

## Security

- **No `eval`/`exec`/`os.system`/`subprocess`/`pickle` usage anywhere** in the 3 source files (verified by direct grep of the full, small codebase — nothing found).
- **No network calls** — the library takes lat/lon as numeric input directly (no geocoding step, unlike Stellium's `Nominatim` integration), so there is no outbound network/privacy surface for birth-location data at all within this code.
- **User-supplied birth data handling**: `calculate_natal()` requires the caller to pass a timezone-aware-capable `timezone_str` (IANA string) and raw `date`/`time` objects; `_julian_day()` raises `ValueError` if given a naive datetime without a timezone. No string is ever interpolated into a shell command, SQL query, or template — all downstream use is numeric (Julian day floats, lat/lon floats passed straight to `swe.*` C functions). No injection surface identified.
- **Silent failure as a security-adjacent concern**: the bare `except Exception: pass` around optional-body calculation (see Code Quality/Error handling above) is not a classic vulnerability, but for a service handling paid users' birth data it is a **data-integrity risk worth flagging**: a caller cannot distinguish "Chiron is genuinely absent from this chart" from "Chiron calculation silently failed" — for a commercial product this should be replaced with explicit logging or a typed result (e.g., `Optional[PlanetPosition]` with a reason) before shipping to customers.
- No hardcoded secrets, API keys, or credentials found.

## Tier Recommendation

**Tier C — Specialized** (usable only as a narrow reference/starting point, not as a foundation).

Justification: MIT licensing removes any legal blocker, and the core calculation logic that *is* implemented (natal charts, transits, aspects, synastry, transit-to-natal, 11 house systems) is correct for the cases tested — confirmed by live execution and cross-validated against an independent tool to 4 decimal places. However, it is (a) missing the entire traditional-astrology rule layer (no sect, no dignities beyond an unused rulers table, no bounds/terms/decans, no profections/releasing/lots) that a "professional commercial astrology engine" would need, (b) missing progressions and returns entirely (both on its own README roadmap), (c) shipped with a **broken default dependency install** (`swisseph` vs. `pyswisseph`) that a team could easily copy verbatim into their own build and get a non-working service, (d) evidences telltale signs of being a stripped extraction from a larger private codebase (hardcoded foreign machine path in the test file) rather than a maintained community project, with no CI and unverifiable maintenance cadence, and (e) has a real silent-failure defect (bare `except: pass` dropping Chiron without warning) that would need fixing before production use. Recommended use, if any: as a **small, easy-to-read reference implementation** for the calculation-layer basics (Julian day conversion, Swiss Ephemeris calling conventions, house-cusp-to-planet assignment, orb-matching logic) when building a from-scratch engine — not as a dependency or foundation to build directly on top of.
