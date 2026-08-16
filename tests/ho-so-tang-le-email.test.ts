// Test khoá nội dung email gửi kèm HỒ SƠ PDF tang lễ.
//
// Chỉ dựng nội dung, KHÔNG gọi Resend — không được để bộ test bắn thư thật ra ngoài.
import { describe, expect, it } from "vitest";
import { hoSoTangLeEmail } from "../src/lib/email/templates";
import { siteConfig } from "../src/lib/site-config";

const CO_BAN = { orderCode: "AB12CD34", customerName: "Nguyễn Thị B" };

describe("Email hồ sơ tang lễ", () => {
  it("có mã đơn, tên người nhận và hotline để gọi khi cần hỏi thêm", () => {
    const { subject, html } = hoSoTangLeEmail(CO_BAN);
    expect(subject).toContain("AB12CD34");
    expect(html).toContain("Nguyễn Thị B");
    expect(html).toContain(siteConfig.hotline);
  });

  it("nêu tên người mất khi có, và không để lại chỗ trống khi không có", () => {
    const co = hoSoTangLeEmail({ ...CO_BAN, hoTenNguoiMat: "Nguyễn Văn A" });
    expect(co.html).toContain("cho Nguyễn Văn A");

    const khong = hoSoTangLeEmail(CO_BAN);
    expect(khong.html).not.toContain("cho undefined");
    expect(khong.html).not.toContain("cho null");
    expect(khong.html).toContain("Hồ sơ chọn ngày giờ tang lễ");
  });

  it("không lọt chữ undefined / null / [object Object] vào thư gửi khách", () => {
    for (const kq of [hoSoTangLeEmail(CO_BAN), hoSoTangLeEmail({ ...CO_BAN, hoTenNguoiMat: null })]) {
      for (const xau of ["undefined", "null", "[object Object]", "NaN"]) {
        expect(kq.html, `thư lọt chuỗi "${xau}"`).not.toContain(xau);
        expect(kq.subject).not.toContain(xau);
      }
    }
  });

  it("giọng văn tiết chế — người nhận đang có tang", () => {
    // Chốt bằng test vì đây là loại lỗi rất dễ lọt khi ai đó sửa copy sau này: dùng lại mẫu email
    // bán hàng cho một email tang sự.
    const { subject, html } = hoSoTangLeEmail(CO_BAN);
    for (const cam of ["Chúc mừng", "chúc mừng", "khuyến mãi", "ưu đãi", "giảm giá", "🎉"]) {
      expect(html, `thư chứa từ không phù hợp: ${cam}`).not.toContain(cam);
    }
    expect(subject).not.toContain("Chúc mừng");
  });

  it("nhắc gia đình in ra để đối chiếu tại chỗ", () => {
    expect(hoSoTangLeEmail(CO_BAN).html).toContain("in hồ sơ");
  });
});
