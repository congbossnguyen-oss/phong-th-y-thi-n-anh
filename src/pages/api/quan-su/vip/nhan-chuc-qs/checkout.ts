// Bản ĐỘC LẬP cho app Quân Sư của "Ngày Giờ Nhận Chức" (anh Công chốt 1/9/2026: Quân Sư không đấu
// nối code với web nữa, kể cả module đã dùng chung trước đó). File này CỐ Ý gần như y hệt
// `src/pages/api/dai-cat-loi/nhan-chuc/checkout.ts` — chấp nhận trùng lặp thay vì import chéo sang
// namespace `dai-cat-loi`. Chỉ khác: `TOOL_SLUG` riêng (hậu tố `-qs`, khai trong `_chung.ts` cùng
// thư mục) — vẫn dùng CHUNG engine tính toán (`calculateNhanChuc`) và hạ tầng thanh toán
// (`taoDonCongCu`).
//
// ⚠️ LƯU Ý: bản web ĐANG CÓ bug đã biết (không gửi PDF/email cho khách) — bản `-qs` này CỐ Ý COPY
// ĐÚNG hành vi hiện tại (không thêm PDF/email), việc vá bug đó nằm NGOÀI phạm vi tách module.
import type { APIRoute } from "astro";
import { calculateNhanChuc } from "@thien-anh/trachnhat-engine";
import { taoDonCongCu } from "../../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Ngày Giờ Nhận Chức (bản app Quân Sư, 500.000đ).
 *
 * KHÔNG bắt đăng nhập — giống các module VIP khác, kết quả truy cập bằng orderCode làm "vé". Nếu
 * khách tình cờ đang đăng nhập thì gắn đơn vào tài khoản để họ xem lại được.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-nhan-chuc-qs", max: 10, windowMs: 60_000 });
  if (limited) return limited;

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
    calculateNhanChuc(doc.input);
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
    return jsonResponse(
      { ok: false, error: thongBaoLoiAnToan(err, "Không tạo được đơn hàng, vui lòng thử lại sau.") },
      400,
    );
  }
};
