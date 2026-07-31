import type { APIRoute } from "astro";
import { createProductOrder } from "../../../lib/db/orders";
import { getSepayQrUrl } from "../../../lib/payments/sepay";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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
    const message = err instanceof Error ? err.message : "Không tạo được đơn hàng.";
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 400 });
  }
};
