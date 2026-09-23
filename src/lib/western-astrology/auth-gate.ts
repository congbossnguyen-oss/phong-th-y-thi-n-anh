/**
 * Phase 10B Gate 10B-1 — astrology entry auth gate (pure decision only).
 *
 * Authentication itself is done by the app's global middleware (`src/middleware.ts`), which populates
 * `Astro.locals.user`. This helper does NOT resolve sessions, parse cookies, or call
 * `validateSessionToken` — it only decides, from the already-resolved user, whether the astrology
 * entry route must redirect to login, and builds the `next` return-URL. Kept as a pure function so the
 * gate is unit-testable (Astro `.astro` frontmatter cannot be imported by vitest).
 */

/** Login route the app already uses for the student/member area. */
export const ASTROLOGY_LOGIN_PATH = "/hoc-vien/dang-nhap";

/**
 * @param user   `Astro.locals.user` (a SessionUser when authenticated, else null/undefined).
 * @param pathname `Astro.url.pathname`.
 * @param search   `Astro.url.search` (leading "?" included, or "").
 * @returns the login redirect URL (with `next` preserving the original path+query) when
 *          unauthenticated, or `null` when the request may proceed into the page/pipeline.
 */
export function astrologyLoginRedirect(
  user: unknown,
  pathname: string,
  search: string,
): string | null {
  if (user) return null;
  return `${ASTROLOGY_LOGIN_PATH}?next=${encodeURIComponent(pathname + search)}`;
}

/**
 * Gate 10B-2 — authorization (D-A = admin-only during the internal-test phase on `main`).
 *
 * Reuses `SessionUser.isAdmin` (the app's existing authz signal) — NO new entitlement, tier, or SKU.
 * Mirrors the established in-page admin gate of `/dai-cat-loi/.../kiem-chung`. Runs AFTER the 10B-1
 * auth gate (so a user is already present); an authenticated non-admin is sent home, hiding the
 * feature during internal test — exactly as `middleware.ts` does for `/quan-su/*`.
 *
 * @returns the home redirect when the user is not an admin, or `null` when access may proceed.
 */
export const ASTROLOGY_DENIED_PATH = "/";
export function astrologyAdminRedirect(user: { isAdmin?: boolean } | null | undefined): string | null {
  return user?.isAdmin === true ? null : ASTROLOGY_DENIED_PATH;
}
