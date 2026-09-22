/**
 * Phase 10A — app-layer smoke test for the Astrology Web MVP vertical slice.
 *
 * Proves the wiring the SSR page relies on, end-to-end through a REAL calculated chart:
 *   input → validate → chart → factor → rule → evidence → interpret → narrative → grounding → ViewModel.
 *
 * The narrative provider is INJECTED (mock / adversarial) via the orchestrator's test seam, so the
 * test never touches the network and never needs an API key. The firing birth input below was found
 * empirically against the real Swiss Ephemeris + `mvp.demo.v1` ruleset (Sun in house 10 → vocation).
 */
import { describe, expect, it, afterEach } from "vitest";
import {
  deterministicMockNarrativeProvider,
  NARRATIVE_BLOCKED_TEXT,
  type NarrativeProvider,
} from "@thien-anh/astrology-core";
import { runWesternAstrologyMvp } from "../index";
import { getWesternAstrologyNarrativeProvider } from "../anthropic-narrative-provider";
import type { WesternAstrologyMvpInput } from "../view-model";

/** Empirically-verified input that fires MVP.VOCATION.001 (sun_in_house_10) against the real chart. */
const FIRING_INPUT: WesternAstrologyMvpInput = {
  date: { year: 1990, month: 6, day: 15 },
  time: { hour: 11, minute: 0 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 21.0278,
  longitude: 105.8342,
  locationLabel: "Hà Nội",
};

const mockInjection = { narrativeProvider: { provider: deterministicMockNarrativeProvider, kind: "mock" as const } };

/** Adversarial provider: emits an invented planet ("Sao Hỏa") the grounding check must reject. */
const hallucinating: NarrativeProvider = {
  modelProvider: "mock-adv",
  modelVersion: "v0",
  generateNarrative: () => Promise.resolve("Lĩnh vực này liên quan tới Sao Hỏa và nhà 7."),
};

describe("Phase 10A MVP — end-to-end pipeline reaches grounded narrative", () => {
  it("valid firing input → success, interpretation reaches narrative, grounding surfaced, mock provider used", async () => {
    const vm = await runWesternAstrologyMvp(FIRING_INPUT, mockInjection);

    // (1)+(3) valid input reaches the pipeline; status transitioned to success.
    expect(vm.status).toBe("success");
    // (2) the injected mock provider was used (no real Anthropic call).
    expect(vm.narrativeProviderKind).toBe("mock");
    expect(vm.chart?.engine).toBeTruthy();

    // (4) at least one interpretation reached the narrative layer with real prose.
    expect(vm.interpretations.length).toBeGreaterThan(0);
    const vocation = vm.interpretations.find((i) => i.domain === "vocation");
    expect(vocation).toBeDefined();
    expect(vocation?.conclusionKey).toBe("domain_activated");
    expect(vocation?.narrativeText.length ?? 0).toBeGreaterThan(0);
    expect(vocation?.ruleIds).toContain("MVP.VOCATION.001");

    // (5) the deterministic grounding result is surfaced to the ViewModel (grounded mock ⇒ passed).
    expect(vocation?.groundingCheckPassed).toBe(true);
    expect(vocation?.narrativeText).not.toBe(NARRATIVE_BLOCKED_TEXT);
  });

  it("(6) adversarial hallucination is caught and visibly represented as blocked/refused", async () => {
    const vm = await runWesternAstrologyMvp(FIRING_INPUT, {
      narrativeProvider: { provider: hallucinating, kind: "mock" },
    });
    expect(vm.status).toBe("success");
    const vocation = vm.interpretations.find((i) => i.domain === "vocation");
    expect(vocation).toBeDefined();
    // Grounding rejected it → UI-facing flag is false and the text is the fixed blocked notice,
    // never the hallucinated sentence.
    expect(vocation?.groundingCheckPassed).toBe(false);
    expect(vocation?.narrativeText).toBe(NARRATIVE_BLOCKED_TEXT);
    expect(vocation?.narrativeText).not.toContain("Sao Hỏa");
  });

  it("(3) invalid coordinates → existing refusal (missing_input), no crash, calc never runs", async () => {
    const vm = await runWesternAstrologyMvp(
      { ...FIRING_INPUT, latitude: Number.NaN },
      mockInjection,
    );
    expect(vm.status).toBe("missing_input");
    expect(vm.errors.length).toBeGreaterThan(0);
    expect(vm.interpretations).toEqual([]);
  });
});

describe("Phase 10A MVP — (7) no client-side secret exposure", () => {
  const KEY = "ANTHROPIC_API_KEY";
  const saved = process.env[KEY];
  afterEach(() => {
    if (saved === undefined) delete process.env[KEY];
    else process.env[KEY] = saved;
  });

  it("no server API key configured → deterministic mock provider, never throws", () => {
    delete process.env[KEY];
    const sel = getWesternAstrologyNarrativeProvider();
    expect(sel.kind).toBe("mock");
    expect(sel.provider.modelProvider).toBe("mock");
    // The provider object carries no secret material.
    expect(JSON.stringify(sel.provider)).not.toMatch(/apiKey|secret|x-relay/i);
  });

  it("the ViewModel that reaches the SSR template contains no key/secret material", async () => {
    delete process.env[KEY];
    const vm = await runWesternAstrologyMvp(FIRING_INPUT, mockInjection);
    expect(JSON.stringify(vm)).not.toMatch(/apiKey|sk-ant|x-relay-secret|RELAY_SHARED_SECRET|ANTHROPIC_API_KEY/i);
  });
});
