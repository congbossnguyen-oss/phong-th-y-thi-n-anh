# Source-Code Audit: `zodiac-engine` (gsinghjay/zodiac-engine)

Repo location audited: `C:\ccaudit\repos\zodiac-engine` (shallow clone, 1 commit: `d610c74`, "chore: added DEMO.md documentation for presentation", 2025-05-16)

---

## 1. Summary Verdict

Zodiac Engine is a **real, working FastAPI wrapper around the Kerykeion/pyswisseph astrology library** (planets, houses, aspects for natal charts are genuinely calculated with the Swiss Ephemeris — verified by direct execution below) bolted onto a **"Chart→LLM" interpretation layer, not "Chart→Factors→Rules→Interpretation→LLM."** There is no discrete "Factors" extraction step and no deterministic rules/lookup table anywhere in the codebase. The interpretation service (`app/services/interpretation.py`) takes the raw ASCII report tables that Kerykeion's `Report` class prints for humans, drops them verbatim into a single giant prompt, and asks Google's Gemini model to invent the astrological reasoning itself ("Identify and name the first major theme... Discuss its potential positive and challenging manifestations"). There is no evidence chain, no confidence scoring, and — as verified by execution — the interpretation *API endpoint* is actually broken (Pydantic schema mismatch, confirmed below) even though the web-UI demo path around it works. Synastry, composite, and transit **chart calculation** are unimplemented `501` stubs despite being advertised as features in the OpenAPI tags and README; only synastry *visualization* (SVG rendering) works. There is **no LICENSE file in the repository**, and the README's own License section is a leftover placeholder admitting as much ("Assuming you'll add an MIT License file. If not, adjust accordingly..."). For the stated goal (a commercial phong-thủy engine with a calculation→rules→interpretation pipeline), this repo is useful only as a **reference for the calculation layer (Kerykeion/Swiss Ephemeris integration patterns)** — its AI/interpretation architecture is exactly the "raw chart dump to LLM" anti-pattern the project explicitly wants to avoid, and its licensing status must be resolved (via the actual upstream GitHub repo, not this clone) before any code is reused commercially.

---

## 2. License

**No LICENSE file exists anywhere in the repository** (checked root and full tree: `find . -iname "LICENSE*"` returned nothing; no `pyproject.toml`/`setup.py`/`setup.cfg` exists either, so there is no package-metadata license field to fall back on).

The only mention of licensing is in `README.md`, lines 520-522:

```
## License

[MIT License](LICENSE) (Assuming you'll add an MIT License file. If not, adjust accordingly, e.g., "This project is for educational purposes and is not licensed for redistribution without permission.")
```

This is a templated placeholder the author never resolved — it links to a `LICENSE` file that does not exist, and the parenthetical explicitly flags that the intent was never finalized.

**Assessment: LEGAL REVIEW REQUIRED.** With no LICENSE file, the repository is, by default copyright law, "all rights reserved" by the author — there is no granted permission to use, copy, modify, or redistribute the code commercially, MIT-style text notwithstanding, because the text isn't backed by an actual license grant/file. Before reusing any code or patterns from this repo in a commercial product, either (a) obtain explicit written permission from the author (`gsinghjay`), (b) check whether the live GitHub repository (not this local clone) has since added a real LICENSE file, or (c) treat this repo purely as an unlicensed reference for architecture ideas and re-implement independently. Do not vendor/copy code as-is under a commercial-compatibility assumption.

---

## 3. Dependencies

From `requirements.txt` (exact pins as written):

| Category | Package | Version constraint | Notes |
|---|---|---|---|
| Web framework | `fastapi` | `>=0.112.0,<0.113.0` | Confirmed via `app/main.py` — genuine FastAPI app |
| ASGI server | `uvicorn[standard]` | `>=0.34.0,<0.35.0` | |
| Validation | `pydantic` | `>=2.11.0,<2.12.0` | Pydantic v2 throughout `app/schemas/` |
| Settings | `pydantic-settings` | `>=2.8.0,<2.9.0` | `app/core/config.py` |
| Forms | `python-multipart` | `>=0.0.6,<0.0.21` | |
| HTTP client | `httpx` | `>=0.28.0,<0.29.0` | |
| DB | `sqlalchemy`, `aiosqlite`, `alembic` | pinned | **Present in requirements but UNUSED** — no models, no DB session, no migrations directory found anywhere in `app/`; grep for `sqlalchemy`/`Session`/`alembic` in `app/` returns nothing. Vestigial/aspirational dependency (memory-bank confirms: "Database Integration" is listed under "Planned Improvements", not implemented). |
| **Astro calc backend** | `kerykeion` | `==4.25.3` (exact pin) | The real calculation engine — wraps Swiss Ephemeris |
| **Astro calc backend** | `pyswisseph` | `>=2.10.3.1,<3.0.0.0` | Swiss Ephemeris Python binding, Kerykeion's actual ephemeris source |
| | `pytz` | `>=2024.2,<2025.0` | |
| | `requests`, `requests-cache` | pinned | Used by `GeoService` for GeoNames city/timezone lookups (plain HTTP, see Security) |
| | `scour` | pinned | SVG optimization (Kerykeion dep) |
| | `simple-ascii-tables` | pinned | Kerykeion's `Report` ASCII table renderer — this is literally the source of the text later fed to the LLM |
| **AI/LLM SDK** | `google-generativeai` (imported as `google.generativeai`, listed in memory-bank tech context, not explicitly in requirements.txt text shown but imported in `app/services/interpretation.py`) | — | **Gemini only** — no `openai`, `anthropic`, or `langchain` package in `requirements.txt` despite `InterpretationService` accepting `llm_provider: "openai"/"anthropic"/"gemini"` as a parameter (only "gemini" branch is implemented; the other two are silently no-ops that return a placeholder string) |
| Templating | `Jinja2` | `>=3.1.2,<3.2.0` | Server-rendered HTML web UI |
| Image conversion | `cairosvg`, `Pillow` | pinned | SVG→PNG/PDF/JPEG conversion; **requires native `libcairo` system library**, which is absent by default on Windows (see Execution section — this alone crashes the entire app at import time) |
| Markdown | `markdown` | `>=3.6,<3.7` | Converts Gemini's markdown output to HTML |
| Testing | `pytest`, `pytest-asyncio`, `pytest-dotenv` | pinned | |

