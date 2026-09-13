# ADR-009: Validation Oracle Strategy

## Status
Proposed. **Amended for Phase 3 (Western Calculation) — see "Amendment: Phase 3 oracle substitution" below.** The original Decision/Consequences sections below are preserved verbatim as the historical record of what was originally specified; they are not rewritten or deleted.

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

## Amendment: Phase 3 oracle substitution (post-Phase-3C audit decision)

**Context.** Point 4 of the original Decision above, and `ROADMAP.md`'s Phase 3 DoD, name **stellium**
(alongside direct Swiss Ephemeris) as the required oracle for Western/astronomical golden tests.
The post-Phase-3C architecture audit (commit `b0681c1dc9ca9ac0f46f45d516c6dc6e70eb27e2`) confirmed
that stellium was never actually run as an oracle anywhere in Phase 3A/3B-1/3B-2/3C — this is a
real, undisputed gap between the original decision and what was done, flagged as finding F1.

**What was actually used instead, per calculation layer:**
- Planetary positions (Phase 3A): **JPL Horizons** (NASA/JPL), queried directly, independent of
  Swiss Ephemeris's own DE-series data — see `PHASE3A_ASTRONOMICAL_CORE.md` "Golden fixture
  provenance". This plays the same *role* ADR-009 assigns to `mayaastrolib` (an independent,
  non-Swiss-Ephemeris ephemeris cross-check), obtained directly rather than through that repo's
  Python wrapper.
- House cusps / Ascendant / Midheaven (Phase 3B-1): an **independently implemented mathematical
  formula** (Meeus GMST + mean-obliquity, plus the standard closed-form RAMC-based ASC/MC
  equations), sign-calibrated against one known-good value and then independently re-validated
  against 6 further scenarios before being trusted — see `PHASE3B1_HOUSES_ANGLES.md` "Golden
  fixture provenance". stellium was not used because JPL Horizons does not track house/angle
  quantities at all, and no stellium environment was stood up for this project.
- Aspects (Phase 3C): a **second, algorithmically independent implementation of angular
  separation** (a trigonometric identity, `acos(cos(Δ))`, needing no wraparound branch — verified
  against the production `abs`+conditional-reflect implementation on 9 sample pairs), combined
  with the **pre-existing Phase 2 benchmark fixture** (`fullWesternChart()`, written before Phase
  3C, already containing real Sun-trine-Saturn / Moon-conjunction-Saturn aspect data computed
  independently of this phase's code) — see `PHASE3C_ASPECTS_IMPLEMENTATION.md` "Independent
  validation method".

**Decision.** The project **formally accepts this substitute-oracle strategy as satisfying the
*intent* of Phase 3's validation DoD** — external, independently-grounded validation at each
calculation layer, not validation against the implementation under test alone. This acceptance is
based on: (1) every substitute is a genuinely independent source or algorithm at the specific layer
it validates, not a restatement of the code being tested; (2) agreement with each substitute was
verified quantitatively (JPL Horizons: ~0.00001-0.00003° for planets; the independent RAMC formula:
~0.001-0.005° for houses/angles, consistent with the known mean-vs-apparent theoretical
difference; the trig identity: agreement to 1e-9° for aspects); (3) the substitution was reviewed
explicitly as part of the post-Phase-3C audit, not silently assumed equivalent beforehand.

**This decision does NOT claim the substitutes are identical to stellium**, nor does it retract
stellium as a legitimate oracle — the original Decision (point 4, above) is left intact as the
historical record of what was originally specified. **Stellium remains a possible future
comparative oracle** — if it is later stood up out-of-process (per this ADR's own point 1), any
disagreement beyond the tolerances in `TEST_ARCHITECTURE.md` §Precision would be treated as a
`VALIDATION GAP` per point 3 above, exactly as this ADR already prescribes for any two oracles.

No code, test, or `NormalizedChart` schema change accompanies this amendment — it is a
documentation-only resolution of finding F1 from the post-Phase-3C audit.
