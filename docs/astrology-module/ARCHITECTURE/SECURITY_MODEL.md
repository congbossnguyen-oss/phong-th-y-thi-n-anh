# SECURITY MODEL — Specification

Grounded in `../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md`, which found concrete, execution-verified issues across the audited set (zodiac-engine's stored-XSS via unsanitized LLM output, astro-natal-chart's untrusted precompiled binary, PyJHora's `eval()`-based dispatch, several repos' unvalidated birth-data input). This spec exists to ensure none of those patterns are repeated.

## 1. Untrusted input

**All user-supplied input (`BirthData` fields, free-text location labels, any future user-provided name/note field) is untrusted by default**, validated at the Input/Validation layer (`ARCHITECTURE_FREEZE.md` §3, layers 1–2) before it reaches any other layer. No downstream layer may assume input has already been sanitized by an upstream caller it does not control.

- **No audited repo validates birth-data input comprehensively** (`../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md` "Cross-cutting findings" #1) — this is new work, not adapted from any oracle.
- Free-text fields (`location_label`, any future `name`/`note`) are display-only metadata and must never be interpolated into: a calculation path, a file path, a shell command, or (later) an LLM prompt without going through the same validation/escaping as any other untrusted string.

## 2. No dynamic code execution

- No `eval`/`exec`/dynamic-string-based dispatch anywhere in the module's own code. This directly avoids the pattern found in PyJHora (24+ `eval()` call sites for dynamic dispatch — low-risk as PyJHora uses it, but flagged in the audit as an anti-pattern to avoid replicating, `../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md`).
- The `RuleEngine`'s `ConditionExpr` (see `RULE_ENGINE_SPEC.md`) is a data structure interpreted by a small, fixed evaluator — never a string compiled or `eval`'d at runtime.

## 3. Rule/config file validation

- Rule sets and school configuration files (`RuleSet`, `AstrologySchool`) are **content**, potentially edited outside a full code-review pipeline as the rule library grows. They must be schema-validated against the `Rule`/`AstrologySchool` schemas (`RULE_ENGINE_SPEC.md`, `DOMAIN_MODEL.md`) **before load**, and rejected outright (not partially loaded) on any schema violation.
- No rule file format may support arbitrary code execution (e.g. no embedded script blocks) — `ConditionExpr` is a closed, enumerable set of operators, not an open scripting surface.

## 4. Ephemeris file / dependency access

- The astronomical-core provider's ephemeris data path (wherever `.se1`/equivalent files are configured) must be a fixed, trusted, deployment-time-configured path — **never** built from user-supplied input. (Precedent for the risk: `mayaastrolib`'s `setPath()` takes an unvalidated caller-supplied path; PyJHora ships a `pickle.load()` on a bundled place database — both low-risk as currently used, but the pattern must not be replicated with user-influenced input, `../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md`.)
- **No precompiled/prebuilt third-party binary of unverified provenance may be used**, in production or otherwise — this directly closes the exact gap found in `astro-natal-chart` (an unverified compiled `.pyd` Swiss Ephemeris binary with no checksum/signature/provenance, `../ASTROLOGY_REPO_AUDIT/raw/astro-natal-chart.md`). Any ephemeris binary used must come from an official, verifiable channel (official PyPI package, or a from-source build with a recorded, verifiable checksum).
- No unsafe deserialization (`pickle` or equivalent on untrusted data) anywhere in the module. If a caching layer needs serialization (see `PERFORMANCE_MODEL.md`), it uses a safe, schema-validated format (e.g. JSON), never `pickle` on data that could ever originate from an untrusted source.

## 5. Command execution prevention

- No component of this architecture ever shells out to an external process with user-influenced arguments. If any future integration requires subprocess invocation, it must use the list-argument form (never `shell=True`/string-interpolated commands) — the one safe pattern the audit did find used correctly, in `opastro` and `astro-natal-chart` (`../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md`), should be the only pattern ever used here.

## 6. AI Narrative layer (cross-reference)

Sanitization of LLM output before any HTML/rendering context, and never marking model output as trusted by default — fully specified in `AI_GROUNDING_CONTRACT.md` §Security note, directly closing the confirmed zodiac-engine stored-XSS/prompt-injection vulnerability.

## 7. Dependency security (general policy, not yet actionable — no concrete dependencies chosen at Architecture Freeze time)

- Whatever concrete libraries are eventually chosen for `SwissEphemerisProvider`, the timezone engine, or any other adapter must be tracked for abandonment/vulnerability status before adoption — the audit found `pyswisseph` de facto abandoned and its maintained fork `pysweph` the correct choice instead (`../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md`); the same due-diligence standard applies to every future dependency choice, not just this one.

## Open decisions

- **DECISION REQUIRED**: concrete rule-file schema-validation tooling (not chosen at Architecture Freeze time).
- **DECISION REQUIRED**: whether/how PII (birth data) is encrypted at rest and how long it is retained — no audited repo handles this at all (`../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md` "Cross-cutting findings" #5), so this is unguided new policy work, not adaptable from any oracle.
