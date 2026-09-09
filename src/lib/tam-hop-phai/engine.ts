/**
 * ENGINE TÍNH TOÁN TAM HỢP PHÁI — port TypeScript 1:1 từ data/engine_reference.py gốc
 * (gói tam-hop-web-module, bản Python đã tự kiểm chứng bằng selftest).
 *
 * Giữ nguyên 100% logic + toàn bộ bảng tra cứu. KHÔNG thêm/bớt/"cải tiến" quy tắc nào, KHÔNG
 * tự làm tròn hay suy diễn giá trị trong bảng (sai 1 ký tự là sai kết quả tư vấn thật).
 *
 * Nguyên tắc "không đoán": thiếu input nào thì in cảnh báo rõ ràng (mảng `canh_bao`), KHÔNG tự
 * chọn đáp án thay. Riêng Bát Sát Huỳnh Tuyền luôn kèm cảnh báo "độ tin cậy TRUNG BÌNH".
 *
 * Bẫy Python→TS đã xử lý:
 *  - Python `%` luôn trả không âm với số chia dương; JS `%` giữ dấu số bị chia → dùng pymod().
 *  - Python round() làm tròn nửa-về-chẵn (banker's); JS Math.round() làm tròn nửa-lên → dùng lamTronChan().
 *  - NAP_GIAP trong bản Python bị khai 2 lần (bản đầu lỗi trùng key "Can"); ở đây CHỈ dùng bản đã sửa.
 *  - Key sơn giữ dạng ASCII đúng như Python (Ty, Quy, ... Can2, Hoi, Nham); hiển thị qua SON_24_DISPLAY.
 *  - Object kết quả dùng key snake_case GIỐNG HỆT dict `out` của Python, để JSON khớp prompt AI.
 */

// ==========================================================================
// HELPER
// ==========================================================================

/** Modulo kiểu Python: luôn trả về [0, m) với m > 0 (JS `%` giữ dấu số bị chia). */
function pymod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

/** Làm tròn nửa-về-chẵn (banker's rounding) giống Python round() — khác Math.round (nửa-lên). */
function lamTronChan(x: number): number {
  const floor = Math.floor(x);
  const phanLe = x - floor;
  if (Math.abs(phanLe - 0.5) < 1e-9) {
    return floor % 2 === 0 ? floor : floor + 1;
  }
  return Math.round(x);
}

// ==========================================================================
// 1. DỮ LIỆU NỀN — 24 SƠN
// ==========================================================================

// 24 sơn theo thứ tự thuận chiều kim đồng hồ, Tý = 0 độ (Bắc), mỗi sơn 15 độ,
// tâm sơn tại index*15, biên mỗi sơn là tâm ±7.5 độ.
export const SON_24 = [
  "Ty", "Quy", "Suu", "Can", "Dan", "Giap", "Mao", "At", "Thin", "Ton",
  "Ti", "Binh", "Ngo", "Dinh", "Mui", "Khon", "Than", "Canh", "Dau",
  "Tan", "Tuat", "Can2", "Hoi", "Nham",
] as const;

export type SonKey = (typeof SON_24)[number];

// Tên hiển thị có dấu (Can2 = Càn, để tránh trùng "Can" = Cấn khi so sánh nội bộ).
export const SON_24_DISPLAY: Record<string, string> = {
  Ty: "Tý", Quy: "Quý", Suu: "Sửu", Can: "Cấn", Dan: "Dần",
  Giap: "Giáp", Mao: "Mão", At: "Ất", Thin: "Thìn", Ton: "Tốn",
  Ti: "Tị", Binh: "Bính", Ngo: "Ngọ", Dinh: "Đinh", Mui: "Mùi",
  Khon: "Khôn", Than: "Thân", Canh: "Canh", Dau: "Dậu",
  Tan: "Tân", Tuat: "Tuất", Can2: "Càn", Hoi: "Hợi", Nham: "Nhâm",
};

export function sonDisplay(sonKey: string): string {
  return SON_24_DISPLAY[sonKey] ?? sonKey;
}

/** Trả về sơn (key nội bộ) ứng với độ số 0-360. */
export function sonTheoDo(deg: number): SonKey {
  const d = pymod(deg, 360);
  const idx = pymod(lamTronChan(d / 15), 24);
  return SON_24[idx]!;
}

/** Sơn đối xứng qua tâm (dùng để suy Tọa từ Hướng và ngược lại). */
export function doiCung(sonKey: string): SonKey {
  const idx = SON_24.indexOf(sonKey as SonKey);
  return SON_24[pymod(idx + 12, 24)]!;
}

