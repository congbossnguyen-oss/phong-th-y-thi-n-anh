# Source-Code Audit: mayaastrolib (ranganc007/mayaastrolib)

Repo path audited: `C:\ccaudit\repos\mayaastrolib`
Audit date: 2026-09-13. All findings below are grounded in source-code reads and real command execution in this session (venv at `C:\ccaudit\venv_mayaastrolib`, Python 3.14.6). No numbers are taken from README/CLAUDE.md claims without independent verification.

---

## 1. Summary verdict

`mayaastrolib` is a 2026 fork of the well-known `flatangle/flatlib` Western-astrology library (MIT, original author João Ventura), renamed and substantially extended by a single maintainer ("Rangan C.") with a large, well-documented "Vedic" (Jyotisha) subsystem (nakshatras, 15 divisional charts/vargas, Vimshottari dasha, yogas, Ashtakavarga, Shadbala, Tajika varshaphala, KP sub-lords, Sade Sati, Upagrahas). The `flatlib/` directory is **not** a vendored fork-inside-a-fork; it is a thin backward-compatibility shim (`flatlib/__init__.py`, 58 lines) that re-exports `mayaastrolib` and emits a `DeprecationWarning` — i.e., flatlib has been fully absorbed/renamed, not wrapped. The codebase is unusually well engineered for a niche astrology library: full type hints (mypy-clean), ruff-clean, 664 real unit/integration tests (660 passing in this session; 4 concurrency tests failed reproducibly — see §7), and genuine golden tests that check planet longitudes against an independent ephemeris (Skyfield/JPL DE440s) to ±2 arcmin, not just smoke tests. It computes **facts and classical rule-based derivations only** (positions, dignities, yoga detection, dasha/varga math) — there is no natural-language interpretation layer anywhere in the shipped package; the `prompts/` folder is the maintainer's own AI-assisted-development task logs, not an LLM interpretation template store. The single largest risk for a commercial closed-source SaaS is licensing: the library itself is MIT, but it hard-depends on `pyswisseph` (LGPL bindings around the Swiss Ephemeris C library, itself dual-licensed GPL/commercial) and **ships the actual Swiss Ephemeris binary data files** in `mayaastrolib/resources/swefiles/`. The maintainer's own `LICENSING.md` explicitly says closed-source commercial use requires a paid Astrodienst Swiss Ephemeris license — this is flagged **LEGAL REVIEW REQUIRED**. Git history is inaccessible beyond a single squashed commit (shallow clone), so true commit cadence cannot be verified from `git log`; the in-repo CHANGELOG documents roughly one month of very intensive, task-numbered development (≈38 tasks, 2026-05-07 to 2026-06-08) with no entries after v0.5.0.

---

## 2. License

**mayaastrolib itself — `LICENSE` (full text quoted):**

```
The MIT License (MIT)

Copyright (c) 2015 FlatAngle
Copyright (c) 2026 Rangan C.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND ...
```

Confirmed by `pyproject.toml` (`license = { text = "MIT" }`) and by the classifier `"License :: OSI Approved :: MIT License"`. `docs/FORK-RATIONALE.md` states the original flatlib copyright (João Ventura, MIT) is preserved with an added fork-copyright line — consistent, no license mismatch between the fork and the (now-shimmed) flatlib code.

**LEGAL REVIEW REQUIRED — dependency licensing (`LICENSING.md`, full text quoted):**

> "`mayaastrolib` depends on `pyswisseph` at runtime. `pyswisseph` is a Python wrapper around Swiss Ephemeris.
> - **`pyswisseph`** itself is LGPL-licensed (the Python bindings).
> - **Swiss Ephemeris** (the underlying C library and ephemeris data files) is dual-licensed: **GPL v2+** for open-source projects, OR **Commercial license** from Astrodienst (Switzerland) for closed-source commercial use. ...
> - **Using `mayaastrolib` in a closed-source commercial product:** you must obtain a commercial Swiss Ephemeris license from Astrodienst. This is not unique to `mayaastrolib` — it applies to any astrology software that uses Swiss Ephemeris."

This is not a hypothetical risk: the package **physically ships** the Swiss Ephemeris data files (`mayaastrolib/resources/swefiles/*.se1`, `*.cat`, `*.txt` — confirmed present on disk and declared in `pyproject.toml [tool.setuptools.package-data]` and in `MANIFEST.in`). For the intended use case (a closed-source commercial Vietnamese phong-thủy SaaS), this means:

- No copyleft/AGPL — the code itself is MIT — **but** the mandatory ephemeris dependency is GPL/commercial-dual-licensed, and using it in a closed-source product without a paid Astrodienst license is a GPL violation on the Swiss Ephemeris portion, not on `mayaastrolib`'s own code.
- The maintainer is unusually transparent about this and even floats (in `LICENSING.md`, "Future direction") a possible pure-Python/MIT astronomy backend (VSOP87/JPL DE via Skyfield) as a future opt-in, but this does **not exist today** — `skyfield` is a **dev-only** dependency (used solely to generate golden-test fixtures, never imported by runtime code — verified: no `import skyfield` outside `tests/golden/generate_fixtures.py`).
- **Verdict: LEGAL REVIEW REQUIRED.** Before any commercial closed-source deployment, obtain (or confirm existing) an Astrodienst Swiss Ephemeris commercial license, or substitute a differently-licensed ephemeris backend.

---

## 3. Dependencies

From `pyproject.toml` (full dependency list — no `requirements.txt`/`setup.py` exist; packaging is pyproject-only):

