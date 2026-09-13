# ADR-009: Validation Oracle Strategy

## Status
Proposed

## Context
The audit identified strong candidate repos for cross-validating calculation correctness (Swiss Ephemeris direct, stellium, mayaastrolib, PyJHora, vedic-calc, openastrology-library — `../../ASTROLOGY_REPO_AUDIT/BENCHMARK.md`, `TEST_AUDIT.md`), but every one of them carries a license that prevents direct vendoring into a closed-source commercial product (`../../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md`). The value they provide (validated reference numbers) is separable from the risk they carry (their code/license).

## Decision
1. Oracles are run **out-of-process**, in isolated dev/CI environments, never imported into the module's own dependency tree or shipped in production.
2. Oracle output is captured as static golden-fixture data (`{input, expected, oracle_id, oracle_version}`), checked into the test suite as data, not as a live runtime dependency.
3. Disagreements between two or more oracles beyond tolerance (`../TEST_ARCHITECTURE.md` §Precision) are flagged as `VALIDATION GAP` and investigated — never silently resolved by picking one oracle as automatically authoritative.
4. This applies to every school: Swiss Ephemeris + stellium + mayaastrolib for Western/astronomical; PyJHora + vedic-calc (+ openastrology-library as a tertiary check) for Vedic.

## Consequences
- Positive: full benefit of the audited repos' correctness work without inheriting their AGPL licensing or their code-quality issues (e.g. openastrology-library's confirmed house-lord bug).
- Positive: golden fixtures are portable, reviewable, versionable artifacts independent of whether the oracle repos themselves remain available/maintained long-term.
- Negative: fixture generation is a manual/scripted one-time (per test case) effort — oracles are not continuously re-run in production CI, so a fixture could go stale if an oracle later fixes a bug; periodic fixture regeneration is a maintenance task to schedule, not a one-time job.
