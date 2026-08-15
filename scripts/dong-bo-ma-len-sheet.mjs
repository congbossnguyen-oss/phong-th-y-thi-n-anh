/**
 * Đồng bộ toàn bộ mã khuyến mãi từ CSDL lên Google Sheet "Mã khuyến mãi - Phong Thủy Thiên Anh".
 *
 *   node scripts/dong-bo-ma-len-sheet.mjs
 *
 * CSDL là nguồn sự thật; Sheet chỉ là bản soi để anh Công xem và ghi chú đã tặng cho ai.
 * Cột "Tặng cho ai" trong Sheet do anh gõ tay và KHÔNG bị đồng bộ ghi đè (Apps Script giữ lại
 * theo từng mã — xem docs/google-apps-script-promo-sheet.gs).
 *
 * Nếu chưa cấu hình webhook (chưa deploy Apps Script), script sẽ xuất ra file CSV để anh mở
 * Sheet rồi File → Import, dùng tạm trong lúc chờ.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
const docEnv = (key) => envText.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim() || "";

const databaseUrl = docEnv("DATABASE_URL");
if (!databaseUrl) throw new Error("Thiếu DATABASE_URL trong .env");

const NGAY_VN = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "";

function moTaUuDai(row) {
  if (row.discount_type === "mien_phi") return "Miễn phí hoàn toàn";
  if (row.discount_type === "phan_tram") return `Giảm ${Number(row.discount_value)}%`;
  return `Giảm ${Number(row.discount_value).toLocaleString("vi-VN")}đ`;
}

function trangThai(row) {
  if (!row.is_active) return "Đã ngừng";
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return "Hết hạn";
  if (row.max_uses !== null && row.used_count >= row.max_uses) return "Đã dùng hết";
  return "Còn dùng được";
}

export async function dongBoLenSheet() {
  const sql = neon(databaseUrl);
  const rows = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC, code ASC`;

  const danhSach = rows.map((r) => ({
    ma: r.code,
    uuDai: moTaUuDai(r),
    congCu: r.tool_slug || "",
    soLuot: r.max_uses === null ? "Không giới hạn" : String(r.max_uses),
    daDung: String(r.used_count),
    conLai: r.max_uses === null ? "Không giới hạn" : String(r.max_uses - r.used_count),
    hanDung: NGAY_VN(r.expires_at),
    trangThai: trangThai(r),
    ngayTao: NGAY_VN(r.created_at),
    ghiChu: r.note || "",
  }));

  const url = docEnv("GOOGLE_SHEETS_PROMO_WEBHOOK_URL");
  const secret = docEnv("GOOGLE_SHEETS_PROMO_WEBHOOK_SECRET");

  if (!url || !secret) {
    // Chưa deploy Apps Script — xuất CSV để import tay.
    const cot = [
      "Mã", "Ưu đãi", "Công cụ áp dụng", "Số lượt", "Đã dùng", "Còn lại",
      "Hạn dùng", "Trạng thái", "Ngày tạo", "Ghi chú hệ thống", "Tặng cho ai",
    ];
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [
      cot.map(escape).join(","),
      ...danhSach.map((m) =>
        [m.ma, m.uuDai, m.congCu || "Mọi công cụ", m.soLuot, m.daDung, m.conLai,
         m.hanDung || "Không hạn", m.trangThai, m.ngayTao, m.ghiChu, ""].map(escape).join(","),
      ),
    ].join("\n");
    // BOM để Google Sheet/Excel đọc đúng tiếng Việt có dấu.
    const duongDan = fileURLToPath(new URL("../ma-khuyen-mai.csv", import.meta.url));
    writeFileSync(duongDan, "﻿" + csv, "utf8");
    console.log(
      `\n⚠️  Chưa cấu hình GOOGLE_SHEETS_PROMO_WEBHOOK_URL/SECRET trong .env.\n` +
        `    Đã xuất ${danhSach.length} mã ra file: ${duongDan}\n` +
        `    Mở Google Sheet → File → Import → Upload file này (chọn "Replace current sheet").\n`,
    );
    return { soMa: danhSach.length, quaSheet: false };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, hanhDong: "dong_bo_ma", danhSach }),
  });
  const json = await res.json().catch(() => null);
  if (!json || json.ok !== true) {
    throw new Error(`Apps Script trả về lỗi: ${JSON.stringify(json)}`);
  }
  console.log(`\n✅ Đã đồng bộ ${json.soDong} mã lên Google Sheet.\n`);
  return { soMa: danhSach.length, quaSheet: true };
}

// Chạy trực tiếp (không phải được import từ script khác).
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  await dongBoLenSheet();
}
