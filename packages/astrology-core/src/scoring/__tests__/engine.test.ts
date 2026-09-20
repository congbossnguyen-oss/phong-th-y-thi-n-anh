import { describe, expect, it } from "vitest";

import type { ConditionExpr, Rule, RuleEvaluation, RuleSet } from "../../rule/types.js";
import { WESTERN_RULES_V1 } from "../../western/rules.js";
import { evaluateRules } from "../../rule/engine.js";
import type { Factor } from "../../factor/types.js";
import { SCORING_ENGINE_VERSION } from "../types.js";
import { scoreDomains, scoringEngine } from "../engine.js";

const CTX = { chartId: "chart-1", computedAt: new Date("2026-01-01T00:00:00.000Z") };
const COND: ConditionExpr = { op: "factorPresent", pattern: "x" }; // không được scoring dùng; chỉ để Rule hợp lệ.

function rule(id: string, domain: string, weight: number): Rule {
  return { id, school: "test", version: "1.0.0", rulesetVersion: "test.v1", prerequisites: [], conditions: COND, weighting: { domain, weight } };
}
function ruleNoWeighting(id: string): Rule {
  return { id, school: "test", version: "1.0.0", rulesetVersion: "test.v1", prerequisites: [], conditions: COND };
}
function ruleset(rules: Rule[]): RuleSet {
  return { school: "test", version: "test.v1", rules };
}
function ev(ruleId: string, fired: boolean, strength = fired ? 1 : 0, factorIdsUsed: string[] = []): RuleEvaluation {
  return { ruleId, fired, strength, factorIdsUsed };
}

describe("scoreDomains — empty / no-contribution cases", () => {
  it("A. empty RuleEvaluation[] → []", () => {
    expect(scoreDomains([], ruleset([rule("R", "career", 1)]), CTX)).toEqual([]);
  });
  it("B. all rules not fired → []", () => {
    expect(scoreDomains([ev("R", false)], ruleset([rule("R", "career", 1)]), CTX)).toEqual([]);
  });
  it("C. fired rule WITHOUT weighting → []", () => {
    expect(scoreDomains([ev("R", true)], ruleset([ruleNoWeighting("R")]), CTX)).toEqual([]);
  });
});

describe("scoreDomains — single & multi contributions", () => {
  it("D. one fired weighted rule → đúng domain + contribution = strength×weight", () => {
    const out = scoreDomains([ev("R", true)], ruleset([rule("R", "career", 0.6)]), CTX);
    expect(out).toEqual([
      { domain: "career", chartId: "chart-1", score: 0.6, contributingRuleIds: ["R"], computedAt: CTX.computedAt, version: SCORING_ENGINE_VERSION },
    ]);
  });
  it("E./S. nhiều rule cùng domain → cộng dồn, contributingRuleIds theo thứ tự ruleset", () => {
    const rs = ruleset([rule("R1", "career", 0.5), rule("R2", "career", 0.25)]);
    const out = scoreDomains([ev("R1", true), ev("R2", true)], rs, CTX);
    expect(out).toHaveLength(1);
    expect(out[0]?.score).toBeCloseTo(0.75, 10);
    expect(out[0]?.contributingRuleIds).toEqual(["R1", "R2"]);
  });
  it("F. nhiều domain → mỗi domain một DomainScore (sắp theo domain)", () => {
    const rs = ruleset([rule("R1", "wealth", 1), rule("R2", "career", 1)]);
    const out = scoreDomains([ev("R1", true), ev("R2", true)], rs, CTX);
    expect(out.map((d) => d.domain)).toEqual(["career", "wealth"]);
  });
});

describe("scoreDomains — weight / strength semantics", () => {
  it("G. strength 1 × positive weight", () => {
    expect(scoreDomains([ev("R", true, 1)], ruleset([rule("R", "d", 2)]), CTX)[0]?.score).toBe(2);
  });
  it("H. strength 1 × negative weight → signed", () => {
    expect(scoreDomains([ev("R", true, 1)], ruleset([rule("R", "d", -3)]), CTX)[0]?.score).toBe(-3);
  });
  it("I. fired với strength 0 → contribution 0 (faithful strength×weight)", () => {
    const out = scoreDomains([ev("R", true, 0)], ruleset([rule("R", "d", 5)]), CTX);
    expect(out).toEqual([
      { domain: "d", chartId: "chart-1", score: 0, contributingRuleIds: ["R"], computedAt: CTX.computedAt, version: SCORING_ENGINE_VERSION },
    ]);
  });
  it("J. weight 0 → contribution 0, domain vẫn xuất hiện với score 0", () => {
    expect(scoreDomains([ev("R", true)], ruleset([rule("R", "d", 0)]), CTX)[0]?.score).toBe(0);
  });
});

