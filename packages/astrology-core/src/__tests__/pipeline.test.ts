import { describe, expect, it } from "vitest";

import type { NormalizedChart } from "../chart/types.js";
import type { Factor } from "../factor/types.js";
import type { Rule, RuleSet } from "../rule/types.js";
import { deterministicMockNarrativeProvider } from "../narrative/mockProvider.js";
import { runPipeline } from "../pipeline.js";

const CALC = "calc-pipeline-1";

function chart(calcId = CALC): NormalizedChart {
  return { metadata: { calculationId: calcId } } as unknown as NormalizedChart;
}
function factor(id: string): Factor {
  return { id, chartId: CALC, school: "western", category: "placement", inputs: [], strength: 0, computedAt: new Date(0), version: "western.factors.v1" };
}
function mvpRule(id: string, domain: "vocation" | "health", pattern: string): Rule {
  return { id, school: "western", version: "1.0.0", rulesetVersion: "mvp.demo.v1", prerequisites: [], conditions: { op: "factorPresent", pattern }, domain };
}
const RULESET: RuleSet = {
  school: "western",
  version: "mvp.demo.v1",
  rules: [mvpRule("MVP.VOCATION.001", "vocation", "sun_in_house_10"), mvpRule("MVP.HEALTH.001", "health", "mars_in_house_6")],
};

describe("runPipeline — end-to-end orchestration", () => {
  it("Test 1: Factor → Rule → Evidence → Interpretation → Vietnamese narrative", async () => {
    const result = await runPipeline({
      chart: chart(),
      factors: [factor("sun_in_house_10")],
      ruleset: RULESET,
      narrativeProvider: deterministicMockNarrativeProvider,
    });

    // evaluateRules orders by ruleId: MVP.HEALTH.001 (not fired) before MVP.VOCATION.001 (fired)
    expect(result.ruleEvaluations.map((e) => [e.ruleId, e.fired])).toEqual([
      ["MVP.HEALTH.001", false],
      ["MVP.VOCATION.001", true],
    ]);
    expect(result.evidence.map((e) => e.evidenceId)).toEqual([`${CALC}:MVP.VOCATION.001`]);
    expect(result.interpretations.map((i) => [i.domain, i.conclusion.key])).toEqual([
      ["health", "domain_not_indicated"],
      ["vocation", "domain_activated"],
    ]);
    const vocation = result.narratives.find((n) => n.domain === "vocation");
    expect(vocation?.text).toContain("Nghề nghiệp");
    expect(vocation?.text).toContain("được kích hoạt");
    expect(result.narratives.find((n) => n.domain === "health")?.text).toContain("không có quy tắc nào được kích hoạt");
  });

  it("Test 2: determinism — same input twice → identical structured output", async () => {
    const input = {
      chart: chart(),
      factors: [factor("sun_in_house_10")],
      ruleset: RULESET,
      narrativeProvider: deterministicMockNarrativeProvider,
    };
    const a = await runPipeline(input);
    const b = await runPipeline(input);
    expect(a).toEqual(b);
  });

  it("propagates layer errors (does not swallow)", async () => {
    const throwing = {
      generateNarrative: () => Promise.reject(new Error("provider boom")),
    };
    await expect(
      runPipeline({ chart: chart(), factors: [factor("sun_in_house_10")], ruleset: RULESET, narrativeProvider: throwing }),
    ).rejects.toThrow("provider boom");
  });
});
