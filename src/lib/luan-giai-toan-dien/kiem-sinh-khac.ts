// TẦNG 3 — BƯỚC KIỂM CHIỀU NGŨ HÀNH SINH-KHẮC (code thuần, không AI).
//
// Lý do tồn tại (anh Công yêu cầu 1/9/2026): Tầng 1 (engine) LUÔN tính đúng Dụng/Hỷ/Kỵ Thần, nhưng
// Tầng 2 (AI viết văn) đôi khi giải thích SAI CHIỀU sinh-khắc — lỗi thật đã gặp ở Giai đoạn A: viết
// "Hỏa hao tổn Thủy" (sai — thực tế Thủy khắc Hỏa, Hỏa không đụng được Thủy; Hỏa là Kỵ vì Hỏa khắc
// Kim = Dụng Thần). Đây là lỗi kiến thức nền của model, không phải lỗi dữ liệu, nên PHẢI có 1 lớp
// code chặn hệ thống áp cho CẢ 12 giai đoạn, không riêng Giai đoạn A.
//
// Nguồn chân lý DUY NHẤT: SINH_MAP / KHAC_MAP export từ bat-tu-engine (đọc từ data/*.json qua engine)
// — KHÔNG hard-code lại vòng sinh-khắc ở đây để tránh 2 nơi lệch nhau.
//   Vòng tương sinh: Kim→Thủy→Mộc→Hỏa→Thổ→Kim (SINH_MAP[X] = hành mà X sinh ra).
//   Vòng tương khắc: Kim→Mộc→Thổ→Thủy→Hỏa→Kim (KHAC_MAP[X] = hành mà X khắc).
//
// TRIẾT LÝ PHÁT HIỆN: thà BỎ SÓT còn hơn CHẶN NHẦM. Khi phát hiện lỗi, luồng hậu kiểm chỉ VIẾT LẠI
// (rewrite) 1 lần rồi vẫn cho qua nếu còn — KHÔNG chặn cả báo cáo (xem hau-kiem.ts). Nên kể cả 1
// false-positive hiếm cũng chỉ tốn thêm 1 lượt AI, KHÔNG bao giờ làm khách trả tiền mà mất báo cáo.
import { SINH_MAP, KHAC_MAP, hanhSinhCho, hanhKhacX, type Hanh } from "../bat-tu-engine/engine";

const HANH_ALT = "Kim|Mộc|Thủy|Hỏa|Thổ";
const RE_HANH = new RegExp(HANH_ALT, "g");

// 3 nhóm động từ quan hệ Ngũ Hành cần kiểm. CỐ Ý bỏ "tiết" (dễ đụng "tiết chế" = điều tiết, KHÔNG
// phải 泄 tiết khí), bỏ "hao" trần (đụng "tiêu hao"/"hao hụt"). Chỉ giữ các cụm rõ nghĩa quan hệ.
const DONG_TU: { loai: "sinh" | "khac" | "hai"; alt: string }[] = [
  { loai: "sinh", alt: "sinh" },
  { loai: "khac", alt: "khắc|chế ngự" },
  { loai: "hai", alt: "hao tổn|hao mòn|bào mòn|tổn hại|suy yếu|hại" },
];

// Sau chữ "sinh" mà là các âm tiết này thì đó là TỪ GHÉP (sinh trợ/sinh dưỡng...) mang nghĩa "được
// nuôi", KHÔNG phải khẳng định "X sinh Y" có chiều — bỏ qua để tránh chặn nhầm.
const SINH_TU_GHEP = ["trợ", "phù", "vượng", "dưỡng", "khí", "sôi", "ra", "thành", "tồn", "hóa", "hoá", "nở"];

// Khoảng cách tối đa (ký tự) giữa 2 hành để coi là 1 mệnh đề quan hệ — đủ dài để bắt câu phức thật
// ("Hỏa cần được tiết chế để tránh làm hao tổn ... Thủy" ~51 ký tự) nhưng không quá dài để vơ nhầm
// 2 hành ở 2 ý rời rạc trong cùng câu.
const KHOANG_CACH_TOI_DA = 60;
// Với "sinh", giới hạn khoảng cách TỪ động từ tới hành-đối-tượng chặt hơn — "Kim sinh Thủy" luôn sát
// nhau; nới rộng dễ vơ nhầm "sinh trợ ... (rồi mãi sau) ... Kim".
const SINH_KHOANG_CACH_PHAI_TOI_DA = 12;

export interface LoiSinhKhac {
  /** Cụm chữ đọc được quanh chỗ sai, để log/đưa vào chỉ dẫn viết lại. */
  cum: string;
  x: Hanh;
  y: Hanh;
  loai: "sinh" | "khac" | "hai";
  viTri: number;
  /** Câu mô tả ĐÚNG chiều để nhắc AI viết lại. */
  dungPhai: string;
}

function quanHeDung(x: Hanh, y: Hanh, loai: "sinh" | "khac" | "hai"): boolean {
  if (loai === "sinh") return SINH_MAP[x] === y;
  if (loai === "khac") return KHAC_MAP[x] === y;
  // "hại/hao tổn": X làm suy yếu Y là ĐÚNG nếu X khắc Y (khống chế), HOẶC Y sinh X (Y bị rút khí để
  // sinh ra X — 泄 tiết khí). Ngoài 2 chiều đó thì X không thể làm hao tổn Y.
  return KHAC_MAP[x] === y || SINH_MAP[y] === x;
}

