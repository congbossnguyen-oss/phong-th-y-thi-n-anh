import type { APIRoute } from "astro";
import { Scoring } from "@thien-anh/rule-engine";
import { docInput, jsonResponse } from "./_chung";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * ⚠️ TẠM THỜI — endpoint thử nghiệm nội bộ, KHÔNG thu phí, KHÔNG tạo đơn hàng. Khi bật thu phí thì
 * trang tự chuyển sang gọi `checkout.ts` (xem cờ TEST_MODE ở trang .astro), route này vẫn giữ để
 * test nhanh.
 *
 * Chỉ trả về "Bản mệnh" (Nạp Âm theo năm sinh) làm preview cho khách xem ngay — KHÔNG có "sim phù
 * hợp" tự động vì việc chọn số thật từ kho sim là thao tác thủ công của chuyên gia (xem _chung.ts).
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "testcalc-sim-phong-thuy", max: 15, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  try {
    const banMenh = Scoring.getNapAm(doc.input.ngaySinh.year);
    return jsonResponse({ ok: true, result: { banMenh } }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
