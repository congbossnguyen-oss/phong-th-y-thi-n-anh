/**
 * Rule Registry SẢN XUẤT THẬT — Phase 10.6.3 (R-NHATTHAN-01) + Phase 11-B (R-HONNHAN-01,
 * R-TIMDO-01, R-KIENTUNG-02, đúng phạm vi đã duyệt — KHÔNG R-QUANCHUC-01, KHÔNG kien-tung D2).
 * Validate NGAY khi module này được import (qua `buildRuleRegistry`/`buildEvaluatorRegistry`,
 * Phase 10.6.2) — nếu registry vi phạm bất kỳ ràng buộc nào (Level 1/2, provenance mồ côi,
 * thiếu evaluator...), việc IMPORT module này THROW NGAY, không để lỗi trôi tới runtime request
 * nào.
 *
 * Thứ tự khai báo trong mảng truyền vào `buildRuleRegistry`/`buildEvaluatorRegistry` = thứ tự
 * xuất hiện trong `verified_rules`/`signals` của `InterpretationPackage` (selectEligibleRules
 * KHÔNG sắp lại, xem validation/rule-registry.ts) — R-NHATTHAN-01 GIỮ NGUYÊN vị trí đầu tiên
 * (không đổi hành vi cũ), 3 rule mới nối tiếp theo ĐÚNG thứ tự đã duyệt trong Phase 11-B brief
 * (hon-nhan → tim-do → kien-tung).
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";
import { buildRuleRegistry } from "../validation/rule-registry.js";
import { buildEvaluatorRegistry } from "../validation/evaluator-registry.js";
import { R_NHATTHAN_01, NHATTHAN_01_PROVENANCE, R_NHATTHAN_01_EVALUATOR_REGISTRATION } from "./r-nhatthan-01/index.js";
import { R_HONNHAN_01, HONNHAN_01_PROVENANCE, R_HONNHAN_01_EVALUATOR_REGISTRATION } from "./r-honnhan-01/index.js";
import { R_TIMDO_01, TIMDO_01_PROVENANCE, R_TIMDO_01_EVALUATOR_REGISTRATION } from "./r-timdo-01/index.js";
import { R_KIENTUNG_02, KIENTUNG_02_PROVENANCE, R_KIENTUNG_02_EVALUATOR_REGISTRATION } from "./r-kientung-02/index.js";
import { FOUR_LESSONS_PROVENANCE } from "../four-lessons/provenance.js";
import { GANZHI_PILLAR_CONSTRUCTION_PROVENANCE } from "../calendar/provenance.js";
import { ZI_HOUR_POLICY_PROVENANCE } from "../profiles/provenance-seed.js";
import { YAOKE_PROVENANCE, MAOXING_PROVENANCE } from "../nine-methods/provenance.js";
import {
  TWELVE_GENERALS_ORDER_PROVENANCE,
  TWELVE_GENERALS_ANCHOR_PROVENANCE,
  TWELVE_GENERALS_DIRECTION_PROVENANCE,
} from "../twelve-generals/provenance.js";

export const PRODUCTION_RULE_PROVENANCE: Readonly<Record<string, ProvenanceEntry>> = {
  [NHATTHAN_01_PROVENANCE.id]: NHATTHAN_01_PROVENANCE,
  [HONNHAN_01_PROVENANCE.id]: HONNHAN_01_PROVENANCE,
  [TIMDO_01_PROVENANCE.id]: TIMDO_01_PROVENANCE,
  [KIENTUNG_02_PROVENANCE.id]: KIENTUNG_02_PROVENANCE,
};

/**
 * Provenance Calculation Layer mà evaluator sản xuất hiện có THỰC SỰ tham chiếu qua
 * `Signal.calculationProvenanceIds` — CHỈ liệt kê những gì rule production hiện tại cần, KHÔNG
 * PHẢI toàn bộ Calculation Layer (phạm vi hẹp này là quyết định có chủ đích từ Phase 10.6.1,
 * tiếp tục áp dụng cho Phase 11-B — không rule mới nào cần entry Calculation MỚI, chỉ TÁI DÙNG,
 * đúng Provenance Contract tổng hợp của contract).
 */
export const PRODUCTION_CALCULATION_PROVENANCE: Readonly<Record<string, ProvenanceEntry>> = {
  [FOUR_LESSONS_PROVENANCE.id]: FOUR_LESSONS_PROVENANCE,
  [GANZHI_PILLAR_CONSTRUCTION_PROVENANCE.id]: GANZHI_PILLAR_CONSTRUCTION_PROVENANCE,
  [ZI_HOUR_POLICY_PROVENANCE.id]: ZI_HOUR_POLICY_PROVENANCE,
  [YAOKE_PROVENANCE.id]: YAOKE_PROVENANCE,
  [MAOXING_PROVENANCE.id]: MAOXING_PROVENANCE,
  [TWELVE_GENERALS_ORDER_PROVENANCE.id]: TWELVE_GENERALS_ORDER_PROVENANCE,
  [TWELVE_GENERALS_ANCHOR_PROVENANCE.id]: TWELVE_GENERALS_ANCHOR_PROVENANCE,
  [TWELVE_GENERALS_DIRECTION_PROVENANCE.id]: TWELVE_GENERALS_DIRECTION_PROVENANCE,
};

export const PRODUCTION_RULE_REGISTRY = buildRuleRegistry(
  [R_NHATTHAN_01, R_HONNHAN_01, R_TIMDO_01, R_KIENTUNG_02],
  PRODUCTION_RULE_PROVENANCE,
);

export const PRODUCTION_EVALUATOR_REGISTRY = buildEvaluatorRegistry(PRODUCTION_RULE_REGISTRY, [
  R_NHATTHAN_01_EVALUATOR_REGISTRATION,
  R_HONNHAN_01_EVALUATOR_REGISTRATION,
  R_TIMDO_01_EVALUATOR_REGISTRATION,
  R_KIENTUNG_02_EVALUATOR_REGISTRATION,
]);
