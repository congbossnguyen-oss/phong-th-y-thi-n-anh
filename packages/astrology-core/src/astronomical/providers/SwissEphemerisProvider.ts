/**
 * `SwissEphemerisProvider` — implementation THẬT DUY NHẤT của `AstronomicalProvider` dùng Swiss
 * Ephemeris (qua binding Node `sweph`). ĐÂY LÀ FILE DUY NHẤT trong toàn bộ package được phép
 * `import "sweph"` — mọi code nghiệp vụ khác (chart/, validation/, timezone/) PHẢI đi qua
 * interface `AstronomicalProvider`, không bao giờ biết tới `sweph` — đúng ADR-001 và
 * `docs/astrology-module/ARCHITECTURE/PHASE3A_ASTRONOMICAL_CORE.md`.
 *
 * PHẠM VI PHASE 3A: chỉ vị trí hành tinh/node/Chiron/Lilith thô (`getPlanetPosition`,
 * `getNodePosition`). House cusps/Ascendant/Midheaven/Ayanamsa CHƯA implement — xem
 * `SwissEphemerisPhase3AScopeError`. KHÔNG có house/aspect/dignity/interpretation nào ở đây.
 *
 * QUY ƯỚC TOẠ ĐỘ (phải đọc trước khi dùng số liệu từ class này):
 * - Geocentric (tâm Trái Đất), KHÔNG heliocentric.
 * - Kinh độ/vĩ độ hoàng đạo (ecliptic longitude/latitude), KHÔNG phải xích đạo (equatorial).
 * - Vị trí BIỂU KIẾN (apparent: đã cộng light-time, gravitational deflection, aberration) —
 *   mặc định của `calc_ut` khi KHÔNG bật cờ `SEFLG_TRUEPOS`/`SEFLG_NOABERR`/`SEFLG_NOGDEFL`.
 * - Hệ quy chiếu: equinox/ecliptic CỦA NGÀY (of date) — mặc định của Swiss Ephemeris khi KHÔNG
 *   bật `SEFLG_J2000` (không bật ở đây).
 * - Lịch: proleptic Gregorian trên toàn bộ trục thời gian (khớp `CalendarDate` đã tài liệu ở
 *   `types.ts` — KHÔNG chuyển sang lịch Julius cho ngày trước 1582, tránh 2 diễn giải lịch khác
 *   nhau giữa `calendar-core`/`BirthData` và tầng thiên văn).
 *
 * QUYẾT ĐỊNH PRECISION: mỗi lệnh gọi tính toán SO SÁNH cờ yêu cầu (`SEFLG_SWIEPH`) với cờ Swiss
 * Ephemeris THỰC TẾ trả về — nếu khác nhau (rớt xuống Moshier/JPL âm thầm, vd. ngày ngoài phạm
 * vi file `.se1` hiện có 1800-2400, hoặc file thiếu/hỏng), ném `SwissEphemerisPrecisionDegradedError`
 * NGAY LẬP TỨC thay vì âm thầm trả kết quả kém chính xác hơn — đây là biện pháp chống lại đúng
 * "Critical finding: silent Moshier fallback" của `docs/astrology-module/AUDIT/SWISS_EPHEMERIS_AUDIT.md`.
 * `getMetadata().precisionClass` bổ sung một phép "probe" độc lập (tính Mặt Trời tại J2000.0) để
 * báo cáo tình trạng cấu hình tổng thể — dùng cho health-check khi khởi động, KHÔNG thay thế
 * kiểm tra per-call ở trên.
 *
 * TRẠNG THÁI PROCESS-WIDE: Swiss Ephemeris (native C library) giữ trạng thái toàn tiến trình
 * (ephemeris path, v.v. — xem README của `sweph`: "process-wide settings... affect the entire
 * process, including all worker_threads"). Vì vậy chỉ NÊN có MỘT ephemeris path hiệu lực tại một
 * thời điểm trong cả tiến trình Node — constructor gọi `set_ephe_path()` mỗi lần khởi tạo; nếu
 * ứng dụng tạo nhiều instance với path khác nhau, instance khởi tạo SAU CÙNG quyết định path
 * hiệu lực cho TẤT CẢ instance (giới hạn của thư viện native, không phải bug của class này).
 */

import {
  calc_ut,
  constants,
  set_ephe_path,
  utc_to_jd,
  version,
} from "sweph";

