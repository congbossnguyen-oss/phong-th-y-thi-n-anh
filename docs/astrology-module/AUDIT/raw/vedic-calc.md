# Source-Code Audit: `atolat/vedic-calc`

Repo: https://github.com/atolat/vedic-calc — audited from a local shallow clone at `C:\ccaudit\repos\vedic-calc` (HEAD `620d5456`, pulled 2026-09-13).

---

## 1. Summary Verdict

`vedic-calc` is an unusually deep, well-engineered, single-author Python library (69 source files, ~15,274 lines in `src/`, 41 test files, ~7,251 lines in `tests/`) that wraps `pyswisseph` (Swiss Ephemeris) for real astronomical positions and layers a genuinely broad Vedic/Jyotish calculation surface on top: all 15 requested divisional charts, four dasha systems (Vimshottari, Yogini, Ashtottari, Narayana/Chara), a real six-fold Shadbala engine, Ashtakavarga, ~24 hardcoded classical yogas, 6 dosha detectors (including Manglik, Kaal Sarpa, Pitru, Guru Chandal), a working KP sub-lord/sub-sub-lord/cuspal-sub-lord engine, and partial Jaimini (Chara Karaka, Arudha Pada — but no Karakamsha or Upapada Lagna function, and Rashi Drishti data is defined but unused/dead code). Code quality is genuinely high for an open-source astrology project: heavy source-cited docstrings (BPHS chapter/verse citations throughout), Pydantic-validated immutable models, a strict `ephemeris.py`-only-imports-`pyswisseph` boundary, and — rare among such repos — an actual cross-validated test suite (455/459 local tests passing on this machine, plus an optional PyJHora comparison suite and a documented 99.0%-pass benchmark against two commercial APIs with failures explicitly disclosed). The critical blocker for the stated commercial use case is licensing: the repo is **AGPL-3.0-or-later**, which is copyleft and network-triggering — using it inside a closed-source commercial SaaS (the Vietnamese phong-thủy site) as currently licensed would require either open-sourcing the derivative service or obtaining a separate commercial license from the author, neither of which currently exists. Combined with its extremely early lifecycle (created 2026-03-08, single contributor, 0 GitHub stars, no releases, last push 2026-03-23 — over 5 months of inactivity as of this audit), this is best used as a **reference implementation / algorithm-verification source**, not a production dependency, unless the license question is resolved.

---

## 2. License

- File: `LICENSE` (repo root) — full text is the **GNU Affero General Public License, Version 3, 19 November 2007** (verified by reading the file header and footer directly; standard FSF AGPLv3 boilerplate, not a modified/dual license).
- Also declared in `pyproject.toml:5`: `license = "AGPL-3.0-or-later"`.
- Also declared on GitHub itself (`license.spdx_id: "AGPL-3.0"` via the GitHub API), confirming no separate/dual license exists anywhere in the project metadata.
- README.md (bottom) restates: "License: AGPL-3.0".

**Commercial/closed-source SaaS compatibility: LEGAL REVIEW REQUIRED — likely INCOMPATIBLE as-is.**
AGPL-3.0's distinguishing clause (§13) extends the GPL's copyleft to network use: if a modified or unmodified copy of AGPL-licensed code is used to provide a service to users over a network (which a commercial SaaS astrology backend would do), the operator must offer those users the complete corresponding source code of the running service. For a commercial, closed-source Vietnamese phong-thủy platform, embedding `vedic-calc` as-is would create an obligation to open-source the service built on top of it (or at minimum the modified library plus network-interaction code), which is very likely incompatible with the intended commercial model. Practical options: (a) negotiate a separate commercial license directly with the author (`atolat`) — not currently offered anywhere in the repo, or (b) do not use this codebase's code directly, treating it only as an audited reference for correct formulas or as a black-box algorithm cross-check, and reimplement independently, or (c) fully open-source the resulting service. Flagging for non-lawyer sign-off: **LEGAL REVIEW REQUIRED**.

---

## 3. Dependencies

