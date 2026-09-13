# AI GROUNDING CONTRACT — `NarrativeGenerationContract` Specification (not implemented)

## Why this document exists

Two audited repos concretely demonstrate what happens without this contract: **astro-natal-chart** instructs its calling AI agent to "analyze JSON and write conclusion" with no rules gating the output, and **zodiac-engine** hands an LLM a raw stringified chart report and asks it to "identify and name" astrological themes itself — the one structured data object that repo actually computes is never even connected to the interpretation pipeline (`../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`). zodiac-engine's interpretation API is also confirmed broken by direct execution in the audit. **This contract exists specifically to make that failure mode structurally impossible here.**

## Core principle

```
Structured Interpretation (InterpretationObject[])
          ↓
Grounded Prompt (template-assembled, not free composition)
          ↓
LLM
          ↓
Narrative (prose)
```

**The LLM never receives a `Chart`, a `Factor`, a raw ephemeris value, or any birth data field directly.** Its only input is one or more `InterpretationObject`s (already fact-checked, rule-evaluated, scored, and evidence-linked) plus narrow stylistic instructions (tone, length, target language). This is the layer-13 boundary from `ARCHITECTURE_FREEZE.md` §3.

## Allowed vs. Forbidden (binding contract)

| Allowed | Forbidden |
|---|---|
| Paraphrase an `InterpretationObject`'s resolved template text | Recalculate any chart value |
| Summarize multiple `InterpretationObject`s into a cohesive paragraph | Create a new astrological rule or condition |
| Organize/sequence interpretations for readability | Invent evidence or a source citation not present in the input |
| Explain a resolved conclusion in plainer language | Invent an aspect, placement, dasha period, or any astronomical fact |
| Translate into the target language (e.g. Vietnamese) | Change a `DomainScore` or a rule's fired/not-fired determination |
| Improve tone/register for the audience | State a conclusion not present in any supplied `InterpretationObject` |
| — | Override or contradict a `caveat` (e.g. must not speak confidently about houses if `caveats` flags unknown birth time) |

## Refusal requirement

If the supplied `InterpretationObject[]` set is empty, contains only low-`confidence` entries, or a requested topic has no corresponding interpretation, **the AI Narrative layer must say so explicitly** ("insufficient grounded data for this topic") rather than fill the gap with its own astrological reasoning. This is the single most important behavioral requirement in this contract, and the one most directly violated by the two negative-example repos.

## Interface

```
interface NarrativeEngine {
  generate(interpretations: InterpretationObject[], style: NarrativeStyle) -> Report
}

NarrativeStyle { tone: string, target_language: string, max_length: number | null }

Report {
  report_id:            UUID
  narrative_text:        string
  interpretation_refs:   InterpretationId[]     // MANDATORY — every Report must retain this for full traceability per EVIDENCE_ENGINE_SPEC.md
  generated_at:          UTCInstant
  model_provider:        string
  model_version:         string
  grounding_check_passed: boolean               // see Post-generation validation below
}
```

## Post-generation validation (defense in depth)

Because LLM output cannot be trusted to self-report compliance, the architecture requires a **post-generation grounding check** before a `Report` is served: a lightweight verification step (rule-based, not another LLM call by default) that flags narrative sentences containing named entities (planet names, house numbers, dates, numeric scores) not traceable to any input `InterpretationObject`. This does not exist in any audited repo — it is a new design element proposed specifically because no audited repo validates its own LLM output against its structured input at all.

- **VALIDATION GAP**: the exact grounding-check algorithm (keyword/entity matching vs. a stricter structured-output-only approach, e.g. requiring the LLM to emit `{interpretation_id, text}` pairs instead of free paragraphs) is not decided here — flagged as a Phase 9 design decision, not resolved at Architecture Freeze.

## Security note (cross-reference)

Per `../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md`, **zodiac-engine has a confirmed stored-XSS/prompt-injection vulnerability**: user-controlled free-text flows into the LLM prompt and the LLM's markdown output is rendered with autoescaping disabled. This architecture requires: (1) no raw user-supplied free text (e.g. a birth-place label) is ever interpolated into the grounded prompt without the same validation applied at the Input layer; (2) narrative output is always sanitized before any HTML rendering, and is never marked "safe"/trusted by default. See `SECURITY_MODEL.md`.

## Phase placement

Contract + interface specified now (used to gate Phase 9 design); no LLM integration, no prompt template, and no model selection happens until Phase 9 per `ROADMAP.md`.
