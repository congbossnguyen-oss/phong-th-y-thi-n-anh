# DOMAIN MODEL — Astrology Module

Specification only. Types below are language-agnostic pseudocode (field: type), not an implementation in any specific language/framework.

## 1. Input model — `BirthData`

```
BirthData {
  date:                 CalendarDate            // proleptic Gregorian, validated range TBD by school (see ADR-009)
  local_time:           LocalTime | null         // null = unknown-time chart (degraded feature set, see Chart Calculation notes)
  timezone_id:          IANATimezoneId           // e.g. "Asia/Ho_Chi_Minh" — NOT a raw UTC offset
  latitude:             Degrees (-90..90)
  longitude:            Degrees (-180..180)
  altitude_m:           Meters | null            // optional, for topocentric calculation refinement
  location_label:       string | null            // free-text, display only, never used in calculation
  time_uncertainty_min: Minutes | null            // optional, propagated as a confidence signal, not used in Phase 1 calculation
}
```

Design notes:
- `timezone_id` is mandatory and must be an IANA identifier, never a bare UTC offset — a bare offset cannot express historical DST rules, which is exactly the gap found missing across every audited repo (`../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md` §3.4).
- `local_time: null` is a first-class, explicitly supported state (unknown birth time), not an error — Phase 1 calculation must define its exact degraded behavior (no houses/ASC/MC; Sun/Moon/planet signs only) rather than silently defaulting to noon or crashing. This is a `VALIDATION GAP` if not decided before implementation: **DECISION REQUIRED** — confirm the exact degraded output contract before Phase 3.
- `location_label` is display metadata only; nothing about it may ever be interpolated into a calculation path (audit finding: several repos let free-text fields flow unsanitized into rendered output — see `../ASTROLOGY_REPO_AUDIT/SECURITY_AUDIT.md`).

## 2. Validation error taxonomy

See `ARCHITECTURE_FREEZE.md` §5 for the canonical list (`INVALID_BIRTH_DATE`, `INVALID_COORDINATES`, `AMBIGUOUS_LOCAL_TIME`, etc.). Validation happens strictly before Time Resolution and never after.

## 3. `AstronomicalProvider` interface

The **only** boundary through which any domain code may obtain astronomical facts. No implementation exists yet.

```
interface AstronomicalProvider {
  getPlanetPosition(utc_instant, body: CelestialBody) -> PlanetPosition
  getPlanetSpeed(utc_instant, body: CelestialBody)     -> AngularVelocity
  getHouseCusps(utc_instant, latitude, longitude, house_system: HouseSystemId) -> HouseCusps
  getAscendant(utc_instant, latitude, longitude, house_system: HouseSystemId)  -> Angle
  getMC(utc_instant, latitude, longitude, house_system: HouseSystemId)        -> Angle
  getNode(utc_instant, node_type: "true" | "mean")     -> NodePosition
  getFixedStar(utc_instant, star_name)                  -> PointPosition   // Phase 2+, not Phase 1
  getAyanamsa(utc_instant, ayanamsa_id)                  -> Degrees          // required only when a school requests sidereal zodiac
  getProviderMetadata()                                  -> ProviderMetadata // engine name/version/ephemeris data version
}

CelestialBody = Sun | Moon | Mercury | Venus | Mars | Jupiter | Saturn | Uranus | Neptune | Pluto
                | Chiron | ... (extensible, not exhaustive at Phase 1 — see ROADMAP.md)

ProviderMetadata {
  engine_name:       string     // e.g. "SwissEphemeris" — never assumed by calling code, always read from here
  engine_version:    string
  ephemeris_version: string | null   // e.g. JPL DE version, if applicable; null if provider doesn't use file-based ephemeris
  precision_class:   "file_based" | "analytic_fallback" | "unknown"   // MUST be surfaced — audit found silent Moshier-fallback degradation in Swiss Ephemeris a real production risk (SWISS_EPHEMERIS_AUDIT.md)
}
```

Design notes:
- `precision_class` exists specifically because of a confirmed audit finding: Swiss Ephemeris silently falls back to lower-precision analytic (Moshier) computation when data files are missing/misconfigured, without raising an error (`../ASTROLOGY_REPO_AUDIT/SWISS_EPHEMERIS_AUDIT.md` "Critical finding: silent Moshier fallback"). Any provider implementation **must** surface this, and calling code must be able to react to it (e.g. refuse to serve a "premium precision" chart if `precision_class != "file_based"`).
- No method returns a sign, house-meaning, dignity, or any astrological judgment — this interface is a pure astronomical fact boundary. Confirmed as the correct boundary shape by every audited repo's own internal architecture (`../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`, `WESTERN_AUDIT.md`: even repos with weak overall architecture keep ephemeris calls this narrow).
- Method names are illustrative; naming may change with justification recorded in `ADR/ADR-001-Ephemeris-Strategy.md`.