function moTaDung(x: Hanh, y: Hanh, loai: "sinh" | "khac" | "hai"): string {
  if (loai === "sinh") return `Thực tế ${x} sinh ${SINH_MAP[x]} (không phải ${y}); hành sinh ra ${y} là ${hanhSinhCho(y)}.`;
  if (loai === "khac") return `Thực tế ${x} khắc ${KHAC_MAP[x]} (không phải ${y}); hành khắc ${y} là ${hanhKhacX(y)}.`;
  return `${x} không khắc ${y} và cũng không bị ${y} sinh, nên ${x} KHÔNG làm hao tổn ${y}. Hành thực sự chế/hao ${y} là ${hanhKhacX(y)} (khắc ${y}) hoặc ${SINH_MAP[y]} (do ${y} sinh ra, rút khí ${y}).`;
}

/** Tách văn bản thành các mệnh đề theo dấu ngắt câu (. ! ? ; xuống dòng) — kèm offset gốc. */
function tachMenhDe(vanBan: string): { text: string; base: number }[] {
  const kq: { text: string; base: number }[] = [];
  const re = /[^.!?;\n]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(vanBan)) !== null) kq.push({ text: m[0], base: m.index });
  return kq;
}

/**
 * Quét toàn văn tìm câu khẳng định quan hệ Ngũ Hành SAI CHIỀU. Trả về danh sách lỗi (rỗng = sạch).
 *
 * Cách làm: trong TỪNG mệnh đề (đã cắt theo dấu ngắt câu), với mỗi lần xuất hiện động từ quan hệ,
 * lấy hành gần nhất NGAY TRƯỚC (chủ thể X) và hành gần nhất NGAY SAU (đối tượng Y) động từ đó. Vì
 * lấy "gần nhất 2 phía" nên đảm bảo KHÔNG có hành thứ 3 chen giữa — đúng 1 quan hệ X–verb–Y. Sau đó
 * đối chiếu chiều với SINH_MAP/KHAC_MAP.
 */
export function quetSaiSinhKhac(vanBan: string): LoiSinhKhac[] {
  const loi: LoiSinhKhac[] = [];
  for (const { text: cau, base } of tachMenhDe(vanBan)) {
    // Vị trí mọi hành trong mệnh đề.
    RE_HANH.lastIndex = 0;
    const hanhPos: { hanh: Hanh; start: number; end: number }[] = [];
    let hm: RegExpExecArray | null;
    while ((hm = RE_HANH.exec(cau)) !== null) hanhPos.push({ hanh: hm[0] as Hanh, start: hm.index, end: hm.index + hm[0].length });
    if (hanhPos.length < 2) continue;

    for (const { loai, alt } of DONG_TU) {
      const reVerb = new RegExp(alt, "g");
      let vm: RegExpExecArray | null;
      while ((vm = reVerb.exec(cau)) !== null) {
        const vStart = vm.index;
        const vEnd = vm.index + vm[0].length;
        const truoc = [...hanhPos].reverse().find((h) => h.end <= vStart);
        const sau = hanhPos.find((h) => h.start >= vEnd);
        if (!truoc || !sau) continue;
        if (sau.start - truoc.end > KHOANG_CACH_TOI_DA) continue;

        if (loai === "sinh") {
          // Bỏ qua từ ghép "sinh trợ/dưỡng..." (không phải khẳng định có chiều).
          const sauSinh = cau.slice(vEnd).trimStart().split(/\s+/)[0] ?? "";
          if (SINH_TU_GHEP.includes(sauSinh)) continue;
          // "sinh" phải sát hành-đối-tượng (chủ ngữ có thể xa, vị ngữ thì gần).
          if (sau.start - vEnd > SINH_KHOANG_CACH_PHAI_TOI_DA) continue;
        }

        if (quanHeDung(truoc.hanh, sau.hanh, loai)) continue;

        const cumStart = Math.max(0, truoc.start);
        loi.push({
          cum: cau.slice(cumStart, sau.end).trim(),
          x: truoc.hanh,
          y: sau.hanh,
          loai,
          viTri: base + cumStart,
          dungPhai: moTaDung(truoc.hanh, sau.hanh, loai),
        });
      }
    }
  }
  return loi;
}

/** Gộp các lỗi thành 1 đoạn chỉ dẫn để nhắc AI viết lại đúng chiều (đưa vào user message lượt rewrite). */
export function chiDanSuaSinhKhac(loi: LoiSinhKhac[]): string {
  if (loi.length === 0) return "";
  const dong = loi.map((l, i) => `${i + 1}. Câu "${l.cum}" SAI chiều Ngũ Hành. ${l.dungPhai}`);
  return [
    "LƯU Ý SỬA LỖI (bản trước có câu SAI CHIỀU sinh-khắc Ngũ Hành — phải viết lại cho đúng):",
    ...dong,
    "Vòng chuẩn: Tương sinh Kim→Thủy→Mộc→Hỏa→Thổ→Kim; Tương khắc Kim→Mộc→Thổ→Thủy→Hỏa→Kim. Kiểm lại từng câu quan hệ Ngũ Hành trước khi trả về.",
  ].join("\n");
}
