import type { APIRoute } from "astro";
import { chayNhacNgayLe } from "../../../lib/thong-bao/chay-nhac-ngay-le";
import { docBien } from "../../../lib/thong-bao/env";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Việc chạy định giờ: gửi lời nhắc mùng Một / ngày Rằm cho mọi máy đã bật thông báo.
 *
 * BẢO VỆ bằng CRON_SECRET — endpoint này gửi thông báo hàng loạt, để lộ là bị người ngoài spam
 * toàn bộ khách hàng. TRƯỚC ĐÂY (Render) đặt Cron Job gọi vào đây kèm header Authorization; NAY
 * (Cloudflare) việc chạy định giờ đã chuyển sang `scheduled()` của Worker (xem src/worker-entry.ts +
 * wrangler.jsonc mục triggers.crons), gọi thẳng `chayNhacNgayLe()` KHÔNG qua HTTP/CRON_SECRET. Endpoint
 * này VẪN GIỮ NGUYÊN — dùng để bấm chạy thử thủ công (`?buoc=1`) hoặc nếu sau này còn nơi khác cần gọi
 * qua HTTP có xác thực.
 *
 * Nghiệp vụ thật (chấm "hôm nay có phải dịp cần nhắc", gửi push, dọn subscription hết hạn) nằm ở
 * `chayNhacNgayLe()` trong `lib/thong-bao/chay-nhac-ngay-le.ts` — dùng chung với `scheduled()`, sửa 1
 * chỗ là cả 2 đường đều đổi theo, không lặp code.
 *
 * LỊCH CHẠY THẬT: xem wrangler.jsonc "triggers.crons" — kiểu "bao-truoc" hiện chạy ~9 giờ sáng giờ
 * Việt Nam = 02:00 UTC (đổi từ 11 giờ trưa/04:00 UTC theo anh Công 28/8/2026). Không lặp lại giá trị
 * cron cụ thể ở đây để khỏi có 2 nơi có thể lệch nhau khi sau này đổi giờ lần nữa.
 */
export const POST: APIRoute = async ({ request, url }) => {
  const secret = docBien("CRON_SECRET");
  if (!secret) {
    return json({ ok: false, error: "Chưa cấu hình CRON_SECRET trên máy chủ." }, 500);
  }
  const dua = request.headers.get("authorization") ?? "";
  if (dua !== `Bearer ${secret}`) {
    return json({ ok: false, error: "Không có quyền." }, 401);
  }

  // `?buoc=1` để chạy thử: gửi thật kể cả hôm nay không phải ngày lễ.
  const chayThu = url.searchParams.get("buoc") === "1";
  const ketQua = await chayNhacNgayLe({ chayThu });
  return json(ketQua, ketQua.ok ? 200 : 500);
};
