/**
 * Tạo (hoặc đặt lại mật khẩu) một tài khoản để TEST NỘI BỘ khu học viên.
 *
 *   node scripts/tao-tai-khoan-test.mjs --email a@b.vn --matkhau 123456 --ten "Tên hiển thị"
 *   node scripts/tao-tai-khoan-test.mjs ... --admin        → bật quyền quản trị
 *   node scripts/tao-tai-khoan-test.mjs ... --xoa          → xoá hẳn tài khoản này
 *
 * Đăng nhập của web tra theo EMAIL (ô nhập là type="email" nên không gõ được tên trống trơn),
 * vì vậy tài khoản test cũng phải mang dạng email.
 *
 * Băm mật khẩu bằng đúng thuật toán của `src/lib/auth/password.ts` (scrypt, salt:hash) — chép lại
 * ở đây thay vì import vì file kia là TypeScript, script .mjs chạy bằng node trần không đọc được.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = envText.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!databaseUrl) throw new Error("Thiếu DATABASE_URL trong .env");
const sql = neon(databaseUrl);

function doc(ten, macDinh) {
  const i = process.argv.indexOf(`--${ten}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : macDinh;
}
const co = (ten) => process.argv.includes(`--${ten}`);

const email = doc("email", "").trim().toLowerCase();
const matKhau = doc("matkhau", "");
const ten = doc("ten", "Tài khoản test");
if (!email) throw new Error("Thiếu --email");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

if (co("xoa")) {
  const xoa = await sql`DELETE FROM users WHERE email = ${email} RETURNING id`;
  console.log(xoa.length ? `Đã xoá tài khoản ${email}` : `Không có tài khoản ${email}`);
  process.exit(0);
}

if (!matKhau) throw new Error("Thiếu --matkhau");
const hash = hashPassword(matKhau);
const isAdmin = co("admin");

// Đã có email này thì đặt lại mật khẩu chứ không báo lỗi trùng — script để dùng đi dùng lại.
const rows = await sql`
  INSERT INTO users (email, password_hash, name, is_admin)
  VALUES (${email}, ${hash}, ${ten}, ${isAdmin})
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        is_admin = EXCLUDED.is_admin
  RETURNING id, email, name, is_admin, created_at
`;

console.log("Tài khoản sẵn sàng:", rows[0]);
