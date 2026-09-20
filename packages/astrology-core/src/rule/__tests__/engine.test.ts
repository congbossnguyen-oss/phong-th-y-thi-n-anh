import { describe, expect, it } from "vitest";

import type { Factor } from "../../factor/types.js";
import { evaluateRules, ruleEngine } from "../engine.js";
import type { ConditionExpr, Rule, RuleSet } from "../types.js";

function factor(id: string, strength = 0): Factor {
  return {
    id,
    chartId: "chart-1",
    school: "western",
    category: "placement",
    inputs: [],
    strength,
    computedAt: new Date("2026-01-01T00:00:00.000Z"),
    version: "western.factors.v1",
  };
}

function rule(id: string, conditions: ConditionExpr, prerequisites: string[] = []): Rule {
  return { id, school: "western", version: "1.0.0", rulesetVersion: "western.rules.v1", prerequisites, conditions };
}

function ruleset(rules: Rule[]): RuleSet {
  return { school: "western", version: "western.rules.v1", rules };
}

const present = (pattern: string): ConditionExpr => ({ op: "factorPresent", pattern });

describe("evaluateRules — A. ConditionExpr operator semantics", () => {
  const factors = [factor("mars_in_aries"), factor("sun_in_leo")];

  it("factorPresent: true khi factor tồn tại", () => {
    const [e] = evaluateRules(factors, ruleset([rule("R", present("mars_in_aries"))]));
    expect(e?.fired).toBe(true);
  });

  it("factorPresent: false khi factor vắng mặt", () => {
    const [e] = evaluateRules(factors, ruleset([rule("R", present("moon_in_taurus"))]));
    expect(e?.fired).toBe(false);
  });

  it("and: true khi mọi con true; false khi một con false", () => {
    const allTrue = evaluateRules(factors, ruleset([rule("R", { op: "and", args: [present("mars_in_aries"), present("sun_in_leo")] })]));
    expect(allTrue[0]?.fired).toBe(true);
    const oneFalse = evaluateRules(factors, ruleset([rule("R", { op: "and", args: [present("mars_in_aries"), present("moon_in_taurus")] })]));
    expect(oneFalse[0]?.fired).toBe(false);
  });

  it("or: true khi có ít nhất một con true; false khi mọi con false", () => {
    const oneTrue = evaluateRules(factors, ruleset([rule("R", { op: "or", args: [present("moon_in_taurus"), present("sun_in_leo")] })]));
    expect(oneTrue[0]?.fired).toBe(true);
    const allFalse = evaluateRules(factors, ruleset([rule("R", { op: "or", args: [present("moon_in_taurus"), present("venus_in_libra")] })]));
    expect(allFalse[0]?.fired).toBe(false);
  });

  it("not: đảo boolean của con", () => {
    const notPresent = evaluateRules(factors, ruleset([rule("R", { op: "not", arg: present("moon_in_taurus") })]));
    expect(notPresent[0]?.fired).toBe(true); // moon absent → not(false)=true
    const notAbsent = evaluateRules(factors, ruleset([rule("R", { op: "not", arg: present("mars_in_aries") })]));
    expect(notAbsent[0]?.fired).toBe(false); // mars present → not(true)=false
  });

  it("biểu thức lồng nhau: And(Or(...), Not(...))", () => {
    const expr: ConditionExpr = {
      op: "and",
      args: [
        { op: "or", args: [present("moon_in_taurus"), present("sun_in_leo")] },
        { op: "not", arg: present("venus_in_libra") },
      ],
    };
    expect(evaluateRules(factors, ruleset([rule("R", expr)]))[0]?.fired).toBe(true);
  });
});

