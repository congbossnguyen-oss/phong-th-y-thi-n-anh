import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { R_HONNHAN_01 } from "../../../src/rules/r-honnhan-01/rule.js";
import { HONNHAN_01_PROVENANCE } from "../../../src/rules/r-honnhan-01/provenance.js";
import { evaluateHonNhan01, R_HONNHAN_01_EVALUATOR_REGISTRATION } from "../../../src/rules/r-honnhan-01/evaluator.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY } from "../../../src/rules/registry.js";
import { getRuleById, selectEligibleRules } from "../../../src/validation/rule-registry.js";
import { runEvaluator } from "../../../src/validation/evaluator-registry.js";
import type { DaLiuRenCalculationResult } from "../../../src/da-liu-ren-calculation-result.js";

/** Dựng DaLiuRenCalculationResult THẬT qua facade — KHÔNG bịa shape (đúng convention r-nhatthan-01.test.ts). */
function realCalculation(date: string, hour: number, minute: number): DaLiuRenCalculationResult {
  const result = calculateDaLiuRenChart({ date, hour, minute, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error(`test setup lỗi: ${date} ${hour}:${minute} phải tính thành công`);
  return result.data;
}

// Golden charts xác nhận qua calculateDaLiuRenChart thật (Asia/Shanghai):
// - 2024-05-10 14:00: Giáp/Tuất — canGeneral=liuHe(六合), chiGeneral=tianHou(天后) → CẢ 2 trục,
//   hourChi=Mùi (KHÔNG Zi-hour).
// - 2024-01-01 10:00: Giáp/Tý — canGeneral=liuHe, chiGeneral=qingLong → CHỈ trục Can.
// - 2024-05-01 22:00: Ất/Sửu — canGeneral=zhuQue, chiGeneral=tianHou → CHỈ trục Chi.
// - 2024-01-01 14:00: Giáp/Tý — canGeneral=qingLong, chiGeneral=baiHu → KHÔNG trục nào.
// - 2024-03-05 23:00 (Correction Plan): trục Can trigger (canGeneral=liuHe), hourChi=Tý (Zi-hour)
//   — dùng để khoá regression calculationConfidence='D' khi rơi vùng Tý (mục [E]).

describe("daliuren-engine/rules/r-honnhan-01", () => {
  describe("[A] RuleDefinition — đúng paper contract Phase 11-B mục B", () => {
    it("ruleId, layer, topic, confidence, questionTypes đúng chính xác", () => {
      expect(R_HONNHAN_01.ruleId).toBe("R-HONNHAN-01");
      expect(R_HONNHAN_01.layer).toBe("core");
      expect(R_HONNHAN_01.topic).toBe("十二天將");
      expect(R_HONNHAN_01.confidence).toBe("A");
      expect(R_HONNHAN_01.questionTypes).toEqual(["hon-nhan"]);
    });

    it("provenanceId trỏ đúng entry 畢法賦 pháp 40, confidence A", () => {
      expect(R_HONNHAN_01.provenanceId).toBe(HONNHAN_01_PROVENANCE.id);
      expect(HONNHAN_01_PROVENANCE.confidence).toBe("A");
      expect(HONNHAN_01_PROVENANCE.sourceTitle).toContain("六壬大全");
      expect(HONNHAN_01_PROVENANCE.sourceType).toBe("classical-fact");
    });

    it("dependencies ĐÚNG 2 field (calendar.dayPillar, twelveGenerals) — KHÔNG unimplemented/externalContext", () => {
      expect(R_HONNHAN_01.dependencies.calculationFields).toEqual(["calendar.dayPillar", "twelveGenerals"]);
      expect(R_HONNHAN_01.dependencies.unimplementedComponents ?? []).toEqual([]);
      expect(R_HONNHAN_01.dependencies.externalContext ?? []).toEqual([]);
    });
  });

  describe("[B] Registry — real rule/evaluator đã đăng ký trong PRODUCTION_*", () => {
    it("PRODUCTION_RULE_REGISTRY chứa R-HONNHAN-01", () => {
      expect(PRODUCTION_RULE_REGISTRY.rules.map((r) => r.ruleId)).toContain("R-HONNHAN-01");
    });

    it("PRODUCTION_EVALUATOR_REGISTRY có evaluator cho R-HONNHAN-01, ruleId khớp EvaluatorRegistration", () => {
      expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.has("R-HONNHAN-01")).toBe(true);
      expect(R_HONNHAN_01_EVALUATOR_REGISTRATION.ruleId).toBe(R_HONNHAN_01.ruleId);
    });
  });

  describe("[C] Eligibility — QuestionType gate", () => {
    it("selectEligibleRules trả về R-HONNHAN-01 cho 'hon-nhan'", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId)).toContain("R-HONNHAN-01");
    });

    it("selectEligibleRules KHÔNG trả về R-HONNHAN-01 cho question_type KHÁC (vd 'tim-do', 'kien-tung')", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "tim-do").map((r) => r.ruleId)).not.toContain("R-HONNHAN-01");
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "kien-tung").map((r) => r.ruleId)).not.toContain("R-HONNHAN-01");
    });

    it("selectEligibleRules trả về RỖNG cho question_type UNVERIFIED — Level 1 chặn dù rule đã khai báo questionTypes hợp lệ", () => {
      const eligible = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "su-nghiep");
      expect(eligible.map((r) => r.ruleId)).not.toContain("R-HONNHAN-01");
    });
  });

  describe("[D] Evaluator — positive/negative/no-signal/edge, không đọc field cấm", () => {
    it("CẢ 2 trục trigger (golden 2024-05-10 14:00) → 2 signal, đúng subject/object/relation/polarity", () => {
      const result = evaluateHonNhan01(realCalculation("2024-05-10", 14, 0));
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(2);
      expect(result.signals[0]).toMatchObject({ subject: "日干", object: "六合", relation: "presence", polarity: "auspicious", descriptionKey: "honnhan.can_axis.liuHe" });
      expect(result.signals[1]).toMatchObject({ subject: "日辰", object: "天后", relation: "presence", polarity: "auspicious", descriptionKey: "honnhan.chi_axis.tianHou" });
    });

    it("CHỈ trục Can trigger (golden 2024-01-01 10:00) → 1 signal, signalId index 0", () => {
      const result = evaluateHonNhan01(realCalculation("2024-01-01", 10, 0));
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({ signalId: "R-HONNHAN-01-0", subject: "日干", object: "六合" });
    });

    it("CHỈ trục Chi trigger (golden 2024-05-01 22:00) → 1 signal, signalId index 1 (giữ nguyên vị trí trục, không dồn lại)", () => {
      const result = evaluateHonNhan01(realCalculation("2024-05-01", 22, 0));
      expect(result.status).toBe("triggered");
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({ signalId: "R-HONNHAN-01-1", subject: "日辰", object: "天后" });
    });

    it("KHÔNG trục nào trigger (golden 2024-01-01 14:00, qingLong/baiHu) → not-triggered, signals=[]", () => {
      const result = evaluateHonNhan01(realCalculation("2024-01-01", 14, 0));
      expect(result.status).toBe("not-triggered");
      expect(result.signals).toEqual([]);
    });

    it("mọi signal có đủ field bắt buộc", () => {
      const result = evaluateHonNhan01(realCalculation("2024-05-10", 14, 0));
      for (const signal of result.signals) {
        expect(signal.ruleId).toBe("R-HONNHAN-01");
        expect(signal.signalId).toMatch(/^R-HONNHAN-01-\d$/);
        expect(signal.category).toBe("十二天將");
        expect(signal.triggered).toBe(true);
        expect(signal.layer).toBe("core");
        expect(signal.ruleConfidence).toBe("A");
        expect(["A", "B", "C", "D"]).toContain(signal.calculationConfidence);
        expect(signal.provenanceId).toBe("PROV-HONNHAN-01");
      }
    });

    it("evaluator KHÔNG mutate calculation đầu vào (pure)", () => {
      const calculation = realCalculation("2024-05-10", 14, 0);
      const snapshot = structuredClone(calculation);
      evaluateHonNhan01(calculation);
      expect(calculation).toEqual(snapshot);
    });

    it("gọi 2 lần cùng calculation cho kết quả HỆT NHAU (deterministic)", () => {
      const calculation = realCalculation("2024-05-10", 14, 0);
      expect(evaluateHonNhan01(calculation)).toEqual(evaluateHonNhan01(calculation));
    });
  });

  describe("[E] Confidence — Model C, worst-of thực tế (KHÔNG hard-code)", () => {
    it("ruleConfidence LUÔN 'A' bất kể chart nào", () => {
      expect(evaluateHonNhan01(realCalculation("2024-05-10", 14, 0)).ruleConfidence).toBe("A");
      expect(evaluateHonNhan01(realCalculation("2024-01-01", 14, 0)).ruleConfidence).toBe("A");
    });

    // SỬA Correction Plan mục 5/7.1: FOUR_LESSONS_PROVENANCE bị GỠ (rule không đọc fourLessons),
    // thay bằng GANZHI_PILLAR_CONSTRUCTION_PROVENANCE (rule đọc calendar.dayPillar là giá trị
    // thật) — giá trị "B" KHÔNG đổi (Direction=B vẫn chi phối worst-of), chỉ THÀNH PHẦN đổi.
    it("normal hour (golden 2024-05-10 14:00, hourChi≠Tý): calculationConfidence='B' (worst-of GANZHI=B/ORDER=A/ANCHOR=A/DIRECTION=B), calculationProvenanceIds đúng 4 id VỚI PROV-GANZHI-PILLAR-CONSTRUCTION (KHÔNG còn PROV-FOUR-LESSONS-CONSTRUCTION)", () => {
      const calculation = realCalculation("2024-05-10", 14, 0);
      expect(calculation.calendar.hourPillar.chi).not.toBe("Tý");
      const result = evaluateHonNhan01(calculation);
      expect(result.status).toBe("triggered");
      expect(result.calculationConfidence).toBe("B");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual([
        "PROV-GANZHI-PILLAR-CONSTRUCTION",
        "PROV-TWELVE-GENERALS-ORDER",
        "PROV-TWELVE-GENERALS-ANCHOR",
        "PROV-TWELVE-GENERALS-DIRECTION",
      ]);
    });

    // MỚI (Correction Plan mục 3/10 test B) — chính xác kịch bản làm lộ P1 ở audit: chart rơi
    // vùng Tý PHẢI hạ calculationConfidence xuống 'D', giống hệt R-NHATTHAN-01, vì rule đọc
    // calendar.dayPillar là giá trị thật (không phải chỉ tra bảng tĩnh).
    it("Zi-hour (golden 2024-03-05 23:00, hourChi=Tý): TRIGGERED, calculationConfidence='D' (kèm PROV-PROFILE-ZIHOUR-CONFLICTING, KHÔNG còn 'B' như trước khi sửa)", () => {
      const calculation = realCalculation("2024-03-05", 23, 0);
      expect(calculation.calendar.hourPillar.chi).toBe("Tý");
      const result = evaluateHonNhan01(calculation);
      expect(result.status).toBe("triggered");
      expect(result.calculationConfidence).toBe("D");
      expect(result.signals[0]!.calculationProvenanceIds).toEqual([
        "PROV-GANZHI-PILLAR-CONSTRUCTION",
        "PROV-PROFILE-ZIHOUR-CONFLICTING",
        "PROV-TWELVE-GENERALS-ORDER",
        "PROV-TWELVE-GENERALS-ANCHOR",
        "PROV-TWELVE-GENERALS-DIRECTION",
      ]);
    });

    it("calculationProvenanceIds GIỐNG NHAU cho mọi signal trong CÙNG 1 evaluate() call", () => {
      const result = evaluateHonNhan01(realCalculation("2024-05-10", 14, 0));
      expect(result.signals[0]!.calculationProvenanceIds).toEqual(result.signals[1]!.calculationProvenanceIds);
    });
  });

  describe("[F] Golden chart — qua registry/evaluator infrastructure thật (end-to-end, không bypass registry)", () => {
    it("golden 2024-05-10 14:00, questionType='hon-nhan': facade thật → registry thật → eligibility thật → runEvaluator thật", () => {
      const calculation = realCalculation("2024-05-10", 14, 0);
      const eligible = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan");
      expect(eligible.map((r) => r.ruleId)).toContain("R-HONNHAN-01");
      const rule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-HONNHAN-01")!;
      const ruleResult = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule, calculation);
      expect(ruleResult.status).toBe("triggered");
      expect(ruleResult.signals).toHaveLength(2);
    });
  });
});
