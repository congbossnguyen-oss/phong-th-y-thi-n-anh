/**
 * Precision Policy — Astrology Module Phase 1.
 * Đúng docs/astrology-module/ARCHITECTURE/TEST_ARCHITECTURE.md §Precision.
 *
 * Nguyên tắc bắt buộc: mọi giá trị số trong domain model (BirthData đã resolve, sau này
 * PlanetPosition/Chart ở Phase 2+) lưu ở INTERNAL PRECISION (double-precision, KHÔNG làm
 * tròn) xuyên suốt tính toán. Làm tròn (DISPLAY PRECISION) chỉ xảy ra ở biên trình bày, KHÔNG
 * BAO GIỜ ở giữa một chuỗi tính toán — `round()` không phải "chân lý tính toán".
 */

/** Sai số góc chấp nhận được khi so sánh với oracle CÓ file ephemeris thật (`file_based`) — khớp mức đồng thuận chặt nhất quan sát được giữa các engine dùng Swiss Ephemeris trong benchmark audit (≤0.0002°). */
export const ANGULAR_TOLERANCE_FILE_BASED_DEGREES = 0.0001;

/** Sai số góc chấp nhận được khi so sánh với oracle chỉ có `analytic_fallback` (Moshier) — audit ghi nhận sai lệch có thể tới ~0.36° ở divisional chart bị khuếch đại, nên dùng ngưỡng rộng hơn hẳn cho vị trí hành tinh thô (KHÔNG áp dụng ngưỡng này cho divisional chart nhân bội — Phase 4+ tự định nghĩa lại nếu cần). */
export const ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES = 0.01;

/**
 * Làm tròn một giá trị độ CHỈ để hiển thị — KHÔNG BAO GIỜ dùng giá trị trả về của hàm này làm
 * đầu vào cho một phép tính khác. Nếu cần độ chính xác nội bộ, dùng giá trị gốc (double), không
 * qua hàm này.
 */
export function roundForDisplay(degrees: number, fractionDigits = 4): number {
  const factor = 10 ** fractionDigits;
  return Math.round(degrees * factor) / factor;
}

/**
 * Kiểm tra hai giá trị góc (độ) có "bằng nhau" trong dung sai cho trước hay không — dùng cho
 * golden test, KHÔNG dùng `===`/`toBe()` trực tiếp trên số thực (dấu phẩy động không bao giờ
 * đảm bảo bằng tuyệt đối giữa hai lần tính độc lập).
 */
export function isWithinTolerance(actual: number, expected: number, toleranceDegrees: number): boolean {
  return Math.abs(actual - expected) <= toleranceDegrees;
}
