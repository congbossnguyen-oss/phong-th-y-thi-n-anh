import type { APIRoute } from "astro";
import { createConsultationRequest } from "../../../lib/db/consultationRequests";
import { sendConsultationRequestEmail } from "../../../lib/email/send";
import { appendConsultationRequestToSheet } from "../../../lib/google-sheets";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Form gửi bằng fetch()/JSON (thay vì HTML form POST thuần) để tránh bị Astro CSRF
  // (security.checkOrigin) chặn nhầm trên trình duyệt trong app (Zalo/Facebook) không gửi
  // header Origin — checkOrigin chỉ kiểm tra Content-Type form-urlencoded/multipart/text,
  // không kiểm tra application/json.
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bot gọi thẳng API (bỏ qua JS) thường điền cả field ẩn này, người dùng thật
  // để trống — âm thầm trả về thành công, không lưu/gửi gì, để không lộ bị chặn.
  if (typeof body.website === "string" && body.website.trim()) {
    return Response.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() || null : null;
  const topic = typeof body.topic === "string" ? body.topic.trim() || null : null;
  const message = typeof body.message === "string" ? body.message.trim() || null : null;

  if (!name || !phone) {
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  // Lưu DB và gửi email thông báo không được phép làm hỏng trải nghiệm gửi form của khách —
  // nếu 1 trong 2 lỗi (vd chưa cấu hình DATABASE_URL/RESEND_API_KEY ở môi trường nào đó), vẫn
  // log lại đầy đủ và trả về thành công cho khách, không chặn luồng chính.
  try {
    await createConsultationRequest({ name, phone, email, topic, message });
  } catch (err) {
    console.error("[contact-form] Lưu DB thất bại:", err);
  }

  try {
    await sendConsultationRequestEmail({ name, phone, email, topic, message });
  } catch (err) {
    console.error("[contact-form] Gửi email thông báo thất bại:", err);
  }

  try {
    await appendConsultationRequestToSheet({ name, phone, email, topic, message });
  } catch (err) {
    console.error("[contact-form] Lưu Google Sheet thất bại:", err);
  }

  console.log("[contact-form] Yêu cầu tư vấn mới:", { name, phone, email, topic, message });

  return Response.json({ ok: true });
};
