// Lập lá số Bát Tự (Tứ Trụ) đầy đủ: 4 trụ Can Chi, Tàng Can, Trường Sinh, Thập Thần, Nạp Âm,
// Đại Vận, Lưu Niên, Mệnh Cung, Thai Nguyên, Niên/Nhật Không, Thần Sát Nguyên Cục (5 loại).
// Công thức Đại Vận/Mệnh Cung/Thai Nguyên/Không Vong lấy từ tài liệu "Bát Tự Nền Tảng" (Vũ Thiện Minh)
// và cross-check khớp 100% với ví dụ tham chiếu (31/8/1980 11:50, Dương Nam, GMT+7) từ hocvienlyso.org.
// Thần Sát: 5 loại (Thiên Ất, Văn Xương, Tướng Tinh, Tai Sát, Kình Dương) — Kình Dương dùng bảng đủ
// 10 Thiên Can do người dùng cung cấp bổ sung (tài liệu gốc chỉ chắc chắn 5 Dương Can).

import { CAN, CHI, NAP_AM, type NguHanh } from "./menh-nap-am";
import { jdFromDate, getMonthChiIndex, getTietKhiAround } from "./solar-term";

export type AmDuong = "Dương" | "Âm";
export type Gender = "Nam" | "Nữ";

const CAN_NGU_HANH: NguHanh[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];
const CAN_AM_DUONG: AmDuong[] = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"];
const CHI_NGU_HANH: NguHanh[] = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
const CHI_AM_DUONG: AmDuong[] = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"];

// Tàng Can — Can ẩn trong mỗi Chi (thứ tự: chính khí trước, tạp khí sau).
const TANG_CAN: number[][] = [
  [9], // Tý: Quý
  [5, 9, 7], // Sửu: Kỷ, Quý, Tân
  [0, 2, 4], // Dần: Giáp, Bính, Mậu
  [1], // Mão: Ất
  [4, 1, 9], // Thìn: Mậu, Ất, Quý
  [2, 4, 6], // Tỵ: Bính, Mậu, Canh
  [3, 5], // Ngọ: Đinh, Kỷ
  [5, 3, 1], // Mùi: Kỷ, Đinh, Ất
  [6, 8, 4], // Thân: Canh, Nhâm, Mậu
  [7], // Dậu: Tân
  [4, 7, 3], // Tuất: Mậu, Tân, Đinh
  [8, 0], // Hợi: Nhâm, Giáp
];

export interface PillarInfo {
  canIndex: number;
  chiIndex: number;
  can: string;
  chi: string;
  napAm: string;
  napAmElement: NguHanh;
  tangCan: { canIndex: number; can: string; thapThan: string }[];
  thapThan: string; // thập thần của Can trụ này so với Nhật Chủ (trụ Ngày để trống — chính là Nhật Chủ)
  truongSinh?: string; // trạng thái Trường Sinh của Nhật Chủ tại Chi trụ này
}

export interface DaiVanPeriod {
  canIndex: number;
  chiIndex: number;
  can: string;
  chi: string;
  startAge: number; // tuổi (mụ) khi bước vào đại vận này
  endAge: number;
  startDate: { d: number; m: number; y: number };
}

export interface LuuNienYear {
  year: number;
  tuoi: number;
  canIndex: number;
  chiIndex: number;
  can: string;
  chi: string;
}

export type PillarKey = "year" | "month" | "day" | "hour";

export interface BatTuChart {
  year: PillarInfo;
  month: PillarInfo;
  day: PillarInfo;
  hour: PillarInfo;
  nhatChu: { canIndex: number; can: string; nguHanh: NguHanh; amDuong: AmDuong };
  gender: Gender;
  daiVanForward: boolean;
  daiVan: DaiVanPeriod[];
  menhCung: { canIndex: number; chiIndex: number; can: string; chi: string };
  thaiNguyen: { canIndex: number; chiIndex: number; can: string; chi: string };
  nienKhong: string;
  nhatKhong: string;
  thanSat: Record<PillarKey, string[]>;
}

function napAmFor(canIndex: number, chiIndex: number): { name: string; element: NguHanh } {
  return NAP_AM[Math.floor(cycleIndexOf(canIndex, chiIndex) / 2)];
}

