/**
 * V1.1 Batch 1 — Vedic Divisional Charts (Varga): D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa).
 * Tầng "Chart Calculation" phía Vedic, tiếp theo `vedic/rashi.ts`/`vedic/ascendant.ts` — biến MỘT
 * cặp (Rashi, độ trong cung) đã có (D1) thành Rashi tương ứng ở một Varga cụ thể. KHÔNG tính D1
 * (đã có ở `rashi.ts`/`ascendant.ts`), KHÔNG tính D7/D9/D10/D12/D16/D20/D24/D27/D30/D40/D45/D60
 * (ngoài phạm vi Batch 1 — xem `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md` §"Batch 1 Implementation
 * Gate"), KHÔNG lắp vào `NormalizedChart`/`vedic/chart.ts` (quyết định CF.4/CF.10 — "standalone
 * calculation API", không nhúng full nested chart, không đổi schema).
 *
 * HOÀN TOÀN THUẦN — không cần `AstronomicalProvider`, không cần `Date` — giống hệt
 * `vedic/houses.ts::getWholeSignHouseNumber` (chỉ cần Rashi/độ đã có). KHÔNG import `western/`
 * (Rule A). KHÔNG import `sweph` (Rule B — không có cơ hội vi phạm, file không đụng provider).
 *
 * TIỀN ĐIỀU KIỆN của mọi hàm trong file này: `signDegree` PHẢI nằm trong [0, 30) — đúng bất biến
 * `precision.ts::signDegreeOfLongitude()` đã đảm bảo (longitude luôn được `normalizeDegrees` về
 * [0,360) trước, nên độ trong cung không bao giờ chạm 30). Caller phải truyền `signDegree` lấy
 * trực tiếp từ `RashiResult.rashiDegree`/`VedicAscendantResult.rashiDegree` (hoặc tương đương),
 * KHÔNG tự bịa một giá trị ngoài [0,30).
 *
 * NGUỒN CÔNG THỨC — đã đối chiếu trực tiếp với CẢ HAI oracle's SOURCE CODE (không suy đoán) trong
 * `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md` (Appendix A + "D2 Method Resolution"/"D30 Boundary
 * Resolution"), và tái xác nhận bằng cách CHẠY TRỰC TIẾP cả hai oracle cho toàn bộ boundary/
 * benchmark case trong implementation task này (kết quả khớp tuyệt đối 100% giữa PyJHora
 * `chart_method=2` cho D2 + default cho D3/D4, và vedic-calc's `_get_divisional_sign` — xem
 * `V1_1_DIVISIONAL_CHARTS_IMPLEMENTATION.md` §"Oracle Validation").
 */

import { ZODIAC_SIGNS, type ZodiacSign } from "../chart/types.js";

/** 3 Varga có trong Batch 1 — union đóng, CHỈ mở rộng khi một batch triển khai kế tiếp thực sự cần (không thêm D7+ trước — đúng chỉ dẫn "Do not over-engineer"). */
export type VargaId = 2 | 3 | 4;

/**
 * Đếm tới trước `offset` cung kể từ `fromSign`, quấn vòng mod 12 — PRIMITIVE DÙNG CHUNG cho MỌI
 * Varga có dạng "phần thứ N của cung → đếm tới N cung từ một cung gốc" (D3/D4 ở Batch 1; cùng
 * hình dạng D7/D9/D10/D12/D16/D20/D24/D27/D40/D45 sẽ dùng ở các batch sau — KHÔNG viết lại). D2
 * KHÔNG dùng hàm này (không phải phép đếm cung, xem `getD2HoraSign`).
 */
export function countSignsForward(fromSign: ZodiacSign, offset: number): ZodiacSign {
  const fromIndex = ZODIAC_SIGNS.indexOf(fromSign);
  const index = (((fromIndex + offset) % 12) + 12) % 12;
  const sign = ZODIAC_SIGNS[index];
  if (sign === undefined) {
    // Không thể xảy ra: `index` luôn trong [0,11] sau phép `% 12` kép ở trên — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`countSignsForward: chỉ số cung không hợp lệ (${index}) cho fromSign=${fromSign}, offset=${offset}.`);
  }
  return sign;
}

/** Cung "lẻ" (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius — vị trí 1-indexed lẻ) — quy ước Parashari dùng xuyên suốt D2/D3(không cần)/D7/D10/D24/D40 (đối chiếu `_is_odd_sign` vedic-calc + `const.odd_signs` PyJHora). */
function isOddSign(sign: ZodiacSign): boolean {
  return ZODIAC_SIGNS.indexOf(sign) % 2 === 0;
}

