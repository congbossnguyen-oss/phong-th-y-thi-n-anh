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
  "ngay-cuoi-hoi": 499000,
  "dat-ten-cho-con": 499000,
  "nhan-chuc": 499000,
  "ngay-khai-truong-cao-cap": 499000,
  "dinh-huong-nghe-nghiep": 499000,
  "trach-nhat-sinh-no": 499000,
  "sim-phong-thuy-khai-van": 999999,
  "luan-giai-bat-tu-co-ban": 299000,
  "luan-giai-bat-tu-nang-cao": 499000,
  "ky-mon-menh-chi-tiet": 299000,
  "ky-mon-hoi-dap": 199000,
  "trach-cat-ky-mon": 499000,
  "luan-giai-tu-vi-co-ban": 149000,
  "luan-giai-tu-vi-nang-cao": 299000,
} as const;

/**
 * Giá "gốc" hiển thị gạch ngang cạnh giá thật để tạo hiệu ứng đã giảm giá — THUẦN QUẢNG CÁO,
 * không dùng để tính tiền (tiền luôn lấy từ GIA_CONG_CU). Chỉ thêm slug nào Công yêu cầu hiệu ứng
 * này (Kỳ Môn Hỏi Đáp: 199k thật, hiện kèm 399k gạch ngang -50%, theo yêu cầu 2026-08-25).
 */
export const GIA_GOC_HIEN_THI: Partial<Record<ToolSlug, number>> = {
  "ky-mon-hoi-dap": 399000,
  "trach-cat-ky-mon": 999000,
};

export type ToolSlug = keyof typeof GIA_CONG_CU;

/**
 * Module tang lễ có HAI BẬC GIÁ (đặc tả Phase 2 mục 8) — đây là ĐỊNH TUYẾN, không phải upsell:
 *
 *   - Gia đình CHƯA có huyệt (hỏa táng, gửi chùa, chưa mua đất) → gói cơ bản là sản phẩm ĐÚNG với
 *     họ. Không có tọa mộ để nhập thì gói đầy đủ vô nghĩa, tuyệt đối không gợi ý nâng cấp.
 *   - Gia đình ĐÃ có huyệt → gói đầy đủ mới đúng; gói cơ bản với họ là thiếu, không phải rẻ hơn.
 *
 * `GIA_CONG_CU["gio-liem-ha-huyet"]` giữ nguyên bằng giá gói cơ bản để các chỗ dùng chung (bảng
 * giá, mã khuyến mãi, trang danh sách công cụ) không phải sửa gì.
 */
export const GIA_GIO_LIEM_HA_HUYET = {
  /** Chỉ Phase 1 — chưởng pháp + thần sát trạch nhật. */
  coBan: 499000,
  /** Phase 1 + Phase 2 — lọc và xếp hạng lại theo tọa hướng huyệt mộ. Chủ dự án chốt 2026-08-17. */
  dayDu: 1000000,
} as const;

/**
 * Bậc giá suy từ việc CÓ TỌA ĐỘ HUYỆT hay không.
 *
 * ⚠️ Chỉ được gọi ở phía máy chủ với tọa độ đã kiểm. Không bao giờ nhận bậc giá do client gửi —
 * nếu không, ai cũng tự khai "gói cơ bản" rồi vẫn nhận kết quả Phase 2.
 */
export function giaGioLiemHaHuyet(coToaHuyet: boolean): number {
  return coToaHuyet ? GIA_GIO_LIEM_HA_HUYET.dayDu : GIA_GIO_LIEM_HA_HUYET.coBan;
}

export function laToolSlug(v: unknown): v is ToolSlug {
  // Dùng Object.hasOwn chứ KHÔNG dùng `in`: toán tử `in` xét cả chuỗi nguyên mẫu nên
  // laToolSlug("toString") / ("constructor") sẽ trả về true, lọt qua kiểm tra đầu vào.
  return typeof v === "string" && Object.hasOwn(GIA_CONG_CU, v);
}

/** Định dạng tiền để hiển thị, vd 999000 → "999.000đ". */
export function dinhDangTien(soTien: number): string {
  return `${soTien.toLocaleString("vi-VN")}đ`;
}
