# Source-Code Audit: `stellium` (katelouie/stellium)

Local clone: `C:\ccaudit\repos\stellium` (shallow, depth=1; single commit `4df853d` visible, dated `Mon Jul 20 14:55:51 2026 -0700`, author Kate Louie `katehlouie@gmail.com`). All line/file references below point at this checkout.

## Summary Verdict

Stellium is a large, unusually mature, protocol-based Python astrology **library** (not a SaaS or app) that wraps Swiss Ephemeris (`pyswisseph`) and implements a genuinely broad slice of Western (tropical **and** sidereal), Hellenistic/traditional, and Chinese (BaZi) astrology as composable engines, with 17 house systems, full essential-dignity tables, sect, terms/bounds, triplicities, decans, profections, zodiacal releasing, firdaria, primary/secondary directions, arabic parts/lots, returns, synastry, transits, and a from-scratch length-of-life (Hyleg/Alcocoden) module — all backed by a 91-file test suite that includes genuine astronomical ground-truth tests (geometric impossibilities, known periodicities, NASA JPL Horizons cross-checks) rather than only internal-consistency checks. It successfully installed and ran end-to-end for the benchmark chart, and its planetary longitudes and Ascendant agreed with an independent implementation (astrology-engine) to four decimal places. The one hard blocker for a commercial closed-source SaaS is licensing: it is **AGPL-3.0-or-later**, which is very unlikely to be compatible with a closed commercial backend without a separate commercial license from the author — **LEGAL REVIEW REQUIRED** before any use beyond research. Some advertised traditions are only partially real: Zi Wei Dou Shu (紫微斗數) is an explicit stub, and Vedic-specific technique layers (Vimshottari Dasha, Navamsa, moolatrikona) are listed on the maintainer's own TODO as not yet implemented, even though sidereal/ayanamsa calculation itself works today.

## License

- File: `LICENSE` (35,757 bytes) — full text of the **GNU Affero General Public License, Version 3, 19 November 2007** (verified by reading the file header: `GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007`).
- `pyproject.toml` line ~11: `license = { text = "AGPL-3.0-or-later" }`.
- `CITATION.cff`: `license: AGPL-3.0-or-later`.
- **Commercial/closed-source SaaS compatibility: LEGAL REVIEW REQUIRED.** AGPL-3.0 is copyleft and — critically — its network-use clause (§13) extends the GPL's "conveying" trigger to *running the software as a network service*: offering the modified program's functionality to users over a network is treated like distribution, obligating you to offer the complete corresponding source (including your modifications) to those users. For a closed-source commercial phong-thủy web backend, embedding an AGPL-3.0 library as your calculation engine would very likely obligate you to release your backend's source under AGPL too, unless you obtain a separate commercial/dual license from the author or keep the AGPL component fully isolated behind a boundary your counsel is comfortable calling "separate and independent" (a fact-specific determination). Do not treat this as legal advice — get an actual license review before use in a product.

## Dependencies

