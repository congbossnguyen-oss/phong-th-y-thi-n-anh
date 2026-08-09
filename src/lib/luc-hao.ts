// Hệ thống Lục Hào (Nạp Giáp - Kinh Phòng Bát Cung) đầy đủ: 64 quẻ, Bát Cung/Thế-Ứng, Nạp Giáp
// Can Chi từng hào, Lục Thân, Lục Thú, Phục Thần, Tuần Không — dùng chung cho cả 4 phương pháp lập
// quẻ (Mai Hoa, Lục Hào, Seri tiền, Số điện thoại), vì phần LUẬN GIẢI (Nạp Giáp/Lục Thân/Lục Thú)
// vốn không phụ thuộc vào cách lập quẻ, chỉ phụ thuộc vào 6 hào Âm/Dương cuối cùng.
//
// Công thức đã được đối chiếu và xác nhận khớp 100% với 2 ví dụ tham chiếu độc lập từ quekinhdich.com
// (Học Viện Phong Thủy Minh Việt): "Thủy Địa Tỷ" (Khôn cung, Quy Hồn) và "Địa Thiên Thái" (Khôn cung,
// Tam Thế) — khớp đúng: quẻ cung, Thế/Ứng hào, Nạp Giáp Can Chi từng hào (Càn, Khôn, Khảm đã xác minh
// trực tiếp), Lục Thân từng hào (khớp cả 6/6 hào cả 2 ví dụ), Lục Thú (khớp cả 6/6 hào), Tuần Không.
// Nạp Giáp Can của 8 quái đã đối chiếu thêm với bảng "Stem-Trigram" trên Wikipedia (mục Wenwanggua).
// Nạp Giáp Chi của Chấn/Tốn/Cấn/Ly/Đoài (5/8 quái) lấy theo ca quyết "Nạp Giáp" cổ điển (Kinh Phòng),
// chưa có ví dụ thực tế độc lập để đối chiếu riêng — nhưng tuân theo đúng quy luật đối xứng nhất quán
// đã được xác nhận ở 3 quái kia (nhóm Dương thuận hành, nhóm Âm nghịch hành, mỗi 2 quái cách nhau đúng
// 2 Chi).

import { CAN, CHI } from "./menh-nap-am";
import { CHI_NGU_HANH, khongVongOf, tinhBatTu } from "./bat-tu";
import type { NguHanh } from "./menh-nap-am";
import { jdFromDate, getCurrentTietKhi24Name } from "./solar-term";
import { solarToLunar } from "./lunar-calendar";

export type LineVal = 0 | 1; // 0 = Âm (đứt), 1 = Dương (liền)

export interface TrigramDef {
  id: number; // 1-8, theo đúng thứ tự tài liệu tham khảo
  name: string;
  symbol: string;
  bits: [LineVal, LineVal, LineVal]; // hào 1-2-3 (dưới lên)
  nguHanh: NguHanh;
  napGiap: {
    lower: { canIndex: number; chi: [number, number, number] };
    upper: { canIndex: number; chi: [number, number, number] };
  };
}

const G = (name: string) => CAN.indexOf(name);
const C = (name: string) => CHI.indexOf(name);

export const TRIGRAMS: TrigramDef[] = [
  {
    id: 1, name: "Càn", symbol: "☰", bits: [1, 1, 1], nguHanh: "Kim",
    napGiap: { lower: { canIndex: G("Giáp"), chi: [C("Tý"), C("Dần"), C("Thìn")] }, upper: { canIndex: G("Nhâm"), chi: [C("Ngọ"), C("Thân"), C("Tuất")] } },
  },
  {
    id: 2, name: "Đoài", symbol: "☱", bits: [1, 1, 0], nguHanh: "Kim",
    napGiap: { lower: { canIndex: G("Đinh"), chi: [C("Tỵ"), C("Mão"), C("Sửu")] }, upper: { canIndex: G("Đinh"), chi: [C("Hợi"), C("Dậu"), C("Mùi")] } },
  },
  {
    id: 3, name: "Ly", symbol: "☲", bits: [1, 0, 1], nguHanh: "Hỏa",
    napGiap: { lower: { canIndex: G("Kỷ"), chi: [C("Mão"), C("Sửu"), C("Hợi")] }, upper: { canIndex: G("Kỷ"), chi: [C("Dậu"), C("Mùi"), C("Tỵ")] } },
  },
  {
    id: 4, name: "Chấn", symbol: "☳", bits: [1, 0, 0], nguHanh: "Mộc",
    napGiap: { lower: { canIndex: G("Canh"), chi: [C("Tý"), C("Dần"), C("Thìn")] }, upper: { canIndex: G("Canh"), chi: [C("Ngọ"), C("Thân"), C("Tuất")] } },
  },
  {
    id: 5, name: "Tốn", symbol: "☴", bits: [0, 1, 1], nguHanh: "Mộc",
    napGiap: { lower: { canIndex: G("Tân"), chi: [C("Sửu"), C("Hợi"), C("Dậu")] }, upper: { canIndex: G("Tân"), chi: [C("Mùi"), C("Tỵ"), C("Mão")] } },
  },
  {
    id: 6, name: "Khảm", symbol: "☵", bits: [0, 1, 0], nguHanh: "Thủy",
    napGiap: { lower: { canIndex: G("Mậu"), chi: [C("Dần"), C("Thìn"), C("Ngọ")] }, upper: { canIndex: G("Mậu"), chi: [C("Thân"), C("Tuất"), C("Tý")] } },
  },
  {
    id: 7, name: "Cấn", symbol: "☶", bits: [0, 0, 1], nguHanh: "Thổ",
    napGiap: { lower: { canIndex: G("Bính"), chi: [C("Thìn"), C("Ngọ"), C("Thân")] }, upper: { canIndex: G("Bính"), chi: [C("Tuất"), C("Tý"), C("Dần")] } },
  },
  {
    id: 8, name: "Khôn", symbol: "☷", bits: [0, 0, 0], nguHanh: "Thổ",
    napGiap: { lower: { canIndex: G("Ất"), chi: [C("Mùi"), C("Tỵ"), C("Mão")] }, upper: { canIndex: G("Quý"), chi: [C("Sửu"), C("Hợi"), C("Dậu")] } },
  },
];

