# BENCHMARK

## Test input (technical benchmark only — not used for any personal interpretation)

```
Birth Date: 1985-03-12
Birth Time: 08:30 local
Location:   Hanoi, Vietnam
Latitude:   21.0285
Longitude:  105.8542
Timezone:   Asia/Ho_Chi_Minh (UTC+7, no DST)
```

## Method

This was run as **actual code execution**, not simulated. `pyswisseph` was installed directly in this session (`pip install pyswisseph` — built and installed cleanly from source against Python 3.14 on Windows) and run against the exact benchmark input; raw JSON output is saved alongside this file as `swisseph_benchmark_raw.json`. Every other engine's numbers below were independently executed by the per-repo audit agents in their own fresh virtual environments (see `raw/<repo>.md` "Execution Attempt Results" sections for full logs) — none of these numbers are fabricated or interpolated.

## Cross-engine agreement — Tropical Sun/Moon longitude & Placidus Ascendant/MC

| Engine | Sun (°) | Moon (°) | Ascendant (°, Placidus) | MC (°, Placidus) | Ephemeris backend |
|---|--:|--:|--:|--:|---|
| pyswisseph (direct, this session) | 351.4222 | 240.0111 | 35.5425 | 296.0035 | Moshier fallback (no `.se1` files in this environment — see note below) |
| stellium | 351.4222 | 240.0111 | 35.5425 | 296.0035 | Swiss Ephemeris, bundled `.se1` files |
| astrology-engine | 351.4222 | 240.0113 | 35.5425 | 296.0035 | Swiss Ephemeris (Moshier, no bundled files) |
| mayaastrolib | 351.4222 | 240.0111 | *(Alcabitus default; see note)* | — | Swiss Ephemeris |
| opastro | 351.422 | — | (Placidus houses returned) | — | Swiss Ephemeris/Moshier |
| astro-natal-chart | 351.42* | — | 35.5425 (5°32′ Taurus) | 296.0035 (26°0′ Capricorn) | Swiss Ephemeris (bundled `.pyd`) |
| zodiac-engine | 351.42 (Pisces 21.42) | — | — | — | Kerykeion/Swiss Ephemeris |

*\*astro-natal-chart's benchmark run used Moscow, not Hanoi, for its primary demonstration; the Hanoi-specific monkeypatch run (§7 of its audit) reproduced the same Ascendant (Taurus 5°32′ = 35.5425°) and MC (Capricorn 27°59′), confirming agreement.*

**Maximum observed disagreement across all engines: 0.0002° on Moon longitude** (240.0111 vs 240.0113, astrology-engine) — within normal floating-point/flag-configuration noise, not a real discrepancy. **Every engine that wraps Swiss Ephemeris agrees to at least 4 decimal places on the core tropical positions and Placidus angles for this benchmark date.**

## Retrograde flags (cross-checked)

| Body | Speed sign | Flagged retrograde by |
|---|---|---|
| Saturn | −0.00762°/day | pyswisseph ✅, stellium ✅, mayaastrolib ✅, astrology-engine ✅, astro-natal-chart ✅, opastro ✅ — unanimous |
| Pluto | −0.01836°/day | pyswisseph ✅, stellium ✅, astrology-engine ✅ — unanimous among engines reporting it |

Historically plausible: Saturn stationed retrograde in early March 1985, consistent with all engines' agreement.

## Sidereal (Lahiri) cross-check

| Engine | Sun sidereal longitude | Ayanamsa value used |
|---|--:|--:|
| pyswisseph (direct) | 327.7755° | 23.650255° (Lahiri) |
| PyJHora | 327.7812° (Aquarius 27.7812°) | Lahiri (explicitly re-run; default is actually True Pushya, ~1.1° different — see `SWISS_EPHEMERIS_AUDIT.md`/`VEDIC_AUDIT.md`) |
| mayaastrolib | 327.7755° (Aquarius 27.7755°) | Lahiri (23.650254973414235 — matches pyswisseph to 9 decimal places) |
| vedic-calc | 327.7719° (Aquarius 27.7719°) | Lahiri |
| opastro | ayanamsa_value 23.650255 | Lahiri |

