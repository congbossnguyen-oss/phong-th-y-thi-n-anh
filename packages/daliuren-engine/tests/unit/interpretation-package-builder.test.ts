import { describe, expect, it } from "vitest";
import { calculateDaLiuRenChart } from "../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../src/profiles/classical-v1.js";
import { buildInterpretationPackage } from "../../src/interpretation-package-builder.js";
import { validateInterpretationPackage } from "../../src/validation/interpretation-package.js";
import { PRODUCTION_RULE_REGISTRY, PRODUCTION_EVALUATOR_REGISTRY, PRODUCTION_RULE_PROVENANCE } from "../../src/rules/registry.js";
import { buildRuleRegistry } from "../../src/validation/rule-registry.js";
import { buildEvaluatorRegistry } from "../../src/validation/evaluator-registry.js";
import type { DaLiuRenCalculationResult } from "../../src/da-liu-ren-calculation-result.js";
import type { EngineMeta } from "@thien-anh/engine-contract";

const CHART_INPUT = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" } as const;

function realCalculation(): { calculation: DaLiuRenCalculationResult; engineMeta: EngineMeta } {
  const result = calculateDaLiuRenChart(CHART_INPUT, CLASSICAL_V1_PROFILE);
  if (!result.ok || !result.data) throw new Error("test setup lỗi: golden date phải tính thành công");
  return { calculation: result.data, engineMeta: result.meta };
}

describe("daliuren-engine/interpretation-package-builder", () => {
  it("dựng package hợp lệ cho golden chart 2024-01-01 00:30 — pass validateInterpretationPackage", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({
      calculation,
      chartIdentity: CHART_INPUT,
      profile: CLASSICAL_V1_PROFILE,
      engineMeta,
      questionType: "hon-nhan",
    });
    expect(() => validateInterpretationPackage(pkg)).not.toThrow();
  });

  it("conflicts LUÔN [] — Phase 10.6.4B Option A, không phải thiếu sót", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(pkg.conflicts).toEqual([]);
  });

  it("unresolved_items LUÔN [] ở v1 — Phase 10.5 Audit #3", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(pkg.unresolved_items).toEqual([]);
  });

  it("questionType hợp lệ (hon-nhan, READY) → R-NHATTHAN-01 nằm trong verified_rules, signal khớp evaluator thật", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(pkg.verified_rules).toEqual([{ ruleId: "R-NHATTHAN-01", triggered: true }]);
    expect(pkg.signals).toHaveLength(1);
    expect(pkg.signals[0]).toMatchObject({
      ruleId: "R-NHATTHAN-01",
      subject: "辰上神",
      object: "日辰",
      relation: "ke",
      polarity: "inauspicious",
      ruleConfidence: "A",
      calculationConfidence: "D",
    });
  });

  it("questionType UNVERIFIED (su-nghiep) → Level 1 chặn, verified_rules/signals rỗng, confidence_summary.overallLowestConfidence=null, KHÔNG unresolved_item nào được bịa ra", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "su-nghiep" });
    expect(pkg.verified_rules).toEqual([]);
    expect(pkg.signals).toEqual([]);
    expect(pkg.unresolved_items).toEqual([]);
    expect(pkg.confidence_summary.overallLowestConfidence).toBeNull();
    expect(() => validateInterpretationPackage(pkg)).not.toThrow();
  });

  it("chart_reference.chartId khớp buildChartId — deterministic, đúng theo input/profile", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg1 = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    const pkg2 = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(pkg1.chart_reference.chartId).toBe(pkg2.chart_reference.chartId);
    expect(pkg1.chart_reference.chartId.startsWith("sha256:")).toBe(true);
  });

  it("chart_reference.{engineVersion,coreCalendarVersion,calculatedAt} lấy đúng từ EngineMeta thật của facade", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(pkg.chart_reference.engineVersion).toBe(engineMeta.engineVersion);
    expect(pkg.chart_reference.coreCalendarVersion).toBe(engineMeta.coreCalendarVersion);
    expect(pkg.chart_reference.calculatedAt).toBe(engineMeta.calculatedAt);
  });

  it("provenance map CHỈ chứa các id THỰC SỰ được signal tham chiếu — không dư thừa toàn bộ PRODUCTION_CALCULATION_PROVENANCE", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    const referenced = new Set<string>();
    for (const s of pkg.signals) {
      referenced.add(s.provenanceId);
      for (const id of s.calculationProvenanceIds ?? []) referenced.add(id);
    }
    expect(Object.keys(pkg.provenance).sort()).toEqual([...referenced].sort());
  });

  it("KHÔNG mutate calculation đầu vào (pure)", () => {
    const { calculation, engineMeta } = realCalculation();
    const snapshot = structuredClone(calculation);
    buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(calculation).toEqual(snapshot);
  });

  it("gọi 2 lần cùng input cho package HỆT NHAU (deterministic, trừ field không tất định vốn đã copy nguyên từ EngineMeta)", () => {
    const { calculation, engineMeta } = realCalculation();
    const first = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    const second = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(second).toEqual(first);
  });

  it("ném lỗi rõ ràng nếu provenanceById KHÔNG đủ cho id mà signal tham chiếu (không âm thầm bỏ qua)", () => {
    const { calculation, engineMeta } = realCalculation();
    expect(() =>
      buildInterpretationPackage({
        calculation,
        chartIdentity: CHART_INPUT,
        profile: CLASSICAL_V1_PROFILE,
        engineMeta,
        questionType: "hon-nhan",
        provenanceById: {},
      }),
    ).toThrow(/thiếu ProvenanceEntry/);
  });

  it("hỗ trợ registry/evaluatorRegistry injected riêng (không bắt buộc dùng PRODUCTION_*) — dùng lại chính production registry làm ví dụ tối giản", () => {
    const { calculation, engineMeta } = realCalculation();
    const registry = buildRuleRegistry(PRODUCTION_RULE_REGISTRY.rules, PRODUCTION_RULE_PROVENANCE);
    const evaluatorRegistry = buildEvaluatorRegistry(registry, [...PRODUCTION_EVALUATOR_REGISTRY.evaluatorByRuleId].map(([ruleId, evaluate]) => ({ ruleId, evaluate })));
    const pkg = buildInterpretationPackage({
      calculation,
      chartIdentity: CHART_INPUT,
      profile: CLASSICAL_V1_PROFILE,
      engineMeta,
      questionType: "hon-nhan",
      ruleRegistry: registry,
      evaluatorRegistry,
    });
    expect(pkg.verified_rules).toEqual([{ ruleId: "R-NHATTHAN-01", triggered: true }]);
  });

  it("forbidden_inferences luôn có mặt, bao gồm 'scoring' — không AI tự chấm điểm", () => {
    const { calculation, engineMeta } = realCalculation();
    const pkg = buildInterpretationPackage({ calculation, chartIdentity: CHART_INPUT, profile: CLASSICAL_V1_PROFILE, engineMeta, questionType: "hon-nhan" });
    expect(pkg.forbidden_inferences).toContain("scoring");
  });
});
