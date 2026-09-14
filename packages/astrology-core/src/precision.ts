/**
 * Precision Policy — Astrology Module Phase 1.
 * Đúng docs/astrology-module/ARCHITECTURE/TEST_ARCHITECTURE.md §Precision.
 *
 * Nguyên tắc bắt buộc: mọi giá trị số trong domain model (BirthData đã resolve, sau này
 * PlanetPosition/Chart ở Phase 2+) lưu ở INTERNAL PRECISION (double-precision, KHÔNG làm
 * tròn) xuyên suốt tính toán. Làm tròn (DISPLAY PRECISION) chỉ xảy ra ở biên trình bày, KHÔNG
 * BAO GIỜ ở giữa một chuỗi tính toán — `round()` không phải "chân lý tính toán".
 */

import type { PrecisionClass } from "./astronomical/AstronomicalProvider.js";
import { ZODIAC_SIGNS, type ZodiacSign } from "./chart/types.js";

/**
 * Chuẩn hoá một giá trị độ về [0,360) — HÀM HÌNH HỌC THUẦN, trung lập trường phái, KHÔNG biết gì
 * về sign/house/aspect/ayanamsa/nakshatra. Trích xuất ở Phase 4 Step 2 từ 5 bản implementation
 * ĐỘC LẬP giống hệt nhau (byte-for-byte, xác nhận bằng đọc trực tiếp, không suy đoán) từng nằm
 * rải rác ở `western/aspects.ts`, `western/housePlacement.ts`, `western/houses.ts`,
 * `western/zodiac.ts`, `astronomical/providers/SwissEphemerisProvider.ts` — đúng yêu cầu ADR-003
 * §Consequences ("some genuinely shared math... must live in a neutral shared utility module, not
 * duplicated per school... this utility module must contain zero astrological judgment, only
 * geometry"). Đặt ở `precision.ts` (không phải `western/`/`vedic/`/`astronomical/providers/`) để
 * trường phái tương lai (Vedic — Nakshatra cũng cần đúng phép chuẩn hoá này) tái dùng được mà
 * KHÔNG tạo phụ thuộc chéo trường phái.
 *
 * ĐÂY LÀ REFACTOR THUẦN TUÝ — thuật toán giữ NGUYÊN VĂN, không "cải tiến", kể cả hành vi biên
 * (edge case) sau đây đã xác nhận bằng thực thi trực tiếp trước khi trích xuất: với một bội số
 * ÂM chính xác của 360 (vd. -360, -720), `value % 360` cho ra `-0` (âm) trong JavaScript, và
 * `-0 < 0` là `false`, nên nhánh `+360` KHÔNG được áp dụng — kết quả trả về là `-0`, KHÔNG phải
 * `0` dương. Hành vi này được GIỮ NGUYÊN (không có bằng chứng nào cho thấy nó gây lỗi ở bất kỳ
 * call site nào hiện tại — `-0 === 0` trong mọi phép so sánh/số học JavaScript thông thường).
 */
