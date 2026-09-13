/**
 * Phase 3B-1 — Western Houses + Angles. Tầng "Chart Calculation" (ARCHITECTURE_FREEZE.md §3,
 * layer 5): áp cấu hình trường phái Tây phương (house system) lên dữ kiện thiên văn thô
 * (`AstronomicalProvider`) để sinh house cusps + 4 góc (ASC/MC/DESC/IC). File này CỐ Ý nằm
 * NGOÀI `chart/` (Normalized Chart — Phase 2, trung lập trường phái) và NGOÀI `astronomical/`
 * (provider, trung lập trường phái) — đúng ADR-003 (School Isolation): mọi quyết định RIÊNG của
 * Tây phương (vd. tropical zodiac giả định ngầm, house system mặc định) sống ở đây, KHÔNG rò rỉ
 * ngược vào 2 tầng trung lập kia.
 *
 * PHẠM VI PHASE 3B-1: CHỈ house cusps + ASC/DESC/MC/IC. KHÔNG aspect, KHÔNG dignity, KHÔNG
 * interpretation, KHÔNG gán sign/house cho planets (đó là field `NormalizedChart.planets[]`/
 * `.houses[]` với `ruler` — cần bảng cai quản, một quyết định nội dung Tây phương RIÊNG chưa được
 * duyệt ở phase này, xem FUTURE_WORK.md).
 *
 * Interface `AstronomicalProvider` (Phase 1, KHÔNG sửa) không định nghĩa Descendant/IC là
 * phương thức riêng — đúng DOMAIN_MODEL.md §4, `Angle { type: "ASC"|"MC"|"DESC"|"IC" }` là 4
 * phần tử CÙNG một mảng, DESC/IC luôn = ASC/MC + 180° theo ĐỊNH NGHĨA hình học (không phải một
 * phép đo độc lập cần dung sai riêng) — tính bằng số học ở đây, KHÔNG gọi thêm provider.
 */

import type { AstrologyCoreError, AstrologyCoreErrorCode } from "../errors.js";
import type { AstronomicalProvider, HouseSystemId } from "../astronomical/AstronomicalProvider.js";
import type { HouseNumber, NormalizedAngle, NormalizedHouseCusp } from "../chart/types.js";
import {
  SwissEphemerisCalculationError,
  SwissEphemerisHouseCalculationError,
  SwissEphemerisHouseSystemUndefinedAtLatitudeError,
  SwissEphemerisUnsupportedHouseSystemError,
} from "../astronomical/providers/errors.js";

/**
 * House system mặc định của trường phái Tây phương — QUYẾT ĐỊNH KIẾN TRÚC được duyệt tường minh
 * cho Phase 3B-1 (DOMAIN_MODEL.md từng để "default TBD, see ADR/ADR-001", ADR-001 không quyết
 * định giá trị này — đây là gap có thật, đã hỏi và được duyệt chọn Placidus trước khi code).
 * Placidus là mặc định phổ biến nhất của phần mềm Tây phương hiện đại, nhưng KHÔNG xác định được
 * bên trong vòng cực (xem `SwissEphemerisHouseSystemUndefinedAtLatitudeError`) — người gọi có vĩ
 * độ cực PHẢI tự chọn `houseSystem` khác (vd. "whole_sign", "equal", "porphyry" — luôn xác định
 * được ở mọi vĩ độ, xác nhận bằng thực nghiệm, xem PHASE3B1_HOUSES_ANGLES.md).
 */
export const WESTERN_DEFAULT_HOUSE_SYSTEM: HouseSystemId = "placidus";

export interface CalculateWesternHousesAndAnglesInput {
  provider: AstronomicalProvider;
  /** Thời điểm UTC ĐÃ quy đổi (qua `resolveBirthDataInstant`, Phase 1) — hàm này KHÔNG tự làm timezone/DST. */
  utcInstant: Date;
  latitude: number;
  longitude: number;
  /** Mặc định `WESTERN_DEFAULT_HOUSE_SYSTEM` nếu bỏ trống. */
  houseSystem?: HouseSystemId;
}

export type WesternHousesAndAnglesResult =
  | { ok: true; houseSystem: HouseSystemId; houseCusps: NormalizedHouseCusp[]; angles: NormalizedAngle[] }
  | { ok: false; errors: AstrologyCoreError[] };

