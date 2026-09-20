/**
 * `western.rules.v1` — Western geometric RuleSet V1 (Phase 6, Batch 3, CONTENT).
 * Đây là DỮ LIỆU (Model A: engine generic dùng chung + RuleSet theo trường phái) — KHÔNG phải code
 * có kiến thức chiêm tinh. Được human content-gate DUYỆT: đúng 3 rule geometric trên cặp Sun↔Moon.
 *
 * Mỗi rule:
 *  - source_type = "geometric_rule" (không cần trích dẫn cổ văn — D4).
 *  - chỉ dùng ConditionExpr: factorPresent / and / or (không not, không factorThreshold).
 *  - chỉ tham chiếu Factor IDs CÓ SẴN của Phase 5 (verbatim grammar — D6).
 *  - KHÔNG weighting, KHÔNG interpretation, KHÔNG scoring, KHÔNG prerequisites.
 *
 * Là một predicate cấu trúc thuần (Sun/Moon cùng nguyên tố / cùng tính chất / có tạo aspect chính) —
 * KHÔNG mang phán xét benefic/malefic/harmonious hay ý nghĩa lĩnh vực đời sống nào (những thứ đó
 * thuộc Rule content về sau + tầng Scoring/Interpretation Phase 7/8, ngoài phạm vi V1).
 *
 * RuleSet này phải qua `validateRuleSet`/`loadRuleSet` sạch (xem test) trước khi evaluate.
 */

import type { Rule, RuleSet } from "../rule/types.js";

/** Phiên bản RuleSet Tây phương V1 (ADR-008). */
export const WESTERN_RULES_VERSION = "western.rules.v1";

const WESTERN_SCHOOL = "western";

/** Helper nội bộ dựng Rule geometric (không weighting, không prerequisites). CHỈ dùng để khai báo dữ liệu tĩnh dưới đây. */
function geometricRule(id: string, conditions: Rule["conditions"]): Rule {
  return {
    id,
    school: WESTERN_SCHOOL,
    version: "1.0.0",
    rulesetVersion: WESTERN_RULES_VERSION,
    prerequisites: [],
    conditions,
    source: { sourceType: "geometric_rule" },
  };
}

/** Rule 1 — Sun và Moon cùng nguyên tố (element). */
const LUMINARIES_SAME_ELEMENT: Rule = geometricRule("WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT", {
  op: "or",
  args: [
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_element_fire" }, { op: "factorPresent", pattern: "moon_element_fire" }] },
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_element_earth" }, { op: "factorPresent", pattern: "moon_element_earth" }] },
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_element_air" }, { op: "factorPresent", pattern: "moon_element_air" }] },
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_element_water" }, { op: "factorPresent", pattern: "moon_element_water" }] },
  ],
});

/** Rule 2 — Sun và Moon cùng tính chất (modality). */
const LUMINARIES_SAME_MODALITY: Rule = geometricRule("WESTERN.STRUCT.LUMINARIES_SAME_MODALITY", {
  op: "or",
  args: [
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_modality_cardinal" }, { op: "factorPresent", pattern: "moon_modality_cardinal" }] },
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_modality_fixed" }, { op: "factorPresent", pattern: "moon_modality_fixed" }] },
    { op: "and", args: [{ op: "factorPresent", pattern: "sun_modality_mutable" }, { op: "factorPresent", pattern: "moon_modality_mutable" }] },
  ],
});

/** Rule 3 — Sun và Moon có một aspect chính (tiêu thụ Factor aspect có sẵn của Phase 5; KHÔNG tự tính aspect). */
const LUMINARIES_IN_ASPECT: Rule = geometricRule("WESTERN.STRUCT.LUMINARIES_IN_ASPECT", {
  op: "or",
  args: [
    { op: "factorPresent", pattern: "aspect:sun-moon:conjunction" },
    { op: "factorPresent", pattern: "aspect:sun-moon:sextile" },
    { op: "factorPresent", pattern: "aspect:sun-moon:square" },
    { op: "factorPresent", pattern: "aspect:sun-moon:trine" },
    { op: "factorPresent", pattern: "aspect:sun-moon:opposition" },
  ],
});

/** RuleSet Tây phương V1 — đúng 3 rule geometric đã được duyệt. */
export const WESTERN_RULES_V1: RuleSet = {
  school: WESTERN_SCHOOL,
  version: WESTERN_RULES_VERSION,
  rules: [LUMINARIES_SAME_ELEMENT, LUMINARIES_SAME_MODALITY, LUMINARIES_IN_ASPECT],
};
