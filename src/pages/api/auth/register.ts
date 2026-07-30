import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users } from "../../../../db/schema";
import { hashPassword } from "../../../lib/auth/password";
import { createSession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!name || !email || !password || password.length < 6) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu thông tin hoặc mật khẩu quá ngắn (tối thiểu 6 ký tự)." }), { status: 400 });
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return new Response(JSON.stringify({ ok: false, error: "Email này đã đăng ký tài khoản." }), { status: 409 });
  }

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: hashPassword(password) })
    .returning({ id: users.id, name: users.name, email: users.email });

  const token = await createSession(user.id);
  cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return new Response(JSON.stringify({ ok: true, user: { name: user.name, email: user.email } }), { status: 200 });
};
