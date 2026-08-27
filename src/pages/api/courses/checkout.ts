import type { APIRoute } from "astro";
import { createCourseOrder } from "../../../lib/db/orders";
import { getSepayQrUrl } from "../../../lib/payments/sepay";
import { checkRateLimit } from "../../../lib/rate-limit";
import { LoiNghiepVu } from "../../../lib/errors";

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
    if (err instanceof LoiNghiepVu) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 });
    }
    console.error("[courses/checkout] Lỗi không mong đợi khi tạo đơn hàng:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Rất tiếc, hệ thống đang gặp trục trặc khi tạo đơn hàng. Bạn thử lại sau ít phút giúp mình nhé, hoặc liên hệ Thiên Anh nếu vẫn lỗi.",
      }),
      { status: 500 },
    );
  }
};
