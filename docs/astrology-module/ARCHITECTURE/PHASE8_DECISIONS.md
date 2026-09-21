# PHASE 8 — Interpretation Methodology Decision Log

**Purpose.** Durable, auditable record of the human-ratified methodology decisions that gate Phase 8
(Interpretation). A future Claude session (or any reader) must be able to learn the ratified state of
each decision **from this file alone**, without relying on chat history.

**Authority.** Every entry marked `Status = HUMAN RATIFIED` records a decision made by the human
project owner. Claude did **not** make these decisions; Claude only recorded them. Words such as
"recommended", "proposed", "candidate", or "ready for ratification" do **not** appear as the status of
a ratified entry — a ratified entry is a settled human decision.

**Scope of this log.** Methodology only. It authorizes nothing in code by itself: no engine, schema,
rule, weight, score, conclusion key, confidence value, or prose exists because it is written here.
Implementation is gated separately by a later Phase 8 contract freeze.

**Decision chain (status at time of writing):**

| ID | Topic | Status |
|----|-------|--------|
| H1 | Western domain taxonomy | HUMAN RATIFIED |
| H6 | Rule weight policy | HUMAN RATIFIED |
| H3 | Conclusion-key vocabulary | HUMAN RATIFIED |
| H4 | Confidence policy | HUMAN RATIFIED |
| H5 | Interpretation strength | HUMAN RATIFIED |
| D-BIND | Rule → Domain binding | HUMAN RATIFIED |
| D-MULTI | Multi-domain rule policy | HUMAN RATIFIED |
| D-ABSENCE | `domain_not_indicated` semantics | HUMAN RATIFIED |
| D-CONF | Remove `confidence` | HUMAN RATIFIED |
| D-STRENGTH | Remove `strength` | HUMAN RATIFIED |
| D-ID | Deterministic interpretation id | HUMAN RATIFIED |
| D-SCORE | Inactive scoring / DomainScore | HUMAN RATIFIED |
| D-EVIDENCE | Conclusion → Evidence enforcement | HUMAN RATIFIED |

**Contract Freeze:** NOT YET DONE.

---

## H1 — Western Domain Taxonomy

- **Phase:** 8 (Interpretation methodology)
- **Decision ID:** H1
- **Date recorded:** 2026-09-20
- **Status:** HUMAN RATIFIED

### Decision
Granularity = **Model C, variant C2-expanded, research-first**. The Western interpretation domain
vocabulary is exactly these **15 canonical, Western-semantic keys**:

```
character_temperament
health
wealth
vocation
status_reputation
partnership
friends_social
family_home
siblings_kin
children
travel
religion_philosophy
shared_resources
adversaries
mortality
```

Domain keys are semantic Western-domain keys derived from classical Western significations
(Ptolemy, *Tetrabiblos* Books III–IV; Lilly, *Christian Astrology* Book 1). **Domain keys MUST NOT
encode house numbers.** This research taxonomy is independent of, and must never reference, the Vedic
house/bhava taxonomy (ADR-003).

### Rationale
Research-first: retain every domain with adequate classical provenance rather than pruning for
consumer/commercial scope. Model C2 keeps signification clusters distinct where the sources treat
them distinctly, while avoiding house-number-keyed vocabulary that would blur Western/Vedic isolation.

### Consequences
- No domain may be added, removed, renamed, or aliased.
- Non-canonical terms `career`, `relationship`, `family`, `education` are **forbidden as keys**.
- `character_temperament` (mind/soul, Ptolemy III.13) and `health` (body/illness, Ptolemy III.11/12)
  are separate; the boundary is semantic, not house-based.
