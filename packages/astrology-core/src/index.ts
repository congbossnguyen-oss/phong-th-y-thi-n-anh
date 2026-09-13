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
  SwissEphemerisPhase3AScopeError,
  SwissEphemerisUnsupportedHouseSystemError,
  SwissEphemerisHouseSystemUndefinedAtLatitudeError,
  SwissEphemerisHouseCalculationError,
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
} from "./precision.js";

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
} from "./chart/types.js";
export { ZODIAC_SIGNS, NORMALIZED_CHART_SCHEMA_VERSION } from "./chart/types.js";

export type { CreateNormalizedChartInput } from "./chart/createNormalizedChart.js";
export { createNormalizedChart } from "./chart/createNormalizedChart.js";

export type { NormalizedChartErrorCode, NormalizedChartError } from "./chart/validation.js";
export { validateNormalizedChart } from "./chart/validation.js";

export { serializeNormalizedChart, deserializeNormalizedChart, NormalizedChartVersionMismatchError } from "./chart/serialization.js";

export { computeBirthDataFingerprint } from "./chart/birthDataFingerprint.js";
