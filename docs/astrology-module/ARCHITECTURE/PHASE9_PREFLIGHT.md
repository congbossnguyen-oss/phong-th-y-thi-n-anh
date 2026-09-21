# PHASE 9 — PREFLIGHT (AI Narrative)

**Mode:** research/audit only. No implementation, no commit, no push. Phase 8 (`40549c4`) not modified;
concurrent unrelated work untouched. 2026-09-21.

## Current baseline
- Package `@thien-anh/astrology-core`. **Typecheck: PASS.** **Tests: 819/819 PASS (36 files).**
- Phase 8 (Interpretation) CLOSED and exported: `InterpretationObject`, `ConclusionKey`
  (`domain_activated` | `domain_not_indicated`), `interpret()` etc. Contract frozen (GREEN).
- An **MVP narrative vertical slice already exists** in `src/narrative/` (`types.ts`, `renderer.ts`,
  `mockProvider.ts`, `__tests__/renderer.test.ts`, 5 tests) — "MINIMAL, not production", **grounded by
  construction** (the deterministic mock can only read structured fields), and **NOT exported from `index.ts`**.

## Phase 9 objective (authoritative — `ROADMAP.md` Phase 9)
Implement `NarrativeEngine` per `AI_GROUNDING_CONTRACT.md` + a **post-generation grounding check**, adversarially
tested. **DoD:** AI Grounding Tests pass, **including the negative case (forced hallucination is caught, not
shipped).**

## Why this is the next phase
`ROADMAP.md` orders Phase 9 = AI Narrative, depends on Phase 8 (just closed). The narrative layer is the only
remaining engine before Phase 10 (Web Integration). The existing MVP slice proves the pipeline runs but does
**not** satisfy the DoD: it lacks the untrusted-output grounding check and the negative test.

## Existing reusable code
- `interpretation/{types,engine}.ts` — the frozen input (`InterpretationObject[]`). **The LLM's only input.**
- `narrative/types.ts` — `NarrativeInput`, `Narrative`, `NarrativeProvider` (vendor-agnostic abstraction),
  `NARRATIVE_RENDERER_VERSION`.
- `narrative/renderer.ts` — `toNarrativeInput` (deterministic projection), `buildNarrativePrompt` (constrained
  template), `renderNarratives`.
- `narrative/mockProvider.ts` — `deterministicMockNarrativeProvider` (grounded-by-construction, no network).
- `narrative/__tests__/renderer.test.ts` — 5 tests (activated/not_indicated prose, forbidden-term absence,
  determinism, full Factor→Rule→Evidence→Interpretation→Narrative pipeline).
- `domain/types.ts` — 15 `CanonicalDomain`s (label source for VI output).

## Required new work (to reach DoD)
1. **Resolve the flagged VALIDATION GAP** (contract §Post-generation validation): choose the grounding-check
   algorithm — entity/keyword matching vs. structured-output-only. Record in a `PHASE9_DECISIONS.md`.
2. **Post-generation grounding check** (rule-based, NOT another LLM): given generated text + the source
   `InterpretationObject`(s), flag any ungrounded named entity (planet name, house number, date, numeric score)
   or any forbidden semantic (prediction/probability/confidence/strength/recommendation) not derivable from the
   allowed set (domain label, conclusion key, rule/evidence/factor ids). Deterministic. Returns pass/fail + the
   offending tokens.
3. **`NarrativeEngine.generate(interpretations, style) → Report`** per contract: `Report{ report_id,
   narrative_text, interpretation_refs (mandatory), generated_at, model_provider, model_version,
   grounding_check_passed }`; `NarrativeStyle{ tone, target_language, max_length }`. Wire: grounded prompt →
   provider → grounding check → Report; **a failed check must block serving** (not returned as a normal Report).
4. **Refusal requirement:** empty / insufficient `InterpretationObject[]` (or a topic with no interpretation) ⇒
   explicit "insufficient grounded data" output, never gap-filled.
5. **Export** the narrative surface from `index.ts` (currently absent).
6. **Security note** (`SECURITY_MODEL.md`): output is an **untrusted** string — never marked safe; no raw
   user free-text into the prompt (astrology-core's only input is `InterpretationObject`, so the injection
   surface is already minimal; HTML sanitization is enforced at the Phase 10 web layer).

