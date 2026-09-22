/**
 * Edge adapter: wires astrology-core's `createAnthropicNarrativeProvider` to this app's EXISTING
 * key-reading and Anthropic-relay conventions. Does not add a new API-key mechanism and does not
 * add a new HTTP client — only injects `baseUrl`/`fetchImpl` (already-supported extension points
 * on `AnthropicNarrativeProviderConfig`) so the relay's `x-relay-secret` header is attached.
 *
 * Server-side only. Never imported by client script/component code.
 */
import { createAnthropicNarrativeProvider, deterministicMockNarrativeProvider, type NarrativeProvider } from "@thien-anh/astrology-core";
import { layAnthropicApiKey } from "../chart-profile/api-key";
import { ANTHROPIC_MESSAGES_URL, anthropicHeaders } from "../anthropic-gateway";

const ANTHROPIC_VERSION = "2023-06-01";

export interface WesternAstrologyNarrativeProvider {
  provider: NarrativeProvider;
  kind: "anthropic" | "mock";
}

/**
 * Real provider when `ANTHROPIC_API_KEY` is configured (via the app's existing
 * `layAnthropicApiKey()`), routed through the app's existing relay (`anthropic-gateway.ts`) with
 * its required `x-relay-secret` header. Falls back to the deterministic mock — never throws just
 * because the key is absent, so the MVP page still renders.
 */
export function getWesternAstrologyNarrativeProvider(): WesternAstrologyNarrativeProvider {
  const apiKey = layAnthropicApiKey();
  if (apiKey === undefined) {
    return { provider: deterministicMockNarrativeProvider, kind: "mock" };
  }

  const relayFetch: typeof fetch = (input, init) => {
    const extraHeaders = anthropicHeaders(apiKey, ANTHROPIC_VERSION);
    return fetch(input, {
      ...init,
      headers: { ...(init?.headers as Record<string, string> | undefined), ...extraHeaders },
    });
  };

  const provider = createAnthropicNarrativeProvider({
    apiKey,
    baseUrl: ANTHROPIC_MESSAGES_URL,
    fetchImpl: relayFetch,
  });
  return { provider, kind: "anthropic" };
}
