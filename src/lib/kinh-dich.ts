// Lập quẻ Kinh Dịch bằng phương pháp gieo 3 đồng xu (6 lần) — chỉ tạo quẻ, không luận giải sâu
// (Nạp Giáp, Lục Thân, Lục Thần, Thế/Ứng thuộc phạm vi chuyên sâu, không đưa vào công cụ tự động này).

export type LineValue = 6 | 7 | 8 | 9; // Lão Âm (biến) | Thiếu Dương | Thiếu Âm | Lão Dương (biến)

export interface Trigram {
  name: string;
  symbol: string;
  lines: [0 | 1, 0 | 1, 0 | 1]; // từ dưới lên, 1 = Dương (liền), 0 = Âm (đứt)
}

export const TRIGRAMS: Trigram[] = [
  { name: "Càn", symbol: "☰", lines: [1, 1, 1] },
  { name: "Đoài", symbol: "☱", lines: [1, 1, 0] },
  { name: "Ly", symbol: "☲", lines: [1, 0, 1] },
  { name: "Chấn", symbol: "☳", lines: [1, 0, 0] },
  { name: "Tốn", symbol: "☴", lines: [0, 1, 1] },
  { name: "Khảm", symbol: "☵", lines: [0, 1, 0] },
  { name: "Cấn", symbol: "☶", lines: [0, 0, 1] },
  { name: "Khôn", symbol: "☷", lines: [0, 0, 0] },
];

function findTrigram(lines: [0 | 1, 0 | 1, 0 | 1]): Trigram {
  const t = TRIGRAMS.find((tr) => tr.lines[0] === lines[0] && tr.lines[1] === lines[1] && tr.lines[2] === lines[2]);
  if (!t) throw new Error("Trigram không hợp lệ");
  return t;
}

// Bảng tên 64 quẻ (Thượng quái - Hạ quái) theo thứ tự Chu Dịch (King Wen), đối chiếu nhiều nguồn tham khảo.
const HEXAGRAM_NAMES: Record<string, string> = {
  "Càn-Càn": "Thuần Càn", "Khôn-Khôn": "Thuần Khôn",
  "Khảm-Chấn": "Thuỷ Lôi Truân", "Cấn-Khảm": "Sơn Thuỷ Mông",
  "Khảm-Càn": "Thuỷ Thiên Nhu", "Càn-Khảm": "Thiên Thuỷ Tụng",
  "Khôn-Khảm": "Địa Thuỷ Sư", "Khảm-Khôn": "Thuỷ Địa Tỷ",
  "Tốn-Càn": "Phong Thiên Tiểu Súc", "Càn-Đoài": "Thiên Trạch Lý",
  "Khôn-Càn": "Địa Thiên Thái", "Càn-Khôn": "Thiên Địa Bĩ",
  "Càn-Ly": "Thiên Hoả Đồng Nhân", "Ly-Càn": "Hoả Thiên Đại Hữu",
  "Khôn-Cấn": "Địa Sơn Khiêm", "Chấn-Khôn": "Lôi Địa Dự",
  "Đoài-Chấn": "Trạch Lôi Tuỳ", "Cấn-Tốn": "Sơn Phong Cổ",
  "Khôn-Đoài": "Địa Trạch Lâm", "Tốn-Khôn": "Phong Địa Quán",
  "Ly-Chấn": "Hoả Lôi Phệ Hạp", "Cấn-Ly": "Sơn Hoả Bí",
  "Cấn-Khôn": "Sơn Địa Bác", "Khôn-Chấn": "Địa Lôi Phục",
  "Càn-Chấn": "Thiên Lôi Vô Vọng", "Cấn-Càn": "Sơn Thiên Đại Súc",
  "Cấn-Chấn": "Sơn Lôi Di", "Đoài-Tốn": "Trạch Phong Đại Quá",
  "Khảm-Khảm": "Thuần Khảm", "Ly-Ly": "Thuần Ly",
  "Đoài-Cấn": "Trạch Sơn Hàm", "Chấn-Tốn": "Lôi Phong Hằng",
  "Càn-Cấn": "Thiên Sơn Độn", "Chấn-Càn": "Lôi Thiên Đại Tráng",
  "Ly-Khôn": "Hoả Địa Tấn", "Khôn-Ly": "Địa Hoả Minh Di",
  "Tốn-Ly": "Phong Hoả Gia Nhân", "Ly-Đoài": "Hoả Trạch Khuê",
  "Khảm-Cấn": "Thuỷ Sơn Kiển", "Chấn-Khảm": "Lôi Thuỷ Giải",
  "Cấn-Đoài": "Sơn Trạch Tổn", "Tốn-Chấn": "Phong Lôi Ích",
  "Đoài-Càn": "Trạch Thiên Quải", "Càn-Tốn": "Thiên Phong Cấu",
  "Đoài-Khôn": "Trạch Địa Tuỵ", "Khôn-Tốn": "Địa Phong Thăng",
  "Đoài-Khảm": "Trạch Thuỷ Khốn", "Khảm-Tốn": "Thuỷ Phong Tỉnh",
  "Đoài-Ly": "Trạch Hoả Cách", "Ly-Tốn": "Hoả Phong Đỉnh",
  "Chấn-Chấn": "Thuần Chấn", "Cấn-Cấn": "Thuần Cấn",
  "Tốn-Cấn": "Phong Sơn Tiệm", "Chấn-Đoài": "Lôi Trạch Quy Muội",
  "Chấn-Ly": "Lôi Hoả Phong", "Ly-Cấn": "Hoả Sơn Lữ",
  "Tốn-Tốn": "Thuần Tốn", "Đoài-Đoài": "Thuần Đoài",
  "Tốn-Khảm": "Phong Thuỷ Hoán", "Khảm-Đoài": "Thuỷ Trạch Tiết",
  "Tốn-Đoài": "Phong Trạch Trung Phu", "Chấn-Cấn": "Lôi Sơn Tiểu Quá",
  "Khảm-Ly": "Thuỷ Hoả Ký Tế", "Ly-Khảm": "Hoả Thuỷ Vị Tế",
};

