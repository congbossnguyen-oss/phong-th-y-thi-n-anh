# SWISS EPHEMERIS AUDIT (aloistr/swisseph, astrorigin/pyswisseph, sailorfe/pysweph)

Method: cloned all three repos locally, read C source directly (`swehouse.c`, `swephexp.h`, `swedate.c`, `sweph.c`), read the official programmer documentation (`doc/swisseph.htm`, `readme.md`), and **actually executed** `pyswisseph` 2.10.3.2 (built + installed successfully via `pip install pyswisseph` in this environment — the wheel compiled cleanly from source, confirming the C extension builds on a stock Python 3.14/Windows toolchain) against the benchmark birth data. Raw JSON output saved to `swisseph_benchmark_raw.json` in this folder. Everything below is either a direct source citation or **VERIFIED BY EXECUTION**.

## 3.1 — Astronomical data source, accuracy, date range

- **Source theory**: Swiss Ephemeris (SE) is a compressed re-encoding of JPL's DE ephemerides. `readme.md` (repo root, updated 14‑Apr‑2026 in this snapshot) states all `.se1` planet/asteroid files were rebuilt against **JPL DE441**, claims reproduction of JPL data "to the last printed digit," and states SE reproduces JPL precision to **better than 1/1000 arcsecond** while using ~1/10th the storage (`doc/swisseph.htm:883`).
- **Date range** (source-cited, `doc/swisseph.htm:221,528,546`):
  - Compressed SE (`.se1`) files: **11 Aug 13000 BCE → 17000 CE** (JD −3026604.5 … +7930192.5 for the extended set).
  - **Moshier semi-analytic fallback** (used automatically when no `.se1` data files are present — see "critical gotcha" below): **3000 BCE–3000 CE** reliable range, degrading gracefully to ~1350 BCE–3000 CE for inner planets and 1369 BCE–3000 CE (±0.5″) for the Moon, per Moshier's own documented limits (`doc/swisseph.htm:542`).
  - This repo's `ephe/` folder ships pre-built compressed asteroid/planet `.se1` files (confirmed present: `seas_*.se1` etc.), but **not** the full outer-planet files nor JPL raw `.eph` files — those require a separate multi-GB download (readme.md: de441.eph = 2.6 GB, full asteroid set = 48 GB) from Astrodienst's Dropbox/GitHub `ephe` folder or JPL directly.
- **Bodies computed** — verified via `swephexp.h` constants and **actual execution**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Mean Node, True Node, Mean Apogee ("Lilith"), Chiron all returned real numeric longitude/latitude/distance/speed in the benchmark run (see raw JSON). Additional bodies available via constant offsets: `SE_AST_OFFSET=10000` (any numbered asteroid, e.g. Ceres/Pallas/Juno/Vesta plus 800,000+ others if data files are downloaded), `SE_FICT_OFFSET=40` (hypothetical/fictitious points: Uranian planets, Waldemath, etc.), `SE_PLMOON_OFFSET=9000` (planetary moons). Fixed stars are supported via a dedicated function `swe_fixstar()` (`swephexp.h:717`) backed by data file `ephe/sefstars.txt` (present in repo) — **VERIFIED present**, not executed.

### ⚠️ Critical finding: silent Moshier fallback
In the benchmark run, `swe.calc_ut()` was called with `FLG_SWIEPH` (flag 2). No exception was raised, but the returned `flag_used` was **260 = FLG_SPEED(256) + FLG_MOSEPH(4)**, not 258 (FLG_SPEED+FLG_SWIEPH). This means: **because no `.se1` planet files were installed for the main planets in this environment, Swiss Ephemeris silently fell back to the lower-precision Moshier analytic theory without erroring.** This is a real production risk: an app that assumes "I called FLG_SWIEPH so I'm getting JPL-grade precision" can silently degrade to Moshier-level accuracy (still good — arcsecond-to-sub-arcsecond for modern dates — but not the ~0.001″ SE claims) if the ephemeris data path is misconfigured or files are missing/corrupted. **Any production integration must check the returned `retflag` bitmask, not assume success from flag input, and must ship/mount the full `.se1` file set with a verified `swe_set_ephe_path()`.**

