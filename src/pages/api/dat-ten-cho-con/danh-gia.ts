import type { APIRoute } from "astro";
import { danhGiaTen, GIOI_HAN_DANH_GIA } from "@thien-anh/tinhdanh-engine";
import { getOrderByCode } from "../../../lib/db/orders";
import { checkRateLimit } from "../../../lib/rate-limit";
import type { DauVaoDatTen } from "./checkout";

export const prerender = false;

const TOOL_SLUG = "dat-ten-cho-con";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Đánh giá danh sách tên khách tự chọn — CHỨC NĂNG THỨ HAI, mở chung bằng đúng đơn đã trả 499k.
 * orderCode phải trỏ tới đơn `dat-ten-cho-con` đã `confirmed`; thông tin sinh của bé lấy từ snapshot
 * của đơn (không tin client), danh sách tên (tối đa 10) lấy từ body.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "danh-gia-dat-ten", max: 30, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }
  const b = body as Record<string, unknown>;

  const orderCode = typeof b.orderCode === "string" ? b.orderCode.trim() : "";
  if (!orderCode) return jsonResponse({ ok: false, error: "Thiếu mã đơn hàng." }, 400);

  const order = await getOrderByCode(orderCode);
  if (!order || order.orderType !== "tool" || order.toolSlug !== TOOL_SLUG) {
    return jsonResponse({ ok: false, error: "Không tìm thấy đơn hàng." }, 404);
  }
  // Cổng thu phí: chỉ đơn ĐÃ THANH TOÁN mới được chấm điểm — nếu không thì khách gọi thẳng
  // endpoint này là dùng chùa được chức năng đánh giá.
  if (order.status !== "confirmed") {
    return jsonResponse({ ok: false, error: "Đơn chưa thanh toán." }, 402);
  }
  if (!order.toolInputSnapshot) {
    return jsonResponse({ ok: false, error: "Đơn hàng thiếu dữ liệu đầu vào." }, 500);
  }

  const danhSach = Array.isArray(b.danhSach)
    ? b.danhSach.filter((s: unknown) => typeof s === "string").map((s: string) => s.trim()).filter(Boolean)
    : [];
  if (danhSach.length === 0) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập ít nhất một tên để đánh giá." }, 400);
  }

  try {
    const input = JSON.parse(order.toolInputSnapshot) as DauVaoDatTen;
    const ketQua = danhGiaTen({
      ho: input.ho,
      gioiTinh: input.gioiTinh,
      nam: input.nam,
      thang: input.thang,
      ngay: input.ngay,
      ...(input.gio !== undefined ? { gio: input.gio } : {}),
      ...(input.phut !== undefined ? { phut: input.phut } : {}),
      danhSach: danhSach.slice(0, GIOI_HAN_DANH_GIA),
    });
    return jsonResponse({ ok: true, ketQua }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được kết quả." }, 500);
  }
};
