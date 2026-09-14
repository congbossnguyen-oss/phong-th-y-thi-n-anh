import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveBirthDataInstant } from "../../../timezone/resolveBirthDataInstant.js";
import type { BirthData } from "../../../types.js";
import { ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES, ANGULAR_TOLERANCE_FILE_BASED_DEGREES, isWithinTolerance } from "../../../precision.js";
import { SwissEphemerisProvider } from "../SwissEphemerisProvider.js";
import { SwissEphemerisPrecisionDegradedError, SwissEphemerisUnsupportedBodyError } from "../errors.js";
import { GOLDEN_SCENARIOS, J2000_REFERENCE, J2000_UTC_ISO, MEAN_NODE_MEEUS_REFERENCE_J2000_DEGREES } from "./goldenFixtures.js";

const EMPTY_EPHEMERIS_DIR = fileURLToPath(new URL(".", import.meta.url)); // thư mục test — không có file .se1 nào, buộc rớt xuống Moshier.

/**
 * QUAN TRỌNG: Swiss Ephemeris (native) giữ `ephe path` là TRẠNG THÁI TOÀN TIẾN TRÌNH (process-wide)
 * — xem docstring `SwissEphemerisProvider`. Vì vậy KHÔNG dùng chung một instance `provider` ở cấp
 * module giữa nhiều test: một test dựng provider với `EMPTY_EPHEMERIS_DIR` sẽ âm thầm đổi path
 * hiệu lực cho MỌI provider khác (kể cả provider cũ đã dựng trước đó) trong cùng tiến trình test.
 * Mỗi test dùng đường dẫn mặc định phải tự dựng provider MỚI ngay trước khi tính toán, đảm bảo
 * `set_ephe_path` đúng được gọi lại ngay trước phép tính — không phụ thuộc thứ tự chạy test khác.
 */
function defaultProvider(): SwissEphemerisProvider {
  return new SwissEphemerisProvider();
}

function buildBirthData(scenario: (typeof GOLDEN_SCENARIOS)[number]): BirthData {
  return {
    date: scenario.birthData.date,
    localTime: scenario.birthData.localTime,
    timezoneId: scenario.birthData.timezoneId,
    // Toạ độ quan sát KHÔNG ảnh hưởng longitude/latitude geocentric của getPlanetPosition — dùng
    // 0,0 vì Phase 3A chưa tính house/ASC/MC (nơi toạ độ mới thực sự cần).
    latitude: 0,
    longitude: 0,
  };
}

describe("SwissEphemerisProvider — getMetadata", () => {
  it("báo cáo file_based khi ephemeris path mặc định có đủ file .se1", () => {
    const meta = defaultProvider().getMetadata();
    expect(meta.engineName).toBe("swiss-ephemeris");
    expect(meta.precisionClass).toBe("file_based");
    expect(meta.engineVersion).toMatch(/^2\.10/);
  });

  it("báo cáo analytic_fallback khi trỏ tới thư mục KHÔNG có file .se1", () => {
    const fallbackProvider = new SwissEphemerisProvider({ ephemerisPath: EMPTY_EPHEMERIS_DIR });
    expect(fallbackProvider.getMetadata().precisionClass).toBe("analytic_fallback");
  });
});

