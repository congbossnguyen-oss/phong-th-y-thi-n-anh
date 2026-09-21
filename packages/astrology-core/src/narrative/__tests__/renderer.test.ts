import { describe, expect, it } from "vitest";

import type { NormalizedChart } from "../../chart/types.js";
import type { Factor } from "../../factor/types.js";
import type { InterpretationObject } from "../../interpretation/types.js";
import type { Rule, RuleSet } from "../../rule/types.js";
import { evaluateRules } from "../../rule/engine.js";
import { recordEvidence } from "../../evidence/engine.js";
import { interpret } from "../../interpretation/engine.js";
import { deterministicMockNarrativeProvider } from "../mockProvider.js";
import { renderNarratives, toNarrativeInput } from "../renderer.js";
import { NARRATIVE_RENDERER_VERSION } from "../types.js";

const CALC = "calc-mvp-1";

function chart(calcId = CALC): NormalizedChart {
  return { metadata: { calculationId: calcId } } as unknown as NormalizedChart;
}
function factor(id: string): Factor {
  return { id, chartId: CALC, school: "western", category: "placement", inputs: [], strength: 0, computedAt: new Date(0), version: "western.factors.v1" };
}
function mvpRule(id: string, domain: "vocation" | "health", pattern: string): Rule {
  return { id, school: "western", version: "1.0.0", rulesetVersion: "mvp.demo.v1", prerequisites: [], conditions: { op: "factorPresent", pattern }, domain };
}
// Synthetic MVP DEMONSTRATION fixture — NOT Western RuleSet V2, NOT a methodology assignment.
const MVP_RULESET: RuleSet = {
  school: "western",
  version: "mvp.demo.v1",
  rules: [
    mvpRule("MVP.VOCATION.001", "vocation", "sun_in_house_10"),
    mvpRule("MVP.HEALTH.001", "health", "mars_in_house_6"),
  ],
};

function activatedInterp(domain: "vocation" | "health" = "vocation"): InterpretationObject {
  return {
    interpretationId: `${CALC}:${domain}`,
    domain,
    conclusion: { key: "domain_activated", params: {} },
    supportingFactors: ["sun_in_house_10"],
    rules: ["MVP.VOCATION.001"],
    evidence: [`${CALC}:MVP.VOCATION.001`],
    caveats: [],
    version: "interpretation.v1",
  };
}

describe("MVP narrative — activated / not_indicated", () => {
  it("Test 1: domain_activated → Vietnamese narrative exists and references provenance", async () => {
    const [n] = await renderNarratives([activatedInterp("vocation")], deterministicMockNarrativeProvider);
    expect(n?.text).toContain("được kích hoạt");
    expect(n?.text).toContain("MVP.VOCATION.001");
    expect(n?.domain).toBe("vocation");
    expect(n?.version).toBe(NARRATIVE_RENDERER_VERSION);
  });

  it("Test 2: domain_not_indicated → narrative keeps structural meaning, no prediction", async () => {
    const notIndicated: InterpretationObject = {
      interpretationId: `${CALC}:health`,
      domain: "health",
      conclusion: { key: "domain_not_indicated", params: {} },
      supportingFactors: [],
      rules: ["MVP.HEALTH.001"],
      evidence: [],
      caveats: [],
      version: "interpretation.v1",
    };
    const [n] = await renderNarratives([notIndicated], deterministicMockNarrativeProvider);
    expect(n?.text).toContain("không có quy tắc nào được kích hoạt");
    expect(n?.evidenceIds).toEqual([]);
    // must NOT turn absence into a judgment/prediction
    for (const bad of ["xấu", "tốt", "sẽ ", "khả năng", "nguy cơ"]) expect(n?.text).not.toContain(bad);
  });

  it("Test 3: grounding — narrative contains no confidence/probability/prediction/recommendation", async () => {
    const [n] = await renderNarratives([activatedInterp("vocation")], deterministicMockNarrativeProvider);
    for (const bad of ["confidence", "probability", "prediction", "recommendation", "%"]) {
      expect(n?.text.toLowerCase()).not.toContain(bad);
    }
  });

  it("Test 4: determinism — same input → same NarrativeInput and same output", async () => {
    const i = activatedInterp("vocation");
    expect(toNarrativeInput(i)).toEqual(toNarrativeInput(i));
    const a = await renderNarratives([i], deterministicMockNarrativeProvider);
    const b = await renderNarratives([i], deterministicMockNarrativeProvider);
    expect(a).toEqual(b);
  });
});

describe("MVP full pipeline — Factor → Rule → Evidence → Interpretation → Narrative", () => {
  it("Test 5: runs end-to-end with the real engines and a synthetic domain-bound RuleSet", async () => {
    const factors: Factor[] = [factor("sun_in_house_10")]; // present → vocation fires; health's mars_in_house_6 absent
    const evals = evaluateRules(factors, MVP_RULESET);
    const evidence = evals.filter((e) => e.fired).map((e) => recordEvidence(e, MVP_RULESET, CALC));
    const interps = interpret(chart(), factors, evals, evidence, MVP_RULESET);

    // deterministic order by CANONICAL_DOMAINS: health (idx 1) before vocation (idx 3)
    expect(interps.map((i) => i.domain)).toEqual(["health", "vocation"]);
    const health = interps.find((i) => i.domain === "health");
    const vocation = interps.find((i) => i.domain === "vocation");
    expect(health?.conclusion.key).toBe("domain_not_indicated");
    expect(health?.evidence).toEqual([]);
    expect(vocation?.conclusion.key).toBe("domain_activated");
    expect(vocation?.evidence).toEqual([`${CALC}:MVP.VOCATION.001`]);

    const narratives = await renderNarratives(interps, deterministicMockNarrativeProvider);
    expect(narratives.map((n) => n.domain)).toEqual(["health", "vocation"]);
    expect(narratives.find((n) => n.domain === "vocation")?.text).toContain("Nghề nghiệp");
    expect(narratives.find((n) => n.domain === "vocation")?.text).toContain("được kích hoạt");
    expect(narratives.find((n) => n.domain === "health")?.text).toContain("không có quy tắc nào được kích hoạt");
  });
});
