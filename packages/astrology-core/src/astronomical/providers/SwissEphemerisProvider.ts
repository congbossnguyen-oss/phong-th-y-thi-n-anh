/**
 * `SwissEphemerisProvider` — implementation THẬT DUY NHẤT của `AstronomicalProvider` dùng Swiss
 * Ephemeris (qua binding Node `sweph`). ĐÂY LÀ FILE DUY NHẤT trong toàn bộ package được phép
 * `import "sweph"` — mọi code nghiệp vụ khác (chart/, validation/, timezone/) PHẢI đi qua
 * interface `AstronomicalProvider`, không bao giờ biết tới `sweph` — đúng ADR-001 và
 * `docs/astrology-module/ARCHITECTURE/PHASE3A_ASTRONOMICAL_CORE.md`.
 *
 * PHẠM VI: Phase 3A implement vị trí hành tinh/node/Chiron/Lilith thô (`getPlanetPosition`,
 * `getNodePosition`). Phase 3B-1 bổ sung house cusps/Ascendant/Midheaven (`getHouseCusps`,
 * `getAscendant`, `getMidheaven`) — CHỈ hình học Tây phương thuần tuý (tropical, house cusps,
 * ASC/MC), KHÔNG có aspect/dignity/interpretation nào ở đây. Phase 4 Step 1 bổ sung `getAyanamsa`
 * (giá trị ayanamsa THÔ, độ — KHÔNG tự trừ vào longitude nào, đó là việc của tầng `vedic/` sau
 * này) — xem `docs/astrology-module/ARCHITECTURE/PHASE4_STEP1_AYANAMSA.md`. KHÔNG có Rashi/
 * Nakshatra/Dasha nào ở file này — provider CHỈ trả dữ kiện thiên văn thô, không có tri thức
 * Vedic nào.
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
  get_ayanamsa_ex_ut,
  houses_ex2,
  set_ephe_path,
  set_sid_mode,
  utc_to_jd,
  version,
} from "sweph";
import type { HouseSystems, HousesList, PointsList } from "sweph";

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
import { normalizeDegrees } from "../../precision.js";
import { resolveDefaultEphemerisPath } from "./ephemerisPath.js";
import {
  SwissEphemerisCalculationError,
  SwissEphemerisHouseCalculationError,
  SwissEphemerisHouseSystemUndefinedAtLatitudeError,
  SwissEphemerisPrecisionDegradedError,
  SwissEphemerisUnsupportedAyanamsaError,
  SwissEphemerisUnsupportedBodyError,
  SwissEphemerisUnsupportedHouseSystemError,
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

/**
 * Ánh xạ định danh house system ĐÃ BIẾT sang mã chữ cái Swiss Ephemeris — xác nhận bằng thực
 * nghiệm qua `sweph.house_name()` (KHÔNG suy đoán từ tài liệu online, gọi thẳng thư viện đang
 * dùng để lấy tên chính thức của từng mã). CHỈ 12 hệ phổ biến nhất được hỗ trợ ở Phase 3B-1 —
 * KHÔNG hỗ trợ "G" (Gauquelin sectors, trả về 36 "cusp" thay vì 12, không tương thích shape
 * `HouseCusps` của interface). Danh sách này có thể mở rộng sau (thêm 1 dòng, KHÔNG đổi kiến
 * trúc) — `HouseSystemId` vẫn là `string` mở, provider chỉ giới hạn khả năng TÍNH THẬT của nó.
 *
 * Xác nhận bằng thực nghiệm (2026-09, `sweph@2.10.3-8`): CHỈ Placidus và Koch (2 hệ dùng phép
 * chia CUNG GIỜ — temporal/diurnal arc trisection) thất bại bên trong vòng cực; 10 hệ còn lại
 * trong bảng này vẫn tính được (flag=OK) kể cả tại đúng 90° — xem
 * docs/astrology-module/ARCHITECTURE/PHASE3B1_HOUSES_ANGLES.md "Edge cases".
 */
const KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE: Record<string, HouseSystems> = {
  placidus: "P",
  koch: "K",
  equal: "A",
  whole_sign: "W",
  porphyry: "O",
  campanus: "C",
  regiomontanus: "R",
  topocentric: "T",
  morinus: "M",
  alcabitius: "B",
  krusinski: "U",
  vehlow_equal: "V",
};

