// Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
import type { APIRoute } from "astro";
import { calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import { getOrderByCode } from "../../../../../lib/db/orders";
import { checkRateLimit } from "../../../../../lib/rate-limit";

export const prerender = false;

const TOOL_SLUG = "gio-liem-ha-huyet-qs";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-gio-liem-qs", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) {
    return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);
  }

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  // ⚠️ CỐ Ý KHÔNG kiểm tra chính chủ ở module tang lễ. Công cụ này không bắt đăng nhập, orderCode
  // chính là "vé" (8 ký tự ngẫu nhiên từ 32 ký tự = ~1.1e12 khả năng, không đoán được).
  //
  // Từng thêm ràng buộc "đơn có userId thì phải đúng tài khoản" và đó là lỗi: đơn vẫn dính userId
  // nếu khách tình cờ đang đăng nhập, mà phiên đăng nhập bị hủy ngay khi IP đổi (xem
  // lib/auth/session.ts). Khách đặt đơn qua wifi rồi ra ngoài dùng 4G là mất luôn kết quả đã trả
  // tiền, gửi link cho người nhà cũng không mở được.

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