Core runtime deps (`pyproject.toml`):
- `pyswisseph>=2.10.3` — the real Swiss Ephemeris Python binding (module `swisseph`). Confirms the engine is a **wrapper around Swiss Ephemeris**, not a reimplementation of astronomical math. Verified installable and importable (see Execution section); resolved version in our test env was `2.10.3.2`, current for a Python 3.14 wheel (project's own `requires-python` floor is `>=3.11`; classifiers list 3.11–3.13).
- `pytz>=2024.1`, `python-dateutil` — standard, actively maintained.
- `timezonefinder>=6.5.0` — resolved to `9.0.0`/`timezonefinder_data 3.2026.3` in our install; actively maintained, no abandonment signal.
- `geopy>=2.4.0` — used for geocoding via `Nominatim` (network call; see Security). Actively maintained (2.5.0 resolved).
- `rich>=13.9.0`, `svgwrite>=1.4.3`, `pyyaml`, `typst`, `python-dateutil` — all current, no abandoned/EOL packages detected. `typst` (Python bindings to the Typst typesetting engine) is used to render PDF reports/planners.
- Optional extras: `dev` (pytest, ruff, mypy, black, isort, pre-commit, bump-my-version, pandas, scipy), `docs` (Sphinx-based — note the pyproject comment explicitly documents that the `docs` extra used to reference the wrong tool (`mkdocs` instead of Sphinx) and was fixed — a small but telling sign of active maintenance hygiene), `web` (`nicegui>=1.4.0`), `analysis` (`pandas`).
- No dependency in the manifest showed a version pin suggesting an abandoned/EOL package; `pyproject.toml` even carries an inline comment pinning `ruff<0.16.0` to match the pre-commit config, and calling out that `pytest-codeblocks` is "unmaintained" but only its non-plugin helper function is used, with the plugin explicitly disabled (`-p no:codeblocks`) — again showing active, deliberate dependency hygiene rather than neglect.

**Ephemeris data**: unlike a pure-code wrapper, this repo **bundles real Swiss Ephemeris `.se1` data files** at `data/swisseph/ephe/` (`seas_18.se1`, `seas_24.se1`, `semo_18.se1`, `semo_24.se1`, `sepl_18.se1`, `sepl_24.se1`, `sefstars.txt`) covering Sun–Pluto, Moon, and the main asteroid/Chiron ephemeris for a multi-century window. Additional bodies (named asteroids, centaurs, TNOs) require on-demand downloads (`stellium ephemeris download-asteroid`) — confirmed by 43 tests in `tests/test_astronomical_ground_truth.py` skipping with `ephemeris file not installed` for those bodies in a fresh install, rather than failing.

## Feature Table

| Feature | Supported | Implementation evidence | Tested | Notes |
|---|---|---|---|---|
| Tropical zodiac | SUPPORTED | `src/stellium/core/ayanamsa.py` `ZodiacType.TROPICAL`; default in `ChartBuilder` | Yes (`tests/test_ephemeris_engine.py`, ran live) | Confirmed live: benchmark chart returned `zodiac_type = ZodiacType.TROPICAL` |
| Sidereal zodiac | SUPPORTED | `src/stellium/core/ayanamsa.py` — `AYANAMSA_REGISTRY` with Lahiri, Fagan-Bradley, Raman, etc. (swe sidereal-mode constants) | Yes (`tests/test_vedic_charts.py`) | Ayanamsa offset calc only; Jyotish-specific technique layer (see below) is separate |
| Vedic-specific techniques (Vimshottari Dasha, Navamsa/divisional charts, moolatrikona, Dig Bala) | **NOT PRESENT** (roadmap only) | `TODO.md`: "Implement Vedic dignities engine (moolatrikona, Dig Bala, Navamsa)", "Implement Vimshottari Dasha system" listed under open tasks | N/A | Sidereal *positions* work; Jyotish-specific rule layer does not exist yet |
| Planets Sun–Pluto | SUPPORTED | `src/stellium/core/registry.py` `CELESTIAL_REGISTRY` entries `"Sun"`…; confirmed live output for all 10 | Yes, ran live + `tests/test_celestial_registry.py` | |
| Nodes (True/Mean) | SUPPORTED | `registry.py` lines ~178–200 `"True Node"`, likely `"Mean Node"` | Yes, live | Both computed live (True Node 19°57′ Taurus, house 1) |
| Chiron | SUPPORTED | `registry.py` `"Chiron"` (~line 304); requires `seas_*.se1`, bundled | Yes, live (63.79° Gemini) | Works out of the box because ephemeris file ships with repo (contrast with astrology-engine, which lacks the file) |
| Lilith (Black Moon / Mean Apogee) | SUPPORTED | `registry.py` alias list `["Lilith", "BML", "Black Moon", "Mean Lilith"]`; live output shows `"Mean Apogee"` object | Yes, live | |
| 34 additional bodies (named asteroids, centaurs, TNOs) | SUPPORTED (opt-in, needs downloaded ephemeris) | CHANGELOG `[0.22.0]`: "`CELESTIAL_REGISTRY` goes from 49 to 83… `with_named_asteroids()`… `with_centaurs()`… `with_tnos()`" | Partially — 47 passed / 43 skipped for missing `.se1` files in `tests/test_astronomical_ground_truth.py` in our install | Gracefully skips, doesn't crash, when data absent |
| Part of Fortune / Lots (Arabic Parts) | SUPPORTED | `src/stellium/components/arabic_parts.py` — `ARABIC_PARTS_CATALOG` (Fortune, Spirit, Eros, Necessity, Courage, …), sect-aware flip logic | Yes (`tests/test_arabic_parts.py`) | Formula and sect-flip verified in source |
| Vertex | SUPPORTED | `registry.py` `"Vertex"` (~line 236); live output: Vertex 14.28° Libra, house 6 | Yes, live | |
| Houses — exact system list | SUPPORTED, **17 systems** | `src/stellium/engines/houses.py` `HOUSE_SYSTEM_CODES` dict (lines ~21–37): Alcabitius, APC, Axial Rotation, Campanus, Equal, Equal (MC), Equal (Vertex), Horizontal, Koch, Krusinski, Morinus, Placidus, Porphyry, Regiomontanus, Topocentric, Vehlow Equal, Whole Sign | Yes (`tests/test_house_systems.py`, ran live) | Deliberately excludes Gauquelin ("G") with an explicit code comment explaining it's a 36-sector statistical instrument, not a 12-cusp house system — a correctness-minded design choice |
| Ascendant / MC | SUPPORTED | `models.py` — ASC/MC/DSC/IC/RAMC/Vertex all modeled as `CelestialPosition` objects; confirmed live (ASC 5°32′ Taurus / 35.5425°, MC 26°00′ Capricorn / 296.0035°) | Yes, live | Cross-validated against astrology-engine's independent output for the same input: ASC agreed to 4 decimals |
| Aspects — major | SUPPORTED | `src/stellium/engines/aspects.py` `ModernAspectEngine` | Yes, live (37 aspects found for benchmark chart) | |
| Aspects — minor/harmonic | SUPPORTED | `aspects.py` `HarmonicAspectEngine` (arbitrary harmonic N, e.g. H5/H7/H9); CHANGELOG 0.22.0 mentions dedicated glyphs for 5th/7th/9th harmonics | Yes (`tests/test_aspect_engine.py`) | |
| Aspects — declination (parallel/contraparallel) | SUPPORTED | `aspects.py` `DeclinationAspectEngine` | Yes (`tests/test_declination_aspects.py`) | Explicitly kept separate from the ecliptic-longitude registry to avoid a same-angle collision bug (documented in code comments) |
| Orb rules | SUPPORTED, historically sourced | `src/stellium/engines/orbs.py` — `LILLY_FULL_ORBS` (cites Lilly *Christian Astrology* 1647 p.107, cross-checked against Bonatti/Al-Biruni/Sahl) and `PTOLEMY_FULL_ORBS` (cites Ptolemy *Tetrabiblos*), moiety-based orb averaging | Yes (`tests/test_orb_engines.py`, `test_moiety_orbs.py`) | Orb tables carry primary-source citations in comments, not just numbers |
| Applying/separating logic | SUPPORTED | `aspects.py` `_is_applying()` — analytical relative-velocity method, explicitly designed to avoid 0°/360° seam artifacts | Yes (`tests/test_applying_separating.py`); live output includes `applying=True/False/None` per aspect | Returns `None` when a body is stationary or lacks speed data, rather than guessing |
| Aspect strength/scoring | SUPPORTED (presentation layer) | CHANGELOG `[Unreleased]`: "PDF aspectarian shows orb strength" — tightness relative to that aspect's allowed orb, rendered as ring strength | Not independently verified beyond changelog | Presentation feature, not a hidden interpretive score |
| Essential dignities: domicile/exaltation/detriment/fall | SUPPORTED | `src/stellium/engines/dignities.py` `TraditionalDignityCalculator.calculate_dignities()` (lines 407–540ff): rulership +5, exaltation +4 (with +1 exact-degree bonus), detriment −5, fall −4 | Yes (`tests/test_dignities.py`, full docstring quoted below) | |
| Triplicity, terms/bounds (Egyptian), decans (Chaldean & triplicity variants) | SUPPORTED | Same class: triplicity ruler by sect (+3) / participating ruler (+2); `bound_egypt` table lookup (+2); `decan_chaldean`/`decan_triplicity` lookup (+1) | Yes (`tests/test_dignities.py`) | Also a separate `ModernDignityCalculator` (line 669) for post-1781 planets |
| Sect (day/night chart) | SUPPORTED | `src/stellium/components/dignity.py` `determine_sect()` — geometric ASC/DSC horizon test | Yes (`tests/test_sect_rectification.py`) | Used to flip triplicity rulers and sect-aware Arabic Parts |
| Mutual reception | SUPPORTED | `dignities.py` `MutualReceptionAnalyzer` (line 985) | Not independently verified beyond class presence | |
| Profections | SUPPORTED | `src/stellium/engines/profections.py` — `ProfectionEngine`, `ProfectionResult`, `ProfectionTimeline`, `get_sign_ruler()` (Lord of the Year) | Yes (`tests/test_profections.py`, ran live, all passed) | |
| Zodiacal Releasing | SUPPORTED | `src/stellium/engines/releasing.py` — `ZodiacalReleasingEngine`, `ZodiacalReleasingAnalyzer`; Hellenistic peak-period/Loosing-of-the-Bond vocabulary present per CHANGELOG i18n notes | Yes (`tests/test_zodiacal_releasing.py`, ran live, all passed) | Maintainer's TODO flags an in-progress rewrite ("parameterized, preset-based") — current engine works but is being refactored |
| Firdaria | SUPPORTED | `src/stellium/engines/firdaria.py` `FirdariaEngine`; also duplicated/extended under `src/stellium/rectification/firdaria.py` | Yes (`tests/test_firdaria.py`) | |
| Primary directions | SUPPORTED | `src/stellium/engines/directions.py` — `PtolemyKey`, `NaibodKey`, `ZodiacalDirections`, `MundaneDirections`, `DirectionsEngine`; ascensional difference, semi-arcs, oblique ascension, meridian distance all implemented from spherical-astronomy first principles | Yes (`tests/test_directions.py`, `test_arc_directions.py`) | This is a nontrivial, correctly-factored implementation of classical primary-direction math, not a stub |
| Secondary progressions | SUPPORTED | `tests/test_progressions.py`, `tests/test_progression_types.py` present; CHANGELOG references "progressed Moon" | Yes | |
| Solar arc directions | SUPPORTED | `tests/test_arc_directions.py` | Yes | |
| Solar/Lunar returns | SUPPORTED | `src/stellium/returns/builder.py`; CHANGELOG 0.22.0 bug-fix note: "`ReturnBuilder.solar()` with a July–December birthday" previously returned the wrong year (now fixed) | Yes (`tests/test_returns.py`, `test_returns_builder.py`) | The CHANGELOG's own disclosure of a past correctness bug (and its fix) is a positive transparency signal, not a current defect |
| Transits | SUPPORTED | `CrossChartAspectEngine` in `aspects.py`; `planner/almanac.py` `build_year_almanac()` includes "year-defining outer transits" | Yes (`tests/test_planner_almanac.py`) | |
| Synastry | SUPPORTED | Same `CrossChartAspectEngine`; `src/stellium/core/comparison.py` (60KB) `Comparison`/`ComparisonBuilder` | Yes (`tests/test_comparison.py`, `test_comparison_extended.py`) | |
| Length of life (Hyleg/Alcocoden) | SUPPORTED | `src/stellium/engines/length_of_life.py` `find_hyleg()`, `length_of_life()` (Lilly method) | Yes (`tests/test_length_of_life.py`) | Rare feature even among traditional-astrology software |
| Almuten | SUPPORTED | `src/stellium/engines/almuten.py` `almuten_of_degree()` | Yes (`tests/test_almuten.py`) | |
| Rectification | SUPPORTED (dedicated subpackage) | `src/stellium/rectification/` — `analysis.py`, `evidence.py`, `matrix.py`, `model.py`, `timing.py`, `_recast.py` | Not independently deep-dived beyond file presence + directory listing | |
| Electional astrology | SUPPORTED | `src/stellium/electional/` — `intervals.py`, `planetary_hours.py`, `predicates.py`; `src/stellium/engines/search.py` (76KB) longitude/aspect/eclipse/station search | Yes (`tests/test_electional.py`, `test_search.py`) | |
| Chinese BaZi (Four Pillars) | SUPPORTED | `src/stellium/chinese/bazi/` — `engine.py`, `analysis.py`, `strength.py`, `renderers.py`, `models.py` | Yes (`tests/test_bazi.py`) | Maintainer's TODO notes Annual/Luck pillars and Clashes/Combinations/Penalties as still open — core pillar calc exists, some BaZi analysis layers incomplete |
| Zi Wei Dou Shu (紫微斗數) | **NOT PRESENT** | `src/stellium/chinese/ziwei/__init__.py` (verbatim): `"""Status: PLANNED - Not yet implemented. See TODO.md for roadmap."""`, `__all__: list[str] = []` | N/A | Explicitly and honestly stubbed by the author — no functional code exists |
| Horary astrology | **NOT PRESENT** | `TODO.md`: "Implement horary astrology (querent/quesited, radicality, considerations before judgement)" | N/A | Roadmap item |
| i18n / localization | SUPPORTED | `src/stellium/i18n/` — English, `zh_CN`, `zh_Hant` (+HK/TW overrides) locales; extensive CHANGELOG `[Unreleased]` entry | Yes (`tests/test_i18n_foundations.py`) | Notable for a Vietnamese-market use case: architecture (`t()`, one-JSON-file-per-locale) makes adding `vi` straightforward, though no Vietnamese locale ships today |

## Calculation vs Rule vs Interpretation Layers

Stellium cleanly separates all three, and the separation is visible in the code:

1. **Calculation (raw facts)** — `src/stellium/engines/ephemeris.py` calls `swe.calc_ut()` and returns bare `CelestialPosition` dataclasses (longitude, latitude, distance, speed; see `models.py` lines 108–142). No astrological judgment is attached here.
2. **Rule logic (if/then astrological conditions)** — e.g. `src/stellium/components/dignity.py::determine_sect()`:
   ```python
   dsc_long = (asc.longitude + 180) % 360
   if asc.longitude < dsc_long:
       is_night = asc.longitude <= sun.longitude < dsc_long
   else:
       is_night = sun.longitude >= asc.longitude or sun.longitude < dsc_long
   return "night" if is_night else "day"
   ```
   and `src/stellium/engines/dignities.py` (`TraditionalDignityCalculator.calculate_dignities`), which encodes the actual rule table (rulership → +5, exaltation → +4 with a proximity bonus, sect-dependent triplicity ruler → +3, etc.) — this is astrological *rule* logic operating on calculated facts, still producing structured data (a score + dignity labels), not prose.
3. **Interpretation (natural-language/templates)** — deliberately thin. The library exposes `CalculatedChart.to_prompt_text()` (`models.py` ~line 1860) whose docstring says: *"Export chart data as clean, human-readable text suitable for LLM prompts."* — i.e., Stellium hands structured facts to an external LLM for interpretation rather than shipping its own interpretive prose engine. The only built-in "interpretive" content is short catalog **keywords** for fixed stars (`presentation/sections/misc.py` — `star_keyword.*` catalog terms, comma-joined, at most 3 per star) and aspect glyph symbolism — not synthesized narrative paragraphs. This is a good architectural fit for a layered commercial system: use Stellium purely as the calculation+rule layer and build your own interpretation layer on top.

## Tests

**91 test files** in `tests/`, not "NO TEST SUITE FOUND." Coverage spans unit tests (engines, registries, models), integration tests (`test_integration.py`, `test_chart_builder.py`), documentation tests (`test_doc_codeblocks.py`, `test_docs_requirements.py` — verifies every documented code example actually runs and produces the output shown in the docs), and a dedicated **ground-truth suite**.

Quoted directly from `tests/test_astronomical_ground_truth.py` (module docstring):
> "Most of our tests check that the code does what the code says. These check that it says something *true*... 1. IMPOSSIBILITIES — geometry forbids it, so we must never report it 2. PERIODICITIES — the sky repeats on known schedules, so counts are predictable 3. ALMANAC FACTS — dated events anyone can look up 4. CROSS-ENGINE — two independent code paths must agree with each other"

Concrete example test (same file):
```python
@pytest.mark.parametrize("planet,max_elongation", [("Mercury", 28.0), ("Venus", 47.0)])
@pytest.mark.parametrize("angle", [60.0, 90.0, 120.0, 180.0])
def test_inner_planets_cannot_make_wide_aspects_to_the_sun(planet, max_elongation, angle):
    if angle <= max_elongation:
        pytest.skip("within reach")
    hits = find_all_aspect_exacts("Sun", planet, angle, YEAR_START, YEAR_END)
    assert hits == [], (...)
```
and the CHANGELOG's own bug-history note explains *why* this matters: a prior `find_aspect_exact` bug folded every opposition search into a conjunction search via an incorrect `% 180`, and "survived seven months because the tests covered 0°, 60° and 120° and never 180°." This is a genuinely mature, self-critical testing culture, not marketing.

Also present: `tests/test_astronomical_ground_truth.py`'s CHANGELOG-cited companion claim that "all 16 numbered [asteroid] bodies are verified against [NASA JPL] Horizons (worst disagreement: 2 arcseconds)" — **CLAIMED, partially verified**: we did not independently re-derive Horizons values, but the test file and its harness exist and are structured to do exactly this.

**Executed subset in this audit** (see Execution section for environment): `tests/test_house_systems.py`, `test_dignities.py`, `test_aspect_engine.py`, `test_ephemeris_engine.py`, `test_profections.py`, `test_zodiacal_releasing.py` — **162 tests, 0 failures, exit code 0**. Separately ran the full `test_astronomical_ground_truth.py`: **47 passed, 43 skipped** (skips are for named-asteroid ephemeris files not present in a default install — a deliberate, correct `skip`, not a failure), **0 failed**.

## Execution Attempt Results — VERIFIED BY EXECUTION

Environment: fresh venv (`C:\ccaudit\venv_st`), Python 3.14.6 (Windows), `pip install -e .` from `pyproject.toml` (installed `pyswisseph 2.10.3.2`, `pytz 2026.3.post1`, `timezonefinder 9.0.0`, `geopy 2.5.0`, `rich 15.0.0`, `svgwrite 1.4.3`, `pyyaml 6.0.3`, `typst 0.15.0`, `python-dateutil 2.9.0.post0`, plus native deps `numpy`, `cffi`).

Benchmark input: Birth Date 1985-03-12, Time 08:30, Lat 21.0285, Lon 105.8542, `Asia/Ho_Chi_Minh`.

```python
from stellium import ChartBuilder, Native
from datetime import datetime
native = Native(
    datetime_input=datetime(1985,3,12,8,30,0),
    location_input={'latitude':21.0285,'longitude':105.8542,'timezone':'Asia/Ho_Chi_Minh'},
)
chart = ChartBuilder.from_native(native).calculate()
```

**Actual output (planet longitudes, tropical, Placidus houses):**

| Object | Sign | Sign° | Longitude° | House | Retrograde |
|---|---|---|---|---|---|
| Sun | Pisces | 21.4222 | 351.4222 | 11 | No |
| Moon | Sagittarius | 0.0111 | 240.0111 | 7 | No |
| Mercury | Aries | 8.4178 | 8.4178 | 12 | No |
| Venus | Aries | 22.2384 | 22.2384 | 12 | No |
| Mars | Aries | 27.7061 | 27.7061 | 12 | No |
| Jupiter | Aquarius | 7.2431 | 307.2431 | 10 | No |
| Saturn | Scorpio | 28.1087 | 238.1087 | 7 | **Yes** |
| Uranus | Sagittarius | 17.9332 | 257.9332 | 8 | No |
| Neptune | Capricorn | 3.4562 | 273.4562 | 9 | No |
| Pluto | Scorpio | 4.4194 | 214.4194 | 6 | **Yes** |
| True Node | Taurus | 19.9600 | 49.9600 | 1 | No |
| Chiron | Gemini | 3.7918 | 63.7918 | 1 | No |
| Mean Apogee (Lilith) | Aries | 20.9318 | 20.9318 | 12 | No |
| South Node | Scorpio | 19.9600 | 229.9600 | 7 | Yes* |
| **Ascendant** | Taurus | 5.5425 | 35.5425 | 1 | — |
| **MC** | Capricorn | 26.0035 | 296.0035 | 10 | — |
| Vertex | Libra | 14.2765 | 194.2765 | 6 | — |

House system: Placidus. Zodiac: `ZodiacType.TROPICAL`. Aspects found: **37** (e.g. `Sun Trine Saturn orb=6.687 applying=True`, `Moon Conjunction Saturn orb=1.902 applying=False`, `Mars Opposition Pluto orb=6.713 applying=True`). Full aspect list captured during this audit.

**Cross-validation**: the independently-implemented `astrology-engine` repo (separate audit, separate calculation code, same Swiss Ephemeris backend) was run on the *same* benchmark input and produced Sun = 351.4222°, Moon = 240.0113°, Ascendant = 35.54253500624649° — agreeing with Stellium's output to 4 decimal places. This is strong evidence both tools correctly wrap Swiss Ephemeris for this input (it is not an independent astronomical proof, since both ultimately call the same underlying `swisseph` C library, but it does rule out application-level bugs in the julian-day, timezone, or house-cusp logic of either wrapper for this case).

Chiron resolved successfully in Stellium (because `seas_18.se1` ships in `data/swisseph/ephe/`) where the same calculation failed silently in astrology-engine (no bundled ephemeris file) — a concrete illustration of Stellium's more production-ready packaging.

## Maintenance

- Shallow clone limits git history to one commit; **cannot verify true commit cadence or contributor count from git alone.**
- **CHANGELOG.md** (219KB, `Keep a Changelog` format) lists **31 versioned release headers**, current unreleased work targeting a `zh` i18n overhaul, latest tagged release **`[0.22.0] - 2026-07-14`**. This is strong secondary evidence of sustained, active, versioned development — far beyond a single-commit snapshot would suggest.
- `CITATION.cff` present (machine-readable citation metadata) — signals research-grade intent.
- `.github/workflows/`: `tests.yml`, `docs.yml` (Sphinx build + doc-code execution validation on every PR), `publish-to-pypi.yml` (automated release-to-PyPI on GitHub Release) — real CI/CD, not a dead repo.
- `CONTRIBUTING.md` is detailed and personally signed by the maintainer ("Hi, I'm Kate, and I maintain Stellium...").
- `TODO.md` (41 open tasks, "*synced from Obsidian*") is candid about known weaknesses, e.g. **"Fix broad exception swallowing (30+ bare except clauses)"** and **"Resolve Comparison vs MultiChart API duality"** — a maintainer actively tracking debt is a positive signal, but the debt itself (30+ bare excepts) is a real, current code-quality issue (see Security/Quality below).
- Single named human contributor visible in the shallow clone (`Kate Louie`); cannot rule out squashed/rebased history hiding others.

**Classification: ACTIVE.** (31 changelog releases, live CI, current unreleased-branch work, documented roadmap, PyPI publishing pipeline — this is not dormant, low-activity, or experimental despite the shallow clone only exposing one commit.)

## Code Quality

| Dimension | Score (0–10) | Justification |
|---|---|---|
| Architecture | 9 | Protocol-based engine design (`core/protocols.py`) lets every engine (ephemeris, house system, aspect, orb) be swapped without inheritance, per `CITATION.cff`'s own description — confirmed structurally by the `engines/` package having independent, single-responsibility modules (`houses.py`, `aspects.py`, `dignities.py`, `orbs.py`, `directions.py`, ...) that compose via `ChartBuilder` |
| Modularity | 9 | Clear separation: `core/` (models/builders), `engines/` (calculation+rule), `components/` (pluggable chart add-ons: `arabic_parts.py`, `dignity.py`, `midpoints.py`, `antiscia.py`, `fixed_stars.py`), `presentation/` (rendering), `chinese/`, `returns/`, `rectification/`, `electional/`, `planner/`, `i18n/` — each a self-contained subpackage |
| Typing | 8 | Modern typing throughout (`dict[str, Any]`, `float | None`, `Protocol` classes, `@dataclass(frozen=True)`); `mypy>=1.8.0` is a dev dependency, implying type-checked CI, though we did not independently run `mypy` to confirm zero errors |
| Docs | 9 | Sphinx site (`docs/`), Diátaxis structure per CHANGELOG, "Astrology Guide" chapters cross-referenced against computed output, `docs/methodology` citing named primary sources (Valens, Ptolemy, Firmicus, Houlding per CHANGELOG 0.22.0 notes), and — unusually — a CI job (`test_doc_codeblocks.py` / `scripts/update_doc_outputs.py`) that fails the build if a documented code example's real output drifts from what the docs claim |
| Separation of concerns | 9 | Calculation (`engines/ephemeris.py`) vs. rule logic (`engines/dignities.py`, `components/dignity.py`) vs. presentation (`presentation/`) vs. interpretation hand-off (`to_prompt_text()`) are all distinct layers, as shown above |
| Extensibility | 8 | Protocol-based engines, a documented locale system ("adding a language is one JSON file, no code" per CHANGELOG), pluggable `ChartComponent`s — but the maintainer's own TODO flags an unresolved "Comparison vs MultiChart API duality" and a "plugin ecosystem architecture" still only Phase-3-planned, meaning full third-party extensibility isn't finished |
| Error handling | 5 | The maintainer's own `TODO.md` lists **"Fix broad exception swallowing (30+ bare except clauses)"** as a High-priority open item — a real, currently-present code smell (broad/bare `except:` blocks can mask real bugs, e.g. silently swallowing a wrong-body ephemeris error). This is a concrete, self-disclosed weakness that keeps this score from being higher despite otherwise strong engineering elsewhere (e.g., `_is_applying()` deliberately returns `None` instead of guessing when data is insufficient) |

## Security

- **No `eval`/`exec`/`os.system`/`subprocess` usage found** anywhere in `src/stellium/` or `web/` (checked via repo-wide grep).
- **`pickle` usage**: `src/stellium/utils/cache.py` uses `pickle.load`/`pickle.dump` for an on-disk geocoding-result cache under `~/.stellium/cache/` (or `STELLIUM_CACHE_DIR`). This is deserializing the library's *own* previously-written cache files, not attacker-controlled input over a network boundary — low risk in isolation, but if this cache directory is ever shared across trust boundaries (e.g., a shared/writable cache in a multi-tenant deployment), an attacker able to write to that directory could achieve code execution via a crafted pickle. **Recommendation for a commercial deployment: keep the cache directory private per-process/per-user, or replace with JSON for the geocoding cache.**
- **Network calls**: `src/stellium/core/native.py` uses `geopy.geocoders.Nominatim` to geocode free-text location strings — an outbound HTTP call to a third-party service (OpenStreetMap's Nominatim) triggered by user-supplied birth-location text. For a commercial product this has two implications: (1) sending user birth-location strings to a third-party API is a privacy/data-handling consideration worth reviewing for a paid product handling PII, and (2) Nominatim's usage policy caps request rate — the code comments in `native.py` already acknowledge this ("network call, may be rate-limited or unavailable") and cache results.
- **User-supplied birth data handling**: `Native.__init__` validates/parses datetime and location inputs defensively (flexible input types, explicit `ValueError`s for malformed house-system codes, timezone-aware datetime requirements) — no obvious injection surface, since all downstream consumption is numeric (Julian day, lat/lon floats) rather than string interpolation into a shell/SQL/template context.
- No hardcoded secrets, API keys, or credentials found in the reviewed source.

## Tier Recommendation

**Tier A — Foundation** *for the calculation/rule engine itself, contingent entirely on resolving the AGPL-3.0 licensing question first.*

Justification: on pure engineering merit — breadth of correctly-implemented traditional and modern Western astrology (17 house systems, full dignities, sect, profections, releasing, firdaria, primary directions, arabic parts, returns/synastry/transits), a real ground-truth test suite, clean calculation/rule/interpretation separation, active CI/CD and versioned releases, and confirmed successful execution against the benchmark input — Stellium is the strongest candidate of the two audited repos to serve as the calculation+rule foundation of a professional layered astrology engine. However, it ships under **AGPL-3.0-or-later**, which for a closed-source commercial SaaS backend is a **blocking legal question, not a minor caveat** — if a compatible commercial license cannot be obtained from the author or the AGPL network-use obligations cannot be satisfied, this repo cannot be used as-is in a closed product, and the practical tier drops to **E — Avoid** for that specific use case. Treat the "A" rating as applying only after a licensing resolution; do not integrate any of this code into a closed-source product before that legal review completes.