export function normalizeDegrees(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

const DEGREES_PER_SIGN = 30;

/**
 * Longitude (độ hoàng đạo, bất kỳ giá trị nào, tự chuẩn hoá về [0,360) trước khi tính) → 1 trong
 * 12 cung — HÀM HÌNH HỌC THUẦN, quy ước toán học phổ quát (0°-30° Aries, 30°-60° Taurus, ...),
 * KHÔNG phải quyết định riêng của trường phái nào (đúng `ZodiacSign`'s doc comment ở
 * `chart/types.ts`: "giống nhau ở cả tropical lẫn sidereal, chỉ điểm 0° khác nhau"). Trích xuất
 * ở Phase 4 Step 3 từ `western/zodiac.ts` (Phase 3B-2) sang đây — CÙNG lý do ADR-003 đã dùng cho
 * `normalizeDegrees` ở Step 2: Vedic (Phase 4+) cần đúng phép ánh xạ cung NÀY sau khi tự trừ
 * ayanamsa (KHÔNG phải một hàm khác), nhưng `vedic/` không được phép import `western/` (school
 * isolation) — nên hàm sống ở tầng trung lập này, `western/zodiac.ts` giữ lại làm re-export
 * tương thích ngược (KHÔNG có logic riêng, chỉ 1 implementation DUY NHẤT ở đây).
 */
export function signOfLongitude(longitude: number): ZodiacSign {
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(11, Math.floor(normalized / DEGREES_PER_SIGN));
  const sign = ZODIAC_SIGNS[index];
  if (sign === undefined) {
    // Không thể xảy ra với normalized trong [0,360) — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`signOfLongitude: chỉ số cung không hợp lệ (${index}) cho longitude=${longitude}.`);
  }
  return sign;
}

/**
 * Vị trí TRONG cung (0..30) của một longitude — LUÔN đi cùng `signOfLongitude(longitude)` (cùng
 * một longitude), không dùng riêng lẻ. Cùng nguồn gốc/lý do trích xuất như `signOfLongitude` ở
 * trên.
 */
export function signDegreeOfLongitude(longitude: number): number {
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(11, Math.floor(normalized / DEGREES_PER_SIGN));
  return normalized - index * DEGREES_PER_SIGN;
}

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

/**
 * Sai số góc (độ bất định lan truyền) tương ứng một `PrecisionClass` — dùng để điền
 * `NormalizedPlanetPosition.precision` (Phase 3B-2). TÁI DÙNG 2 hằng số dung sai golden test đã
 * có ở trên thay vì bịa số riêng — cùng một con số vừa là "dung sai chấp nhận khi so oracle" vừa
 * là "độ bất định thực tế của phép tính" là hợp lý vì cả hai đều mô tả CÙNG một giới hạn độ
 * chính xác thực tế của Swiss Ephemeris ở từng precisionClass.
 *
 * `"unknown"` trả `NaN` — KHÔNG đoán một con số cụ thể khi bản thân provider cũng không biết độ
 * chính xác của nó (vd. `UnimplementedAstronomicalProvider`); đoán một số "để có giá trị" sẽ vi
 * phạm nguyên tắc "không dùng dung sai tuỳ tiện". Trong thực tế nhánh này khó xảy ra: một
 * provider báo `precisionClass: "unknown"` thường cũng throw ở chính phép tính hành tinh
 * (`UnimplementedAstronomicalProvider` luôn throw), nên hiếm khi có `PlanetPosition` thật để gắn
 * giá trị `NaN` này vào.
 */
export function angularPrecisionForClass(precisionClass: PrecisionClass): number {
  switch (precisionClass) {
    case "file_based":
      return ANGULAR_TOLERANCE_FILE_BASED_DEGREES;
    case "analytic_fallback":
      return ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES;
    case "unknown":
      return Number.NaN;
  }
}

/** Biểu diễn độ-phút-giây — CHỈ dùng để hiển thị (giống `roundForDisplay`), KHÔNG BAO GIỜ dùng làm đầu vào cho phép tính khác. `seconds` giữ nguyên phần thập phân (KHÔNG làm tròn) — caller tự làm tròn seconds nếu cần chuỗi hiển thị "sạch". */
export interface DegreesMinutesSeconds {
  degrees: number;
  minutes: number;
  seconds: number;
}

/**
 * Quy đổi độ thập phân sang độ-phút-giây. `NormalizedPlanetPosition`/`NormalizedAngle`/
 * `NormalizedHouseCusp` CHỈ lưu độ thập phân (`longitude`/`signDegree`) — hợp đồng dữ liệu hiện
 * tại KHÔNG có field DMS nào (xác nhận bằng đọc `chart/types.ts`, không suy đoán) — vì vậy hàm
 * này là TIỆN ÍCH HIỂN THỊ độc lập, KHÔNG gắn vào bất kỳ field nào của `NormalizedChart`. Dùng
 * được cho CẢ longitude đầy đủ (0-360) lẫn signDegree (0-30) — cùng một phép toán.
 */
export function toDegreesMinutesSeconds(decimalDegrees: number): DegreesMinutesSeconds {
  const totalSeconds = decimalDegrees * 3600;
  const degrees = Math.trunc(totalSeconds / 3600);
  const remainderAfterDegrees = totalSeconds - degrees * 3600;
  const minutes = Math.trunc(remainderAfterDegrees / 60);
  const seconds = remainderAfterDegrees - minutes * 60;
  return { degrees, minutes, seconds };
}
