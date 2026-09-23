/**
 * Phase 10B Gate 10B-1 — authentication-gate test.
 *
 * Astro `.astro` frontmatter cannot be imported by vitest, so this test exercises the pure gate
 * decision (`astrologyLoginRedirect`) AND a faithful mirror of the page's control flow — the page
 * does exactly `const r = astrologyLoginRedirect(...); if (r) return Astro.redirect(r); <compute>`.
 * `simulateEntry` reproduces that guard so we can assert the pipeline is NOT reached when redirected.
 */
import { describe, expect, it, vi } from "vitest";
import { astrologyLoginRedirect, ASTROLOGY_LOGIN_PATH } from "../auth-gate";

/** Mirrors src/pages/astrology-mvp.astro: redirect string ⇒ early return (no compute); else run pipeline. */
function simulateEntry(
  user: unknown,
  pathname: string,
  search: string,
  runPipeline: () => void,
): { redirectedTo: string | null; pipelineRan: boolean } {
  const redirect = astrologyLoginRedirect(user, pathname, search);
  if (redirect) return { redirectedTo: redirect, pipelineRan: false };
  runPipeline();
  return { redirectedTo: null, pipelineRan: true };
}

const AUTHED_USER = { id: "u1", email: "u@example.com", name: "U", isAdmin: false, hoSoSinh: null, daXemChaoMungQuanSu: true };

describe("Gate 10B-1 — astrology entry authentication gate", () => {
  it("Case 1: unauthenticated → redirect to login, `next` preserves path+query, pipeline NOT executed", () => {
    const pipeline = vi.fn();
    const pathname = "/astrology-mvp";
    const search = "?date=1990-06-15&hour=11&minute=0";

    for (const anon of [null, undefined]) {
      const r = simulateEntry(anon, pathname, search, pipeline);
      expect(r.redirectedTo).not.toBeNull();
      expect(r.redirectedTo!.startsWith(`${ASTROLOGY_LOGIN_PATH}?next=`)).toBe(true);
      // `next` round-trips to the exact original path + query.
      const next = new URLSearchParams(r.redirectedTo!.split("?")[1]).get("next");
      expect(next).toBe(pathname + search);
      expect(r.pipelineRan).toBe(false);
    }
    expect(pipeline).not.toHaveBeenCalled(); // pipeline never reached when unauthenticated
  });

  it("Case 2: authenticated → no redirect, request proceeds into the existing pipeline", () => {
    const pipeline = vi.fn();
    const r = simulateEntry(AUTHED_USER, "/astrology-mvp", "?date=1990-06-15", pipeline);
    expect(r.redirectedTo).toBeNull();
    expect(r.pipelineRan).toBe(true);
    expect(pipeline).toHaveBeenCalledOnce();
  });

  it("empty query string still produces a valid `next` (no crash, exact round-trip)", () => {
    const r = astrologyLoginRedirect(null, "/astrology-mvp", "");
    expect(new URLSearchParams(r!.split("?")[1]).get("next")).toBe("/astrology-mvp");
  });
});
