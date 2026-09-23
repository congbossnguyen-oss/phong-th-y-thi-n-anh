import { describe, expect, it, vi } from "vitest";
import { buildRuleRegistry } from "../../../src/validation/rule-registry.js";
import { buildEvaluatorRegistry, runEvaluator } from "../../../src/validation/evaluator-registry.js";
import { DaLiuRenValidationError } from "../../../src/validation/errors.js";
import { SYNTHETIC_PROVENANCE, SYNTHETIC_RULES, SYNTHETIC_EVALUATOR_REGISTRATIONS } from "../fixtures.js";
import type { EvaluatorRegistration, RuleResult } from "../../../src/interpretation/rule.js";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { DaLiuRenCalculationResult } from "../../../src/da-liu-ren-calculation-result.js";

const REGISTRY = buildRuleRegistry(SYNTHETIC_RULES, SYNTHETIC_PROVENANCE);

/** Lá số golden 2024-01-01 (đã verify xuyên suốt Phase 8/9A-9E) — dùng làm calculation THẬT, không bịa shape. */
function realCalculationResult(): DaLiuRenCalculationResult {
  const result = calculateDaLiuRenChart({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error("test setup lỗi: golden date 2024-01-01 phải tính thành công");
  return result.data;
}

describe("daliuren-engine/validation/evaluator-registry", () => {
  describe("buildEvaluatorRegistry — completeness (Phase 10.6.2 Section 4)", () => {
    it("registry đầy đủ 1-1 (fixture) không ném lỗi", () => {
      expect(() => buildEvaluatorRegistry(REGISTRY, SYNTHETIC_EVALUATOR_REGISTRATIONS)).not.toThrow();
    });

    it("[F] TỪ CHỐI khi thiếu evaluator cho 1 rule đã đăng ký", () => {
      const missingOne = SYNTHETIC_EVALUATOR_REGISTRATIONS.slice(0, 1);
      expect(() => buildEvaluatorRegistry(REGISTRY, missingOne)).toThrow(DaLiuRenValidationError);
      try {
        buildEvaluatorRegistry(REGISTRY, missingOne);
      } catch (error) {
        expect((error as DaLiuRenValidationError).code).toBe("MISSING_EVALUATOR");
      }
    });

    it("[G] TỪ CHỐI evaluator đăng ký cho ruleId KHÔNG tồn tại trong Rule Registry", () => {
      const withUnknown: EvaluatorRegistration[] = [
        ...SYNTHETIC_EVALUATOR_REGISTRATIONS,
        { ruleId: "R-KHONG-TON-TAI", evaluate: () => ({ ruleId: "R-KHONG-TON-TAI", status: "not-triggered", inputs: {}, signals: [], provenanceId: "x", ruleConfidence: "A", calculationConfidence: "A" }) },
      ];
      expect(() => buildEvaluatorRegistry(REGISTRY, withUnknown)).toThrow(DaLiuRenValidationError);
      try {
        buildEvaluatorRegistry(REGISTRY, withUnknown);
      } catch (error) {
        expect((error as DaLiuRenValidationError).code).toBe("EVALUATOR_FOR_UNKNOWN_RULE");
      }
    });

    it("[H] TỪ CHỐI đăng ký 2 evaluator cho CÙNG 1 ruleId", () => {
      const duplicated: EvaluatorRegistration[] = [...SYNTHETIC_EVALUATOR_REGISTRATIONS, SYNTHETIC_EVALUATOR_REGISTRATIONS[0]!];
      expect(() => buildEvaluatorRegistry(REGISTRY, duplicated)).toThrow(DaLiuRenValidationError);
      try {
        buildEvaluatorRegistry(REGISTRY, duplicated);
      } catch (error) {
        expect((error as DaLiuRenValidationError).code).toBe("DUPLICATE_EVALUATOR");
      }
    });

    it("[I] registry rule + evaluator ĐẦY ĐỦ 1-1 → evaluatorByRuleId có ĐÚNG số lượng entry bằng số rule", () => {
      const evaluatorRegistry = buildEvaluatorRegistry(REGISTRY, SYNTHETIC_EVALUATOR_REGISTRATIONS);
      expect(evaluatorRegistry.evaluatorByRuleId.size).toBe(REGISTRY.rules.length);
      for (const rule of REGISTRY.rules) {
        expect(evaluatorRegistry.evaluatorByRuleId.has(rule.ruleId)).toBe(true);
      }
    });
  });

  describe("runEvaluator — execution foundation (Phase 10.6.2 Section 8)", () => {
    it("[K] evaluator CHỈ nhận đúng 1 tham số (DaLiuRenCalculationResult) — không ChartInput/EngineMeta/QuestionType", () => {
      const spy = vi.fn(
        (): RuleResult => ({
          ruleId: "R-SANCHUAN-KE-NHAT",
          status: "not-triggered",
          inputs: {},
          signals: [],
          provenanceId: "R-SANCHUAN-KE-NHAT",
          ruleConfidence: "A",
          calculationConfidence: "A",
        }),
      );
      const spyRegistry = buildEvaluatorRegistry(REGISTRY, [
        { ruleId: "R-SANCHUAN-KE-NHAT", evaluate: spy },
        SYNTHETIC_EVALUATOR_REGISTRATIONS[1]!,
      ]);
      const calculation = realCalculationResult();
      runEvaluator(spyRegistry, REGISTRY.rules[0]!, calculation);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(calculation);
      expect(spy.mock.calls[0]!.length).toBe(1); // đúng 1 tham số, không truyền thêm gì khác
    });

    it("kết quả trả về ĐÚNG RuleResult evaluator sinh ra (không bị bọc/biến đổi)", () => {
      const evaluatorRegistry = buildEvaluatorRegistry(REGISTRY, SYNTHETIC_EVALUATOR_REGISTRATIONS);
      const calculation = realCalculationResult();
      const result = runEvaluator(evaluatorRegistry, REGISTRY.rules[0]!, calculation);
      expect(result.ruleId).toBe("R-SANCHUAN-KE-NHAT");
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
    });

    it("[L] KHÔNG mutate calculation lẫn RuleDefinition đầu vào", () => {
      const evaluatorRegistry = buildEvaluatorRegistry(REGISTRY, SYNTHETIC_EVALUATOR_REGISTRATIONS);
      const calculation = realCalculationResult();
      const calculationSnapshot = structuredClone(calculation);
      const rule = REGISTRY.rules[0]!;
      const ruleSnapshot = structuredClone(rule);

      runEvaluator(evaluatorRegistry, rule, calculation);

      expect(calculation).toEqual(calculationSnapshot);
      expect(rule).toEqual(ruleSnapshot);
    });

    it("ruleId không có evaluator (registry/rule không khớp cặp) → throw MISSING_EVALUATOR, không âm thầm trả undefined", () => {
      const partialRegistry = buildRuleRegistry([SYNTHETIC_RULES[0]!], SYNTHETIC_PROVENANCE);
      const evaluatorRegistry = buildEvaluatorRegistry(partialRegistry, [SYNTHETIC_EVALUATOR_REGISTRATIONS[0]!]);
      const foreignRule = SYNTHETIC_RULES[1]!; // rule hợp lệ nhưng KHÔNG có trong evaluatorRegistry này
      expect(() => runEvaluator(evaluatorRegistry, foreignRule, realCalculationResult())).toThrow(DaLiuRenValidationError);
    });
  });

  describe("runEvaluator — context truyền thêm (Phase 11-F, Gender=Option A)", () => {
    it("KHÔNG truyền context (như trước Phase 11-F) → evaluator NHẬN ĐÚNG 1 tham số, backward-compatible tuyệt đối", () => {
      const spy = vi.fn(
        (): RuleResult => ({
          ruleId: "R-SANCHUAN-KE-NHAT",
          status: "not-triggered",
          inputs: {},
          signals: [],
          provenanceId: "R-SANCHUAN-KE-NHAT",
          ruleConfidence: "A",
          calculationConfidence: "A",
        }),
      );
      const spyRegistry = buildEvaluatorRegistry(REGISTRY, [{ ruleId: "R-SANCHUAN-KE-NHAT", evaluate: spy }, SYNTHETIC_EVALUATOR_REGISTRATIONS[1]!]);
      const calculation = realCalculationResult();
      runEvaluator(spyRegistry, REGISTRY.rules[0]!, calculation); // không truyền context

      expect(spy.mock.calls[0]!.length).toBe(1);
    });

    it("TRUYỀN context { gender } → evaluator nhận ĐÚNG context đó ở tham số thứ 2", () => {
      const spy = vi.fn(
        (): RuleResult => ({
          ruleId: "R-SANCHUAN-KE-NHAT",
          status: "not-triggered",
          inputs: {},
          signals: [],
          provenanceId: "R-SANCHUAN-KE-NHAT",
          ruleConfidence: "A",
          calculationConfidence: "A",
        }),
      );
      const spyRegistry = buildEvaluatorRegistry(REGISTRY, [{ ruleId: "R-SANCHUAN-KE-NHAT", evaluate: spy }, SYNTHETIC_EVALUATOR_REGISTRATIONS[1]!]);
      const calculation = realCalculationResult();
      runEvaluator(spyRegistry, REGISTRY.rules[0]!, calculation, { gender: "female" });

      expect(spy).toHaveBeenCalledWith(calculation, { gender: "female" });
    });

    it("evaluator hiện có (CHỈ khai báo 1 tham số) vẫn chạy đúng dù runEvaluator được gọi VỚI context — JS bỏ qua tham số thừa", () => {
      // SYNTHETIC_EVALUATOR_REGISTRATIONS[0] khai báo `evaluate: () => (...)` — 0 tham số khai báo tường minh.
      const evaluatorRegistry = buildEvaluatorRegistry(REGISTRY, SYNTHETIC_EVALUATOR_REGISTRATIONS);
      const calculation = realCalculationResult();
      const result = runEvaluator(evaluatorRegistry, REGISTRY.rules[0]!, calculation, { gender: "male" });
      expect(result.status).toBe("not-triggered");
    });
  });
});
