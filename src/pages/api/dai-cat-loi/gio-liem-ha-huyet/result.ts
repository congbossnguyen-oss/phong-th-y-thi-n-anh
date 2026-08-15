import type { APIRoute } from "astro";
import { calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import { getOrderByCode } from "../../../../lib/db/orders";

export const prerender = false;

const TOOL_SLUG = "gio-liem-ha-huyet";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) {
    return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);
  }

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  // Đơn tạo từ khi bắt đăng nhập luôn có userId → chỉ chính chủ mới xem được kết quả.
  // Đơn cũ (userId null, thời còn cho mua không tài khoản) vẫn dùng orderCode làm "vé" như trước,
  // nếu không những đơn đó sẽ mất kết quả vĩnh viễn.
  if (order.userId && order.userId !== locals.user?.id) {
    return jsonResponse({ ok: false, error: "Đơn hàng này không thuộc tài khoản đang đăng nhập." }, 403);
  }

  if (order.status === "cancelled") {
    return jsonResponse({ ok: true, status: "cancelled" }, 200);
  }
  if (order.status !== "confirmed") {
    return jsonResponse({ ok: true, status: "pending" }, 200);
  }

  if (!order.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);
  }

  try {
    const input = JSON.parse(order.toolInputSnapshot) as GioLiemHaHuyetInput;
    const result = calculateGioLiemHaHuyet(input);
    return jsonResponse({ ok: true, status: "confirmed", result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
