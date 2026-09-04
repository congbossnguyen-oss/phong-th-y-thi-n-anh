import type { APIRoute } from "astro";
import { tinhNguQuyVanTai, type NguQuyVanTaiInput } from "../../../../lib/ngu-quy-van-tai/engine";
import { getOrderByCode } from "../../../../lib/db/orders";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

const TOOL_SLUG = "ngu-quy-van-tai";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Đọc kết quả sau khi đơn đã thanh toán — tính LẠI từ input đã lưu (hàm thuần), không lưu sẵn
 * kết quả. Cùng khuôn Đẩu Thủ/Thúc Đinh Tài Quý. */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-ngu-quy-van-tai", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);
  if (!order.toolInputSnapshot) return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);

  try {
    const input = JSON.parse(order.toolInputSnapshot) as NguQuyVanTaiInput;
    const result = tinhNguQuyVanTai(input);
    return jsonResponse({ ok: true, status: "confirmed", result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
