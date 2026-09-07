import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users, sessions } from "../../../../db/schema";
import { hashPassword } from "../../../lib/auth/password";
import { tieuThuTokenDatLaiMatKhau } from "../../../lib/auth/password-reset";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Chống dò token bằng brute-force: token dài 32 byte ngẫu nhiên nên gần như bất khả thi, nhưng
  // vẫn giới hạn cho chắc (phòng thủ theo lớp).
  const limited = checkRateLimit(context, { key: "dat-lai-mat-khau", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu token đặt lại mật khẩu." }), { status: 400 });
  }
  if (!password || password.length < 6) {
    return new Response(JSON.stringify({ ok: false, error: "Mật khẩu mới quá ngắn (tối thiểu 6 ký tự)." }), { status: 400 });
  }

  // Token bị TIÊU HUỶ ngay khi đọc (dùng 1 lần) — kể cả khi bước cập nhật mật khẩu bên dưới lỗi,
  // token cũ vẫn không dùng lại được (khách bấm lại link cũ sẽ phải xin link mới, an toàn hơn).
  const userId = await tieuThuTokenDatLaiMatKhau(token);
  if (!userId) {
    return new Response(JSON.stringify({ ok: false, error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới." }), { status: 400 });
  }

  await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, userId));

  // Đổi mật khẩu xong thì đăng xuất khỏi MỌI thiết bị (kể cả thiết bị đang bị lộ mật khẩu cũ) —
  // khách phải đăng nhập lại bằng mật khẩu mới ở nơi mình đang dùng.
  await db.delete(sessions).where(eq(sessions.userId, userId));

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
