/**
 * Bảng đủ 12 giờ Địa Chi (Tý→Hợi) trong ngày: Can Chi giờ (Ngũ Thử Độn), Hoàng-Hắc giờ,
 * Tiểu Lục Nhâm giờ — theo docs/15-trach-nhat-engine.md mục 2.3.
 */

import { Calendar, Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { GioTrongNgay } from "../types.js";

const { CHI } = Data;

/**
 * Giờ dân sự đại diện (0-23) cho mỗi Chi giờ, dùng để gọi `Calendar.getGanzhiHour` — mỗi
 * Chi phủ đúng 2 tiếng (`hourChiIndex = mod(floor((hour+1)/2), 12)`, xem ganzhi.ts), nên bất
 * kỳ giờ nào trong khung đều cho cùng kết quả; chọn Tý=0h (tránh mập mờ biên giờ Tý 23h-1h),
 * còn lại theo công thức `2×chiIndex - 1`.
 */
function representativeHour(chiIndex: number): number {
  return chiIndex === 0 ? 0 : 2 * chiIndex - 1;
}

export function tinhGio12(params: {
  julianDayNumber: number;
  dayChiIndex: number;
  lunarMonth: number;
  lunarDay: number;
}): GioTrongNgay[] {
  const { julianDayNumber, dayChiIndex, lunarMonth, lunarDay } = params;
  const result: GioTrongNgay[] = [];

  for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
    const hourPillar = Calendar.getGanzhiHour(julianDayNumber, representativeHour(chiIndex));
    const hoangHacGio = TrachNhat.getHoangDaoHacDaoGio(dayChiIndex, chiIndex);
    const tieuLucNham = TrachNhat.getTieuLucNham(lunarMonth, lunarDay, chiIndex);

    result.push({
      chiGio: CHI[chiIndex]!,
      canChiGio: { can: hourPillar.can, chi: hourPillar.chi },
      hoangDaoHacDaoGio: { name: hoangHacGio.name, catHung: hoangHacGio.catHung },
      tieuLucNhamGio: { name: tieuLucNham.hour.name, catHung: tieuLucNham.hour.catHung },
    });
  }

  return result;
}