| Dependency | Scope | Version constraint | License | Notes |
|---|---|---|---|---|
| `pyswisseph` | runtime (only runtime dep) | `>=2.10.3.2` | LGPL (bindings) / Swiss Ephemeris GPL-or-commercial (underlying data+C lib) | Sole hard dependency. Verified installed as `2.10.3.2` in the test venv. |
| `pytest` | dev | unpinned | — | |
| `pytest-cov` | dev | unpinned | — | |
| `ruff` | dev | unpinned | — | |
| `mypy` | dev | unpinned | — | |
| `skyfield` | dev | `>=1.46` | MIT | Used only by `tests/golden/generate_fixtures.py`; never a runtime import. |

- `requires-python = ">=3.10"`; classifiers declare `3.10`/`3.11`/`3.12` only. **This session ran on Python 3.14.6** (not in the declared support matrix) — install and 660/664 tests still passed, but see §7/§8 for the 4 environment-linked failures on this unsupported interpreter.
- No abandoned/ancient pinned versions — dependency surface is intentionally minimal (single runtime dependency). This is a strength, not a weakness, versus a typical npm-style astrology stack.
- **Ephemeris backend: Swiss Ephemeris via `pyswisseph`** — confirmed the sole astronomy backend; no custom astronomy math, no alternate ephemeris library (e.g. no VSOP87/JPL direct integration at runtime). `mayaastrolib/ephem/swe.py` is a thin ctypes-style wrapper calling `swisseph.calc_ut`, `swisseph.houses`, `swisseph.houses_ex`, `swisseph.fixstar2_ut`, `swisseph.rise_trans`, `swisseph.sol_eclipse_when_glob`, `swisseph.lun_eclipse_when` directly.

---

## 4. Feature table

