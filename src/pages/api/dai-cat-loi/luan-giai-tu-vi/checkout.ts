import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { docInput, jsonResponse, TOOL_SLUG_TOAN_DIEN } from "./_chung";
import { tinhTuVi } from "../../../../lib/tu-vi/engine";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";

export const prerender = false;

/**
 * Tạo đơn cho module Luận Giải Tử Vi — 1 GÓI DUY NHẤT 500k (gộp từ 2 tầng Cơ Bản/Nâng Cao cũ, xem
 * lý do ở gia-cong-cu.ts).
 *
 * BẮT BUỘC đăng nhập — cùng lý do luan-giai-bat-tu-toan-dien: AI tốn nhiều lệnh gọi (~30s/lượt),
 * quyền truy cập phải gắn chắc vào 1 tài khoản để cache theo hash lá số không bị lạm dụng qua
 * orderCode chia sẻ.
 *
 * ⚠️ Đã BỎ chốt "chỉ admin được mua" từng có ở đây (sót lại từ 26/8/2026, trước khi
 * MODULE_KHOA_THU_NGHIEM gỡ khoá module này 31/8/2026) — chốt đó khiến khách thật KHÔNG tạo được
 * đơn dù module đã mở bán, anh Công báo lỗi 1/9/2026 ("anh không làm khách mới được").
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-luan-giai-tu-vi", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập để mua bản luận giải này.", canDangNhap: true }, 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  const b = body as Record<string, unknown>;

  const toolSlug = TOOL_SLUG_TOAN_DIEN;

  const docKq = docInput(body);
  if (!docKq.ok) return jsonResponse({ ok: false, error: docKq.error }, 400);

  // "Tính thử" lá số (thuần code, không AI) trước khi thu tiền — chặn ngày giờ ngoài phạm vi engine.
  try {
    tinhTuVi({ day: docKq.input.day, month: docKq.input.month, year: docKq.input.year, hour: docKq.input.hour, gender: docKq.input.gender });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không lập được lá số với dữ liệu này." }, 400);
  }

  const customerName = docKq.input.hoTen || locals.user.name;
  const customerEmail = locals.user.email;

  try {
    const kq = await taoDonCongCu({
      toolSlug,
      laQuanTri: locals.user.isAdmin === true,
      toolInput: { ...docKq.input, hoTen: customerName },
      userId: locals.user.id,
      customerName,
      customerPhone: "",
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
