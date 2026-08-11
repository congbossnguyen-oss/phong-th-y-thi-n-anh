/**
 * Lưới lịch 1 tháng dương lịch (dùng cho giao diện lịch dạng bảng — mỗi ô hiện ngày dương +
 * ngày âm nhỏ, đủ 6 hàng x 7 cột, có đệm ngày đầu/cuối tháng liền kề). Chủ yếu chỉ cần Âm lịch
 * (`getLunarDate` của calendar-core) — KHÔNG tính đầy đủ Trực/28 Tú/toàn bộ Thần Sát cho từng
 * ô vì quá nặng và không cần thiết cho lưới tổng quan (người dùng bấm vào 1 ô mới gọi
 * `calculate()` đầy đủ).
 *
 * Ngoại lệ: `catTocDep` (ngày đẹp cắt tóc) CÓ tính riêng cho từng ô, vì mục đích của trường
 * này chính là để tô sáng cả tháng cho người dùng quét nhanh — cần Trực + Thần Sát Giải Thần
 * (`TrachNhat.getTruc` + `TrachNhat.getThanSatTrongNgay`, cùng logic với `ngayInfo.ts`), chi
 * phí thêm không đáng kể so với `getLunarDate` đã gọi sẵn cho mỗi ô.
 */
import { Calendar, getCanChi, getLunarDate } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";

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
  /** Ngày này có đẹp để cắt tóc/cạo đầu/trang điểm hay không (Trực Trừ hoặc có Giải Thần). */
  catTocDep: boolean;
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
    const dateTimeInput = { year: c.year, month: c.month, day: c.day, hour: 12, timeZone };
    const lunar = getLunarDate(dateTimeInput);
    const weekday = new Date(Date.UTC(c.year, c.month - 1, c.day)).getUTCDay();

    const canChi = getCanChi(dateTimeInput);
    const monthOrderIndex = Calendar.monthBoundaryOrderIndex(canChi.julianDay);
    const truc = TrachNhat.getTruc(canChi.day.chiIndex, monthOrderIndex);
    const thanSat = TrachNhat.getThanSatTrongNgay(lunar.month, canChi.day.chi);
    const catTocDep = TrachNhat.isNgayDepCatToc(
      truc.name,
      thanSat.map((entry) => entry.name),
    );

    return {
      solarDate: { year: c.year, month: c.month, day: c.day },
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      isLeapMonth: lunar.isLeapMonth,
      isCurrentMonth: c.isCurrentMonth,
      weekday,
      catTocDep,
    };
  });

  return { year, month, days };
}
