import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { R_NHATTHAN_01 } from "../../../src/rules/r-nhatthan-01/rule.js";
import { NHATTHAN_01_PROVENANCE } from "../../../src/rules/r-nhatthan-01/provenance.js";
import { evaluateNhatThan01, R_NHATTHAN_01_EVALUATOR_REGISTRATION } from "../../../src/rules/r-nhatthan-01/evaluator.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY, PRODUCTION_RULE_PROVENANCE } from "../../../src/rules/registry.js";
import { buildRuleRegistry, getRuleById, selectEligibleRules, questionTypeAllowsRules } from "../../../src/validation/rule-registry.js";
import { buildEvaluatorRegistry, runEvaluator } from "../../../src/validation/evaluator-registry.js";
import type { DaLiuRenCalculationResult } from "../../../src/da-liu-ren-calculation-result.js";

/** Dựng DaLiuRenCalculationResult THẬT qua facade — KHÔNG bịa shape (Phase 10.6.3 mục F). */
function realCalculation(date: string, hour: number, minute: number): DaLiuRenCalculationResult {
  const result = calculateDaLiuRenChart({ date, hour, minute, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error(`test setup lỗi: ${date} ${hour}:${minute} phải tính thành công`);
  return result.data;
}

describe("daliuren-engine/rules/r-nhatthan-01", () => {
  describe("[A] RuleDefinition — đúng paper contract Phase 10.4 Section 10", () => {
    it("ruleId, layer, topic, confidence đúng chính xác", () => {
      expect(R_NHATTHAN_01.ruleId).toBe("R-NHATTHAN-01");
      expect(R_NHATTHAN_01.layer).toBe("core");
      expect(R_NHATTHAN_01.topic).toBe("四課");
      expect(R_NHATTHAN_01.confidence).toBe("A");
    });

    it("provenanceId trỏ đúng entry 六壬大全 卷三「日辰」, confidence A", () => {
      expect(R_NHATTHAN_01.provenanceId).toBe(NHATTHAN_01_PROVENANCE.id);
      expect(NHATTHAN_01_PROVENANCE.confidence).toBe("A");
      expect(NHATTHAN_01_PROVENANCE.sourceTitle).toContain("六壬大全");
      expect(NHATTHAN_01_PROVENANCE.sourceLocation).toContain("日辰");
      expect(NHATTHAN_01_PROVENANCE.sourceType).toBe("classical-fact");
    });

    it("dependencies ĐÚNG 3 field (fourLessons.lesson1, fourLessons.lesson3, calendar.dayPillar) — KHÔNG threeTransmissions/twelveGenerals/nobleSpirit/heavenEarthPlate, KHÔNG unimplemented/externalContext", () => {
      expect(R_NHATTHAN_01.dependencies.calculationFields).toEqual(["fourLessons.lesson1", "fourLessons.lesson3", "calendar.dayPillar"]);
      expect(R_NHATTHAN_01.dependencies.unimplementedComponents ?? []).toEqual([]);
      expect(R_NHATTHAN_01.dependencies.externalContext ?? []).toEqual([]);
    });

    it("questionTypes VẮNG MẶT (universal/core) — đúng Phase 10.3 Section 10, KHÔNG tự giới hạn cho question_type nào", () => {
      expect(R_NHATTHAN_01.questionTypes).toBeUndefined();
    });
  });

  describe("[B] Registry — real rule/evaluator qua buildRuleRegistry/buildEvaluatorRegistry", () => {
    it("PRODUCTION_RULE_REGISTRY chứa ĐÚNG 1 rule: R-NHATTHAN-01", () => {
      expect(PRODUCTION_RULE_REGISTRY.rules.map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01"]);
    });

    it("real rule pass buildRuleRegistry() — provenanceId resolve đúng trong PRODUCTION_RULE_PROVENANCE", () => {
      expect(() => buildRuleRegistry([R_NHATTHAN_01], PRODUCTION_RULE_PROVENANCE)).not.toThrow();
    });

    it("real evaluator pass buildEvaluatorRegistry() — completeness 1-1 đúng", () => {
      expect(() => buildEvaluatorRegistry(PRODUCTION_RULE_REGISTRY, [R_NHATTHAN_01_EVALUATOR_REGISTRATION])).not.toThrow();
      expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.size).toBe(1);
      expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.has("R-NHATTHAN-01")).toBe(true);
    });

    it("ruleId của RuleDefinition và EvaluatorRegistration khớp nhau", () => {
      expect(R_NHATTHAN_01_EVALUATOR_REGISTRATION.ruleId).toBe(R_NHATTHAN_01.ruleId);
    });

    it("không có ruleId trùng lặp trong PRODUCTION_RULE_REGISTRY (chỉ 1 rule nên trivially đúng, xác nhận tường minh)", () => {
      const ids = PRODUCTION_RULE_REGISTRY.rules.map((r) => r.ruleId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("[C] Eligibility — Level 1 gating + selection deterministic", () => {
    it("questionTypeAllowsRules cho cả READY lẫn PARTIAL đều true — rule universal áp dụng mọi loại hợp lệ", () => {
      expect(questionTypeAllowsRules("hon-nhan")).toBe(true); // READY
      expect(questionTypeAllowsRules("kien-tung")).toBe(true); // PARTIAL
    });

    it("selectEligibleRules trả về R-NHATTHAN-01 cho MỌI question_type hợp lệ (rule không khai báo questionTypes = universal)", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01"]);
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "kien-tung").map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01"]);
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "quan-chuc").map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01"]);
    });

    it("selectEligibleRules trả về RỖNG cho question_type UNVERIFIED — Level 1 vẫn chặn dù rule là universal", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "su-nghiep")).toEqual([]);
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "tinh-cam")).toEqual([]);
    });

    it("getRuleById tra đúng rule, deterministic qua nhiều lần gọi", () => {
      const first = getRuleById(PRODUCTION_RULE_REGISTRY, "R-NHATTHAN-01");
      const second = getRuleById(PRODUCTION_RULE_REGISTRY, "R-NHATTHAN-01");
      expect(first).toEqual(second);
      expect(first?.ruleId).toBe("R-NHATTHAN-01");
    });
  });

  describe("[D] Evaluator — cả 2 nhánh (triggered/tương hoà), không đọc field cấm", () => {
    it("trục KHÔNG tương hoà (cả 2 trục): TRIGGERED, đúng 2 signal, đúng subject/object/relation/polarity (golden 2024-01-04 10:00, cả 2 trục AUSPICIOUS)", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      const result = evaluateNhatThan01(calculation);
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(2);
      expect(result.signals[0]).toMatchObject({ subject: "日上神", object: "日干", relation: "sheng", polarity: "auspicious" });
      expect(result.signals[1]).toMatchObject({ subject: "辰上神", object: "日辰", relation: "sheng", polarity: "auspicious" });
    });

    it("cả 2 trục INAUSPICIOUS (upper khắc day cả 2 trục, golden 2024-01-08 10:00)", () => {
      const calculation = realCalculation("2024-01-08", 10, 0);
      const result = evaluateNhatThan01(calculation);
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(2);
      expect(result.signals[0]).toMatchObject({ subject: "日上神", object: "日干", relation: "ke", polarity: "inauspicious" });
      expect(result.signals[1]).toMatchObject({ subject: "辰上神", object: "日辰", relation: "ke", polarity: "inauspicious" });
    });

    it("trục Can TƯƠNG HOÀ (cùng Ngũ Hành) → CHỈ 1 signal (trục Chi), không tự suy ra polarity cho trục tương hoà (golden 2024-01-05 10:00)", () => {
      const calculation = realCalculation("2024-01-05", 10, 0);
      const result = evaluateNhatThan01(calculation);
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({ subject: "日辰", object: "辰上神", relation: "ke", polarity: "inauspicious" });
    });

    it("cả 2 hướng sheng đều xuất hiện đúng polarity: upper sinh day = auspicious, day sinh upper = inauspicious (golden 2024-01-02 10:00)", () => {
      const calculation = realCalculation("2024-01-02", 10, 0);
      const result = evaluateNhatThan01(calculation);
      expect(result.signals[0]).toMatchObject({ subject: "日上神", object: "日干", relation: "sheng", polarity: "auspicious" });
      expect(result.signals[1]).toMatchObject({ subject: "日辰", object: "辰上神", relation: "sheng", polarity: "inauspicious" });
    });

    it("cả 2 hướng ke đều inauspicious dù chiều khác nhau: upper khắc day VÀ day khắc upper (golden 2024-01-01 10:00)", () => {
      const calculation = realCalculation("2024-01-01", 10, 0);
      const result = evaluateNhatThan01(calculation);
      expect(result.signals[0]).toMatchObject({ subject: "日干", object: "日上神", relation: "ke", polarity: "inauspicious" });
      expect(result.signals[1]).toMatchObject({ subject: "辰上神", object: "日辰", relation: "sheng", polarity: "auspicious" });
    });

    it("mọi signal có đủ field bắt buộc: ruleId/signalId/category/triggered/layer/ruleConfidence/calculationConfidence/provenanceId", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      const result = evaluateNhatThan01(calculation);
      for (const signal of result.signals) {
        expect(signal.ruleId).toBe("R-NHATTHAN-01");
        expect(signal.signalId).toMatch(/^R-NHATTHAN-01-\d$/);
        expect(signal.category).toBe("四課");
        expect(signal.triggered).toBe(true);
        expect(signal.layer).toBe("core");
        expect(signal.ruleConfidence).toBe("A");
        expect(["A", "B", "C", "D"]).toContain(signal.calculationConfidence);
        expect(signal.provenanceId).toBe("PROV-NHATTHAN-01");
      }
    });

    it("evaluator KHÔNG mutate calculation đầu vào (pure)", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      const snapshot = structuredClone(calculation);
      evaluateNhatThan01(calculation);
      expect(calculation).toEqual(snapshot);
    });

    it("gọi 2 lần cùng calculation cho kết quả HỆT NHAU (deterministic)", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      const first = evaluateNhatThan01(calculation);
      const second = evaluateNhatThan01(calculation);
      expect(second).toEqual(first);
    });
  });

  describe("[E] Confidence — Model C, non-Zi-hour vs Zi-hour, calculationProvenanceIds", () => {
    it("ruleConfidence LUÔN 'A' bất kể chart nào (bằng chứng cổ điển của rule không đổi theo chart)", () => {
      expect(evaluateNhatThan01(realCalculation("2024-01-04", 10, 0)).ruleConfidence).toBe("A");
      expect(evaluateNhatThan01(realCalculation("2024-01-01", 0, 30)).ruleConfidence).toBe("A");
    });

    it("chart KHÔNG rơi vào vùng Tý (hourChi≠Tý) → calculationConfidence='B' (fourLessons=A, base GanZhi=B, worst=B — KHÔNG kèm Zi-hour provenance)", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      expect(calculation.calendar.hourPillar.chi).not.toBe("Tý");
      const result = evaluateNhatThan01(calculation);
      expect(result.calculationConfidence).toBe("B");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual(["PROV-FOUR-LESSONS-CONSTRUCTION", "PROV-GANZHI-PILLAR-CONSTRUCTION"]);
    });

    it("chart RƠI VÀO vùng Tý (hourChi=Tý) → calculationConfidence='D' (kèm PROV-PROFILE-ZIHOUR-CONFLICTING, D chi phối worst-of) — golden 2024-01-01 00:30", () => {
      const calculation = realCalculation("2024-01-01", 0, 30);
      expect(calculation.calendar.hourPillar.chi).toBe("Tý");
      const result = evaluateNhatThan01(calculation);
      expect(result.calculationConfidence).toBe("D");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual([
        "PROV-FOUR-LESSONS-CONSTRUCTION",
        "PROV-GANZHI-PILLAR-CONSTRUCTION",
        "PROV-PROFILE-ZIHOUR-CONFLICTING",
      ]);
    });

    it("calculationProvenanceIds GIỐNG NHAU cho mọi signal trong CÙNG 1 evaluate() call (cùng dayPillar/fourLessons) — deterministic", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      const result = evaluateNhatThan01(calculation);
      expect(result.signals[0]!.calculationProvenanceIds).toEqual(result.signals[1]!.calculationProvenanceIds);
    });

    it("calculationConfidence KHÔNG BAO GIỜ được hard-code 'A' — luôn phản ánh worst-of thực tế từ resolver (không có chart nào trong bộ test này cho A, vì base GanZhi tự nó đã là B)", () => {
      const results = [
        evaluateNhatThan01(realCalculation("2024-01-01", 10, 0)),
        evaluateNhatThan01(realCalculation("2024-01-04", 10, 0)),
        evaluateNhatThan01(realCalculation("2024-01-01", 0, 30)),
      ];
      for (const r of results) {
        expect(r.calculationConfidence).not.toBe("A");
      }
    });
  });

  describe("[F] Golden chart — chạy qua facade thật, qua registry/evaluator infrastructure thật (end-to-end, không bypass registry)", () => {
    it("golden 2024-01-01 00:30 Asia/Shanghai: facade thật → registry thật → eligibility thật → runEvaluator thật → đúng RuleResult đã biết", () => {
      const calculationResult = calculateDaLiuRenChart({ date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
      expect(calculationResult.ok).toBe(true);
      const calculation = calculationResult.data!;

      const eligible = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan");
      expect(eligible.map((r) => r.ruleId)).toContain("R-NHATTHAN-01");
      const rule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-NHATTHAN-01")!;

      const ruleResult = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule, calculation);
      expect(ruleResult.status).toBe("triggered");
      expect(ruleResult.signals).toHaveLength(1);
      expect(ruleResult.signals[0]).toMatchObject({
        subject: "辰上神",
        object: "日辰",
        relation: "ke",
        polarity: "inauspicious",
        ruleConfidence: "A",
        calculationConfidence: "D",
      });
    });

    it("không bypass registry: chỉ dùng runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, ...) trên rule THẬT lấy từ PRODUCTION_RULE_REGISTRY, KHÔNG gọi evaluateNhatThan01 trực tiếp trong bài test này", () => {
      const calculation = realCalculation("2024-01-04", 10, 0);
      const rule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-NHATTHAN-01")!;
      const viaRegistry = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule, calculation);
      expect(viaRegistry.signals).toHaveLength(2);
    });
  });
});
