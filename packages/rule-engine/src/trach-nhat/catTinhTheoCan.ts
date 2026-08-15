/**
 * Bốn cát tinh tra theo THIÊN CAN của ngày: Tuế Đức, Tuế Đức Hợp, Nguyệt Đức, Nguyệt Đức Hợp.
 *
 * Nguồn: bảng chủ dự án cung cấp trực tiếp 2026-08-15, đánh dấu `status: "locked"` (đã chốt, không
 * còn dị bản). Em đã kiểm chéo cả 4 bảng với quy tắc cổ điển và khớp:
 *   - Nguyệt Đức theo tam hợp của Chi tháng: Dần-Ngọ-Tuất→Bính · Thân-Tý-Thìn→Nhâm ·
 *     Hợi-Mão-Mùi→Giáp · Tỵ-Dậu-Sửu→Canh. Tháng âm 1 = tháng Dần nên bảng theo số tháng khớp.
 *   - Ba bảng "Hợp" đều đúng là Ngũ Hợp của bảng gốc: Giáp↔Kỷ, Ất↔Canh, Bính↔Tân, Đinh↔Nhâm,
 *     Mậu↔Quý. Kiểm được bằng máy — xem test `catTinhTheoCan.test.ts`.
 *
 * Nguyệt Đức (月德) — nguồn chính: Tam Mệnh Thông Hội; Khâm định Hiệp Kỷ Biện Phương Thư.
 * Quy tắc: Thiên Can NGÀY trùng Thiên Can Nguyệt Đức của tháng thì được tính.
 *
 * `thanSat.ts` từng có một entry cũng tên "Nguyệt Đức" nhưng tra theo ĐỊA CHI — chủ dự án đã
 * quyết định gỡ hẳn khỏi engine ngày 2026-08-15 vì nó chọn ra tập ngày hoàn toàn khác nên không
 * thể là cùng một sao. Từ đây "Nguyệt Đức" trong hệ trạch nhật chỉ có nghĩa là bảng theo Can ở
 * file này.
 */
import { Data } from "@thien-anh/calendar-core";
import type { CatHung } from "./catHung.js";

type Can = Data.Can;

/** Tuế Đức: tra theo Can của NĂM → Can của ngày ứng với cát tinh này. */
export const TUE_DUC_THEO_CAN_NAM: Readonly<Record<Can, Can>> = {
  "Giáp": "Giáp",
  "Ất": "Canh",
  "Bính": "Bính",
  "Đinh": "Nhâm",
  "Mậu": "Mậu",
  "Kỷ": "Giáp",
  "Canh": "Canh",
  "Tân": "Bính",
  "Nhâm": "Nhâm",
  "Quý": "Mậu",
};

/** Tuế Đức Hợp: Ngũ Hợp của Tuế Đức, cũng tra theo Can của NĂM. */
export const TUE_DUC_HOP_THEO_CAN_NAM: Readonly<Record<Can, Can>> = {
  "Giáp": "Kỷ",
  "Ất": "Ất",
  "Bính": "Tân",
  "Đinh": "Đinh",
  "Mậu": "Quý",
  "Kỷ": "Kỷ",
  "Canh": "Ất",
  "Tân": "Tân",
  "Nhâm": "Đinh",
  "Quý": "Quý",
};

/** Nguyệt Đức: tra theo THÁNG ÂM LỊCH (index 0 = tháng 1 … index 11 = tháng 12). */
export const NGUYET_DUC_THEO_THANG: readonly Can[] = [
  "Bính", "Giáp", "Nhâm", "Canh",
  "Bính", "Giáp", "Nhâm", "Canh",
  "Bính", "Giáp", "Nhâm", "Canh",
];

/** Nguyệt Đức Hợp: Ngũ Hợp của Nguyệt Đức, cũng theo tháng âm lịch. */
export const NGUYET_DUC_HOP_THEO_THANG: readonly Can[] = [
  "Tân", "Kỷ", "Đinh", "Ất",
  "Tân", "Kỷ", "Đinh", "Ất",
  "Tân", "Kỷ", "Đinh", "Ất",
];

export interface CatTinhTheoCanEntry {
  name: string;
  catHung: CatHung;
  nguon: string;
}

/**
 * Bốn cát tinh theo Can có mặt trong một ngày cụ thể.
 *
 * @param canNam Thiên Can của trụ NĂM (cho Tuế Đức / Tuế Đức Hợp).
 * @param lunarMonth Tháng âm lịch 1-12 (cho Nguyệt Đức / Nguyệt Đức Hợp).
 * @param canNgay Thiên Can của trụ NGÀY — đây là cái đem đi so.
 */
export function getCatTinhTheoCanTrongNgay(
  canNam: Can,
  lunarMonth: number,
  canNgay: Can,
): CatTinhTheoCanEntry[] {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  const NGUON = "Bảng chủ dự án cung cấp trực tiếp 2026-08-15 (status: locked)";
  const ds: CatTinhTheoCanEntry[] = [];

  if (TUE_DUC_THEO_CAN_NAM[canNam] === canNgay) {
    ds.push({ name: "Tuế Đức", catHung: "cát", nguon: NGUON });
  }
  if (TUE_DUC_HOP_THEO_CAN_NAM[canNam] === canNgay) {
    ds.push({ name: "Tuế Đức Hợp", catHung: "cát", nguon: NGUON });
  }
  if (NGUYET_DUC_THEO_THANG[lunarMonth - 1] === canNgay) {
    ds.push({ name: "Nguyệt Đức", catHung: "cát", nguon: NGUON });
  }
  if (NGUYET_DUC_HOP_THEO_THANG[lunarMonth - 1] === canNgay) {
    ds.push({ name: "Nguyệt Đức Hợp", catHung: "cát", nguon: NGUON });
  }

  return ds;
}
