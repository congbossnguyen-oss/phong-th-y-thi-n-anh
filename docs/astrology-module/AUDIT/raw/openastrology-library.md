# Source-Code Audit: openastrology-library (nikolamilenkovic/openastrology-library)

Repo path audited: `C:\ccaudit\repos\openastrology-library`
Package: `openastrology-library` v1.1.1, author Nikola Milenkovic
Audit method: full read of all `src/*.ts` and `src/types/*.ts` files, all `test/**/*.ts` files, license files, README/DOCS, `package.json`/`tsconfig.json`/`tsup.config.ts`/`jest.config.js`; `npm install`, `npm run build`, `npm test`, and a hand-written execution script against the benchmark birth data.

---

## 1. Summary Verdict

openastrology-library is a real, working, moderately mature TypeScript wrapper around the genuine Swiss Ephemeris (via the `sweph` N-API binding), not a from-scratch astronomical implementation — this was confirmed both by reading the source (`sweph` calls throughout) and by execution (a missing-ephemeris-file error message emitted directly by the compiled Swiss Ephemeris C code: `"SwissEph file 'sepl_18.se1' not found ... using Moshier eph."`). It implements a genuinely broad calculation surface for both Western (tropical) and Vedic (sidereal) astrology — planets, houses (multiple systems), aspects, chart patterns, dignities, nakshatras, 19 divisional (varga) charts, Vimshottari dasha, ashtakavarga, a modest hand-coded yoga engine, and dedicated transit/ingress calculators — and ships a large (526-test) Jest suite that checks against specific reference numeric values (degrees, DMS, house placements), not just smoke tests. The codebase is calculation-layer only: no natural-language interpretation strings exist anywhere in `src/`, and a `ChartAnalysis` type is defined but never implemented or referenced by any calculator — this is exactly the kind of "raw facts" layer useful as a *foundation* under a separate commercial rules/interpretation engine. The single most important issue for a commercial Vietnamese SaaS use case is licensing: the library is dual-licensed AGPL-3.0 (default, viral/network-copyleft) or LGPL-3.0 (only if the operator separately purchases a Swiss Ephemeris professional license from Astrodienst AG) — **this requires LEGAL REVIEW** before any commercial/closed-source use. Execution testing also surfaced a real, non-cosmetic engineering defect: the Vedic calculator silently falls back to the lower-precision Moshier ephemeris and returns success when Swiss Ephemeris `.se1` data files are absent, while the Western calculator throws in the identical situation — an inconsistency that could silently degrade production accuracy without any error surfaced to the caller.

---

## 2. License

**LEGAL REVIEW REQUIRED.** This library is dual-licensed and its commercial-use path depends on a *third party's* (Astrodienst AG's) separate commercial licensing terms, not just this repo's own license text.

`package.json` license field: `"license": "(AGPL-3.0 OR LGPL-3.0)"`

### LICENSE-AGPL-3.0.txt (full text, default license)
```
GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (C) 2026 Nikola Milenkovic

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

---

Full license text: https://www.gnu.org/licenses/agpl-3.0.txt
```
(Note: this file contains only the AGPL preamble/notice, not the full ~13-section AGPL-3.0 legal text — it points out to gnu.org for the complete terms.)

### LICENSE-LGPL-3.0.txt (full text — conditional license)
```
GNU LESSER GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2026 Nikola Milenkovic
...
---

This LGPL-3.0 license is available ONLY if you own a professional license
for the Swiss Ephemeris from Astrodienst AG.

To obtain a Swiss Ephemeris professional license, visit:
https://www.astro.com/swisseph/

Full LGPL-3.0 license text: https://www.gnu.org/licenses/lgpl-3.0.txt
```
The key clause: **"This LGPL-3.0 license is available ONLY if you own a professional license for the Swiss Ephemeris from Astrodienst AG."** — i.e. the permissive path is *conditioned on* a separate paid third-party license.

### LICENSING.md (full content quoted, key excerpts)
- "By default, this library is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**."
- "⚠️ If you use this library in a web service or API, **you must open source your entire application** under AGPL-3.0"
- "⚠️ Users of your web service must be able to access the complete source code"
- "If you own a **professional license for the Swiss Ephemeris** from Astrodienst AG, you may use this library under **LGPL-3.0**." → "Use in closed-source commercial applications", "No requirement to disclose your application's source code", "Only need to provide source code for modifications to this library itself"
- "⚠️ **Important**: This library depends on the Swiss Ephemeris (via the `swisseph` package), which has its own licensing requirements." (Note: as of the actual v1.1.0 changelog the code now uses the `sweph` package, not `swisseph` — LICENSING.md text is stale on this point; see §3.)
- License Compatibility Matrix in the doc explicitly states: for "Commercial/Proprietary" and "SaaS/Web Service" project types, `openastrology-library` license = "LGPL-3.0 (free)*" but Swiss Ephemeris license = "Professional License from Astrodienst" (paid), with footnote "*Free to use under LGPL-3.0 if you own a Swiss Ephemeris professional license."
- FAQ: "If employees or clients access it via a network (web app, API), AGPL-3.0 requires you to provide the source code to users. For proprietary use, get a Swiss Ephemeris professional license and use this library under LGPL-3.0."

### Assessment (flagged, not a legal conclusion)
- **AGPL-3.0's network-use (SaaS) clause is the central risk.** For a closed-source commercial phong-thủy web backend that calls this library over a network to serve users, AGPL-3.0 (the default license if no Swiss Ephemeris professional license is purchased) would — on the library author's own restated understanding in LICENSING.md — require the *entire backend application* to be released as open source under AGPL-3.0. This is very likely incompatible with a proprietary commercial product.
- **The "escape hatch" (LGPL-3.0) is not free**: it requires purchasing a professional license directly from Astrodienst AG (third party, price/terms not in this repo, must be verified directly with Astrodienst). This is a real, external cost/dependency that must be independently confirmed — this repo cannot itself grant that right.
- **LEGAL REVIEW REQUIRED**: (1) whether AGPL's copyleft/network clause as described actually reaches "the entire application" as LICENSING.md's plain-English FAQ claims, (2) current Astrodienst AG Swiss Ephemeris professional license terms/cost, (3) whether the `sweph` binding itself (a separate npm package by a separate author, "Timotej Roiko") carries its own compatible/incompatible license — **not verified in this audit**, see §3.
- Copyright year in both license files reads "Copyright (C) 2026 Nikola Milenkovic" (an internal repo detail, unverified against real-world registration).

