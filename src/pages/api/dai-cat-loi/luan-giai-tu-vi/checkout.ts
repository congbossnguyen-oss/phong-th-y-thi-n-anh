import type { APIRoute } from "astro";
import { taoDonCongCu } from "../../../../lib/payments/checkout-cong-cu";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { docInput, jsonResponse, TOOL_SLUG_CO_BAN, TOOL_SLUG_NANG_CAO } from "./_chung";
import { tinhTuVi } from "../../../../lib/tu-vi/engine";

export const prerender = false;

/**
 * Tạo đơn cho module Luận Giải Tử Vi — 2 tầng ĐỘC LẬP (Cơ Bản 149k / Nâng Cao 299k), mỗi tầng 1
 * đơn riêng, mua thẳng Nâng Cao không cần mua Cơ Bản trước (xem ghi chú quyết định trong
 * taoLuanGiaiTuVi.ts — SPEC.md mục 9.5 chưa chốt lúc build, chọn phương án linh hoạt hơn).
 *
 * BẮT BUỘC đăng nhập — cùng lý do luan-giai-bat-tu-toan-dien: AI tốn nhiều lệnh gọi (~30s/lượt),
 * quyền truy cập phải gắn chắc vào 1 tài khoản để cache theo hash lá số không bị lạm dụng qua
 * orderCode chia sẻ.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "checkout-luan-giai-tu-vi", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  if (!locals.user) {
    return jsonResponse({ ok: false, error: "Vui lòng đăng nhập để mua bản luận giải này.", canDangNhap: true }, 401);
  }

  // Đang khoá thử nghiệm nội bộ — chỉ tài khoản quản trị được mua/xem thật (theo yêu cầu 26/8/2026).
  if (locals.user.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Dịch vụ đang trong giai đoạn thử nghiệm nội bộ, chưa mở bán." }, 403);
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
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tạo được đơn hàng." }, 400);
  }
};
