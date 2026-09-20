/**
 * @thien-anh/astrology-core — Astrology Module.
 *
 * Phase 1 (Core Foundation): BirthData + validation, Timezone/DST Engine, AstronomicalProvider
 * interface, Precision Policy.
 * Phase 2 (Normalized Chart): NormalizedChart data contract + validation + serialization —
 * KHÔNG chứa rule Tây/Vệ Đà, KHÔNG có Factor/Rule/Interpretation Engine, KHÔNG gọi AI, KHÔNG
 * có implementation Swiss Ephemeris, KHÔNG tính toán Western/Vedic chart nào.
 *
 * Xem docs/astrology-module/ARCHITECTURE/ (đã freeze) cho toàn bộ quyết định kiến trúc.
 */

export type { CalendarDate, LocalTime, BirthData } from "./types.js";

export type { AstrologyCoreErrorCode, AstrologyCoreError } from "./errors.js";
export { AstrologyCoreValidationError } from "./errors.js";

export { validateBirthData } from "./validation/birthData.js";

export type { ResolvedInstant, LocalTimeResolution } from "./timezone/resolveLocalTime.js";
export { resolveLocalTimeToUtc } from "./timezone/resolveLocalTime.js";

export type { BirthDataInstantResolution } from "./timezone/resolveBirthDataInstant.js";
export { resolveBirthDataInstant } from "./timezone/resolveBirthDataInstant.js";

export type {
  AstronomicalProvider,
  CelestialBody,
  KnownCelestialBody,
  NodeType,
  HouseSystemId,
  AyanamsaId,
  PrecisionClass,
  ProviderMetadata,
  PlanetPosition,
  NodePosition,
  HouseCusps,
  AngleResult,
} from "./astronomical/AstronomicalProvider.js";

export {
  UnimplementedAstronomicalProvider,
  AstronomicalProviderNotConfiguredError,
} from "./astronomical/UnimplementedAstronomicalProvider.js";

// ---------------------------------------------------------------------------------------
// Phase 3A — Swiss Ephemeris Provider (astronomical core)
// ---------------------------------------------------------------------------------------

export type { SwissEphemerisProviderOptions } from "./astronomical/providers/SwissEphemerisProvider.js";
export { SwissEphemerisProvider } from "./astronomical/providers/SwissEphemerisProvider.js";
export { resolveDefaultEphemerisPath } from "./astronomical/providers/ephemerisPath.js";
export {
  SwissEphemerisUnsupportedBodyError,
  SwissEphemerisCalculationError,
  SwissEphemerisPrecisionDegradedError,
  SwissEphemerisUnsupportedHouseSystemError,
  SwissEphemerisHouseSystemUndefinedAtLatitudeError,
  SwissEphemerisHouseCalculationError,
  SwissEphemerisUnsupportedAyanamsaError,
} from "./astronomical/providers/errors.js";

// ---------------------------------------------------------------------------------------
// Phase 3B-1 — Western Houses + Angles (Chart Calculation layer)
// ---------------------------------------------------------------------------------------

export type { CalculateWesternHousesAndAnglesInput, WesternHousesAndAnglesResult } from "./western/houses.js";
export { WESTERN_DEFAULT_HOUSE_SYSTEM, calculateWesternHousesAndAngles } from "./western/houses.js";

export {
  ANGULAR_TOLERANCE_FILE_BASED_DEGREES,
  ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES,
  roundForDisplay,
  isWithinTolerance,
  angularPrecisionForClass,
  toDegreesMinutesSeconds,
  type DegreesMinutesSeconds,
  normalizeDegrees,
  signOfLongitude,
  signDegreeOfLongitude,
} from "./precision.js";

// ---------------------------------------------------------------------------------------
// Phase 3B-2 — Western Chart Mapping (sign + house assignment)
// ---------------------------------------------------------------------------------------

