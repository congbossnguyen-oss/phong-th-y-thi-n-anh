/**
 * V1.1 Vedic Divisional Charts (Varga).
 * Batch 1: D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa).
 * Batch 2: D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa) — xem `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`
 * §"Batch 2 — D7/D9/D10 Preflight" cho toàn bộ nghiên cứu/oracle evidence đứng sau các công thức
 * dưới đây.
 * Tầng "Chart Calculation" phía Vedic, tiếp theo `vedic/rashi.ts`/`vedic/ascendant.ts` — biến MỘT
 * cặp (Rashi, độ trong cung) đã có (D1) thành Rashi tương ứng ở một Varga cụ thể. KHÔNG tính D1
 * (đã có ở `rashi.ts`/`ascendant.ts`), KHÔNG tính D12/D16/D20/D24/D27/D30/D40/D45/D60 (ngoài phạm
 * vi Batch 1+2 — D60 vẫn DEFERRED), KHÔNG lắp vào `NormalizedChart`/`vedic/chart.ts` (quyết định
 * CF.4/CF.10 — "standalone calculation API", không nhúng full nested chart, không đổi schema).
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
 * Resolution"/"Batch 2 — D7/D9/D10 Preflight"), và tái xác nhận bằng cách CHẠY TRỰC TIẾP cả hai
 * oracle cho toàn bộ boundary/benchmark case trong TỪNG implementation task (Batch 1: PyJHora
 * `chart_method=2` cho D2 + default cho D3/D4; Batch 2: PyJHora `chart_method=1` cho D7/D9/D10 —
 * xem `V1_1_DIVISIONAL_CHARTS_IMPLEMENTATION.md` §"Oracle Validation").
 *
 * D7/D9 REPEATING-FRACTION BOUNDARY (Batch 2): `30/7` và `30/9` không có biểu diễn nhị phân hữu
 * hạn. Preflight đã xác nhận (đọc trực tiếp + thực nghiệm) rằng PyJHora dùng toán tử Python `//`
 * cho phép chia phần-nguyên, và toán tử này CÓ SAI SỐ tại một số giá trị biên chính xác về mặt
 * toán học (vd. `(5*30/7) // (30.0/7)` cho `4.0` dù thương số đúng là `5.0`) — đây là lỗi
 * floating-point CỦA PYTHON, KHÔNG PHẢI quy ước chiêm tinh khác. Quyết định (đã freeze ở
 * preflight): dùng `Math.floor(signDegree / partWidth)` — KHỚP vedic-calc, KHÔNG tái tạo lỗi `//`
 * của PyJHora — đã kiểm chứng thực nghiệm AN TOÀN trong JavaScript (3 triệu điểm mẫu, 0 sai khác
 * so với công thức nhân-trước-rồi-chia). KHÔNG thêm epsilon nào — đây là `Math.floor` thuần, không
 * phải workaround.
 */

import { ZODIAC_SIGNS, type ZodiacSign } from "../chart/types.js";

/** 6 Varga có trong Batch 1+2 — union đóng, CHỈ mở rộng khi một batch triển khai kế tiếp thực sự cần (không thêm D12+ trước — đúng chỉ dẫn "Do not over-engineer"). */
export type VargaId = 2 | 3 | 4 | 7 | 9 | 10;

/**
 * Đếm tới trước `offset` cung kể từ `fromSign`, quấn vòng mod 12 — PRIMITIVE DÙNG CHUNG cho MỌI
 * Varga có dạng "phần thứ N của cung → đếm tới N cung từ một cung gốc" (D3/D4 ở Batch 1; D7/D9/D10
 * ở Batch 2; cùng hình dạng D12/D16/D20/D24/D27/D40/D45 sẽ dùng ở các batch sau — KHÔNG viết lại).
 * D2 KHÔNG dùng hàm này (không phải phép đếm cung, xem `getD2HoraSign`).
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

/** 4 nguyên tố (element) — Hoả/Thổ/Khí/Thuỷ lặp lại mỗi 4 cung, dùng riêng cho D9 (Batch 2). Chỉ số 0=Hoả,1=Thổ,2=Khí,3=Thuỷ — đối chiếu `_sign_element` vedic-calc (`(sign.value-1)%4`, 1-indexed) quy về cùng công thức trên `ZODIAC_SIGNS`'s chỉ số 0-indexed. */
function getElementIndex(sign: ZodiacSign): number {
  return ZODIAC_SIGNS.indexOf(sign) % 4;
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
// D7 — Saptamsa. Contract: "Batch 2 — D7/D9/D10 Preflight" — PyJHora `chart_method=1`
// (`PARASARA_EVEN_START_7TH_GO_FORWARD`, tự nhận "Traditional Parasara") == vedic-calc's DUY
// NHẤT implementation D7. 7 phần `30/7`° mỗi cung; cung lẻ đếm tới `part` cung từ chính nó; cung
// chẵn đếm tới `part + 6` cung (6 = nhà thứ 7, 0-indexed — `const.HOUSE_7 = 6` PyJHora).
// ---------------------------------------------------------------------------------------

const D7_PART_WIDTH_DEGREES = 30 / 7;
/** Offset cho cung chẵn = nhà thứ 7 tính từ chính cung đó (0-indexed) — cung lẻ dùng offset = part (không cộng thêm). */
const D7_EVEN_SIGN_HOUSE_OFFSET = 6;

/** D7 (Saptamsa): part = floor(signDegree / (30/7)); cung lẻ → đếm tới `part`; cung chẵn → đếm tới `part + 6`, từ `sign`. */
export function getD7SaptamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(6, Math.floor(signDegree / D7_PART_WIDTH_DEGREES));
  const offset = isOddSign(sign) ? part : part + D7_EVEN_SIGN_HOUSE_OFFSET;
  return countSignsForward(sign, offset);
}