// ==========================================================================
// 2. NẠP GIÁP — 8 NHÓM QUÁI, TỊNH ÂM DƯƠNG
// Nguồn: loan-dau-va-24-son.md mục 6 (xác nhận chéo nhiều nguồn, độ tin cậy CAO).
// LƯU Ý: bản Python khai NAP_GIAP 2 lần — đây là bản ĐÃ SỬA (Can = Cấn "CANB", Can2 = Càn "CAN").
// ==========================================================================

export type QuaiKey = "CAN" | "KHAM" | "CANB" | "CHAN" | "TON" | "LY" | "KHON" | "DOAI";
export type AmDuong = "Am" | "Duong";

export const NAP_GIAP: Record<string, { quai: QuaiKey; am_duong: AmDuong }> = {
  Can2: { quai: "CAN", am_duong: "Duong" },   // Càn
  Giap: { quai: "CAN", am_duong: "Duong" },
  Khon: { quai: "KHON", am_duong: "Duong" },
  At: { quai: "KHON", am_duong: "Duong" },
  Nham: { quai: "LY", am_duong: "Duong" },
  Dan: { quai: "LY", am_duong: "Duong" },
  Ngo: { quai: "LY", am_duong: "Duong" },
  Tuat: { quai: "LY", am_duong: "Duong" },
  Quy: { quai: "KHAM", am_duong: "Duong" },
  Than: { quai: "KHAM", am_duong: "Duong" },
  Ty: { quai: "KHAM", am_duong: "Duong" },
  Thin: { quai: "KHAM", am_duong: "Duong" },
  Dinh: { quai: "DOAI", am_duong: "Am" },
  Ti: { quai: "DOAI", am_duong: "Am" },
  Dau: { quai: "DOAI", am_duong: "Am" },
  Suu: { quai: "DOAI", am_duong: "Am" },
  Canh: { quai: "CHAN", am_duong: "Am" },
  Hoi: { quai: "CHAN", am_duong: "Am" },
  Mao: { quai: "CHAN", am_duong: "Am" },
  Mui: { quai: "CHAN", am_duong: "Am" },
  Ton: { quai: "TON", am_duong: "Am" },
  Tan: { quai: "TON", am_duong: "Am" },
  Can: { quai: "CANB", am_duong: "Am" },      // Cấn
  Binh: { quai: "CANB", am_duong: "Am" },
};

export const QUAI_DISPLAY: Record<QuaiKey, string> = {
  CAN: "Càn", KHAM: "Khảm", CANB: "Cấn", CHAN: "Chấn",
  TON: "Tốn", LY: "Ly", KHON: "Khôn", DOAI: "Đoài",
};
export const QUAI_ORDER: QuaiKey[] = ["CAN", "KHAM", "CANB", "CHAN", "TON", "LY", "KHON", "DOAI"];

export function quaiCuaSon(sonKey: string): QuaiKey {
  return NAP_GIAP[sonKey]!.quai;
}

// ==========================================================================
// 3. ĐỊA MẪU CỬU TINH (Địa bàn, dùng cho SA/LONG)
// Nguồn: ảnh Excel gốc của Công (hai-he-cuu-tinh.md phần A) — ĐỘ TIN CẬY CAO NHẤT.
// Hàng = Tọa/Lai Long (quái), Cột = cung cần luận -> tên sao (Du Niên).
// ==========================================================================

export const DIA_MAU_CUU_TINH: Record<QuaiKey, Record<QuaiKey, string>> = {
  CAN: { CAN: "Phuc Vi", KHAM: "Luc Sat", CANB: "Dien Nien", CHAN: "Thien Y", TON: "Ngu Quy", LY: "Tuyet Menh", KHON: "Hoa Hai", DOAI: "Sinh Khi" },
  KHAM: { CAN: "Luc Sat", KHAM: "Phuc Vi", CANB: "Thien Y", CHAN: "Dien Nien", TON: "Sinh Khi", LY: "Hoa Hai", KHON: "Tuyet Menh", DOAI: "Ngu Quy" },
  CANB: { CAN: "Dien Nien", KHAM: "Thien Y", CANB: "Phuc Vi", CHAN: "Luc Sat", TON: "Tuyet Menh", LY: "Ngu Quy", KHON: "Sinh Khi", DOAI: "Hoa Hai" },
  CHAN: { CAN: "Thien Y", KHAM: "Dien Nien", CANB: "Luc Sat", CHAN: "Phuc Vi", TON: "Hoa Hai", LY: "Sinh Khi", KHON: "Ngu Quy", DOAI: "Tuyet Menh" },
  TON: { CAN: "Ngu Quy", KHAM: "Sinh Khi", CANB: "Tuyet Menh", CHAN: "Hoa Hai", TON: "Phuc Vi", LY: "Dien Nien", KHON: "Thien Y", DOAI: "Luc Sat" },
  LY: { CAN: "Tuyet Menh", KHAM: "Hoa Hai", CANB: "Ngu Quy", CHAN: "Sinh Khi", TON: "Dien Nien", LY: "Phuc Vi", KHON: "Luc Sat", DOAI: "Thien Y" },
  KHON: { CAN: "Hoa Hai", KHAM: "Tuyet Menh", CANB: "Sinh Khi", CHAN: "Ngu Quy", TON: "Thien Y", LY: "Luc Sat", KHON: "Phuc Vi", DOAI: "Dien Nien" },
  DOAI: { CAN: "Sinh Khi", KHAM: "Ngu Quy", CANB: "Hoa Hai", CHAN: "Tuyet Menh", TON: "Luc Sat", LY: "Thien Y", KHON: "Dien Nien", DOAI: "Phuc Vi" },
};

