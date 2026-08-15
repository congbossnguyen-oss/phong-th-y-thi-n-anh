/**
 * Sinh mã khuyến mãi cho các công cụ thu phí và ghi thẳng vào CSDL.
 *
 * Dùng khi Công cần thêm mã tặng khách:
 *   node scripts/tao-ma-khuyen-mai.mjs                      → 20 mã miễn phí, mỗi mã 1 lượt
 *   node scripts/tao-ma-khuyen-mai.mjs --so-luong 5         → 5 mã
 *   node scripts/tao-ma-khuyen-mai.mjs --giam 50            → giảm 50% thay vì miễn phí
 *   node scripts/tao-ma-khuyen-mai.mjs --so-luot 3          → mỗi mã dùng được 3 lượt
 *   node scripts/tao-ma-khuyen-mai.mjs --cong-cu gio-liem-ha-huyet   → chỉ dùng cho 1 công cụ
 *   node scripts/tao-ma-khuyen-mai.mjs --han 2026-12-31     → có hạn sử dụng
 *
 * Bảng chữ cái bỏ các ký tự dễ đọc nhầm khi đọc qua điện thoại: 0/O, 1/I/L, 5/S, 8/B.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = envText.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!databaseUrl) throw new Error("Thiếu DATABASE_URL trong .env");
const sql = neon(databaseUrl);

function doc(ten, macDinh) {
  const i = process.argv.indexOf(`--${ten}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : macDinh;
}

const soLuong = Number(doc("so-luong", "20"));
const giamPhanTram = doc("giam", null);
const soLuot = doc("so-luot", "1");
const congCu = doc("cong-cu", null);
const han = doc("han", null);

const BANG_CHU = "ACDEFGHJKMNPQRTUVWXYZ2346739";
function sinhMa() {
  let s = "";
  for (let i = 0; i < 8; i++) s += BANG_CHU[randomInt(BANG_CHU.length)];
  return `TA${s}`;
}

const loai = giamPhanTram ? "phan_tram" : "mien_phi";
const giaTri = giamPhanTram ? String(Number(giamPhanTram)) : null;
const maxUses = soLuot === "0" ? null : Number(soLuot);
const ghiChu = giamPhanTram ? `Giảm ${giamPhanTram}%` : "Tặng miễn phí 1 lượt";

const daTao = [];
for (let i = 0; i < soLuong; i++) {
  let ma;
  // Rất khó trùng, nhưng vẫn thử lại nếu đụng ràng buộc UNIQUE.
  for (let lan = 0; lan < 5; lan++) {
    ma = sinhMa();
    try {
      await sql`
        INSERT INTO promo_codes (code, discount_type, discount_value, tool_slug, max_uses, expires_at, note)
        VALUES (${ma}, ${loai}, ${giaTri}, ${congCu}, ${maxUses}, ${han ? new Date(han) : null}, ${ghiChu})
      `;
      daTao.push(ma);
      break;
    } catch (e) {
      if (lan === 4) throw e;
    }
  }
}

console.log(`\nĐã tạo ${daTao.length} mã (${ghiChu}${congCu ? `, chỉ cho công cụ ${congCu}` : ", dùng cho mọi công cụ"}${maxUses ? `, mỗi mã ${maxUses} lượt` : ", không giới hạn lượt"}${han ? `, hạn ${han}` : ""}):\n`);
daTao.forEach((m, i) => console.log(`  ${String(i + 1).padStart(2, " ")}. ${m}`));
console.log("");
