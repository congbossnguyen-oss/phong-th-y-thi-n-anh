# PROPOSED ASTROLOGY MODULE ARCHITECTURE FOR PHONGTHUY.VN

This proposal synthesizes what actually works across the 10 audited repos (see `REPO_COMPARISON.md`) into a from-scratch architecture. **No code from any AGPL-licensed or unlicensed repo is to be vendored** — this is a design informed by what was proven to work, not a fork of any of them.

## 1. Layer diagram

```
ASTROLOGY MODULE
│
├── astronomical-core
│   └── Swiss Ephemeris (via pysweph, NOT pyswisseph — see LICENSE_AUDIT.md)
│       under a Professional License OR isolated as an AGPL-compliant network-isolated service
│
├── timezone-resolution   [NEW — no audited repo does this well; sits between birth data and astronomical-core]
│   └── IANA tzdata (zoneinfo) + geocoding, resolves "civil time + place" → precise UT instant
│
├── chart-calculation
│   ├── western/      (planets, houses, aspects, dignities — cleanroom, informed by stellium's design)
│   ├── vedic/         (rashi, vargas, nakshatra, dasha — cleanroom, validated against PyJHora + vedic-calc as oracles)
│   ├── traditional/   (sect, terms, decans, profections, releasing — cleanroom, informed by stellium)
│   ├── hellenistic/   (subset of traditional/ — lots, primary directions)
│   └── future systems (KP, Jaimini, Hellenistic timing, Bát Trạch/Huyền Không phong-thủy techniques)
│
├── chart-model
│   (shared typed data model — see Data Model doc; every school's calculators emit into this model)
│
├── rules-engine
│   ├── western.rules
│   ├── vedic.rules
│   ├── traditional.rules
│   └── school-specific rules (isolated — see Section 20 below)
│
├── factor-engine
│   (extracts structured Factors from a Chart — modeled on opastro's FactorDetail, cleanroom-built)
│
├── scoring-engine
│   (weighted section/theme scoring — modeled on opastro's section_weights pattern)
│
├── interpretation-engine
│   (deterministic template/rule-driven prose — modeled on opastro's renderer.py pattern, cleanroom-built)
│
├── evidence-engine
│   (traces every interpretation sentence back to its rule+factor+chart placement — modeled on opastro's `explain` command)
│
├── AI-narrative-engine
│   (LLM consumes the ALREADY-COMPUTED factors/rules/interpretation as grounding context;
│    never receives raw chart data and is never asked to invent astrological reasoning itself)
│
└── API
    (versioned REST/GraphQL surface; birth-data input validation lives here, in front of everything)
```

## 2. Why each layer exists (brief mapping to audit evidence)

