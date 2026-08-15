// Gửi bản ghi sang Google Sheet "Mã khuyến mãi - Phong Thủy Thiên Anh" qua Apps Script Web App
// (xem docs/google-apps-script-promo-sheet.gs để biết code + cách deploy).
//
// Sheet riêng, token riêng với sheet đăng ký tư vấn — hỏng cái này không kéo theo cái kia.
//
// Giống pattern của google-sheets.ts: CSDL mới là nguồn sự thật, Sheet chỉ là bản soi cho anh Công
// xem/ghi chú. Vì vậy lỗi ở đây KHÔNG bao giờ được làm hỏng đơn hàng của khách — chỉ log lại.
// Chưa cấu hình biến môi trường (vd dev local) thì âm thầm bỏ qua.

export interface LuotDungMaChoSheet {
  ma: string;
  congCu: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  maDon: string;
  giaGoc: number;
  duocGiam: number;
  phaiTra: number;
}

/**
 * Ghi 1 dòng vào tab "Lượt sử dụng" — gọi sau khi đơn đã tạo và mã đã trừ lượt thành công.
 * Không `await` chặn luồng trả kết quả cho khách nếu không cần thiết.
 */
export async function ghiLuotDungMaLenSheet(luot: LuotDungMaChoSheet): Promise<void> {
  const url = import.meta.env.GOOGLE_SHEETS_PROMO_WEBHOOK_URL;
  const secret = import.meta.env.GOOGLE_SHEETS_PROMO_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        hanhDong: "ghi_luot_dung",
        luot: {
          ...luot,
          giaGoc: luot.giaGoc.toLocaleString("vi-VN"),
          duocGiam: luot.duocGiam.toLocaleString("vi-VN"),
          phaiTra: luot.phaiTra.toLocaleString("vi-VN"),
        },
      }),
    });
    const json = await res.json().catch(() => null);
    if (!json || json.ok !== true) {
      console.error("[sheet-promo] Apps Script trả về lỗi:", json);
    }
  } catch (err) {
    console.error("[sheet-promo] Gọi Apps Script thất bại:", err);
  }
}