From `pyproject.toml`:
```
dependencies = [
    "pyswisseph>=2.10",
    "pydantic>=2.10",
]
```
- **Astronomical engine**: real dependency on `pyswisseph` (Swiss Ephemeris Python bindings) — confirmed both by the manifest and by `src/vedic_calc/core/ephemeris.py:39` (`import swisseph as swe`), which is explicitly the *only* module in the codebase allowed to import it (enforced by convention, stated in the repo's own `CLAUDE.md` and in the module's docstring: "THIS IS THE ONLY MODULE IN VEDIC-CALC THAT IMPORTS PYSWISSEPH"). No custom/from-scratch astronomical math — all planetary positions, ascendant, and sunrise/sunset come from Swiss Ephemeris (JPL DE431-based), which is the industry-standard engine used by JHora, AstroSage, etc.
- **Validation/modeling**: `pydantic>=2.10` — all ~50 public data types in `src/vedic_calc/core/types.py` are `BaseModel, frozen=True` classes with `Field(ge=..., lt=...)` range constraints (e.g. `longitude: float = Field(ge=0.0, lt=360.0)` at `types.py:145`).
- **Dev extras**: `pytest>=8.0`, `pytest-cov>=6.0`, `pytest-xdist>=3.0`.
- **`comparison` extras** (optional): `PyJHora>=4.5`, `numpy`, `geocoder`, `pytz`, `timezonefinder`, `geopy`, `python-dateutil` — used only by the opt-in `tests/comparison/` golden-reference suite (skipped automatically via `pytest.importorskip("jhora", ...)` if not installed).
- **`docs` extras**: `zensical>=0.0.27`.
- Confirmed via actual installation into a throwaway venv (Python 3.14.6): `pyswisseph` resolved to **2.10.3.2**, `pydantic` to **2.13.5** — both installed cleanly with prebuilt wheels, no build-from-source issues, no abandoned/yanked packages encountered.
- No evidence of abandoned or outdated pinning; version floors (`>=2.10`) are current as of this audit and the CLAUDE.md dev convention explicitly states "Keep all versions latest stable."
- Lockfile `uv.lock` present (176KB) — dependency graph is fully pinned/reproducible via `uv`.

---

## 4. Vedic Feature Table

