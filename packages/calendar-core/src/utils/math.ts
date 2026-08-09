/**
 * Các hàm toán học dùng chung cho toàn bộ engine: chuẩn hóa góc, đổi độ/radian,
 * modulo dương (khác với `%` của JS vốn có thể trả số âm).
 *
 * Đặt riêng module này để mọi phép tính lượng giác thiên văn (solar.ts, lunar.ts,
 * solarTerms.ts...) đều dùng chung một quy ước chuẩn hóa, tránh sai lệch do mỗi nơi
 * tự xử lý biên độ góc một kiểu.
 */

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

/** Đổi độ sang radian. */
export function degToRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

/** Đổi radian sang độ. */
export function radToDeg(rad: number): number {
  return rad * RAD_TO_DEG;
}

/**
 * Modulo dương: luôn trả về giá trị trong [0, m), kể cả khi `n` âm.
 * JS `%` là "remainder" (giữ dấu của số bị chia), không phải modulo toán học,
 * nên phải tự viết lại để tránh lỗi ở các phép tính góc/chu kỳ âm.
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Chuẩn hóa góc độ về khoảng [0, 360). */
export function normalizeDegrees(deg: number): number {
  return mod(deg, 360);
}

/** Chuẩn hóa góc radian về khoảng [0, 2π). */
export function normalizeRadians(rad: number): number {
  return mod(rad, 2 * Math.PI);
}

/**
 * Sai khác góc ngắn nhất từ `from` đến `to` (độ), kết quả trong (-180, 180].
 * Dùng khi cần biết "còn thiếu bao nhiêu độ" trong các vòng lặp hội tụ (Newton-Raphson)
 * mà không bị nhảy pha khi góc đi qua mốc 360°→0°.
 */
export function angleDiffDegrees(from: number, to: number): number {
  const diff = mod(to - from, 360);
  return diff > 180 ? diff - 360 : diff;
}

/** Làm tròn một số về `decimals` chữ số thập phân (dùng cho so sánh/test). */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
