# EVIDENCE ENGINE — Specification (not implemented)

## Purpose

Guarantee that every fired rule, and therefore every downstream interpretation and narrative sentence, carries a permanent, queryable record of exactly what produced it. This is the mechanism that makes the traceability chain in `ARCHITECTURE_FREEZE.md` §4.8 real rather than aspirational.

## Why this layer exists (audit grounding)

**opastro's `opastro explain` command is the only working, execution-verified precedent found in the entire audit** for this kind of provenance (`../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md` §5.4 — every rendered sentence carries a `source_factors` list and the literal template line used, confirmed live). This spec generalizes that proven, working pattern into its own explicit layer (opastro folds it into the renderer; this architecture separates it, per `ARCHITECTURE_FREEZE.md` §4.4).

## Schema

```
Evidence {
  evidence_id:     UUID
  interpretation_id: InterpretationId | null   // set once an Interpretation consumes this evidence
  rule_id:         RuleId
  factor_ids:      FactorId[]
  calculation_id:  CalculationId          // -> Chart.metadata.calculation_id, reaches all the way to astronomical calculation params
  source:          SourceRef | null       // classical-text citation, schema-supported, not mandatory at V1 (see below)
}

SourceRef {
  source_type: "classical_text" | "geometric_rule" | "derived"
  tradition:   string | null   // e.g. "BPHS", "Tetrabiblos", "Lilly"
  author:      string | null
  work:        string | null
  edition:     string | null
  page:        string | null
}
```

## Interface

```
interface EvidenceEngine {
  record(rule_evaluation: RuleEvaluation, calculation_id: CalculationId) -> Evidence
  trace(interpretation_id: InterpretationId) -> Evidence[]           // full backward trace
  traceToBirthData(evidence_id: EvidenceId) -> TraceChain             // Evidence -> Factor -> Chart -> BirthData, resolved
}
```

## Bibliography fields: schema-supported, not required at V1

Per `ARCHITECTURE_FREEZE.md` §6.D (over-design check): `SourceRef`'s `tradition/author/work/edition/page` fields exist in the schema now because retrofitting them later would be a breaking schema migration, but **no rule is required to populate them at V1**. Purely geometric rules (e.g. "Mars in the 10th house") have `source_type: "geometric_rule"` and no bibliography. Rules derived from a classical text (most Vedic yogas, traditional Western dignities) should populate `SourceRef` as content matures — this mirrors how the strongest audited oracles (PyJHora, mayaastrolib, vedic-calc) already cite their sources inline in code comments/docstrings (`../ASTROLOGY_REPO_AUDIT/raw/PyJHora.md`, `raw/mayaastrolib.md`), just formalized as structured data instead of a comment.

## Traceability guarantee (binding)

```
traceToBirthData(evidence_id) must always resolve fully:
  Evidence
    → Rule (via rule_id)
    → Factor[] (via factor_ids)
    → Chart (via calculation_id → CalculationMetadata)
    → BirthData (via Chart.birth_data_ref)
```
If any link in this chain cannot be resolved, `traceToBirthData` must raise `TRACE_INTEGRITY_ERROR` rather than return a partial trace — an incomplete trace is worse than an explicit error, because it would let an "orphaned conclusion" (the exact failure mode confirmed in `astro-natal-chart`/`zodiac-engine`, see `../ASTROLOGY_REPO_AUDIT/AI_ARCHITECTURE_AUDIT.md`) slip through silently.

## Phase placement

Interface + schema only (Phase 7, alongside Scoring — see `ROADMAP.md`). No evidence records exist until Rule Engine content (Phase 6) produces `RuleEvaluation`s to record.

## Open decisions

- **DECISION REQUIRED**: storage backend for `Evidence` records (see `PERFORMANCE_MODEL.md` — write volume scales with rule count × chart count, not yet benchmarked).
- None of the audited repos needed a `TRACE_INTEGRITY_ERROR`-equivalent concept because none of them build a multi-hop evidence chain this deep — this is a genuinely new design element, not adapted from any oracle, and should be treated as unproven until Phase 7 testing validates it end-to-end.
