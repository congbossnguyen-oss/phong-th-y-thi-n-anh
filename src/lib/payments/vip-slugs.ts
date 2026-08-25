import type { ToolSlug } from "./gia-cong-cu";

// Các dịch vụ VIP "trạch cát cao cấp" ĐI KÈM gói Cao Cấp: khách có gói Cao Cấp (hoặc đang dùng thử 7
// ngày — trial cũng hưởng hạng Cao Cấp) dùng MIỄN PHÍ, không qua QR. CỐ Ý loại `sim-phong-thuy-khai-
// van` (dịch vụ thủ công riêng) và `dinh-huong-nghe-nghiep` (không thuộc nhóm VIP này). Chủ dự án chốt
// 2026-08-25: "gói Nâng Cao (cao_cap) được dùng miễn phí các dịch vụ VIP này".
//
// Tách riêng khỏi checkout-cong-cu.ts để test được mà không kéo theo cả chuỗi import nặng (db, Sanity).
export const VIP_SLUG_THEO_GOI: ReadonlySet<ToolSlug> = new Set([
  "gio-liem-ha-huyet",
  "xem-ngay-cao-cap",
  "ngay-ky-hop-dong-cao-cap",
  "ngay-cuoi-hoi",
  "dat-ten-cho-con",
  "nhan-chuc",
  "ngay-khai-truong-cao-cap",
  "trach-nhat-sinh-no",
]);