// ==========================================================================
// 4. PHỤ TINH PHIÊN QUÁI (Thiên bàn, dùng cho HƯỚNG/THỦY)
// Nguồn: ảnh Excel gốc của Công (hai-he-cuu-tinh.md phần B) — ĐỘ TIN CẬY CAO.
// LƯU Ý: một vài hàng có tên sao lặp lại 2 lần trong cùng hàng (theo đúng bản gốc,
// KHÔNG tự sửa) — xem cảnh báo khi in kết quả.
// ==========================================================================

export const PHU_TINH_PHIEN_QUAI: Record<QuaiKey, Record<QuaiKey, string>> = {
  CAN: { CAN: "Ta Phu", KHAM: "Tham Lang", CANB: "Pha Quan", CHAN: "Loc Ton", TON: "Liem Trinh", LY: "Vu Khuc", KHON: "Tham Lang", DOAI: "Van Khuc" },
  KHAM: { CAN: "Tham Lang", KHAM: "Ta Phu", CANB: "Loc Ton", CHAN: "Pha Quan", TON: "Van Khuc", LY: "Cu Mon", KHON: "Vu Khuc", DOAI: "Liem Trinh" },
  CANB: { CAN: "Pha Quan", KHAM: "Loc Ton", CANB: "Ta Phu", CHAN: "Tham Lang", TON: "Vu Khuc", LY: "Liem Trinh", KHON: "Pha Quan", DOAI: "Cu Mon" },
  CHAN: { CAN: "Loc Ton", KHAM: "Pha Quan", CANB: "Tham Lang", CHAN: "Ta Phu", TON: "Cu Mon", LY: "Van Khuc", KHON: "Van Khuc", DOAI: "Vu Khuc" },
  TON: { CAN: "Liem Trinh", KHAM: "Van Khuc", CANB: "Vu Khuc", CHAN: "Cu Mon", TON: "Ta Phu", LY: "Pha Quan", KHON: "Liem Trinh", DOAI: "Tham Lang" },
  LY: { CAN: "Vu Khuc", KHAM: "Cu Mon", CANB: "Liem Trinh", CHAN: "Van Khuc", TON: "Pha Quan", LY: "Ta Phu", KHON: "Loc Ton", DOAI: "Loc Ton" },
  KHON: { CAN: "Cu Mon", KHAM: "Vu Khuc", CANB: "Van Khuc", CHAN: "Liem Trinh", TON: "Loc Ton", LY: "Tham Lang", KHON: "Ta Phu", DOAI: "Pha Quan" },
  DOAI: { CAN: "Van Khuc", KHAM: "Liem Trinh", CANB: "Cu Mon", CHAN: "Vu Khuc", TON: "Tham Lang", LY: "Loc Ton", KHON: "Cu Mon", DOAI: "Ta Phu" },
};

export type LoaiCatHung = "cat" | "hung";

export const SAO_CAT_HUNG: Record<string, { loai: LoaiCatHung; nhom: string }> = {
  "Phuc Vi": { loai: "cat", nhom: "Phuc Vi" }, "Ta Phu": { loai: "cat", nhom: "Phuc Vi" },
  "Sinh Khi": { loai: "cat", nhom: "Sinh Khi" }, "Tham Lang": { loai: "cat", nhom: "Sinh Khi" },
  "Thien Y": { loai: "cat", nhom: "Thien Y" }, "Cu Mon": { loai: "cat", nhom: "Thien Y" },
  "Dien Nien": { loai: "cat", nhom: "Dien Nien" }, "Vu Khuc": { loai: "cat", nhom: "Dien Nien" },
  "Hoa Hai": { loai: "hung", nhom: "Hoa Hai" }, "Loc Ton": { loai: "hung", nhom: "Hoa Hai" },
  "Luc Sat": { loai: "hung", nhom: "Luc Sat" }, "Van Khuc": { loai: "hung", nhom: "Luc Sat" },
  "Ngu Quy": { loai: "hung", nhom: "Ngu Quy" }, "Liem Trinh": { loai: "hung", nhom: "Ngu Quy" },
  "Tuyet Menh": { loai: "hung", nhom: "Tuyet Menh" }, "Pha Quan": { loai: "hung", nhom: "Tuyet Menh" },
};

