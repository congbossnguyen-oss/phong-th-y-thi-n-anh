import { randomBytes, createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { passwordResetTokens } from "../../../db/schema";

// Cùng cách hash token thô như sessions.ts — không lưu token thô vào DB, chỉ hash. Token thô chỉ
// nằm trong link gửi qua email, không bao giờ chạm tới DB.
const RESET_TOKEN_DURATION_MS = 1000 * 60 * 60; // 1 giờ — đủ để khách mở email, ngắn để giảm rủi ro nếu email bị lộ.

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Tạo token đặt lại mật khẩu mới cho user, XOÁ mọi token cũ của user đó trước (chỉ 1 link còn
 * hiệu lực tại 1 thời điểm — giống cơ chế "1 session/lúc" của sessions.ts, tránh spam yêu cầu rồi
 * lộ token cũ còn dùng được).
 */
export async function taoTokenDatLaiMatKhau(userId: string): Promise<string> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  const token = randomBytes(32).toString("hex");
  await db.insert(passwordResetTokens).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
  });

  return token;
}

/**
 * Xác thực + TIÊU HUỶ token (dùng 1 lần) — trả về userId nếu hợp lệ, `null` nếu không tồn tại/hết
 * hạn. Xoá ngay cả khi hết hạn (dọn rác), không chỉ khi hợp lệ.
 */
export async function tieuThuTokenDatLaiMatKhau(token: string): Promise<string | null> {
  const id = hashToken(token);
  const [row] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.id, id)).limit(1);
  if (!row) return null;

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id));

  if (row.expiresAt.getTime() < Date.now()) return null;
  return row.userId;
}
