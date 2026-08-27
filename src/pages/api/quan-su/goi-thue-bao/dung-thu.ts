import type { APIRoute } from "astro";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * DÙNG THỬ ĐÃ NGƯNG VĨNH VIỄN (anh Công quyết định 27/8/2026): toàn bộ giá trị của gói Cao cấp là
 * tính năng gọi AI (Quân Sư hỏi-đáp) — `/api/auth/register` không xác thực email/SĐT/CAPTCHA gì cả,
 * nên "1 lượt/thiết bị + tối đa 3/IP" không chặn được người cố tình tạo tài khoản mới để lấy AI miễn
 * phí liên tục. Nguyên tắc mới: KHÔNG trả phí = KHÔNG được dùng tính năng gọi AI, không có ngoại lệ
 * dùng thử. Endpoint giữ lại (không xoá) để trả lỗi rõ ràng cho mọi request cũ/UI cũ còn gọi tới,
 * thay vì 404 khó hiểu. `batDauDungThu`/`trial.ts` vẫn giữ nguyên trong code (không xoá) — nếu sau
 * này có gói/tính năng KHÔNG tốn AI thì có thể tái dùng cơ chế này.
 */
export const POST: APIRoute = async () => {
  return jsonResponse(
    { ok: false, error: "Phong Thủy Thiên Anh không còn cung cấp bản dùng thử — mọi tính năng của Quân Sư đều dùng AI thật, không thể trải nghiệm miễn phí. Anh/chị vui lòng đăng ký gói chính thức bên dưới." },
    403,
  );
};
