/**
 * HOÀNG ỐC — 6 cung theo chu kỳ Tuổi Mụ mod 6, dùng khi xem xây/sửa nhà, việc lớn.
 *
 * ⚠️ Nguồn: công thức dân gian phổ biến nhất (tuổi mụ mod 6, ánh xạ tuần tự vào 6 cung theo
 * đúng thứ tự Nhất Cát → Lục Hoàng Ốc) — hệ thống hiện KHÔNG có bảng Hoàng Ốc trích từ 1 đầu
 * sách cụ thể nào để đối chiếu (khác các bảng `trach-nhat/*` vốn trích nguyên văn 1 nguồn xác
 * định). Nếu về sau có nguồn xác định khác với công thức này, chỉ cần sửa `HOANG_OC_RULES`,
 * không sửa thuật toán `calculateHoangOc`.
 */

export type CungHoangOc = "nhat-cat" | "nhi-nghi" | "tam-dia-sat" | "tu-tan-tai" | "ngu-tho-tu" | "luc-hoang-oc";

export const HOANG_OC_RULES: Record<CungHoangOc, { ten: string; tot: boolean }> = {
  "nhat-cat": { ten: "Nhất Cát", tot: true },
  "nhi-nghi": { ten: "Nhì Nghi", tot: true },
  "tam-dia-sat": { ten: "Tam Địa Sát", tot: false },
  "tu-tan-tai": { ten: "Tứ Tấn Tài", tot: true },
  "ngu-tho-tu": { ten: "Ngũ Thọ Tử", tot: false },
  "luc-hoang-oc": { ten: "Lục Hoàng Ốc", tot: false },
} as const;

const THU_TU_CUNG: readonly CungHoangOc[] = [
  "nhat-cat",
  "nhi-nghi",
  "tam-dia-sat",
  "tu-tan-tai",
  "ngu-tho-tu",
  "luc-hoang-oc",
];

export interface HoangOcResult {
  cung: CungHoangOc;
  ten: string;
  tot: boolean;
}

export function calculateHoangOc(tuoiMu: number): HoangOcResult {
  if (!Number.isInteger(tuoiMu) || tuoiMu < 1) {
    throw new Error(`Tuổi mụ không hợp lệ: ${tuoiMu} (phải là số nguyên >= 1).`);
  }
  let du = tuoiMu % 6;
  if (du === 0) du = 6;
  const cung = THU_TU_CUNG[du - 1]!;
  const { ten, tot } = HOANG_OC_RULES[cung];
  return { cung, ten, tot };
}
