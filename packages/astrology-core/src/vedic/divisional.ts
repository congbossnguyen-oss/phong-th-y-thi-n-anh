/**
 * V1.1 Vedic Divisional Charts (Varga).
 * Batch 1: D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa).
 * Batch 2: D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa) — xem `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`
 * §"Batch 2 — D7/D9/D10 Preflight".
 * Batch 3: D12 (Dwadasamsa), D16 (Shodasamsa/Kalamsa), D20 (Vimsamsa) — xem
 * `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md` §"Batch 3 — D12/D16/D20 Preflight".
 * Batch 4: D24 (Chaturvimsamsa), D27 (Nakshatramsa/Bhamsa), D30 (Trimsamsa) — xem
 * `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md` §"Batch 4 — D24/D27/D30 Preflight".
 * Batch 5: D40 (Khavedamsa), D45 (Akshavedamsa) — xem `V1_1_DIVISIONAL_CHARTS_PREFLIGHT.md`
 * §"Batch 5 — D40/D45 Preflight" cho toàn bộ nghiên cứu/oracle evidence đứng sau các công thức
 * dưới đây.
 * Tầng "Chart Calculation" phía Vedic, tiếp theo `vedic/rashi.ts`/`vedic/ascendant.ts` — biến MỘT
 * cặp (Rashi, độ trong cung) đã có (D1) thành Rashi tương ứng ở một Varga cụ thể. KHÔNG tính D1
 * (đã có ở `rashi.ts`/`ascendant.ts`), KHÔNG tính D60 (ngoài phạm vi Batch 1+2+3+4+5 — D60 vẫn
 * DEFERRED), KHÔNG lắp vào `NormalizedChart`/`vedic/chart.ts` (quyết định CF.4/CF.10 —
 * "standalone calculation API", không nhúng full nested chart, không đổi schema).
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
 *
 * D12/D16/D20 KHÔNG có vấn đề phân số tuần hoàn (Batch 3, đã xác nhận trực tiếp + thực nghiệm ở
 * preflight): `30/12=2.5`, `30/16=1.875=15/8`, `30/20=1.5` ĐỀU là phân số nhị phân HỮU HẠN (mẫu số
 * là luỹ thừa của 2) — khác hẳn D7(`30/7`)/D9(`30/9`). `Math.floor(signDegree/partWidth)` an toàn
 * tuyệt đối cho cả ba (0 sai khác qua 5 triệu điểm mẫu mỗi Varga) — KHÔNG cần lưu ý đặc biệt nào
 * như D7/D9.
 *
 * D27 REPEATING-FRACTION BOUNDARY — MỨC ĐỘ NẶNG NHẤT (Batch 4, đã xác nhận trực tiếp + thực
 * nghiệm ở preflight): `30/27 = 10/9 = 1.1111...` cũng không có biểu diễn nhị phân hữu hạn, và lỗi
 * `//` của Python (cùng bản chất lỗi đã tìm thấy ở D7/D9) ảnh hưởng tới 10/26 biên nội bộ (~38%) —
 * NẶNG HƠN NHIỀU so với D7 (1/6) và D9 (2/8). Quyết định GIỐNG HỆT D7/D9: dùng
 * `Math.floor(signDegree/partWidth)`, KHÔNG tái tạo lỗi `//` của PyJHora — đã kiểm chứng AN TOÀN
 * trong JavaScript. D24 (`30/24=1.25=5/4`) và D30 (bảng khoảng độ cố định, biên là số nguyên) KHÔNG
 * có vấn đề phân số tuần hoàn.
 *
 * PHƯƠNG PHÁP KIỂM THỬ BIÊN (phát hiện mới ở Batch 4, áp dụng ngược cho mọi Varga phân số tuần
 * hoàn): giá trị biên dùng để test PHẢI dựng bằng `k * partWidth` (nhân với chính hằng số đã tính
 * sẵn), KHÔNG dựng bằng `k * 30 / N` (chia lại từ đầu) — hai cách viết toán học tương đương nhưng
 * có thể cho ra hai double khác nhau do làm tròn floating-point khác đường tính. Test biên D27
 * TRONG file test PHẢI dùng `k * D27_PART_WIDTH_DEGREES`-style construction.
 *
 * D45 REPEATING-FRACTION — PHÁT HIỆN MỚI Ở BATCH 5, KHÁC HẲN D7/D9/D27 (đã xác nhận trực tiếp +
 * thực nghiệm ở preflight): `30/45 = 2/3 = 0.6666...` không có biểu diễn nhị phân hữu hạn. NGOÀI
 * lỗi Python `//` quen thuộc của PyJHora (giải quyết GIỐNG HỆT D7/D9/D27 bằng `Math.floor`), D45
 * còn có một hiện tượng THỨ HAI, RIÊNG BIỆT, CHƯA từng gặp ở D7/D9/D27: dựng giá trị biên bằng
 * `k * partWidth` KHÔNG đảm bảo luôn rơi ĐÚNG-hoặc-TRÊN biên toán học thật — tại 5 giá trị k (rời
 * rạc), double `k * partWidth` rơi THẤP HƠN biên toán học thật một chút (vd. `k=7`: `7*(30/45) =
 * 4.666666666666666`, nhưng giá trị hữu tỉ đúng `14/3 = 4.666666666666667` — sai khác 1 ULP, đủ để
 * `Math.floor((7*w)/w)` cho `6` thay vì `7`). ĐÂY KHÔNG PHẢI lỗi của `Math.floor(signDegree/
 * partWidth)` — công thức runtime vẫn hoàn toàn xác định (deterministic) và đúng cho BẤT KỲ double
 * cụ thể nào nó nhận — đây là hạn chế của việc DỰNG giá trị test "đúng tại biên" khi biên toán học
 * là một số hữu tỉ (2/3) không có biểu diễn nhị phân chính xác. File test PHẢI xử lý 5 điểm này
 * riêng (dùng test-only helper `nextRepresentableDouble`/`previousRepresentableDouble` thay vì
 * `k*partWidth` để dựng "ngay trên"/"ngay dưới" biên hữu tỉ thật một cách trung thực, KHÔNG dùng
 * epsilon/tolerance để che). D40 (`30/40=0.75=3/4`) KHÔNG có bất kỳ vấn đề phân số tuần hoàn nào —
 * an toàn tuyệt đối, giống D24.
 *
 * D45 PyJHora `//` ARTIFACT — SỐ ĐIỂM CHÍNH XÁC PHỤ THUỘC CÁCH DỰNG BIÊN (phát hiện của Closure
 * Audit Batch 5, KHÔNG PHẢI lỗi implementation): probe oracle ban đầu (preflight + Batch 5 Oracle
 * Validation) dùng cách dựng THÔ (naive) `k*(30/45)` để feed PyJHora, và tìm thấy 12/44 biên khác biệt
 * (`k=5,10,13,17,20,23,26,29,34,37,40,43`). Nhưng bản thân PyJHora's Python `//` CŨNG nhạy cảm với
 * bit-pattern chính xác của input — khi feed PyJHora bằng đúng giá trị `(2*k)/3` (cách dựng ĐÚNG mà
 * test file thực sự dùng), Closure Audit xác nhận trực tiếp CHỈ CÒN 3 điểm thực sự khác biệt
 * (`k=13,26,29`); 9 điểm còn lại (`5,10,17,20,23,34,37,40,43`) hoá ra PyJHora ĐỒNG Ý với project khi
 * dùng đúng `(2*k)/3` — khác biệt trước đó chỉ là do bit-pattern khác nhau giữa `k*(30/45)` và
 * `(2*k)/3` tại các điểm đó (không phải 5 điểm hazard ở trên — đây là MỘT tập k khác, chỉ ảnh hưởng
 * input feed vào PyJHora, KHÔNG ảnh hưởng `Math.floor` của chính implementation này, vốn đã xác
 * nhận đồng nhất giữa hai cách dựng ở mọi k trừ 5 điểm hazard). Kết luận: chỉ 3/44 biên là PyJHora
 * discrepancy độc lập-với-cách-dựng (construction-independent); 12 là con số của một probe dùng
 * cách dựng khác với cách dựng được ship trong test, KHÔNG PHẢI số genuine discrepancy dưới hợp đồng
 * hiện tại. Xem `V1_1_DIVISIONAL_CHARTS_IMPLEMENTATION.md` §"D45 Oracle Artifact Classification".
 */

