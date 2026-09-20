/**
 * Evaluator THẬT cho R-TIMDO-01 — hàm THUẦN, đúng chữ ký frozen
 * `evaluate(calculation: DaLiuRenCalculationResult): RuleResult` (Model A). CHỈ đọc field
 * Calculation Layer đã khai báo ở `rule.ts` `dependencies` — KHÔNG ChartInput/EngineMeta/
 * QuestionType, KHÔNG tính lại bất kỳ giá trị Calculation nào, KHÔNG I/O.
 *
 * Provenance của `threeTransmissions.method` PHỤ THUỘC pháp 九宗門 nào đã chọn (khác nhau giữa
 * 遙克/昴星, xem nine-methods/provenance.ts) — rule này CHỈ cần resolve confidence cho ĐÚNG 2
 * pháp nó quan tâm (yaoke/maoxing), KHÔNG cần 1 resolver tổng quát cho cả 9 pháp (ngoài phạm vi
 * rule này, xem contract mục C — "KHÔNG cần calculation mới").
 */
import type { DaLiuRenCalculationResult } from "../../da-liu-ren-calculation-result.js";
import type { RuleEvaluator, RuleResult, EvaluatorRegistration } from "../../interpretation/rule.js";
import type { Signal } from "../../interpretation/signal.js";
import type { ProvenanceEntry } from "../../interpretation/provenance.js";
import { worstConfidence } from "../../interpretation/confidence.js";
import { YAOKE_PROVENANCE, MAOXING_PROVENANCE } from "../../nine-methods/provenance.js";
import {
  TWELVE_GENERALS_ORDER_PROVENANCE,
  TWELVE_GENERALS_ANCHOR_PROVENANCE,
  TWELVE_GENERALS_DIRECTION_PROVENANCE,
} from "../../twelve-generals/provenance.js";
import { R_TIMDO_01 } from "./rule.js";
import { TIMDO_01_PROVENANCE } from "./provenance.js";

export const evaluateTimDo01: RuleEvaluator = (calculation: DaLiuRenCalculationResult): RuleResult => {
  const method = calculation.threeTransmissions.method;
  const methodMatches = method === "yaoke" || method === "maoxing";

  // Non-null assertion an toàn: `twelveGenerals` LUÔN có đúng 12 phần tử, mỗi Địa Chi 1 tướng
  // (type 12-tuple) — `threeTransmissions.initial` LUÔN là 1 trong 12 Chi hợp lệ.
  const initialGeneral = calculation.twelveGenerals.find((p) => p.zhi === calculation.threeTransmissions.initial)!.general;
  const huyenVuAtInitial = initialGeneral === "xuanWu";

  const twelveGeneralsConfidence = worstConfidence(
    worstConfidence(TWELVE_GENERALS_ORDER_PROVENANCE.confidence, TWELVE_GENERALS_ANCHOR_PROVENANCE.confidence),
    TWELVE_GENERALS_DIRECTION_PROVENANCE.confidence,
  );
  const twelveGeneralsProvenanceIds = [
    TWELVE_GENERALS_ORDER_PROVENANCE.id,
    TWELVE_GENERALS_ANCHOR_PROVENANCE.id,
    TWELVE_GENERALS_DIRECTION_PROVENANCE.id,
  ];

  let calculationConfidence = twelveGeneralsConfidence;
  let calculationProvenanceIds: string[] = [...twelveGeneralsProvenanceIds];
  let methodProvenance: ProvenanceEntry | null = null;
  if (methodMatches) {
    methodProvenance = method === "yaoke" ? YAOKE_PROVENANCE : MAOXING_PROVENANCE;
    calculationConfidence = worstConfidence(calculationConfidence, methodProvenance.confidence);
    calculationProvenanceIds = [methodProvenance.id, ...twelveGeneralsProvenanceIds];
  }

  const signals: Signal[] = [];
  if (methodMatches && huyenVuAtInitial) {
    signals.push({
      signalId: `${R_TIMDO_01.ruleId}-0`,
      ruleId: R_TIMDO_01.ruleId,
      category: R_TIMDO_01.topic,
      subject: "初傳",
      object: "玄武",
      relation: "presence",
      polarity: "inauspicious",
      descriptionKey: "timdo.initial_xuanwu",
      triggered: true,
      layer: R_TIMDO_01.layer,
      ruleConfidence: R_TIMDO_01.confidence,
      calculationConfidence,
      provenanceId: TIMDO_01_PROVENANCE.id,
      calculationProvenanceIds,
    });
  }

  return {
    ruleId: R_TIMDO_01.ruleId,
    status: signals.length > 0 ? "triggered" : "not-triggered",
    inputs: {
      method,
      initial: calculation.threeTransmissions.initial,
      initialGeneral,
    },
    signals,
    provenanceId: TIMDO_01_PROVENANCE.id,
    ruleConfidence: R_TIMDO_01.confidence,
    calculationConfidence,
  };
};

/** Đăng ký evaluator thật cho R-TIMDO-01 — dùng bởi Evaluator Registry sản xuất (registry.ts). */
export const R_TIMDO_01_EVALUATOR_REGISTRATION: EvaluatorRegistration = {
  ruleId: R_TIMDO_01.ruleId,
  evaluate: evaluateTimDo01,
};
