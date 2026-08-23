import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users } from "../../../../db/schema";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

// Trùng quy tắc kiểm tra với register.ts (đăng ký lần đầu) — tách riêng vì đây là API khác (cập
// nhật hồ sơ tài khoản ĐÃ có, không tạo mới), nhưng phải cùng chuẩn dữ liệu để 2 đường đều cho ra
// hồ sơ hợp lệ như nhau.
function validBirthDate(day: unknown, month: unknown, year: unknown): { day: number; month: number; year: number } | null {
  const d = Number(day), m = Number(month), y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) return null;
  return { day: d, month: m, year: y };
}

/**
 * Cập nhật ngày giờ sinh + giới tính cho tài khoản ĐÃ đăng nhập — dành cho tài khoản tạo trước khi
 * có 2 trường này (Thầy, 2026-08-23: "khi khách đăng ký... sẽ có phần điền", nhưng tài khoản cũ đã
 * tồn tại từ trước cần đường bổ sung riêng, không bắt đăng ký lại).
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ ok: false, error: "Vui lòng đăng nhập." }, 401);

  const body = await request.json().catch(() => null);
  const b = (body ?? {}) as Record<string, unknown>;
  const gender = b.gender === "Nữ" ? "Nữ" : b.gender === "Nam" ? "Nam" : null;
  const birth = validBirthDate(b.birthDay, b.birthMonth, b.birthYear);
  const hourRaw = Number(b.birthHour);
  const birthHour = Number.isInteger(hourRaw) && hourRaw >= 0 && hourRaw <= 23 ? hourRaw : null;

  if (!birth) return json({ ok: false, error: "Vui lòng nhập đủ và đúng ngày/tháng/năm sinh." }, 400);
  if (!gender) return json({ ok: false, error: "Vui lòng chọn giới tính." }, 400);

  await db
    .update(users)
    .set({ birthDay: birth.day, birthMonth: birth.month, birthYear: birth.year, birthHour, gender })
    .where(eq(users.id, locals.user.id));

  return json({ ok: true }, 200);
};
