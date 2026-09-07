import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users } from "../../../../db/schema";

export const prerender = false;

/**
 * Đánh dấu tài khoản đã xem màn chào mừng Quân Sư — gọi khi khách bấm "Bắt đầu" (hoặc "Bỏ qua") ở
 * /quan-su/chao-mung. Sau đó /quan-su không chuyển hướng sang màn chào mừng nữa.
 *
 * Không cần rate limit riêng: chỉ ghi 1 cờ boolean cho CHÍNH tài khoản đang đăng nhập, gọi lại
 * nhiều lần cũng vô hại (idempotent).
 */
export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ ok: false, error: "Chưa đăng nhập." }), { status: 401 });
  }

  await db.update(users).set({ daXemChaoMungQuanSu: true }).where(eq(users.id, locals.user.id));

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
