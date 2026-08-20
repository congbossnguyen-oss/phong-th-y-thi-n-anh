/**
 * Cổng sang TypeScript của `handoff/knowledge/luan-giai-bat-tu-manh-phai/scripts/engine.py`.
 *
 * CHỈ tính toán KHÁCH QUAN (Thập Thần Can lộ/tàng, Trường Sinh, Hợp/Xung/Hình/Hại/Tam Hợp/Tam Hội,
 * Mộ Khố, Thể/Dụng trong nhà/ngoài nhà, ứng viên xuất xứ) — KHÔNG tự kết luận Tố Công chính, cấu
 * trúc nào "có tạo công", Chính/Phản Cục. Đó là phần AI phán đoán tiếp (SKILL.md bước 3-10), dựa
 * trên bằng chứng có cấu trúc này thay vì tự mò từ Tứ Trụ thô — giúp AI quyết đoán hơn, ít
 * "insufficient_data".
 */
const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CAN_HANH = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];
const CAN_AM_DUONG = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"];

const CHI_TANG_CAN: Record<string, string[]> = {
  "Tý": ["Quý"], "Sửu": ["Kỷ", "Quý", "Tân"], "Dần": ["Giáp", "Bính", "Mậu"], "Mão": ["Ất"],
  "Thìn": ["Mậu", "Ất", "Quý"], "Tị": ["Bính", "Canh", "Mậu"], "Ngọ": ["Đinh", "Kỷ"],
  "Mùi": ["Kỷ", "Đinh", "Ất"], "Thân": ["Canh", "Nhâm", "Mậu"], "Dậu": ["Tân"],
  "Tuất": ["Mậu", "Tân", "Đinh"], "Hợi": ["Nhâm", "Giáp"],
};
const SINH: Record<string, string> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC: Record<string, string> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
const MO_KHO: Record<string, string> = { Mộc: "Mùi", Hỏa: "Tuất", Thổ: "Tuất", Kim: "Sửu", Thủy: "Thìn" };
const TS_START: Record<string, string> = {
  Giáp: "Hợi", Ất: "Ngọ", Bính: "Dần", Đinh: "Dậu", Mậu: "Dần", Kỷ: "Dậu", Canh: "Tị", Tân: "Tý", Nhâm: "Thân", Quý: "Mão",
};
const TS_STAGES = ["Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];

const fset = (arr: string[]) => arr.slice().sort().join("+");
const LUC_HOP: Record<string, string> = { "Sửu+Tý": "Thổ", "Dần+Hợi": "Mộc", "Mão+Tuất": "Hỏa", "Dậu+Thìn": "Kim", "Tị+Thân": "Thủy", "Mùi+Ngọ": "Thổ" };
const LUC_XUNG = [["Tý", "Ngọ"], ["Sửu", "Mùi"], ["Dần", "Thân"], ["Mão", "Dậu"], ["Thìn", "Tuất"], ["Tị", "Hợi"]].map(fset);
const LUC_HAI = [["Tý", "Mùi"], ["Sửu", "Ngọ"], ["Dần", "Tị"], ["Mão", "Thìn"], ["Thân", "Hợi"], ["Dậu", "Tuất"]].map(fset);
const LUC_PHA = [["Tý", "Dậu"], ["Ngọ", "Mão"], ["Thân", "Tị"], ["Dần", "Hợi"], ["Thìn", "Sửu"], ["Tuất", "Mùi"]].map(fset);
const TAM_HINH = [["Dần", "Tị", "Thân"], ["Sửu", "Mùi", "Tuất"]].map(fset);
const TU_HINH = new Set(["Thìn", "Ngọ", "Dậu", "Hợi"]);
const TUONG_HINH = fset(["Tý", "Mão"]);
const TAM_HOP_CUC: Record<string, string[]> = { Thủy: ["Thân", "Tý", "Thìn"], Mộc: ["Hợi", "Mão", "Mùi"], Hỏa: ["Dần", "Ngọ", "Tuất"], Kim: ["Tị", "Dậu", "Sửu"] };
const TAM_HOI_CUC: Record<string, string[]> = { Mộc: ["Dần", "Mão", "Thìn"], Hỏa: ["Tị", "Ngọ", "Mùi"], Kim: ["Thân", "Dậu", "Tuất"], Thủy: ["Hợi", "Tý", "Sửu"] };
const AM_HOP = [["Dần", "Sửu"], ["Hợi", "Ngọ"], ["Mão", "Thân"], ["Tị", "Dậu"], ["Tý", "Tị"]].map(fset);
const NGU_HOP: Record<string, string> = { "Giáp+Kỷ": "Thổ (hoặc Mộc)", "Ất+Canh": "Kim (hoặc Mộc)", "Bính+Tân": "Thủy (hoặc Kim)", "Đinh+Nhâm": "Mộc (hoặc Thủy)", "Mậu+Quý": "Hỏa (hoặc Thổ)" };
const HIEU_SUAT_HOP: Record<string, string> = {
  "Thân+Tị": "Cao nhất", "Dậu+Tị": "Cao nhất", "Mão+Tuất": "Khá cao", "Hợi+Ngọ": "Khá cao (ám hợp)",
  "Mão+Thân": "Khá cao (ám hợp)", "Sửu+Tý": "Trung bình", "Dần+Sửu": "Trung bình (ám hợp)",
  "Dần+Hợi": "Thấp", "Dậu+Thìn": "Thấp", "Mùi+Ngọ": "Thấp", "Mão+Mùi": "Thấp", "Hợi+Mùi": "Thấp",
};
const HIEU_SUAT_XHH: Record<string, string> = {
  "Mùi+Sửu": "Cao nhất (xung)", "Thìn+Tuất": "Cao nhất (xung)", "Sửu+Tuất": "Cao nhất (hình)",
  "Dần+Thân": "Khá cao (xung)", "Tị+Hợi": "Khá cao (xung)", "Tý+Ngọ": "Khá cao (xung)", "Mão+Dậu": "Khá cao (xung)",
  "Sửu+Ngọ": "Cao (hại)", "Tý+Mùi": "Cao (hại)", "Dậu+Tuất": "Thấp (hại)", "Mão+Thìn": "Thấp (hại)",
  "Dần+Tị": "Không có hiệu suất (hại)", "Thân+Hợi": "Không có hiệu suất (hại)",
};
const TRU_NAMES = ["Năm", "Tháng", "Ngày", "Giờ"] as const;
const TRONG_NHA = new Set(["Ngày", "Giờ"]);
const THE_NHOM = new Set(["Chính Ấn", "Thiên Ấn", "Tỷ Kiên", "Kiếp Tài", "Thực Thần", "Thương Quan"]);
const DUNG_NHOM = new Set(["Chính Tài", "Thiên Tài", "Chính Quan", "Thất Sát"]);

function thapThan(nhatCan: string, canKhac: string): string {
  const hanhTa = CAN_HANH[CAN.indexOf(nhatCan)]!;
  const adTa = CAN_AM_DUONG[CAN.indexOf(nhatCan)];
  const hanhKia = CAN_HANH[CAN.indexOf(canKhac)]!;
  const adKia = CAN_AM_DUONG[CAN.indexOf(canKhac)];
  const cungAD = adTa === adKia;
  if (hanhKia === hanhTa) return cungAD ? "Tỷ Kiên" : "Kiếp Tài";
  if (SINH[hanhKia] === hanhTa) return cungAD ? "Thiên Ấn" : "Chính Ấn";
  if (SINH[hanhTa] === hanhKia) return cungAD ? "Thực Thần" : "Thương Quan";
  if (KHAC[hanhTa] === hanhKia) return cungAD ? "Thiên Tài" : "Chính Tài";
  return cungAD ? "Thất Sát" : "Chính Quan";
}
function thapThanTheoHanh(nhatCan: string, hanhKia: string): string {
  const hanhTa = CAN_HANH[CAN.indexOf(nhatCan)]!;
  if (hanhKia === hanhTa) return "Tỷ Kiếp";
  if (SINH[hanhKia] === hanhTa) return "Ấn";
  if (SINH[hanhTa] === hanhKia) return "Thực Thương";
  if (KHAC[hanhTa] === hanhKia) return "Tài";
  return "Quan Sát";
}
function truongSinhTrangThai(nhatCan: string, chi: string): string {
  const startIdx = CHI.indexOf(TS_START[nhatCan]!);
  const chiIdx = CHI.indexOf(chi);
  const isDuong = CAN_AM_DUONG[CAN.indexOf(nhatCan)] === "Dương";
  const offset = isDuong ? ((chiIdx - startIdx) % 12 + 12) % 12 : ((startIdx - chiIdx) % 12 + 12) % 12;
  return TS_STAGES[offset]!;
}

export interface ManhPhaiCalc {
  nhatChu: string;
  theDung: { theTrongNha: number; dungTrongNha: number; theNgoaiNha: number; dungNgoaiNha: number; tongThe: number; tongDung: number };
  quanHe: string[]; // mô tả ngắn gọn từng quan hệ tìm thấy
  moKho: string[];
  ghiChuAI: string;
}

export function tinhToanManhPhai(tt: { nam: { can: string; chi: string }; thang: { can: string; chi: string }; ngay: { can: string; chi: string }; gio: { can: string; chi: string } }): ManhPhaiCalc {
  const tru = { Năm: tt.nam, Tháng: tt.thang, Ngày: tt.ngay, Giờ: tt.gio };
  const nhatCan = tru["Ngày"].can;

  let theTrongNha = 0, dungTrongNha = 0, theNgoaiNha = 0, dungNgoaiNha = 0;
  for (const ten of TRU_NAMES) {
    const { can, chi } = tru[ten];
    const trongNha = TRONG_NHA.has(ten);
    const entries: { tt: string | null }[] = [];
    if (ten !== "Ngày") entries.push({ tt: thapThan(nhatCan, can) });
    for (const tang of CHI_TANG_CAN[chi] ?? []) entries.push({ tt: thapThan(nhatCan, tang) });
    for (const { tt } of entries) {
      if (!tt) continue;
      if (THE_NHOM.has(tt)) trongNha ? theTrongNha++ : theNgoaiNha++;
      else if (DUNG_NHOM.has(tt)) trongNha ? dungTrongNha++ : dungNgoaiNha++;
    }
  }

  const quanHe: string[] = [];
  const chiTheoTru: Record<string, string> = { Năm: tt.nam.chi, Tháng: tt.thang.chi, Ngày: tt.ngay.chi, Giờ: tt.gio.chi };
  const canTheoTru: Record<string, string> = { Năm: tt.nam.can, Tháng: tt.thang.can, Ngày: tt.ngay.can, Giờ: tt.gio.can };
  const tenList = Object.keys(chiTheoTru);

  for (let i = 0; i < tenList.length; i++) for (let j = i + 1; j < tenList.length; j++) {
    const t1 = tenList[i]!, t2 = tenList[j]!;
    const c1 = chiTheoTru[t1]!, c2 = chiTheoTru[t2]!;
    if (c1 === c2) continue;
    const cap = fset([c1, c2]);
    if (LUC_HOP[cap]) quanHe.push(`Lục hợp ${t1}-${t2} (${c1}+${c2}) → hóa khả dĩ ${LUC_HOP[cap]}, hiệu suất: ${HIEU_SUAT_HOP[cap] ?? "chưa xếp hạng"}`);
    if (LUC_XUNG.includes(cap)) quanHe.push(`Lục xung ${t1}-${t2} (${c1}+${c2}), hiệu suất: ${HIEU_SUAT_XHH[cap] ?? "chưa xếp hạng"}`);
    if (LUC_HAI.includes(cap)) quanHe.push(`Lục hại ${t1}-${t2} (${c1}+${c2}), hiệu suất: ${HIEU_SUAT_XHH[cap] ?? "chưa xếp hạng"}`);
    if (LUC_PHA.includes(cap)) quanHe.push(`Lục phá ${t1}-${t2} (${c1}+${c2})`);
    if (AM_HOP.includes(cap)) quanHe.push(`Ám hợp ${t1}-${t2} (${c1}+${c2}), hiệu suất: ${HIEU_SUAT_HOP[cap] ?? "chưa xếp hạng"}`);
    if (cap === TUONG_HINH) quanHe.push(`Tương hình vô lễ ${t1}-${t2} (${c1}+${c2})`);
  }
  for (let i = 0; i < tenList.length; i++) for (let j = i + 1; j < tenList.length; j++) for (let k = j + 1; k < tenList.length; k++) {
    const bo3 = fset([chiTheoTru[tenList[i]!]!, chiTheoTru[tenList[j]!]!, chiTheoTru[tenList[k]!]!]);
    if (TAM_HINH.includes(bo3) && new Set(bo3.split("+")).size === 3) quanHe.push(`Tam hình giữa ${tenList[i]}-${tenList[j]}-${tenList[k]}`);
  }
  for (const chi of TU_HINH) {
    const co = tenList.filter((t) => chiTheoTru[t] === chi);
    if (co.length >= 2) quanHe.push(`Tự hình ${chi} lặp ở ${co.join(", ")}`);
  }
  for (const [hanh, bo3] of Object.entries(TAM_HOP_CUC)) {
    const matched = [...new Set(tenList.map((t) => chiTheoTru[t]!).filter((c) => bo3.includes(c)))].sort((a, b) => bo3.indexOf(a) - bo3.indexOf(b));
    if (matched.length === 3) quanHe.push(`Tam hợp cục ĐỦ (${matched.join("-")}) → ${hanh}`);
    else if (matched.length === 2) quanHe.push(`Bán tam hợp (${matched.join("-")}) → ${hanh}, thiếu ${bo3.find((c) => !matched.includes(c))}`);
  }
  for (const [hanh, bo3] of Object.entries(TAM_HOI_CUC)) {
    const matched = [...new Set(tenList.map((t) => chiTheoTru[t]!).filter((c) => bo3.includes(c)))];
    if (matched.length === 3) quanHe.push(`Tam hội cục ĐỦ (${matched.join("-")}) → ${hanh}`);
  }
  const canList = Object.keys(canTheoTru);
  for (let i = 0; i < canList.length; i++) for (let j = i + 1; j < canList.length; j++) {
    const t1 = canList[i]!, t2 = canList[j]!;
    const c1 = canTheoTru[t1]!, c2 = canTheoTru[t2]!;
    const cap = fset([c1, c2]);
    if (NGU_HOP[cap]) {
      const coNhatChu = c1 === nhatCan || c2 === nhatCan;
      quanHe.push(`Thiên Can Ngũ Hợp ${t1}-${t2} (${c1}+${c2}) → hóa khả dĩ ${NGU_HOP[cap]}${coNhatChu ? " — CÓ Nhật Chủ tham gia: CHỈ LUẬN HỢP, KHÔNG LUẬN HÓA" : ""}`);
    }
  }

  const moKho: string[] = [];
  for (const ten of TRU_NAMES) {
    const chi = tru[ten].chi;
    if (["Thìn", "Tuất", "Sửu", "Mùi"].includes(chi)) {
      for (const [hanh, chiMo] of Object.entries(MO_KHO)) {
        if (chiMo === chi) moKho.push(`${ten} (${chi}) là Mộ Khố của ${hanh} → tương ứng Thập Thần ${thapThanTheoHanh(nhatCan, hanh)}; cần đối chiếu vượng/suy hành này trong cục để biết là Mộ hay Khố.`);
      }
    }
  }

  // Trạng thái Trường Sinh mỗi Chi (bổ sung, không có trong bản gốc list riêng nhưng hữu ích cho AI).
  for (const ten of TRU_NAMES) quanHe.push(`Trường Sinh tại Chi ${ten} (${tru[ten].chi}) so Nhật Chủ ${nhatCan} = "${truongSinhTrangThai(nhatCan, tru[ten].chi)}"`);

  return {
    nhatChu: nhatCan,
    theDung: { theTrongNha, dungTrongNha, theNgoaiNha, dungNgoaiNha, tongThe: theTrongNha + theNgoaiNha, tongDung: dungTrongNha + dungNgoaiNha },
    quanHe,
    moKho,
    ghiChuAI:
      "Đây là dữ liệu KHÁCH QUAN (tính bằng công thức, không phải luận). Bạn (AI) vẫn phải tự phán đoán: " +
      "(1) chọn Tố Công chính trong các ứng viên Thể/Dụng ở trên; (2) xác định 1 quan hệ hợp có THẬT SỰ HÓA " +
      "hay không (nếu Nhật Chủ tham gia hợp thì CHỈ luận Hợp, KHÔNG luận Hóa); (3) Đảng/Thế có 'tạo công' " +
      "hay không; (4) xếp cấu trúc vào 1 trong 5 loại + Chính/Phản Cục — theo đúng tài liệu TRI THỨC bên trên.",
  };
}
