import { describe, expect, it } from "vitest";
import { VIP_SLUG_THEO_GOI } from "./vip-slugs";
import { GIA_CONG_CU, type ToolSlug } from "./gia-cong-cu";

// Bảo vệ danh sách dịch vụ VIP được miễn phí theo gói Cao Cấp: đúng 21 (8 web + 8 "-qs" app Quân
// Sư + 3 Kỳ Môn chỉ có bản web + 2 "-qs" Đẩu Thủ/Thúc Đinh Tài Quý CHỈ bản app — 3 slug "-qs" của
// nhóm Kỳ Môn CỐ Ý CHƯA đồng bộ sang nhánh dev này, xem ghi chú trong vip-slugs.ts), loại sim +
// dinh-huong.
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
    // Đẩu Thủ Chọn Ngày + Thúc Đinh Tài Quý: CHỈ bản "-qs" (app), KHÔNG có bản web — anh Công chốt
    // 4/9/2026, xem ghi chú trong vip-slugs.ts.
    "dau-thu-chon-ngay-qs",
    "thuc-dinh-tai-quy-qs",
  ];

  it("đúng 21 dịch vụ VIP được miễn phí theo gói", () => {
    expect(VIP_SLUG_THEO_GOI.size).toBe(21);
    for (const s of CAN_MIEN_PHI) expect(VIP_SLUG_THEO_GOI.has(s)).toBe(true);
  });

  // Đẩu Thủ/Thúc Đinh Tài Quý là 2 module DUY NHẤT chỉ miễn phí ở bản app, không phải bản web —
  // khác mọi module VIP khác ở trên (miễn phí cả 2 bản). Khoá lại rõ để không ai "sửa cho nhất
  // quán" rồi thêm nhầm bản web vào.
  it("Đẩu Thủ/Thúc Đinh Tài Quý — CHỈ bản app miễn phí, bản web vẫn thu phí dù có gói", () => {
    expect(VIP_SLUG_THEO_GOI.has("dau-thu-chon-ngay")).toBe(false);
    expect(VIP_SLUG_THEO_GOI.has("thuc-dinh-tai-quy")).toBe(false);
    expect(VIP_SLUG_THEO_GOI.has("dau-thu-chon-ngay-qs")).toBe(true);
    expect(VIP_SLUG_THEO_GOI.has("thuc-dinh-tai-quy-qs")).toBe(true);
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
