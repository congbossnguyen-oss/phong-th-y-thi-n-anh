/**
 * 24 Tiết Khí (Solar Terms) — tính thời điểm CHÍNH XÁC (không tra bảng theo năm) bằng
 * cách tìm nghiệm của phương trình "kinh độ mặt trời biểu kiến = góc mục tiêu" thông qua
 * lặp Newton-Raphson trên astronomy/solar.ts.
 */

import { apparentSolarLongitudeDeg } from "../astronomy/solar.js";
import { calendarDateToJulianDay, julianDayToDateTime, type CalendarDateTime } from "../astronomy/julianDay.js";
import { angleDiffDegrees, mod, normalizeDegrees } from "../utils/math.js";
import { SOLAR_TERMS, type SolarTermDefinition } from "../data/solarTerms.js";

/** Tốc độ di chuyển trung bình của Mặt Trời trên hoàng đạo (độ/ngày) — dùng làm bước lặp Newton. */
const MEAN_DEG_PER_DAY = 360 / 365.2421897;

/** Sai số hội tụ mục tiêu cho kinh độ (độ). 1e-6° ≈ 0.0036 giây cung, dư thừa chính xác. */
const CONVERGENCE_TOLERANCE_DEG = 1e-6;

const MAX_ITERATIONS = 30;

export interface SolarTermOccurrence extends SolarTermDefinition {
  /** Julian Day (UT) tại đúng thời điểm tiết khí xảy ra. */
  julianDay: number;
  /** Ngày giờ UTC tương ứng. */
  dateTimeUtc: CalendarDateTime;
}

/**
 * Tìm Julian Day (UT) gần `approximateJd` nhất mà tại đó kinh độ mặt trời biểu kiến
 * bằng đúng `targetLongitudeDeg`, bằng lặp Newton-Raphson (đạo hàm xấp xỉ bằng tốc độ
 * trung bình không đổi — đủ ổn định vì kinh độ mặt trời gần như tuyến tính theo thời gian
 * trong phạm vi vài ngày).
 *
 * Đây là hàm lõi dùng chung cho cả `getSolarTerms()` lẫn calendar/ganzhi.ts,
 * calendar/lunarCalendar.ts (xác định tháng nhuận cần biết sector 30° của kinh độ).
 */
export function findSolarTermJd(targetLongitudeDeg: number, approximateJd: number): number {
  let jd = approximateJd;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const currentLongitude = apparentSolarLongitudeDeg(jd);
    const diff = angleDiffDegrees(currentLongitude, targetLongitudeDeg);

    if (Math.abs(diff) < CONVERGENCE_TOLERANCE_DEG) {
      break;
    }

    jd += diff / MEAN_DEG_PER_DAY;
  }

  return jd;
}

/**
 * Toàn bộ 24 tiết khí xảy ra trong một năm dương lịch cho trước, sắp theo thời gian tăng
 * dần. Thuật toán: bắt đầu từ kinh độ mặt trời tại 0h UT ngày 1/1 của năm đó, quét tiến
 * dần qua đúng 24 mốc 15° liên tiếp (một vòng hoàng đạo 360°) — đảm bảo mỗi mốc xuất hiện
 * đúng một lần, đúng thứ tự thời gian, và rơi đúng vào năm dương lịch được yêu cầu (Tiểu
 * Hàn/Đại Hàn đầu năm, Đông Chí cuối năm).
 */
export function getSolarTerms(year: number): SolarTermOccurrence[] {
  const jan1Jd = calendarDateToJulianDay(year, 1, 1);
  const longitudeAtJan1 = apparentSolarLongitudeDeg(jan1Jd);

  // Mốc 15° đầu tiên >= kinh độ tại Jan 1 — điểm khởi đầu vòng quét 24 mốc.
  const firstStepIndex = Math.ceil(longitudeAtJan1 / 15);

  const occurrences: SolarTermOccurrence[] = [];

  for (let i = 0; i < 24; i++) {
    const stepIndex = firstStepIndex + i;
    const targetLongitude = normalizeDegrees(stepIndex * 15);
    const definitionIndex = Math.round(targetLongitude / 15) % 24;
    const definition = SOLAR_TERMS[definitionIndex];
    if (!definition) throw new Error(`Không tìm thấy định nghĩa tiết khí cho góc ${targetLongitude}`);

    // Khoảng cách góc (luôn đi TỚI, không lấy đường ngắn nhất) từ kinh độ Jan1 tới mốc mục
    // tiêu, quy đổi ra ngày làm dự đoán ban đầu cho vòng lặp Newton bên dưới.
    const forwardDegreesFromJan1 = mod(targetLongitude - longitudeAtJan1, 360);
    const approximateJd = jan1Jd + forwardDegreesFromJan1 / MEAN_DEG_PER_DAY;

    const exactJd = findSolarTermJd(targetLongitude, approximateJd);

    occurrences.push({
      ...definition,
      julianDay: exactJd,
      dateTimeUtc: julianDayToDateTime(exactJd),
    });
  }

  return occurrences.sort((a, b) => a.julianDay - b.julianDay);
}

/**
 * "Sector 30°" của kinh độ mặt trời biểu kiến tại `jdUT`: số nguyên 0-11, sector k phủ
 * kinh độ [30k, 30k+30). Các ranh giới sector trùng với 12 Trung Khí (0°, 30°, ..., 330°).
 * Dùng trong calendar/lunarCalendar.ts để xác định tháng nhuận (tháng không chứa Trung Khí).
 */
export function majorTermSector(jdUT: number): number {
  const longitude = apparentSolarLongitudeDeg(jdUT);
  return Math.floor(normalizeDegrees(longitude) / 30);
}

/**
 * Chỉ số tháng Kiến (0 = Dần, 1 = Mão, ..., 11 = Sửu) theo ranh giới 12 "Tiết" (bắt đầu
 * từ Lập Xuân 315°), dùng để xác định Địa Chi của trụ Tháng trong Tứ Trụ/Bát Tự. Tính
 * trực tiếp từ kinh độ liên tục — không cần dò từng mốc vì các ranh giới cách đều 30°.
 */
export function monthBoundaryOrderIndex(jdUT: number): number {
  const longitude = apparentSolarLongitudeDeg(jdUT);
  const offsetFromLichXuan = normalizeDegrees(longitude - 315);
  return Math.floor(offsetFromLichXuan / 30);
}
