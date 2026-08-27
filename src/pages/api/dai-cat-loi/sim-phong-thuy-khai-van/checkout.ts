import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho dịch vụ Sim Phong Thủy Khai Vận Khí (1.000.000đ).
 *
 * KHÔNG bắt đăng nhập — giống các module thu phí khác, kết quả truy cập bằng orderCode làm "vé".
 * Đây là DỊCH VỤ THỦ CÔNG: sau khi thanh toán, chuyên gia nhận toàn bộ thông tin qua email báo cáo
 * (xem markOrderPaidAndFulfill trong lib/db/orders.ts) rồi liên hệ trực tiếp, KHÔNG có bước tính
 * "kết quả" tự động.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-sim-phong-thuy", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  const b = (body ?? {}) as Record<string, unknown>;
  const customerName = locals.user?.name ?? doc.input.hoTen;
  const customerEmail =
    locals.user?.email ?? (typeof b.customerEmail === "string" && b.customerEmail.trim() ? b.customerEmail.trim() : null);
  const customerPhone = doc.input.soDienThoaiZalo;

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
