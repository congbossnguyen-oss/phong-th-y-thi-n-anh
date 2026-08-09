/**
 * Tiểu Lục Nhâm — Đại An / Lưu Niên / Tốc Hỷ / Xích Khẩu / Tiểu Cát / Không Vong.
 *
 * Nguồn: đặc tả `tieu-luc-nham-engine.md` (chủ dự án cung cấp 2026-08-09) — phương pháp
 * "bấm độn" 3 lượt đếm liên tiếp Tháng → Ngày → Giờ (âm lịch), vòng 6 cung cố định.
 *
 * ⚠️ THAY THẾ cho công thức "Lục Nhâm theo giờ" (dựa trên Can Ngày) từng có ở
 * `hoangDaoHacDaoGio.ts` — công thức đó ĐÃ SAI, phát hiện khi đối chiếu ngày 20/8/2026:
 * dự đoán "Tốc Hỷ" nhưng hocvienlyso.org/lichvansu/ hiển thị "Lưu Niên". Công thức Tiểu
 * Lục Nhâm (tháng+ngày âm lịch) ở file này đã verify khớp ĐÚNG cho ngày 20/8/2026, cũng
 * như khớp lại toàn bộ 4 điểm đã kiểm tra trước đó (8, 9, 10, 15/8/2026) — xem test.
 *
 * Bài học: 4 điểm dữ liệu đầu tiên (8-15/8) không đủ để phân biệt 2 giả thuyết vì công
 * thức sai (chu kỳ 5, theo Can Ngày) và công thức đúng (chu kỳ 6, theo Ngày Âm Lịch) chỉ
 * lệch pha sau hơn 5-6 ngày — cần điểm dữ liệu đủ xa mới phát hiện được sai số.
 */

import { mod } from "../utils/math.js";

export const TIEU_LUC_NHAM_NAMES = ["Đại An", "Lưu Niên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát", "Không Vong"] as const;

export type TieuLucNhamName = (typeof TIEU_LUC_NHAM_NAMES)[number];

const CAT_INDICES = new Set([0, 2, 4]); // Đại An, Tốc Hỷ, Tiểu Cát

export interface TieuLucNhamResult {
  index: number; // 0-5
  name: TieuLucNhamName;
  catHung: "cát" | "hung";
}

export interface TieuLucNhamFull {
  month: TieuLucNhamResult;
  day: TieuLucNhamResult;
  hour: TieuLucNhamResult;
}

function toResult(index: number): TieuLucNhamResult {
  const i = mod(index, 6);
  return { index: i, name: TIEU_LUC_NHAM_NAMES[i]!, catHung: CAT_INDICES.has(i) ? "cát" : "hung" };
}

/**
 * Tính đủ 3 tầng Tiểu Lục Nhâm (Tháng/Ngày/Giờ) theo đúng thuật toán "bấm độn":
 * tháng 1 khởi Đại An, đếm tới tháng hiện tại → cung Tháng; từ cung Tháng đếm tiếp theo
 * số ngày âm lịch → cung Ngày; từ cung Ngày đếm tiếp theo Chi giờ (Tý=0...Hợi=11) → cung Giờ.
 *
 * @param lunarMonth Tháng âm lịch 1-12.
 * @param lunarDay Ngày âm lịch (1 trở lên).
 * @param hourChiIndex Index Địa Chi của giờ (0-11, 0=Tý).
 */
export function getTieuLucNham(lunarMonth: number, lunarDay: number, hourChiIndex: number): TieuLucNhamFull {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth} (phải 1-12).`);
  }
  if (!Number.isInteger(lunarDay) || lunarDay < 1) {
    throw new Error(`Ngày âm lịch không hợp lệ: ${lunarDay} (phải >= 1).`);
  }

  const monthIndex = mod(lunarMonth - 1, 6);
  const dayIndex = mod(monthIndex + lunarDay - 1, 6);
  const hourIndex = mod(dayIndex + hourChiIndex, 6);

  return { month: toResult(monthIndex), day: toResult(dayIndex), hour: toResult(hourIndex) };
}
