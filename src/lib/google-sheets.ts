// Gửi bản ghi sang Google Sheet "Danh sách đăng ký tư vấn - Phong Thủy Thiên Anh" qua Apps
// Script Web App (xem docs/google-apps-script-consultation-sheet.gs để biết code + cách deploy).
// Không dùng Service Account/Sheets API trực tiếp — Apps Script đơn giản hơn nhiều cho use case
// "chỉ cần append 1 dòng", không cần bật Google Cloud API hay quản lý credential JSON riêng.
//
// Giống pattern DB/email: lỗi ở đây KHÔNG được làm hỏng trải nghiệm gửi form của khách — chỉ
// log lại. Nếu chưa cấu hình 2 biến môi trường (vd môi trường dev local), âm thầm bỏ qua.
export async function appendConsultationRequestToSheet(params: {
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
}) {
  const url = import.meta.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = import.meta.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        name: params.name,
        phone: params.phone,
        email: params.email ?? "",
        topic: params.topic ?? "",
        message: params.message ?? "",
      }),
    });
    const json = await res.json().catch(() => null);
    if (!json || json.ok !== true) {
      console.error("[google-sheets] Apps Script trả về lỗi:", json);
    }
  } catch (err) {
    console.error("[google-sheets] Gọi Apps Script thất bại:", err);
  }
}
