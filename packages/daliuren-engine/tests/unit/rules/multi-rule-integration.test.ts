/**
 * MULTI-RULE REGRESSION TEST — bắt buộc theo Phase 11-B contract (mục "MULTI-RULE PACKAGE
 * BUILDER"/"TEST PLAN"). Trước Phase 11-B, PRODUCTION_RULE_REGISTRY chỉ có 1 rule
 * (R-NHATTHAN-01) — đây là lần ĐẦU TIÊN có ≥2 rule THẬT cùng đăng ký, cùng đánh giá 1 chart, cùng
 * gộp vào 1 InterpretationPackage. Test file này CHỈ xác nhận hành vi N-rule (đã tổng quát sẵn
 * từ Phase 10.6.1-10.6.5) hoạt động đúng khi N thực sự > 1 — KHÔNG sửa bất kỳ logic builder nào.
 */
import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { buildInterpretationPackage } from "../../../src/interpretation-package-builder.js";
import { validateInterpretationPackage } from "../../../src/validation/interpretation-package.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY, PRODUCTION_RULE_PROVENANCE } from "../../../src/rules/registry.js";
import { getRuleById, selectEligibleRules } from "../../../src/validation/rule-registry.js";
import { runEvaluator } from "../../../src/validation/evaluator-registry.js";
import type { DaLiuRenCalculationResult } from "../../../src/da-liu-ren-calculation-result.js";
import type { EngineMeta } from "@thien-anh/engine-contract";

