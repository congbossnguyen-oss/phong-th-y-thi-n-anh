/**
 * Test tích hợp qua ĐÚNG bề mặt public API (`../index.js`), không import trực tiếp file nội
 * bộ — bảo đảm mọi export cần thiết thực sự được wire đúng ở `index.ts`, và bảo đảm
 * reproducibility ở cấp "package công khai" (không chỉ ở cấp hàm nội bộ).
 */
import { describe, expect, it } from "vitest";
import {
  isWithinTolerance,
  resolveBirthDataInstant,
  roundForDisplay,
  SwissEphemerisProvider,
  UnimplementedAstronomicalProvider,
  validateBirthData,
  type BirthData,
} from "../index.js";

const benchmarkBirthData: BirthData = {
  date: { year: 1985, month: 3, day: 12 },
  localTime: { hour: 8, minute: 30 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 21.0285,
  longitude: 105.8542,
};

describe("public API — pipeline đầy đủ Phase 1 (validate -> resolve UTC)", () => {
  it("validateBirthData + resolveBirthDataInstant hoạt động nhất quán cho cùng input hợp lệ", () => {
    expect(validateBirthData(benchmarkBirthData)).toEqual([]);
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    expect(resolved.utc.toISOString()).toBe("1985-03-12T01:30:00.000Z");
  });

  it("reproducibility ở cấp public API: gọi lại nhiều lần cho cùng kết quả tuyệt đối", () => {
    const first = resolveBirthDataInstant(benchmarkBirthData);
    const second = resolveBirthDataInstant({ ...benchmarkBirthData });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error("unreachable");
    expect(first.utc.getTime()).toBe(second.utc.getTime());
  });

  it("UnimplementedAstronomicalProvider export đúng, dùng được từ public API mà KHÔNG kéo theo Swiss Ephemeris", () => {
    const provider = new UnimplementedAstronomicalProvider();
    expect(provider.getMetadata().precisionClass).toBe("unknown");
  });

  it("precision helpers hoạt động đúng qua public API", () => {
    expect(roundForDisplay(35.542535, 4)).toBe(35.5425);
    expect(isWithinTolerance(35.5425, 35.54253500624649, 0.0001)).toBe(true);
    expect(isWithinTolerance(35.5, 35.9, 0.0001)).toBe(false);
  });

  it("SwissEphemerisProvider export đúng qua public API, pipeline đầy đủ BirthData -> UTC -> vị trí thiên văn thật", () => {
    const resolved = resolveBirthDataInstant(benchmarkBirthData);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) throw new Error("unreachable");
    const provider = new SwissEphemerisProvider();
    expect(provider.getMetadata().precisionClass).toBe("file_based");
    const sun = provider.getPlanetPosition(resolved.utc, "sun");
    expect(sun.longitude).toBeGreaterThanOrEqual(0);
    expect(sun.longitude).toBeLessThan(360);
  });
});
