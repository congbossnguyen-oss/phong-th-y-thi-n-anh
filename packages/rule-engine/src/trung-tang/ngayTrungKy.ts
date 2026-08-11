/**
 * TRÙNG TANG — Bước 3: các loại ngày trùng kỵ theo Can Chi (nguồn Chương 5, 6 §4-9, 7, 8 mục
 * VIII của "Sổ Tay Tang Sự"). Xếp theo độ tin cậy giảm dần:
 *
 * 1. Trùng nhật (ngày Tỵ/Hợi) — "cơ sở lý luận vững nhất trong cả sách" (Hiệp Kỷ Biện Phương Thư).
 * 2. Phục nhật (Can ngày = Can phục theo tháng) — "vững thứ hai", tự suy ra được từ quy luật.
 * 3. Kiếp Sát — nặng nhưng rất hiếm gặp, 1 dòng bảng gốc bị OCR mất chữ đã phục hồi theo quy
 *    luật Kiếp Sát cổ truyền, độ tin cậy cao nhưng nên đối chiếu.
 * 4. Thần Trùng — sách xếp "đáng sợ nhất" nhưng có 2 điểm tên gọi khả nghi (đã ghi chú).
 *
 * ⚠️ 3 loại "Trùng Tang nhật / Phục Tang nhật / Tam Tang nhật" CHÍNH TÁC GIẢ SÁCH (Chương 7)
 * phản biện là sai nguyên lý và bị Hiệp Kỷ Biện Phương Thư loại bỏ — KHÔNG đưa vào module này
 * làm căn cứ kết luận, theo đúng "Kết luận vận dụng" của skill nguồn.
 */
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

/** Chi tháng âm lịch cố định (tháng 1 = Dần ... tháng 12 = Sửu) — dùng riêng cho Bước 3, KHÁC với cung tháng đếm tay ở Bước 1. */
export const CHI_THANG_CO_DINH: readonly Chi[] = ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"];

/** Can Phục Nhật theo tháng âm lịch (tháng 1-12). */
export const CAN_PHUC_NHAT_THEO_THANG: readonly Can[] = ["Giáp", "Ất", "Mậu", "Bính", "Đinh", "Kỷ", "Canh", "Tân", "Mậu", "Nhâm", "Quý", "Kỷ"];

export function getChiThangCoDinh(thangAmLich: number): Chi {
  return CHI_THANG_CO_DINH[thangAmLich - 1]!;
}

/** Trùng nhật — ngày Tỵ hoặc Hợi, mọi tháng. Đáng tin nhất. */
export function isTrungNhat(chiNgay: Chi): boolean {
  return chiNgay === "Tỵ" || chiNgay === "Hợi";
}

/** Phục nhật — Can ngày trùng Can Phục Nhật của tháng. Đáng tin thứ hai. */
export function isPhucNhat(canNgay: Can, thangAmLich: number): boolean {
  return canNgay === CAN_PHUC_NHAT_THEO_THANG[thangAmLich - 1];
}

/** Nhóm Tam Hợp (dùng để tra Kiếp Sát theo tuổi vong) — Thân-Tý-Thìn / Dần-Ngọ-Tuất / Tỵ-Dậu-Sửu / Hợi-Mão-Mùi. */
const TAM_HOP_NHOM: readonly (readonly [Chi, Chi, Chi])[] = [
  ["Thân", "Tý", "Thìn"],
  ["Dần", "Ngọ", "Tuất"],
  ["Tỵ", "Dậu", "Sửu"],
  ["Hợi", "Mão", "Mùi"],
];
/** Chi kỵ Kiếp Sát tương ứng từng nhóm tam hợp ở trên (cùng thứ tự index). */
const KIEP_SAT_KY_CHI: readonly Chi[] = ["Tỵ", "Hợi", "Dần", "Thân"];

/** Chi kỵ Kiếp Sát theo tam hợp tuổi (Chi năm sinh) của vong. */
export function getKiepSatKyChi(chiTuoiVong: Chi): Chi {
  const idx = TAM_HOP_NHOM.findIndex((nhom) => (nhom as readonly Chi[]).includes(chiTuoiVong));
  return KIEP_SAT_KY_CHI[idx]!;
}

/** Kiểm tra 1 Chi (năm/tháng/ngày/giờ mất) có phạm Kiếp Sát theo tuổi vong hay không. */
export function isKiepSat(chiTuoiVong: Chi, chiKiemTra: Chi): boolean {
  return getKiepSatKyChi(chiTuoiVong) === chiKiemTra;
}

export interface ThanTrungEntry {
  thangs: readonly number[];
  can: Can;
  chiCap: readonly [Chi, Chi];
  ten: string;
}

/** Bảng Thần Trùng theo tháng âm lịch — sách xếp là loại đáng sợ nhất. */
export const THAN_TRUNG_BANG: readonly ThanTrungEntry[] = [
  { thangs: [1, 2, 6, 9, 12], can: "Canh", chiCap: ["Dần", "Thân"], ten: "Lục Canh Thiên Hình" },
  { thangs: [3], can: "Tân", chiCap: ["Tỵ", "Hợi"], ten: "Lục Tân Thiên Đình" },
  { thangs: [4], can: "Nhâm", chiCap: ["Dần", "Thân"], ten: "Lục Nhâm Thiên Lao" },
  { thangs: [5], can: "Quý", chiCap: ["Tỵ", "Hợi"], ten: "Lục Quý Thiên Ngục" },
  { thangs: [7], can: "Giáp", chiCap: ["Dần", "Thân"], ten: "Lục Giáp Thiên Phúc" },
  { thangs: [8], can: "Ất", chiCap: ["Tỵ", "Hợi"], ten: "Lục Ất Thiên Đức" },
  { thangs: [10], can: "Bính", chiCap: ["Dần", "Thân"], ten: "Lục Bính Thiên Uy" },
  { thangs: [11], can: "Đinh", chiCap: ["Tỵ", "Hợi"], ten: "Lục Đinh Thiên Âm" },
];

/** Kiểm tra ngày mất (Can + Chi) có phạm Thần Trùng theo tháng âm lịch hay không — trả về entry nếu phạm, null nếu không. */
export function checkThanTrung(thangAmLich: number, canNgay: Can, chiNgay: Chi): ThanTrungEntry | null {
  const entry = THAN_TRUNG_BANG.find((e) => e.thangs.includes(thangAmLich));
  if (!entry) return null;
  if (entry.can === canNgay && (entry.chiCap as readonly Chi[]).includes(chiNgay)) return entry;
  return null;
}

export interface NgayTrungKyKetQua {
  trungNhat: boolean;
  phucNhat: boolean;
  kiepSat: boolean;
  thanTrung: ThanTrungEntry | null;
}

/** Chạy đủ 4 phép tra Bước 3 cho ngày mất. `chiTuoiVong` = Chi năm sinh của vong (dùng cho Kiếp Sát). */
export function tinhNgayTrungKy(canNgayMat: Can, chiNgayMat: Chi, thangAmLich: number, chiTuoiVong: Chi): NgayTrungKyKetQua {
  return {
    trungNhat: isTrungNhat(chiNgayMat),
    phucNhat: isPhucNhat(canNgayMat, thangAmLich),
    kiepSat: isKiepSat(chiTuoiVong, chiNgayMat),
    thanTrung: checkThanTrung(thangAmLich, canNgayMat, chiNgayMat),
  };
}
