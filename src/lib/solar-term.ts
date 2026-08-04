// Tính hoàng kinh Mặt Trời (solar ecliptic longitude) độ chính xác thấp (~0.01°) theo công thức
// thiên văn công khai, phổ biến (Jean Meeus, "Astronomical Algorithms", chương Vị trí Mặt Trời —
// công thức mức "low precision" được công bố rộng rãi trong tài liệu thiên văn phổ thông, ví dụ
// Wikipedia "Position of the Sun"). Không sao chép mã nguồn của bất kỳ thư viện cụ thể nào.
//
// Dùng để xác định Tiết Khí (12 "tiết" phân chia tháng Bát Tự) — mỗi tiết cách nhau đúng 15° hoàng kinh.

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// Julian Day Number (số nguyên) từ ngày Dương lịch — đã kiểm chứng khớp nhiều mốc tham chiếu.
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// Hoàng kinh Mặt Trời (độ, 0-360) tại thời điểm JD (UT).
export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = toRad(M);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  return normalizeDeg(L0 + C);
}

// 12 "tiết" phân chia tháng Bát Tự (bỏ qua 12 "trung khí" giữa tháng, không dùng để đổi tháng).
// Mỗi tiết ứng với hoàng kinh cố định và Chi của tháng Bát Tự bắt đầu từ tiết đó.
export const MONTH_TIET: { name: string; longitude: number; monthChiIndex: number }[] = [
  { name: "Lập Xuân", longitude: 315, monthChiIndex: 2 }, // Dần
  { name: "Kinh Trập", longitude: 345, monthChiIndex: 3 }, // Mão
  { name: "Thanh Minh", longitude: 15, monthChiIndex: 4 }, // Thìn
  { name: "Lập Hạ", longitude: 45, monthChiIndex: 5 }, // Tỵ
  { name: "Mang Chủng", longitude: 75, monthChiIndex: 6 }, // Ngọ
  { name: "Tiểu Thử", longitude: 105, monthChiIndex: 7 }, // Mùi
  { name: "Lập Thu", longitude: 135, monthChiIndex: 8 }, // Thân
  { name: "Bạch Lộ", longitude: 165, monthChiIndex: 9 }, // Dậu
  { name: "Hàn Lộ", longitude: 195, monthChiIndex: 10 }, // Tuất
  { name: "Lập Đông", longitude: 225, monthChiIndex: 11 }, // Hợi
  { name: "Đại Tuyết", longitude: 255, monthChiIndex: 0 }, // Tý
  { name: "Tiểu Hàn", longitude: 285, monthChiIndex: 1 }, // Sửu
];

// Dò nhị phân trong khoảng [jdLow, jdHigh] (đều là JD số nguyên, UT) tìm thời điểm hoàng kinh
// Mặt Trời đạt đúng targetLongitude (độ), trả về JD (số thực) chính xác tới ~1 phút.
function findLongitudeCrossing(targetLongitude: number, jdLow: number, jdHigh: number): number {
  const target = normalizeDeg(targetLongitude);
  const diffAt = (jd: number) => {
    let d = sunLongitude(jd) - target;
    d = ((d + 540) % 360) - 180; // đưa về khoảng (-180, 180]
    return d;
  };
  let lo = jdLow;
  let hi = jdHigh;
  let dLo = diffAt(lo);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const dMid = diffAt(mid);
    if ((dLo < 0 && dMid < 0) || (dLo >= 0 && dMid >= 0)) {
      lo = mid;
      dLo = dMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export interface TietKhiCrossing {
  name: string;
  monthChiIndex: number;
  jd: number;
}

// Trả về ngày (JD) của tất cả các tiết trong khoảng năm [yy-1 cuối năm .. yy+1 đầu năm] để đủ dữ liệu tra cứu.
export function getTietKhiAround(yy: number): TietKhiCrossing[] {
  const results: TietKhiCrossing[] = [];
  for (let year = yy - 1; year <= yy + 1; year++) {
    for (const tiet of MONTH_TIET) {
      // Vùng dò quanh ngày dương lịch xấp xỉ theo kinh nghiệm (mỗi tiết lệch nhau ~30 ngày),
      // dùng mốc gần đúng theo tháng dương lịch tương ứng rồi dò +-10 ngày quanh đó.
      const approxMonthDay = approxDateForLongitude(tiet.longitude, year);
      const jdApprox = jdFromDate(approxMonthDay.d, approxMonthDay.m, year);
      const jd = findLongitudeCrossing(tiet.longitude, jdApprox - 10, jdApprox + 10);
      results.push({ name: tiet.name, monthChiIndex: tiet.monthChiIndex, jd });
    }
  }
  results.sort((a, b) => a.jd - b.jd);
  return results;
}

// Ngày dương lịch xấp xỉ (không cần chính xác) cho mỗi mốc hoàng kinh, chỉ để khởi tạo vùng dò nhị phân.
function approxDateForLongitude(longitude: number, year: number): { m: number; d: number } {
  const table: Record<number, { m: number; d: number }> = {
    315: { m: 2, d: 4 },
    345: { m: 3, d: 6 },
    15: { m: 4, d: 5 },
    45: { m: 5, d: 6 },
    75: { m: 6, d: 6 },
    105: { m: 7, d: 7 },
    135: { m: 8, d: 8 },
    165: { m: 9, d: 8 },
    195: { m: 10, d: 8 },
    225: { m: 11, d: 7 },
    255: { m: 12, d: 7 },
    285: { m: 1, d: 6 },
  };
  return table[longitude];
}

// Xác định Chi của tháng Bát Tự cho một ngày dương lịch cụ thể (dd/mm/yy, hour theo GIỜ ĐỊA PHƯƠNG
// Việt Nam UTC+7), dựa trên tiết gần nhất đã qua. Quy đổi sang JD theo giờ UT trước khi so sánh
// với các mốc tiết khí (vốn tính bằng UT) — sai lệch múi giờ có thể ảnh hưởng người sinh sát ranh tiết.
export function getMonthChiIndex(dd: number, mm: number, yy: number, hour = 12): number {
  const VN_UTC_OFFSET_HOURS = 7;
  const jd = jdFromDate(dd, mm, yy) + (hour - 12) / 24 - VN_UTC_OFFSET_HOURS / 24;
  const crossings = getTietKhiAround(yy);
  let current = crossings[0];
  for (const c of crossings) {
    if (c.jd <= jd) current = c;
    else break;
  }
  return current.monthChiIndex;
}

// Chuyển JD (số thực, UT) về ngày+giờ theo múi giờ Việt Nam (UTC+7) để hiển thị cho người dùng.
export function dateFromJDVN(jd: number): { d: number; m: number; y: number; hourVN: number } {
  const r = dateFromJD(jd + 7 / 24);
  return { d: r.d, m: r.m, y: r.y, hourVN: r.hourUT };
}

// Chuyển JD (số thực) về ngày Dương lịch (dd, mm, yy, giờ thập phân UT) để hiển thị/kiểm chứng.
export function dateFromJD(jd: number): { d: number; m: number; y: number; hourUT: number } {
  const jdInt = Math.floor(jd + 0.5);
  const frac = jd + 0.5 - jdInt;
  let a = jdInt;
  if (jdInt >= 2299161) {
    const alpha = Math.floor((jdInt - 1867216.25) / 36524.25);
    a = jdInt + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { d: day, m: month, y: year, hourUT: frac * 24 };
}
