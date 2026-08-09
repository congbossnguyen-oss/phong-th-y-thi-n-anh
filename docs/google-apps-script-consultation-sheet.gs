/**
 * Apps Script gắn vào Google Sheet "Danh sách đăng ký tư vấn - Phong Thủy Thiên Anh".
 *
 * CÁCH CÀI ĐẶT:
 * 1. Mở sheet → Extensions (Tiện ích mở rộng) → Apps Script.
 * 2. Xoá code mẫu có sẵn, dán toàn bộ nội dung file này vào.
 * 3. Đổi SECRET_TOKEN bên dưới thành 1 chuỗi bí mật tự đặt (càng dài càng khó đoán,
 *    ví dụ 32 ký tự ngẫu nhiên) — đây là "mật khẩu" để phân biệt request thật từ web
 *    với request giả mạo, vì URL sau khi deploy sẽ công khai.
 * 4. Bấm biểu tượng đĩa mềm để lưu (Ctrl+S).
 * 5. Bấm nút "Deploy" (Triển khai) ở góc trên phải → "New deployment" (Triển khai mới).
 *    - Chọn loại: "Web app".
 *    - Execute as (Thực thi với tư cách): "Me" (chính anh).
 *    - Who has access (Ai có quyền truy cập): "Anyone" (Bất kỳ ai) — bắt buộc để server
 *      web gọi được, nhưng an toàn vì có SECRET_TOKEN chặn request không hợp lệ.
 *    - Bấm "Deploy". Google có thể hỏi xác nhận quyền truy cập Sheet — chấp nhận.
 * 6. Copy URL Web App hiện ra (dạng https://script.google.com/macros/s/.../exec).
 * 7. Gửi lại cho Claude: URL này + SECRET_TOKEN đã đặt ở bước 3, để nối vào code web.
 *
 * LƯU Ý: mỗi khi sửa code này, phải bấm "Deploy" → "Manage deployments" → biểu tượng
 * bút chì → chọn version mới → "Deploy" lại thì thay đổi mới có hiệu lực (Save thôi
 * chưa đủ, URL cũ vẫn chạy code cũ).
 */

const SECRET_TOKEN = "ĐỔI_CHUỖI_NÀY_THÀNH_MẬT_KHẨU_BÍ_MẬT_CỦA_ANH";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SECRET_TOKEN) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "Sai secret token" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.name || "",
      body.phone || "",
      body.email || "",
      body.topic || "",
      body.message || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
