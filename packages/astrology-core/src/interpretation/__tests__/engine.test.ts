import { describe, expect, it } from "vitest";

import type { NormalizedChart } from "../../chart/types.js";
import type { CanonicalDomain } from "../../domain/types.js";
import { CANONICAL_DOMAINS } from "../../domain/types.js";
import type { Evidence } from "../../evidence/types.js";
import type { Rule, RuleEvaluation, RuleSet } from "../../rule/types.js";
import { WESTERN_RULES_V1 } from "../../western/rules.js";
import { INTERPRETATION_ENGINE_VERSION, InterpretationValidationError } from "../types.js";
import { buildInterpretation, interpret, makeInterpretationId } from "../engine.js";

const COND = { op: "factorPresent", pattern: "x" } as const;

function drule(id: string, domain?: CanonicalDomain): Rule {
  return {
    id,
    school: "western",
    version: "1.0.0",
    rulesetVersion: "test.v1",
    prerequisites: [],
    conditions: COND,
    ...(domain ? { domain } : {}),
  };
}
function rs(rules: Rule[]): RuleSet {
  return { school: "western", version: "test.v1", rules };
}
function ev(ruleId: string, fired: boolean): RuleEvaluation {
  return { ruleId, fired, strength: fired ? 1 : 0, factorIdsUsed: fired ? ["f1"] : [] };
}
function evid(ruleId: string, calcId = "calc-1", factorIds = ["f1"]): Evidence {
  return { evidenceId: `${calcId}:${ruleId}`, interpretationId: null, ruleId, factorIds, calculationId: calcId, source: null };
}
function chart(calcId = "calc-1"): NormalizedChart {
  return { metadata: { calculationId: calcId } } as unknown as NormalizedChart;
}

describe("interpret — D-EMIT emission scope", () => {
  it("Case A: 0 bound rules → no InterpretationObject", () => {
    const out = interpret(chart(), [], [ev("R", true)], [evid("R")], rs([drule("R")])); // rule has no domain
    expect(out).toEqual([]);
  });

  it("Case B: ≥1 bound rule, none fired → domain_not_indicated (evidence empty, valid)", () => {
    const out = interpret(chart(), [], [ev("R", false)], [], rs([drule("R", "health")]));
    expect(out).toEqual([
      {
        interpretationId: "calc-1:health",
        domain: "health",
        conclusion: { key: "domain_not_indicated", params: {} },
        supportingFactors: [],
        rules: ["R"],
        evidence: [],
        caveats: [],
        version: INTERPRETATION_ENGINE_VERSION,
      },
    ]);
  });

  it("Case B': bound rule fired but NO evidence → MUST NOT emit domain_activated (→ not_indicated)", () => {
    const out = interpret(chart(), [], [ev("R", true)], [], rs([drule("R", "health")]));
    expect(out).toHaveLength(1);
    expect(out[0]?.conclusion.key).toBe("domain_not_indicated");
    expect(out[0]?.evidence).toEqual([]);
  });

  it("Case C: ≥1 fired + evidenced bound rule → domain_activated with evidence", () => {
    const out = interpret(chart(), [], [ev("R", true)], [evid("R")], rs([drule("R", "health")]));
    expect(out).toEqual([
      {
        interpretationId: "calc-1:health",
        domain: "health",
        conclusion: { key: "domain_activated", params: {} },
        supportingFactors: ["f1"],
        rules: ["R"],
        evidence: ["calc-1:R"],
        caveats: [],
        version: INTERPRETATION_ENGINE_VERSION,
      },
    ]);
  });

  it("multiple fired+evidenced rules in one domain → one InterpretationObject", () => {
    const out = interpret(
      chart(),
      [],
      [ev("R1", true), ev("R2", true)],
      [evid("R1", "calc-1", ["f1"]), evid("R2", "calc-1", ["f2"])],
      rs([drule("R1", "wealth"), drule("R2", "wealth")]),
    );
    expect(out).toHaveLength(1);
    expect(out[0]?.domain).toBe("wealth");
    expect(out[0]?.rules).toEqual(["R1", "R2"]);
    expect(out[0]?.evidence).toEqual(["calc-1:R1", "calc-1:R2"]);
    expect(out[0]?.supportingFactors).toEqual(["f1", "f2"]);
  });

  it("no third conclusion key is ever produced", () => {
    const out = interpret(
      chart(),
      [],
      [ev("A", true), ev("B", false)],
      [evid("A")],
      rs([drule("A", "wealth"), drule("B", "health")]),
    );
    const keys = new Set(out.map((o) => o.conclusion.key));
    expect([...keys].every((k) => k === "domain_activated" || k === "domain_not_indicated")).toBe(true);
  });
});

