import type { APIRoute } from "astro";
import { kiemMaKhuyenMai } from "../../../lib/payments/promo";
import { GIA_CONG_CU, laToolSlug } from "../../../lib/payments/gia-cong-cu";

export const prerender = false;

/**
 * Kiểm mã khuyến mãi TRƯỚC khi bấm thanh toán, để khách thấy ngay số tiền còn phải trả.
 *
 * ⚠️ Đây chỉ là xem trước cho đẹp — KHÔNG trừ lượt, và tuyệt đối không phải nơi quyết định giá.
 * Lúc tạo đơn thật, checkout kiểm lại mã từ đầu và tự tính tiền; client gửi số tiền nào cũng bị bỏ.
 */
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const b = (body ?? {}) as Record<string, unknown>;

  const ma = typeof b.ma === "string" ? b.ma : "";
  const toolSlug = laToolSlug(b.toolSlug) ? b.toolSlug : null;
  if (!toolSlug) {
    return jsonResponse({ ok: false, error: "Không rõ đang áp mã cho công cụ nào." }, 400);
  }

  const soTienGoc = GIA_CONG_CU[toolSlug];

  try {
    const kq = await kiemMaKhuyenMai({ ma, toolSlug, soTienGoc });
    if (!kq.hopLe) {
      return jsonResponse({ ok: false, error: kq.lyDo ?? "Mã không dùng được." }, 200);
    }
    return jsonResponse(
      {
        ok: true,
        moTaGiam: kq.moTaGiam,
        soTienGoc,
        soTienGiam: kq.soTienGiam,
        soTienPhaiTra: kq.soTienPhaiTra,
      },
      200,
    );
  } catch (err) {
    console.error("[kiem-ma] Lỗi kiểm mã:", err);
    return jsonResponse({ ok: false, error: "Không kiểm được mã lúc này, thử lại sau." }, 500);
  }
};