// Suy ra cycleIndex (0-59) từ can/chi bằng vòng lặp (rẻ, tối đa 60 bước) — không có công thức đóng
// đơn giản vì can chu kỳ 10, chi chu kỳ 12 (bài toán CRT thủ công).
function cycleIndexOf(canIndex: number, chiIndex: number): number {
  for (let cycle = 0; cycle < 60; cycle++) {
    if (cycle % 10 === canIndex && cycle % 12 === chiIndex) return cycle;
  }
  throw new Error("Tổ hợp Can Chi không hợp lệ");
}

// Thập Thần: so sánh Can (canIndex) với Nhật Chủ (nhatChuIndex).
export function thapThanOf(canIndex: number, nhatChuIndex: number): string {
  const targetElement = CAN_NGU_HANH[canIndex];
  const selfElement = CAN_NGU_HANH[nhatChuIndex];
  const sameAmDuong = CAN_AM_DUONG[canIndex] === CAN_AM_DUONG[nhatChuIndex];

  if (canIndex === nhatChuIndex) return "Nhật Chủ";

  const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

  if (targetElement === selfElement) return sameAmDuong ? "Tỷ Kiên" : "Kiếp Tài";
  if (SINH[selfElement] === targetElement) return sameAmDuong ? "Thực Thần" : "Thương Quan";
  if (KHAC[selfElement] === targetElement) return sameAmDuong ? "Thiên Tài" : "Chính Tài";
  if (KHAC[targetElement] === selfElement) return sameAmDuong ? "Thất Sát" : "Chính Quan";
  if (SINH[targetElement] === selfElement) return sameAmDuong ? "Thiên Ấn" : "Chính Ấn";
  return "?";
}

const TRUONG_SINH_STAGES = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
];

// Vị trí Chi khởi đầu Trường Sinh và chiều đi (thuận/nghịch) theo từng Can.
const TRUONG_SINH_START: { chiIndex: number; forward: boolean }[] = [
  { chiIndex: 11, forward: true }, // Giáp: Hợi, thuận
  { chiIndex: 6, forward: false }, // Ất: Ngọ, nghịch
  { chiIndex: 2, forward: true }, // Bính: Dần, thuận
  { chiIndex: 9, forward: false }, // Đinh: Dậu, nghịch
  { chiIndex: 2, forward: true }, // Mậu: Dần, thuận (Hỏa Thổ đồng cung)
  { chiIndex: 9, forward: false }, // Kỷ: Dậu, nghịch
  { chiIndex: 5, forward: true }, // Canh: Tỵ, thuận
  { chiIndex: 0, forward: false }, // Tân: Tý, nghịch
  { chiIndex: 8, forward: true }, // Nhâm: Thân, thuận
  { chiIndex: 3, forward: false }, // Quý: Mão, nghịch
];

function truongSinhTrangThai(nhatChuIndex: number, chiIndex: number): string {
  const { chiIndex: start, forward } = TRUONG_SINH_START[nhatChuIndex];
  const diff = forward ? (chiIndex - start + 12) % 12 : (start - chiIndex + 12) % 12;
  return TRUONG_SINH_STAGES[diff];
}

// Ngũ Hổ Độn Nguyệt: Can của tháng Dần theo Can năm (dùng lại cho cả Trụ Tháng và Can Mệnh Cung).
function thangDanCanIndex(yearCanIndex: number): number {
  return ((yearCanIndex % 5) * 2 + 2) % 10;
}

// Ngũ Thử Độn Giờ: Can của giờ Tý theo Can ngày.
function gioTyCanIndex(dayCanIndex: number): number {
  return ((dayCanIndex % 5) * 2) % 10;
}

