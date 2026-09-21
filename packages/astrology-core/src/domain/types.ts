/**
 * Canonical Western interpretation domain vocabulary (Phase 8, H1 — HUMAN RATIFIED, Model C2-expanded).
 * Shared low-level contract referenced by BOTH the Rule layer (`Rule.domain`, D-BIND) and the
 * Interpretation layer — placed here (below both) to avoid a layering inversion.
 *
 * Đúng `docs/astrology-module/ARCHITECTURE/PHASE8_DECISIONS.md` (H1). Đúng 15 key Western-semantic;
 * KHÔNG alias, KHÔNG thêm domain, KHÔNG hierarchy, KHÔNG ranking, KHÔNG so sánh số học xuyên domain.
 * Keys KHÔNG mã hoá house number (giữ isolation với Vedic bhava — ADR-003).
 *
 * Thứ tự mảng `CANONICAL_DOMAINS` là thứ tự output deterministic của Interpretation Engine (D-EMIT).
 */

/** 15 canonical domains, in the frozen deterministic order (H1). */
export const CANONICAL_DOMAINS = [
  "character_temperament",
  "health",
  "wealth",
  "vocation",
  "status_reputation",
  "partnership",
  "friends_social",
  "family_home",
  "siblings_kin",
  "children",
  "travel",
  "religion_philosophy",
  "shared_resources",
  "adversaries",
  "mortality",
] as const;

/** Đúng một trong 15 canonical domains. */
export type CanonicalDomain = (typeof CANONICAL_DOMAINS)[number];

/** Type guard: `x` có phải canonical domain hợp lệ không. */
export function isCanonicalDomain(x: unknown): x is CanonicalDomain {
  return typeof x === "string" && (CANONICAL_DOMAINS as readonly string[]).includes(x);
}
