# PHASE 9 — DECISIONS (AI Narrative)

**Status:** ratified for implementation. Resolves the `AI_GROUNDING_CONTRACT.md` §"Post-generation validation"
VALIDATION GAP. Deterministic, non-LLM. 2026-09-21.

## D1 — Grounding validation strategy = **structured, conservative, deterministic**
The post-generation grounding check is **rule-based (never an LLM)** and operates purely on strings.

**Allowed set** derives deterministically from the supplied `InterpretationObject`s only:
- provenance **id tokens** — every `rules[]`, `evidence[]`, `supportingFactors[]` string (opaque, traceable);
- **allowed counts** — the string forms of each interpretation's `rules.length` / `evidence.length` /
  `supportingFactors.length` (a narrative may state "activated by N rules");
- the fixed **Vietnamese domain labels** + benign structural vocabulary (connectives) — carry no entity/number.

**Procedure** (deterministic, order fixed):
1. **Forbidden semantics** (deny-list, VI+EN) — prediction / probability / confidence / strength / recommendation
   / risk. Any hit ⇒ violation `forbidden_semantics`.
2. **Strip allowed id tokens** (longest-first, literal replace) from a working copy — so a legitimate factor id
   like `sun_in_house_10` is NOT mistaken for an invented planet/house/number.
3. **Invented entity** — scan the stripped text for planet/point names (Sun…Pluto, Rahu/Ketu, VI + EN). Any ⇒
   `invented_entity`. (Interpretations carry no planets, so any surviving planet name is invented.)
4. **Invented house** — `(nhà|cung|house|thứ)\s*\d+` ⇒ `invented_house`. (Interpretations carry no houses.)
5. **Invented date** — 4-digit year, `d/m[/y]`, or `(ngày|tháng|năm)\s*\d+` ⇒ `invented_date`.
6. **Invented number** — any remaining standalone number not in the allowed counts ⇒ `invented_number`
   (catches scores/values; the rule-count survives because it is an allowed count).

We deliberately do **not** attempt unrestricted natural-language semantic verification. The checker is
**conservative**: it can only pass content whose entities/numbers are traceable to the interpretation, and it
errs toward flagging. Houses/dates are always ungrounded (interpretations have none); only the generic-number
check consults the allowed-count set.

## D2 — Determinism policy
The **grounding decision is fully deterministic** (pure string ops; no clock, no randomness, no I/O).
Report metadata that the contract requires to be unique/temporal is **isolated** from the grounding decision:
- `reportId` defaults to a **deterministic, content-derived** id (`report:` + the sorted interpretation refs) —
  chosen over a random UUID to preserve the module's determinism ethos; overridable via an injected factory.
- `generatedAt` comes from an **injected clock** (default `() => new Date().toISOString()`) — the only
  nondeterministic value, and it never influences `groundingCheckPassed`.
This resolves the contract's "UUID / UTCInstant" fields against the determinism requirement.

## D3 — Provider policy
**No real vendor integration in `astrology-core`.** `NarrativeProvider` stays an abstraction, extended with
read-only `modelProvider` / `modelVersion` metadata (surfaced into `Report`). The deterministic local mock
provider is sufficient for all Phase 9 tests; a real provider is wired at the edge (Phase 10), never inside the
core.

## D4 — Refusal + failure handling
- **Empty input** ⇒ deterministic **refusal** `Report` (fixed VI "insufficient grounded data" text, empty
  `interpretationRefs`, `groundingCheckPassed=true` — the refusal text is itself grounded/empty).
- **Topic absent** (`generateForTopic(interpretations, domain, style)` with no matching interpretation) ⇒ same
  refusal.
- **Grounding failure** ⇒ the engine returns a `Report` with `groundingCheckPassed=false` and a fixed **blocked**
  notice as `narrative_text`; the hallucinated text is **discarded** (never served, never silently rewritten
  into something plausible). A `groundingCheckPassed=false` `Report` is, by contract, not serveable as success.

## D5 — Scope guardrails
No LLM call; no vendor; no change to astronomy / chart / factor / rule / evidence / scoring / interpretation
engines (Phases 3–8) — narrative consumes `InterpretationObject[]` only. The LLM/provider never receives a
`Chart`, `Factor`, ephemeris value, or birth-data field (contract layer-13 boundary).

## D3 — REVISED (Human Override)

**Status:** HUMAN RATIFIED (explicit override). 2026-09-21, same-day follow-up.

**Original D3 (above) is preserved verbatim as the historical record and is NOT deleted or rewritten.**
It is superseded by this addendum.

**Revised decision:** a vendor-abstracted real `NarrativeProvider` MAY live inside `astrology-core`.
The human explicitly requested this now, overriding the original "no real vendor integration in
astrology-core / wired at the edge in Phase 10" position, when presented with the conflict between this
decision and a concurrent task asking for a real provider immediately.

**Constraints carried over from the original D3's intent (still binding):**
- No vendor SDK dependency is added — the provider uses raw `fetch` (matching the app's own convention
  in `src/lib/chart-profile/llm.ts`), not `@anthropic-ai/sdk` or similar.
- No API key is ever hardcoded or read from `process.env` inside `astrology-core` — it is a required
  constructor argument (`AnthropicNarrativeProviderConfig.apiKey`), injected by the caller at the edge.
- `NarrativeProvider` stays the sole abstraction — the real provider is one more implementation of it,
  not a parallel system; `renderNarratives` / `createNarrativeEngine` are unchanged.
- The deterministic post-generation grounding check (D1) remains the safety net against this untrusted
  provider's output — unchanged, not weakened.
- Only the grounded `NarrativeInput` projection (never `Chart`/`Factor`/ephemeris/birth-data — D5)
  reaches the provider, via the existing `buildNarrativePrompt`.
- On any failure (network error, non-2xx, empty/malformed output) the provider throws; it never falls
  back to the mock and never fabricates a narrative (no silent substitution, per D4's failure-handling
  spirit).
- Unit tests never require network or a real API key — the real provider is tested via an injected
  `fetchImpl`; the deterministic mock provider remains the default for all other Phase 8/9 tests.
- Implementation: `narrative/anthropicProvider.ts` (`createAnthropicNarrativeProvider`).

**Not reopened:** D1 (grounding algorithm), D2 (determinism policy), D4 (refusal/failure handling), D5
(scope guardrails / layer-13 boundary) are unchanged by this override.
