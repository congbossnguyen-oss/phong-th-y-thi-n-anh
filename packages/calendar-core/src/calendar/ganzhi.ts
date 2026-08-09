/**
 * Can Chi (Ganzhi / Thiên Can - Địa Chi) cho Năm, Tháng, Ngày, Giờ.
 *
 * Toàn bộ 4 trụ đều được TÍNH bằng công thức xác định dựa trên Julian Day và kinh độ mặt
 * trời — không hardcode theo năm cụ thể nào. Các quy tắc truyền thống áp dụng:
 *
 * - Năm Can Chi (theo Tứ Trụ/Bát Tự): đổi tại thời điểm Lập Xuân (315°), KHÔNG phải
 *   1/1 dương lịch, cũng KHÔNG phải Tết Nguyên Đán (mồng 1 tháng Giêng âm lịch).
 * - Tháng Can Chi: Địa Chi tháng cố định theo 12 "Tiết" (ranh giới 30° kinh độ mặt trời
 *   bắt đầu từ Lập Xuân); Thiên Can tháng suy ra từ Thiên Can năm qua quy tắc "Ngũ Hổ Độn".
 * - Ngày Can Chi: suy trực tiếp từ Julian Day Number qua một phép offset cố định (không
 *   đổi theo thời gian, vì chu kỳ 60 ngày chạy liên tục không gián đoạn qua lịch sử).
 * - Giờ Can Chi: Địa Chi giờ chia ngày thành 12 khung 2 tiếng; Thiên Can giờ suy ra từ
 *   Thiên Can ngày qua quy tắc "Ngũ Thử Độn".
 */

import { CAN, CHI, napAmForCycleIndex, type Can, type Chi, type NguHanh } from "../data/canChi.js";
import { calendarDateToJulianDay, julianDayNumber, julianDayToDateTime } from "../astronomy/julianDay.js";
import { findSolarTermJd, monthBoundaryOrderIndex } from "./solarTerms.js";
import { mod } from "../utils/math.js";

export interface GanzhiPillar {
  canIndex: number; // 0-9, 0 = Giáp
  chiIndex: number; // 0-11, 0 = Tý
  can: Can;
  chi: Chi;
  /** Vị trí trong Lục Thập Hoa Giáp, 0-59 (0 = Giáp Tý). */
  cycleIndex: number;
  napAm: { name: string; element: NguHanh };
}

/** Dựng một trụ Can Chi hoàn chỉnh (kèm Nạp Âm) từ index Can và Chi bất kỳ (tự động mod). */
export function buildPillar(canIndexRaw: number, chiIndexRaw: number): GanzhiPillar {
  const canIndex = mod(canIndexRaw, 10);
  const chiIndex = mod(chiIndexRaw, 12);

  // Can (mod 10) và Chi (mod 12) luôn cùng tính chẵn/lẻ theo cách chúng được sinh ra trong
  // Lục Thập Hoa Giáp truyền thống, nên luôn tồn tại đúng một cycleIndex 0-59 thỏa mãn cả
  // hai đồng dư thức — dò tuyến tính 60 bước là đủ nhanh và rõ ràng hơn một công thức CRT cô đọng.
  let cycleIndex = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === canIndex && i % 12 === chiIndex) {
      cycleIndex = i;
      break;
    }
  }
  if (cycleIndex === -1) {
    throw new Error(`Tổ hợp Can(${canIndex})-Chi(${chiIndex}) không tồn tại trong Lục Thập Hoa Giáp`);
  }

  return {
    canIndex,
    chiIndex,
    can: CAN[canIndex]!,
    chi: CHI[chiIndex]!,
    cycleIndex,
    napAm: napAmForCycleIndex(cycleIndex),
  };
}

export interface GanzhiYearOptions {
  /**
   * "lichXuan" (mặc định): ranh giới Lập Xuân — quy ước CHUẨN cho Tứ Trụ/Bát Tự chuyên môn.
   * "calendar": ranh giới 1/1 dương lịch — dùng khi chỉ cần tra nhanh "năm con giáp" đại chúng.
   */
  yearBoundary?: "lichXuan" | "calendar";
}

/** Can Chi của Năm tại thời điểm `jdUT` (Julian Day, UT). */
export function getGanzhiYear(jdUT: number, options: GanzhiYearOptions = {}): GanzhiPillar {
  const boundary = options.yearBoundary ?? "lichXuan";
  const { year } = julianDayToDateTime(jdUT);

  let effectiveYear = year;

  if (boundary === "lichXuan") {
    // Ước lượng ban đầu gần 4/2 dương lịch (Lập Xuân luôn rơi vào khoảng 3-5/2) rồi tinh
    // chỉnh chính xác bằng Newton-Raphson (findSolarTermJd) — không hardcode ngày 4/2.
    const roughGuess = calendarDateToJulianDay(year, 2, 4);
    const lapXuanOfThisYear = findSolarTermJd(315, roughGuess);
    if (jdUT < lapXuanOfThisYear) {
      effectiveYear = year - 1;
    }
  }

  const cycleIndex = mod(effectiveYear - 4, 60);
  return buildPillar(cycleIndex, cycleIndex);
}

