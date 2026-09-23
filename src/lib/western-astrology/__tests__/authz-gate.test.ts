/**
 * Phase 10B Gate 10B-2 — authorization gate test (D-A = admin-only, internal-test phase).
 *
 * Mirrors src/pages/astrology-mvp.astro's two ordered pre-checks:
 *   1) astrologyLoginRedirect  → unauthenticated ⇒ login redirect (Gate 10B-1)
 *   2) astrologyAdminRedirect  → authenticated non-admin ⇒ home redirect (Gate 10B-2)
 * `simulateEntry` reproduces that exact control flow so we can assert the pipeline is unreachable
 * unless the request is an authenticated ADMIN.
 */
import { describe, expect, it, vi } from "vitest";
import {
  astrologyLoginRedirect,
  astrologyAdminRedirect,
  ASTROLOGY_DENIED_PATH,
  ASTROLOGY_LOGIN_PATH,
} from "../auth-gate";

/** Faithful mirror of the page: login gate, then admin gate, then compute. */
function simulateEntry(
  user: { isAdmin?: boolean } | null | undefined,
  pathname: string,
  search: string,
  runPipeline: () => void,
): { redirectedTo: string | null; pipelineRan: boolean } {
  const login = astrologyLoginRedirect(user, pathname, search);
  if (login) return { redirectedTo: login, pipelineRan: false };
  const admin = astrologyAdminRedirect(user);
  if (admin) return { redirectedTo: admin, pipelineRan: false };
  runPipeline();
  return { redirectedTo: null, pipelineRan: true };
}

const ADMIN = { id: "a1", email: "a@example.com", name: "A", isAdmin: true, hoSoSinh: null, daXemChaoMungQuanSu: true };
const NON_ADMIN = { id: "u1", email: "u@example.com", name: "U", isAdmin: false, hoSoSinh: null, daXemChaoMungQuanSu: true };

describe("Gate 10B-2 — astrology authorization (admin-only, internal test)", () => {
  it("authenticated NON-admin → redirected home, pipeline NOT executed", () => {
    const pipeline = vi.fn();
    const r = simulateEntry(NON_ADMIN, "/astrology-mvp", "?date=1990-06-15", pipeline);
    expect(r.redirectedTo).toBe(ASTROLOGY_DENIED_PATH); // "/"
    expect(r.pipelineRan).toBe(false);
    expect(pipeline).not.toHaveBeenCalled();
  });

  it("authenticated ADMIN → no redirect, proceeds into the pipeline", () => {
    const pipeline = vi.fn();
    const r = simulateEntry(ADMIN, "/astrology-mvp", "?date=1990-06-15", pipeline);
    expect(r.redirectedTo).toBeNull();
    expect(r.pipelineRan).toBe(true);
    expect(pipeline).toHaveBeenCalledOnce();
  });

  it("unauthenticated → login gate wins BEFORE the admin gate (ordering preserved)", () => {
    const pipeline = vi.fn();
    for (const anon of [null, undefined]) {
      const r = simulateEntry(anon, "/astrology-mvp", "?date=1990-06-15", pipeline);
      expect(r.redirectedTo!.startsWith(`${ASTROLOGY_LOGIN_PATH}?next=`)).toBe(true);
      expect(r.pipelineRan).toBe(false);
    }
    expect(pipeline).not.toHaveBeenCalled();
  });

  it("astrologyAdminRedirect is a pure isAdmin check (no new entitlement)", () => {
    expect(astrologyAdminRedirect(ADMIN)).toBeNull();
    expect(astrologyAdminRedirect(NON_ADMIN)).toBe("/");
    expect(astrologyAdminRedirect(null)).toBe("/");
    expect(astrologyAdminRedirect(undefined)).toBe("/");
    expect(astrologyAdminRedirect({})).toBe("/"); // missing isAdmin ⇒ denied
  });
});
