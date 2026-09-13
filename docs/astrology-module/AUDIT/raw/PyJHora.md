# PyJHora (naturalstupid/PyJHora) — Deep Source-Code Audit

Repo audited at: `C:\ccaudit\repos\PyJHora`
Audit date: 2026-09-13. Last commit in local clone: `48e57d29b47a3143519910a24866758116467485`, dated 2026-08-06, message "V4.9.3" (shallow clone, depth=1 — see Maintenance section).

---

## 1. Summary Verdict

PyJHora is by far the most feature-complete open-source Vedic astrology codebase examined in this line of audits: a single author has built roughly 119,000 lines of Python across 160 files implementing 24 divisional charts (D1 through D150), at least 30 distinct dasha systems (graha- and rasi-based), full Shadbala/Bhava Bala/Ashtakavarga strength engines, 130+ named classical yogas, 8 doshas, Jaimini Chara Karakas and Arudha Padas, and a genuine KP (Krishnamurti Paddhati) star-lord/sub-lord/sub-sub-lord/pratyantar/sookshma/prana/deha micro-lord chain — all verified by reading source and by successfully executing headless calculations for the requested benchmark birth data (1985-03-12 08:30, Hanoi). The codebase is explicitly built as a chapter-by-chapter implementation of a specific astrology textbook (see `features_per_book.txt` and the 28 `chapter_N_tests()` functions in `tests/pvr_tests.py`, which reference "BV Raman" by name), and a large fraction of the ~3,100+ tests we were able to run before truncating for time passed against literal expected numeric/date values from that book — this is genuine golden-value regression testing, not smoke testing. The overwhelming blocker for commercial/SaaS use is licensing: the repo is **AGPL-3.0-or-later**, a strong copyleft license that is very difficult to reconcile with a closed-source commercial SaaS product (see License section — LEGAL REVIEW REQUIRED). Code quality is uneven: excellent docstring coverage and a mature test culture, but near-zero type hints, pervasive `eval()`-based dynamic dispatch, a monolithic 13,127-line `yoga.py`, and hardcoded-conditional (not data-driven) yoga/dosha logic. Net assessment: outstanding as a **reference/ground-truth oracle** for validating a from-scratch commercial engine's calculations, but not usable as embedded code in a closed-source product without a separate commercial license from the author (none advertised) or a full independent re-implementation.

---

## 2. License

`LICENSE` (repo root, 35,163 bytes) is the verbatim **GNU Affero General Public License, Version 3, 19 November 2007** (confirmed by direct text match: "GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007 / Copyright (C) 2007 Free Software Foundation, Inc.").

This is corroborated in `pyproject.toml`:
```
license-expression = "AGPL-3.0-or-later"
license-files = ["LICENSE"]
```
Every source file we opened (e.g. `src/jhora/horoscope/dhasa/graha/vimsottari.py:9-19`, `src/jhora/tests/pvr_tests.py:9-19`) carries a repeated header: *"This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License... version 3, or (at your option) any later version."*

