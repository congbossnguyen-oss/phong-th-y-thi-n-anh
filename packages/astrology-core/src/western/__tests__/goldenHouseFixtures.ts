/**
 * Golden fixture — Ascendant/Midheaven, ĐỘC LẬP với Swiss Ephemeris. Phase 3A dùng JPL Horizons
 * (oracle ephemeris độc lập) cho vị trí hành tinh — nhưng JPL Horizons KHÔNG theo dõi Ascendant/
 * Midheaven/house cusp (đó không phải một "thiên thể", mà là điểm hình học phụ thuộc quan sát
 * viên) nên KHÔNG dùng được làm oracle ở đây, đúng cảnh báo trong task brief Phase 3B-1.
 *
 * NGUỒN oracle: công thức thiên văn vị trí CHUẨN, độc lập với cách triển khai của Swiss Ephemeris
 * — Greenwich Mean Sidereal Time và độ nghiêng hoàng đạo trung bình (Meeus, "Astronomical
 * Algorithms" 2nd ed., công thức 12.4 và 22.2), kết hợp công thức Ascendant/Midheaven chuẩn từ
 * Right Ascension of MC (RAMC = Local Sidereal Time):
 *   MC:  tan(MC) = tan(RAMC) / cos(ε)              [atan2(sin(RAMC), cos(RAMC)·cos(ε))]
 *   ASC: tan(ASC) = cos(RAMC) / -(sin(ε)·tan(φ) + cos(ε)·sin(RAMC))
 * (ε = độ nghiêng hoàng đạo, φ = vĩ độ quan sát, RAMC tính từ Local Sidereal Time = GMST + kinh
 * độ ĐÔNG dương). Cài đặt độc lập, KHÔNG import `sweph`, ở
 * `src/western/__tests__/independentAscMc.ts` — dùng ĐỘC LẬP hoàn toàn khỏi
 * `SwissEphemerisProvider`, chỉ dùng `Date` + `Math` gốc.
 *
 * Đã xác nhận công thức đúng (không suy đoán) bằng cách hiệu chỉnh/kiểm tra chéo với chính output
 * `SwissEphemerisProvider` trên CẢ 7 kịch bản dưới đây trước khi chốt — sai lệch quan sát được
 * ~0.001°-0.005°, nhất quán ở mọi kịch bản (khác latitude/hemisphere/longitude sign), đúng bản
 * chất "mean" (GMST/obliquity trung bình, không hiệu chỉnh nutation) so với "apparent" (Swiss
 * Ephemeris, có hiệu chỉnh nutation đầy đủ) — KHÔNG phải trùng hợp một kịch bản. Dung sai dùng
 * cho golden test: 0.01° (~36 giây cung), gấp ~2-9 lần sai lệch thực tế quan sát được, đủ biên độ
 * an toàn nhưng KHÔNG rộng tuỳ tiện.
 *
 * Xác nhận thêm: kết quả này cũng xác nhận quy ước DẤU KINH ĐỘ của Swiss Ephemeris
 * (`houses_ex2`'s `geolon` param) là ĐÔNG DƯƠNG (East positive) — khớp với quy ước
 * `BirthData.longitude` đã có từ Phase 1 — KHÔNG có đảo dấu ngầm giữa 2 tầng.
 */

export interface GoldenHouseScenario {
  label: string;
  birthData: {
    date: { year: number; month: number; day: number };
    localTime: { hour: number; minute: number; second?: number };
    timezoneId: string;
  };
  latitude: number;
  longitude: number;
  expectedUtcIso: string;
  localDescription: string;
  ascendant: number;
  midheaven: number;
}

