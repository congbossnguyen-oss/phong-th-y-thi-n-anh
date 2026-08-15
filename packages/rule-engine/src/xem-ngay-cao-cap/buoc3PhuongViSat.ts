/**
 * XEM NGÀY CAO CẤP — Bước 3: kiểm phương vị sát (bộ lọc phủ quyết, early-exit). Phạm bất kỳ mục
 * nào ở Tọa HOẶC Hướng → loại ngay, KHÔNG có phép hóa giải (khác thần sát dân gian ở Bước 1 —
 * bước đó đã bị bỏ khỏi module web này theo quyết định thu hẹp phạm vi).
 *
 * Nguồn: SKILL.md Bước 3 (Tam Sát/Bát Sát/Thái Tuế/Tuế Phá bảng đơn giản) +
 * thai-tue-sat-mo-rong.md mục 2,4 (Mậu Kỷ Đô Thiên, Âm Phủ Thái Tuế — 2 trong 4 sát mở rộng mà
 * đặc tả module giữ lại; KHÔNG đưa Mộ Long Biến Vận và Tam Kỳ vào vì đặc tả không liệt kê 2 mục
 * đó trong bảng Bước 3). Ngũ Hoàng dùng file data/cuuCungNamThang.ts (tra bảng thật, không tính
 * công thức phi tinh).
 */
import type { Data } from "@thien-anh/calendar-core";
import { CUU_CUNG_NAM_THANG } from "./data/cuuCungNamThang.js";
import { traCanChi } from "./data/bang60GiapTy.js";
import { cungCuaSon, phuongTuSon, GRID_COT_THEO_CUNG, type TenSon, type PhuongChinh, type CungBatQuai } from "./data/sonBatQuai.js";

type Can = Data.Can;
type Chi = Data.Chi;

const CHI_12: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const LUC_XUNG: Readonly<Record<Chi, Chi>> = {
  Tý: "Ngọ", Sửu: "Mùi", Dần: "Thân", Mão: "Dậu", Thìn: "Tuất", Tỵ: "Hợi",
  Ngọ: "Tý", Mùi: "Sửu", Thân: "Dần", Dậu: "Mão", Tuất: "Thìn", Hợi: "Tỵ",
};

// ---------------------------------------------------------------------------------------------
// Ngũ Hoàng — tra bảng CUU_CUNG_NAM_THANG thật.
// ---------------------------------------------------------------------------------------------

const GRID_KEYS = ["DN", "N", "TN", "D", "TT", "T", "DB", "B", "TB"] as const;
type GridKey = (typeof GRID_KEYS)[number];

const CUNG_THEO_GRID_COT: Partial<Record<GridKey, CungBatQuai>> = {};
for (const [cung, cot] of Object.entries(GRID_COT_THEO_CUNG) as [CungBatQuai, GridKey][]) {
  CUNG_THEO_GRID_COT[cot] = cung;
}

export type KetQuaTraNguHoang =
  | { tinhDuocKhong: true; cungNguHoang: CungBatQuai | "Trung" }
  | { tinhDuocKhong: false; lyDo: string };

/** Tra Ngũ Hoàng cho 1 NĂM dương lịch (khối `laKhoiNam=true`). */
export function traNguHoangNam(namDuongLich: number): KetQuaTraNguHoang {
  const row = CUU_CUNG_NAM_THANG.find((r) => r.nam === namDuongLich && r.laKhoiNam);
  if (!row) {
    return {
      tinhDuocKhong: false,
      lyDo: `Không có dữ liệu Cửu Cung cho năm ${namDuongLich} (bảng phủ 1968-2068).`,
    };
  }
  if (row.grid.TT === 5) return { tinhDuocKhong: true, cungNguHoang: "Trung" };
  const cot = GRID_KEYS.find((k) => k !== "TT" && row.grid[k] === 5);
  if (!cot) return { tinhDuocKhong: false, lyDo: `Dữ liệu năm ${namDuongLich} không có ô nào = 5 (bất thường, cần kiểm lại nguồn).` };
  return { tinhDuocKhong: true, cungNguHoang: CUNG_THEO_GRID_COT[cot]! };
}

