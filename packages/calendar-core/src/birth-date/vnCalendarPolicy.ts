/**
 * Chính sách múi giờ Âm Lịch Việt Nam (G10) — tầng "resolver" tường minh.
 *
 * Bối cảnh: thuật toán Âm lịch trong `calendar/lunarCalendar.ts` là OFFSET-AGNOSTIC — nó chỉ
 * nhận một `utcOffsetHours` cố định và tính đúng theo offset đó. Việc CHỌN offset nào theo đúng
 * lịch sử/chính sách Việt Nam KHÔNG phải việc của tầng toán học, mà là của tầng chính sách này.
 *
 * Chính sách đã phê chuẩn (NHD-1, C6):
 *   - TRƯỚC 1968-01-01  → UTC+8 (cùng Trung Quốc thời kỳ đó).
 *   - TỪ 1968-01-01     → UTC+7 (Việt Nam thống nhất, quy ước dân dụng hiện đại).
 *   - +8 vùng miền (Nam VN / Trung Quốc giai đoạn 1968–1975) CHỈ là metadata minh bạch
 *     (`regionalAlternative`), KHÔNG bao giờ là kết quả canonical.
 *
 * QUAN TRỌNG:
 *   - KHÔNG nhân bản toán Âm lịch. KHÔNG sửa toán Âm lịch của calendar-core.
 *   - KHÔNG dùng `Asia/Ho_Chi_Minh` thô cho đường canonical (offset IANA đổi tại 1975-06-13,
 *     KHÔNG khớp mốc chính sách 1968-01-01 — xem V3-37 POLICY_BOUNDARIES).
 *   - ΔT do calendar-core tự áp trong `astronomy/lunar.ts::newMoonJulianDay` (NHD-3), tầng này
 *     không đụng tới.
 */

import type { LunarDate } from "../calendar/lunarCalendar.js";
import type { CalendarDate } from "../astronomy/julianDay.js";
import { getLunarDate, getSolarDateFromLunar } from "../index.js";
import { isCanonicalVnLunarEnabled } from "./lunarEngineFlag.js";

/** Mốc chính sách: +8 nghiêm ngặt TRƯỚC ngày này, +7 kể từ ngày này (bao gồm). */
export const VN_POLICY_UNIFY_DATE_KEY = 19680101;

/** Lỗi khi input không đủ độ chính xác NGÀY (year-only bị từ chối — không bịa 1/1). */
export class VietnameseCalendarPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VietnameseCalendarPolicyError";
  }
}

export interface VnPolicyDateInput {
  year: number;
  month: number;
  day: number;
}

export interface VnRegionalAlternative {
  offsetHours: number;
  region: string;
  note: string;
}

export interface VietnameseCalendarPolicy {
  policy: string;
  offsetHours: 7 | 8;
  region: string;
  era: "pre-1968" | "1968+";
  confidence: "RATIFIED";
  source: string;
  notes: string;
  regionalAlternative: VnRegionalAlternative | null;
}

/** Zone IANA cố-định-offset tương ứng (đã kiểm chứng runtime: Etc/GMT-7=+7, Etc/GMT-8=+8). */
export function policyOffsetToFixedZone(offsetHours: 7 | 8): string {
  return offsetHours === 8 ? "Etc/GMT-8" : "Etc/GMT-7";
}

function assertFullDate(date: VnPolicyDateInput): void {
  const { year, month, day } = date ?? ({} as VnPolicyDateInput);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31
  ) {
    throw new VietnameseCalendarPolicyError(
      "Chính sách Âm lịch VN yêu cầu ĐẦY ĐỦ năm-tháng-ngày (year/month/day là số nguyên hợp lệ). " +
        "Không chấp nhận năm-đơn-lẻ và KHÔNG tự bịa ngày 1/1.",
    );
  }
}

/**
 * Resolver chính sách — thuần, xác định, chỉ phụ thuộc ngày dương lịch đầu vào.
 * KHÔNG gọi toán lịch, KHÔNG đọc IANA, KHÔNG đọc đồng hồ.
 */
export function resolveVietnameseCalendarPolicy(date: VnPolicyDateInput): VietnameseCalendarPolicy {
  assertFullDate(date);

  const dateKey = date.year * 10000 + date.month * 100 + date.day;
  const isPre1968 = dateKey < VN_POLICY_UNIFY_DATE_KEY;

  if (isPre1968) {
    return {
      policy: "NHD-1 Việt Nam: TRƯỚC 1968-01-01 = UTC+8",
      offsetHours: 8,
      region: "VN (cùng múi giờ Trung Quốc trước 1968)",
      era: "pre-1968",
      confidence: "RATIFIED",
      source: "NHD-1 (V3-26) / C6",
      notes: "Trước mốc thống nhất 1968-01-01, Âm lịch VN quy đổi theo UTC+8.",
      regionalAlternative: null,
    };
  }

  return {
    policy: "NHD-1 Việt Nam: TỪ 1968-01-01 = UTC+7 (thống nhất)",
    offsetHours: 7,
    region: "VN thống nhất",
    era: "1968+",
    confidence: "RATIFIED",
    source: "NHD-1 (V3-26) / C6",
    notes:
      "Từ 1968-01-01, Âm lịch VN dùng UTC+7 (quy ước dân dụng thống nhất). Không dùng mốc 13/08/1968.",
    // Minh bạch C6: giai đoạn 1968–1975 có vùng dùng +8 (Nam VN/Trung Quốc). CHỈ là metadata.
    regionalAlternative:
      dateKey < 19750614
        ? {
            offsetHours: 8,
            region: "Nam VN / Trung Quốc (1968–1975)",
            note: "Chỉ minh bạch (transparency), KHÔNG phải kết quả canonical.",
          }
        : null,
  };
}