function normalizeDegrees(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Ánh xạ lỗi provider (CỤ THỂ của `SwissEphemerisProvider` — xem ghi chú "VẤN ĐỀ KIẾN TRÚC MỞ"
 * bên dưới) sang `AstrologyCoreError` (mã ổn định, đúng bảng freeze `ARCHITECTURE_FREEZE.md`
 * §5). Lỗi KHÔNG nhận diện được bị ném lại nguyên văn — KHÔNG bao giờ nuốt lỗi lạ thành một mã
 * chung chung sai nghĩa.
 *
 * VẤN ĐỀ KIẾN TRÚC MỞ (ghi nhận, KHÔNG tự sửa ở Phase 3B-1): `AstronomicalProvider` (Phase 1)
 * chưa định nghĩa một "error contract" chung cho MỌI implementation — tầng Chart Calculation
 * này vì vậy phải biết tới các class lỗi CỤ THỂ của `SwissEphemerisProvider` để dịch sang mã ổn
 * định. Nếu tương lai có `AlternativeEphemerisProvider` (khác Swiss Ephemeris), hàm này cần mở
 * rộng thêm nhánh nhận diện lỗi của provider đó — không phải một thiết kế sai, nhưng là một hạn
 * chế có thật của interface hiện tại. Xem FUTURE_WORK.md.
 */
function mapHouseProviderError(error: unknown, houseSystem: HouseSystemId): AstrologyCoreError {
  if (error instanceof SwissEphemerisHouseSystemUndefinedAtLatitudeError) {
    return {
      code: "UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE",
      message: `House system "${houseSystem}" không xác định được tại vĩ độ ${error.latitude}° (bên trong vòng cực).`,
      field: "houseSystem",
      details: { houseSystem, latitude: error.latitude, nativeError: error.nativeError },
    };
  }
  if (error instanceof SwissEphemerisUnsupportedHouseSystemError) {
    return {
      code: "UNSUPPORTED_FEATURE",
      message: `House system "${houseSystem}" chưa được provider hỗ trợ.`,
      field: "houseSystem",
      details: { houseSystem },
    };
  }
  const code: AstrologyCoreErrorCode = "CALCULATION_ERROR";
  if (error instanceof SwissEphemerisHouseCalculationError || error instanceof SwissEphemerisCalculationError) {
    return {
      code,
      message: `Tính house cusps/góc thất bại (house system "${houseSystem}").`,
      details: { houseSystem, operation: error.operation, nativeError: error.nativeError },
    };
  }
  throw error;
}

/**
 * Tính house cusps + 4 góc (ASC/DESC/MC/IC) cho một thời điểm/địa điểm — HÀM THUẦN (không
 * `Date.now()`, không random, cùng input luôn cho cùng output, phụ thuộc DUY NHẤT vào
 * `provider` đã cấu hình). KHÔNG throw exception ra ngoài — mọi lỗi (kể cả lỗi native Swiss
 * Ephemeris) trả về dưới dạng `AstrologyCoreError[]` có mã ổn định, đúng quy ước
 * `resolveBirthDataInstant` đã thiết lập ở Phase 1.
 */
export function calculateWesternHousesAndAngles(input: CalculateWesternHousesAndAnglesInput): WesternHousesAndAnglesResult {
  const houseSystem = input.houseSystem ?? WESTERN_DEFAULT_HOUSE_SYSTEM;

  try {
    const houseCuspsRaw = input.provider.getHouseCusps(input.utcInstant, input.latitude, input.longitude, houseSystem);
    const ascendant = input.provider.getAscendant(input.utcInstant, input.latitude, input.longitude, houseSystem);
    const midheaven = input.provider.getMidheaven(input.utcInstant, input.latitude, input.longitude, houseSystem);

    const houseCusps: NormalizedHouseCusp[] = houseCuspsRaw.cusps.map((longitude, index) => ({
      houseNumber: (index + 1) as HouseNumber,
      longitude,
      houseSystem,
    }));

    const descendant = normalizeDegrees(ascendant.longitude + 180);
    const imumCoeli = normalizeDegrees(midheaven.longitude + 180);

    const angles: NormalizedAngle[] = [
      { type: "ASC", longitude: ascendant.longitude },
      { type: "MC", longitude: midheaven.longitude },
      { type: "DESC", longitude: descendant },
      { type: "IC", longitude: imumCoeli },
    ];

    return { ok: true, houseSystem, houseCusps, angles };
  } catch (error) {
    return { ok: false, errors: [mapHouseProviderError(error, houseSystem)] };
  }
}
