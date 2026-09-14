/**
 * Phase 4 Step 4 — Vedic Nakshatra + Pada. Tầng "Chart Calculation" phía Vedic, tiếp theo
 * `vedic/rashi.ts` — biến longitude SIDEREAL đã có (Step 3's `calculateRashi().siderealLongitude`,
 * hoặc bất kỳ sidereal longitude nào khác) thành Nakshatra (1-27) + Pada (1-4) + Lord. KHÔNG tính
 * Dasha (Steps 5-6), KHÔNG divisional chart, KHÔNG house assignment, KHÔNG interpretation/scoring.
 *
 * HOÀN TOÀN THUẦN — KHÔNG cần `AstronomicalProvider` (khác `vedic/rashi.ts::calculateRashi`, vốn
 * cần gọi `provider.getAyanamsa()`): Nakshatra/Pada/Lord chỉ phụ thuộc longitude sidereal ĐÃ CÓ,
 * không cần thêm dữ kiện thiên văn nào khác. KHÔNG import `sweph` (Rule B — file này không đụng
 * `AstronomicalProvider` nên không có cơ hội vi phạm). KHÔNG import `western/` (Rule A).
 *
 * CÔNG THỨC (Section 3, xác nhận bằng đọc trực tiếp source code CẢ HAI oracle — KHÔNG dựa vào
 * kiến thức chung — xem docs/astrology-module/ARCHITECTURE/PHASE4_STEP4_NAKSHATRA.md):
 *   nakshatra_index (0-26) = floor(normalizeDegrees(longitude) / (360/27))
 *   pada (1-4)             = floor(degree_trong_nakshatra / (360/108)) + 1
 * Giống hệt PyJHora's `nakshatra_pada()` (`jhora/panchanga/drik.py`) và vedic-calc's
 * `longitude_to_nakshatra_info()` (`vedic_calc/chart/calculator.py`) — 2 implementation ĐỘC LẬP,
 * CÙNG công thức, xác nhận bằng đọc source, không phải suy luận.
 *
 * LORD: chu kỳ 9 hành tinh CỐ ĐỊNH (Ketu→Venus→Sun→Moon→Mars→Rahu→Jupiter→Saturn→Mercury, lặp lại
 * mỗi 9 Nakshatra — BPHS Chương 46, theo trích dẫn trong vedic-calc's `constants.py`) — xác nhận
 * KHỚP TUYỆT ĐỐI giữa `NAKSHATRA_LORDS` (vedic-calc) và `nakshatra_lords`/`vimsottari_adhipati_list`
 * (PyJHora's `const.py`, đối chiếu qua `utils.PLANET_NAMES`) cho ĐỦ 27 Nakshatra, không chỉ suy ra
 * từ chu kỳ 9 rồi giả định đúng — xem tài liệu trên cho bảng đối chiếu đầy đủ.
 *
 * CẬP NHẬT Phase 4 Step 6 (Vimshottari Dasha): `VimshottariLord` (union đóng 9 giá trị) + hàm
 * `getNakshatraDegree()` được thêm ở đây (tách từ bên trong `getNakshatraPada`, HÀNH VI KHÔNG
 * đổi) và `getNakshatraLord()` được gõ kiểu chính xác hơn (`VimshottariLord` thay vì `string` mở)
 * — CẢ HAI thay đổi đều tương thích ngược 100% (`VimshottariLord` là subtype của `string`, mọi
 * call site cũ như `NormalizedNakshatraPosition.lord: string` vẫn nhận giá trị bình thường) — làm
 * vậy để `vedic/dasha/vimshottari.ts` TÁI DÙNG được trực tiếp `NAKSHATRA_LORD_CYCLE`/
 * `getNakshatraDegree`/`getNakshatraLord`, KHÔNG viết lại một bảng 9-lord hay một phép tính
 * degree-trong-nakshatra THỨ HAI có thể lệch nhau ở biên (đúng yêu cầu Step 6 "Do not duplicate
 * Nakshatra lord mapping").
 */

import { normalizeDegrees } from "../precision.js";
import { NAKSHATRA_NAMES, type NakshatraName, type NakshatraPada, type NormalizedNakshatraPosition } from "../chart/types.js";

/** 360° / 27 = 13°20' — xác nhận khớp `one_star` (PyJHora) và `NAKSHATRA_SPAN` (vedic-calc). */
export const NAKSHATRA_SPAN_DEGREES = 360 / 27;

/** 360° / 108 = 3°20' (= NAKSHATRA_SPAN_DEGREES / 4) — xác nhận khớp `one_pada` (PyJHora) và `PADA_SPAN` (vedic-calc). */
export const NAKSHATRA_PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4;

/** 9 hành tinh Vimshottari — union đóng vì đây là danh sách CỐ ĐỊNH, không trường phái/nhánh Vedic nào có tập khác (cùng lý do `NakshatraName` đóng). */
export type VimshottariLord = "ketu" | "venus" | "sun" | "moon" | "mars" | "rahu" | "jupiter" | "saturn" | "mercury";

