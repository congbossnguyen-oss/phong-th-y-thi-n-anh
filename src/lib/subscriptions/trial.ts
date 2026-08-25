/**
 * Dùng thử 7 ngày miễn phí — mỗi tài khoản CHỈ 1 lần trọn đời (dù đã hết hạn hay bị hủy vẫn tính
 * là "đã dùng"). Cho hưởng hạng Cao cấp trong lúc thử để khách thấy hết giá trị trước khi chốt gói
 * (Thầy: "cho dùng thử 7 ngày miễn phí, sau đó chốt gói nào cũng được", 2026-08-23).
 *
 * Không đi qua `orders`/SePay — tạo thẳng 1 dòng `subscriptions` với isTrial=true, duration=null,
 * orderId=null.
 */
import { and, eq, gte } from "drizzle-orm";
import { db } from "../db/client";
import { subscriptions, trialDevices } from "../../../db/schema";

const SO_NGAY_DUNG_THU = 7;

// Chống lạm dụng mức "Vừa": mỗi THIẾT BỊ chỉ 1 lượt trial; mỗi IP tối đa IP_TRIAL_TOI_DA lượt trong
// IP_CUA_SO_NGAY ngày (nới để không chặn nhầm gia đình/công ty dùng chung 1 IP). Xem docs quyết định
// của chủ dự án 2026-08-25.
const IP_TRIAL_TOI_DA = 3;
const IP_CUA_SO_NGAY = 90;

/** Ngữ cảnh thiết bị để chống lạm dụng — endpoint truyền vào (device id từ cookie + IP client). */
export interface TrialDeviceContext {
  deviceId: string;
  ip: string;
}

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
export async function batDauDungThu(userId: string, device?: TrialDeviceContext): Promise<{ expiresAt: Date }> {
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

  // --- Chống lạm dụng mức "Vừa" (theo thiết bị + IP) ---
  if (device) {
    const [thietBiDaThu] = await db
      .select({ id: trialDevices.id })
      .from(trialDevices)
      .where(eq(trialDevices.deviceId, device.deviceId))
      .limit(1);
    if (thietBiDaThu) {
      throw new Error("Thiết bị này đã dùng thử rồi — mỗi thiết bị chỉ dùng thử được 1 lần. Vui lòng nâng gói để tiếp tục.");
    }

    const tuNgay = new Date(Date.now() - IP_CUA_SO_NGAY * 24 * 60 * 60 * 1000);
    const luotCungIp = await db
      .select({ id: trialDevices.id })
      .from(trialDevices)
      .where(and(eq(trialDevices.ip, device.ip), gte(trialDevices.createdAt, tuNgay)));
    if (luotCungIp.length >= IP_TRIAL_TOI_DA) {
      throw new Error("Mạng của bạn đã có nhiều lượt dùng thử gần đây. Vui lòng nâng gói để tiếp tục sử dụng.");
    }
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

  // Ghi lại thiết bị + IP đã dùng trial để lần sau chặn (mức "Vừa").
  if (device) {
    await db.insert(trialDevices).values({ userId, deviceId: device.deviceId, ip: device.ip });
  }

  return { expiresAt };
}
