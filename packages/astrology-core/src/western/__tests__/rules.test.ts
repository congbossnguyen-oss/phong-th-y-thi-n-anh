import { describe, expect, it } from "vitest";

import type { Factor } from "../../factor/types.js";
import { evaluateRules } from "../../rule/engine.js";
import { loadRuleSet, validateRuleSet } from "../../rule/validate.js";
import { WESTERN_RULES_V1, WESTERN_RULES_VERSION } from "../rules.js";

// Synthetic factor builder — chỉ cần id để test presence (engine bỏ qua strength).
function factor(id: string): Factor {
  return {
    id,
    chartId: "chart-1",
    school: "western",
    category: "placement",
    inputs: [],
    strength: 0,
    computedAt: new Date("2026-01-01T00:00:00.000Z"),
    version: "western.factors.v1",
  };
}

function evalOne(ruleId: string, factors: Factor[]) {
  return evaluateRules(factors, WESTERN_RULES_V1).find((e) => e.ruleId === ruleId);
}

describe("WESTERN_RULES_V1 — RuleSet structure & validation (E, F)", () => {
  it("load qua validator sạch (loadRuleSet ok)", () => {
    expect(validateRuleSet(WESTERN_RULES_V1)).toEqual([]);
    const loaded = loadRuleSet(WESTERN_RULES_V1);
    expect(loaded.ok).toBe(true);
  });

  it("đúng 3 rule, đúng ID, school=western, version=western.rules.v1, source_type=geometric_rule", () => {
    expect(WESTERN_RULES_V1.school).toBe("western");
    expect(WESTERN_RULES_V1.version).toBe("western.rules.v1");
    expect(WESTERN_RULES_VERSION).toBe("western.rules.v1");
    expect(WESTERN_RULES_V1.rules.map((r) => r.id)).toEqual([
      "WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT",
      "WESTERN.STRUCT.LUMINARIES_SAME_MODALITY",
      "WESTERN.STRUCT.LUMINARIES_IN_ASPECT",
    ]);
    for (const r of WESTERN_RULES_V1.rules) {
      expect(r.school).toBe("western");
      expect(r.rulesetVersion).toBe("western.rules.v1");
      expect(r.source?.sourceType).toBe("geometric_rule");
      expect(r.prerequisites).toEqual([]);
      expect(r.weighting).toBeUndefined();
    }
  });

  it("F. rule isolation — KHÔNG có rule lạ ngoài 3 rule đã duyệt", () => {
    expect(WESTERN_RULES_V1.rules).toHaveLength(3);
  });
});

describe("WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT (A)", () => {
  const ID = "WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT";
  it.each([
    ["fire"],
    ["earth"],
    ["air"],
    ["water"],
  ])("Sun %s + Moon %s → fired", (el) => {
    expect(evalOne(ID, [factor(`sun_element_${el}`), factor(`moon_element_${el}`)])?.fired).toBe(true);
  });

  it("Sun fire + Moon water → không fired", () => {
    expect(evalOne(ID, [factor("sun_element_fire"), factor("moon_element_water")])?.fired).toBe(false);
  });

  it("thiếu factor (chỉ có Sun) → không fired, strength 0", () => {
    const e = evalOne(ID, [factor("sun_element_fire")]);
    expect(e?.fired).toBe(false);
    expect(e?.strength).toBe(0);
  });

  it("D. trace: factorIdsUsed = đúng 2 element factor khớp", () => {
    expect(evalOne(ID, [factor("sun_element_air"), factor("moon_element_air")])?.factorIdsUsed).toEqual([
      "sun_element_air",
      "moon_element_air",
    ]);
  });
});

describe("WESTERN.STRUCT.LUMINARIES_SAME_MODALITY (B)", () => {
  const ID = "WESTERN.STRUCT.LUMINARIES_SAME_MODALITY";
  it.each([["cardinal"], ["fixed"], ["mutable"]])("Sun %s + Moon %s → fired", (m) => {
    expect(evalOne(ID, [factor(`sun_modality_${m}`), factor(`moon_modality_${m}`)])?.fired).toBe(true);
  });

  it("Sun cardinal + Moon fixed → không fired", () => {
    expect(evalOne(ID, [factor("sun_modality_cardinal"), factor("moon_modality_fixed")])?.fired).toBe(false);
  });

  it("thiếu factor → không fired", () => {
    expect(evalOne(ID, [factor("sun_modality_cardinal")])?.fired).toBe(false);
  });

  it("D. trace: factorIdsUsed = 2 modality factor khớp", () => {
    expect(evalOne(ID, [factor("sun_modality_fixed"), factor("moon_modality_fixed")])?.factorIdsUsed).toEqual([
      "sun_modality_fixed",
      "moon_modality_fixed",
    ]);
  });
});

describe("WESTERN.STRUCT.LUMINARIES_IN_ASPECT (C)", () => {
  const ID = "WESTERN.STRUCT.LUMINARIES_IN_ASPECT";
  it.each([["conjunction"], ["sextile"], ["square"], ["trine"], ["opposition"]])("aspect %s → fired", (t) => {
    expect(evalOne(ID, [factor(`aspect:sun-moon:${t}`)])?.fired).toBe(true);
  });

  it("không có aspect Sun-Moon → không fired", () => {
    expect(evalOne(ID, [factor("sun_element_fire"), factor("moon_element_fire")])?.fired).toBe(false);
  });

  it("D. trace: factorIdsUsed = đúng aspect factor khớp", () => {
    expect(evalOne(ID, [factor("aspect:sun-moon:trine")])?.factorIdsUsed).toEqual(["aspect:sun-moon:trine"]);
  });
});

describe("WESTERN_RULES_V1 — G. determinism", () => {
  it("cùng Factor[] ⇒ RuleEvaluation[] đồng nhất (chạy lặp)", () => {
    const factors = [factor("sun_element_fire"), factor("moon_element_fire"), factor("aspect:sun-moon:trine")];
    const a = evaluateRules(factors, WESTERN_RULES_V1);
    const b = evaluateRules(factors, WESTERN_RULES_V1);
    expect(a).toEqual(b);
    // 3 evaluations, sorted by ruleId
    expect(a.map((e) => e.ruleId)).toEqual([
      "WESTERN.STRUCT.LUMINARIES_IN_ASPECT",
      "WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT",
      "WESTERN.STRUCT.LUMINARIES_SAME_MODALITY",
    ]);
  });

  it("strength là boolean mirror (fired→1, not→0)", () => {
    const factors = [factor("sun_element_fire"), factor("moon_element_fire")];
    const el = evalOne("WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT", factors);
    const asp = evalOne("WESTERN.STRUCT.LUMINARIES_IN_ASPECT", factors);
    expect(el?.strength).toBe(1);
    expect(asp?.strength).toBe(0);
  });
});
