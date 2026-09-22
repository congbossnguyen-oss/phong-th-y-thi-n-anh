/**
 * MVP DEMONSTRATION RuleSet — thin app-layer adapter.
 *
 * This is NOT new astrology methodology. It is the exact same synthetic `mvp.demo.v1` RuleSet
 * ratified and used by the astrology-core vertical-slice tests (see
 * `packages/astrology-core/src/__tests__/pipeline.test.ts` and
 * `packages/astrology-core/src/narrative/__tests__/renderer.test.ts`), copied here so the app layer
 * can drive the pipeline without adding any new Rule/Domain content or touching `astrology-core`.
 *
 * Two rules, each bound to exactly one existing H1 canonical domain (D-BIND/D-MULTI):
 *  - MVP.VOCATION.001 → vocation   (fires when Factor "sun_in_house_10" is present)
 *  - MVP.HEALTH.001   → health     (fires when Factor "mars_in_house_6" is present)
 * Both patterns use the real Western Factor Engine grammar (`<body>_in_house_<n>`), so this
 * fixture can fire against a REAL calculated chart, not only synthetic test factors.
 *
 * Western RuleSet V1 (the frozen production content) is untouched — this is a separate,
 * clearly-labeled demo ruleset, never merged with it.
 */
import type { Rule, RuleSet } from "@thien-anh/astrology-core";

function mvpRule(id: string, domain: "vocation" | "health", pattern: string): Rule {
  return {
    id,
    school: "western",
    version: "1.0.0",
    rulesetVersion: "mvp.demo.v1",
    prerequisites: [],
    conditions: { op: "factorPresent", pattern },
    domain,
  };
}

export const MVP_DEMO_RULESET: RuleSet = {
  school: "western",
  version: "mvp.demo.v1",
  rules: [
    mvpRule("MVP.VOCATION.001", "vocation", "sun_in_house_10"),
    mvpRule("MVP.HEALTH.001", "health", "mars_in_house_6"),
  ],
};
