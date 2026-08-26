import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG, type KyMonHoiDapInput } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { traTinhHuong, QUAN_HE_LABELS } from "../../../../lib/kymon/danhMucCauHoi";
import { lapLaBan } from "../../../../lib/kymon";
import { luanHoiDap } from "../../../../lib/kymon/hoiDap";

export const prerender = false;

/**
 * Endpoint POLL trạng thái đơn cho luồng thanh toán INLINE ngay trên /lap-ky-mon (không có trang
 * kết quả riêng như ky-mon-menh-chi-tiet — câu trả lời hiện thẳng bên dưới mục hỏi đáp).
 *
 * Nội dung luận giải lấy qua luanHoiDap() (lib/kymon/hoiDap.ts) — dùng chung với checkout nên hai
 * bên không thể lệch nhau. Từ khi mở bán, checkout đã chặn sẵn tình huống chưa có luật, nên nhánh
 * "dangCapNhat" dưới đây chỉ còn là lưới an toàn cho các đơn cũ tạo trước lúc mở bán.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "result-ky-mon-hoi-dap", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }

  if (order.status === "cancelled") return jsonResponse({ ok: true, status: "cancelled" }, 200);
  if (order.status !== "confirmed") return jsonResponse({ ok: true, status: "pending" }, 200);

  let echo: { chuDe: string; tinhHuong: string; quanHe: string; cauHoi: string } | null = null;
  let ketQuaLuan: { xuHuong: string; vanBan: string; chiTiet: string } | null = null;
  if (order.toolInputSnapshot) {
    try {
      const input = JSON.parse(order.toolInputSnapshot) as KyMonHoiDapInput;
      const tra = traTinhHuong(input.chuDeId, input.tinhHuongId);
      if (tra) {
        echo = {
          chuDe: tra.chuDe.nhan,
          tinhHuong: tra.tinhHuong.nhan,
          quanHe: QUAN_HE_LABELS[input.quanHe],
          cauHoi: input.cauHoi,
        };
      }
      const laBan = await lapLaBan(input.laBan);
      const kq = luanHoiDap(laBan, input.chuDeId, input.tinhHuongId, input.quanHe, input.thongTinBoSung ?? "");
      if (kq) ketQuaLuan = { xuHuong: kq.xuHuong, vanBan: kq.vanBan, chiTiet: kq.chiTiet };
    } catch (err) {
      console.error(`[ky-mon-hoi-dap] Lỗi dựng kết quả cho đơn ${orderCode}:`, err);
    }
  }

  if (ketQuaLuan) {
    return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: false, echo, ketQuaLuan }, 200);
  }
  return jsonResponse({ ok: true, status: "confirmed", dangCapNhat: true, echo }, 200);
};
