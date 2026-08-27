import { describe, it, expect } from "vitest";
import {
  GIA_CONG_CU,
  GIA_GOC_HIEN_THI,
  MODULE_KHOA_THU_NGHIEM,
  dangKhoaThuNghiem,
  nhanGiaLuot,
  dinhDangTien,
  type ToolSlug,
} from "./gia-cong-cu";

describe("bảng giá — khoá hành vi", () => {
  it("mọi giá đều LÀM TRÒN tới hàng trăm nghìn (anh Công chốt 27/8/2026)", () => {
    for (const [slug, gia] of Object.entries(GIA_CONG_CU)) {
      expect(gia % 100000, `${slug} = ${gia} chưa làm tròn`).toBe(0);
    }
    for (const [slug, gia] of Object.entries(GIA_GOC_HIEN_THI)) {
      expect((gia ?? 0) % 100000, `giá gốc ${slug} chưa làm tròn`).toBe(0);
    }
  });

  it("không còn giá lẻ kiểu 499.000đ / 999.999đ", () => {
    const xau = Object.values(GIA_CONG_CU).filter((g) => String(g).match(/9{2,}$/));
    expect(xau).toEqual([]);
  });

  it("giá gốc hiển thị phải CAO HƠN giá thật (nếu không thì hiệu ứng giảm giá là sai sự thật)", () => {
    for (const [slug, giaGoc] of Object.entries(GIA_GOC_HIEN_THI)) {
      expect(giaGoc ?? 0, `giá gốc ${slug} phải > giá thật`).toBeGreaterThan(GIA_CONG_CU[slug as ToolSlug]);
    }
  });

  it("bậc TRỌN ĐỜI phải đắt hơn bậc CƠ BẢN của cùng một module", () => {
    expect(GIA_CONG_CU["luan-giai-bat-tu-nang-cao"]).toBeGreaterThan(GIA_CONG_CU["luan-giai-bat-tu-co-ban"]);
    expect(GIA_CONG_CU["luan-giai-tu-vi-nang-cao"]).toBeGreaterThan(GIA_CONG_CU["luan-giai-tu-vi-co-ban"]);
  });

  it("nhãn giá sinh từ đúng nguồn, không lệch khỏi số tiền thật", () => {
    // Đây chính là lỗi đã phát hiện 27/8/2026: giá gõ cứng ở 42 chỗ, đổi giá thì trang hiện số cũ
    // trong khi thanh toán tính số mới. Test này khoá lại để không tái diễn.
    for (const slug of Object.keys(GIA_CONG_CU) as ToolSlug[]) {
      expect(nhanGiaLuot(slug)).toBe(`${dinhDangTien(GIA_CONG_CU[slug])} / lượt`);
    }
  });

  it("4 module Bát Tự/Tử Vi ĐANG KHÓA thu phí (anh Công yêu cầu test kỹ trước khi mở)", () => {
    // Nếu ai đó gỡ khoá, test này đỏ để buộc phải xác nhận lại với anh Công — tránh vô tình
    // mở bán khi chưa test xong.
    for (const slug of [
      "luan-giai-bat-tu-co-ban",
      "luan-giai-bat-tu-nang-cao",
      "luan-giai-tu-vi-co-ban",
      "luan-giai-tu-vi-nang-cao",
    ] as ToolSlug[]) {
      expect(dangKhoaThuNghiem(slug), `${slug} phải đang khoá`).toBe(true);
    }
  });

  it("module KHÁC không bị khoá nhầm", () => {
    for (const slug of ["hop-hon", "xem-ngay-cao-cap", "trach-nhat-sinh-no", "ky-mon-hoi-dap"] as ToolSlug[]) {
      expect(dangKhoaThuNghiem(slug), `${slug} KHÔNG được khoá`).toBe(false);
    }
    expect(MODULE_KHOA_THU_NGHIEM.length).toBe(4);
  });
});
