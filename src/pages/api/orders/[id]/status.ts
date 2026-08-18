import type { APIRoute } from "astro";
import { getOrderById } from "../../../../lib/db/orders";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

// Đơn hàng cho khách vãng lai (không tài khoản) — id đơn (UUID ngẫu nhiên, không đoán được)
// đóng vai trò "token" truy cập, tương tự cách nhiều cổng thanh toán dùng order id làm mã tra cứu.
export const GET: APIRoute = async ({ params, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "order-status", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const order = await getOrderById(params.id!);
  if (!order) {
    return new Response(JSON.stringify({ ok: false, error: "Không tìm thấy đơn hàng." }), { status: 404 });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      status: order.status,
      orderType: order.orderType,
      orderCode: order.orderCode,
      courseRef: order.courseRef,
    }),
    { status: 200 }
  );
};
