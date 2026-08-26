// TRẠCH CÁT KỲ MÔN — lớp THẦN SÁT: 12 Kiến Tinh, 12 Trực Thần, và quan hệ địa chi.
//
// Nguồn chính: zhicong-11.md ("Kỳ Môn Mệnh Trạch Nhật" — thầy Đồng Khôn Nguyên), Video 1-4.
// Nguồn đối chiếu độc lập: ky-mon-don-giap-thuc-chien-truong-chan-xuan.md, "Bài giảng thứ năm:
// Kỳ Môn và Chọn Ngày Tốt", mục II — bài ca hoàng đạo/hắc đạo. Hai sách khác tác giả/dịch giả
// nhưng cho cùng danh sách cát/hung, nên phần này độ tin cậy cao.
//
// Trọng số toàn phương pháp (zhicong-11.md Video 5): "Các yếu tố của kỳ môn (70%) - thần sát
// (12 kiến tinh, 12 trực thần) 30%" — file này lo đúng phần 30% đó.

import { CHI_LIST } from "../constants";

/** 12 Kiến Tinh, thứ tự cố định, đi thuận theo 12 địa chi (zhicong-11.md Video 1). */
export const KIEN_TINH_LIST = [
  "Kiến", "Trừ", "Mãn", "Bình", "Định", "Chấp",
  "Phá", "Nguy", "Thành", "Thu", "Khai", "Bế",
] as const;
export type KienTinh = (typeof KIEN_TINH_LIST)[number];

/**
 * 12 Trực Thần (vòng Thanh Long), thứ tự cố định theo khẩu quyết
 * "Đạo Viễn Kỷ Thời Thông Đạt / Lộ Dao Hà Nhật Hoàn Trình" (zhicong-11.md Video 2).
 */
export const TRUC_THAN_LIST = [
  "Thanh Long", "Minh Đường", "Thiên Hình", "Chu Tước", "Kim Quỹ", "Thiên Đức",
  "Bạch Hổ", "Ngọc Đường", "Thiên Lao", "Huyền Vũ", "Tư Mệnh", "Câu Trần",
] as const;
export type TrucThan = (typeof TRUC_THAN_LIST)[number];

/**
 * Hoàng đạo (cát) — zhicong-11.md Video 1: "Trừ - Nguy - Định - Chấp là hoàng đạo cát nhật,
 * Thành - Khai cũng là hoàng đạo (trung cát)". Khớp bài ca ở Trương Chí Xuân: "Trừ Nguy Định
 * Chấp Thành Khai đều tốt lành".
 */
const KIEN_TINH_CAT_CHINH = new Set<string>(["Trừ", "Nguy", "Định", "Chấp"]);
const KIEN_TINH_TRUNG_CAT = new Set<string>(["Thành", "Khai"]);

/** Cát thần trong 12 Trực Thần (zhicong-11.md Video 4 + Video 9 mục 5). */
const TRUC_THAN_CAT = new Set<string>([
  "Thanh Long", "Minh Đường", "Kim Quỹ", "Thiên Đức", "Ngọc Đường", "Tư Mệnh",
]);

/**
 * Bảng tra vị trí khởi Thanh Long theo địa chi tháng sinh (zhicong-11.md Video 4).
 * Đã đối chiếu khớp 100% với ví dụ Video 3 (sinh tháng Thìn → Thanh Long tại Thìn → Thân=Kim
 * Quỹ, Dậu=Thiên Đức, Hợi=Ngọc Đường, Dần=Tư Mệnh).
 */
const KHOI_THANH_LONG: Record<string, string> = {
  Tý: "Thân", Sửu: "Tuất", Dần: "Tý", Mão: "Dần",
  Thìn: "Thìn", Tỵ: "Ngọ", Ngọ: "Thân", Mùi: "Tuất",
  Thân: "Tý", Dậu: "Dần", Tuất: "Thìn", Hợi: "Ngọ",
};

function chiIndex(chi: string): number {
  return CHI_LIST.indexOf(chi as (typeof CHI_LIST)[number]);
}

/**
 * An 12 Kiến Tinh: đặt "Kiến" tại địa chi TRÙNG chi tháng sinh của chủ sự, rồi đi thuận.
 * (zhicong-11.md Video 3: "Sinh tháng Thìn thì từ ô Thìn ta đặt Kiến sau đó an vào 11 vị trí
 * còn lại".)
 */
export function an12KienTinh(chiThangSinh: string): Record<string, KienTinh> {
  const goc = chiIndex(chiThangSinh);
  const out: Record<string, KienTinh> = {};
  if (goc < 0) return out;
  for (let i = 0; i < 12; i++) {
    out[CHI_LIST[(goc + i) % 12]] = KIEN_TINH_LIST[i];
  }
  return out;
}

/**
 * An 12 Trực Thần: tra vị trí khởi Thanh Long theo chi tháng sinh, rồi đi thuận chiều kim
 * đồng hồ theo 12 chi (zhicong-11.md Video 4).
 */
export function an12TrucThan(chiThangSinh: string): Record<string, TrucThan> {
  const chiKhoi = KHOI_THANH_LONG[chiThangSinh];
  const goc = chiKhoi ? chiIndex(chiKhoi) : -1;
  const out: Record<string, TrucThan> = {};
  if (goc < 0) return out;
  for (let i = 0; i < 12; i++) {
    out[CHI_LIST[(goc + i) % 12]] = TRUC_THAN_LIST[i];
  }
  return out;
}

