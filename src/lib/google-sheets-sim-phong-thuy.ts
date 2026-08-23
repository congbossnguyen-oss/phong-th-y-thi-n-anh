// Gửi bản ghi sang Google Sheet RIÊNG "Sim Phong Thủy Khai Vận Khí - Đơn đăng ký - Phong Thủy
// Thiên Anh" qua Apps Script Web App (xem docs/google-apps-script-sim-phong-thuy.gs).
//
// Sheet riêng, token riêng — KHÁC sheet "Khách hàng trả phí" dùng chung cho các công cụ VIP khác.
// Anh Công yêu cầu 2026-08-23: dịch vụ này thủ công (chuyên gia tự tìm sim), cần đủ chi tiết
// (CCCD, ngày giờ sinh, mong muốn, mạng, đầu số, khoảng giá...) ngay trên Sheet để tra cứu nhanh.
//
// CSDL vẫn là nguồn sự thật; Sheet chỉ là bản soi. Lỗi ở đây KHÔNG bao giờ được làm hỏng đơn của
// khách — chỉ log lại. Chưa cấu hình biến môi trường (chưa deploy Apps Script) thì âm thầm bỏ qua.

export interface DonSimPhongThuyChoSheet {
  maDon: string;
  hoTen: string;
  soDienThoaiZalo: string;
  /** Nhãn đã dịch sẵn tiếng Việt, vd "Nam" — không gửi mã kỹ thuật "nam" sang Sheet. */
  gioiTinh: string;
  /** Đã định dạng dd/mm/yyyy. */
  ngaySinh: string;
  /** Vd "9h" hoặc "Không nhớ". */
  gioSinh: string;
  /** Vd "Sơn Đầu Hỏa — Hỏa". */
  banMenh: string;
  soCCCD: string;
  diaChiNhanSim: string;
  congViecHienTai: string;
  mongMuonTimSim: string;
  mangMongMuon: string;
  /** Đã nối chuỗi, vd "09, 08". */
  dauSoUuTien: string;
  khoangGia: string;
  yeuCauRieng: string;
  giaGoc: number;
  maKhuyenMai: string;
  duocGiam: number;
  thucThu: number;
}

/**
 * Ghi 1 dòng vào tab "Đơn đăng ký" của Sheet riêng module Sim Phong Thủy Khai Vận Khí.
 *
 * Gọi khi đơn ĐÃ THANH TOÁN (trong markOrderPaidAndFulfill), không phải lúc tạo đơn.
 *
 * Phía Apps Script có chặn ghi trùng theo mã đơn, cần thiết vì webhook SePay có thể gửi lại tới
 * 7 lần trong 5 giờ nếu lần đầu lỗi.
 *
 * Trả về true nếu Sheet nhận được — tầng gọi dùng cờ này để biết Sheet đã ghi hay chưa.
 */
export async function ghiDonSimPhongThuyLenSheet(don: DonSimPhongThuyChoSheet): Promise<boolean> {
  const url = import.meta.env.GOOGLE_SHEETS_SIM_WEBHOOK_URL;
  const secret = import.meta.env.GOOGLE_SHEETS_SIM_WEBHOOK_SECRET;
  // Chưa deploy Apps Script (biến môi trường trống) → coi như "chưa ghi được", không phải lỗi.
  if (!url || !secret) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, hanhDong: "ghi_don", don }),
    });
    const json = await res.json().catch(() => null);
    if (!json || json.ok !== true) {
      console.error("[sheet-sim-phong-thuy] Apps Script trả về lỗi:", json);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sheet-sim-phong-thuy] Gọi Apps Script thất bại:", err);
    return false;
  }
}
