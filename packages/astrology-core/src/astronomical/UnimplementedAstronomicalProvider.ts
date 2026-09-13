/**
 * Placeholder AstronomicalProvider — KHÔNG phải Swiss Ephemeris, KHÔNG import bất kỳ thư viện
 * ephemeris nào. Dùng để: (1) cho phép code Phase 1 biên dịch/test đầy đủ mà không cần một
 * provider thật, (2) làm "unsupported provider behavior" rõ ràng thay vì `undefined`/crash mơ
 * hồ nếu ai đó lỡ gọi provider trước khi cấu hình một provider thật.
 *
 * CẬP NHẬT Phase 3A: `SwissEphemerisProvider` ĐÃ được viết (xem `providers/SwissEphemerisProvider.ts`)
 * — class này vẫn còn hữu ích làm default an toàn cho code CHƯA tự cấu hình provider nào (test,
 * chỗ khởi tạo sớm), KHÔNG phải vì license vẫn chưa quyết được. Xem
 * docs/astrology-module/ARCHITECTURE/LICENSE_BOUNDARY.md để biết phạm vi quyết định license hiện tại.
 */

import type {
  AngleResult,
  AstronomicalProvider,
  AyanamsaId,
  CelestialBody,
  HouseCusps,
  HouseSystemId,
  NodePosition,
  NodeType,
  PlanetPosition,
  ProviderMetadata,
} from "./AstronomicalProvider.js";

export class AstronomicalProviderNotConfiguredError extends Error {
  constructor(method: string) {
    super(
      `AstronomicalProvider chưa được cấu hình (gọi ${method}() trên UnimplementedAstronomicalProvider). ` +
        `Dùng SwissEphemerisProvider (packages/astrology-core/src/astronomical/providers/SwissEphemerisProvider.ts) ` +
        `thay vì provider này nếu cần kết quả thật.`,
    );
    this.name = "AstronomicalProviderNotConfiguredError";
  }
}

export class UnimplementedAstronomicalProvider implements AstronomicalProvider {
  getMetadata(): ProviderMetadata {
    return { engineName: "unimplemented", engineVersion: "0.0.0", ephemerisVersion: null, precisionClass: "unknown" };
  }

  getPlanetPosition(_utcInstant: Date, _body: CelestialBody): PlanetPosition {
    throw new AstronomicalProviderNotConfiguredError("getPlanetPosition");
  }

  getNodePosition(_utcInstant: Date, _nodeType: NodeType, _pole: "north" | "south"): NodePosition {
    throw new AstronomicalProviderNotConfiguredError("getNodePosition");
  }

  getHouseCusps(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): HouseCusps {
    throw new AstronomicalProviderNotConfiguredError("getHouseCusps");
  }

  getAscendant(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult {
    throw new AstronomicalProviderNotConfiguredError("getAscendant");
  }

  getMidheaven(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult {
    throw new AstronomicalProviderNotConfiguredError("getMidheaven");
  }

  getAyanamsa(_utcInstant: Date, _ayanamsaId: AyanamsaId): number {
    throw new AstronomicalProviderNotConfiguredError("getAyanamsa");
  }
}