| Feature | Supported | Implementation evidence (file:line / function) | Tested | Notes |
|---|---|---|---|---|
| Natal chart core (Sun–Pluto) | Supported | `mayaastrolib/ephem/swe.py:22-35` `SWE_OBJECTS` maps Sun..Pluto to swisseph body ids; `mayaastrolib/chart.py:66-117` `Chart.__init__` | Yes — golden test `tests/golden/test_planet_positions.py` vs Skyfield, ±2 arcmin | Verified live: benchmark run (§7) produced real longitudes for all 10 modern planets. |
| Asteroids (Ceres, Pallas, Juno, Vesta) | **NOT PRESENT** | `SWE_OBJECTS` (`mayaastrolib/ephem/swe.py:22-35`) has no entry for any asteroid besides Chiron | N/A | Grep of `const.py`/`swe.py` confirms only `CHIRON` (swe id 15) among minor bodies. |
| Chiron | Supported | `const.CHIRON` (`const.py:97`), `SWE_OBJECTS[const.CHIRON]=15` (`swe.py:33`) | Indirectly (object-list tests) | |
| Lunar nodes — true vs mean | **Mean node only** | `SWE_OBJECTS[const.NORTH_NODE] = 10` (`swe.py:34`) — swisseph body id 10 is `MEAN_NODE` (11 would be `TRUE_NODE`); South Node derived as `North Node + 180°` in `mayaastrolib/ephem/eph.py:53-55` | Yes (object list tests) | No code path requests `TRUE_NODE` (id 11) anywhere in the repo — verified via grep. |
| Zodiac mode | Supported: tropical (default) + sidereal | `const.ZODIAC_TROPICAL`/`ZODIAC_SIDEREAL` (`const.py:108-110`); `Chart.__init__` validates and threads `zodiac`/`ayanamsa` (`chart.py:88-100`) | Yes, extensively (`tests/test_vedic_foundation.py`, golden `test_vedic_positions.py`) | |
| Ayanamsas (sidereal) | 4 supported: **Lahiri, Krishnamurti (KP), Raman, Fagan-Bradley** | `mayaastrolib/vedic/ayanamsa.py:67` `lahiri()`, `:82` `krishnamurti()`, `:90` `raman()`, `:95` `fagan_bradley()`; dispatcher `get()` at `:51` | Yes, `tests/test_vedic_ayanamsa_variants.py` (11 tests) | Exact constant names: `AYANAMSA_LAHIRI`, `AYANAMSA_KRISHNAMURTI`, `AYANAMSA_RAMAN`, `AYANAMSA_FAGAN_BRADLEY` (`const.py:114-128`). |
| House systems | **13 systems coded**, exact list | `const.py:174-188`: Placidus, Koch, Porphyrius, Regiomontanus, Campanus, Equal, "Equal 2", Vehlow Equal, Whole Sign, Meridian, Azimuthal, Polich Page, Alcabitus, Morinus. Mapped to swisseph 1-letter codes in `swe.py:38-53`. **Default house system is Alcabitus** (`const.py:188` `HOUSES_DEFAULT = HOUSES_ALCABITUS`) — an unusual (traditional) default, not Placidus. | Yes (chart/house tests); verified live in benchmark run | |
| Ascendant / MC / Vertex | Asc, MC, Desc, IC supported; **Vertex NOT PRESENT** | `const.LIST_ANGLES = [ASC, MC, DESC, IC]` (`const.py:417`); computed in `swe.py:183-188` from `ascmc` | Yes | No Vertex constant or computation found anywhere in the repo (grep for "Vertex" returns nothing in source). |
| Aspects — types and orbs | Supported. Major: Conjunction(0)/Sextile(60)/Square(90)/Trine(120)/Opposition(180); Minor: Semisextile(30)/Semiquintile(36)/Semisquare(45)/Quintile(72)/Sesquiquintile(108)/Sesquisquare(135)/Biquintile(144)/Quincunx(150) | `const.py:238-291` (`MAJOR_ASPECTS`, `MINOR_ASPECTS`, `ASPECT_NAMES`); orb logic in `mayaastrolib/aspects.py:50-117` (`_orbList`, `_aspectDict`) | Yes, `tests/test_aspect_api.py` | Per-planet orb values (traditional Ptolemaic-style): Sun 15°, Moon 12°, Mercury/Venus 7°, Mars 8°, Jupiter/Saturn 9°, outer planets/Chiron/nodes 5-12° — table at `mayaastrolib/props.py:166-183`. Minor aspects capped at a flat `MAX_MINOR_ASP_ORB = 3°` (`aspects.py:43`); exact-aspect threshold `MAX_EXACT_ORB = 0.3°` (`aspects.py:44`). |
| Applying/separating aspect logic | Supported | `_aspectProperties()` (`aspects.py:120-188`) computes `APPLICATIVE`/`SEPARATIVE`/`EXACT`/`STATIONARY` from `lonspeed` sign and orb direction | Yes | |
| Essential dignities (domicile/exalt/detriment/fall) | Supported, data-table driven | `mayaastrolib/dignities/tables.py:335-432` `ESSENTIAL_DIGNITIES` dict (ruler/exalt+degree/triplicity/face/exile/fall+degree, per sign); term tables for 3 variants (`EGYPTIAN_TERMS`, `TETRABIBLOS_TERMS`, `LILLY_TERMS`, `tables.py:66-329`); scoring logic in `mayaastrolib/dignities/essential.py` | Yes, `tests/test_dignities_essential.py`, `tests/test_dignities_tables.py` | Classical Western (Ptolemaic/Lilly) dignities — table-driven, not hardcoded if/else. |
| Accidental dignities | Supported | `mayaastrolib/dignities/accidental.py` (471 lines); `AccidentalDignity.getScoreProperties` refactored (per CHANGELOG Task 034) to a `(key, flag, plus, otherwise)` rule table | Yes, `tests/test_dignities_accidental*.py` (incl. a regression test pinning scores) | |
| Retrograde detection | Supported — via ephemeris longitude-speed sign, not date-diffing | `mayaastrolib/object.py:271-287` `Object.movement` property: `abs(lonspeed) < 0.0003` → Stationary; `lonspeed > 0` → Direct; else Retrograde. `isRetrograde()` at `:314-320`. | Yes | Verified live: benchmark chart correctly showed Saturn `retro=True` at the test date. |
| Rashi / D1 | Supported | `mayaastrolib/vedic/divisional.py:74` `rasi(sid_lon)` | Yes | |
| Divisional charts (vargas) | **15 vargas implemented**: D2 hora, D3 drekkana, D4 chaturthamsa, D7 saptamsa, D9 navamsa, D10 dasamsa, D12 dvadasamsa, D16 shodasamsa, D20 vimsamsa, D24 chaturvimsamsa, D27 bhamsa, D30 trimsamsa, D40 khavedamsa, D45 akshavedamsa, D60 shastiamsa (+D1 rasi) | `mayaastrolib/vedic/divisional.py` — one pure function per varga, e.g. `navamsa()` (`:136`), `dasamsa()` (`:160`), `shastiamsa()` (`:309`); chart-level entry `all_vargas()` (`:346`) | Yes, `tests/test_vedic_divisional.py` (25 tests) | D6 (shashtamsa), D8, D11, D81, D108, D144 (rare in some Shodashavarga lists) are **NOT PRESENT** — only the 15 listed above + D1. |
| Nakshatra + pada | Supported | `mayaastrolib/vedic/nakshatras.py:20` `NAKSHATRA_NAMES` (27, BPHS order), `:90` `of_longitude()` returns a `Nakshatra` dataclass with `pada`, `:116` `janma_nakshatra(chart)` | Yes, `tests/test_vedic_nakshatras.py` (17 tests) | Verified live: benchmark Moon nakshatra computed as `Anuradha`, pada 1. |
| Dasha systems | **Vimshottari only** (Mahadasha/Antardasha/Pratyantardasha) + Tajika "Mudda dasha" (annual variant) | `mayaastrolib/vedic/dasha.py:56` `vimshottari()` main entry, `antardashas()`, `pratyantar_dashas()`; Mudda dasha in `mayaastrolib/vedic/tajika.py` (per CHANGELOG Task 024) | Yes, `tests/test_vedic_dasha.py` (19 tests) | **Ashtottari and Yogini dashas are NOT PRESENT** — grep for "ashtottari"/"yogini" in `mayaastrolib/` returns no matches. Verified live: benchmark computed birth-balance lord Saturn (14.68 yrs remaining). |
| Yogas | **~25+ named yogas, data + rule-driven** (not one giant if/else — dignity/rulership lookups feed reusable helpers) | `mayaastrolib/vedic/yogas.py`: Pancha Mahapurusha (5), Gaja-Kesari, Budha-Aditya, Chandra-Mangala, Raja Yoga, Dhana Yoga, Vipareeta Raja Yoga (3 sub-types), Neecha Bhanga Raja Yoga, Kemadruma, plus ~11 "lesser" yogas (Amala, Adhi, Lakshmi, Saraswati, Kahala, Vasumati, Sunapha/Anapha/Durudhara, Vesi/Vasi/Ubhayachari). Entry point `detect_yogas(chart)`. Dignity data at `yogas.py:55-81` (`OWN_SIGNS`/`EXALTATION_SIGN`/`DEBILITATION_SIGN` dicts) | Yes, `tests/test_vedic_yogas*.py` (68+ tests across 3 files) | Verified live: benchmark chart returned 8 yoga hits including `Ruchaka Yoga`, `Neecha Bhanga Raja Yoga` (×3), `Kemadruma Yoga`. Each yoga carries a short *classical textual gloss* (e.g. "Mars strong in a kendra — courage, leadership, vigour" at `yogas.py:85`) — see §5 for why this is rule-layer, not personalized interpretation. |
| Ashtakavarga | Supported (Bhinnashtakavarga + Sarvashtakavarga + Prastara + Shodhana + Kakshya) | `mayaastrolib/vedic/ashtakavarga.py` (455 lines): `ASHTAKAVARGA_TABLES`, `bhinnashtakavarga()`, `sarvashtakavarga()`, `trikona_shodhana()`, `kakshya_of()` | Yes, 2 test files, 51 tests total | |
| Shadbala | Supported (6-fold: Sthana/Dig/Kala/Cheshta/Naisargika/Drik bala) | `mayaastrolib/vedic/shadbala.py` (645 lines), `shadbala(chart)` | Yes, `tests/test_vedic_shadbala.py` | Per CHANGELOG, values are in Virupas with documented per-planet minimums. |
| Sade Sati / Panoti | Supported | `mayaastrolib/vedic/sadesati.py` (144 lines): `sade_sati()`, `small_panoti()` | Yes, `tests/test_vedic_sadesati.py` (22 tests) | |
| Upagrahas (Gulika, Dhuma, etc.) | Supported | `mayaastrolib/vedic/upagrahas.py` (192 lines): `sun_derived_upagrahas()`, `gulika_longitude()` | Yes, 17 tests | |
| Tajika / Varshaphala (annual chart) | Supported | `mayaastrolib/vedic/tajika.py` (410 lines): `varshapravesh()`, `mudda_dasha()`, `muntha()`, `lord_of_year()`, `sahams()` (14 Sahams); aspects in `tajika_aspects.py` (Ithasala/Isharafa/Nakta); bala in `tajika_bala.py` (Harsha/Panchavargiya) | Yes, several test files | Documented simplifications (Panchavargiya component scales) noted honestly in code/CHANGELOG. |
| KP (Krishnamurti Paddhati) | Supported | `mayaastrolib/vedic/kp.py` (387 lines): 249-row sub-lord table `kp_table()`, `sub_lord_at()`, `sub_sub_lord_at()`, `kp_horary()`, `ruling_planets()` | Yes, 3 test files | |
| Transits | **Partial / CLAIMED BUT NOT VERIFIED as a general-purpose feature** | No dedicated `transits.py` module; transit-style comparison exists only narrowly for Sade Sati (`sadesati.py`) and Ashtakavarga kakshya-transit (`kakshya_transit_active()` in `ashtakavarga.py`). A generic "chart A transiting chart B" aspect-scan is not implemented as a named public function — the primitives (build two charts, call `aspects.getAspect` between them) exist but there is no `transits` module wrapping them. | Partial | |
| Synastry | **NOT PRESENT** as a named feature | No synastry module or function found (grep for "synastry" returns nothing); can be hand-built from two `Chart` objects + `aspects` module, but no dedicated API | N/A | |
| Progressions (secondary) | **NOT PRESENT** | No secondary-progression module; only **primary directions** exist (`mayaastrolib/predictives/primarydirections.py`, 329 lines, `PrimaryDirections` class / `Chart.directions()`) and **profections** (`predictives/profections.py`) | Primary directions: yes (`tests/test_predictives_primarydirections.py`); profections: yes | Primary directions explicitly raise `NotImplementedError` on sidereal charts (`chart.py`, per CHANGELOG Task 027 — equatorial-coordinate technique incompatible with ayanamsa shift). |
| Solar return | Supported (tropical only for the Western `Chart.solarReturn`; Vedic sidereal equivalent is Tajika `varshapravesh`) | `mayaastrolib/predictives/returns.py` (45 lines) `nextSolarReturn`/`prevSolarReturn`; `Chart.solarReturn()` method | Yes, `tests/test_predictives_returns.py`, `tests/test_sidereal_predictives.py` | |
| Lunar return | **NOT PRESENT** | No lunar-return function found (grep for "lunarReturn"/"lunar_return" returns nothing) | N/A | |

