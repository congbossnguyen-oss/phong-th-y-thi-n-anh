# LICENSE AUDIT

All license text below was read verbatim from each repo's own `LICENSE`/`LICENSING.md` file (or, where absent, confirmed absent by directory search) — not inferred from README claims. See `raw/*.md` and `SWISS_EPHEMERIS_AUDIT.md` for full citations.

## Master table

| Repo | Declared license | Verified from | Commercial closed-source SaaS use | Notes |
|---|---|---|---|---|
| Swiss Ephemeris (core C library) | Dual: **AGPL-3.0** OR **Swiss Ephemeris Professional License** (paid, Astrodienst AG) | `LICENSE`, `LICENSE.TXT`, `agpl-3.0.txt` (verbatim) | **LEGAL REVIEW REQUIRED.** AGPL branch = network-use copyleft; Professional License = paid, terms not published, must contact astro.com directly. | Every repo below that uses Swiss Ephemeris/pyswisseph inherits this same fork in the road, regardless of its own code's license. |
| pyswisseph | Same AGPL/Professional dual license (inherited from C core), confirmed in installed package's `LICENSE.txt` | Installed package metadata | Same as above | De facto abandoned upstream (last commit Feb 2024) — see `TEST_AUDIT.md`/`SWISS_EPHEMERIS_AUDIT.md`. |
| pysweph | Same AGPL/Professional dual license | `pysweph/LICENSE` (verbatim SE license) | Same as above | Actively maintained fork of pyswisseph — **recommended dependency** over pyswisseph. |
| stellium | **AGPL-3.0-or-later** | `LICENSE` (full AGPLv3 text), `pyproject.toml`, `CITATION.cff` | **LEGAL REVIEW REQUIRED — likely incompatible as-is.** | `raw/stellium.md` |
| PyJHora | **AGPL-3.0-or-later** | `LICENSE` (full text), `pyproject.toml` | **LEGAL REVIEW REQUIRED — likely incompatible.** No dual/commercial option offered. | `raw/PyJHora.md` |
| vedic-calc | **AGPL-3.0-or-later** | `LICENSE`, `pyproject.toml`, GitHub API `license.spdx_id` | **LEGAL REVIEW REQUIRED — likely incompatible.** | `raw/vedic-calc.md` |
| openastrology-library | **Dual: AGPL-3.0 (default) OR LGPL-3.0** (LGPL only unlocked if a Swiss Ephemeris Professional License is separately purchased) | `LICENSE-AGPL-3.0.txt`, `LICENSE-LGPL-3.0.txt`, `LICENSING.md` (explicit FAQ) | **LEGAL REVIEW REQUIRED.** The "free" path is AGPL; the closed-source path costs money via a third party. | `raw/openastrology-library.md` |
| mayaastrolib | **MIT** (own code) but **hard-depends on pyswisseph** (AGPL/Professional) and **ships Swiss Ephemeris `.se1` data files** | `LICENSE` (MIT), `LICENSING.md` (explicit: "closed-source commercial use requires a paid Astrodienst license") | **LEGAL REVIEW REQUIRED** — the MIT badge does not cover the mandatory dependency. | `raw/mayaastrolib.md` |
| opastro | **MIT** (own code) but hard-depends on `pyswisseph` (AGPL) | `LICENSE` (MIT), verified `pyswisseph` install's bundled `LICENSE.txt` = AGPL | **LEGAL REVIEW REQUIRED** — same transitive-dependency pattern as mayaastrolib. | `raw/opastro.md` |
| jyotish-flutter-library-fork | **MIT** (own code claim) **+ verbatim PyJHora (AGPL) text found copied in** | `LICENSE` (MIT + a note admitting Swiss Ephemeris is GPL/commercial dual-licensed); `pyjhora_yogas.md` and source comments showing word-for-word PyJHora effect text | **LEGAL REVIEW REQUIRED — highest-risk finding in the whole audit.** Re-licensing AGPL-derived text as MIT is a plausible compliance violation, independent of the Swiss Ephemeris question. | `raw/jyotish-flutter-library-fork.md` §License |
| astrology-engine | **MIT** | `LICENSE` (full text, clean) | **No blocker.** Cleanest license in the entire audited set. | `raw/astrology-engine.md` |
| astro-natal-chart | **NONE — no LICENSE file exists.** A bare "MIT" line appears only in README prose, unbacked by any actual grant, SPDX header, or package-metadata field. | Directory search (negative), `_meta.json` (no license field) | **LEGAL REVIEW REQUIRED — effectively all-rights-reserved.** Also bundles Microsoft Segoe UI fonts and an unverified precompiled Swiss Ephemeris `.pyd` binary with no license clarification for either. | `raw/astro-natal-chart.md` §2 |
| zodiac-engine | **NONE — no LICENSE file exists.** README's own License section is an unresolved placeholder ("Assuming you'll add an MIT License file..."). | Directory search (negative) | **LEGAL REVIEW REQUIRED — effectively all-rights-reserved.** | `raw/zodiac-engine.md` §2 |

