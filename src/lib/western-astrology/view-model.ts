/**
 * Typed UI ViewModel — the ONLY shape the page/components see. Raw astrology-core objects
 * (`NormalizedChart`, `Factor[]`, `RuleEvaluation[]`, `Evidence[]`, `InterpretationObject[]`) never
 * reach the template directly.
 */

export interface WesternAstrologyMvpInput {
  date: { year: number; month: number; day: number };
  /** `null` = unknown birth time (a valid, first-class state — not an error). */
  time: { hour: number; minute: number } | null;
  timezoneId: string;
  latitude: number;
  longitude: number;
  locationLabel?: string;
}

export interface DomainInterpretationVM {
  domain: string;
  domainLabel: string;
  conclusionKey: "domain_activated" | "domain_not_indicated";
  narrativeText: string;
  /** false = the deterministic post-generation grounding check rejected this text (blocked/refused). */
  groundingCheckPassed: boolean;
  ruleIds: string[];
  evidenceIds: string[];
  supportingFactorIds: string[];
  modelProvider: string;
  modelVersion: string;
}

export interface ChartMetaVM {
  calculationId: string;
  engine: string;
  engineVersion: string;
  precisionClass: string;
}

/**
 * Debug/internal-tool view of the raw NormalizedChart + Factor[] data the engine already computed —
 * NOT recomputed here, just a 1:1 field copy for direct inspection. Only fields that actually exist
 * on the astrology-core objects are included (see packages/astrology-core/src/chart/types.ts,
 * factor/types.ts) — none invented.
 */
export interface PlanetDataVM {
  body: string;
  longitude: number;
  latitude: number;
  distanceAu: number | null;
  speedDegreesPerDay: number;
  isRetrograde: boolean;
  sign: string;
  signDegree: number;
  house: number | null;
  precision: number;
}

export interface AngleDataVM {
  type: string;
  longitude: number;
}

export interface HouseCuspDataVM {
  houseNumber: number;
  longitude: number;
  houseSystem: string;
}

export interface AspectDataVM {
  planetA: string;
  planetB: string;
  type: string;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  withinOrb: boolean;
}

export interface FactorDataVM {
  id: string;
  category: string;
  strength: number;
  inputs: { type: string; ref: string }[];
  version: string;
}

export interface ChartDataVM {
  planets: PlanetDataVM[];
  angles: AngleDataVM[];
  houseCusps: HouseCuspDataVM[];
  aspects: AspectDataVM[];
  factors: FactorDataVM[];
}

export type WesternAstrologyMvpStatus =
  | "missing_input"
  | "calculation_error"
  | "empty_interpretation"
  | "success";

export interface WesternAstrologyMvpViewModel {
  status: WesternAstrologyMvpStatus;
  narrativeProviderKind: "anthropic" | "mock";
  errors: string[];
  chart?: ChartMetaVM;
  /** Present whenever chart calculation succeeded (both "empty_interpretation" and "success"). */
  chartData?: ChartDataVM;
  interpretations: DomainInterpretationVM[];
}
