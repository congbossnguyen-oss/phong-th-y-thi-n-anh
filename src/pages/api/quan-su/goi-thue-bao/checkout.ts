import type { APIRoute } from "astro";
import { createSubscriptionOrder } from "../../../../lib/db/orders";
import { getSepayQrUrl } from "../../../../lib/payments/sepay";
import { giaSubscription, laSubscriptionTier, laSubscriptionDuration } from "../../../../lib/payments/gia-subscription";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Tạo đơn gói thuê bao "Quân Sư". BẮT BUỘC đăng nhập — quyền truy cập gói tính theo tài khoản.
 *
 * Mở bán thật cho mọi tài khoản (Thầy, 2026-09-14) — trước đó có giai đoạn thử nghiệm nội bộ chỉ
 * admin tạo đơn được, đã gỡ cổng đó khi cả 3 hạng (Cơ bản/Cao cấp/VIP) đều đã có giá thật trong
 * `gia-subscription.ts`. `giaSubscription()`/`GIA_SUBSCRIPTION[tier][duration]` ném lỗi/`null` nếu
 * lỡ có hạng nào chưa kịp điền giá sau này — chặn đúng ở bước tính tiền, không phải bug.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-goi-thue-bao", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập trước khi đăng ký gói." }, 401);
  }

  const body = await request.json().catch(() => null);
  const b = (body ?? {}) as Record<string, unknown>;
  const tier = b.tier;
  const duration = b.duration;
  if (!laSubscriptionTier(tier) || !laSubscriptionDuration(duration)) {
    return jsonResponse({ ok: false, error: "Hạng gói hoặc kỳ hạn không hợp lệ." }, 400);
  }

  // Không thu số điện thoại ở bước này nữa (Thầy, 2026-09-14) — quyền truy cập tính theo tài
  // khoản, không cần số liên hệ riêng cho gói thuê bao (khác các đơn công cụ lẻ vẫn cần liên hệ).
  const customerPhone = "";

  let totalAmount: number;
  try {
    totalAmount = giaSubscription(tier, duration);
  } catch {
    return jsonResponse({ ok: false, error: "Gói này chưa mở bán, vui lòng thử gói khác." }, 400);
  }

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

    return jsonResponse({ ok: true, orderCode, mienPhi: false, qrUrl: getSepayQrUrl({ amount: totalAmount, orderCode }), totalAmount }, 200);
  } catch (err) {
    return jsonResponse(
      { ok: false, error: thongBaoLoiAnToan(err, "Không tạo được đơn hàng, vui lòng thử lại sau.") },
      400,
    );
  }
};
