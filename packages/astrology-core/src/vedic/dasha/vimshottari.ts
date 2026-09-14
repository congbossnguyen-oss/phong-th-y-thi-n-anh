/**
 * Phase 4 Step 6 — Vimshottari Mahadasha. Cấu trúc ĐỘC LẬP, NẰM NGOÀI `NormalizedChart` (Approved
 * Decision D4, Phase 4 Decision Gate) — KHÔNG có field nào ở đây được thêm vào
 * `chart/types.ts::NormalizedChart`. Tiếp theo `vedic/rashi.ts` (Step 3) + `vedic/nakshatra.ts`
 * (Step 4) — tái dùng TOÀN BỘ 2 module đó, KHÔNG tính lại sidereal longitude/ayanamsa/Nakshatra
 * index/Nakshatra lord ở đây (đúng yêu cầu Step 6 "consume the already-computed... rather than
 * duplicating astronomical calculations" / "Do not duplicate normalizeDegrees/signOfLongitude/
 * signDegreeOfLongitude/Nakshatra mapping/Nakshatra lord mapping").
 *
 * KHÔNG import `sweph` (Rule B). KHÔNG import `western/` (Rule A). KHÔNG có Antardasha (V1 scope
 * freeze — xem PHASE4_STEP5_DASHA_PREFLIGHT.md mục 3.11). KHÔNG interpretation/scoring/judgment.
 *
 * NGUỒN SỰ THẬT KIẾN TRÚC: PHASE4_STEP5_DASHA_PREFLIGHT.md (đã ACCEPT, D5 đã đóng băng). File
 * này KHÔNG mở lại bất kỳ quyết định D5 nào — mọi hằng số/công thức dưới đây trích trực tiếp từ
 * tài liệu đó, đã xác nhận qua CẢ HAI oracle (PyJHora, vedic-calc), KHÔNG suy đoán.
 */

import type { AstrologyCoreError } from "../../errors.js";
import type { AstronomicalProvider, AyanamsaId } from "../../astronomical/AstronomicalProvider.js";
import { NAKSHATRA_NAMES, type NakshatraName } from "../../chart/types.js";
import { stableStringify } from "../../chart/stableStringify.js";
import { SwissEphemerisCalculationError, SwissEphemerisPrecisionDegradedError, SwissEphemerisUnsupportedBodyError } from "../../astronomical/providers/errors.js";
import { VEDIC_DEFAULT_AYANAMSA, calculateRashi } from "../rashi.js";
import { NAKSHATRA_LORD_CYCLE, NAKSHATRA_SPAN_DEGREES, getNakshatraDegree, getNakshatraIndex, getNakshatraLord, type VimshottariLord } from "../nakshatra.js";

export type { VimshottariLord } from "../nakshatra.js";

/** Schema version ĐỘC LẬP với `NORMALIZED_CHART_SCHEMA_VERSION` — Dasha là cấu trúc riêng, không lồng trong NormalizedChart (D4). */
export const VIMSHOTTARI_DASHA_SCHEMA_VERSION = "1.0.0";

/**
 * D5 (đã đóng băng, Phase 4 Step 5 Decision): quy ước năm cố định "mean sidereal year"
 * 365.256364 ngày/năm — KHÔNG dùng 365.25 (vedic-calc) hay TRUE_SIDEREAL_YEAR động (PyJHora mặc
 * định, cần thêm 2 lệnh gọi ephemeris). Định danh ổn định để tương lai có thể thêm quy ước KHÁC
 * mà không âm thầm đổi ý nghĩa quy ước này (cùng nguyên tắc `AspectOrbPolicy.id`).
 */
export const VIMSHOTTARI_YEAR_CONVENTION_ID = "mean_sidereal_year.365_256364";
export const VIMSHOTTARI_DAYS_PER_YEAR = 365.256364;

/** Số năm mỗi Mahadasha — BPHS Chương 46, khớp TUYỆT ĐỐI `vimsottari_dict` (PyJHora) và `VIMSOTTARI_YEARS` (vedic-calc), tổng = 120. */
export const VIMSHOTTARI_LORD_YEARS: Readonly<Record<VimshottariLord, number>> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

