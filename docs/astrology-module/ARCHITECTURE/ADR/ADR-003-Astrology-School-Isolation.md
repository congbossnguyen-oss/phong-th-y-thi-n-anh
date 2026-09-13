# ADR-003: Astrology School Isolation

## Status
Proposed

## Context
Western, Vedic, Hellenistic, Traditional, and KP astrology use different zodiacs, house systems, ayanamsas, aspect rules, and doctrine entirely. Audited repos that support more than one school (`openastrology-library`, `mayaastrolib`) already keep their *calculators* separate but do not formalize this as an explicit configuration/isolation boundary — `../../ASTROLOGY_REPO_AUDIT/WESTERN_AUDIT.md`, `VEDIC_AUDIT.md`. No audited repo cleanly isolates more than two schools' *rule* content from each other.

## Decision
1. Every school is represented by an `AstrologySchool` configuration object (`../DOMAIN_MODEL.md` §5) that never references another school's configuration.
2. Source code is organized under `schools/<school>/` (`../ROADMAP.md` repository structure); nothing under one school's folder may import from another's.
3. Each school has its own `FactorEngine`, rule set (`<school>.rules.vN`), and interpretation templates — never shared implementations across schools, even where the underlying math looks similar (e.g. aspect-angle matching is conceptually similar between Western and Vedic Drishti, but the two are configured and evaluated independently).
4. Future schools (Bát Trạch, Huyền Không, Tử Vi, Bát Tự) follow the exact same isolation pattern and have zero dependency on the Western/Vedic modules built in this phase.

## Consequences
- Positive: a bug or a licensing issue discovered in one school's rule content cannot silently corrupt another's.
- Positive: Phongthuy.vn's own phong-thủy schools can be added later without touching or being constrained by the Western/Vedic astrology code.
- Negative: some genuinely shared math (e.g. generic angle-difference/orb-matching utilities) must live in a neutral shared utility module, not duplicated per school — this utility module must contain zero astrological judgment, only geometry, to avoid becoming a backdoor cross-school dependency.
