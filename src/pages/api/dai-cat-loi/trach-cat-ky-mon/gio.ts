import type { APIRoute } from "astro";
import { getOrderByCode } from "../../../../lib/db/orders";
import { jsonResponse, TOOL_SLUG, type TrachCatToolInput } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { chonGioTrongNgay } from "../../../../lib/kymon/trachCat";

export const prerender = false;

/**
 * Trả về LÁ BÀN TỬ CỤC + danh sách giờ tốt cho MỘT ngày khách đã bấm chọn.
 *
 * Đây là bước 2 của phương pháp (zhicong-11.md Video 7-8): từ bàn mệnh (mẫu cục) suy ra tử cục
 * của ngày đã chọn bằng ngũ thử độn, rồi chấm điểm từng khung giờ trên tử cục đó.
 *
 * Vẫn phải kiểm tra đơn đã xác nhận — endpoint này trả nội dung thu phí. Ngày truyền lên bắt buộc
 * phải nằm trong khoảng ngày của chính đơn đó, tránh dùng 1 đơn để tra vô hạn ngày khác.
 */
export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "gio-trach-cat-ky-mon", max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const orderCode = url.searchParams.get("orderCode");
  const ngayChon = url.searchParams.get("ngay");
  if (!orderCode || !ngayChon) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng hoặc ngày." }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngayChon)) return jsonResponse({ ok: false, error: "Ngày không hợp lệ." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }
  if (order.status !== "confirmed") return jsonResponse({ ok: false, error: "Đơn hàng chưa được xác nhận." }, 403);
  if (!order.toolInputSnapshot) return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 400);

  try {
    const input = JSON.parse(order.toolInputSnapshot) as TrachCatToolInput;
    if (ngayChon < input.tuNgay || ngayChon > input.denNgay) {
      return jsonResponse({ ok: false, error: "Ngày này nằm ngoài khoảng đã đặt của đơn hàng." }, 400);
    }

    const kq = await chonGioTrongNgay({
      namSinh: input.namSinh,
      thangSinh: input.thangSinh,
      ngaySinh: input.ngaySinh,
      gioSinh: input.gioSinh,
      phutSinh: input.phutSinh,
      viecId: input.viecId,
      ngayChon,
      toaSonCung: input.toaSonCung,
      luaChonPhuId: input.luaChonPhuId,
    });
    if (!kq.hopLe) return jsonResponse({ ok: false, error: kq.loi ?? "Không tính được giờ." }, 400);

    return jsonResponse(
      {
        ok: true,
        ngay: ngayChon,
        hoaGiapTuCuc: kq.hoaGiapTuCuc,
        tuCuc: kq.tuCuc,
        danhSachGio: kq.danhSachGio,
        canhBao: kq.canhBao,
      },
      200,
    );
  } catch (err) {
    console.error(`[trach-cat-ky-mon/gio] Lỗi cho đơn ${orderCode}:`, err);
    return jsonResponse({ ok: false, error: "Không tính được giờ cho ngày này." }, 400);
  }
};