| Feature | Supported | Implementation evidence (file:line) | Tested | Notes |
|---|---|---|---|---|
| Rashi / D1 chart | **Yes** | `src/vedic_calc/chart/calculator.py` (`calculate_chart`, docstring lines 1–39; sign/nakshatra formulas ~lines 75–110) | Yes — `tests/test_chart.py` | Whole-Sign house system; real Swiss Ephemeris sidereal longitudes verified via execution (see §7). |
| Divisional charts (vargas) | **D2,D3,D4,D7,D9,D10,D12,D16,D20,D24,D27,D30,D40,D45,D60 — all present** | `src/vedic_calc/chart/divisional.py:262-421` (`_get_divisional_sign`, `calculate_divisional_chart`); explicit formulas for D2 (`_d2_hora` L131), D3 (`_d3_drekkana` L148), D30 (`_d30_trimsamsa` L166); table-driven starts for D9/D27 (`_ELEMENT_STARTS` L217), D16/D20/D45 (`_MODALITY_STARTS` L234), D7/D10/D24/D40 (`_ODD_EVEN_STARTS` L254); D4, D12 have dedicated branches (L300-326) | Yes — `tests/test_divisional.py`, `tests/comparison/test_compare_divisional.py` (80/80 in benchmark report) | **Caveat**: D60 (Shashtiamsa) and any division not in the special-case tables fall through to a generic "count-from-sign" formula (`divisional.py:340-341`), which the code's own docstring calls a simplification, not the classical 60-named-deity Shashtiamsa scheme — accuracy for D60 specifically should be independently verified before commercial use. |
| Nakshatra (27) + pada + lord | **Yes** | `src/vedic_calc/core/constants.py:210-323` (`Nakshatra` enum, `NAKSHATRA_LORDS`); `NakshatraInfo` model with `pada: Field(ge=1,le=4)` at `types.py:101-104` | Yes — `tests/test_chart.py`, verified via execution (§7) | All 27 named and lord-mapped; formulas cited to BPHS Ch. 46. |
| Dasha — Vimshottari | **Yes** | `src/vedic_calc/dasha/calculator.py:108` (`calculate_dasha`), supports levels 1-5 (mahadasha → pranadasha per `docs/architecture.md`) | Yes — `tests/test_dasha.py` (structural + count tests), `tests/comparison/test_compare_dasha.py` (sequence vs PyJHora) | Verified via execution — produced correct 9-mahadasha sequence for benchmark chart (§7). |
| Dasha — Yogini | **Yes** | `src/vedic_calc/dasha/yogini.py:85` (`calculate_yogini_dasha`); constants `YOGINI_DASHA_YEARS`/`_ORDER` at `constants.py:996-1012` | Yes — `tests/test_dasha.py`, comparison suite (10/10 in benchmark) | 8-yogini, 36-year cycle. |
| Dasha — Ashtottari | **Yes** | `src/vedic_calc/dasha/ashtottari.py:168` (`calculate_ashtottari_dasha`) | Yes — `tests/test_additional_dashas.py`, comparison suite | 8-planet (no Ketu), 108-year cycle per BPHS Ch. 47. |
| Dasha — Chara/Narayana (Jaimini) | **Yes** | `src/vedic_calc/dasha/narayana.py:82` (`calculate_narayana_dasha`) | Yes — `tests/test_additional_dashas.py` | Code's own docstring (L22-24) admits: "This is a simplified implementation... [lacks] exalted/debilitated lord adjustments, Rahu/Ketu exceptions, dual lordship rules for Scorpio/Aquarius" — self-disclosed limitation. |
| Dasha — Kalachakra | **NOT PRESENT** | — | — | No file, class, or reference anywhere in `src/`. |
| Dasha — other (KP star/sub as timing) | Partial, via KP module | see KP row | — | Not a distinct "dasha system" file. |
| Shadbala (6-fold strength) | **Yes** | `src/vedic_calc/strength/shadbala.py:1043` (`calculate_shadbala`) — full implementation incl. Sthana Bala (L300), Dig Bala (L399), Kaala Bala with Ayana Bala via Lagrange interpolation of solar declination (L660-748), Chesta Bala (L749), Naisargika Bala (L915), Drik/aspect Bala (L924) | Yes — `tests/test_strength.py`, `tests/comparison/test_compare_shadbala.py` | This is a genuine multi-component implementation, not a stub — includes real ayanamsa-aware Ayana Bala with Lagrangian interpolation, an unusually rigorous touch for an OSS repo. |
| Bhava Bala | **NOT PRESENT** as a distinct named function | — | — | House-strength assessment exists only as a qualitative `analyze_houses()` (`chart/houses.py:78`), not classical numeric Bhava Bala. |
| Ashtakavarga | **Yes** | `src/vedic_calc/strength/ashtakavarga.py:35` (`calculate_ashtakavarga`); benefic-point tables `ASHTAKAVARGA_BENEFIC` at `constants.py:751-822` (all 7 planets + lagna) | Yes — `tests/test_strength.py`, comparison suite (70/70 in benchmark) | Full Bhinnashtakavarga tables present, cited to BPHS Ch. 66-72. |
| Yoga engine | **Yes, but hardcoded conditionals, not a data-driven rule engine** | `src/vedic_calc/yoga/calculator.py` — 24 individually hand-coded `_detect_*` functions (`_detect_ruchaka` L96, `_detect_bhadra` L121, `_detect_hamsa` L144, `_detect_malavya` L167, `_detect_shasha` L190 = Pancha Mahapurusha; plus Gajakesari, Budhaditya, Dhana, Lakshmi, Raja Yoga, Viparita Raja, Saraswati, Kemadruma, Shakata, Daridra, Chandra-Mangal, Amala, Sunapha, Anapha, Durudhara, Veshi, Voshi, Ubhayachari, Neechabhanga Raja), all called explicitly by name inside `detect_yogas()` (L824-870+) | Yes — `tests/test_yogas.py`, `tests/comparison/test_compare_yogas.py` | README claims "~20 classical yogas"; actual count in code is 24 `_detect_*` functions. Each is a hardcoded Python `if` condition (e.g. Ruchaka = Mars own/exalted AND in a kendra, `calculator.py:110-113`), not driven by a generalized data table — extending this to hundreds of yogas would require writing new functions one at a time. |
| Dosha detectors | **Yes** — Manglik, Kaal Sarpa, Pitru, Grahan, Guru Chandal, Shani (6 total) | `src/vedic_calc/dosha/calculator.py` — `_detect_manglik` L48, `_detect_kaal_sarpa` L149, `_detect_pitru` L273, `_detect_grahan` L335, `_detect_guru_chandal` L388, `_detect_shani` L423 | Yes — `tests/test_doshas.py`, comparison suite (23/30 passed per benchmark, see §6) | All requested items (Manglik, Kala Sarpa, Pitru, Guru Chandala) present with cancellation-factor logic (e.g. Manglik cancellation for Mars in own sign, Jupiter aspect, etc. at `calculator.py:96-116`), not bare booleans. |
| Jaimini — Chara Karaka | **Yes** | `src/vedic_calc/jaimini/karakas.py:35` (`calculate_chara_karakas`) — 8-karaka scheme (Atmakaraka etc., `constants.py:1044-1048`) | Yes — `tests/test_jaimini.py` | |
| Jaimini — Rashi Drishti (sign aspects) | **CLAIMED BUT NOT WIRED IN (dead data)** | Constant table `RASHI_DRISHTI` fully defined at `constants.py:726-739`, but `grep -rn "RASHI_DRISHTI" src/ tests/` shows **zero usages** anywhere outside its own definition — no consumer function exists. `chart/aspects.py` only implements Graha Drishti (planetary aspects), not sign-based Jaimini aspects. | No | Data table exists; feature is not actually exposed via any public function. |
| Jaimini — Arudha Pada (incl. Arudha Lagna) | **Yes** | `src/vedic_calc/jaimini/arudha.py:52` (`calculate_arudha_padas`) — computes all 12 house Arudhas with the two classical exception rules (same-sign → 10th, 7th-from-house → 4th), `arudha.py:95-105` | Yes — `tests/test_jaimini.py` | |
| Jaimini — Upapada Lagna | **NOT PRESENT** | `grep -rniE "upapada" src/` → no hits | — | |
| Jaimini — Karakamsha | **NOT PRESENT** | `grep -rniE "karakamsha" src/` → no hits (only "Atmakaraka" referenced) | — | Trivially derivable by combining existing Atmakaraka + D9 code, but not implemented as a named function. |
| KP — Nakshatra Lord | **Yes** | Same table as D1 (`NAKSHATRA_LORDS`), consumed in `kp/calculator.py` | Yes — `tests/test_kp.py` (e.g. L41-44 asserts Ashwini's star lord = Ketu) | |
| KP — Sub Lord | **Yes** | `src/vedic_calc/kp/sublords.py:99` (`get_kp_sublord`) — proportional Vimshottari-based sub-division of each 13°20′ nakshatra, correct classical KP method | Yes — `tests/test_kp.py` | |
| KP — Sub-Sub Lord | **Yes** | `src/vedic_calc/kp/sublords.py:75` (`_find_sub_sub_lord`) | Yes — `tests/test_kp.py` (asserts first sub-sub = sub lord for 0° Ashwini) | Goes one level deeper than most open KP implementations. |
| KP — Cuspal Sub Lord | **Yes** | `src/vedic_calc/kp/houses.py:22` (`calculate_kp_houses`) computes Placidus cusps via `swe.houses(..., b'P')` then calls `get_kp_sublord()` per cusp, producing `KPHouseCusp` with sub-lord attached | Yes — `tests/test_kp.py` | Correctly uses Placidus (not Whole Sign) for KP, as KP requires. |
| KP — Significators | **Yes** | `src/vedic_calc/kp/significators.py:45` (`get_kp_significators`), `:102` (`get_kp_house_significators`) | Yes — `tests/test_kp.py` | |
| Dosha — Manglik | **Yes** | see Dosha row above | Yes | |
| Dosha — Kala Sarpa | **Yes** | see Dosha row above | Yes (7 mismatches vs AstrologyAPI reference in benchmark, see §6) | |
| Dosha — Pitru | **Yes** | see Dosha row above | Yes | |
| Dosha — Guru Chandala | **Yes** | see Dosha row above | Yes | |
| Ayanamsa systems | **Lahiri, Raman, KP, True Chitrapaksha (4 total)** | `src/vedic_calc/core/constants.py:576-589` (`class Ayanamsa(IntEnum)`) | Indirectly, via all chart tests (default Lahiri) | No Fagan-Bradley, Yukteshwar, Suryasiddhanta, or other ayanamsas — only these 4 SE modes are wired up. |

---

## 5. Calculation / Rule / Interpretation Layer Classification

The codebase cleanly separates three layers, matching the target architecture described in the audit brief:

**Layer 1 — Calculation (raw facts only)**
`src/vedic_calc/core/ephemeris.py:112-189` (`get_planet_longitude`) — pure astronomical fact, no astrological judgment:
```python
sidereal_lon = (tropical_lon - ayanamsa) % 360.0
is_retrograde = speed < 0
return sidereal_lon, is_retrograde
```
This is the *only* place pyswisseph is touched; everything above it consumes plain floats.

**Layer 2 — Rule logic (astrological conditionals encoded in code)**
`src/vedic_calc/yoga/calculator.py:96-117` (`_detect_ruchaka`) — encodes a classical BPHS rule as an explicit boolean condition plus a one-line rationale:
```python
present = _is_in_own_or_exalted(planet, sign) and house in KENDRA_HOUSES
return YogaResult(
    name="Ruchaka", category="pancha_mahapurusha", involved_planets=[planet],
    description="Mars in own/exalted sign in kendra — courage, military prowess, leadership.",
    is_present=present,
)
```
`src/vedic_calc/dosha/calculator.py:96-122` (Manglik cancellation logic) goes further, encoding *multiple* classical exception rules (Mars in own/exalted sign, Jupiter aspect, Mars in kendra from Jupiter, Venus-Mars conjunction) as a `cancellation: list[str]` — genuine rule-engine behavior, not a bare flag.

**Layer 3 — Interpretation (natural-language text)**
Present only in minimal, templated form — **not** a full natural-language interpretation/prediction engine. Every `YogaResult`/`DoshaResult` carries a `description: str` field (`types.py:537`, `:558`) that is a single hardcoded sentence per rule, e.g. `dosha/calculator.py:118-122`:
```python
description = (
    f"Manglik Dosha: Mars afflicts marriage houses from {refs_str}."
    if is_present else "Manglik Dosha not present."
)
```
There is no paragraph-level prediction text, no LLM/template-driven report generation, and no "remedies" content beyond the cancellation-factor list. For the target commercial product, this repo would supply Layers 1-2 only; a full interpretation/copy layer would still need to be built separately.

---

## 6. Test Audit

**41 test files, ~7,251 lines** in `tests/` (excludes the separate `benchmarks/` accuracy script). This is a real, substantive test suite — not merely smoke tests — though quality varies by file:

- **Structural/count tests** (majority): e.g. `tests/test_dasha.py:30-58` verifies mahadasha count = 9, antardasha count = 81 (9×9), pratyantardasha count = 729 (9×9×9) — verifies internal consistency, not against an external ground truth.
- **Golden-value tests against internal formula tables**: `tests/test_kp.py:40-44`:
  ```python
  assert info.sign == Sign.ARIES.value
  assert info.sign_lord == Planet.MARS.value       # Mars rules Aries
  assert info.star_lord == Planet.KETU.value        # Ashwini lord = Ketu
  assert info.sub_lord == Planet.KETU.value         # First sub = star lord = Ketu
  assert info.sub_sub_lord == Planet.KETU.value     # First sub-sub = sub lord = Ketu
  ```
- **External cross-validation suite** (`tests/comparison/`, 8 files): compares vedic-calc output against **PyJHora** (a separate, independently-maintained Vedic astrology library) for dasha sequences, aspects, divisional charts, doshas, muhurta, shadbala, and yogas. Example: `tests/comparison/test_compare_dasha.py:60-80` runs `calculate_dasha()` against `jhora.horoscope.dhasa.graha.vimsottari.get_vimsottari_dhasa_bhukthi()` for the same birth data and asserts the mahadasha lord sequences match. This suite is **optional** — gated by `pytest.importorskip("jhora", reason="PyJHora not installed")` — so it does not run in a default `pytest` invocation.
- **Documented accuracy benchmark** (`benchmarks/ACCURACY_REPORT.md`, generated 2026-03-23): a separate, more rigorous exercise comparing vedic-calc against **two commercial reference APIs (AstrologyAPI.com, Prokerala)** across 1,015 individual assertions on 10 real birth charts: **1,005 passed / 10 failed (99.0%)**. Crucially, the failures are **disclosed, not hidden**: 7 Kaal Sarpa/Sadhesati dosha mismatches and 3 Sade Sati mismatches are itemized by chart with the actual vs. reference values shown (e.g. "Delhi 1992 | Kalsarpa | Present | `False` | `True` | AstrologyAPI"). This is unusually transparent self-QA for an open-source astrology repo — most either have no such benchmark or don't publish disagreements.
- This benchmark script (`benchmarks/accuracy.py`, 1,812 lines) runs against a **cached fixture file** (`benchmarks/fixtures/benchmark_reference.json`, ~58,000 lines of pre-recorded API responses) by default, with a `REFRESH_FIXTURES=1` env var to re-hit the live APIs — meaning the 99.0% figure is reproducible without needing new API keys, but is also now a frozen snapshot (from March 2026) rather than a live-verified number.

**Executed locally** (see §7 for environment): `pytest tests/ --ignore=tests/comparison` → **455 passed, 4 failed** in 120s. All 4 failures are in `tests/test_renderer.py::TestSVG::*` and share one root cause — `renderer.py:358` uses `dt.strftime("%-d %b %Y")` / `%-I:%M %p"`, where the `%-` flag (strip leading zero) is a glibc/macOS `strftime` extension not supported by Windows' C runtime, raising `ValueError: Invalid format string`. This is a **Windows-portability bug in SVG chart rendering**, not a calculation-accuracy defect — all non-rendering calculation tests passed.

Conclusion: this is a real, mixed-methodology test suite with genuine external cross-validation, not merely "doesn't crash" testing — a rarity among open-source astrology repos.

---

## 7. Execution Attempt Results

**Environment**: Windows 11, Python 3.14.6, fresh venv at `C:\ccaudit\vc_venv`, package installed via `pip install -e .` (editable install succeeded cleanly; `pyswisseph` 2.10.3.2 and `pydantic` 2.13.5 resolved with prebuilt wheels, no compilation required).

**Benchmark input**: Birth Date 1985-03-12, Time 08:30, Hanoi, Lat 21.0285, Lon 105.8542, Timezone UTC+7 (passed as `timezone_offset=7.0`, no DST).

**Result: SUCCEEDED.** Actual program output (via `calculate_chart`, `calculate_dasha`, `get_current_dasha`):

```
=== ASCENDANT ===
Sign: ARIES, Degree in sign: 11.8923

=== PLANETS ===
SUN     : sign=AQUARIUS     deg=27.7719  nakshatra=PURVA_BHADRAPADA   pada=3  retro=False
MOON    : sign=SCORPIO      deg= 6.3610  nakshatra=ANURADHA           pada=1  retro=False
MARS    : sign=ARIES        deg= 4.0558  nakshatra=ASHWINI            pada=2  retro=False
MERCURY : sign=PISCES       deg=14.7675  nakshatra=UTTARA_BHADRAPADA  pada=4  retro=False
JUPITER : sign=CAPRICORN    deg=13.5929  nakshatra=SHRAVANA           pada=2  retro=False
VENUS   : sign=PISCES       deg=28.5881  nakshatra=REVATI             pada=4  retro=False
SATURN  : sign=SCORPIO      deg= 4.4585  nakshatra=ANURADHA           pada=1  retro=True
RAHU    : sign=ARIES        deg=27.7879  nakshatra=KRITTIKA           pada=1  retro=True
KETU    : sign=LIBRA        deg=27.7879  nakshatra=VISHAKHA           pada=3  retro=True

=== MOON NAKSHATRA / LORD ===
Moon Nakshatra: ANURADHA, Pada: 1, Lord: SATURN

=== VIMSOTTARI DASHA (Mahadashas) ===
SATURN  : 1980-11-17 -> 1999-11-18
MERCURY : 1999-11-18 -> 2016-11-17
KETU    : 2016-11-17 -> 2023-11-18
VENUS   : 2023-11-18 -> 2043-11-18
SUN     : 2043-11-18 -> 2049-11-17
MOON    : 2049-11-17 -> 2059-11-18
MARS    : 2059-11-18 -> 2066-11-17
RAHU    : 2066-11-17 -> 2084-11-17
JUPITER : 2084-11-17 -> 2100-11-18

=== CURRENT DASHA (as of today, 2026-09-13) ===
mahadasha: VENUS (2023-11-18 - 2043-11-18)
antardasha: VENUS (2023-11-18 - 2027-03-19)
pratyantardasha: MERCURY (2026-07-19 - 2027-01-07)
```

These are unverified against a second independent source as part of this audit (no ground-truth chart for this specific Hanoi date/time was cross-checked against e.g. AstrologyAPI/Prokerala/JHora within this session) — the numbers above are simply the actual, real output the code produced, not fabricated. Given the library's own 99.0% cross-validation rate against commercial APIs on *other* charts (§6), there is reasonable but not certain confidence these values are correct; independent spot-verification against a second ephemeris tool is recommended before relying on this for production.

The full test suite was also run (see §6): 455/459 passed (excluding the optional PyJHora comparison suite), with 4 unrelated SVG-rendering failures caused by a Windows `strftime` incompatibility (`renderer.py:358`).

---

## 8. Maintenance

- `git log -1` (local clone): single commit visible, `620d54560ee7e108496495eeb17054a52630a0bf`, dated 2026-03-23, author `atolat`. **This clone is shallow** (`git rev-parse --is-shallow-repository` → `true`), so the 1-commit local history does not reflect the real project history.
- Full history recovered via the public GitHub API (`api.github.com/repos/atolat/vedic-calc`): repo **created 2026-03-08**, **92 commits** fetched (single page), all authored by the sole contributor `atolat`, spanning **2026-03-08 to 2026-03-23** (roughly a 2-week intensive build), with a commit-message pattern indicating AI pair-programming (e.g. "Co-Authored-By: Claude Opus 4.6 (1M context)").
- `pushed_at: 2026-03-23T15:14:14Z` — **no commits or pushes in the ~5.5 months since**, as of this audit (2026-09-13).
- GitHub metadata: **0 stargazers**, **0 watchers**, **1 fork**, **0 open issues**, **no releases/tags published**, single contributor (`contributors_url` lists only `atolat`, 31 recorded contributions).
- Repo's own `CLAUDE.md` (dev-convention file) confirms this was a disciplined, AI-assisted solo build ("Heavy commenting is mandatory," "Every new feature must have tests") rather than a community project.
- Codebase size: 69 Python files / ~15,274 lines in `src/`; 41 files / ~7,251 lines in `tests/`; plus a 1,812-line accuracy-benchmark script and a ~58,000-line cached API-fixture JSON.

**Classification: EXPERIMENTAL** (early-stage, single-author, zero external adoption signals, no releases) — but notably *not low-quality* experimental: it reads as a completed, feature-complete solo sprint that has since gone dormant, rather than an abandoned or actively-maintained project. There is no evidence of a maintenance cadence, issue triage, or a plan for ongoing support — treat it as a frozen snapshot rather than a dependency with an upgrade path.

---

## 9. Code Quality Scores (0-10)

| Dimension | Score | Justification |
|---|---|---|
| Architecture / layering | 9 | Strict, enforced boundary: only `core/ephemeris.py` imports `pyswisseph` (confirmed by grep — no other file under `src/` imports `swisseph` except `kp/houses.py`, which is a deliberate, documented exception for Placidus cusps not exposed by the abstracted `ephemeris.py` API). Clean separation into `chart/`, `dasha/`, `dosha/`, `jaimini/`, `kp/`, `strength/`, `yoga/`, `panchanga/`, `muhurta/`, `prashna/`, `varshaphal/`, `compatibility/`, `numerology/` packages, matching `docs/architecture.md`'s documented layer diagram almost exactly. |
| Modularity | 8 | Each astrological subsystem is its own package with a narrow public surface re-exported from `__init__.py`; internal helpers are prefixed `_` and kept private. Minor deduction: some duplicate private helpers (e.g. `_is_odd_sign`, `_count_signs` reimplemented near-identically in both `divisional.py` and `narayana.py`) rather than shared utilities. |
| Typing | 9 | Type hints used consistently throughout (`from __future__ import annotations`, full parameter/return annotations observed in every file sampled); Pydantic models add runtime-enforced types via `Field(ge=..., lt=...)` constraints, going beyond static hints alone. |
| Documentation / docstrings | 10 | Exceptional for an OSS project of this kind — every module has a purpose docstring, every public function has Args/Returns/Example, and nearly every formula cites its classical source (BPHS chapter/verse, Surya Siddhanta, Brihat Jataka, Phaladeepika) inline, e.g. `divisional.py:24-27`, `arudha.py:20-30`. This materially de-risks reviewing the astrological correctness of the code. |
| Separation of calculation/rule/interpretation concerns | 8 | Clean 2.5-layer separation as documented in §5; the only minor blur is that rule-layer functions (yoga/dosha detectors) embed their one-line "interpretation" string directly rather than in a separate templating layer, which is a reasonable simplification for this project's scope but would need refactoring for a production interpretation pipeline. |
| Extensibility | 6 | Adding a new yoga or dosha means writing a new hardcoded `_detect_*` Python function and manually registering it in a list (`yoga/calculator.py:824+`) — functional but not data-driven; scaling to hundreds of yogas (as a commercial product likely needs) would require significant refactoring toward a declarative rule table. Divisional chart logic, by contrast, is reasonably data-driven (`_ELEMENT_STARTS`, `_MODALITY_STARTS`, `_ODD_EVEN_STARTS` dictionaries) and would extend more easily. |
| Error handling / input validation | 5 | Output data models are well-validated via Pydantic `Field()` constraints (e.g. longitude ranges, pada 1-4). However, **no explicit validation was found on public entry-point inputs** — `grep -n "raise " src/vedic_calc/chart/calculator.py src/vedic_calc/core/types.py` returned zero matches; `calculate_chart()` accepts arbitrary `latitude`/`longitude`/date values with no range checks (e.g. latitude > 90° or an invalid calendar date would propagate uncaught into `pyswisseph`, likely surfacing as an unhandled/unfriendly exception rather than a clear `ValueError`). For a commercial product taking untrusted user birth-data input, an input-validation layer would need to be added on top. |
| Test rigor | 9 | See §6 — genuine external cross-validation (PyJHora + two commercial APIs) with disclosed failure rates, not just smoke tests. Deducted one point only because the flagship 99.0% benchmark is a frozen March-2026 snapshot rather than a continuously-run CI check. |

---

## 10. Security Notes

- `grep -rn "eval(\|exec(\|pickle\|yaml.load\|subprocess\|os.system" src/` → **zero matches**. No dynamic code execution, no unsafe deserialization, anywhere in the library source.
- `grep -rn "requests\.\|httpx\.\|urllib\|socket\." src/` → **zero matches**. The core library makes no network calls at all; the only network dependency (`httpx`) is confined to the opt-in `benchmarks/accuracy.py` script (used solely to hit AstrologyAPI.com/Prokerala for the manual accuracy benchmark, not part of the installable package or its runtime behavior).
- **Input handling**: user-supplied birth data (year/month/day/hour/minute/latitude/longitude/timezone_offset) flows directly from `calculate_chart()`'s parameters into `_to_julian_day()` → `swe.julday()` and `swe.calc_ut()`/`swe.houses_ex()` with **no bounds or type validation** in the wrapper layer itself (no `raise`/`ValueError` found in `chart/calculator.py` or `core/ephemeris.py`). This is a robustness/data-quality gap rather than an injection-style vulnerability — Swiss Ephemeris is a well-hardened numerical C library, not a shell or query interpreter — but out-of-range latitude (e.g. >90°) or nonsensical dates could produce silently wrong results or an unhandled low-level exception rather than a clean, user-facing validation error. A commercial integration should add its own input-sanitization layer in front of this library regardless of which underlying engine is chosen.
- No secrets, API keys, or credentials found committed in the repository (the `comparison`/`benchmarks` scripts that call commercial APIs read keys from environment variables, per standard practice — not verified in exhaustive detail but no hardcoded key strings were observed during this review).

---

## 11. Tier Recommendation

**Tier: C — Specialized (Reference-Grade, License-Blocked)**

Justification: On pure code/algorithm quality, this repo would score close to **Tier B (Reference)** — it has the broadest, best-documented, most rigorously cross-validated open-source Vedic calculation surface encountered in this class of audit, including features (KP sub-sub-lord, Lagrangian Ayana Bala, disclosed 99% benchmark accuracy) that many "full" commercial competitors don't bother to document this transparently. It is held to **Tier C** rather than B for three compounding reasons: (1) the **AGPL-3.0 license is very likely incompatible with the closed-source commercial SaaS use case** without a separate commercial agreement or full open-sourcing of the derivative service — this alone should block direct code reuse pending legal sign-off; (2) it is an **EXPERIMENTAL-maturity, single-author, zero-adoption project** (0 stars, no releases, 5+ months dormant) with no support/maintenance guarantee; (3) some claimed-adjacent Jaimini/varga features are either simplified (D60, Narayana Dasha both self-disclosed as incomplete) or defined-but-unwired (Rashi Drishti data with no consumer). **Recommended use for this engagement**: treat `vedic-calc` as a **specialized reference and cross-validation source** — read its formulas (all clearly cited to BPHS/Surya Siddhanta/etc.) to verify or challenge an independently-licensed implementation's correctness, and reuse its test/benchmark *methodology* (cross-checking against PyJHora and commercial APIs with disclosed failure rates) — but do not import or fork its code directly into a closed-source commercial product without first resolving the AGPL licensing question with the author or legal counsel.