/** Chuỗi con xuất hiện trong `error` native của Swiss Ephemeris khi một hệ time-based (Placidus/Koch) không tính được bên trong vòng cực — xác nhận bằng thực nghiệm, KHÔNG suy đoán. */
const POLAR_CIRCLE_ERROR_PATTERN = /polar circle/i;

/**
 * Ánh xạ định danh ayanamsa ĐÃ BIẾT sang mã `sid_mode` của Swiss Ephemeris — xác nhận bằng thực
 * nghiệm qua `sweph.get_ayanamsa_name()` (KHÔNG suy đoán từ tài liệu online). CHỈ 4 ayanamsa
 * được hỗ trợ ở Phase 4 Step 1 — ĐÚNG BẰNG bộ 4 mà oracle mapping xác nhận (vedic-calc hỗ trợ
 * chính xác 4 ayanamsa này; PyJHora hỗ trợ cả 4 trong bộ 20 mode của nó) — xem
 * docs/astrology-module/ARCHITECTURE/PHASE4_STEP1_AYANAMSA.md. Danh sách có thể mở rộng sau
 * (thêm 1 dòng, KHÔNG đổi kiến trúc) — `AyanamsaId` vẫn là `string` mở.
 */
const KNOWN_AYANAMSA_TO_SWISS_EPH_SIDM: Record<string, number> = {
  lahiri: constants.SE_SIDM_LAHIRI,
  raman: constants.SE_SIDM_RAMAN,
  kp: constants.SE_SIDM_KRISHNAMURTI,
  true_chitrapaksha: constants.SE_SIDM_TRUE_CITRA,
};

/** Nhà (house) 1 và 10 LUÔN chính là Ascendant/Midheaven ở MỌI hệ quadrant-based — xác nhận bằng thực nghiệm (points[0]===houses[0], points[1]===houses[9]). */
const ASCENDANT_POINT_INDEX = 0;
const MIDHEAVEN_POINT_INDEX = 1;

/** Thời điểm dùng để "probe" tình trạng ephemeris lúc `getMetadata()` được gọi — J2000.0, luôn nằm trong phạm vi bất kỳ bộ file `.se1` hợp lý nào. */
const METADATA_PROBE_UTC = new Date("2000-01-01T12:00:00.000Z");

export interface SwissEphemerisProviderOptions {
  /** Ghi đè đường dẫn thư mục ephemeris — mặc định `resolveDefaultEphemerisPath()` (`<package root>/ephe`). Dùng cho test (vd. trỏ tới thư mục rỗng để buộc kiểm tra đường Moshier fallback). */
  ephemerisPath?: string;
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

  getHouseCusps(utcInstant: Date, latitude: number, longitude: number, houseSystem: HouseSystemId): HouseCusps {
    const data = this.computeHouses(utcInstant, latitude, longitude, houseSystem, `getHouseCusps(${houseSystem})`);
    const cusps = data.houses.map(normalizeDegrees);
    if (cusps.length !== 12) {
      throw new SwissEphemerisHouseCalculationError(
        `getHouseCusps(${houseSystem})`,
        `expected exactly 12 cusps from Swiss Ephemeris, got ${cusps.length}`,
      );
    }
    return { houseSystem, cusps: cusps as unknown as HouseCusps["cusps"] };
  }

  getAscendant(utcInstant: Date, latitude: number, longitude: number, houseSystem: HouseSystemId): AngleResult {
    const data = this.computeHouses(utcInstant, latitude, longitude, houseSystem, `getAscendant(${houseSystem})`);
    return { longitude: normalizeDegrees(data.points[ASCENDANT_POINT_INDEX]) };
  }

  getMidheaven(utcInstant: Date, latitude: number, longitude: number, houseSystem: HouseSystemId): AngleResult {
    const data = this.computeHouses(utcInstant, latitude, longitude, houseSystem, `getMidheaven(${houseSystem})`);
    return { longitude: normalizeDegrees(data.points[MIDHEAVEN_POINT_INDEX]) };
  }

