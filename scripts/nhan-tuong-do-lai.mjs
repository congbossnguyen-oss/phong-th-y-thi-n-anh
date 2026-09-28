/**
 * Bộ đo cho Phase 1D-3 — validate feature trên MÁY THẬT.
 *
 * Không chụp, không gọi camera, không đụng API. Chỉ đọc các payload đã thu, rồi tính
 * đúng những con số mà tiêu chí `measured` cần: độ phân tán giữa các lần chụp của
 * CÙNG một người, và giữa các người khác nhau.
 *
 * ── Cách dùng ──
 *  1. Quét trên điện thoại thật như bình thường (xem docs/…REAL_DEVICE_VALIDATION.md).
 *  2. Xong mỗi lượt, lấy payload về (thay <ID> bằng mã phiên hiện trên máy tính):
 *
 *       curl -s "http://localhost:4321/api/nhan-tuong/session?id=<ID>" \
 *         > mau/<người>__<điều-kiện>.json
 *
 *     Tên tệp QUYẾT ĐỊNH cách gom nhóm: `<người>__<điều-kiện>.json`
 *     Ví dụ:  A__trong-nha.json   A__sang.json   A__hoi-toi.json   B__trong-nha.json
 *
 *  3. node scripts/nhan-tuong-do-lai.mjs mau/
 *
 * Không ghi gì vào repo, không gửi gì đi đâu.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

/**
 * Ngưỡng của tiêu chí `measured`, xem docs/PHYSIOGNOMY_FEATURE_REAL_DEVICE_VALIDATION.md §5.
 * Đây là NGƯỠNG ĐÁNH GIÁ, không phải ngưỡng đo — đổi nó là đổi kết luận, nên để lộ ra đây.
 */
const NGUONG = {
  /** Lệch tối đa cho phép giữa các lần chụp của cùng một người, tính theo %. */
  trongNguoiPct: 5,
  /** Số người tối thiểu. Dưới mức này thì không đủ để nói gì về người khác. */
  soNguoiToiThieu: 5,
  /** Số lần chụp tối thiểu cho mỗi người. */
  soLanMoiNguoiToiThieu: 3,
  /** Với feature đơn vị độ (tư thế): lệch tối đa tính bằng ĐỘ, không phải %. */
  trongNguoiDo: 2.0,
};

function doc(thuMuc) {
  const mau = [];
  for (const ten of readdirSync(thuMuc)) {
    if (!ten.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(thuMuc, ten), "utf-8"));
    // Chấp nhận cả bản ghi phiên đầy đủ lẫn payload trần.
    const payload = raw?.result?.featureProfile ?? raw?.featureProfile ?? raw;
    if (payload?.transportVersion !== "physiognomy-session-feature-v1") {
      console.warn(`bỏ qua ${ten}: không phải payload v1`);
      continue;
    }
    const [nguoi, dieuKien] = basename(ten, ".json").split("__");
    if (!nguoi || !dieuKien) {
      console.warn(`bỏ qua ${ten}: tên phải dạng <người>__<điều-kiện>.json`);
      continue;
    }
    mau.push({ nguoi, dieuKien, payload });
  }
  return mau;
}

const tb = (a) => a.reduce((x, y) => x + y, 0) / a.length;

function phanTan(vals, donVi) {
  const v = vals.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (v.length < 2) return null;
  const m = tb(v);
  const bienDo = Math.max(...v) - Math.min(...v);
  return {
    n: v.length,
    tb: +m.toFixed(4),
    min: +Math.min(...v).toFixed(4),
    max: +Math.max(...v).toFixed(4),
    bienDo: +bienDo.toFixed(4),
    // Với đơn vị độ, phần trăm vô nghĩa (mẫu số quanh 0) — dùng biên độ tuyệt đối.
    pct: donVi === "degrees" ? null : Math.abs(m) > 1e-9 ? +((bienDo / Math.abs(m)) * 100).toFixed(2) : null,
  };
}