/** Thứ tự chu kỳ Vimshottari CỐ ĐỊNH — TÁI DÙNG đúng `NAKSHATRA_LORD_CYCLE` (Step 4), KHÔNG viết lại. */
export const VIMSHOTTARI_LORD_SEQUENCE: readonly VimshottariLord[] = NAKSHATRA_LORD_CYCLE;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Một Mahadasha — luôn mang ĐỦ NĂM chuẩn (bảng cố định) cho `lord`, kể cả Mahadasha ĐẦU TIÊN (khớp đúng cách cả 2 oracle biểu diễn: `startUtc` của Mahadasha đầu tiên lùi về TRƯỚC thời điểm sinh để phần "đã trôi qua" phản ánh đúng trong khoảng birth→endUtc, KHÔNG rút ngắn `durationYears`). */
export interface VimshottariMahadashaPeriod {
  lord: VimshottariLord;
  startUtc: Date;
  endUtc: Date;
  /** Số năm ĐẦY ĐỦ theo bảng cố định cho `lord` (== VIMSHOTTARI_LORD_YEARS[lord]) — KHÔNG rút ngắn cho Mahadasha đầu tiên, xem doc comment trên. */
  durationYears: number;
}

export interface VimshottariMahadashaSequence {
  schemaVersion: typeof VIMSHOTTARI_DASHA_SCHEMA_VERSION;
  yearConventionId: string;
  ayanamsaId: AyanamsaId;
  /** Thời điểm UTC chính xác đã dùng để tính — bắt buộc phải có (KHÔNG có giá trị null/unavailable ở tầng này, xem `calculateVimshottariDasha`'s doc comment "VỀ UNKNOWN BIRTH TIME"). */
  utcInstant: Date;
  startingNakshatra: NakshatraName;
  startingNakshatraLord: VimshottariLord;
  /** == startingNakshatraLord — field riêng theo đúng yêu cầu Step 6 (tường minh cho việc audit, dù luôn trùng giá trị). */
  startingMahadashaLord: VimshottariLord;
  /** Tỉ lệ (0..1) Mặt Trăng đã "đi qua" trong Nakshatra tại thời điểm sinh — đủ để tự kiểm chứng (audit) cùng `mahadashas[0]`: elapsedFraction ≈ (utcInstant − mahadashas[0].startUtc) / (mahadashas[0].endUtc − mahadashas[0].startUtc). */
  startingNakshatraElapsedFraction: number;
  /** Đúng 9 phần tử — 1 chu kỳ 120 năm đầy đủ tính từ ngày sinh. */
  mahadashas: VimshottariMahadashaPeriod[];
}

export type CalculateVimshottariDashaResult = { ok: true; result: VimshottariMahadashaSequence } | { ok: false; errors: AstrologyCoreError[] };

export interface CalculateVimshottariDashaInput {
  provider: AstronomicalProvider;
  /** Thời điểm UTC CHÍNH XÁC của sinh — hàm này LUÔN yêu cầu giá trị này, KHÔNG có input dạng `Date | null`. Xem doc comment "VỀ UNKNOWN BIRTH TIME" bên dưới `calculateVimshottariDasha`. */
  utcInstant: Date;
  /** Mặc định `VEDIC_DEFAULT_AYANAMSA` ("lahiri") nếu bỏ trống — cùng quy ước `calculateRashi`. */
  ayanamsaId?: AyanamsaId;
}

/**
 * Ánh xạ lỗi provider khi lấy vị trí MỘT hành tinh/điểm bất kỳ — cùng nguyên tắc/mã lỗi đã có ở
 * `western/planets.ts::mapPlanetProviderError` (KHÔNG import file đó — vi phạm school isolation —
 * nên viết lại phần ánh xạ CÙNG error class/mã lỗi, không phải logic tính toán mới). Tổng quát hoá
 * theo `body` (Phase 4 Integration/E2E) từ bản gốc chỉ dành riêng "moon" — EXPORT để
 * `vedic/chart.ts` tái dùng, KHÔNG viết một bản ánh xạ thứ ba giống hệt.
 */
