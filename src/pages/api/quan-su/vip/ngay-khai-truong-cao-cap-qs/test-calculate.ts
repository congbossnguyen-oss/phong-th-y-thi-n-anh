// Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
import type { APIRoute } from "astro";
import { calculateNgayKhaiTruongCaoCap } from "@thien-anh/trachnhat-engine";
import { docInput, jsonResponse } from "./_chung";
import { checkRateLimit } from "../../../../../lib/rate-limit";

export const prerender = false;

// ⚠️ Endpoint thử nghiệm nội bộ, KHÔNG thu phí — dùng khi TEST_MODE ở component. Không bắt đăng nhập.
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "testcalc-khai-truong-cc-qs", max: 15, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const doc = docInput(body);
  if (!doc.ok) return jsonResponse({ ok: false, error: doc.error }, 400);

  try {
    return jsonResponse({ ok: true, result: calculateNgayKhaiTruongCaoCap(doc.input) }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
