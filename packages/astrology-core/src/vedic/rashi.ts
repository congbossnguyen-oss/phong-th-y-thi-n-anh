/**
 * Phase 4 Step 3 — Vedic Rashi (D1) Calculation. Tầng "Chart Calculation" phía Vedic (song song
 * `western/zodiac.ts`) — biến longitude TROPICAL thô (`astronomical/AstronomicalProvider.ts`)
 * thành longitude SIDEREAL rồi ánh xạ sang 1 trong 12 Rashi + độ trong cung. KHÔNG tính
 * Nakshatra/Pada, KHÔNG Dasha, KHÔNG divisional chart, KHÔNG house assignment (xem "VỀ HOUSE
 * ASSIGNMENT" bên dưới), KHÔNG interpretation/scoring.
 *
 * SCHOOL ISOLATION (Rule A, Phase 4 Decision Gate): file này KHÔNG import bất kỳ gì từ
 * `western/`. Toán ánh xạ cung (`signOfLongitude`/`signDegreeOfLongitude`) và chuẩn hoá độ
 * (`normalizeDegrees`) sống ở tầng trung lập `precision.ts` (ADR-003), KHÔNG phải `western/` —
 * xem doc comment ở đó cho lý do trích xuất.
 *
 * `sweph` KHÔNG được import trực tiếp ở đây (Rule B) — mọi dữ kiện thiên văn (kể cả ayanamsa) đi
 * qua `AstronomicalProvider.getAyanamsa()`.
 *
 * CÔNG THỨC SIDEREAL (Section 4, đã duyệt tường minh sau khi so oracle — xem
 * docs/astrology-module/ARCHITECTURE/PHASE4_STEP3_RASHI.md "Oracle validation resolution"):
 *   sidereal_longitude = normalizeDegrees(tropical_longitude - ayanamsa)
 * Đây là "manual subtraction" — KHÔNG dùng cờ `SEFLG_SIDEREAL` native của Swiss Ephemeris (cách
 * PyJHora dùng). Tài liệu chính thức Swiss Ephemeris (swephprg.htm §12.2) gọi cách native là
 * "đúng" hơn cho vị trí hành tinh sidereal, nhưng Section 4 CHỈ ĐỊNH RÕ công thức trừ thủ công —
 * đã hỏi lại và được xác nhận giữ nguyên (không đổi kiến trúc) sau khi phát hiện sai khác ~33″
 * so PyJHora, xem tài liệu trên.
 *
 * VỀ HOUSE ASSIGNMENT: Rashi/D1 KHÔNG cần house cusps/Ascendant để xác định Rashi của MỘT hành
 * tinh — đúng như `western/zodiac.ts` (tropical) không cần. `NormalizedPlanetPosition.house`
 * (Phase 2) là field ở tầng NormalizedChart, được điền ở bước tích hợp chart (`vedic/chart.ts`,
 * Step 7 — CHƯA làm), KHÔNG phải ở tầng tính Rashi này. Xác nhận bằng đọc `chart/types.ts` +
 * `western/planets.ts` (nơi DUY NHẤT gọi `assignHouseNumber`) trước khi viết file này — KHÔNG có
 * gì trong kiến trúc hiện tại bắt buộc house assignment phải xảy ra ở tầng Rashi.
 */

import type { AstrologyCoreError } from "../errors.js";
import type { AstronomicalProvider, AyanamsaId } from "../astronomical/AstronomicalProvider.js";
import type { ZodiacSign } from "../chart/types.js";
import { normalizeDegrees, signDegreeOfLongitude, signOfLongitude } from "../precision.js";
import { SwissEphemerisCalculationError, SwissEphemerisUnsupportedAyanamsaError } from "../astronomical/providers/errors.js";

/**
 * Ayanamsa mặc định của trường phái Vedic — QUYẾT ĐỊNH KIẾN TRÚC D1, đã duyệt tường minh ở
 * Phase 4 Decision Gate (KHÔNG phải một mặc định tự chọn ở Step 3). Song song
 * `WESTERN_DEFAULT_HOUSE_SYSTEM` ở `western/houses.ts`.
 */
export const VEDIC_DEFAULT_AYANAMSA: AyanamsaId = "lahiri";

