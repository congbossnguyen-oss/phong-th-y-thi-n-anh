// Đổi Dương lịch sang Âm lịch Việt Nam (múi giờ UTC+7), dùng công thức thiên văn công khai:
// - Điểm Sóc (New Moon): Jean Meeus, "Astronomical Algorithms", chương 49 (công thức mức phổ thông,
//   được công bố/diễn giải lại rộng rãi trong nhiều tài liệu thiên văn và lịch pháp).
// - Hoàng kinh Mặt Trời: dùng lại sunLongitude() đã có ở solar-term.ts.
// - Thuật toán xác định tháng 11 (qua Đông Chí) và tháng nhuận (tháng đầu tiên sau tháng 11 không
//   chứa Trung Khí) theo quy tắc lịch Âm Dương truyền thống — đây là QUY TẮC công khai, phổ biến
//   (mô tả trong nhiều tài liệu độc lập về lịch Việt Nam/Trung Hoa), tự triển khai lại từ đầu bằng
//   sunLongitude() của riêng dự án, không sao chép mã nguồn của bất kỳ thư viện/tác giả cụ thể nào.
// Độ chính xác: đủ dùng cho xác định NGÀY âm lịch (sai số điểm Sóc cỡ vài phút, không ảnh hưởng
// tới ranh giới ngày trừ trường hợp cực hiếm sinh đúng lúc nửa đêm giao Sóc).

import { jdFromDate, sunLongitude } from "./solar-term";

