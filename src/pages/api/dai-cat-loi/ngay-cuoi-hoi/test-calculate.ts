import type { APIRoute } from "astro";
import { calculateCuoiHoiTronGoi } from "@thien-anh/trachnhat-engine";
import { docInput, jsonResponse } from "./_chung";

export const prerender = false;

/**
 * ⚠️ TẠM THỜI — endpoint thử nghiệm nội bộ, KHÔNG thu phí. Khi bật thu phí thì trang tự chuyển
 * sang gọi `checkout.ts` (xem cờ TEST_MODE ở trang .astro), route này vẫn giữ để test nhanh.
 *
 * 🔒 GIAI ĐOẠN THỬ NGHIỆM: CHỈ tài khoản quản trị được gọi (Công yêu cầu chưa cho khách dùng).
 * Cờ lấy từ PHIÊN đăng nhập phía máy chủ, không nhận từ client.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.user?.isAdmin !== true) {
    return jsonResponse({ ok: false, error: "Công cụ đang trong giai đoạn thử nghiệm nội bộ." }, 403);
  }

  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  try {
    return jsonResponse({ ok: true, result: calculateCuoiHoiTronGoi(doc.input) }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