import { ZODIAC_SIGNS, type ZodiacSign } from "../chart/types.js";

/** 14 Varga có trong Batch 1+2+3+4+5 — union đóng, CHỈ mở rộng khi một batch triển khai kế tiếp thực sự cần (không thêm D60 trước — D60 vẫn DEFERRED). */
export type VargaId = 2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20 | 24 | 27 | 30 | 40 | 45;

/**
 * Đếm tới trước `offset` cung kể từ `fromSign`, quấn vòng mod 12 — PRIMITIVE DÙNG CHUNG cho MỌI
 * Varga có dạng "phần thứ N của cung → đếm tới N cung từ một cung gốc" (D3/D4 ở Batch 1; D7/D9/D10
 * ở Batch 2; D12/D16/D20 ở Batch 3; cùng hình dạng D24/D27/D40/D45 sẽ dùng ở các batch sau — KHÔNG
 * viết lại). D2 KHÔNG dùng hàm này (không phải phép đếm cung, xem `getD2HoraSign`).
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

/** 3 tam hợp cách (modality) — Cố định-khởi (movable)/Cố định (fixed)/Biến đổi (dual) lặp lại mỗi 3 cung, dùng riêng cho D16/D20 (Batch 3). Chỉ số 0=movable,1=fixed,2=dual — đối chiếu `_sign_modality` vedic-calc (`(sign.value-1)%3`, 1-indexed) quy về cùng công thức trên `ZODIAC_SIGNS`'s chỉ số 0-indexed. D12 KHÔNG dùng hàm này (canonical form không phân biệt modality — xem `getD12DwadasamsaSign`). */
function getModalityIndex(sign: ZodiacSign): number {
  return ZODIAC_SIGNS.indexOf(sign) % 3;
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
// D12 — Dwadasamsa. Contract: "Batch 3 — D12/D16/D20 Preflight" — PyJHora `chart_method=1`
// (`TRADITIONAL_PARASARA`) == vedic-calc's DUY NHẤT implementation D12. 12 phần 2.5° mỗi cung.
// KHÔNG có nhánh lẻ/chẵn, KHÔNG có modality/element nào trong canonical form — đã xác nhận trực
// tiếp từ source CẢ HAI oracle, không suy đoán: MỌI cung (bất kể lẻ/chẵn) đếm tới `part` cung từ
// chính nó.
// ---------------------------------------------------------------------------------------

const D12_PART_WIDTH_DEGREES = 30 / 12;

/** D12 (Dwadasamsa): part = floor(signDegree / 2.5); đếm tới `part` cung từ chính `sign` — KHÔNG phân biệt lẻ/chẵn/modality/element. */
export function getD12DwadasamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(11, Math.floor(signDegree / D12_PART_WIDTH_DEGREES));
  return countSignsForward(sign, part);
}

