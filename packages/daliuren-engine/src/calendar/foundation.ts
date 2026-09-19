/**
 * Calendar Foundation (Phase 5B-1) — lắp ráp normalize input + adapter GanZhi + Solar Terms
 * thành `CalendarData`. ĐÂY KHÔNG PHẢI `calculate()` đầy đủ: Nguyệt Tướng/Trú Dạ/Quý
 * Nhân/Thiên Địa Bàn/Tứ Khóa/Tam Truyền/Thập Nhị Thiên Tướng/Khóa Thể/Không Vong/Bản
 * Mệnh/Hành Niên đều CHƯA implement — xem docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md.
 */
import type { ChartInput } from "../types/chart.js";
import type { CalendarData } from "../types/calendar-data.js";
import type { CalculationProfile } from "../profiles/types.js";
import { normalizeChartInstant } from "./input.js";
import { computeGanzhiPillars } from "./ganzhi-adapter.js";
import { getPrecedingMajorTerm } from "./solar-terms.js";

/**
 * Tính `CalendarData` (4 trụ Can Chi + trung khí gần nhất) từ `ChartInput` thô + 1
 * `CalculationProfile` đã chọn. Deterministic: cùng input + cùng profile → cùng kết quả hệt
 * nhau, không phụ thuộc đồng hồ hệ thống/múi giờ máy/locale (Phase 5B-1 mục "Determinism").
 */
export function computeCalendarData(input: ChartInput, profile: CalculationProfile): CalendarData {
  const normalized = normalizeChartInstant(input);
  const dateTimeInput = normalized.toDateTimeInput();

  const pillars = computeGanzhiPillars(dateTimeInput, profile);
  const precedingMajorTerm = getPrecedingMajorTerm(normalized.utcInstant, normalized.localDate.year);

  return {
    yearPillar: pillars.yearPillar,
    monthPillar: pillars.monthPillar,
    dayPillar: pillars.dayPillar,
    hourPillar: pillars.hourPillar,
    precedingMajorTerm,
  };
}
