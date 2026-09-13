# LICENSE BOUNDARY — Astronomical Core

**STATUS: LEGAL DECISION REQUIRED. This status is not resolved by this document and must not be treated as resolved by anyone reading it.**

## Current status

Per `../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md` (verified by reading Swiss Ephemeris's own `LICENSE`/`LICENSE.TXT` files directly, not by inference): Swiss Ephemeris is dual-licensed —
1. **GNU Affero General Public License v3 (AGPL-3.0)** — free, but its network-use clause (§13) requires that any modified program offered as a network service must make the complete corresponding source of the running service available to its users.
2. **Swiss Ephemeris Professional License** — a paid commercial license from Astrodienst AG. Its exact price and terms are **UNKNOWN / NOT VERIFIED** — this audit did not (and could not) contact Astrodienst directly.

**No repo audited, and no document in this architecture, has ever confirmed that a Professional License has been obtained or that its terms are acceptable for Phongthuy.vn.** Every audited repo that depends on Swiss Ephemeris (directly or via `pyswisseph`/`sweph`/Kerykeion) inherits this exact same unresolved fork in the road, regardless of the wrapper repo's own license badge (`LICENSE_AUDIT.md` "The pattern").

## Required action

**Contact Astrodienst AG directly** (via astro.com/swisseph) to obtain:
1. Current Professional License pricing and terms for a closed-source commercial SaaS deployment.
2. Confirmation of whether the license is per-seat, per-deployment, revenue-based, or otherwise structured.
3. Written confirmation of what "commercial use" covers (e.g., does it cover the astronomical-core service only, or does licensing terminology reach further into the architecture?).

This action item has an owner and a due date **outside this document's authority to assign** — it is a business/legal decision, not an engineering one, and is recorded here so it is never silently skipped.

## Architecture consequence (what this freeze already guarantees, regardless of the outcome)

Because the astronomical core is fully abstracted behind `AstronomicalProvider` (`DOMAIN_MODEL.md`), the license decision changes **exactly one component** — `SwissEphemerisProvider` — and nothing else in the module:

| If the decision is... | Consequence |
|---|---|
| Professional License obtained | `SwissEphemerisProvider` is implemented as a directly-linked/embedded adapter. No other layer changes. |
| AGPL branch accepted, service isolated | `SwissEphemerisProvider` becomes a thin client to a **separately deployed, source-available** microservice that itself runs Swiss Ephemeris under AGPL — the network boundary between "our closed-source product" and "the AGPL service" must be a real process/network boundary, not just a module boundary within the same binary (this distinction is itself a **LEGAL REVIEW REQUIRED** question — whether a same-process module boundary is sufficient "separateness" under AGPL is not something this document can determine). No other layer changes. |
| A different ephemeris backend is chosen instead | A new `AlternativeEphemerisProvider` is implemented against the same `AstronomicalProvider` interface. No other layer changes — provided the alternative can meet the same precision/house-system/ayanamsa breadth documented as required in `../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md` (no drop-in alternative of matching precision/breadth was found in the audit; this path carries its own `VALIDATION GAP`). |

This is the entire point of the `AstronomicalProvider` abstraction (`ADR/ADR-001-Ephemeris-Strategy.md`): the license decision is expensive and slow, and the architecture must not be blocked waiting for it, nor must the rest of the system need to be rebuilt once it lands.

## Do NOT

- Do **not** state, imply, or code a comment asserting that commercial closed-source use is cleared.
- Do **not** proceed to implement `SwissEphemerisProvider` in a form that links Swiss Ephemeris directly into a closed-source production binary until this gate is explicitly closed by a documented legal decision.
- Do **not** treat any audited repo's own license claims (several assert "MIT" while depending on AGPL Swiss Ephemeris — see `LICENSE_AUDIT.md`) as a substitute for Phongthuy.vn's own direct confirmation.

## Secondary license risk (independent of Swiss Ephemeris)

`jyotish-flutter-library-fork` contains verbatim PyJHora (AGPL) interpretive text re-labeled MIT (`../ASTROLOGY_REPO_AUDIT/LICENSE_AUDIT.md`). This architecture's rule content (Phase 6+) must never source interpretive text from that repo, or from PyJHora directly — classical-source rule *conditions* may be derived independently from public-domain primary texts (BPHS, etc.), but no repo's *expression* (code or prose) may be copied.

## Gate status for this Architecture Freeze

```
GATE: SWISS_EPHEMERIS_LICENSE
STATUS: LEGAL DECISION REQUIRED
BLOCKS: SwissEphemerisProvider implementation (Phase 1, concrete adapter only — interface spec is NOT blocked)
DOES NOT BLOCK: AstronomicalProvider interface design, timezone engine, chart model, rule/factor/evidence/interpretation architecture, all of which are provider-agnostic
```
