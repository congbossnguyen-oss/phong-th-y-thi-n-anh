import { describe, expect, it } from "vitest";

import { loadRuleSet, validateRuleSet } from "../validate.js";

// Valid baseline RuleSet (plain JSON-shaped object, as if parsed from a file).
function validRuleSet(): Record<string, unknown> {
  return {
    school: "western",
    version: "western.rules.v1",
    rules: [
      {
        id: "WESTERN.PLACEMENT.001",
        school: "western",
        version: "1.0.0",
        rulesetVersion: "western.rules.v1",
        prerequisites: [],
        conditions: { op: "factorPresent", pattern: "mars_in_house_10" },
        source: { sourceType: "geometric_rule" },
      },
    ],
  };
}

function codes(errs: { code: string }[]): string[] {
  return errs.map((e) => e.code);
}

describe("validateRuleSet — F. valid RuleSet passes", () => {
  it("RuleSet hợp lệ ⇒ không lỗi; loadRuleSet trả ok", () => {
    expect(validateRuleSet(validRuleSet())).toEqual([]);
    const loaded = loadRuleSet(validRuleSet());
    expect(loaded.ok).toBe(true);
  });

  it("And/Or/Not lồng nhau hợp lệ ⇒ không lỗi", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["conditions"] = {
      op: "and",
      args: [
        { op: "or", args: [{ op: "factorPresent", pattern: "a" }, { op: "factorPresent", pattern: "b" }] },
        { op: "not", arg: { op: "factorPresent", pattern: "c" } },
      ],
    };
    expect(validateRuleSet(rs)).toEqual([]);
  });
});

describe("validateRuleSet — F. RuleSet shape", () => {
  it("non-object ⇒ INVALID_RULESET_SHAPE", () => {
    expect(codes(validateRuleSet(null))).toContain("INVALID_RULESET_SHAPE");
    expect(codes(validateRuleSet(42))).toContain("INVALID_RULESET_SHAPE");
    expect(codes(validateRuleSet([]))).toContain("INVALID_RULESET_SHAPE");
  });

  it("school/version rỗng ⇒ EMPTY_RULESET_SCHOOL / EMPTY_RULESET_VERSION", () => {
    const c = codes(validateRuleSet({ school: "", version: "", rules: [] }));
    expect(c).toContain("EMPTY_RULESET_SCHOOL");
    expect(c).toContain("EMPTY_RULESET_VERSION");
  });

  it("rules không phải mảng ⇒ INVALID_RULES_ARRAY", () => {
    expect(codes(validateRuleSet({ school: "western", version: "v", rules: {} }))).toContain("INVALID_RULES_ARRAY");
  });

  it("field lạ ở top-level ⇒ UNKNOWN_FIELD", () => {
    const rs = validRuleSet();
    rs["evilField"] = 1;
    expect(codes(validateRuleSet(rs))).toContain("UNKNOWN_FIELD");
  });
});

describe("validateRuleSet — F. Rule fields", () => {
  it("duplicate rule id ⇒ DUPLICATE_RULE_ID", () => {
    const rs = validRuleSet();
    const rules = rs["rules"] as Record<string, unknown>[];
    rules.push({ ...(rules[0] as Record<string, unknown>) });
    expect(codes(validateRuleSet(rs))).toContain("DUPLICATE_RULE_ID");
  });

  it("rule.school ≠ ruleset.school ⇒ RULE_SCHOOL_MISMATCH", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["school"] = "vedic";
    expect(codes(validateRuleSet(rs))).toContain("RULE_SCHOOL_MISMATCH");
  });

  it("rule.rulesetVersion ≠ ruleset.version ⇒ RULESET_VERSION_MISMATCH", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["rulesetVersion"] = "other.v9";
    expect(codes(validateRuleSet(rs))).toContain("RULESET_VERSION_MISMATCH");
  });

  it("prerequisites không phải mảng string ⇒ INVALID_PREREQUISITES", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["prerequisites"] = [123];
    expect(codes(validateRuleSet(rs))).toContain("INVALID_PREREQUISITES");
  });

  it("field lạ ở rule ⇒ UNKNOWN_FIELD", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["callback"] = "() => {}";
    expect(codes(validateRuleSet(rs))).toContain("UNKNOWN_FIELD");
  });
});