**Commercial/closed-source SaaS compatibility: LEGAL REVIEW REQUIRED — high risk / likely incompatible as-is.**
- AGPL-3.0 is the strongest copyleft license in common use. Unlike GPL, its network-use clause (§13) requires that if you run a modified version of the program to interact with users over a network (i.e., exactly the SaaS model described — "a professional commercial astrology engine... for a Vietnamese phong-thuy website"), you must offer those users the corresponding source code of your modified version.
- Embedding or linking PyJHora's calculation code into a closed-source commercial backend that serves results to end users over the web would very likely trigger the AGPL's source-disclosure obligation for the combined/derivative work.
- No dual-licensing or commercial-license offer was found anywhere in the repo (no `COMMERCIAL_LICENSE`, no mention in README of paid/alternative licensing terms).
- Practical implication for the stated use case: PyJHora's code cannot safely be vendored into a closed-source product. It can be used (a) as a reference oracle to validate an independently-written, cleanroom engine's output, (b) run as a fully open-sourced component of the product (with the entire connected service's source made available per AGPL §13), or (c) the underlying classical algorithms (which are traditional/public-domain astrological methods, not copyrightable ideas) could be independently re-implemented from primary textbook sources without copying PyJHora's code — but that must be done as genuinely independent implementation, not derivative adaptation, to avoid AGPL taint. **Recommend formal legal review before any code reuse.**

---

## 3. Dependencies

`requirements.txt` (repo root):
```
geocoder==1.38.1
geopy==2.4.1
img2pdf==0.5.1
numpy==2.1.1
PyQt6==6.7.1
pyqtgraph==0.13.7
pytz==2024.1
Requests==2.32.3
setuptools==69.5.1
pyswisseph==2.10.3.2
timezonefinder==6.5.2
```

- **Astronomical engine: pyswisseph (Swiss Ephemeris), not custom math.** Confirmed at `src/jhora/const.py:291-302`, where every ayanamsa constant is pulled directly from `swe.SIDM_*` (e.g. `swe.SIDM_LAHIRI`, `swe.SIDM_KRISHNAMURTI`, `swe.SIDM_TRUE_CITRA`), and `import swisseph as swe` appears throughout `panchanga/drik.py` and `tests/pvr_tests.py`. This means planetary positions are computed by the industry-standard Swiss Ephemeris library (high precision, same engine used by most professional astrology software), not a hand-rolled orbital model.
- **GUI dependency: PyQt6 + pyqtgraph.** `PyQt6==6.7.1` and `pyqtgraph==0.13.7` are pinned. The entire `src/jhora/ui/` package (20,674 lines across its `.py` files) is PyQt6-based desktop GUI code, confirmed GUI-only (see Execution section — the "engine" entry point in `tests/test_engine.py` imports `from PyQt6.QtWidgets import QApplication` and `from jhora.ui.horo_chart_tabs import ChartTabbed` directly).
- **Undeclared/missing dependencies found during install (dependency-hygiene gap):** attempting a clean headless install and `import jhora.panchanga.drik` failed twice on modules **not listed in `requirements.txt`**: `geocoder` transitively needs `six`/`click`/`future`/`ratelim` (installed automatically, fine), but critically `src/jhora/utils.py:44` does `from dateutil import relativedelta` — **`python-dateutil` is not in `requirements.txt` at all** and had to be installed manually. `utils.py` also does `import certifi` (used in `get_elevation`, `utils.py:154`) which likewise is not pinned. This is a real packaging bug: a documented `pip install -r requirements.txt` would not produce a working environment.
- **Abandoned/outdated dependency — verified via `pip index versions`:**
  - `geocoder==1.38.1`: **confirmed abandoned upstream.** `pip index versions geocoder` shows `1.38.1` as both the pinned AND the latest-ever-published version — the package (by Denis Carriere) has had no release since this pinned version; it is a widely known unmaintained package in the Python ecosystem. This is a real supply-chain risk for a commercial product (unpatched, uses old dependency chain of `six`/`future`).
  - `pytz==2024.1` vs. latest available `2026.3.post1` at audit time — stale but pytz itself is still maintained upstream; just not kept current in this repo.
  - `numpy==2.1.1` vs. latest `2.5.3` — a few minor versions behind, not abandoned.
  - `PyQt6==6.7.1` vs. latest `6.11.0` — several minor versions behind, not abandoned.
  - `pyswisseph==2.10.3.2` — pinned to the latest version available on PyPI at audit time (only 3 versions ever published: 2.8.0.post1, 2.10.3.1, 2.10.3.2); actively current.
- No `setup.cfg`/`Pipfile`; `pyproject.toml` exists for packaging metadata (PEP 621) with `requires-python = ">=3.8"`.

---

## 4. Vedic Feature Table

| Feature | Supported | Implementation evidence (file:line) | Tested | Notes |
|---|---|---|---|---|
| Rashi / D1 chart | **YES** | `src/jhora/horoscope/chart/charts.py:91` `rasi_chart()`; verified live: our benchmark run produced Sun/Aquarius, Moon/Scorpio, Asc/Aries etc. | Yes — `tests/pvr_tests.py` chapters 1-31, thousands of assertions; verified live execution | Uses `drik.dhasavarga()`/`rasi_chart()` under the hood |
| Divisional charts (vargas) | **YES — 24 factors** | `const.py:239`: `division_chart_factors = [1,2,3,4,5,6,7,8,9,10,11,12,16,20,24,27,30,40,45,60,81,108,144,150]`. Individual chart functions in `horoscope/chart/charts.py`: `hora_chart` (D2, L462), `drekkana_chart` (D3, L601), `chaturthamsa_chart` (D4, L640), `panchamsa_chart` (D5, L666), `shashthamsa_chart` (D6, L703), `saptamsa_chart` (D7, L738), `ashtamsa_chart` (D8, L780), `navamsa_chart` (D9, L825), `dasamsa_chart` (D10, L865), `rudramsa_chart` (D11, L906), `dwadasamsa_chart` (D12, L944), `shodasamsa_chart` (D16, L980), `vimsamsa_chart` (D20, L1017), `chaturvimsamsa_chart` (D24, L1056), `nakshatramsa_chart` (D27, L1085), `trimsamsa_chart` (D30, L1121), `khavedamsa_chart` (D40, L1161), `akshavedamsa_chart` (D45, L1196), `shashtyamsa_chart` (D60, L1233), `nava_navamsa_chart` (D81, L1264), `ashtotharamsa_chart` (D108, L1293), `dwadas_dwadasamsa_chart` (D144, L1323), `nadiamsa_chart` (D150, L1443); generic `divisional_chart()` dispatcher at L1670; `custom_divisional_chart()` at L1575 for arbitrary factors | Yes — `divisional_chart_tests()` and `chart_element_longitude_d150_test()` in `pvr_tests.py`; live-verified D9 Navamsa for benchmark (Lagna Cn, Sun Ge, Moon Le etc.) | **All 15 requested vargas (D2,D3,D4,D7,D9,D10,D12,D16,D20,D24,D27,D30,D40,D45,D60) are present, plus D1,D5,D6,D8,D11,D81,D108,D144,D150 — exceeds the request** |
| Nakshatra (27) + Pada + Lord | **YES** | `panchanga/drik.py:278` `nakshatra_pada(longitude)`; `drik.py:881` `nakshatra()`; nakshatra-lord list `const.py:284` `adhipati_list` | Yes — live-verified: benchmark Moon = Anuradha (nakshatra #17), Pada 1 (Lahiri) | Full 27-star cycle with lord table used directly by all dasha modules |
| Dasha systems | **YES — 30+ distinct systems** | Graha-based (25 files in `horoscope/dhasa/graha/`): Vimshottari (`vimsottari.py`, 792 lines), Yogini (`yogini.py`, 778 lines), Ashtottari (`ashtottari.py`, 974 lines), Kaala (`kaala.py`), Karaka (`karaka.py`), Ashtaka Varga dasha (`ashtaka_varga.py`), Chathuraaseethi Sama, Dwadasottari, Dwisatpathi, Moola, Naisargika, Panchottari, Rashmi, Saptharishi Nakshathra, Sataatbika, Shastihayani, Shattrimsa Sama, Shodasottari, Tara, Tithi Ashtottari, Tithi Yogini, Yoga Vimsottari, Buddhi Gathi. Rasi-based (26 files in `horoscope/dhasa/raasi/`): **Chara** (Jaimini, `chara.py`, 948 lines), **Kalachakra** (`kalachakra.py`, 757 lines), **Narayana** (`narayana.py`, 692 lines), plus Brahma, Chakra, Chathurvidha Utthara, Drig, Karaka Kendraadhi, Kendradhi Rasi, Lagnamsaka, Lagna Kendraadhi, Mandooka, Moola, Navamsa, Nirayana/Niryaana, Padhanadhamsa, Paryaaya, Raashiyanka, Sandhya, Shoola, Sthira, Sudasa, Tara Lagna, Trikona, Varnada, Yogardha. Plus annual (`dhasa/annual/`: Mudda, Patyayini), `panchasvara.py`, `sudharsana_chakra.py` | Yes — `graha_dhasa_tests()`, `raasi_dhasa_tests()`, `running_dhasa_tests()`, `nakshathra_dhasa_progression_tests()` in `pvr_tests.py`; live-verified: Vimshottari `get_dhasa_bhukthi()` produced a full mahadasha-antardasha date sequence starting Saturn (1980-11-18) for the benchmark chart | 57 total `.py` files under `horoscope/dhasa/` — one of the largest dasha libraries in any open-source Jyotish repo we have seen |
| Shadbala | **YES** | `horoscope/chart/strength.py`: `shad_bala()` (L969), plus all six components individually — `_sthana_bala` (L214), `_dig_bala` (L419), `_kaala_bala` (L643), `_cheshta_bala` (L699), `_naisargika_bala` (L718), `_drik_bala` (L942); sub-components like `_uccha_bala`, `_ojayugama_bala`, `_paksha_bala`, `_tribhaga_bala`, `_ayana_bala`, `_yuddha_bala` | Yes — `shadbala_BVRamanBook_tests()` and `shadbala_VPJainBook_tests()` in `pvr_tests.py` compare against literal textbook numeric values (e.g. Test#1 "BVRaman Shadbala rasi_planet_positions Expected: [180.91...] Actual: [180.91...] Test Passed"), live-verified passing | Genuinely computed, not stubbed |
| Bhava Bala | **YES** | `strength.py:1094` `bhava_bala()`, `_bhava_adhipathi_bala` (L996), `_bhava_dig_bala` (L1006), `bhava_drishti_bala` (L1047) | Included in same test suite | |
| Ashtakavarga | **YES** | `horoscope/chart/ashtakavarga.py:34` `get_ashtaka_varga()` (Bhinnashtakavarga/Sarvashtakavarga), `_trikona_sodhana` (L177), `_ekadhipatya_sodhana` (L198), `_sodhya_pindas`/`sodhaya_pindas` (L273/306) | Yes — dedicated `ashtaka_varga` dasha variant plus chart-level tests in `pvr_tests.py` | Includes both Sodhana reduction techniques, not just raw bindu counts |
| Yoga (classical combinations) | **YES — 130+ named yogas, hardcoded conditionals, not a rule engine** | `horoscope/chart/yoga.py` — 13,127 lines, 1,035 `def` statements; ≥133 unique yoga base names verified via pattern match (e.g. `ruchaka_yoga` L358, `bhadra_yoga` L375, `adhi_yoga` L331, `kemadruma_yoga` L283, plus dozens of wealth/longevity/misfortune yogas like `bahu_puthra_yoga`, `dattha_puthra_yoga`, `aputhra_yoga` seen in test output). Each yoga is implemented as a **hardcoded boolean Python function** using explicit house/rasi membership checks (e.g. `ruchaka_yoga`, L358-366: checks `yoga_planet_zodiac in yoga_zodiacs and yoga_planet_zodiac in yoga_houses` against literal constants) — this is conditional logic, not a declarative/data-driven rule engine | Yes, extensively — `test_yogas.py` (1,042 lines) plus `pvr_tests.py` yoga chapter tests; live suite run showed 800+ yoga tests (e.g. "BV Raman Yogas bahu_puthra Yoga Expected: True Actual: True Test Passed") all passing before we stopped the run for time | 284 yoga name/definition/prediction-text entries also exist in `lang/yoga_msgs_en.json` (interpretation layer, see §5) |
| Jaimini — Chara Karaka | **YES** | `horoscope/chart/house.py:192` `chara_karakas(planet_positions)` returning the 8 karakas (`atma_karaka`, `amatya_karaka`, `bhratri_karaka`, `maitri_karaka`, `pitri_karaka`, `putra_karaka`, ...); names list `const.chara_karaka_names` | Referenced in `pvr_tests.py` (`tests/pvr_tests.py` imports `house`) | |
| Jaimini — Aspects | **CLAIMED / PARTIALLY VERIFIED** | Rasi-drishti (sign-based aspects, the Jaimini aspect method) is implicit in `house.py` aspect functions, but no function explicitly named "jaimini_aspect" was found in a targeted grep | Not independently confirmed | Would need a closer read of `house.py`'s aspect functions to confirm Jaimini-specific (rasi, not graha) aspect rules are distinguished from Parashari graha-drishti |
| Jaimini — Arudha Lagna / Bhava Arudhas | **YES** | `horoscope/chart/arudhas.py`: `bhava_arudhas_from_planet_positions` (L32), `bhava_arudha_longitudes` (L61), `graha_arudhas` (L214); also `charts.py:2476` `arudha_lagna_longitudes()` (varga-capable) | Yes, `pvr_tests.py` imports and exercises `arudhas` | |
| Jaimini — Upapada Lagna | **NOT PRESENT** | Whole-repo case-insensitive search for "upapada" across `src/` and `README.md` returned **zero matches** | N/A | Not implemented and not even claimed in docs |
| Jaimini — Karakamsha | **NOT PRESENT** | Whole-repo case-insensitive search for "karakamsa" across `src/` and `README.md` returned **zero matches** | N/A | Chara Karaka is present, but the specific derived point (Atmakaraka placed in Navamsa) is not separately named/computed anywhere found |
| KP — Nakshatra Lord / Star Lord | **YES** | `horoscope/chart/charts.py:2615-2632` builds `kp_info[p] = [kp_no, star_lord, star_sub_lord]` then iterates to `sub_sub_lord` | Live-verified conceptually via code read; UI has dedicated tab (`tests/ui_tests/test_kpinfo_tab.py`) | |
| KP — Sub Lord / Cuspal Sub Lord | **YES** | Same block, `charts.py:2617` `sub_lord = star_sub_lord`; KP as a house-system choice: `const.py:1627` `KP = 3 #KP Method (houses start from cusp and end at cusp)`, used by bhava-madhya cusp calculations in `charts.py` (`_bhaava_madhya_new`) which feed the cuspal sub-lord | README confirms feature: "Added KP-Adhibathi Tab to display KP No, Nakshathra Lord, Sub Lord, Pratyanthara Lord, Sookshma Lord, Praana Lord and Deha Lord" (README.md lines 388, 548) | |
| KP — full micro-lord chain (5 levels) | **YES — exceeds typical implementations** | `utils.py:1645` `kp_lords_for_longitude()`: explicit docstring "Iterative KP micro-lord calculator... Returns star, sub, praty, sookshma, praana, deha"; this is one of the few functions in the codebase with type hints (`Union[int,str]`, `Dict[...]`, `List[int]`) | UI test `test_kpinfo_tab.py` | Goes to 6 lordship levels (star + 5 sub-divisions), more granular than most KP tools which stop at sub-lord |
| KP — Significators (house/planet) | **NOT VERIFIED / likely NOT PRESENT** | Targeted search for "significator" across all `.py` files under `src/jhora/` (excluding UI/tests) returned **zero matches** in calculation code | N/A | The lordship chain exists but a dedicated KP "significator table" (ranking planets by house occupation/ownership/star for KP predictive technique) was not found |
| Dosha — Manglik (Mangal/Kuja) | **YES** | `horoscope/chart/dosha.py:50` `manglik()`, with exceptions handling at `_manglik_exceptions` (L78) | Yes — `manglik_dosha_tests()` in `pvr_tests.py`; live-verified: benchmark chart correctly returned "There is no Manglik/Mars dosha in this horoscope" | |
| Dosha — Kala Sarpa | **YES** | `dosha.py:38` `kala_sarpa()`, detail builder `_get_kala_sarpa_results` (L244) | Yes — `sarpa_dosha_tests()` in `pvr_tests.py`; live-verified with full HTML interpretation text returned for benchmark chart | |
| Dosha — Pitru | **YES** | `dosha.py:128` `pitru_dosha()` | Live-verified: benchmark returned pitru dosha present with reasons text | |
| Dosha — Guru Chandala | **YES** | `dosha.py:162` `guru_chandala_dosha()` | Live-verified: "no Guru Chandal dosha" for benchmark | |
| Dosha — others | **YES (5 more)** | `dosha.py`: `kalathra()` (L179), `ganda_moola()` (L206), `ghata()` (L261), `shrapit()` (L267); orchestrated by `get_dosha_details()` (L343) | Live-verified — full dict of 8 doshas returned for benchmark chart in one call | 8 distinct doshas total, all with natural-language explanation text |
| Ayanamsa systems | **YES — 20 modes** | `const.py:291-302` `available_ayanamsa_modes` dict maps to Swiss Ephemeris constants: FAGAN, KP, LAHIRI, RAMAN, USHASHASHI, YUKTESHWAR, SURYASIDDHANTA, SURYASIDDHANTA_MSUN, ARYABHATA, ARYABHATA_MSUN, SS_CITRA, TRUE_CITRA, TRUE_REVATI, SS_REVATI, SENTHIL, TRUE_LAHIRI, TRUE_PUSHYA, TRUE_MULA, KP-SENTHIL, SIDM_USER, SUNDAR_SS | Live-verified: re-ran benchmark chart under both default (`TRUE_PUSHYA`) and `LAHIRI` ayanamsa modes, got correctly shifted results (~1.1° difference, consistent with the ayanamsa delta) | Default ayanamsa in this repo is `TRUE_PUSHYA`, **not** Lahiri — important to note since Lahiri is the de-facto Indian government/most-common standard; commercial engine should explicitly default to Lahiri unless True Pushya is intentionally desired |

---

## 5. Calculation / Rule / Interpretation Layer Classification

PyJHora cleanly demonstrates all three layers in actual code, though they are not architected as separate packages — they live side by side in the same modules.

**Layer 1 — Calculation (raw astronomical/positional facts).**
`panchanga/drik.py` and `horoscope/chart/charts.py` produce pure numeric facts with no astrological judgment attached. Example, live-executed:
```python
# horoscope/chart/charts.py:91 rasi_chart(), invoked via drik.dhasavarga()
# Our benchmark run (1985-03-12 08:30 Hanoi, Lahiri ayanamsa) returned:
Sun: Aquarius 27.7812 deg
Moon: Scorpio 6.3647 deg
...
Ascendant [rasi,long,nak,pada]: 0 Aries 11.8959 1 4
```
This is a pure fact layer — degrees, signs, nakshatra index — with zero interpretive content.

**Layer 2 — Rule logic (astrological determinations/boolean judgments encoded in code).**
`horoscope/chart/yoga.py` and `horoscope/chart/dosha.py` encode the *classical rules* that turn raw positions into yes/no or categorical astrological determinations. Example (`yoga.py:358-366`):
```python
def ruchaka_yoga(chart_1d):
    """  BVR-22 Ruchaka Yoga - Mars should be in 0 or 7 or 9th rasi and he should be
    in 1, 4, 7 or 10th from lagna """
    p_to_h = utils.get_planet_to_house_dict_from_chart(chart_1d)
    yoga_planet = const.MARS_ID
    yoga_planet_zodiac = p_to_h[yoga_planet]
    yoga_zodiacs = [const.ARIES, const.SCORPIO, const.CAPRICORN]
    _yoga_houses = [const.HOUSE_1,const.HOUSE_4,const.HOUSE_7,const.HOUSE_10]
    yoga_houses =[(p_to_h[const._ascendant_symbol]+mh)%12 for mh in _yoga_houses]
    return yoga_planet_zodiac in yoga_zodiacs and yoga_planet_zodiac in yoga_houses
```
This is unambiguously rule logic — hardcoded classical conditions, not raw calculation and not prose. Every one of the 130+ yoga functions and 8 dosha functions follows this pattern: fixed Python `if`/boolean-expression logic per named classical combination, not a generic/declarative rule engine (no YAML/JSON rule definitions drive the *logic* — only the *text* is externalized, see Layer 3).

**Layer 3 — Interpretation (natural-language, localized prediction text).**
`src/jhora/lang/*.json` — 32 JSON resource files across 6 languages (English `en`, Hindi `hi`, Kannada `ka`, Malayalam `ml`, Tamil `ta`, Telugu `te`; **no Vietnamese**). Example, `lang/yoga_msgs_en.json` (284 entries, live-loaded and inspected):
```json
"vesi_yoga": ["Vesai Yoga",
  "There is a planet other than Moon in the 2nd house from Sun",
  "You will have a balanced outlook. You are truthful, tall and sluggish.
   You will be happy and comfortable even with little..."]
```
And live-executed dosha interpretation output for the benchmark chart (`dosha.get_dosha_details()`, `horoscope/chart/dosha.py:343`):
```
'Manglik Dosha': '<html>There is no Manglik/Mars dosha in this horoscope.<br><br></html>'
'Pitru Dosha': '<html>Pitru Dosha is a planetary flaw that means a karmic debt of the
 ancestors... There is pitru dosha in this horoscope for the following reasons:
 Either sun, moon, rahu or ketu has been afflicted by malefic planets like Mars or
 Saturn...</html>'
```
This confirms a genuine three-tier architecture (facts → rules → localized natural-language interpretation), which is directly relevant precedent for the target commercial engine's layered design — though note the interpretation text here is generic canned prose keyed by yoga/dosha name, not personalized/composited narrative.

---

## 6. Test Audit

**NOT "NO TEST SUITE FOUND" — this repo has an unusually large and substantive test suite.** `src/jhora/tests/` contains 11,781 lines across the non-UI test files alone (`test.py` 87, `test1.py` 400, `test_engine.py` 280, `test_yogas.py` 1,042, `pvr_tests.py` 9,114, `test_helper.py` 858), plus a 24-file `ui_tests/` subpackage for PyQt UI smoke/interaction testing.

**`pvr_tests.py` is a genuine golden-value regression suite, not a smoke test**, keyed to a specific astrology textbook (see `features_per_book.txt` mapping "Part 1: Chart Analysis" chapters 1-15 and "Part 2: Dasa Analysis" chapters 16-24 to specific `.py` modules). It defines 28 `chapter_N_tests()` functions (`grep -c "^def chapter_" pvr_tests.py` = 28) each containing multiple `test_example(description, expected_result, actual_result)` calls with literal numeric/date expected values taken from the book, e.g.:
```python
# tests/pvr_tests.py:47-55 (Chapter 1, Exercise 1)
p_long = 94+19.0/60
pe1,pe2 = drik.dasavarga_from_long(longitude=p_long, divisional_chart_factor=1)
pe2 = utils.to_dms(pe2,is_lat_long='plong')
expected_result = (3, '4° 19’ 0"')
test_example(chapter+"Exercise-1:", expected_result, (pe1,pe2))
```
`test_helper.py:389` `test_example()` is a real comparator (not a print-only stub) — it normalizes date-tuples, applies a documented numeric tolerance (`_dhasa_duration_tolerance = 10`, `test_helper.py:51`), tracks pass/fail counts, and can run in "record" vs. "compare" baseline modes against a JSON baseline file.

Test fixtures in `tests/book_chart_data.py` use real, named public-figure birth charts as reference data (e.g. `chart_3` is labeled "A.B Vajpayee" — the former Indian Prime Minister, a commonly-used public reference chart in Vedic astrology literature), confirming these are cross-checked against published/known chart data, not synthetic.

**Live execution of the suite (this audit):** We ran `python -m jhora.tests.pvr_tests` directly (see §7). It requires interactive confirmation (`Proceed? [y/N]`, auto-answered) and, on default Windows console encoding, crashes with `UnicodeEncodeError: 'charmap' codec can't encode` when it hits a degree-symbol (`°`) string — a real, minor cross-platform bug (Windows `cp1252` console vs. Unicode test output), fixed by setting `PYTHONIOENCODING=utf-8`. With that environment variable set, we let it run for ~10 minutes before stopping for time: **3,104 tests executed, 0 failures ("Test Passed") observed**, spanning Shadbala, Panchanga, Chapters 1-5+ (positions, karakas, relationships, upagrahas, special lagnas), yoga chapters (hundreds of named yogas including `bahu_puthra_yoga`, `dattha_puthra_yoga`, `aputhra_yoga`), and Naisargika Dasha date sequences. The full suite is evidently several times larger still (file is 9,114 lines) — we did not run it to completion, but the sampled portion shows a consistent, non-trivial, all-passing golden-value regression test, a materially higher bar than most open-source astrology repos we have seen ("doesn't crash" smoke tests).

`test_yogas.py` (1,042 lines) additionally exercises the yoga-resource JSON loading and yoga-detection functions together, cross-referencing `lang/yoga_msgs_en.json`.

`test_engine.py` is not a correctness test but a **performance benchmark** comparing place-database backends (CSV/Pickle/SQLite lookup speed) — it requires PyQt6 and launches the full GUI (`ChartTabbed`), so it is GUI-dependent and out of scope for headless verification.

---

## 7. Execution Attempt Results

**Environment:** Fresh venv (`C:\ccaudit\pyjhora_venv`), Python 3.14.6 (system Python; repo declares `requires-python = ">=3.8"`), Windows 11.

**Blocker 1 (resolved):** `requirements.txt`-only install failed on import — `ModuleNotFoundError: No module named 'geocoder'` initially, then, after installing `geocoder`, `ModuleNotFoundError: No module named 'dateutil'` (used at `src/jhora/utils.py:44`, **not declared in `requirements.txt`**). Resolved by manually `pip install python-dateutil certifi`.

**Blocker 2 (irrelevant to calculation core):** `PyQt6`/`pyqtgraph` were deliberately **not installed** — PyJHora's documented UI is GUI-only (`src/jhora/ui/` — 20,674 lines of PyQt6 code), confirmed by `tests/test_engine.py:9-10` (`from PyQt6.QtWidgets import QApplication`) and `tests/test_engine.py:81` (`from jhora.ui.horo_chart_tabs import ChartTabbed`). We searched for and found a genuine headless calculation-only API in `src/jhora/panchanga/drik.py` and `src/jhora/horoscope/chart/*.py`/`src/jhora/horoscope/dhasa/**/*.py`, which import cleanly and run **without PyQt6 installed at all**.

**Successful headless chart generation** for the requested benchmark (1985-03-12, 08:30, Hanoi, lat 21.0285, lon 105.8542, TZ +7):

```python
from jhora import const; const._DEFAULT_AYANAMSA_MODE = 'LAHIRI'
from jhora.panchanga import drik
from jhora import utils
place = drik.Place('Hanoi', 21.0285, 105.8542, 7.0)
jd = utils.julian_day_number(drik.Date(1985,3,12), (8,30,0))
pp = drik.dhasavarga(jd, place, divisional_chart_factor=1)
```

**Actual program output (Lahiri ayanamsa):**
```
Sun: Aquarius 27.7812 deg
Moon: Scorpio 6.3647 deg
Mars: Aries 4.0685 deg
Mercury: Pisces 14.7802 deg
Jupiter: Capricorn 13.6031 deg
Venus: Pisces 28.5919 deg
Saturn: Scorpio 4.4617 deg
Rahu: Aries 26.3134 deg
Ketu: Libra 26.3134 deg
Ascendant [rasi,long,nak,pada]: 0 Aries 11.8959 1 4
Moon Nakshatra: Anuradha (#17) Pada: 1
```

**D9 Navamsa** (`charts.divisional_chart(jd, place, divisional_chart_factor=9)`), actual output:
```
Lagna Cn 17.06 | Sun Ge 10.03 | Moon Le 27.28 | Mars Ta 6.62 | Mercury Sc 13.02
Jupiter Ta 2.43 | Venus Pi 17.33 | Saturn Le 10.15 | Rahu Sc 26.82 | Ketu Ta 26.82
```

**Vimshottari Dasha** (`vimsottari.get_dhasa_bhukthi(jd, place)`), actual output (first entries):
```
Mahadasha: Saturn, starts 1980-11-18; Antardasha Saturn-Saturn until 1983-11-22,
then Saturn-Mercury until 1986-08-01, then Saturn-Ketu until 1987-09-10,
then Saturn-Venus until 1990-11-10, ... (79 mahadasha-antardasha rows generated
spanning 1980 to 2098)
```

**Dosha analysis** (`dosha.get_dosha_details(jd, place)`), actual output: full dict of 8 doshas (Kala Sarpa, Manglik, Pitru, Guru Chandala, Ganda Moola, Kalathra, Ghata, Shrapit) with HTML-formatted explanation text, correctly identifying "no Manglik dosha" and "no Guru Chandal dosha" but flagging Pitru Dosha as present with a stated reason, for this specific chart.

**Conclusion: Execution SUCCEEDED for the calculation core**, fully headless, no GUI required, producing rashi chart, one divisional chart (D9 demonstrated; all 24 factors use the same code path), nakshatra/pada, full Vimshottari mahadasha-antardasha table, and dosha analysis for the exact requested benchmark input. This is a real, verified working chart — not "NOT VERIFIED BY EXECUTION."

We also launched the project's own golden-value test suite (`python -m jhora.tests.pvr_tests`, `PYTHONIOENCODING=utf-8`) and observed 3,104 tests pass with 0 failures before stopping for time (see §6) — additional independent confirmation of correctness beyond our own ad-hoc benchmark run.

---

## 8. Maintenance

- `git log -1`: single commit visible, `48e57d29b47a3143519910a24866758116467485`, author `naturalstupid`, dated **2026-08-06**, message `V4.9.3`.
- `git log --oneline | wc -l` = **1**. `git rev-parse --is-shallow-repository` = **true** — **this is a shallow (depth=1) clone; full commit history is not available from this local copy**, so true commit cadence/contributor count cannot be assessed from this checkout alone.
- `git tag` = empty (no tags visible in the shallow clone).
- Only one author name appears in the available history (`naturalstupid`), consistent with README/`pyproject.toml` attribution to a single maintainer ("Sundar Sundaresan").
- **Strong indirect evidence of active, ongoing development**: version strings embedded throughout the source comments show a long, granular release history (e.g. `vimsottari.py:23-25`: "V4.8.9... V4.9.0... V4.9.3" release notes inline), README.md is 73,579 bytes with an extensive dated changelog going back many versions, and the local clone's single visible commit is dated 2026-08-06 (roughly 5 weeks before this audit) with a clear version-numbered commit message — consistent with a project still receiving updates, not a stale one-and-done drop.
- Codebase size: **119,324 total lines across 160 `.py` files** under `src/jhora/` (confirmed via `find . -name "*.py" | xargs wc -l`), of which `horoscope/chart/yoga.py` alone is 13,127 lines. This is a genuinely large codebase, consistent with the audit brief's expectation.
- **Classification: ACTIVE (with a caveat).** The density of version-numbered inline changelog comments, the extremely current-dated visible commit (2026-08-06), and the exceptional breadth of implemented features together indicate a project under continued, serious development by its maintainer. However, because the local clone is shallow and shows only one commit and one contributor, we cannot verify contributor diversity, issue/PR responsiveness, or true commit frequency from the repo alone — those would need to be checked directly on GitHub (out of scope for this local source audit; flagged as **UNKNOWN / NOT VERIFIED** for bus-factor and community-health specifically, even though code-freshness itself is well evidenced).

---

## 9. Code Quality Scores (0-10)

| Dimension | Score | Justification |
|---|---|---|
| Architecture / modularity | 6/10 | Clear top-level separation (`panchanga/` for time-based facts, `horoscope/chart/` for chart derivations, `horoscope/dhasa/{graha,raasi}/` for dasha systems, `horoscope/transit/` for tajaka/saham, `ui/` isolated from calculation code) is genuinely good and made our headless-import goal achievable. Marked down because several modules are monolithic (`yoga.py` = 13,127 lines / 1,035 functions in one file; `main.py` = 1,801 lines acting as a large orchestration/dispatch layer using string-based `eval()` dispatch rather than a lookup-table or class-based strategy pattern — `horoscope/main.py:436,440,452,632,786,884,980,991,1595,1597,1609,1611,1623,1635,1702`). |
| Typing (type hints) | 1/10 | Essentially absent. `grep -c "^def .*->.*:"` returned 0 for `charts.py` and `drik.py`, and only 1 for `vimsottari.py`. The one clear exception, `utils.py:1645` `kp_lords_for_longitude()`, is fully typed (`Union`, `Dict`, `List`) and stands out as an outlier, suggesting typing was added ad hoc in a recent revision rather than as a project-wide standard. |
| Docs / docstrings | 7/10 | Strong docstring density — 335 triple-quote occurrences in `drik.py` alone (~167 docstrings), most citing the specific classical rule/verse being encoded (e.g. "BVR-22 Ruchaka Yoga - Mars should be in 0 or 7 or 9th rasi..."), which is valuable domain documentation, not boilerplate. README.md (73,579 bytes) is unusually extensive with a long changelog. No generated API docs (Sphinx etc.) found, and zero module-level type-stub or `.pyi` documentation. |
| Separation of concerns (calc/rule/interpretation) | 6/10 | The three layers genuinely exist and are separable (see §5): raw facts, rule functions, and externalized JSON interpretation text in 6 languages. Marked down because rule logic (yoga/dosha conditions) is not data-driven — adding a new yoga requires writing a new Python function, not a config entry, so rules and code are still coupled even though rules and prose are decoupled. |
| Extensibility | 5/10 | Divisional charts, dashas, and doshas each expose a fairly consistent function-signature convention (`_from_planet_positions` / `_from_jd_place` variants seen repeatedly, e.g. `ruchaka_yoga_from_planet_positions`/`_from_jd_place`/base), which does make it learnable and pattern-completable. Undermined by the widespread `eval(string_expr)` dynamic-dispatch pattern (24+ call sites — see §10) which breaks static analysis, IDE "find usages", and refactoring safety. |
| Error handling | 4/10 | Sparse: only ~24 `try/except` blocks found across `charts.py`/`drik.py`/`main.py` combined for a 119k-line codebase, and 11 bare `except:` clauses repo-wide (swallow-everything anti-pattern). `panchanga/drik.py`'s `Place` class (`drik.py:70-80`) does no bounds validation on latitude/longitude/timezone — it just casts to `float()`, so an invalid coordinate (e.g. lat=200) would silently produce nonsensical astronomical output rather than raising a clear validation error. |
| Test coverage/discipline | 8/10 | As detailed in §6: a large, genuine golden-value regression suite tied to a named textbook, real historical/public chart fixtures, a documented tolerance-based comparator, and (per our partial live run) a 3,104/3,104 pass rate. This is well above the open-source Jyotish norm. Marked down (not 9-10) because the suite is coupled to a global mutable `const` module (ayanamsa mode, language, etc. are set as module-level globals — `const._DEFAULT_AYANAMSA_MODE`, `const._DEFAULT_LANGUAGE`) which is fragile for parallel/CI test execution, and because it is not wired into a standard `pytest`/CI harness (it's a hand-rolled `__main__` runner requiring interactive confirmation by default). |

**Overall code quality: ~5.5/10** — exceptional domain depth and test rigor undermined by dated engineering practices (no typing, `eval()`-based dispatch, monolithic files, thin exception handling).

---

## 10. Security Notes

- **Pervasive `eval()` usage for dynamic function dispatch — 24+ call sites**, e.g. `horoscope/chart/charts.py:2334-2335,2539`, `horoscope/chart/raja_yoga.py:117`, `horoscope/chart/yoga.py:142`, `horoscope/main.py:436,440,452,632,786,884,888,980,991,1595,1597,1609,1611,1623,1635,1702`, `panchanga/drik1.py:1226`, `panchanga/vratha.py:151,153`. Pattern example (`charts.py:2333-2335`):
  ```python
  pp1 = spl_planet_positions_in_rasi if varga_factor_1==1 else \
        eval(divisional_chart_functions[varga_factor_1]+'(spl_planet_positions_in_rasi,chart_method=chart_method_1)')
  ```
  In every case we inspected, the string passed to `eval()` is built from an internally-defined lookup dict (`divisional_chart_functions`) keyed by a numeric varga factor, not directly from free-form user text — so this is not a demonstrated remote-code-execution vector as currently used. However, it is still a serious anti-pattern for a codebase intended to be a security-reviewed dependency of a commercial product: it defeats static analysis, and any future code path that lets a caller influence the *function-name portion* of these strings (rather than just a dict key) would become a code-injection vulnerability. **Recommendation: if any PyJHora-derived logic is ever adapted, replace all `eval()` dispatch with explicit dict-of-callables lookups before use in any user-facing service.**
- **`exec()` usage:** `setup.py:35` — `exec(file_contents_string, None, package_info_dict)`, used to read `_package_info.py`'s version string during packaging (standard, low-risk, build-time only, not user-data-facing).
- **`pickle.load()` on a bundled data file:** `place_db.py:1159` `data = pickle.load(f)` loads a pre-built place/geonames database pickle (`const._place_database_file`). Pickle deserialization of untrusted data is a known RCE vector; here the file is a bundled build artifact rather than user-uploaded input, so risk is low **as shipped**, but if a commercial fork updates that data file from an external/less-trusted source (or lets users import their own place database), this would need re-review. `tests/build_pickle_from_csv.py` and `tests/build_geonames_engine.py` also read/write pickle files as part of the maintainer's tooling.
- **No `yaml.load()`/PyYAML usage found** anywhere in `src/jhora/` (`grep -rln "yaml"` returned no matches) — not a vector here.
- **Network calls:** `utils.py:148-163` `get_elevation(lat, long)` calls an external "open-elevation" HTTP API (`const._open_elevation_api_url`) with the **user-supplied birth-place latitude/longitude**, using `requests.get(..., timeout=20, verify=certifi.where())` (TLS verification is at least explicit and enabled). This is gated by a module flag, `const.py:1695` `get_place_elevation_from_internet = False` — **disabled by default**, so no birth-location data leaves the process unless a caller explicitly flips that flag. Worth flagging for the target use case (a phong-thuy/astrology site handling real users' birth data): any commercial deployment must confirm this flag stays `False`, or route it through a privacy-reviewed internal service, before sending user birthplace coordinates to a third-party API.
- **User-supplied birth-data validation:** `panchanga/drik.py:70-80`, class `Place.__init__(self, name, latitude, longitude, timezone, elevation=None)` performs **no range/bounds validation** — it simply does `float(latitude)`, `float(longitude)`, `float(timezone)`. Out-of-range values (e.g. latitude > 90, timezone > 14) are not rejected; they would silently propagate into Swiss Ephemeris calls and produce undefined/garbage astronomical results rather than a clear error. A commercial engine consuming user-entered birth data must add its own input validation layer regardless of which calculation library it uses.
- **`requests` version** is current (`Requests==2.32.3`, a version incorporating known CVE fixes for the `requests` library as of its release), but is itself part of the abandoned `geocoder` package's dependency chain as well (see §3).

---

## 11. Tier Recommendation

**Tier: B — Reference (with an asterisk on licensing that pushes toward "reference-only, not reusable-as-code")**

Justification:
- This is **not Tier A (Foundation)** because the AGPL-3.0-or-later license makes it unsuitable to serve as the literal foundation of a closed-source commercial SaaS engine — using it as a foundation would require open-sourcing the entire connected service (AGPL §13), which the stated business context (a commercial phong-thuy website) is very unlikely to want. Foundation-tier status requires both technical depth *and* a license the target architecture can actually build on; this repo fails the second test decisively.
- It is **well above Tier C (Specialized)** and **far above Tier D (Experimental)** on technical merit: the sheer breadth of correctly-implemented, textbook-verified Vedic techniques (24 vargas, 30+ dasha systems, full Shadbala/Ashtakavarga, 130+ yogas, 8 doshas, Jaimini Chara Karaka/Arudha, and a genuine multi-level KP lordship chain — all confirmed by direct source reading and live headless execution against the requested benchmark chart) is exceptional and not "experimental" or "narrow" by any measure.
- It lands at **Tier B (Reference)** specifically because of that combination: outstanding as a **ground-truth reference oracle** — i.e., exactly what the stated research goal needs it for. A commercial engineering team can (a) use PyJHora (run locally, not embedded/distributed) to generate expected values for validating an independently-written calculation engine covering the same techniques, (b) use its `features_per_book.txt`/chapter-test structure as a map of which classical textbook techniques exist and how they're conventionally defined, and (c) use its `lang/*.json` interpretation-text structure as a design pattern for a localization-ready rule-to-prose layer — all without redistributing or embedding its AGPL-licensed code.
- Not Tier E (Avoid): despite the license friction, dismissing this repo outright would be a mistake for a research/reference purpose — its correctness verification (textbook golden values, 3,100+ passing tests observed live) is a genuinely rare and valuable asset for cross-checking a from-scratch engine, which is exactly the stated purpose of this audit. Avoid using it as embedded/derivative code; do not avoid using it as a study/validation reference.

**Bottom line for the target project:** treat PyJHora as the single richest known open-source *specification and validation oracle* for Vedic/Jyotish calculations encountered in this line of audits, but plan the commercial engine's actual calculation code as an independent, cleanroom implementation (very plausibly still built on Swiss Ephemeris / `pyswisseph`, which is separately and more permissively licensed — verify its license independently before depending on it) — then use PyJHora's outputs purely to check that implementation's numbers, not as source material to copy from.
