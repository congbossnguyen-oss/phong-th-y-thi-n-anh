import { Resend } from "resend";

let cached: Resend | null = null;

// Trì hoãn đọc RESEND_API_KEY đến lúc thực sự gửi email — tránh làm sập các trang
// không liên quan (marketing, blog...) khi build/deploy chưa cấu hình biến môi trường này.
export function getResendClient(): Resend {
  if (cached) return cached;

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu RESEND_API_KEY trong .env (xem .env.example).");
  }

  cached = new Resend(apiKey);
  return cached;
}

export function getFromAddress(): string {
  return import.meta.env.RESEND_FROM_EMAIL || "Phong Thủy Thiên Anh <onboarding@resend.dev>";
}
