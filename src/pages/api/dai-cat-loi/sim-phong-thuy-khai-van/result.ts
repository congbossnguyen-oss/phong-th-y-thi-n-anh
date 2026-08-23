import type { APIRoute } from "astro";
import { Scoring } from "@thien-anh/rule-engine";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG, type SimPhongThuyInput } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * Đọc trạng thái đơn sau khi thanh toán. KHÔNG có "kết quả tính toán" như các module khác — đây là
 * dịch vụ thủ công, chuyên gia đã nhận đủ thông tin qua email báo cáo (markOrderPaidAndFulfill) và
 * sẽ liên hệ trực tiếp. Trang chỉ cần biết đơn đã "confirmed" để hiện lời cảm ơn + tóm tắt yêu cầu.
 *
 * ⚠️ CỐ Ý không kiểm tra chính chủ: module không bắt đăng nhập, orderCode là "vé" ngẫu nhiên.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-sim-phong-thuy", max: 60, windowMs: 60_000 });
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
    return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);
  }

  try {
    const input = JSON.parse(order.toolInputSnapshot) as SimPhongThuyInput;
    const banMenh = Scoring.getNapAm(input.ngaySinh.year);
    return jsonResponse(
      {
        ok: true,
        status: "confirmed",
        result: {
          hoTen: input.hoTen,
          banMenh,
          soDienThoaiZalo: input.soDienThoaiZalo,
        },
      },
      200,
    );
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không đọc được thông tin đơn hàng." }, 500);
  }
};
