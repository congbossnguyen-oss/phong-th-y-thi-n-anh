import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { lapLaBan } from "../../../../lib/kymon";

export const prerender = false;

/**
 * Tạo đơn cho module Hỏi Đáp Kỳ Môn — 199.000đ/lượt hỏi (chế độ Thời Gian/Bốc Độn). KHÔNG bắt
 * đăng nhập — kết quả truy cập bằng orderCode làm "vé", giống các module VIP khác.
 *
 * ⏸️ GIAI ĐOẠN THỬ NGHIỆM NỘI BỘ: mới xong danh mục chủ đề + luồng thanh toán, PHẦN TỰ SINH CÂU
 * TRẢ LỜI theo từng chủ đề CHƯA CÓ (xem SPEC_danh_muc_cau_hoi_ky_mon.md — cần luật riêng cho từng
 * chủ đề, làm sau). Vì vậy chặn ở server y hệt ky-mon-menh-chi-tiet: chỉ tài khoản quản trị được
 * tạo đơn, để không thu tiền thật của khách trước khi có nội dung trả lời. Chỉ gỡ khối chặn này
 * SAU KHI đã có nội dung luận giải thật cho (ít nhất) chủ đề đang mở bán.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-ky-mon-hoi-dap", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (locals.user?.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Dịch vụ đang trong giai đoạn thử nghiệm nội bộ, chưa mở bán." }, 403);
  }

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

  // "Tính thử" trước khi tạo đơn — chặn lá bàn không lập được (vd ngoài phạm vi dữ liệu) trước khi thu tiền.
  try {
    await lapLaBan(doc.input.laBan);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lập được lá bàn với dữ liệu này." }, 400);
  }

  try {
    const kq = await taoDonCongCu({
      toolSlug: TOOL_SLUG,
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
