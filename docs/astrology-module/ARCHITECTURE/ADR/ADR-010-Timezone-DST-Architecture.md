# ADR-010: Timezone / DST Architecture

## Status
Proposed

## Context
Swiss Ephemeris has **zero** built-in knowledge of timezones or DST rules — confirmed directly by source inspection (`swe_utc_to_jd` converts UTC to Julian Day with leap-second awareness only; no IANA/tzdata database exists anywhere in the codebase — `../../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md` §3.4). No audited repo handles this well: most take a raw numeric UTC offset from the caller (unable to express historical DST rules), and the one repo that does use IANA timezone names (`opastro`) was found to have an undeclared dependency gap (`tzdata` missing from its own requirements on Windows) that broke out-of-the-box execution in the audit.

## Decision
1. `BirthData.timezone_id` is a mandatory IANA timezone identifier, never a bare UTC offset (`../DOMAIN_MODEL.md` §1).
2. A dedicated, custom-built Time Resolution component sits between Input/Validation and the Astronomical Core — never inside it — converting `local_time + timezone_id (+ historical DST rules)` into a canonical UTC instant.
3. This component must explicitly handle: valid unambiguous local time (normal case); **ambiguous local time** (DST fall-back overlap — the same wall-clock time occurs twice) → `AMBIGUOUS_LOCAL_TIME` error, never a silent guess; **nonexistent local time** (DST spring-forward gap — the wall-clock time never occurred) → `NONEXISTENT_LOCAL_TIME` error; unrecognized timezone identifier → `TIMEZONE_NOT_FOUND`.
4. Library/data-source candidate selection (e.g. a standard IANA tzdata-backed library) is deferred to implementation time but must explicitly declare its own dependency (avoiding opastro's undeclared-`tzdata` gap) and must support historical timezone rule changes, not just current rules.

## Consequences
- Positive: closes the single most universal gap found across the entire audited repo set.
- Positive: ambiguous/nonexistent local times are surfaced to the caller as an explicit decision point (e.g. "which of the two possible UTC instants did you mean?") rather than silently resolved wrong.
- Negative: this is new-build work with no oracle to validate the *logic* against (though the *output*, once resolved to UTC, can still be golden-tested against ephemeris oracles for the same instant) — flagged as requiring its own dedicated test matrix (`../VALIDATION_ORACLES.md` "Test matrix" DST/historical-timezone rows), which is itself new territory not found in any audited repo's test suite.