// ---------------------------------------------------------------------------------------
// D16 — Shodasamsa (còn gọi Kalamsa, cùng một Varga — KHÔNG phải phương pháp cạnh tranh).
// Contract: "Batch 3 — D12/D16/D20 Preflight" — PyJHora `chart_method=1` (`PARASARA_TRADITIONAL`)
// == vedic-calc's DUY NHẤT implementation D16. 16 phần 1.875° mỗi cung (= 30/16 = 15/8, phân số
// nhị phân HỮU HẠN — KHÔNG phải vấn đề phân số tuần hoàn như D7/D9). Cung bắt đầu theo TAM HỢP
// CÁCH (modality): movable→Aries, fixed→Leo, dual→Sagittarius.
// ---------------------------------------------------------------------------------------

const D16_PART_WIDTH_DEGREES = 30 / 16;
/** Cung bắt đầu theo modality cho D16 — chỉ số khớp `getModalityIndex()`: 0=movable→Aries, 1=fixed→Leo, 2=dual→Sagittarius (đối chiếu `_MODALITY_STARTS[16]` vedic-calc). KHÔNG dùng chung bảng với D20 (vai trò fixed/dual bị hoán đổi giữa hai Varga — xem `D20_MODALITY_START_SIGNS`). */
const D16_MODALITY_START_SIGNS: readonly [ZodiacSign, ZodiacSign, ZodiacSign] = ["aries", "leo", "sagittarius"];