- **astronomical-core**: every accurate repo audited ultimately depends on Swiss Ephemeris (`SWISS_EPHEMERIS_AUDIT.md`). Isolating it behind one module boundary contains both the AGPL/commercial licensing question (`LICENSE_AUDIT.md`) and any future ephemeris-backend swap.
- **timezone-resolution**: confirmed via source-reading that Swiss Ephemeris has **zero** timezone/DST knowledge (`SWISS_EPHEMERIS_AUDIT.md` §3.4) — every repo that handles this at all (opastro, via `tzdata`) does so as a bolt-on, and openastrology-library's own timezone handling was found to silently swallow invalid input. This must be a first-class layer, not an afterthought.
- **chart-calculation (per school)**: no audited repo cleanly isolates Western from Vedic from Traditional configuration (zodiac type, house system, ayanamsa, aspect rules are all school-specific) — stellium comes closest (protocol-based engine swapping) but still mixes Western/traditional/Chinese in one package. Build this as genuinely separate, swappable modules per Section 20 below.
- **rules-engine as a distinct layer from calculation**: confirmed as the industry norm across every audited repo (`INTERPRETATION_AUDIT.md`) — every repo that has *any* rule logic keeps it in separate functions/files from raw ephemeris calls. The gap is that **every audited repo's rule engine is hardcoded conditionals, not data-driven** (PyJHora's 130+ yoga functions, vedic-calc's 24 `_detect_*` functions, mayaastrolib's yoga functions are all Python `if` chains). **The commercial engine should do better**: build yogas/aspect-rules/dignity-rules as declarative data (JSON/YAML rule definitions with a small generic evaluator), not hundreds of hand-written functions — this is the single clearest improvement opportunity found across the entire audit.
- **factor-engine / scoring-engine / interpretation-engine / evidence-engine**: this exact 4-way split is **not found as a single coherent architecture anywhere in the audited set**, but opastro independently proves each piece works in isolation (FactorDetail typed model, section_weights scoring, deterministic phrase composition, and a working `explain` provenance command) — see `AI_ARCHITECTURE_AUDIT.md`. Recombining these as explicit, separately-testable layers (rather than opastro's single 4,475-line `renderer.py`) is the improvement this proposal makes.
- **AI-narrative-engine**: the two counter-examples (astro-natal-chart, zodiac-engine) concretely demonstrate what happens when this layer is allowed to also do the astrological reasoning — an untraceable, non-reproducible, occasionally broken (zodiac-engine's confirmed schema bug) output. Constrain the LLM's role strictly to prose polish of already-computed, already-cited content.

## 3. Section isolation (brief's requirement #20)

No audited repo does this cleanly for more than 2 schools simultaneously (stellium mixes Western/Traditional/Chinese in one package; PyJHora/vedic-calc are Vedic-only). The commercial engine should enforce, per school:

```
western.config:   { zodiac: tropical, house_system: Placidus, ayanamsa: none, aspect_set: [...], dignity_rules: [...] }
vedic.config:      { zodiac: sidereal, house_system: WholeSign, ayanamsa: Lahiri, aspect_set: [Vedic drishti], dignity_rules: [...] }
hellenistic.config:{ zodiac: tropical, house_system: WholeSign, sect_aware: true, ... }
kp.config:         { zodiac: sidereal, house_system: Placidus (cuspal), ayanamsa: KrishnamurtiVP291, ... }
```
Each school's rule set (`western.rules`, `vedic.rules`, etc.) must never reference another school's rule tables or configuration — this is enforced at the module-boundary level, not just by convention, precisely because **every audited repo that mixes Western and Vedic in one codebase (openastrology-library, mayaastrolib) keeps them in cleanly separate calculator classes already** — extend that same discipline to the rules layer, which none of them do (their rule layers are Western-only or Vedic-only, never cross-referencing, which is correct — just make sure the commercial engine's *new* schools follow the same discipline).

## 4. Traceability (brief's requirement #22)

Every interpretation conclusion must be traceable:
```
Interpretation → Rule → Factors → Chart → Astronomical Calculation → Birth Data
```
Example, styled directly on opastro's proven, live-verified pattern (`AI_ARCHITECTURE_AUDIT.md`):
```
"Career pressure is elevated"
SOURCE:      Rule: R-WESTERN-CAREER-014
FACTORS:     Mars square Saturn; Mars in 10th house; Saturn transit 10th
CHART:       Natal chart ID xxx, calculated 2026-09-13T...
CALCULATION: Swiss Ephemeris (pysweph 2.10.3.x), Placidus houses, Lahiri N/A (Western)
BIRTH DATA:  1985-03-12 08:30 +07:00, 21.0285°N 105.8542°E
```
Implementation: every `Interpretation` object carries a `rule_id` and a list of `factor_ids`; every `Factor` object carries the `chart_id` and the exact calculation parameters (ephemeris version, house system, ayanamsa) used to derive it. This is a direct generalization of opastro's `explain` command output (verified live in this audit, `raw/opastro.md` §5.4) to a multi-school, multi-rule-engine context.

## 5. FACT vs DERIVED FACT vs RULE vs INTERPRETATION vs AI NARRATIVE (brief's requirement #23)

| Layer | Example | Where it lives |
|---|---|---|
| FACT | `Mars = 14°23' Aries, speed +0.51°/day` | astronomical-core output, immutable |
| DERIVED FACT | `Mars is in the 10th house` | chart-calculation output (house-system-dependent, still deterministic) |
| RULE | `Mars in 10th house AND square Saturn → Rule R-WESTERN-CAREER-014 fires` | rules-engine output — a boolean/scored determination, still structured data |
| INTERPRETATION | `"This may indicate elevated pressure around career visibility."` | interpretation-engine output — deterministic template text bound to the fired rule |
| AI NARRATIVE | Natural, personalized paragraph weaving several interpretations into readable Vietnamese prose | AI-narrative-engine output — the ONLY layer where an LLM is involved, and it is fed the interpretation-engine's output as grounding, never asked to invent the FACT/RULE/INTERPRETATION steps itself |

No audited repo enforces this 5-way distinction as cleanly as this proposal does — the closest is opastro (3-way: fact/rule/deterministic-interpretation, no AI at all) and stellium (2-way: fact/rule, explicitly hands off to an external LLM via `to_prompt_text()` with no rules-to-AI grounding contract defined). This proposal's contribution is formalizing the AI-narrative-engine's grounding contract explicitly, informed directly by watching astro-natal-chart and zodiac-engine fail without one.

## 6. Data model (brief's requirement #21)

For each object: field / type / meaning / source / deterministic-or-probabilistic / confidence.

| Object | Key fields | Source | Det./Prob. |
|---|---|---|---|
| **BirthData** | `datetime_local: str`, `iana_timezone: str`, `lat: float`, `lon: float`, `place_name: str` | User input, resolved by timezone-resolution layer | N/A (input) |
| **Chart** | `chart_id`, `birth_data_ref`, `school: enum`, `zodiac_type`, `house_system`, `ayanamsa?`, `calculated_at`, `ephemeris_version` | chart-calculation | Deterministic |
| **Planet** | `name`, `longitude`, `latitude`, `speed`, `retrograde: bool`, `sign`, `sign_degree` | astronomical-core → chart-calculation | Deterministic |
| **Sign** | `name`, `element`, `modality`, `ruler` | Static reference data | Deterministic |
| **House** | `number`, `cusp_longitude`, `sign`, `ruler` | chart-calculation (house-system-dependent) | Deterministic |
| **Aspect** | `planet_a`, `planet_b`, `type`, `orb`, `applying: bool` | chart-calculation | Deterministic |
| **Point** | `name` (Node/Chiron/Lilith/Part of Fortune/Vertex/...), `longitude` | chart-calculation | Deterministic |
| **Dignity** | `planet`, `sign`, `type` (domicile/exaltation/detriment/fall/triplicity/term/decan), `score` | rules-engine (western/traditional) | Deterministic |
| **Nakshatra** | `planet_or_point`, `name`, `pada`, `lord` | chart-calculation (Vedic) | Deterministic |
| **Varga** | `chart_id`, `divisor` (D1..D60...), `planet_positions[]` | chart-calculation (Vedic) | Deterministic |
| **Dasha** | `system` (Vimshottari/Yogini/...), `level` (maha/antar/pratyantar), `lord`, `start`, `end` | chart-calculation (Vedic) | Deterministic |
| **Transit** | `transiting_planet`, `natal_target`, `aspect_type`, `exact_date` | chart-calculation (time-series) | Deterministic |
| **Rule** | `rule_id`, `school`, `condition_spec` (declarative, data-driven — see §2 above), `fires_on: Factor[]` | rules-engine, versioned/authored content | Deterministic |
| **Factor** | `factor_id`, `chart_id`, `type`, `value`, `weight` | factor-engine | Deterministic |
| **Evidence** | `interpretation_id`, `rule_id`, `factor_ids[]`, `chart_id` | evidence-engine | Deterministic |
| **Interpretation** | `interpretation_id`, `text` (template-composed), `theme`, `score`, `evidence_ref` | interpretation-engine | Deterministic |
| **Report** | `report_id`, `narrative_text` (AI-polished), `interpretation_refs[]`, `generated_at`, `model_version` | AI-narrative-engine | **Probabilistic** — the only object in this model that is non-deterministic; must store its own `interpretation_refs` for traceability back to the deterministic layer per §4 above |

This table directly operationalizes the brief's requirement that every object declare whether it's deterministic or probabilistic and where its confidence (if any) comes from — only `Report` carries genuine model-generation uncertainty; everything else is either a physical fact or a versioned, auditable rule evaluation.
