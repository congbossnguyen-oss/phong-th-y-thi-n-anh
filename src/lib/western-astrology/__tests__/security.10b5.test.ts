/**
 * Phase 10B Gate 10B-5 — security / adversarial validation (admin-only, no persistence, no metering).
 *
 * Closes the three PARTIAL areas from the audit:
 *   T1 — server-only boundary: nothing server-only/secret/session/db leaks into the ViewModel (what
 *        reaches the SSR template / client). (SSR + no-public-API + adapter-server-only are documented
 *        as structural evidence in the gate report — not runtime-testable without a bundler.)
 *   T2 — parameter / adversarial input: malformed inputs are rejected via the existing refusal path.
 *   T3 — provider input projection: the provider receives ONLY the 6-field NarrativeInput projection.
 *
 * All network-free and deterministic via the orchestrator's test-injection seam. No persistence, no
 * metering, no astrology-core change.
 */
import { describe, expect, it } from "vitest";
import { deterministicMockNarrativeProvider, type NarrativeProvider } from "@thien-anh/astrology-core";
import { runWesternAstrologyMvp } from "../index";
import type { WesternAstrologyMvpInput } from "../view-model";

const FIRING_INPUT: WesternAstrologyMvpInput = {
  date: { year: 1990, month: 6, day: 15 },
  time: { hour: 11, minute: 0 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 21.0278,
  longitude: 105.8342,
  locationLabel: "Hà Nội",
};
const mockInjection = { narrativeProvider: { provider: deterministicMockNarrativeProvider, kind: "mock" as const } };

const ALLOWED_VM_KEYS = ["status", "narrativeProviderKind", "errors", "chart", "chartData", "interpretations"];
const ALLOWED_INTERP_KEYS = [
  "conclusionKey", "domain", "domainLabel", "evidenceIds", "groundingCheckPassed",
  "modelProvider", "modelVersion", "narrativeText", "ruleIds", "supportingFactorIds",
].sort();
const SECRET_RE = /apikey|sk-ant|x-relay|relay_shared_secret|anthropic_api_key|\bcookie\b|bearer /i;

describe("Gate 10B-5 T1 — server-only boundary (no secret/session/db leaks into ViewModel)", () => {
  it("ViewModel exposes only known presentation keys — no server-only/secret/session field", async () => {
    const vm = await runWesternAstrologyMvp(FIRING_INPUT, mockInjection);
    expect(vm.status).toBe("success");
    for (const k of Object.keys(vm)) expect(ALLOWED_VM_KEYS).toContain(k);
    for (const interp of vm.interpretations) {
      expect(Object.keys(interp).sort()).toEqual(ALLOWED_INTERP_KEYS);
    }
    // No secret/relay/session/key material anywhere in what reaches the template.
    expect(SECRET_RE.test(JSON.stringify(vm))).toBe(false);
  });
});

describe("Gate 10B-5 T2 — adversarial / malformed input → existing refusal (missing_input)", () => {
  const cases: Array<[string, WesternAstrologyMvpInput]> = [
    ["month out of range (13)", { ...FIRING_INPUT, date: { year: 1990, month: 13, day: 15 } }],
    ["day out of range (32)", { ...FIRING_INPUT, date: { year: 1990, month: 6, day: 32 } }],
    ["latitude boundary (91)", { ...FIRING_INPUT, latitude: 91 }],
    ["longitude boundary (181)", { ...FIRING_INPUT, longitude: 181 }],
    ["hour out of range (25)", { ...FIRING_INPUT, time: { hour: 25, minute: 0 } }],
    ["NaN latitude", { ...FIRING_INPUT, latitude: Number.NaN }],
    ["non-finite longitude (Infinity)", { ...FIRING_INPUT, longitude: Number.POSITIVE_INFINITY }],
  ];
  for (const [name, input] of cases) {
    it(`${name} → missing_input, no crash, no interpretations`, async () => {
      const vm = await runWesternAstrologyMvp(input, mockInjection);
      expect(vm.status).toBe("missing_input");
      expect(vm.errors.length).toBeGreaterThan(0);
      expect(vm.interpretations).toEqual([]);
    });
  }

  it("unsafe free-text locationLabel does not crash and never appears in the ViewModel output", async () => {
    const xss = "<script>alert(1)</script>";
    const vm = await runWesternAstrologyMvp({ ...FIRING_INPUT, locationLabel: xss }, mockInjection);
    expect(vm.status).toBe("success"); // locationLabel is display-only; must not affect calculation
    expect(JSON.stringify(vm)).not.toContain("<script>"); // free text is not echoed into the VM
  });
});

describe("Gate 10B-5 T3 — provider input projection / pipeline isolation", () => {
  it("provider receives ONLY the 6-field NarrativeInput projection (no chart/secret/session/config)", async () => {
    const captured: Array<Record<string, unknown>> = [];
    const spy: NarrativeProvider = {
      modelProvider: "spy",
      modelVersion: "v0",
      generateNarrative: (input) => {
        captured.push(input as unknown as Record<string, unknown>);
        return Promise.resolve("Lĩnh vực Nghề nghiệp được kích hoạt bởi 1 quy tắc (MVP.VOCATION.001).");
      },
    };
    await runWesternAstrologyMvp(FIRING_INPUT, { narrativeProvider: { provider: spy, kind: "mock" } });

    expect(captured.length).toBeGreaterThan(0);
    for (const arg of captured) {
      // Exactly the NarrativeInput projection — nothing more.
      expect(Object.keys(arg).sort()).toEqual(
        ["conclusionKey", "domain", "evidenceIds", "interpretationId", "ruleIds", "supportingFactorIds"],
      );
      // Explicitly NOT the raw InterpretationObject or any server-only internals.
      for (const forbidden of ["conclusion", "caveats", "version", "apiKey", "user", "session", "chart", "factors", "config", "provider"]) {
        expect(arg).not.toHaveProperty(forbidden);
      }
    }
  });
});
