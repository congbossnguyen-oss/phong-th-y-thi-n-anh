import type { APIRoute } from "astro";
import { createCourseOrder } from "../../../lib/db/orders";
import { getSepayQrUrl } from "../../../lib/payments/sepay";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-course", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return new Response(JSON.stringify({ ok: false, error: "Cần đăng nhập." }), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseSlug = body?.courseSlug;
  const phone = body?.phone?.trim();

  if (!courseSlug || !phone) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu thông tin." }), { status: 400 });
  }

  try {
    const { orderId, orderCode, totalAmount } = await createCourseOrder({
      userId: locals.user.id,
      customerName: locals.user.name,
      customerPhone: phone,
      customerEmail: locals.user.email,
      courseSlug,
    });

    const qrUrl = getSepayQrUrl({ amount: totalAmount, orderCode });

    return new Response(JSON.stringify({ ok: true, orderId, orderCode, totalAmount, qrUrl }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Không tạo được đơn hàng.";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400 });
  }
};
