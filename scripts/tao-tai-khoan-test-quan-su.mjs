/**
 * Tạo tài khoản TEST cho app Quân Sư (anh Công 31/8/2026: "10 tài khoản test... cho mọi người
 * test được, mỗi tài khoản chỉ được luận giải 10 lần kinh dịch thôi").
 *
 * KHÔNG hỏi ngày/tháng/năm sinh ở đây — để trống (NULL), người test tự điền sau khi đăng nhập tại
 * /hoc-vien/ho-so (anh Công 31/8/2026: "ngày sinh cho họ tự điền sau được không nhỉ"). Thiếu ngày
 * sinh thì mọi tính năng KHÁC vẫn dùng bình thường, chỉ riêng lớp "vận trình" (Xem Thời Vận, phần
 * vận trình trong luận giải) sẽ tạm bỏ qua tới khi họ tự bổ sung.
 *
 * Sau khi chạy: PHẢI copy email 10 tài khoản vào mảng TAI_KHOAN_TEST_QUAN_SU trong
 * src/lib/quan-su/test-accounts.ts thì các tài khoản này mới qua được cổng khóa "chỉ admin" của
 * /quan-su/* — script này CHỈ tạo tài khoản trong DB, không tự sửa file đó.
 *
 * Sửa mảng TAI_KHOAN bên dưới rồi chạy:  node scripts/tao-tai-khoan-test-quan-su.mjs
 */
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ĐIỀN 10 (hoặc bao nhiêu tùy ý) tài khoản ở đây trước khi chạy. Để trống password = tự sinh ngẫu
// nhiên, in ra màn hình 1 lần duy nhất lúc chạy xong (không lưu lại plaintext ở đâu khác).
const TAI_KHOAN = [
  // { email: "test1@phongthuythienanh.com", name: "Test 1" },
  // { email: "test2@phongthuythienanh.com", name: "Test 2" },
];

function getDatabaseUrl() {
  const env = readFileSync(join(ROOT, ".env"), "utf8");
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error("Không tìm thấy DATABASE_URL trong .env");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

// Y HỆT src/lib/auth/password.ts (không import chéo ESM/TS được từ script .mjs độc lập).
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function randomPassword() {
  return randomBytes(9).toString("base64url"); // 12 ký tự, đủ mạnh, dễ copy/paste
}

async function main() {
  if (TAI_KHOAN.length === 0) {
    console.error("Chưa điền tài khoản nào vào mảng TAI_KHOAN ở đầu file — sửa rồi chạy lại.");
    process.exit(1);
  }

  const sql = neon(getDatabaseUrl());
  const ketQua = [];

  for (const { email, name, password } of TAI_KHOAN) {
    const emailChuan = email.trim().toLowerCase();
    const [existing] = await sql.query("SELECT id FROM users WHERE email = $1", [emailChuan]);
    if (existing) {
      console.warn(`⚠️  Bỏ qua ${emailChuan} — email đã tồn tại.`);
      continue;
    }
    const matKhau = password || randomPassword();
    const hash = hashPassword(matKhau);
    await sql.query(
      `INSERT INTO users (email, password_hash, name, is_admin)
       VALUES ($1, $2, $3, false)`,
      [emailChuan, hash, name || emailChuan],
    );
    ketQua.push({ email: emailChuan, password: matKhau });
  }

  console.log("\nĐã tạo xong. LƯU LẠI NGAY — mật khẩu KHÔNG hiện lại được nữa:\n");
  for (const { email, password } of ketQua) {
    console.log(`  ${email}  /  ${password}`);
  }
  console.log(`\n⚠️ Nhớ thêm ${ketQua.length} email trên vào TAI_KHOAN_TEST_QUAN_SU trong`);
  console.log("   src/lib/quan-su/test-accounts.ts để họ vào được /quan-su/*.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