## 4. Canonical Chart Model

Vendor-independent. No field type here may ever be a type imported from an ephemeris library.

```
Chart {
  metadata:              CalculationMetadata
  birth_data_ref:        BirthDataId
  school:                SchoolId                  // "western" | "vedic" | ... — see ADR-003
  zodiac_type:           "tropical" | "sidereal"
  ayanamsa:               AyanamsaId | null          // required if sidereal
  house_system:          HouseSystemId
  planets:               PlanetPosition[]
  points:                PointPosition[]            // Nodes, Lilith, Part of Fortune, etc.
  houses:                House[]
  house_cusps:           HouseCusp[]
  angles:                Angle[]                    // ASC, MC, DESC, IC
  aspects:               AspectInstance[]
  dignities:             DignityResult[]            // empty at Phase 1 (Phase 3+ content)
  nodes:                 NodePosition[]
}

CalculationMetadata {
  calculation_id:        UUID
  calculated_at:         UTCInstant
  engine:                string                     // ProviderMetadata.engine_name
  engine_version:        string
  ephemeris_version:     string | null
  precision_class:       "file_based" | "analytic_fallback" | "unknown"
  zodiac_config_version: string                     // versioned school config, see ADR-008
  house_system:          HouseSystemId
  ayanamsa:               AyanamsaId | null
  precision_policy_version: string                  // see TEST_ARCHITECTURE.md precision section
}

PlanetPosition {
  body:            CelestialBody
  longitude:       Degrees            // ecliptic longitude, 0-360
  latitude:        Degrees            // ecliptic latitude
  distance_au:     number | null
  speed:           AngularVelocity    // degrees/day; sign determines retrograde
  is_retrograde:   boolean            // derived from speed, never independently guessed
  sign:            ZodiacSign         // derived, not independently stored/authoritative
  sign_degree:     Degrees (0..30)
  house:           HouseNumber | null // null if unknown-time chart
  source:          "astronomical_core"
  precision:       Degrees            // propagated uncertainty, see TEST_ARCHITECTURE.md
}

House { number: 1..12, sign: ZodiacSign, ruler: CelestialBody }
HouseCusp { house_number: 1..12, longitude: Degrees, house_system: HouseSystemId }
Angle { type: "ASC" | "MC" | "DESC" | "IC", longitude: Degrees }
NodePosition { node_type: "north" | "south", variant: "true" | "mean", longitude: Degrees }
PointPosition { name: string, longitude: Degrees, source: "computed" | "ephemeris" }
AspectInstance { planet_a: CelestialBody, planet_b: CelestialBody, type: AspectType, exact_angle: Degrees, actual_angle: Degrees, orb: Degrees, within_orb: boolean }
DignityResult { planet: CelestialBody, sign: ZodiacSign, type: "domicile"|"exaltation"|"detriment"|"fall"|"triplicity"|"term"|"decan", score: number }
```

Every numeric value in this model carries, at minimum, a `unit` (implicit in the field name/type here, explicit in the serialized schema), a `source` (which layer produced it), and is reachable back to `CalculationMetadata` via the parent `Chart` — this satisfies the traceability requirement in `ARCHITECTURE_FREEZE.md` §4.8 at the calculation-object level (rule/interpretation-level traceability is specified separately in `EVIDENCE_ENGINE_SPEC.md`).

## 5. School configuration — `AstrologySchool`

```
AstrologySchool {
  id:                   SchoolId    // "western" | "vedic" | "hellenistic" | "traditional" | "kp"
  zodiac_type:          "tropical" | "sidereal"
  default_house_system: HouseSystemId
  default_ayanamsa:      AyanamsaId | null
  aspect_rules:         AspectRuleSet
  dignity_rules:        DignityRuleSet | null      // Phase 3+
  timing_rules:         TimingRuleSet | null       // Phase 4+ (dasha/profections/etc.)
  interpretation_rules: RuleSetId                  // versioned reference into RULE_ENGINE_SPEC.md's rule store
}
```

