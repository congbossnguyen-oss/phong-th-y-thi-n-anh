import { describe, expect, it, vi } from "vitest";

import type { NarrativeInput } from "../types.js";
import { createAnthropicNarrativeProvider } from "../anthropicProvider.js";

const INPUT: NarrativeInput = {
  interpretationId: "calc-1:vocation",
  domain: "vocation",
  conclusionKey: "domain_activated",
  ruleIds: ["MVP.VOCATION.001"],
  evidenceIds: ["calc-1:MVP.VOCATION.001"],
  supportingFactorIds: ["sun_in_house_10"],
};

function fakeOkFetch(text: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve({ content: [{ type: "text", text }] }),
  });
}

describe("createAnthropicNarrativeProvider — construction / fail-fast", () => {
  it("throws immediately on blank apiKey (no silent fallback)", () => {
    expect(() => createAnthropicNarrativeProvider({ apiKey: "" })).toThrow(/apiKey is required/);
    expect(() => createAnthropicNarrativeProvider({ apiKey: "  " })).toThrow(/apiKey is required/);
  });

  it("Test A — provider contract: satisfies NarrativeProvider shape", () => {
    const provider = createAnthropicNarrativeProvider({ apiKey: "test-key", fetchImpl: fakeOkFetch("ok") });
    expect(provider.modelProvider).toBe("anthropic");
    expect(typeof provider.modelVersion).toBe("string");
    expect(typeof provider.generateNarrative).toBe("function");
  });
});

describe("createAnthropicNarrativeProvider — Test B: prompt grounding", () => {
  it("sends a request built ONLY from the grounded prompt (buildNarrativePrompt constraints present)", async () => {
    const fetchImpl = fakeOkFetch("Lĩnh vực Nghề nghiệp được kích hoạt.");
    const provider = createAnthropicNarrativeProvider({ apiKey: "test-key", fetchImpl });
    await provider.generateNarrative(INPUT);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("anthropic.com");
    const body = JSON.parse(init.body as string) as { messages: { content: string }[] };
    const prompt: string = body.messages[0]?.content ?? "";

    // grounding constraints from buildNarrativePrompt must be present
    expect(prompt).toContain("Do not invent");
    expect(prompt).toContain("Vietnamese prose only");
    expect(prompt).toContain("domain: vocation");
    expect(prompt).toContain("conclusion: domain_activated");
    // never a Chart/Factor/ephemeris payload — only the grounded projection
    expect(prompt).not.toMatch(/ephemeris|birthData|longitude|latitude/i);
  });
});

describe("createAnthropicNarrativeProvider — Test C: no mock fallback on failure", () => {
  it("propagates a network error (rejects, no fallback narrative)", async () => {
    const provider = createAnthropicNarrativeProvider({
      apiKey: "test-key",
      fetchImpl: vi.fn().mockRejectedValue(new Error("network down")),
    });
    await expect(provider.generateNarrative(INPUT)).rejects.toThrow("network down");
  });

  it("propagates a non-2xx response as an error (rejects, no fallback narrative)", async () => {
    const provider = createAnthropicNarrativeProvider({
      apiKey: "test-key",
      fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: "Internal Server Error" }),
    });
    await expect(provider.generateNarrative(INPUT)).rejects.toThrow(/request failed \(500/);
  });

  it("rejects on empty/malformed model output rather than returning blank prose", async () => {
    const provider = createAnthropicNarrativeProvider({ apiKey: "test-key", fetchImpl: fakeOkFetch("   ") });
    await expect(provider.generateNarrative(INPUT)).rejects.toThrow(/empty narrative text/);
  });
});
