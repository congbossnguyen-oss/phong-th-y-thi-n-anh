/**
 * Bóc tách Chương 2 ("Chi tiết ý nghĩa từng cặp số trong các từ trường") của ebook
 * "Sim Nói Gì Về Bạn" từ bản OCR, ra JSON thô để đối chiếu bằng mắt trước khi làm sạch.
 *
 * Chỉ TÁCH, không sửa chữ — mọi việc làm sạch OCR làm ở bước sau và phải soát tay.
 */
import { readFileSync, writeFileSync } from "node:fs";

const NGUON = process.argv[2];
const RA = process.argv[3];

const dong = readFileSync(NGUON, "utf8").split(/\r?\n/);

// Chương 2 bắt đầu ở dòng có tiêu đề CHƯƠNG 2.
const batDau = dong.findIndex((d) => /^##\s*CHƯƠNG 2/i.test(d));
if (batDau < 0) throw new Error("Không tìm thấy CHƯƠNG 2");

const TEN_MUC = [
  ["tinhCach", /^##\s*T[íi]nh c[áa]ch/i],
  ["taiVan", /^##\s*T[àa]i v[ậa]n/i],
  ["suNghiep", /^##\s*S[ựu] nghi[ệe]p/i],
  ["nhanDuyen", /^##\s*Nh[âa]n duy[êe]n/i],
  ["sucKhoe", /^##\s*S[ứu]c kh[ỏo]e/i],
  ["hocTap", /^##\s*H[ọo]c t[ậa]p/i],
  ["camXuc", /^##\s*C[ảa]m x[úu]c/i],
  ["honNhan", /^##\s*H[ôo]n nh[âa]n/i],
];

function laTieuDeMuc(d) {
  for (const [ma, re] of TEN_MUC) if (re.test(d)) return ma;
  return null;
}

/** Dòng chỉ gồm đúng 2 chữ số (có thể kèm "## ") = mốc bắt đầu một cặp mới. */
function laMocCap(d) {
  const m = d.match(/^(?:##\s*)?([0-9]{2})\s*$/);
  return m ? m[1] : null;
}

const capList = [];
let hienTai = null;
let mucHienTai = null;

for (let i = batDau + 1; i < dong.length; i++) {
  const d = dong[i].trim();
  if (!d) continue;
  if (/^<!--/.test(d)) continue;

  const moc = laMocCap(d);
  if (moc) {
    hienTai = { cap: moc, dongBatDau: i + 1, muc: {} };
    capList.push(hienTai);
    mucHienTai = null;
    continue;
  }

  const ma = laTieuDeMuc(d);
  if (ma) {
    // Gặp lại "Tính cách" khi cặp hiện tại ĐÃ có Tính cách → đây là một cặp mới mà OCR
    // làm mất dòng số. Mở khối mới, để trống mã cặp cho người soát điền vào.
    if (ma === "tinhCach" && hienTai && hienTai.muc.tinhCach) {
      hienTai = { cap: null, dongBatDau: i + 1, muc: {}, ghiChu: "OCR mất dòng số cặp" };
      capList.push(hienTai);
    }
    mucHienTai = ma;
    if (hienTai && !hienTai.muc[ma]) hienTai.muc[ma] = [];
    continue;
  }

  if (hienTai && mucHienTai) hienTai.muc[mucHienTai].push(d);
}

for (const c of capList) {
  for (const k of Object.keys(c.muc)) c.muc[k] = c.muc[k].join(" ").replace(/\s+/g, " ").trim();
}

writeFileSync(RA, JSON.stringify(capList, null, 2), "utf8");

// Báo cáo độ phủ.
const TAT_CA_CAP = {
  "Thiên Y": ["13", "31", "68", "86", "94", "49", "72", "27"],
  "Diên Niên": ["19", "91", "87", "78", "43", "34", "26", "62"],
  "Sinh Khí": ["14", "41", "67", "76", "93", "39", "82", "28"],
  "Phục Vị": ["11", "22", "99", "88", "77", "66", "44", "33"],
  "Tuyệt Mệnh": ["12", "21", "69", "96", "84", "48", "73", "37"],
  "Ngũ Quỷ": ["18", "81", "97", "79", "36", "63", "42", "24"],
  "Lục Sát": ["16", "61", "74", "47", "38", "83", "92", "29"],
  "Họa Hại": ["17", "71", "89", "98", "64", "46", "32", "23"],
};

const coMat = new Set(capList.map((c) => c.cap).filter(Boolean));
console.log(`Bóc được ${capList.length} khối, trong đó ${coMat.size} khối có mã cặp rõ ràng.\n`);

let thieu = [];
for (const [tinh, ds] of Object.entries(TAT_CA_CAP)) {
  const mat = ds.filter((c) => coMat.has(c));
  const vang = ds.filter((c) => !coMat.has(c));
  console.log(`${tinh.padEnd(11)} ${mat.length}/8${vang.length ? "  THIẾU: " + vang.join(", ") : ""}`);
  thieu.push(...vang);
}

console.log("\n--- Khối không rõ mã cặp (OCR mất dòng số) ---");
for (const c of capList.filter((x) => !x.cap)) {
  console.log(`  dòng ${c.dongBatDau}: ${(c.muc.tinhCach ?? "").slice(0, 90)}…`);
}

console.log("\n--- Khối thiếu mục ---");
for (const c of capList) {
  const thieuMuc = TEN_MUC.map(([m]) => m).filter((m) => !c.muc[m]);
  if (thieuMuc.length) console.log(`  ${c.cap ?? "(?)"} thiếu: ${thieuMuc.join(", ")}`);
}