/**
 * `sidereal = normalizeDegrees(tropical - ayanamsa)` — Section 4's công thức, tách riêng thành
 * HÀM THUẦN (không đụng `AstronomicalProvider`) để test độc lập biên/wraparound/floating-point
 * mà không cần ephemeris thật — cùng phong cách `angularSeparation` (`western/aspects.ts`) tách
 * khỏi `computeWesternAspects`.
 */
export function getSiderealLongitude(tropicalLongitude: number, ayanamsa: number): number {
  return normalizeDegrees(tropicalLongitude - ayanamsa);
}

export interface CalculateRashiInput {
  provider: AstronomicalProvider;
  utcInstant: Date;
  /** Longitude tropical đã có (vd. từ `provider.getPlanetPosition(...).longitude`) — hàm này KHÔNG tự gọi lại provider để lấy longitude hành tinh (đó là việc của `vedic/chart.ts`, Step 7). */
  tropicalLongitude: number;
  /** Mặc định `VEDIC_DEFAULT_AYANAMSA` ("lahiri") nếu bỏ trống — vẫn CÓ THỂ truyền ayanamsa khác đã được provider hỗ trợ (Step 1: lahiri/raman/kp/true_chitrapaksha). */
  ayanamsaId?: AyanamsaId;
}

export interface RashiResult {
  ayanamsaId: AyanamsaId;
  /** Giá trị ayanamsa (độ) đã dùng — trả kèm để caller/test kiểm chứng lại, KHÔNG bắt buộc caller tự gọi lại provider. */
  ayanamsa: number;
  siderealLongitude: number;
  rashi: ZodiacSign;
  /** Độ trong cung (0..30) — LUÔN đi cùng `rashi`, cùng longitude. */
  rashiDegree: number;
}

export type CalculateRashiResult = { ok: true; result: RashiResult } | { ok: false; errors: AstrologyCoreError[] };

/**
 * Ánh xạ lỗi provider sang `AstrologyCoreError` — cùng nguyên tắc/hạn chế đã ghi ở
 * `western/houses.ts::mapHouseProviderError` (không lặp lại "VẤN ĐỀ KIẾN TRÚC MỞ" ở đó).
 */
function mapAyanamsaProviderError(error: unknown, ayanamsaId: AyanamsaId): AstrologyCoreError {
  if (error instanceof SwissEphemerisUnsupportedAyanamsaError) {
    return {
      code: "UNSUPPORTED_FEATURE",
      message: `Ayanamsa "${ayanamsaId}" chưa được provider hỗ trợ.`,
      field: "ayanamsaId",
      details: { ayanamsaId },
    };
  }
  if (error instanceof SwissEphemerisCalculationError) {
    return {
      code: "CALCULATION_ERROR",
      message: `Tính ayanamsa "${ayanamsaId}" thất bại.`,
      field: "ayanamsaId",
      details: { ayanamsaId, operation: error.operation, nativeError: error.nativeError },
    };
  }
  throw error;
}

/**
 * Tính Rashi (D1) + độ trong cung cho MỘT longitude tropical đã có — HÀM THUẦN theo nghĩa
 * `provider.getAyanamsa()` là hàm thuần (không random/Date.now(), đúng `AstronomicalProvider`'s
 * hợp đồng) — cùng input luôn cho cùng output. KHÔNG throw ra ngoài trừ lỗi lập trình không
 * lường trước (đúng quy ước `calculateWesternHousesAndAngles`/`mapWesternPlanetPositions`).
 */
export function calculateRashi(input: CalculateRashiInput): CalculateRashiResult {
  const ayanamsaId = input.ayanamsaId ?? VEDIC_DEFAULT_AYANAMSA;

  let ayanamsa: number;
  try {
    ayanamsa = input.provider.getAyanamsa(input.utcInstant, ayanamsaId);
  } catch (error) {
    return { ok: false, errors: [mapAyanamsaProviderError(error, ayanamsaId)] };
  }

  const siderealLongitude = getSiderealLongitude(input.tropicalLongitude, ayanamsa);

  return {
    ok: true,
    result: {
      ayanamsaId,
      ayanamsa,
      siderealLongitude,
      rashi: signOfLongitude(siderealLongitude),
      rashiDegree: signDegreeOfLongitude(siderealLongitude),
    },
  };
}
