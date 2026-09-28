/**
 * BÁO CÁO KIỂM CHỨNG FEATURE — phân tích phương sai trên mẫu người thật.
 *
 * Khác `nhan-tuong-do-lai.mjs` (chỉ xem độ phân tán): script này tách PHƯƠNG SAI theo
 * từng nguồn gây biến thiên, vì một con số phần trăm không đủ để kết luận.
 *
 *   withinPerson   — cùng người, nhiều lượt. Đây là NHIỄU.
 *   betweenPerson  — giữa các người. Đây là TÍN HIỆU.
 *   device         — do máy khác nhau gây ra.
 *   distance       — do cự ly chụp (suy từ face_width, vốn là tỉ lệ so với khung hình).
 *   pose           — do tư thế đầu.
 *   lighting        — do độ sáng.
 *
 * Điều quan trọng nhất script này nói ra: một feature ỔN ĐỊNH nhưng
 * betweenPerson ≈ 0 thì **đo cũng vô dụng** — nó không phân biệt được ai với ai.
 * Cảnh báo `STABLE_BUT_NON_DISCRIMINATIVE`.
 *
 * ── Cách dùng ──
 *   node scripts/nhan-tuong-validate-features.mjs mau/
 * với `mau/` chứa các tệp `<người>__<điều-kiện>.json` xuất từ bảng thu dữ liệu.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

/** Ngưỡng đánh giá — đổi là đổi kết luận, nên để lộ ra đây. */
const NGUONG = {
  /** Nhiễu trong-người tối đa, theo %. */
  nhieuToiDaPct: 5,
  /** Với đơn vị độ: nhiễu tối đa tính bằng độ. */
  nhieuToiDaDo: 2.0,
  /** Tín hiệu phải lớn hơn nhiễu ít nhất bấy nhiêu lần mới gọi là phân biệt được. */
  tiLeTinHieuTrenNhieu: 2.0,
  soNguoiToiThieu: 5,
  soLuotMoiNguoiToiThieu: 3,
  soMayToiThieu: 2,
};

function doc(thuMuc) {
  const mau = [];
  for (const ten of readdirSync(thuMuc)) {
    if (!ten.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(thuMuc, ten), "utf-8"));
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
    mau.push({
      nguoi,
      dieuKien,
      // ĐỌC `raw.device` — máy TỰ KHAI. Không dùng `sample.deviceLabel`: nhãn đó do
      // người vận hành gõ trên MÁY TÍNH, còn máy quét là ĐIỆN THOẠI, nên nó có thể ghi
      // "iPhone-15" trong lúc người test cầm Android. Tệp cũ chưa có `device` thì ghi
      // thẳng là chưa khai, KHÔNG lặng lẽ tụt về nhãn gõ tay — đếm sai mà trông như
      // đếm đúng còn tệ hơn đếm thiếu.
      // ponytail: khoá ghép tay ở đây, trùng logic `deviceKeyOf` trong
      // src/features/physiognomy/research/dataset.ts. Script chạy bằng node trần nên
      // không import được module .ts; hợp nhất khi script được chuyển sang vite-node.
      may: raw?.device
        ? `${raw.device.os}|${raw.device.browser}|${raw.device.model === "device_model_unavailable" ? "" : raw.device.model}`
        : "device_chua_khai",
      payload,
    });
  }
  return mau;
}

const tb = (a) => a.reduce((x, y) => x + y, 0) / a.length;
/** Phương sai mẫu (chia n−1). Trả 0 khi chỉ có một điểm. */
const phuongSai = (a) => {
  if (a.length < 2) return 0;
  const m = tb(a);
  return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1);
};

/** Gom theo một khoá rồi trả về mảng các nhóm giá trị. */
function nhom(mau, key, lay) {
  const m = new Map();
  for (const s of mau) {
    const v = s.payload.features.find((f) => f.k === key)?.v;
    if (typeof v !== "number") continue;
    const g = lay(s);
    if (!m.has(g)) m.set(g, []);
    m.get(g).push(v);
  }
  return [...m.values()];
}

/**
 * Phương sai TRONG nhóm (gộp) và GIỮA nhóm.
 * Đây là phân tích phương sai một chiều, rút gọn — đủ để biết tín hiệu có vượt nhiễu.
 */
function tachPhuongSai(nhomGiaTri) {
  const coDu = nhomGiaTri.filter((g) => g.length > 0);
  if (coDu.length < 2) return { trong: null, giua: null };
  const trong = tb(coDu.filter((g) => g.length >= 2).map(phuongSai)) || 0;
  const giua = phuongSai(coDu.map(tb));
  return { trong, giua };
}

const sd = (v) => (v === null ? null : Math.sqrt(v));

