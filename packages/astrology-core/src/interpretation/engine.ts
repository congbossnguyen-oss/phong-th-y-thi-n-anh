/**
 * Interpretation Engine (Layer 11) — Phase 8, CONTRACT FROZEN. HÀM THUẦN, deterministic.
 * `interpret(chart, factors, ruleEvaluations, evidence, ruleset)` — consumer/assembly layer:
 * KHÔNG tính lại chart/factors, KHÔNG chạy lại Rule Engine, KHÔNG tạo Evidence, KHÔNG gọi Scoring.
 *
 * D-EMIT (mỗi canonical domain, theo thứ tự CANONICAL_DOMAINS — deterministic):
 *   A) 0 bound rule (Rule.domain === domain)            → KHÔNG emit (không đánh giá).
 *   B) ≥1 bound rule, không rule nào fired+evidenced    → emit domain_not_indicated.
 *   C) ≥1 bound rule fired + có Evidence                → emit domain_activated.
 * D-EVIDENCE-SCOPE: activated ⇒ evidence.length > 0 (bắt buộc); not_indicated ⇒ có thể rỗng.
 * D-ID-CONSTRUCT: interpretationId = `${calculationId}:${domain}`.
 */

import type { NormalizedChart } from "../chart/types.js";
import { CANONICAL_DOMAINS, isCanonicalDomain, type CanonicalDomain } from "../domain/types.js";
import type { Evidence } from "../evidence/types.js";
import type { Factor } from "../factor/types.js";
import type { Rule, RuleEvaluation, RuleSet } from "../rule/types.js";
import type { ConclusionKey, InterpretationObject } from "./types.js";
import { INTERPRETATION_ENGINE_VERSION, InterpretationValidationError } from "./types.js";

/** So sánh lexicographic ổn định (KHÔNG localeCompare — deterministic). */
function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** D-ID-CONSTRUCT: xây interpretationId xác định từ (calculationId, domain). */
export function makeInterpretationId(calculationId: string, domain: CanonicalDomain): string {
  return `${calculationId}:${domain}`;
}

/**
 * Boundary construction/validation: dựng một InterpretationObject rồi kiểm bất biến; vi phạm ⇒ ném.
 * KHÔNG "sửa im lặng" — reject invalid construction.
 */
export function buildInterpretation(input: {
  calculationId: string;
  domain: CanonicalDomain;
  key: ConclusionKey;
  supportingFactors: string[];
  rules: string[];
  evidence: string[];
}): InterpretationObject {
  const obj: InterpretationObject = {
    interpretationId: makeInterpretationId(input.calculationId, input.domain),
    domain: input.domain,
    conclusion: { key: input.key, params: {} },
    supportingFactors: input.supportingFactors,
    rules: input.rules,
    evidence: input.evidence,
    caveats: [],
    version: INTERPRETATION_ENGINE_VERSION,
  };
  validateInterpretation(obj);
  return obj;
}

/** Kiểm bất biến contract. Ném InterpretationValidationError nếu sai (D-EVIDENCE-SCOPE, D-ID, version, domain, key). */
export function validateInterpretation(obj: InterpretationObject): void {
  if (obj.version !== INTERPRETATION_ENGINE_VERSION) {
    throw new InterpretationValidationError(`version phải là "${INTERPRETATION_ENGINE_VERSION}": ${obj.version}`);
  }
  if (!isCanonicalDomain(obj.domain)) {
    throw new InterpretationValidationError(`domain không hợp lệ (không thuộc 15 canonical): ${String(obj.domain)}`);
  }
  if (obj.conclusion.key !== "domain_activated" && obj.conclusion.key !== "domain_not_indicated") {
    throw new InterpretationValidationError(`conclusion.key không hợp lệ: ${String(obj.conclusion.key)}`);
  }
  // D-ID-CONSTRUCT: phải có dạng `<calculationId không rỗng>:<domain>`.
  const suffix = `:${obj.domain}`;
  if (!obj.interpretationId.endsWith(suffix) || obj.interpretationId.length <= suffix.length) {
    throw new InterpretationValidationError(
      `interpretationId phải là "\${calculationId}:\${domain}": ${obj.interpretationId}`,
    );
  }
  // D-EVIDENCE-SCOPE: activated bắt buộc evidence; not_indicated có thể rỗng.
  if (obj.conclusion.key === "domain_activated" && obj.evidence.length === 0) {
    throw new InterpretationValidationError(`domain_activated bắt buộc evidence.length > 0 (domain ${obj.domain})`);
  }
}

export function interpret(
  chart: NormalizedChart,
  factors: readonly Factor[],
  ruleEvaluations: readonly RuleEvaluation[],
  evidence: readonly Evidence[],
  ruleset: RuleSet,
): InterpretationObject[] {
  const calculationId = chart.metadata.calculationId;

  // ruleId → RuleEvaluation.
  const evalByRuleId = new Map<string, RuleEvaluation>();
  for (const e of ruleEvaluations) evalByRuleId.set(e.ruleId, e);

  // Evidence CỦA CHART NÀY, gom theo ruleId (bỏ evidence chart khác — provenance).
  const evidenceByRuleId = new Map<string, Evidence[]>();
  for (const ev of evidence) {
    if (ev.calculationId !== calculationId) continue;
    const arr = evidenceByRuleId.get(ev.ruleId);
    if (arr === undefined) evidenceByRuleId.set(ev.ruleId, [ev]);
    else arr.push(ev);
  }

  // Bound rules gom theo domain (chỉ rule có Rule.domain — D-BIND).
  const rulesByDomain = new Map<CanonicalDomain, Rule[]>();
  for (const rule of ruleset.rules) {
    if (rule.domain === undefined) continue;
    const arr = rulesByDomain.get(rule.domain);
    if (arr === undefined) rulesByDomain.set(rule.domain, [rule]);
    else arr.push(rule);
  }

  const out: InterpretationObject[] = [];
  for (const domain of CANONICAL_DOMAINS) {
    const boundRules = rulesByDomain.get(domain);
    if (boundRules === undefined || boundRules.length === 0) continue; // Case A.

    const activated = boundRules.filter((r) => {
      const ev = evalByRuleId.get(r.id);
      return ev !== undefined && ev.fired && (evidenceByRuleId.get(r.id)?.length ?? 0) > 0;
    });

    if (activated.length > 0) {
      const evs = activated.flatMap((r) => evidenceByRuleId.get(r.id) ?? []);
      out.push(
        buildInterpretation({
          calculationId,
          domain,
          key: "domain_activated",
          rules: activated.map((r) => r.id).sort(cmp),
          evidence: evs.map((e) => e.evidenceId).sort(cmp),
          supportingFactors: [...new Set(evs.flatMap((e) => e.factorIds))].sort(cmp),
        }),
      );
    } else {
      out.push(
        buildInterpretation({
          calculationId,
          domain,
          key: "domain_not_indicated",
          rules: boundRules.map((r) => r.id).sort(cmp),
          evidence: [],
          supportingFactors: [],
        }),
      );
    }
  }

  // `factors` là artifact tiêu thụ theo chữ ký đầu vào đã freeze (D-INTERPRET-INPUT); v1 lấy provenance
  // từ Evidence.factorIds nên không đọc trực tiếp mảng này.
  void factors;
  return out;
}