export function mapPlanetProviderError(error: unknown, body: string): AstrologyCoreError {
  if (error instanceof SwissEphemerisUnsupportedBodyError) {
    return { code: "UNSUPPORTED_FEATURE", message: `Thiên thể "${body}" chưa được provider hỗ trợ.`, field: "body", details: { body } };
  }
  if (error instanceof SwissEphemerisPrecisionDegradedError || error instanceof SwissEphemerisCalculationError) {
    return {
      code: "CALCULATION_ERROR",
      message: `Tính vị trí thiên thể "${body}" thất bại.`,
      field: "body",
      details: { body, nativeError: error.nativeError },
    };
  }
  throw error;
}

/**
 * Sinh 9 Mahadasha, bắt đầu từ `startingLord`, với Mahadasha ĐẦU TIÊN được lùi `startUtc` về
 * trước `birthInstant` một khoảng đúng bằng phần đã trôi qua (`elapsedFraction * số năm đầy đủ`)
 * — khớp đúng cách CẢ HAI oracle biểu diễn (`vimsottari_mahadasa` của PyJHora, `calculate_dasha`
 * của vedic-calc: `duration_years` LUÔN là số năm đầy đủ, `start` mới là thứ được lùi lại).
 *
 * Giữ nguyên độ chính xác (Section "Mathematical Requirements" #10): mọi mốc thời gian tính từ
 * MỘT gốc DUY NHẤT (`birthInstant` + số ngày cộng dồn dạng số thực), KHÔNG cộng dồn qua từng
 * `Date` đã làm tròn mili-giây trước đó — tránh sai số làm tròn tích luỹ qua 9 bước.
 */
function generateMahadashaSequence(startingLord: VimshottariLord, elapsedFraction: number, birthInstant: Date): VimshottariMahadashaPeriod[] {
  const startIndex = VIMSHOTTARI_LORD_SEQUENCE.indexOf(startingLord);
  if (startIndex === -1) {
    // Không thể xảy ra: `startingLord` luôn đến từ `getNakshatraLord()`, vốn luôn trả về 1 phần tử của chính `VIMSHOTTARI_LORD_SEQUENCE` — phòng vệ lập trình.
    throw new Error(`generateMahadashaSequence: lord "${startingLord}" không có trong VIMSHOTTARI_LORD_SEQUENCE.`);
  }

  const startingFullYears = VIMSHOTTARI_LORD_YEARS[startingLord];
  const elapsedDays = startingFullYears * elapsedFraction * VIMSHOTTARI_DAYS_PER_YEAR;

  const periods: VimshottariMahadashaPeriod[] = [];
  let cumulativeDaysFromBirth = -elapsedDays; // mốc bắt đầu Mahadasha đầu tiên, tính bằng số ngày (số thực) TƯƠNG ĐỐI so với birthInstant.

  for (let i = 0; i < VIMSHOTTARI_LORD_SEQUENCE.length; i++) {
    const lord = VIMSHOTTARI_LORD_SEQUENCE[(startIndex + i) % VIMSHOTTARI_LORD_SEQUENCE.length];
    if (lord === undefined) {
      // Không thể xảy ra: modulo trong [0, length) — phòng vệ cho noUncheckedIndexedAccess.
      throw new Error(`generateMahadashaSequence: chỉ số lord không hợp lệ tại i=${i}.`);
    }
    const durationYears = VIMSHOTTARI_LORD_YEARS[lord];
    const durationDays = durationYears * VIMSHOTTARI_DAYS_PER_YEAR;

    const startUtc = addDaysToInstant(birthInstant, cumulativeDaysFromBirth);
    cumulativeDaysFromBirth += durationDays;
    const endUtc = addDaysToInstant(birthInstant, cumulativeDaysFromBirth);

    periods.push({ lord, startUtc, endUtc, durationYears });
  }

  return periods;
}