// ---------------------------------------------------------------------------------------
// D2 — Hora. Contract: "D2 METHOD RESOLUTION" (V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md) — CHỌN
// ĐÚNG PyJHora chart_method=2 "Traditional Parasara (Only Le & Cn)" == vedic-calc's DUY NHẤT
// implementation D2. KHÔNG dùng PyJHora chart_method=1 (mặc định của chính PyJHora, "Uma
// Shambu"/"PVR" — một biến thể có tên tác giả riêng, KHÔNG được chính PyJHora gọi là
// "Traditional"). Chỉ có 2 cung kết quả khả dĩ: Leo, Cancer — cố định, KHÔNG suy ra từ `fromSign`
// nào (đây là lý do D2 không dùng `countSignsForward`).
// ---------------------------------------------------------------------------------------

/**
 * D2 (Hora): cung lẻ nửa đầu (< 15°) → Leo, nửa sau (>= 15°) → Cancer; cung chẵn ngược lại.
 * Biên 15° đúng quy ước open-upper toàn dự án (`signOfLongitude`/D30 resolution) — 15.0 chính
 * xác thuộc nửa SAU.
 */
export function getD2HoraSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const isFirstHalf = signDegree < 15;
  const odd = isOddSign(sign);
  if (odd) {
    return isFirstHalf ? "leo" : "cancer";
  }
  return isFirstHalf ? "cancer" : "leo";
}

// ---------------------------------------------------------------------------------------
// D3 — Drekkana. Contract: khớp PyJHora `_drekkana_chart_parasara` (default, `chart_method=1`)
// == vedic-calc's `_d3_drekkana` (đối chiếu trực tiếp Appendix A + oracle re-run task này) —
// 3 phần 10° mỗi cung, offset (0, 4, 8) = cung gốc / cung thứ 5 / cung thứ 9 (tam hợp — cùng
// element).
// ---------------------------------------------------------------------------------------

const D3_PART_WIDTH_DEGREES = 10;
/** Offset đếm-tới-cung cho phần 0/1/2 — cung gốc (0), cung thứ 5 (offset 4), cung thứ 9 (offset 8) — tam hợp cùng element. */
const D3_PART_OFFSETS: readonly [number, number, number] = [0, 4, 8];

/** D3 (Drekkana): part = floor(signDegree / 10), rồi đếm tới `D3_PART_OFFSETS[part]` cung từ `sign`. */
export function getD3DrekkanaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(2, Math.floor(signDegree / D3_PART_WIDTH_DEGREES));
  const offset = D3_PART_OFFSETS[part];
  if (offset === undefined) {
    // Không thể xảy ra: `part` bị `Math.min(2, ...)` giới hạn trong {0,1,2}, khớp đúng 3 phần tử D3_PART_OFFSETS — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getD3DrekkanaSign: part không hợp lệ (${part}) cho signDegree=${signDegree}.`);
  }
  return countSignsForward(sign, offset);
}

// ---------------------------------------------------------------------------------------
// D4 — Chaturthamsa. Contract: khớp PyJHora `_chaturthamsa_parasara` (default, `chart_method=1`)
// == vedic-calc's generic engine's D4 branch (đối chiếu trực tiếp Appendix A + oracle re-run
// task này) — 4 phần 7.5° mỗi cung, offset = part × 3, KHÔNG phân biệt lẻ/chẵn.
// ---------------------------------------------------------------------------------------

const D4_PART_WIDTH_DEGREES = 7.5;
const D4_OFFSET_PER_PART = 3;

/** D4 (Chaturthamsa): part = floor(signDegree / 7.5), rồi đếm tới `part × 3` cung từ `sign`. */
export function getD4ChaturthamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(3, Math.floor(signDegree / D4_PART_WIDTH_DEGREES));
  return countSignsForward(sign, part * D4_OFFSET_PER_PART);
}

// ---------------------------------------------------------------------------------------
// Standalone API — điểm vào chung cho Batch 1 (CF.4: "standalone calculation API",
// "explicit Varga identifier", "must not expose Swiss-specific types"). KHÔNG lắp vào
// `NormalizedChart`/`vedic/chart.ts` (ngoài phạm vi task này).
// ---------------------------------------------------------------------------------------

/**
 * Tính Rashi của MỘT hành tinh/điểm (Ascendant, ...) ở một Varga cụ thể — nhận `sign`/`signDegree`
 * D1 ĐÃ CÓ (từ `calculateRashi()`/`calculateVedicAscendant()`), KHÔNG tự tính D1. `varga` giới hạn
 * {2,3,4} ở Batch 1 (TypeScript union đóng chặn giá trị khác tại compile time — D60/D30/... không
 * thể truyền vào cho tới khi có batch triển khai riêng).
 */
export function getDivisionalSign(varga: VargaId, sign: ZodiacSign, signDegree: number): ZodiacSign {
  switch (varga) {
    case 2:
      return getD2HoraSign(sign, signDegree);
    case 3:
      return getD3DrekkanaSign(sign, signDegree);
    case 4:
      return getD4ChaturthamsaSign(sign, signDegree);
  }
}