function trigramByBits(bits: [LineVal, LineVal, LineVal]): TrigramDef {
  const t = TRIGRAMS.find((tr) => tr.bits[0] === bits[0] && tr.bits[1] === bits[1] && tr.bits[2] === bits[2]);
  if (!t) throw new Error("Bát quái không hợp lệ");
  return t;
}

// Bảng 64 quẻ (Thượng-Hạ → tên) — đối chiếu theo tài liệu "Nhập môn Chu Dịch Dự đoán học" (Trần Viên).
export const HEXAGRAM_NAMES: Record<string, string> = {
  "Càn-Càn": "Thuần Càn", "Càn-Đoài": "Thiên Trạch Lý", "Càn-Ly": "Thiên Hỏa Đồng Nhân", "Càn-Chấn": "Thiên Lôi Vô Vọng",
  "Càn-Tốn": "Thiên Phong Cấu", "Càn-Khảm": "Thiên Thủy Tụng", "Càn-Cấn": "Thiên Sơn Độn", "Càn-Khôn": "Thiên Địa Bĩ",
  "Đoài-Càn": "Trạch Thiên Quải", "Đoài-Đoài": "Thuần Đoài", "Đoài-Ly": "Trạch Hỏa Cách", "Đoài-Chấn": "Trạch Lôi Tùy",
  "Đoài-Tốn": "Trạch Phong Đại Quá", "Đoài-Khảm": "Trạch Thủy Khốn", "Đoài-Cấn": "Trạch Sơn Hàm", "Đoài-Khôn": "Trạch Địa Tụy",
  "Ly-Càn": "Hỏa Thiên Đại Hữu", "Ly-Đoài": "Hỏa Trạch Khuê", "Ly-Ly": "Thuần Ly", "Ly-Chấn": "Hỏa Lôi Phệ Hạp",
  "Ly-Tốn": "Hỏa Phong Đỉnh", "Ly-Khảm": "Hỏa Thủy Vị Tế", "Ly-Cấn": "Hỏa Sơn Lữ", "Ly-Khôn": "Hỏa Địa Tấn",
  "Chấn-Càn": "Lôi Thiên Đại Tráng", "Chấn-Đoài": "Lôi Trạch Quy Muội", "Chấn-Ly": "Lôi Hỏa Phong", "Chấn-Chấn": "Thuần Chấn",
  "Chấn-Tốn": "Lôi Phong Hằng", "Chấn-Khảm": "Lôi Thủy Giải", "Chấn-Cấn": "Lôi Sơn Tiểu Quá", "Chấn-Khôn": "Lôi Địa Dự",
  "Tốn-Càn": "Phong Thiên Tiểu Súc", "Tốn-Đoài": "Phong Trạch Trung Phu", "Tốn-Ly": "Phong Hỏa Gia Nhân", "Tốn-Chấn": "Phong Lôi Ích",
  "Tốn-Tốn": "Thuần Tốn", "Tốn-Khảm": "Phong Thủy Hoán", "Tốn-Cấn": "Phong Sơn Tiệm", "Tốn-Khôn": "Phong Địa Quán",
  "Khảm-Càn": "Thủy Thiên Nhu", "Khảm-Đoài": "Thủy Trạch Tiết", "Khảm-Ly": "Thủy Hỏa Ký Tế", "Khảm-Chấn": "Thủy Lôi Truân",
  "Khảm-Tốn": "Thủy Phong Tỉnh", "Khảm-Khảm": "Thuần Khảm", "Khảm-Cấn": "Thủy Sơn Kiển", "Khảm-Khôn": "Thủy Địa Tỷ",
  "Cấn-Càn": "Sơn Thiên Đại Súc", "Cấn-Đoài": "Sơn Trạch Tổn", "Cấn-Ly": "Sơn Hỏa Bí", "Cấn-Chấn": "Sơn Lôi Di",
  "Cấn-Tốn": "Sơn Phong Cổ", "Cấn-Khảm": "Sơn Thủy Mông", "Cấn-Cấn": "Thuần Cấn", "Cấn-Khôn": "Sơn Địa Bác",
  "Khôn-Càn": "Địa Thiên Thái", "Khôn-Đoài": "Địa Trạch Lâm", "Khôn-Ly": "Địa Hỏa Minh Di", "Khôn-Chấn": "Địa Lôi Phục",
  "Khôn-Tốn": "Địa Phong Thăng", "Khôn-Khảm": "Địa Thủy Sư", "Khôn-Cấn": "Địa Sơn Khiêm", "Khôn-Khôn": "Thuần Khôn",
};