function addDaysToInstant(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MILLISECONDS_PER_DAY);
}

/**
 * Tính chu kỳ Vimshottari Mahadasha đầy đủ (120 năm, 9 Mahadasha) từ vị trí Mặt Trăng tại một
 * thời điểm UTC chính xác — HÀM THUẦN theo nghĩa `provider.getPlanetPosition`/`getAyanamsa` là
 * hàm thuần (đúng hợp đồng `AstronomicalProvider`). KHÔNG throw ra ngoài trừ lỗi lập trình không
 * lường trước (đúng quy ước `calculateRashi`/`calculateWesternHousesAndAngles`).
 *
 * VỀ UNKNOWN BIRTH TIME (Section 8, D6 đã duyệt): hàm này LUÔN yêu cầu `utcInstant` chính xác —
 * KHÔNG có nhánh xử lý "giờ sinh không rõ" ở TẦNG TÍNH TOÁN này, KHÔNG suy đoán/nội suy một giờ
 * sinh, và KHÔNG tự bịa ra một "Dasha unavailable" object ở API lõi này. Quyết định "có nên gọi
 * hàm này hay không" (khi `BirthData.localTime === null`) thuộc về tầng gọi (Step 7+ tích hợp
 * chart) — ĐÚNG NGUYÊN VĂN cách `calculateWesternHousesAndAngles`/`mapWesternPlanetPositions` đã
 * làm với `houseCusps` (luôn yêu cầu toạ độ/giờ chính xác; nơi gọi tự quyết định có gọi hay
 * không, KHÔNG dạy hàm tính toán một "chế độ null").
 */
export function calculateVimshottariDasha(input: CalculateVimshottariDashaInput): CalculateVimshottariDashaResult {
  const ayanamsaId = input.ayanamsaId ?? VEDIC_DEFAULT_AYANAMSA;

  let moonTropicalLongitude: number;
  try {
    moonTropicalLongitude = input.provider.getPlanetPosition(input.utcInstant, "moon").longitude;
  } catch (error) {
    return { ok: false, errors: [mapPlanetProviderError(error, "moon")] };
  }

  const rashi = calculateRashi({ provider: input.provider, utcInstant: input.utcInstant, tropicalLongitude: moonTropicalLongitude, ayanamsaId });
  if (!rashi.ok) {
    return rashi;
  }

  const nakshatraIndex = getNakshatraIndex(rashi.result.siderealLongitude);
  const startingNakshatra = NAKSHATRA_NAMES[nakshatraIndex];
  if (startingNakshatra === undefined) {
    // Không thể xảy ra: `getNakshatraIndex` luôn trả về 0-26, khớp đúng 27 phần tử NAKSHATRA_NAMES — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`calculateVimshottariDasha: chỉ số Nakshatra không hợp lệ (${nakshatraIndex}).`);
  }
  const startingLord = getNakshatraLord(nakshatraIndex);

  const degreeInNakshatra = getNakshatraDegree(rashi.result.siderealLongitude);
  const elapsedFraction = degreeInNakshatra / NAKSHATRA_SPAN_DEGREES;

  const mahadashas = generateMahadashaSequence(startingLord, elapsedFraction, input.utcInstant);

  return {
    ok: true,
    result: {
      schemaVersion: VIMSHOTTARI_DASHA_SCHEMA_VERSION,
      yearConventionId: VIMSHOTTARI_YEAR_CONVENTION_ID,
      ayanamsaId: rashi.result.ayanamsaId,
      utcInstant: input.utcInstant,
      startingNakshatra,
      startingNakshatraLord: startingLord,
      startingMahadashaLord: startingLord,
      startingNakshatraElapsedFraction: elapsedFraction,
      mahadashas,
    },
  };
}

// ---------------------------------------------------------------------------------------
// Validation — cùng phong cách chart/validation.ts, KHÔNG tính lại giá trị chiêm tinh, chỉ kiểm
// tra tính toàn vẹn cấu trúc (đúng bảng năm cố định, đúng thứ tự chu kỳ, liền mạch thời gian).
// ---------------------------------------------------------------------------------------

