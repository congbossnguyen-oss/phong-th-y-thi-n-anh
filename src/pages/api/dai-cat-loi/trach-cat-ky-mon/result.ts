import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG, type TrachCatToolInput } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { trachCat } from "../../../../lib/kymon/trachCat";

export const prerender = false;

/**
 * Endpoint POLL trạng thái đơn + trả kết quả chọn NGÀY. Kết quả được tính lại từ snapshot đầu vào
 * mỗi lần gọi (thuần công thức, không có yếu tố ngẫu nhiên nên luôn ra cùng một kết quả).
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-trach-cat-ky-mon", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);
  if (!order.toolInputSnapshot) {
    return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: true }, 200);
  }

  try {
    const input = JSON.parse(order.toolInputSnapshot) as TrachCatToolInput;
    const kq = await trachCat(input);
    if (!kq.hopLe) {
      return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: true, loi: kq.loi }, 200);
    }
    return jsonResponse(
      {
        ok: true,
        status: "confirmed",
        dangCapNhat: false,
        // nguon (tên video/tài liệu nội bộ) CỐ Ý không đưa vào response — khách không cần biết,
        // trước đây trang từng hiện thẳng dòng "Nguồn phương pháp: ..." (đã bỏ).
        viec: { nhan: kq.viec?.nhan, moTa: kq.viec?.moTa, luuY: kq.viec?.luuY },
        chiThangSinh: kq.chiThangSinh,
        chiNamSinh: kq.chiNamSinh,
        banMenh: kq.banMenh,
        phanTichChi: kq.phanTichChi,
        danhSachNgay: kq.danhSachNgay,
        canhBao: kq.canhBao,
      },
      200,
    );
  } catch (err) {
    console.error(`[trach-cat-ky-mon] Lỗi dựng kết quả cho đơn ${orderCode}:`, err);
    return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: true }, 200);
  }
};
