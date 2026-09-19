/**
 * Day/Night (晝夜) — Phase 5B-3. Thuật toán: Algorithm Spec §3 + Phase 4 Phần C (NÂNG
 * confidence C→B): xác định theo CHI của GIỜ CHIÊM (占時 = `CalendarData.hourPillar.chi`),
 * ranh giới Mão(卯)–Dậu(酉). KHÔNG dùng giờ đồng hồ, KHÔNG dùng mặt trời mọc/lặn thực — cả 2
 * phương pháp này đã bị Phase 4 kiểm chứng lại và BÁC BỎ trực tiếp (không có nguồn cổ nào ủng
 * hộ, xem docs/daliuren/research/phase4/report-C-nightday.md RULE 6/RULE 7).
 *
 * MỘT cơ chế DUY NHẤT chi phối cả (i) chọn nhánh Quý Nhân (xem noble-spirit/) lẫn (ii) hướng
 * thuận/nghịch 12 Thiên Tướng (CHƯA implement ở Phase 5B-3) — không phải 2 ranh giới tách biệt.
 */
import type { CalendarData } from "../types/calendar-data.js";
import type { DayNightDetermination } from "../types/day-night.js";
import { DAY_NIGHT_BOUNDARY_PROVENANCE } from "../profiles/provenance-seed.js";
import { lookupDayOrNight } from "./table.js";
import { DayNightError } from "./errors.js";

export interface DayNightComputation {
  dayNight: DayNightDetermination;
  /** → ProvenanceEntry.id (profiles/provenance-seed.ts, dùng chung với `CalculationProfile.dayNightBoundary`) — truy vết DayNight → rule → source → confidence. */
  provenanceId: string;
}

/**
 * Tính 晝/夜 từ `CalendarData` đã dựng (Phase 5B-1) — CHỈ dùng `hourPillar.chi`, không dùng
 * bất kỳ trường nào khác (không phụ thuộc timezone hệ thống, giờ đồng hồ, hay ngày tháng).
 *
 * NO HIDDEN FALLBACK: nếu `hourPillar.chi` không phải 1 trong 12 địa chi hợp lệ (dữ liệu từ
 * nguồn khác `computeCalendarData`, vd JSON deserialize hỏng), ném lỗi tường minh — KHÔNG mặc
 * định "day" hay "night".
 */
export function computeDayNight(calendarData: CalendarData): DayNightComputation {
  const hourChi = calendarData.hourPillar.chi;
  const value = lookupDayOrNight(hourChi);

  if (!value) {
    throw new DayNightError(
      "INVALID_HOUR_CHI",
      `Chi giờ chiêm không hợp lệ: "${hourChi}" — không thuộc 12 địa chi đã biết, không thể xác định Mão-Dậu.`,
    );
  }

  return {
    dayNight: { value, method: "occasion-hour-chi" },
    provenanceId: DAY_NIGHT_BOUNDARY_PROVENANCE.id,
  };
}
