/**
 * Evidence Engine (Phase 7B) — provenance plumbing thuần xác định. Contract FROZEN H2-A..H2-G.
 * Import CHỈ contract types (rule/factor/chart/evidence) — KHÔNG astronomy/interpretation/scoring.
 *
 * 3 thao tác:
 *  - recordEvidence: từ một RuleEvaluation ĐÃ fired dựng một Evidence (H2-C, H2-E).
 *  - traceByInterpretation: lọc Evidence theo interpretationId, thứ tự deterministic (spec `trace`).
 *  - traceToBirthData: đi ngược Evidence → Rule → Factor → Chart → BirthData; đứt xích ⇒ ném
 *    EvidenceTraceIntegrityError (H2-D). KHÔNG fabricate, KHÔNG fallback.
 *
 * KHÔNG persistence (H2-G): trace nhận thẳng mảng Evidence[] + context resolve do caller giữ.
 */

import type { NormalizedChart } from "../chart/types.js";
import type { Factor } from "../factor/types.js";
import type { RuleEvaluation, RuleSet } from "../rule/types.js";
import type { Evidence, TraceChain } from "./types.js";
import { EvidenceTraceIntegrityError } from "./types.js";

/** Phiên bản Evidence Engine (ADR-008) — định danh tối thiểu, deterministic. */
export const EVIDENCE_ENGINE_VERSION = "evidence.v1";

/** Xây evidenceId xác định từ (calculationId, ruleId) — H2-B. Một rule fired trên một chart ⇒ một Evidence. */
export function makeEvidenceId(calculationId: string, ruleId: string): string {
  return `${calculationId}:${ruleId}`;
}

/**
 * Dựng Evidence cho một RuleEvaluation trên một chart (H2-C). `ruleset` cần để đọc `Rule.source`
 * (evidence phải mang nguồn của rule). interpretationId = null cho đến khi Interpretation đính vào.
 * source = null nếu rule không có trong ruleset hoặc rule không khai báo nguồn (geometric_rule hợp lệ).
 */
export function recordEvidence(
  ruleEvaluation: RuleEvaluation,
  ruleset: RuleSet,
  calculationId: string,
): Evidence {
  const rule = ruleset.rules.find((r) => r.id === ruleEvaluation.ruleId);
  return {
    evidenceId: makeEvidenceId(calculationId, ruleEvaluation.ruleId),
    interpretationId: null,
    ruleId: ruleEvaluation.ruleId,
    factorIds: [...ruleEvaluation.factorIdsUsed],
    calculationId,
    source: rule?.source ?? null,
  };
}

/**
 * `trace(interpretationId)` — trả các Evidence gắn với một interpretation, thứ tự deterministic
 * (theo evidenceId). "Store" là mảng do caller truyền vào (H2-G: no persistence).
 */
export function traceByInterpretation(
  evidences: readonly Evidence[],
  interpretationId: string,
): Evidence[] {
  return evidences
    .filter((e) => e.interpretationId === interpretationId)
    .sort((a, b) => (a.evidenceId < b.evidenceId ? -1 : a.evidenceId > b.evidenceId ? 1 : 0));
}

/** Context resolve cho traceToBirthData — các bảng tra do caller giữ (không persistence). */
export interface TraceResolutionContext {
  evidences: readonly Evidence[];
  ruleset: RuleSet;
  factors: readonly Factor[];
  chart: NormalizedChart;
}

/**
 * `traceToBirthData(evidenceId)` — đi ngược tới BirthData, resolve từng liên kết. Bất kỳ mắt xích nào
 * (evidence/rule/factor/chart/birthDataRef) thiếu hoặc lệch ⇒ ném EvidenceTraceIntegrityError (H2-D).
 */
export function traceToBirthData(evidenceId: string, ctx: TraceResolutionContext): TraceChain {
  const evidence = ctx.evidences.find((e) => e.evidenceId === evidenceId);
  if (evidence === undefined) {
    throw new EvidenceTraceIntegrityError(`Không tìm thấy Evidence: ${evidenceId}`);
  }

  const rule = ctx.ruleset.rules.find((r) => r.id === evidence.ruleId);
  if (rule === undefined) {
    throw new EvidenceTraceIntegrityError(
      `Đứt xích Evidence→Rule: rule "${evidence.ruleId}" không có trong ruleset (evidence ${evidenceId})`,
    );
  }

  const factorIds = new Set(ctx.factors.map((f) => f.id));
  for (const factorId of evidence.factorIds) {
    if (!factorIds.has(factorId)) {
      throw new EvidenceTraceIntegrityError(
        `Đứt xích Evidence→Factor: factor "${factorId}" không tồn tại (evidence ${evidenceId})`,
      );
    }
  }

  if (ctx.chart.metadata.calculationId !== evidence.calculationId) {
    throw new EvidenceTraceIntegrityError(
      `Đứt xích Evidence→Chart: calculationId "${evidence.calculationId}" không khớp chart "${ctx.chart.metadata.calculationId}"`,
    );
  }
  if (!ctx.chart.birthDataRef) {
    throw new EvidenceTraceIntegrityError(
      `Đứt xích Chart→BirthData: chart "${ctx.chart.metadata.calculationId}" thiếu birthDataRef`,
    );
  }

  return {
    evidence,
    ruleId: rule.id,
    factorIds: [...evidence.factorIds],
    calculationId: evidence.calculationId,
    birthDataRef: ctx.chart.birthDataRef,
  };
}
