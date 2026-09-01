// Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
import type { APIRoute } from "astro";
import { calculateNgayKyHopDongCaoCap } from "@thien-anh/trachnhat-engine";
import { docInput, jsonResponse } from "./_chung";
import { checkRateLimit } from "../../../../../lib/rate-limit";

export const prerender = false;

/**
 * ⚠️ TẠM THỜI — endpoint thử nghiệm nội bộ, KHÔNG thu phí. Khi bật thu phí thì trang tự chuyển
 * sang gọi `checkout.ts` (xem cờ TEST_MODE ở component), route này vẫn giữ để test nhanh.
 *
 * Module này KHÔNG bắt đăng nhập (giống bản miễn phí đang chạy) — ký hợp đồng là việc thường
 * ngày, không cần rào tài khoản.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Endpoint tính nặng (đang là đường tính thật lúc TEST_MODE): 15 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "testcalc-ky-hd-qs", max: 15, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  try {
    return jsonResponse({ ok: true, result: calculateNgayKyHopDongCaoCap(doc.input) }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
