import type { APIRoute } from "astro";
import { createProductOrder } from "../../../lib/db/orders";
import { getSepayQrUrl } from "../../../lib/payments/sepay";
import { checkRateLimit } from "../../../lib/rate-limit";
import { LoiNghiepVu } from "../../../lib/errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-order", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);

  const name = body?.name?.trim();
  const phone = body?.phone?.trim();
  const email = body?.email?.trim().toLowerCase();
  const address = body?.address?.trim();
  const note = body?.note?.trim() || null;
  const paymentMethod = body?.paymentMethod === "cod" ? "cod" : "sepay_qr";
  const lines = Array.isArray(body?.lines) ? body.lines : [];

  if (!name || !phone || !email || !address) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu thông tin giao hàng." }), { status: 400 });
  }

  try {
    const { orderId, orderCode, totalAmount } = await createProductOrder({
      userId: locals.user?.id ?? null,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress: address,
      note,
      paymentMethod,
      lines: lines.map((l: { slug: string; qty: number }) => ({ slug: l.slug, qty: l.qty })),
    });

    const qrUrl = paymentMethod === "sepay_qr" ? getSepayQrUrl({ amount: totalAmount, orderCode }) : null;

    return new Response(JSON.stringify({ ok: true, orderId, orderCode, totalAmount, paymentMethod, qrUrl }), { status: 200 });
  } catch (err) {
    if (err instanceof LoiNghiepVu) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 });
    }
    console.error("[orders/create] Lỗi không mong đợi khi tạo đơn hàng:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Rất tiếc, hệ thống đang gặp trục trặc khi tạo đơn hàng. Bạn thử lại sau ít phút giúp mình nhé, hoặc liên hệ Thiên Anh nếu vẫn lỗi.",
      }),
      { status: 500 },
    );
  }
};