**No school's configuration object may reference another school's configuration, rule set, or calculation code.** This is enforced at the module-boundary level (see `ADR/ADR-003-Astrology-School-Isolation.md`), not merely by convention — confirmed necessary because the two audited repos that mix Western and Vedic in one codebase (`openastrology-library`, `mayaastrolib`) already keep their *calculators* separate but do not extend that discipline to a formal `AstrologySchool` configuration object; this architecture formalizes what they do informally.

## 6. Western school content scope (Phase 3)

Per `../ASTROLOGY_REPO_AUDIT/WESTERN_AUDIT.md`, split into `western.core` (Phase 3, this freeze) and `western.traditional` (Phase 3.1+, deferred):

| Sub-module | Content | Phase |
|---|---|---|
| `western.core` | Tropical zodiac; Sun→Pluto; North/South Node; ASC/MC/DESC/IC; house system (default **decided Phase 3B-1: Placidus** — this was genuinely undecided here and in `ADR/ADR-001`, approved explicitly before Phase 3B-1 implementation, see `PHASE3B1_HOUSES_ANGLES.md`); 5 major aspects w/ configurable orbs; retrograde flag | 3 |
| `western.traditional` | Essential/accidental dignity, sect, triplicity, terms, decans, profections, zodiacal releasing, firdaria, primary directions, arabic parts | 3.1+ (deferred — `stellium` is the reference architecture per `WESTERN_AUDIT.md`, not vendored) |
| `western.chart_ruler` | Chart ruler derivation (Ascendant sign ruler) | 3.1 |
| Elements/Modalities | Derived display attributes off `ZodiacSign`, no new calculation | 3 |

## 7. Vedic school content scope (Phase 4+, module breakdown with validation-oracle strength)

Per `../ASTROLOGY_REPO_AUDIT/VEDIC_AUDIT.md`. Priority ordering below follows oracle strength (repos with strong, cross-validated reference numbers go first, since correctness can actually be checked):

| Module | V-tag | Validation oracle available? |
|---|---|---|
| Rashi/D1, Nakshatra+Pada | V1 | Strong — PyJHora, vedic-calc, mayaastrolib, openastrology-library all agree (`BENCHMARK.md`) |
| Vimshottari Dasha | V1 | Strong — PyJHora + vedic-calc cross-validated against 2 commercial APIs (`VEDIC_AUDIT.md`) |
| Divisional charts D2–D60 (standard set) | V1.1 | Strong — PyJHora (24 vargas) + vedic-calc (15, with disclosed D60 simplification caveat) |
| KP sub-lord/sub-sub-lord/cuspal sub-lord/significators | V1.1 | Strong — vedic-calc's KP engine is the most complete *independently verified* implementation found |
| Shadbala, Ashtakavarga | V2 | Strong — PyJHora, vedic-calc, mayaastrolib all implement with textbook/golden-value tests |
| Yoga detection | V2 | Moderate — every oracle uses hardcoded conditionals (no repo has a declarative yoga rule table); this architecture's `RULE_ENGINE_SPEC.md` is the improvement opportunity |
| Jaimini (Chara Karaka, Arudha) | V2 | Moderate — Upapada Lagna and Karakamsha are **NOT PRESENT** in any oracle except unverified claims in jyotish-flutter-library-fork (AGPL-tainted text, do not use) |
| Dosha detection | V2 | Moderate — PyJHora/vedic-calc agree on Manglik/Kala-Sarpa/Pitru/Guru-Chandala; some disagreement found in vedic-calc's own disclosed 99% benchmark |
| Kalachakra Dasha, rare rasi/graha dashas (20+ in PyJHora) | Future | Weak — only PyJHora implements most of these; single-oracle validation only, flag as `VALIDATION GAP` if built |
| Other ayanamsas beyond Lahiri/Raman/KP | Future | `VALIDATION GAP` for anything beyond the 3–4 ayanamsas the strong oracles agree on |

## 8. Precision and unit conventions (cross-reference)

Full precision policy lives in `TEST_ARCHITECTURE.md` §Precision. Every numeric field in this domain model is stored at **internal precision** (double-precision float, degrees, no early rounding) — display formatting (DMS, rounded degrees) is a presentation-layer concern applied only at the API boundary, never inside `Chart`/`PlanetPosition`/etc. This directly avoids the anti-pattern implicitly present in several audited repos where formatting and calculation are not cleanly separated (e.g. `astro-natal-chart`'s renderer does formatting and calculation in adjacent, tightly coupled code — `../ASTROLOGY_REPO_AUDIT/raw/astro-natal-chart.md`).
