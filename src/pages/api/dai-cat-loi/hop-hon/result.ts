import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";

export const prerender = false;

const TOOL_SLUG = "hop-hon";

/**
 * Tra trạng thái đơn Hợp Hôn — CHỈ trả trạng thái, không trả nội dung luận giải.
 *
 * Trang `/dai-cat-loi/hop-hon?orderCode=...` tự dựng kết quả phía máy chủ, endpoint này chỉ phục vụ
 * vòng poll sau khi hiện QR để biết lúc nào tiền về mà chuyển trang. Cố ý KHÔNG trả nội dung: dữ
 * liệu hợp hôn gắn với đời tư 2 người, không nên đi qua một endpoint chỉ cần biết mã đơn.
 */
export const GET: APIRoute = async ({ url }) => {
  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu mã đơn." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const order = await getOrderByCode(orderCode);
  const hopLe = order && order.orderType === "tool" && order.toolSlug === TOOL_SLUG;
  return new Response(
    JSON.stringify(hopLe ? { ok: true, status: order.status } : { ok: false, error: "Không tìm thấy đơn." }),
    { status: hopLe ? 200 : 404, headers: { "Content-Type": "application/json" } },
  );
};