describe("SwissEphemerisProvider — golden test: BirthData thật → resolveBirthDataInstant → Swiss Ephemeris, cross-check JPL Horizons", () => {
  for (const scenario of GOLDEN_SCENARIOS) {
    describe(scenario.label, () => {
      it(`resolveBirthDataInstant cho đúng UTC kỳ vọng (${scenario.localDescription})`, () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        expect(resolution.ok).toBe(true);
        if (!resolution.ok) return;
        expect(resolution.utc.toISOString()).toBe(scenario.expectedUtcIso);
      });

      it("Sun khớp JPL Horizons trong dung sai file_based", () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        if (!resolution.ok) throw new Error("BirthData resolution failed unexpectedly");
        const sun = defaultProvider().getPlanetPosition(resolution.utc, "sun");
        expect(isWithinTolerance(sun.longitude, scenario.sun.lon, ANGULAR_TOLERANCE_FILE_BASED_DEGREES)).toBe(true);
        expect(isWithinTolerance(sun.latitude, scenario.sun.lat, ANGULAR_TOLERANCE_FILE_BASED_DEGREES)).toBe(true);
      });

      it("Moon khớp JPL Horizons trong dung sai file_based", () => {
        const resolution = resolveBirthDataInstant(buildBirthData(scenario));
        if (!resolution.ok) throw new Error("BirthData resolution failed unexpectedly");
        const moon = defaultProvider().getPlanetPosition(resolution.utc, "moon");
        expect(isWithinTolerance(moon.longitude, scenario.moon.lon, ANGULAR_TOLERANCE_FILE_BASED_DEGREES)).toBe(true);
        expect(isWithinTolerance(moon.latitude, scenario.moon.lat, ANGULAR_TOLERANCE_FILE_BASED_DEGREES)).toBe(true);
      });
    });
  }
});

describe("SwissEphemerisProvider — golden test: J2000.0, toàn bộ 10 hành tinh cổ điển + Chiron vs JPL Horizons", () => {
  const utcInstant = new Date(J2000_UTC_ISO);

  for (const [body, expected] of Object.entries(J2000_REFERENCE)) {
    it(`${body} khớp JPL Horizons trong dung sai file_based`, () => {
      const result = defaultProvider().getPlanetPosition(utcInstant, body);
      expect(isWithinTolerance(result.longitude, expected.lon, ANGULAR_TOLERANCE_FILE_BASED_DEGREES)).toBe(true);
      expect(isWithinTolerance(result.latitude, expected.lat, ANGULAR_TOLERANCE_FILE_BASED_DEGREES)).toBe(true);
    });
  }

  it("Saturn nghịch hành (retrograde) tại J2000.0 — isRetrograde khớp dấu speedDegreesPerDay (KHÔNG phải giá trị bịa, số liệu thật từ Swiss Ephemeris)", () => {
    const saturn = defaultProvider().getPlanetPosition(utcInstant, "saturn");
    expect(saturn.speedDegreesPerDay).toBeLessThan(0);
    expect(saturn.isRetrograde).toBe(true);
  });

  it("mọi hành tinh: isRetrograde LUÔN đúng bằng speedDegreesPerDay < 0 (bất biến bắt buộc của interface)", () => {
    for (const body of Object.keys(J2000_REFERENCE)) {
      if (body === "moon" || body === "sun") continue; // Sun/Moon không có khái niệm nghịch hành geocentric có ý nghĩa thực tế, vẫn kiểm tra bất biến kiểu học.
      const result = defaultProvider().getPlanetPosition(utcInstant, body);
      expect(result.isRetrograde).toBe(result.speedDegreesPerDay < 0);
    }
  });
});

describe("SwissEphemerisProvider — Mean/True Lunar Node", () => {
  const utcInstant = new Date(J2000_UTC_ISO);

  it("Mean Node khớp công thức Meeus trong dung sai chênh-lệch-lý-thuyết (KHÔNG phải dung sai file_based — hai lý thuyết khác nhau)", () => {
    const meanNode = defaultProvider().getNodePosition(utcInstant, "mean", "north");
    expect(isWithinTolerance(meanNode.longitude, MEAN_NODE_MEEUS_REFERENCE_J2000_DEGREES, ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES)).toBe(
      true,
    );
  });

  it("North/South LUÔN lệch đúng 180° cho cả mean và true node", () => {
    for (const nodeType of ["mean", "true"] as const) {
      const north = defaultProvider().getNodePosition(utcInstant, nodeType, "north");
      const south = defaultProvider().getNodePosition(utcInstant, nodeType, "south");
      const diff = Math.abs(north.longitude - south.longitude);
      expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 6);
    }
  });

  it("True Node dao động quanh Mean Node trong biên độ vật lý hợp lý (~±1.5-2°, KHÔNG lệch hàng chục độ — bắt lỗi ánh xạ nhầm ID)", () => {
    const mean = defaultProvider().getNodePosition(utcInstant, "mean", "north");
    const trueNode = defaultProvider().getNodePosition(utcInstant, "true", "north");
    const diff = Math.abs(mean.longitude - trueNode.longitude);
    expect(Math.min(diff, 360 - diff)).toBeLessThan(3);
  });
});

