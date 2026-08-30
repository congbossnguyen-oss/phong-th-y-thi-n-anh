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

  // GIAI ĐOẠN THỬ NGHIỆM NỘI BỘ — cả khu Quân Sư (app trả phí) CHỈ mở cho admin. Khách thường (kể
  // cả chưa đăng nhập) vào /quan-su/* bị đưa về trang chủ, coi như khu này chưa tồn tại. Cho phép
  // test trên trang thật mà không lộ cho khách. KHI MỞ BÁN: xóa nguyên khối này (một chỗ duy nhất).
  //
  // KHÔNG chặn ở đây: /api/thong-bao/* (service worker + cron phải gọi được, không có đăng nhập) và
  // /api/quan-su/* (đã có auth riêng: đăng nhập + gói). Chỉ khóa các TRANG hiển thị của Quân Sư.
  const path = context.url.pathname;
  if (path === "/quan-su" || path.startsWith("/quan-su/")) {
    if (!context.locals.user?.isAdmin) {
      return context.redirect("/");
    }
  }

  // GIAI ĐOẠN THỬ NGHIỆM NỘI BỘ — module "Xem hướng nhà Bát Trạch" (30/8/2026) mới build xong,
  // CHỈ admin xem được để tự kiểm chứng trước khi mở cho khách (trang .astro + API cũng tự kiểm
  // tra thêm 1 lớp, xem GHI-CHU-CAN-CHU-SITE-XEM.md). KHI MỞ BÁN: xóa khối này (một chỗ duy nhất
  // ở middleware, cộng với 2 chỗ đánh dấu tương tự trong trang .astro và API route).
  if (path === "/dai-cat-loi/xem-huong-nha-bat-trach" || path.startsWith("/dai-cat-loi/xem-huong-nha-bat-trach/")) {
    if (!context.locals.user?.isAdmin) {
      return context.redirect("/");
    }
  }

  return next();
});