---

## 3. Dependencies

From `package.json` (full contents read):

| Package | Version (declared) | Type | Notes |
|---|---|---|---|
| `luxon` | `^3.6.1` | runtime | Timezone/DateTime handling. Installed: `3.7.2` (verified via `node_modules/luxon/package.json`). |
| `sweph` | `2.10.3-5` | runtime | Node N-API binding to the real Swiss Ephemeris C library, by Timotej Roiko (github.com/timotejroiko/sweph). Installed prebuilt binaries exist for `win32-x64`, `darwin-arm64`, `linux-arm64`, `linux-x64` under `node_modules/sweph/prebuilds/` — confirmed present in this environment, so no native compilation was required to run it here. |
| `@types/jest` | `^29.5.14` | dev | |
| `@types/luxon` | `^3.4.2` | dev | |
| `@types/node` | `^20.0.0` | dev | |
| `jest` | `^29.7.0` | dev | Test runner |
| `ts-jest` | `^29.1.0` | dev | |
| `tsup` | `^8.0.1` | dev | Build tool (installed 8.5.1) |
| `typescript` | `^5.9.3` | dev | |

**Astronomical engine**: This library does **not** implement its own astronomical math. It is a thin, well-organized wrapper over `sweph`, which itself binds the genuine Swiss Ephemeris (Astrodienst AG) native library. Confirmed by: (a) every calculator file imports `calc`, `calc_ut`, `houses`, `julday`, `set_sid_mode`, `get_ayanamsa`, `solcross_ut`, `mooncross_ut`, `revjul`, `constants` from `'sweph'`; (b) live execution produced the exact native Swiss Ephemeris warning string `"SwissEph file 'sepl_18.se1' not found in PATH ... using Moshier eph."` — this text is emitted by the underlying C library, not by this repo's TypeScript, which is direct proof of the dependency chain.

**Migration note (from README changelog, v1.1.0)**: the library previously used the `swisseph` npm package and migrated to `sweph` — "`sweph` is a modern N-API addon that is ABI-stable across Node.js versions and does not require recompilation on upgrades" and fixed a bug where `SEFLG_SIDEREAL` was previously the wrong value (64 instead of 65536). **LICENSING.md still refers to the dependency as "the `swisseph` package"** (stale/inconsistent with the actual current dependency, `sweph`) — worth flagging since the third-party licensing discussion in LICENSING.md is keyed to Swiss Ephemeris in general, not `sweph` specifically, and this audit did **not** verify `sweph`'s own license terms or its compatibility with the AGPL/LGPL dual-license story told by LICENSING.md. **UNKNOWN / NOT VERIFIED**: `sweph`'s own package license and whether it changes the licensing analysis in §2.

**Staleness**: Versions are all recent as of the stated authorship date (mid-2026 per git log, see §8). Whether `sweph`, `luxon`, `jest`, or `tsup` remain the current/maintained versions on the npm registry today is **UNKNOWN / NOT VERIFIED** (no live registry access performed in this audit).

**Ephemeris data files**: README explicitly states `.se1` ephemeris data files are **not bundled** with the npm package (licensing-driven exclusion) and must be supplied by the consumer; a `src/ephe/` directory is mentioned for local dev convenience but is `.gitignore`d (confirmed: `.gitignore` contains `# Ephe` / `src/ephe`) and was **absent** in this clone — confirmed by directory listing (`ls src/` shows no `ephe/` folder) and by the runtime error in §7.

---

## 4. Feature Table