// --- Lục Thân (so ngũ hành Nạp Giáp của hào với ngũ hành BẢN CUNG — quẻ thuần của quái chủ cung) ---
export type LucThan = "Huynh Đệ" | "Phụ Mẫu" | "Tử Tôn" | "Quan Quỷ" | "Thê Tài";

function lucThanOf(palaceNguHanh: NguHanh, lineNguHanh: NguHanh): LucThan {
  const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
  if (lineNguHanh === palaceNguHanh) return "Huynh Đệ";
  if (SINH[lineNguHanh] === palaceNguHanh) return "Phụ Mẫu"; // hào sinh cung => cung là "con" của hào => hào là Phụ Mẫu
  if (SINH[palaceNguHanh] === lineNguHanh) return "Tử Tôn"; // cung sinh hào => hào là Tử Tôn
  if (KHAC[lineNguHanh] === palaceNguHanh) return "Quan Quỷ"; // hào khắc cung => hào là Quan Quỷ
  return "Thê Tài"; // cung khắc hào => hào là Thê Tài
}

// --- Vượng Suy theo Nguyệt Lệnh (so ngũ hành Nguyệt Lệnh — Chi tháng lập quẻ — với ngũ hành Nạp Giáp
// của hào) — công thức đã giải mã và đối chiếu khớp cả 12/12 hào (2 bảng) trong ảnh tham chiếu thực tế:
// hào cùng hành Nguyệt Lệnh = Vượng; Nguyệt Lệnh sinh hào = Tướng; hào sinh Nguyệt Lệnh (hào là "mẹ")
// = Hưu; hào khắc Nguyệt Lệnh = Tù; Nguyệt Lệnh khắc hào = Tử.
export type VuongSuy = "Vượng" | "Tướng" | "Hưu" | "Tù" | "Tử";

function vuongSuyOf(monthNguHanh: NguHanh, lineNguHanh: NguHanh): VuongSuy {
  const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
  if (lineNguHanh === monthNguHanh) return "Vượng";
  if (SINH[monthNguHanh] === lineNguHanh) return "Tướng";
  if (SINH[lineNguHanh] === monthNguHanh) return "Hưu";
  if (KHAC[lineNguHanh] === monthNguHanh) return "Tù";
  return "Tử";
}

// --- Lục Thú (khởi từ hào 1 theo Can ngày, đi lên) ---
const LUC_THU = ["Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ"];
const LUC_THU_START: Record<number, number> = {
  0: 0, 1: 0, // Giáp, Ất
  2: 1, 3: 1, // Bính, Đinh
  4: 2, // Mậu
  5: 3, // Kỷ
  6: 4, 7: 4, // Canh, Tân
  8: 5, 9: 5, // Nhâm, Quý
};

export interface HaoInfo {
  hao: number; // 1-6, từ dưới lên
  value: LineVal;
  isDong: boolean; // hào động (từ cách lập quẻ Lục Hào thủ công) — không áp dụng cho 3 pp còn lại
  canIndex: number;
  chiIndex: number;
  nguHanh: NguHanh;
  lucThan: LucThan;
  lucThu: string;
  theUng: "Thế" | "Ứng" | null;
  phucThan: { lucThan: LucThan; canIndex: number; chiIndex: number } | null; // Lục Thân ẩn (mượn từ quẻ thuần bản cung), nếu loại đó không có mặt trong quẻ hiện tại
  vuongSuy: VuongSuy;
}

// Lục Hợp / Lục Xung giữa 2 Chi — dùng để xác định nhãn đặc biệt thay cho tên đời quái, khi Chi của
// hào Thế và hào Ứng hợp nhau hoặc xung nhau (đối chiếu khớp với 2 ví dụ thực tế: Thìn-Dậu hợp → nhãn
// "Lục Hợp" thay cho "Tam Thế"; Mão-Tý không hợp không xung → giữ nguyên tên đời quái "Quy Hồn").
const LUC_HOP_PAIRS: [number, number][] = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]]; // Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tỵ-Thân, Ngọ-Mùi (theo index CHI)
const LUC_XUNG_PAIRS: [number, number][] = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];

