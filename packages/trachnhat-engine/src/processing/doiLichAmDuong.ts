/**
 * ĐỔI DƯƠNG LỊCH ↔ ÂM LỊCH — lớp facade mỏng bọc `getLunarDate`/`getSolarDateFromLunar` của
 * calendar-core (Âm lịch Việt Nam, thuật toán Hồ Ngọc Đức, mặc định UTC+7). Không viết thuật
 * toán lịch riêng — calendar-core đã tự validate ngày/tháng/năm hợp lệ (kể cả tháng nhuận
 * không tồn tại), facade này chỉ thêm ràng buộc năm 1900-2100 theo đúng quy ước chung của các
 * module khác trong hệ thống (vd. `tuoiHopLamAn.ts`).
 */
import { getLunarDate, getSolarDateFromLunar, getGanzhiYear, Data } from "@thien-anh/calendar-core";

const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

export interface SolarToLunarInput {
  day: number;
  month: number;
  year: number;
  timeZone?: string;
}

export interface LunarToSolarInput {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
  timeZone?: string;
}

export interface NamAmLichCanChi {
  can: Data.Can;
  chi: Data.Chi;
  /** Nhãn hiển thị, vd "Bính Ngọ". */
  nhan: string;
}

export interface SolarToLunarResult {
  duong: { day: number; month: number; year: number };
  am: { day: number; month: number; year: number; isLeapMonth: boolean };
  namAmLich: NamAmLichCanChi;
}

export interface LunarToSolarResult {
  am: { day: number; month: number; year: number; isLeapMonth: boolean };
  duong: { day: number; month: number; year: number };
  namAmLich: NamAmLichCanChi;
}

function validateNam(nam: number, nhan: string): void {
  if (!Number.isInteger(nam) || nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) {
    throw new Error(`${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
}

/**
 * Can Chi của NHÃN năm âm lịch (vd. "năm 2026 âm lịch là năm Bính Ngọ") — theo quy ước năm
 * con giáp đại chúng, dùng trực tiếp số năm âm lịch (không qua ranh giới Lập Xuân, vì đây là
 * cách gọi tên năm âm lịch dân dụng, không phải Can Chi năm Tứ Trụ/Bát Tự).
 */
function tinhNamAmLichCanChi(namAm: number, timeZone: string): NamAmLichCanChi {
  const pillar = getGanzhiYear({ year: namAm, month: 1, day: 1, hour: 12, timeZone }, { yearBoundary: "calendar" });
  return { can: pillar.can, chi: pillar.chi, nhan: `${pillar.can} ${pillar.chi}` };
}

export function convertSolarToLunar(input: SolarToLunarInput): SolarToLunarResult {
  validateNam(input.year, "Năm dương lịch");
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;

  const am = getLunarDate({ year: input.year, month: input.month, day: input.day, hour: 12, timeZone });

  return {
    duong: { day: input.day, month: input.month, year: input.year },
    am,
    namAmLich: tinhNamAmLichCanChi(am.year, timeZone),
  };
}

export function convertLunarToSolar(input: LunarToSolarInput): LunarToSolarResult {
  validateNam(input.year, "Năm âm lịch");
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;

  const duong = getSolarDateFromLunar(
    { day: input.day, month: input.month, year: input.year, isLeapMonth: input.isLeapMonth },
    timeZone,
  );

  return {
    am: { day: input.day, month: input.month, year: input.year, isLeapMonth: input.isLeapMonth },
    duong: { day: duong.day, month: duong.month, year: duong.year },
    namAmLich: tinhNamAmLichCanChi(input.year, timeZone),
  };
}