/**
 * Tra Ngũ Hoàng cho 1 THÁNG âm lịch, xác định bằng cách đối chiếu HKNH/Quái Vận tính độc lập từ
 * Can Chi tháng (qua bang60GiapTy) với các khối tháng trong năm đó — KHÔNG dùng cột
 * can_file_goc/chi_file_goc của CSV gốc (đã xác nhận không đáng tin, xem cach-dung.md).
 */
export function traNguHoangThang(namDuongLich: number, canThang: Can, chiThang: Chi): KetQuaTraNguHoang {
  const ungVien = traCanChi(canThang, chiThang);
  const khoiThang = CUU_CUNG_NAM_THANG.filter((r) => r.nam === namDuongLich && !r.laKhoiNam);
  if (khoiThang.length === 0) {
    return {
      tinhDuocKhong: false,
      lyDo: `Không có dữ liệu Cửu Cung cho năm ${namDuongLich} (bảng phủ 1968-2068).`,
    };
  }
  const row = khoiThang.find((r) => ungVien.some((u) => u.hknh === r.hknh && u.quaiVan === r.quaiVan));
  if (!row) {
    return {
      tinhDuocKhong: false,
      lyDo: `Không đối chiếu được khối tháng ${canThang} ${chiThang} trong dữ liệu Cửu Cung năm ${namDuongLich}.`,
    };
  }
  if (row.grid.TT === 5) return { tinhDuocKhong: true, cungNguHoang: "Trung" };
  const cot = GRID_KEYS.find((k) => k !== "TT" && row.grid[k] === 5);
  if (!cot) return { tinhDuocKhong: false, lyDo: `Dữ liệu tháng ${canThang} ${chiThang} năm ${namDuongLich} không có ô nào = 5.` };
  return { tinhDuocKhong: true, cungNguHoang: CUNG_THEO_GRID_COT[cot]! };
}

// ---------------------------------------------------------------------------------------------
// Tam Sát — tra trực tiếp theo phương của Tọa (SKILL.md Bước 3, không cần quy đổi tam hợp).
// ---------------------------------------------------------------------------------------------

const TAM_SAT_KY_CHI_THEO_PHUONG: Readonly<Record<PhuongChinh, readonly Chi[]>> = {
  Nam: ["Thân", "Tý", "Thìn"],
  Tây: ["Hợi", "Mão", "Mùi"],
  Bắc: ["Dần", "Ngọ", "Tuất"],
  Đông: ["Tỵ", "Dậu", "Sửu"],
};

export function phamTamSat(phuongToaHoacHuong: PhuongChinh, chiTru: Chi): boolean {
  return TAM_SAT_KY_CHI_THEO_PHUONG[phuongToaHoacHuong].includes(chiTru);
}

// ---------------------------------------------------------------------------------------------
// Bát Sát Hoàng Tuyền — theo cung của Tọa, 1-2 Can Chi kỵ riêng mỗi cung.
// ---------------------------------------------------------------------------------------------

const BAT_SAT_KY_THEO_CUNG: Readonly<Record<CungBatQuai, readonly `${Can} ${Chi}`[]>> = {
  Khảm: ["Quý Tỵ", "Quý Hợi"],
  Cấn: ["Quý Hợi"],
  Chấn: ["Quý Sửu"],
  Tốn: ["Quý Sửu"],
  Ly: ["Ất Mùi"],
  Khôn: ["Kỷ Dậu"],
  Đoài: ["Ất Mão"],
  Càn: ["Tân Tỵ"],
};

export function phamBatSat(cungToaHoacHuong: CungBatQuai, canTru: Can, chiTru: Chi): boolean {
  return BAT_SAT_KY_THEO_CUNG[cungToaHoacHuong].includes(`${canTru} ${chiTru}`);
}

// ---------------------------------------------------------------------------------------------
// Thái Tuế / Tuế Phá — chỉ áp dụng khi Tọa/Hướng là 1 trong 12 sơn Chi (sơn Can/sơn Quái miễn nhiễm).
// ---------------------------------------------------------------------------------------------

export function phamThaiTue(tenSon: TenSon, chiNam: Chi): boolean {
  return (CHI_12 as readonly TenSon[]).includes(tenSon) && tenSon === chiNam;
}

export function phamTuePha(tenSon: TenSon, chiNam: Chi): boolean {
  return (CHI_12 as readonly TenSon[]).includes(tenSon) && tenSon === LUC_XUNG[chiNam];
}