describe("validateRuleSet — C. prerequisite graph", () => {
  it("prerequisite không tồn tại ⇒ MISSING_PREREQUISITE", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["prerequisites"] = ["NOPE"];
    expect(codes(validateRuleSet(rs))).toContain("MISSING_PREREQUISITE");
  });

  it("chu trình prerequisite ⇒ PREREQUISITE_CYCLE", () => {
    const rs = {
      school: "western",
      version: "western.rules.v1",
      rules: [
        { id: "A", school: "western", version: "1.0.0", rulesetVersion: "western.rules.v1", prerequisites: ["B"], conditions: { op: "factorPresent", pattern: "x" } },
        { id: "B", school: "western", version: "1.0.0", rulesetVersion: "western.rules.v1", prerequisites: ["A"], conditions: { op: "factorPresent", pattern: "y" } },
      ],
    };
    expect(codes(validateRuleSet(rs))).toContain("PREREQUISITE_CYCLE");
  });
});

describe("validateRuleSet — E. ConditionExpr security / shape", () => {
  function withCondition(cond: unknown): Record<string, unknown> {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["conditions"] = cond;
    return rs;
  }

  it("operator lạ ⇒ UNKNOWN_OPERATOR", () => {
    expect(codes(validateRuleSet(withCondition({ op: "evil", pattern: "x" })))).toContain("UNKNOWN_OPERATOR");
  });

  it("factorPresent thiếu pattern ⇒ INVALID_CONDITION_SHAPE", () => {
    expect(codes(validateRuleSet(withCondition({ op: "factorPresent" })))).toContain("INVALID_CONDITION_SHAPE");
  });

  it("and.args rỗng ⇒ INVALID_CONDITION_SHAPE", () => {
    expect(codes(validateRuleSet(withCondition({ op: "and", args: [] })))).toContain("INVALID_CONDITION_SHAPE");
  });

  it("field lạ trong condition node ⇒ UNKNOWN_FIELD", () => {
    expect(codes(validateRuleSet(withCondition({ op: "factorPresent", pattern: "x", exec: "danger" })))).toContain("UNKNOWN_FIELD");
  });

  it("factorThreshold ⇒ FACTOR_THRESHOLD_UNSUPPORTED_V1 (reject, không dùng ở V1)", () => {
    expect(codes(validateRuleSet(withCondition({ op: "factorThreshold", pattern: "x", comparator: ">=", value: 0.5 })))).toContain(
      "FACTOR_THRESHOLD_UNSUPPORTED_V1",
    );
  });

  it("conditions vắng mặt ⇒ INVALID_CONDITION_SHAPE", () => {
    const rs = validRuleSet();
    delete (rs["rules"] as Record<string, unknown>[])[0]!["conditions"];
    expect(codes(validateRuleSet(rs))).toContain("INVALID_CONDITION_SHAPE");
  });
});

describe("validateRuleSet — weighting / source (optional metadata)", () => {
  it("weighting sai hình dạng ⇒ INVALID_WEIGHTING", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["weighting"] = { domain: "", weight: "x" };
    expect(codes(validateRuleSet(rs))).toContain("INVALID_WEIGHTING");
  });

  it("source.sourceType không hợp lệ ⇒ INVALID_SOURCE", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["source"] = { sourceType: "twitter" };
    expect(codes(validateRuleSet(rs))).toContain("INVALID_SOURCE");
  });

  it("weighting hợp lệ (metadata Phase-7) ⇒ không lỗi", () => {
    const rs = validRuleSet();
    (rs["rules"] as Record<string, unknown>[])[0]!["weighting"] = { domain: "career", weight: 0.6 };
    expect(validateRuleSet(rs)).toEqual([]);
  });
});

describe("loadRuleSet — guard", () => {
  it("invalid ⇒ ok:false + errors, KHÔNG trả ruleSet", () => {
    const loaded = loadRuleSet({ school: "", version: "", rules: [] });
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) expect(loaded.errors.length).toBeGreaterThan(0);
  });

  it("valid ⇒ ok:true + ruleSet định kiểu", () => {
    const loaded = loadRuleSet(validRuleSet());
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.ruleSet.rules).toHaveLength(1);
  });
});
