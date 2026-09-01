import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG_TOAN_DIEN, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { cacheCoBan, cacheNangCao, hashCoBan, hashNangCao } from "../../../../lib/tu-vi/luan-giai/cache";

export const prerender = false;

/**
 * Endpoint POLL trạng thái đơn (nhẹ) cho trang thanh toán — trả pending/confirmed/cancelled, và khi
 * confirmed thì kèm `baoCaoSan` (báo cáo đã có trong cache hay chưa).
 *
 * ⚠️ 1/9/2026: CHỈ ĐỌC cache (peek), TUYỆT ĐỐI KHÔNG tự tính luận giải ở đây — orders.ts (webhook
 * xác nhận thanh toán) đã gọi taoLuanGiaiTuVi() và hàm đó tự ghi cache theo hash lá số (cache.ts).
 * Nếu endpoint này cũng tự gọi taoLuanGiaiTuVi() khi cache trống thì sẽ ĐUA với chính webhook đang
 * tính — tốn gấp đôi lệnh AI mỗi khi khách vào trang đúng lúc webhook chưa tính xong. Cùng nguyên
 * tắc với luan-giai-bat-tu-toan-dien/result.ts.
 */
export const GET: APIRoute = async ({ url, request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-luan-giai-tu-vi", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  const slugHopLe = order?.toolSlug === TOOL_SLUG_TOAN_DIEN || order?.toolSlug === TOOL_SLUG_CO_BAN || order?.toolSlug === TOOL_SLUG_NANG_CAO;
  if (!order || order.orderType !== "tool" || !slugHopLe) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }
  if (!locals.user || order.userId !== locals.user.id) {
    return jsonResponse({ ok: false, error: "Bạn không có quyền xem đơn hàng này." }, 403);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);

  let baoCaoSan = false;
  if (order.toolInputSnapshot) {
    try {
      const input = JSON.parse(order.toolInputSnapshot) as { day: number; month: number; year: number; hour: number; gender: string };
      const coBanSan = !!cacheCoBan.get(hashCoBan(input));
      const nangCaoSan = !!cacheNangCao.get(hashNangCao({ ...input, viewingYear: new Date().getFullYear() }));
      baoCaoSan = coBanSan && nangCaoSan;
    } catch {
      // toolInputSnapshot hỏng — coi như chưa sẵn sàng, không chặn poll (client vẫn thấy "confirmed").
    }
  }
  return jsonResponse({ ok: true, status: "confirmed", baoCaoSan }, 200);
};
