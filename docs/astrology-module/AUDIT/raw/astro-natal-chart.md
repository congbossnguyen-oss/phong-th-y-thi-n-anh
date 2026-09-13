# Source-Code Audit: `dynamicsAlex/astro-natal-chart`

Repo location audited: `C:\ccaudit\repos\astro-natal-chart` (local clone, read-only)

---

## 1. Summary Verdict

This is **not a service, library, or product component** — it is a **"Claude Skill" / OpenClaw skill package** (confirmed: `SKILL.md` frontmatter, `_meta.json` with `ownerId`/`slug`/`publishedAt`, `.clawhub/origin.json` pointing at the ClawHub skill registry, `openclaw.requires.bins: [python3]` metadata). It is a 3-script CLI utility meant to be invoked by an AI coding/chat agent (Claude via OpenClaw), not a standalone app or HTTP API. Technically it does what it claims: it computes a real Swiss-Ephemeris natal chart (confirmed by successful execution) and renders a PNG wheel via Pillow. Architecturally, its "interpretation" layer is a **generic static lookup dictionary** (per-house, per-planet, per-sign, per-aspect-*type* text, not per-combination rules), and its one genuinely AI-driven feature — the `--conclusion` flag — is an explicit, SKILL.md-documented **Chart → raw JSON → LLM free-reasoning** workflow with no rules layer gating what the AI concludes. There is no license file (a "License: MIT" line only appears as an unlicensed claim inside README.md prose, not as an actual LICENSE grant), no test suite, no dependency manifest, a single squashed git commit despite a 20+ version CHANGELOG, and one confirmed-by-execution bug (a hardcoded developer-machine output path in `draw_wheel.py`) that makes the renderer fail out-of-the-box on any machine other than the original author's. For the stated Vietnamese phong-thuy commercial project, this repo is useful only as **reference/inspiration for the Swiss Ephemeris calculation plumbing and wheel-rendering approach** — it is not reusable as-is (no license, no Vietnam/Hanoi city support, hardcoded path, Windows/Python-3.14-only binary) and it does not demonstrate the kind of deterministic Chart→Factors→Rules→Interpretation pipeline that a serious commercial astrology engine needs.

---

## 2. License

**NO LICENSE FILE EXISTS IN THE REPOSITORY.** Confirmed by directory listing of the repo root (`CHANGELOG.md, README.md, SKILL.md, _meta.json, .gitignore, .clawhub/origin.json, scripts/`) — no `LICENSE`, `LICENSE.md`, `LICENSE.txt`, or `COPYING` file anywhere, including inside `scripts/`.

Secondary sources checked:
- `_meta.json` — no `license` field (only `ownerId`, `slug`, `version`, `publishedAt`).
- `SKILL.md` frontmatter — no license field (`metadata.openclaw` only has `requires`, `emoji`, `homepage`).
- `CHANGELOG.md` — no license mention.
- `README.md` — **does** contain a bare, unqualified claim at the very end:
  ```
  ## License

  MIT
  ```
  (README.md, lines 278–280)

**Assessment:** A one-line "MIT" claim in a README, with no actual `LICENSE`/`LICENSE.txt` file, no SPDX header in any source file, and no license field in the package metadata (`_meta.json`), is weak and legally ambiguous evidence of licensing intent. It is better than nothing, but it does not constitute a binding, verifiable open-source grant a company can safely rely on for redistribution or commercial embedding — there's no way to confirm the claim is authoritative, current, or was ever intended to cover the compiled `.pyd` binary and bundled fonts (whose own licenses are entirely unaddressed — `segoeuisl.ttf`/`seguisym.ttf` are Microsoft-licensed Segoe UI fonts, almost certainly **not** relicensable under MIT by this repo's author at all).

**LEGAL REVIEW REQUIRED.** Recommendation: treat this repo as **effectively unlicensed for commercial reuse** until the author is contacted directly to (a) confirm MIT intent in writing / add a real LICENSE file, and (b) clarify the licensing status of the bundled Microsoft fonts and the `pyswisseph`/Swiss Ephemeris binary (Swiss Ephemeris itself is AGPL/commercial dual-licensed upstream by Astrodienst — bundling a compiled `.pyd` of it does not on its own resolve AGPL obligations for a commercial product).

---

## 3. Dependencies

No `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile`, or any other dependency manifest exists anywhere in the repo (confirmed via recursive search). Dependencies are inferable only from import statements:

| Script | Imports | Source |
|---|---|---|
| `natal_chart_swe.py` | `math, io, os, sys, importlib.util, shutil` (stdlib) + dynamically-loaded `swisseph` (bundled `.pyd`/`.pyd.dat`) | lines 15–60 |
| `draw_wheel.py` | `json, math, os, subprocess, sys, argparse, shutil` (stdlib), `collections.Counter`, `interp_data` (local module), `PIL` (`Image, ImageDraw, ImageFont`) | lines 1–14 |
| `interp_data.py` | none (pure data module) | whole file |

