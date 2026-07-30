import { defineMiddleware } from "astro:middleware";
import { SESSION_COOKIE_NAME, validateSessionToken } from "./lib/auth/session";
import { getClientIp } from "./lib/auth/client-ip";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;

  // Trang prerender (tĩnh) không có cookie thật lúc build — bỏ qua để tránh warning
  // "Astro.request.headers ... not available on prerendered pages" và không tốn 1 lượt query DB vô ích.
  if (context.isPrerendered) {
    return next();
  }

  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      // null nếu session không hợp lệ/đã bị đăng nhập máy khác ghi đè (chính sách 1 thiết bị/lúc)
      // hoặc IP khác lúc đăng nhập (chống dùng chung cookie từ nơi khác).
      context.locals.user = await validateSessionToken(token, getClientIp(context));
    } catch (err) {
      // Không để lỗi kết nối DB (vd chưa cấu hình DATABASE_URL) làm sập toàn bộ trang marketing tĩnh —
      // chỉ các trang cần đăng nhập mới thực sự phụ thuộc vào DB, còn lại vẫn phải render bình thường.
      console.error("[middleware] Không xác thực được session:", err);
    }
  }

  return next();
});