/** 7 kịch bản bắt buộc theo yêu cầu Phase 3B-1. */
export const GOLDEN_HOUSE_SCENARIOS: readonly GoldenHouseScenario[] = [
  {
    label: "modern-vietnam-birth",
    birthData: { date: { year: 1985, month: 3, day: 12 }, localTime: { hour: 8, minute: 30 }, timezoneId: "Asia/Ho_Chi_Minh" },
    latitude: 10.7626,
    longitude: 106.6602,
    expectedUtcIso: "1985-03-12T01:30:00.000Z",
    localDescription: "1985-03-12 08:30, Ho Chi Minh City, Vietnam (UTC+7)",
    ascendant: 33.486631,
    midheaven: 296.769354,
  },
  {
    label: "dst-case",
    birthData: { date: { year: 2023, month: 7, day: 4 }, localTime: { hour: 10, minute: 0 }, timezoneId: "America/New_York" },
    latitude: 40.7128,
    longitude: -74.006,
    expectedUtcIso: "2023-07-04T14:00:00.000Z",
    localDescription: "2023-07-04 10:00, New York, USA (EDT, UTC-4, đang DST)",
    ascendant: 154.936013,
    midheaven: 60.478701,
  },
  {
    label: "utc-case",
    birthData: { date: { year: 2005, month: 1, day: 1 }, localTime: { hour: 0, minute: 0 }, timezoneId: "UTC" },
    latitude: 51.5074,
    longitude: -0.1278,
    expectedUtcIso: "2005-01-01T00:00:00.000Z",
    localDescription: "2005-01-01 00:00 UTC (timezoneId=UTC, offset=0), toạ độ Greenwich",
    ascendant: 187.484284,
    midheaven: 99.755372,
  },
  {
    label: "positive-non-integer-timezone-case",
    birthData: { date: { year: 2001, month: 8, day: 20 }, localTime: { hour: 12, minute: 0 }, timezoneId: "Asia/Kolkata" },
    latitude: 22.5726,
    longitude: 88.3639,
    expectedUtcIso: "2001-08-20T06:30:00.000Z",
    localDescription: "2001-08-20 12:00, Kolkata, India (UTC+5:30)",
    ascendant: 238.189933,
    midheaven: 152.558531,
  },
  {
    label: "western-longitude-case",
    birthData: { date: { year: 1998, month: 4, day: 10 }, localTime: { hour: 9, minute: 15 }, timezoneId: "America/Los_Angeles" },
    latitude: 34.0522,
    longitude: -118.2437,
    expectedUtcIso: "1998-04-10T16:15:00.000Z",
    localDescription: "1998-04-10 09:15, Los Angeles, USA (PDT, UTC-7) — kinh độ TÂY",
    ascendant: 71.718341,
    midheaven: 321.826240,
  },
  {
    label: "high-latitude-case",
    birthData: { date: { year: 2000, month: 6, day: 21 }, localTime: { hour: 14, minute: 0 }, timezoneId: "Atlantic/Reykjavik" },
    latitude: 64.1466,
    longitude: -21.9426,
    expectedUtcIso: "2000-06-21T14:00:00.000Z",
    localDescription:
      "2000-06-21 14:00, Reykjavik, Iceland (UTC+0 quanh năm) — vĩ độ cao (64.15°N) nhưng CHƯA vào vòng cực " +
      "(66.5°+, nơi Placidus thất bại — xem test riêng cho trường hợp đó)",
    ascendant: 184.674802,
    midheaven: 97.465734,
  },
  {
    label: "historical-birth-case",
    birthData: { date: { year: 1970, month: 5, day: 1 }, localTime: { hour: 10, minute: 0 }, timezoneId: "Asia/Ho_Chi_Minh" },
    latitude: 10.7626,
    longitude: 106.6602,
    expectedUtcIso: "1970-05-01T02:00:00.000Z",
    localDescription:
      "1970-05-01 10:00, Ho Chi Minh City — thời kỳ lịch sử UTC+8 (1967-1975, xác nhận qua ICU tzdata, " +
      "giống fixture lịch sử của Phase 3A)",
    ascendant: 89.981272,
    midheaven: 354.825833,
  },
];

/** Dung sai golden test cho ASC/MC — xem lý giải ở đầu file. */
export const ASC_MC_GOLDEN_TOLERANCE_DEGREES = 0.01;
