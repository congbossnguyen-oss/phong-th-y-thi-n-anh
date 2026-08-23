/**
 * Dùng thử 7 ngày miễn phí — mỗi tài khoản CHỈ 1 lần trọn đời (dù đã hết hạn hay bị hủy vẫn tính
 * là "đã dùng"). Cho hưởng hạng Cao cấp trong lúc thử để khách thấy hết giá trị trước khi chốt gói
 * (Thầy: "cho dùng thử 7 ngày miễn phí, sau đó chốt gói nào cũng được", 2026-08-23).
 *
 * Không đi qua `orders`/SePay — tạo thẳng 1 dòng `subscriptions` với isTrial=true, duration=null,
 * orderId=null.
 */
import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { subscriptions } from "../../../db/schema";

const SO_NGAY_DUNG_THU = 7;

export async function daTungDungThu(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.isTrial, true)))
    .limit(1);
  return !!row;
}

/**
 * Kích hoạt dùng thử. Ném lỗi (message tiếng Việt, hiển thị thẳng cho khách) nếu không đủ điều
 * kiện — KHÔNG âm thầm bỏ qua, để tránh lộ ra bug "bấm mà không thấy gì xảy ra".
 */
export async function batDauDungThu(userId: string): Promise<{ expiresAt: Date }> {
  const [dangHoatDong] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);
  if (dangHoatDong) {
    throw new Error("Tài khoản đang có gói hoạt động, không cần dùng thử.");
  }

  if (await daTungDungThu(userId)) {
    throw new Error("Tài khoản đã dùng thử rồi, mỗi tài khoản chỉ dùng thử được 1 lần.");
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt);
  expiresAt.setDate(expiresAt.getDate() + SO_NGAY_DUNG_THU);

  await db.insert(subscriptions).values({
    userId,
    tier: "cao_cap",
    duration: null,
    isTrial: true,
    status: "active",
    startedAt,
    expiresAt,
    orderId: null,
  });

  return { expiresAt };
}