export interface HexagramResult {
  name: string;
  upper: Trigram;
  lower: Trigram;
  lines: [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]; // dưới lên trên
}

function buildHexagram(lines: [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]): HexagramResult {
  const lower = findTrigram([lines[0], lines[1], lines[2]]);
  const upper = findTrigram([lines[3], lines[4], lines[5]]);
  const name = HEXAGRAM_NAMES[`${upper.name}-${lower.name}`] ?? `${upper.name} ${lower.name}`;
  return { name, upper, lower, lines };
}

export interface CastResult {
  rawLines: LineValue[]; // 6 giá trị, từ hào 1 (dưới) đến hào 6 (trên)
  primary: HexagramResult;
  changed: HexagramResult | null; // quẻ biến, null nếu không có hào động
  changingPositions: number[]; // vị trí hào động (1-6), tính từ dưới lên
}

// Gieo 1 hào bằng 3 đồng xu: sấp = 2 điểm, ngửa = 3 điểm, tổng 6-9.
function tossLine(rng: () => number): LineValue {
  let sum = 0;
  for (let i = 0; i < 3; i++) sum += rng() < 0.5 ? 2 : 3; // < 0.5 = sấp, >= 0.5 = ngửa
  return sum as LineValue;
}

function lineValueToYinYang(v: LineValue): 0 | 1 {
  return v === 6 || v === 8 ? 0 : 1; // 6,8 = Âm (đứt); 7,9 = Dương (liền)
}

export function castHexagram(rng: () => number = Math.random): CastResult {
  const rawLines: LineValue[] = [];
  for (let i = 0; i < 6; i++) rawLines.push(tossLine(rng));

  const primaryLines = rawLines.map(lineValueToYinYang) as [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
  const primary = buildHexagram(primaryLines);

  const changingPositions = rawLines
    .map((v, i) => ({ v, pos: i + 1 }))
    .filter((x) => x.v === 6 || x.v === 9)
    .map((x) => x.pos);

  let changed: HexagramResult | null = null;
  if (changingPositions.length > 0) {
    const changedLines = primaryLines.map((l, i) =>
      rawLines[i] === 6 || rawLines[i] === 9 ? ((l === 1 ? 0 : 1) as 0 | 1) : l,
    ) as [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
    changed = buildHexagram(changedLines);
  }

  return { rawLines, primary, changed, changingPositions };
}