**Freshness/pinning:** Dependencies are pinned with upper-bound ranges (good practice), dated roughly April–May 2025 based on CHANGELOG version dates. As of today (2026-09-13) these are a little over a year old but not badly stale; FastAPI/Pydantic/Uvicorn versions are reasonably current for that era. `kerykeion==4.25.3` is a hard exact pin (no range), which is brittle for a library still under active development.

**Framework confirmed:** FastAPI (via `app/main.py`, `FastAPI()`, `APIRouter`, `CORSMiddleware`), not Flask/Django.

---

## 4. Calculation Feature Table

| Feature | Status | Citation |
|---|---|---|
| Planets (Sun–Pluto) | **SUPPORTED** | `app/services/astrology.py:80-100` (`AstrologyService.calculate_natal_chart`, `standard_planets` loop) — verified by direct execution (see §7) |
| Lunar Nodes (mean/true), Mean Lilith, Chiron | **SUPPORTED** | `app/services/astrology.py:86-114` (`additional_points` loop) |
| South Nodes (mean/true) listed in code but not asserted in tests | **SUPPORTED** (code) / **CLAIMED BUT NOT VERIFIED** (test coverage only checks node/lilith/chiron, not south nodes explicitly) | `app/services/astrology.py:87` vs `tests/test_charts_natal.py` `test_calculate_natal_chart_celestial_points` |
| Houses (12 cusps) | **SUPPORTED** | `app/services/astrology.py:118-128`; `app/schemas/natal_chart.py:58` |
| House systems (Placidus, Koch, Whole Sign, Equal, Campanus, Regiomontanus, Porphyry, Polich-Page, Alcabitius, Morinus, Vehlow, Axial, Horizon, APC) | **SUPPORTED** | `app/services/report.py:286-306` (`_map_house_system` full map); `NatalChartRequest.houses_system` in `app/schemas/natal_chart.py:24`; house-system switch verified by execution (`houses_system="P"` benchmark run, §7) and by `tests/test_charts_natal.py::test_calculate_natal_chart_different_house_system` (Whole Sign) |
| Aspects (major + minor, with orb) | **SUPPORTED** | `app/services/astrology.py:74-76,130-138` (`NatalAspects(subject)`, `aspects.all_aspects`); verified by execution — 40 aspects returned for the benchmark chart including `trine`, `square`, `sextile`, `quintile` |
| Zodiac type: Tropical | **SUPPORTED** | `tests/test_chart_configuration.py::test_natal_chart_with_tropical_zodiac` — asserts `"Tropical"` string appears in generated SVG via `config.zodiac_type = "Tropic"` passed to `ChartVisualizationService` |
| Zodiac type: Sidereal (incl. Lahiri ayanamsa) | **SUPPORTED (visualization only)** | `tests/test_chart_configuration.py::test_natal_chart_with_sidereal_zodiac` (`sidereal_mode: "LAHIRI"`); **NOT wired into** `AstrologyService.calculate_natal_chart` (the JSON-returning natal-chart endpoint) — only the SVG-visualization endpoint (`app/services/chart_visualization.py`) accepts `zodiac_type`/`sidereal_mode`. So sidereal support is real but confined to one endpoint, not the core calculation API. |
| Custom aspect orbs / active-points filtering | **SUPPORTED (visualization only)** | `tests/test_chart_configuration.py::test_natal_chart_with_custom_aspects`, `test_natal_chart_with_limited_planets`; `app/schemas/chart_visualization.py` config model |
| Synastry (two-chart comparison, calculated aspects between charts) | **NOT PRESENT** (chart-calculation endpoint) / **SUPPORTED** (report text + SVG visualization only) | `app/api/v1/routers/charts/synastry.py` — entire router is a stub: `@router.get("/", status_code=status.HTTP_501_NOT_IMPLEMENTED)` returning "Synastry chart calculation not yet implemented." Actual synastry *report* text exists (`ReportService.generate_synastry_report`, `app/services/report.py:135-274`) and synastry *SVG visualization* works (`app/api/v1/routers/charts/visualization.py:145-226`, verified by `tests/test_chart_configuration.py::test_synastry_chart_with_configuration`), but there is no endpoint that returns structured synastry aspect data. `ReportService.generate_synastry_report` itself contains `aspects_table = "Synastry aspects analysis is not yet implemented."` (line 247) — a hardcoded placeholder string. |
| Composite charts | **NOT PRESENT** | `app/api/v1/routers/charts/composite.py` — 3-line stub returning 501 |
| Transits | **NOT PRESENT** | `app/api/v1/routers/charts/transit.py` — 3-line stub returning 501 |
| Chart caching | **SUPPORTED (partial)** | `app/services/astrology.py:38` `@functools.lru_cache(maxsize=128)` on `calculate_natal_chart` — in-memory only, not persistent; README/memory-bank both note "in-memory `chart_cache`" as a limitation to fix later |

