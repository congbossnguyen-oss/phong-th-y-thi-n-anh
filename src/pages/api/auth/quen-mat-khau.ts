import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { users } from "../../../../db/schema";
import { taoTokenDatLaiMatKhau } from "../../../lib/auth/password-reset";
import { sendPasswordResetEmail } from "../../../lib/email/send";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

/**
 * Yêu cầu đặt lại mật khẩu — nhận email, nếu tồn tại tài khoản thì gửi link đặt lại qua Resend.
 *
 * ⚠️ LUÔN trả về cùng 1 thông báo thành công dù email có tồn tại hay không (kể cả khi gửi mail lỗi
 * — safeSend không throw) — không được để kẻ xấu dò xem 1 email đã đăng ký tài khoản hay chưa
 * (user enumeration). Khác register.ts/login.ts (những nơi CỐ Ý báo rõ "email đã tồn tại"/"sai mật
 * khẩu" vì đó là luồng khách tự thao tác trên chính tài khoản mình).
 */
export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Chống spam bấm "quên mật khẩu" dội email cho người khác: 5 lần / giờ / IP.
  const limited = checkRateLimit(context, {
    key: "quen-mat-khau",
    max: 5,
    windowMs: 60 * 60_000,
    message: "Bạn yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau.",
  });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  const THONG_BAO_CHUNG = "Nếu email này đã đăng ký tài khoản, chúng tôi đã gửi link đặt lại mật khẩu — vui lòng kiểm tra hộp thư (kể cả thư mục spam).";

  if (!email) {
    return new Response(JSON.stringify({ ok: false, error: "Vui lòng nhập email." }), { status: 400 });
  }

  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const token = await taoTokenDatLaiMatKhau(user.id);
    const resetUrl = `${new URL(request.url).origin}/hoc-vien/dat-lai-mat-khau?token=${token}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  }

  return new Response(JSON.stringify({ ok: true, message: THONG_BAO_CHUNG }), { status: 200 });
};