describe("scoreDomains — isolation & traceability", () => {
  it("K. duplicate factorIdsUsed trong evaluation → không tạo thêm contribution", () => {
    const out = scoreDomains([ev("R", true, 1, ["f", "f", "f"])], ruleset([rule("R", "d", 1)]), CTX);
    expect(out[0]?.score).toBe(1);
    expect(out[0]?.contributingRuleIds).toEqual(["R"]);
  });
  it("L. rule không weighting bên cạnh rule có weighting → chỉ rule có weighting đóng góp", () => {
    const rs = ruleset([ruleNoWeighting("PLAIN"), rule("W", "career", 1)]);
    const out = scoreDomains([ev("PLAIN", true), ev("W", true)], rs, CTX);
    expect(out).toHaveLength(1);
    expect(out[0]?.contributingRuleIds).toEqual(["W"]);
  });
  it("N./O. context.chartId và computedAt được truyền đúng vào output", () => {
    const out = scoreDomains([ev("R", true)], ruleset([rule("R", "d", 1)]), CTX);
    expect(out[0]?.chartId).toBe("chart-1");
    expect(out[0]?.computedAt).toBe(CTX.computedAt);
  });
});

describe("scoreDomains — determinism & real ruleset", () => {
  it("M./R. chạy lặp cho kết quả đồng nhất (deep equal, thứ tự ổn định)", () => {
    const rs = ruleset([rule("Rb", "career", 0.5), rule("Ra", "career", 0.5), rule("Rc", "wealth", 1)]);
    const evals = [ev("Rb", true), ev("Ra", true), ev("Rc", true)];
    expect(scoreDomains(evals, rs, CTX)).toEqual(scoreDomains(evals, rs, CTX));
    const out = scoreDomains(evals, rs, CTX);
    expect(out.map((d) => d.domain)).toEqual(["career", "wealth"]);
    // contributingRuleIds theo thứ tự ruleset (Rb trước Ra):
    expect(out[0]?.contributingRuleIds).toEqual(["Rb", "Ra"]);
  });
  it("P. WESTERN_RULES_V1 hiện tại (không weighting) → [] dù rules fired", () => {
    const factors: Factor[] = [
      { id: "sun_element_fire", chartId: "c", school: "western", category: "sign_quality", inputs: [], strength: 0, computedAt: CTX.computedAt, version: "western.factors.v1" },
      { id: "moon_element_fire", chartId: "c", school: "western", category: "sign_quality", inputs: [], strength: 0, computedAt: CTX.computedAt, version: "western.factors.v1" },
    ];
    const evals = evaluateRules(factors, WESTERN_RULES_V1); // SAME_ELEMENT fires
    expect(evals.some((e) => e.fired)).toBe(true);
    expect(scoreDomains(evals, WESTERN_RULES_V1, CTX)).toEqual([]);
  });
  it("Q. synthetic RuleSet có weighting → DomainScore chính xác", () => {
    const rs = ruleset([rule("A", "career", 1), rule("B", "career", 2), rule("C", "health", -1)]);
    const out = scoreDomains([ev("A", true), ev("B", false), ev("C", true)], rs, CTX);
    expect(out).toEqual([
      { domain: "career", chartId: "chart-1", score: 1, contributingRuleIds: ["A"], computedAt: CTX.computedAt, version: SCORING_ENGINE_VERSION },
      { domain: "health", chartId: "chart-1", score: -1, contributingRuleIds: ["C"], computedAt: CTX.computedAt, version: SCORING_ENGINE_VERSION },
    ]);
  });
  it("scoringEngine.score khớp scoreDomains", () => {
    const rs = ruleset([rule("R", "d", 1)]);
    const evals = [ev("R", true)];
    expect(scoringEngine.score(evals, rs, CTX)).toEqual(scoreDomains(evals, rs, CTX));
  });
});