README claims of "Synastry Analysis" and "Composite Charts" as headline features (`app/main.py:33-34`, OpenAPI description) are **CLAIMED BUT NOT VERIFIED / CONTRADICTED BY CODE** for the actual calculation logic — confirmed 501 stubs above.

---

## 5. AI / Interpretation Architecture Analysis (Key Section)

### 5.1 Data flow, traced end to end

Two independent trigger paths exist and were both traced:

1. **Web demo path** (`app/api/web.py`, the one actually demoed): `POST` form → `ReportService.generate_natal_report()` → `run_in_threadpool(InterpretationService.interpret_natal_chart, ...)` → Gemini → markdown → HTML → Jinja2 template.
2. **Public API path** (`app/api/v1/routers/charts/interpretations.py`): `POST /api/v1/charts/interpretations/natal` → same `InterpretationService.interpret_natal_chart()` → **is broken**, see §5.5.

Both call the same core function, `InterpretationService.interpret_natal_chart()` in `app/services/interpretation.py`.

### 5.2 Is there a structured "Factors" extraction step before any LLM call?

**No.** Trace the report data all the way back:

- `app/services/report.py::ReportService.generate_natal_report()` (lines 22-133) calls Kerykeion's `Report(subject).get_full_report()` (line 92-93), which is a **human-readable ASCII text dump** designed for terminal/CLI display (it literally contains box-drawing characters, e.g. `full_report.find("+-----------+")` at line 107).
- The method then does **string slicing** on that ASCII dump to carve out `data_table`, `planets_table`, `houses_table` (lines 106-119) — this is text splitting, not structured data extraction. No Python objects representing "Mars square Saturn in 10th house" are constructed at this stage; the aspect table isn't even included in `NatalReportData` for the natal path (only `data_table`, `planets_table`, `houses_table`, `full_report` — no aspect data as a discrete field).
- `NatalReportData` (`app/schemas/report.py:93-111`) is just four string fields: `title`, `data_table`, `planets_table`, `houses_table`, `full_report`. All strings. There is **no** intermediate schema resembling "Factor" (e.g., `{planet_a, planet_b, aspect_type, orb, house_context}` as typed, queryable data) anywhere in `app/schemas/`.

The genuinely structured data *does* exist earlier in the pipeline — `AstrologyService.calculate_natal_chart()` (§4) returns proper typed `AspectInfo`/`PlanetPosition` Pydantic objects — but **this structured output is never passed to `InterpretationService`.** The interpretation path only consumes `ReportService`'s stringified ASCII tables, a completely separate and disconnected code path from the structured `AstrologyService` calculation. There is no code that converts `AspectInfo(p1_name="Mars", p2_name="Saturn", aspect="square", orbit=...)` into any kind of catalogued "Factor."

### 5.3 Is there a rules layer independent of any LLM?

**No.** There is no `rules.py`, no rules table, no if/then aspect-to-theme mapping, no keyword/lookup dictionary anywhere in `app/`. Grep across the repo for `rule`, `if.*aspect.*==`, lookup dictionaries mapping sign/house/aspect combinations to interpretive text returns nothing — the only "rules" that exist are Kerykeion's internal ephemeris/aspect-orb calculation rules (which produce the raw astronomical facts), not an interpretation-mapping layer. 100% of interpretive/thematic reasoning is delegated to the LLM's own judgment.

### 5.4 Is there an LLM call? What does it actually receive? (verbatim prompt)

