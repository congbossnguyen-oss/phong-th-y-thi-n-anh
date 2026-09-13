# ADR-002: License Boundary

## Status
Proposed — **blocked on external legal decision (LEGAL DECISION REQUIRED)**

## Context
Swiss Ephemeris is dual-licensed AGPL-3.0 or a paid Astrodienst AG Professional License; terms of the latter are unconfirmed (`../LICENSE_BOUNDARY.md`, `../../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md`). Nearly every technically strong audited repo inherits this same fork in the road. No document produced by this audit or this architecture may resolve it — resolution requires direct contact with Astrodienst AG.

## Decision
1. The astronomical core is isolated behind `AstronomicalProvider` (ADR-001) specifically so this license decision touches exactly one component.
2. `SwissEphemerisProvider` is **specified, not implemented**, until the gate is closed.
3. Whichever resolution path is chosen (Professional License / AGPL with network isolation / alternative backend), the consequence is documented in `../LICENSE_BOUNDARY.md` §Architecture consequence and requires no change outside `SwissEphemerisProvider`.
4. If the AGPL path is pursued, the "separateness" of the isolation boundary (same-process module vs. separate network service) is itself a legal question, not an engineering one — this ADR does not decide it.

## Consequences
- Positive: engineering work on Phases 0–2 (and much of the rest of the module's design) is entirely unblocked by this open legal question.
- Negative: Phase 3 (the first phase requiring real astronomical calculation output) cannot ship to production until this gate closes.
- Risk: if the Professional License terms are commercially unacceptable, Phase 3+ may need to pivot to the AGPL-with-network-isolation path or an alternative backend — both carry their own follow-on consequences (documented in `../LICENSE_BOUNDARY.md`).

## Do NOT
No party may treat this ADR's existence as evidence that the license question is resolved. It exists to make the open question impossible to overlook, not to close it.
