# PERFORMANCE MODEL — Specification (measurement only, no optimization)

**No premature optimization.** This document defines what to measure once an implementation exists — it authorizes no optimization work at Architecture Freeze time, since there is nothing yet to optimize and no baseline to optimize against.

## Benchmarks to establish once `AstronomicalProvider` has a concrete implementation

| Benchmark | What it measures | Why it matters |
|---|---|---|
| **Cold calculation** | First `calculate_chart()` call after process start, including ephemeris provider initialization (data-file loading, native library loading) | Swiss-Ephemeris-backed providers have real, nonzero init cost (data file I/O) — several audited repos' first-call behavior was not benchmarked in the audit itself (`../ASTROLOGY_REPO_AUDIT/BENCHMARK.md` "What was NOT benchmarked") |
| **Warm calculation** | Subsequent `calculate_chart()` calls with the provider already initialized | Establishes the real per-request cost once amortized init is excluded |
| **Batch calculation** | N charts calculated in sequence/parallel (relevant for, e.g., bulk compatibility/synastry features later) | Determines whether a provider is safely reusable across concurrent requests — the audit found a real, reproducible concurrency defect in `mayaastrolib` (thread-safety claim did not hold on an unsupported Python version, `../ASTROLOGY_REPO_AUDIT/raw/mayaastrolib.md`) that must be independently re-verified for whatever provider this module ultimately uses |
| **Memory** | Peak/steady-state memory per calculation, and per loaded ephemeris data set | Ephemeris data files can be large (audit noted a 48GB *full* asteroid data set exists upstream — `../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md`); the module must know its real footprint before deciding what subset of data to ship/mount |
| **Ephemeris initialization** | Time to load/mount ephemeris data files and confirm `precision_class: file_based` (vs. silently falling back to `analytic_fallback`) | Directly tied to the silent-Moshier-fallback risk documented in `SWISS_EPHEMERIS_AUDIT.md` — a slow or failed init must be observable, not just silently degrading precision |

## Deferred (explicitly not designed yet)

- Caching strategy (which layers are cacheable — `Chart` calculation is a strong candidate given its determinism, per `ADR/ADR-008-Versioning-Strategy.md`'s reproducibility guarantee; `Report`/AI Narrative output is not safely cacheable without an explicit strategy given its non-determinism, see `AI_GROUNDING_CONTRACT.md`).
- Memoization keys and invalidation policy.
- Horizontal scaling / provider-instance pooling strategy.
- Any numeric target (latency SLO, throughput target) — none is set here because no baseline exists yet; setting a target before measuring a baseline would itself be premature.

## Phase placement

Benchmarks are established starting Phase 1 (as soon as any `AstronomicalProvider` implementation, even a stub, exists) and re-measured at the end of each subsequent phase. No optimization work is scheduled in `ROADMAP.md` until a real baseline exists and a concrete performance problem is observed.