/** D16 (Shodasamsa/Kalamsa): part = floor(signDegree / 1.875); cung bắt đầu theo modality của `sign`, rồi đếm tới `part` cung từ đó. */
export function getD16ShodasamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(15, Math.floor(signDegree / D16_PART_WIDTH_DEGREES));
  const modalityIndex = getModalityIndex(sign);
  const startSign = D16_MODALITY_START_SIGNS[modalityIndex];
  if (startSign === undefined) {
    // Không thể xảy ra: `getModalityIndex` luôn trả về [0,2] (`% 3`), khớp đúng 3 phần tử D16_MODALITY_START_SIGNS — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getD16ShodasamsaSign: modalityIndex không hợp lệ (${modalityIndex}) cho sign=${sign}.`);
  }
  return countSignsForward(startSign, part);
}

// ---------------------------------------------------------------------------------------
// D20 — Vimsamsa. Contract: "Batch 3 — D12/D16/D20 Preflight" — PyJHora `chart_method=1`
// (`PARASARA_TRADITIONAL`) == vedic-calc's DUY NHẤT implementation D20. 20 phần 1.5° mỗi cung.
// Cung bắt đầu theo modality: movable→Aries, dual→Leo, fixed→Sagittarius.
//
// QUAN TRỌNG — HOÁN ĐỔI so với D16: D16 gán fixed→Leo/dual→Sagittarius; D20 gán NGƯỢC LẠI
// dual→Leo/fixed→Sagittarius. Đã xác nhận trực tiếp, side-by-side, từ CẢ HAI oracle's source
// (không suy đoán từ sự giống nhau bề ngoài) — đây là chi tiết dễ nhầm nhất nếu implement bằng
// cách copy-paste bảng D16.
// ---------------------------------------------------------------------------------------

const D20_PART_WIDTH_DEGREES = 30 / 20;
/** Cung bắt đầu theo modality cho D20 — chỉ số khớp `getModalityIndex()`: 0=movable→Aries, 1=fixed→Sagittarius, 2=dual→Leo (đối chiếu `_MODALITY_STARTS[20]` vedic-calc). Vai trò fixed/dual HOÁN ĐỔI so với `D16_MODALITY_START_SIGNS` — KHÔNG dùng chung bảng. */
const D20_MODALITY_START_SIGNS: readonly [ZodiacSign, ZodiacSign, ZodiacSign] = ["aries", "sagittarius", "leo"];

/** D20 (Vimsamsa): part = floor(signDegree / 1.5); cung bắt đầu theo modality của `sign` (bảng KHÁC D16 — fixed/dual hoán đổi), rồi đếm tới `part` cung từ đó. */
export function getD20VimsamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(19, Math.floor(signDegree / D20_PART_WIDTH_DEGREES));
  const modalityIndex = getModalityIndex(sign);
  const startSign = D20_MODALITY_START_SIGNS[modalityIndex];
  if (startSign === undefined) {
    // Không thể xảy ra: `getModalityIndex` luôn trả về [0,2] (`% 3`), khớp đúng 3 phần tử D20_MODALITY_START_SIGNS — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getD20VimsamsaSign: modalityIndex không hợp lệ (${modalityIndex}) cho sign=${sign}.`);
  }
  return countSignsForward(startSign, part);
}

// ---------------------------------------------------------------------------------------
// D24 — Chaturvimsamsa (còn gọi Siddhamsa, cùng một Varga). Contract: "Batch 4 — D24/D27/D30
// Preflight" — PyJHora `chart_method=1` (`TRADITIONAL_PARASARA`) == vedic-calc's DUY NHẤT
// implementation D24. 24 phần 1.25° mỗi cung; cung lẻ đếm tới `part` cung TỪ LEO (seed cố định,
// KHÔNG phải từ chính cung); cung chẵn đếm tới `part` cung TỪ CANCER (seed cố định khác) — LUÔN
// đếm tới trước, KHÔNG đảo hướng (đảo hướng chỉ có ở method 2/3, KHÔNG implement).
// ---------------------------------------------------------------------------------------