import type {
  AngleResult,
  AstronomicalProvider,
  AyanamsaId,
  CelestialBody,
  HouseCusps,
  HouseSystemId,
  KnownCelestialBody,
  NodePosition,
  NodeType,
  PlanetPosition,
  PrecisionClass,
  ProviderMetadata,
} from "../AstronomicalProvider.js";
import { resolveDefaultEphemerisPath } from "./ephemerisPath.js";
import {
  SwissEphemerisCalculationError,
  SwissEphemerisPhase3AScopeError,
  SwissEphemerisPrecisionDegradedError,
  SwissEphemerisUnsupportedBodyError,
} from "./errors.js";

/**
 * Ánh xạ định danh thiên thể ĐÃ BIẾT sang Swiss Ephemeris body ID. CHỈ các thiên thể trong bảng
 * này được `getPlanetPosition` chấp nhận ở Phase 3A — bất kỳ `CelestialBody` hợp lệ nào khác về
 * KIỂU (vd. "eris", asteroid tương lai) nhưng KHÔNG có trong bảng này sẽ bị từ chối bằng
 * `SwissEphemerisUnsupportedBodyError` (KHÔNG phải lỗi kiểu — CelestialBody là kiểu mở theo
 * Phase 2.1, nhưng khả năng TÍNH TOÁN THẬT vẫn hữu hạn theo những gì Phase 3A implement).
 */
const KNOWN_BODY_TO_SWISS_EPH_ID: Record<KnownCelestialBody, number> = {
  sun: constants.SE_SUN,
  moon: constants.SE_MOON,
  mercury: constants.SE_MERCURY,
  venus: constants.SE_VENUS,
  mars: constants.SE_MARS,
  jupiter: constants.SE_JUPITER,
  saturn: constants.SE_SATURN,
  uranus: constants.SE_URANUS,
  neptune: constants.SE_NEPTUNE,
  pluto: constants.SE_PLUTO,
  chiron: constants.SE_CHIRON,
  // "True Lilith" ở phần mềm chiêm tinh thường là APOGEE DAO ĐỘNG (osculating apogee), KHÔNG phải
  // một thiên thể vật lý — quy ước này ghi rõ ở đây vì có nhiều định nghĩa "True Lilith" khác nhau
  // trong cộng đồng chiêm tinh (vd. một số phần mềm dùng "interpolated apogee" SE_INTP_APOG thay
  // thế); Phase 3A CHỌN osculating apogee vì đây là lựa chọn phổ biến nhất và là ánh xạ trực tiếp
  // nhất trong Swiss Ephemeris (KHÔNG có tính toán/nội suy bổ sung nào của package này).
  mean_lilith: constants.SE_MEAN_APOG,
  true_lilith: constants.SE_OSCU_APOG,
};

const SWISS_EPH_CALC_FLAGS = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;

/** Thời điểm dùng để "probe" tình trạng ephemeris lúc `getMetadata()` được gọi — J2000.0, luôn nằm trong phạm vi bất kỳ bộ file `.se1` hợp lý nào. */
const METADATA_PROBE_UTC = new Date("2000-01-01T12:00:00.000Z");

export interface SwissEphemerisProviderOptions {
  /** Ghi đè đường dẫn thư mục ephemeris — mặc định `resolveDefaultEphemerisPath()` (`<package root>/ephe`). Dùng cho test (vd. trỏ tới thư mục rỗng để buộc kiểm tra đường Moshier fallback). */
  ephemerisPath?: string;
}

