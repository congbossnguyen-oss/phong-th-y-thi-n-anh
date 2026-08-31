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

  // MỞ CÔNG KHAI /quan-su/* — Giai Đoạn A (31/8/2026, nhánh prepare-quan-su-public). Trước đây khối
  // này chặn cứng "không phải admin thì đưa về trang chủ" (đúng như comment gốc đã ghi sẵn "KHI MỞ
  // BÁN: xóa nguyên khối này"). Đã audit toàn bộ 34 trang + 5 API route dưới /quan-su: mọi trang có
  // đọc Astro.locals.user (7/34 — [category], goi-thue-bao, xem-thoi-van, ky-mon*, lap-ky-mon,
  // trach-cat-ky-mon) đều đã tự có nhánh xử lý an toàn cho khách chưa đăng nhập/chưa có gói (login
  // card, component SapRaMat, hoặc lùi về template), và mọi API route (luan.ts, quyen-vip.ts,
  // goi-thue-bao/checkout.ts + dung-thu.ts + result.ts) đã tự trả đúng 401/403 JSON theo gói/lượt.
  // KHÔNG đụng các cổng admin-only KHÁC vẫn đang cố ý giữ nguyên (Kỳ Môn còn test nội bộ qua
  // laQuanTri riêng của từng trang; gói thuê bao chưa mở bán qua checkout.ts; dùng thử đã ngưng vĩnh
  // viễn qua dung-thu.ts) — những cổng đó là quyết định kinh doanh RIÊNG, không nằm trong phạm vi
  // "App Quân Sư chưa launch" mà khối này từng đại diện.
  //
  // KHÔNG cần cổng riêng cho tài khoản test (31/8/2026) — /quan-su/* đã public cho MỌI người rồi
  // (đang trong giai đoạn anh Công dùng để test trước khi đẩy app lên App Store), tài khoản test chỉ
  // cần đăng nhập bình thường là vào được. Giới hạn thật cho tài khoản test nằm ở luan.ts (chặn đúng
  // chỗ tốn AI: hạn mức TỔNG 10 lượt, xem test-accounts.ts) — không đụng gì tới middleware này.
  const path = context.url.pathname;

  // "Xem hướng nhà Bát Trạch" (30/8/2026, anh Công: "để ra ngoài như mục huyền không phi tinh") —
  // trang CHÍNH đã mở công khai (như Huyền Không Phi Tinh: tính toán free, không AI, không gating).
  // CHỈ còn khóa riêng trang "/kiem-chung" (công cụ nội bộ đối chiếu số liệu, không phải sản phẩm
  // cho khách) — trang đó tự kiểm tra isAdmin ngay trong file .astro của nó, không cần middleware.
  if (path === "/dai-cat-loi/xem-huong-nha-bat-trach/kiem-chung") {
    if (!context.locals.user?.isAdmin) {
      return context.redirect("/");
    }
  }

  return next();
});
