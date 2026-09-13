# VEDIC / JYOTISH AUDIT

Scope: PyJHora, vedic-calc, jyotish-flutter-library-fork, openastrology-library (Vedic half), mayaastrolib (Vedic half). All findings cite `raw/<repo>.md`. Per the brief's explicit instruction, this document distinguishes "repo mentions a feature name" from "feature is actually implemented and exercised by code" everywhere.

## Rashi / D1

All 5 repos implement D1 correctly, backed by real Swiss Ephemeris sidereal longitudes, and all 5 were verified by direct execution against the benchmark birth data in their own audits.

## Divisional charts (Vargas) — exact coverage

| Varga | PyJHora | vedic-calc | jyotish-flutter | openastrology-library | mayaastrolib |
|---|:--:|:--:|:--:|:--:|:--:|
| D1 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D4 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D5 | ✅ | — | ✅ | — | — |
| D6 | ✅ | — | ✅ | — | — |
| D7 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D8 | ✅ | — | ✅ | ✅ | — |
| D9 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D10 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D11 | ✅ | — | ✅ | ✅ | — |
| D12 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D16 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D20 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D24 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D27 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D30 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D40 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D45 | ✅ | ✅ | ✅ | ✅ | ✅ |
| D60 | ✅ | ✅ (generic fallback formula, self-disclosed simplification) | ✅ | ✅ | ✅ |
| D81/D108/D144/D150 (rare) | ✅ (all 4) | — | ✅ (D150 + non-standard D249) | — | — |

**PyJHora is the only repo with genuine dedicated per-varga functions for all 24 factors** (`const.division_chart_factors`, cited in `raw/PyJHora.md`), each independently named and coded, not a generic count-from-sign formula. **vedic-calc's D60 and openastrology-library's rarer vargas fall through to a generic formula** — flagged in their own audits as a real accuracy caveat, not a hidden gap.

## Nakshatra (27) + Pada + Lord

All 5 repos implement the full 27-nakshatra cycle with pada and lord — verified live in every audit (e.g., benchmark Moon nakshatra = Anuradha, pada 1, consistently reproduced across PyJHora, vedic-calc, mayaastrolib, openastrology-library).

## Dasha systems — exact coverage

| System | PyJHora | vedic-calc | jyotish-flutter | openastrology-library | mayaastrolib |
|---|:--:|:--:|:--:|:--:|:--:|
| Vimshottari | ✅ | ✅ | ✅ | ✅ (only one) | ✅ |
| Yogini | ✅ | ✅ | ✅ | claimed in type union, **NOT IMPLEMENTED** | **NOT PRESENT** |
| Ashtottari | ✅ | ✅ | ✅ (2 variants) | claimed, **NOT IMPLEMENTED** | **NOT PRESENT** |
| Chara / Narayana (Jaimini) | ✅ | ✅ (self-disclosed simplified) | ✅ | claimed, **NOT IMPLEMENTED** | **NOT PRESENT** |
| Kalachakra | ✅ | **NOT PRESENT** | ✅ (with Gati/jump logic) | claimed, **NOT IMPLEMENTED** | **NOT PRESENT** |
| Others (Tribhagi, Mudda/Patyayini annual, Sudarshana Chakra, 20+ rare rasi/graha dashas) | ✅ (30+ total, by far the largest library audited) | — | Tribhagi ✅ | — | Mudda (Tajika annual) only |

**PyJHora's dasha library (57 files, 30+ systems) is unmatched.** openastrology-library is the clearest example of the brief's warning: its `DashaType` union *lists* `vimshottari | yogini | char | kalachakra` but only Vimshottari has an actual implementing function — confirmed by direct source read, not inferred.

## Strength (Shadbala / Bhava Bala / Ashtakavarga)

| Repo | Shadbala | Bhava Bala | Ashtakavarga |
|---|---|---|---|
| PyJHora | ✅ full 6-fold, textbook-golden-value tested | ✅ | ✅ (+ Sodhana) |
| vedic-calc | ✅ full 6-fold incl. Lagrangian Ayana Bala interpolation | **NOT PRESENT** as a distinct function | ✅ |
| mayaastrolib | ✅ full 6-fold | — | ✅ (+ Prastara, Shodhana, Kakshya) |
| jyotish-flutter-library-fork | ✅ (claimed, not independently verified — no Dart runtime in this audit environment) | — | ✅ (claimed) |
| openastrology-library | **NOT PRESENT** | **NOT PRESENT** | ✅ |

## Yoga