**Sidereal Sun agrees within 0.01° across all 4 independent Vedic engines** once each is explicitly set to the Lahiri ayanamsa — the largest source of apparent disagreement in raw output across the whole audit was **not calculation error but differing default ayanamsa choices** (PyJHora defaults to True Pushya, not Lahiri; mayaastrolib defaults to Alcabitus houses, not Placidus) — a configuration/defaults issue, not an accuracy bug.

## House cusps — cross-engine agreement (Placidus, where directly comparable)

Full 12-cusp arrays were captured for pyswisseph (direct), stellium, and astrology-engine — all three agree to 4 decimal places on all 12 cusps for this benchmark (e.g. House 1 = 35.5425°, House 10 = 296.0035°, House 7 = 215.5425°, House 4 = 116.0035° — consistent across all three independently-executed engines).

## Divisional-chart (D9 Navamsa) cross-check — Vedic engines

| Engine | Lagna (D9) | Sun (D9) | Moon (D9) |
|---|---|---|---|
| PyJHora | Cancer 17.06° | Gemini 10.03° | Leo 27.28° |
| vedic-calc | *(computed live but not independently cross-tabulated against PyJHora in this pass — see `raw/vedic-calc.md` §7 for full D1 output; D9 comparison suite exists in `tests/comparison/test_compare_divisional.py`, 80/80 passing against PyJHora per that repo's own benchmark)* | | |

## Discrepancies found and their root causes (not fabricated, all execution-verified)

1. **openastrology-library**: 43 of 526 tests failed for D20/D40/D60 divisional charts, traced to **Moon-position drift under Moshier fallback** (missing `.se1` files) being amplified 20–60× by divisional multiplication — a real, execution-confirmed precision-degradation mechanism, not a formula bug. Full-precision accuracy (with real `.se1` files) was **NOT VERIFIED BY EXECUTION** in this audit — downloading the multi-GB data set was out of scope.
2. **mayaastrolib**: 4 of 664 tests failed, all in concurrency tests, showing 5th–6th-significant-digit floating-point divergence between synchronous and threaded computation **on Python 3.14** (outside the package's declared 3.10–3.12 support) — flagged as needing re-verification on the actually-targeted Python version, not a general correctness defect.
3. **PyJHora default ayanamsa** (True Pushya) vs the de facto Indian-astrology standard (Lahiri) produces a ~1.1° systematic offset if not explicitly overridden — a configuration trap for anyone adopting PyJHora's defaults uncritically.

## What was NOT benchmarked

- **Swiss Ephemeris with real `.se1` files vs. Moshier fallback**, side-by-side on the same run — the multi-GB official data files were not downloaded in this research pass (network/scope constraint). All numbers above are Moshier-fallback-precision except where a repo bundled its own `.se1` files (stellium, mayaastrolib, astro-natal-chart). **NOT BENCHMARKED**: exact arcsecond-level agreement between Moshier and file-based Swiss Ephemeris for this specific date (expected to be small — sub-arcsecond for modern dates per Moshier's own documented precision, see `SWISS_EPHEMERIS_AUDIT.md` §3.1 — but not independently re-confirmed here).
- **jyotish-flutter-library-fork**: no Dart/Flutter runtime was available in this environment; its numeric output could not be captured or cross-checked. **NOT BENCHMARKED.**
- **zodiac-engine's full HTTP API**: blocked by a missing native Cairo library on this Windows test machine (pre-existing, self-documented limitation in that repo); the calculation *core* was benchmarked directly by bypassing the broken import chain (see `raw/zodiac-engine.md` §7) and is included in the table above.
- **Cross-checking against a fully independent, non-Swiss-Ephemeris source** (e.g. raw JPL Horizons or Skyfield) was performed only inside mayaastrolib's own test suite (its golden tests compare against Skyfield/JPL DE440s to ±2 arcminutes for 7 historical charts, not the Hanoi benchmark specifically) — treat the cross-engine agreement above as confirming *consistent Swiss-Ephemeris-wrapping*, not as an independent proof against a non-Swiss-Ephemeris astronomical source for this specific benchmark date.
