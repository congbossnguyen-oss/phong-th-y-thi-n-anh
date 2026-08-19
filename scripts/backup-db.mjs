/**
 * Backup TOÀN BỘ database (Neon Postgres) ra 1 file JSON có timestamp.
 *
 * Chạy:  node scripts/backup-db.mjs
 * Kết quả: backups/db-YYYY-MM-DDTHH-MM-SS.json  (thư mục backups/ đã được .gitignore)
 *
 * ⚠️ File backup chứa DỮ LIỆU KHÁCH + hash mật khẩu + token phiên → coi như tài liệu MẬT:
 *    cất vào nơi an toàn (Google Drive có 2FA / ổ mã hoá), KHÔNG commit lên git, KHÔNG gửi qua chat.
 *
 * Không cần cài Postgres/pg_dump — dùng driver @neondatabase/serverless đã có sẵn trong dự án.
 * Đây là backup DỮ LIỆU (mọi dòng của mọi bảng). Cấu trúc bảng (schema) nằm trong db/schema.ts +
 * thư mục migrations, nên kết hợp 2 thứ là khôi phục lại được toàn bộ.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Thứ tự để tiện đọc; khi khôi phục phải nạp theo thứ tự phụ thuộc khoá ngoại (users trước, rồi orders…).
const TABLES = [
  "users",
  "sessions",
  "consultation_requests",
  "orders",
  "order_items",
  "course_enrollments",
  "course_certificates",
  "lesson_progress",
  "promo_codes",
  "promo_redemptions",
  "sepay_webhook_logs",
];

function getDatabaseUrl() {
  const env = readFileSync(join(ROOT, ".env"), "utf8");
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error("Không tìm thấy DATABASE_URL trong .env");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const sql = neon(getDatabaseUrl());

const dump = { exportedAt: new Date().toISOString(), tables: {} };
let total = 0;

console.log("Đang backup database…");
for (const table of TABLES) {
  // Tên bảng là HẰNG SỐ nội bộ (không phải input người dùng) nên nội suy vào SQL an toàn.
  const rows = await sql.query(`SELECT * FROM ${table}`);
  dump.tables[table] = rows;
  total += rows.length;
  console.log(`  ${table.padEnd(24)} ${rows.length} dòng`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = join(ROOT, "backups");
mkdirSync(dir, { recursive: true });
const out = join(dir, `db-${stamp}.json`);
writeFileSync(out, JSON.stringify(dump, null, 2), "utf8");

console.log(`\n✅ Đã backup ${total} dòng / ${TABLES.length} bảng`);
console.log(`   → ${out}`);
console.log("   Nhớ cất file này ra nơi an toàn (Drive có 2FA / ổ mã hoá).");
