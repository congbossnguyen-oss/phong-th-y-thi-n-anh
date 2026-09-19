/**
 * Output tối thiểu của `calculateCalendarFoundation` (Phase 8B, CONG TAIYI v0.1 MVP) — CHỈ
 * bao gồm những gì đã VERIFIED và implement tới Phase 5B-3/5B-3S: Calendar Foundation, Nguyệt
 * Tướng, Ngày/Đêm, Quý Nhân.
 *
 * ⚠️ CỐ Ý KHÔNG dùng `Chart` (types/chart.ts) làm output — `Chart` đòi hỏi
 * threeTransmissions/twelveGenerals/keType/voidBranches/shenSha/wangShuai, TẤT CẢ đều CHƯA
 * implement (xem docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md,
 * docs/daliuren/DA_LIU_REN_UNIQUE_VALUE_RESEARCH.md mục 15 — quyết định B, specialized module,
 * KHÔNG vội mở rộng 三傳/九宗門/十二天將/課體 khi chưa có yêu cầu sản phẩm cụ thể). KHÔNG được
 * thêm field giả/placeholder/undefined cho các phần chưa có — khi implement xong các phần đó,
 * tạo type MỚI thay thế, KHÔNG mở rộng type này bằng field rỗng.
 *
 * CẬP NHẬT (Phase 9A): `heavenEarthPlate`/`fourLessons` NAY ĐÃ implement
 * (`heaven-earth-plate/`, `four-lessons/`) nhưng CỐ Ý CHƯA nối vào `CalendarFoundationResult`
 * này — quyết định có cần 1 facade/result type mới bao gồm chúng hay không thuộc phạm vi phase
 * sau (xem tests/unit/heaven-earth-plate/, tests/unit/four-lessons/ để dùng trực tiếp
 * `computeHeavenEarthPlate`/`computeFourLessons` mà không qua facade).
 */
import type { CalendarData } from "./types/calendar-data.js";
import type { MonthGeneral } from "./types/month-general.js";
import type { DayNightDetermination } from "./types/day-night.js";
import type { NobleSpirit } from "./types/noble-spirit.js";

/**
 * Truy vết tối thiểu output → provenance (chỉ id) — dùng cùng `interpretation/provenance.ts`
 * và các seed provenance của từng module (`month-general/provenance.ts`,
 * `profiles/provenance-seed.ts`, `noble-spirit/provenance.ts`) để tra cứu đầy đủ
 * source/confidence khi cần, KHÔNG lặp lại toàn bộ `ProvenanceEntry` ở đây.
 */
export interface CalendarFoundationProvenance {
  monthGeneralProvenanceId: string;
  dayNightProvenanceId: string;
  /** Cặp vị trí Quý Nhân theo nhóm Can — confidence B, không đổi. */
  nobleSpiritPairProvenanceId: string;
  /** Chiều 晝/夜 gán cho Can cụ thể — confidence B CHỈ cho Giáp, D cho 9 Can còn lại (xem
   * docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md) — package KHÔNG tự nâng confidence này,
   * chỉ trả đúng id để tầng gọi tự tra cứu confidence thật nếu cần hiển thị cảnh báo. */
  nobleSpiritDayNightAssignmentProvenanceId: string;
}

export interface CalendarFoundationResult {
  calendar: CalendarData;
  monthGeneral: MonthGeneral;
  dayNight: DayNightDetermination;
  nobleSpirit: NobleSpirit;
  provenance: CalendarFoundationProvenance;
}