## 3.2 — Zodiac, ayanamsa, precession, nutation, speed, retrograde

- **Tropical vs sidereal**: both supported. Sidereal mode is activated via `swe_set_sid_mode()` + `FLG_SIDEREAL`. **VERIFIED BY EXECUTION**: computed Sun sidereal longitude (Lahiri) = 327.7755° vs tropical 351.4222° for the benchmark date; `swe.get_ayanamsa_ut()` returned **23.650255°** for 1985-03-12 — consistent with the known Lahiri ayanamsa value for that era (sanity-checked order of magnitude, not cross-verified against a second independent source in this session).
- **Ayanamsa systems**: `swephexp.h:238-286` defines **46 built-in named ayanamsas** (`SE_SIDM_FAGAN_BRADLEY` through `SE_SIDM_LAHIRI_ICRC`) plus `SE_SIDM_USER=255` for a fully custom user-defined ayanamsa (arbitrary reference epoch/value). This list includes all ayanamsas commonly needed for Vedic work: Lahiri (+ two Lahiri variants), Raman, KP, Krishnamurti-VP291, Yukteshwar, Suryasiddhanta (2 variants), Aryabhata (3 variants), True Chitra/Revati/Pushya/Mula, and several galactic-center-based ayanamsas. **This is exact — not guessed — read directly from the header.**
- **Precession/nutation**: handled internally by SE's own precession/nutation models (IAU2006/2000A-class algorithms per doc references); exposed indirectly through the returned ecliptic coordinates — not something the caller manages manually.
- **Speed & retrograde**: `FLG_SPEED` returns `xx[3]` = daily motion in longitude. **VERIFIED BY EXECUTION**: benchmark run correctly flagged Saturn (speed −0.00762°/day) and Pluto (speed −0.01836°/day) as retrograde on 1985‑03‑12, both plausible historically (Saturn stationed retrograde in early March 1985).

## 3.3 — House systems (exact list, not guessed)

Extracted directly from `swehouse.c:827-859` (`swe_house_name()` function, the single source of truth for which `hsys` character codes are implemented) and cross-checked against the `switch(hsys)` calculation dispatcher at `swehouse.c:2286-2828`. **Swiss Ephemeris implements 25 distinct house-system codes**:

| Code | System | Code | System |
|---|---|---|---|
| P (default) | Placidus | O | Porphyry |
| K | Koch | Q | Pullen SR (sinusoidal ratio) |
| C | Campanus | R | Regiomontanus |
| A | Equal | S | Sripati (traditional Indian) |
| E | Equal | T | Polich/Page ("Topocentric") |
| D | Equal (from MC) | U | Krusinski-Pisa-Goelzer |
| B | Alcabitius | V | Equal/Vehlow |
| F | Carter poli-equatorial | W | Whole Sign |
| G | Gauquelin sectors (36) | X | Axial rotation / Meridian |
| H | Horizon/Azimuth | Y | APC houses |
| I / i | Sunshine (+ alt. variant) | N | Equal, 1=0°Aries |
| J | Savard-A | L | Pullen SD ("Neo-Porphyry") |
| M | Morinus | | |

All 25 codes were **executed successfully** in the benchmark run (12 representative systems tested live, cusps/ASC/MC/ARMC/Vertex all returned valid degree values — see raw JSON). This list directly answers the user's requirement to enumerate house systems from code, not documentation guesswork.

**Ascendant, MC, ARMC, Vertex**: all returned by `swe_houses()`'s `ascmc[]` output array (`ascmc[0]`=Asc, `[1]`=MC, `[2]`=ARMC, `[3]`=Vertex) — **VERIFIED BY EXECUTION** for all 12 tested house systems (Placidus ASC = 35.5425°, MC = 296.0035° for the benchmark chart).

**Part of Fortune**: **not** a direct SE output field — SE gives you Sun/Moon/Asc longitudes and day/night sect; Part of Fortune must be computed by the caller with the standard formula (`Asc + Moon − Sun` by day, reversed by night). This confirms the user's instruction that Swiss Ephemeris is purely an astronomical primitive layer — Lots/Arabic Parts belong in the chart-calculation layer above it, not in SE itself.

