/**
 * Month General (月將 Nguyệt Tướng) — Phase 5B-2. Thuật toán: Algorithm Spec §2 ("đổi tại
 * TRUNG KHÍ, không phải đầu tháng âm lịch, không phải tiết"), input = `CalendarData` đã dựng
 * ở Calendar Foundation (Phase 5B-1) — KHÔNG tính lại tiết khí ở đây, chỉ TRA BẢNG từ
 * `CalendarData.precedingMajorTerm` (đã đúng "trung khí gần nhất trước hoặc bằng thời điểm
 * chiêm", kể cả case rơi đúng khoảnh khắc chuyển — xem calendar/solar-terms.ts).
 *
 * ⚠️ ARCHITECTURE DECISION — KHÔNG nhận tham số `CalculationProfile`: 3 quyết định hiện có
 * trong profile (`ziHourDayBoundary`, `dayNightBoundary`, `guiRenMappingTable`) đều KHÔNG ảnh
 * hưởng tới việc "trung khí nào vừa qua" — `ziHourDayBoundary` chỉ tác động trụ Ngày/Giờ (xem
 * calendar/ganzhi-adapter.ts), còn 2 quyết định kia không liên quan tiết khí. Thêm tham số
 * `profile` mà không dùng field nào của nó sẽ là DEPENDENCY GIẢ — bị cấm tường minh ở Phase
 * 5B-2 mục "PROFILE". Nếu về sau phát sinh 1 quyết định profile thật sự ảnh hưởng Nguyệt
 * Tướng (built-in "cải" nào đó), thêm tham số lúc đó — không thêm trước.
 */
import type { CalendarData, SolarTerm } from "../types/calendar-data.js";
import type { MonthGeneral } from "../types/month-general.js";
import { MONTH_GENERAL_TABLE } from "./table.js";
import { MONTH_GENERAL_TABLE_PROVENANCE } from "./provenance.js";
import { MonthGeneralError } from "./errors.js";

export interface MonthGeneralComputation {
  monthGeneral: MonthGeneral;
  /**
   * Trung khí đã KÍCH HOẠT Nguyệt Tướng này — phơi bày tường minh "preceding relevant major
   * solar term" + "boundary instant" (`occurredAt`) thay vì để tầng gọi phải đoán ngược từ
   * `monthGeneral.classicalName` (đúng bài học audit repo C, xem DA_LIU_REN_ARCHITECTURE.md §3:
   * "không bao giờ chỉ trả về 1 chuỗi tên để tầng sau phải đoán ngược").
   */
  triggeringMajorTerm: SolarTerm;
  /** → ProvenanceEntry.id (month-general/provenance.ts) — truy vết MonthGeneral → rule → source → confidence. */
  provenanceId: string;
}

/**
 * Tính Nguyệt Tướng từ `CalendarData` đã dựng (Phase 5B-1). KHÔNG hard-code theo số tháng
 * dương lịch — tra bảng THEO ĐÚNG TRUNG KHÍ đã tính bằng mốc thời gian thực (nameHan), giống
 * cách làm được audit là "kỹ nhất" (repo C dùng tyme lib real-time, KHÔNG dùng bảng tra tiết
 * khí tĩnh — xem docs/daliuren/DA_LIU_REN_ALGORITHM_AUDIT.md dòng "Nguyệt tướng").
 *
 * NO HIDDEN FALLBACK: nếu `calendarData.precedingMajorTerm` không phải trung khí hợp lệ (dữ
 * liệu tới từ nguồn khác `computeCalendarData`, vd JSON deserialize hỏng), ném lỗi tường minh
 * — KHÔNG đoán/chọn đại 1 Nguyệt Tướng mặc định.
 */
export function computeMonthGeneral(calendarData: CalendarData): MonthGeneralComputation {
  const term = calendarData.precedingMajorTerm;

  if (term.kind !== "trungKhi") {
    throw new MonthGeneralError(
      "INVALID_PRECEDING_TERM",
      `precedingMajorTerm phải là trung khí (kind="trungKhi") để suy Nguyệt Tướng — nhận được kind="${term.kind}" (${term.nameHan}). Nguyệt Tướng đổi tại trung khí, KHÔNG phải tiết (Algorithm Spec §2).`,
    );
  }

  const entry = MONTH_GENERAL_TABLE[term.nameHan];
  if (!entry) {
    throw new MonthGeneralError(
      "UNKNOWN_MAJOR_TERM",
      `Không nhận diện được trung khí "${term.nameHan}" trong bảng 12 Nguyệt Tướng (Algorithm Spec §2) — thiếu dữ liệu, không tự chọn giá trị gần đúng.`,
    );
  }

  return {
    monthGeneral: { zhi: entry.zhi, classicalName: entry.classicalName },
    triggeringMajorTerm: term,
    provenanceId: MONTH_GENERAL_TABLE_PROVENANCE.id,
  };
}
