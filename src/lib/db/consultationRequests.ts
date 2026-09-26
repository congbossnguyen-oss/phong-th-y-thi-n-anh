import { db } from "./client";
import { consultationRequests } from "../../../db/schema";

export async function createConsultationRequest(params: {
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
  // Gắn tài khoản CHỈ khi khách đang đăng nhập lúc gửi form (đọc từ session, không suy đoán bằng
  // email/phone). Mặc định null — form không bắt đăng nhập.
  userId?: string | null;
}) {
  const [row] = await db
    .insert(consultationRequests)
    .values({
      name: params.name,
      phone: params.phone,
      email: params.email,
      topic: params.topic,
      message: params.message,
      userId: params.userId ?? null,
    })
    .returning({ id: consultationRequests.id });

  return row.id;
}
