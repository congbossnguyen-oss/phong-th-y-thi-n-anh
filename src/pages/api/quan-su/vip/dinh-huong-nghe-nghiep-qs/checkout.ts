// Bản ĐỘC LẬP cho app Quân Sư của "Định Hướng Nghề Nghiệp" (anh Công chốt 1/9/2026: Quân Sư không
// đấu nối code với web nữa, kể cả module đã dùng chung trước đó). File này CỐ Ý gần như y hệt
// `src/pages/api/dai-cat-loi/dinh-huong-nghe-nghiep/checkout.ts` — chấp nhận trùng lặp thay vì
// import chéo sang namespace `dai-cat-loi`. Chỉ khác: `TOOL_SLUG` riêng (hậu tố `-qs`, khai trong
// `_chung.ts` cùng thư mục) — vẫn dùng CHUNG engine tính toán (`castBatTuFacts`) và hạ tầng thanh
// toán (`taoDonCongCu`).
import type { APIRoute } from "astro";
import { castBatTuFacts } from "../../../../../lib/chart-profile/cast-bat-tu";
import { taoDonCongCu } from "../../../../../lib/payments/checkout-cong-cu";
import { docInput, jsonResponse, TOOL_SLUG } from "./_chung";
import { checkRateLimit } from "../../../../../lib/rate-limit";
import { thongBaoLoiAnToan } from "../../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Định Hướng Nghề Nghiệp (bản app Quân Sư, 500.000đ). KHÔNG bắt đăng nhập — kết
 * quả truy cập bằng orderCode làm "vé", giống các module VIP khác. Tài khoản QUẢN TRỊ đi luồng 0đ
 * để kiểm thử.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-dinh-huong-nghe-qs", max: 10, windowMs: 60_000 });
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
