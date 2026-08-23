import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Poll trạng thái đơn gói thuê bao (nhẹ) cho trang thanh toán — chỉ trả pending/confirmed/cancelled. */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-goi-thue-bao", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "subscription") {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);
  return jsonResponse({ ok: true, status: "confirmed" }, 200);
};