export const SAO_DISPLAY: Record<string, string> = {
  "Phuc Vi": "Phục Vị", "Ta Phu": "Tả Phù (Phục Vị)",
  "Sinh Khi": "Sinh Khí", "Tham Lang": "Tham Lang (Sinh Khí)",
  "Thien Y": "Thiên Y", "Cu Mon": "Cự Môn (Thiên Y)",
  "Dien Nien": "Diên Niên", "Vu Khuc": "Vũ Khúc (Diên Niên)",
  "Hoa Hai": "Họa Hại", "Loc Ton": "Lộc Tồn (Họa Hại)",
  "Luc Sat": "Lục Sát", "Van Khuc": "Văn Khúc (Lục Sát)",
  "Ngu Quy": "Ngũ Quỷ", "Liem Trinh": "Liêm Trinh (Ngũ Quỷ)",
  "Tuyet Menh": "Tuyệt Mệnh", "Pha Quan": "Phá Quân (Tuyệt Mệnh)",
};

// ==========================================================================
// 5. BÁT LỘ HOÀNG TUYỀN theo Tứ Đại Đường Cục
// Nguồn: ảnh Excel gốc của Công (bat-sat-bat-lo-hoang-tuyen.md) — ĐỘ TIN CẬY CAO.
// ==========================================================================

export type LongCucKey = "HOA" | "THUY" | "KIM" | "MOC";

export const BAT_LO_HOANG_TUYEN: Record<LongCucKey, { ten: string; huong_pham: string[]; cung_tu: string }> = {
  HOA: { ten: "Tam Hop Tuat Cuc (Hoa cuc)", huong_pham: ["Ton", "Ti"], cung_tu: "Canh, Dau" },
  THUY: { ten: "Tam Hop Thuy Cuc", huong_pham: ["Can2", "Hoi"], cung_tu: "Mao" },
  KIM: { ten: "Tam Hop Kim Cuc", huong_pham: ["Khon", "Than"], cung_tu: "Nham, Ty" },
  MOC: { ten: "Tam Hop Moc Cuc", huong_pham: ["Can", "Dan"], cung_tu: "Binh, Ngo" },
};

// ==========================================================================
// 6. XÁC ĐỊNH LONG CỤC THEO THỦY KHẨU
// Nguồn: PT-Tam-Hop-2020_ocr.md, đối chiếu khẩu quyết Tứ Đại Đường Cục — ĐỘ TIN CẬY CAO.
// ==========================================================================

export const LONG_CUC_THEO_THUY_KHAU: Record<LongCucKey, string[]> = {
  HOA: ["Tan", "Tuat", "Can2", "Hoi", "Nham", "Ty"],
  THUY: ["Thin", "Ton", "Ti", "At", "Binh", "Ngo"],
  KIM: ["Quy", "Suu", "Can", "Dan", "Giap", "Mao"],
  MOC: ["Dinh", "Mui", "Khon", "Than", "Canh", "Dau"],
};
export const LONG_CUC_DISPLAY: Record<LongCucKey, string> = {
  HOA: "Hỏa cục", THUY: "Thủy cục", KIM: "Kim cục", MOC: "Mộc cục",
};

export function xacDinhLongCuc(thuyKhauSon: string): LongCucKey | null {
  for (const cuc of Object.keys(LONG_CUC_THEO_THUY_KHAU) as LongCucKey[]) {
    if (LONG_CUC_THEO_THUY_KHAU[cuc].includes(thuyKhauSon)) return cuc;
  }
  return null;
}

// ==========================================================================
// 7. VÒNG TRƯỜNG SINH 12 CUNG
// Nguồn: tu-dai-thuy-cuc-truong-sinh.md mục 1-2 — ĐỘ TIN CẬY CAO.
// CẢNH BÁO: có 1 dị bản khác về phần nhóm Thai/Suy (xem phuong-phap-luan...md mục 11).
// ==========================================================================

export const CHI_12 = ["Ty", "Suu", "Dan", "Mao", "Thin", "Ti", "Ngo", "Mui", "Than", "Dau", "Tuat", "Hoi"] as const;

export const TRUONG_SINH_KHOI: Record<LongCucKey, string> = { KIM: "Ti", THUY: "Than", MOC: "Hoi", HOA: "Dan" };

