/**
 * Khôi phục database từ 1 file backup JSON (do backup-db.mjs tạo ra).
 *
 * Chạy:  node scripts/restore-db.mjs backups/db-XXXX.json --confirm
 *
 * ⚠️ AN TOÀN:
 *   - Nếu KHÔNG có cờ --confirm: chỉ IN THỬ (dry-run), không ghi gì.
 *   - Nạp theo thứ tự khoá ngoại; dùng `ON CONFLICT DO NOTHING` nên chạy lại nhiều lần không nhân đôi
 *     và KHÔNG ghi đè dòng đang có (an toàn khi rót vào DB đã có sẵn dữ liệu).
 *   - LẦN ĐẦU hãy thử trên 1 Neon BRANCH trống (Neon dashboard → Branches) chứ đừng chạy thẳng vào
 *     DB thật, để chắc chắn script khớp schema hiện tại.
 *
 * Đọc DATABASE_URL từ .env — muốn rót sang DB khác thì tạm sửa .env trỏ tới DB đó.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Thứ tự nạp: bảng "cha" (được tham chiếu) trước bảng "con" (tham chiếu tới nó).
const RESTORE_ORDER = [
  "users",
  "sessions",
  "promo_codes",
  "consultation_requests",
  "orders",
  "order_items",
  "course_enrollments",
  "course_certificates",
  "lesson_progress",
  "promo_redemptions",
  "sepay_webhook_logs",
];

const fileArg = process.argv[2];
const confirm = process.argv.includes("--confirm");
if (!fileArg) {
  console.error("Cách dùng: node scripts/restore-db.mjs <file-backup.json> [--confirm]");
  process.exit(1);
}

function getDatabaseUrl() {
  const env = readFileSync(join(ROOT, ".env"), "utf8");
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error("Không tìm thấy DATABASE_URL trong .env");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const dumpPath = isAbsolute(fileArg) ? fileArg : join(ROOT, fileArg);
const dump = JSON.parse(readFileSync(dumpPath, "utf8"));
const tables = dump.tables ?? {};

/** jsonb/mảng phải chuyển về chuỗi JSON khi INSERT; giá trị còn lại giữ nguyên. */
function toParam(v) {
  if (v !== null && typeof v === "object") return JSON.stringify(v);
  return v;
}

if (!confirm) {
  console.log(`DRY-RUN (chưa ghi gì). File: ${dumpPath}`);
  console.log(`Backup lúc: ${dump.exportedAt ?? "?"}\n`);
  for (const t of RESTORE_ORDER) console.log(`  ${t.padEnd(24)} ${tables[t]?.length ?? 0} dòng sẽ nạp`);
  console.log("\nThêm --confirm để thực sự khôi phục.");
  process.exit(0);
}

const sql = neon(getDatabaseUrl());
console.log(`Khôi phục từ ${dumpPath} …`);
let total = 0;
for (const table of RESTORE_ORDER) {
  const rows = tables[table] ?? [];
  let n = 0;
  for (const row of rows) {
    const cols = Object.keys(row);
    if (cols.length === 0) continue;
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const params = cols.map((c) => toParam(row[c]));
    await sql.query(`INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, params);
    n += 1;
  }
  total += n;
  console.log(`  ${table.padEnd(24)} ${n} dòng`);
}
console.log(`\n✅ Đã nạp ${total} dòng (bỏ qua dòng trùng khoá).`);