---

## 5. Calculation / Rule / Interpretation layer classification

The codebase is almost entirely **Calculation layer** with a thin **Rule layer** on top for Vedic yoga/dignity detection. There is **no Interpretation layer** (no natural-language personalized reading text) anywhere in the shipped package.

**Calculation layer example** (`mayaastrolib/ephem/swe.py:107-129`):
```python
def sweObject(obj, jd, zodiac=const.ZODIAC_TROPICAL, ayanamsa=const.AYANAMSA_LAHIRI):
    sweObj = SWE_OBJECTS[obj]
    with _SWE_LOCK:
        if zodiac == const.ZODIAC_SIDEREAL:
            sweList, flg = _sidereal_calc_ut(jd, sweObj, ayanamsa)
        else:
            sweList, flg = swisseph.calc_ut(jd, sweObj)
    return {"id": obj, "lon": sweList[0], "lat": sweList[1],
            "lonspeed": sweList[3], "latspeed": sweList[4]}
```
This produces exactly "Mars = X° Aries"-style raw facts, nothing more.

**Rule layer example** (`mayaastrolib/vedic/yogas.py`, `_detect` internals, using data tables at lines 55-81 and 98-101 — `OWN_SIGNS`, `EXALTATION_SIGN`, `KENDRA_HOUSES`, `TRIKONA_HOUSES`): the code applies classical if/then astrological logic — e.g. "Mars in its own or exaltation sign AND in a kendra from the Ascendant → Ruchaka Yoga" — and returns a structured `YogaResult(name, sanskrit, planets, description)`. This is rule-based astrological inference, not raw ephemeris data, but it is still deterministic classical doctrine, not a personalized reading. The one place this brushes against "interpretation" is the short canned gloss string attached to each yoga, e.g.:
```python
# mayaastrolib/vedic/yogas.py:84-96
PANCHA_MAHAPURUSHA = {
    const.MARS: ("Ruchaka", "Mars strong in a kendra — courage, leadership, vigour."),
    ...
}
```
These are terse, generic, non-personalized textbook glosses (a few words per yoga, not addressed to "you"), functioning more like a dictionary label than an interpretation engine. Essential/accidental dignity scoring (`mayaastrolib/dignities/essential.py`, `accidental.py`) is the Western-astrology analogue: numeric/categorical scores from table lookups, again rule-layer, not prose.

