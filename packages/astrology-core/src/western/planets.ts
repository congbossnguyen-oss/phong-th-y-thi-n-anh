/**
 * Phase 3B-2 — Planet → Sign + House assignment. Tầng "Chart Calculation" (như `houses.ts`) —
 * biến vị trí hành tinh THÔ (`astronomical/AstronomicalProvider.ts::PlanetPosition`) thành
 * `NormalizedPlanetPosition` (Phase 2) bằng cách điền `sign`/`signDegree`/`house`/`precision` —
 * KHÔNG tính lại longitude/latitude/speed (giữ nguyên số liệu provider, KHÔNG làm tròn).
 *
 * PHẠM VI PHASE 3B-2: CHỈ sign/signDegree/house — KHÔNG aspect, KHÔNG dignity, KHÔNG
 * interpretation. `NormalizedChart.houses[]` (sign+ruler CỦA CẢ MỘT NHÀ, không phải của 1 hành
 * tinh) và `points[]`/`nodes[]` KHÔNG được điền ở module này (xem PHASE3B2 doc + FUTURE_WORK.md
 * mục 14 — bảng cai quản là quyết định nội dung riêng chưa duyệt).
 */

import type { AstrologyCoreError } from "../errors.js";
import type { AstronomicalProvider, CelestialBody, KnownCelestialBody, PrecisionClass } from "../astronomical/AstronomicalProvider.js";
import type { NormalizedHouseCusp, NormalizedPlanetPosition } from "../chart/types.js";
import { angularPrecisionForClass } from "../precision.js";
import {
  SwissEphemerisCalculationError,
  SwissEphemerisPrecisionDegradedError,
  SwissEphemerisUnsupportedBodyError,
} from "../astronomical/providers/errors.js";
import { assignHouseNumber } from "./housePlacement.js";
import { signDegreeOfLongitude, signOfLongitude } from "./zodiac.js";

/** 10 hành tinh cổ điển — đúng phạm vi `western.core` đã freeze (`DOMAIN_MODEL.md` §6: "Tropical zodiac; Sun→Pluto"). Mặc định tiện dụng, KHÔNG hardcode bên trong `mapWesternPlanetPositions` — caller vẫn truyền `bodies` tường minh (xem "make the calculation method explicit"). */
export const WESTERN_CORE_BODIES: readonly KnownCelestialBody[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

export interface MapWesternPlanetPositionsInput {
  provider: AstronomicalProvider;
  utcInstant: Date;
  bodies: readonly CelestialBody[];
  /**
   * House cusps đã tính (Phase 3B-1's `calculateWesternHousesAndAngles().houseCusps`) — truyền
   * mảng RỖNG cho chart chưa biết giờ sinh (`BirthData.localTime === null`) để mọi `house` trả
   * về `null`, đúng comment sẵn có ở `NormalizedPlanetPosition.house`
   * ("null nếu unknown-time chart") — KHÔNG tự gọi provider.getHouseCusps ở đây.
   */
  houseCusps: readonly NormalizedHouseCusp[];
  precisionClass: PrecisionClass;
}

export type MapWesternPlanetPositionsResult = { ok: true; planets: NormalizedPlanetPosition[] } | { ok: false; errors: AstrologyCoreError[] };

/**
 * Ánh xạ lỗi provider sang `AstrologyCoreError` — cùng nguyên tắc/hạn chế đã ghi ở
 * `houses.ts::mapHouseProviderError` (xem "VẤN ĐỀ KIẾN TRÚC MỞ" ở đó, không lặp lại ở đây).
 */
function mapPlanetProviderError(error: unknown, body: CelestialBody): AstrologyCoreError {
  if (error instanceof SwissEphemerisUnsupportedBodyError) {
    return {
      code: "UNSUPPORTED_FEATURE",
      message: `Thiên thể "${body}" chưa được provider hỗ trợ.`,
      field: "body",
      details: { body },
    };
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
 * Biến danh sách `bodies` thành `NormalizedPlanetPosition[]` đầy đủ sign/signDegree/house — HÀM
 * THUẦN, KHÔNG throw ra ngoài (lỗi trả về `{ ok: false, errors }`, đúng quy ước
 * `calculateWesternHousesAndAngles`/`resolveBirthDataInstant` đã có).
 */
export function mapWesternPlanetPositions(input: MapWesternPlanetPositionsInput): MapWesternPlanetPositionsResult {
  const precision = angularPrecisionForClass(input.precisionClass);
  const hasHouseCusps = input.houseCusps.length === 12;

  const planets: NormalizedPlanetPosition[] = [];
  for (const body of input.bodies) {
    let raw;
    try {
      raw = input.provider.getPlanetPosition(input.utcInstant, body);
    } catch (error) {
      return { ok: false, errors: [mapPlanetProviderError(error, body)] };
    }

    planets.push({
      body: raw.body,
      longitude: raw.longitude,
      latitude: raw.latitude,
      distanceAu: raw.distanceAu,
      speedDegreesPerDay: raw.speedDegreesPerDay,
      isRetrograde: raw.isRetrograde,
      sign: signOfLongitude(raw.longitude),
      signDegree: signDegreeOfLongitude(raw.longitude),
      house: hasHouseCusps ? assignHouseNumber(raw.longitude, input.houseCusps) : null,
      source: "astronomical_core",
      precision,
    });
  }

  return { ok: true, planets };
}