describe("interpret — deterministic ordering (CANONICAL_DOMAINS)", () => {
  it("output ordered by canonical domain order regardless of ruleset order", () => {
    // travel (idx 10) declared before wealth (idx 2) → output must be [wealth, travel]
    const out = interpret(
      chart(),
      [],
      [ev("T", true), ev("W", true)],
      [evid("T"), evid("W")],
      rs([drule("T", "travel"), drule("W", "wealth")]),
    );
    expect(out.map((o) => o.domain)).toEqual(["wealth", "travel"]);
  });

  it("same inputs twice → identical output (deep equal)", () => {
    const args = () =>
      interpret(
        chart(),
        [],
        [ev("R1", true), ev("R2", false)],
        [evid("R1")],
        rs([drule("R1", "wealth"), drule("R2", "health")]),
      );
    expect(args()).toEqual(args());
  });
});

describe("D-ID-CONSTRUCT — deterministic interpretationId", () => {
  it("exact `${calculationId}:${domain}`", () => {
    expect(makeInterpretationId("calc-123", "health")).toBe("calc-123:health");
    const out = interpret(chart("calc-123"), [], [ev("R", true)], [evid("R", "calc-123")], rs([drule("R", "health")]));
    expect(out[0]?.interpretationId).toBe("calc-123:health");
  });
});

describe("D-EVIDENCE-SCOPE — evidence invariant by conclusion", () => {
  it("domain_activated + empty evidence → rejected at construction", () => {
    expect(() =>
      buildInterpretation({ calculationId: "calc-1", domain: "health", key: "domain_activated", supportingFactors: [], rules: ["R"], evidence: [] }),
    ).toThrow(InterpretationValidationError);
  });
  it("domain_activated + evidence → valid", () => {
    const o = buildInterpretation({ calculationId: "calc-1", domain: "health", key: "domain_activated", supportingFactors: ["f1"], rules: ["R"], evidence: ["calc-1:R"] });
    expect(o.conclusion.key).toBe("domain_activated");
  });
  it("domain_not_indicated + empty evidence → valid", () => {
    const o = buildInterpretation({ calculationId: "calc-1", domain: "health", key: "domain_not_indicated", supportingFactors: [], rules: ["R"], evidence: [] });
    expect(o.evidence).toEqual([]);
  });
  it("domain_not_indicated + evidence supplied → still valid", () => {
    const o = buildInterpretation({ calculationId: "calc-1", domain: "health", key: "domain_not_indicated", supportingFactors: [], rules: ["R"], evidence: ["calc-1:R"] });
    expect(o.conclusion.key).toBe("domain_not_indicated");
  });
});

describe("interpret — provenance isolation", () => {
  it("evidence from a different chart (calculationId) is ignored", () => {
    const out = interpret(chart("calc-1"), [], [ev("R", true)], [evid("R", "calc-OTHER")], rs([drule("R", "health")]));
    // fired but no evidence for THIS chart → not_indicated
    expect(out[0]?.conclusion.key).toBe("domain_not_indicated");
  });
});

describe("interpret — Western RuleSet V1 (unassigned) emits nothing", () => {
  it("current Western V1 → [] (all domains unassessed)", () => {
    const factors = [
      { id: "sun_element_fire", chartId: "calc-1", school: "western" as const, category: "sign_quality" as const, inputs: [], strength: 0, computedAt: new Date(0), version: "western.factors.v1" },
    ];
    const out = interpret(chart(), factors, [ev("WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT", true)], [evid("WESTERN.STRUCT.LUMINARIES_SAME_ELEMENT")], WESTERN_RULES_V1);
    expect(out).toEqual([]);
  });
});

describe("interpret — sensitive domains use identical structural semantics", () => {
  it.each(["health", "shared_resources", "adversaries", "mortality"] as const)(
    "%s: fired+evidenced → domain_activated, same shape, no special semantics",
    (domain) => {
      const out = interpret(chart(), [], [ev("R", true)], [evid("R")], rs([drule("R", domain)]));
      expect(out).toEqual([
        {
          interpretationId: `calc-1:${domain}`,
          domain,
          conclusion: { key: "domain_activated", params: {} },
          supportingFactors: ["f1"],
          rules: ["R"],
          evidence: ["calc-1:R"],
          caveats: [],
          version: INTERPRETATION_ENGINE_VERSION,
        },
      ]);
    },
  );
});

describe("CANONICAL_DOMAINS sanity", () => {
  it("exactly 15 domains, no duplicates", () => {
    expect(CANONICAL_DOMAINS).toHaveLength(15);
    expect(new Set(CANONICAL_DOMAINS).size).toBe(15);
  });
});
