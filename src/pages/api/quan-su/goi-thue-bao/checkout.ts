import type { APIRoute } from "astro";
import { createSubscriptionOrder, markOrderPaidAndFulfill } from "../../../../lib/db/orders";
import { getSepayQrUrl } from "../../../../lib/payments/sepay";
import { GIA_SUBSCRIPTION, laSubscriptionTier, laSubscriptionDuration } from "../../../../lib/payments/gia-subscription";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Tạo đơn gói thuê bao "Quân Sư". BẮT BUỘC đăng nhập — quyền truy cập gói tính theo tài khoản.
 *
 * GIAI ĐOẠN THỬ NGHIỆM NỘI BỘ (đúng quy ước đang áp cho "Định Hướng Nghề Nghiệp"): chỉ tài khoản
 * quản trị được tạo đơn, và được đi luồng 0đ/tự xác nhận kể cả khi giá CHƯA chốt (`gia-subscription.ts`
 * còn `null`) — để Thầy test trọn luồng (tạo đơn → kích hoạt → coQuyenTruyCap) mà không cần giá thật.
 * Khi mở bán thật: xóa cổng admin-only NHƯNG vẫn phải điền đủ 8 giá trước, nếu không toàn bộ request
 * khách thường sẽ bị chặn ở bước tính tiền (đúng như thiết kế, không phải bug).
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-goi-thue-bao", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập trước khi đăng ký gói." }, 401);
  }
  if (locals.user.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Gói thuê bao đang trong giai đoạn thử nghiệm nội bộ, chưa mở bán." }, 403);
  }

  const body = await request.json().catch(() => null);
  const b = (body ?? {}) as Record<string, unknown>;
  const tier = b.tier;
  const duration = b.duration;
  if (!laSubscriptionTier(tier) || !laSubscriptionDuration(duration)) {
    return jsonResponse({ ok: false, error: "Hạng gói hoặc kỳ hạn không hợp lệ." }, 400);
  }

  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";
  if (!customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập số điện thoại liên hệ." }, 400);
  }

  // Giá thật nếu đã chốt; admin test khi chưa chốt giá thì coi như 0đ (không đụng tới khách thường
  // vì nhánh này chỉ chạy được khi đã qua cổng isAdmin ở trên).
  const giaThat = GIA_SUBSCRIPTION[tier][duration];
  const totalAmount = giaThat ?? 0;

  try {
    const { orderId, orderCode } = await createSubscriptionOrder({
      userId: locals.user.id,
      tier,
      duration,
      customerName: locals.user.name,
      customerPhone,
      customerEmail: locals.user.email,
      totalAmount,
    });

    if (totalAmount === 0) {
      await markOrderPaidAndFulfill(orderId);
      return jsonResponse({ ok: true, orderCode, mienPhi: true, qrUrl: null }, 200);
    }

    return jsonResponse({ ok: true, orderCode, mienPhi: false, qrUrl: getSepayQrUrl({ amount: totalAmount, orderCode }) }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
