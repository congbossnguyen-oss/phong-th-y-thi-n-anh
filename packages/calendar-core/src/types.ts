/**
 * Kiểu dữ liệu công khai cho lớp API thân thiện (index.ts) — nhận đầu vào là ngày-giờ
 * dân sự + tên múi giờ IANA, thay vì Julian Day thô như các module lõi bên dưới.
 */

import type { GanzhiPillar, GanzhiHourOptions, GanzhiYearOptions } from "./calendar/ganzhi.js";

/** Một thời điểm ngày-giờ dân sự, gắn với múi giờ IANA. Đây là input chuẩn cho mọi hàm API công khai. */
export interface DateTimeInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour?: number; // 0-23, mặc định 0
  minute?: number; // 0-59, mặc định 0
  second?: number; // 0-59, mặc định 0
  /** Tên múi giờ IANA, vd. "Asia/Ho_Chi_Minh", "Asia/Shanghai", "Asia/Tokyo", "Europe/Berlin". */
  timeZone: string;
}

export interface GetCanChiOptions {
  yearOptions?: GanzhiYearOptions;
  hourOptions?: GanzhiHourOptions;
}

/** Kết quả đầy đủ Tứ Trụ: 4 trụ Can Chi + thông tin Julian Day gốc dùng để tính ra chúng. */
export interface FullCanChiResult {
  year: GanzhiPillar;
  month: GanzhiPillar;
  day: GanzhiPillar;
  hour: GanzhiPillar;
  julianDay: number;
  julianDayNumber: number;
}

export interface JulianDayResult {
  /** Julian Day (số thực, quy ước Meeus, theo UT) — dùng cho tính toán thiên văn liên tục. */
  julianDay: number;
  /** Julian Day Number (số nguyên, quy ước Fliegel & Van Flandern) — dùng làm nhãn ngày lịch/Can Chi ngày. */
  julianDayNumber: number;
}