export { assignHouseNumber } from "./western/housePlacement.js";
export type { MapWesternPlanetPositionsInput, MapWesternPlanetPositionsResult } from "./western/planets.js";
export { WESTERN_CORE_BODIES, mapWesternPlanetPositions } from "./western/planets.js";
export type { BuildWesternChartInput, BuildWesternChartResult } from "./western/chart.js";
export { WESTERN_CORE_ZODIAC_CONFIG_VERSION, WESTERN_CORE_PRECISION_POLICY_VERSION, buildWesternChart } from "./western/chart.js";

// ---------------------------------------------------------------------------------------
// Phase 3C — Western Aspects
// ---------------------------------------------------------------------------------------

export type { AspectDefinition, AspectOrbPolicy, AspectCandidatePoint } from "./western/aspects.js";
export { angularSeparation, computeWesternAspects, WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY } from "./western/aspects.js";

// ---------------------------------------------------------------------------------------
// Phase 2 — Normalized Chart
// ---------------------------------------------------------------------------------------

export type {
  SchoolId,
  ZodiacSign,
  ZodiacType,
  HouseNumber,
  AspectType,
  DignitySchemeId,
  DignityTypeId,
  AngleType,
  CalculationMetadata,
  NormalizedPlanetPosition,
  NormalizedHouse,
  NormalizedHouseCusp,
  NormalizedAngle,
  NormalizedNodePosition,
  NormalizedPointPosition,
  NormalizedAspectInstance,
  NormalizedDignityResult,
  NormalizedChart,
  NakshatraName,
  NakshatraPada,
  NormalizedNakshatraPosition,
} from "./chart/types.js";
export { ZODIAC_SIGNS, NORMALIZED_CHART_SCHEMA_VERSION, NAKSHATRA_NAMES } from "./chart/types.js";

export type { CreateNormalizedChartInput } from "./chart/createNormalizedChart.js";
export { createNormalizedChart } from "./chart/createNormalizedChart.js";

export type { NormalizedChartErrorCode, NormalizedChartError } from "./chart/validation.js";
export { validateNormalizedChart } from "./chart/validation.js";

export { serializeNormalizedChart, deserializeNormalizedChart, NormalizedChartVersionMismatchError } from "./chart/serialization.js";

export { computeBirthDataFingerprint } from "./chart/birthDataFingerprint.js";

// ---------------------------------------------------------------------------------------
// Phase 4 Step 3 — Vedic Rashi (D1) Calculation
// ---------------------------------------------------------------------------------------

export type { CalculateRashiInput, RashiResult, CalculateRashiResult } from "./vedic/rashi.js";
export { VEDIC_DEFAULT_AYANAMSA, getSiderealLongitude, calculateRashi } from "./vedic/rashi.js";

// ---------------------------------------------------------------------------------------
// Phase 4 Step 4 — Vedic Nakshatra + Pada
// ---------------------------------------------------------------------------------------

export type { VimshottariLord } from "./vedic/nakshatra.js";
export {
  NAKSHATRA_SPAN_DEGREES,
  NAKSHATRA_PADA_SPAN_DEGREES,
  getNakshatraIndex,
  getNakshatraDegree,
  getNakshatraPada,
  getNakshatraLord,
  calculateNakshatraPosition,
} from "./vedic/nakshatra.js";

// ---------------------------------------------------------------------------------------
// Phase 4 Step 6 — Vimshottari Mahadasha
// ---------------------------------------------------------------------------------------

export type {
  VimshottariMahadashaPeriod,
  VimshottariMahadashaSequence,
  CalculateVimshottariDashaInput,
  CalculateVimshottariDashaResult,
  VimshottariDashaErrorCode,
  VimshottariDashaError,
} from "./vedic/dasha/vimshottari.js";
export {
  VIMSHOTTARI_DASHA_SCHEMA_VERSION,
  VIMSHOTTARI_YEAR_CONVENTION_ID,
  VIMSHOTTARI_DAYS_PER_YEAR,
  VIMSHOTTARI_LORD_YEARS,
  VIMSHOTTARI_LORD_SEQUENCE,
  calculateVimshottariDasha,
  validateVimshottariMahadashaSequence,
  serializeVimshottariMahadashaSequence,
  deserializeVimshottariMahadashaSequence,
  VimshottariDashaVersionMismatchError,
} from "./vedic/dasha/vimshottari.js";