// ---------------------------------------------------------------------------------------------
// Mậu Kỷ Đô Thiên Sát — thai-tue-sat-mo-rong.md mục 2. Theo cặp Can năm hợp.
// ---------------------------------------------------------------------------------------------

interface DoThienEntry {
  cap: readonly [Can, Can];
  mauChi: Chi;
  kyChi: Chi;
  bangSon: TenSon;
}

const MAU_KY_DO_THIEN: readonly DoThienEntry[] = [
  { cap: ["Giáp", "Kỷ"], mauChi: "Thìn", kyChi: "Tỵ", bangSon: "Tốn" },
  { cap: ["Ất", "Canh"], mauChi: "Dần", kyChi: "Mão", bangSon: "Giáp" },
  { cap: ["Bính", "Tân"], mauChi: "Tuất", kyChi: "Hợi", bangSon: "Càn" },
  { cap: ["Đinh", "Nhâm"], mauChi: "Thân", kyChi: "Dậu", bangSon: "Canh" },
  { cap: ["Mậu", "Quý"], mauChi: "Ngọ", kyChi: "Mùi", bangSon: "Đinh" },
];

function timDoThienEntry(canNam: Can): DoThienEntry {
  const found = MAU_KY_DO_THIEN.find((e) => (e.cap as readonly Can[]).includes(canNam));
  if (!found) throw new Error(`Không xác định được cặp Can hợp cho Can năm ${canNam}.`);
  return found;
}

export interface KetQuaMauKyDoThien {
  phamMau: boolean;
  phamKy: boolean;
  phamBang: boolean;
}

/** `tenSon` là Tọa hoặc Hướng đang xét; `chiThangDeXet` truyền vào nếu muốn xét cả Tháng (ảnh hưởng nặng hơn theo nguồn). */
export function kiemMauKyDoThien(canNam: Can, tenSon: TenSon): KetQuaMauKyDoThien {
  const e = timDoThienEntry(canNam);
  return {
    phamMau: tenSon === e.mauChi,
    phamKy: tenSon === e.kyChi,
    phamBang: tenSon === e.bangSon,
  };
}

// ---------------------------------------------------------------------------------------------
// Âm Phủ Thái Tuế — thai-tue-sat-mo-rong.md mục 4. Theo cặp Can năm hợp, mỗi cặp cho 1 tập sơn
// Chính Âm Phủ + 1 tập sơn Bàng Âm Phủ.
// ---------------------------------------------------------------------------------------------

interface AmPhuEntry {
  cap: readonly [Can, Can];
  chinh: readonly TenSon[];
  bang: readonly TenSon[];
}

const AM_PHU_THAI_TUE: readonly AmPhuEntry[] = [
  { cap: ["Giáp", "Kỷ"], chinh: ["Cấn", "Tốn"], bang: ["Bính", "Tân"] },
  { cap: ["Ất", "Canh"], chinh: ["Tỵ", "Dậu", "Sửu", "Càn"], bang: ["Đinh", "Nhâm"] },
  { cap: ["Bính", "Tân"], chinh: ["Thân", "Tý", "Thìn", "Khôn"], bang: ["Mậu", "Quý"] },
  { cap: ["Đinh", "Nhâm"], chinh: ["Dần", "Ngọ", "Tuất", "Càn"], bang: ["Giáp", "Kỷ"] },
  { cap: ["Mậu", "Quý"], chinh: ["Khôn", "Hợi", "Mão", "Mùi"], bang: ["Ất", "Canh"] },
];

function timAmPhuEntry(canNam: Can): AmPhuEntry {
  const found = AM_PHU_THAI_TUE.find((e) => (e.cap as readonly Can[]).includes(canNam));
  if (!found) throw new Error(`Không xác định được cặp Can hợp cho Can năm ${canNam}.`);
  return found;
}

export interface KetQuaAmPhuThaiTue {
  phamChinh: boolean;
  phamBang: boolean;
}

export function kiemAmPhuThaiTue(canNam: Can, tenSon: TenSon): KetQuaAmPhuThaiTue {
  const e = timAmPhuEntry(canNam);
  return {
    phamChinh: (e.chinh as readonly TenSon[]).includes(tenSon),
    phamBang: (e.bang as readonly TenSon[]).includes(tenSon),
  };
}

export { cungCuaSon, phuongTuSon };