const D24_PART_WIDTH_DEGREES = 30 / 24;
const D24_ODD_SIGN_SEED: ZodiacSign = "leo";
const D24_EVEN_SIGN_SEED: ZodiacSign = "cancer";

/** D24 (Chaturvimsamsa/Siddhamsa): part = floor(signDegree / 1.25); cung lẻ → đếm tới `part` cung từ Leo; cung chẵn → đếm tới `part` cung từ Cancer. */
export function getD24ChaturvimsamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(23, Math.floor(signDegree / D24_PART_WIDTH_DEGREES));
  const seed = isOddSign(sign) ? D24_ODD_SIGN_SEED : D24_EVEN_SIGN_SEED;
  return countSignsForward(seed, part);
}

// ---------------------------------------------------------------------------------------
// D27 — Nakshatramsa (còn gọi Bhamsa, cùng một Varga). Contract: "Batch 4 — D24/D27/D30
// Preflight" — PyJHora `chart_method=1` (`TRADITIONAL_PARASARA`) == vedic-calc's DUY NHẤT
// implementation D27. 27 phần `30/27 = 10/9`° mỗi cung; cung bắt đầu xác định theo NGUYÊN TỐ
// (element) của cung D1 — Hoả→Aries, Thổ→Cancer, Khí→Libra, Thuỷ→Capricorn — rồi LUÔN đếm tới
// trước. KHÔNG phải modality (KHÔNG dùng bảng D16/D20 — đã xác nhận trực tiếp từ source, không suy
// diễn từ D16/D20's hình dạng).
//
// D27 REPEATING-FRACTION: `30/27` không có biểu diễn nhị phân hữu hạn — xem ghi chú đầu file. Dùng
// `Math.floor(signDegree/partWidth)`, KHÔNG tái tạo lỗi `//` của PyJHora (ảnh hưởng 10/26 biên nội
// bộ trong PyJHora, đã xác nhận không phải khác biệt truyền thống mà là lỗi floating-point CỦA
// PYTHON).
// ---------------------------------------------------------------------------------------

const D27_PART_WIDTH_DEGREES = 30 / 27;
/** Cung bắt đầu theo nguyên tố cho D27 — chỉ số khớp `getElementIndex()`: 0=Hoả→Aries, 1=Thổ→Cancer, 2=Khí→Libra, 3=Thuỷ→Capricorn (đối chiếu `_ELEMENT_STARTS[27]` vedic-calc). KHÁC D9's bảng nguyên tố (`D9_ELEMENT_START_SIGNS`) — KHÔNG dùng chung. */
const D27_ELEMENT_START_SIGNS: readonly [ZodiacSign, ZodiacSign, ZodiacSign, ZodiacSign] = ["aries", "cancer", "libra", "capricorn"];

/** D27 (Nakshatramsa/Bhamsa): part = floor(signDegree / (30/27)); cung bắt đầu theo nguyên tố của `sign`, rồi đếm tới `part` cung từ đó. */
export function getD27NakshatramsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(26, Math.floor(signDegree / D27_PART_WIDTH_DEGREES));
  const elementIndex = getElementIndex(sign);
  const startSign = D27_ELEMENT_START_SIGNS[elementIndex];
  if (startSign === undefined) {
    // Không thể xảy ra: `getElementIndex` luôn trả về [0,3] (`% 4`), khớp đúng 4 phần tử D27_ELEMENT_START_SIGNS — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getD27NakshatramsaSign: elementIndex không hợp lệ (${elementIndex}) cho sign=${sign}.`);
  }
  return countSignsForward(startSign, part);
}

