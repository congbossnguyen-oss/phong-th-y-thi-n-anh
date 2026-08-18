import type { APIRoute } from "astro";
import { goiYTen } from "@thien-anh/tinhdanh-engine";
import { getOrderByCode } from "../../../lib/db/orders";
import { checkRateLimit } from "../../../lib/rate-limit";
import type { DauVaoDatTen } from "./checkout";

export const prerender = false;

const TOOL_SLUG = "dat-ten-cho-con";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Trả kết quả GỢI Ý TÊN sau khi đơn đã thanh toán. orderCode chính là "vé" (không bắt đăng nhập,
 * giống module Giờ Liệm). Poll 3 giây/lần từ trang kết quả cho tới khi đơn `confirmed`.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-dat-ten", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);

  if (!order.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);
  }

  try {
    const input = JSON.parse(order.toolInputSnapshot) as DauVaoDatTen;
    const ketQua = goiYTen({ ...input, soLuong: 20 });
    return jsonResponse({ ok: true, status: "confirmed", ketQua }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
