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
  interpretations: DomainInterpretationVM[];
}
