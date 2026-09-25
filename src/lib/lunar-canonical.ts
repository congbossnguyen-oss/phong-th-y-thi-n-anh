/**
 * Cổng chuyển đổi Âm lịch theo cờ G10 (MẶC ĐỊNH TẮT).
 *
 * - TẮT (mặc định): dùng `solarToLunar` legacy của app (giữ nguyên output production hiện tại).
 * - BẬT (`LUNAR_ENGINE=calendar-core`): dùng resolver chính sách VN tường minh + calendar-core
 *   (Etc/GMT-7/8, ΔT) — kết quả Âm lịch canonical.
 *
 * Chỉ những call-site CHỨC NĂNG đã được duyệt (V3-36/37) mới gọi hàm này. Các call-site chỉ-hiển-thị
 * vẫn dùng thẳng `solarToLunar` legacy (không đổi ở phase này).
 */
import { getVietnameseLunarDate, isCanonicalVnLunarEnabled } from "@thien-anh/calendar-core";
import { solarToLunar, type LunarDate } from "./lunar-calendar";

export function resolveVnLunar(dd: number, mm: number, yy: number): LunarDate {
  if (isCanonicalVnLunarEnabled()) {
    const c = getVietnameseLunarDate({ year: yy, month: mm, day: dd });
    return { day: c.day, month: c.month, year: c.year, isLeapMonth: c.isLeapMonth };
  }
  return solarToLunar(dd, mm, yy);
}