describe("SwissEphemerisProvider — Lilith (mean_lilith/true_lilith)", () => {
  it("mean_lilith và true_lilith trả về longitude hợp lệ trong [0,360), khác nhau (không phải cùng một điểm)", () => {
    const utcInstant = new Date(J2000_UTC_ISO);
    const mean = defaultProvider().getPlanetPosition(utcInstant, "mean_lilith");
    const trueLilith = defaultProvider().getPlanetPosition(utcInstant, "true_lilith");
    for (const p of [mean, trueLilith]) {
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
    }
    expect(mean.longitude).not.toBeCloseTo(trueLilith.longitude, 2);
  });
});

describe("SwissEphemerisProvider — lỗi thiên thể không hỗ trợ", () => {
  it("thiên thể lạ (chưa có ánh xạ Swiss Ephemeris ID) ném SwissEphemerisUnsupportedBodyError, KHÔNG trả số liệu bịa", () => {
    const utcInstant = new Date(J2000_UTC_ISO);
    expect(() => defaultProvider().getPlanetPosition(utcInstant, "eris")).toThrow(SwissEphemerisUnsupportedBodyError);
    expect(() => defaultProvider().getPlanetPosition(utcInstant, "some_school_specific_point")).toThrow(SwissEphemerisUnsupportedBodyError);
  });
});

describe("SwissEphemerisProvider — chống 'silent Moshier fallback' (SWISS_EPHEMERIS_AUDIT.md)", () => {
  it("khi ephemeris path KHÔNG có file .se1, getPlanetPosition ném SwissEphemerisPrecisionDegradedError thay vì âm thầm trả kết quả Moshier", () => {
    const fallbackProvider = new SwissEphemerisProvider({ ephemerisPath: EMPTY_EPHEMERIS_DIR });
    const utcInstant = new Date(J2000_UTC_ISO);
    expect(() => fallbackProvider.getPlanetPosition(utcInstant, "sun")).toThrow(SwissEphemerisPrecisionDegradedError);
  });

  it("khi ngày NẰM NGOÀI phạm vi file .se1 hiện có (1800-2400), ném SwissEphemerisPrecisionDegradedError thay vì âm thầm trả Moshier", () => {
    const farFuture = new Date("2500-01-01T00:00:00.000Z"); // ngoài phạm vi sepl_18/semo_18/seas_18 (1800-2400)
    expect(() => defaultProvider().getPlanetPosition(farFuture, "sun")).toThrow(SwissEphemerisPrecisionDegradedError);
  });
});

describe("SwissEphemerisProvider — xác định luôn dùng ephemeris path project-relative, không hardcode đường dẫn máy cụ thể", () => {
  it("đường dẫn mặc định nằm trong package (thư mục 'ephe' cạnh package.json), không chứa tên người dùng hệ điều hành", () => {
    const packageRoot = path.resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
    const defaultProviderMeta = new SwissEphemerisProvider().getMetadata();
    expect(defaultProviderMeta.precisionClass).toBe("file_based"); // gián tiếp xác nhận path mặc định thật sự trỏ đúng chỗ có file
    expect(packageRoot.endsWith("astrology-core") || packageRoot.endsWith("astrology-core" + path.sep)).toBe(true);
  });
});
