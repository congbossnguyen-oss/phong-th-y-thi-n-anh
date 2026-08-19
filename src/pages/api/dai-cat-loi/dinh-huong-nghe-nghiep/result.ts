import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * Endpoint POLL trạng thái đơn (nhẹ) cho trang thanh toán — chỉ trả pending/confirmed/cancelled.
 * KHÔNG tính kết quả ở đây: kết quả (gọi AI) do TRANG server-render tính khi khách vào lại với
 * ?orderCode=… (đã confirmed), tận dụng cache theo hash lá số để không gọi AI lặp mỗi 3 giây.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-dinh-huong-nghe", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);
  return jsonResponse({ ok: true, status: "confirmed" }, 200);
};
