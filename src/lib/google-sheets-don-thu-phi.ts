// Gửi bản ghi sang Google Sheet "Khách hàng trả phí - Phong Thủy Thiên Anh" qua Apps Script Web
// App (xem docs/google-apps-script-don-thu-phi.gs).
//
// Sheet riêng, token riêng với 2 sheet kia (đăng ký tư vấn, mã khuyến mãi).
//
// CSDL vẫn là nguồn sự thật; Sheet chỉ là bản soi để anh Công thống kê doanh thu và khách hàng.
// Vì vậy lỗi ở đây KHÔNG bao giờ được làm hỏng đơn của khách — chỉ log lại. Chưa cấu hình biến
// môi trường (vd dev local) thì âm thầm bỏ qua.

/** Tên hiển thị cho khách/anh Công đọc, thay vì slug kỹ thuật trong CSDL. */
export const TEN_CONG_CU_HIEN_THI: Record<string, string> = {
  "gio-liem-ha-huyet": "Giờ Liệm – Hạ Huyệt",
  "xem-ngay-cao-cap": "Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch)",
  "ngay-ky-hop-dong-cao-cap": "Ngày Giờ Ký Kết Hợp Đồng",
  "ngay-ky-hop-dong-cao-cap-qs": "Ngày Giờ Ký Kết Hợp Đồng (app Quân Sư)",
  "ngay-cuoi-hoi": "Xem Ngày Cưới Hỏi Trọn Gói",
  "ngay-cuoi-hoi-qs": "Xem Ngày Cưới Hỏi Trọn Gói (app Quân Sư)",
  "nhan-chuc": "Chọn Ngày Giờ Nhận Chức",
  "nhan-chuc-qs": "Chọn Ngày Giờ Nhận Chức (app Quân Sư)",
  "dat-ten-cho-con": "Đặt Tên Cho Con (Việt Danh Học)",
  "dat-ten-cho-con-qs": "Đặt Tên Cho Con (Việt Danh Học) (app Quân Sư)",
  "ngay-khai-truong-cao-cap": "Ngày Khai Trương Cao Cấp (Bát Tự mệnh chủ)",
  "ngay-khai-truong-cao-cap-qs": "Ngày Khai Trương Cao Cấp (Bát Tự mệnh chủ) (app Quân Sư)",
  "dinh-huong-nghe-nghiep": "Định Hướng Nghề Nghiệp (Bát Tự × Tử Vi)",
  "dinh-huong-nghe-nghiep-qs": "Định Hướng Nghề Nghiệp (Bát Tự × Tử Vi) (app Quân Sư)",
  "trach-nhat-sinh-no": "Trạch Nhật Sinh Nở (Chọn Ngày Giờ Sinh Cho Bé)",
  "trach-nhat-sinh-no-qs": "Trạch Nhật Sinh Nở (Chọn Ngày Giờ Sinh Cho Bé) (app Quân Sư)",
  "ky-mon-menh-chi-tiet": "Luận Giải Kỳ Môn Mệnh (chi tiết)",
  "ky-mon-menh-chi-tiet-qs": "Luận Giải Kỳ Môn Mệnh (chi tiết) (app Quân Sư)",
  "ky-mon-hoi-dap": "Hỏi Đáp Kỳ Môn (1 sự việc cụ thể)",
  "trach-cat-ky-mon": "Trạch Cát Kỳ Môn (chọn ngày giờ theo bàn mệnh)",
  "trach-cat-ky-mon-qs": "Trạch Cát Kỳ Môn (chọn ngày giờ theo bàn mệnh) (app Quân Sư)",
  "sim-phong-thuy-khai-van": "Sim Phong Thủy Khai Vận Khí",
  "hop-hon": "Hợp Hôn Bát Tự × Tử Vi",
  "hop-hon-qs": "Hợp Hôn Bát Tự × Tử Vi (app Quân Sư)",
  "dau-thu-chon-ngay": "Đẩu Thủ Chọn Ngày",
};

export interface DonThuPhiChoSheet {
  maDon: string;
  toolSlug: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  /** Giá niêm yết trước khi giảm. */
  giaGoc: number;
  /** Mã khuyến mãi đã dùng, rỗng nếu không có. */
  maKhuyenMai: string;
  duocGiam: number;
  /** Số tiền thực tế thu được. Đơn dùng mã miễn phí 100% thì bằng 0. */
  thucThu: number;
}

/**
 * Ghi 1 dòng vào tab "Đơn đã thanh toán".
 *
 * Gọi khi đơn ĐÃ THANH TOÁN (trong markOrderPaidAndFulfill), không phải lúc tạo đơn — sheet này
 * để thống kê doanh thu nên chỉ được chứa tiền thật đã về.
 *
 * Phía Apps Script có chặn ghi trùng theo mã đơn, cần thiết vì webhook SePay có thể gửi lại tới
 * 7 lần trong 5 giờ nếu lần đầu lỗi.
 *
 * Trả về true nếu Sheet nhận được. Tầng gọi dùng cờ này để email báo cáo nói rõ Sheet đã ghi hay
 * chưa — nếu chưa thì email chính là bản ghi duy nhất.
 */
export async function ghiDonThuPhiLenSheet(don: DonThuPhiChoSheet): Promise<boolean> {
  const url = import.meta.env.GOOGLE_SHEETS_DON_WEBHOOK_URL;
  const secret = import.meta.env.GOOGLE_SHEETS_DON_WEBHOOK_SECRET;
  // Chưa cấu hình Sheet cũng tính là "chưa ghi được" — email báo cáo sẽ nêu rõ để anh Công nhập tay.
  if (!url || !secret) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        hanhDong: "ghi_don",
        don: {
          maDon: don.maDon,
          congCu: TEN_CONG_CU_HIEN_THI[don.toolSlug] ?? don.toolSlug,
          hoTen: don.hoTen,
          soDienThoai: don.soDienThoai,
          email: don.email,
          giaGoc: don.giaGoc,
          maKhuyenMai: don.maKhuyenMai,
          duocGiam: don.duocGiam,
          thucThu: don.thucThu,
        },
      }),
    });
    const json = await res.json().catch(() => null);
    if (!json || json.ok !== true) {
      console.error("[sheet-don] Apps Script trả về lỗi:", json);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sheet-don] Gọi Apps Script thất bại:", err);
    return false;
  }
}
