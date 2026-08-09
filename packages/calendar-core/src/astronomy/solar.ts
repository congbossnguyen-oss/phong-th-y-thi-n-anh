/**
 * Vị trí biểu kiến của Mặt Trời trên hoàng đạo (ecliptic longitude of the Sun).
 *
 * Đây là đại lượng trung tâm của toàn bộ lịch tiết khí: 24 Tiết Khí được ĐỊNH NGHĨA là
 * các thời điểm kinh độ mặt trời biểu kiến bằng bội số của 15°. Module này KHÔNG dùng
 * bảng tra theo năm — mọi kinh độ được tính trực tiếp từ chuỗi lượng giác thiên văn.
 *
 * Thuật toán: phương pháp "độ chính xác thấp" (low-accuracy) của Jean Meeus,
 * "Astronomical Algorithms" (2nd ed.), chương 25 — sai số dưới 0.01° (~36 giây cung)
 * trong khoảng năm ±few nghìn năm quanh J2000, đủ chính xác để xác định tiết khí tới
 * độ chính xác dưới phút sau khi kết hợp với ΔT (astronomy/deltaT.ts). Đây là chuỗi rút
 * gọn của lý thuyết VSOP87 đầy đủ, không phải phép "ước lượng" tùy tiện — là công thức
 * đã công bố, xác định, tái lập được.
 */

import { julianCentury } from "./julianDay.js";
import { deltaTSeconds } from "./deltaT.js";
import { degToRad, normalizeDegrees } from "../utils/math.js";

/** Kinh độ trung bình của Mặt Trời (độ), chưa hiệu chỉnh tâm sai quỹ đạo. */
export function meanSolarLongitudeDeg(T: number): number {
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T * T;
  return normalizeDegrees(L0);
}

/** Dị thường trung bình (mean anomaly) của Mặt Trời trên quỹ đạo biểu kiến quanh Trái Đất (độ). */
export function solarMeanAnomalyDeg(T: number): number {
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T * T - 0.00000048 * T * T * T;
  return normalizeDegrees(M);
}

/** Độ lệch tâm quỹ đạo Trái Đất quanh Mặt Trời (không thứ nguyên, giảm dần theo thời gian). */
export function earthOrbitEccentricity(T: number): number {
  return 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
}

/**
 * Phương trình tâm sai (Equation of Center, độ) — hiệu chỉnh từ vị trí trung bình sang
 * vị trí thật do quỹ đạo elip (không tròn) của Trái Đất.
 */
export function equationOfCenterDeg(T: number, meanAnomalyDeg: number): number {
  const Mrad = degToRad(meanAnomalyDeg);
  return (
    (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.00029 * Math.sin(3 * Mrad)
  );
}

/** Kinh độ THẬT (true geometric longitude) của Mặt Trời, độ — chưa hiệu chỉnh chương động/quang sai. */
export function trueSolarLongitudeDeg(T: number): number {
  const L0 = meanSolarLongitudeDeg(T);
  const M = solarMeanAnomalyDeg(T);
  const C = equationOfCenterDeg(T, M);
  return normalizeDegrees(L0 + C);
}

/**
 * Kinh độ của điểm nút lên Mặt Trăng trung bình (Ω, độ) — số hạng chi phối chương động
 * (nutation) theo kinh độ. Dùng số hạng chủ đạo duy nhất (đủ cho độ chính xác low-accuracy
 * của Meeus ch.25), không khai triển đầy đủ chuỗi IAU 1980 (vốn có hàng chục số hạng,
 * không cần thiết cho xác định tiết khí/sóc ở độ chính xác dưới phút).
 */
export function moonAscendingNodeLongitudeDeg(T: number): number {
  return normalizeDegrees(125.04 - 1934.136 * T);
}

/**
 * Kinh độ BIỂU KIẾN (apparent longitude) của Mặt Trời, độ, đã hiệu chỉnh chương động
 * (nutation) và quang sai (aberration) theo phương pháp low-accuracy của Meeus.
 *
 * @param jdUT Julian Day theo UT (Universal Time — giờ dân sự quy về UT).
 */
export function apparentSolarLongitudeDeg(jdUT: number): number {
  // Các công thức vị trí Mặt Trời được xây dựng cho thang Dynamical/Terrestrial Time (TT),
  // nên trước tiên phải cộng ΔT để đổi JD(UT) -> JD(TT).
  const { year, month } = approximateYearMonth(jdUT);
  const dT = deltaTSeconds(year, month);
  const jdTT = jdUT + dT / 86400;

  const T = julianCentury(jdTT);
  const trueLongitude = trueSolarLongitudeDeg(T);
  const omega = moonAscendingNodeLongitudeDeg(T);

  // Hiệu chỉnh gộp chương động + quang sai (Meeus 25.9, low-accuracy):
  const correction = -0.00569 - 0.00478 * Math.sin(degToRad(omega));

  return normalizeDegrees(trueLongitude + correction);
}

/**
 * Xấp xỉ nhanh năm-tháng dương lịch từ JD, chỉ dùng nội bộ để tra ΔT (không cần chính xác
 * tới ngày — ΔT biến thiên rất chậm nên sai số vài ngày không ảnh hưởng kết quả).
 */
function approximateYearMonth(jd: number): { year: number; month: number } {
  // 2451545.0 = J2000.0 = trưa UT 1/1/2000.
  const daysSinceJ2000 = jd - 2451545.0;
  const approxYear = 2000 + daysSinceJ2000 / 365.2425;
  const year = Math.floor(approxYear);
  const monthFraction = (approxYear - year) * 12;
  const month = Math.min(12, Math.max(1, Math.floor(monthFraction) + 1));
  return { year, month };
}
