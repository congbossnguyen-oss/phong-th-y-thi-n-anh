/**
 * Golden fixture — vị trí thiên văn tham chiếu ĐỘC LẬP với Swiss Ephemeris, dùng để cross-check
 * `SwissEphemerisProvider`. Đúng vai trò oracle "mayaastrolib" (Skyfield/JPL DE440s, nguồn KHÔNG
 * phải Swiss Ephemeris) trong `docs/astrology-module/ARCHITECTURE/VALIDATION_ORACLES.md` — ở đây
 * gọi TRỰC TIẾP JPL Horizons (thay vì qua wrapper Python trung gian như mayaastrolib), tránh mọi
 * mã nguồn AGPL của các repo đã audit.
 *
 * NGUỒN: NASA JPL Horizons System API (https://ssd.jpl.nasa.gov/api/horizons.api), Solar System
 * Dynamics Group, Jet Propulsion Laboratory. Truy vấn ngày 2026-09-13 với tham số:
 *   EPHEM_TYPE=OBSERVER, CENTER=500@399 (geocentric), QUANTITIES=31 (ObsEcLon/ObsEcLat —
 *   ecliptic-of-date apparent longitude/latitude, IAU76/80, đã cộng light-time + gravitational
 *   deflection + stellar aberration — cùng quy ước "apparent, geocentric, ecliptic-of-date" mà
 *   `SwissEphemerisProvider` dùng mặc định), ANG_FORMAT=DEG, APPARENT=AIRLESS, EXTRA_PREC=YES.
 *   Ephemeris nguồn: DE441 — MỘT bộ ephemeris JPL khác, độc lập với dữ liệu Swiss Ephemeris nén
 *   (dựa trên DE43x/44x tuỳ phiên bản) dùng trong `ephe/*.se1` của package này.
 *
 * DUNG SAI: dùng `ANGULAR_TOLERANCE_FILE_BASED_DEGREES` (0.0001°) đã định nghĩa sẵn ở Phase 1
 * (`precision.ts`) cho các thiên thể — chênh lệch THỰC TẾ quan sát được giữa JPL Horizons và
 * Swiss Ephemeris ở các fixture dưới đây chỉ ~0.00001-0.00003° (~0.05-0.1 giây cung), nằm sâu
 * trong dung sai này (không phải dung sai tuỳ tiện nới ra cho vừa test).
 *
 * Mean Lunar Node KHÔNG PHẢI một "thiên thể" JPL Horizons theo dõi (là một điểm hình học), nên
 * không cross-check được qua Horizons — xem `MEAN_NODE_MEEUS_REFERENCE` bên dưới, dùng công thức
 * đã công bố (Meeus). Dung sai riêng cho node dùng `ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES`
 * (0.01°) vì đây là dung sai CHÊNH LỆCH GIỮA HAI LÝ THUYẾT khác nhau (Meeus mean-node secular
 * series và Swiss Ephemeris/ELP), KHÔNG phải phép so oracle-cùng-lý-thuyết như trên.
 */

export interface BodyLonLat {
  lon: number;
  lat: number;
}

export interface GoldenScenario {
  label: string;
  /** Ngày/giờ/múi giờ NGUỒN — dùng để dựng `BirthData` thật và chạy qua `resolveBirthDataInstant` (kiểm tra toàn bộ pipeline, không chỉ tầng thiên văn). */
  birthData: {
    date: { year: number; month: number; day: number };
    localTime: { hour: number; minute: number; second?: number };
    timezoneId: string;
  };
  /** UTC kỳ vọng — tính độc lập lúc soạn fixture (Node `Intl`/ICU), dùng để xác nhận `resolveBirthDataInstant` cho đúng kết quả trước khi đưa vào Swiss Ephemeris. */
  expectedUtcIso: string;
  /** Mô tả bối cảnh — CHỈ để đọc hiểu test. */
  localDescription: string;
  sun: BodyLonLat;
  moon: BodyLonLat;
}

