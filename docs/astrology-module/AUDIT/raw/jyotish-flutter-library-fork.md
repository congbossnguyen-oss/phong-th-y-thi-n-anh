# Audit: jyotish-flutter-library-fork (SV-stark/jyotish-flutter-library-fork)

Repo path audited: `C:\ccaudit\repos\jyotish-flutter-library-fork`
Shallow clone: single commit visible (`c1ea9d8`, 2026-08-25, "docs(changelog): update 2.19.0 release notes...").
Method: static source reading only. **NOT VERIFIED BY EXECUTION** — no `dart`/`flutter` binaries in this environment (confirmed: `dart --version` / `flutter --version` both return "command not found").

---

## Summary Verdict

This is a genuinely deep, actively-developed Vedic astrology **calculation engine** (111 Dart files in `lib/`, ~9,600 lines across just the yoga/dosha/jaimini/KP/dasha/varga services, 170 tests) that wraps the real Swiss Ephemeris C library via `dart:ffi` — it is not a toy or a documentation-only project, and its breadth (16+ vargas, 7 dasha systems, 287 yogas, 8 doshas, KP sub-lords, Jaimini Chara Karaka/Arudha/Karakamsha, Shadbala, Ashtakavarga) is unusually comprehensive for a Flutter package. However, it has two disqualifying problems for the stated use case: (1) it is architecturally a **Flutter plugin**, not a portable Dart package — `pubspec.yaml` hard-depends on `flutter: sdk: flutter` and ships Android/iOS/Windows/Linux/macOS platform folders, so it cannot be `dart pub get`'d into a plain server-side Dart/Node/PHP backend without pulling in the Flutter SDK, and even then it depends on FFI-loading a Swiss Ephemeris shared library and ephemeris data files that are explicitly **not bundled** (users must compile/obtain them separately); and (2) there is direct, verbatim textual evidence that yoga/dosha interpretive text was copied from **PyJHora**, an AGPL-3.0-licensed Python project, then re-published here under an MIT license — this is a material legal risk for anyone consuming this code commercially. Treat calculation *logic* as a solid reference/prototype source, but do not adopt the MIT-labeled text/rule content wholesale without legal clearance, and do not expect to run this on a non-Flutter backend without significant rework.

---

## License

- **Declared license**: MIT (`LICENSE` file, "Copyright (c) 2024 Jyotish Contributors").
- The `LICENSE` file itself appends a note: *"This library uses Swiss Ephemeris, which is dual-licensed: 1. GNU GPL v2 or later, 2. Swiss Ephemeris Professional License... For commercial use of Swiss Ephemeris, please refer to https://www.astro.com/swisseph/"* — i.e., the repo's own license file admits the underlying ephemeris engine is GPL/commercial dual-licensed, and the MIT grant does **not** cover Swiss Ephemeris itself (which is not bundled in this repo — see Dependencies).
- **LEGAL REVIEW REQUIRED — PyJHora-derived content re-licensed as MIT.** The repo's own `comparision.md` (line 14) states PyJHora is licensed **AGPL-3.0** ("Copyleft; requires any network-hosted derivative works to open-source their codebase"). Multiple source comments in this MIT-licensed codebase openly acknowledge deriving logic from PyJHora:
  - `lib/src/analysis/dosha_service.dart:8`: `"as per classical scriptures and rules implemented in PyJHora/JHora."`
  - `lib/src/analysis/dosha_service.dart:405`: a comment literally quotes a PyJHora Python source line verbatim: `// In PyJHora: "kc = all([any([planet_positions[p+1][1][0] == (ref_house+h)%12 for h in houses]) for p in natural_malefics])"`
  - `lib/src/analysis/yoga_service.dart:7`: `"Supports 280+ standard yogas at par with PyJHora."`
  - Root-level `pyjhora_yogas.md` (357KB) is explicitly "PyJHora Yogas: Comprehensive Catalog & Rules" cataloguing PyJHora's `yoga.py` functions and their exact English "Effects/Benefits" text.
  - **Direct verbatim text match found**: `pyjhora_yogas.md:7731` gives PyJHora's Vesi Yoga effect text as *"You will have a balanced outlook. You are truthful, tall and sluggish. You will be happy and comfortable even with little wealth."* — this exact sentence appears word-for-word as the `benefits` string for `"vesi_yoga"` in `lib/src/analysis/yoga_service.dart` (line ~186), with no attribution beyond the code comment.
  - This pattern (rule logic modeled on PyJHora's algorithms, plus verbatim English interpretive text copied into the Dart source and shipped under an MIT license with no AGPL notice/attribution) is a plausible AGPL-3.0 compliance violation if PyJHora is in fact the origin of this text (strongly suggested by the evidence above, though I did not cross-reference the live PyJHora repository — **UNKNOWN / NOT VERIFIED** whether PyJHora's authors granted a separate license for this reuse). **Recommend formal legal review before using any of the yoga/dosha interpretive text or the specific rule thresholds in a commercial product**; the raw astronomical/FFI code (Swiss Ephemeris bindings, varga math, Julian day handling) is much lower risk since it implements published classical (BPHS) formulas rather than copying PyJHora's expression.