// ---------------------------------------------------------------------------------------
// Phase 4 — Integration/E2E: Vedic V1 Core Pipeline (Rashi + Nakshatra + Dasha)
// ---------------------------------------------------------------------------------------

export type { VedicRashiPosition, CalculateVedicCoreInput, VedicCoreResult, CalculateVedicCoreResult } from "./vedic/chart.js";
export { calculateVedicCore } from "./vedic/chart.js";

// ---------------------------------------------------------------------------------------
// Phase 5 — Vedic Ascendant (Lagna) + Whole Sign Houses
// ---------------------------------------------------------------------------------------

export type { CalculateVedicAscendantInput, VedicAscendantResult, CalculateVedicAscendantResult } from "./vedic/ascendant.js";
export { calculateVedicAscendant } from "./vedic/ascendant.js";

export { getWholeSignHouseNumber } from "./vedic/houses.js";

// ---------------------------------------------------------------------------------------
// V1.1 Batch 1 — Vedic Divisional Charts (Varga): D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa)
// ---------------------------------------------------------------------------------------

export type { VargaId } from "./vedic/divisional.js";
export { countSignsForward, getD2HoraSign, getD3DrekkanaSign, getD4ChaturthamsaSign, getDivisionalSign } from "./vedic/divisional.js";

// ---------------------------------------------------------------------------------------
// Phase 5 — Factor Engine (Layer 7). Shared contract types + Western engine only.
// Vedic FactorEngine deferred; Rule/Scoring layers (Phase 6+) not implemented.
// ---------------------------------------------------------------------------------------

export type { Factor, FactorId, FactorCategory, FactorInput, FactorInputType, FactorSchoolConfig, FactorEngine } from "./factor/types.js";
export { WESTERN_FACTORS_VERSION, extractWesternFactors, westernFactorEngine } from "./western/factors.js";

// ---------------------------------------------------------------------------------------
// Phase 6 — Rule Engine (Layer 8). Generic evaluator + RuleSet contract + schema validation.
// Model A (one generic engine, school-specific RuleSet data). Batches 0–2 only: no rule content,
// no Evidence/Scoring/Interpretation, no Vedic RuleSet.
// ---------------------------------------------------------------------------------------

export type {
  RuleId,
  ConditionComparator,
  ConditionExpr,
  RuleSourceType,
  SourceRef,
  RuleWeighting,
  Rule,
  RuleSet,
  RuleEvaluation,
  RuleEngine,
} from "./rule/types.js";
export { evaluateRules, ruleEngine } from "./rule/engine.js";
export type { RuleSetErrorCode, RuleSetError } from "./rule/validate.js";
export { validateRuleSet, loadRuleSet } from "./rule/validate.js";

// Phase 6 Batch 3 — Western geometric RuleSet V1 content (3 luminary rules, geometric_rule).
export { WESTERN_RULES_VERSION, WESTERN_RULES_V1 } from "./western/rules.js";

// ---------------------------------------------------------------------------------------
// Phase 7 — Scoring Engine (Layer 10). Generic deterministic weighted-sum only.
// No scoring content: domain vocabulary deferred; Western RuleSet v1 carries no weighting → [].
// ---------------------------------------------------------------------------------------

export type { DomainScore, ScoringContext, ScoringEngine } from "./scoring/types.js";
export { SCORING_ENGINE_VERSION } from "./scoring/types.js";
export { scoreDomains, scoringEngine } from "./scoring/engine.js";

// ---------------------------------------------------------------------------------------
// Phase 7B — Evidence Engine. Provenance plumbing thuần xác định (no calc/interp/scoring/LLM).
// In-memory, no persistence. record → trace → traceToBirthData.
// ---------------------------------------------------------------------------------------

export type { Evidence, TraceChain } from "./evidence/types.js";
export { EvidenceTraceIntegrityError } from "./evidence/types.js";
export type { TraceResolutionContext } from "./evidence/engine.js";
export {
  EVIDENCE_ENGINE_VERSION,
  makeEvidenceId,
  recordEvidence,
  traceByInterpretation,
  traceToBirthData,
} from "./evidence/engine.js";