/** 7 kịch bản bắt buộc theo yêu cầu Phase 3A — xem PHASE3A_ASTRONOMICAL_CORE.md "Golden tests". */
export const GOLDEN_SCENARIOS: readonly GoldenScenario[] = [
  {
    label: "modern-gregorian-tokyo",
    birthData: { date: { year: 1990, month: 6, day: 15 }, localTime: { hour: 14, minute: 30 }, timezoneId: "Asia/Tokyo" },
    expectedUtcIso: "1990-06-15T05:30:00.000Z",
    localDescription: "1990-06-15 14:30 Asia/Tokyo (UTC+9, không DST)",
    sun: { lon: 83.8708654, lat: 0.0001023 },
    moon: { lon: 341.7521703, lat: 2.8653571 },
  },
  {
    label: "dst-new-york",
    birthData: { date: { year: 2023, month: 7, day: 4 }, localTime: { hour: 10, minute: 0 }, timezoneId: "America/New_York" },
    expectedUtcIso: "2023-07-04T14:00:00.000Z",
    localDescription: "2023-07-04 10:00 America/New_York (EDT, UTC-4, đang DST)",
    sun: { lon: 102.3586872, lat: -0.0000903 },
    moon: { lon: 297.8017990, lat: -5.0186807 },
  },
  {
    label: "vietnam-ho-chi-minh",
    birthData: { date: { year: 1985, month: 3, day: 12 }, localTime: { hour: 8, minute: 30 }, timezoneId: "Asia/Ho_Chi_Minh" },
    expectedUtcIso: "1985-03-12T01:30:00.000Z",
    localDescription: "1985-03-12 08:30 Asia/Ho_Chi_Minh (UTC+7)",
    sun: { lon: 351.4221756, lat: -0.0000621 },
    moon: { lon: 240.0110930, lat: -0.8931251 },
  },
  {
    label: "historical-timezone-transition-vietnam-1970",
    birthData: { date: { year: 1970, month: 5, day: 1 }, localTime: { hour: 10, minute: 0 }, timezoneId: "Asia/Ho_Chi_Minh" },
    expectedUtcIso: "1970-05-01T02:00:00.000Z",
    localDescription:
      "1970-05-01 10:00 Asia/Ho_Chi_Minh — thời kỳ lịch sử UTC+8 (1967-1975, xác nhận qua ICU tzdata " +
      "của chính Node đang chạy: offset=+480 phút cho ngày này), KHÔNG phải UTC+7 hiện tại",
    sun: { lon: 40.2896652, lat: -0.0000761 },
    moon: { lon: 341.4319462, lat: 0.1181988 },
  },
  {
    label: "utc-birth",
    birthData: { date: { year: 2005, month: 1, day: 1 }, localTime: { hour: 0, minute: 0 }, timezoneId: "UTC" },
    expectedUtcIso: "2005-01-01T00:00:00.000Z",
    localDescription: "2005-01-01 00:00 UTC (timezoneId=UTC, offset=0)",
    sun: { lon: 280.6662111, lat: 0.0001385 },
    moon: { lon: 159.2942272, lat: 3.8418376 },
  },
  {
    label: "negative-offset-new-york-est",
    birthData: { date: { year: 1995, month: 12, day: 25 }, localTime: { hour: 8, minute: 0 }, timezoneId: "America/New_York" },
    expectedUtcIso: "1995-12-25T13:00:00.000Z",
    localDescription: "1995-12-25 08:00 America/New_York (EST, UTC-5, không DST)",
    sun: { lon: 273.2577795, lat: 0.0001646 },
    moon: { lon: 321.7437071, lat: 4.4560729 },
  },
  {
    label: "positive-non-integer-offset-kolkata",
    birthData: { date: { year: 2001, month: 8, day: 20 }, localTime: { hour: 12, minute: 0 }, timezoneId: "Asia/Kolkata" },
    expectedUtcIso: "2001-08-20T06:30:00.000Z",
    localDescription: "2001-08-20 12:00 Asia/Kolkata (UTC+5:30)",
    sun: { lon: 147.3120820, lat: 0.0000636 },
    moon: { lon: 163.7577310, lat: 4.7566548 },
  },
];

/** Mốc J2000.0 — kiểm tra đầy đủ 10 hành tinh cổ điển + Chiron cùng lúc (mốc kinh điển, dễ tái xác minh độc lập). */
export const J2000_UTC_ISO = "2000-01-01T12:00:00.000Z";

export const J2000_REFERENCE: Record<string, BodyLonLat> = {
  sun: { lon: 280.3689092, lat: 0.0002381 },
  moon: { lon: 223.3237860, lat: 5.1707422 },
  mercury: { lon: 271.8892699, lat: -0.9948190 },
  venus: { lon: 241.5657794, lat: 2.0663548 },
  mars: { lon: 327.9632921, lat: -1.0677752 },
  jupiter: { lon: 25.2530685, lat: -1.2621868 },
  saturn: { lon: 40.3956366, lat: -2.4448533 },
  uranus: { lon: 314.8091680, lat: -0.6583240 },
  neptune: { lon: 303.1930007, lat: 0.2350026 },
  pluto: { lon: 251.4547644, lat: 10.8552605 },
  chiron: { lon: 251.6176090, lat: 4.0717061 },
};

/**
 * Meeus, "Astronomical Algorithms" (2nd ed.), ch. 47 — kinh độ trung bình nút lên quỹ đạo Mặt
 * Trăng: Omega = 125.0445479 - 1934.1362891*T + 0.0020754*T^2 + T^3/467441 - T^4/60616000, với T
 * = thế kỷ Julius TDB tính từ J2000.0. Tại T=0 (đúng J2000.0): Omega = 125.0445479°.
 */
export const MEAN_NODE_MEEUS_REFERENCE_J2000_DEGREES = 125.0445479;