- Net assessment: commercial/closed-source use of the **calculation code** is plausible under MIT terms as claimed, PROVIDED (a) you separately and properly license Swiss Ephemeris for commercial use (per astro.com terms) since it is GPL/commercial dual-licensed and not included here, and (b) you get legal sign-off on the yoga/dosha text and rule catalog given the PyJHora AGPL provenance concern above. Do not treat the MIT badge as clearing these two issues.

---

## Dependencies

From `pubspec.yaml`:
```yaml
dependencies:
  flutter: {sdk: flutter}
  ffi: ^2.1.0
  path: ^1.9.0
  timezone: ^0.11.0
  synchronized: ^3.1.0
  logging: ^1.2.0
dev_dependencies:
  flutter_test: {sdk: flutter}
  flutter_lints: ^6.0.0
  intl: ^0.20.2
environment:
  sdk: ">=3.8.0 <4.0.0"
  flutter: ">=3.0.0"
```
- **Astronomical engine**: wraps the real **Swiss Ephemeris C library via `dart:ffi`** — confirmed in `lib/src/bindings/swisseph_bindings.dart`, which declares FFI signatures for `swe_calc_ut`, `swe_set_sid_mode`, `swe_houses`, `swe_rise_trans`, `swe_lun_eclipse_how/when`, `swe_sol_eclipse_*`, `swe_julday`, `swe_get_ayanamsa_ut`, etc. It does **not** reimplement ephemeris math itself and does **not** depend on another Dart astronomy package for planetary positions.
- **Critical gap**: the Swiss Ephemeris **native shared library is not bundled** in this repo (no `.so`/`.dll`/`.dylib` found anywhere in the tree) and neither are the `.se1` ephemeris data files. `SETUP.md` instructs developers to compile `libswisseph.so`/`.dylib`/`swisseph.dll` from source themselves or install via Homebrew/apt, place the binary on the target platform manually, and separately download `seas_18.se1` / `semo_18.se1` / `sepl_18.se1` from astro.com. `.pubignore` explicitly excludes `*.dll/*.so/*.dylib` and `ephe/` from the published pub.dev package. This means the published package is **not usable out-of-the-box**; every consumer must independently source and legally clear Swiss Ephemeris themselves.
- `swisseph_bindings.dart` resolves the library via `SWISSEPH_LIB_PATH` env var, then hardcoded per-platform default filenames (`libswisseph.so` for Android/Linux, `.dylib` for iOS/macOS, `swisseph.dll` for Windows) — this loading logic itself would work fine on a headless Linux server (`Platform.isLinux` branch), so the FFI mechanism is not inherently mobile-only, but obtaining the binary legally/compiling it remains the operator's responsibility.
- Freshness: `ffi ^2.1.0`, `path ^1.9.0`, `timezone ^0.11.0`, `synchronized ^3.1.0`, `logging ^1.2.0` are all current, actively maintained pub.dev packages as of the SDK floor declared (Dart >=3.8.0). CHANGELOG (`2.19.0`) shows the maintainer actively pruning dependencies (removed `dartx`, removed `test`, moved `intl` to dev-only) — a sign of ongoing dependency hygiene. **UNKNOWN / NOT VERIFIED** — could not run `dart pub outdated` (no runtime).

---

## UI-coupled vs. pure-calculation-library assessment (key finding for your backend use case)

**This is packaged as a Flutter plugin, not a portable Dart package — a significant obstacle for a server/backend use case.**