function normalizeDegrees(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export class SwissEphemerisProvider implements AstronomicalProvider {
  private readonly ephemerisPath: string;

  constructor(options: SwissEphemerisProviderOptions = {}) {
    this.ephemerisPath = options.ephemerisPath ?? resolveDefaultEphemerisPath();
    set_ephe_path(this.ephemerisPath);
  }

  getMetadata(): ProviderMetadata {
    const precisionClass = this.probePrecisionClass();
    return {
      engineName: "swiss-ephemeris",
      engineVersion: version(),
      ephemerisVersion: null,
      precisionClass,
    };
  }

  getPlanetPosition(utcInstant: Date, body: CelestialBody): PlanetPosition {
    const swissEphId = KNOWN_BODY_TO_SWISS_EPH_ID[body as keyof typeof KNOWN_BODY_TO_SWISS_EPH_ID];
    if (swissEphId === undefined) {
      throw new SwissEphemerisUnsupportedBodyError(body);
    }

    const result = this.calcBody(utcInstant, swissEphId, `getPlanetPosition(${body})`);
    const [lon, lat, dist, lonSpd] = result;

    return {
      body,
      longitude: normalizeDegrees(lon),
      latitude: lat,
      distanceAu: dist,
      speedDegreesPerDay: lonSpd,
      isRetrograde: lonSpd < 0,
    };
  }

  getNodePosition(utcInstant: Date, nodeType: NodeType, pole: "north" | "south"): NodePosition {
    const swissEphId = nodeType === "true" ? constants.SE_TRUE_NODE : constants.SE_MEAN_NODE;
    const result = this.calcBody(utcInstant, swissEphId, `getNodePosition(${nodeType})`);
    const northLongitude = normalizeDegrees(result[0]);
    const longitude = pole === "north" ? northLongitude : normalizeDegrees(northLongitude + 180);
    return { nodeType, pole, longitude };
  }

  getHouseCusps(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): HouseCusps {
    throw new SwissEphemerisPhase3AScopeError("getHouseCusps");
  }

  getAscendant(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult {
    throw new SwissEphemerisPhase3AScopeError("getAscendant");
  }

  getMidheaven(_utcInstant: Date, _latitude: number, _longitude: number, _houseSystem: HouseSystemId): AngleResult {
    throw new SwissEphemerisPhase3AScopeError("getMidheaven");
  }

  getAyanamsa(_utcInstant: Date, _ayanamsaId: AyanamsaId): number {
    throw new SwissEphemerisPhase3AScopeError("getAyanamsa");
  }

  /**
   * Quy đổi một `Date` UTC sang Julian Day (universal time) qua chính hàm `utc_to_jd` của Swiss
   * Ephemeris — KHÔNG tự làm phép tính Julian Day thủ công (tránh lệch với bảng leap-second/delta-T
   * nội bộ mà Swiss Ephemeris dùng cho chính các phép tính sau đó). LUÔN dùng `SE_GREG_CAL` (xem
   * ghi chú "QUY ƯỚC TOẠ ĐỘ" ở đầu file — lịch proleptic Gregorian xuyên suốt, khớp `CalendarDate`).
   */
  private toJulianDayUt(utcInstant: Date): number {
    const dsec = utcInstant.getUTCSeconds() + utcInstant.getUTCMilliseconds() / 1000;
    const converted = utc_to_jd(
      utcInstant.getUTCFullYear(),
      utcInstant.getUTCMonth() + 1,
      utcInstant.getUTCDate(),
      utcInstant.getUTCHours(),
      utcInstant.getUTCMinutes(),
      dsec,
      constants.SE_GREG_CAL,
    );
    if (converted.flag === constants.ERR) {
      throw new SwissEphemerisCalculationError("utc_to_jd", converted.error ?? "unknown error");
    }
    const [, jdUt] = converted.data;
    return jdUt;
  }

  private calcBody(utcInstant: Date, swissEphId: number, operationLabel: string): readonly [number, number, number, number] {
    const jdUt = this.toJulianDayUt(utcInstant);
    const result = calc_ut(jdUt, swissEphId, SWISS_EPH_CALC_FLAGS);

    if (result.flag === constants.ERR) {
      throw new SwissEphemerisCalculationError(operationLabel, result.error ?? "unknown error");
    }
    if ((result.flag & SWISS_EPH_CALC_FLAGS) !== SWISS_EPH_CALC_FLAGS) {
      throw new SwissEphemerisPrecisionDegradedError(SWISS_EPH_CALC_FLAGS, result.flag, result.error ?? "");
    }

    const [lon, lat, dist, lonSpd] = result.data;
    return [lon, lat, dist, lonSpd];
  }

  private probePrecisionClass(): PrecisionClass {
    try {
      const jdUt = this.toJulianDayUt(METADATA_PROBE_UTC);
      const result = calc_ut(jdUt, constants.SE_SUN, SWISS_EPH_CALC_FLAGS);
      if (result.flag === constants.ERR) {
        return "unknown";
      }
      return (result.flag & SWISS_EPH_CALC_FLAGS) === SWISS_EPH_CALC_FLAGS ? "file_based" : "analytic_fallback";
    } catch {
      return "unknown";
    }
  }
}
