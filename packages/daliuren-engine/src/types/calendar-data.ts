/**
 * CalendarData — 4 trụ Can Chi + tiết khí bao quanh thời điểm chiêm.
 * Xem docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §1 và
 * docs/daliuren/DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md (đã chạy thử, không phát hiện bug).
 */
import type { CanChiPillar } from "./ganzhi.js";

/** 1 mốc tiết khí cụ thể đã xảy ra — dạng rút gọn của `SolarTermOccurrence` (calendar-core) cho phạm vi Lục Nhâm. */
export interface SolarTerm {
  /** Tên Hán Việt, vd "小寒". */
  nameHan: string;
  name: string;
  /** "tiet" = Tiết (đầu tháng Kiến) | "trungKhi" = Trung Khí (giữa tháng, quyết định Nguyệt Tướng). */
  kind: "tiet" | "trungKhi";
  /** ISO 8601, UTC. */
  occurredAt: string;
}

export interface CalendarData {
  yearPillar: CanChiPillar;
  monthPillar: CanChiPillar;
  dayPillar: CanChiPillar;
  hourPillar: CanChiPillar;
  /** Trung khí gần nhất TRƯỚC HOẶC BẰNG thời điểm chiêm — dùng để suy Nguyệt Tướng (Algorithm Spec §2). */
  precedingMajorTerm: SolarTerm;
}
