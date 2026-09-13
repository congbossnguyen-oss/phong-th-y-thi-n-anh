/**
 * Lắp ráp một `NormalizedChart` Tây phương ĐẦY ĐỦ (trong phạm vi đã implement: planets +
 * houseCusps + angles + aspects) từ một `BirthData` đã quy đổi UTC. Đây là hàm "tiện dụng" ghép
 * `western/houses.ts` (Phase 3B-1) + `western/planets.ts` (Phase 3B-2) +
 * `western/aspects.ts` (Phase 3C) + `chart/createNormalizedChart.ts` (Phase 2) lại — KHÔNG thêm
 * bất kỳ tính toán MỚI nào ngoài việc điều phối các hàm đã có.
 *
 * `NormalizedChart.houses[]` (sign+ruler của TỪNG NHÀ) và `points[]`/`nodes[]`/`dignities[]`
 * KHÔNG được điền ở đây — ngoài phạm vi (xem FUTURE_WORK.md mục 14). `aspects[]` ĐÃ điền từ
 * Phase 3C — CHỈ giữa các hành tinh đã tính trong `planets[]` (đúng tên field `planet_a`/
 * `planet_b` của `DOMAIN_MODEL.md` §4 — KHÔNG mở rộng sang góc/node/point, xem
 * PHASE3C_ASPECTS_IMPLEMENTATION.md).
 */

import { randomUUID } from "node:crypto";

import type { AstrologyCoreError } from "../errors.js";
import type { AstronomicalProvider, CelestialBody, HouseSystemId } from "../astronomical/AstronomicalProvider.js";
import type { NormalizedChart, SchoolId } from "../chart/types.js";
import { createNormalizedChart } from "../chart/createNormalizedChart.js";
import { computeWesternAspects, WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY, type AspectOrbPolicy } from "./aspects.js";
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
  /** Mặc định `WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY` (Phase 3C) nếu bỏ trống. */
  aspectOrbPolicy?: AspectOrbPolicy;
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

  const aspects = computeWesternAspects(
    planetsResult.planets.map((p) => ({ body: p.body, longitude: p.longitude })),
    input.aspectOrbPolicy ?? WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY,
  );

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
    aspects,
  });

  return { ok: true, chart };
}
