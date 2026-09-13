# ADR-007: AI Grounding Contract

## Status
Proposed

## Context
Two audited repos concretely demonstrate the "Chart→LLM" anti-pattern in working (or broken) code: `astro-natal-chart`'s SKILL.md instructs a calling AI agent to freely "analyze JSON and write conclusion" with no rules gating it; `zodiac-engine` hands an LLM a raw stringified chart report, asks it to invent astrological reasoning, and its interpretation API is confirmed broken by direct execution in the audit (`../../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`). Neither has a grounding contract, an evidence chain, or a post-generation validation step.

## Decision
1. The AI Narrative layer receives only `InterpretationObject[]` — never a `Chart`, `Factor`, raw ephemeris value, or birth data field.
2. A binding allowed/forbidden list (`../AI_GROUNDING_CONTRACT.md`) constrains the LLM to paraphrase/summarize/organize/translate — never recalculate, invent rules/evidence/facts, or override a score/conclusion.
3. If grounding is insufficient (empty or low-confidence `InterpretationObject[]`), the layer must say so explicitly rather than fill the gap with invented content.
4. A post-generation grounding check (rule-based, not another LLM call by default) validates narrative output against its input `InterpretationObject[]` before a `Report` is served.

## Consequences
- Positive: makes the exact failure modes observed in `astro-natal-chart`/`zodiac-engine` structurally unreachable by this architecture, not just discouraged by policy.
- Positive: keeps the LLM's role narrow enough that swapping model providers (Phase 9+) never requires touching any deterministic layer.
- Negative: the post-generation grounding check is new, unproven design work — its exact algorithm is an open `VALIDATION GAP` (see `../AI_GROUNDING_CONTRACT.md`) to be resolved at Phase 9, not now.
- Negative: this contract necessarily limits narrative "creativity" (e.g. the AI cannot invent a vivid metaphor referencing an aspect not actually present) — this tradeoff is deliberate and required by the project's stated goal of AI never inventing astrology.
