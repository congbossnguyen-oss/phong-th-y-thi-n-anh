/**
 * Bảng giá gói thuê bao "Quân Sư" (Cơ bản / Cao cấp / VIP × 1-3-6-12 tháng) — NGUỒN SỰ THẬT DUY NHẤT.
 *
 * Cả 3 hạng đã chốt giá (Thầy, 2026-09-14). Giá `null` là chỗ dành cho lần sau nếu mở thêm hạng mới
 * mà chưa kịp chốt — để `null` thay vì 0, vì 0 dễ bị đọc nhầm là "miễn phí". `giaSubscription()`
 * NÉM LỖI nếu gọi tới mức giá còn `null`, để không thể vô tình cho khách checkout gói chưa có giá thật.
 *
 * Mọi chỗ tính tiền phải đọc từ đây, KHÔNG bao giờ nhận số tiền client gửi lên (giống quy ước
 * `gia-cong-cu.ts`).
 */
export type SubscriptionTier = "co_ban" | "cao_cap" | "vip";
export type SubscriptionDuration = "1_thang" | "3_thang" | "6_thang" | "1_nam";

export const SO_THANG_THEO_KY_HAN: Record<SubscriptionDuration, number> = {
  "1_thang": 1,
  "3_thang": 3,
  "6_thang": 6,
  "1_nam": 12,
};

export const GIA_SUBSCRIPTION: Record<SubscriptionTier, Record<SubscriptionDuration, number | null>> = {
  co_ban: {
    "1_thang": 150_000,
    "3_thang": 400_000,
    "6_thang": 750_000,
    "1_nam": 1_500_000,
  },
  cao_cap: {
    "1_thang": 350_000,
    "3_thang": 950_000,
    "6_thang": 1_800_000,
    "1_nam": 3_500_000,
  },
  vip: {
    "1_thang": 550_000,
    "3_thang": 1_480_000,
    "6_thang": 2_790_000,
    "1_nam": 5_500_000,
  },
};

/** true nếu gói tier+duration đã có giá thật (khác null) — dùng để ẩn nút mua ở UI khi chưa chốt giá. */
export function daCoGia(tier: SubscriptionTier, duration: SubscriptionDuration): boolean {
  return GIA_SUBSCRIPTION[tier][duration] !== null;
}

/**
 * Lấy giá thật (VNĐ) cho 1 gói. NÉM LỖI nếu giá chưa được điền — cố ý, để không ai vô tình mở bán
 * gói 0đ trước khi Thầy chốt bảng giá.
 */
export function giaSubscription(tier: SubscriptionTier, duration: SubscriptionDuration): number {
  const gia = GIA_SUBSCRIPTION[tier][duration];
  if (gia === null) {
    throw new Error(`Chưa chốt giá cho gói ${tier}/${duration} — cập nhật GIA_SUBSCRIPTION trong gia-subscription.ts trước khi mở bán.`);
  }
  return gia;
}

export function laSubscriptionTier(v: unknown): v is SubscriptionTier {
  return v === "co_ban" || v === "cao_cap" || v === "vip";
}

export function laSubscriptionDuration(v: unknown): v is SubscriptionDuration {
  return typeof v === "string" && Object.hasOwn(SO_THANG_THEO_KY_HAN, v);
}

/** Định dạng tiền để hiển thị, vd 999000 → "999.000đ". */
export function dinhDangTien(soTien: number): string {
  return `${soTien.toLocaleString("vi-VN")}đ`;
}
