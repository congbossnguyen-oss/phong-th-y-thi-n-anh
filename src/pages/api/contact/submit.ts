import type { APIRoute } from "astro";
import { createConsultationRequest } from "../../../lib/db/consultationRequests";
import { sendConsultationRequestEmail } from "../../../lib/email/send";
import { appendConsultationRequestToSheet } from "../../../lib/google-sheets";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  // Honeypot: bot thường điền cả field ẩn này, người dùng thật để trống.
  if (form.get("website")) {
    return redirect("/lien-he?status=success", 303);
  }

  const name = form.get("name")?.toString().trim();
  const phone = form.get("phone")?.toString().trim();
  const email = form.get("email")?.toString().trim() || null;
  const topic = form.get("topic")?.toString().trim() || null;
  const message = form.get("message")?.toString().trim() || null;

  if (!name || !phone) {
    return redirect("/lien-he?status=error", 303);
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

  return redirect("/lien-he?status=success", 303);
};