// ---------------------------------------------------------------------------------------
// D30 — Trimsamsa. Contract: "Batch 4 — D24/D27/D30 Preflight" (tái xác nhận CONFIRMED — không
// đổi contract so với D30 Boundary Resolution gốc) — PyJHora `chart_method=1`
// (`TRADITIONAL_PARASARA`) == vedic-calc's DUY NHẤT implementation D30. KHÔNG phải công thức
// part=floor(...)/countSignsForward — D30 là TRA BẢNG khoảng độ KHÔNG ĐỀU theo lẻ/chẵn (giống D2 —
// special case riêng, KHÔNG dùng primitive chung). Biên đóng-dưới/mở-trên (closed-lower/open-upper)
// — TẠI ĐÚNG biên, kết quả thuộc khoảng SAU/TRÊN, KHÔNG tái tạo lỗi inclusive-both-ends-list-scan
// của PyJHora (khiến biên thuộc khoảng dưới — đã xác nhận đây là library artifact, KHÔNG phải quy
// ước truyền thống khác).
// ---------------------------------------------------------------------------------------

/** Bảng tra D30 cho cung lẻ — (ngưỡng trên, cung đích), ĐÃ SẮP THEO THỨ TỰ TĂNG DẦN, biên đóng-dưới/mở-trên: signDegree < ngưỡng[i] → cung đích[i]. Đối chiếu `charts.py:1150` PyJHora + `divisional.py:187-197` vedic-calc — khớp bit-for-bit cả hai oracle (đã xác nhận range-by-range). */
const D30_ODD_SIGN_RANGES: readonly (readonly [number, ZodiacSign])[] = [
  [5, "aries"],
  [10, "aquarius"],
  [18, "sagittarius"],
  [25, "gemini"],
  [30, "libra"],
];

/** Bảng tra D30 cho cung chẵn — cùng quy ước với `D30_ODD_SIGN_RANGES`. Đối chiếu `charts.py:1151` PyJHora + `divisional.py:198-208` vedic-calc. */
const D30_EVEN_SIGN_RANGES: readonly (readonly [number, ZodiacSign])[] = [
  [5, "taurus"],
  [12, "virgo"],
  [20, "pisces"],
  [25, "capricorn"],
  [30, "scorpio"],
];

/** D30 (Trimsamsa): tra bảng khoảng độ KHÔNG đều theo lẻ/chẵn của `sign` — KHÔNG dùng `countSignsForward`/`part=floor(...)`. Biên closed-lower/open-upper: `signDegree` thuộc khoảng đầu tiên có ngưỡng trên LỚN HƠN `signDegree` (không phải `>=`). */
export function getD30TrimsamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const ranges = isOddSign(sign) ? D30_ODD_SIGN_RANGES : D30_EVEN_SIGN_RANGES;
  for (const [upperBound, destinationSign] of ranges) {
    if (signDegree < upperBound) {
      return destinationSign;
    }
  }
  // Không thể xảy ra: tiền điều kiện `signDegree < 30` (đầu file) đảm bảo phần tử cuối (ngưỡng 30) luôn khớp — phòng vệ cho trường hợp vi phạm tiền điều kiện.
  throw new Error(`getD30TrimsamsaSign: signDegree=${signDegree} không khớp khoảng nào (vi phạm tiền điều kiện [0,30)).`);
}

// ---------------------------------------------------------------------------------------
// D40 — Khavedamsa. Contract: "Batch 5 — D40/D45 Preflight" — PyJHora `chart_method=1`
// (`PARASARA_TRADITIONAL`) == vedic-calc's DUY NHẤT implementation D40. 40 phần 0.75° mỗi cung;
// cung lẻ đếm tới `part` cung TỪ ARIES (seed cố định); cung chẵn đếm tới `part` cung TỪ LIBRA
// (seed cố định khác) — LUÔN đếm tới trước. Cùng hình dạng D7/D10/D24 (odd/even với seed cố định).
// ---------------------------------------------------------------------------------------

const D40_PART_WIDTH_DEGREES = 30 / 40;
const D40_ODD_SIGN_SEED: ZodiacSign = "aries";
const D40_EVEN_SIGN_SEED: ZodiacSign = "libra";

/** D40 (Khavedamsa): part = floor(signDegree / 0.75); cung lẻ → đếm tới `part` cung từ Aries; cung chẵn → đếm tới `part` cung từ Libra. */
export function getD40KhavedamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(39, Math.floor(signDegree / D40_PART_WIDTH_DEGREES));
  const seed = isOddSign(sign) ? D40_ODD_SIGN_SEED : D40_EVEN_SIGN_SEED;
  return countSignsForward(seed, part);
}