- `vocation` (Ptolemy IV.4) and `status_reputation` (Ptolemy IV.3) are separate; "career" is not a unit.
- `wealth` (own, 2nd) and `shared_resources` (others'/legacies, 8th) are separate.
- `partnership` (7th) and `friends_social` (11th) are separate.
- `family_home`, `siblings_kin`, `children` are separate (no broad "family").
- `travel` (Ptolemy IV.8) and `religion_philosophy` (9th; "learning" folded in) are separate.

### Deferred items
- Standalone `education` is deferred/dropped: no dedicated classical chapter; learning is represented
  within `religion_philosophy` with the provenance limitation recorded.

### Scope
Taxonomy membership only. Does not create rules, weights, conclusions, prose, or product approval for
any domain.

### Explicit non-decisions
- No rule, weight, conclusion key, confidence, strength, prediction, or actionability is decided by H1.
- Commercial/product restrictions (if any) are a separate future policy layer, not part of H1.

---

## H6 — Rule Weight Policy

- **Phase:** 8 (Interpretation methodology)
- **Decision ID:** H6
- **Date recorded:** 2026-09-20
- **Status:** HUMAN RATIFIED

### Decision
| Sub-decision | Ratified value |
|---|---|
| H6.1 Weight model | **A — NO NUMERIC WEIGHT** |
| H6.2 Weight authority | No numeric weight authority. Classical sources provide provenance for astrological rules/significations only, **never** authority for numeric rule→domain weights. |
| H6.3 Multiple-rule aggregation | **NO NUMERIC AGGREGATION** in Phase 8. |
| H6.4 Cross-domain comparability | **PROHIBITED** — raw `DomainScore` must not be compared or ranked across domains. |
| H6.5 Weight range | **N/A** — no numeric weight. |
| H6.6 DomainScore | **INACTIVE / DEFERRED for Phase 8** — not a source of magnitude or interpretive strength. |

### Rationale
H1 primary-source research established that no classical source supplies a numeric weighting system
for rule→domain contribution. Any numeric weight would therefore be an engineering/product construct;
the human chose not to introduce one in Phase 8, keeping provenance clean and avoiding pseudo-precision.

### Consequences
- Phase 7 Scoring Engine **remains frozen**; it is not modified.
- No numeric rule weights are added; no pseudo-precision is created.
- `RuleEvaluation.strength = 1.0 / 0.0` remains only a structural fired/not-fired mirror.
- `Factor.strength = 0` remains unchanged.
- A fired-rule **count is not "strength"** and must not be labelled as such.
- `DomainScore` must not be used to rank or cross-compare domains.
- Classical dignity points must **not** be repurposed as rule weights.

### Deferred items
- Numeric weighting, if ever introduced, requires a separate future methodology decision (new ID).
- `DomainScore` reactivation for interpretive magnitude is deferred to that future decision.

### Scope
Weight/aggregation/comparability policy for Phase 8 interpretation. No engine or schema change.

### Explicit non-decisions
- Does not decide confidence (H4) or interpretation strength (H5).
- Does not alter H1 or H3.

---

## H3 — Conclusion-Key Vocabulary

- **Phase:** 8 (Interpretation methodology)
- **Decision ID:** H3
- **Date recorded:** 2026-09-20
- **Status:** HUMAN RATIFIED

### Decision
| Sub-decision | Ratified value |
|---|---|
| H3.1 Conclusion model | **MINIMAL SEMANTIC KEYS** |
| H3.2 Canonical vocabulary | **Exactly two keys:** `domain_activated`, `domain_not_indicated`. `domain_multiple_testimonies` is **not** added at H3. No aliases. No prose keys. |
| H3.3 Polarity | **PROHIBITED / DEFERRED** — none of positive, negative, favorable, unfavorable, supportive, challenging, stable, unstable, mixed. |
| H3.4 Intensity | **PROHIBITED / DEFERRED** — none of strong, weak, major, minor, high, low, emphasized, diminished. |
| H3.5 Global conclusions | **PROHIBITED / DEFERRED** — no overall, chart_contains, multiple_domains, global_pattern, or equivalent. |
| H3.6 Sensitive domains | **SAME STRUCTURAL VOCABULARY** — `shared_resources`, `adversaries`, `mortality` use the same two keys, research-first. |
| H3.7 Conclusion → Evidence | **MANDATORY** — every canonical conclusion must trace to Evidence. |
| H3.8 Prose generation | **DEFERRED** — no Vietnamese prose at H3; narrative/wording/advice belong to later phases. |

### Definitions (structural semantics)
- `domain_activated` = the domain has **at least one fired rule that carries Evidence**.
- `domain_not_indicated` = **no fired rule references the domain** in the evaluated ruleset.

Mandatory trace for any canonical conclusion:
`Conclusion → RuleEvaluation → Evidence → Factor → Calculation → SourceRef`.

### Rationale
At the current pipeline state (no rule polarity; `RuleEvaluation.strength` boolean; `Factor.strength = 0`;
dignity unbuilt; H6 = no numeric weight), only **structural presence** is deterministically derivable
and fully traceable without overclaiming. Polarity, intensity, global, predictive, and actionable
vocabulary have no current foundation and are deferred.

### Consequences
- These are **structural** semantics, not judgments: `fired ≠ positive`, `fired ≠ favorable`,
  `fired ≠ strong`; `absence ≠ proof an event will not happen`.
- Canonical keys contain **no** prediction, actionability, prose, intensity, or polarity.
- Sensitive domains: `mortality_activated` is **not** a death prediction; `adversaries_activated` is
  **not** an accusation or certainty about enemies; `shared_resources_activated` is **not** a financial
  guarantee. Any product-policy restriction is a separate future layer and does not change H3 methodology.

### Deferred items
- `domain_multiple_testimonies` (structural), all polarity keys, all intensity keys, global conclusions,
  predictive/actionable keys, and Vietnamese prose — each deferred to a later, separately-decided step.
- Polarity keys additionally require future source-backed polarity on rules (does not exist today).

### Scope
Conclusion-key vocabulary for Phase 8 interpretation. No schema change (existing
`conclusion: { key, params }` already accepts these keys).

### Explicit non-decisions
- Does not decide confidence (H4) or interpretation strength (H5).
- Does not create conclusion templates or prose.
- Does not alter H1 or H6.

---

## H4 — Confidence Policy

- **Phase:** 8 (Interpretation methodology)
- **Decision ID:** H4
- **Date recorded:** 2026-09-20
- **Status:** HUMAN RATIFIED

### Decision
| Sub-decision | Ratified value |
|---|---|
| H4.1 Confidence existence | **A — NO CONFIDENCE CONCEPT FOR PHASE 8.** No confidence field or semantic claim. No numeric confidence. No ordinal confidence. Evidence status and provenance may exist as structural information but must **never** be called or interpreted as confidence. |
| H4.2 Evidence vs confidence | **STRICT SEPARATION.** Evidence denotes only traceability, provenance, the rule/factor/calculation/source chain, and evidence-chain integrity. Evidence denotes **none of**: certainty, probability, confidence, intensity, polarity. |
| H4.3 Fired-rule count | **PROHIBITED** as confidence/certainty. Invariant: `N fired rules != N% confidence`. More fired rules does **not** by default mean a more certain conclusion. |
| H4.4 Source provenance | **PROVENANCE-ONLY.** `source_type` (`classical_text` / `geometric_rule` / `derived`) is a provenance classification only; it must **not** become a confidence multiplier, reliability score, certainty tier, numeric weight, or ordinal confidence. Explicitly: `classical_text != higher confidence`; `geometric_rule != lower confidence`. |
| H4.5 Sensitive domains | **NO CONFIDENCE SEMANTICS FOR SENSITIVE OUTCOMES.** No confidence semantics may create or imply certainty about `mortality`, `health`, `adversaries`, or `shared_resources`. The same structural policy applies to all 15 canonical domains; no domain-specific confidence system. Specifically: `mortality_activated ≠ death certainty`; health activation ≠ medical-outcome certainty; `adversaries_activated` ≠ certainty about an enemy/person; `shared_resources_activated` ≠ financial guarantee. |
| H4.6 Future numeric/statistical confidence | **DEFERRED TO A SEPARATE FUTURE METHODOLOGY PHASE.** Any future numeric/statistical confidence requires its own methodology, appropriate empirical calibration, a suitable data/validation methodology, and its own human ratification. It must **not** circumvent H4/H6 by renaming scoring as confidence. Phase 8 does not implement numeric/statistical confidence. |

### Rationale
The H4 decision-support preflight established that the current pipeline supports only structural,
deterministic signals (activation, evidence completeness, provenance class) and that no Western
classical source (Ptolemy, Lilly) supplies a machine-readable confidence concept. `RuleEvaluation.strength`
is a boolean mirror, `Factor.strength = 0`, and H6 prohibits the numeric substrate a confidence score
would require. A `0..1` confidence field would silently merge distinct concepts (calculation validity,
evidence completeness, source authority, interpretive certainty, statistical probability) and
manufacture pseudo-precision. The human therefore ratified **no confidence concept** for Phase 8.

### Consequences (recorded, not implemented)
- `INTERPRETATION_SPEC.md` currently declares `confidence: number (0..1)`, but its formula was never
  defined and no implementation of it exists in the pipeline.
- H4 ratification means Phase 8 has **no** confidence concept.
- The disposition of that spec field (remove / make optional-null / redefine) is handled at the
  **Phase 8 Contract Freeze**, after the necessary H decisions complete — **not** in this record.
- This entry is documentation of a decision, **not** an implementation; `INTERPRETATION_SPEC.md` is
  not modified here.

### Deferred items / Explicit non-decisions
H4 does **not** decide any of: evidence weighting; source reliability ranking; numeric confidence;
ordinal confidence; statistical probability; empirical prediction accuracy; confidence calibration;
cross-domain confidence comparison; domain-specific confidence; sensitive-domain certainty; prose
wording. Each is addressed only by a separate future methodology decision, if ever.

### Scope
Confidence policy for Phase 8 interpretation. No engine, schema, or spec change.

---

## H5 — Interpretation Strength Policy

- **Phase:** 8 (Interpretation methodology)
- **Decision ID:** H5
- **Date recorded:** 2026-09-20
- **Status:** HUMAN RATIFIED

### Decision
| Sub-decision | Ratified value |
|---|---|
| H5.1 Interpretation strength existence | **A — NO INTERPRETATION STRENGTH FOR PHASE 8.** No semantic concept of interpretation strength; no numeric strength; no ordinal strength; no magnitude field inferred at Interpretation. The H3 structural conclusions `domain_activated` / `domain_not_indicated` keep their structural-only meaning. |
| H5.2 RuleEvaluation.strength | **STRICTLY STRUCTURAL.** `RuleEvaluation.strength` (1.0 fired / 0.0 not) is a boolean mirror / structural fired-gate. It must **not** be promoted or reinterpreted as interpretation strength, intensity, certainty, magnitude, or importance. |
| H5.3 Evidence/rule count | **PROHIBITED AS INTERPRETATION STRENGTH.** Fired-rule count, evidence count, factor count, and source count must not be used as interpretation strength. Invariants: `N supporting rules != strength N`; `more evidence records != stronger conclusion` — unless a separate future methodology establishes independence, deduplication, weighting, and (if numeric) calibration. |
| H5.4 Classical astrological strength concepts | **DEFERRED.** Essential dignity, essential strength/debility, accidental strength, planetary condition, and dignity scoring must not be repurposed as interpretation strength. Lilly/Ptolemy-derived strength concepts do not automatically become a generic interpretation-layer scalar; they may be studied/implemented only under a separate methodology. |
| H5.5 Layer placement | **FUTURE STRENGTH MUST LIVE BELOW INTERPRETATION.** Any future strength methodology must not be invented directly at the Interpretation layer; it requires a lower-layer methodology (Factor layer, Rule layer, or a dedicated Strength Engine), with clear source/provenance, its own methodology, and its own human ratification before implementation. Interpretation must never "manufacture" magnitude when lower layers lack the corresponding data/method. |
| H5.6 Sensitive domains | **NO STRENGTH SEMANTICS THAT IMPLY OUTCOME CERTAINTY.** No interpretation-strength semantics may imply certainty about `mortality`, `health`, `adversaries`, or `shared_resources`. Applied uniformly across all 15 canonical domains; no domain-specific strength system. Specifically: mortality activation ≠ death likelihood/certainty; health activation ≠ medical-outcome certainty; adversaries activation ≠ certainty about another person; shared_resources activation ≠ financial guarantee. |
| H5.7 Future numeric strength | **DEFERRED TO A SEPARATE FUTURE METHODOLOGY PHASE.** Any future numeric interpretation strength requires its own methodology, valid numeric inputs, a validation methodology, calibration (for any quantitative claim), and its own human ratification. It must not circumvent H4/H6 by renaming scoring as "strength." Phase 8 does not implement numeric strength. |

### Rationale
The H5 decision-support preflight established that the current pipeline carries no genuine magnitude
(`RuleEvaluation.strength` is boolean, `Factor.strength = 0`, `DomainScore` inactive under H6) and that
no Western classical source supplies a machine-readable *interpretation-layer* strength scalar — the
closest genuine construct (dignity) measures planetary condition, lives in an unbuilt lower layer, and
cannot be repurposed. Inventing strength at the Interpretation layer would conceal missing lower-layer
methodology and manufacture pseudo-precision. The human therefore ratified **no interpretation strength**
for Phase 8.

### Consequences (recorded, not implemented)
- `INTERPRETATION_SPEC.md` still declares `InterpretationObject.strength: number`, but that field has
  no derivation formula, no implementation, and no ratified methodology.
- H5 ratification means Phase 8 has **no** interpretation-strength semantic.
- Disposition of that orphaned field (remove / make optional-null / redefine) is decided only at the
  **Phase 8 Contract Freeze** — **not** here.
- This entry is documentation of a decision, **not** an implementation; `INTERPRETATION_SPEC.md` is
  not modified here.

### Deferred items / Explicit non-decisions
H5 does **not** decide any of: dignity implementation; accidental-dignity implementation; a planetary
strength engine; numeric strength; ordinal strength; empirical calibration; prediction accuracy;
cross-domain strength comparison; domain-specific strength; strength-based prose; scoring redesign.
Each is addressed only by a separate future methodology decision, if ever opened.

### Scope
Interpretation-strength policy for Phase 8. No engine, schema, or spec change.

---

# Contract-Freeze Precheck Decisions (D-series)

These eight decisions resolve the gaps surfaced by the Phase 8 Contract Freeze Precheck. They are
human-ratified methodology/contract decisions. They authorize a later Contract Freeze; they do **not**
themselves change any code, schema, spec, or RuleSet, and they do **not** assign a domain to any
existing rule.

## D-BIND — Rule → Domain Binding

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
Phase 8 uses **explicit Rule-level domain binding**. Conceptual contract: `Rule.domain: CanonicalDomain`,
where `CanonicalDomain` is exactly one of the 15 H1 domains (`character_temperament`, `health`, `wealth`,
`vocation`, `status_reputation`, `partnership`, `friends_social`, `family_home`, `siblings_kin`,
`children`, `travel`, `religion_philosophy`, `shared_resources`, `adversaries`, `mortality`).

### Invariants
- `Rule.domain` is a **semantic domain binding** only — not a numeric weight, score, confidence,
  strength, or polarity.
- `Rule.domain` is **independent of `Rule.weighting`**. H6 is unchanged; `Rule.weighting` must **not**
  be used as the Phase 8 domain-binding mechanism.

### Scope / non-decision
D-BIND ratifies architecture/contract only. It does **not** assign a domain to any Western RuleSet V1
rule in this record (see "Western RuleSet V1 — explicit non-decision" below). Per-rule domain
assignment is a separate content/methodology task if ever needed.

---

## D-MULTI — Multi-domain Rule Policy

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
In Phase 8, **1 Rule → exactly 1 canonical domain**. A rule binding to multiple domains at once is not
supported.

### Rationale
Keeps the contract simple and deterministic; avoids implicit cross-domain semantics; fits the structural
`domain_activated` conclusion; adds no unneeded complexity.

### Non-decision
Any future multi-domain methodology requires its own decision. Multi-domain must **not** be inferred
from D-BIND.

---

## D-ABSENCE — `domain_not_indicated`

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
`domain_not_indicated(domain)` holds when **no** fired Rule satisfies all of: the Rule is bound to that
domain (D-BIND), `RuleEvaluation.fired = true`, and a corresponding Evidence record exists.

### Semantic boundary
`domain_not_indicated` does **not** mean: an event will not / cannot happen, negative prediction,
unfavorable outcome, low confidence, weak result, or probability zero. It is **structural absence only**.

---

## D-CONF — Interpretation Confidence

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
Phase 8 **REMOVES** `InterpretationObject.confidence`. There is no confidence concept in Phase 8:
no numeric, ordinal, evidence-count, rule-count, source-type, or sensitive-domain confidence. Any future
confidence methodology requires its own decision. **REDEFINE is not permitted** under this decision.
(Consistent with H4; disposition = REMOVE.)

---

## D-STRENGTH — Interpretation Strength

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
Phase 8 **REMOVES** `InterpretationObject.strength`. There is no interpretation-strength concept in
Phase 8. `RuleEvaluation.strength = 1.0 / 0.0` remains a structural fired-gate in the Rule Engine and
must **not** be turned into magnitude, intensity, importance, certainty, probability, or interpretation
strength. Any future Strength Engine / lower-layer strength methodology requires its own decision.
**REDEFINE is not permitted** under this decision. (Consistent with H5; disposition = REMOVE.)

---

## D-ID — Deterministic Interpretation ID

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
`interpretation_id` must be generated **deterministically**: same canonical inputs → same
`interpretation_id`. No random UUID generation. Construction is based on the canonical deterministic
inputs of the interpretation contract; the exact hashing/encoding mechanism is fixed at Contract
Freeze / implementation contract. The Evidence ID contract is **not** changed.

---

## D-SCORE — Inactive Scoring / DomainScore

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
Phase 8 uses no active numeric Scoring. `DomainScore` remains **INACTIVE / DEFERRED**. Phase 8
`interpret()` must **not** require a non-empty `scores` input, and the interpretation contract must not
depend on active DomainScore. No Scoring Engine redesign, no numeric aggregation, no cross-domain
ranking, no score→strength, no score→confidence. Future Scoring activation requires its own
methodology/contract decision. (Consistent with H6.)

---

## D-EVIDENCE — Conclusion → Evidence Enforcement

- **Date recorded:** 2026-09-21
- **Status:** HUMAN RATIFIED

### Decision
H3.7 is enforced at the **Interpretation construction / validation boundary**: every emitted
Interpretation must have `evidence.length > 0`. A conclusion without Evidence is not a valid emitted
Interpretation. Evidence keeps its semantics (provenance, traceability, chain integrity) and must
**not** become confidence, strength, probability, intensity, or polarity. The Evidence Engine is **not**
changed in this record.

---

## Western RuleSet V1 — explicit non-decision

D-BIND does **not** assign a domain to `WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT`,
`WESTERN.STRUCT.LUMINARIES_SAME_MODALITY`, or `WESTERN.STRUCT.LUMINARIES_IN_ASPECT`. These rules are
currently unassigned; no domain assignment is invented here. Any assignment is a separate
content/methodology decision. Western RuleSet V1 remains FROZEN.

## H6 preservation (restated)

D-BIND does not reactivate `Rule.weighting`, and does not create numeric weight, DomainScore, score
aggregation, or cross-domain comparison. `Rule.domain` and `Rule.weighting` are independent concepts.

---

## Cross-cutting invariants (all decisions)

- No source code, tests, schema, rules, scoring, evidence, or interpretation implementation is changed
  by recording these decisions.
- Western RuleSet V1 remains FROZEN.
- Phases 5/6/7/7B remain FROZEN.
- Da Liu Ren and all concurrent work are out of scope and untouched.
