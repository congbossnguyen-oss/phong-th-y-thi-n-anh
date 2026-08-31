import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG_TOAN_DIEN, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * Endpoint POLL trạng thái đơn (nhẹ) cho trang thanh toán — KHÔNG tính luận giải ở đây (gọi AI
 * ~30s/lượt). Trang server-render tính khi khách vào lại (đã confirmed VÀ đúng chủ tài khoản),
 * có cache theo hash lá số — cùng mẫu luan-giai-bat-tu-toan-dien/result.ts.
 */
export const GET: APIRoute = async ({ url, request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-luan-giai-tu-vi", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  const slugHopLe = order?.toolSlug === TOOL_SLUG_TOAN_DIEN || order?.toolSlug === TOOL_SLUG_CO_BAN || order?.toolSlug === TOOL_SLUG_NANG_CAO;
  if (!order || order.orderType !== "tool" || !slugHopLe) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }
  if (!locals.user || order.userId !== locals.user.id) {
    return jsonResponse({ ok: false, error: "Bạn không có quyền xem đơn hàng này." }, 403);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);
  return jsonResponse({ ok: true, status: "confirmed" }, 200);
};