## Files likely affected
- **New:** `narrative/grounding.ts` (the check), `narrative/engine.ts` (`generate → Report`),
  `narrative/__tests__/grounding.test.ts`, `narrative/__tests__/engine.test.ts` (or extend `renderer.test.ts`),
  a **hallucinating** test-fixture provider (adversarial), `docs/.../ARCHITECTURE/PHASE9_DECISIONS.md`.
- **Modified:** `narrative/types.ts` (+`Report`, `NarrativeStyle`, `NarrativeEngine`), `src/index.ts` (exports),
  `AI_GROUNDING_CONTRACT.md` (mark the VALIDATION GAP resolved, or reference the new decisions doc).
- **Untouched:** all Phase 3–8 engines, `western/`, `vedic/`, `interpretation/` (consume only; do not modify).

## Tests required
- **Positive:** grounded provider output passes the check; Report carries `interpretation_refs` +
  `grounding_check_passed=true`; determinism (same input ⇒ same Report modulo report_id/generated_at policy).
- **Negative (DoD-critical):** a provider that invents a planet / house number / date / numeric score /
  prediction is **caught** by the grounding check → **not shipped** (`grounding_check_passed=false` / refusal).
- **Refusal:** empty/insufficient interpretations ⇒ explicit refusal text, no fabricated astrology.
- **Contract conformance:** no `Chart`/`Factor`/ephemeris ever reaches the provider (only `InterpretationObject`).
- Keep the existing 5 MVP tests green.

## Open decisions
- **VALIDATION GAP (the one flagged in the contract):** grounding-check algorithm — (a) entity/keyword allow+deny
  matching over free prose, or (b) stricter structured-output-only (provider emits `{interpretation_id, text}`
  pairs). Trade-off: (a) flexible prose but fuzzier detection (esp. Vietnamese); (b) robust grounding but rigid
  output. **Human/architect decision.**
- Whether `report_id`/`generated_at` (UUID/UTCInstant) are allowed to be non-deterministic (contract says UUID) —
  reconcile with the module's determinism ethos (likely: content deterministic, id/timestamp injected).
- Whether a real LLM `NarrativeProvider` (e.g. Anthropic) ships in Phase 9 or stays a Phase-10 wiring concern
  (contract: no vendor hard-coded in astrology-core → keep the abstraction + mock; real provider at the edge).

## Risks / blockers
- **Grounding-check completeness** is the core risk: false negatives = hallucination slips through (DoD failure);
  false positives = valid VI prose rejected. Vietnamese "named-entity" detection over free prose is fuzzier than
  English — favors option (b) or a conservative allow-set + numeric/date/planet-token deny scan.
- Must be **deterministic and non-LLM** (contract) — no calling a model to check a model.
- No blockers otherwise: input contract (Phase 8) is frozen and green; no astronomy/rules work; no external
  credentials needed (mock provider covers CI; real provider deferred).

## Recommended implementation sequence
1. Author `PHASE9_DECISIONS.md` resolving the VALIDATION GAP (grounding-check algorithm) + report_id/timestamp
   policy.
2. Extend `narrative/types.ts`: `Report`, `NarrativeStyle`, `NarrativeEngine`.
3. Implement `narrative/grounding.ts` (deterministic check) + unit tests (positive/negative/entity scan).
4. Implement `narrative/engine.ts` `generate → Report` (prompt → provider → grounding check → Report; refusal
   path).
5. Add adversarial hallucinating provider fixture + the negative AI-Grounding test; add refusal test.
6. Export from `index.ts`; keep MVP tests green; run full typecheck + suite.
7. Update `AI_GROUNDING_CONTRACT.md` (VALIDATION GAP → resolved).

## Estimated complexity: **MEDIUM**
Engine/Report/refusal are straightforward; the substantive work is the grounding-check algorithm design (the
flagged decision) + adversarial negative testing. No new astronomy, rules, or data. The MVP slice de-risks the
pipeline wiring.