**No interpretation layer found:**
- `grep -rniE "you are a natural|you tend to|your personality|leadership qualities"` across the entire repository returned **zero matches**.
- `contrib/topical_almuten.py.broken` — an archived, syntactically-broken (since ~2021, per its own README) legacy Persian/Hellenistic "topical almuten" calculation script. It is calculation/rule layer only (dignity-table lookups for houses of life topics), not interpretation, and is not imported by anything (confirmed via `contrib/topical_almuten.README.md`).
- `prompts/*.md` (task-001 through task-026b, plus review/recon prompts) are **not** an LLM-interpretation-template store. They are the maintainer's own task briefs for an AI-agent-assisted development workflow (e.g. `prompts/task-001-recon.md` instructs an agent to "Read `CLAUDE.md` and `docs/FORK-RATIONALE.md` ... Produce `docs/RECON.md` — a comprehensive baseline analysis"). This is software-engineering process documentation, not astrology-content generation.
- `mayaastrolib/report.py` and `mayaastrolib/chart.py`'s `to_dict()`/`to_json()` (schema-versioned JSON serialization, `SCHEMA_VERSION = 1`, `chart.py:41-45`) are explicitly designed as a machine-readable **calculation-facts** facade for downstream consumers (the docstring literally says the fork targets "web backends and AI tool calls" — i.e., it expects a *separate* interpretation layer to consume this JSON, which is exactly the layered architecture the phong-thủy engine research wants).

**Conclusion for the target architecture:** this library is a clean drop-in for the "Calculation" tier only. Rule-tier logic (Vedic yoga/dignity detection) is present and reusable but Western-flavored/BPHS-flavored, not phong-thủy-specific — it would need to sit alongside (not replace) a bespoke Bát Trạch/Huyền Không rule engine. Zero reusable interpretation-text assets exist; all consumer-facing prose must be built from scratch.

---

## 6. Test audit

**NOT "NO TEST SUITE FOUND" — this repo has a large, substantive test suite.**

- 62 test files in `tests/` + 3 in `tests/golden/`.
- **664 test functions/methods** counted via `grep -rhoE "def test_[a-zA-Z0-9_]+" tests/*.py tests/golden/*.py | wc -l`.
- Live run in this session: `pytest -q` → **660 passed, 4 failed, 230 subtests passed** (see §7 for the 4 failures, which are concurrency/environment-related, not core-astrology-correctness failures).
- Tests are **not** shallow smoke tests. Two categories stand out:
  1. **Golden/reference tests against an independent ephemeris.** `tests/golden/test_planet_positions.py` compares `mayaastrolib` planet longitudes against frozen **Skyfield** (JPL DE440s) reference values for 7 real historical birth charts (Einstein, Kahlo, Amundsen, Jung, Monroe, Diana Spencer, Obama), asserting agreement to **±2 arcminutes**:
     ```python
     # tests/golden/test_planet_positions.py:91-107
     def test_each_chart_planets_match_reference(self):
         """Every (chart × planet) within ±2 arcmin of Skyfield."""
         for fixture in self.fixtures:
             chart = _build_chart(fixture)
             for mlib_id, fixture_key in PLANET_MAP.items():
                 ...
                 diff = _angular_diff(actual, expected)
                 self.assertLessEqual(diff, TOLERANCE_DEG, ...)
     ```
     This is genuine cross-implementation astronomical validation (Swiss Ephemeris vs an independent JPL-based library), not a self-referential smoke test.
  2. **Self-consistency invariant tests** (`tests/golden/test_self_consistency.py`): houses sum to 360°, cusps ordered, orb non-negative, aspect names valid, profected-chart invariants.
  3. **Unit tests with hand-computed / pinned expected values** across the Vedic subsystem, e.g. `tests/test_vedic_ashtakavarga.py` checks the 337-point Sarvashtakavarga grand-total invariant and per-planet canonical totals (Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39) against BPHS ch. 66 tables; `tests/test_vedic_sadesati.py` pins Saturn's sidereal sign against known reference dates (e.g. "Aquarius mid-2024").
  4. Thread-safety and dignity-variant regression tests (`tests/test_dignities_thread_safety.py`, `test_score_properties_regression` in `test_dignities_accidental_factors.py`) that pin exact numeric scores to catch behavior drift during refactors.
- Coverage: CHANGELOG claims 94% overall (`[tool.coverage.run] source = ["mayaastrolib"]` configured in `pyproject.toml`); not independently re-measured line-by-line in this session, but the 664-test count and the specific coverage deltas cited per-task in CHANGELOG (e.g. "84% → 100%" for `dignities/accidental.py`) are consistent with a genuinely test-driven development process, not inflated claims.

---

## 7. Execution attempt results — SUCCEEDED

Full execution succeeded. Steps taken:

1. Created a fresh venv: `python -m venv C:\ccaudit\venv_mayaastrolib` (host Python 3.14.6 — outside the package's declared `>=3.10,<=3.12`-ish support, per classifiers, but there is no upper pin, so pip did not block it).
2. `pip install -e .` — succeeded cleanly, pulled `pyswisseph==2.10.3.2` (the only runtime dependency). Verified via `pip show mayaastrolib` (Version 0.5.0, Editable project location correct).
3. Based the benchmark script on `recipes/aspects.py`'s pattern (`Chart(Datetime(...), GeoPos(...))`).
4. Ran a script computing a real natal chart for **1985-03-12 08:30, Hanoi (lat 21.0285, lon 105.8542), UTC+7 (Asia/Ho_Chi_Minh, no DST)** — both tropical (Western) and sidereal (Vedic, Lahiri ayanamsa) — plus dasha, nakshatra, yoga detection, and the `full_report_json` facade.

**Actual real output (unedited, from the command run):**

```
=== TROPICAL (Western), house system default: Alcabitus ===
Sun          lon= 351.4222  sign=Pisces       signlon=21.4222 retro=False
Moon         lon= 240.0111  sign=Sagittarius  signlon= 0.0111 retro=False
Mercury      lon=   8.4178  sign=Aries        signlon= 8.4178 retro=False
Venus        lon=  22.2384  sign=Aries        signlon=22.2384 retro=False
Mars         lon=  27.7061  sign=Aries        signlon=27.7061 retro=False
Jupiter      lon= 307.2431  sign=Aquarius     signlon= 7.2431 retro=False
Saturn       lon= 238.1087  sign=Scorpio      signlon=28.1087 retro=True
Uranus       lon= 257.9333  sign=Sagittarius  signlon=17.9333 retro=False
Neptune      lon= 273.4562  sign=Capricorn    signlon= 3.4562 retro=False
Pluto        lon= 214.4195  sign=Scorpio      signlon= 4.4195 retro=True
North Node   lon=  51.4381  sign=Taurus       signlon=21.4381 retro=True
South Node   lon= 231.4381  sign=Scorpio      signlon=21.4381 retro=True
Chiron       lon=  63.7918  sign=Gemini       signlon= 3.7918 retro=False
ANGLE Asc   lon=  35.5425 sign=Taurus
ANGLE MC    lon= 296.0035 sign=Capricorn
ANGLE Desc  lon= 215.5425 sign=Scorpio
ANGLE IC    lon= 116.0035 sign=Cancer

Houses (Alcabitus default):
House1   lon=  35.5425 sign=Taurus
House2   lon=  63.5154 sign=Gemini
...
House10  lon= 296.0035 sign=Capricorn
House11  lon= 327.5549 sign=Aquarius
House12  lon=   1.6293 sign=Aries

=== SIDEREAL (Vedic, Lahiri ayanamsa) ===
Sun          lon= 327.7755  sign=Aquarius     signlon=27.7755
Moon         lon= 216.3645  sign=Scorpio      signlon= 6.3645
...
ASC (sidereal) lon=  11.8959 sign=Aries

Lahiri ayanamsa value at this date: 23.650254973414235
Moon nakshatra: Nakshatra(name='Anuradha', lord='Saturn', pada=1, index=16)
Birth balance lord: Saturn years: 14.680618468722637
Current MD at birth: Saturn <1980/11/15 16:48:05 07:00:00> - <1999/11/16 10:48:05 07:00:00>

Yogas detected: ['Ruchaka Yoga', 'Harsha Yoga (Vipareeta Raja)', 'Neecha Bhanga Raja Yoga',
 'Neecha Bhanga Raja Yoga', 'Neecha Bhanga Raja Yoga', 'Kemadruma Yoga', 'Amala Yoga', 'Ubhayachari Yoga']
```

`full_report_json()` also produced a well-formed, schema-versioned JSON payload (`schema_version: 1`, `meta`, `objects[]` with `lonspeed`/`movement`/`house`, etc.) confirming the serialization facade works end-to-end.

**Test suite run (`pytest -q`) — real output:**
```
FAILED tests/test_concurrency.py::ThreadSafetyTests::test_concurrent_matches_serial
FAILED tests/test_concurrency.py::ThreadSafetyTests::test_fixedstar_under_threads
FAILED tests/test_concurrency.py::AsyncHelperTests::test_afull_report_matches_sync
FAILED tests/test_concurrency.py::AsyncHelperTests::test_gather_many_reports_concurrently
4 failed, 660 passed, 4 warnings, 230 subtests passed in 16.09s
```
The 4 failures are all in `tests/test_concurrency.py` and show tiny floating-point divergences (5th-6th significant digit, e.g. `lat: 0.00012095341481706178` vs `0.00011527152353254628`) between synchronous and thread-pool/asyncio-executed results. `docs/CONCURRENCY.md` explicitly claims "every result is exactly what you'd get computing them one at a time" and that this is "verified in `tests/test_concurrency.py`, which ... asserts byte-for-byte equality." **In this session's environment (Python 3.14.6, which exceeds the package's declared 3.10-3.12 support), that byte-for-byte guarantee did not hold** — a reproducible, real finding. This could indicate (a) a genuine residual thread-safety gap in the `_SWE_LOCK` coverage of `pyswisseph`'s internal state under a newer CPython, or (b) an interaction specific to unsupported Python 3.14. Either way, **for a production concurrent server (FastAPI, as the library's own docs recommend), this should be re-verified on the actually-targeted Python version (3.10-3.12) before relying on the concurrency-safety claim.**

