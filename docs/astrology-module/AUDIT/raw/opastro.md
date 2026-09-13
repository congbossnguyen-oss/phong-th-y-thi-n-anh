
# Source-Code Audit: dakidarts/opastro

Repo: `C:\ccaudit\repos\opastro` (GitHub: dakidarts/opastro), audited at commit `49276a0` ("fix release formatting"), tag `v0.1.9`, shallow clone (1 commit visible).

---

## 1. Summary Verdict

Opastro is a **real, working, deterministic astrology calculation and templated-interpretation engine with zero AI/LLM integration anywhere in the codebase** — not "no interpretation," but explicitly **"Chart → Factors → Rules → Interpretation," full stop, no LLM step exists or is even stubbed out.** It computes genuine Swiss Ephemeris positions (verified by actually running it for the benchmark birth data), derives a structured, typed `FactorDetail`/`SectionInsight` model per section, and renders final prose through ~4,500 lines of deterministic Python phrase-composition logic (`src/horoscope_engine/interpretation/renderer.py`) seeded by SHA-256 hashes of `(period, sign, date, section)` for reproducibility — never by a language model, and never randomly. The project's own README and `docs/04-architecture.md` accurately describe this as a "deterministic pipeline," and that claim held up under code inspection and live execution — a rare case where the README does **not** oversell the AI story, because there is no AI story to oversell. The single most consequential finding for a commercial SaaS is **not** the architecture (which is good and matches the desired Chart→Factors→Rules pattern) but the **license stack**: the repo itself is MIT, but its core astronomical dependency, `pyswisseph`, ships under the **GNU AGPL-3.0** (verified directly from the installed package's bundled `LICENSE.txt`), which is a network-copyleft license with serious implications for any closed-source commercial SaaS — this requires **LEGAL REVIEW REQUIRED** before any commercial use, independent of anything else in this audit. For a Vietnamese phong-thủy site, this is useful primarily as **Tier B (Reference)**: a very well-architected reference implementation of the "factors → rules → text" layering pattern to *copy the architecture from*, and a working Swiss Ephemeris wrapper to study — but it should not be vendored directly into a commercial product without resolving the AGPL question, and its content (English-language Western tropical/sidereal astrology, zodiac-sign based, not Vietnamese/Bazi/Tử Vi) is not directly reusable for a phong-thủy product without a full content rewrite anyway.

---

## 2. License

**Repo license — exact text from `LICENSE` (root):**

```
MIT License

Copyright (c) 2026 Dakidarts

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: ...
```

Secondary confirmation: `setup.cfg` → `[metadata] license = MIT`.

**Assessment of opastro's own code: MIT is fully commercial/closed-source-SaaS compatible** — permissive, no copyleft, no attribution-in-UI requirement beyond retaining the notice in redistributed copies of the software itself.

**CRITICAL — LEGAL REVIEW REQUIRED: `pyswisseph` (the Swiss Ephemeris Python binding) is licensed under GNU AGPL-3.0, not MIT.**

This is not a README claim — it was verified directly from the actually-installed package after `pip install pyswisseph==2.10.3.2`:

```
/pyswisseph-2.10.3.2.dist-info/licenses/LICENSE.txt:
                    GNU AFFERO GENERAL PUBLIC LICENSE
                       Version 3, 19 November 2007
```

`requirements.txt` and `setup.cfg` both pin `pyswisseph>=2.10.3` as a hard, non-optional runtime dependency — `src/horoscope_engine/ephemeris.py:9` does `import swisseph as swe` unconditionally, and it is the sole calculation backend (no fallback pure-Python ephemeris exists). This means:

- The AGPL is a **network-copyleft** license: if a derivative/combined work is made available to users over a network (i.e., exactly the phong-thủy SaaS use case), the AGPL requires that the *complete corresponding source* of the combined work be made available to those users, under AGPL terms, on request.
- Swiss Ephemeris publisher Astrodienst AG is well known to also offer a **commercial/professional license** as an alternative to AGPL compliance (this is public knowledge about the Swiss Ephemeris licensing model; it was not independently re-verified in this audit beyond reading the bundled AGPL text, so treat the *existence and current terms* of that commercial option as **UNKNOWN / NOT VERIFIED** — confirm directly with Astrodienst/astro.com before relying on it).
- The raw ephemeris **data files** bundled in `data/ephemeris/seas_18.se1` and `data/ephemeris/ast136/s136199s.se1` (and the `sefstars.txt` fixed-star catalogue referenced but not bundled) are separate Astrodienst-published data artifacts with their own usage terms; these were **not** independently re-verified in this audit and should be checked as part of the same legal review.

