import { describe, expect, it } from "vitest";

import type { InterpretationObject } from "../../interpretation/types.js";
import type { NarrativeInput, NarrativeProvider, NarrativeStyle } from "../types.js";
import { deterministicMockNarrativeProvider } from "../mockProvider.js";
import {
  NARRATIVE_BLOCKED_TEXT,
  NARRATIVE_REFUSAL_TEXT,
  createNarrativeEngine,
} from "../engine.js";

const INTERP: InterpretationObject = {
  interpretationId: "calc-mvp-1:vocation",
  domain: "vocation",
  conclusion: { key: "domain_activated", params: {} },
  supportingFactors: ["sun_in_house_10"],
  rules: ["MVP.VOCATION.001"],
  evidence: ["calc-mvp-1:MVP.VOCATION.001"],
  caveats: [],
  version: "interpretation.v1",
};

const STYLE: NarrativeStyle = { tone: "neutral", targetLanguage: "vi", maxLength: null };
const OPTS = { now: () => "2026-01-01T00:00:00.000Z", makeReportId: (refs: readonly string[]) => `rid:${[...refs].sort().join(",")}` };

/** Deterministic adversarial provider that emits a fixed hallucinated string. */
function hallucinatingProvider(text: string): NarrativeProvider {
  return { modelProvider: "mock-adv", modelVersion: "v0", generateNarrative: () => Promise.resolve(text) };
}

describe("Phase 9 NarrativeEngine — grounded positive", () => {
  it("grounded provider → serveable Report, traceable, grounding_check_passed=true", async () => {
    const engine = createNarrativeEngine(deterministicMockNarrativeProvider, OPTS);
    const r = await engine.generate([INTERP], STYLE);
    expect(r.groundingCheckPassed).toBe(true);
    expect(r.narrativeText).toContain("MVP.VOCATION.001");
    expect(r.interpretationRefs).toEqual(["calc-mvp-1:vocation"]);
    expect(r.modelProvider).toBe("mock");
    expect(r.modelVersion).toBe("deterministic.v1");
    expect(r.generatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(r.reportId).toBe("rid:calc-mvp-1:vocation");
  });

  it("determinism — same input + fixed options → identical Report", async () => {
    const engine = createNarrativeEngine(deterministicMockNarrativeProvider, OPTS);
    expect(await engine.generate([INTERP], STYLE)).toEqual(await engine.generate([INTERP], STYLE));
  });
});

describe("Phase 9 NarrativeEngine — adversarial hallucination is caught, not shipped (DoD)", () => {
  const cases: Array<[string, string]> = [
    ["invented planet", "Lĩnh vực Nghề nghiệp liên quan Sao Hỏa."],
    ["invented house", "Ngôi nhà 5 được kích hoạt."],
    ["invented date", "Sự kiện vào năm 2024."],
    ["invented number", "Điểm số là 0.85."],
    ["forbidden semantics", "Bạn nên đầu tư, khả năng cao."],
  ];
  for (const [name, text] of cases) {
    it(`${name} → grounding_check_passed=false, hallucination NOT served`, async () => {
      const engine = createNarrativeEngine(hallucinatingProvider(text), OPTS);
      const r = await engine.generate([INTERP], STYLE);
      expect(r.groundingCheckPassed).toBe(false);
      expect(r.narrativeText).toBe(NARRATIVE_BLOCKED_TEXT);
      expect(r.narrativeText).not.toContain(text);
      expect(r.interpretationRefs).toEqual(["calc-mvp-1:vocation"]); // still traceable
    });
  }
});

describe("Phase 9 NarrativeEngine — refusal", () => {
  it("empty input → deterministic refusal (grounded, no refs)", async () => {
    const engine = createNarrativeEngine(deterministicMockNarrativeProvider, OPTS);
    const r = await engine.generate([], STYLE);
    expect(r.narrativeText).toBe(NARRATIVE_REFUSAL_TEXT);
    expect(r.interpretationRefs).toEqual([]);
    expect(r.groundingCheckPassed).toBe(true);
  });

  it("insufficient input (topic absent) → deterministic refusal", async () => {
    const engine = createNarrativeEngine(deterministicMockNarrativeProvider, OPTS);
    const r = await engine.generateForTopic([INTERP], "health", STYLE);
    expect(r.narrativeText).toBe(NARRATIVE_REFUSAL_TEXT);
    expect(r.interpretationRefs).toEqual([]);
  });
});

describe("Phase 9 NarrativeEngine — provider contract conformance", () => {
  it("provider receives ONLY the NarrativeInput projection (no Chart/Factor/ephemeris)", async () => {
    let captured: NarrativeInput | null = null;
    const spy: NarrativeProvider = {
      modelProvider: "spy",
      modelVersion: "v0",
      generateNarrative: (input) => {
        captured = input;
        return Promise.resolve("Lĩnh vực Nghề nghiệp được kích hoạt bởi 1 quy tắc (MVP.VOCATION.001).");
      },
    };
    const engine = createNarrativeEngine(spy, OPTS);
    await engine.generate([INTERP], STYLE);
    expect(captured).not.toBeNull();
    expect(Object.keys(captured!).sort()).toEqual([
      "conclusionKey",
      "domain",
      "evidenceIds",
      "interpretationId",
      "ruleIds",
      "supportingFactorIds",
    ]);
  });
});
