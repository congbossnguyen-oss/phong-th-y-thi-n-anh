/**
 * Rule Registry SẢN XUẤT THẬT (Phase 10.6.3) — CHỈ chứa R-NHATTHAN-01, rule production duy
 * nhất hiện có ("Do NOT add any other real production rules"). Validate NGAY khi module này
 * được import (qua `buildRuleRegistry`/`buildEvaluatorRegistry`, Phase 10.6.2) — nếu registry
 * vi phạm bất kỳ ràng buộc nào (Level 1/2, provenance mồ côi, thiếu evaluator...), việc IMPORT
 * module này THROW NGAY, không để lỗi trôi tới runtime request nào.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";
import { buildRuleRegistry } from "../validation/rule-registry.js";
import { buildEvaluatorRegistry } from "../validation/evaluator-registry.js";
import { R_NHATTHAN_01, NHATTHAN_01_PROVENANCE, R_NHATTHAN_01_EVALUATOR_REGISTRATION } from "./r-nhatthan-01/index.js";
import { FOUR_LESSONS_PROVENANCE } from "../four-lessons/provenance.js";
import { GANZHI_PILLAR_CONSTRUCTION_PROVENANCE } from "../calendar/provenance.js";
import { ZI_HOUR_POLICY_PROVENANCE } from "../profiles/provenance-seed.js";

export const PRODUCTION_RULE_PROVENANCE: Readonly<Record<string, ProvenanceEntry>> = {
  [NHATTHAN_01_PROVENANCE.id]: NHATTHAN_01_PROVENANCE,
};

/**
 * Provenance Calculation Layer mà evaluator sản xuất hiện có THỰC SỰ tham chiếu qua
 * `Signal.calculationProvenanceIds` (xem r-nhatthan-01/evaluator.ts) — CHỈ liệt kê những gì
 * rule production hiện tại cần, KHÔNG PHẢI toàn bộ Calculation Layer (phạm vi hẹp này là quyết
 * định có chủ đích từ Phase 10.6.1, không phải thiếu sót).
 */
export const PRODUCTION_CALCULATION_PROVENANCE: Readonly<Record<string, ProvenanceEntry>> = {
  [FOUR_LESSONS_PROVENANCE.id]: FOUR_LESSONS_PROVENANCE,
  [GANZHI_PILLAR_CONSTRUCTION_PROVENANCE.id]: GANZHI_PILLAR_CONSTRUCTION_PROVENANCE,
  [ZI_HOUR_POLICY_PROVENANCE.id]: ZI_HOUR_POLICY_PROVENANCE,
};

export const PRODUCTION_RULE_REGISTRY = buildRuleRegistry([R_NHATTHAN_01], PRODUCTION_RULE_PROVENANCE);

export const PRODUCTION_EVALUATOR_REGISTRY = buildEvaluatorRegistry(PRODUCTION_RULE_REGISTRY, [R_NHATTHAN_01_EVALUATOR_REGISTRATION]);
