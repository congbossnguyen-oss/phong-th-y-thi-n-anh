# AI ARCHITECTURE AUDIT

Deep dive on the 3 repos with any AI/LLM-adjacent code: opastro, astro-natal-chart, zodiac-engine. (opastro turned out to have *no* LLM at all — included here because it is the architectural benchmark the other two should be compared against.)

## opastro — Chart→Factors→Rules→Interpretation, NO LLM

Verified by full-repo grep (no `openai`/`anthropic`/`gpt`/`llm`/`completion` imports anywhere) and by live execution (no API key ever requested).

```
Birth data → Swiss Ephemeris (ephemeris.py)
           → Aggregation (aggregation.py: period metrics, ingress/station/eclipse events)
           → FactorDetail extraction (renderer.py: sun_in_sign, aspects, retrograde_archetypes...)
           → RuleSet (default_rules.json: sign_tone, section_weights, aspect_keywords)
           → Deterministic phrase composition (SHA-256-seeded selection among variants — reproducible, not random)
           → Rendered report (CLI/API) + `opastro explain` (full factor→rule→sentence provenance, verified live)
```
- **Determinism**: proven by literal golden-snapshot SHA-256 hash assertions in the test suite (`test_golden_snapshot_welcome_output`).
- **Explainability**: the `opastro explain --json` command returns, per sentence, its `source_factors` and the literal template line used — this is a genuinely traceable output, not a documentation claim (`raw/opastro.md` §5.4, verbatim JSON quoted there).
- **Confidence scoring**: none needed/present — everything is deterministic weighted sums, not probability.
- **Prompt architecture**: N/A — there is no prompt.
- **Hallucination control**: N/A by construction — nothing is generated, everything is selected from a fixed template bank.
- **Verdict**: this is the "pre-LLM half" of the target architecture, fully built and working. It could be extended with a "final polish" LLM stage bolted onto the *end* (consuming `FactorDetail`/`SectionInsight` as grounding context) without disturbing anything — exactly the extension point a commercial AI-narrative layer should look for.

## astro-natal-chart — Hybrid (static templates + separate, unconstrained Chart→LLM)

Two disconnected code paths exist:

1. **Always-on interpretation panel**: `interp_data.py`'s static per-house/per-planet/per-sign/per-aspect-*type* dictionaries, concatenated at render time. Deterministic, but **not per-combination** — e.g. the "square" aspect gets the same one-sentence meaning no matter which two planets are square. This is closer to "no AI, just static templates" than to a real rules engine.
2. **The one genuinely AI-touching feature**, `--conclusion FILE`: SKILL.md instructs the *calling AI agent* (not this repo's own code) to run the calculation script with `--json`, then "analyze JSON and write conclusion to a file," then pass that file to the renderer, which paints the text verbatim with **zero validation, zero rules, zero citation mechanism**.
   - Structured Factors *do* exist (a real computed-aspects list with type+orb, confirmed in execution output) and *are* handed to the AI — so this is not the worst-case "raw dump," but the actual interpretive reasoning (what a specific aspect pattern means for this person) is left entirely to the LLM's free judgment, unconstrained by any rule table.
   - SKILL.md's "Interpretation Guidelines" (Sun=core personality, Moon=emotional nature, etc.) is a **prompt-style checklist for the AI's own reasoning**, not a rule table the AI is required to consult, cite, or restrict itself to.
- **Verdict**: textbook weak "Chart→LLM" for the one real AI feature, per the brief's own definition of the anti-pattern to avoid.

## zodiac-engine — Chart→LLM (confirmed weak, and confirmed broken)

Full prompt traced verbatim (`raw/zodiac-engine.md` §5.4):
```
You are an expert astrologer tasked with interpreting a natal chart.
Below is the data from the chart:
[raw ASCII report table text — box-drawing characters and all]
Please provide a {tone} interpretation... Identify and name the first major theme...
Discuss its potential positive and challenging manifestations...
```
- **Structured Factors step**: **absent**. The genuinely typed `AspectInfo`/`PlanetPosition` objects computed by `AstrologyService` are **never passed to** `InterpretationService` — the interpretation path instead re-derives its input by string-slicing Kerykeion's human-readable ASCII report, which doesn't even include the aspect table as a discrete field.
- **Rules layer**: **absent** — zero rule/lookup files found anywhere in the interpretation code path.
- **The LLM is explicitly instructed to find aspect patterns and name themes itself** — it is doing the astrology reasoning, not just the prose, exactly the weak pattern the brief warns about.
- **Explainability**: none — response parsing is fragile string-splitting on markdown headings with a bare `except Exception` fallback to placeholder text.
- **Confirmed broken by execution**: the public `/api/v1/charts/interpretations/natal` endpoint always throws a Pydantic `ValidationError` (field name mismatch, `interpretation_html` vs required `interpretation`) — reproduced directly in this audit. It has plausibly never worked in production as shipped.
- **Security**: LLM markdown output is rendered with Jinja2 `| safe` (autoescaping disabled) with no sanitization — a confirmed prompt-injection/stored-XSS pathway if user-controlled `name` fields ever reach production (see `SECURITY_AUDIT.md`).
- **Verdict**: this is the single clearest, most concrete illustration of the exact architecture the brief instructs to avoid — cite it directly when explaining to stakeholders why "dump the chart at an LLM" is inadequate for a professional product.

## Direct comparison

| Dimension | opastro | astro-natal-chart | zodiac-engine |
|---|---|---|---|
| Structured Factors before any text generation | ✅ yes | ✅ yes (partial) | ❌ no (typed data exists but is disconnected) |
| Deterministic rules layer independent of LLM | ✅ yes (JSON rule table + phrase engine) | Weak (generic per-item dictionary, not per-combination) | ❌ none |
| LLM present | ❌ no | ✅ yes, unconstrained | ✅ yes, unconstrained |
| Output traceable to specific rule+factor | ✅ yes, live-verified (`explain` command) | ❌ no | ❌ no |
| Deterministic / reproducible | ✅ yes (SHA-256-seeded, golden-snapshot tested) | Partial (templates yes, AI conclusion no) | ❌ no |
| Confidence/scoring | N/A (deterministic) | none | none |
| Production-verified working | ✅ yes | Partial (calc works, renderer crashes on non-author machines) | Partial (calc works, interpretation API confirmed broken) |

## Recommendation for the commercial AI-narrative layer

Architect the commercial engine on **opastro's proven pattern** (Factors → Rules → deterministic pre-LLM Interpretation), then add an LLM stage strictly as a **final natural-language polish** step that consumes the already-computed, already-cited factors/rules/interpretation objects as grounding context — never as the source of astrological reasoning itself. This directly satisfies the brief's Section 19 principle ("AI chỉ diễn giải dữ liệu và kết quả của engine, không tự phát minh calculation") and avoids the two concretely-demonstrated failure modes found in astro-natal-chart and zodiac-engine.
