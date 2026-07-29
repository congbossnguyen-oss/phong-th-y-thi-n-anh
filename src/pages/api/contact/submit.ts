import type { APIRoute } from "astro";

export const prerender = false;

// TODO (Giai đoạn DB): khi có DATABASE_URL (Neon), lưu submission vào bảng riêng
// hoặc gửi email qua dịch vụ transactional (vd Resend) thay vì chỉ log.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  // Honeypot: bot thường điền cả field ẩn này, người dùng thật để trống.
  if (form.get("website")) {
    return redirect("/lien-he?status=success", 303);
  }

  const name = form.get("name")?.toString().trim();
  const phone = form.get("phone")?.toString().trim();

  if (!name || !phone) {
    return redirect("/lien-he?status=error", 303);
  }

  console.log("[contact-form] Yêu cầu tư vấn mới:", {
    name,
    phone,
    email: form.get("email"),
    topic: form.get("topic"),
    message: form.get("message"),
  });

  return redirect("/lien-he?status=success", 303);
};