const VN_TIMEZONE = 7;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// JDE (xấp xỉ UT, bỏ qua ΔT cỡ giây/phút — không ảnh hưởng xác định ngày) của điểm Sóc thứ k,
// k=0 tại Sóc gần 2000-01-06.
function newMoonJD(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const M = normalizeDeg(2.5534 + 29.1053567 * k - 0.0000218 * T2 - 0.00000011 * T3);
  const Mpr = normalizeDeg(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
  const F = normalizeDeg(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
  const Omega = normalizeDeg(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const r = toRad;
  const C1 =
    -0.4072 * Math.sin(r(Mpr)) +
    0.17241 * E * Math.sin(r(M)) +
    0.01608 * Math.sin(r(2 * Mpr)) +
    0.01039 * Math.sin(r(2 * F)) +
    0.00739 * E * Math.sin(r(Mpr - M)) -
    0.00514 * E * Math.sin(r(Mpr + M)) +
    0.00208 * E * E * Math.sin(r(2 * M)) -
    0.00111 * Math.sin(r(Mpr - 2 * F)) -
    0.00057 * Math.sin(r(Mpr + 2 * F)) +
    0.00056 * E * Math.sin(r(2 * Mpr + M)) -
    0.00042 * Math.sin(r(3 * Mpr)) +
    0.00042 * E * Math.sin(r(M + 2 * F)) +
    0.00038 * E * Math.sin(r(M - 2 * F)) -
    0.00024 * E * Math.sin(r(2 * Mpr - M)) -
    0.00017 * Math.sin(r(Omega)) -
    0.00007 * Math.sin(r(Mpr + 2 * M)) +
    0.00004 * Math.sin(r(2 * Mpr - 2 * F)) +
    0.00004 * Math.sin(r(3 * M)) +
    0.00003 * Math.sin(r(Mpr + M - 2 * F)) +
    0.00003 * Math.sin(r(2 * Mpr + 2 * F)) -
    0.00003 * Math.sin(r(Mpr + M + 2 * F)) +
    0.00003 * Math.sin(r(Mpr - M + 2 * F)) -
    0.00002 * Math.sin(r(Mpr - M - 2 * F)) -
    0.00002 * Math.sin(r(3 * Mpr + M)) +
    0.00002 * Math.sin(r(4 * Mpr));
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  return jde + C1;
}

// Số ngày nguyên (theo giờ địa phương timeZone, quy ước JD chuẩn: +0.5 để đổi mốc 12h trưa -> 0h) của Sóc thứ k.
function newMoonDayNumber(k: number, timeZone: number): number {
  return Math.floor(newMoonJD(k) + 0.5 + timeZone / 24);
}

// Chỉ số Trung Khí (0-11, mỗi mốc cách nhau 30° hoàng kinh) tại thời điểm JD — hai mốc Sóc liên tiếp
// có chỉ số khác nhau nghĩa là giữa chúng có 1 Trung Khí; chỉ số giống nhau nghĩa là tháng đó "lọt qua"
// không chứa Trung Khí nào (đây chính là tháng nhuận).
function trungKhiIndex(jd: number): number {
  return Math.floor(normalizeDeg(sunLongitude(jd)) / 30);
}

function findSunLongitudeJD(targetLongitude: number, jdLow: number, jdHigh: number): number {
  const target = normalizeDeg(targetLongitude);
  const diffAt = (jd: number) => {
    let d = sunLongitude(jd) - target;
    d = ((d + 540) % 360) - 180;
    return d;
  };
  let lo = jdLow;
  let hi = jdHigh;
  let dLo = diffAt(lo);
  for (let i = 0; i < 50; i++) {
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

// Đông Chí (hoàng kinh 270°) của năm dương lịch cho trước — luôn rơi vào khoảng 20-23/12.
function dongChiJD(year: number): number {
  const approx = jdFromDate(22, 12, year);
  return findSunLongitudeJD(270, approx - 10, approx + 10);
}

// Sóc bắt đầu tháng 11 âm lịch của "năm âm lịch year" (năm âm lịch year = năm chứa Đông Chí của
// chính năm dương lịch year, theo quy ước: tháng 11 âm lịch luôn chứa Đông Chí).
function getMonth11Start(year: number, timeZone: number): { k: number; dayNum: number } {
  const dc = dongChiJD(year);
  const dcDayNum = Math.floor(dc + 0.5 + timeZone / 24);
  let k = Math.round((dc - 2451550.09766) / 29.530588861);
  while (newMoonDayNumber(k, timeZone) > dcDayNum) k--;
  while (newMoonDayNumber(k + 1, timeZone) <= dcDayNum) k++;
  return { k, dayNum: newMoonDayNumber(k, timeZone) };
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
}

// Đổi 1 ngày Dương lịch (giờ Việt Nam) sang Âm lịch Việt Nam.
export function solarToLunar(dd: number, mm: number, yy: number): LunarDate {
  const timeZone = VN_TIMEZONE;
  const dayNum = jdFromDate(dd, mm, yy);

  let Y = yy;
  let a11 = getMonth11Start(Y - 1, timeZone);
  let b11 = getMonth11Start(Y, timeZone);
  if (dayNum >= b11.dayNum) {
    Y = yy + 1;
    a11 = b11;
    b11 = getMonth11Start(Y, timeZone);
  } else if (dayNum < a11.dayNum) {
    Y = yy - 1;
    b11 = a11;
    a11 = getMonth11Start(Y - 1, timeZone);
  }

  const totalMonths = b11.k - a11.k; // 12 (năm thường) hoặc 13 (năm nhuận)
  const isLeapYear = totalMonths === 13;

  let label = 11; // nhãn của slot TRƯỚC slot đang xét (slot 0 = tháng 11, gán thẳng không qua advance)
  let lunarYear = Y - 1;
  let leapFound = false;
  let k = a11.k;

  for (let i = 0; i < totalMonths; i++) {
    const curJDE = newMoonJD(k);
    const curDay = newMoonDayNumber(k, timeZone);
    const nextJDE = newMoonJD(k + 1);
    const nextDay = newMoonDayNumber(k + 1, timeZone);

    let thisLabel: number;
    let isLeapSlot = false;
    if (i === 0) {
      thisLabel = 11;
    } else {
      isLeapSlot = isLeapYear && !leapFound && trungKhiIndex(curJDE) === trungKhiIndex(nextJDE);
      if (isLeapSlot) {
        leapFound = true;
        thisLabel = label; // lặp lại nhãn tháng liền trước (vd: tháng 2 nhuận sau tháng 2)
      } else {
        label = label === 12 ? 1 : label + 1;
        if (label === 1) lunarYear += 1;
        thisLabel = label;
      }
    }

    if (dayNum >= curDay && dayNum < nextDay) {
      return { day: dayNum - curDay + 1, month: thisLabel, year: lunarYear, isLeapMonth: isLeapSlot };
    }
    k += 1;
  }

  throw new Error("Không xác định được ngày âm lịch cho ngày dương lịch đã cho");
}
