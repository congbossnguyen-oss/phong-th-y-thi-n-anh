/**
 * @thien-anh/astrology-core — Astrology Module, Phase 1 (Core Foundation).
 *
 * CHỈ chứa: BirthData + validation, Timezone/DST Engine, AstronomicalProvider interface,
 * Precision Policy. KHÔNG chứa rule Tây/Vệ Đà, KHÔNG có Factor/Rule/Interpretation Engine,
 * KHÔNG gọi AI, KHÔNG có implementation Swiss Ephemeris.
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

export {
  ANGULAR_TOLERANCE_FILE_BASED_DEGREES,
  ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES,
  roundForDisplay,
  isWithinTolerance,
} from "./precision.js";
