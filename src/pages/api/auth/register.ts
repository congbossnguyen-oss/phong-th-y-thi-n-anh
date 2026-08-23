import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users } from "../../../../db/schema";
import { hashPassword } from "../../../lib/auth/password";
import { createSession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";
import { getClientIp } from "../../../lib/auth/client-ip";

export const prerender = false;

// Ngày/tháng/năm sinh + giới tính khai báo LUÔN ở đăng ký — dùng lại cho mọi tính năng cần vận
// trình sau này (Quân Sư, Xem Thời Vận), không hỏi lại mỗi lần dùng (Thầy, 2026-08-23). Giờ sinh
// tùy chọn, đúng quy tắc đã áp dụng nhất quán cho lớp Tử Vi trong toàn dự án.
function validBirthDate(day: unknown, month: unknown, year: unknown): { day: number; month: number; year: number } | null {
  const d = Number(day), m = Number(month), y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) return null;
  return { day: d, month: m, year: y };
}

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;
  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const gender = body?.gender === "Nữ" ? "Nữ" : body?.gender === "Nam" ? "Nam" : null;
  const birth = validBirthDate(body?.birthDay, body?.birthMonth, body?.birthYear);
  const birthHourRaw = Number(body?.birthHour);
  const birthHour = Number.isInteger(birthHourRaw) && birthHourRaw >= 0 && birthHourRaw <= 23 ? birthHourRaw : null;

  if (!name || !email || !password || password.length < 6) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu thông tin hoặc mật khẩu quá ngắn (tối thiểu 6 ký tự)." }), { status: 400 });
  }
  if (!birth) {
    return new Response(JSON.stringify({ ok: false, error: "Vui lòng nhập đủ và đúng ngày/tháng/năm sinh." }), { status: 400 });
  }
  if (!gender) {
    return new Response(JSON.stringify({ ok: false, error: "Vui lòng chọn giới tính." }), { status: 400 });
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return new Response(JSON.stringify({ ok: false, error: "Email này đã đăng ký tài khoản." }), { status: 409 });
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      birthDay: birth.day,
      birthMonth: birth.month,
      birthYear: birth.year,
      birthHour,
      gender,
    })
    .returning({ id: users.id, name: users.name, email: users.email });

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