**Recommendation:** Before using opastro's calculation layer (or `pyswisseph` directly, which you would need regardless of whether you use opastro) in a closed-source commercial SaaS, obtain a written commercial/professional license from Astrodienst, or architect the deployment so that the AGPL-triggering component runs as a **network-isolated internal service whose full source you are willing to publish**, or replace it with a differently-licensed ephemeris (there are no drop-in alternatives with matching precision that are not similarly encumbered — most professional-grade ephemeris backends trace back to Swiss Ephemeris or JPL DE data with their own terms). This finding applies **regardless of whether you use opastro's code at all** — it is a property of the Swiss Ephemeris library itself, which almost any serious Western-astrology engine will depend on.

---

## 3. Dependencies

From `requirements.txt` / `setup.cfg` (all loose `>=` lower-bound pins, no upper bounds, no lockfile committed):

| Package | Pin | Role | Freshness note |
|---|---|---|---|
| `pyswisseph` | `>=2.10.3` | **Astronomical calculation backend** (Swiss Ephemeris binding) — the only ephemeris engine used | AGPL-3.0 licensed (see §2). Installed fine on Python 3.14 during this audit (version resolved: 2.10.3.2). |
| `fastapi` | `>=0.104.0` | HTTP API (`api.py`, `main.py`) | Resolved to 0.141.1 in a fresh install — wide range, actively maintained upstream. |
| `uvicorn[standard]` | `>=0.24.0` | ASGI server | Resolved to 0.52.4. |
| `httpx` | `>=0.25.0` | Used for FastAPI `TestClient` in tests and any outbound HTTP | Resolved to 0.28.1. |
| `pydantic` | `>=2.4.0` | Data models/validation (`models.py`) | Resolved to 2.13.5 — good, modern Pydantic v2 usage throughout. |
| `redis` | `>=5.0.0` | Optional cache backend (`cache.py`) | Resolved to 8.1.0. |
| `python-multipart` | `>=0.0.6` | FastAPI form/file upload support | — |
| `cairosvg` | `>=2.7.1` | SVG→PNG rendering for natal wheel charts (`scene_renderer.py`) | Pulls in `cairocffi`/`pillow`; functioned correctly in this audit (PNG output verified). |
| `reportlab` | `>=4.1.0` | PDF report generation | Functioned correctly (valid `%PDF` output verified). |
| `tqdm` | `>=4.66.0` | CLI progress bars | Cosmetic only. |

Dev-only (`requirements-dev.txt`): `pytest>=8.0.0`, `ruff>=0.6.0`, `build>=1.2.0`, `twine>=5.0.0`, `pip-audit>=2.10.1` (the presence of `pip-audit` in dev deps suggests the maintainers do think about dependency vulnerability scanning, a positive sign).

**No LLM/AI SDKs of any kind** (`openai`, `anthropic`, `langchain`, `transformers`, `ollama`, or any local-model loader) appear anywhere in `requirements.txt`, `requirements-dev.txt`, `setup.cfg`, or any `import` statement in `src/`. A full-repo case-insensitive grep for `openai|anthropic|gpt-|langchain|llm|prompt|completion(|transformers|ollama|claude` across all `.py` files returned only false positives (CLI argparse "prompt" helpers, tab-completion code, a string `.partition("?")` variable locally named `prompt`) — no network calls to any LLM provider exist.

**Freshness/pinning assessment:** all pins are loose lower bounds (`>=`) with no upper bound and no `requirements.lock`/`poetry.lock`/`uv.lock` committed — this is a real reproducibility risk (a `pip install -r requirements.txt` today pulled FastAPI 0.141.1 and Pydantic 2.13.5, versions that plausibly did not exist when `>=0.104.0`/`>=2.4.0` were written), but none of the resolved versions are abandoned or obviously insecure; all are actively maintained mainstream packages as of this audit.

---

## 4. Calculation Feature Table