export const VONG_TRUONG_SINH_12 = [
  "Truong Sinh", "Moc Duc", "Quan Doi", "Lam Quan", "De Vuong", "Suy",
  "Benh", "Tu", "Mo", "Tuyet", "Thai", "Duong",
] as const;

export const NHOM_TOT_CHINH = new Set(["Truong Sinh", "Moc Duc", "Quan Doi", "Lam Quan", "De Vuong", "Duong"]);
export const NHOM_XAU_CHINH = new Set(["Suy", "Benh", "Tu", "Mo", "Tuyet", "Thai"]);
// Dị bản "Lục Tú" (nguồn Giáo Trình Nhập Môn):
export const NHOM_TOT_LUC_TU = new Set(["Thai", "Duong", "Truong Sinh", "Quan Doi", "Lam Quan", "De Vuong"]);
export const NHOM_XAU_LUC_TU = new Set(["Benh", "Tu", "Mo", "Tuyet"]);
// "Moc Duc" (đào hoa) và "Suy" (trung tính) không nằm trong 2 nhóm trên theo dị bản này.

export const VTS_DISPLAY: Record<string, string> = {
  "Truong Sinh": "Trường Sinh", "Moc Duc": "Mộc Dục", "Quan Doi": "Quan Đới",
  "Lam Quan": "Lâm Quan", "De Vuong": "Đế Vượng", Suy: "Suy", Benh: "Bệnh",
  Tu: "Tử", Mo: "Mộ", Tuyet: "Tuyệt", Thai: "Thai", Duong: "Dưỡng",
};

/**
 * Tra vị trí (tên cung) của 1 chi trên vòng Trường Sinh của 1 Long Cục.
 * chieu='thuan' dùng cho Thủy Pháp (lập hướng); 'nghich' dùng cho luận Sơn.
 */
export function viTriTruongSinh(longCuc: LongCucKey, chi: string, chieu: "thuan" | "nghich" = "thuan"): string {
  const khoiChi = TRUONG_SINH_KHOI[longCuc];
  const khoiIdx = CHI_12.indexOf(khoiChi as (typeof CHI_12)[number]);
  const chiIdx = CHI_12.indexOf(chi as (typeof CHI_12)[number]);
  const offset = chieu === "thuan" ? pymod(chiIdx - khoiIdx, 12) : pymod(khoiIdx - chiIdx, 12);
  return VONG_TRUONG_SINH_12[offset]!;
}

// ==========================================================================
// 8. LẠI CÔNG NGŨ HÀNH (SA PHÁP) — bảng 5x5
// Nguồn: ảnh Excel gốc của Công (sa-phap.md mục 2) — ĐỘ TIN CẬY CAO.
// ==========================================================================

export const NGU_HANH_LIST = ["Kim", "Moc", "Thuy", "Hoa", "Tho"] as const;
export type NguHanh = (typeof NGU_HANH_LIST)[number];

export const LAI_CONG_NGU_HANH: Record<string, Record<NguHanh, NguHanh>> = {
  // quan_he: {toa_ngu_hanh: sa_ngu_hanh_can}
  "Huynh De (Vuong)": { Kim: "Kim", Moc: "Moc", Thuy: "Thuy", Hoa: "Hoa", Tho: "Tho" },
  "Phu Mau (Sinh)": { Kim: "Tho", Moc: "Thuy", Thuy: "Kim", Hoa: "Moc", Tho: "Hoa" },
  "Quan Quy (Sat)": { Kim: "Hoa", Moc: "Kim", Thuy: "Tho", Hoa: "Thuy", Tho: "Moc" },
  "The Tai (No)": { Kim: "Moc", Moc: "Tho", Thuy: "Hoa", Hoa: "Kim", Tho: "Thuy" },
  "Tu Ton (Tiet)": { Kim: "Thuy", Moc: "Hoa", Thuy: "Moc", Hoa: "Tho", Tho: "Kim" },
};

export const QUAN_HE_CAT_HUNG: Record<string, string> = {
  "Huynh De (Vuong)": "cat", "Phu Mau (Sinh)": "cat", "The Tai (No)": "cat",
  "Quan Quy (Sat)": "hung", "Tu Ton (Tiet)": "trung tinh (tiet khi)",
};

/** Tra bảng: với ngũ hành Tọa cho trước, trả về {quan_he: ngũ_hành_Sa_cần}. */
export function saNguHanhCan(toaNguHanh: NguHanh): Record<string, NguHanh> {
  const out: Record<string, NguHanh> = {};
  for (const [qh, bang] of Object.entries(LAI_CONG_NGU_HANH)) {
    out[qh] = bang[toaNguHanh];
  }
  return out;
}

