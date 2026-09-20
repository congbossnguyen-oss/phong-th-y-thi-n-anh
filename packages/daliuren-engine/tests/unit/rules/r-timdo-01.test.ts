import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { R_TIMDO_01 } from "../../../src/rules/r-timdo-01/rule.js";
import { TIMDO_01_PROVENANCE } from "../../../src/rules/r-timdo-01/provenance.js";
import { evaluateTimDo01, R_TIMDO_01_EVALUATOR_REGISTRATION } from "../../../src/rules/r-timdo-01/evaluator.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY } from "../../../src/rules/registry.js";
import { getRuleById, selectEligibleRules } from "../../../src/validation/rule-registry.js";
import { runEvaluator } from "../../../src/validation/evaluator-registry.js";
import type { DaLiuRenCalculationResult } from "../../../src/da-liu-ren-calculation-result.js";

function realCalculation(date: string, hour: number, minute: number): DaLiuRenCalculationResult {
  const result = calculateDaLiuRenChart({ date, hour, minute, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error(`test setup lỗi: ${date} ${hour}:${minute} phải tính thành công`);
  return result.data;
}

// Golden charts xác nhận qua calculateDaLiuRenChart thật (Asia/Shanghai):
// - 2024-05-04 10:00: method=yaoke, initialGeneral=xuanWu → TRIGGER.
// - 2024-04-01 22:00: method=maoxing, initialGeneral=baiHu → method khớp NHƯNG không phải xuanWu.
// - 2024-01-01 10:00: method=zeike → method KHÔNG khớp.

describe("daliuren-engine/rules/r-timdo-01", () => {
  describe("[A] RuleDefinition — đúng paper contract Phase 11-B mục C", () => {
    it("ruleId, layer, topic, confidence, questionTypes đúng chính xác", () => {
      expect(R_TIMDO_01.ruleId).toBe("R-TIMDO-01");
      expect(R_TIMDO_01.layer).toBe("core");
      expect(R_TIMDO_01.topic).toBe("三傳");
      expect(R_TIMDO_01.confidence).toBe("A");
      expect(R_TIMDO_01.questionTypes).toEqual(["tim-do"]);
    });

    it("provenanceId trỏ đúng entry 畢法賦 pháp 35, confidence A", () => {
      expect(R_TIMDO_01.provenanceId).toBe(TIMDO_01_PROVENANCE.id);
      expect(TIMDO_01_PROVENANCE.confidence).toBe("A");
      expect(TIMDO_01_PROVENANCE.sourceType).toBe("classical-fact");
    });

    it("dependencies ĐÚNG 2 field (threeTransmissions, twelveGenerals) — KHÔNG unimplemented/externalContext", () => {
      expect(R_TIMDO_01.dependencies.calculationFields).toEqual(["threeTransmissions", "twelveGenerals"]);
      expect(R_TIMDO_01.dependencies.unimplementedComponents ?? []).toEqual([]);
      expect(R_TIMDO_01.dependencies.externalContext ?? []).toEqual([]);
    });
  });

  describe("[B] Registry — real rule/evaluator đã đăng ký trong PRODUCTION_*", () => {
    it("PRODUCTION_RULE_REGISTRY chứa R-TIMDO-01", () => {
      expect(PRODUCTION_RULE_REGISTRY.rules.map((r) => r.ruleId)).toContain("R-TIMDO-01");
    });

    it("PRODUCTION_EVALUATOR_REGISTRY có evaluator cho R-TIMDO-01, ruleId khớp EvaluatorRegistration", () => {
      expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.has("R-TIMDO-01")).toBe(true);
      expect(R_TIMDO_01_EVALUATOR_REGISTRATION.ruleId).toBe(R_TIMDO_01.ruleId);
    });
  });

  describe("[C] Eligibility — QuestionType gate", () => {
    it("selectEligibleRules trả về R-TIMDO-01 cho 'tim-do'", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "tim-do").map((r) => r.ruleId)).toContain("R-TIMDO-01");
    });

    it("selectEligibleRules KHÔNG trả về R-TIMDO-01 cho question_type KHÁC", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId)).not.toContain("R-TIMDO-01");
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "kien-tung").map((r) => r.ruleId)).not.toContain("R-TIMDO-01");
    });

    it("selectEligibleRules trả về RỖNG cho question_type UNVERIFIED", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "su-nghiep").map((r) => r.ruleId)).not.toContain("R-TIMDO-01");
    });
  });

  describe("[D] Evaluator — positive/negative/no-signal/edge, không đọc field cấm", () => {
    it("method=yaoke + Huyền Vũ tại Sơ truyền (golden 2024-05-04 10:00) → TRIGGERED, đúng subject/object/relation/polarity", () => {
      const result = evaluateTimDo01(realCalculation("2024-05-04", 10, 0));
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({
        signalId: "R-TIMDO-01-0",
        subject: "初傳",
        object: "玄武",
        relation: "presence",
        polarity: "inauspicious",
        descriptionKey: "timdo.initial_xuanwu",
      });
    });

    it("method=maoxing khớp NHƯNG Huyền Vũ KHÔNG ở Sơ truyền (golden 2024-04-01 22:00) → not-triggered", () => {
      const result = evaluateTimDo01(realCalculation("2024-04-01", 22, 0));
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
    });

    it("method KHÔNG khớp yaoke/maoxing (golden 2024-01-01 10:00, method=zeike) → not-triggered, không throw dù method lạ", () => {
      const result = evaluateTimDo01(realCalculation("2024-01-01", 10, 0));
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
      expect(result.inputs).toMatchObject({ method: "zeike" });
    });

    it("mọi signal có đủ field bắt buộc", () => {
      const result = evaluateTimDo01(realCalculation("2024-05-04", 10, 0));
      for (const signal of result.signals) {
        expect(signal.ruleId).toBe("R-TIMDO-01");
        expect(signal.category).toBe("三傳");
        expect(signal.triggered).toBe(true);
        expect(signal.layer).toBe("core");
        expect(signal.ruleConfidence).toBe("A");
        expect(["A", "B", "C", "D"]).toContain(signal.calculationConfidence);
        expect(signal.provenanceId).toBe("PROV-TIMDO-01");
      }
    });

    it("evaluator KHÔNG mutate calculation đầu vào (pure)", () => {
      const calculation = realCalculation("2024-05-04", 10, 0);
      const snapshot = structuredClone(calculation);
      evaluateTimDo01(calculation);
      expect(calculation).toEqual(snapshot);
    });

    it("gọi 2 lần cùng calculation cho kết quả HỆT NHAU (deterministic)", () => {
      const calculation = realCalculation("2024-05-04", 10, 0);
      expect(evaluateTimDo01(calculation)).toEqual(evaluateTimDo01(calculation));
    });
  });

  describe("[E] Confidence — Model C, worst-of thực tế theo TỪNG pháp (KHÔNG hard-code)", () => {
    it("ruleConfidence LUÔN 'A' bất kể chart nào", () => {
      expect(evaluateTimDo01(realCalculation("2024-05-04", 10, 0)).ruleConfidence).toBe("A");
      expect(evaluateTimDo01(realCalculation("2024-01-01", 10, 0)).ruleConfidence).toBe("A");
    });

    it("method=yaoke (confidence B) → calculationConfidence='B' (worst-of YAOKE=B/ORDER=A/ANCHOR=A/DIRECTION=B), calculationProvenanceIds đúng 4 id với PROV-NINE-METHODS-YAOKE đứng đầu", () => {
      const result = evaluateTimDo01(realCalculation("2024-05-04", 10, 0));
      expect(result.calculationConfidence).toBe("B");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual([
        "PROV-NINE-METHODS-YAOKE",
        "PROV-TWELVE-GENERALS-ORDER",
        "PROV-TWELVE-GENERALS-ANCHOR",
        "PROV-TWELVE-GENERALS-DIRECTION",
      ]);
    });
  });

  describe("[F] Golden chart — qua registry/evaluator infrastructure thật (end-to-end, không bypass registry)", () => {
    it("golden 2024-05-04 10:00, questionType='tim-do': facade thật → registry thật → eligibility thật → runEvaluator thật", () => {
      const calculation = realCalculation("2024-05-04", 10, 0);
      const eligible = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "tim-do");
      expect(eligible.map((r) => r.ruleId)).toContain("R-TIMDO-01");
      const rule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-TIMDO-01")!;
      const ruleResult = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule, calculation);
      expect(ruleResult.status).toBe("triggered");
      expect(ruleResult.signals).toHaveLength(1);
    });
  });
});