/**
 * Chu kỳ 9 lord, ĐÚNG THỨ TỰ Vimshottari cố định — Nakshatra index i (0-based) có lord
 * `NAKSHATRA_LORD_CYCLE[i % 9]`. Dùng modulo thay vì bảng tra cứu 27 phần tử lặp lại 3 lần —
 * BIỂU DIỄN TRỰC TIẾP quy luật thiên văn đã xác nhận (chu kỳ lặp mỗi 9), không phải bịa cách tối
 * ưu hoá không cần thiết. Export (Step 6) để `vedic/dasha/vimshottari.ts` tái dùng ĐÚNG mảng này
 * làm `VIMSHOTTARI_LORD_SEQUENCE` — KHÔNG viết lại.
 */
export const NAKSHATRA_LORD_CYCLE: readonly VimshottariLord[] = ["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"];

/**
 * Nakshatra index (0-26) chứa `siderealLongitude` (tự chuẩn hoá về [0,360) trước khi tính, KHÔNG
 * yêu cầu caller tự chuẩn hoá trước — cùng quy ước `signOfLongitude`). `Math.min(26, ...)` chỉ là
 * phòng vệ lý thuyết (matching vedic-calc's defensive clamp) — thực tế KHÔNG thể xảy ra vì
 * `normalizeDegrees()` luôn trả về < 360, nên `floor(<360 / 13.333...)` luôn <= 26.
 */
export function getNakshatraIndex(siderealLongitude: number): number {
  const normalized = normalizeDegrees(siderealLongitude);
  return Math.min(26, Math.floor(normalized / NAKSHATRA_SPAN_DEGREES));
}

/**
 * Độ TRONG Nakshatra (0..13°20') của `siderealLongitude` — tính từ CHÍNH `getNakshatraIndex()` đã
 * có (KHÔNG dùng `% NAKSHATRA_SPAN_DEGREES` độc lập) để loại trừ khả năng lệch nhau ở biên nổi.
 * Tách thành hàm riêng ở Step 6 (trước đó nằm inline trong `getNakshatraPada`, HÀNH VI GIỮ NGUYÊN
 * — xem test `getNakshatraPada` không đổi) để `vedic/dasha/vimshottari.ts`'s tính "elapsed
 * fraction" (Vimshottari balance) TÁI DÙNG đúng phép tính này, thay vì viết một modulo thứ hai.
 */
export function getNakshatraDegree(siderealLongitude: number): number {
  const normalized = normalizeDegrees(siderealLongitude);
  const index = getNakshatraIndex(siderealLongitude);
  return normalized - index * NAKSHATRA_SPAN_DEGREES;
}

/**
 * Pada (1-4) chứa `siderealLongitude` — LUÔN đi cùng `getNakshatraDegree`/`getNakshatraIndex` của
 * cùng longitude, cùng nguyên tắc "LUÔN đi cùng nhau" đã dùng cho
 * `signOfLongitude`/`signDegreeOfLongitude`.
 */
export function getNakshatraPada(siderealLongitude: number): NakshatraPada {
  const degreeInNakshatra = getNakshatraDegree(siderealLongitude);
  const pada = Math.min(4, Math.floor(degreeInNakshatra / NAKSHATRA_PADA_SPAN_DEGREES) + 1);
  return pada as NakshatraPada;
}

/** Lord của Nakshatra tại `nakshatraIndex` (0-26, LUÔN dùng cùng index đã tính từ `getNakshatraIndex`). */
export function getNakshatraLord(nakshatraIndex: number): VimshottariLord {
  const lord = NAKSHATRA_LORD_CYCLE[nakshatraIndex % NAKSHATRA_LORD_CYCLE.length];
  if (lord === undefined) {
    // Không thể xảy ra: `% 9` của bất kỳ số nguyên không âm nào luôn trong [0,8] — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getNakshatraLord: chỉ số lord không hợp lệ cho nakshatraIndex=${nakshatraIndex}.`);
  }
  return lord;
}

/**
 * Tính Nakshatra + Pada + Lord cho MỘT `siderealLongitude` đã có — HÀM THUẦN, KHÔNG cần
 * `AstronomicalProvider`. `body` do caller truyền vào (định danh hành tinh/điểm — KHÔNG tự suy ra
 * từ đâu, đúng `NormalizedNakshatraPosition.body`'s quy ước).
 */
export function calculateNakshatraPosition(body: string, siderealLongitude: number): NormalizedNakshatraPosition {
  const index = getNakshatraIndex(siderealLongitude);
  const name: NakshatraName | undefined = NAKSHATRA_NAMES[index];
  if (name === undefined) {
    // Không thể xảy ra: `getNakshatraIndex` luôn trả về 0-26, khớp đúng 27 phần tử NAKSHATRA_NAMES — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`calculateNakshatraPosition: chỉ số Nakshatra không hợp lệ (${index}) cho siderealLongitude=${siderealLongitude}.`);
  }
  return {
    body,
    name,
    pada: getNakshatraPada(siderealLongitude),
    lord: getNakshatraLord(index),
  };
}