| Feature | Supported | Implementation evidence (file:line) | Tested | Notes |
|---|---|---|---|---|
| **Western: planets Sun–Pluto** | Supported | `src/western-astrology-calculator.ts:17-31` (`PLANET_MAPPING`), SE codes 0–9 | Yes — `test/western/western-astrology-calculator.integration.test.ts` (golden values) | |
| **Western: Chiron** | Supported | `src/western-astrology-calculator.ts:28` (`chiron: 15 // SE_CHIRON`) | Yes | Requires `seas_*.se1` per README |
| **Western: North/South Node** | Supported | `src/western-astrology-calculator.ts:29,269-290` (south node derived as `north_node.longitude + 180`) | Yes | True Node (SE code 11), not Mean Node |
| **Western: Lilith** | Supported (Mean Black Moon Lilith) | `src/western-astrology-calculator.ts:30` (`lilith: 12 // SE_MEAN_APOG`) | Yes | Mean, not True/Osculating Lilith |
| **Western: asteroids (Ceres, Pallas, Juno, Vesta)** | NOT PRESENT | grep of `PLANET_MAPPING` shows only Sun–Pluto+Chiron+Nodes+Lilith | N/A | |
| **Western zodiac mode** | Tropical only | `src/western-astrology-calculator.ts:116-117` comment "do NOT set sidereal mode" + `calc(julianDay, planetId, constants.SEFLG_SPEED)` (no `SEFLG_SIDEREAL`) | Yes | |
| **Western house systems** | Placidus, Koch, Equal, Campanus, Meridian, Regiomontanus, Porphyrius, Morinus, Whole Sign | `src/western-astrology-calculator.ts:33-43` (`HOUSE_SYSTEM_MAPPING`, exact SE codes P/K/E/C/M/R/O/U/W) | Yes — `test/western/western-astrology-calculator.integration.test.ts` tests campanus/regiomontanus/wholehouse etc. | Default: `placidus` |
| **Western Ascendant/Descendant/MC/IC** | Supported | `src/western-astrology-calculator.ts:295-370` (`calculateHouses`); Dsc/IC derived as +180° from Asc/MC | Yes | |
| **Western Vertex** | NOT PRESENT | No mention of "vertex" anywhere in `src/` (grep negative) | N/A | |
| **Western aspects** | conjunction(0°), semi-sextile(30°), semi-square(45°), sextile(60°), quintile(72°), square(90°), trine(120°), sesquiquadrate(135°), biquintile(144°), quincunx(150°), opposition(180°) | `src/types/western.types.ts:27-68` (`WesternAspectType`, `WESTERN_ASPECT_ANGLES`) | Yes — `test/western/western-aspect-calculator.spec.ts` | Default orbs: conjunction/square/trine/opposition = 8°, sextile = 6°, quincunx = 3°, others (semi-sextile, semi-square, quintile, sesquiquadrate, biquintile) = 2° (`DEFAULT_WESTERN_ORBS`, same file lines 41-53); orbs overridable via constructor `orbs` option |
| **Applying/separating aspect logic** | Supported | `src/western-aspect-calculator.ts:81-109` (`isApplying`, uses relative planetary speed and signed longitude difference) | Yes | Heuristic approximation, not a full closest-approach solve |
| **Western dignities** | Domicile, Exaltation, Detriment, Fall | `src/western-astrology-calculator.ts:45-96` (`DOMICILE`, `EXALTATION`, `DETRIMENT`, `FALL` static tables) + `calculateDignity` at line 398 | Yes | Includes modern outer-planet rulerships (Uranus/Aquarius, Neptune/Pisces, Pluto/Scorpio); Chiron has no dignity table (omitted, "contested") |
| **Western retrograde detection** | Supported | `src/western-astrology-calculator.ts:257` — `isRetrograde: speed < 0` (velocity-sign check from SE `SEFLG_SPEED` result) | Yes | |
| **Chart patterns** | Grand Trine, T-Square, Grand Cross, Stellium, Yod | `src/chart-pattern-calculator.ts` (whole file; e.g. `detectGrandTrines` L38, `detectTSquares` L83, `detectGrandCrosses` L122, `detectStelliums` L168, `detectYods` L226) | Yes — `test/western/chart-pattern-calculator.spec.ts` | Purely geometric detection over the aspect list, no interpretation text |
| **Vedic: planets** | Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu (True Node based) | `src/vedic-astrology-calculator.ts:17-27` (`PLANET_MAPPING`); Ketu derived as Rahu+180° at L295-305 | Yes — `test/vedic/chart-calculator.integration.test.ts` | No Uranus/Neptune/Pluto/Chiron in the Vedic calculator (classical 9-graha model only) |
| **Vedic zodiac mode / ayanamsas** | Sidereal; Lahiri, Raman, Krishnamurti, Yukteshwar, JN Bhasin, Babylonian(Kugler1), True Citra, True Revati, True Pushya | `src/vedic-astrology-calculator.ts:42-52` (`AYANAMSA_MAPPING`, mapped to real `SE_SIDM_*` constants) | Partially — default (Lahiri) covered in integration tests; other ayanamsas NOT individually asserted in test files reviewed | Default: `lahiri` |
| **Vedic house systems** | Placidus, Koch, Equal, Campanus, Meridian, Regiomontanus, Porphyrius, Morinus, Whole Sign | `src/vedic-astrology-calculator.ts:54-64` (`HOUSE_SYSTEM_MAPPING`); special-cased whole-sign/equal math at L388-429 | Yes (equal, wholehouse tested; e.g. `chart-calculator.integration.test.ts:106`) | Default: `equal` |
| **Vedic aspects (Drishti)** | House-based special aspects: Mars(4,7,8), Jupiter(5,7,9), Saturn(3,7,10), Rahu/Ketu(5,7,9), all others(7 only) | `src/aspect-calculator.ts:12-22` (`VEDIC_ASPECTS`) | Yes — `test/vedic/aspect-calculator.spec.ts` (514 lines) | Also computes mutual reception (`getMutualReception`, L61) |
| **Vedic dignities** | Exalted, Debilitated, Own Sign, Neutral | `src/vedic-astrology-calculator.ts:482-504` (`calculatePlanetaryDignity`) | Yes | Sign-level only (no exact-exaltation-degree check in the main calculator; a *separate*, unused-by-calculators degree-precise version exists in `PlanetUtils.isExalted`/`isDebilitated`, `src/astrological-utils.ts:259-267`, used only by yoga/strength code) |
| **Vedic retrograde detection** | Supported | `src/vedic-astrology-calculator.ts:341` — velocity-sign check for normal planets; Rahu/Ketu hardcoded `true` always (traditional convention) | Yes — `test/vedic/chart-calculator.integration.test.ts:63-75` | |
| **Combustion** | Supported | `src/vedic-astrology-calculator.ts:29-40` (`COMBUSTION_DISTANCES`), `199-220` (`getCombustionInfo`), `514-521` (`isPlanetCombust`) | Yes — `test/vedic/chart-calculator.combustion.test.ts` (golden-style unit tests, quoted in §6) | Severity tiers (Mild/Moderate/Severe) by ratio of distance to combustion threshold — this is rule-like scoring logic, see §5 |
| **Divisional charts (Vargas)** | D1 (Rashi), D2 (Hora), D3 (Drekkana), D4, D5, D6, D7, D8, D9 (Navamsa), D10 (Dasamsa), D11, D12, D16, D20, D24, D27, D30 (Trimsamsa), D40, D45, D60 — **19 varga formulas implemented** (README's "16 major Vargas" undercounts what's actually coded) | `src/divisional-chart-calculator.ts:12-599` (`DIVISIONAL_CHARTS` config map, one hand-coded `formula` per varga) | Yes — one dedicated `*.integration.test.ts` file per varga in `test/vedic/` (D2 through D60, 18 files) with golden DMS values | Each formula houses use whole-sign only (`assignPlanetsToHouses`/`findHouseForPlanet`, L788-826); D40/D20/D60 integration tests **failed on live execution** due to Moshier-fallback precision drift (see §7) — the formulas themselves are exercised by tests, but exact-precision correctness could not be independently confirmed in this environment without real `.se1` files |
| **Nakshatra + Pada** | Supported, all 27 nakshatras | `src/astrological-utils.ts:112-195` (`NakshatraUtils`) | Yes | |
| **Dasha systems** | Vimshottari only (Maha Dasha + Antar Dasha, no Pratyantar) | `src/dasha-calculator.ts` (whole file); `VIMSHOTTARI_PERIODS` L6-16, `DASHA_SEQUENCE` L19-21 | Yes — `test/vedic/dasha-calculator.spec.ts`, `.integration.test.ts` | `DashaType` type in `src/types/vedic.types.ts:49` lists `'vimshottari' \| 'yogini' \| 'char' \| 'kalachakra'` but **only vimshottari has an implementing calculator** — Ashtottari, Yogini, Char, Kalachakra are CLAIMED (in the type union) BUT NOT IMPLEMENTED. Pratyantar Dasha explicitly noted as not calculated (`src/dasha-calculator.ts:156`, comment "Not calculating Pratyantar Dasha for now") |
| **Yogas** | Raja (Kendra-Trikona + Neecha Bhanga Raja), Dhana (2nd/11th lord connection, Guru-Shukra), Neecha Bhanga (debilitation cancellation), Panch Mahapurusha (Ruchaka/Bhadra/Hamsa/Malavya/Sasha), Arishta (Kendradhipati Dosha) | `src/yoga-calculator.ts` (whole file, 277 lines); hardcoded if/then logic, e.g. `calculateRajaYogas` L29-75 | Not directly unit-tested as a standalone file (no `yoga-calculator.spec.ts` found in `test/`) — yogas are exercised indirectly only via full-chart integration output, if at all | Hand-written if/else rule chains, not a data-driven rule table (see §5 for code excerpt). `getHouseLord`/`isKendraLord` use a **simplified fixed Aries=house1 mapping** (`src/yoga-calculator.ts:222-242`) rather than the chart's actual ascendant-based house-lord mapping — a known/commented simplification that likely produces incorrect Dhana/Arishta yoga results for any ascendant other than Aries |
| **Ashtakavarga** | Bhinna + Sarva Ashtakavarga | `src/ashtakavarga-calculator.ts` (343 lines); full binary rule table `ASHTAKAVARGA_RULES` L16-117 | Yes — `test/vedic/ashtakavarga-calculator.spec.ts` + `.integration.test.ts` | Data-driven (contribution-matrix rule table), not if/else — the most "rule-table-like" of the Vedic modules |
| **Transits / ingresses** | Supported (sign-ingress events only, not full transit-to-natal-aspect scanning) | `src/vedic-transit-calculator.ts`, `src/western-transit-calculator.ts` (both full files) | Yes — `test/vedic/vedic-transit-calculator.*.test.ts`, `test/western/western-transit-calculator.*.test.ts` | Uses exact `solcross_ut`/`mooncross_ut` for Sun/Moon, adaptive-step + bisection (to 1-second precision) for other bodies |
| **Synastry (2-chart compatibility)** | NOT PRESENT | No file, class, or type named synastry/compatibility found anywhere in `src/` | N/A | |
| **Progressions (secondary/solar arc)** | NOT PRESENT | No mention of "progression" anywhere in `src/` | N/A | |
| **Solar/Lunar Return charts** | NOT PRESENT | No mention of "return" chart logic anywhere in `src/` | N/A | |
| **Natural-language interpretation** | NOT PRESENT (type exists, unimplemented) | `ChartAnalysis` interface defined at `src/types/vedic.types.ts:165-190` (personality/career/relationships/health/spirituality text fields) but **never imported, constructed, or populated by any calculator** (confirmed via `grep -rn "ChartAnalysis" src/` → only the type declaration itself) | N/A | CLAIMED BUT NOT VERIFIED as a working feature — it is aspirational scaffolding only |