// ---------------------------------------------------------------------------------------
// D9 — Navamsa. Contract: "Batch 2 — D7/D9/D10 Preflight" — PyJHora `chart_method=1`
// (`PARASARA_TRADITIONAL`) == vedic-calc's DUY NHẤT implementation D9. 9 phần `30/9 = 10/3`°
// mỗi cung; cung bắt đầu xác định theo NGUYÊN TỐ (element) của cung D1 — Hoả→Aries, Thuỷ→Cancer,
// Khí→Libra, Thổ→Capricorn — rồi LUÔN đếm tới trước (KHÔNG có nhánh lẻ/chẵn, KHÔNG phải
// movable/fixed/dual — đã xác nhận trực tiếp từ source CẢ HAI oracle, không suy đoán từ trí nhớ).
// ---------------------------------------------------------------------------------------

const D9_PART_WIDTH_DEGREES = 30 / 9;
/** Cung bắt đầu theo nguyên tố — chỉ số khớp `getElementIndex()`: 0=Hoả→Aries, 1=Thổ→Capricorn, 2=Khí→Libra, 3=Thuỷ→Cancer (đối chiếu `_ELEMENT_STARTS[9]` vedic-calc). */
const D9_ELEMENT_START_SIGNS: readonly [ZodiacSign, ZodiacSign, ZodiacSign, ZodiacSign] = ["aries", "capricorn", "libra", "cancer"];

/** D9 (Navamsa): part = floor(signDegree / (30/9)); cung bắt đầu theo nguyên tố của `sign`, rồi đếm tới `part` cung từ đó. */
export function getD9NavamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(8, Math.floor(signDegree / D9_PART_WIDTH_DEGREES));
  const elementIndex = getElementIndex(sign);
  const startSign = D9_ELEMENT_START_SIGNS[elementIndex];
  if (startSign === undefined) {
    // Không thể xảy ra: `getElementIndex` luôn trả về [0,3] (`% 4`), khớp đúng 4 phần tử D9_ELEMENT_START_SIGNS — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getD9NavamsaSign: elementIndex không hợp lệ (${elementIndex}) cho sign=${sign}.`);
  }
  return countSignsForward(startSign, part);
}

// ---------------------------------------------------------------------------------------
// D10 — Dasamsa. Contract: "Batch 2 — D7/D9/D10 Preflight" — PyJHora `chart_method=1`
// (`TRADITIONAL_PARASARA_START_9TH_FORWARD`) == vedic-calc's DUY NHẤT implementation D10. 10
// phần 3° mỗi cung (chia hết, không có vấn đề phân số tuần hoàn như D7/D9); cung lẻ đếm tới
// `part` cung từ chính nó; cung chẵn đếm tới `part + 8` cung (8 = nhà thứ 9, 0-indexed —
// `const.HOUSE_9 = 8` PyJHora).
// ---------------------------------------------------------------------------------------

const D10_PART_WIDTH_DEGREES = 3;
/** Offset cho cung chẵn = nhà thứ 9 tính từ chính cung đó (0-indexed) — cung lẻ dùng offset = part (không cộng thêm). */
const D10_EVEN_SIGN_HOUSE_OFFSET = 8;

/** D10 (Dasamsa): part = floor(signDegree / 3); cung lẻ → đếm tới `part`; cung chẵn → đếm tới `part + 8`, từ `sign`. */
export function getD10DasamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(9, Math.floor(signDegree / D10_PART_WIDTH_DEGREES));
  const offset = isOddSign(sign) ? part : part + D10_EVEN_SIGN_HOUSE_OFFSET;
  return countSignsForward(sign, offset);
}

// ---------------------------------------------------------------------------------------
// Standalone API — điểm vào chung cho Batch 1+2 (CF.4: "standalone calculation API",
// "explicit Varga identifier", "must not expose Swiss-specific types"). KHÔNG lắp vào
// `NormalizedChart`/`vedic/chart.ts` (ngoài phạm vi task này).
// ---------------------------------------------------------------------------------------

/**
 * Tính Rashi của MỘT hành tinh/điểm (Ascendant, ...) ở một Varga cụ thể — nhận `sign`/`signDegree`
 * D1 ĐÃ CÓ (từ `calculateRashi()`/`calculateVedicAscendant()`), KHÔNG tự tính D1. `varga` giới hạn
 * {2,3,4,7,9,10} ở Batch 1+2 (TypeScript union đóng chặn giá trị khác tại compile time — D12/D60/...
 * không thể truyền vào cho tới khi có batch triển khai riêng).
 */
export function getDivisionalSign(varga: VargaId, sign: ZodiacSign, signDegree: number): ZodiacSign {
  switch (varga) {
    case 2:
      return getD2HoraSign(sign, signDegree);
    case 3:
      return getD3DrekkanaSign(sign, signDegree);
    case 4:
      return getD4ChaturthamsaSign(sign, signDegree);
    case 7:
      return getD7SaptamsaSign(sign, signDegree);
    case 9:
      return getD9NavamsaSign(sign, signDegree);
    case 10:
      return getD10DasamsaSign(sign, signDegree);
  }
}
