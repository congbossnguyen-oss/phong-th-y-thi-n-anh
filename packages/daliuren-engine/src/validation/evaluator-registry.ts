/**
 * Evaluator Registry — Phase 10.6.2 Section 3-4. Evaluator (logic thực thi thật) sống TÁCH
 * BIỆT khỏi `RuleDefinition` (dữ liệu tĩnh) — file này chỉ ghép 2 thứ đó lại và kiểm tra tính
 * ĐẦY ĐỦ 1-1 giữa registry rule đã validate và registry evaluator, KHÔNG chứa domain logic nào.
 */
import type { RuleDefinition, RuleEvaluator, EvaluatorRegistration, RuleResult } from "../interpretation/rule.js";
import type { DaLiuRenCalculationResult } from "../da-liu-ren-calculation-result.js";
import { DaLiuRenValidationError } from "./errors.js";
import type { ValidatedRuleRegistry } from "./rule-registry.js";

/** Evaluator registry ĐÃ QUA `buildEvaluatorRegistry` — mỗi rule trong `ValidatedRuleRegistry` tương ứng nguồn gốc có ĐÚNG 1 evaluator, không thiếu không thừa. */
export interface ValidatedEvaluatorRegistry {
  readonly evaluatorByRuleId: ReadonlyMap<string, RuleEvaluator>;
}

/**
 * Kiểm tra tính ĐẦY ĐỦ 1-1 giữa `ruleRegistry.rules` và `registrations`, rồi bọc thành
 * `ValidatedEvaluatorRegistry`:
 *  1. Mọi `RuleDefinition.ruleId` trong `ruleRegistry` PHẢI có ĐÚNG 1 evaluator (thiếu → MISSING_EVALUATOR).
 *  2. KHÔNG được đăng ký evaluator cho `ruleId` không tồn tại trong `ruleRegistry` (EVALUATOR_FOR_UNKNOWN_RULE).
 *  3. KHÔNG được đăng ký 2 evaluator cho CÙNG 1 `ruleId` (DUPLICATE_EVALUATOR) — vì vậy nhận
 *     `registrations` dạng DANH SÁCH (không phải Record/Map đã gộp sẵn, nơi trùng lặp sẽ bị
 *     ghi đè âm thầm trước khi hàm này kịp thấy).
 * Build/test-time validation — ném lỗi tường minh, KHÔNG âm thầm bỏ qua evaluator thiếu/thừa.
 */
export function buildEvaluatorRegistry(
  ruleRegistry: ValidatedRuleRegistry,
  registrations: readonly EvaluatorRegistration[],
): ValidatedEvaluatorRegistry {
  const knownRuleIds = new Set(ruleRegistry.rules.map((rule) => rule.ruleId));
  const evaluatorByRuleId = new Map<string, RuleEvaluator>();

  for (const registration of registrations) {
    if (!knownRuleIds.has(registration.ruleId)) {
      throw new DaLiuRenValidationError(
        "EVALUATOR_FOR_UNKNOWN_RULE",
        `Evaluator đăng ký cho ruleId "${registration.ruleId}" nhưng ruleId này không tồn tại trong Rule Registry.`,
      );
    }
    if (evaluatorByRuleId.has(registration.ruleId)) {
      throw new DaLiuRenValidationError(
        "DUPLICATE_EVALUATOR",
        `Trùng đăng ký evaluator cho ruleId "${registration.ruleId}" — mỗi rule chỉ được ĐÚNG 1 evaluator.`,
      );
    }
    evaluatorByRuleId.set(registration.ruleId, registration.evaluate);
  }

  for (const rule of ruleRegistry.rules) {
    if (!evaluatorByRuleId.has(rule.ruleId)) {
      throw new DaLiuRenValidationError(
        "MISSING_EVALUATOR",
        `Rule "${rule.ruleId}" đã đăng ký trong Rule Registry nhưng KHÔNG có evaluator tương ứng.`,
      );
    }
  }

  return { evaluatorByRuleId };
}

/**
 * Thực thi evaluator của 1 `RuleDefinition` cụ thể — Phase 10.6.2 Section 8: chỉ truyền
 * `DaLiuRenCalculationResult` (KHÔNG `ChartInput`/`EngineMeta`/`QuestionType`), KHÔNG sửa
 * `calculation` hay `rule` đầu vào, KHÔNG chứa logic domain nào (đó là việc của CHÍNH evaluator
 * đã đăng ký, ngoài phạm vi file này).
 */
export function runEvaluator(
  evaluatorRegistry: ValidatedEvaluatorRegistry,
  rule: RuleDefinition,
  calculation: DaLiuRenCalculationResult,
): RuleResult {
  const evaluate = evaluatorRegistry.evaluatorByRuleId.get(rule.ruleId);
  if (!evaluate) {
    // Không thể xảy ra nếu `evaluatorRegistry` được dựng qua `buildEvaluatorRegistry()` với
    // CHÍNH `ruleRegistry` chứa `rule` này — tự vệ trước lỗi lập trình gọi sai cặp registry.
    throw new DaLiuRenValidationError(
      "MISSING_EVALUATOR",
      `Không tìm thấy evaluator cho ruleId "${rule.ruleId}" — evaluatorRegistry có thể không được dựng từ cùng Rule Registry chứa rule này.`,
    );
  }
  return evaluate(calculation);
}