function chiRelation(a: number, b: number): "hop" | "xung" | null {
  if (LUC_HOP_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return "hop";
  if (LUC_XUNG_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return "xung";
  return null;
}

// Nhãn cung dùng chung cho cả quẻ chính/biến/hỗ: nếu Chi hào Thế và hào Ứng hợp/xung nhau, dùng nhãn
// "Lục Hợp"/"Lục Xung" thay cho tên đời quái thông thường — áp dụng thống nhất cho mọi quẻ (kể cả quẻ
// hỗ, đối chiếu khớp thực tế: quẻ hỗ "Thuần Khôn" có Thế-Ứng Dậu-Mão xung → "Khôn (Lục Xung)").
function computeCungLabel(cungName: string, generationIndex: number, theChi: number, ungChi: number): string {
  const relation = chiRelation(theChi, ungChi);
  const special = relation === "hop" ? "Lục Hợp" : relation === "xung" ? "Lục Xung" : GENERATION_LABELS[generationIndex];
  return `${cungName} (${special})`;
}

export interface QueDayDu {
  lines: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
  upper: TrigramDef;
  lower: TrigramDef;
  name: string;
  cungTrigram: TrigramDef; // cung DÙNG ĐỂ LUẬN (Lục Thân/Thế/Ứng) — nếu là quẻ biến thì đây là cung của quẻ CHỦ, không phải cung riêng của quẻ biến (theo nguyên tắc Lục Hào: quẻ biến không tính như 1 lá độc lập)
  cungLabel: string; // "Càn", "Khảm"... + phân loại (Bát Thuần/Nhất Thế.../Du Hồn/Quy Hồn)
  generationIndex: number; // đời quái của cung DÙNG ĐỂ LUẬN (0=Bát Thuần...7=Quy Hồn)
  theHao: number;
  ungHao: number;
  hao: HaoInfo[]; // index 0 = hào 1 (dưới), ... index5 = hào 6
  changedPalace?: { cungTrigram: TrigramDef; cungLabel: string; theHao: number; ungHao: number }; // metadata: cung/Thế/Ứng RIÊNG thực sự của quẻ này nếu tự đứng độc lập (chỉ có khi đây là quẻ biến) — CHỈ để đối chiếu/tham khảo, KHÔNG dùng để tính Lục Thân/Thế/Ứng ở trên
}

const GENERATION_LABELS = ["Bát Thuần", "Nhất Thế", "Nhị Thế", "Tam Thế", "Tứ Thế", "Ngũ Thế", "Du Hồn", "Quy Hồn"];

// Sinh 8 quẻ (bao gồm bản cung) của 1 quái chủ cung theo đúng luật biến hào Kinh Phòng, trả về
// map "6 bit string" -> { theHao, generationIndex }.
function buildPalaceHexagrams(cung: TrigramDef): Map<string, { theHao: number; generationIndex: number }> {
  const pure = cung.bits; // dùng chung cho cả lower & upper ban đầu
  const map = new Map<string, { theHao: number; generationIndex: number }>();
  const toKey = (lower: LineVal[], upper: LineVal[]) => [...lower, ...upper].join("");

  // Bát Thuần (thế hào 6)
  map.set(toKey(pure, pure), { theHao: 6, generationIndex: 0 });

  // Nhất Thế .. Ngũ Thế (thế hào 1..5): lật dần từng hào từ hào 1 lên, hào 4-5 thuộc quái thượng.
  let lower: LineVal[] = [...pure];
  let upper: LineVal[] = [...pure];
  const flip = (v: LineVal): LineVal => (v === 1 ? 0 : 1);
  for (let gen = 1; gen <= 5; gen++) {
    const pos = gen - 1; // 0-based trong mảng 6 hào (0..5)
    if (pos < 3) lower[pos] = flip(lower[pos]);
    else upper[pos - 3] = flip(upper[pos - 3]);
    map.set(toKey(lower, upper), { theHao: gen, generationIndex: gen });
  }
  // lower/upper hiện tại = trạng thái Ngũ Thế (5 hào đã lật, hào 6 còn nguyên bản cung)

  // Du Hồn: lật lại hào 4 (upper[0]) về nguyên bản (undo), thế hào 4.
  const duHonUpper: LineVal[] = [...upper];
  duHonUpper[0] = pure[0];
  map.set(toKey(lower, duHonUpper), { theHao: 4, generationIndex: 6 });

  // Quy Hồn: từ Du Hồn, trả nguyên cả quái hạ (hào 1-2-3) về bản cung, giữ nguyên quái thượng của Du Hồn.
  const quyHonLower: LineVal[] = [...pure];
  map.set(toKey(quyHonLower, duHonUpper), { theHao: 3, generationIndex: 7 });

  return map;
}

// Tiền xử lý: với mỗi quẻ trong 64 quẻ, xác định nó thuộc cung nào + thế hào bao nhiêu — tính 1 lần.
const PALACE_LOOKUP = (() => {
  const lookup = new Map<string, { cung: TrigramDef; theHao: number; generationIndex: number }>();
  for (const cung of TRIGRAMS) {
    const hexes = buildPalaceHexagrams(cung);
    hexes.forEach((info, key) => {
      lookup.set(key, { cung, theHao: info.theHao, generationIndex: info.generationIndex });
    });
  }
  return lookup;
})();

// Cung/Thế/Ứng "vay mượn" từ quẻ CHỦ, dùng khi lập quẻ BIẾN — theo nguyên tắc Lục Hào: quẻ biến không
// tự đứng thành 1 lá độc lập, Lục Thân + Thế/Ứng của nó vẫn luận theo cung của quẻ chủ ban đầu.
export interface PalaceOverride {
  cung: TrigramDef;
  theHao: number;
  ungHao: number;
  generationIndex: number;
}

// Lập đầy đủ 1 quẻ (Nạp Giáp, Lục Thân, Lục Thú, Thế/Ứng, Phục Thần) từ 6 hào Âm/Dương (dưới lên) +
// Can Ngày (để khởi Lục Thú) + các vị trí hào động (nếu có, riêng cho phương pháp Lục Hào thủ công).
// `palaceOverride`: chỉ truyền khi lập QUẺ BIẾN — ép cung/Thế/Ứng dùng để luận Lục Thân theo quẻ CHỦ
// thay vì tự tra cung riêng của quẻ biến (cung riêng vẫn được lưu lại ở `changedPalace` để đối chiếu).
export function lapQueDayDu(
  lines: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal],
  dayCanIndex: number,
  dongPositions: number[] = [],
  monthChiIndex: number | null = null,
  palaceOverride: PalaceOverride | null = null,
): QueDayDu {
  const lowerBits = [lines[0], lines[1], lines[2]] as [LineVal, LineVal, LineVal];
  const upperBits = [lines[3], lines[4], lines[5]] as [LineVal, LineVal, LineVal];
  const lower = trigramByBits(lowerBits);
  const upper = trigramByBits(upperBits);
  const name = HEXAGRAM_NAMES[`${upper.name}-${lower.name}`] ?? `${upper.name} ${lower.name}`;

  const key = lines.join("");
  const ownPalaceInfo = PALACE_LOOKUP.get(key);
  if (!ownPalaceInfo) throw new Error("Không xác định được Bát Cung cho quẻ này");
  const ownUngHao = ((ownPalaceInfo.theHao + 3 - 1) % 6) + 1;

  // Cung/Thế/Ứng DÙNG ĐỂ LUẬN: cung của quẻ chủ (nếu có override, tức đây là quẻ biến) hoặc cung riêng
  // của chính quẻ này (quẻ chính/quẻ độc lập khác).
  const { cung, theHao, ungHao, generationIndex } = palaceOverride ?? {
    cung: ownPalaceInfo.cung,
    theHao: ownPalaceInfo.theHao,
    ungHao: ownUngHao,
    generationIndex: ownPalaceInfo.generationIndex,
  };

  const luThuStart = LUC_THU_START[dayCanIndex] ?? 0;

  // Nạp Giáp Can Chi cho từng hào theo trigram THỰC TẾ đang chiếm vị trí đó (không phụ thuộc cung).
  const napGiapFor = (pos: number): { canIndex: number; chiIndex: number } => {
    if (pos < 3) return { canIndex: lower.napGiap.lower.canIndex, chiIndex: lower.napGiap.lower.chi[pos] };
    return { canIndex: upper.napGiap.upper.canIndex, chiIndex: upper.napGiap.upper.chi[pos - 3] };
  };

  // Lục Thân nguyên bản theo Nạp Giáp thực tế + xác định các loại Lục Thân đang CÓ MẶT.
  const rawLucThan: LucThan[] = [0, 1, 2, 3, 4, 5].map((pos) => {
    const { chiIndex } = napGiapFor(pos);
    return lucThanOf(cung.nguHanh, CHI_NGU_HANH[chiIndex]);
  });
  const present = new Set(rawLucThan);
  const ALL_LUC_THAN: LucThan[] = ["Huynh Đệ", "Phụ Mẫu", "Tử Tôn", "Quan Quỷ", "Thê Tài"];
  const missing = ALL_LUC_THAN.filter((t) => !present.has(t));

  // Phục Thần: nếu quẻ hiện tại thiếu 1 (hoặc vài) loại Lục Thân, tra trong quẻ THUẦN của bản cung
  // (cung/cung) xem loại đó nằm ở hào nào — "mượn" Can Chi + gắn nhãn Phục Thần vào đúng hào đó.
  const phucThanAtPos: (LucThan | null)[] = [null, null, null, null, null, null];
  if (missing.length > 0) {
    const pureLucThan: LucThan[] = [0, 1, 2, 3, 4, 5].map((pos) => {
      const { chiIndex } = pos < 3 ? { chiIndex: cung.napGiap.lower.chi[pos] } : { chiIndex: cung.napGiap.upper.chi[pos - 3] };
      return lucThanOf(cung.nguHanh, CHI_NGU_HANH[chiIndex]);
    });
    missing.forEach((type) => {
      const pos = pureLucThan.indexOf(type);
      if (pos >= 0) phucThanAtPos[pos] = type;
    });
  }

  const napGiapPure = (pos: number): { canIndex: number; chiIndex: number } => {
    if (pos < 3) return { canIndex: cung.napGiap.lower.canIndex, chiIndex: cung.napGiap.lower.chi[pos] };
    return { canIndex: cung.napGiap.upper.canIndex, chiIndex: cung.napGiap.upper.chi[pos - 3] };
  };

  const monthNguHanh = monthChiIndex !== null ? CHI_NGU_HANH[monthChiIndex] : null;

  const hao: HaoInfo[] = [0, 1, 2, 3, 4, 5].map((pos) => {
    const haoSo = pos + 1;
    const { canIndex, chiIndex } = napGiapFor(pos);
    const lucThuIdx = (luThuStart + pos) % 6;
    const phucThanType = phucThanAtPos[pos];
    const nguHanh = CHI_NGU_HANH[chiIndex];
    return {
      hao: haoSo,
      value: lines[pos],
      isDong: dongPositions.includes(haoSo),
      canIndex,
      chiIndex,
      nguHanh,
      lucThan: rawLucThan[pos],
      lucThu: LUC_THU[lucThuIdx],
      theUng: haoSo === theHao ? "Thế" : haoSo === ungHao ? "Ứng" : null,
      phucThan: phucThanType ? { lucThan: phucThanType, ...napGiapPure(pos) } : null,
      vuongSuy: monthNguHanh ? vuongSuyOf(monthNguHanh, nguHanh) : vuongSuyOf(nguHanh, nguHanh),
    };
  });

  const theChi = hao[theHao - 1].chiIndex;
  const ungChi = hao[ungHao - 1].chiIndex;

  // Metadata đối chiếu: cung/Thế/Ứng RIÊNG thực sự của quẻ này nếu nó tự đứng độc lập — chỉ tính khi
  // có palaceOverride (tức đây là quẻ biến), không dùng để luận Lục Thân/Thế/Ứng ở trên.
  const changedPalace = palaceOverride
    ? {
        cungTrigram: ownPalaceInfo.cung,
        cungLabel: computeCungLabel(
          ownPalaceInfo.cung.name,
          ownPalaceInfo.generationIndex,
          hao[ownPalaceInfo.theHao - 1].chiIndex,
          hao[ownUngHao - 1].chiIndex,
        ),
        theHao: ownPalaceInfo.theHao,
        ungHao: ownUngHao,
      }
    : undefined;

  return {
    lines,
    upper,
    lower,
    name,
    cungTrigram: cung,
    cungLabel: computeCungLabel(cung.name, generationIndex, theChi, ungChi),
    generationIndex,
    theHao,
    ungHao,
    hao,
    changedPalace,
  };
}

// Tuần Không của Can Chi ngày lập quẻ — dùng lại đúng thuật toán đã kiểm chứng ở Bát Tự.
export { khongVongOf };

// Quẻ biến: áp dụng cho các hào có isDong = true (đảo Âm <-> Dương).
export function queBienFromDong(
  lines: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal],
  dongPositions: number[],
): [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal] | null {
  if (dongPositions.length === 0) return null;
  return lines.map((v, i) => (dongPositions.includes(i + 1) ? ((v === 1 ? 0 : 1) as LineVal) : v)) as [
    LineVal, LineVal, LineVal, LineVal, LineVal, LineVal,
  ];
}

