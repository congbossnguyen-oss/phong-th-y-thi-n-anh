/**
 * Contract test cho `AstronomicalProvider` — kiểm tra HÀNH VI mà mọi implementation (kể cả
 * tương lai `SwissEphemerisProvider`) phải tuân thủ, KHÔNG phải test một implementation cụ
 * thể (Phase 1 chưa có implementation thật). Dùng một `MockAstronomicalProvider` giả lập số
 * liệu cố định chỉ để chạy được contract test này — KHÔNG export ra ngoài package.
 */
import { describe, expect, it } from "vitest";
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
} from "../AstronomicalProvider.js";
import {
  AstronomicalProviderNotConfiguredError,
  UnimplementedAstronomicalProvider,
} from "../UnimplementedAstronomicalProvider.js";

const ALL_BODIES: CelestialBody[] = [
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

/** Provider giả — dữ liệu cố định, KHÔNG phải Swiss Ephemeris, chỉ dùng nội bộ cho contract test. */
class MockAstronomicalProvider implements AstronomicalProvider {
  getMetadata(): ProviderMetadata {
    return { engineName: "mock", engineVersion: "0.0.0-test", ephemerisVersion: null, precisionClass: "unknown" };
  }
  getPlanetPosition(_utcInstant: Date, body: CelestialBody): PlanetPosition {
    // Saturn giả lập nghịch hành để test tính nhất quán isRetrograde <-> dấu speed.
    const speed = body === "saturn" ? -0.0076 : 0.9;
    return { body, longitude: 123.456, latitude: 0.5, distanceAu: 1.2, speedDegreesPerDay: speed, isRetrograde: speed < 0 };
  }
  getNodePosition(_utcInstant: Date, nodeType: NodeType, pole: "north" | "south"): NodePosition {
    const northLongitude = 49.96;
    return { nodeType, pole, longitude: pole === "north" ? northLongitude : (northLongitude + 180) % 360 };
  }
  getHouseCusps(_utcInstant: Date, _latitude: number, _longitude: number, houseSystem: HouseSystemId): HouseCusps {
    const cusps: HouseCusps["cusps"] = [35.5, 63.5, 91.1, 116.0, 148.2, 178.2, 215.5, 243.0, 268.5, 296.0, 328.2, 3.4];
    return { houseSystem, cusps };
  }
  getAscendant(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult {
    return { longitude: 35.5 };
  }
  getMidheaven(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult {
    return { longitude: 296.0 };
  }
  getAyanamsa(_utcInstant: Date, _ayanamsaId: AyanamsaId): number {
    return 23.65;
  }
}

const UTC_INSTANT = new Date("1985-03-12T01:30:00.000Z");

describe("AstronomicalProvider — contract (mọi implementation phải thoả)", () => {
  const provider = new MockAstronomicalProvider();

  it("getPlanetPosition trả longitude trong [0,360) cho cả 10 hành tinh", () => {
    for (const body of ALL_BODIES) {
      const p = provider.getPlanetPosition(UTC_INSTANT, body);
      expect(p.body).toBe(body);
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
    }
  });

  it("isRetrograde LUÔN nhất quán với dấu speedDegreesPerDay", () => {
    for (const body of ALL_BODIES) {
      const p = provider.getPlanetPosition(UTC_INSTANT, body);
      expect(p.isRetrograde).toBe(p.speedDegreesPerDay < 0);
    }
  });

  it("North/South Node lệch nhau đúng 180°", () => {
    const north = provider.getNodePosition(UTC_INSTANT, "true", "north");
    const south = provider.getNodePosition(UTC_INSTANT, "true", "south");
    const diff = Math.abs(north.longitude - south.longitude);
    expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 6);
  });

  it("getHouseCusps trả đúng 12 cusp, mỗi giá trị trong [0,360)", () => {
    const houses = provider.getHouseCusps(UTC_INSTANT, 21.0285, 105.8542, "placidus");
    expect(houses.cusps).toHaveLength(12);
    for (const c of houses.cusps) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(360);
    }
  });

  it("getAscendant/getMidheaven trả góc trong [0,360)", () => {
    const asc = provider.getAscendant(UTC_INSTANT, 21.0285, 105.8542, "placidus");
    const mc = provider.getMidheaven(UTC_INSTANT, 21.0285, 105.8542, "placidus");
    expect(asc.longitude).toBeGreaterThanOrEqual(0);
    expect(asc.longitude).toBeLessThan(360);
    expect(mc.longitude).toBeGreaterThanOrEqual(0);
    expect(mc.longitude).toBeLessThan(360);
  });

  it("getMetadata trả precisionClass hợp lệ (bắt buộc báo cáo trung thực, không mặc định lạc quan)", () => {
    const meta = provider.getMetadata();
    expect(["file_based", "analytic_fallback", "unknown"]).toContain(meta.precisionClass);
  });
});

describe("UnimplementedAstronomicalProvider — hành vi khi chưa có provider thật (unsupported provider behavior)", () => {
  const provider = new UnimplementedAstronomicalProvider();

  it("getMetadata KHÔNG throw, báo precisionClass='unknown' và engineName rõ ràng là placeholder", () => {
    const meta = provider.getMetadata();
    expect(meta.precisionClass).toBe("unknown");
    expect(meta.engineName).toBe("unimplemented");
  });

  it("mọi phương thức tính toán đều throw AstronomicalProviderNotConfiguredError, KHÔNG trả số liệu giả im lặng", () => {
    expect(() => provider.getPlanetPosition(UTC_INSTANT, "sun")).toThrow(AstronomicalProviderNotConfiguredError);
    expect(() => provider.getNodePosition(UTC_INSTANT, "true", "north")).toThrow(AstronomicalProviderNotConfiguredError);
    expect(() => provider.getHouseCusps(UTC_INSTANT, 0, 0, "placidus")).toThrow(AstronomicalProviderNotConfiguredError);
    expect(() => provider.getAscendant(UTC_INSTANT, 0, 0, "placidus")).toThrow(AstronomicalProviderNotConfiguredError);
    expect(() => provider.getMidheaven(UTC_INSTANT, 0, 0, "placidus")).toThrow(AstronomicalProviderNotConfiguredError);
    expect(() => provider.getAyanamsa(UTC_INSTANT, "lahiri")).toThrow(AstronomicalProviderNotConfiguredError);
  });

  it("thông điệp lỗi trỏ rõ tới SwissEphemerisProvider (provider thật, xem Phase 3A), không phải một stack trace vô nghĩa", () => {
    try {
      provider.getPlanetPosition(UTC_INSTANT, "sun");
      throw new Error("phải throw ở dòng trên");
    } catch (e) {
      expect(e).toBeInstanceOf(AstronomicalProviderNotConfiguredError);
      expect((e as Error).message).toContain("SwissEphemerisProvider");
    }
  });
});

describe("CelestialBody — mở rộng được (Phase 2.1, Approved Decision 1)", () => {
  const provider = new MockAstronomicalProvider();

  it("10 hành tinh cổ điển ĐÃ BIẾT vẫn hợp lệ (tương thích ngược, không đổi hành vi)", () => {
    for (const body of ALL_BODIES) {
      expect(() => provider.getPlanetPosition(UTC_INSTANT, body)).not.toThrow();
    }
  });

  it("Chiron (định danh mới thêm vào KnownCelestialBody) được chấp nhận như một CelestialBody hợp lệ", () => {
    const body: CelestialBody = "chiron";
    expect(() => provider.getPlanetPosition(UTC_INSTANT, body)).not.toThrow();
    expect(provider.getPlanetPosition(UTC_INSTANT, body).body).toBe("chiron");
  });

  it("Lilith (mean_lilith) được chấp nhận như một CelestialBody hợp lệ", () => {
    const body: CelestialBody = "mean_lilith";
    expect(() => provider.getPlanetPosition(UTC_INSTANT, body)).not.toThrow();
    expect(provider.getPlanetPosition(UTC_INSTANT, body).body).toBe("mean_lilith");
  });

  it("một định danh TƯƠNG LAI hoàn toàn chưa biết (vd. tiểu hành tinh/sao cố định) KHÔNG bị từ chối chỉ vì lạ — CelestialBody là kiểu mở, không phải union đóng", () => {
    // "eris" (tiểu hành tinh 136199) và "regulus" (sao cố định) — cả hai đều KHÔNG có trong
    // KnownCelestialBody, nhưng type CelestialBody = KnownCelestialBody | (string & {}) vẫn
    // chấp nhận, đúng yêu cầu "unknown future identifiers are not rejected merely because
    // they are unknown". KHÔNG có logic tính toán nào được thêm cho các thiên thể này — mock
    // provider chỉ trả nguyên `body` lại, đúng phạm vi "chỉ kiểm tra type-level, không thêm
    // calculation logic".
    for (const futureBody of ["eris", "regulus", "some_school_specific_point"] as const) {
      const body: CelestialBody = futureBody;
      expect(() => provider.getPlanetPosition(UTC_INSTANT, body)).not.toThrow();
      expect(provider.getPlanetPosition(UTC_INSTANT, body).body).toBe(futureBody);
    }
  });
});