---

## 5. Calculation / Rule / Interpretation Layer Classification

The codebase cleanly separates into **two** of the three layers — calculation and rule — and contains **no interpretation layer** (no hardcoded natural-language astrological prose exists in `src/`).

**Layer 1 — Raw calculation (majority of the codebase).** Example, `src/western-astrology-calculator.ts:240-263`:
```ts
const longitude = result.data[0] || 0;
const latitude = result.data[1] || 0;
const speed = result.data[3] || 0;
const sign = ZodiacUtils.getSignFromLongitude(longitude);
const degree = ZodiacUtils.getDegreeInSign(longitude);
...
planets[planetName] = {
    name: planetName, longitude, latitude, sign, degree, degreeDMS, ...
    isRetrograde: speed < 0,
    dignity: this.calculateDignity(planetName, sign),
    ...
};
```
This is pure fact production: a planet's longitude, sign, retrograde state, computed directly from the Swiss Ephemeris return value with no astrological "meaning" attached beyond classification (sign/dignity name).

**Layer 2 — Rule logic (yoga/dignity/ashtakavarga/pattern detection).** Example, `src/yoga-calculator.ts:100-114` (Dhana Yoga if/then chain):
```ts
if (jupiterPos && venusPos && Math.abs(jupiterPos.longitude - venusPos.longitude) <= 10 &&
    (HouseUtils.isKendra(jupiterPos.house) || HouseUtils.isTrikona(jupiterPos.house))) {
    yogas.push({
        name: 'Guru-Shukra Dhana Yoga',
        type: 'Dhana',
        description: 'Jupiter and Venus conjunction in beneficial house creates wealth',
        planets: ['jupiter', 'venus'],
        houses: [jupiterPos.house],
        strength: 'Strong'
    });
}
```
Note the `description` field here ("...creates wealth") is a short factual/traditional-astrology label attached to a detected pattern, not a personalized interpretive narrative — it is closer to a rule-engine "finding name" than prose written for an end user. This is the clearest example of rule-based (if/then) logic in the codebase; contrast with the **data-driven** rule table in Ashtakavarga (`src/ashtakavarga-calculator.ts:16-117`, a static lookup matrix, not branching code) — both styles of "Layer 2" rule logic exist side by side.