export type MucCat = "cat" | "trung_cat" | "hung";

export function xetKienTinh(k: KienTinh | undefined): MucCat {
  if (!k) return "hung";
  if (KIEN_TINH_CAT_CHINH.has(k)) return "cat";
  if (KIEN_TINH_TRUNG_CAT.has(k)) return "trung_cat";
  return "hung";
}

export function xetTrucThan(t: TrucThan | undefined): MucCat {
  if (!t) return "hung";
  return TRUC_THAN_CAT.has(t) ? "cat" : "hung";
}

// ============================================================================================
// QUAN HỆ ĐỊA CHI — dùng để đối chiếu ngày chọn với tuổi (năm sinh) chủ sự và với toạ sơn.
// zhicong-11.md Video 5 bước 3: "Ngày chọn ra không thể hình xung khắc hại với năm sinh của
// chủ sự"; bước 5: nhập trạch còn phải tránh ngày xung toạ sơn.
// ============================================================================================

const LUC_XUNG: Record<string, string> = {
  Tý: "Ngọ", Ngọ: "Tý", Sửu: "Mùi", Mùi: "Sửu", Dần: "Thân", Thân: "Dần",
  Mão: "Dậu", Dậu: "Mão", Thìn: "Tuất", Tuất: "Thìn", Tỵ: "Hợi", Hợi: "Tỵ",
};

const LUC_HAI: Record<string, string> = {
  Tý: "Mùi", Mùi: "Tý", Sửu: "Ngọ", Ngọ: "Sửu", Dần: "Tỵ", Tỵ: "Dần",
  Mão: "Thìn", Thìn: "Mão", Thân: "Hợi", Hợi: "Thân", Dậu: "Tuất", Tuất: "Dậu",
};

const LUC_PHA: Record<string, string> = {
  Tý: "Dậu", Dậu: "Tý", Ngọ: "Mão", Mão: "Ngọ", Thân: "Tỵ", Tỵ: "Thân",
  Dần: "Hợi", Hợi: "Dần", Thìn: "Sửu", Sửu: "Thìn", Tuất: "Mùi", Mùi: "Tuất",
};

const LUC_HOP: Record<string, string> = {
  Tý: "Sửu", Sửu: "Tý", Dần: "Hợi", Hợi: "Dần", Mão: "Tuất", Tuất: "Mão",
  Thìn: "Dậu", Dậu: "Thìn", Tỵ: "Thân", Thân: "Tỵ", Ngọ: "Mùi", Mùi: "Ngọ",
};

const TAM_HOP: string[][] = [
  ["Thân", "Tý", "Thìn"],
  ["Dần", "Ngọ", "Tuất"],
  ["Tỵ", "Dậu", "Sửu"],
  ["Hợi", "Mão", "Mùi"],
];

/** Tam hình + tự hình (quy tắc cổ truyền phổ thông, dùng nhất quán toàn module). */
const NHOM_TAM_HINH: string[][] = [
  ["Dần", "Tỵ", "Thân"],
  ["Sửu", "Tuất", "Mùi"],
];
const TU_HINH = new Set<string>(["Thìn", "Ngọ", "Dậu", "Hợi"]);
const HINH_TY_MAO: Record<string, string> = { Tý: "Mão", Mão: "Tý" };

export type QuanHeChi = {
  xung: boolean;
  hinh: boolean;
  hai: boolean;
  pha: boolean;
  tamHop: boolean;
  lucHop: boolean;
};

export function quanHeChi(a: string, b: string): QuanHeChi {
  const cungNhomHinh = NHOM_TAM_HINH.some((nhom) => nhom.includes(a) && nhom.includes(b) && a !== b);
  const hinh = cungNhomHinh || HINH_TY_MAO[a] === b || (a === b && TU_HINH.has(a));
  return {
    xung: LUC_XUNG[a] === b,
    hinh,
    hai: LUC_HAI[a] === b,
    pha: LUC_PHA[a] === b,
    tamHop: TAM_HOP.some((nhom) => nhom.includes(a) && nhom.includes(b) && a !== b),
    lucHop: LUC_HOP[a] === b,
  };
}

/** Ngày có phạm hình/xung/hại/phá với tuổi chủ sự không — bước lọc cứng của phương pháp. */
export function phamTuoiChuSu(chiNgay: string, chiNamSinh: string): { pham: boolean; lyDo: string[] } {
  const qh = quanHeChi(chiNgay, chiNamSinh);
  const lyDo: string[] = [];
  if (qh.xung) lyDo.push(`ngày ${chiNgay} xung tuổi ${chiNamSinh}`);
  if (qh.hinh) lyDo.push(`ngày ${chiNgay} hình tuổi ${chiNamSinh}`);
  if (qh.hai) lyDo.push(`ngày ${chiNgay} hại tuổi ${chiNamSinh}`);
  if (qh.pha) lyDo.push(`ngày ${chiNgay} phá tuổi ${chiNamSinh}`);
  return { pham: lyDo.length > 0, lyDo };
}
