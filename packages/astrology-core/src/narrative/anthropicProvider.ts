/**
 * Real Anthropic-backed `NarrativeProvider` — D3 OVERRIDE (see `PHASE9_DECISIONS.md`, "D3 — REVISED":
 * a human-ratified override of the original D3 "no real vendor integration in astrology-core").
 *
 * Still vendor-ABSTRACTED behind `NarrativeProvider` (no vendor SDK dependency added — raw `fetch`,
 * matching the app's own convention in `src/lib/chart-profile/llm.ts`). No API key hardcoded — it is
 * injected via config by the caller (the edge), never read from `process.env` inside this package.
 *
 * Grounding stays intact: only the deterministic `NarrativeInput` projection (never Chart/Factor/
 * ephemeris — see `toNarrativeInput`) is sent to the model, via the existing constrained
 * `buildNarrativePrompt`. This provider's output remains UNTRUSTED text — `createNarrativeEngine`'s
 * deterministic `checkGrounding` (D1) is the safety net against anything this provider might hallucinate.
 *
 * On any failure (network error, non-2xx response, malformed/empty content) this provider THROWS.
 * It never falls back to the mock and never fabricates a narrative.
 */

import { buildNarrativePrompt } from "./renderer.js";
import type { NarrativeInput, NarrativeProvider } from "./types.js";

const DEFAULT_MODEL = "claude-sonnet-5";
const DEFAULT_BASE_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 1024;

export interface AnthropicNarrativeProviderConfig {
  /** Required. Never hardcode — the caller reads this from its own config/env at the edge. */
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  /** Injectable for tests — unit tests must never call the real network. Defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
}

interface AnthropicMessageContentBlock {
  type: string;
  text?: string;
}
interface AnthropicMessagesResponse {
  content?: AnthropicMessageContentBlock[];
}

/** Builds a real Anthropic-backed NarrativeProvider. Throws immediately if `apiKey` is missing/blank. */
export function createAnthropicNarrativeProvider(config: AnthropicNarrativeProviderConfig): NarrativeProvider {
  if (config.apiKey.trim() === "") {
    throw new Error("createAnthropicNarrativeProvider: apiKey is required (fail fast — no silent fallback)");
  }
  const apiKey = config.apiKey;
  const model = config.model ?? DEFAULT_MODEL;
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS;
  const doFetch = config.fetchImpl ?? fetch;

  return {
    modelProvider: "anthropic",
    modelVersion: model,
    async generateNarrative(input: NarrativeInput): Promise<string> {
      // Prompt is built ONLY from the grounded NarrativeInput — no Chart/Factor/ephemeris ever reaches here.
      const prompt = buildNarrativePrompt(input);

      const response = await doFetch(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`AnthropicNarrativeProvider: request failed (${response.status} ${response.statusText})`);
      }

      const data = (await response.json()) as AnthropicMessagesResponse;
      const text = (data.content ?? [])
        .filter((block): block is AnthropicMessageContentBlock & { text: string } => block.type === "text" && typeof block.text === "string")
        .map((block) => block.text)
        .join("")
        .trim();

      if (text.length === 0) {
        throw new Error("AnthropicNarrativeProvider: model returned empty narrative text");
      }
      return text;
    },
  };
}