Evidence:
1. `pubspec.yaml` declares `dependencies: { flutter: { sdk: flutter } }` and a `flutter: plugin: platforms:` block with `ffiPlugin: true` for android/ios/linux/macos/windows. A pubspec with an SDK dependency on `flutter` can only be resolved with `flutter pub get`, not plain `dart pub get`. This makes it **structurally impossible to add as a dependency in a pure Dart backend project** (e.g. `dart_frog`, `shelf`, `dart:io` `HttpServer`) without either (a) installing the full Flutter SDK on your server purely to satisfy pub resolution, or (b) vendoring/forking the calculation code out of the Flutter-plugin scaffolding into a standalone Dart package.
2. Native platform scaffolding exists for all 5 platforms (`android/`, `ios/`, `windows/`, `linux/`, `macos/`) — `android/src/main/kotlin/com/jyotish/JyotishPlugin.kt` is boilerplate (confirmed empty `FlutterPlugin` with a comment "this is an FFI plugin - no platform channel implementation needed"), and `windows/CMakeLists.txt` / `linux/jyotish_plugin.cc` similarly build empty shim libraries — these exist only to satisfy Flutter's plugin packaging convention, not because the calculation logic needs them.
3. Test suite uses `package:flutter_test` (all 11 test files import it, e.g. `test/native_implementations_test.dart:1`), not plain `package:test`. CHANGELOG 2.18.0→2.19.0 explicitly records "Removed `test` from `dev_dependencies` and migrated all test suites to `package:flutter_test`" — so even running the existing test suite requires the Flutter SDK/toolchain, not just Dart.
4. That said, the **calculation code itself does not import Flutter widgets** in the vast majority of files — a `grep` across `lib/` for `flutter/material`, `StatelessWidget`, `StatefulWidget`, `CustomPainter` found matches in only **2 of 111 files**: `lib/src/analysis/chart_renderer.dart` (SVG + `CustomPainter`-based North/South Indian chart rendering, added in v2.17.0/v2.19.0 as `VedicChartView`) and `lib/src/muhurta/vedic_clock.dart` (Vedic analog/digital clock widgets). All core calculation services (ephemeris, panchanga, dasha, yoga, dosha, jaimini, KP, shadbala, ashtakavarga, transit) are plain Dart classes with no widget dependency, using only `dart:ffi`, `dart:io`, `dart:collection`, and the small dependency list above.
5. Practical implication: **the calculation logic is portable in principle** (it's ordinary Dart using FFI, which Dart VM / AOT server binaries support natively), but the package as currently structured and published cannot be pulled into a non-Flutter project without surgery. For a Vietnamese phong-thủy backend, you would need to either (a) extract/fork the relevant `lib/src/**` files (excluding `chart_renderer.dart` and `vedic_clock.dart`) into a standalone pure-Dart package with its own `pubspec.yaml` (dropping the `flutter: sdk: flutter` dependency and the platform folders), and independently source/compile/license the Swiss Ephemeris native library for your Linux server, or (b) run this as an internal Flutter/Dart microservice compiled with `dart compile exe` if the FFI-only paths compile cleanly outside Flutter (**UNKNOWN / NOT VERIFIED** — not testable without a Dart/Flutter toolchain in this environment; the barrel file `lib/jyotish.dart` unconditionally exports `chart_renderer.dart`, which would need Flutter's `dart:ui`/`Canvas` APIs and could break a plain-Dart compile unless that export is removed).

---

## Feature Table

