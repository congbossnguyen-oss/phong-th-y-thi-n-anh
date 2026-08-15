/**
 * Nạp toàn bộ đơn công cụ ĐÃ THANH TOÁN từ CSDL lên Google Sheet "Khách hàng trả phí".
 *
 *   node scripts/dong-bo-don-len-sheet.mjs           → chỉ thêm đơn còn thiếu (an toàn, giữ ghi chú)
 *   node scripts/dong-bo-don-len-sheet.mjs --lam-lai → XOÁ sạch rồi ghi lại từ đầu
 *
 * ⚠️ `--lam-lai` sẽ mất cột "Ghi chú" anh tự gõ trong sheet. Chỉ dùng khi cần dựng lại từ đầu.
 * Chế độ mặc định gửi từng đơn một, phía Apps Script tự bỏ qua mã đơn đã có nên chạy lại nhiều
 * lần cũng không sinh dòng trùng.
 *
 * Khi nào cần: Sheet mới deploy xong và muốn nạp lịch sử cũ, hoặc có lúc webhook ghi hụt.
 * CSDL luôn là nguồn sự thật; Sheet chỉ là bản soi.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
const docEnv = (key) => envText.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim() || "";

const databaseUrl = docEnv("DATABASE_URL");
if (!databaseUrl) throw new Error("Thiếu DATABASE_URL trong .env");

const url = docEnv("GOOGLE_SHEETS_DON_WEBHOOK_URL");
const secret = docEnv("GOOGLE_SHEETS_DON_WEBHOOK_SECRET");
const daCauHinhSheet = Boolean(url && secret);

// Giữ khớp với TEN_CONG_CU_HIEN_THI trong src/lib/google-sheets-don-thu-phi.ts.
const TEN_CONG_CU = {
  "gio-liem-ha-huyet": "Giờ Liệm – Hạ Huyệt",
  "xem-ngay-cao-cap": "Xem Ngày Cao Cấp (Động Thổ / Nhập Trạch)",
  "ngay-ky-hop-dong-cao-cap": "Ngày Giờ Ký Kết Hợp Đồng",
};

const lamLai = process.argv.includes("--lam-lai");
const sql = neon(databaseUrl);

const rows = await sql`
  SELECT o.order_code, o.tool_slug, o.customer_name, o.customer_phone, o.customer_email,
         o.total_amount, o.promo_discount_amount, o.paid_at, p.code AS ma_khuyen_mai
  FROM orders o
  LEFT JOIN promo_codes p ON p.id = o.promo_code_id
  WHERE o.order_type = 'tool' AND o.status = 'confirmed'
  ORDER BY o.paid_at ASC
`;

const danhSach = rows.map((r) => {
  const thucThu = Number(r.total_amount);
  const duocGiam = Number(r.promo_discount_amount ?? 0);
  return {
    thoiDiem: r.paid_at
      ? new Date(r.paid_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      : "",
    maDon: r.order_code,
    congCu: TEN_CONG_CU[r.tool_slug] ?? r.tool_slug ?? "",
    hoTen: r.customer_name ?? "",
    soDienThoai: r.customer_phone ?? "",
    email: r.customer_email ?? "",
    giaGoc: thucThu + duocGiam,
    maKhuyenMai: r.ma_khuyen_mai ?? "",
    duocGiam,
    thucThu,
  };
});

const tongThu = danhSach.reduce((t, d) => t + d.thucThu, 0);
console.log(
  `\nCSDL đang có ${danhSach.length} đơn công cụ đã thanh toán · tổng thực thu ` +
    `${tongThu.toLocaleString("vi-VN")}đ`,
);

if (danhSach.length === 0) {
  console.log("Không có gì để đồng bộ.\n");
  process.exit(0);
}

// Kiểm cấu hình SAU khi truy vấn: chạy script lúc chưa deploy Apps Script vẫn biết được CSDL có
// bao nhiêu đơn, và câu truy vấn có chạy đúng không.
if (!daCauHinhSheet) {
  console.log(
    "\n⚠️  Chưa cấu hình GOOGLE_SHEETS_DON_WEBHOOK_URL / _SECRET trong .env nên chưa đẩy lên được.\n" +
      "    Cần deploy Apps Script cho sheet trước — xem docs/google-apps-script-don-thu-phi.gs\n",
  );
  process.exit(0);
}

async function goi(payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, ...payload }),
  });
  const json = await res.json().catch(() => null);
  if (!json || json.ok !== true) throw new Error(`Apps Script trả về lỗi: ${JSON.stringify(json)}`);
  return json;
}

if (lamLai) {
  await goi({ hanhDong: "dong_bo_lai", danhSach });
  console.log(`\n✅ Đã dựng lại sheet từ đầu với ${danhSach.length} đơn.\n`);
} else {
  let them = 0;
  let boQua = 0;
  for (const don of danhSach) {
    const kq = await goi({ hanhDong: "ghi_don", don });
    if (kq.boQua) boQua++;
    else them++;
  }
  console.log(`\n✅ Xong: thêm mới ${them} đơn, bỏ qua ${boQua} đơn đã có sẵn trong sheet.\n`);
}