function realChart(date: string, hour: number, minute: number): { calculation: DaLiuRenCalculationResult; engineMeta: EngineMeta } {
  const result = calculateDaLiuRenChart({ date, hour, minute, timeZone: "Asia/Shanghai" }, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error(`test setup lỗi: ${date} ${hour}:${minute} phải tính thành công`);
  return { calculation: result.data, engineMeta: result.meta };
}

// Golden chart 2024-05-10 14:00 (Asia/Shanghai): xác nhận qua chạy thật CẢ R-NHATTHAN-01 (2
// signal, universal/core) LẪN R-HONNHAN-01 (2 signal, questionTypes=["hon-nhan"]) ĐỀU trigger —
// chart lý tưởng cho multi-rule regression test (đúng gợi ý trong contract: "1 ngày mà cả
// R-NHATTHAN-01 lẫn hon-nhan đều có signal").
const HONNHAN_CHART_INPUT = { date: "2024-05-10", hour: 14, minute: 0, timeZone: "Asia/Shanghai" } as const;

describe("daliuren-engine/rules/multi-rule-integration (Phase 11-B)", () => {
  describe("[1] Rule registry completeness — 4 rule production thật, không trùng ruleId", () => {
    it("PRODUCTION_RULE_REGISTRY chứa ĐỦ 4 rule đã duyệt Phase 11-B", () => {
      const ids = PRODUCTION_RULE_REGISTRY.rules.map((r) => r.ruleId);
      expect(ids).toEqual(["R-NHATTHAN-01", "R-HONNHAN-01", "R-TIMDO-01", "R-KIENTUNG-02"]);
      expect(new Set(ids).size).toBe(4);
    });

    it("mọi rule đều resolve được provenanceId trong PRODUCTION_RULE_PROVENANCE", () => {
      for (const rule of PRODUCTION_RULE_REGISTRY.rules) {
        expect(PRODUCTION_RULE_PROVENANCE[rule.provenanceId]).toBeDefined();
      }
    });
  });

  describe("[2] Evaluator registry completeness — 1-1 cho N=4 rule (logic tổng quát, không hard-code N=1)", () => {
    it("PRODUCTION_EVALUATOR_REGISTRY có ĐÚNG 4 evaluator, khớp 1-1 với PRODUCTION_RULE_REGISTRY", () => {
      expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.size).toBe(4);
      for (const rule of PRODUCTION_RULE_REGISTRY.rules) {
        expect(PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId.has(rule.ruleId)).toBe(true);
      }
    });
  });

  describe("[3] Deterministic rule selection — selectEligibleRules đúng cho từng questionType, giữ nguyên thứ tự khai báo", () => {
    it("'hon-nhan': [R-NHATTHAN-01, R-HONNHAN-01] (universal trước, chuyên biệt sau — đúng thứ tự đăng ký)", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01", "R-HONNHAN-01"]);
    });
    it("'tim-do': [R-NHATTHAN-01, R-TIMDO-01]", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "tim-do").map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01", "R-TIMDO-01"]);
    });
    it("'kien-tung': [R-NHATTHAN-01, R-KIENTUNG-02]", () => {
      expect(selectEligibleRules(PRODUCTION_RULE_REGISTRY, "kien-tung").map((r) => r.ruleId)).toEqual(["R-NHATTHAN-01", "R-KIENTUNG-02"]);
    });
    it("gọi 2 lần liên tiếp cho CÙNG kết quả (deterministic, không phụ thuộc thứ tự gọi trước đó)", () => {
      const first = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId);
      const second = selectEligibleRules(PRODUCTION_RULE_REGISTRY, "hon-nhan").map((r) => r.ruleId);
      expect(second).toEqual(first);
    });
  });

  describe("[4] buildInterpretationPackage thật — questionType='hon-nhan', 2 rule CÙNG trigger trên 1 chart", () => {
    it("verified_rules liệt kê ĐỦ 2 rule, cả 2 triggered=true", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(pkg.verified_rules).toEqual([
        { ruleId: "R-NHATTHAN-01", triggered: true },
        { ruleId: "R-HONNHAN-01", triggered: true },
      ]);
    });

    it("signals gộp ĐÚNG 4 (2 R-NHATTHAN-01 + 2 R-HONNHAN-01), ĐÚNG THỨ TỰ (rule trước → sau, đúng thứ tự registry)", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(pkg.signals).toHaveLength(4);
      expect(pkg.signals.map((s) => s.ruleId)).toEqual(["R-NHATTHAN-01", "R-NHATTHAN-01", "R-HONNHAN-01", "R-HONNHAN-01"]);
    });

    it("KHÔNG có signalId trùng lặp giữa các rule khác nhau", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      const signalIds = pkg.signals.map((s) => s.signalId);
      expect(new Set(signalIds).size).toBe(signalIds.length);
    });

    it("unrelated rules KHÔNG làm thay đổi lẫn nhau: signal của R-NHATTHAN-01/R-HONNHAN-01 trong package multi-rule NÀY khớp Y HỆT kết quả evaluate() ĐỘC LẬP (isolated) của từng rule", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });

      const nhatThanRule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-NHATTHAN-01")!;
      const isolatedNhatThan = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, nhatThanRule, calculation);
      expect(pkg.signals.slice(0, 2)).toEqual(isolatedNhatThan.signals);

      const honNhanRule = getRuleById(PRODUCTION_RULE_REGISTRY, "R-HONNHAN-01")!;
      const isolatedHonNhan = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, honNhanRule, calculation);
      expect(pkg.signals.slice(2, 4)).toEqual(isolatedHonNhan.signals);
    });

    it("conflicts LUÔN [] (Option A, không đổi dù N rule > 1)", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(pkg.conflicts).toEqual([]);
    });

    it("provenance map gộp ĐÚNG, KHÔNG trùng lặp entry (FOUR_LESSONS_PROVENANCE dùng CHUNG bởi cả 2 rule → chỉ xuất hiện 1 lần)", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(Object.keys(pkg.provenance).sort()).toEqual(
        [
          "PROV-NHATTHAN-01",
          "PROV-HONNHAN-01",
          "PROV-FOUR-LESSONS-CONSTRUCTION",
          "PROV-GANZHI-PILLAR-CONSTRUCTION",
          "PROV-TWELVE-GENERALS-ORDER",
          "PROV-TWELVE-GENERALS-ANCHOR",
          "PROV-TWELVE-GENERALS-DIRECTION",
        ].sort(),
      );
    });

    it("overallLowestConfidence = worst-of TOÀN BỘ signal của MỌI rule (không phải riêng 1 rule)", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      // Cả 4 signal đều ruleConfidence=A; calculationConfidence=B (R-NHATTHAN-01: FOUR_LESSONS A + base
      // GanZhi B; R-HONNHAN-01: worst-of 4 provenance, Direction=B chi phối) — worst-of toàn bộ = B.
      expect(pkg.confidence_summary.overallLowestConfidence).toBe("B");
    });

    it("package pass validateInterpretationPackage (IP-1..IP-6) — không bypass validator", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    });

    it("gọi buildInterpretationPackage 2 lần cùng input → package HỆT NHAU (deterministic evaluator execution + signal ordering)", () => {
      const { calculation, engineMeta } = realChart(HONNHAN_CHART_INPUT.date, HONNHAN_CHART_INPUT.hour, HONNHAN_CHART_INPUT.minute);
      const first = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      const second = buildInterpretationPackage({ calculation, chartIdentity: HONNHAN_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(second).toEqual(first);
    });
  });

  describe("[5] questionType='tim-do' và 'kien-tung' — mỗi loại 2 rule cùng trigger (R-NHATTHAN-01 + rule chuyên biệt), khẳng định KHÔNG chỉ riêng hon-nhan mới đúng", () => {
    it("'tim-do', golden 2024-05-04 10:00: verified_rules=[R-NHATTHAN-01✓, R-TIMDO-01✓], signals=3 (2+1)", () => {
      const { calculation, engineMeta } = realChart("2024-05-04", 10, 0);
      const chartIdentity = { date: "2024-05-04", hour: 10, minute: 0, timeZone: "Asia/Shanghai" };
      const pkg = buildInterpretationPackage({ calculation, chartIdentity, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "tim-do" });
      expect(pkg.verified_rules).toEqual([
        { ruleId: "R-NHATTHAN-01", triggered: true },
        { ruleId: "R-TIMDO-01", triggered: true },
      ]);
      expect(pkg.signals).toHaveLength(3);
      expect(pkg.signals.map((s) => s.ruleId)).toEqual(["R-NHATTHAN-01", "R-NHATTHAN-01", "R-TIMDO-01"]);
      expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    });

    it("'kien-tung', golden 2024-02-01 22:00: verified_rules=[R-NHATTHAN-01✓, R-KIENTUNG-02✓], signals=3 (2+1)", () => {
      const { calculation, engineMeta } = realChart("2024-02-01", 22, 0);
      const chartIdentity = { date: "2024-02-01", hour: 22, minute: 0, timeZone: "Asia/Shanghai" };
      const pkg = buildInterpretationPackage({ calculation, chartIdentity, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "kien-tung" });
      expect(pkg.verified_rules).toEqual([
        { ruleId: "R-NHATTHAN-01", triggered: true },
        { ruleId: "R-KIENTUNG-02", triggered: true },
      ]);
      expect(pkg.signals).toHaveLength(3);
      expect(pkg.signals.map((s) => s.ruleId)).toEqual(["R-NHATTHAN-01", "R-NHATTHAN-01", "R-KIENTUNG-02"]);
      expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    });
  });

  describe("[6] R-NHATTHAN-01 REGRESSION — 4 golden case đóng băng (Phase 11-B contract mục riêng), chạy TRONG CÙNG registry 4-rule, KHÔNG dùng registry cô lập", () => {
    const rule = () => getRuleById(PRODUCTION_RULE_REGISTRY, "R-NHATTHAN-01")!;

    it("2024-01-01 00:30: 1 signal (chi_axis, 'ke', inauspicious), calculationConfidence=D", () => {
      const { calculation } = realChart("2024-01-01", 0, 30);
      const result = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule(), calculation);
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({ subject: "辰上神", object: "日辰", relation: "ke", polarity: "inauspicious" });
      expect(result.calculationConfidence).toBe("D");
    });

    it("2024-01-04 10:00: 2 signal (cả 2 'sheng', auspicious), calculationConfidence=B", () => {
      const { calculation } = realChart("2024-01-04", 10, 0);
      const result = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule(), calculation);
      expect(result.signals).toHaveLength(2);
      expect(result.signals[0]).toMatchObject({ relation: "sheng", polarity: "auspicious" });
      expect(result.signals[1]).toMatchObject({ relation: "sheng", polarity: "auspicious" });
      expect(result.calculationConfidence).toBe("B");
    });

    it("2024-01-01 10:00: 2 signal (can_axis 'ke' inauspicious, chi_axis 'sheng' auspicious), calculationConfidence=B", () => {
      const { calculation } = realChart("2024-01-01", 10, 0);
      const result = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule(), calculation);
      expect(result.signals).toHaveLength(2);
      expect(result.signals[0]).toMatchObject({ subject: "日干", object: "日上神", relation: "ke", polarity: "inauspicious" });
      expect(result.signals[1]).toMatchObject({ subject: "辰上神", object: "日辰", relation: "sheng", polarity: "auspicious" });
      expect(result.calculationConfidence).toBe("B");
    });

    it("2024-01-05 10:00: 1 signal (chi_axis 'ke' inauspicious — can_axis tương hoà, skip), calculationConfidence=B", () => {
      const { calculation } = realChart("2024-01-05", 10, 0);
      const result = runEvaluator(PRODUCTION_EVALUATOR_REGISTRY, rule(), calculation);
      expect(result.signals).toHaveLength(1);
      expect(result.signals[0]).toMatchObject({ subject: "日辰", object: "辰上神", relation: "ke", polarity: "inauspicious" });
      expect(result.calculationConfidence).toBe("B");
    });
  });

  // MỚI (Phase 11-B Correction Plan mục 5 test E / mục 10 #4,#8-9) — khoá regression cấp
  // InterpretationPackage cho ĐÚNG kịch bản audit độc lập đã phát hiện lỗi P1: 1 chart Zi-hour
  // (2024-03-05 23:00, hourChi=Tý) nơi CẢ R-NHATTHAN-01 LẪN rule chuyên biệt (R-HONNHAN-01 hoặc
  // R-KIENTUNG-02, tuỳ questionType) đều trigger — xác nhận overallLowestConfidence hạ đúng
  // xuống 'D' cho package thực sự bị ảnh hưởng bởi correction, KHÔNG chỉ ở tầng evaluator cô lập.
  describe("[7] Zi-hour cross-rule regression (Phase 11-B Correction Plan) — golden chart 2024-03-05 23:00", () => {
    const ZI_HOUR_CHART_INPUT = { date: "2024-03-05", hour: 23, minute: 0, timeZone: "Asia/Shanghai" } as const;

    it("questionType='hon-nhan': R-NHATTHAN-01 + R-HONNHAN-01 CÙNG trigger, overallLowestConfidence='D' (SỬA từ 'B' sai trước Correction Plan)", () => {
      const { calculation, engineMeta } = realChart(ZI_HOUR_CHART_INPUT.date, ZI_HOUR_CHART_INPUT.hour, ZI_HOUR_CHART_INPUT.minute);
      expect(calculation.calendar.hourPillar.chi).toBe("Tý");
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: ZI_HOUR_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(pkg.verified_rules).toEqual([
        { ruleId: "R-NHATTHAN-01", triggered: true },
        { ruleId: "R-HONNHAN-01", triggered: true },
      ]);
      for (const signal of pkg.signals) {
        expect(signal.calculationConfidence).toBe("D");
      }
      expect(pkg.confidence_summary.overallLowestConfidence).toBe("D");
      expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    });

    it("questionType='kien-tung': R-NHATTHAN-01 + R-KIENTUNG-02 CÙNG trigger, overallLowestConfidence='D' (SỬA từ 'A' sai trước Correction Plan)", () => {
      const { calculation, engineMeta } = realChart(ZI_HOUR_CHART_INPUT.date, ZI_HOUR_CHART_INPUT.hour, ZI_HOUR_CHART_INPUT.minute);
      expect(calculation.calendar.hourPillar.chi).toBe("Tý");
      const pkg = buildInterpretationPackage({ calculation, chartIdentity: ZI_HOUR_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "kien-tung" });
      expect(pkg.verified_rules).toEqual([
        { ruleId: "R-NHATTHAN-01", triggered: true },
        { ruleId: "R-KIENTUNG-02", triggered: true },
      ]);
      for (const signal of pkg.signals) {
        expect(signal.calculationConfidence).toBe("D");
      }
      expect(pkg.confidence_summary.overallLowestConfidence).toBe("D");
      expect(() => validateInterpretationPackage(pkg)).not.toThrow();
    });

    it("gọi 2 lần cùng input → package HỆT NHAU (deterministic, không đổi vì correction)", () => {
      const { calculation, engineMeta } = realChart(ZI_HOUR_CHART_INPUT.date, ZI_HOUR_CHART_INPUT.hour, ZI_HOUR_CHART_INPUT.minute);
      const first = buildInterpretationPackage({ calculation, chartIdentity: ZI_HOUR_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      const second = buildInterpretationPackage({ calculation, chartIdentity: ZI_HOUR_CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
      expect(second).toEqual(first);
    });
  });
});
