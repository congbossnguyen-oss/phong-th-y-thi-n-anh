import type { APIRoute } from "astro";
import { castBatTuFacts } from "../../../../lib/chart-profile/cast-bat-tu";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Định Hướng Nghề Nghiệp (499.000đ). KHÔNG bắt đăng nhập — kết quả truy cập bằng
 * orderCode làm "vé", giống các module VIP khác. Tài khoản QUẢN TRỊ đi luồng 0đ để kiểm thử.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-dinh-huong-nghe", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  // ✅ ĐÃ MỞ BÁN cho khách (26/8/2026, anh Công duyệt "mở hết tất cả"). Admin vẫn được
  // taoDonCongCu tạo đơn 0đ + tự xác nhận để test — xem cờ laQuanTri bên dưới.

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

  // Kiểm thử lá số bằng engine an sao (thuần, KHÔNG gọi AI ở đây để không tốn tiền cho đơn chưa trả)
  // — chặn ngày giờ engine không dựng được trước khi thu tiền.
  try {
    castBatTuFacts(doc.input);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Ngày giờ sinh không hợp lệ." }, 400);
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
    return jsonResponse(
      { ok: false, error: thongBaoLoiAnToan(err, "Không tạo được đơn hàng, vui lòng thử lại sau.") },
      400,
    );
  }
};