Combustion severity scoring is also Layer-2 rule logic (a ratio-based scoring rule, not raw fact), `src/vedic-astrology-calculator.ts:211-217`:
```ts
if (isCombust && combustionDistance > 0) {
    const ratio = distance / combustionDistance;
    if (ratio <= 0.3) severity = 'Severe';
    else if (ratio <= 0.6) severity = 'Moderate';
    else severity = 'Mild';
}
```

**Layer 3 — Interpretation (natural-language "you are a natural leader" style text).** NOT PRESENT. Confirmed by reading every `src/*.ts` file in full and by `grep -rn "ChartAnalysis" src/`, which shows the only interpretation-shaped type (`ChartAnalysis`, with `personality.summary`, `career.suitableFields`, etc., `src/types/vedic.types.ts:165-190`) is declared but never used by any calculator class. There is no hardcoded prose string of the "you are ..." variety anywhere in `src/`.

**Implication for the commercial architecture goal**: this library is a good candidate purely as the **calculation layer** in a layered (calculation → rules → interpretation) architecture. Its own "rule" layer (yogas, ashtakavarga, combustion severity, dignities) is present but relatively thin, partly buggy/simplified (see house-lord simplification flagged in §4), and would likely need to be re-implemented or heavily extended for a production rules engine rather than reused as-is.

---

## 6. Test Audit

**NOT "NO TEST SUITE FOUND"** — a substantial test suite exists: 36 test files under `test/vedic/` (22 files) and `test/western/` (6 files), totaling 526 individual `it`/`test` cases as counted by a live `npm test` run (§7).

Tests are **golden-value / reference-number tests**, not mere smoke tests. Example, `test/vedic/chart-calculator.integration.test.ts:43-55`:
```ts
it('should calculate planet degrees correctly', async () => {
    const result = await calculator.calculateChart(mockBirthInfo);

    expect(result.planets.sun.degree).toBeWithinEpsilon(dms2def('00:36:05'), 0.1);
    expect(result.planets.moon.degree).toBeWithinEpsilon(dms2def('24:25:20'), 0.1);
    expect(result.planets.mars.degree).toBeWithinEpsilon(dms2def('17:27:50'), 0.1);
    ...
});
```
These compare computed planetary degrees (in DMS, converted to decimal) against specific hardcoded reference values with tight epsilon tolerances (typically 0.1°, sometimes tighter for house/ascendant assertions) — this is consistent with values having been generated from a real ephemeris run and hardcoded as regression fixtures, i.e. genuine golden-value testing, not "does it throw" smoke testing.

A second style of true unit test (no ephemeris dependency) also exists, e.g. `test/vedic/chart-calculator.combustion.test.ts:15-25`:
```ts
test('should identify Mars as combust when within 17 degrees of Sun', () => {
    const sunLongitude = 100; // 10° Leo
    const marsLongitude = 110; // 20° Leo (10° from Sun)
    const combustionInfo = calculator.getCombustionInfo('mars', marsLongitude, sunLongitude);
    expect(combustionInfo.isCombust).toBe(true);
    expect(combustionInfo.distance).toBe(10);
    expect(combustionInfo.combustionDistance).toBe(17);
    expect(combustionInfo.severity).toBe('Moderate'); // 10/17 = 58.8% - moderate
});
```

There is one test per divisional chart (`test/vedic/divisional-chart-calculator.d{2..60}.integration.test.ts`, 18 files), each with its own set of golden DMS values — a thorough per-varga regression net.

**Coverage gaps observed**: no standalone `yoga-calculator.spec.ts` (yoga detection logic is not directly unit-tested in the files reviewed); no test file for `ChartAnalysis` (consistent with it being unimplemented); ayanamsa options other than the Lahiri default are not individually golden-value tested in the files reviewed.

---

## 7. Execution Attempt Results

**Environment**: Windows, Node v24.18.1, npm 11.16.0, repo at `C:\ccaudit\repos\openastrology-library`.

1. **`npm install`** — succeeded (323 packages added, ~1 min). npm flagged (via its `allow-scripts` policy) that `sweph`'s native-addon build scripts (`preinstall`/`install`, which run `node-gyp-build`) were "not yet covered by allowScripts" — however a **prebuilt** native binary for `win32-x64` was already present at `node_modules/sweph/prebuilds/win32-x64/sweph.node` (prebuilds also exist for darwin-arm64, linux-arm64, linux-x64), so the native binding worked without needing to run those scripts or compile anything locally.

2. **`npm run build` (tsup)** — succeeded cleanly: `dist/index.js` (119.75 KB, CJS), `dist/index.mjs` (116.87 KB, ESM), `dist/index.d.ts` (27.38 KB) all generated without TypeScript errors. Full log:
   ```
   CJS dist\index.js     119.75 KB
   ESM dist\index.mjs     116.87 KB
   DTS dist\index.d.ts  27.38 KB
   ```

