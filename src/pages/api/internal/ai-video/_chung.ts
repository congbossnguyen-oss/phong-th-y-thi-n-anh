/**
 * Helper dùng chung cho mọi route CONG AI VIDEO — module NỘI BỘ (chỉ admin), xem
 * src/lib/ai-video/README.md. Đặt tên bắt đầu bằng dấu gạch dưới để Astro KHÔNG coi đây là route.
 */
import type { APIContext } from "astro";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Chặn ngay nếu không phải admin — trả sẵn Response 403, route chỉ cần `if (chan) return chan;`. */
export function chanKhongPhaiAdmin(locals: APIContext["locals"]): Response | null {
  if (locals.user?.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "AI TiaTextVi là công cụ nội bộ — chỉ admin được dùng." }, 403);
  }
  return null;
}
