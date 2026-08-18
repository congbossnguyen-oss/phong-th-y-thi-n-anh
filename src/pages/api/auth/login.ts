import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users } from "../../../../db/schema";
import { verifyPassword } from "../../../lib/auth/password";
import { createSession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";
import { getClientIp } from "../../../lib/auth/client-ip";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;

  // Chống brute-force mật khẩu: 8 lần thử / phút / IP.
  const limited = checkRateLimit(context, { key: "login", max: 8, windowMs: 60_000 });
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu email hoặc mật khẩu." }), { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return new Response(JSON.stringify({ ok: false, error: "Email hoặc mật khẩu không đúng." }), { status: 401 });
  }

  // createSession xóa mọi session cũ của user này -> thiết bị đang đăng nhập ở nơi khác sẽ tự bị đăng xuất.
  // Session mới bị "khóa" theo đúng IP hiện tại -> dùng chung cookie từ IP khác sẽ bị hủy.
  const token = await createSession(user.id, getClientIp(context));
  cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return new Response(JSON.stringify({ ok: true, user: { name: user.name, email: user.email } }), { status: 200 });
};