// Quẻ Hỗ (互卦): hào 2-3-4 của quẻ chính làm quái hạ, hào 3-4-5 làm quái thượng — dùng để tham khảo
// diễn biến giữa quẻ chính và quẻ biến. Vẫn thuộc 1 cung/đời quái như bất kỳ quẻ nào khác trong 64
// quẻ nên vẫn có Thế/Ứng + nhãn Lục Hợp/Lục Xung riêng (đối chiếu khớp thực tế: quẻ hỗ "Thuần Khôn"
// → "Khôn (Lục Xung)"), nhưng KHÔNG hiển thị bảng Nạp Giáp/Lục Thân/Lục Thú đầy đủ như quẻ chính/biến.
export interface QueHoInfo {
  lines: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
  upper: TrigramDef;
  lower: TrigramDef;
  name: string;
  cungTrigram: TrigramDef;
  cungLabel: string;
}

function queHoInfo(lines: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal]): QueHoInfo {
  const lowerBits = [lines[1], lines[2], lines[3]] as [LineVal, LineVal, LineVal]; // hào 2-3-4
  const upperBits = [lines[2], lines[3], lines[4]] as [LineVal, LineVal, LineVal]; // hào 3-4-5
  const lower = trigramByBits(lowerBits);
  const upper = trigramByBits(upperBits);
  const name = HEXAGRAM_NAMES[`${upper.name}-${lower.name}`] ?? `${upper.name} ${lower.name}`;
  const hoLines = [...lowerBits, ...upperBits] as [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
  const palaceInfo = PALACE_LOOKUP.get(hoLines.join(""));
  const cung = palaceInfo?.cung ?? upper;
  const theHao = palaceInfo?.theHao ?? 6;
  const generationIndex = palaceInfo?.generationIndex ?? 0;
  const ungHao = ((theHao + 3 - 1) % 6) + 1;

  const napGiapChiAt = (pos: number): number => (pos < 3 ? lower.napGiap.lower.chi[pos] : upper.napGiap.upper.chi[pos - 3]);
  const theChi = napGiapChiAt(theHao - 1);
  const ungChi = napGiapChiAt(ungHao - 1);

  return { lines: hoLines, upper, lower, name, cungTrigram: cung, cungLabel: computeCungLabel(cung.name, generationIndex, theChi, ungChi) };
}

// Can Chi ngày Dương lịch (chu kỳ 60 ngày liên tục qua Julian Day) — dùng để khởi Lục Thú + Tuần Không.
// Đối chiếu đúng công thức đã kiểm chứng trong bat-tu.ts (trụ ngày Bát Tự): 23h tính sang ngày hôm sau.
export function dayCanChiOf(day: number, month: number, year: number, hour: number): { canIndex: number; chiIndex: number } {
  let jdDay = jdFromDate(day, month, year);
  if (hour >= 23) jdDay += 1;
  return { canIndex: (jdDay + 9) % 10, chiIndex: (jdDay + 1) % 12 };
}

export interface CastInput {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute?: number;
}

export interface FullCastResult {
  chinh: QueDayDu;
  hoQue: QueHoInfo;
  bien: QueDayDu | null;
  dongPositions: number[];
  tuanKhong: string;
  dayCan: string;
  dayChi: string;
  monthCan: string;
  monthChi: string;
  yearCan: string;
  yearChi: string;
  hourCan: string;
  hourChi: string;
  tietKhi: string;
  canChiText: string; // "giờ X, ngày Y, tháng Z, năm W"
  nhatThan: string; // "Chi-NgũHành" của Ngày, ví dụ "Tuất-Thổ"
  nguyetLenh: string; // "Chi-NgũHành" của Tháng, ví dụ "Mùi-Thổ"
  amLichText: string; // "giờ Chi, ngày/tháng/năm âm lịch"
  methodNote: string;
}

function trigramById(id: number): TrigramDef {
  const t = TRIGRAMS.find((tr) => tr.id === id);
  if (!t) throw new Error("ID quái không hợp lệ");
  return t;
}

function finalizeCast(
  lower: TrigramDef,
  upper: TrigramDef,
  dongPositions: number[],
  input: CastInput,
  methodNote: string,
): FullCastResult {
  const lines = [...lower.bits, ...upper.bits] as [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
  const { canIndex, chiIndex } = dayCanChiOf(input.day, input.month, input.year, input.hour);

  // Tái dùng tinhBatTu() để lấy Can Chi Năm/Tháng/Giờ (đã được kiểm chứng kỹ ở công cụ Bát Tự) thay vì
  // cài lại logic — giới tính không ảnh hưởng Can Chi các trụ, chỉ ảnh hưởng chiều Đại Vận (không dùng ở đây).
  const bt = tinhBatTu({ day: input.day, month: input.month, year: input.year, hour: input.hour, minute: input.minute, gender: "Nam" });
  const monthChiIndex = bt.month.chiIndex;

  const chinh = lapQueDayDu(lines, canIndex, dongPositions, monthChiIndex);
  const hoQue = queHoInfo(lines);
  const bienLines = queBienFromDong(lines, dongPositions);
  // Quẻ biến KHÔNG tính như 1 lá độc lập: Lục Thân + Thế/Ứng vay mượn nguyên từ quẻ CHỦ (chinh); Nạp
  // Giáp vẫn tính lại theo trigram thực tế sau khi biến (đã tự động đúng vì napGiapFor dùng lower/upper
  // của chính `bienLines`, không phụ thuộc palaceOverride).
  const bien = bienLines
    ? lapQueDayDu(bienLines, canIndex, [], monthChiIndex, {
        cung: chinh.cungTrigram,
        theHao: chinh.theHao,
        ungHao: chinh.ungHao,
        generationIndex: chinh.generationIndex,
      })
    : null;
  const tietKhi = getCurrentTietKhi24Name(input.day, input.month, input.year, input.hour);
  const canChiText = `giờ ${bt.hour.can} ${bt.hour.chi}, ngày ${bt.day.can} ${bt.day.chi}, tháng ${bt.month.can} ${bt.month.chi}, năm ${bt.year.can} ${bt.year.chi}`;
  const nhatThan = `${bt.day.chi}-${CHI_NGU_HANH[bt.day.chiIndex]}`;
  const nguyetLenh = `${bt.month.chi}-${CHI_NGU_HANH[bt.month.chiIndex]}`;

  const lunar = solarToLunar(input.day, input.month, input.year);
  const hourChiIndex = Math.floor((((input.hour + 1) % 24) + 24) % 24 / 2);
  const amLichText = `giờ ${CHI[hourChiIndex]}, ${lunar.day}/${lunar.month}${lunar.isLeapMonth ? " (nhuận)" : ""}/${lunar.year}`;

  return {
    chinh,
    hoQue,
    bien,
    dongPositions,
    tuanKhong: khongVongOf(canIndex, chiIndex),
    dayCan: CAN[canIndex],
    dayChi: CHI[chiIndex],
    monthCan: bt.month.can,
    monthChi: bt.month.chi,
    yearCan: bt.year.can,
    yearChi: bt.year.chi,
    hourCan: bt.hour.can,
    hourChi: bt.hour.chi,
    tietKhi,
    canChiText,
    nhatThan,
    nguyetLenh,
    amLichText,
    methodNote,
  };
}

// --- Phương pháp 1: Mai Hoa Dịch Số (Thiệu Khang Tiết) — dùng Năm/Tháng/Ngày/Giờ ÂM LỊCH của thời
// điểm lập quẻ. Công thức đã kiểm chứng khớp chính xác với ví dụ thực tế tham chiếu.
export function maiHoaCast(input: CastInput): FullCastResult {
  const lunar = solarToLunar(input.day, input.month, input.year);
  const yearChiIndex = ((lunar.year - 4) % 12 + 12) % 12;
  const soNam = yearChiIndex + 1; // Tý=1...Hợi=12
  const soThang = lunar.month;
  const soNgay = lunar.day;
  const hourChiIndex = Math.floor((((input.hour + 1) % 24) + 24) % 24 / 2);
  const soGio = hourChiIndex + 1;

  let queThuong = (soNam + soThang + soNgay) % 8;
  if (queThuong === 0) queThuong = 8;
  let queHa = (soNam + soThang + soNgay + soGio) % 8;
  if (queHa === 0) queHa = 8;
  let haoDong = (soNam + soThang + soNgay + soGio) % 6;
  if (haoDong === 0) haoDong = 6;

  const upper = trigramById(queThuong);
  const lower = trigramById(queHa);
  const note = `Mai Hoa Dịch Số — Âm lịch ngày ${soNgay} tháng ${soThang} năm ${CHI[yearChiIndex]}, giờ ${CHI[hourChiIndex]}. Quẻ thượng số ${queThuong}, quẻ hạ số ${queHa}, hào động số ${haoDong}.`;
  return finalizeCast(lower, upper, [haoDong], input, note);
}

// --- Phương pháp 2: Lục Hào (gieo 3 đồng xu, 6 lần) — mô phỏng ngẫu nhiên, cho ra Lão/Thiếu Âm Dương
// và xác định hào động (Lão Âm 6, Lão Dương 9) đúng theo nghi thức truyền thống.
export type CoinLineValue = 6 | 7 | 8 | 9;

export function tossCoinLine(rng: () => number = Math.random): CoinLineValue {
  let sum = 0;
  for (let i = 0; i < 3; i++) sum += rng() < 0.5 ? 2 : 3;
  return sum as CoinLineValue;
}

export function lucHaoCastFromTosses(rawLines: CoinLineValue[], input: CastInput): FullCastResult {
  const bits = rawLines.map((v) => (v === 6 || v === 8 ? 0 : 1)) as LineVal[];
  const dongPositions = rawLines.map((v, i) => ({ v, pos: i + 1 })).filter((x) => x.v === 6 || x.v === 9).map((x) => x.pos);
  const lower = trigramByBits([bits[0], bits[1], bits[2]]);
  const upper = trigramByBits([bits[3], bits[4], bits[5]]);
  const note = "Lục Hào — gieo 3 đồng xu, 6 lần (sấp 2 điểm, ngửa 3 điểm; tổng 6/9 là hào động).";
  return finalizeCast(lower, upper, dongPositions, input, note);
}

export function lucHaoCastRandom(input: CastInput, rng: () => number = Math.random): FullCastResult {
  const rawLines: CoinLineValue[] = [];
  for (let i = 0; i < 6; i++) rawLines.push(tossCoinLine(rng));
  return lucHaoCastFromTosses(rawLines, input);
}

// Lục Hào — nhập tay: người dùng tự gieo đồng xu thật (hoặc tự chọn) rồi ghi lại Âm/Dương + hào động
// cho từng hào, đúng theo cách hành nghề truyền thống (không dùng RNG của phần mềm).
export function lucHaoCastManual(values: LineVal[], dongPositions: number[], input: CastInput): FullCastResult {
  const lower = trigramByBits([values[0], values[1], values[2]]);
  const upper = trigramByBits([values[3], values[4], values[5]]);
  const note = "Lục Hào — nhập tay theo kết quả gieo đồng xu thực tế của người xem.";
  return finalizeCast(lower, upper, dongPositions, input, note);
}

// --- Phương pháp 3 & 4: Lập quẻ theo dãy số (Seri tiền / Số điện thoại) — áp dụng cách "số linh quẻ"
// cổ điển (Thiệu Vĩ Hoa, ứng dụng Mai Hoa Dịch Số cho số bất kỳ): chia dãy số làm 2 nửa, tổng chữ số
// nửa đầu %8 = quẻ thượng, tổng chữ số nửa sau %8 = quẻ hạ, tổng tất cả chữ số %6 = hào động.
// Số lượng chữ số LẺ (ví dụ Seri 7 số): nửa đầu lấy PHẦN NGẮN HƠN (3 số đầu), nửa sau lấy PHẦN DÀI
// HƠN (4 số sau) — ví dụ 7 số: 3 số đầu :8 ra quẻ thượng, 4 số sau :8 ra quẻ hạ, tổng cả 7 số :6 ra
// hào động (không đổi).
function digitSum(digits: string): number {
  return digits.split("").reduce((s, d) => s + (Number(d) || 0), 0);
}

export function queFromNumberString(raw: string, input: CastInput, label: string): FullCastResult {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 2) throw new Error("Cần ít nhất 2 chữ số để lập quẻ");
  const mid = Math.floor(digits.length / 2);
  const firstHalf = digits.slice(0, mid);
  const secondHalf = digits.slice(mid);

  let queThuong = digitSum(firstHalf) % 8;
  if (queThuong === 0) queThuong = 8;
  let queHa = digitSum(secondHalf) % 8;
  if (queHa === 0) queHa = 8;
  let haoDong = digitSum(digits) % 6;
  if (haoDong === 0) haoDong = 6;

  const upper = trigramById(queThuong);
  const lower = trigramById(queHa);
  const note = `${label} "${digits}" — chia nửa đầu "${firstHalf}" (quẻ thượng số ${queThuong}), nửa sau "${secondHalf}" (quẻ hạ số ${queHa}), tổng chữ số (hào động số ${haoDong}).`;
  return finalizeCast(lower, upper, [haoDong], input, note);
}

export function seriTienCast(serial: string, input: CastInput): FullCastResult {
  return queFromNumberString(serial, input, "Seri tiền");
}

export function soDienThoaiCast(phone: string, input: CastInput): FullCastResult {
  return queFromNumberString(phone, input, "Số điện thoại");
}
