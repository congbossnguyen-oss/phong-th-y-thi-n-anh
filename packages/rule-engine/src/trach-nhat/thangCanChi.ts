/**
 * Can Chi Tháng theo THÁNG ÂM LỊCH (Ngũ Hổ Độn Nguyệt) — khác với `calendar-core`'s
 * `getGanzhiMonth()`, vốn dùng ranh giới TIẾT KHÍ (chuẩn Tứ Trụ/Bát Tự cá nhân, do
 * calendar-core chủ động chỉ hỗ trợ đúng 1 quy ước để tránh trộn lẫn — xem comment ở
 * `calendar-core/src/calendar/ganzhi.ts`).
 *
 * Trạch Nhật/Ngọc Hạp Thông Thư theo truyền thống dùng THÁNG ÂM LỊCH cho nhãn "Tháng" hiển
 * thị trong lịch vạn sự — khớp với toàn bộ các module khác trong nhóm trach-nhat vốn đã
 * nhận `lunarMonth` làm tham số (`hoangDaoHacDao.ts`, `tieuLucNham.ts`, `thanSat.ts`).
 *
 * Xác nhận bằng đối chiếu trực tiếp lưới lịch hocvienlyso.org/lichvansu/ tháng 8/2026: Lập
 * Thu 2026 xảy ra lúc 7/8 18:38 giờ VN, nhưng site vẫn ghi "Tháng Ất Mùi" cho tới hết
 * 12/8 — chỉ đổi sang "Tháng Bính Thân" đúng ngày 13/8 (= mùng 1 tháng 7 âm lịch). Nếu dùng
 * ranh giới tiết khí (như `calendar-core`) sẽ cho tháng đổi từ 7/8, sai với site 5 ngày.
 * Công thức dưới đây khớp CHÍNH XÁC cả 2 điểm (Ất Mùi cho 8/8, Bính Thân cho 13/8).
 *
 * Công thức Ngũ Hổ Độn Nguyệt (giống calendar-core/ganzhi.ts, chỉ khác input là tháng âm
 * lịch thay vì thứ tự tháng theo tiết khí): Can tháng Giêng (Dần) suy từ Can năm — Giáp/Kỷ
 * -> Bính, Ất/Canh -> Mậu, Bính/Tân -> Canh, Đinh/Nhâm -> Nhâm, Mậu/Quý -> Giáp.
 */

import { Data } from "@thien-anh/calendar-core";
import { mod } from "../utils/math.js";

const { CAN, CHI } = Data;
type Can = Data.Can;
type Chi = Data.Chi;

export interface ThangCanChiResult {
  canIndex: number;
  chiIndex: number;
  can: Can;
  chi: Chi;
}

/**
 * @param yearCanIndex Index Can của Năm (0-9, 0=Giáp) — lấy từ `getCanChi(...).year.canIndex`
 *   của calendar-core (ranh giới Lập Xuân, chuẩn Tứ Trụ).
 * @param lunarMonth Tháng âm lịch 1-12 (tháng nhuận dùng lại Can Chi của tháng gốc — không
 *   phân biệt, đúng quy ước Ngũ Hổ Độn cổ điển vốn không có khái niệm tháng nhuận).
 */
export function getThangCanChiAmLich(yearCanIndex: number, lunarMonth: number): ThangCanChiResult {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth} (phải 1-12).`);
  }
  if (!Number.isInteger(yearCanIndex)) {
    throw new Error(`yearCanIndex không hợp lệ: ${yearCanIndex} (phải là số nguyên 0-9).`);
  }

  const monthCanAtDan = mod((yearCanIndex % 5) * 2 + 2, 10);
  const monthOffset = lunarMonth - 1;

  const canIndex = mod(monthCanAtDan + monthOffset, 10);
  const chiIndex = mod(2 + monthOffset, 12); // Dần có index 2 trong mảng CHI

  return { canIndex, chiIndex, can: CAN[canIndex]!, chi: CHI[chiIndex]! };
}
