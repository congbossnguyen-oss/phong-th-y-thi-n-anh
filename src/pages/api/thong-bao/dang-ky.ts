import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { pushSubscriptions } from "../../../../db/schema";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Lưu đăng ký nhận thông báo của một máy. KHÔNG bắt đăng nhập — đây là tiện ích giữ chân, càng
 * nhiều người bật càng tốt; nếu có đăng nhập thì gắn userId để sau còn cá nhân hóa được.
 *
 * Đăng ký lại trên cùng một máy thì GHI ĐÈ theo `endpoint` (đã đặt unique) chứ không tạo dòng mới,
 * tránh gửi trùng nhiều lần vào cùng một máy.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "dang-ky-thong-bao", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const b = (body ?? {}) as Record<string, unknown>;
  const endpoint = typeof b.endpoint === "string" ? b.endpoint.trim() : "";
  const p256dh = typeof b.p256dh === "string" ? b.p256dh : "";
  const auth = typeof b.auth === "string" ? b.auth : "";

  if (!endpoint || !p256dh || !auth) {
    return json({ ok: false, error: "Thiếu thông tin đăng ký." }, 400);
  }
  // Chỉ nhận endpoint https thật — chặn việc bị nhồi dữ liệu rác vào bảng.
  let hopLe = false;
  try {
    hopLe = new URL(endpoint).protocol === "https:";
  } catch {
    hopLe = false;
  }
  if (!hopLe) return json({ ok: false, error: "Địa chỉ đăng ký không hợp lệ." }, 400);

  const userId = locals.user?.id ?? null;

  await db
    .insert(pushSubscriptions)
    .values({ endpoint, p256dh, auth, userId })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      // Bật lại trên máy cũ thì coi như đăng ký mới: xóa lịch sử lỗi để không bị dọn nhầm.
      set: { p256dh, auth, userId, failCount: 0 },
    });

  return json({ ok: true }, 200);
};
