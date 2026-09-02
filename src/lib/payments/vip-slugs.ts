import type { ToolSlug } from "./gia-cong-cu";

// Các dịch vụ VIP "trạch cát cao cấp" ĐI KÈM gói Cao Cấp: khách có gói Cao Cấp (hoặc đang dùng thử 7
// ngày — trial cũng hưởng hạng Cao Cấp) dùng MIỄN PHÍ, không qua QR. CỐ Ý loại `sim-phong-thuy-khai-
// van` (dịch vụ thủ công riêng) và `dinh-huong-nghe-nghiep` (không thuộc nhóm VIP này). Chủ dự án chốt
// 2026-08-25: "gói Nâng Cao (cao_cap) được dùng miễn phí các dịch vụ VIP này".
//
// Tách riêng khỏi checkout-cong-cu.ts để test được mà không kéo theo cả chuỗi import nặng (db, Sanity).
export const VIP_SLUG_THEO_GOI: ReadonlySet<ToolSlug> = new Set([
  "gio-liem-ha-huyet",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của gio-liem-ha-huyet — PHẢI có mặt ở đây, nếu
  // không khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "gio-liem-ha-huyet-qs",
  "xem-ngay-cao-cap",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của xem-ngay-cao-cap — PHẢI có mặt ở đây, nếu không
  // khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "xem-ngay-cao-cap-qs",
  "ngay-ky-hop-dong-cao-cap",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của ngay-ky-hop-dong-cao-cap — PHẢI có mặt ở đây,
  // nếu không khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "ngay-ky-hop-dong-cao-cap-qs",
  "ngay-cuoi-hoi",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của ngay-cuoi-hoi — PHẢI có mặt ở đây, nếu không
  // khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "ngay-cuoi-hoi-qs",
  "dat-ten-cho-con",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của dat-ten-cho-con — PHẢI có mặt ở đây, nếu không
  // khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "dat-ten-cho-con-qs",
  "nhan-chuc",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của nhan-chuc — PHẢI có mặt ở đây, nếu không khách
  // có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "nhan-chuc-qs",
  "ngay-khai-truong-cao-cap",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của ngay-khai-truong-cao-cap — PHẢI có mặt ở đây,
  // nếu không khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "ngay-khai-truong-cao-cap-qs",
  "trach-nhat-sinh-no",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của trach-nhat-sinh-no — PHẢI có mặt ở đây, nếu
  // không khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "trach-nhat-sinh-no-qs",
  // --- Nhóm KỲ MÔN ĐỘN GIÁP (chủ dự án chốt 27/8/2026: "các mục trong kỳ môn độn giáp này vào
  // gói") — thêm vào ĐỂ VIỆC ẨN GIÁ TRONG APP LÀ TRUNG THỰC: app Quân Sư không niêm yết giá lẻ
  // (prop `anGia`), nên nếu không cho vào gói thì khách bấm xong vẫn bị thu tiền mà không thấy giá.
  //
  // Anh Công có nhắc tới ý tưởng hạng "Siêu Cấp" riêng cho nhóm này — CHƯA làm, để phát triển sau.
  // Khi nào dựng hạng đó thì tách 3 slug này ra khỏi đây sang bộ riêng của hạng Siêu Cấp.
  "ky-mon-hoi-dap",
  "ky-mon-menh-chi-tiet",
  "trach-cat-ky-mon",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của "ky-mon-hoi-dap" — PHẢI có mặt ở đây, nếu không
  // khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "ky-mon-hoi-dap-qs",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của "ky-mon-menh-chi-tiet" — PHẢI có mặt ở đây, nếu
  // không khách có gói Cao Cấp trong app sẽ bị thu tiền dù đáng lẽ được miễn phí theo gói.
  "ky-mon-menh-chi-tiet-qs",
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) của "trach-cat-ky-mon" — cùng lý do trên.
  "trach-cat-ky-mon-qs",
]);
