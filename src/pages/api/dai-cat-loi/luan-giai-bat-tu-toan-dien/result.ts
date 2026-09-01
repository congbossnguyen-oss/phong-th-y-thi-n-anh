import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG_TOAN_DIEN, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { hashLaSo, cacheCoBan, cacheNangCao } from "../../../../lib/luan-giai-toan-dien/cache";
import { GIAI_DOAN_CO_BAN, GIAI_DOAN_NANG_CAO } from "../../../../lib/luan-giai-toan-dien/ai-narrative";
import type { BatTuInput } from "../../../../lib/bat-tu";

export const prerender = false;

/**
 * Endpoint POLL trạng thái đơn (nhẹ) cho trang thanh toán — trả pending/confirmed/cancelled, và khi
 * confirmed thì kèm `baoCaoSan` (báo cáo đã có trong cache hay chưa).
 *
 * ⚠️ 1/9/2026: CHỈ ĐỌC cache (peek), TUYỆT ĐỐI KHÔNG tự tính báo cáo ở đây — orders.ts (webhook xác
 * nhận thanh toán) đã tính VÀ lưu cache đúng lúc đơn chuyển "confirmed" (xem ghi chú cùng đợt sửa ở
 * đó). Nếu endpoint này cũng tự tính khi cache trống thì sẽ ĐUA (race) với chính webhook đang tính —
 * tốn gấp đôi lệnh AI cho cùng 1 đơn mỗi khi khách vào trang đúng lúc webhook chưa tính xong. Khách
 * chờ đến khi webhook tính xong (thường 30-60s) — trang tự poll endpoint này để biết khi nào xong.
 */
export const GET: APIRoute = async ({ url, request, clientAddress, locals }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-bat-tu-toan-dien", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  const slugHopLe = order?.toolSlug === TOOL_SLUG_TOAN_DIEN || order?.toolSlug === TOOL_SLUG_CO_BAN || order?.toolSlug === TOOL_SLUG_NANG_CAO;
  if (!order || order.orderType !== "tool" || !slugHopLe) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }
  // Chỉ chính chủ tài khoản mới được xem trạng thái đơn (báo cáo gắn theo tài khoản, không phải orderCode).
  if (!locals.user || order.userId !== locals.user.id) {
    return jsonResponse({ ok: false, error: "Bạn không có quyền xem đơn hàng này." }, 403);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);

  let baoCaoSan = false;
  if (order.toolInputSnapshot) {
    try {
      const input = JSON.parse(order.toolInputSnapshot) as BatTuInput;
      const key = hashLaSo(input);
      const cb = cacheCoBan.get(key);
      const nc = cacheNangCao.get(key);
      baoCaoSan = !!cb && !!nc && cb.giaiDoan.length === GIAI_DOAN_CO_BAN.length && nc.giaiDoan.length === GIAI_DOAN_NANG_CAO.length;
    } catch {
      // toolInputSnapshot hỏng — coi như chưa sẵn sàng, không chặn poll (client vẫn thấy "confirmed").
    }
  }
  return jsonResponse({ ok: true, status: "confirmed", baoCaoSan }, 200);
};
