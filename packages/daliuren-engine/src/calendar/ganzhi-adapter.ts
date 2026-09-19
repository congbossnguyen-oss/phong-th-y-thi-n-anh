/**
 * Adapter GanZhi: bọc `@thien-anh/calendar-core` (nguồn Can Chi DUY NHẤT của dự án) và áp
 * dụng `CalculationProfile.ziHourDayBoundary` — KHÔNG viết lại thuật toán Can Chi (Phase
 * 5B-1 mục "GanZhi": "Không viết lại Can/Chi algorithm nếu calendar-core đã có").
 *
 * Ranh giới Tý ảnh hưởng CẢ trụ Ngày lẫn Can trụ Giờ theo CÙNG MỘT quyết định "ngày nào cầm
 * quyền" — nên cả hai được tính từ CÙNG một `resolveGoverningDateTimeInput()` để tránh trụ
 * Ngày và Can trụ Giờ ngầm dùng 2 "ngày" khác nhau (một lỗi tinh vi nếu tách rời 2 lệnh gọi).
 */
import { getGanzhiDay, getGanzhiHour, getGanzhiMonth, getGanzhiYear, type DateTimeInput } from "@thien-anh/calendar-core";
import type { CanChiPillar } from "../types/ganzhi.js";
import type { CalculationProfile, ZiHourDayBoundaryPolicy } from "../profiles/types.js";
import { CalendarFoundationError } from "./errors.js";

export interface GanzhiPillars {
  yearPillar: CanChiPillar;
  monthPillar: CanChiPillar;
  dayPillar: CanChiPillar;
  hourPillar: CanChiPillar;
}

/** Cộng/trừ ngày dương lịch THUẦN THEO LỊCH (không đụng giờ/timezone) — dùng UTC-trưa làm trục trung tính để không lệch DST. */
function addCalendarDays(
  date: { year: number; month: number; day: number },
  deltaDays: number,
): { year: number; month: number; day: number } {
  const noonUtc = Date.UTC(date.year, date.month - 1, date.day + deltaDays, 12, 0, 0);
  const shifted = new Date(noonUtc);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

/**
 * Xác định "ngày dương lịch cầm quyền" cho CẢ trụ Ngày lẫn Can trụ Giờ, theo
 * `ZiHourDayBoundaryPolicy` — đây LÀ nơi 3 trường phái CONFLICTING (Phase 4 Phần A, xem
 * docs/daliuren/DA_LIU_REN_PROFILE_DECISIONS.md) rẽ nhánh:
 *
 * - `no-shift`: không dịch chuyển gì — khớp hành vi mặc định hiện tại của calendar-core.
 * - `shift-both-halves`: cả nửa Tý sớm (00:00-00:59) LẪN nửa Tý muộn (23:00-23:59) đều
 *   thuộc về ngày dương lịch KẾ TIẾP.
 * - `shift-late-half-only`: CHỈ nửa Tý muộn (23:00-23:59) thuộc ngày kế tiếp; nửa Tý sớm vẫn
 *   thuộc ngày hiện tại (quy ước "ngày Can Chi bắt đầu từ giờ Tý muộn"). LƯU Ý: đây KHÁC với
 *   cách `calendar-core` áp dụng `useLateZiConvention` — flag đó CHỈ dịch Can của trụ Giờ,
 *   KHÔNG dịch trụ Ngày (xác nhận qua đọc trực tiếp calendar/ganzhi.ts, Phase 4 Phần A). Vì
 *   vậy KHÔNG được truyền `useLateZiConvention: true` thẳng vào calendar-core ở đây — ta tự
 *   dịch ngày trước, rồi luôn gọi calendar-core với `useLateZiConvention: false` để tránh
 *   dịch 2 lần.
 */
function resolveGoverningDateTimeInput(input: DateTimeInput, policy: ZiHourDayBoundaryPolicy): DateTimeInput {
  const hour = input.hour ?? 0;

  let deltaDays: number;
  switch (policy) {
    case "no-shift":
      deltaDays = 0;
      break;
    case "shift-both-halves":
      deltaDays = hour === 23 || hour === 0 ? 1 : 0;
      break;
    case "shift-late-half-only":
      deltaDays = hour === 23 ? 1 : 0;
      break;
    default: {
      const exhaustive: never = policy;
      throw new CalendarFoundationError(
        "UNSUPPORTED_ZI_HOUR_POLICY",
        `Chính sách ranh giới Tý không được hỗ trợ: ${String(exhaustive)}.`,
      );
    }
  }

  if (deltaDays === 0) return input;

  return { ...input, ...addCalendarDays(input, deltaDays) };
}

/**
 * 4 trụ Can Chi (Năm/Tháng/Ngày/Giờ) theo `CalculationProfile` đã cho.
 *
 * Năm/Tháng KHÔNG bị ảnh hưởng bởi `ziHourDayBoundary` — ranh giới của chúng là tiết khí
 * liên tục theo kinh độ mặt trời thực (Lập Xuân/12 Tiết), không liên quan câu hỏi "giờ Tý
 * thuộc ngày dương lịch nào". Chỉ trụ Ngày và Can trụ Giờ cần `resolveGoverningDateTimeInput`.
 */
export function computeGanzhiPillars(input: DateTimeInput, profile: CalculationProfile): GanzhiPillars {
  const policy = profile.ziHourDayBoundary.value;
  const governingInput = resolveGoverningDateTimeInput(input, policy);

  const yearPillar = getGanzhiYear(input);
  const monthPillar = getGanzhiMonth(input);
  const dayPillar = getGanzhiDay(governingInput);
  // useLateZiConvention: false — việc dịch ngày (nếu có theo policy) ĐÃ xảy ra ở `governingInput`;
  // để calendar-core tự dịch thêm lần nữa sẽ dịch SAI 2 lần cho policy `shift-late-half-only`.
  const hourPillar = getGanzhiHour(governingInput, { useLateZiConvention: false });

  return { yearPillar, monthPillar, dayPillar, hourPillar };
}