// --- Bảng tra Thần Sát Nguyên Cục (nguồn: "Bát Tự Nền Tảng" - Vũ Thiện Minh) ---
// Thiên Ất Quý Nhân: tra theo Can Ngày (chính) và Can Năm (phụ).
const THIEN_AT: number[][] = [
  [1, 7], // Giáp: Sửu/Mùi
  [0, 8], // Ất: Tý/Thân
  [9, 11], // Bính: Dậu/Hợi
  [9, 11], // Đinh: Dậu/Hợi
  [1, 7], // Mậu: Sửu/Mùi
  [0, 8], // Kỷ: Tý/Thân
  [2, 6], // Canh: Dần/Ngọ
  [2, 6], // Tân: Dần/Ngọ
  [3, 5], // Nhâm: Mão/Tị
  [3, 5], // Quý: Mão/Tị
];
// Văn Xương Quý Nhân: tra theo Can Ngày.
const VAN_XUONG: number[] = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
// Tướng Tinh: tra theo Chi Ngày, nhóm Tam Hợp → 1 Chi cố định. Index = chiIndex, value = target chiIndex.
const TUONG_TINH: number[] = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
// Tai Sát: tra theo Chi Ngày, nhóm Tứ Sinh/Tứ Vượng → 1 Chi cố định (Tứ Vượng đối xung).
const TAI_SAT: number[] = [6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0, 9];
// Kình Dương (Dương Nhận): tra theo Can Ngày — Địa Chi Đế Vượng của Nhật Can, đủ 10 Can.
const KINH_DUONG: number[] = [3, 2, 6, 5, 6, 5, 9, 8, 0, 11];

function addThanSatMatches(
  result: Record<PillarKey, string[]>,
  pillars: Record<PillarKey, { chiIndex: number }>,
  name: string,
  primaryTargets: number[],
  secondaryTargets?: number[],
) {
  (["year", "month", "day", "hour"] as PillarKey[]).forEach((key) => {
    const chi = pillars[key].chiIndex;
    if (primaryTargets.includes(chi)) {
      result[key].push(name);
    } else if (secondaryTargets?.includes(chi)) {
      result[key].push(`${name} (năm)`);
    }
  });
}

// Không Vong (Tuần Không): 2 Chi "dư" của tuần Giáp Tý chứa Can Chi này.
function khongVongOf(canIndex: number, chiIndex: number): string {
  const cycle = cycleIndexOf(canIndex, chiIndex);
  const tuanStartCycle = Math.floor(cycle / 10) * 10;
  const tuanStartChi = tuanStartCycle % 12;
  const a = (tuanStartChi + 10) % 12;
  const b = (tuanStartChi + 11) % 12;
  return `${CHI[a]} - ${CHI[b]}`;
}

// Cộng (năm, tháng, ngày) dương lịch theo quy tắc lịch thực (không phải cộng số ngày trung bình).
function addCalendarOffset(base: { d: number; m: number; y: number }, years: number, months: number, days: number) {
  const totalMonthIndex = base.m - 1 + months;
  const y = base.y + years + Math.floor(totalMonthIndex / 12);
  const m = ((totalMonthIndex % 12) + 12) % 12;
  const utc = Date.UTC(y, m, base.d + days);
  const dt = new Date(utc);
  return { d: dt.getUTCDate(), m: dt.getUTCMonth() + 1, y: dt.getUTCFullYear() };
}

export interface BatTuInput {
  day: number;
  month: number; // 1-12, dương lịch
  year: number;
  hour: number; // 0-23, giờ địa phương Việt Nam
  gender: Gender;
}

function buildPillar(canIndex: number, chiIndex: number, nhatChuIndex: number, isNhatChu: boolean): PillarInfo {
  const napAm = napAmFor(canIndex, chiIndex);
  const tangCan = TANG_CAN[chiIndex].map((tcIdx) => ({
    canIndex: tcIdx,
    can: CAN[tcIdx],
    thapThan: thapThanOf(tcIdx, nhatChuIndex),
  }));
  return {
    canIndex,
    chiIndex,
    can: CAN[canIndex],
    chi: CHI[chiIndex],
    napAm: napAm.name,
    napAmElement: napAm.element,
    tangCan,
    thapThan: isNhatChu ? "Nhật Chủ" : thapThanOf(canIndex, nhatChuIndex),
    truongSinh: truongSinhTrangThai(nhatChuIndex, chiIndex),
  };
}

