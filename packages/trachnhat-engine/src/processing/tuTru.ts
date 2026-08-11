/**
 * Tính Julian Day, Âm lịch, Tứ Trụ Năm/Tháng/Ngày, và Tiết Khí đang hiệu lực — theo
 * docs/15-trach-nhat-engine.md mục 2.3.
 *
 * ⚠️ Trụ THÁNG dùng `TrachNhat.getThangCanChiAmLich` (rule-engine, Ngũ Hổ Độn theo THÁNG ÂM
 * LỊCH) — KHÔNG dùng `calendar-core`'s `getCanChi().month` (Ngũ Hổ Độn theo ranh giới TIẾT
 * KHÍ, chuẩn Tứ Trụ/Bát Tự cá nhân). Phát hiện khi viết test: đối chiếu hocvienlyso.org/
 * lichvansu/ tháng 8/2026 cho thấy site đổi "Tháng" đúng ngày mùng 1 âm lịch (13/8/2026:
 * Ất Mùi -> Bính Thân), không đổi đúng lúc tiết khí Lập Thu xảy ra (7/8/2026, sớm hơn 5
 * ngày) — khớp với quy ước Trạch Nhật cổ điển mà toàn bộ nhóm `trach-nhat` khác (Hoàng-Hắc,
 * Tiểu Lục Nhâm, Thần Sát) đã dùng từ đầu (nhận `lunarMonth`, không nhận tiết khí). Xem
 * `rule-engine/src/trach-nhat/thangCanChi.ts` để biết chi tiết đối chiếu.
 */

import { Calendar, Data, getCanChi, getLunarDate, getSolarTerms } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { TrachNhatInput } from "../types.js";

type NguHanh = Data.NguHanh;

export interface TuTruResult {
  julianDayNumber: number;
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  tietKhi: { name: string } | null;
  tuTru: {
    nam: { can: string; chi: string };
    thang: { can: string; chi: string };
    ngay: { can: string; chi: string };
  };
  /** Nạp Âm của trụ NGÀY (dùng cho "Ngũ hành ngày" khi so sánh với Mệnh cá nhân — cùng cơ chế suy Nạp Âm như Mệnh). */
  napAmNgay: { name: string; element: NguHanh };
  dayChiIndex: number;
  monthOrderIndex: number;
}

/**
 * Tiết khí đang hiệu lực tại `jdUT`: mốc gần nhất trong 24 tiết khí của năm hiện tại +
 * năm trước (để phủ vài ngày đầu tháng 1, trước khi tiết khí đầu tiên của năm mới xảy ra)
 * mà đã xảy ra (julianDay <= jdUT). Danh sách trả về từ `getSolarTerms` đã sắp theo thời
 * gian tăng dần, chỉ cần lấy mốc CUỐI CÙNG còn thỏa điều kiện.
 */
function findTietKhiHieuLuc(year: number, jdUT: number): { name: string } | null {
  const terms = [...getSolarTerms(year - 1), ...getSolarTerms(year)].sort((a, b) => a.julianDay - b.julianDay);

  let current: { name: string } | null = null;
  for (const term of terms) {
    if (term.julianDay > jdUT) break;
    current = { name: term.name };
  }
  return current;
}

export function tinhTuTru(input: TrachNhatInput): TuTruResult {
  const { solarDate, timeZone } = input;
  // Giờ 12h trưa: chỉ dùng để xác định Tứ Trụ Năm/Tháng/Ngày (không phụ thuộc giờ trong
  // ngày), tránh mọi biên giờ Tý nhạy cảm (23h-1h) mà bảng 12 giờ ở gioBang.ts sẽ tính riêng.
  const dateTimeInput = { ...solarDate, hour: 12, timeZone };

  const canChi = getCanChi(dateTimeInput);
  const lunar = getLunarDate(dateTimeInput);

  const monthOrderIndex = Calendar.monthBoundaryOrderIndex(canChi.julianDay);
  const tietKhi = findTietKhiHieuLuc(solarDate.year, canChi.julianDay);
  const thang = TrachNhat.getThangCanChiAmLich(canChi.year.canIndex, lunar.month);

  return {
    julianDayNumber: canChi.julianDayNumber,
    lunarDate: { year: lunar.year, month: lunar.month, day: lunar.day, isLeapMonth: lunar.isLeapMonth },
    tietKhi,
    tuTru: {
      nam: { can: canChi.year.can, chi: canChi.year.chi },
      thang: { can: thang.can, chi: thang.chi },
      ngay: { can: canChi.day.can, chi: canChi.day.chi },
    },
    napAmNgay: canChi.day.napAm,
    dayChiIndex: canChi.day.chiIndex,
    monthOrderIndex,
  };
}