| Feature | Status | Citation |
|---|---|---|
| Planets (Sun–Pluto) | **SUPPORTED** | `src/horoscope_engine/ephemeris.py:31-42` (`MAJOR_BODIES` list), `EphemerisEngine.get_positions()` |
| Minor bodies: Chiron, Ceres, Pallas, Juno, Vesta, Lilith (Mean Apogee), Eris | **SUPPORTED** (auto-probed for ephemeris-file availability) | `ephemeris.py:47-57` (`_MINOR_BODY_CANDIDATES`), `_probe_minor_body()` (`ephemeris.py:60-81`) |
| North/South Lunar Node (true or mean) | **SUPPORTED**, switchable | `ephemeris.py:132` (`self._node_id = swe.TRUE_NODE if config.node_type=="true" else swe.MEAN_NODE`) |
| Tropical zodiac | **SUPPORTED** | `ephemeris.py:148-149` (`_use_tropical`) |
| Sidereal zodiac + ayanamsa (Lahiri default) | **SUPPORTED** | `ephemeris.py:405` (`swe.set_sid_mode`), `config.py:44` (`sidereal_mode: int = swe.SIDM_LAHIRI`) |
| Houses (Placidus default, configurable house system code) | **SUPPORTED** | `ephemeris.py:419` (`swe.houses_ex(..., self.config.house_system.encode(), ...)`), verified live: benchmark run returned `"house_system": "P"` with 12 real cusp longitudes |
| Aspects (conjunction, opposition, trine, square, sextile, quincunx, semi-sextile, semi-square, sesquiquadrate) with configurable orbs | **SUPPORTED** | `ephemeris.py:98-108` (`ASPECTS` dict), `_calc_aspects()` (`ephemeris.py:281-311`) |
| Retrograde detection | **SUPPORTED** | `ephemeris.py:241,274` (`retrograde=speed_s < 0`) |
| Fixed stars (Regulus, Spica, Algol, etc.) | **SUPPORTED**, conditional on `sefstars.txt` presence | `ephemeris.py:110-122` (`FIXED_STARS`), `get_fixed_stars()` (`ephemeris.py:313-342`); requires manual install per `docs/10-factor-drivers-reference.md` |
| Arabic Parts (Part of Fortune, Part of Spirit) | **SUPPORTED** | `ephemeris.py:344-394` (`get_arabic_parts`), verified against day/night birth formula switch |
| Transits / period events (ingress, station, lunation, eclipse windows) | **SUPPORTED** | `src/horoscope_engine/aggregation.py:271-500` (`aggregate_period`), event de-duplication/clustering logic |
| Synastry (two-chart comparison, aspect scoring, house overlays) | **SUPPORTED** | `src/horoscope_engine/models.py:465-499` (`SynastryRequest`, `SynastryAspect`, `SynastryOverlay`, `SynastryScore`), synastry computation in `service.py` (chart-pair aspect loop ~line 1390-1620) |
| Progressions | **NOT PRESENT** — no secondary-progression or solar-arc code found anywhere in `src/` (grep for "progress" returns only unrelated UI-progress-bar hits) | — |
| Natal chart wheel rendering (SVG/PNG) | **SUPPORTED** | `src/horoscope_engine/scene_renderer.py` (1,323 lines); verified live: produced valid `<svg>` and `\x89PNG` output for the benchmark birth data |
| Natal PDF report export | **SUPPORTED** | `src/horoscope_engine/natal_artifacts.py` + `reportlab`; verified live: valid `%PDF` header produced |
| Structured "factor" extraction (deterministic facts about the chart) | **SUPPORTED** | `src/horoscope_engine/models.py:416-420` (`FactorDetail`), `interpretation/renderer.py` `InterpretationEngine._factor_specs`/`calculate_period_factor_map` |
| Deterministic rules → interpretation themes | **SUPPORTED** | `src/horoscope_engine/interpretation/rules.py` (`RuleSet`, `sign_tone`/`section_weights`/`planet_keywords`/`aspect_keywords`), `data/rules/default_rules.json` |
| LLM-generated narrative | **NOT PRESENT** | (see §5) |

---

## 5. AI/Interpretation Architecture Analysis (key section)

### 5.1 Overall pipeline, traced end-to-end

The pipeline is laid out explicitly in `docs/04-architecture.md` and matches the actual code exactly:

```
1. Resolve runtime config and ephemeris mode
2. Build period time window (daily/weekly/monthly/yearly)
3. Compute celestial snapshots/events with Swiss Ephemeris   -> ephemeris.py
4. Aggregate period metrics and notable events                -> aggregation.py
5. Derive factor map per period/section                        -> interpretation/renderer.py (InterpretationEngine)
6. Render section insights with the "open-core lite narrative layer" -> interpretation/renderer.py
7. Return response and cache by deterministic key               -> service.py, cache.py, cache_keys.py
```

I traced this by reading `service.py` (`HoroscopeService`, 1,646 lines) and confirmed the call order in the actual `generate()`-style methods (e.g. lines ~280-340 for the daily path): `ephemeris.chart_snapshot()` → `aggregation.aggregate_period()` → `interpreter.calculate_period_factor_map()` → `interpreter.build_section_insights()`. There is no branch anywhere in `service.py`, `api.py`, or `cli.py` that calls out to any HTTP LLM endpoint or local model — confirmed by a full grep of `src/` for `openai|anthropic|gpt|llm|completion|chat` (see §3) and by manual reading of every non-trivial module listed in the folder tree.

### 5.2 Is there a structured "Factors" extraction step before any text generation? — YES

`src/horoscope_engine/models.py:416-420`:

```python
class FactorDetail(BaseModel):
    factor_type: str
    factor_value: str
    weight: float
    factor_insights: Dict[str, str] = Field(default_factory=dict)
```

Factors are computed purely from ephemeris output — e.g. `sun_in_sign`, `moon_in_sign`, `aspects` (value = aspect name like `trine`), `daily_house_focus`, `retrograde_archetypes`, `eclipse_archetypes`, `nodal_axis`, etc. — enumerated and documented in `docs/10-factor-drivers-reference.md` and computed in `InterpretationEngine._factor_specs` (`interpretation/renderer.py`, class starting at line 1239, `FactorSpec` dataclass at line 1232-1236). This is a genuine structured intermediate representation, not a formatting convenience: it is built **before** any prose is composed and is independently inspectable (see §5.4, the `explain` command).

