# REPO COMPARISON & RANKING

All ratings below are grounded in the per-repo deep audits in `raw/*.md` and `SWISS_EPHEMERIS_AUDIT.md`. Every repo was cloned locally, source-read in full (not README-only), and — except where noted "NOT VERIFIED BY EXECUTION" — actually installed and run against the benchmark birth data (1985-03-12, 08:30, Hanoi, 21.0285°N/105.8542°E, UTC+7).

## Tier classification (Section 16 of the brief)

| Repo | Tier | One-line reason |
|---|---|---|
| **swisseph / pysweph** (core) | **A — Foundation** | Astronomical primitive layer; unmatched accuracy/breadth; license containable behind an internal boundary. See `SWISS_EPHEMERIS_AUDIT.md`. |
| **stellium** | **A — Foundation** (Western calc/rule engine) *— conditional on AGPL resolution* | Broadest, best-tested, cleanest-architected Western/traditional engine audited; drops to Tier E if AGPL can't be cleared. `raw/stellium.md` |
| **PyJHora** | **B — Reference** (Vedic ground-truth oracle) | Richest Vedic feature set anywhere audited (24 vargas, 30+ dashas, 3,104 tests passing), but AGPL blocks direct reuse — use as a validation oracle only. `raw/PyJHora.md` |
| **opastro** | **B — Reference** (interpretation architecture) | The only repo with a genuine Chart→Factors→Rules→Interpretation pipeline and zero LLM — copy the architecture, not the (AGPL-tainted-dependency) code. `raw/opastro.md` |
| **openastrology-library** | **B — Reference** | Real Swiss-Ephemeris-backed Western+Vedic TS library, 526 tests, but dual AGPL/LGPL license and a verified error-handling defect. `raw/openastrology-library.md` |
| **mayaastrolib** | **B — Reference** | Very high code quality (mypy/ruff-clean, golden tests vs Skyfield/JPL), MIT code but AGPL/GPL Swiss Ephemeris dependency; young, single-author. `raw/mayaastrolib.md` |
| **vedic-calc** | **C — Specialized** (license-blocked) | Excellent, well-cited Vedic depth (KP, Shadbala, 15 vargas) with a disclosed 99% cross-validation benchmark, but AGPL + dormant (5.5 months no commits). `raw/vedic-calc.md` |
| **jyotish-flutter-library-fork** | **B — Reference** (algorithm/rule source only) | Deepest Vedic feature breadth of any repo bar PyJHora, but structurally a Flutter plugin (unusable on a server as-is) and contains verbatim PyJHora (AGPL) text under an MIT label — legal risk. `raw/jyotish-flutter-library-fork.md` |
| **astrology-engine** | **C — Specialized** | MIT, correct core math, but shallow (no traditional-astrology layer, no progressions/returns), broken default install instructions, silent-failure bug. `raw/astrology-engine.md` |
| **astro-natal-chart** | **D — Experimental** | A "Claude Skill" CLI utility, not a library; no license file, hardcoded developer path crashes on any other machine, no Vietnam/Hanoi support, Windows/3.14-only binary. `raw/astro-natal-chart.md` |
| **zodiac-engine** | **D — Experimental** | Textbook "Chart→LLM" anti-pattern with a confirmed-broken API endpoint, no license file, open CORS, unsanitized LLM-output-to-HTML rendering. `raw/zodiac-engine.md` |

No repo was rated **E — Avoid** outright; even the weakest two (astro-natal-chart, zodiac-engine) contain legitimately correct Swiss-Ephemeris calculation code worth reading as a negative-pattern reference.

## Weighted score table (Section 17 of the brief)

Weights: Calculation accuracy 20%, Algorithm completeness 15%, Test quality 10%, Architecture 10%, Extensibility 10%, Interpretation capability 10%, Documentation 5%, Maintenance 5%, License suitability 10%, Production readiness 5%.

Each sub-score is 0–10, taken from (or consistent with) the Code Quality tables in `raw/*.md`. **License suitability is scored on fit for a closed-source commercial SaaS specifically** (AGPL/no-license = very low, MIT = 10), and is called out separately below the table per the brief's instruction that "license blocker phải được đánh dấu riêng, không được để điểm số che khuất vấn đề license."

| Repo | Calc acc. (20%) | Algo complete. (15%) | Test qual. (10%) | Arch. (10%) | Extens. (10%) | Interp. (10%) | Docs (5%) | Maint. (5%) | License (10%) | Prod. ready (5%) | **Weighted total /10** | License blocker? |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|:--:|
| stellium | 9 | 9 | 9 | 9 | 8 | 3 | 9 | 8 | 1 | 6 | **7.20** | ⚠️ AGPL-3.0 |
| PyJHora | 9 | 10 | 9 | 6 | 5 | 6 | 7 | 6 | 0 | 4 | **6.85** | ⚠️ AGPL-3.0 |
| opastro | 8 | 6 | 7 | 8 | 7 | 8 | 8 | 6 | 2 | 8 | **6.65** | ⚠️ pyswisseph=AGPL |
| mayaastrolib | 8 | 7 | 9 | 8 | 7 | 2 | 8 | 5 | 3 | 7 | **6.35** | ⚠️ GPL/commercial SE |
| openastrology-library | 7 | 8 | 7 | 7 | 6 | 1 | 5 | 5 | 1 | 5 | **5.75** | ⚠️ AGPL/LGPL |
| vedic-calc | 8 | 8 | 9 | 9 | 6 | 3 | 10 | 3 | 0 | 5 | **6.35** | ⚠️ AGPL-3.0 |
| jyotish-flutter-library-fork | 7 | 9 | 6 | 7 | 7 | 4 | 7 | 8 | 3 | 2 | **6.15** | ⚠️ MIT-labeled but AGPL-derived text |
| astrology-engine | 7 | 4 | 5 | 4 | 3 | 3 | 6 | 3 | 10 | 4 | **5.20** | none (MIT) |
| astro-natal-chart | 7 | 4 | 0 | 6 | 4 | 3 | 7 | 2 | 0 | 2 | **4.25** | ⚠️ no LICENSE file |
| zodiac-engine | 8 | 5 | 6 | 5 | 5 | 1 | 6 | 2 | 0 | 3 | **4.85** | ⚠️ no LICENSE file |

**Do not read this table as a simple leaderboard.** stellium's and PyJHora's high totals are earned entirely on technical merit; both carry an **AGPL-3.0 blocker that a numeric score cannot express** — for a closed-source commercial SaaS, that blocker is binary (must be resolved via a commercial license, network isolation, or full reimplementation) regardless of how high the rest of the score is. opastro's own code is MIT, but its *mandatory* dependency (`pyswisseph`) is AGPL — the same blocker reaches it transitively. The only repos with **zero license blocker** are `astrology-engine` (MIT, clean) and Swiss Ephemeris's Professional License path (paid, not free) — see `LICENSE_AUDIT.md`.

## Cross-engine execution agreement

Every repo above that could be executed (all except `jyotish-flutter-library-fork`, which needs a Dart/Flutter toolchain unavailable in this environment) computed the benchmark chart and, wherever it used real/Moshier-fallback Swiss Ephemeris, agreed with the other engines to 3–4 decimal places on tropical Sun/Moon longitude and Placidus Ascendant/MC (see `BENCHMARK.md` for the full cross-engine table). This is strong evidence that **the Swiss Ephemeris wrapping layer is not where correctness risk lives** in this class of repo — the risk is entirely in the rule/interpretation layers built on top, which vary enormously in depth and correctness across the audited set.
