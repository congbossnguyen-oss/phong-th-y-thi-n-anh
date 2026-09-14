/**
 * Phase 5 — Vedic Ascendant (Lagna). Tầng "Chart Calculation" phía Vedic, song song
 * `vedic/rashi.ts` — biến Ascendant TROPICAL thô (`AstronomicalProvider.getAscendant`) thành
 * Ascendant SIDEREAL rồi ánh xạ sang Rashi (Lagna) + độ trong cung, TÁI DÙNG TOÀN VẸN Step 3's
 * `calculateRashi()` (KHÔNG viết lại công thức sidereal/ayanamsa/sign-mapping nào — Ascendant chỉ
 * là MỘT longitude khác, không cần logic mới, cùng nguyên tắc D5 "consume the already-computed...
 * rather than duplicating astronomical calculations").
 *
 * KHÔNG import `sweph` (Rule B). KHÔNG import `western/` (Rule A). KHÔNG tính MC/Descendant/IC
 * (Phase 5 quyết định #9 — hoãn), KHÔNG tính house cusps (quyết định #11 — Whole Sign dùng
 * `vedic/houses.ts`'s Rashi-index arithmetic thuần, KHÔNG gọi `provider.getHouseCusps` — xem
 * PHASE5_PREFLIGHT_ASCENDANT_HOUSES.md §8 "Important correction").
 *
 * `houseSystem` truyền cứng `"whole_sign"` vào `provider.getAscendant()` — ĐÃ xác nhận bằng thực
 * nghiệm (preflight §1/§4): giá trị Ascendant TRẢ VỀ không phụ thuộc `houseSystem` (cùng một điểm
 * hình học, bất kể hệ nhà nào áp dụng sau đó) — tham số này chỉ ảnh hưởng logic house-cusp NỘI BỘ
 * của provider (KHÔNG được gọi ở đây), không ảnh hưởng giá trị `AngleResult.longitude` trả về.
 */

import type { AstrologyCoreError } from "../errors.js";
import type { AstronomicalProvider, AyanamsaId } from "../astronomical/AstronomicalProvider.js";
import type { ZodiacSign } from "../chart/types.js";
import { VEDIC_DEFAULT_AYANAMSA, calculateRashi } from "./rashi.js";
import {
  SwissEphemerisCalculationError,
  SwissEphemerisHouseCalculationError,
  SwissEphemerisHouseSystemUndefinedAtLatitudeError,
  SwissEphemerisUnsupportedHouseSystemError,
} from "../astronomical/providers/errors.js";

/** Hệ nhà truyền cho `provider.getAscendant()` — CỐ ĐỊNH "whole_sign" (Phase 5 V1, quyết định #10: Bhava/Placidus/Equal House hoãn). Không phải tham số công khai vì V1 không có hệ nhà nào khác để chọn. */
const VEDIC_ASCENDANT_HOUSE_SYSTEM = "whole_sign";

export interface CalculateVedicAscendantInput {
  provider: AstronomicalProvider;
  /** Thời điểm UTC CHÍNH XÁC — hàm này LUÔN yêu cầu giá trị này, KHÔNG có input dạng `Date | null` (đúng nguyên tắc "never infer birth time" — xem PHASE5_PREFLIGHT §7 và doc cuối file này "VỀ GIỜ SINH KHÔNG RÕ"). */
  utcInstant: Date;
  /** Vĩ độ nơi sinh — BẮT BUỘC, KHÔNG có mặc định. Ascendant là phép tính Vedic ĐẦU TIÊN thực sự phụ thuộc vị trí (Rashi/Nakshatra/Dasha hành tinh không cần). */
  latitude: number;
  longitude: number;
  /** Mặc định `VEDIC_DEFAULT_AYANAMSA` ("lahiri") nếu bỏ trống — cùng quy ước `calculateRashi`. */
  ayanamsaId?: AyanamsaId;
}

export interface VedicAscendantResult {
  ayanamsaId: AyanamsaId;
  /** Ascendant độ hoàng đạo TROPICAL thô, trước khi trừ ayanamsa — giữ lại để audit, cùng quy ước `RashiResult` không có field tương ứng (Rashi's tropicalLongitude là input, không phải output — Ascendant khác: chính hàm này lấy tropical từ provider, nên trả kèm cho minh bạch). */
  tropicalLongitude: number;
  /** Ascendant độ hoàng đạo SIDEREAL — đây là "Lagna" theo đúng nghĩa Vedic. */
  siderealLongitude: number;
  /** Rashi (cung) chứa Lagna — Nhà 1 trong hệ Whole Sign (xem `vedic/houses.ts::getWholeSignHouseNumber`). */
  rashi: ZodiacSign;
  /** Độ trong cung (0..30) của Lagna. */
  rashiDegree: number;
}