// ---------------------------------------------------------------------------------------
// D45 — Akshavedamsa. Contract: "Batch 5 — D40/D45 Preflight" — PyJHora `chart_method=1`
// (`PARASARA_TRADITIONAL`) == vedic-calc's DUY NHẤT implementation D45. 45 phần `30/45 = 2/3`°
// mỗi cung; cung bắt đầu theo TAM HỢP CÁCH (modality): movable→Aries, fixed→Leo, dual→Sagittarius
// — XÁC NHẬN TRỰC TIẾP bảng này GIỐNG HỆT D16 (KHÁC D20, vốn hoán đổi fixed/dual) — TÁI DÙNG
// `D16_MODALITY_START_SIGNS` thay vì tạo bảng trùng lặp.
//
// D45 REPEATING-FRACTION: `30/45 = 2/3` không có biểu diễn nhị phân hữu hạn — xem ghi chú đầu
// file cho CẢ HAI hiện tượng floating-point đã phát hiện (lỗi Python `//` của PyJHora — CHỈ 3/44
// biên là construction-independent genuine discrepancy, xem ghi chú "D45 PyJHora `//` ARTIFACT" đầu
// file — VÀ hiện tượng `k*partWidth` rơi dưới biên thật ở test methodology). Dùng
// `Math.floor(signDegree/partWidth)`, KHÔNG tái tạo lỗi `//` của PyJHora.
// ---------------------------------------------------------------------------------------

const D45_PART_WIDTH_DEGREES = 30 / 45;

/** D45 (Akshavedamsa): part = floor(signDegree / (30/45)); cung bắt đầu theo modality của `sign` (TÁI DÙNG bảng D16 — bit-for-bit giống nhau, đã xác nhận trực tiếp từ cả hai oracle), rồi đếm tới `part` cung từ đó. */
export function getD45AkshavedamsaSign(sign: ZodiacSign, signDegree: number): ZodiacSign {
  const part = Math.min(44, Math.floor(signDegree / D45_PART_WIDTH_DEGREES));
  const modalityIndex = getModalityIndex(sign);
  const startSign = D16_MODALITY_START_SIGNS[modalityIndex];
  if (startSign === undefined) {
    // Không thể xảy ra: `getModalityIndex` luôn trả về [0,2] (`% 3`), khớp đúng 3 phần tử D16_MODALITY_START_SIGNS — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`getD45AkshavedamsaSign: modalityIndex không hợp lệ (${modalityIndex}) cho sign=${sign}.`);
  }
  return countSignsForward(startSign, part);
}

// ---------------------------------------------------------------------------------------
// Standalone API — điểm vào chung cho Batch 1+2+3+4+5 (CF.4: "standalone calculation API",
// "explicit Varga identifier", "must not expose Swiss-specific types"). KHÔNG lắp vào
// `NormalizedChart`/`vedic/chart.ts` (ngoài phạm vi task này).
// ---------------------------------------------------------------------------------------

/**
 * Tính Rashi của MỘT hành tinh/điểm (Ascendant, ...) ở một Varga cụ thể — nhận `sign`/`signDegree`
 * D1 ĐÃ CÓ (từ `calculateRashi()`/`calculateVedicAscendant()`), KHÔNG tự tính D1. `varga` giới hạn
 * {2,3,4,7,9,10,12,16,20,24,27,30,40,45} ở Batch 1+2+3+4+5 (TypeScript union đóng chặn giá trị
 * khác tại compile time — D60 không thể truyền vào cho tới khi được resolve/triển khai riêng).
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
    case 12:
      return getD12DwadasamsaSign(sign, signDegree);
    case 16:
      return getD16ShodasamsaSign(sign, signDegree);
    case 20:
      return getD20VimsamsaSign(sign, signDegree);
    case 24:
      return getD24ChaturvimsamsaSign(sign, signDegree);
    case 27:
      return getD27NakshatramsaSign(sign, signDegree);
    case 30:
      return getD30TrimsamsaSign(sign, signDegree);
    case 40:
      return getD40KhavedamsaSign(sign, signDegree);
    case 45:
      return getD45AkshavedamsaSign(sign, signDegree);
  }
}
