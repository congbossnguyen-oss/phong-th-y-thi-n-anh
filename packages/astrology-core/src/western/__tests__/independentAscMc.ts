/**
 * Cài đặt ĐỘC LẬP hoàn toàn của Ascendant/Midheaven — CHỈ dùng để KIỂM TRA `SwissEphemerisProvider`
 * trong test, KHÔNG BAO GIỜ import vào code production (`western/houses.ts`,
 * `SwissEphemerisProvider.ts`). Không import `sweph` hay bất kỳ module nào của package này — chỉ
 * `Date`/`Math` gốc. Xem `goldenHouseFixtures.ts` để biết công thức và nguồn (Meeus GMST/obliquity
 * trung bình + công thức ASC/MC chuẩn từ RAMC).
 *
 * Dùng "mean" GMST/obliquity (không hiệu chỉnh nutation) — CHỦ Ý đơn giản hơn Swiss Ephemeris
 * ("apparent", có nutation) để giữ tính độc lập thực sự (không vô tình implement lại cùng thuật
 * toán). Sai lệch dự kiến với Swiss Ephemeris ~0.001°-0.005°, đã xác nhận thực nghiệm.
 */

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function norm360(deg: number): number {
  const wrapped = deg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function julianDayUt(date: Date): number {
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  const day =
    date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + (date.getUTCSeconds() + date.getUTCMilliseconds() / 1000) / 3600) / 24;
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

/** Meeus 12.4 — Greenwich Mean Sidereal Time, độ. */
function gmstDegrees(jdUt: number): number {
  const t = (jdUt - 2451545.0) / 36525;
  const theta0 = 280.46061837 + 360.98564736629 * (jdUt - 2451545.0) + 0.000387933 * t * t - (t * t * t) / 38710000;
  return norm360(theta0);
}

/** Meeus 22.2 — độ nghiêng hoàng đạo trung bình, độ. */
function meanObliquityDegrees(jdUt: number): number {
  const t = (jdUt - 2451545.0) / 36525;
  const arcsec = 84381.448 - 46.815 * t - 0.00059 * t * t + 0.001813 * t * t * t;
  return arcsec / 3600;
}

export interface IndependentAscMc {
  ascendant: number;
  midheaven: number;
}

/**
 * `longitudeEastDeg`: kinh độ ĐÔNG DƯƠNG (khớp quy ước `BirthData.longitude`).
 */
export function computeIndependentAscMc(utcInstant: Date, latitudeDeg: number, longitudeEastDeg: number): IndependentAscMc {
  const jdUt = julianDayUt(utcInstant);
  const gmst = gmstDegrees(jdUt);
  const lst = norm360(gmst + longitudeEastDeg);
  const eps = toRad(meanObliquityDegrees(jdUt));
  const ramc = toRad(lst);
  const lat = toRad(latitudeDeg);

  const midheaven = norm360(toDeg(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps))));
  const ascendant = norm360(toDeg(Math.atan2(Math.cos(ramc), -(Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(ramc)))));

  return { ascendant, midheaven };
}