/**
 * Wrapper canonical: Dương lịch → Âm lịch VN theo chính sách tường minh, chạy trên
 * calendar-core `getLunarDate` với zone cố-định-offset. ΔT do calendar-core tự áp (NHD-3).
 * KHÔNG nhân bản/sửa toán Âm lịch.
 */
export function getVietnameseLunarDate(date: VnPolicyDateInput, hour = 12): LunarDate {
  const policy = resolveVietnameseCalendarPolicy(date);
  const timeZone = policyOffsetToFixedZone(policy.offsetHours);
  return getLunarDate({
    year: date.year,
    month: date.month,
    day: date.day,
    hour,
    minute: 0,
    timeZone,
  });
}

const DEFAULT_VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Zone dùng cho Dương→Âm ở các call-site đã có sẵn `timeZone`. Khi cờ BẬT và caller dùng zone VN
 * mặc định → trả zone cố-định-offset theo chính sách (Etc/GMT-7/8). Ngược lại giữ nguyên zone cũ.
 * Dùng chung cho mọi call-site trachnhat/tang-le/facade để tránh lặp logic.
 */
export function vnLunarZone(date: VnPolicyDateInput, timeZone?: string): string {
  if (isCanonicalVnLunarEnabled() && (!timeZone || timeZone === DEFAULT_VN_TIME_ZONE)) {
    return policyOffsetToFixedZone(resolveVietnameseCalendarPolicy(date).offsetHours);
  }
  return timeZone ?? DEFAULT_VN_TIME_ZONE;
}

/**
 * Zone dùng cho Âm→Dương (nghịch). Chọn offset TỰ NHẤT QUÁN với ngày dương thực tế: ứng viên nào
 * (Etc/GMT-8 hoặc Etc/GMT-7) cho ra ngày dương mà khi quy đổi XUÔI (theo chính sách của chính ngày
 * dương đó) tái tạo đúng ngày âm yêu cầu thì chọn ứng viên đó. KHÔNG hardcode năm, KHÔNG bảng tra,
 * KHÔNG nhân bản toán lịch (dùng lại getSolarDateFromLunar + getVietnameseLunarDate của calendar-core).
 * Nếu không có (hoặc có nhiều hơn một) ứng viên nhất quán khác ngày → ném lỗi tường minh, không đoán.
 */
export function vnInverseZone(
  lunar: { day: number; month: number; year: number; isLeapMonth: boolean },
  timeZone?: string,
): string {
  if (!(isCanonicalVnLunarEnabled() && (!timeZone || timeZone === DEFAULT_VN_TIME_ZONE))) {
    return timeZone ?? DEFAULT_VN_TIME_ZONE;
  }
  // Đánh giá TỪNG ứng viên ĐỘC LẬP trong try/catch: một ứng viên offset ném lỗi (vd. số tháng nhuận
  // của năm khác nhau theo offset khiến getSolarDateFromLunar từ chối) KHÔNG được làm hỏng ứng viên kia.
  const consistent: Array<{ zone: string; key: string }> = [];
  for (const off of [8, 7] as const) {
    const zone = policyOffsetToFixedZone(off);
    try {
      const s = getSolarDateFromLunar(lunar, zone);
      const back = getVietnameseLunarDate({ year: s.year, month: s.month, day: s.day });
      if (
        back.day === lunar.day &&
        back.month === lunar.month &&
        back.year === lunar.year &&
        back.isLeapMonth === lunar.isLeapMonth
      ) {
        consistent.push({ zone, key: `${s.year}-${s.month}-${s.day}` });
      }
    } catch {
      // Ứng viên offset này không hợp lệ cho ngày âm này → bỏ qua, xét ứng viên còn lại.
    }
  }
  const uniqueDates = new Set(consistent.map((c) => c.key));
  const first = consistent[0];
  // Đúng một ngày dương nhất quán (một ứng viên, hoặc hai ứng viên cùng ngày) → chấp nhận.
  if (first && uniqueDates.size === 1) return first.zone;
  if (consistent.length === 0) {
    throw new VietnameseCalendarPolicyError(
      `Không có múi giờ nghịch nhất quán cho ngày âm ${lunar.day}/${lunar.month}/${lunar.year}` +
        `${lunar.isLeapMonth ? " (nhuận)" : ""}.`,
    );
  }
  throw new VietnameseCalendarPolicyError(
    `Múi giờ nghịch mập mờ (nhiều ngày dương nhất quán) cho ngày âm ${lunar.day}/${lunar.month}/${lunar.year}` +
      `${lunar.isLeapMonth ? " (nhuận)" : ""}.`,
  );
}

/** Âm→Dương canonical (bọc `getSolarDateFromLunar` với zone chính sách). Không nhân bản toán lịch. */
export function getVietnameseSolarDateFromLunar(lunar: {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
}): CalendarDate {
  return getSolarDateFromLunar(lunar, vnInverseZone(lunar));
}