`mypy mayaastrolib/` → `Success: no issues found in 49 source files` (matches CHANGELOG's "mypy clean" claim).
`ruff check .` (repo source only) → `All checks passed!` (matches CHANGELOG's "ruff clean" claim).

---

## 8. Maintenance

- `git rev-parse --is-shallow-repository` → `true`. `git log --oneline | wc -l` → **1** (single squashed commit: `4fc184a "release: 0.5.0"`, dated 2026-06-08). **Git history depth is not verifiable from this clone** — the shallow clone hides all prior commits, so commit-frequency/contributor-count cannot be independently confirmed from `git log`; the analysis below relies on the in-repo `CHANGELOG.md`, which is detailed and internally consistent (task-numbered, cross-referenced with specific file/line changes and test counts) and reads as a credible first-party record.
- **CHANGELOG.md release history** (full document read): the project's life as `mayaastrolib` spans **2026-05-07 (fork/rename, v0.2.6→0.3.0) to 2026-06-08 (v0.5.0)** — about one month of very intensive, sequentially task-numbered work (Tasks 001 through 038+, covering recon, build-system modernization, thread-safety, typing, and the entire 12-module Vedic subsystem built module-by-module: foundation → nakshatras → divisional → dasha → ashtakavarga → sadesati → upagrahas → tajika → yogas → KP → shadbala). Each release entry is unusually detailed (exact function names, test counts, coverage deltas), suggesting either careful manual engineering or a rigorous AI-agent-driven development process (consistent with the `prompts/task-*.md` files, which read like structured briefs given to a coding agent).
- **No CHANGELOG entries after v0.5.0 (2026-06-08).** As of the "today" reference date for this audit (2026-09-13), that is roughly **3 months of no visible new-release activity** in the changelog. Combined with the shallow single-commit clone, this cannot be fully distinguished between "development paused" and "clone is simply stale/shallow and doesn't reflect a possibly-active upstream." The GitHub URL (`https://github.com/ranganc007/mayaastrolib`) was not checked live in this audit (out of scope — filesystem-only audit as instructed); a live check of the GitHub repo's actual commit/release history is recommended before finalizing a maintenance classification.
- **Classification: STABLE BUT LOW ACTIVITY (with the caveat that recent activity cannot be confirmed from this clone).** Justification: the fork shows genuine engineering rigor and an intense initial development burst (one of the more thorough one-person astrology-library efforts reviewed), but is very young (< 6 months since inception as of audit date) and single-maintainer, with no visible commits in the 3 months preceding this audit per the available changelog. It has not yet demonstrated multi-month sustained maintenance, a plural contributor base, or a response to real-world bug reports/issues (no GitHub issue tracker activity was reviewed as part of this filesystem-only audit).

---

## 9. Code quality scores

| Dimension | Score (0-10) | Justification |
|---|---|---|
| Architecture / Modularity | 8 | Clean separation: `ephem/` (swisseph wrapper: `swe.py`, `eph.py`, `ephem.py`, `tools.py`) → `object.py`/`chart.py` (domain model) → `aspects.py`/`dignities/`/`predictives/`/`protocols/`/`tools/` (Western techniques) → `vedic/` (12 independent, cleanly-layered modules: `ayanamsa.py` underpins everything else, `nakshatras.py`/`divisional.py`/`dasha.py` are pure functions with no chart coupling where possible). `aio.py` cleanly isolates async concerns. Minor deduction: `_compat.py`'s `property_with_method_compat`/`_DualAccess` machinery (105 lines) is a real complexity wart carried for backward compatibility with the old flatlib method-call API, and the flatlib shim's `sys.modules` manipulation (`flatlib/__init__.py:41-57`) is a code smell (necessary evil for compat, but fragile). |
| Typing quality | 9 | `mypy mayaastrolib/` verified clean in this session (0 errors, 49 files) on a strict-ish config (`warn_unused_ignores = true`). `py.typed` marker shipped (PEP 561). CHANGELOG documents a deliberate, honest, incremental typing rollout (e.g. explicitly noting `aspects.py`/`chart.py`/`object.py` were *deferred* for a task because of the dynamic `__dict__.update`/`_compat` machinery, then later completed). Not a 10 only because several classes still rely on dynamic `__dict__.update(properties)` patterns (`AspectObject.__init__`, `GenericObject.fromDict`) that work around rather than eliminate the need for `# type: ignore`-adjacent tricks. |
| Documentation | 8 | Every module has a substantive module-level docstring citing classical sources (e.g. `yogas.py` cites BPHS ch. 75-78, Phaladeepika ch. 6-7, Saravali ch. 33-35; `dasha.py` cites BPHS ch. 46-51, Muhurta Chintamani). Public functions/classes are docstringed with Args/Returns. `docs/` folder has 20 files including `FAQ.md`, `HOW-IT-WORKS.md`, `CONCURRENCY.md`, `KNOWN-BUGS.md`, `RELEASING.md`. Deduction: docs are scattered across many small markdown files without a single coherent "start here" architecture doc for a new reader (beyond README), and some Vedic modules honestly flag their formulas as "documented simplifications" (good honesty, but signals the domain docs aren't fully authoritative against primary Sanskrit texts). |
| Separation of concerns (calc/rule/interpretation) | 9 | As detailed in §5: calculation (ephemeris wrapper), rule (dignity/yoga tables + detection functions), and the complete absence of an interpretation layer are cleanly separated into distinct modules/packages (`ephem/` vs `dignities/`+`vedic/yogas.py` vs — nothing, by design; `docs/FORK-RATIONALE.md` explicitly states "Providing astrological interpretations (that's the consumer's concern)" is out of scope). Not a 10 only because the short gloss strings embedded in `PANCHA_MAHAPURUSHA` (`yogas.py:84-96`) blur rule/interpretation slightly (see §5). |
| Extensibility | 7 | Adding a new varga, yoga, or ayanamsa is a small, well-isolated data/function addition (demonstrated repeatedly across 38 CHANGELOG tasks without regressions). `Chart(IDs=...)` lets callers add/remove objects freely. Deduction: the hard dependency on `pyswisseph`'s specific body-id scheme (`SWE_OBJECTS` dict) means adding a body swisseph doesn't expose (e.g. a custom asteroid, a non-swisseph point) requires new plumbing; the single global `_SWE_LOCK` (see §7/8) is a deliberate simplicity-over-parallelism tradeoff that could become a bottleneck at very high concurrent load in a commercial SaaS. |
| Error handling | 8 | Real, deliberate input validation exists and is documented as a fix for a real historical bug: `GeoPos.__init__` (`geopos.py:81-91`) validates lat∈[-90,90]/lon∈[-180,180] post-coercion and raises `ValueError` with the offending value — added specifically because `GeoPos('200n00','0w00')` used to silently produce nonsensical charts (`docs/KNOWN-BUGS.md`, "Resolved" section, quoted in §10). `Chart.__init__` validates `zodiac`/`ayanamsa` against allowed lists and raises `ValueError` (`chart.py:91-94`). Datetime parsing raises `ValueError` on bad input (`datetime.py`). Deduction: not all edge cases are guarded (e.g. malformed date/time strings that fail deep inside stdlib `datetime` parsing may surface as less-friendly `ValueError`/`IndexError` rather than a uniform library exception type), and there's no dedicated exception hierarchy (`MayaAstroLibError` or similar) — all errors are stock `ValueError`/`TypeError`. |

---

## 10. Security notes

- **`eval`/`exec`/unsafe deserialization:** `grep -rn "eval(\|exec(\|pickle\|yaml.load\|subprocess\|os.system"` across `mayaastrolib/` and `flatlib/` returned **zero matches**. No dynamic code execution, no pickle, no unsafe YAML loading anywhere in the library.
- **Network calls:** `grep -rn "requests\.\|urllib\|socket\."` returned **zero matches**. The library is fully offline/local-computation — no telemetry, no remote calls, no external service dependency beyond the local Swiss Ephemeris data files it ships. This is a strong positive for a commercial backend (no unexpected egress, no third-party data leakage risk from the library itself).
- **File access:** `mayaastrolib.ephem.swe.setPath(path)` (`swe.py:73-76`) calls `swisseph.set_ephe_path(path)` — this takes a caller-supplied filesystem path with no validation. If a hosting application ever passes **untrusted user input** directly as an ephemeris path (unlikely in normal use, since this is a startup/config-time call, not a per-request one), it could be used for path-traversal-style probing of the filesystem via swisseph's file loading. Recommendation: always set this to a fixed, trusted path at application startup, never from user-supplied request data.
- **User-supplied birth data parsing (date/time/location) — the most relevant path for a public-facing SaaS form:**
  - `GeoPos.__init__` (`geopos.py:81-91`) — **validated**: accepts float, string ("21N01"-style), or signed-list; range-checks post-parse and raises a clean `ValueError` (not a crash) on out-of-range values. This was a real historical bug (`docs/KNOWN-BUGS.md`, quoted: `GeoPos('200n00', '0w00')` used to silently accept `lat=200.0` and produce "mathematically nonsensical output that didn't visibly fail" — fixed in the fork's Task 015, with 15 regression test cases).
  - `Datetime`/`Date`/`Time` (`datetime.py`) — parses string dates via internal regex/split logic and raises `ValueError` on malformed calendar dates; no evidence of crash-prone unguarded array indexing found in the read portions, but the full parsing path was not exhaustively fuzzed in this audit.
  - **No SQL, no templating, no HTML rendering** anywhere in the library — so classic injection classes (SQLi, XSS, SSTI) are not applicable to this library in isolation; risk would only arise from how a consuming web application handles the (well-typed, JSON-serializable) output, which is outside this library's scope.
  - **Recommendation for production use:** wrap all `GeoPos(...)`/`Datetime(...)` construction from user-submitted web-form data in a try/except that maps `ValueError`/`TypeError` to a clean 4xx API response — the library raises appropriately-typed exceptions rather than crashing the process, but does not sanitize or rate-limit anything itself (not its job, but worth noting for the consuming service's threat model).
- **Concurrency-safety caveat carries a security-adjacent reliability angle too:** see §7 — the 4 failing concurrency tests mean that under real concurrent multi-tenant load (a commercial SaaS scenario), two simultaneous requests computing different sidereal charts could theoretically read very slightly divergent floating-point results from what serial computation would produce, on at least one modern Python version. This is a correctness/reliability risk more than a classic security vulnerability, but for a paid product computing people's birth charts, even a 6th-decimal-degree divergence under load should be re-validated on the target deployment's exact Python version before shipping.

---

## 11. Tier recommendation

**Tier B — Reference implementation / strong technique-and-test source, not a directly-embeddable production dependency as-is.**

Justification:
- **Not Tier A (Foundation)** because (a) the mandatory Swiss Ephemeris dependency creates a real, unresolved commercial-licensing obligation (LEGAL REVIEW REQUIRED, §2) that must be cleared before any closed-source SaaS could adopt it wholesale as its calculation foundation; (b) it is a very young (~4 months old), single-maintainer fork with unverifiable recent commit activity (shallow clone, no changelog entries in the 3 months preceding this audit) — too early to bet a commercial product's core calculation engine on its long-term maintenance; (c) it targets Western/Vedic (Hindu) astrology specifically — none of its rule-tier content (yogas, dignities, dasha) transfers to Vietnamese phong-thủy/Bát Trạch/Huyền Không techniques, which are a structurally different tradition (compass-direction/Bagua-based, not planetary-longitude-based).
- **Solidly above Tier C/D** because the engineering quality is genuinely high for the niche: real independent-ephemeris golden tests (not just smoke tests), mypy/ruff-clean, honest and detailed documentation of what's implemented vs. deferred/simplified (rare in this space), a real working async/thread-safety story (even if one edge case failed in this session's environment), and — critically for a research audit — its `ephem/swe.py` wrapper, `Chart`/`Object` domain model, aspect/orb logic, and the general shape of its Vedic module organization (`ayanamsa` → `nakshatras`/`divisional`/`dasha`/`yogas` as independent layers over a shared `Chart`) are a **useful architectural reference** for how to structure a calculation-layer engine cleanly separated from rule and interpretation layers — directly relevant to the target phong-thủy engine's own layered-architecture goals, even though none of its domain content (Western/Vedic astrology) is directly reusable for Bát Trạch/Huyền Không phong-thủy.
- **Practical recommendation:** use this repository as a **design/architecture reference** (calculation/rule/interpretation separation, JSON schema-versioning approach in `chart.py`'s `to_dict()`, async-wrapping pattern in `aio.py`, thread-safety-via-single-lock pattern for a C-library dependency) and, if Western/Vedic astrology content is ever needed as a secondary feature of the Vietnamese site, evaluate it further with the Swiss Ephemeris licensing question resolved first. Do not adopt it as-is as "the astrology engine" without (1) clearing the Swiss Ephemeris commercial license question, and (2) independently re-confirming maintenance activity via a non-shallow clone / live GitHub check.