- **Astronomical backend**: Confirmed to be **pyswisseph** — `natal_chart_swe.py` calls `swe.calc_ut()`, `swe.houses_ex()`/`swe.houses()`, `swe.julday()`, `swe.__version__`, `swe.SUN`/`swe.MOON`/etc., `swe.FLG_SWIEPH`, `swe.FLG_SPEED` (lines 213–226, 260–261, 284), which is the standard pyswisseph API surface. The module is loaded from a bundled compiled binary `swisseph.cp314-win_amd64.pyd` (and a `.pyd.dat`-renamed duplicate used for ClawHub packaging, since ClawHub reportedly strips `.pyd`/`.ttf` extensions — see CHANGELOG v3.10.0/v2.1.0 and the loader logic at lines 20–58) rather than from a pip-installed `pyswisseph` package. SKILL.md explicitly states the version as **pyswisseph 2.10.3.2**.
- **Rendering backend**: **Pillow (PIL)** — confirmed via `from PIL import Image, ImageDraw, ImageFont` (draw_wheel.py line 11), with an auto-install fallback (`pip install pillow`) at lines 12–14 if PIL is missing. SKILL.md specifies Pillow 12.x.
- **LLM/AI SDK usage**: **NONE.** Grep of both `.py` files for `openai`, `anthropic`, or any HTTP/LLM client library found no matches. There is no network call, no API client, and no LLM invocation anywhere in the Python code. The "AI" in this pipeline is entirely external — it is the calling agent (e.g., Claude via OpenClaw) that is expected to read the JSON output and write a conclusion, per SKILL.md's documented workflow (see Section 5). This confirms the preliminary hypothesis: the repo provides no interpretation intelligence of its own beyond a static text dictionary; any LLM reasoning happens outside these scripts entirely.
- **Portability**: `swisseph.cp314-win_amd64.pyd` is a **compiled Windows x64 binary built specifically for the CPython 3.14 ABI** (`cp314` tag). This is confirmed by the filename and by SKILL.md's explicit requirement table (`Python 3.14.x`, `Microsoft Visual C++ Redistributable 2015–2022 x64`). **This will not load on Linux, macOS, or any other Python version (3.10–3.13, 3.15+) without recompiling pyswisseph from source for that platform/ABI.** This is a hard portability blocker for any non-Windows or non-3.14 deployment target (e.g., a typical Linux-hosted production web backend for a Vietnamese website would need to install `pyswisseph` via pip/source instead of using this bundled binary).

---

## 4. Calculation Feature Table

| Feature | Status | Citation |
|---|---|---|
| Planets (Sun–Pluto, 10 bodies) | **SUPPORTED** | `natal_chart_swe.py` `PLANET_CONFIG` (lines 71–82), computed via `swe.calc_ut()` in `calc_all_planets()` (lines 213–218) |
| Houses — Placidus system | **SUPPORTED** | `calc_houses()` calls `swe.houses_ex(jd, lat, lon, b'P', swe.FLG_SWIEPH)` with fallback to `swe.houses(jd, lat, lon, b'P')` (lines 221–226); `b'P'` = Placidus in pyswisseph's house-system code |
| Other house systems (Koch, Whole Sign, Equal, etc.) | **NOT PRESENT** | Hardcoded to `b'P'`; no CLI flag or code path selects any other system |
| Zodiac type — Tropical | **SUPPORTED (default)** | No `swe.set_sid_mode()` call and no `FLG_SIDEREAL` flag anywhere in the file — pyswisseph defaults to tropical zodiac when sidereal mode is not explicitly set, and the sign-degree math (`deg_to_sign`, `zod()`) is plain 0–360° tropical division into 12×30° signs |
| Sidereal zodiac / ayanamsha | **NOT PRESENT** | No sidereal mode set anywhere |
| Aspects (8 types: conj/opp/trine/square/sextile/semisextile/semisquare/quincunx) with fixed orbs | **SUPPORTED** | `ASPECTS` dict with per-type orbs (lines 84–93) and `calc_aspects()` (lines 229–247) doing pairwise longitude-difference matching against each aspect angle within orb |
| Retrograde detection | **SUPPORTED** | `xx[3] < 0` (velocity/speed sign) in `calc_all_planets()` (line 217), via `swe.FLG_SPEED` |
| ASC / MC | **SUPPORTED** | Returned from `swe.houses_ex()`/`houses()` as `ascmc[0]`/`ascmc[2]` (line 226) |
| Planet-to-house assignment | **SUPPORTED** | Manual cusp-range containment loop in `calc_natal_chart()` (lines 267–282) |
| Chart wheel drawing/rendering (PNG) | **SUPPORTED** | `draw_wheel.py` — full Pillow-based renderer: sign sectors (lines 226–239 via `draw.polygon`), house cusp lines (251–258), ASC/MC lines (260–264), planet markers (268–273), aspect lines (275–278), all confirmed by successful local execution (Section 7) |
| Stellium / dominant-element detection | **SUPPORTED (heuristic, not core ephemeris)** | `Counter`-based sign/house grouping ≥3 planets (draw_wheel.py lines 470–482, 650–664); element tally (lines 639–647) |
| City/timezone geocoding | **PARTIALLY SUPPORTED — hardcoded lookup table only** | `CITY_DB` (lines 95–164) is a static dict of ~65 mostly Russian/CIS/major-world cities keyed by lowercase Russian-language city names, with a matching `TZ_OFFSETS` dict (lines 166–184) of fixed UTC offsets (no DST/historical-offset handling). **No geocoding API, no timezone database (no `pytz`/`zoneinfo` usage despite storing IANA-style tz names as strings), no support for arbitrary lat/lon input via CLI.** **Hanoi, Vietnam is NOT in `CITY_DB`** — confirmed by execution (Section 7): running the benchmark input fails with `Город 'Hanoi' не найден в базе данных` ("City not found in database"). This is a material limitation for the stated Vietnamese use case. |
| Direct lat/lon/timezone CLI input (bypassing city DB) | **NOT PRESENT** | `calc_natal_chart()` signature only takes `(date_str, time_str, city_name)`; there is no code path to supply raw coordinates and offset directly from the command line |
| Bilingual output (RU/EN) | **SUPPORTED** | `--lang ru/en` flag in `draw_wheel.py` (line 25), toggling between `_RU`/`_EN` dictionaries throughout |
| Vietnamese language support | **NOT PRESENT** | Only RU/EN string tables exist anywhere in the codebase |