export type CalculateVedicAscendantResult = { ok: true; result: VedicAscendantResult } | { ok: false; errors: AstrologyCoreError[] };

/**
 * Ánh xạ lỗi provider khi lấy Ascendant — cùng nguyên tắc/mã lỗi đã có ở
 * `western/houses.ts::mapHouseProviderError` (KHÔNG import file đó — vi phạm school isolation —
 * nên viết lại phần ánh xạ CÙNG error class/mã lỗi, không phải logic tính toán mới). Trong thực
 * tế, `SwissEphemerisHouseSystemUndefinedAtLatitudeError` KHÔNG xảy ra cho "whole_sign" (xác nhận
 * bằng thực nghiệm ở MỌI vĩ độ đã thử, kể cả 89°N/-75°S — xem PHASE5_PREFLIGHT §6 "High latitude")
 * — nhánh này vẫn giữ lại làm phòng vệ, không phải vì đã quan sát được nó kích hoạt.
 */
function mapAscendantProviderError(error: unknown): AstrologyCoreError {
  if (error instanceof SwissEphemerisHouseSystemUndefinedAtLatitudeError) {
    return {
      code: "UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE",
      message: `Không xác định được Lagna (hệ nhà "${error.houseSystem}") tại vĩ độ ${error.latitude}°.`,
      field: "latitude",
      details: { houseSystem: error.houseSystem, latitude: error.latitude, nativeError: error.nativeError },
    };
  }
  if (error instanceof SwissEphemerisUnsupportedHouseSystemError) {
    return {
      code: "UNSUPPORTED_FEATURE",
      message: `Hệ nhà "${error.houseSystem}" chưa được provider hỗ trợ.`,
      field: "houseSystem",
      details: { houseSystem: error.houseSystem },
    };
  }
  if (error instanceof SwissEphemerisHouseCalculationError || error instanceof SwissEphemerisCalculationError) {
    return {
      code: "CALCULATION_ERROR",
      message: `Tính Ascendant (Lagna) thất bại.`,
      details: { operation: error.operation, nativeError: error.nativeError },
    };
  }
  throw error;
}

/**
 * Tính Ascendant (Lagna) sidereal + Rashi + độ trong cung — HÀM THUẦN theo nghĩa
 * `provider.getAscendant()`/`getAyanamsa()` là hàm thuần (đúng hợp đồng `AstronomicalProvider`).
 * KHÔNG throw ra ngoài trừ lỗi lập trình không lường trước (đúng quy ước `calculateRashi`/
 * `calculateVimshottariDasha`). KHÔNG làm tròn trung gian — `tropicalLongitude`/`siderealLongitude`
 * giữ nguyên full double precision, đúng chính sách `precision.ts`.
 *
 * VỀ GIỜ SINH KHÔNG RÕ: hàm này LUÔN yêu cầu `utcInstant`+`latitude`+`longitude` chính xác — KHÔNG
 * có nhánh "giờ sinh không rõ", KHÔNG suy đoán/nội suy, KHÔNG tự bịa ra một Ascendant "unavailable"
 * object. Quyết định "có nên gọi hàm này hay không" khi `BirthData.localTime === null` thuộc về
 * một tầng tích hợp chart TƯƠNG LAI (ngoài phạm vi Phase 5 — `vedic/chart.ts` CHƯA được sửa ở
 * bước này) — ĐÚNG NGUYÊN VĂN cách `calculateVimshottariDasha`/`calculateWesternHousesAndAngles`
 * đã làm cho vấn đề tương tự.
 */
export function calculateVedicAscendant(input: CalculateVedicAscendantInput): CalculateVedicAscendantResult {
  const ayanamsaId = input.ayanamsaId ?? VEDIC_DEFAULT_AYANAMSA;

  let tropicalLongitude: number;
  try {
    tropicalLongitude = input.provider.getAscendant(input.utcInstant, input.latitude, input.longitude, VEDIC_ASCENDANT_HOUSE_SYSTEM).longitude;
  } catch (error) {
    return { ok: false, errors: [mapAscendantProviderError(error)] };
  }

  const rashi = calculateRashi({ provider: input.provider, utcInstant: input.utcInstant, tropicalLongitude, ayanamsaId });
  if (!rashi.ok) {
    return rashi;
  }

  return {
    ok: true,
    result: {
      ayanamsaId: rashi.result.ayanamsaId,
      tropicalLongitude,
      siderealLongitude: rashi.result.siderealLongitude,
      rashi: rashi.result.rashi,
      rashiDegree: rashi.result.rashiDegree,
    },
  };
}