  /**
   * Giá trị ayanamsa (độ) tại một thời điểm UTC — KHÔNG tự trừ vào bất kỳ longitude nào, chỉ trả
   * con số thô. `set_sid_mode()` là trạng thái TOÀN TIẾN TRÌNH của Swiss Ephemeris (giống
   * `set_ephe_path`) nên được gọi lại NGAY TRƯỚC MỖI lần tính (không chỉ ở constructor), đảm bảo
   * đúng ayanamsa được yêu cầu cho LẦN GỌI NÀY, không phụ thuộc lần gọi `getAyanamsa` trước đó với
   * `ayanamsaId` khác đã đổi state global.
   *
   * XÁC NHẬN BẰNG THỰC NGHIỆM (2026-09): KHÔNG áp dụng kiểm tra "silent Moshier fallback" như
   * `calcBody` — ayanamsa là phép tính tuế sai/lượng giác thuần tuý, KHÔNG cần file `.se1` (đã
   * thử trực tiếp: bỏ ephemeris path đi, giá trị Lahiri tại J2000.0 vẫn giống hệt, flag vẫn khớp
   * yêu cầu) — khác hẳn `getPlanetPosition`, nơi thiếu file THẬT SỰ làm giảm độ chính xác. Vẫn
   * kiểm tra `flag === ERR` cho lỗi native khác không lường trước (phòng vệ, chưa từng quan sát
   * được kích hoạt trong thực nghiệm).
   */
  getAyanamsa(utcInstant: Date, ayanamsaId: AyanamsaId): number {
    const sidMode = KNOWN_AYANAMSA_TO_SWISS_EPH_SIDM[ayanamsaId];
    if (sidMode === undefined) {
      throw new SwissEphemerisUnsupportedAyanamsaError(ayanamsaId);
    }

    set_sid_mode(sidMode, 0, 0);
    const jdUt = this.toJulianDayUt(utcInstant);
    const result = get_ayanamsa_ex_ut(jdUt, constants.SEFLG_SWIEPH);

    if (result.flag === constants.ERR) {
      throw new SwissEphemerisCalculationError(`getAyanamsa(${ayanamsaId})`, result.error ?? "unknown error");
    }

    return result.data;
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

  /**
   * Tính house cusps + points (ASC/MC/ARMC/Vertex/...) qua `houses_ex2`. Validate `houseSystem`
   * TRƯỚC KHI gọi native (xem `SwissEphemerisUnsupportedHouseSystemError` — native KHÔNG tự từ
   * chối mã lạ). Phân biệt rõ 2 loại lỗi native: "polar circle" (house system ĐÃ biết nhưng
   * không tính được ở vĩ độ này — `SwissEphemerisHouseSystemUndefinedAtLatitudeError`) và lỗi
   * khác (`SwissEphemerisHouseCalculationError`) — KHÔNG gộp chung, đúng yêu cầu "return
   * deterministic, meaningful errors", không phải một exception mơ hồ duy nhất cho mọi trường hợp.
   *
   * QUYẾT ĐỊNH: khi native báo lỗi polar-circle, `getAscendant`/`getMidheaven` CŨNG throw lỗi này
   * (không cố gắng "cứu" riêng ASC/MC dù về lý thuyết thiên văn chúng độc lập với cách chia house
   * trung gian) — nhất quán với "Do NOT hide Swiss Ephemeris errors", và tránh khẳng định một chi
   * tiết hành vi native chưa được xác minh độc lập trong session này. Xem PHASE3B1_HOUSES_ANGLES.md.
   */
  private computeHouses(
    utcInstant: Date,
    latitude: number,
    longitude: number,
    houseSystem: HouseSystemId,
    operationLabel: string,
  ): { houses: HousesList; points: PointsList } {
    const swissCode = KNOWN_HOUSE_SYSTEM_TO_SWISS_EPH_CODE[houseSystem];
    if (swissCode === undefined) {
      throw new SwissEphemerisUnsupportedHouseSystemError(houseSystem);
    }

    const jdUt = this.toJulianDayUt(utcInstant);
    const result = houses_ex2(jdUt, constants.SEFLG_SWIEPH, latitude, longitude, swissCode);

    if (result.flag === constants.ERR) {
      const nativeError = result.error ?? "";
      if (POLAR_CIRCLE_ERROR_PATTERN.test(nativeError)) {
        throw new SwissEphemerisHouseSystemUndefinedAtLatitudeError(houseSystem, latitude, nativeError);
      }
      throw new SwissEphemerisHouseCalculationError(operationLabel, nativeError || "unknown error");
    }

    return { houses: result.data.houses, points: result.data.points };
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