export type VimshottariDashaErrorCode =
  | "INVALID_MAHADASHA_COUNT"
  | "INVALID_MAHADASHA_LORD_SEQUENCE"
  | "INVALID_MAHADASHA_DURATION"
  | "MAHADASHA_NOT_CONTIGUOUS"
  | "INVALID_STARTING_ELAPSED_FRACTION"
  | "STARTING_LORD_MISMATCH"
  | "INVALID_STARTING_LORD";

export interface VimshottariDashaError extends Omit<AstrologyCoreError, "code"> {
  code: VimshottariDashaErrorCode;
}

function dashaErr(code: VimshottariDashaErrorCode, message: string, field: string, details?: Record<string, unknown>): VimshottariDashaError {
  return details === undefined ? { code, message, field } : { code, message, field, details };
}

/**
 * Kiểm tra tính toàn vẹn cấu trúc của `VimshottariMahadashaSequence` — KHÔNG tính lại từ longitude
 * (contract này không giữ longitude gốc), CHỈ xác nhận: đúng 9 Mahadasha, đúng thứ tự chu kỳ bắt
 * đầu từ `startingMahadashaLord`, mỗi `durationYears` khớp bảng cố định, các Mahadasha liền mạch
 * (endUtc của phần tử này == startUtc của phần tử kế tiếp), `startingNakshatraElapsedFraction`
 * trong [0,1).
 */