| Feature | Supported | Implementation evidence (file) | Tested | Notes |
|---|---|---|---|---|
| Rashi/D1 chart | Yes | `lib/src/analysis/vedic_chart_service.dart`, `lib/src/models/vedic_chart.dart` | Yes (`test/natal_yoga_test.dart` builds mock D1 charts) | Core chart type all other analysis builds on |
| Divisional charts (Vargas) | Yes — D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11,D12,D16,D20,D24,D27,D30,D40,D45,D60, plus non-standard D150, D249 | `lib/src/models/divisional_chart_type.dart` (enum with all listed vargas + BPHS significance text); computation in `lib/src/analysis/divisional_chart_service.dart` (882 lines; real per-varga longitude math, e.g. Hora/Drekkana/Navamsha/Dashamsha "method" configs in `lib/src/models/varga_configuration.dart`) | Partially — `test/advanced_features_test.dart`, `test/improvements_test.dart` reference varga tests (**not individually enumerated per varga in this audit**) | D249 explicitly requires `SiderealMode.krishnamurtiVP291` ayanamsa (enforced via `AyanamsaMismatchException` in `divisional_chart_service.dart:52-61`), all standard D1-D60 requested by user are present |
| Nakshatra + Pada | Yes | `lib/src/panchanga/nakshatra.dart`, `lib/src/panchanga/panchanga_service.dart` | Yes — `test/panchang_verification_test.dart` | Part of 5-limb Panchanga |
| Dasha systems | Yes — Vimshottari, Yogini, Ashtottari (2 schemes: Ardra-adi/Krittika-adi), Chara, Narayana, Kalachakra (with Gati/jump logic), Tribhagi | `lib/src/systems/dasha.dart` (enum `DashaType` lines 5-25), computation `lib/src/systems/dasha_service.dart` (1,441 lines) | Some (**not verified per-dasha in this audit** — no dedicated `dasha_test.dart` file found in `test/`, though `test/improvements_test.dart`/`test/precision_improvements_test.dart` likely touch it — UNKNOWN) | Vimshottari computed to Prana/Deha sub-period depth per CHANGELOG 2.x notes. Only 7 systems vs. PyJHora's 50+ (per repo's own `comparision.md` table) |
| Yogas | Yes — 287 yogas (per repo's own claim, `lib/src/analysis/yoga_service.dart:7` "Supports 280+ standard yogas at par with PyJHora") | `lib/src/analysis/yoga_service.dart` (5,727 lines!); `detectNatalYogas()` at line 102 computes boolean presence + generated explanation + static "benefits" text per yoga | Yes — `test/natal_yoga_test.dart` verifies specific yogas (Nipuna, Gaja Kesari) against a constructed mock chart with explicit planet longitudes/houses/dignities | Includes Ravi (Sun), Chandra (Moon), Nabhasa, Pancha Mahapurusha, Raja, Neecha-Bhanga (line 5686) yogas. Interpretive "benefits" text is largely verbatim-copied from PyJHora (see License section) |
| Jaimini — Chara Karaka | Yes | `lib/src/systems/jaimini.dart` (`CharaKarakaResult` class, line 56) computed via `lib/src/systems/jaimini_service.dart` (205 lines) | UNKNOWN / NOT VERIFIED (no dedicated jaimini test file found) | |
| Jaimini — Arudha Lagna / Upapada | Yes | `lib/src/systems/arudha_pada.dart`, `lib/src/systems/arudha_pada_service.dart` | UNKNOWN / NOT VERIFIED | Per `comparision.md`, this repo implements AL/UL only (not full Bhava Arudha for every house, which PyJHora claims) |
| Jaimini — Karakamsha | Yes | `lib/src/systems/jaimini.dart` (`KarakamsaInfo` class, line 5 — "Atmakaraka's sign in Navamsa") | UNKNOWN / NOT VERIFIED | |
| KP System — sub lords | Yes | `lib/src/systems/kp_calculations.dart` (`KPDivision`, `starLord`/`subLord`/`subSubLord`/`subSubSubLord` fields lines 50-77; `KPSignificators` A/B/C/D significators lines 181-206); service `lib/src/systems/kp_service.dart` (835 lines) | UNKNOWN / NOT VERIFIED (no dedicated `kp_test.dart` found) | Goes to 4 levels (sub-sub-sub lord), plus full ABCD significator scheme — a genuinely complete KP implementation, not a stub |
| Doshas | Yes — at least Manglik/Kuja, Kala Sarpa, Pitru; repo claims 8 total ("capable of identifying 8 key Vedic astrological flaws", `CHANGELOG.md:128`) | `lib/src/analysis/dosha.dart` (`KalaSarpaDoshaResult`, `ManglikDoshaResult` referenced via `compatibility.dart`), `lib/src/analysis/dosha_service.dart` (553 lines) — Manglik implements "BV Raman's 17 detailed exceptions" (line 94 comment) | Yes — `test/dosha_test.dart` | Manglik logic explicitly checks houses 2,4,7,8,12 by default, matches PyJHora default per comment at line 117 |
| Ayanamsa options | Yes — 40+ per repo claim (`comparision.md`); confirmed in code: Fagan/Bradley, Lahiri, Lahiri 1940, Lahiri VP285, Lahiri ICRC, Raman, Krishnamurti, Krishnamurti VP291 (KP New), + many more via `SiderealMode` enum | `lib/src/models/calculation_flags.dart` lines 295-372 (`enum SiderealMode`) | UNKNOWN / NOT VERIFIED (not exhaustively counted) | Default is Lahiri (line 27, 65); KP work must use `krishnamurtiVP291` per factory `CalculationFlags.kp()` (lines 116-140) |
| House systems | Placidus, Koch, Whole Sign confirmed directly in FFI layer comments; repo's own comparison table claims only Whole Sign/Placidus/Koch are supported (not the "vast array" PyJHora offers) | `lib/src/bindings/swisseph_bindings.dart:370-377` (house system codes P/K/O/R/C/A/E/W passed straight to `swe_houses`), `lib/src/models/vedic_chart.dart` whole-sign default | UNKNOWN / NOT VERIFIED | Swiss Ephemeris itself supports far more house systems (any single-char code) than this library's Dart wrapper explicitly models/validates — **CLAIMED BUT NOT VERIFIED** whether other codes (Regiomontanus, Campanus, etc.) work end-to-end through the higher-level API vs. just the raw FFI passthrough |
| Shadbala (6-fold strength) | Yes | `lib/src/strength/shadbala_service.dart` (referenced), `lib/src/strength/strength_report.dart`/`strength_report_service.dart` | UNKNOWN / NOT VERIFIED | Sthana, Dig, Kala, Chesta, Naisargika, Drik Bala per README/CHANGELOG claims |
| Ashtakavarga | Yes — BAV, SAV, Trikona Shodhana, Ekadhipati Shodhana | `lib/src/systems/ashtakavarga.dart`, `lib/src/systems/ashtakavarga_service.dart` | UNKNOWN / NOT VERIFIED | |
| Panchanga (Tithi/Nakshatra/Yoga/Karana/Vara) | Yes | `lib/src/panchanga/panchanga.dart`, `panchanga_service.dart`, `masa.dart`/`masa_service.dart` | Yes — `test/panchang_verification_test.dart` | Sunrise-boundary Vara logic, binary-search Tithi end-time per CHANGELOG |
| Muhurta / Choghadiya / Hora / Gowri Panchangam | Yes | `lib/src/muhurta/*.dart` (10 files) | Yes — `test/muhurta_yoga_test.dart` | |
| Compatibility (Kundli matching) | Yes | `lib/src/analysis/compatibility.dart`, `compatibility_service.dart` | UNKNOWN / NOT VERIFIED | Includes Manglik cross-check (`compatibility.dart` imports dosha for `ManglikDoshaResult`) |
| Eclipses, rise/set, special lagnas | Yes | `lib/src/astronomy/eclipse_service.dart`, `udaya_lagna_service.dart`, `special_lagnas_service.dart` | UNKNOWN / NOT VERIFIED | Direct FFI to `swe_lun_eclipse_*`/`swe_sol_eclipse_*`/`swe_rise_trans` |
| Prashna (horary) | Yes | `lib/src/systems/prashna.dart`, `prashna_service.dart` | UNKNOWN / NOT VERIFIED | |
| Tajaka / Varshapal (annual chart) | Yes | `lib/src/systems/tajaka.dart`, `varshapal.dart` + services | UNKNOWN / NOT VERIFIED | |
| UI chart rendering (SVG / CustomPainter) | Yes but Flutter-coupled | `lib/src/analysis/chart_renderer.dart` (North/South Indian style, `toSVG()` + Flutter `CustomPainter`) | UNKNOWN / NOT VERIFIED | **Not usable outside Flutter** — irrelevant/must be excluded for a backend engine |

---

## Calculation vs. Rule vs. Interpretation classification

The library mixes all three layers **in the same file/class**, which is architecturally worth noting for anyone planning a clean calculation/rule/interpretation separation:

1. **Raw calculation (facts)** — e.g. `EphemerisService.calculatePlanetPosition()` (`lib/src/astronomy/ephemeris_service.dart`) returns a `PlanetPosition` (longitude/latitude/distance/speeds) straight from `swe_calc_ut`. Pure data, no judgment.
2. **Rule logic** — e.g. `YogaService.detectNatalYogas()` (`lib/src/analysis/yoga_service.dart:102+`) computes boolean `isPresent` flags from planetary house/sign/aspect relationships (e.g. lines 173-191, Vesi Yoga: `isPresent = vesiPlanets.isNotEmpty`). This is genuine rule logic, not just data — e.g. `_doesPlanetAspectHouse`, `_isExalted`, `_isOwnSign` helper methods encode classical Vedic rules.
3. **Interpretation (natural-language text/templates)** — the **same** `NatalYoga` object returned by step 2 also carries a hardcoded `benefits` string (e.g. line 186: `"You will have a balanced outlook. You are truthful, tall and sluggish..."`) and a `description` string. These are **not** dynamically generated from the calculation — they are static English paragraphs per yoga, largely traceable to PyJHora's own effect text (see License section). Similarly `dosha_service.dart` returns hardcoded `description` strings per dosha result.

**Practical implication for your layered architecture**: this library does NOT cleanly separate "calculation" from "interpretation" — the interpretation text is baked into the same service/model classes as the rule evaluation. If you build a 3-layer architecture (calculation → rules → interpretation), you can reuse the calculation layer (Ephemeris/varga/panchanga math) fairly cleanly, but you would need to strip out or replace the hardcoded English `benefits`/`description` strings throughout `yoga_service.dart`, `dosha_service.dart`, etc. — both for i18n (Vietnamese output) and to avoid the PyJHora-text legal exposure noted above.

---

## Test Audit

**Test suite exists** (not "NO TEST SUITE FOUND"): 11 files under `test/`, 170 individual `test(...)` cases across 22 `group(...)` blocks.

Files: `advanced_features_test.dart`, `dosha_test.dart`, `features_validation_test.dart`, `improvements_test.dart`, `muhurta_yoga_test.dart`, `natal_yoga_test.dart`, `native_implementations_test.dart`, `panchang_verification_test.dart`, `precision_improvements_test.dart`, `serialization_test.dart`, `tree_shaking_test.dart`.

Example (`test/natal_yoga_test.dart`, "Detects Nipuna and Gaja Kesari Yogas"): constructs a fully hand-specified mock `VedicChart` (explicit `HouseSystem`, `PlanetPosition`s for Sun/Mercury/Moon/Jupiter/Mars with exact longitudes/houses/dignities — e.g. "Sun at 10 Aries (House 1)... Mercury at 15 Aries (House 1)... exalted/friendSign dignity manually assigned") and asserts the yoga engine flags the expected yogas. This is a reasonable unit-test pattern — it verifies rule logic in isolation from ephemeris/FFI, but by hand-setting dignity/house values it does **not** verify the ephemeris→chart pipeline end-to-end.

`test/native_implementations_test.dart` does exercise the real pipeline: `setUpAll` calls `Jyotish().initialize(ephemerisPath: p.absolute('ephe'))` and computes a real `VedicChart` for `DateTime(1990, 5, 15, 14, 30)` at New Delhi coordinates, then checks `isMoolatrikona`, `isVargottama`, deep exaltation degrees, and combustion distances — this is a genuine integration test against Swiss Ephemeris. **Caveat**: this test requires an `ephe/` directory with actual `.se1` ephemeris files to exist at test-run time; these are not committed to the repo (confirmed — no `ephe/` directory present in this clone) and are fetched only in CI (`.github/workflows/ci.yml` downloads `seas_18.se1` from astro.com). So the "native" tests cannot pass as-is without that separate provisioning step — consistent with earlier findings that ephemeris data is never bundled.

Tests import `package:flutter_test/flutter_test.dart` — confirms tests require the Flutter test runner (`flutter test`), not `dart test`.

---

## Execution Attempt

```
$ dart --version
bash: dart: command not found
$ flutter --version
bash: flutter: command not found
```

**NOT VERIFIED BY EXECUTION** — no Dart/Flutter runtime available in this environment. All findings above are from static source reading only (tracing actual function bodies, not just doc comments/README claims).

---

## Maintenance

- **Fork target**: `SV-stark/jyotish-flutter-library-fork`, forked from (per `pubspec.yaml` `homepage`/`repository`/`issue_tracker` fields, all still pointing upstream) `rajsanjib/jyotish-flutter-library`. The fork has substantially diverged — `comparision.md` and the CHANGELOG's depth (287 yogas, 8 doshas, full KP/Jaimini/Shadbala/Ashtakavarga, D150/D249 vargas) suggest the fork added the large majority of the astrological feature surface itself, well beyond a typical upstream "Vedic FFI wrapper" starting point. **UNKNOWN / NOT VERIFIED** — could not diff against the actual upstream `rajsanjib/jyotish-flutter-library` repo in this environment (no network fetch performed); this assessment is based solely on this fork's own internal documentation of its history (CHANGELOG.md), which is self-reported and should be independently confirmed.
- **Last commit visible in this shallow clone**: `c1ea9d8`, 2026-08-25, changelog-only commit for v2.19.0. Only 1 commit is visible (shallow clone depth=1), so full commit cadence/history **cannot be assessed** from this checkout — CHANGELOG.md itself, however, shows a dense, dated release history from early versions through 2.19.0 (2026-08-25), each with substantial, specific engineering content (not just version bumps) — e.g. 2.19.0 added CI, macOS support, dependency pruning, exception-handling fixes; 2.18.0 added JSON serialization; 2.17.0 added chart rendering and caching.
- Classification: **ACTIVE**. The CHANGELOG reflects continuous, substantive feature and quality work through the most recent dated entry (2026-08-25, which is effectively "now" relative to today's date of 2026-09-13 — i.e., last meaningful update was under 3 weeks ago per the repo's own dates). This is far more active than a typical abandoned fork.
- Caveat: PROJECT_SUMMARY.md (a root doc) describes a `jyotish-js/` (JS/TS port) and a `native/` (compiled binaries) directory and "200+ Automated tests" — **neither directory exists in this checkout**, and the actual test count is 170, not 200+. This indicates PROJECT_SUMMARY.md is stale/aspirational and should not be trusted as ground truth (a recurring theme: verify code, not docs, exactly as this audit was instructed to do).

---

## Code Quality Scores

| Dimension | Score (0-10) | Justification |
|---|---|---|
| Architecture | 7 | Clear service-per-domain layering (`analysis/`, `astronomy/`, `strength/`, `systems/`, `muhurta/`, `panchanga/`, `transit/`, `bindings/`) with a barrel export (`lib/jyotish.dart`) and singleton facade (`lib/src/jyotish_core.dart`). Deducted for: calculation and interpretation-text logic living in the same classes (see Classification section), and for the package being structurally a Flutter plugin when ~98% of its code has no Flutter dependency — an unnecessary architectural constraint for a "calculation library." |
| Modularity | 7 | 111 files, each generally scoped to one domain/service; models (`lib/src/models/`) are cleanly separated from services. `yoga_service.dart` at 5,727 lines in a single file is a modularity smell (should be split per yoga category) but is internally organized into clear per-yoga blocks. |
| Type usage | 8 | Extensive use of Dart enums with associated data (`DivisionalChartType`, `SiderealMode`, `DashaType` all carry typed metadata via const constructors — e.g. `divisional_chart_type.dart:77-91`), typed exception hierarchy (`JyotishException` subclasses), records used for tuple returns (e.g. `(DateTime? sunrise, DateTime? sunset)` in `ephemeris_service.dart:40`). Good use of `required`/named parameters throughout. |
| Documentation | 7 | Extensive `///` doc comments on public classes/methods (visible throughout `swisseph_bindings.dart`, `ephemeris_service.dart`, `divisional_chart_type.dart`). Large external docs (README, API_REFERENCE.md at 161KB, USAGE.md, LOGIC.md, SETUP.md, QUICKSTART.md) — very thorough, though as noted PROJECT_SUMMARY.md contains stale/inaccurate claims (jyotish-js, native/ dirs, "200+" tests) that don't match the actual tree, which hurts trust in the docs generally. |
| Separation of concerns | 5 | Weakest dimension: interpretive natural-language text is hardcoded inside the same rule-evaluation methods (`yoga_service.dart`, `dosha_service.dart`) rather than in a separate templating/interpretation layer, which is exactly the layering the user's target architecture wants to keep distinct. Also, `chart_renderer.dart`/`vedic_clock.dart` (Flutter UI) live in the same package/namespace as pure calculation code with no clear module boundary (no separate `jyotish_ui` package). |
| Extensibility | 7 | Enum-based `DivisionalChartType`/`SiderealMode`/`DashaType` designs make adding new vargas/ayanamsas/dashas straightforward. `VargaConfiguration` (line-referenced in `divisional_chart_service.dart:32-34`) allows selecting among multiple classical calculation methods (Hora/Drekkana/Navamsha/Dashamsha method variants) — a genuinely extensible design choice. |
| Error handling | 8 | Dedicated typed exception hierarchy (`jyotish_exception.dart`): `CalculationException`, `InitializationException`, `ValidationException`, `AyanamsaMismatchException`, `PolarRegionException` (the last even carries structured `latitude`/`houseSystem` fields for polar-region house-system failures). CHANGELOG 2.19.0 specifically fixed silent-failure bugs (e.g. `getObliquity()` previously returned a hardcoded fallback instead of throwing) — evidence of active hardening, not just happy-path code. FFI error buffers are checked and logged (`swisseph_bindings.dart:296-313`). |

**Overall**: a well-engineered, actively maintained Dart codebase for what it is, let down specifically on separation-of-concerns (interpretation baked into rules) and on packaging (forced Flutter-plugin structure) relative to the specific backend-engine use case being evaluated.

---

## Security Notes

- **Native code / FFI**: Yes — `dart:ffi` used throughout `lib/src/bindings/swisseph_bindings.dart` to call an externally-supplied Swiss Ephemeris shared library. The library is loaded by filename/path (`DynamicLibrary.open`), with an environment-variable override (`SWISSEPH_LIB_PATH`). **Risk**: if `SWISSEPH_LIB_PATH` (or the default OS library search path) can be influenced by an untrusted party in a server deployment, this is a DLL/shared-library-injection vector — standard FFI risk, not specific to this library's own code quality, but worth flagging for a server context where you control the deployment environment and should pin/verify the ephemeris binary's provenance and integrity (checksum) rather than trusting ambient library search paths.
- **Network calls**: None found in `lib/` (`grep` for `package:http`, `HttpClient`, `dio`, `WebSocket`, socket usage returned no matches). The only network activity anywhere in the repo is in `.github/workflows/ci.yml`, which downloads Swiss Ephemeris `.se1` fixture files from astro.com during CI — not part of the shipped library.
- **User-supplied birth data handling**: Birth data (date/time/lat/long/altitude/timezone, via `GeographicLocation`) is validated at the boundary in some paths — e.g. `PolarRegionException` guards extreme latitudes for house-system calculation (`jyotish_exception.dart:64-78`), and `ValidationException` exists as a class for invalid input — but a full audit of every public entry point's input validation (e.g., is latitude clamped to [-90,90]? is an invalid `DateTime` rejected before being passed to `swe_julday`?) was **not performed exhaustively** in this pass; spot checks show reasonable defensive patterns (path normalization via `package:path` before passing to FFI, buffer allocation/free in `try/finally` blocks throughout `swisseph_bindings.dart` to avoid native memory leaks). No PII persistence/storage/logging of birth data was observed — `Logger` calls in `ephemeris_service.dart` log calculation warnings, not raw personal data, though a full grep for accidental PII logging was not exhaustively performed.
- **Memory safety**: FFI buffer management is consistently wrapped in `try { ... } finally { malloc.free(...) }` (e.g. `swisseph_bindings.dart:283-319`, `380-418`, `441-471`, `479-503`) — good discipline, reduces native memory leak risk from repeated calculation calls (relevant for a long-running server process making many chart calculations).

---

## Tier Recommendation: **B — Reference** (with a carve-out; see below)

**Justification**:
- Not **A (Foundation)** — cannot be dropped directly into a non-Flutter server backend due to the hard `flutter: sdk: flutter` pubspec dependency, missing bundled Swiss Ephemeris binary/data, and Flutter-coupled test suite. A "Foundation" tier component should be usable with minimal friction; this requires real extraction/forking work first.
- Not **C/D/E** — the calculation depth (287 yogas with real rule logic, full varga set including rare D150/D249, complete KP sub-lord chain, Jaimini Chara Karaka/Arudha/Karakamsha, 7 dasha systems, genuine Swiss Ephemeris FFI rather than a toy ephemeris) is too substantial and too actively maintained to dismiss as merely "Specialized," "Experimental," or "Avoid." The engineering quality (typed exceptions, LRU caching, memory-safe FFI, real test coverage against constructed charts) is well above typical hobby-project bar.
- **Tier B ("Reference")** fits best: use this repository as a **reference implementation and algorithm/rule source** — to understand correct BPHS-based varga formulas, yoga detection conditions, KP significator logic, dasha period math, etc. — rather than as a drop-in dependency. For your actual Vietnamese phong-thủy backend:
  1. **Do not** `flutter pub add` this package into a server project — it won't resolve without the Flutter SDK, and even then you'd be shipping unnecessary Flutter/platform-plugin baggage into a headless service.
  2. **Do** consider extracting the pure-Dart calculation files (`lib/src/astronomy/`, `lib/src/analysis/*_service.dart` minus `chart_renderer.dart`, `lib/src/systems/`, `lib/src/panchanga/`, `lib/src/muhurta/` minus `vedic_clock.dart`, `lib/src/strength/`, `lib/src/models/`, `lib/src/bindings/`, `lib/src/constants/`, `lib/src/exceptions/`) into your own standalone Dart (or re-ported to your actual backend language) package, dropping the `flutter:` pubspec dependency and platform folders, and separately sourcing/compiling/licensing Swiss Ephemeris for your Linux server (commercial license from astro.com since your product is closed-source/commercial).
  3. **Do not** reuse the yoga/dosha "benefits"/"description" interpretive text verbatim without legal review, given the demonstrated verbatim overlap with PyJHora's AGPL-3.0-licensed text — write your own Vietnamese-language interpretation layer instead (which you'd want for localization anyway), using this repo only for the underlying astronomical *conditions* (which are themselves derived from public-domain classical texts like BPHS, so the condition logic itself is lower legal risk than the specific English phrasing).
  4. Get a qualified IP lawyer to review the PyJHora provenance question before any commercial ship date, and separately confirm your Swiss Ephemeris licensing path (GPL v2+ compliance for open-sourcing, or a paid Professional License from Astrodienst) before production use.
