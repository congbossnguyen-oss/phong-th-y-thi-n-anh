import type { APIRoute } from "astro";
import { tinhThucDinhTaiQuy, type ThucDinhTaiQuyInput } from "@thien-anh/trachnhat-engine";
import { getOrderByCode } from "../../../../lib/db/orders";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/** Đọc kết quả sau khi đơn đã thanh toán — tính LẠI từ input đã lưu (hàm thuần), không lưu sẵn
 * kết quả. Cùng khuôn `dau-thu-chon-ngay/result.ts`. */

const TOOL_SLUG = "thuc-dinh-tai-quy";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-thuc-dinh-tai-quy", max: 60, windowMs: 60_000 });
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
    const input = JSON.parse(order.toolInputSnapshot) as ThucDinhTaiQuyInput;
    const result = tinhThucDinhTaiQuy(input);
    return jsonResponse({ ok: true, status: "confirmed", loaiTrach: input.loaiTrach, result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