function main() {
  const thuMuc = process.argv[2];
  if (!thuMuc) {
    console.error("Dùng: node scripts/nhan-tuong-do-lai.mjs <thư-mục-chứa-json>");
    process.exit(1);
  }
  const mau = doc(thuMuc);
  if (mau.length === 0) {
    console.error("Không đọc được mẫu nào.");
    process.exit(1);
  }

  const nguoiList = [...new Set(mau.map((m) => m.nguoi))].sort();
  console.log(`Đọc ${mau.length} lượt quét · ${nguoiList.length} người: ${nguoiList.join(", ")}\n`);

  const donVi = new Map();
  const khoa = new Set();
  for (const m of mau) {
    for (const f of m.payload.features) {
      khoa.add(f.k);
      donVi.set(f.k, f.u);
    }
  }

  const ketLuan = [];
  console.log("KHOÁ".padEnd(36) + "TRONG-NGƯỜI (xấu nhất)".padEnd(30) + "GIỮA-NGƯỜI");
  console.log("─".repeat(96));

  for (const k of [...khoa].sort()) {
    const u = donVi.get(k);
    // Trong-người: mỗi người một nhóm, lấy trường hợp XẤU NHẤT.
    let xauNhat = null;
    for (const ng of nguoiList) {
      const v = mau.filter((m) => m.nguoi === ng)
        .map((m) => m.payload.features.find((f) => f.k === k)?.v)
        .filter((x) => x != null);
      const s = phanTan(v, u);
      if (!s) continue;
      const diem = u === "degrees" ? s.bienDo : (s.pct ?? Infinity);
      if (xauNhat === null || diem > xauNhat.diem) xauNhat = { ng, s, diem };
    }
    // Giữa-người: lấy trung bình của mỗi người rồi so với nhau.
    const tbMoiNguoi = nguoiList.map((ng) => {
      const v = mau.filter((m) => m.nguoi === ng)
        .map((m) => m.payload.features.find((f) => f.k === k)?.v)
        .filter((x) => x != null);
      return v.length ? tb(v) : null;
    }).filter((x) => x != null);
    const giua = phanTan(tbMoiNguoi, u);

    const tOut = xauNhat
      ? (u === "degrees" ? `${xauNhat.s.bienDo}°` : `${xauNhat.s.pct}%`) + ` (${xauNhat.ng}, n=${xauNhat.s.n})`
      : "—";
    const gOut = giua ? (u === "degrees" ? `${giua.bienDo}°` : `${giua.pct}%`) + ` (n=${giua.n})` : "—";
    console.log(k.padEnd(36) + tOut.padEnd(30) + gOut);

    ketLuan.push({ k, u, xauNhat, giua });
  }

  // ── Đối chiếu tiêu chí
  console.log("\n" + "─".repeat(96));
  const duNguoi = nguoiList.length >= NGUONG.soNguoiToiThieu;
  const duLan = nguoiList.every(
    (ng) => mau.filter((m) => m.nguoi === ng).length >= NGUONG.soLanMoiNguoiToiThieu,
  );
  console.log(`Đủ người (>= ${NGUONG.soNguoiToiThieu}): ${duNguoi ? "CÓ" : `KHÔNG (${nguoiList.length})`}`);
  console.log(`Đủ lần chụp mỗi người (>= ${NGUONG.soLanMoiNguoiToiThieu}): ${duLan ? "CÓ" : "KHÔNG"}`);

  if (!duNguoi || !duLan) {
    console.log("\n=> MẪU CHƯA ĐỦ. Không kết luận feature nào được nâng lên `measured`.");
    console.log("   Đây là kết quả hợp lệ, không phải thất bại — thiếu mẫu thì nói thiếu mẫu.");
    return;
  }

  console.log("\nỨNG VIÊN đủ điều kiện nâng lên `measured` (chỉ xét ổn định trong-người):");
  let co = 0;
  for (const r of ketLuan) {
    if (!r.xauNhat) continue;
    const dat = r.u === "degrees"
      ? r.xauNhat.s.bienDo <= NGUONG.trongNguoiDo
      : (r.xauNhat.s.pct ?? Infinity) <= NGUONG.trongNguoiPct;
    if (!dat) continue;
    // Feature không phân biệt được người thì đo cũng vô dụng: giữa-người phải LỚN HƠN trong-người.
    const phanBiet = r.giua && r.xauNhat &&
      (r.u === "degrees" ? r.giua.bienDo : (r.giua.pct ?? 0)) >
      (r.u === "degrees" ? r.xauNhat.s.bienDo : (r.xauNhat.s.pct ?? 0));
    console.log(`  ${r.k.padEnd(36)} ${phanBiet ? "ỔN" : "ổn định nhưng KHÔNG phân biệt được người"}`);
    co++;
  }
  if (co === 0) console.log("  (không có)");
  console.log("\nLưu ý: đây MỚI là điều kiện #3 và #4. Còn #1/#2/#5/#6/#7 phải xét bằng tay,");
  console.log("xem docs/PHYSIOGNOMY_FEATURE_REAL_DEVICE_VALIDATION.md §5.");
}

main();
