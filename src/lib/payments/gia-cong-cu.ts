/**
 * Bảng giá các công cụ thu phí — NGUỒN SỰ THẬT DUY NHẤT về giá.
 *
 * ⚠️ Mọi chỗ tính tiền phải đọc từ đây, KHÔNG bao giờ nhận số tiền client gửi lên. Trang .astro chỉ
 * hiển thị giá cho khách xem; con số quyết định đơn hàng luôn lấy từ file này ở phía máy chủ.
 */
export const GIA_CONG_CU = {
  "gio-liem-ha-huyet": 499000,
  "xem-ngay-cao-cap": 999000,
  "ngay-ky-hop-dong-cao-cap": 299000,
} as const;

export type ToolSlug = keyof typeof GIA_CONG_CU;

export function laToolSlug(v: unknown): v is ToolSlug {
  // Dùng Object.hasOwn chứ KHÔNG dùng `in`: toán tử `in` xét cả chuỗi nguyên mẫu nên
  // laToolSlug("toString") / ("constructor") sẽ trả về true, lọt qua kiểm tra đầu vào.
  return typeof v === "string" && Object.hasOwn(GIA_CONG_CU, v);
}

/** Định dạng tiền để hiển thị, vd 999000 → "999.000đ". */
export function dinhDangTien(soTien: number): string {
  return `${soTien.toLocaleString("vi-VN")}đ`;
}
