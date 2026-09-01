import { describe, expect, it } from "vitest";
import { VIP_SLUG_THEO_GOI } from "./vip-slugs";
import { GIA_CONG_CU, type ToolSlug } from "./gia-cong-cu";

// Bảo vệ danh sách dịch vụ VIP được miễn phí theo gói Cao Cấp: đúng 14, loại sim + dinh-huong.
describe("Gating dịch vụ VIP theo gói Cao Cấp — VIP_SLUG_THEO_GOI", () => {
  const CAN_MIEN_PHI: ToolSlug[] = [
    "gio-liem-ha-huyet",
    "xem-ngay-cao-cap",
    "ngay-ky-hop-dong-cao-cap",
    "ngay-cuoi-hoi",
    "dat-ten-cho-con",
    "nhan-chuc",
    "ngay-khai-truong-cao-cap",
    "trach-nhat-sinh-no",
    // Nhóm Kỳ Môn Độn Giáp — bổ sung 27/8/2026, xem ghi chú trong vip-slugs.ts.
    "ky-mon-hoi-dap",
    "ky-mon-menh-chi-tiet",
    "trach-cat-ky-mon",
    // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026) — xem ghi chú trong vip-slugs.ts.
    "ky-mon-menh-chi-tiet-qs",
    "trach-nhat-sinh-no-qs",
    "nhan-chuc-qs",
  ];

  it("đúng 14 dịch vụ VIP được miễn phí theo gói", () => {
    expect(VIP_SLUG_THEO_GOI.size).toBe(14);
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
  });

  it("mọi slug trong bộ đều là ToolSlug hợp lệ (có trong bảng giá)", () => {
    for (const s of VIP_SLUG_THEO_GOI) expect(GIA_CONG_CU).toHaveProperty(s);
  });
});