## The pattern

**Every single Western/Vedic astrology repo audited that provides real astronomical precision does so by depending on Swiss Ephemeris, directly or via `pyswisseph`/`sweph`/Kerykeion/FFI bindings — and therefore inherits the AGPL-or-paid-Professional-License fork in the road, regardless of what license badge sits on the wrapper repo's own code.** MIT/permissive badges on 4 of the 10 repos (mayaastrolib, opastro, astrology-engine, jyotish-flutter-library-fork) only cover the wrapper's own original code; three of those four still transitively require the Swiss Ephemeris decision, and the fourth (jyotish-flutter) has an additional, independent AGPL-provenance problem in its interpretive text.

**This means the licensing decision is not "which repo to pick" — it is a single, unavoidable decision that sits underneath almost every option: obtain a Swiss Ephemeris Professional License from Astrodienst AG, or accept the AGPL's network-use disclosure obligation for the astronomical-core component (isolated as its own service, see `ARCHITECTURE_PROPOSAL.md`), or replace Swiss Ephemeris with a different-licensed ephemeris source (no drop-in alternative of matching precision was found in this audit — flagged as an open question, see `RECOMMENDATION.md`).**

## Two additional distinct license risks (not about Swiss Ephemeris)

1. **jyotish-flutter-library-fork**: verbatim PyJHora (AGPL) interpretive text found inside MIT-labeled source (`lib/src/analysis/yoga_service.dart`, `dosha_service.dart`) — confirmed by exact string match (the Vesi Yoga effect text). **LEGAL REVIEW REQUIRED**, independent of and in addition to the Swiss Ephemeris question.
2. **astro-natal-chart / zodiac-engine**: no LICENSE file at all. Under default copyright law this is "all rights reserved" — neither repo may be legally copied from or vendored into a commercial product without contacting the author directly, no matter how technically useful the reference code is.

## Practical recommendation

Given that virtually every viable calculation source in this space is AGPL-or-paid-commercial at the Swiss Ephemeris layer, the most durable answer is:
1. Budget for a **Swiss Ephemeris Professional License from Astrodienst AG** as the default assumption for a closed-source commercial product (cost/terms not published — must be negotiated directly; flagged **UNKNOWN / NOT VERIFIED** in this audit).
2. Build the **calculation, rule, and interpretation code independently** (cleanroom implementation informed by, but not copied from, the audited repos) so that no AGPL-licensed source code is ever vendored into the closed-source product — this also sidesteps the jyotish-flutter PyJHora-text problem entirely.
3. Isolate the Swiss Ephemeris dependency behind a single internal module/service boundary (see `ARCHITECTURE_PROPOSAL.md` §astronomical-core) so the licensing question is contained to one component, not smeared across the codebase.
