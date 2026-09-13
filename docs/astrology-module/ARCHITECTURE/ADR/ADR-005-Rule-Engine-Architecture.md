# ADR-005: Rule Engine Architecture

## Status
Proposed

## Context
Every audited repo with astrological rule logic (PyJHora's 130+ yoga functions, vedic-calc's 24 detectors, mayaastrolib's yoga detectors, openastrology-library's yoga engine) implements it as hardcoded conditionals scattered through application code, not as declarative, data-driven rules (`../../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`, `INTERPRETATION_AUDIT.md`). This does not scale past a few dozen rules and makes correctness review, versioning, and localization all harder. No audited repo provides a counter-example to learn the declarative pattern from directly.

## Decision
1. Build a small, generic `RuleEngine` evaluator (`../RULE_ENGINE_SPEC.md`) with **zero embedded astrological knowledge** — it evaluates a `ConditionExpr` tree over `Factor[]` and nothing else.
2. All astrological knowledge (which conditions matter, what they mean) lives in versioned `Rule`/`RuleSet` data, authored and reviewed as content, never as application code.
3. Rule content is derived independently from public-domain primary classical sources or verified geometric conditions — never copied from an oracle's code or prose (see `../../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md`).
4. Rule files are schema-validated before load; the evaluator never `eval`s a string (`../SECURITY_MODEL.md`).

## Consequences
- Positive: adding a new rule is a content change, not a code change and deployment.
- Positive: rules are independently unit-testable without any astronomical calculation involved (`../TEST_ARCHITECTURE.md` "Rule Tests").
- Negative: authoring the initial rule content (Phase 6) is genuinely new work with no oracle to copy a declarative structure from — expect this phase to take longer per-rule initially than a hardcoded-conditional approach would, in exchange for long-term maintainability.
- Risk: `VALIDATION GAP` — a data-driven rule engine has no precedent audited repo to compare against structurally; its correctness must be proven via Rule Tests + end-to-end golden comparison against oracle *outputs* (not oracle *rule structure*, which doesn't exist to compare against).
