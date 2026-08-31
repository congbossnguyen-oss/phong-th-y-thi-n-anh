import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { docInput, jsonResponse, TOOL_SLUG_TOAN_DIEN } from "./_chung";
import { thongBaoLoiAnToan } from "../../../../lib/loi-an-toan";
import { dangKhoaThuNghiem } from "../../../../lib/payments/gia-cong-cu";

export const prerender = false;

/**
 * Tạo đơn cho module Luận Giải Bát Tự Toàn Diện — 1 GÓI DUY NHẤT 700k, đủ 12 giai đoạn (gộp từ
 * 2 tầng Cơ Bản/Nâng Cao cũ, xem lý do ở gia-cong-cu.ts).
 *
 * KHÁC MỌI module "tool" khác trong repo: BẮT BUỘC đăng nhập (SPEC mục 0.4) — báo cáo AI tốn nhiều
 * lệnh gọi, cache theo tài khoản để khách xem lại không mất phí, và quyền truy cập phải gắn chắc
 * vào 1 người (không dùng chung qua orderCode như công cụ khác).
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-bat-tu-toan-dien", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập để mua bản luận giải này.", canDangNhap: true }, 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  const b = body as Record<string, unknown>;

  const toolSlug = TOOL_SLUG_TOAN_DIEN;

  // ⚠️ CHỐT CHẶN THẬT Ở MÁY CHỦ — module đang khóa thử nghiệm thì khách KHÔNG tạo được đơn, kể cả
  // khi gọi thẳng API (ẩn nút ở giao diện là chưa đủ). Admin vẫn chạy thử trọn luồng được.
  if (dangKhoaThuNghiem(toolSlug) && locals.user.isAdmin !== true) {
    return jsonResponse(
      { ok: false, error: "Dịch vụ này đang được hoàn thiện, chưa mở bán. Vui lòng quay lại sau ít ngày." },
      403,
    );
  }

  const docKq = docInput(body);
  if (!docKq.ok) return jsonResponse({ ok: false, error: docKq.error }, 400);

  const customerName = locals.user.name;
  const customerEmail = locals.user.email;

  try {
    const kq = await taoDonCongCu({
      toolSlug,
      laQuanTri: locals.user.isAdmin === true,
      toolInput: docKq.input,
      userId: locals.user.id,
      customerName,
      customerPhone: "", // đã đăng nhập (biết email) nên không bắt nhập lại số điện thoại.
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