export function validateVimshottariMahadashaSequence(sequence: VimshottariMahadashaSequence): VimshottariDashaError[] {
  const errors: VimshottariDashaError[] = [];

  if (sequence.startingMahadashaLord !== sequence.startingNakshatraLord) {
    errors.push(dashaErr("STARTING_LORD_MISMATCH", "startingMahadashaLord phải khớp startingNakshatraLord.", "startingMahadashaLord"));
  }

  if (!Number.isFinite(sequence.startingNakshatraElapsedFraction) || sequence.startingNakshatraElapsedFraction < 0 || sequence.startingNakshatraElapsedFraction >= 1) {
    errors.push(dashaErr("INVALID_STARTING_ELAPSED_FRACTION", "startingNakshatraElapsedFraction phải trong [0, 1).", "startingNakshatraElapsedFraction", { actual: sequence.startingNakshatraElapsedFraction }));
  }

  if (sequence.mahadashas.length !== VIMSHOTTARI_LORD_SEQUENCE.length) {
    errors.push(dashaErr("INVALID_MAHADASHA_COUNT", `mahadashas phải có đúng ${VIMSHOTTARI_LORD_SEQUENCE.length} phần tử: nhận ${sequence.mahadashas.length}.`, "mahadashas", { actualCount: sequence.mahadashas.length }));
    return errors; // không kiểm tiếp thứ tự/liền mạch nếu độ dài đã sai — tránh lỗi phái sinh gây nhiễu.
  }

  const startIndex = VIMSHOTTARI_LORD_SEQUENCE.indexOf(sequence.startingMahadashaLord);
  if (startIndex === -1) {
    errors.push(dashaErr("INVALID_STARTING_LORD", `startingMahadashaLord "${sequence.startingMahadashaLord}" không nằm trong VIMSHOTTARI_LORD_SEQUENCE.`, "startingMahadashaLord", { actual: sequence.startingMahadashaLord }));
    return errors; // không kiểm tiếp thứ tự chu kỳ nếu không xác định được điểm bắt đầu hợp lệ.
  }

  for (let i = 0; i < sequence.mahadashas.length; i++) {
    const period = sequence.mahadashas[i];
    if (period === undefined) continue; // không thể xảy ra sau kiểm tra length ở trên — phòng vệ cho noUncheckedIndexedAccess.

    const expectedLord = VIMSHOTTARI_LORD_SEQUENCE[(startIndex + i) % VIMSHOTTARI_LORD_SEQUENCE.length];
    if (period.lord !== expectedLord) {
      errors.push(dashaErr("INVALID_MAHADASHA_LORD_SEQUENCE", `mahadashas[${i}].lord phải là "${expectedLord}" (đúng chu kỳ Vimshottari): nhận "${period.lord}".`, `mahadashas[${i}].lord`, { expected: expectedLord, actual: period.lord }));
    }

    const expectedYears = VIMSHOTTARI_LORD_YEARS[period.lord];
    if (Math.abs(period.durationYears - expectedYears) > 1e-9) {
      errors.push(dashaErr("INVALID_MAHADASHA_DURATION", `mahadashas[${i}].durationYears phải là ${expectedYears} (bảng cố định cho "${period.lord}"): nhận ${period.durationYears}.`, `mahadashas[${i}].durationYears`, { expected: expectedYears, actual: period.durationYears }));
    }

    if (i > 0) {
      const previous = sequence.mahadashas[i - 1];
      if (previous !== undefined && previous.endUtc.getTime() !== period.startUtc.getTime()) {
        errors.push(
          dashaErr("MAHADASHA_NOT_CONTIGUOUS", `mahadashas[${i}].startUtc phải khớp mahadashas[${i - 1}].endUtc.`, `mahadashas[${i}].startUtc`, {
            previousEndUtc: previous.endUtc.toISOString(),
            actualStartUtc: period.startUtc.toISOString(),
          }),
        );
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------------------
// Serialization — cùng phong cách chart/serialization.ts (envelope kèm schemaVersion, reject nếu
// major version khác, tái dùng ĐÚNG `stableStringify` đã có, không viết logic ổn định hoá thứ hai).
// ---------------------------------------------------------------------------------------

interface SerializedVimshottariDashaEnvelope {
  schemaVersion: string;
  dasha: VimshottariMahadashaSequence;
}

export function serializeVimshottariMahadashaSequence(sequence: VimshottariMahadashaSequence): string {
  const envelope: SerializedVimshottariDashaEnvelope = { schemaVersion: VIMSHOTTARI_DASHA_SCHEMA_VERSION, dasha: sequence };
  return stableStringify(envelope);
}

export class VimshottariDashaVersionMismatchError extends Error {
  constructor(
    readonly expectedMajor: number,
    readonly actualVersion: string,
  ) {
    super(
      `VimshottariMahadashaSequence schemaVersion "${actualVersion}" không tương thích — cần major version ${expectedMajor}.x.x ` +
        `(đang chạy VIMSHOTTARI_DASHA_SCHEMA_VERSION=${VIMSHOTTARI_DASHA_SCHEMA_VERSION}).`,
    );
    this.name = "VimshottariDashaVersionMismatchError";
  }
}

function majorVersionOf(semver: string): number {
  const major = Number(semver.split(".")[0]);
  return Number.isFinite(major) ? major : Number.NaN;
}

/**
 * Deserialize + kiểm tra tương thích version — KHÔNG tự validate cấu trúc
 * (`validateVimshottariMahadashaSequence` là bước riêng), CHỈ parse JSON + kiểm version + parse
 * lại `Date` (đúng quy ước `deserializeNormalizedChart`: mọi mốc `Date` được serialize thành ISO
 * string bởi `stableStringify`, phải parse lại thành `Date` THẬT, không để nguyên string).
 */
export function deserializeVimshottariMahadashaSequence(json: string): VimshottariMahadashaSequence {
  const parsed = JSON.parse(json) as SerializedVimshottariDashaEnvelope;
  const currentMajor = majorVersionOf(VIMSHOTTARI_DASHA_SCHEMA_VERSION);
  const parsedMajor = majorVersionOf(parsed.schemaVersion);
  if (parsedMajor !== currentMajor) {
    throw new VimshottariDashaVersionMismatchError(currentMajor, parsed.schemaVersion);
  }
  return {
    ...parsed.dasha,
    utcInstant: new Date(parsed.dasha.utcInstant),
    mahadashas: parsed.dasha.mahadashas.map((period) => ({
      ...period,
      startUtc: new Date(period.startUtc),
      endUtc: new Date(period.endUtc),
    })),
  };
}
