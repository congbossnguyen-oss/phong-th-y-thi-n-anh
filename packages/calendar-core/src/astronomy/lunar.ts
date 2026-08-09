/**
 * Thời điểm Sóc (New Moon) — nền tảng thiên văn của Âm Lịch.
 *
 * Âm lịch Việt Nam (giống âm lịch Trung Hoa) quy định: mỗi tháng âm lịch bắt đầu vào
 * đúng ngày chứa thời điểm Sóc (Mặt Trời - Mặt Trăng - Trái Đất thẳng hàng, trăng non
 * hoàn toàn tối). Do đó cần tính được thời điểm Sóc chính xác, không phải ước lượng
 * "cứ ~29.5 ngày một lần" một cách máy móc.
 *
 * Thuật toán: chuỗi lượng giác rút gọn từ lý thuyết ELP2000-82 (Mặt Trăng) kết hợp
 * VSOP87 (Mặt Trời), theo Jean Meeus "Astronomical Algorithms" chương 49 (dạng rút gọn
 * phổ biến trong các cài đặt lịch Á Đông, sai số dưới vài phút trong khoảng năm 1800-2100,
 * dưới vài giờ khi ngoại suy xa hơn tới nhiều thế kỷ). Không dùng bảng tra cứng theo năm.
 */

import { normalizeRadians } from "../utils/math.js";

/** Chu kỳ giao hội trung bình (synodic month) của Mặt Trăng, đơn vị ngày. */
export const SYNODIC_MONTH_DAYS = 29.530588853;

/** Epoch tham chiếu (JD) dùng để đánh số lần giao hội k=0 — Sóc gần 1/1/1900. */
const LUNATION_EPOCH_JD = 2415021.076998695;

/**
 * Julian Day (UT) của lần Sóc thứ `k`, tính từ Sóc gần Julian Day 2415021 (~1/1/1900).
 * `k` có thể âm (Sóc trước mốc) hoặc dương (Sóc sau mốc), là số nguyên lần giao hội.
 *
 * Đây là hàm lõi mà calendar/lunarCalendar.ts dùng lặp lại nhiều lần để dựng toàn bộ
 * chuỗi các đầu tháng âm lịch trong một năm.
 */
export function newMoonJulianDay(k: number): number {
  const T = k / 1236.85; // thời gian tính bằng thế kỷ Julian kể từ 1900-01-01
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;

  // Thời điểm Sóc trung bình (mean new moon).
  let jd1 = 2415020.75933 + SYNODIC_MONTH_DAYS * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3; // dị thường trung bình Mặt Trời
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3; // dị thường trung bình Mặt Trăng
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3; // ly giác của Mặt Trăng

  // Hiệu chỉnh chu kỳ (periodic corrections) để chuyển "Sóc trung bình" thành "Sóc thật".
  const c1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M) -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(dr * 2 * Mpr) -
    0.0004 * Math.sin(dr * 3 * Mpr) +
    0.0104 * Math.sin(dr * 2 * F) -
    0.0051 * Math.sin(dr * (M + Mpr)) -
    0.0074 * Math.sin(dr * (M - Mpr)) +
    0.0004 * Math.sin(dr * (2 * F + M)) -
    0.0004 * Math.sin(dr * (2 * F - M)) -
    0.0006 * Math.sin(dr * (2 * F + Mpr)) +
    0.001 * Math.sin(dr * (2 * F - Mpr)) +
    0.0005 * Math.sin(dr * (2 * Mpr + M));

  const deltaT =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;

  return jd1 + c1 - deltaT;
}

/**
 * Xấp xỉ số nguyên lần giao hội `k` gần nhất TRƯỚC (hoặc bằng) một JD cho trước.
 * Dùng làm điểm khởi đầu để quét các lần Sóc quanh một ngày/năm mục tiêu, tránh phải
 * dò từ k=0 mỗi lần.
 */
export function approximateLunationNumber(jd: number): number {
  return Math.floor((jd - LUNATION_EPOCH_JD) / SYNODIC_MONTH_DAYS);
}

/** Giống {@link approximateLunationNumber} nhưng làm tròn tới lần giao hội GẦN NHẤT. */
export function nearestLunationNumber(jd: number): number {
  return Math.round((jd - LUNATION_EPOCH_JD) / SYNODIC_MONTH_DAYS);
}

/**
 * Ly giác pha Mặt Trăng xấp xỉ (độ, 0 = Sóc) tại `jdUT`, so với lần giao hội trung bình
 * thứ `referenceK`. Chỉ dùng để kiểm chứng/viết test rằng một JD cho trước có thực sự
 * gần thời điểm Sóc hay không — không dùng trong pipeline tính lịch chính.
 */
export function approximateMoonPhaseAngleDeg(jdUT: number, referenceK: number): number {
  const meanNewMoon = newMoonJulianDay(referenceK);
  const daysFromNewMoon = jdUT - meanNewMoon;
  const phase = normalizeRadians((daysFromNewMoon / SYNODIC_MONTH_DAYS) * 2 * Math.PI);
  return (phase * 180) / Math.PI;
}
