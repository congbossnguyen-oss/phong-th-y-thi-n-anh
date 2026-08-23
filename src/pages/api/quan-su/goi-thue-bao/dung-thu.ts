import type { APIRoute } from "astro";
import { batDauDungThu } from "../../../../lib/subscriptions/trial";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Kích hoạt dùng thử 7 ngày (hạng Cao cấp, miễn phí, không qua SePay). GIAI ĐOẠN THỬ NGHIỆM NỘI
 * BỘ giống `checkout.ts` — chỉ tài khoản quản trị dùng được lúc này; gỡ cổng admin-only cùng lúc
 * với `checkout.ts` khi Thầy mở bán thật.
 */
export const POST: APIRoute = async ({ locals, clientAddress, request }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "dung-thu-goi-thue-bao", max: 5, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập trước khi dùng thử." }, 401);
  }
  if (locals.user.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Dùng thử đang trong giai đoạn thử nghiệm nội bộ, chưa mở cho khách." }, 403);
  }

  try {
    const { expiresAt } = await batDauDungThu(locals.user.id);
    return jsonResponse({ ok: true, expiresAt: expiresAt.toISOString() }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không kích hoạt được dùng thử." }, 400);
  }
};
