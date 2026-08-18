import type { APIRoute } from "astro";
import { calculateNgayKyHopDongCaoCap, type NgayKyHopDongCaoCapInput } from "@thien-anh/trachnhat-engine";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * Đọc kết quả sau khi đơn đã thanh toán. Tính lại từ input đã lưu (không lưu sẵn kết quả) vì hàm
 * tính là thuần/deterministic — tránh lệch dữ liệu nếu công thức được sửa sau.
 *
 * ⚠️ CỐ Ý không kiểm tra chính chủ: module này không bắt đăng nhập, orderCode là "vé" (8 ký tự
 * ngẫu nhiên từ bộ 32 ký tự). Cùng lý do đã ghi ở module tang lễ.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-ky-hd", max: 60, windowMs: 60_000 });
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
    const input = JSON.parse(order.toolInputSnapshot) as NgayKyHopDongCaoCapInput;
    return jsonResponse({ ok: true, status: "confirmed", result: calculateNgayKyHopDongCaoCap(input) }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