// ==========================================================================
// 9. BÁT SÁT HUỲNH TUYỀN
// Nguồn: sách OCR, tổng hợp — ĐỘ TIN CẬY TRUNG BÌNH (xem cảnh báo trong output).
// ==========================================================================

export const BAT_SAT_CHI: Record<QuaiKey, string> = {
  CAN: "Ngo", DOAI: "Ti", LY: "Hoi", CHAN: "Than",
  TON: "Dau", KHAM: "Thin", CANB: "Dan", KHON: "Mao",
};

// ==========================================================================
// HÀM TỔNG HỢP
// ==========================================================================

const NGU_HANH_QUAI: Record<QuaiKey, NguHanh> = {
  CAN: "Kim", DOAI: "Kim", LY: "Hoa", CHAN: "Moc",
  TON: "Moc", KHAM: "Thuy", CANB: "Tho", KHON: "Tho",
};

export function nguHanhCuaQuai(quai: QuaiKey): NguHanh {
  return NGU_HANH_QUAI[quai];
}

export interface PhuongCatHung {
  sao: string;
  loai: LoaiCatHung;
}

export interface KetQuaTamHop {
  canh_bao: string[];
  huong: { son: string; quai: string; am_duong: AmDuong };
  toa: { son: string; quai: string; am_duong: AmDuong };
  thuy_phap_8_phuong: Record<QuaiKey, PhuongCatHung>;
  lai_thuy_ket_luan?: string;
  khu_thuy_ket_luan?: string;
  sa_phap_8_phuong: Record<QuaiKey, PhuongCatHung>;
  toa_ngu_hanh: NguHanh;
  sa_ngu_hanh_can_theo_quan_he: Record<string, NguHanh>;
  long_cuc?: string;
  bat_lo_hoang_tuyen?: {
    ten_cuc: string;
    huong_cam_mo_cua_cong_ho_nuoc: string[];
    cung_tu_neu_pham: string;
  };
  lai_thuy_truong_sinh?: string;
  khu_thuy_truong_sinh?: string;
  bat_sat_huynh_tuyen: { da_kiem_tra: boolean; ket_qua?: string[] };
}

export interface ThamSoPhanTich {
  thuyKhau?: string | null;
  giangLong?: string | null;
  giangKhi?: string | null;
  laiThuy?: string | null;
  khuThuy?: string | null;
  /** Tự nhập ngũ hành Tọa thay vì suy từ quái (tùy chọn). */
  toaNguHanhOverride?: NguHanh | null;
}

/**
 * @param huongDeg độ số của Hướng nhà (0-360)
 * Các tham số còn lại là tên sơn (key SON_24), tùy chọn — xem ThamSoPhanTich.
 */