/**
 * Can Chi của Tháng tại thời điểm `jdUT`. Luôn dùng ranh giới Lập Xuân cho Năm (bất kể
 * option của getGanzhiYear) vì Tháng Can Chi về bản chất PHỤ THUỘC Năm Can Chi kiểu Bát Tự
 * — trộn hai quy ước ranh giới năm khác nhau giữa Tháng và Năm sẽ cho kết quả sai lệch
 * với mọi tài liệu Tứ Trụ truyền thống.
 */
export function getGanzhiMonth(jdUT: number): GanzhiPillar {
  const yearPillar = getGanzhiYear(jdUT, { yearBoundary: "lichXuan" });
  const monthOrderIndex = monthBoundaryOrderIndex(jdUT); // 0 = Dần ... 11 = Sửu

  // Quy tắc Ngũ Hổ Độn Nguyệt: Can của tháng Dần (tháng đầu) suy từ Can năm.
  // Giáp/Kỷ->Bính, Ất/Canh->Mậu, Bính/Tân->Canh, Đinh/Nhâm->Nhâm, Mậu/Quý->Giáp.
  const monthCanAtDan = mod((yearPillar.canIndex % 5) * 2 + 2, 10);

  const monthCanIndex = mod(monthCanAtDan + monthOrderIndex, 10);
  const monthChiIndex = mod(2 + monthOrderIndex, 12); // Dần có index 2 trong mảng CHI

  return buildPillar(monthCanIndex, monthChiIndex);
}

/**
 * Can Chi của Ngày, từ Julian Day Number NGUYÊN (quy ước Fliegel & Van Flandern —
 * xem astronomy/julianDay.ts, KHÔNG phải Julian Day có phần thập phân của Meeus).
 *
 * Công thức: canIndex = (jdn + 9) mod 10, chiIndex = (jdn + 1) mod 12. Hai hằng số offset
 * (9 và 1) được xác định bằng cách đối chiếu với mốc lịch sử đã biết: 01/01/2000 dương lịch
 * là ngày Mậu Ngọ (JDN 2451545) — xem test unit `ganzhi.test.ts` để kiểm chứng lại.
 */
export function getGanzhiDay(jdn: number): GanzhiPillar {
  const canIndex = mod(jdn + 9, 10);
  const chiIndex = mod(jdn + 1, 12);
  return buildPillar(canIndex, chiIndex);
}

/**
 * Tiện ích: Can Chi Ngày trực tiếp từ một ngày dương lịch (year/month/day).
 * LƯU Ý: dùng `julianDayNumber` (JDN nguyên, Fliegel & Van Flandern) chứ KHÔNG phải
 * `calendarDateToJulianDay` (JD thực của Meeus) — getGanzhiDay() yêu cầu đúng quy ước JDN.
 */
export function getGanzhiDayFromDate(year: number, month: number, day: number): GanzhiPillar {
  return getGanzhiDay(julianDayNumber(year, month, day));
}

export interface GanzhiHourOptions {
  /**
   * Quy ước "Tý cuối ngày" (Late/Early Zi Hour) — vấn đề còn nhiều trường phái Tứ Trụ
   * tranh luận, KHÔNG có đáp số thống nhất tuyệt đối, nên để tùy chọn thay vì áp đặt:
   *
   * - `false` (mặc định): toàn bộ khung giờ Tý (23:00-00:59) dùng chung Can của ngày dương
   *   lịch chứa chính thời khắc đó (quy ước đơn giản, phổ biến trong nhiều phần mềm).
   * - `true`: khung 23:00-23:59 ("Tý cuối ngày hôm trước") dùng Can của NGÀY HÔM SAU để
   *   tính Can giờ, theo trường phái cho rằng ngày Can Chi thực chất bắt đầu từ giờ Tý.
   */
  useLateZiConvention?: boolean;
}

/**
 * Can Chi của Giờ, từ Julian Day Number của ngày dương lịch (0h-23h59 cùng ngày) và giờ
 * trong ngày (0-23, giờ địa phương dân sự — đã quy đổi timezone từ trước khi gọi hàm này).
 */
export function getGanzhiHour(jdn: number, hour: number, options: GanzhiHourOptions = {}): GanzhiPillar {
  if (hour < 0 || hour > 23) throw new Error(`Giờ không hợp lệ: ${hour}`);

  // Địa Chi giờ: Tý=23h-0h59, Sửu=1h-2h59, ..., mỗi Chi phủ đúng 2 tiếng.
  const hourChiIndex = mod(Math.floor((hour + 1) / 2), 12);

  const useLateZi = options.useLateZiConvention ?? false;
  const effectiveJdn = useLateZi && hour === 23 ? jdn + 1 : jdn;
  const dayPillar = getGanzhiDay(effectiveJdn);

  // Quy tắc Ngũ Thử Độn Thời: Can của giờ Tý suy từ Can ngày.
  // Giáp/Kỷ->Giáp, Ất/Canh->Bính, Bính/Tân->Mậu, Đinh/Nhâm->Canh, Mậu/Quý->Nhâm.
  const hourCanAtTy = mod((dayPillar.canIndex % 5) * 2, 10);
  const hourCanIndex = mod(hourCanAtTy + hourChiIndex, 10);

  return buildPillar(hourCanIndex, hourChiIndex);
}
