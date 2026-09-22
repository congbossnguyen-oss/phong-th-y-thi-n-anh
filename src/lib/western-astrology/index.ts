/**
 * Western Astrology MVP orchestrator — server-side only. Calls astrology-core's own APIs in
 * sequence (no astrology value is recomputed at the app layer) and maps the result to a typed
 * ViewModel. astrology-core's Phase 3–9 engines are consumed as-is, never modified.
 *
 * Calculation → NormalizedChart → Factor[] → RuleEvaluation[] → Evidence[] → Interpretation[]
 *   → NarrativeEngine (deterministic grounding check) → AnthropicNarrativeProvider → VI narrative
 */
import {
  type BirthData,
  type NormalizedChart,
  type Factor,
  validateBirthData,
  resolveBirthDataInstant,
  SwissEphemerisProvider,
  buildWesternChart,
  extractWesternFactors,
  evaluateRules,
  recordEvidence,
  interpret,
  createNarrativeEngine,
  isCanonicalDomain,
  type NarrativeStyle,
} from "@thien-anh/astrology-core";
import { MVP_DEMO_RULESET } from "./ruleset";
import { DOMAIN_LABEL_VI } from "./domain-labels";
import { getWesternAstrologyNarrativeProvider, type WesternAstrologyNarrativeProvider } from "./anthropic-narrative-provider";
import type { WesternAstrologyMvpInput, WesternAstrologyMvpViewModel, DomainInterpretationVM, ChartDataVM } from "./view-model";

const NARRATIVE_STYLE: NarrativeStyle = { tone: "neutral", targetLanguage: "vi", maxLength: null };
const NARRATIVE_UNAVAILABLE_TEXT_VI = "Không thể tạo narrative cho lĩnh vực này lúc này (lỗi kết nối AI).";

function empty(status: WesternAstrologyMvpViewModel["status"], errors: string[], kind: "anthropic" | "mock"): WesternAstrologyMvpViewModel {
  return { status, errors, narrativeProviderKind: kind, interpretations: [] };
}

/**
 * Debug-tool projection: exposes exactly the NormalizedChart/Factor[] fields astrology-core already
 * computed — 1:1 copy, no derivation, no new astrology. Factors sorted by id for readability only
 * (display-order convenience, not a data change).
 */
function toChartDataVM(chart: NormalizedChart, factors: readonly Factor[]): ChartDataVM {
  return {
    planets: chart.planets.map((p) => ({
      body: p.body,
      longitude: p.longitude,
      latitude: p.latitude,
      distanceAu: p.distanceAu,
      speedDegreesPerDay: p.speedDegreesPerDay,
      isRetrograde: p.isRetrograde,
      sign: p.sign,
      signDegree: p.signDegree,
      house: p.house,
      precision: p.precision,
    })),
    angles: chart.angles.map((a) => ({ type: a.type, longitude: a.longitude })),
    houseCusps: chart.houseCusps.map((c) => ({ houseNumber: c.houseNumber, longitude: c.longitude, houseSystem: c.houseSystem })),
    aspects: chart.aspects.map((a) => ({
      planetA: a.planetA,
      planetB: a.planetB,
      type: a.type,
      exactAngle: a.exactAngle,
      actualAngle: a.actualAngle,
      orb: a.orb,
      withinOrb: a.withinOrb,
    })),
    factors: [...factors]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((f) => ({ id: f.id, category: f.category, strength: f.strength, inputs: f.inputs, version: f.version })),
  };
}

export async function runWesternAstrologyMvp(
  input: WesternAstrologyMvpInput,
  // Optional injection seam for tests ONLY. Default = env-selected provider (mock unless a server-side
  // ANTHROPIC_API_KEY is present). The SSR page never passes this, so production behavior is unchanged.
  deps?: { narrativeProvider?: WesternAstrologyNarrativeProvider },
): Promise<WesternAstrologyMvpViewModel> {
  const { provider: narrativeProvider, kind: providerKind } =
    deps?.narrativeProvider ?? getWesternAstrologyNarrativeProvider();

  const birthData: BirthData = {
    date: input.date,
    localTime: input.time,
    timezoneId: input.timezoneId,
    latitude: input.latitude,
    longitude: input.longitude,
    ...(input.locationLabel !== undefined ? { locationLabel: input.locationLabel } : {}),
  };

  const validationErrors = validateBirthData(birthData);
  if (validationErrors.length > 0) {
    return empty("missing_input", validationErrors.map((e) => e.message), providerKind);
  }

  const instant = resolveBirthDataInstant(birthData);
  if (!instant.ok) {
    return empty("calculation_error", instant.errors.map((e) => e.message), providerKind);
  }

  const provider = new SwissEphemerisProvider();
  const chartResult = buildWesternChart({
    provider,
    birthDataRef: "western-astrology-mvp", // no persistence layer in this MVP; not used in calculation
    utcInstant: instant.utc,
    latitude: input.latitude,
    longitude: input.longitude,
    hasKnownLocalTime: input.time !== null,
  });
  if (!chartResult.ok) {
    return empty("calculation_error", chartResult.errors.map((e) => e.message), providerKind);
  }
  const chart = chartResult.chart;

  const factors = extractWesternFactors(chart, { school: "western" });
  const ruleEvaluations = evaluateRules(factors, MVP_DEMO_RULESET);
  const evidence = ruleEvaluations
    .filter((e) => e.fired)
    .map((e) => recordEvidence(e, MVP_DEMO_RULESET, chart.metadata.calculationId));
  const interpretations = interpret(chart, factors, ruleEvaluations, evidence, MVP_DEMO_RULESET);

  const chartMeta = {
    calculationId: chart.metadata.calculationId,
    engine: chart.metadata.engine,
    engineVersion: chart.metadata.engineVersion,
    precisionClass: chart.metadata.precisionClass,
  };
  const chartData = toChartDataVM(chart, factors);

  if (interpretations.length === 0) {
    return { status: "empty_interpretation", errors: [], narrativeProviderKind: providerKind, chart: chartMeta, chartData, interpretations: [] };
  }

  const engine = createNarrativeEngine(narrativeProvider);
  const domainVMs: DomainInterpretationVM[] = [];
  for (const it of interpretations) {
    const domainLabel = isCanonicalDomain(it.domain) ? DOMAIN_LABEL_VI[it.domain] : it.domain;
    try {
      const report = await engine.generate([it], NARRATIVE_STYLE);
      domainVMs.push({
        domain: it.domain,
        domainLabel,
        conclusionKey: it.conclusion.key,
        narrativeText: report.narrativeText,
        groundingCheckPassed: report.groundingCheckPassed,
        ruleIds: it.rules,
        evidenceIds: it.evidence,
        supportingFactorIds: it.supportingFactors,
        modelProvider: report.modelProvider,
        modelVersion: report.modelVersion,
      });
    } catch {
      // A single narrative provider failure (e.g. real Anthropic call) must not crash the page —
      // degrade this one card gracefully, keep the rest of the interpretation data visible.
      domainVMs.push({
        domain: it.domain,
        domainLabel,
        conclusionKey: it.conclusion.key,
        narrativeText: NARRATIVE_UNAVAILABLE_TEXT_VI,
        groundingCheckPassed: false,
        ruleIds: it.rules,
        evidenceIds: it.evidence,
        supportingFactorIds: it.supportingFactors,
        modelProvider: narrativeProvider.modelProvider,
        modelVersion: narrativeProvider.modelVersion,
      });
    }
  }

  return { status: "success", errors: [], narrativeProviderKind: providerKind, chart: chartMeta, chartData, interpretations: domainVMs };
}