export function phanTich(huongDeg: number, thamSo: ThamSoPhanTich = {}): KetQuaTamHop {
  const { thuyKhau = null, giangLong = null, giangKhi = null, laiThuy = null, khuThuy = null, toaNguHanhOverride = null } = thamSo;

  const canhBao: string[] = [];

  const huongSon = sonTheoDo(huongDeg);
  const toaSon = doiCung(huongSon);
  const huongQuai = quaiCuaSon(huongSon);
  const toaQuai = quaiCuaSon(toaSon);

  const out: KetQuaTamHop = {
    canh_bao: canhBao,
    huong: { son: sonDisplay(huongSon), quai: QUAI_DISPLAY[huongQuai], am_duong: NAP_GIAP[huongSon]!.am_duong },
    toa: { son: sonDisplay(toaSon), quai: QUAI_DISPLAY[toaQuai], am_duong: NAP_GIAP[toaSon]!.am_duong },
    thuy_phap_8_phuong: {} as Record<QuaiKey, PhuongCatHung>,
    sa_phap_8_phuong: {} as Record<QuaiKey, PhuongCatHung>,
    toa_ngu_hanh: "Kim",
    sa_ngu_hanh_can_theo_quan_he: {},
    bat_sat_huynh_tuyen: { da_kiem_tra: false },
  };

  // ---- Bước 5: Thủy Pháp - Phụ Tinh Phiên Quái theo Hướng ----
  for (const cungQuai of QUAI_ORDER) {
    const sao = PHU_TINH_PHIEN_QUAI[huongQuai][cungQuai];
    out.thuy_phap_8_phuong[cungQuai] = { sao: SAO_DISPLAY[sao]!, loai: SAO_CAT_HUNG[sao]!.loai };
  }
  // Cảnh báo nếu hàng Phụ Tinh Phiên Quái của Hướng có 2 cung trùng tên sao (giữ nguyên bản gốc).
  let coTrung = false;
  for (let i = 0; i < QUAI_ORDER.length; i++) {
    for (let j = i + 1; j < QUAI_ORDER.length; j++) {
      if (PHU_TINH_PHIEN_QUAI[huongQuai][QUAI_ORDER[i]!] === PHU_TINH_PHIEN_QUAI[huongQuai][QUAI_ORDER[j]!]) {
        coTrung = true;
      }
    }
  }
  if (coTrung) {
    canhBao.push(
      `Hàng '${QUAI_DISPLAY[huongQuai]}' trong bảng Phụ Tinh Phiên Quái gốc có 2 cung trùng tên sao ` +
        `(giữ nguyên theo bản gốc, xem hai-he-cuu-tinh.md).`,
    );
  }

  if (laiThuy) {
    const q = quaiCuaSon(laiThuy);
    const info = out.thuy_phap_8_phuong[q];
    out.lai_thuy_ket_luan =
      `Lai thủy tại ${sonDisplay(laiThuy)} (quái ${QUAI_DISPLAY[q]}) ` +
      `= sao ${info.sao} (${info.loai === "cat" ? "CÁT — hợp lệ" : "HUNG — bất lợi, nước không nên đến đây"})`;
  }
  if (khuThuy) {
    const q = quaiCuaSon(khuThuy);
    const info = out.thuy_phap_8_phuong[q];
    out.khu_thuy_ket_luan =
      `Khứ thủy tại ${sonDisplay(khuThuy)} (quái ${QUAI_DISPLAY[q]}) ` +
      `= sao ${info.sao} (${info.loai === "cat" ? "HUNG — nước ra chỗ cát, mất lợi" : "phù hợp — nước ra đúng chỗ hung, tốt"})`;
  }

  // ---- Bước 6: Sa Pháp - Địa Mẫu Cửu Tinh theo Tọa ----
  for (const cungQuai of QUAI_ORDER) {
    const sao = DIA_MAU_CUU_TINH[toaQuai][cungQuai];
    out.sa_phap_8_phuong[cungQuai] = { sao: SAO_DISPLAY[sao]!, loai: SAO_CAT_HUNG[sao]!.loai };
  }

  const toaNguHanh = toaNguHanhOverride ?? nguHanhCuaQuai(toaQuai);
  out.toa_ngu_hanh = toaNguHanh;
  out.sa_ngu_hanh_can_theo_quan_he = saNguHanhCan(toaNguHanh);

  // ---- Bước 3: Bát Lộ Hoàng Tuyền (cần thuy_khau để biết Long Cục) ----
  let longCuc: LongCucKey | null = null;
  if (thuyKhau) {
    longCuc = xacDinhLongCuc(thuyKhau);
    if (longCuc === null) {
      canhBao.push(`Không xác định được Long Cục từ thủy khẩu '${sonDisplay(thuyKhau)}'.`);
    } else {
      out.long_cuc = LONG_CUC_DISPLAY[longCuc];
      const blht = BAT_LO_HOANG_TUYEN[longCuc];
      out.bat_lo_hoang_tuyen = {
        ten_cuc: blht.ten,
        huong_cam_mo_cua_cong_ho_nuoc: blht.huong_pham.map((s) => sonDisplay(s)),
        cung_tu_neu_pham: blht.cung_tu,
      };
      if (blht.huong_pham.includes(huongSon)) {
        canhBao.push(
          "⚠️ HƯỚNG NHÀ TRÙNG PHƯƠNG CẤM BÁT LỘ HOÀNG TUYỀN của chính Long Cục này — " +
            "cần xem lại toàn bộ phương án.",
        );
      }
      if (khuThuy && blht.huong_pham.includes(khuThuy)) {
        canhBao.push(
          `⚠️ PHẠM BÁT LỘ HOÀNG TUYỀN: khứ thủy tại ${sonDisplay(khuThuy)} ` +
            `trùng phương cấm của ${blht.ten}. Cung dễ sinh bệnh tật: ${blht.cung_tu}.`,
        );
      }

      // ---- Bước 4: Vị trí Trường Sinh của lai/khứ thủy ----
      if (laiThuy) {
        const chi = (CHI_12 as readonly string[]).includes(laiThuy) ? laiThuy : null;
        if (chi) {
          const vt = viTriTruongSinh(longCuc, chi, "thuan");
          const tot = NHOM_TOT_CHINH.has(vt);
          out.lai_thuy_truong_sinh =
            `${sonDisplay(laiThuy)} = cung ${VTS_DISPLAY[vt]} trên vòng Trường Sinh ` +
            `(${tot ? "nhóm TỐT" : "nhóm XẤU"} theo bảng chính — ` +
            `đối chiếu thêm dị bản Lục Tú nếu cung là Thai/Suy/Mộc Dục)`;
        } else {
          canhBao.push(
            `'${sonDisplay(laiThuy)}' không phải 1 trong 12 Địa Chi — ` +
              "Vòng Trường Sinh chỉ tính theo Địa Chi, không áp dụng cho Thiên Can/Tứ Duy.",
          );
        }
      }
      if (khuThuy) {
        const chi = (CHI_12 as readonly string[]).includes(khuThuy) ? khuThuy : null;
        if (chi) {
          const vt = viTriTruongSinh(longCuc, chi, "thuan");
          const tot = NHOM_TOT_CHINH.has(vt);
          out.khu_thuy_truong_sinh =
            `${sonDisplay(khuThuy)} = cung ${VTS_DISPLAY[vt]} trên vòng Trường Sinh ` +
            `(${!tot ? "nên là nơi khứ (Mộ/Suy/Bệnh/Tử/Mộ/Tuyệt) — hợp lệ" : "CẢNH BÁO: khứ thủy đang rơi vào cung tốt, mất lợi"})`;
        }
      }
    }
  }

  // ---- Bát Sát Huỳnh Tuyền (cần giang_long / giang_khi) ----
  if (giangLong || giangKhi) {
    out.bat_sat_huynh_tuyen.da_kiem_tra = true;
    canhBao.push(
      "Cơ chế Bát Sát Huỳnh Tuyền (2 trường hợp Hướng khắc Giáng Long / Giáng Khí khắc Tọa) " +
        "được tổng hợp từ nhiều nguồn OCR — độ tin cậy TRUNG BÌNH, Công tự đối chiếu lại kết quả dưới đây.",
    );
    const ketQua: string[] = [];
    if (giangLong) {
      const qLong = quaiCuaSon(giangLong);
      const satChi = BAT_SAT_CHI[qLong];
      if (huongSon === satChi) {
        ketQua.push(
          `⚠️ PHẠM (TH1): Giáng Long tại quái ${QUAI_DISPLAY[qLong]} có Sát Chi = ` +
            `${sonDisplay(satChi)}, trùng đúng Hướng nhà hiện tại.`,
        );
      } else {
        ketQua.push(
          `Không phạm TH1 — Giáng Long quái ${QUAI_DISPLAY[qLong]} có Sát Chi ` +
            `${sonDisplay(satChi)}, khác Hướng nhà (${sonDisplay(huongSon)}).`,
        );
      }
    }
    if (giangKhi) {
      const satChiToa = BAT_SAT_CHI[toaQuai];
      if (giangKhi === satChiToa) {
        ketQua.push(
          `⚠️ PHẠM (TH2): Tọa nhà quái ${QUAI_DISPLAY[toaQuai]} có Sát Chi = ` +
            `${sonDisplay(satChiToa)}, trùng đúng phương Giáng Khí quan sát được.`,
        );
      } else {
        ketQua.push(
          `Không phạm TH2 — Tọa quái ${QUAI_DISPLAY[toaQuai]} có Sát Chi ` +
            `${sonDisplay(satChiToa)}, khác Giáng Khí (${sonDisplay(giangKhi)}).`,
        );
      }
    }
    out.bat_sat_huynh_tuyen.ket_qua = ketQua;
  } else {
    canhBao.push(
      "Chưa nhập Giáng Long/Giáng Khí — KHÔNG kiểm tra được Bát Sát Huỳnh Tuyền. " +
        "Đây là bước sàng lọc bắt buộc trước khi kết luận, cần khảo sát thực địa.",
    );
  }

  if (!thuyKhau) {
    canhBao.push(
      "Chưa nhập Thủy Khẩu — KHÔNG xác định được Long Cục, do đó KHÔNG tính được " +
        "Bát Lộ Hoàng Tuyền theo cục, và KHÔNG tính được vị trí Trường Sinh của lai/khứ thủy.",
    );
  }

  return out;
}

/**
 * Chuẩn hóa tên sơn do người dùng nhập (có dấu hoặc không dấu) về key nội bộ SON_24.
 * Trả về null nếu chuỗi rỗng; ném lỗi nếu không nhận diện được.
 */
export function chuanHoaSon(s: string | null | undefined): SonKey | null {
  if (s === null || s === undefined) return null;
  const sNorm = s.trim();
  if (sNorm === "") return null;
  for (const key of SON_24) {
    const disp = SON_24_DISPLAY[key] ?? key;
    if (sNorm.toLowerCase() === key.toLowerCase() || sNorm.toLowerCase() === disp.toLowerCase()) {
      return key;
    }
  }
  throw new Error(`Không nhận diện được sơn '${s}'.`);
}
