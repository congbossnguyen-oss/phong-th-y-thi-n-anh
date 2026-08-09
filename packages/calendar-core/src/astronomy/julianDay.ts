/**
 * Julian Day — nền tảng thời gian cho toàn bộ engine.
 *
 * Module này cung cấp HAI biểu diễn Julian Day khác nhau, cố ý tách biệt vì chúng
 * phục vụ hai mục đích khác nhau và không thể dùng lẫn cho nhau:
 *
 * 1. `julianDayNumber()` — SỐ NGUYÊN (JDN), quy ước Fliegel & Van Flandern (1968).
 *    Đây là "nhãn ngày lịch" cổ điển dùng trong các thuật toán lịch Can Chi/Âm lịch
 *    (bao gồm chính thuật toán Sóc/New Moon ở astronomy/lunar.ts và can-chi ngày ở
 *    calendar/ganzhi.ts). JDN(2000-01-01) = 2451545.
 *
 * 2. `julianDayFractional()` — SỐ THỰC có phần thập phân, quy ước Meeus (Astronomical
 *    Algorithms, chương 7), dùng cho mọi phép tính thiên văn liên tục cần độ chính xác
 *    dưới ngày: kinh độ mặt trời, thời điểm Sóc, thời điểm tiết khí chính xác tới phút/giây.
 *    JD(2000-01-01 12:00 UT) = 2451545.0 (JD luôn đổi ngày vào giữa trưa UT).
 *
 * Cả hai công thức đều là thuật toán xác định (deterministic), không suy luận, xử lý
 * đúng cả lịch Julian (trước 15/10/1582) lẫn lịch Gregorian hiện hành.
 */

const GREGORIAN_CUTOVER_JDN = 2299161; // JDN của 15/10/1582 (ngày đầu tiên dùng lịch Gregorian)

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface CalendarDateTime extends CalendarDate {
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59.999...
}

/**
 * Julian Day Number (số nguyên) từ ngày lịch Gregorian/Julian (quy ước Fliegel & Van Flandern).
 * Tự động dùng lịch Julian cho các ngày trước 15/10/1582 theo đúng lịch sử thiên văn.
 */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  if (jdn < GREGORIAN_CUTOVER_JDN) {
    // Trước ngày chuyển đổi lịch: dùng công thức lịch Julian (không trừ hiệu chỉnh thế kỷ).
    jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }

  return jdn;
}

/** Chiều ngược lại của {@link julianDayNumber}: từ JDN suy ra ngày lịch. */
export function julianDayNumberToCalendarDate(jdn: number): CalendarDate {
  let a: number;
  let b: number;
  let c: number;

  if (jdn > GREGORIAN_CUTOVER_JDN) {
    a = jdn + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jdn + 32082;
  }

  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

/**
 * Julian Day (số thực, quy ước Meeus) tại 0h UT của ngày lịch cho trước — KHÔNG bù múi giờ.
 * Dùng {@link dateTimeToJulianDay} nếu cần quy đổi từ giờ địa phương có múi giờ.
 */
export function calendarDateToJulianDay(year: number, month: number, day: number): number {
  return dateTimeToJulianDay({ year, month, day, hour: 0, minute: 0, second: 0 }, 0);
}

/**
 * Julian Day (số thực, quy ước Meeus) từ một thời điểm giờ ĐỊA PHƯƠNG cho trước, quy đổi
 * về UT bằng `utcOffsetHours` (múi giờ tính bằng giờ, ví dụ +7 cho Asia/Ho_Chi_Minh).
 *
 * Công thức Meeus chấp nhận giá trị ngày (`dayFraction`) vượt ngoài biên tháng một cách
 * tự nhiên (vd. cộng thêm giờ âm khiến "ngày" thành số thập phân < 1) nên không cần tự
 * chuẩn hóa tràn ngày/tháng trước khi gọi — bản thân công thức xử lý đúng.
 */
export function dateTimeToJulianDay(dt: CalendarDateTime, utcOffsetHours: number): number {
  let { year, month } = dt;
  const dayFraction =
    dt.day + (dt.hour - utcOffsetHours) / 24 + dt.minute / 1440 + dt.second / 86400;

  // Quy ước Meeus: tháng 1, 2 được tính là tháng 13, 14 của năm trước.
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const isGregorian =
    year > 1582 || (year === 1582 && (month > 10 || (month === 10 && dayFraction >= 15)));

  const a = Math.floor(year / 100);
  const b = isGregorian ? 2 - a + Math.floor(a / 4) : 0;

  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    dayFraction +
    b -
    1524.5
  );
}

/** Chiều ngược lại của {@link dateTimeToJulianDay}: từ JD (UT) suy ra ngày-giờ UT. */
export function julianDayToDateTime(jd: number): CalendarDateTime {
  const jdShifted = jd + 0.5;
  const z = Math.floor(jdShifted);
  const f = jdShifted - z;

  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayWithFraction = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayWithFraction);
  const dayFrac = dayWithFraction - day;

  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const totalSeconds = Math.round(dayFrac * 86400);
  const hour = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;

  return { year, month, day, hour, minute, second };
}

/** Julian Century tính từ epoch J2000.0 (JD 2451545.0) — đơn vị dùng trong mọi công thức VSOP/Meeus. */
export function julianCentury(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** Julian Millennium tính từ epoch J2000.0 — dùng cho các chuỗi bậc cao nếu cần độ chính xác hơn. */
export function julianMillennium(jd: number): number {
  return julianCentury(jd) / 10;
}
