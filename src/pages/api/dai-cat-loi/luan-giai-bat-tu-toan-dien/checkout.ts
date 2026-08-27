import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { docInput, jsonResponse, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import { LoiNghiepVu } from "../../../../lib/errors";

export const prerender = false;

/**
 * Tạo đơn cho module Luận Giải Bát Tự Toàn Diện — 2 tầng độc lập (Cơ Bản / Nâng Cao), mỗi tầng 1
 * đơn riêng, mua thêm tầng kia sau vẫn được.
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

  const tang = b.tang;
  if (tang !== "co_ban" && tang !== "nang_cao") {
    return jsonResponse({ ok: false, error: "Tầng luận giải không hợp lệ." }, 400);
  }
  const toolSlug = tang === "co_ban" ? TOOL_SLUG_CO_BAN : TOOL_SLUG_NANG_CAO;

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
    if (err instanceof LoiNghiepVu) {
      return jsonResponse({ ok: false, error: err.message }, 400);
    }
    console.error("[luan-giai-bat-tu-toan-dien/checkout] Lỗi không mong đợi khi tạo đơn hàng:", err);
    return jsonResponse(
      { ok: false, error: "Rất tiếc, hệ thống đang gặp trục trặc khi tạo đơn hàng. Bạn thử lại sau ít phút giúp mình nhé, hoặc liên hệ Thiên Anh nếu vẫn lỗi." },
      500,
    );
  }
};
