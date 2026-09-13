/**
 * Phase 3B-2 — lắp ráp một `NormalizedChart` Tây phương ĐẦY ĐỦ (trong phạm vi đã implement:
 * planets + houseCusps + angles) từ một `BirthData` đã quy đổi UTC. Đây là hàm "tiện dụng" ghép
 * `western/houses.ts` (Phase 3B-1) + `western/planets.ts` (Phase 3B-2) +
 * `chart/createNormalizedChart.ts` (Phase 2) lại — KHÔNG thêm bất kỳ tính toán MỚI nào ngoài
 * việc điều phối 3 hàm đã có, đúng mục tiêu "làm NormalizedChart hữu dụng như một cấu trúc lá số
 * Tây phương thật" của task brief Phase 3B-2.
 *
 * `NormalizedChart.houses[]` (sign+ruler của TỪNG NHÀ) và `points[]`/`nodes[]`/`aspects[]`/
 * `dignities[]` KHÔNG được điền ở đây — ngoài phạm vi Phase 3B-2 (xem FUTURE_WORK.md mục 14).
 */

import { randomUUID } from "node:crypto";

import type { AstrologyCoreError } from "../errors.js";
import type { AstronomicalProvider, CelestialBody, HouseSystemId } from "../astronomical/AstronomicalProvider.js";
import type { NormalizedChart, SchoolId } from "../chart/types.js";
import { createNormalizedChart } from "../chart/createNormalizedChart.js";
import { calculateWesternHousesAndAngles, WESTERN_DEFAULT_HOUSE_SYSTEM } from "./houses.js";
import { mapWesternPlanetPositions, WESTERN_CORE_BODIES } from "./planets.js";

/** Phiên bản cấu hình zodiac Tây phương (Phase 3B-2) — khớp quy ước đã dùng ở Phase 2 fixture ("western.core.v1", `chart/__tests__/fixtures.ts`), KHÔNG bịa quy ước mới. */
export const WESTERN_CORE_ZODIAC_CONFIG_VERSION = "western.core.v1";
/** Phiên bản chính sách precision (Phase 1, `precision.ts`) — khớp quy ước đã dùng ở Phase 2 fixture ("1.0.0"). */
export const WESTERN_CORE_PRECISION_POLICY_VERSION = "1.0.0";

export interface BuildWesternChartInput {
  provider: AstronomicalProvider;
  birthDataRef: string;
  /** UTC ĐÃ quy đổi qua `resolveBirthDataInstant` (Phase 1) — hàm này KHÔNG tự làm timezone/DST. */
  utcInstant: Date;
  latitude: number;
  longitude: number;
  /**
   * `false` cho chart KHÔNG rõ giờ sinh (`BirthData.localTime === null`) — bỏ qua hoàn toàn house
   * cusps/angles/house assignment, đúng hệ quả đã tài liệu ở `resolveBirthDataInstant.ts`
   * ("Chart Calculation... phải tự loại bỏ mọi field phụ thuộc giờ khi biết localTime gốc là
   * null"). Mặc định `true`.
   */
  hasKnownLocalTime?: boolean;
  houseSystem?: HouseSystemId;
  bodies?: readonly CelestialBody[];
  school?: SchoolId;
}

export type BuildWesternChartResult = { ok: true; chart: NormalizedChart } | { ok: false; errors: AstrologyCoreError[] };

/**
 * Lắp ráp `NormalizedChart` Tây phương — HÀM THUẦN ngoại trừ `calculationId`/`calculatedAt` mặc
 * định (UUID/`new Date()` khi không truyền qua `createNormalizedChart`, đúng ngoại lệ đã chấp
 * nhận từ Phase 2 cho metadata nguồn gốc, KHÔNG ảnh hưởng dữ liệu chiêm tinh thực sự).
 */
export function buildWesternChart(input: BuildWesternChartInput): BuildWesternChartResult {
  const houseSystem = input.houseSystem ?? WESTERN_DEFAULT_HOUSE_SYSTEM;
  const hasKnownLocalTime = input.hasKnownLocalTime ?? true;
  const providerMetadata = input.provider.getMetadata();

  let houseCusps: NormalizedChart["houseCusps"] = [];
  let angles: NormalizedChart["angles"] = [];

  if (hasKnownLocalTime) {
    const housesResult = calculateWesternHousesAndAngles({
      provider: input.provider,
      utcInstant: input.utcInstant,
      latitude: input.latitude,
      longitude: input.longitude,
      houseSystem,
    });
    if (!housesResult.ok) return { ok: false, errors: housesResult.errors };
    houseCusps = housesResult.houseCusps;
    angles = housesResult.angles;
  }

  const planetsResult = mapWesternPlanetPositions({
    provider: input.provider,
    utcInstant: input.utcInstant,
    bodies: input.bodies ?? WESTERN_CORE_BODIES,
    houseCusps,
    precisionClass: providerMetadata.precisionClass,
  });
  if (!planetsResult.ok) return { ok: false, errors: planetsResult.errors };

  const chart = createNormalizedChart({
    metadata: {
      calculationId: randomUUID(),
      calculatedAt: new Date(),
      engine: providerMetadata.engineName,
      engineVersion: providerMetadata.engineVersion,
      ephemerisVersion: providerMetadata.ephemerisVersion,
      precisionClass: providerMetadata.precisionClass,
      zodiacConfigVersion: WESTERN_CORE_ZODIAC_CONFIG_VERSION,
      houseSystem,
      ayanamsa: null,
      precisionPolicyVersion: WESTERN_CORE_PRECISION_POLICY_VERSION,
    },
    birthDataRef: input.birthDataRef,
    school: input.school ?? "western",
    zodiacType: "tropical",
    ayanamsa: null,
    houseSystem,
    planets: planetsResult.planets,
    houseCusps,
    angles,
  });

  return { ok: true, chart };
}
