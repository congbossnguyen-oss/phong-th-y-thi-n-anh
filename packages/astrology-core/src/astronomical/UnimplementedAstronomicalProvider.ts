/**
 * Placeholder AstronomicalProvider — KHÔNG phải Swiss Ephemeris, KHÔNG import bất kỳ thư viện
 * ephemeris nào. Dùng để: (1) cho phép code Phase 1 biên dịch/test đầy đủ mà không cần một
 * provider thật, (2) làm "unsupported provider behavior" rõ ràng thay vì `undefined`/crash mơ
 * hồ nếu ai đó lỡ gọi provider trước khi có quyết định license.
 *
 * `SwissEphemerisProvider` CHƯA được viết — xem
 * docs/astrology-module/ARCHITECTURE/LICENSE_BOUNDARY.md (LEGAL DECISION REQUIRED).
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
      `AstronomicalProvider chưa có implementation thật (gọi ${method}()). ` +
        `SwissEphemerisProvider chưa được viết — xem docs/astrology-module/ARCHITECTURE/LICENSE_BOUNDARY.md ` +
        `(LEGAL DECISION REQUIRED, chưa xác nhận Swiss Ephemeris Professional License).`,
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
