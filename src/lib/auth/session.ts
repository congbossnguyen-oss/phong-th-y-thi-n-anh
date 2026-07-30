import { randomBytes, createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { sessions, users } from "../../../db/schema";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 ngày
export const SESSION_COOKIE_NAME = "thien_anh_session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

/**
 * Tạo session mới cho user, đồng thời XÓA MỌI session cũ của user đó.
 * Đây là cơ chế "chỉ 1 thiết bị đăng nhập cùng lúc" — đăng nhập ở máy mới
 * sẽ khiến cookie session ở máy cũ hết hiệu lực ngay lập tức (đăng xuất tự động).
 */
export async function createSession(userId: string, ipAddress: string): Promise<string> {
  await db.delete(sessions).where(eq(sessions.userId, userId));

  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    ipAddress,
  });

  return token;
}

/**
 * Xác thực session — đồng thời kiểm tra IP hiện tại có khớp IP lúc tạo session không.
 * Khác IP (kể cả cookie còn hạn) = coi như bị lộ/dùng chung, HỦY session và bắt đăng nhập lại.
 * Đây là lớp chống chia sẻ tài khoản bổ sung, bên cạnh chính sách "1 thiết bị/lúc".
 */
export async function validateSessionToken(token: string, currentIp: string): Promise<SessionUser | null> {
  const id = hashToken(token);
  const [row] = await db
    .select({
      sessionExpiresAt: sessions.expiresAt,
      sessionIp: sessions.ipAddress,
      userId: users.id,
      email: users.email,
      name: users.name,
      isAdmin: users.isAdmin,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, id))
    .limit(1);

  if (!row) return null;

  if (row.sessionExpiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  if (row.sessionIp && row.sessionIp !== currentIp) {
    // IP đổi khác lúc đăng nhập -> hủy session, bắt xác thực lại (chống dùng chung tài khoản).
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  return { id: row.userId, email: row.email, name: row.name, isAdmin: row.isAdmin };
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
}