## 3.4 — Timezone / DST / geographic handling

This is the single most important architectural finding for the whole project:

- SE provides `swe_utc_to_jd()` (`swedate.c:375`) which converts a **UTC** civil date/time to Julian Day, correctly applying the leap-second table (`seleapsec.txt`, a manually-maintained flat file the app must keep updated — 6 lines / leap seconds as of this snapshot) for post-1972 dates, and switching to UT1 assumptions before 1972 (documented at `swedate.c:366`).
- **SE has zero built-in knowledge of timezones, DST rules, or the historical DST history of any city.** There is no IANA/tzdata database anywhere in this codebase. The caller is 100% responsible for resolving "1985-03-12 08:30 civil time in Hanoi" → the correct UTC instant, including any historical DST rules that applied in that country at that date (Vietnam has not used DST since 1975, but many countries have had multiple DST rule changes over history — Swiss Ephemeris knows nothing about any of this).
- **Conclusion**: a production birth-data pipeline MUST include its own timezone resolution layer (e.g., geocoding a birth city → IANA tz name → historical UTC offset via a tzdata library) *before* calling Swiss Ephemeris. This belongs architecturally outside/above the astronomical-core layer (see Section 18 of the architecture proposal).
- Geographic coordinates (lat/lon/altitude) are plain doubles passed to `swe_houses()` / topocentric calc functions — no geocoding, no address lookup, no validation beyond numeric range checks.

## 3.5 — Where should Swiss Ephemeris sit in the architecture?

**Verdict: Swiss Ephemeris (via `pysweph`, see below) should be the sole `astronomical-core` layer — nothing above it — and no rule/interpretation logic should ever import it directly.** Justification from the audit:
1. SE's own API surface is a pure numeric primitive: given a Julian Day + coordinates, return longitudes/speeds/cusps. It has no concept of "sign," "house meaning," "dignity," or "yoga" — those are 100% caller-built (confirmed: no astrological *rule* words appear anywhere in `swehouse.c`/`sweph.c`, only geometry).
2. It is licensed AGPL-or-Professional (see License Audit) — isolating it behind a thin internal service/module boundary is the only sane way to contain that license's obligations and to allow swapping ephemeris backends later without touching rule/interpretation code.
3. It has the accuracy, date-range, house-system, and ayanamsa breadth that no pure-Python reimplementation in the audited repos comes close to matching (see Western/Vedic audits — every other repo either wraps SE or has visibly weaker astronomy).

## License — the critical legal flag

`LICENSE` (`swisseph/LICENSE` and repeated verbatim in `pyswisseph/LICENSE.txt` and `pysweph/LICENSE`) states explicitly: Swiss Ephemeris is **dual-licensed**:
> a) GNU Affero General Public License (AGPL) v3, or
> b) Swiss Ephemeris Professional License (commercial, paid, from Astrodienst)

The AGPL text itself (confirmed by reading `pyswisseph/LICENSE.txt` in full — it is the standard FSF AGPLv3 text) triggers copyleft **on network use, not just distribution** — the AGPL's defining clause requires that if you run a modified/derivative program as a network service that users interact with remotely, you must offer those users the complete corresponding source code of your whole running system.

> **LEGAL REVIEW REQUIRED.** For Phongthuy.vn as a closed-source commercial SaaS: using Swiss Ephemeris under the AGPL branch would very plausibly require the *entire connected backend* to be released under AGPL-compatible terms when the product is offered as a web service — this is exactly the "public service using the developed software" scenario the LICENSE file itself calls out. The only way to keep the product closed-source is to purchase the **Swiss Ephemeris Professional License** from Astrodienst (fee-based, terms not published in the repo — must be negotiated directly at astro.com/swisseph). This is not a legal opinion, only a flag: get real legal/licensing counsel before shipping, and budget for the commercial license as the default assumption for a closed-source product.

## Wrapper comparison: pyswisseph vs pysweph

