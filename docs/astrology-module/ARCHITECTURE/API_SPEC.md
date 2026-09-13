# API SPEC — Astrology Module (specification only, not implemented, not public/production)

## Scope

This is an **internal service boundary specification**, not a production public API. No authentication/authorization/rate-limiting design is included — those are explicitly deferred (see `ROADMAP.md` Phase 10).

## Proposed endpoints (contract only)

```
POST /astrology/chart       BirthData + SchoolConfig     -> Chart
POST /astrology/factors     Chart                        -> Factor[]
POST /astrology/analyze     Chart                        -> { factors, rule_evaluations, scores, evidence }
POST /astrology/interpret   analyze() output              -> InterpretationObject[]
POST /astrology/report      InterpretationObject[] + NarrativeStyle -> Report
```

Each endpoint corresponds exactly to one architecture layer boundary from `ARCHITECTURE_FREEZE.md` §3 — this is deliberate: **the API surface must never let a caller skip a layer** (e.g. there is no `POST /astrology/report` that accepts raw `BirthData` directly — this would recreate the `Birth Data → LLM → Reading` collapse the whole architecture exists to prevent).

## Internal-only Phase 1 surface

For Phase 1–3 (astronomical core through Western calculation, per `ROADMAP.md`), only the first endpoint's underlying function is relevant, and even that is internal-only, not exposed over HTTP yet:

```
calculate_chart(birth_data: BirthData, school_config: AstrologySchool) -> Chart
```

## Request/response conventions (to be finalized before any implementation)

- **Versioning**: every response includes `Chart.metadata` (or the equivalent per-endpoint metadata) with engine/ruleset/school-config versions — never an unversioned payload. See `ADR/ADR-008-Versioning-Strategy.md`.
- **Errors**: every error response uses the taxonomy in `ARCHITECTURE_FREEZE.md` §5 — a stable code, never a raw exception message leaked to the caller (see `SECURITY_MODEL.md`).
- **Idempotency**: `POST /astrology/chart` is idempotent for identical `(BirthData, SchoolConfig, engine_version)` — see reproducibility requirement in `ADR/ADR-008-Versioning-Strategy.md`. `POST /astrology/report` is **not** idempotent by default (LLM output is probabilistic — see `AI_GROUNDING_CONTRACT.md`) unless a caching/seed strategy is separately designed (deferred, `PERFORMANCE_MODEL.md`).

## Explicitly deferred (not part of this spec)

- Authentication/authorization
- Rate limiting / quota
- Public API documentation / OpenAPI schema publication
- Backwards-compatibility guarantees across API versions
- Webhooks / async job submission for long-running batch calculation

## Phase placement

Contract only, informs Phase 1–9 internal function signatures. HTTP-level implementation is Phase 10 per `ROADMAP.md`, and is explicitly named as **not started** by this freeze.
