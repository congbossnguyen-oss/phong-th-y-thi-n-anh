import type { APIRoute } from "astro";
import { calculateNgayKyHopDongCaoCap } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";

export const prerender = false;

/**
 * Tạo đơn cho module Ngày Ký Hợp Đồng cao cấp (299.000đ).
 *
 * KHÔNG bắt đăng nhập — giống module tang lễ, kết quả truy cập bằng orderCode làm "vé". Nếu khách
 * tình cờ đang đăng nhập thì gắn đơn vào tài khoản để họ xem lại được.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  const b = (body ?? {}) as Record<string, unknown>;
  const customerName = locals.user?.name ?? (typeof b.customerName === "string" ? b.customerName.trim() : "");
  const customerEmail =
    locals.user?.email ??
    (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";

  if (!customerName || !customerPhone) {
    return jsonResponse({ ok: false, error: "Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ." }, 400);
  }

  // "Tính thử" trước khi tạo đơn — không thu tiền cho bộ input không chạy được (khoảng ngày quá
  // dài, ngày sinh sai...). Khoảng quét đã bị chặn tối đa 92 ngày nên chạy thử không tốn mấy.
  try {
    calculateNgayKyHopDongCaoCap(doc.input);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu không hợp lệ." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
      // Cờ lấy từ PHIÊN ĐĂNG NHẬP phía máy chủ, không phải từ dữ liệu client gửi lên.
      laQuanTri: locals.user?.isAdmin === true,
      toolInput: doc.input,
      userId: locals.user?.id ?? null,
      customerName,
      customerPhone,
      customerEmail,
      maKhuyenMai: typeof b.maKhuyenMai === "string" ? b.maKhuyenMai : "",
    });
    return jsonResponse(kq, kq.ok ? 200 : 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