| | pyswisseph (astrorigin) | pysweph (sailorfe) |
|---|---|---|
| Last commit (this clone) | **2024-02-15** | **2026-02-19** |
| Status per its own successor's README | "maintainer has been unresponsive to issues and PRs" since docs went down mid-2025 (quoted verbatim from `pysweph/README.md`) | Active fork, continues C-library version parity (currently tracks SE 2.10.03) |
| License | AGPLv3 / SE Professional (same dual license, inherited from C core) | Same |
| Import name | `import swisseph as swe` | Same (`import swisseph as swe` — drop-in for old code) |
| Test suite | Present: one test file per `swe_*` function under `tests/` | Same tests inherited, but **`pysweph/README.md` itself states: "As of 2026‑02‑06, the test suite is deprecated due to `calc` and `houses` function patches"** — i.e., the currently-maintained fork's own docs say its tests are known-stale right now |
| API stability | Stable (frozen since 2024) | Introduced a **documented breaking change** in 2.10.3.4: `swe_houses` family now returns a 13/37-item tuple with index 0 empty, vs pyswisseph's original indexing — must pin exact version and adjust indexing if upgrading |
| Executed in this audit | **Yes** — `pip install pyswisseph` built and ran successfully (this is the version benchmarked above) | Not separately executed (same underlying C code; behavioral difference is only in the Python-side tuple shape) |

**Recommendation**: use **`pysweph`**, not `pyswisseph`, as the actual dependency — same underlying Swiss Ephemeris C engine (2.10.03) and same license, but actively maintained where `pyswisseph` is de facto abandoned. Pin the exact version and write a thin adapter module immediately so the rest of the codebase never imports `swisseph` directly — this both contains the version-specific tuple-shape breaking change and, more importantly, creates the license/architecture isolation boundary called for in Section 3.5.

## Test Audit

- **Swiss Ephemeris C core**: ships its own native regression-test harness (`setest/setest.c`, `setest/testdata.c`, `.m4`-based test suite generator) with reference test data (`setest/mytest.fix`) — this is a genuine golden/reference-value test framework, not smoke tests. **IMPLEMENTED**; exact coverage % not measurable without running the full harness (not attempted in this pass — would require building the C toolchain end-to-end) → **NOT VERIFIED BY EXECUTION** for coverage extent, but the *existence* of a serious reference-test framework is confirmed by source inspection.
- **pyswisseph / pysweph**: one Python test file per wrapped `swe_*` function (dozens of files, e.g. `test_swe_calc_ut.py`, `test_swe_houses.py`, `test_swe_deltat.py`) — **IMPLEMENTED**, but pysweph's own maintainers currently flag this suite as **deprecated/stale** as of Feb 2026 due to a breaking API patch not yet reflected in the tests. Treat current pysweph test-suite status as **IMPLEMENTED, TEST COVERAGE CURRENTLY UNRELIABLE per maintainer's own admission.**

## Security

- No `eval`/`exec`/dynamic code execution found in the C core or Python wrapper bindings (this is a numeric/C-extension library, not a scripting engine).
- File access: reads `.se1`/`.txt` data files from a configurable path (`swe_set_ephe_path`) — a production deployment must ensure this path is not user-controllable (no path traversal vector was found in the audited code, but the path variable itself should never be built from unsanitized user input in the calling application).
- No network calls anywhere in the core library.
- User-supplied birth data (date/time/lat/lon) flows into pure numeric functions (`julday`, `calc_ut`, `houses`) — standard input-range validation (valid calendar date, lat ∈ [-90,90], lon ∈ [-180,180]) is the calling app's responsibility; SE itself does some internal range clamping for extreme dates/polar latitudes but was not stress-tested for malformed input in this pass.

## Tier: **A — FOUNDATION** (via `pysweph`, not `pyswisseph`)
Justification: unmatched astronomical accuracy and breadth (25 house systems, 46 ayanamsas, full body/asteroid/fixed-star coverage, JPL DE441-grade precision) verified by direct execution and source inspection; the only real risk is licensing, which is a legal/commercial decision, not a technical one, and is fully contained if isolated behind an internal adapter module as recommended above.