---

## 5. AI/Interpretation Architecture Analysis (KEY SECTION)

### 5.1 Actual data flow (traced from code)

```
CLI args (date, time, city)
   → natal_chart_swe.py: calc_natal_chart()
       → swe.calc_ut()          [planets: lon, speed, retro]
       → swe.houses_ex()        [12 house cusps, ASC, MC — Placidus]
       → calc_aspects()         [deterministic pairwise angle-match → aspects list with type + orb]
       → calc_natal_chart() returns a single dict: planets, houses, asc, mc, aspects, planet_houses
   → (--json flag) → JSON dump of the above dict to stdout
   → draw_wheel.py: subprocess.run(['natal_chart_swe.py', ..., '--json']) → json.loads(res.stdout)
       → merges chart JSON with interp_data.py's static text tables (HOUSE_TEXTS_*, PLANET_MEANING_*,
         SIGN_KEYWORDS_*, ASPECT_MEANING_*) purely by dict/list lookup keyed on planet name / house
         index / aspect type / sign abbreviation
       → renders wheel + info panel + interpretation panel as one PNG (Pillow)
       → OPTIONAL: if --conclusion FILE is given, reads that file's raw text verbatim and drops it,
         unmodified, into a "CONCLUSION"/"ЗАКЛЮЧЕНИЕ" block at the bottom of the interpretation panel
         (lines 729–763) — draw_wheel.py does not generate, validate, or process this text in any way;
         it just paints whatever string is in the file.
```

### 5.2 Is there a structured "Factors" extraction step?

**Yes, partially.** `calc_natal_chart()` (`natal_chart_swe.py` lines 250–297) does produce a genuinely structured, deterministic set of astrological facts before any text is generated: planet longitude/speed/retrograde flags, house cusps, ASC/MC, planet→house mapping, and a **pre-computed aspects list with symbolic type and numeric orb** (e.g. `{"p1": "Mars", "p2": "Saturn", "type": "quincunx", "orb": 0.4}` — confirmed in the actual execution output in Section 7). This is a real Factors layer, not raw ephemeris dumped straight to a human/LLM. It is exposed cleanly via `--json`.

### 5.3 Is there a genuine Rules layer independent of any LLM?

**Weak/generic — a static per-category lookup dictionary, not a per-combination rules engine.** `interp_data.py` (read in full, 208 lines) contains four dictionaries/lists:
- `HOUSE_TEXTS_RU`/`HOUSE_TEXTS_EN` — a fixed 3-sentence generic description **per house number** (1–12), independent of what's actually in that house for a given chart (e.g. House I text: *"The first house defines the person's external appearance, behavior in new situations, defense and adaptation strategies."* — interp_data.py lines 68–72). This text is identical for every chart; only the *fact* of which planets fall in the house changes.
- `PLANET_MEANING_RU`/`PLANET_MEANING_EN` — one fixed sentence **per planet** (e.g. `"Mars":"energy and drive, ability to act and achieve goals, assertiveness"`, line 148). Same generic text regardless of the planet's sign/house/aspects.
- `SIGN_KEYWORDS_RU`/`SIGN_KEYWORDS_EN` — three keywords **per zodiac sign** (e.g. `"AR":"initiative, energy, impulsiveness"`, line 172).
- `ASPECT_MEANING_RU`/`ASPECT_MEANING_EN` — one sentence **per aspect type** (8 total), e.g. `"square":"Square: internal tension, challenge to develop through overcoming"` (line 202) — this is the meaning of *any* square aspect, not specific to which two planets are square.