This is exactly the kind of "Mars square Saturn in 10th house as structured data" step the audit brief asked about — concretely, in the benchmark run, the daily factor map for Pisces on 1985-03-12 came back as:

```
sun_in_sign=PISCES, moon_in_sign=SAGITTARIUS,
transits_archetypes=retrograde_review, aspects=trine
```
(each with its own `weight` — see the `explain` output quoted in §5.4).

### 5.3 Is there a rules layer independent of any LLM? — YES, and it is the *only* text-generation mechanism in the repo

Two complementary rule mechanisms exist:

**(a) A JSON lookup-table ruleset**, `src/horoscope_engine/interpretation/rules.py`:

```python
@dataclass(frozen=True)
class RuleSet:
    sign_tone: Dict[str, str]
    section_weights: Dict[str, Dict[str, float]]
    planet_keywords: Dict[str, List[str]]
    aspect_keywords: Dict[str, str]

def load_rules(path: Path) -> RuleSet:
    payload = json.loads(path.read_text())
    return RuleSet(
        sign_tone=payload["sign_tone"],
        section_weights=payload["section_weights"],
        planet_keywords=payload["planet_keywords"],
        aspect_keywords=payload["aspect_keywords"],
    )
```
backed by `data/rules/default_rules.json` (also packaged at `src/horoscope_engine/data/default_rules.json`), e.g. `"aspect_keywords": {"conjunction": "intensifies", "opposition": "balances", "trine": "supports", ...}` and `"section_weights": {"love": {"Venus": 1.0, "Moon": 0.7, "Mars": 0.6, "Juno": 0.5}, ...}`.

**(b) A large deterministic if/then phrase-composition engine**, `InterpretationEngine` in `interpretation/renderer.py` (4,475 lines total). Representative excerpt (`_lite_meaning_line`, lines 1488-1531):

```python
def _lite_meaning_line(self, factor_type: str, factor_value: str, section: Section) -> str:
    readable = self._readable_factor_value(factor_value)
    if factor_type == "sun_in_sign":
        return self._ensure_terminal(f"Sun in {factor_value.title()} sets the baseline tone for this cycle")
    if factor_type == "moon_in_sign":
        return self._ensure_terminal(f"Moon in {factor_value.title()} shapes emotional timing and response")
    ...
    if factor_type == "aspects":
        return self._ensure_terminal(f"Aspect climate is centered on {readable}, shaping pressure and flow")
    return self._ensure_terminal(f"{factor_type.replace('_', ' ').title()} is currently {readable}")
```

Sibling methods `_lite_reflection_line`, `_lite_caution_line`, `_lite_action_line` follow the same pure if/elif pattern keyed on `factor_type`/`factor_value`/`section`. Phrase *selection among variants* (where multiple pre-written lines exist) is done via a **SHA-256-seeded stable index**, not randomness and not a model — `content_repository.py:20-24`:

```python
def stable_index(seed: str, size: int) -> int:
    if size <= 0:
        return 0
    digest = hashlib.sha256(seed.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big") % size
```

The optional "premium" content pack mechanism (`V2ContentRepository`, `content_repository.py`, 315 lines) is a **filesystem-based JSON template lookup** — it walks `period/sign/section/factor_type/factor_value/intensity/*.json` directories and deterministically hash-selects one of several pre-written variant blocks (`_select_specific`, `_select_any_value_for_factor_type`, `_select_fallback_any_factor`). This is a templated-content system, not a generative one; opastro itself ships no premium content packs (the README says richer packs are sold separately via `numerologyapi.com`), but the mechanism for consuming them is still pure lookup/selection, never generation.

**This means the entire text output of the engine could be — and by design is — produced with zero AI calls.** This was directly confirmed by execution (see §7): the CLI produced full daily-horoscope markdown output and a full natal chart with wheel SVG/PNG/PDF using nothing but the local Python process and the bundled ephemeris files; no network egress occurred, and no API key was requested.

### 5.4 Is there any LLM call anywhere? — NO. Is there an explainability/evidence/citation mechanism? — YES, and it is unusually good

There is a first-class `opastro explain` CLI command whose entire purpose is to expose factor provenance for every line of generated text. Live output for the benchmark date (daily/PISCES/1985-03-12), via `opastro explain --kind horoscope --period daily --sign PISCES --target-date 1985-03-12 --json`:

```json
{
  "highlights": [
    {
      "line": "This review cycle rewards cleanup before new commitments.",
      "source_factors": ["transits_archetypes", "aspects"],
      "why": "Transits Archetypes is currently retrograde review."
    }
  ],
  "factors": [
    {
      "factor_type": "sun_in_sign",
      "factor_value": "PISCES",
      "weight": 1.0,
      "why": "Sun in Pisces sets the baseline tone for this cycle.",
      "reflection": "Keep decisions aligned with priority, not noise.",
      "caution": "Avoid overextending before priorities are clear.",
      "action_hint": "Take one practical step that supports your overall direction."
    },
    {
      "factor_type": "aspects",
      "factor_value": "trine",
      "weight": 1.2,
      "why": "Aspect climate is centered on trine, shaping pressure and flow.",
      ...
    }
  ]
}
```

Every rendered sentence in `highlights`/`cautions`/`actions` carries a `source_factors` list tying it back to the exact `factor_type` that produced it, and every `factor` entry carries its own numeric `weight` and the literal template line ("why") used. This is a genuinely traceable "output claim → rule → factor → chart placement" chain, implemented in `cli.py`'s `_handle_explain`-style command and backed by the same `FactorDetail` objects used internally — it is not a cosmetic add-on. This is exactly the property a defensible "explainable" interpretation layer needs, and it is verified working, not just documented.

### 5.5 Deterministic or probabilistic? Confidence scoring?

**Fully deterministic.** Confirmed three ways: (1) code reading — every phrase-selection path uses `stable_index()` (SHA-256 hash) or a static if/elif on factor type/value, never `random`; (2) `docs/04-architecture.md` explicitly states "Determinism Guarantees: Stable factor ordering by period / Stable seeded phrase selection / Stable cache-key generation / Same input contract -> same output shape and deterministic phrasing choice path"; (3) `tests/test_cli.py` contains literal **golden-snapshot SHA-256 hash assertions** on full CLI output (e.g. `test_golden_snapshot_welcome_output` asserts the welcome-screen output hashes to an exact fixed digest), which would be impossible to write if output were non-deterministic.

There is no probability/confidence score anywhere in `models.py` output schemas — sections carry a `scores: Dict[str, float]` (planet-weight-derived section intensity, e.g. "elevated"/"steady") and an `intensity: str` label, but these are deterministic weighted sums (`_score_section`, `_intensity` in `renderer.py`), not statistical confidence in any probabilistic sense.

### 5.6 Explicit verdict

**"Chart → Factors → Rules → Interpretation" (strong on the deterministic side), with NO LLM step present or possible in this codebase.** It is not "Chart→LLM" (there is no LLM to hand facts *or* raw data to), and it is not merely "static templates with no rules" — there is a real, inspectable, weighted rules/scoring layer (`section_weights`, `BODY_IMPORTANCE`, `_event_priority`, `_score_section`) sitting between the raw chart and the final phrase selection. If forced to pick one of the four brief-provided buckets, the closest is **"Chart→Factors→Rules→Interpretation→LLM" architecture minus the LLM stage** — i.e., it has built exactly the pre-LLM half of that pipeline (facts + rules + structured, explainable interpretation) and simply stops there; it would be straightforward to bolt an LLM "final polish" stage onto the *end* of this pipeline (feeding it the `FactorDetail`/`SectionInsight` objects as structured context) without disturbing anything, which is precisely the architecture pattern a commercial AI-narrative layer should aspire to.

---

## 6. Test Audit

