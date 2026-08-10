/**
 * Lưới lịch 1 tháng dương lịch (dùng cho giao diện lịch dạng bảng — mỗi ô hiện ngày dương +
 * ngày âm nhỏ, đủ 6 hàng x 7 cột, có đệm ngày đầu/cuối tháng liền kề). Chỉ cần Âm lịch
 * (`getLunarDate` của calendar-core) — không tính Trực/Thần Sát/28 Tú cho từng ô vì quá nặng
 * và không cần thiết cho lưới tổng quan (người dùng bấm vào 1 ô mới gọi `calculate()` đầy đủ).
 */
import { getLunarDate } from "@thien-anh/calendar-core";

export interface MonthGridInput {
  year: number;
  month: number; // 1-12
  timeZone: string;
}

export interface MonthGridDay {
  solarDate: { year: number; month: number; day: number };
  lunarDay: number;
  lunarMonth: number;
  isLeapMonth: boolean;
  /** Có thuộc đúng tháng đang xem hay là ngày đệm của tháng liền kề. */
  isCurrentMonth: boolean;
  /** 0=Chủ Nhật ... 6=Thứ Bảy. */
  weekday: number;
}

export interface MonthGridResult {
  year: number;
  month: number;
  days: MonthGridDay[];
}

function daysInGregorianMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function calculateMonthGrid(input: MonthGridInput): MonthGridResult {
  const { year, month, timeZone } = input;
  if (month < 1 || month > 12) {
    throw new Error(`Tháng không hợp lệ: ${month}`);
  }

  const startWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysThisMonth = daysInGregorianMonth(year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysPrevMonth = daysInGregorianMonth(prevYear, prevMonth);

  interface Cell {
    year: number;
    month: number;
    day: number;
    isCurrentMonth: boolean;
  }
  const cells: Cell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ year: prevYear, month: prevMonth, day: daysPrevMonth - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysThisMonth; d++) {
    cells.push({ year, month, day: d, isCurrentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!;
    const next = new Date(Date.UTC(last.year, last.month - 1, last.day + 1));
    cells.push({
      year: next.getUTCFullYear(),
      month: next.getUTCMonth() + 1,
      day: next.getUTCDate(),
      isCurrentMonth: false,
    });
  }

  const days: MonthGridDay[] = cells.map((c) => {
    const lunar = getLunarDate({ year: c.year, month: c.month, day: c.day, hour: 12, timeZone });
    const weekday = new Date(Date.UTC(c.year, c.month - 1, c.day)).getUTCDay();
    return {
      solarDate: { year: c.year, month: c.month, day: c.day },
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      isLeapMonth: lunar.isLeapMonth,
      isCurrentMonth: c.isCurrentMonth,
      weekday,
    };
  });

  return { year, month, days };
}