This is **exactly the "weak" case the audit brief called out**: a static dictionary of generic planet-in-sign/house/aspect-type meanings, concatenated by `draw_wheel.py` at render time (e.g. `draw_interp_section()` calls, lines 554–718, and the aspect-line assembly at lines 453–465: `"%s %s %s%s — %s" % (p1n, asp_sym, p2n, orb_s, a_mean)`). **There is no per-combination rule** such as "IF Mars square Saturn AND Mars in Aries THEN [specific meaning]" — the aspect text is the same generic "Square: internal tension..." sentence no matter which two planets form the square. It is deterministic template assembly, not an interpretive rules engine in the sense of mapping specific factor *combinations* to specific themes.

### 5.4 What does SKILL.md instruct the calling AI to do? (verbatim quotes)

SKILL.md (read in full, 510 lines) documents an explicit, three-step workflow for "OpenClaw agents" that is a textbook **Chart → LLM** pattern for the one AI-touching feature in the whole package:

> **"AI Conclusion workflow (for OpenClaw agents):**
> **Step 1**: `python scripts/natal_chart_swe.py <date> <time> <city> --json`
> **Step 2**: AI analyzes JSON and writes conclusion to a file
> **Step 3**: `python scripts/draw_wheel.py <date> <time> <city> --lang ru --name "Name" --conclusion <file>`"
> (SKILL.md, lines 326–330)

And in the changelog section of the same file:

> **"3-phase workflow for OpenClaw agent: (1) `natal_chart_swe.py --json` → (2) AI generates conclusion → (3) `draw_wheel.py ... --conclusion file.txt`"**
> (SKILL.md, line 390, under the v4.0.0/v4.3.0 changelog entry)

SKILL.md also contains an "Interpretation Guidelines" section that is addressed directly to whichever AI is using this skill (not to the Python code — there is no corresponding Python function that implements these guidelines as rules):

> **"When interpreting, consider:
> 1. Sun — core personality
> 2. Moon — emotional nature
> 3. Ascendant — mask, first impression
> 4. MC — career aspirations
> 5. Stelliums (3+ planets in one sign/house)
> 6. Retrograde planets — energy turned inward
> 7. Major aspects — personality dynamics
> 8. Dominant elements (fire, earth, air, water)"**
> (SKILL.md, lines 276–286)