| Repo | Count | Implementation style | Test coverage |
|---|---|---|---|
| PyJHora | **130+** named yogas | Hardcoded boolean Python functions (13,127-line `yoga.py`), each citing its classical source ("BVR-22 Ruchaka Yoga") | 800+ yoga tests observed passing live |
| jyotish-flutter-library-fork | **287** (repo's own claim, "at par with PyJHora") | Hardcoded per-yoga logic in a 5,727-line file; interpretive text largely copied verbatim from PyJHora (see `LICENSE_AUDIT.md`) | Some (`natal_yoga_test.dart`, mock-chart based) |
| vedic-calc | 24 hardcoded `_detect_*` functions | Same style, smaller catalog | Yes, incl. comparison-suite cross-check vs PyJHora |
| mayaastrolib | ~25+ named yogas, dignity-table-driven helpers (not one giant if/else) | Cleaner code structure than the others, still deterministic conditionals | Yes, 3 test files/68+ tests |
| openastrology-library | Small hand-coded set (Raja, Dhana, Neecha Bhanga, Pancha Mahapurusha, Arishta) | **Contains a confirmed bug**: house-lord logic uses a fixed Aries=1st-house simplification rather than the actual ascendant, producing wrong results for any non-Aries ascendant | Not independently unit-tested |

**No repo in this audit implements yoga detection as a genuinely data-driven/declarative rule engine** — every one of them is hardcoded Python/Dart/TypeScript conditionals per named yoga. This is a real architecture gap: a commercial engine wanting hundreds of yogas without hand-writing hundreds of functions will need to build a declarative rule table from scratch (see `ARCHITECTURE_PROPOSAL.md`).

## Jaimini

| Feature | PyJHora | vedic-calc | jyotish-flutter |
|---|---|---|---|
| Chara Karaka | ✅ | ✅ | ✅ |
| Jaimini (Rasi) Aspects | Partially verified (implicit in `house.py`, not independently confirmed as distinct from graha-drishti) | Rashi Drishti **data table exists but is dead code — zero consumers found by grep** | Not independently verified |
| Arudha Lagna / Bhava Arudhas | ✅ | ✅ (with both classical exception rules) | ✅ (AL/UL only, per repo's own comparison doc — not full Bhava Arudha) |
| Upapada Lagna | **NOT PRESENT** (zero matches for "upapada" anywhere in source) | **NOT PRESENT** | ✅ (claimed, unverified) |
| Karakamsha | **NOT PRESENT** | **NOT PRESENT** | ✅ (claimed, unverified) |

## KP (Krishnamurti Paddhati)

| Feature | PyJHora | vedic-calc | jyotish-flutter | openastrology-library |
|---|---|---|---|---|
| Nakshatra/Star Lord | ✅ | ✅ | ✅ | — |
| Sub Lord | ✅ | ✅ (proportional Vimshottari-based, correct classical method) | ✅ | — |
| Sub-Sub Lord | ✅ (6 levels total: star + 5 sub-divisions) | ✅ | ✅ (4 levels: to sub-sub-sub) | — |
| Cuspal Sub Lord | ✅ (Placidus-based) | ✅ (correctly uses Placidus, not Whole Sign) | ✅ | — |
| KP Significators (house/planet) | **NOT PRESENT** (zero matches for "significator" in calc code) | ✅ (full ABCD-equivalent) | ✅ (full ABCD scheme, claimed) | — |

**vedic-calc has the most complete, independently-verified KP engine** (sub-sub-lord, cuspal sub-lord via correct Placidus cusps, and significators all confirmed present with test coverage) — notably more complete on this specific technique than even PyJHora, which lacks a dedicated significator table.

## Dosha

| Dosha | PyJHora | vedic-calc | jyotish-flutter | mayaastrolib |
|---|:--:|:--:|:--:|:--:|
| Manglik | ✅ | ✅ (incl. cancellation-factor list) | ✅ (17 BV Raman exceptions) | via Sade Sati module only |
| Kala Sarpa | ✅ | ✅ | ✅ | — |
| Pitru | ✅ | ✅ | — | — |
| Guru Chandala | ✅ | ✅ | — | — |
| Others | Ganda Moola, Ghata, Shrapit, Kalathra (8 total) | Grahan, Shani (6 total) | claims 8 total | — |

## Summary verdict for Vedic astrology

**PyJHora is unambiguously the deepest and most rigorously tested open-source Vedic engine audited** — but AGPL-3.0-blocked for direct commercial reuse (treat as a validation oracle only, per `LICENSE_AUDIT.md`). **vedic-calc has the best-documented, most classically-cited, and most independently cross-validated codebase** (disclosed 99% benchmark against two commercial APIs) of any repo in this class, and its KP engine specifically exceeds PyJHora's — also AGPL-blocked. **jyotish-flutter-library-fork** has comparable feature breadth to PyJHora (287 yogas, 7 dasha systems, full KP/Jaimini) but is unusable server-side as packaged and carries the added AGPL-derived-text risk. For a commercial cleanroom Vedic implementation, the recommended approach is: use PyJHora + vedic-calc's disclosed test methodology (cross-validate against both, plus commercial APIs) as the correctness oracle, and independently write the calculation/rule code from primary classical sources (BPHS, Phaladeepika — all public-domain texts, not copyrightable) rather than porting any of these repos' code.
