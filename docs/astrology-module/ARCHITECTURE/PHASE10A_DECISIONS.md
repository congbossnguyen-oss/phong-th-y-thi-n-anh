# PHASE 10A — DECISIONS (Astrology Web MVP)

**Status:** ratified for implementation (this session). Scopes and bounds Phase 10 down to the MVP
vertical slice. Supersedes nothing in `PHASE10_PREFLIGHT.md` — it acts on that preflight's
recommended DoD-A path.

**Baseline:** Phase 9 impl `45901f7`, Phase 9 docs `19287a5`. astrology-core suite green (847/847,
40 files — includes the concurrent `anthropicProvider` tests already in HEAD).

---

## Decisions

- **D1 — Phase 10A is the MVP Web vertical slice.** The delivered scope is exactly:
  `input → validation → chart → factor → rule → evidence → interpretation → narrative + grounding →
  ViewModel → Astro SSR presentation`, served by the existing (previously untracked) web slice:
  `src/pages/astrology-mvp.astro`, `src/lib/western-astrology/*`, `src/components/western-astrology/*`.
  It is a non-public, `noIndex`, un-linked demo route driving `mvp.demo.v1` (vocation/health only).

- **D2 — Production API / auth / rate-limiting / database are DEFERRED to Phase 10B.** No HTTP
  astrology API endpoints (`API_SPEC.md`'s 5 endpoints), no authentication/authorization, no rate
  limiting/quota, and no production database/persistence are built in Phase 10A. Each is gated behind
  a separate, approved **Phase 10B specification** (see the DoD note below).

- **D3 — astrology-core is consumed as-is.** No file under `packages/astrology-core/**` is modified
  in Phase 10A. The app layer only *calls* the frozen Phase 3–9 public API and maps results to a
  typed ViewModel; no astrology value is recomputed at the app layer. (Verified: `git status`
  reports astrology-core source clean; core suite 847/847.)

- **D4 — all computation remains server-side.** The orchestrator runs in the Astro SSR frontmatter
  (`prerender = false`, `@astrojs/node`). Chart calculation, factor/rule/evidence/interpretation, the
  narrative call, the grounding check, and all key/relay handling execute on the server. No astrology
  computation and no provider/secret logic is shipped to the client bundle.

- **D5 — narrative output remains grounding-gated.** Every narrative is produced through
  `createNarrativeEngine`, whose deterministic `checkGrounding` (Phase 9 D1) runs before any text
  reaches the ViewModel. A rejected narrative is surfaced to the UI as blocked/refused
  (`groundingCheckPassed = false`, text replaced by the fixed `NARRATIVE_BLOCKED_TEXT`), never the
  hallucinated content. Covered by the app-layer smoke test's adversarial case.

- **D6 — no real provider is enabled by default.** `getWesternAstrologyNarrativeProvider()` returns
  the deterministic mock unless a server-side `ANTHROPIC_API_KEY` is present; absence never throws.
  The real Anthropic provider (Phase 9 D3-REVISED) is opt-in via server config only, routed through
  the app's existing relay (`x-relay-secret`), and its untrusted output is still grounding-gated.

## DoD ambiguity — explicitly deferred

`ROADMAP.md` (Phase 10 = "public API + auth + rate limiting + production database", DoD *unspecified*)
and `API_SPEC.md` (internal boundary only; auth/rate-limit/DB *deferred*) disagree on Phase 10's real
content. **This reconciliation and the authoritative Phase 10 DoD are deferred to the Phase 10B
specification pass**, as `ROADMAP.md` itself requires ("a separate specification pass is required
before Phase 10 begins"). Phase 10A does not attempt to resolve it and does not build DoD-B scope.

## Implementation notes (Phase 10A)

- **Test seam:** `runWesternAstrologyMvp(input, deps?)` gained one optional `deps.narrativeProvider`
  argument (default = env-selected provider). Additive, backward-compatible; the SSR page passes one
  argument, so production behavior is unchanged. Purpose: inject mock/adversarial providers in the
  smoke test without a network call or API key.
- **Input guards:** no new validation code was added — non-finite/out-of-range latitude/longitude are
  already rejected by astrology-core `validateCoordinates` (`Number.isFinite` + range), invoked by
  the orchestrator *before* any calculation, and routed to the existing `missing_input` refusal. The
  smoke test locks this behavior (NaN latitude → `missing_input`, calc never runs) rather than
  duplicating the guard at the app layer.
- **Smoke test:** `src/lib/western-astrology/__tests__/mvp.smoke.test.ts` (5 cases) — real chart
  (empirically-verified firing input 1990-06-15 11:00 Asia/Ho_Chi_Minh → Sun in house 10 → vocation),
  grounding surfaced, adversarial hallucination blocked, invalid-coords refusal, and no key/secret in
  the selected provider or the ViewModel.

## Out of scope (STOP-condition check)

No functionality outside Phase 10A was found in the existing slice: no DB/persistence, no client
fetch, no cookies/analytics, no HTTP astrology API, no `set:html`. The only network call is the
server-side narrative relay `fetch`. Nothing was deleted or reverted.
