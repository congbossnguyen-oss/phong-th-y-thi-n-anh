import { describe, expect, it } from "vitest";
import { VIP_SLUG_THEO_GOI } from "./vip-slugs";
import { GIA_CONG_CU, type ToolSlug } from "./gia-cong-cu";

// Bảo vệ danh sách dịch vụ VIP được miễn phí theo gói Cao Cấp: đúng 8, loại sim + dinh-huong.
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
  ];

  it("đúng 8 dịch vụ VIP được miễn phí theo gói", () => {
    expect(VIP_SLUG_THEO_GOI.size).toBe(8);
    for (const s of CAN_MIEN_PHI) expect(VIP_SLUG_THEO_GOI.has(s)).toBe(true);
  });

  it("KHÔNG miễn phí Sim (dịch vụ thủ công) và Định hướng nghề nghiệp", () => {
    expect(VIP_SLUG_THEO_GOI.has("sim-phong-thuy-khai-van")).toBe(false);
    expect(VIP_SLUG_THEO_GOI.has("dinh-huong-nghe-nghiep")).toBe(false);
  });

  it("mọi slug trong bộ đều là ToolSlug hợp lệ (có trong bảng giá)", () => {
    for (const s of VIP_SLUG_THEO_GOI) expect(GIA_CONG_CU).toHaveProperty(s);
  });
});
