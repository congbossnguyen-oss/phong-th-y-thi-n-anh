/**
 * Kiểm tra quyền truy cập theo GÓI THUÊ BAO (Cơ bản / Cao cấp × 1-3-6-12 tháng) — khác hẳn
 * `checkout-cong-cu.ts` (mua-đứt-theo-lượt, khóa theo orderCode, không cần tài khoản).
 *
 * Quyền tính theo TÀI KHOẢN (userId) + còn hạn hay không — không theo 1 đơn hàng cụ thể. Cao cấp
 * BAO GỒM mọi quyền của Cơ bản (Thầy: "gói Cao cấp gồm thêm trên nền Cơ bản", 2026-08-23).
 */
import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { subscriptions } from "../../../db/schema";
import type { SubscriptionTier } from "../payments/gia-subscription";
import type { PricingTier } from "../quan-su/types";

const BAC_HANG: Record<SubscriptionTier, number> = { co_ban: 1, cao_cap: 2 };

export interface GoiDangHoatDong {
  tier: SubscriptionTier;
  expiresAt: Date;
  isTrial: boolean;
}

/**
 * Gói đang hoạt động của 1 tài khoản (nếu có) — đọc thẳng từ DB, không cache, vì đây là điểm
 * quyết định khách có xem được nội dung trả phí hay không. `null` nếu chưa từng mua, đã hết hạn,
 * hoặc bị hủy.
 */
export async function layGoiDangHoatDong(userId: string): Promise<GoiDangHoatDong | null> {
  const [row] = await db
    .select({ tier: subscriptions.tier, expiresAt: subscriptions.expiresAt, status: subscriptions.status, isTrial: subscriptions.isTrial })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt <= new Date()) return null; // hết hạn — coi như không có gói (job dọn status="expired" chạy riêng, không chặn ở đây)
  return { tier: row.tier, expiresAt: row.expiresAt, isTrial: row.isTrial };
}

/**
 * true nếu tài khoản đang có gói ĐỦ HẠNG để dùng tính năng yêu cầu `hangYeuCau` — Cao cấp thỏa
 * mãn cả yêu cầu Cơ bản lẫn Cao cấp; Cơ bản chỉ thỏa mãn yêu cầu Cơ bản.
 */
export async function coQuyenTruyCap(userId: string | null, hangYeuCau: SubscriptionTier): Promise<boolean> {
  if (!userId) return false;
  const goi = await layGoiDangHoatDong(userId);
  if (!goi) return false;
  return BAC_HANG[goi.tier] >= BAC_HANG[hangYeuCau];
}

/**
 * Quy đổi `pricing_tier` của 1 câu hỏi Quân Sư sang hạng gói thuê bao cần có. Hai tầng câu hỏi
 * ánh xạ 1-1 sang hai gói — xem chú thích `PricingTier` trong quan-su/types.ts để biết nguyên tắc
 * phân tầng (theo DẠNG LUẬN: hỏi đóng một quẻ = Cơ bản; so sánh phương án hoặc luận sâu = Cao cấp).
 */
export function hangYeuCauTheoCauHoi(pricingTier: PricingTier): SubscriptionTier {
  return pricingTier === "cao-cap" ? "cao_cap" : "co_ban";
}
