import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { R_KIENTUNG_02 } from "../../../src/rules/r-kientung-02/rule.js";
import { KIENTUNG_02_PROVENANCE } from "../../../src/rules/r-kientung-02/provenance.js";
import { evaluateKienTung02, R_KIENTUNG_02_EVALUATOR_REGISTRATION } from "../../../src/rules/r-kientung-02/evaluator.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY } from "../../../src/rules/registry.js";
import { getRuleById, selectEligibleRules } from "../../../src/validation/rule-registry.js";
import { runEvaluator } from "../../../src/validation/evaluator-registry.js";
import type { DaLiuRenCalculationResult } from "../../../src/da-liu-ren-calculation-result.js";

function realCalculation(date: string, hour: number, minute: number): DaLiuRenCalculationResult {
  const result = calculateDaLiuRenChart({ date, hour, minute, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error(`test setup lỗi: ${date} ${hour}:${minute} phải tính thành công`);
  return result.data;
}

// Golden charts xác nhận qua calculateDaLiuRenChart thật (Asia/Shanghai), Can Ngày=Ất/Giáp:
// - 2024-02-01 22:00: dayCan=Ất, lesson3=Thân(khắc Ất), lesson4=Dậu(khắc Ất) → CẢ 2 khóa là "鬼",
//   hourChi=Hợi (KHÔNG Zi-hour).
// - 2024-01-01 10:00: dayCan=Giáp, lesson3=Thân(khắc Giáp), lesson4=Thìn(KHÔNG khắc) → CHỈ Khóa 3.
// - 2024-02-01 10:00: dayCan=Ất, lesson3=Dần(KHÔNG khắc), lesson4=Dậu(khắc Ất) → CHỈ Khóa 4.
// - 2024-01-01 14:00: dayCan=Giáp, lesson3=Ngọ, lesson4=Tý → KHÔNG khóa nào khắc.
// - 2024-03-05 23:00 (Correction Plan): CẢ 2 khóa là "鬼" (TRIGGERED), hourChi=Tý (Zi-hour) —
//   dùng để khoá regression calculationConfidence='D' khi rơi vùng Tý (mục [E]).

describe("daliuren-engine/rules/r-kientung-02", () => {
  describe("[A] RuleDefinition — đúng paper contract Phase 11-B mục D1", () => {
    it("ruleId, layer, topic, confidence, questionTypes đúng chính xác", () => {
      expect(R_KIENTUNG_02.ruleId).toBe("R-KIENTUNG-02");
      expect(R_KIENTUNG_02.layer).toBe("secondary");
      expect(R_KIENTUNG_02.topic).toBe("四課");
      expect(R_KIENTUNG_02.confidence).toBe("A");
      expect(R_KIENTUNG_02.questionTypes).toEqual(["kien-tung"]);
    });

    it("provenanceId trỏ đúng entry 畢法賦 pháp 70, confidence A", () => {
      expect(R_KIENTUNG_02.provenanceId).toBe(KIENTUNG_02_PROVENANCE.id);
      expect(KIENTUNG_02_PROVENANCE.confidence).toBe("A");
      expect(KIENTUNG_02_PROVENANCE.quote).toBe("鬼临三四讼灾随");
      expect(KIENTUNG_02_PROVENANCE.sourceType).toBe("classical-fact");
    });

    it("dependencies ĐÚNG 3 field (fourLessons.lesson3, fourLessons.lesson4, calendar.dayPillar) — KHÔNG unimplemented/externalContext (KHÔNG phụ thuộc 12 Trường Sinh)", () => {
      expect(R_KIENTUNG_02.dependencies.calculationFields).toEqual(["fourLessons.lesson3", "fourLessons.lesson4", "calendar.dayPillar"]);
      expect(R_KIENTUNG_02.dependencies.unimplementedComponents ?? []).toEqual([]);
      expect(R_KIENTUNG_02.dependencies.externalContext ?? []).toEqual([]);
    });
  });

  describe("[B] Registry — real rule/evaluator đã đăng ký trong PRODUCTION_*", () => {
    it("PRODUCTION_RULE_REGISTRY chứa R-KIENTUNG-02", () => {
      expect(PRODUCTION_RULE_REGISTRY.rules.map((r) => r.ruleId)).toContain("R-KIENTUNG-02");
    });

    it("PRODUCTION_EVALUATOR_REGISTRY có evaluator cho R-KIENTUNG-02, ruleId khớp EvaluatorRegistration", () => {
      expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.has("R-KIENTUNG-02")).toBe(true);
      expect(R_KIENTUNG_02_EVALUATOR_REGISTRATION.ruleId).toBe(R_KIENTUNG_02.ruleId);
    });
  });

  describe("[C] Eligibility — QuestionType gate (PARTIAL vẫn được phép — Level 1)", () => {
    it("questionTypeAllowsRules('kien-tung') = true (PARTIAL ∈ {READY,PARTIAL})", async () => {
      const { questionTypeAllowsRules } = await import("../../../src/validation/rule-registry.js");
      expect(questionTypeAllowsRules("kien-tung")).toBe(true);
    });

    it("selectEligibleRules trả về R-KIENTUNG-02 cho 'kien-tung'", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "kien-tung").map((r) => r.ruleId)).toContain("R-KIENTUNG-02");
    });

    it("selectEligibleRules KHÔNG trả về R-KIENTUNG-02 cho question_type KHÁC", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId)).not.toContain("R-KIENTUNG-02");
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "tim-do").map((r) => r.ruleId)).not.toContain("R-KIENTUNG-02");
    });

    it("selectEligibleRules trả về RỖNG cho question_type UNVERIFIED", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "su-nghiep").map((r) => r.ruleId)).not.toContain("R-KIENTUNG-02");
    });
  });

  describe("[D] Evaluator — positive/negative/no-signal/edge, không đọc field cấm (KHÔNG mở rộng '鬼' ngoài Ngũ-Hành-khắc-Can)", () => {
    it("CẢ Khóa 3 lẫn Khóa 4 đều khắc Can (golden 2024-02-01 22:00) → TRIGGERED, đúng subject/object/relation/polarity", () => {
      const result = evaluateKienTung02(realCalculation("2024-02-01", 22, 0));
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({
        signalId: "R-KIENTUNG-02-0",
        subject: "三四課",
        object: "日干",
        relation: "ke",
        polarity: "inauspicious",
        descriptionKey: "kientung.lesson34_ke_can",
      });
    });

    it("CHỈ Khóa 3 khắc Can (golden 2024-01-01 10:00) → not-triggered (câu phú yêu cầu CẢ 3-4)", () => {
      const result = evaluateKienTung02(realCalculation("2024-01-01", 10, 0));
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
      expect(result.inputs).toMatchObject({ lesson3IsGhost: true, lesson4IsGhost: false });
    });

    it("CHỈ Khóa 4 khắc Can (golden 2024-02-01 10:00) → not-triggered", () => {
      const result = evaluateKienTung02(realCalculation("2024-02-01", 10, 0));
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
      expect(result.inputs).toMatchObject({ lesson3IsGhost: false, lesson4IsGhost: true });
    });

    it("KHÔNG khóa nào khắc Can (golden 2024-01-01 14:00) → not-triggered", () => {
      const result = evaluateKienTung02(realCalculation("2024-01-01", 14, 0));
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
    });

    it("mọi signal có đủ field bắt buộc", () => {
      const result = evaluateKienTung02(realCalculation("2024-02-01", 22, 0));
      for (const signal of result.signals) {
        expect(signal.ruleId).toBe("R-KIENTUNG-02");
        expect(signal.category).toBe("四課");
        expect(signal.triggered).toBe(true);
        expect(signal.layer).toBe("secondary");
        expect(signal.ruleConfidence).toBe("A");
        expect(signal.calculationConfidence).toBe("B"); // SỬA Correction Plan: worst-of(FOUR_LESSONS=A, GANZHI=B) = B, không còn "A"
        expect(signal.provenanceId).toBe("PROV-KIENTUNG-02");
      }
    });

    it("evaluator KHÔNG mutate calculation đầu vào (pure)", () => {
      const calculation = realCalculation("2024-02-01", 22, 0);
      const snapshot = structuredClone(calculation);
      evaluateKienTung02(calculation);
      expect(calculation).toEqual(snapshot);
    });

    it("gọi 2 lần cùng calculation cho kết quả HỆT NHAU (deterministic)", () => {
      const calculation = realCalculation("2024-02-01", 22, 0);
      expect(evaluateKienTung02(calculation)).toEqual(evaluateKienTung02(calculation));
    });
  });

  // SỬA Correction Plan (P1 gốc audit): rule NÀY VẪN đọc calendar.dayPillar.can (giá trị thật, để
  // tra Ngũ Hành Can Ngày) — "không đọc calendar.hourPillar trực tiếp" KHÔNG miễn trừ dependency
  // GanZhi-construction/Zi-hour, vì độ bất định nằm ở phép DỰNG dayPillar, không nằm ở việc đọc
  // hourPillar. calculationConfidence PHẢI = worst-of(FOUR_LESSONS_PROVENANCE, dayPillarProvenance)
  // — ĐÚNG cơ chế R-NHATTHAN-01, không hard-code.
  describe("[E] Confidence — Model C, calculationConfidence = worst-of(fourLessons, calendar.dayPillar) — ĐÚNG cơ chế R-NHATTHAN-01, KHÔNG hard-code", () => {
    it("normal hour (golden 2024-02-01 22:00, hourChi≠Tý): ruleConfidence='A', calculationConfidence='B' (worst-of FOUR_LESSONS=A/GANZHI=B), calculationProvenanceIds ĐÚNG 2 id", () => {
      const calculation = realCalculation("2024-02-01", 22, 0);
      expect(calculation.calendar.hourPillar.chi).not.toBe("Tý");
      const result = evaluateKienTung02(calculation);
      expect(result.status).toBe("triggered");
      expect(result.ruleConfidence).toBe("A");
      expect(result.calculationConfidence).toBe("B");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual(["PROV-FOUR-LESSONS-CONSTRUCTION", "PROV-GANZHI-PILLAR-CONSTRUCTION"]);
    });

    // MỚI (Correction Plan mục 3/10 test D) — chart Zi-hour KHÔNG trigger D1 (RuleResult-level
    // calculationConfidence vẫn LUÔN được tính, bất kể có signal hay không — xem R-NHATTHAN-01
    // cùng quy ước).
    it("Zi-hour, KHÔNG trigger (golden 2024-01-01 00:30, hourChi=Tý): calculationConfidence='D' (SỬA từ 'A' sai trước Correction Plan)", () => {
      const calculation = realCalculation("2024-01-01", 0, 30);
      expect(calculation.calendar.hourPillar.chi).toBe("Tý");
      const result = evaluateKienTung02(calculation);
      expect(result.calculationConfidence).toBe("D");
    });

    // MỚI (Correction Plan mục 3/10 test D) — chart Zi-hour CÓ trigger, khoá regression đúng
    // kịch bản audit đã phát hiện (2024-03-05 23:00).
    it("Zi-hour, TRIGGERED (golden 2024-03-05 23:00, hourChi=Tý): calculationConfidence='D', calculationProvenanceIds kèm PROV-PROFILE-ZIHOUR-CONFLICTING", () => {
      const calculation = realCalculation("2024-03-05", 23, 0);
      expect(calculation.calendar.hourPillar.chi).toBe("Tý");
      const result = evaluateKienTung02(calculation);
      expect(result.status).toBe("triggered");
      expect(result.calculationConfidence).toBe("D");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual([
        "PROV-FOUR-LESSONS-CONSTRUCTION",
        "PROV-GANZHI-PILLAR-CONSTRUCTION",
        "PROV-PROFILE-ZIHOUR-CONFLICTING",
      ]);
    });
  });

  describe("[F] Golden chart — qua registry/evaluator infrastructure thật (end-to-end, không bypass registry)", () => {
    it("golden 2024-02-01 22:00, questionType='kien-tung': facade thật → registry thật → eligibility thật → runEvaluator thật", () => {
      const calculation = realCalculation("2024-02-01", 22, 0);
      const eligible = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "kien-tung");
      expect(eligible.map((r) => r.ruleId)).toContain("R-KIENTUNG-02");
      const rule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-KIENTUNG-02")!;
      const ruleResult = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule, calculation);
      expect(ruleResult.status).toBe("triggered");
      expect(ruleResult.signals).toHaveLength(1);
    });
  });
});