This is a **prompt-style checklist for the AI's own free reasoning**, not a rules table the AI is told to look up. Nowhere in SKILL.md is the AI instructed to consult `interp_data.py`'s dictionaries, cite a specific rule, or restrict itself to any deterministic mapping — it is told to "analyze JSON and write conclusion," full stop. The JSON it analyzes is the Factors layer from Section 5.2 (structured planet/house/aspect data), so this is not the *weakest* possible case ("hand the AI raw unstructured chart dump") — the AI does get pre-computed aspects with type+orb rather than needing to compute aspects itself — but the actual astrological *interpretation reasoning* (what a Mars-square-Saturn quincunx conjunction pattern *means* for this specific person) is left entirely to the LLM's own judgment, unconstrained by any rules layer. SKILL.md's zodiac-sign/planet/house keyword glossaries (lines 233–274, essentially duplicating `interp_data.py`'s content in the skill doc itself) function as reference material the AI *could* draw on, but nothing in the code or SKILL.md text enforces that the AI actually uses them, cites them, or is limited to them.

### 5.5 Explainability / evidence / citation mechanism

**NOT PRESENT.** The `--conclusion` block is opaque free text read verbatim from a file (`draw_wheel.py` lines 730–736: `with open(args.conclusion, "r", encoding="utf-8") as cf: conclusion_text = cf.read().strip()`) and rendered with no structure, no linkage back to specific facts, no citations, and no way to trace any sentence in the AI's conclusion back to a specific rule or placement. The static (non-AI) interpretation text, by contrast, *is* traceably generated (each sentence can be traced to a specific dict lookup by planet/house/sign/aspect-type key), but that traceability is by virtue of it being a fixed template, not an evidence/citation feature — there's no metadata output connecting "this sentence" to "this rule ID + this factor."

### 5.6 Deterministic or probabilistic? Confidence scoring?

The calculation and template-interpretation layers (Sections 5.2–5.3) are **fully deterministic** — same birth data always produces the same JSON and the same template-filled interpretation panel text, with **no confidence scores, weighting, or probabilistic elements anywhere** in `natal_chart_swe.py`, `draw_wheel.py`, or `interp_data.py` (confirmed by full reads — no `random`, no scoring/weighting variables found). The optional AI `--conclusion` text is, by construction, **probabilistic/non-deterministic** (whatever the calling LLM generates, with no code-level constraint, validation, or scoring of its output).

### 5.7 Explicit verdict

**Hybrid, leaning "Chart→LLM" for the only genuinely AI-driven feature, with a "static templates" layer underneath it:**

- The **always-present interpretation panel** (houses, planet meanings, sign keywords, generic aspect-type meanings) = **"no AI, just static templates"** — a real Factors-extraction step feeds a real (but generic, non-per-combination) lookup-table rules layer, entirely without any LLM. This part is honestly closer to "Chart→Factors→Rules→Text" than the audit brief's default assumption, but the "Rules" are shallow (per-planet/house/sign/aspect-type, not per-combination correlation logic).
- The **optional `--conclusion` AI feature**, which SKILL.md documents as the package's actual "AI interpretation" capability, is squarely **"Chart→LLM"** (weak, as anticipated from the "Claude Skill" shape): the calling agent receives structured Factors (JSON with computed aspects) but is explicitly told only to "analyze JSON and write conclusion" — no rules mediate between the facts and the AI's free-form astrological reasoning, and the repo provides zero code-level interpretation logic for this path (no LLM SDK, no prompt template file, no rules the AI is required to consult).
- There is **no single unified "Chart→Factors→Rules→Interpretation→LLM" pipeline** in the strong sense the audit is checking for (i.e., deterministic rules that constrain/ground what the LLM is allowed to conclude, with citations back to specific rule+factor+placement). What exists is two parallel, disconnected paths: a rigid static-template path (no AI) and an unconstrained free-reasoning AI path (no rules) that the user can optionally bolt on top.

---

## 6. Test Audit

**NO TEST SUITE FOUND.** Confirmed by recursive search of the entire repository (`find . -iname "*test*"` and manual inspection of `scripts/`) — there are no `test_*.py`, `*_test.py`, `tests/` directory, `pytest.ini`, `tox.ini`, or any other testing artifact anywhere in the repo. There is also no CI configuration (no `.github/workflows/`, no `.gitlab-ci.yml`, etc.). Verification of correctness in this audit was therefore done entirely via direct execution (Section 7), not via any author-provided test.

---

## 7. Execution Attempt Results

**Environment**: Windows 11, confirmed Python 3.14.6 available on PATH (`python --version` → `Python 3.14.6`; `py --list` also shows 3.11.9 and 3.12.12 side-by-side, but 3.14 is the active default), matching the `.pyd`'s `cp314` ABI tag.

### Attempt 1 — exact benchmark input (Hanoi)
```
cd C:\ccaudit\repos\astro-natal-chart\scripts
python natal_chart_swe.py 12.03.1985 08:30 "Hanoi"
```
**Result: FAILED as expected from the code audit, not an environment/binary problem.**
```
❌ Ошибка: Город 'Hanoi' не найден в базе данных
```
(Translation: "City 'Hanoi' not found in the database.") Root cause confirmed in Section 4: `CITY_DB` (natal_chart_swe.py lines 95–164) has no Hanoi/Vietnam entry, and there is no CLI path to pass raw lat/lon/timezone directly — the script structurally cannot accept the benchmark's Hanoi coordinates as given.

### Attempt 2 — verify the pyswisseph binary and calculation engine actually work (supported city)
```
python natal_chart_swe.py 12.03.1985 08:30 "Москва" --json
```
**Result: SUCCESS.** The bundled `swisseph.cp314-win_amd64.pyd` loaded correctly under Python 3.14.6 and produced a full JSON chart (planets with longitude/speed/retrograde, 12 house cusps, ASC/MC, computed aspects list), e.g.:
```json
"Saturn": {"lon": 238.107446595739, "speed": -0.007903725555719278, "retro": true}
```
confirming the calculation engine itself (Swiss Ephemeris via pyswisseph) is genuinely functional on this machine, not just a compiled binary that fails to load.

### Attempt 3 — reproduce the exact benchmark birth data (1985-03-12 08:30, lat 21.0285 / lon 105.8542, UTC+7) by monkey-patching `CITY_DB`/`TZ_OFFSETS` in-process (since the CLI has no direct lat/lon input path)
```python
import natal_chart_swe as n
n.CITY_DB['hanoi'] = {'lat':21.0285,'lon':105.8542,'tz':'Asia/Bangkok','name':'Hanoi, Vietnam'}
n.TZ_OFFSETS['Asia/Bangkok'] = 7
chart = n.calc_natal_chart('12.03.1985','08:30','hanoi')
print(n.format_chart(chart))
```
**Result: SUCCESS.** Full chart computed for the exact benchmark birth data:
```
🌟 НАТАЛЬНАЯ КАРТА  [Swiss Ephemeris v20.23.604]
📅 Дата: 12.03.1985  ⏰ Время: 08:30  📍 Место: Hanoi, Vietnam
🌍 21.0285°N, 105.8542°E  🕐 Asia/Bangkok (UTC+7)
⬆️  ASC — Телец 5°32′        (Ascendant: Taurus 5°32')
🜨  MC  — Козерог 27°59′     (MC: Capricorn 27°59')
☀️ Солнце — Рыбы 21°25′ [11 дом]   (Sun: Pisces 21°25', House 11)
...
  ⚹ Квинконс: Марс — Сатурн  (орбис: 0.4°)   (Quincunx: Mars–Saturn, orb 0.4°)
  ...
```
This confirms the calculation pipeline is fully functional and produces plausible tropical/Placidus results for the exact benchmark data — **the only real blocker for the benchmark case, as run via the documented CLI, is the missing Vietnam city-database entry, not the calculation engine.**

### Attempt 4 — graphical renderer (`draw_wheel.py`)
```
python draw_wheel.py 12.03.1985 08:30 "Москва" --lang en --name "TestBenchmark"
```
Pillow 12.3.0 confirmed installed. **Result: PARTIAL SUCCESS, then a confirmed execution failure (real, reproducible bug):**
```
Frame loaded: (236, 300) from C:\ccaudit\repos\astro-natal-chart\scripts\frame_small.png.dat
Traceback (most recent call last):
  File "...\draw_wheel.py", line 770, in <module>
    img.save(_out, "PNG")
FileNotFoundError: [Errno 2] No such file or directory:
  'C:\\Users\\alter\\.openclaw\\workspace\\TestBenchmark_full_natal_en.png'
```
Root cause (confirmed by reading the source, `draw_wheel.py` line 769):
```python
_out = os.path.join(r"C:\Users\alter\.openclaw\workspace", "%s_full_natal_%s.png" % (_name_clean, "ru" if RU else "en"))
```
**This is a hardcoded, developer-machine-specific absolute Windows path** (`C:\Users\alter\.openclaw\workspace` — "alter" being the original author's Windows username), with no CLI flag, environment variable, or relative-path fallback to override it. On any machine other than the original author's (confirmed here on a machine with a different username), the script computes the entire chart and composes the full 5760×2880 image in memory successfully, then **crashes at the final save step** because that directory does not exist. This is a genuine, reproducible defect that would block every user of this "published" skill from getting output at all, unless they happen to have (or manually create) that exact directory path — a significant quality red flag for something at version "4.3.7" with an extensive changelog.

---

## 8. Maintenance

```
git log -1:
commit 8e52998a14d95dcae86ef04d4a4f91396bdf500f
Author: dynamicsAlex <dynamicsAlex@openclaw>
Date:   Wed Jun 24 23:01:36 2026 +0400
    feat: QR code now renders by default via bundled frame_small.png.dat

git log --oneline -20:
8e52998 feat: QR code now renders by default via bundled frame_small.png.dat
(only one commit total — confirmed via `git rev-list --all --count` = 1)

git shortlog -sn: (empty output — consistent with a single, non-merge commit)

git tag: (none)

git branch -a:
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

**Classification: EXPERIMENTAL / cannot be assessed as ACTIVE-MAINTAINED from git evidence — the visible git history is a single squashed commit.** This is an important and somewhat unusual finding: `CHANGELOG.md` and `SKILL.md` together document an extensive, detailed development history spanning versions v1.x through v4.3.7 with dozens of dated entries (2026-05-28 through 2026-06-24), describing iterative bug fixes, refactors, and feature additions — but **none of that history exists in the actual git log**. The entire repository was published/committed as a single commit. This means:
- The changelog's narrative of iterative development cannot be independently verified against real commit-by-commit diffs.
- There is no way to audit *when* any given fix actually landed, whether it was tested, or whether the CHANGELOG's claims (e.g., "Fixed X bug") are accurate — the git history offers zero corroborating evidence.
- This pattern (rich changelog narrative, single squashed commit) is typical of a skill being republished/synced from a private development repo to a public one at export time, or of a changelog written speculatively/generated rather than derived from real commit history — either way, it undermines confidence in treating the CHANGELOG as a reliable maintenance signal on its own.

Given a single commit and no tags, no CI, and no visible ongoing commit cadence in this clone, the fairest classification is **EXPERIMENTAL** (from the git evidence available) with the caveat that the CHANGELOG *claims* (unverifiable) a longer, more active history. There is no evidence in this repo of maintenance *after* the 2026-06-24 commit date.

---

## 9. Code Quality Scores

Scored 0–10, fairly relative to this being a 3-script utility (not a full application), but honestly with respect to production-readiness for a commercial engine.

| Dimension | Score | Justification |
|---|---|---|
| **Architecture** | 6/10 | Clean separation of concerns at the top level: `natal_chart_swe.py` (sole calc engine) → JSON → `draw_wheel.py` (pure renderer, calls the calc script via `subprocess` rather than duplicating logic — explicitly designed this way per SKILL.md/CHANGELOG v3.1.0 to guarantee text/graphic consistency). This is a reasonable design for a small skill. Docked for: no abstraction for the interpretation/AI boundary (SKILL.md documents an AI workflow that the code does nothing to structurally support beyond a `--conclusion FILE` text-passthrough flag), and the city/timezone system is a hardcoded dict rather than a pluggable geocoding/timezone service. |
| **Modularity** | 6/10 | `interp_data.py` is cleanly split out from rendering logic (draw_wheel.py imports its dictionaries, `draw_wheel.py` lines 6–8) — a genuine, documented refactor (CHANGELOG v4.0.0). But `draw_wheel.py` itself is a single 775-line monolithic script mixing CLI parsing, subprocess orchestration, font loading, geometry math, and three panels' worth of rendering logic in one file with module-level globals (no functions/classes for panel composition beyond a handful of local helper functions). |
| **Typing** | 1/10 | Zero type hints anywhere in any of the three `.py` files (confirmed by full reads — no `typing` import, no `->` return annotations, no parameter annotations). All data passed as untyped dicts/lists. |
| **Documentation** | 7/10 | Above-average for a script utility: SKILL.md (510 lines) and README.md are extensive and detailed, with usage examples, JSON schema samples, and a maintained CHANGELOG. In-code documentation is sparser — module docstrings exist (`natal_chart_swe.py` lines 3–13) but most functions in `draw_wheel.py` and `natal_chart_swe.py` have no docstrings, relying on short inline comments. |
| **Separation of concerns** | 6/10 | Calculation vs. rendering vs. data-tables separation is real and enforced by the subprocess boundary (see Architecture). However, `draw_wheel.py` also does file I/O for fonts/frame assets, CLI parsing, and layout math all inline without separation, and `interp_data.py`'s text is duplicated almost verbatim inside SKILL.md's own "Zodiac Signs/Planets/Houses — Keywords/Meanings" sections (SKILL.md lines 233–274) — a documentation/data duplication that will drift over time. |
| **Extensibility** | 4/10 | Adding a new aspect type or house system requires editing hardcoded dicts/literals in multiple places (`ASPECTS` dict, the aspect-angle tuple list in `calc_aspects()`, the `cm` color-map dict in `draw_wheel.py`, `aspect_symbols` dict, `ail` legend list) rather than a single source of truth. Adding a new city requires manually editing the `CITY_DB` Python dict (no external data file, no geocoding API) — the exact gap that blocks the Hanoi benchmark. Adding a new language (e.g., Vietnamese) would require parallel `_RU`/`_EN`-style dict variants throughout `interp_data.py` and `draw_wheel.py`'s inline `T = {...}` dict — a real but mechanical extension path, not a data-driven i18n system. |
| **Error handling** | 4/10 | Some defensive code exists (fallback from `swe.houses_ex()` to `swe.houses()` on exception, natal_chart_swe.py lines 222–225; try/except around font loading, frame image loading, conclusion file reading). But many failure modes are unhandled or silently swallowed: the swisseph loader's `except Exception: pass` (line 43–44) hides real load errors from the user until every fallback is exhausted; `draw_wheel.py`'s final `img.save()` has no try/except at all — confirmed by Section 7's uncaught `FileNotFoundError` traceback; city lookup failures return a soft `{"error": ...}` dict from `natal_chart_swe.py` but `draw_wheel.py`'s consumption of that (`if "error" in chart: print(...); sys.exit(1)`, line 60) is a hard CLI exit, not a recoverable/catchable state for embedding this in a larger application. |

**Overall**: a competent single-author scripting effort for its stated scope (a personal/hobbyist ClawHub skill), but **not production-grade** by commercial software engineering standards (no types, no tests, hardcoded paths/data, monolithic renderer file).

---

## 10. Security Notes

- **`eval`/`exec`/`pickle`**: Grep of both `.py` files found **no `eval(`, no `exec(`, and no `pickle` usage.** (Confirmed via `Grep` across `scripts/*.py`.)
- **Network calls**: **NONE.** No `socket`, `requests`, `urllib`, or `http` usage found anywhere in the Python source (grep confirmed clean). The only "URL" in the codebase is a hardcoded string rendered as plain text into the output image (`_url = "https://clawhub.ai/dynamicsalex/astro-natal-chart"`, draw_wheel.py line 496) — this is not a network call, just watermark text.
- **`subprocess` usage**: `draw_wheel.py` calls `subprocess.run([sys.executable, ..., args.date, args.time, args.city, "--json"], ...)` (lines 55–57) and `subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])` (line 13). Both use the **list form** (not `shell=True`), which avoids classic shell-injection — arguments including user-controlled `date`/`time`/`city` strings are passed as discrete argv entries, not interpolated into a shell string. This is a reasonably safe pattern. Note, however, that `draw_wheel.py` will silently attempt to `pip install pillow` on first run if PIL is missing (line 13) — an unprompted package install as a side effect of running the script, worth flagging even though it targets a known/pinned PyPI package name rather than an attacker-controlled one.
- **Hardcoded secrets**: **NONE found.** No API keys, tokens, or credentials appear in any of the three scripts, `SKILL.md`, `README.md`, `CHANGELOG.md`, `_meta.json`, or `.clawhub/origin.json`.
- **Prompt-injection surface via SKILL.md's AI-conclusion workflow**: This is the most relevant risk surface for the stated use case. SKILL.md instructs the calling AI agent to: (1) run `natal_chart_swe.py --json` on **user-supplied birth data** (date/time/**city name**, a free-text field looked up loosely via substring match in `find_city()`, natal_chart_swe.py lines 187–194: `if key in k or k in key`), (2) have the AI "analyze JSON and write conclusion to a file," then (3) pass that file path back into `draw_wheel.py --conclusion FILE`, whose only processing of that file's content is `cf.read().strip()` followed by word-wrapping and direct pixel rendering (draw_wheel.py lines 730–757) — **no sanitization, length limit enforcement beyond visual wrapping, or content filtering of the AI-generated text before it is baked into the final image.** While the birth-data fields (date/time/city) are not directly rendered as arbitrary free text into a *prompt* by this code (they only drive the deterministic Swiss Ephemeris lookup and city-DB substring match), the overall three-step workflow described in SKILL.md means: if the calling agent's "city" or "name" input field (both user-controllable, `--name` is free text rendered directly via `rcent()`/`info_cent()`) is populated from untrusted end-user input on a hypothetical Vietnamese website, that text is rendered verbatim into the output image with no escaping — this is a content-integrity/spoofing risk (a malicious user could inject misleading or offensive text into what looks like an "official" astrology report image) rather than a code-execution risk, since none of this text is ever `eval`'d or used to construct a shell command.
- **Untrusted precompiled binary (`swisseph.cp314-win_amd64.pyd`)**: This audit could not and did not disassemble or otherwise verify the compiled binary's actual behavior beyond confirming it successfully loads and returns plausible ephemeris data matching expected astronomical calculations (Section 7). **Running a precompiled, third-party-distributed native Windows extension module obtained from a GitHub/ClawHub skill repo — rather than a binary built from source or obtained via the official `pyswisseph` PyPI wheel — is a supply-chain/binary-trust concern that should be flagged for any commercial deployment.** A `.pyd` file executes arbitrary native code with the same privileges as the Python process; nothing in this repo (no checksum file, no signature, no reference to the exact upstream pyswisseph source commit it was built from) allows independently verifying that this binary matches the genuine open-source pyswisseph 2.10.3.2 release rather than a modified build. Recommendation for the commercial project: **do not use this bundled binary in production; obtain pyswisseph via the official PyPI package or build it from the official Astrodienst/pyswisseph source** instead of trusting this repo's precompiled artifact.

---

## 11. Tier Recommendation

**Tier: D — Experimental**

Justification, tied directly to the findings above:

- **AI architecture verdict (Section 5.7)**: This repo does *not* implement the strong "Chart→Factors→Rules→Interpretation→LLM" pipeline the commercial project needs. Its always-on interpretation is a shallow, generic per-item static template (not per-combination rules), and its one genuine AI-integration point is an explicitly documented, unconstrained **Chart→LLM** pattern (SKILL.md's 3-step "AI Conclusion workflow") with no rules layer, no explainability/citation mechanism, and no confidence scoring gating the LLM's output. This is architecturally the weaker of the two patterns the audit was designed to distinguish, and it falls short of what a defensible commercial interpretation engine (especially one making claims to paying users) should have.
- **Missing license (Section 2)**: No LICENSE file exists; the only license signal is an unverified "MIT" line in README prose, with the bundled Microsoft fonts' and Swiss Ephemeris binary's own licensing entirely unaddressed. This alone makes the repo **legally unsafe to copy code or assets from directly** without contacting the author — a blocking issue for any tier above D regardless of technical merit.
- **"Claude Skill," not a product component (confirmed, Sections 1, 3)**: The repo is packaged and structured entirely as an OpenClaw/ClawHub AI-agent skill (SKILL.md + `_meta.json` + `.clawhub/origin.json`), invoked via subprocess by an AI agent, with a hardcoded developer-machine output path (Section 7, confirmed failure) and no API surface, no packaging (`pyproject.toml`/`setup.py`), and no test suite. It was never designed to be imported as a library or deployed as a service — repurposing it for a production Vietnamese website backend would require substantial rewriting (city/geocoding system, output-path handling, packaging, license resolution, adding a real rules layer, replacing the Windows-only binary).
- **What it's still worth taking**: the Swiss Ephemeris calculation approach (Placidus via `swe.houses_ex`, aspect-angle/orb matching pattern, retrograde-via-velocity-sign trick) and the general wheel-rendering geometry (`aof()`/`ppos()` polar-to-cartesian conversion, per-character dual-font selection for zodiac glyphs) are legitimate, verified-by-execution techniques worth studying as a **reference implementation pattern** — hence D ("Experimental," useful to look at, not to depend on or copy from) rather than E ("Avoid entirely"). It is not tier C ("Specialized") or higher because it provides no reusable, licensed, tested, or production-viable component — only ideas and a demonstrated-working calculation approach that would need to be reimplemented cleanly (and under a properly resolved license) to be usable.