describe("evaluateRules — B. factorIdsUsed trace semantics", () => {
  const factors = [factor("mars_in_aries"), factor("sun_in_leo"), factor("moon_in_cancer")];

  it("factorPresent present → [id]; absent → []", () => {
    expect(evaluateRules(factors, ruleset([rule("R", present("mars_in_aries"))]))[0]?.factorIdsUsed).toEqual(["mars_in_aries"]);
    expect(evaluateRules(factors, ruleset([rule("R", present("x_absent"))]))[0]?.factorIdsUsed).toEqual([]);
  });

  it("and: union theo pre-order (thứ tự args), chỉ gồm factor present", () => {
    const expr: ConditionExpr = { op: "and", args: [present("sun_in_leo"), present("x_absent"), present("mars_in_aries")] };
    expect(evaluateRules(factors, ruleset([rule("R", expr)]))[0]?.factorIdsUsed).toEqual(["sun_in_leo", "mars_in_aries"]);
  });

  it("or: union pre-order deterministic", () => {
    const expr: ConditionExpr = { op: "or", args: [present("moon_in_cancer"), present("sun_in_leo")] };
    expect(evaluateRules(factors, ruleset([rule("R", expr)]))[0]?.factorIdsUsed).toEqual(["moon_in_cancer", "sun_in_leo"]);
  });

  it("not: trace = factor mà con đã khớp (dù not làm điều kiện false)", () => {
    // mars present → not(true)=false, nhưng mars ĐÃ được dùng để đánh giá.
    expect(evaluateRules(factors, ruleset([rule("R", { op: "not", arg: present("mars_in_aries") })]))[0]?.factorIdsUsed).toEqual(["mars_in_aries"]);
    // absent → con không khớp gì → []
    expect(evaluateRules(factors, ruleset([rule("R", { op: "not", arg: present("x_absent") })]))[0]?.factorIdsUsed).toEqual([]);
  });

  it("dedup giữ lần xuất hiện đầu khi cùng factor xuất hiện nhiều lần", () => {
    const expr: ConditionExpr = { op: "and", args: [present("sun_in_leo"), present("sun_in_leo")] };
    expect(evaluateRules(factors, ruleset([rule("R", expr)]))[0]?.factorIdsUsed).toEqual(["sun_in_leo"]);
  });
});

describe("evaluateRules — C. prerequisites", () => {
  const factors = [factor("a_present"), factor("b_present")];

  it("prerequisite fired → dependent CÓ THỂ fire", () => {
    const rs = ruleset([rule("BASE", present("a_present")), rule("DEP", present("b_present"), ["BASE"])]);
    const out = evaluateRules(factors, rs);
    expect(out.find((e) => e.ruleId === "DEP")?.fired).toBe(true);
  });

  it("prerequisite KHÔNG fired → dependent KHÔNG fire (fired=false, strength=0, factorIdsUsed=[])", () => {
    const rs = ruleset([rule("BASE", present("x_absent")), rule("DEP", present("b_present"), ["BASE"])]);
    const dep = evaluateRules(factors, rs).find((e) => e.ruleId === "DEP");
    expect(dep).toEqual({ ruleId: "DEP", fired: false, strength: 0, factorIdsUsed: [] });
  });

  it("multi-level dependency (A→B→C)", () => {
    const rs = ruleset([
      rule("A", present("a_present")),
      rule("B", present("b_present"), ["A"]),
      rule("C", present("a_present"), ["B"]),
    ]);
    const out = evaluateRules(factors, rs);
    expect(out.find((e) => e.ruleId === "C")?.fired).toBe(true);
  });

  it("output SẮP XẾP theo ruleId tăng dần (deterministic)", () => {
    const rs = ruleset([rule("ZED", present("a_present")), rule("ALPHA", present("b_present")), rule("MID", present("a_present"))]);
    expect(evaluateRules(factors, rs).map((e) => e.ruleId)).toEqual(["ALPHA", "MID", "ZED"]);
  });
});

describe("evaluateRules — D. strength (boolean mirror, D3)", () => {
  it("fired ⇒ strength 1.0; not fired ⇒ 0.0", () => {
    const factors = [factor("p")];
    expect(evaluateRules(factors, ruleset([rule("R", present("p"))]))[0]?.strength).toBe(1);
    expect(evaluateRules(factors, ruleset([rule("R", present("absent"))]))[0]?.strength).toBe(0);
  });

  it("FactorPresent KHÔNG dùng Factor.strength: factor strength=0 vẫn present ⇒ fired", () => {
    const zeroStrength = [factor("p", 0)];
    expect(evaluateRules(zeroStrength, ruleset([rule("R", present("p"))]))[0]?.fired).toBe(true);
  });
});

describe("evaluateRules — G. determinism", () => {
  it("cùng Factor[] + cùng RuleSet ⇒ RuleEvaluation[] ĐỒNG NHẤT (chạy lặp)", () => {
    const factors = [factor("mars_in_aries"), factor("sun_in_leo")];
    const rs = ruleset([
      rule("R2", { op: "or", args: [present("sun_in_leo"), present("x")] }),
      rule("R1", { op: "and", args: [present("mars_in_aries"), present("sun_in_leo")] }),
    ]);
    const a = evaluateRules(factors, rs);
    const b = evaluateRules(factors, rs);
    expect(a).toEqual(b);
  });

  it("ruleEngine.evaluate khớp evaluateRules", () => {
    const factors = [factor("p")];
    const rs = ruleset([rule("R", present("p"))]);
    expect(ruleEngine.evaluate(factors, rs)).toEqual(evaluateRules(factors, rs));
  });
});