export function tinhBatTu(input: BatTuInput): BatTuChart {
  const { day, month, year, hour, gender } = input;

  // Trụ ngày (chu kỳ 60 ngày liên tục qua Julian Day Number) — sinh từ 23h thuộc ngày hôm sau.
  let jdDay = jdFromDate(day, month, year);
  if (hour >= 23) jdDay += 1;
  const dayCanIndex = (jdDay + 9) % 10;
  const dayChiIndex = (jdDay + 1) % 12;
  const nhatChuIndex = dayCanIndex;

  // Trụ năm: ranh giới là Lập Xuân, không phải 1/1 dương lịch.
  const monthChiIndexNow = getMonthChiIndex(day, month, year, hour);
  const jdNow = jdFromDate(day, month, year) + (hour - 12) / 24 - 7 / 24;
  const jdLapXuanNam = findLapXuanJD(year);
  const batTuYear = jdNow < jdLapXuanNam ? year - 1 : year;

  const yearCycleIndex = ((batTuYear - 4) % 60 + 60) % 60;
  const yearCanIndex = yearCycleIndex % 10;
  const yearChiIndex = yearCycleIndex % 12;

  // Trụ tháng
  const monthChiIndex = monthChiIndexNow;
  const danCan = thangDanCanIndex(yearCanIndex);
  const monthOffsetFromDan = (monthChiIndex - 2 + 12) % 12;
  const monthCanIndex = (danCan + monthOffsetFromDan) % 10;

  // Trụ giờ
  const hourChiIndex = Math.floor(((hour + 1) % 24) / 2);
  const tyCan = gioTyCanIndex(dayCanIndex);
  const hourCanIndex = (tyCan + hourChiIndex) % 10;

  const yearPillar = buildPillar(yearCanIndex, yearChiIndex, nhatChuIndex, false);
  const monthPillar = buildPillar(monthCanIndex, monthChiIndex, nhatChuIndex, false);
  const dayPillar = buildPillar(dayCanIndex, dayChiIndex, nhatChuIndex, true);
  const hourPillar = buildPillar(hourCanIndex, hourChiIndex, nhatChuIndex, false);

  // --- Mệnh Cung ---
  // Chi: 14 - (số thứ tự Chi tháng, Dần=1) - (số thứ tự Chi giờ, Dần=1), quy về khoảng 1-12.
  const thangChiNum = ((monthChiIndex - 2 + 12) % 12) + 1;
  const gioChiNum = ((hourChiIndex - 2 + 12) % 12) + 1;
  let menhCungChiNum = 14 - thangChiNum - gioChiNum;
  while (menhCungChiNum <= 0) menhCungChiNum += 12;
  while (menhCungChiNum > 12) menhCungChiNum -= 12;
  const menhCungChiIndex = (menhCungChiNum + 1) % 12; // Dần=1 → chiIndex 2
  const menhCungOffsetFromDan = menhCungChiNum - 1;
  const menhCungCanIndex = (thangDanCanIndex(yearCanIndex) + menhCungOffsetFromDan) % 10;

  // --- Thai Nguyên ---
  const thaiNguyenCanIndex = (monthCanIndex + 1) % 10;
  const thaiNguyenChiIndex = (monthChiIndex + 3) % 12;

  // --- Niên Không / Nhật Không ---
  const nienKhong = khongVongOf(yearCanIndex, yearChiIndex);
  const nhatKhong = khongVongOf(dayCanIndex, dayChiIndex);

  // --- Thần Sát Nguyên Cục ---
  const pillarsMap: Record<PillarKey, { chiIndex: number }> = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
  const thanSat: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };
  addThanSatMatches(thanSat, pillarsMap, "Thiên Ất", THIEN_AT[dayCanIndex], THIEN_AT[yearCanIndex]);
  addThanSatMatches(thanSat, pillarsMap, "Văn Xương", [VAN_XUONG[dayCanIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Tướng Tinh", [TUONG_TINH[dayChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Tai Sát", [TAI_SAT[dayChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Kình Dương", [KINH_DUONG[dayCanIndex]]);

  // --- Đại Vận ---
  const yearIsDuong = CAN_AM_DUONG[yearCanIndex] === "Dương";
  const forward = (yearIsDuong && gender === "Nam") || (!yearIsDuong && gender === "Nữ");
  const crossings = getTietKhiAround(year);
  const nearestTietJD = forward
    ? crossings.find((c) => c.jd > jdNow)?.jd
    : [...crossings].reverse().find((c) => c.jd <= jdNow)?.jd;
  if (nearestTietJD === undefined) throw new Error("Không tìm được Tiết Khí gần nhất để tính Đại Vận");

  const daysDiff = Math.abs(nearestTietJD - jdNow);
  const totalMonths = daysDiff * 4; // quy tắc "3 ngày = 1 năm, 1 ngày = 4 tháng"
  const startYears = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;
  const startMonthsPart = Math.floor(remMonths);
  const startDaysPart = Math.round((remMonths - startMonthsPart) * 30);
  const startDate = addCalendarOffset({ d: day, m: month, y: year }, startYears, startMonthsPart, startDaysPart);
  const startAgeMu = startDate.y - year + 1; // tuổi mụ = năm dương lịch - năm sinh + 1

  const monthCycle = cycleIndexOf(monthCanIndex, monthChiIndex);
  const daiVan: DaiVanPeriod[] = [];
  for (let i = 0; i < 10; i++) {
    const step = forward ? i + 1 : -(i + 1);
    const cycle = ((monthCycle + step) % 60 + 60) % 60;
    const canIndex = cycle % 10;
    const chiIndex = cycle % 12;
    const periodStart = addCalendarOffset({ d: startDate.d, m: startDate.m, y: startDate.y }, i * 10, 0, 0);
    daiVan.push({
      canIndex,
      chiIndex,
      can: CAN[canIndex],
      chi: CHI[chiIndex],
      startAge: startAgeMu + i * 10,
      endAge: startAgeMu + i * 10 + 9,
      startDate: periodStart,
    });
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    nhatChu: {
      canIndex: nhatChuIndex,
      can: CAN[nhatChuIndex],
      nguHanh: CAN_NGU_HANH[nhatChuIndex],
      amDuong: CAN_AM_DUONG[nhatChuIndex],
    },
    gender,
    daiVanForward: forward,
    daiVan,
    menhCung: {
      canIndex: menhCungCanIndex,
      chiIndex: menhCungChiIndex,
      can: CAN[menhCungCanIndex],
      chi: CHI[menhCungChiIndex],
    },
    thaiNguyen: {
      canIndex: thaiNguyenCanIndex,
      chiIndex: thaiNguyenChiIndex,
      can: CAN[thaiNguyenCanIndex],
      chi: CHI[thaiNguyenChiIndex],
    },
    nienKhong,
    nhatKhong,
    thanSat,
  };
}

// Tính Lưu Niên (10 năm) bắt đầu từ 1 năm dương lịch cho trước — dùng cho 1 cột Đại Vận đang chọn.
export function tinhLuuNien(startYear: number, birthYear: number, count = 10): LuuNienYear[] {
  const result: LuuNienYear[] = [];
  for (let i = 0; i < count; i++) {
    const yr = startYear + i;
    const cycle = ((yr - 4) % 60 + 60) % 60;
    const canIndex = cycle % 10;
    const chiIndex = cycle % 12;
    result.push({ year: yr, tuoi: yr - birthYear + 1, canIndex, chiIndex, can: CAN[canIndex], chi: CHI[chiIndex] });
  }
  return result;
}

// Tìm JD của Lập Xuân trong năm dương lịch cho trước (dùng lại logic dò nhị phân của solar-term).
function findLapXuanJD(year: number): number {
  const crossings = getTietKhiAround(year);
  const lapXuan = crossings
    .filter((c) => c.name === "Lập Xuân")
    .sort((a, b) => a.jd - b.jd)
    .find((c) => {
      const approxJdJan1 = jdFromDate(1, 1, year);
      return c.jd >= approxJdJan1 - 40 && c.jd <= approxJdJan1 + 60;
    });
  if (!lapXuan) throw new Error("Không tìm thấy Lập Xuân cho năm " + year);
  return lapXuan.jd;
}

export { CAN_NGU_HANH, CAN_AM_DUONG, CHI_NGU_HANH, CHI_AM_DUONG };