**Not** "NO TEST SUITE FOUND" — there is one substantial test file, `tests/test_cli.py` (1,605 lines, ~65 test functions), run via `pytest.ini`/`pyproject.toml` (`pythonpath = src`). No dedicated `test_ephemeris.py`/`test_aggregation.py`/`test_renderer.py` unit-test files exist — everything is exercised indirectly through the CLI/API entry points, which is a real coverage-granularity limitation (bugs deep in `renderer.py`'s ~600 branch conditions are only caught if they change CLI-visible output).

Representative real test names and assertions, quoted verbatim from `tests/test_cli.py`:

- `test_explain_json_output_contains_factor_provenance` — asserts `payload["sections"][0]["factors"]` exists and contains `"factor_type"` (direct test of the explainability mechanism described in §5.4).
- `test_golden_snapshot_welcome_output` — asserts a full CLI screen's output hashes to the exact literal `"493352ea07528ef67b4828d101f25cddc8790d5cf4289ad64d85f7f22cc725b2"` (hard-coded SHA-256 regression test — direct proof of the determinism claim).
- `test_natal_command_exports_svg_png_map_pdf` — asserts `wheel_svg.read_text().lstrip().startswith("<svg")`, `wheel_png.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"`, `report_pdf.read_bytes().startswith(b"%PDF")`.
- `test_celestial_events_ics_output` — asserts iCalendar export starts with `"BEGIN:VCALENDAR\r\n"` and contains `"PRODID:-//OpAstro//Celestial Events//EN"`.
- `test_analytics_opt_in_tracks_anonymized_events` — asserts opt-in analytics logs contain no `cwd`/`argv` fields (a privacy-conscious test).
- `test_doctor_json_output` — asserts the `opastro doctor` diagnostic command reports `runtime_ok`, `dependencies`, `python_executable`, etc.

## 7. Execution Attempt Results

**Environment:** fresh venv at `C:\ccaudit\venv_opastro`, Python 3.14.6 (Windows). Commands run (all succeeded except where noted):

```
python -m venv C:\ccaudit\venv_opastro
python -m pip install -r requirements.txt          # succeeded, resolved fastapi 0.141.1, pyswisseph 2.10.3.2, pydantic 2.13.5, etc.
python -m pip install tzdata                        # required — see blocker below
python -m horoscope_engine natal --birth-date 1985-03-12 --birth-time 08:30 \
    --lat 21.0285 --lon 105.8542 --timezone "Asia/Ho_Chi_Minh" \
    --include-fixed-stars --include-arabic-parts --json
```

**Blocker encountered and resolved:** the initial run failed with `Value error, Timezone must be a valid IANA timezone` for `Asia/Ho_Chi_Minh` — root cause confirmed via `python -c "import zoneinfo; zoneinfo.ZoneInfo('Asia/Ho_Chi_Minh')"` → `ERR 'No time zone found with key Asia/Ho_Chi_Minh'`. **This is a genuine Windows-portability gap**: Windows Python does not ship the IANA tzdata database the way Linux/macOS do, and `tzdata` is not listed as a dependency in `requirements.txt`/`setup.cfg` despite the code requiring `zoneinfo`-resolvable IANA names (`models.py` `BirthData.timezone` validator). Installing `pip install tzdata` fixed it immediately. **Recommendation for anyone deploying this on Windows or a minimal Linux container image: add `tzdata` as an explicit dependency** — it is currently an unstated transitive requirement.

**Successful output** (real, not fabricated — actual JSON returned for the exact benchmark input 1985-03-12 08:30, lat 21.0285, lon 105.8542, tz Asia/Ho_Chi_Minh):

```json
{
  "report_type": "natal_birthchart",
  "sign": "PISCES",
  "snapshot": {
    "timestamp": "1985-03-12T01:30:00",
    "zodiac_system": "tropical",
    "ayanamsa": "Lahiri", "ayanamsa_value": 23.650255,
    "sun_sign": "PISCES", "moon_sign": "SAGITTARIUS", "rising_sign": "TAURUS",
    "house_system": "P",
    "house_cusps": [35.542535, 65.63794, 91.098569, ...],
    "positions": [
      {"name": "Sun", "longitude": 351.422..., "sign": "PISCES", "house": 11, "retrograde": false, ...},
      {"name": "Saturn", "longitude": 238.108..., "sign": "SCORPIO", "house": 7, "retrograde": true, ...},
      ... (all 10 planets + Chiron/Ceres/Nodes computed)
    ]
  }
}
```

Also successfully verified:
- `opastro horoscope --period daily --sign PISCES --target-date 1985-03-12 --format markdown` → produced full deterministic prose output (quoted in §5.3/§5.6 discussion; template-composed sentences like "Jupiter trine Juno peaks on Mar 12. This review cycle rewards cleanup before new commitments...").
- `opastro explain --kind horoscope ...` → produced the factor-provenance JSON quoted in §5.4.
- `pytest tests/ -q` → **59 passed, 6 failed** out of 65. All 6 failures are **Windows console/file-encoding artifacts, not logic bugs**: one golden-snapshot mismatch from terminal-width/color detection differing in this shell, and five failures from `Path.read_text()` being called without `encoding="utf-8"` on generated SVG files (Windows defaults to `cp1252`, and the SVGs contain UTF-8 multi-byte characters), e.g. `UnicodeDecodeError: 'charmap' codec can't decode byte 0x8d in position 5916`. The underlying SVG/PNG/PDF generation itself was independently confirmed working via the manual `natal` command run above and via the `--json` byte-inspection assertions that don't go through the buggy `read_text()` path. Root cause: `tests/test_cli.py` lines around `svg = wheel_svg.read_text()` (e.g. line 1601) omit an explicit encoding.
- A separate one-off CLI unicode issue (`'charmap' codec can't encode character '\u2728'`) was hit on first attempt without `PYTHONIOENCODING=utf-8` set — resolved by setting that environment variable. This is the same class of Windows console/UTF-8 issue, not a functional defect.

**No LLM API key was ever requested at any point during setup or execution** — consistent with the code-level finding that no LLM integration exists (§5).

## 8. Maintenance

```
git log -1:
commit 49276a01831060283f7a991218287e4bc72538e0
Author: kidddevs <project@dakidarts.com>
Date:   Sun Aug 16 19:08:47 2026 +0100
    fix release formatting

git log --oneline -20:  (only 1 commit visible)
49276a0 fix release formatting

git shortlog -sn:  (empty output)

git tag:
v0.1.9

git rev-parse --is-shallow-repository: true (confirmed shallow clone, shallow marker = 49276a0...)
```

**This clone only exposes a single squashed/shallow commit**, so the true commit cadence, contributor count, and full history are **UNKNOWN / NOT VERIFIED** from this local checkout — a shallow clone with `git fetch --unshallow` (not performed in this audit; requires network access to GitHub) would be needed for a real history. What *is* verifiable: the tag `v0.1.9` matches the `setup.cfg` version exactly, `setup.py` contains a custom `OpastroSdist` class specifically for filtering `tests/`, `docs/tasks/`, and `scripts/` out of release tarballs, which indicates active, deliberate PyPI release engineering (the README also links a live PyPI badge and a companion product `numerologyapi.com`), and the single author of this commit is `kidddevs <project@dakidarts.com>` (the "Dakidarts" org from the LICENSE copyright line).

**Classification: STABLE BUT LOW ACTIVITY / possibly ACTIVE (UNCONFIRMED due to shallow clone).** The codebase quality, breadth (18,630 lines across `src/`), docs (14 numbered doc files), packaging polish (PyPI release, `opastro doctor` self-diagnostic command, analytics opt-in, structured runtime-error logger) and version currency (`v0.1.9`, copyright year 2026) all read as an actively developed, commercially-backed open-core product (the README explicitly funnels users to a paid `numerologyapi.com` premium tier) rather than an abandoned experiment — but this cannot be fully confirmed from a 1-commit shallow clone. Recommend re-cloning with full history (`git clone` without `--depth`) before making a final maintenance-cadence judgment for procurement purposes.

## 9. Code Quality Scores

| Dimension | Score /10 | Justification |
|---|---|---|
| Architecture | 8 | Clean layered pipeline exactly matching its own architecture doc (`docs/04-architecture.md`): ephemeris → aggregation → interpretation → service → api, with `cache.py`/`cache_keys.py` as a clean cross-cutting concern. Verified the layering is real, not aspirational, by tracing `service.py` call order. |
| Modularity | 7 | Mostly well-separated (`ephemeris.py`, `aggregation.py`, `interpretation/`, `content_repository.py`, `natal_artifacts.py`, `scene_renderer.py` are each single-purpose), but `cli.py` (5,558 lines) and `interpretation/renderer.py` (4,475 lines) are outsized god-modules that would benefit from splitting (e.g. renderer.py mixes scoring, phrase banks, and cadence/editorializing logic in one file). |
| Typing | 8 | Consistent use of `from __future__ import annotations`, dataclasses (`@dataclass(frozen=True)` for config/specs), and Pydantic v2 `BaseModel` for all request/response schemas (`models.py`, 590 lines of typed models with `Field(default_factory=...)`, `ConfigDict(extra="forbid")`). Minor deduction: some internal renderer helper functions use bare `dict`/`str` without more specific typing. |
| Documentation | 8 | Unusually thorough for an open-source project: 14 numbered docs (`docs/01-quickstart.md` through `docs/13-docker-deployment.md`) that were spot-checked against code and found accurate (not aspirational marketing) — e.g. `docs/10-factor-drivers-reference.md`'s factor list matches `renderer.py` exactly. In-code docstrings are present on non-trivial functions (e.g. `get_arabic_parts` in `ephemeris.py:344-353` documents the Fortune/Spirit formulas inline) but sparse in the largest files (`cli.py`, `renderer.py`). |
| Separation of Concerns | 8 | Calculation (`ephemeris.py`) has zero knowledge of interpretation; interpretation (`renderer.py`) has zero knowledge of HTTP/CLI; `service.py` is the only orchestrator. This is exactly the separation a commercial engine wants to inherit. |
| Extensibility | 7 | The `V2ContentRepository` filesystem-lookup design (`content_repository.py`) is explicitly built to let a "premium" content pack override the open-core phrase banks without code changes — a genuinely extensible content-injection point. Adding a post-hoc LLM polishing stage would be straightforward (consume `SectionInsight`/`FactorDetail` as-is). Docked because `renderer.py`'s core phrase logic is a long if/elif chain rather than a registry/strategy pattern, making it harder to extend without touching the monolith. |
| Error Handling | 8 | Strong, user-facing error handling: Pydantic validation errors are caught and re-presented with actionable `suggestion:` lines (verified live — the timezone error printed "Run `opastro doctor`", "Check command syntax...", and pointed to a persistent runtime-error log file at `~/.config/opastro/runtime-errors.log`, all confirmed working). `ephemeris.py` has explicit Swiss-Ephemeris-file-missing fallback logic (`FLG_SWIEPH` → `FLG_MOSEPH` fallback in `_calc_body`, `_probe_minor_body`). |

## 10. Security Notes

- **No `eval()`, `exec()`, or `pickle`/unsafe-deserialization usage anywhere in `src/`** — confirmed by grep across all `.py` files.
- **`subprocess` usage is safe**: all call sites pass explicit argument lists (never `shell=True`, never string-interpolated commands). E.g. `cli.py:3653`: `subprocess.run([sys.executable, "-m", "horoscope_engine", *command], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace", check=False)` — `command` here comes from a fixed internal command-example table (`_home_payload()`), not raw user input.
- **Network calls**: only two legitimate outbound-HTTP call sites exist, both narrowly scoped: `ephemeris_downloader.py` (downloads optional Swiss Ephemeris data files from the hardcoded `https://www.astro.com/swisseph/ephe/` over `urllib.request` with an explicit `ssl.create_default_context()` and a 60s timeout — `ephemeris_downloader.py:76-86`), and `update_checker.py` (checks GitHub releases via `urllib.request`, also HTTPS-only, also with error handling for `HTTPError`/`URLError`). Neither sends user birth data or any PII anywhere — they are outbound-only asset/version fetches.
- **API key / secret handling**: no hardcoded literals found. The one authenticated admin endpoint uses environment-variable-sourced tokens compared with constant-time comparison: `api.py:595-604`:
  ```python
  x_admin_token: str | None = Header(default=None, alias="X-Admin-Token"),
  ...
  expected = os.getenv("PREGEN_TOKEN")
  ...
  if not x_admin_token or not compare_digest(x_admin_token, expected):
      raise HTTPException(status_code=403, detail="Invalid admin token")
  ```
  (`from secrets import compare_digest` at `api.py:10`) — this is textbook-correct handling, avoiding both hardcoded secrets and timing-attack-prone `==` comparison.
- **No `.env` file has ever been committed** — verified with `git log --all --diff-filter=A --name-only | grep -i "\.env"` (empty result) and a filesystem search for `*.env*` in the working tree (none found).
- **Prompt-injection surface: N/A.** Because there is no LLM call anywhere in the codebase (§5), there is no prompt-injection attack surface to evaluate — user-supplied birth data and free-text (e.g. `user_name` fields) flow only into deterministic string formatting (f-strings placed directly into rendered text/SVG/PDF), never into any model prompt. `models.py` does apply basic `max_length` constraints to user-supplied name fields (e.g. `SynastryRequest.user_name1: Optional[str] = Field(default=None, max_length=80)`), which is good hygiene against oversized-input abuse even without an LLM in the loop, though it does **not** appear to HTML/SVG-escape `user_name` before embedding it into generated SVG (`test_natal_split_exports_main_and_legends` shows `"Name: Dakidarts"` embedded directly into SVG text) — worth a follow-up check for SVG/XML injection if `user_name` is ever exposed to untrusted end users in a hosted product, since this was not exhaustively verified against malicious input in this audit (**UNKNOWN / NOT VERIFIED**: no test was performed with `user_name` containing `</text><script>` or similar XML-breaking payloads).

## 11. Tier Recommendation

**Tier B — Reference.**

Justification tied to findings above:
- **Not Tier A (Foundation)**: cannot be adopted wholesale as the foundation of a commercial closed-source SaaS because of the unresolved AGPL-3.0 obligation inherited from `pyswisseph` (§2) — this alone disqualifies "vendor it in directly and ship" without a legal/licensing decision first, regardless of how good the architecture is.
- **Not Tier C (Specialized)** or **Tier D (Experimental)**: the code is not narrow/niche or prototype-quality — it is a broad, production-shaped engine (FastAPI service, caching, CLI, PDF/SVG export, analytics, structured error logging, `doctor` self-diagnostics, a real test suite, real PyPI releases) that was verified to actually run correctly end-to-end for the exact benchmark input.
- **Not Tier E (Avoid)**: nothing here is a security or malpractice red flag — no eval/exec/pickle abuse, no hardcoded secrets, no committed `.env`, safe subprocess usage, MIT license on the first-party code, and (crucially, per the audit's central question) **honest documentation that does not overclaim AI capabilities it doesn't have.**
- **Why Tier B fits**: this repo is best used as a **studied reference for the exact architectural pattern the target project wants** — a genuine `Chart → Factors → Rules → Interpretation` pipeline with a working explainability layer (`opastro explain`) — and as a working example of a correctly-wired Swiss Ephemeris integration (house systems, aspects, retrograde/eclipse/lunation event detection, Arabic Parts). It should inform the *design* of the commercial engine's calculation/rules/interpretation layers (its `FactorDetail`/`SectionInsight` typed-model approach, its SHA-256-seeded-determinism pattern, and its factor-provenance `explain` endpoint are all worth deliberately copying), while its actual **content is Western tropical/sidereal, English-language, zodiac-sign-organized** — a different domain from Vietnamese phong-thủy/Bát Tự/Tử Vi content — so the *content* is not reusable, only the *architecture pattern* is. Before any code or dependency (especially `pyswisseph`) is reused directly, resolve the AGPL question in §2 with counsel.
