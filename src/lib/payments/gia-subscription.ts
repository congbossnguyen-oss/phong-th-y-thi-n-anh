/**
 * Bảng giá gói thuê bao "Quân Sư" (Cơ bản / Cao cấp × 1-3-6-12 tháng) — NGUỒN SỰ THẬT DUY NHẤT.
 *
 * ⚠️ Giá CHƯA CHỐT (Thầy: "khung giá cứ để sau anh tính đi", 2026-08-23) — để `null` thay vì 0, vì
 * 0 dễ bị đọc nhầm là "miễn phí". `giaSubscription()` NÉM LỖI nếu gọi tới mức giá còn `null`, để
 * không thể vô tình cho khách checkout gói chưa có giá thật.
 *
 * Mọi chỗ tính tiền phải đọc từ đây, KHÔNG bao giờ nhận số tiền client gửi lên (giống quy ước
 * `gia-cong-cu.ts`).
 */
export type SubscriptionTier = "co_ban" | "cao_cap";
export type SubscriptionDuration = "1_thang" | "3_thang" | "6_thang" | "1_nam";

export const SO_THANG_THEO_KY_HAN: Record<SubscriptionDuration, number> = {
  "1_thang": 1,
  "3_thang": 3,
  "6_thang": 6,
  "1_nam": 12,
};

/**
 * ⚠️ CHỐT GIÁ 27/8/2026 (anh Công giao: "em cứ chốt như nào thấy hợp lý... để anh cho ra thị trường
 * được", yêu cầu làm tròn số). Trước đó cả 8 mức để `null` từ 23/8 nên gói thuê bao — nguồn doanh
 * thu ĐỊNH KỲ duy nhất của hệ thống — không bán được đồng nào.
 *
 * Căn cứ đặt giá:
 *  · Rẻ hơn MỘT lần mua module lẻ (300k–1.000k) để khách thấy hời ngay khi so sánh.
 *  · Nhưng dùng quá ~3 tháng là đã vượt doanh thu bán lẻ một lần → có lợi cho cả hai bên.
 *  · Cao cấp ≈ 2,3× Cơ bản: đủ chênh để người có điều kiện chọn gói cao, không quá xa thành vô lý.
 *  · Gói năm = giá 10 tháng (tặng 2 tháng) — mức khuyến khích trả trước phổ biến, dễ hiểu.
 *
 * Giá vốn thực tế mỗi lượt AI chỉ ~5.000–18.000đ, nên biên lợi nhuận rất cao ở mọi mức;
 * ràng buộc thật khi định giá là SỨC MUA và cảm nhận giá trị, không phải chi phí.
 */
export const GIA_SUBSCRIPTION: Record<SubscriptionTier, Record<SubscriptionDuration, number | null>> = {
  co_ban: {
    "1_thang": 150000,
    "3_thang": 400000, // tiết kiệm 50.000đ
    "6_thang": 750000, // tiết kiệm 150.000đ
    "1_nam": 1500000, // tiết kiệm 300.000đ (≈ tặng 2 tháng)
  },
  cao_cap: {
    "1_thang": 350000,
    "3_thang": 950000, // tiết kiệm 100.000đ
    "6_thang": 1800000, // tiết kiệm 300.000đ
    "1_nam": 3500000, // tiết kiệm 700.000đ (≈ tặng 2 tháng)
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
  return v === "co_ban" || v === "cao_cap";
}

export function laSubscriptionDuration(v: unknown): v is SubscriptionDuration {
  return typeof v === "string" && Object.hasOwn(SO_THANG_THEO_KY_HAN, v);
}

/** Định dạng tiền để hiển thị, vd 999000 → "999.000đ". */
export function dinhDangTien(soTien: number): string {
  return `${soTien.toLocaleString("vi-VN")}đ`;
}