**Yes — Google Gemini only**, via `google.generativeai` (`app/services/interpretation.py:6,39-40`). `InterpretationService.__init__` accepts an `llm_provider` param documented as supporting `"openai"`, `"anthropic"`, `"gemini"` (`app/services/interpretation.py:17,24`), but only the `gemini` branch (lines 36-47, 93-177) is implemented. If provider is `"openai"` or `"anthropic"`, the code silently falls through to the placeholder response at the bottom (lines 179-185) — **these are marketing claims in the constructor docstring, not implemented alternatives.**

The **exact prompt template** sent to Gemini (`app/services/interpretation.py:237-307`, `_get_natal_prompt_template`), verbatim:

```
You are an expert astrologer tasked with interpreting a natal chart.
Below is the data from the chart:

Report Title: {title}

Birth Data:
{data_table}

Planet Positions:
{planets_table}

House Positions:
{houses_table}

Full Report Text (for context if needed):
---
{full_report}
---

Please provide a {tone} interpretation of this chart, focusing on: {focus_areas}.
Your interpretation should be {max_length_text}.

Structure your response using Markdown with the following headings...

# Natal Chart Interpretation for {title}

## Overall Chart Signature
   - [Provide a 1-2 paragraph overview of the dominant energies, core themes, and the individual's general life approach based on the chart.]

## Key Astrological Themes
   - **[Identify and name the first major theme, e.g., "Emotional Depth & Intuition"]:**
     - [Explain this theme, linking it to specific placements like Grand Trines, stelliums, or dominant elements/modalities. Discuss its potential positive and challenging manifestations.]
   ...

## Major Aspect Patterns
   - **[Aspect Pattern Name, e.g., Water Grand Trine (Moon, Jupiter, Pluto in Scorpio)]:**
     - [Detailed interpretation of this major aspect pattern, its gifts, and potential challenges.]
   ...
```

This is unambiguous: **the LLM is handed the raw ASCII report text and explicitly instructed to identify aspect patterns, name themes, and produce interpretive judgments itself** ("Identify and name the first major theme," "Detailed interpretation of this major aspect pattern, its gifts, and potential challenges"). It is not handed pre-computed facts like "Grand Trine: Moon-Jupiter-Pluto in Water signs, houses 4/8/12" as structured input to narrate — it has to *find* that pattern itself by reading the ASCII table. This is a textbook **"Chart→LLM"** design: raw/loosely-formatted chart data in, improvised astrology reasoning out.

Response parsing on the way back is equally unstructured — `interpret_natal_chart` (lines 137-156) does fragile string-splitting on the LLM's own markdown headings (`markdown_text.split("## Summary: Strengths & Challenges")[1].split("##")[0]`) to scrape "highlights" and "suggestions" out of prose, with a bare `except Exception` fallback to generic placeholder text if the LLM didn't follow the exact heading format.

Synastry interpretation (`interpret_synastry_chart`, lines 187-228) is **not implemented at all** — it has a prompt template written (`_get_synastry_prompt_template`, lines 309-356) but the method itself just returns a hardcoded placeholder ("Synastry chart interpretation with markdown conversion will be implemented soon.") with a `# TODO` comment (line 223), never calling the LLM.

### 5.5 Explainability / evidence / citation mechanism

**None.** There is no field, tag, or metadata anywhere in `InterpretationResponse` or the prompt/response handling that traces a claim in the output back to a specific rule, factor, or placement. The LLM's prose is free-form; the only "structure" imposed is markdown headings for display purposes, not for evidentiary traceability. `highlights` and `suggestions` (`app/schemas/report.py:196-198`) are just lists of strings scraped by naive string-splitting, with no link back to the aspect/placement that generated them.

### 5.6 Deterministic or probabilistic? Confidence scoring?

**Fully probabilistic**, with zero confidence scoring. Every natal-chart interpretation is one non-deterministic LLM call (`self.model.generate_content(prompt_text)`, line 108) with no temperature control exposed in this file (temperature is defined in `Settings.LLM_TEMPERATURE` but that setting is **never actually passed into the Gemini call** — `genai.GenerativeModel(self.model_name)` at line 40 takes no generation-config/temperature argument, so the configured `LLM_TEMPERATURE`/`LLM_MAX_TOKENS` settings in `app/core/config.py:19-20` are dead configuration, unused by the code that would need them). Two identical requests can produce materially different prose. No confidence/probability score is computed or returned anywhere.

### 5.7 Concrete bug found (verified by execution): the interpretation API is broken

`InterpretationService.interpret_natal_chart()` returns a dict keyed `"interpretation_html"` (`app/services/interpretation.py:158-162,181-185`), but `app/api/v1/routers/charts/interpretations.py:120` does `return InterpretationResponse(**interpretation_result)`, and `InterpretationResponse` (`app/schemas/report.py:194-198`) requires a field named **`interpretation`** (not `interpretation_html`), with no default. I reproduced this directly:

```
$ python -c "from app.schemas.report import InterpretationResponse; InterpretationResponse(interpretation_html='<p>x</p>', highlights=[], suggestions=[])"
VALIDATION ERROR: 1 validation error for InterpretationResponse
interpretation
  Field required [type=missing, input_value={'interpretation_html': '...: [], 'suggestions': []}, input_type=dict]
```