3. **Benchmark script execution** — wrote and ran a Node script (CommonJS, requiring the built `dist/index.js`) against the exact benchmark input: Birth Date 1985-03-12, Time 08:30, Lat 21.0285, Lon 105.8542, Timezone `Asia/Ho_Chi_Minh`. Actual real console output (unedited):

   **Vedic chart — succeeded** (ayanamsa: lahiri, houseSystem: wholehouse):
   ```
   === VEDIC CHART ===
   Ascendant: {"sign":"aries","degree":11.892280056931952,"degreeDMSFormatted":"11:53:32","nakshatra":"ashwini","nakshatraPada":4,"longitude":11.892280056931952}
   sun aquarius 27:46:30 house 11 retro false nakshatra purva_bhadrapada 3
   moon scorpio 06:21:20 house 8 retro false nakshatra anuradha 1
   mercury pisces 14:46:13 house 12 retro false nakshatra uttara_bhadrapada 4
   venus pisces 28:35:30 house 12 retro false nakshatra revati 4
   mars aries 04:03:32 house 1 retro false nakshatra ashwini 2
   jupiter capricorn 13:35:47 house 10 retro false nakshatra shravana 2
   saturn scorpio 04:27:43 house 8 retro true nakshatra anuradha 1
   rahu aries 26:18:48 house 1 retro true nakshatra bharani 4
   ketu libra 26:18:48 house 7 retro true nakshatra vishakha 2
   ```
   **Western chart — FAILED** (houseSystem: placidus):
   ```
   WESTERN ERROR: Western chart calculation failed: Failed to calculate position for sun: Failed to calculate sun position: SwissEph file 'sepl_18.se1' not found in PATH 'C:\ccaudit\repos\openastrology-library\dist/ephe\'
   using Moshier eph.;
   ```

**Root cause and an important, verified defect**: Per README, `.se1` ephemeris data files are intentionally excluded from the repo (`.gitignore` contains `src/ephe`) and were genuinely absent in this clone. When the files are missing, the underlying Swiss Ephemeris C library falls back to its lower-precision built-in **Moshier** analytical ephemeris and returns a non-fatal warning string in `result.error`. Reading the two calculators side by side shows they handle this warning **inconsistently**:
   - `src/vedic-astrology-calculator.ts:288-289` and `:307-308` only check `result.flag < 0` (a hard failure), never `result.error` — so the Moshier-fallback warning is silently ignored and the Vedic calculator returns a "successful" chart computed with reduced-precision ephemeris data, with no indication to the caller that file-based precision was not used.
   - `src/western-astrology-calculator.ts:238` explicitly checks `if (result.flag < 0 || result.error) throw ...` — so the identical Moshier-fallback condition is treated as fatal for the Western calculator, and the whole chart calculation throws.

   This was independently confirmed by running the full Jest suite (`npm test`) in the same environment (no `.se1` files present): **210 of 526 tests failed, 316 passed, 4 of 36 suites failed** (`d20`, `d40`, `d60` divisional-chart integration tests, and the Western integration test suite). The Western integration suite failed wholesale (every sub-test throws the same missing-ephemeris error), while most Vedic tests **passed** despite the same missing files, because the Vedic code path silently tolerates Moshier fallback — with occasional Moon-related precision-drift failures in the D20/D40/D60 divisional tests (e.g. `expected 16.529... to be within 0.36 of 16.891...`, a ~0.36° Moon-position drift attributable to Moshier vs. file-based-ephemeris precision differences, propagated and amplified through 20×/40×/60× divisional multiplication).

   Separately, the transit calculators (`src/vedic-transit-calculator.ts`, `src/western-transit-calculator.ts`) perform **no flag or error checking at all** on `calc_ut()` results (confirmed by reading `getLon()` in both files, which returns `calc_ut(jd, seId, TROPICAL_FLAGS).data[0]` directly) — consistent with their integration tests passing even without ephemeris files present.

**Conclusion for §7**: Execution **succeeded** for the Vedic calculator (real numeric output obtained and quoted above, computed via Moshier fallback rather than file-based Swiss Ephemeris — so treat the specific degree values above as indicative, not to be trusted to arc-second precision). Execution of the Western calculator, and of the full test suite, is **NOT VERIFIED BY EXECUTION at full precision** in this environment specifically because the required `.se1` Swiss Ephemeris data files (excluded from the repo per its own licensing model) were not present and were not downloaded as part of this audit (downloading additional third-party binary data files was out of scope for this research pass). With real `.se1` files supplied, the code strongly suggests (build succeeds, 316/526 tests already pass without them, and the sole Western failure mode is the file-not-found guard) that both calculators and the full test suite would run to completion with file-based Swiss Ephemeris precision.

---

## 8. Maintenance

- `git rev-parse --is-shallow-repository` → `true`. This is a **shallow clone (depth-limited)**; full project history is not available in this checkout.
- `git log --oneline | wc -l` → **1** (only one commit visible, consistent with the shallow clone).
- `git log -1` →
  ```
  commit 6f145d28255332977d5c9c18aee023f16b15d4a4
  Author: Nikola Milenkovic <nikola@hunchads.com>
  Date:   Fri Jun 19 13:19:28 2026 +0200

      Version 1.1.1 - dignities are now typed as VedicDignity and WesternDignity
  ```
- No `CHANGELOG.md` file exists at the top level or in any nested folder (confirmed via directory listing); however, README.md contains an inline "## Changelog" section documenting versions 1.0.0 → 1.1.1 with real technical detail (e.g., the `swisseph`→`sweph` migration, the `SEFLG_SIDEREAL` bug fix, new transit calculators, dignity type changes) — this reads as a genuinely maintained, actively-developed project rather than a one-off dump, but this audit **cannot verify commit cadence, contributor count, or issue/PR activity** since only a single shallow commit is available and no live GitHub API/web check was performed.
- No CI config (no `.github/workflows`, `.travis.yml`, `.circleci` — `.npmignore` references these paths for exclusion from the npm package but none were found present in the working tree during the `find`/`ls` exploration of this repo).
- npm version badge / README badges: `![License: AGPL v3]` and `![npm version]` (badge.fury.io, dynamic — actual live npm registry version **UNKNOWN / NOT VERIFIED**, not checked against a live registry in this audit).

