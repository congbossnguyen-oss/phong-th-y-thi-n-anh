import { describe, expect, it } from "vitest";
import { VIP_SLUG_THEO_GOI } from "./vip-slugs";
import { GIA_CONG_CU, type ToolSlug } from "./gia-cong-cu";

// Bảo vệ danh sách dịch vụ VIP được miễn phí theo gói Cao Cấp: đúng 19 (8 web + 8 "-qs" app Quân
// Sư + 3 Kỳ Môn chỉ có bản web — 3 slug "-qs" của nhóm Kỳ Môn CỐ Ý CHƯA đồng bộ sang nhánh dev
// này, xem ghi chú trong vip-slugs.ts), loại sim + dinh-huong.
describe("Gating dịch vụ VIP theo gói Cao Cấp — VIP_SLUG_THEO_GOI", () => {
  const CAN_MIEN_PHI: ToolSlug[] = [
    "gio-liem-ha-huyet",
    "gio-liem-ha-huyet-qs",
    "xem-ngay-cao-cap",
    "xem-ngay-cao-cap-qs",
    "ngay-ky-hop-dong-cao-cap",
    "ngay-ky-hop-dong-cao-cap-qs",
    "ngay-cuoi-hoi",
    "ngay-cuoi-hoi-qs",
    "dat-ten-cho-con",
    "dat-ten-cho-con-qs",
    "nhan-chuc",
    "nhan-chuc-qs",
    "ngay-khai-truong-cao-cap",
    "ngay-khai-truong-cao-cap-qs",
    "trach-nhat-sinh-no",
    "trach-nhat-sinh-no-qs",
    // Nhóm Kỳ Môn Độn Giáp — bổ sung 27/8/2026, xem ghi chú trong vip-slugs.ts. Chỉ bản web, chưa
    // có "-qs" trên nhánh này.
    "ky-mon-hoi-dap",
    "ky-mon-menh-chi-tiet",
    "trach-cat-ky-mon",
  ];

  it("đúng 19 dịch vụ VIP được miễn phí theo gói", () => {
    expect(VIP_SLUG_THEO_GOI.size).toBe(19);
    for (const s of CAN_MIEN_PHI) expect(VIP_SLUG_THEO_GOI.has(s)).toBe(true);
  });

  // Ẩn giá trong app (prop `anGia`) chỉ trung thực khi 3 mục Kỳ Môn thật sự nằm trong gói —
  // nếu ai đó gỡ chúng ra mà quên bật lại phần hiện giá, khách sẽ bị thu tiền mà không thấy giá.
  it("3 mục Kỳ Môn (app ẩn giá) phải nằm trong gói", () => {
    for (const s of ["ky-mon-hoi-dap", "ky-mon-menh-chi-tiet", "trach-cat-ky-mon"] as ToolSlug[]) {
      expect(VIP_SLUG_THEO_GOI.has(s)).toBe(true);
    }
  });

  it("KHÔNG miễn phí Sim (dịch vụ thủ công) và Định hướng nghề nghiệp", () => {
    expect(VIP_SLUG_THEO_GOI.has("sim-phong-thuy-khai-van")).toBe(false);
    expect(VIP_SLUG_THEO_GOI.has("dinh-huong-nghe-nghiep")).toBe(false);
    expect(VIP_SLUG_THEO_GOI.has("dinh-huong-nghe-nghiep-qs")).toBe(false);
  });

  it("mọi slug trong bộ đều là ToolSlug hợp lệ (có trong bảng giá)", () => {
    for (const s of VIP_SLUG_THEO_GOI) expect(GIA_CONG_CU).toHaveProperty(s);
  });
});