This means the dedicated `/api/v1/charts/interpretations/natal` and `/synastry` REST endpoints **always throw a `pydantic.ValidationError`**, caught by the router's blanket `except Exception` and surfaced as an HTTP 500 "Error generating interpretation: ..." — this endpoint has never worked as shipped. (The web-UI demo path at `app/api/web.py` sidesteps this because it renders `interpretation_result` directly into a Jinja2 template dict rather than validating it against `InterpretationResponse`, which is why the demo "works" while the documented public API does not.)

### 5.8 Explicit Verdict

> **"Chart → LLM" (weak).** Confirmed by direct code trace: raw ASCII report strings (not structured facts) are interpolated into one long prompt (`app/services/interpretation.py:237-307`) instructing Gemini to identify aspect patterns and themes itself, with no rules layer, no factors schema, no evidence/citation mechanism, and no confidence scoring anywhere in the codebase. The one genuinely structured astrological output that exists in the repo (`AstrologyService.calculate_natal_chart`'s typed `AspectInfo`/`PlanetPosition` objects) is architecturally disconnected from the interpretation pipeline entirely — it is never passed to `InterpretationService`. This is close to the opposite of the "Chart→Factors→Rules→Interpretation→LLM" pattern the target project wants; it should be treated as a cautionary example of what *not* to replicate for the interpretation layer, while the calculation layer (Kerykeion/pyswisseph integration) is a legitimate, working reference.

---

## 6. Test Audit

Test suite exists (`tests/`), 7 files, ~640 lines of test code (calculation + configuration only; no tests exist for `InterpretationService` or the LLM code path at all — grep for `interpretation`/`gemini`/`Interpretation` inside `tests/` returns zero matches).

Representative real test functions and assertions (quoted from the files):

- `tests/test_charts_natal.py::test_calculate_natal_chart_success` — posts to `/api/v1/charts/natal/` and asserts `assert response.status_code == status.HTTP_200_OK`, `assert len(data["planets"]) > 0`, `assert len(data["houses"]) == 12`.
- `tests/test_charts_natal.py::test_calculate_natal_chart_celestial_points` — `required_points = ["mean node", "true node", "mean lilith", "chiron"]` and asserts each is present in the planet list.
- `tests/test_charts_natal.py::test_calculate_natal_chart_aspect_data` — `assert len(data["aspects"]) > 0` and checks each aspect dict has `p1_name`, `p2_name`, `aspect`, `orbit`.
- `tests/test_chart_configuration.py::test_natal_chart_with_tropical_zodiac` / `test_natal_chart_with_sidereal_zodiac` — posts `config: {"zodiac_type": "Tropic"}` / `{"zodiac_type": "Sidereal", "sidereal_mode": "LAHIRI"}`, then opens the generated SVG file from disk and asserts `assert "Tropical" in svg_content` / `assert "Ayanamsa" in svg_content`.
- `tests/test_chart_configuration.py::test_synastry_chart_with_configuration` — posts a two-person payload to `/api/v1/charts/visualization/synastry`, asserts `HTTP_202_ACCEPTED` and a `.svg` URL is returned.
- `tests/test_natal_chart_variations.py::test_natal_chart_different_themes` — loops over `["light", "dark", "classic", "dark-high-contrast"]` themes and checks each produces a `chart_id`.
- `tests/test_svg_utils.py`, `tests/test_static_images.py`, `tests/services/test_file_conversion.py` — SVG preprocessing / static file serving / format conversion tests.

**Test coverage gap:** No tests for `InterpretationService`, no tests for the interpretation API endpoints, no tests catching the schema-mismatch bug in §5.7 — consistent with that endpoint being effectively unexercised by the project's own test suite.

---

## 7. Execution Attempt Results

Environment: Windows 11, no internet restrictions beyond a corporate TLS-intercepting proxy (worked around with `pip --trusted-host`). System Python was 3.14 (too new — no prebuilt `pydantic-core`/PyO3 wheels support 3.14 yet, build-from-source fails); switched to Python 3.11.9 via `py -3.11`.

**Commands run:**
```
py -3.11 -m venv C:\ccaudit\venv_test
C:\ccaudit\venv_test\Scripts\python.exe -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --trusted-host pypi.python.org -r requirements.txt
```
Result: **succeeded** (`fastapi 0.112.4`, `kerykeion 4.25.3`, `pydantic 2.11.10`, `pyswisseph 2.10.3.2`, `uvicorn 0.34.3` all installed).

**Attempt 1 — start the full server:**
```
uvicorn app.main:app --host 127.0.0.1 --port 8123
```
**Failed at import time**, before any HTTP request could be sent:
```
File "app/services/file_conversion.py", line 7, in <module>
    import cairosvg
...
OSError: no library called "cairo-2" was found
no library called "cairo" was found
no library called "libcairo-2" was found
cannot load library 'libcairo-2.dll': error 0x7e. ... did not manage to locate a library called 'libcairo-2.dll'
```
Root cause: `cairosvg`→`cairocffi` needs the native Cairo graphics library, which is not present on stock Windows (would need a GTK runtime / MSYS2 install, a system-level change outside this audit's scope). **This is a pre-existing, self-documented limitation** — `memory-bank/techContext.md` already states: *"System Dependencies: CairoSVG requires system libraries (cairo, pango, etc.) to be installed on the host system, which might affect deployment options."* This is a real architecture weakness worth flagging on its own: `app/core/dependencies.py` eagerly imports `FileConversionService` (and therefore `cairosvg`) at module load time for *all* routers, so even the pure-JSON natal-calculation endpoint cannot start the app if the SVG/image conversion dependency is unavailable — poor separation of concerns (see §9).

Running `pytest` reproduces the same failure for every test file that imports `app.main` (5 of 7 test files fail to even collect, `OSError: no library called "cairo-2"...`), confirming the whole HTTP surface — not just visualization — is blocked by this one native dependency in this environment.

**Attempt 2 — bypass the broken import chain and verify the calculation core directly**, using the audit's benchmark input (1985-03-12, 08:30, Hanoi, lat 21.0285, lon 105.8542, UTC+7 → `tz_str="Asia/Ho_Chi_Minh"`):
```python
from app.services.astrology import AstrologyService
svc = AstrologyService()
result = svc.calculate_natal_chart(
    name="Benchmark", birth_date=datetime(1985,3,12,8,30),
    lat=21.0285, lng=105.8542, tz_str="Asia/Ho_Chi_Minh", houses_system="P")
```
**This succeeded** and produced real Swiss-Ephemeris output — actual verified output, not fabricated:
```
NAME: Benchmark
NUM PLANETS: 16
  Sun Pis 21.42 house 11 retro False
  Moon Sag 0.0 house 7 retro False
  Mercury Ari 8.42 house 12 retro False
  Venus Ari 22.24 house 12 retro False
  Mars Ari 27.71 house 12 retro False
NUM ASPECTS: 40
  Sun trine Saturn orb -6.687177216021638
  Sun square Uranus orb 3.4882382425408878
  Sun sextile Mean_Node orb 0.016582676875316338
  Sun quintile Chiron orb 0.3702075982537849
  Sun sextile Medium_Coeli orb -4.581901223441491
HOUSE SYSTEM: name='Placidus' identifier='P'
```
This confirms the core Kerykeion/pyswisseph calculation logic genuinely works and computes real planetary/house/aspect data for the exact benchmark input requested.

**LLM path:** No Gemini API key is available in this environment, and per instructions no real API call was attempted. Instead, the prompt-construction code path was verified directly by reading `app/services/interpretation.py` in full (quoted verbatim in §5.4) — this shows exactly what would be sent to Gemini without needing to execute the network call.

**Verdict for §7:** Calculation core — **VERIFIED BY EXECUTION** (real output above). Full HTTP server / natal API endpoint / test suite — **NOT VERIFIED BY EXECUTION**, blocked by: `OSError: no library called "cairo-2" was found` (missing native Cairo library for `cairosvg`, a Windows-environment/system-dependency issue, not fundamentally a code bug, though the eager cross-module import that lets an unrelated SVG dependency block the whole app is a design flaw). LLM interpretation call — **NOT VERIFIED BY EXECUTION** (no API key available); prompt-construction code verified by direct source read instead. Interpretation API endpoint bug (§5.7) — **VERIFIED BY EXECUTION** (schema validation reproduced directly, independent of the cairo blocker).

---

## 8. Maintenance

The local clone is a **shallow clone with only 1 commit** (`.git/shallow` present, `git rev-list --count HEAD` → `1`), so `git log`/`git shortlog`/`git tag` on this clone are not representative of true project history:
```
git log -1        → d610c74e1e863d3ba61b49362aab115c61f0e9be, "chore: added DEMO.md documentation for presentation", 2025-05-16
git log --oneline -20 → only the 1 shallow commit visible
git shortlog -sn  → empty (shallow history)
git tag           → empty (no tags fetched in shallow clone)
```
**CHANGELOG.md corroborates real version history** (semantic-release generated, with commit hash links), spanning:
```
v0.1.0 (2025-04-01)
v0.2.0 (2025-04-28)
v0.3.0 (2025-04-29)
v0.4.0 (2025-05-11)
v0.5.0 (2025-05-11)
v0.6.0 (2025-05-11)
v0.6.1 (2025-05-16)
v0.7.0 (2025-05-16)
```
This shows an intense **6-week burst of activity** (April 1 – May 16, 2025, 8 releases) followed by **silence since 2025-05-16** — over a year with no visible activity as of today (2026-09-13). `.github/workflows/semantic-release.yml` exists, indicating CI was set up for versioning, but there's no evidence (from this clone) of any commits after the DEMO.md addition.

**Classification: EXPERIMENTAL / ABANDONED.** The commit cadence, README self-description, and DEMO.md ("Presentation Materials: Demonstration flow highlighting key features and AI integration") all point to this being a short, intensive **course/bootcamp capstone or portfolio project** built in about six weeks and then left as-is post-demo. No indication of ongoing maintenance, issue triage, or a release since. (Caveat: this assessment is based on the shallow local clone plus CHANGELOG.md; confirming true current activity would require checking the live GitHub repository's commit graph, which is out of scope for this offline code audit.)

---

## 9. Code Quality Scores (0-10)

| Dimension | Score | Justification |
|---|---|---|
| Architecture | 5/10 | Sensible layered structure (`api/` → `services/` → `core/`, versioned `/api/v1/`), documented in `memory-bank/systemPatterns.md` — but the interpretation pipeline is architecturally disconnected from the structured-calculation pipeline (§5.2), and `app/core/dependencies.py` couples unrelated services at import time (any one failing import, e.g. `cairosvg`, breaks unrelated endpoints — verified in §7). |
| Modularity | 6/10 | Clear per-feature routers (`app/api/v1/routers/charts/{natal,synastry,composite,transit,visualization,interpretations,reports}.py`) and per-concern services (`AstrologyService`, `ReportService`, `InterpretationService`, `GeoService`, `ChartVisualizationService`, `FileConversionService`) — good separation in principle, undermined by the eager cross-imports noted above. |
| Typing | 6/10 | Pydantic v2 models used consistently for request/response schemas (`app/schemas/*.py`), type hints present on most function signatures (`app/services/astrology.py`, `app/services/report.py`) — but return types are frequently loose (`Dict[str, Any]` in `InterpretationService.interpret_natal_chart`, `app/services/interpretation.py:57`) where a typed model would catch the exact bug found in §5.7 at development time rather than at runtime. |
| Documentation | 6/10 | Extensive docstrings on almost every function/class (e.g., `app/services/astrology.py`, `app/services/report.py`) and a genuinely useful `memory-bank/` (see below) — but documentation actively overstates capability (README's "Synastry Analysis," "Composite Charts" feature claims vs. 501 stubs in `app/api/v1/routers/charts/{synastry,composite}.py`). |
| Separation of concerns | 4/10 | The interpretation layer directly manipulates presentation-oriented ASCII text (`app/services/report.py`'s string-slicing of `Report.get_full_report()`) rather than depending on the already-structured `AstrologyService` output — a clear violation of separation between calculation and presentation. `InterpretationService` also does markdown-to-HTML conversion and heading-based text scraping (business logic mixed with formatting), `app/services/interpretation.py:126-156`. |
| Extensibility | 5/10 | `llm_provider` parameter suggests multi-provider design, but only Gemini is actually wired up (§5.4) — the abstraction exists in name only. House-system mapping (`ReportService._map_house_system`) is a clean, easily extensible dict-based design, by contrast. |
| Error handling | 5/10 | Custom exception classes exist (`app/core/exceptions.py`: `ChartCalculationError`, `InvalidBirthDataError`, `LocationError`) with a centralized handler (`app/core/error_handlers.py`, 136 lines, maps exceptions to structured JSON error responses) — reasonably good pattern. But interpretation endpoints use blanket `except Exception as e: raise HTTPException(...str(e)...)` (`app/api/v1/routers/charts/interpretations.py:124-128,204-208`), which is how the schema-mismatch bug (§5.7) is silently swallowed into a generic 500 instead of failing fast in development/tests. |

**"memory-bank" clarification (checklist item 1):** `memory-bank/` is **not** a vector store, RAG memory, or cached-interpretation store. Reading its five files (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`) confirms it is a set of **plain-Markdown project-management/design-journal notes** — architecture decisions, tech stack rationale, "planned improvements," and current-work-in-progress notes, apparently maintained as a persistent context file for an AI coding assistant (the note "*Note: Currently troubleshooting issues with reliably loading values from `.env`*" and "*(Planned)*" annotations throughout read exactly like a developer's running log for themselves/an AI pair-programmer, not application data or a retrieval index used at runtime by the app itself). It is not imported or referenced anywhere in `app/`.

---

## 10. Security Notes

- **No `eval`/`exec`/`pickle`/`subprocess`/`os.system` usage anywhere in the repo** — grep across the full tree for `eval\(|exec\(|pickle|subprocess|os\.system|shell=True` returned zero matches. No unsafe deserialization surface found.
- **API key handling:** `LLM_API_KEY` is read from environment/`.env` via `pydantic-settings` (`app/core/config.py:16`), never hardcoded, never committed (`.gitignore` present, `.env` is not tracked and none was found in the repo). This is correct practice.
- **CORS is wide open by default:** `app/main.py:112-119`:
  ```python
  application.add_middleware(
      CORSMiddleware,
      allow_origins=settings.allowed_origins_list,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
  combined with the documented default `.env` value `ALLOWED_ORIGINS="*"` (from `memory-bank/techContext.md`'s example `.env`). `allow_origins=["*"]` together with `allow_credentials=True` is a well-known misconfiguration (browsers will actually reject the literal combination, but it signals the default config was never hardened for production — should be an explicit origin allowlist before any commercial deployment).
- **Input validation:** Request bodies are validated via Pydantic models throughout (`NatalChartRequest`, `SynastryReportRequest`, `InterpretationRequest`, etc. in `app/schemas/`) — good baseline validation of types/required fields. However, there is **no content/length sanitization** on free-text fields like `name` before they flow into the LLM prompt and back out into rendered HTML (next point).
- **Prompt-injection / stored-XSS surface, confirmed by code trace:** the user-supplied `name` field (`NatalChartRequest.name`, unsanitized `str`) flows: `AstrologicalSubject(name=name, ...)` → Kerykeion's `Report` title `f"Kerykeion report for {name}"` (`app/services/report.py:104`) → `NatalReportData.title` → interpolated into the Gemini prompt as `{title}` (`app/services/interpretation.py:96-97,241,262`) → Gemini's markdown response → `markdown.markdown(markdown_text, extensions=[...])` → HTML → rendered in the browser with **no escaping**:
  ```
  app/templates/fragments/interpretation.html:9:  {{ interpretation_html | safe }}
  ```
  The Jinja2 `|safe` filter explicitly disables autoescaping for this content. Because the pipeline is Chart→LLM with no sanitization of either the user-controlled input going in or the LLM's markdown-to-HTML output coming out, a user who submits a crafted `name` (or relies on the LLM echoing/generating unexpected markup, e.g. an image tag or link syntax that the `markdown` library renders into an `<a>`/`<img>` tag) has a realistic path to injected HTML being rendered unescaped in another user's — or their own but attacker-controlled-content — browser session. This should be re-architected (escape/sanitize the LLM output, e.g. with `bleach`, before `|safe`, and never mark AI-model output as safe by default) before any commercial use.
- **Outbound network calls use plain HTTP, not HTTPS**, for the GeoNames integration: `app/services/geo_service.py:52-53`:
  ```python
  self.base_url = "http://api.geonames.org/searchJSON"
  self.timezone_url = "http://api.geonames.org/timezoneJSON"
  ```
  City/location search queries (potentially containing user-identifying birth-place data) are sent unencrypted. Low severity (GeoNames' free API historically only offers HTTP for the free tier) but worth hardening for a commercial deployment (self-host a geocoding service or use an HTTPS-only provider instead).
- **Verbose debug logging:** `app/main.py:14-17` sets `logging.basicConfig(level=logging.DEBUG, ...)` unconditionally in application code (not gated by an environment flag), and `app/services/geo_service.py:42` logs the GeoNames username at debug level (`self.logger.debug(f"Settings GEONAMES_USERNAME value: '{settings.GEONAMES_USERNAME}'")`). Not a secret exposure in itself (GeoNames usernames aren't sensitive credentials), but it's a pattern (unconditional DEBUG logging of settings values) that would leak real secrets if applied carelessly to `LLM_API_KEY` elsewhere — worth a lint rule before commercial deployment.

---

## 11. Tier Recommendation

### Tier: **D — Experimental**

Justification, tied directly to the findings above:

- **AI architecture (the deciding factor):** This repo implements "Chart→LLM," the exact anti-pattern the target commercial project wants to avoid. There is no factors/rules layer to borrow architecturally, and the one existing interpretation code path has a confirmed, execution-verified bug (§5.7) that means it has plausibly never worked in production as shipped. This alone disqualifies it from Tier A/B (Foundation/Reference) for the interpretation layer.
- **Calculation layer is genuinely solid** (Tier-B-worthy on its own): the Kerykeion/pyswisseph integration is real, tested, and independently verified by execution in this audit to produce correct-shaped planetary/house/aspect data for the exact benchmark birth data requested. If the target project needs a quick reference for "how do I call Kerykeion/Swiss Ephemeris from FastAPI with Pydantic schemas," this repo is a legitimate, workable example (`app/services/astrology.py`).
- **License is unresolved** (LEGAL REVIEW REQUIRED) — no LICENSE file exists, and the README admits the MIT claim was never finalized. This alone would cap the tier at "reference only, do not vendor code" regardless of technical quality.
- **Security gaps** (open CORS default, unsanitized LLM-output-to-HTML `|safe` rendering, plaintext GeoNames calls) mean nothing here should be deployed as-is even for the calculation-only parts without hardening.
- **Maintenance status** (single 6-week burst, over a year of silence, shallow-clone/portfolio-project signals) means no expectation of upstream fixes, security patches, or continued compatibility.

**Practical recommendation for the phong-thủy project:** Use this repo only as a **negative example / cautionary reference** for the AI-interpretation layer (to point at concretely when explaining to stakeholders *why* a dumb "dump the chart at an LLM" approach is inadequate), and optionally as a loose implementation reference for the Kerykeion/Swiss-Ephemeris calculation wiring — re-implemented independently rather than copied, pending resolution of the licensing question directly with the upstream author or GitHub repo.