**Classification: EXPERIMENTAL / EARLY-STAGE, technically STABLE-LOOKING.** Justification: the codebase and test suite are far more developed than a toy/proof-of-concept (526 tests, 19 divisional chart formulas, multiple ayanamsas/house systems, real changelog history through v1.1.1), which argues against "Experimental." But with only one commit visible (shallow clone artifact, not necessarily reflecting true history — **UNKNOWN / NOT VERIFIED** whether the real repo has a longer history), no CI, no visible community activity (stars/forks/issues not checked), and a very recent-looking version history (three point releases: 1.0.0 → 1.0.1 → 1.1.0 → 1.1.1, per README changelog) — this looks like a **single-maintainer, pre-1.0-mentality library that is functionally substantial but has not yet demonstrated multi-release longevity or community adoption**. Recommend the label **STABLE BUT LOW ACTIVITY / YOUNG** pending direct verification of the live GitHub repo's actual commit history, issue tracker, and download counts (none of which were accessible from this local, shallow, offline clone).

---

## 9. Code Quality Scores

| Dimension | Score (0-10) | Justification |
|---|---|---|
| **Architecture / Modularity** | 7 | Clean separation into single-responsibility calculator classes (`AspectCalculator`, `WesternAspectCalculator`, `ChartPatternCalculator`, `DashaCalculator`, `YogaCalculator`, `AshtakavargaCalculator`, `DivisionalChartCalculator`, two transit calculators) all composed by two top-level facades (`VedicAstrologyCalculator`, `WesternAstrologyCalculator`, see `src/index.ts:1-22` for the public export surface). Deduction: significant near-duplication between the Vedic and Western calculators (`validateBirthInfo`, `calculateJulianDay`, `findHouseForPlanet`, house-system mapping tables are almost line-for-line copies across `src/vedic-astrology-calculator.ts` and `src/western-astrology-calculator.ts`) that could be shared/refactored. |
| **Typing quality** | 8 | `tsconfig.json` has `"strict": true`. Discriminated union types are used well (`WesternDignity`, `VedicDignity`, `WesternAspectType`, `Planet`, `ZodiacSign` as string-literal unions rather than loose `string`, per the README's own v1.1.1 changelog entry which explicitly replaced untyped `string` dignity fields with these literal types). `any` usage exists but is contained mostly to type-erasure casts needed for `Record<Planet, X>` object-building patterns (e.g. `{} as any` in `calculatePlanetaryPositions`, `src/vedic-astrology-calculator.ts:285`) rather than pervasive loose typing. Deduction: a few `Partial<Record<...>>` and `as any` escape hatches, and the `HouseInfo.lord: string` field is deliberately loosely typed as `string` (comment: "to allow both Vedic and Western planets", `src/types/common.types.ts:41`) rather than a proper union. |
| **Documentation** | 5 | Sparse JSDoc: only short one-line `/** ... */` comments on public methods of the two main calculator classes (e.g. `src/vedic-astrology-calculator.ts:76-78`, `:122-126`) — no `@param`/`@returns` tags, no documented edge cases or units in most function signatures. Internal/private helper methods are largely uncommented aside from occasional inline `//` notes explaining a formula (the divisional-chart formulas in particular have decent inline commentary explaining the traditional Vedic rule being encoded, e.g. `src/divisional-chart-calculator.ts:56-59`). External documentation is comparatively strong: two dedicated `DOCS_VEDIC.md` (20KB) and `DOCS_WESTERN.md` (19KB) files plus a substantial README exist, but content correctness against the actual code was only partially cross-checked in this audit (e.g. the README's "16 major Vargas" underclaims the 19 actually implemented — see §4). |
| **Separation of concerns (calc / rule / interpretation)** | 7 | Calculation and rule layers are cleanly separated into different files/classes (see §5); no interpretation layer exists at all (arguably correct separation by omission, though it also means "0 out of 3 layers built" if interpretation was expected). Deduction: rule logic occasionally leaks into what should be pure calculation flow (e.g. `calculateDignity` and `isPlanetCombust` are computed inline inside the position-building loop in both main calculators rather than delegated to a separate rules module, unlike yogas/ashtakavarga which are properly modularized). |
    | **Extensibility** | 6 | The divisional-chart system (`DIVISIONAL_CHARTS` config map of `{name, divisor, formula}`) is a genuinely good, easily-extensible pattern — adding a new varga is a config-map entry. The Ashtakavarga rule table is similarly data-driven and extensible. Deduction: the Yoga engine is a fixed sequence of hardcoded private methods (`calculateRajaYogas`, `calculateDhanaYogas`, ...) called in a fixed order from `calculateYogas` (`src/yoga-calculator.ts:5-27`) — adding a new yoga type requires editing this class directly rather than registering a rule, and the house-lord-determination helper (`getHouseLord`, `src/yoga-calculator.ts:222-242`) is explicitly commented as "a simplified version" using a fixed Aries=1st-house mapping rather than the actual ascendant-relative house-lord mapping — this is a real correctness bug for any ascendant other than Aries, and would need to be fixed before building a rules engine on top of the yoga module. |
| **Error handling** | 5 | Input validation is present and reasonable (`validateBirthInfo` in both calculators checks date format via regex, date range 1800–now, time format, lat/lon bounds — `src/western-astrology-calculator.ts:186-209`, `src/vedic-astrology-calculator.ts:231-257`) and errors are wrapped with contextual messages (`Chart calculation failed: ${error.message}`). However, execution testing surfaced a **real, verified inconsistency**: the Vedic calculator does not check `result.error` from the Swiss Ephemeris binding (only `result.flag < 0`), silently accepting a lower-precision Moshier-ephemeris fallback with no warning surfaced to the caller, while the Western calculator does check `result.error` and throws in the identical scenario (`src/vedic-astrology-calculator.ts:288-289,307-308` vs. `src/western-astrology-calculator.ts:238` — see §7 for the reproduction). The two transit calculators perform **no error/flag checking at all** on ephemeris calls (`getLon()` in both transit files). This means the same underlying condition (missing ephemeris data) produces three different behaviors across four modules in the same codebase — a genuine defect for production reliability, since a misconfigured deployment (wrong `ephePath`, missing files) could silently ship reduced-precision or plain wrong data for Vedic charts and transits while only failing loudly for Western charts. |

---

## 10. Security Notes

- **No `eval`, `new Function()`, `child_process`, or `exec()` usage anywhere in `src/`** (confirmed via `grep -rn "eval(\|new Function\|child_process\|exec(" src/` → no matches).
- **No network calls** in `src/` — no `fetch`, `axios`, `http.request`/`https.request`, or `require('http'/'https')` found (confirmed via grep, no matches). The library is fully offline/local-computation once ephemeris files are supplied.
- **No filesystem access from the library's own TypeScript code** — no `fs.*`, `readFileSync`/`writeFileSync` calls in `src/` (confirmed via grep, no matches); the only filesystem interaction is indirect, via `set_ephe_path()` passed through to the native `sweph`/Swiss Ephemeris binding, which itself reads `.se1` files from that path internally (outside this repo's own code, inside the native addon).
- **User-supplied birth data validation**: `dateOfBirth` is checked against a strict `^\d{4}-\d{2}-\d{2}$` regex then re-parsed with `new Date(...)` and range-checked (1800 ≤ date ≤ now) (`src/vedic-astrology-calculator.ts:235-244`, `src/western-astrology-calculator.ts:190-199`); `timeOfBirth` checked against `^([01]?[0-9]|2[0-3]):[0-5][0-9]$`; latitude/longitude checked as `typeof === 'number'` and range-bounded (-90..90, -180..180). This is reasonable basic input sanitization and blocks the most obvious malformed-input and injection-shaped strings before they reach any date-construction or ephemeris call — no string concatenation into any executed/interpreted context was found, so classic injection (SQL/command/template injection) is **not applicable** given the library does no I/O of that kind.
- **`timezone` field is NOT validated** before being passed straight to `DateTime.fromObject(..., { zone: birthInfo.timezone || 'UTC' })` (Luxon) in both calculators (`src/vedic-astrology-calculator.ts:271-274`, `src/western-astrology-calculator.ts:222`) — an invalid/garbage timezone string is handled by Luxon internally (Luxon returns an "invalid DateTime" rather than throwing), but this library does **not** check `dt.isValid` after the conversion before proceeding to compute a Julian Day from what could be `NaN`/invalid date components — this is a real, if low-severity, robustness gap: malformed `timezone` input from an untrusted user (e.g. a web form) could silently propagate `NaN`s into ephemeris calculations rather than being rejected with a clear validation error. **Recommend flagging this to the eventual product's own input-validation layer** — do not rely on this library to reject bad timezone strings.
- **`name`, `location`, and `gender` fields on `BirthInfo`** (`src/types/common.types.ts:20-28`) are untyped free strings that are never validated, sanitized, or used in any computation observed in `src/` — they appear to be pure pass-through metadata fields (not used in any calculation path found), so they present no injection surface within this library itself, but any consuming application must not assume this library sanitizes them for safe storage/display (e.g. HTML-escaping for a web UI is the consuming application's responsibility, not this library's).
- No use of `Math.random()` or any other non-cryptographic randomness in a security-sensitive context was found (not applicable — no security-relevant randomness needed for deterministic astronomical calculation).
- Overall: **low attack surface**. This is a pure, synchronous, offline computation library with no dynamic code execution, no network I/O, and only indirect (native-addon-mediated) file I/O. The main practical risk for production use with untrusted input is the unvalidated-timezone gap noted above, plus the silent-precision-degradation-on-missing-files behavior noted in §7/§9, which is a data-integrity/reliability concern rather than a classic security vulnerability.

---

## 11. Tier Recommendation

**Tier B — Reference implementation, with required legal gating before commercial adoption.**

Justification:
- It is **not Tier A (Foundation)** because of the unresolved AGPL/LGPL licensing dependency on a paid third-party Swiss Ephemeris professional license (§2) — a foundation-tier library for a commercial closed-source SaaS product needs unambiguous, verified commercial-use clearance, which this repo cannot provide on its own; and because of the verified error-handling inconsistency across calculators (§7/§9) that would need to be fixed or worked around before trusting it as a production foundation, plus real formula-correctness gaps identified in the Yoga engine's house-lord simplification (§4/§9).
- It clears the bar for **Tier B (Reference)** because: it wraps the industry-standard Swiss Ephemeris (the same engine most professional astrology software is built on) rather than a home-grown approximation; it has a genuinely broad, well-organized calculation surface (both Western and Vedic, 19 divisional charts, multiple house systems and ayanamsas, dedicated transit ingress calculators); its test suite uses real golden reference values rather than smoke tests, giving confidence in the *general* correctness of the core sign/degree/house math (subject to the caveat that this audit could not verify full-precision, `.se1`-file-backed accuracy — only Moshier-fallback accuracy — due to the missing ephemeris data files); and its clean layering (calculation vs. rule vs. absent-interpretation) makes it genuinely useful as a **study reference and a source of verified sign/degree/dignity/aspect/nakshatra/varga formulas** to inform or validate the design of a separate, purpose-built commercial calculation engine — even if this exact codebase is not directly embedded into the product.
- It is explicitly **not Tier D/E**: this is not an experimental toy or an abandoned/broken project — it is functional, builds cleanly, computes real (execution-verified) planetary positions, and has a real (if thin, single-maintainer) maintenance trail.

**Recommended next steps before any further reliance on this repo**: (1) LEGAL REVIEW of the AGPL/LGPL/Swiss-Ephemeris-professional-license chain against the specific commercial deployment plan; (2) verify `sweph`'s own package license; (3) obtain the actual `.se1` Swiss Ephemeris files and re-run the full test suite and this benchmark to confirm full-precision numeric correctness (this audit only confirmed Moshier-fallback-precision correctness); (4) if any part of this codebase's logic (e.g. the divisional chart formulas or Ashtakavarga rule table) is reused or reimplemented, independently fix the Vedic/Western error-handling inconsistency and the Yoga-engine house-lord simplification noted in §4/§9 rather than porting them as-is.