function main() {
  const thuMuc = process.argv[2];
  if (!thuMuc) {
    console.error("Dùng: node scripts/nhan-tuong-validate-features.mjs <thư-mục>");
    process.exit(1);
  }
  const mau = doc(thuMuc);
  if (mau.length === 0) {
    console.error("Không đọc được mẫu nào.");
    process.exit(1);
  }

  const nguoiList = [...new Set(mau.map((m) => m.nguoi))].sort();
  const mayList = [...new Set(mau.map((m) => m.may))].sort();
  console.log(
    `${mau.length} lượt · ${nguoiList.length} người (${nguoiList.join(",")}) · ` +
      `${mayList.length} máy (${mayList.join(",")})\n`,
  );

  const khoa = [...new Set(mau.flatMap((m) => m.payload.features.map((f) => f.k)))].sort();
  const donVi = new Map(mau[0].payload.features.map((f) => [f.k, f.u]));

  const canhBao = [];
  console.log(
    "KHOÁ".padEnd(34) +
      "sd trong-người".padStart(15) +
      "sd giữa-người".padStart(15) +
      "tín/nhiễu".padStart(11) +
      "  đánh giá",
  );
  console.log("─".repeat(104));

  for (const k of khoa) {
    const u = donVi.get(k);
    const nguoiNhom = nhom(mau, k, (s) => s.nguoi);
    const { trong, giua } = tachPhuongSai(nguoiNhom);
    const sdTrong = sd(trong);
    const sdGiua = sd(giua);
    const tyLe = sdTrong !== null && sdTrong > 1e-12 && sdGiua !== null ? sdGiua / sdTrong : null;

    let danhGia;
    if (sdTrong === null || sdGiua === null) {
      danhGia = "KHÔNG ĐỦ NHÓM";
    } else if (sdGiua <= 1e-9) {
      danhGia = "STABLE_BUT_NON_DISCRIMINATIVE";
      canhBao.push(k);
    } else if (tyLe !== null && tyLe < NGUONG.tiLeTinHieuTrenNhieu) {
      danhGia = "TÍN HIỆU KHÔNG VƯỢT NHIỄU";
      canhBao.push(k);
    } else {
      danhGia = "ứng viên";
    }

    const f = (v) => (v === null ? "—" : v.toExponential(2));
    console.log(
      k.padEnd(34) +
        f(sdTrong).padStart(15) +
        f(sdGiua).padStart(15) +
        (tyLe === null ? "—" : tyLe.toFixed(2)).padStart(11) +
        "  " +
        danhGia +
        (u === "degrees" ? "  (độ)" : ""),
    );
  }

  // ── các nguồn biến thiên khác
  console.log("\n" + "─".repeat(104));
  console.log("PHƯƠNG SAI THEO TỪNG NGUỒN (sd giữa nhóm):\n");
  const nguonBien = [
    ["máy", (s) => s.may],
    ["điều kiện/cự ly", (s) => s.dieuKien],
  ];
  console.log("KHOÁ".padEnd(34) + nguonBien.map(([t]) => t.padStart(18)).join(""));
  for (const k of khoa) {
    const cot = nguonBien.map(([, lay]) => {
      const { giua } = tachPhuongSai(nhom(mau, k, lay));
      return (giua === null ? "—" : Math.sqrt(giua).toExponential(2)).padStart(18);
    });
    console.log(k.padEnd(34) + cot.join(""));
  }

  // ── đủ mẫu chưa
  console.log("\n" + "─".repeat(104));
  const duNguoi = nguoiList.length >= NGUONG.soNguoiToiThieu;
  const duMay = mayList.length >= NGUONG.soMayToiThieu;
  const duLuot = nguoiList.every(
    (n) => mau.filter((m) => m.nguoi === n).length >= NGUONG.soLuotMoiNguoiToiThieu,
  );
  console.log(`Đủ người (>= ${NGUONG.soNguoiToiThieu}):        ${duNguoi ? "CÓ" : `KHÔNG (${nguoiList.length})`}`);
  console.log(`Đủ máy (>= ${NGUONG.soMayToiThieu}):           ${duMay ? "CÓ" : `KHÔNG (${mayList.length})`}`);
  console.log(`Đủ lượt mỗi người (>= ${NGUONG.soLuotMoiNguoiToiThieu}): ${duLuot ? "CÓ" : "KHÔNG"}`);

  if (canhBao.length > 0) {
    console.log(`\n⚠ ${canhBao.length}/${khoa.length} feature KHÔNG phân biệt được người.`);
    console.log("  Ổn định mà không phân biệt được thì đo cũng vô dụng — xem cột đánh giá.");
  }

  if (!duNguoi || !duMay || !duLuot) {
    console.log("\n=> MẪU CHƯA ĐỦ. Không feature nào được nâng lên `validated`.");
    console.log("   Thiếu mẫu thì nói thiếu mẫu, không suy diễn.");
    return;
  }
  console.log("\n=> Đủ mẫu. Feature ở cột 'ứng viên' mới được xét nâng `validated`,");
  console.log("   và vẫn phải có nguồn cổ thư đã xác minh mới tới được tầng luận giải.");
}

main();
