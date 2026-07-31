import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { orders, sepayWebhookLogs } from "../../../../db/schema";
import { extractOrderCodeFromContent, verifySepayWebhookAuth, type SepayWebhookPayload } from "../../../lib/payments/sepay";
import { markOrderPaidAndFulfill } from "../../../lib/db/orders";

export const prerender = false;

// SePay yêu cầu phản hồi HTTP 200/201 kèm {"success": true} trong vòng 30s, nếu không sẽ
// tự động thử lại (tối đa 7 lần trong 5 giờ) — nên với mọi lỗi KHÔNG PHẢI do xác thực,
// vẫn trả 200 để tránh SePay spam retry vô ích những giao dịch không thể xử lý được nữa.
const ok = () => new Response(JSON.stringify({ success: true }), { status: 200 });

export const POST: APIRoute = async ({ request }) => {
  if (!verifySepayWebhookAuth(request.headers.get("authorization"))) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as SepayWebhookPayload | null;
  if (!payload || typeof payload.id === "undefined") {
    return ok();
  }

  // Chỉ xử lý giao dịch tiền VÀO — bỏ qua giao dịch ra.
  if (payload.transferType !== "in") {
    return ok();
  }

  const webhookId = String(payload.id);

  // Ghi log webhook trước — ràng buộc UNIQUE trên id chống xử lý trùng khi SePay gửi lại
  // (mạng lỗi, timeout...). Nếu insert bị conflict nghĩa là đã xử lý giao dịch này rồi.
  const inserted = await db
    .insert(sepayWebhookLogs)
    .values({
      id: webhookId,
      content: payload.content,
      transferAmount: String(payload.transferAmount),
    })
    .onConflictDoNothing({ target: sepayWebhookLogs.id })
    .returning({ id: sepayWebhookLogs.id });

  if (inserted.length === 0) {
    // Đã xử lý trước đó — trả success để SePay dừng retry.
    return ok();
  }

  const orderCode = extractOrderCodeFromContent(payload.content) ?? extractOrderCodeFromContent(payload.description ?? "");
  if (!orderCode) {
    console.error("[sepay-webhook] Không tìm thấy mã đơn hàng trong nội dung:", payload.content);
    return ok();
  }

  const [order] = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).limit(1);
  if (!order) {
    console.error("[sepay-webhook] Không tìm thấy đơn hàng với mã:", orderCode);
    return ok();
  }

  await db.update(sepayWebhookLogs).set({ orderId: order.id }).where(eq(sepayWebhookLogs.id, webhookId));

  if (order.status !== "pending_payment") {
    // Đơn đã được xác nhận từ trước (hoặc đã hủy) — không xử lý lại.
    return ok();
  }

  if (Number(payload.transferAmount) < Number(order.totalAmount)) {
    console.error(`[sepay-webhook] Số tiền chuyển khoản (${payload.transferAmount}) nhỏ hơn tổng đơn (${order.totalAmount}) — đơn ${orderCode}`);
    return ok();
  }

  await markOrderPaidAndFulfill(order.id);

  return ok();
};
