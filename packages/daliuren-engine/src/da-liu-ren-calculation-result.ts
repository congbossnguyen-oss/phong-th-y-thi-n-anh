/**
 * Output của `calculateDaLiuRenChart` (Phase 9E) — CHỈ bao gồm những gì đã VERIFIED và
 * implement tới Phase 9D: Calendar Foundation, Nguyệt Tướng, Ngày/Đêm, Quý Nhân, Thiên Địa
 * Bàn, Tứ Khóa, Tam Truyền (qua Cửu Tông Môn), Thập Nhị Thiên Tướng.
 *
 * ⚠️ CỐ Ý KHÔNG dùng `Chart` (types/chart.ts) làm output — `Chart` còn đòi hỏi
 * keType/voidBranches/shenSha/wangShuai (課體/空亡/神煞/旺衰), TẤT CẢ đều CHƯA implement, cộng
 * benMing/xingNian (chỉ có khi có birthDate) — xem docs/daliuren/DA_LIU_REN_UNIQUE_VALUE_RESEARCH.md
 * mục 15 (quyết định B — specialized module, không vội mở rộng). KHÔNG được thêm field
 * giả/placeholder/undefined cho các phần chưa có — khi implement xong, tạo type MỚI thay thế,
 * KHÔNG mở rộng type này bằng field rỗng (đúng nguyên tắc đã áp dụng cho
 * `CalendarFoundationResult`, Phase 8).
 *
 * Type này là SUPERSET của `CalendarFoundationResult` (Phase 8) — cả 2 cùng tồn tại song song,
 * KHÔNG thay thế/xoá `calculateCalendarFoundation()` (facade nhỏ hơn, đã có API route thật sự
 * dùng — xem src/pages/api/dai-luc-nham.ts ở repo chính — không phá tương thích ngược).
 */
import type { CalendarData } from "./types/calendar-data.js";
import type { MonthGeneral } from "./types/month-general.js";
import type { DayNightDetermination } from "./types/day-night.js";
import type { NobleSpirit } from "./types/noble-spirit.js";
import type { HeavenEarthPlate } from "./types/plates.js";
import type { FourLessons } from "./types/four-lessons.js";
import type { ThreeTransmissions } from "./types/three-transmissions.js";
import type { TwelveGenerals } from "./types/twelve-generals.js";

/**
 * Truy vết đầy đủ output → provenance (chỉ id) — dùng cùng các provenance seed của từng module
 * (`month-general/provenance.ts`, `profiles/provenance-seed.ts`, `noble-spirit/provenance.ts`,
 * `heaven-earth-plate/provenance.ts`, `four-lessons/provenance.ts`,
 * `nine-methods/provenance.ts`, `three-transmissions/provenance.ts`,
 * `twelve-generals/provenance.ts`) để tra cứu đầy đủ source/confidence khi cần — KHÔNG lặp lại
 * toàn bộ `ProvenanceEntry` ở đây, và TUYỆT ĐỐI KHÔNG suy ra 1 confidence tổng hợp nào từ các
 * id này — mỗi id giữ NGUYÊN confidence riêng (A-D) của chính nó, tầng gọi tự tra khi cần.
 */
export interface DaLiuRenCalculationProvenance {
  monthGeneralProvenanceId: string;
  dayNightProvenanceId: string;
  /** Cặp vị trí Quý Nhân theo nhóm Can — confidence B, không đổi theo Can cụ thể. */
  nobleSpiritPairProvenanceId: string;
  /** Chiều 晝/夜 gán cho Can cụ thể — confidence B CHỈ cho Giáp, D cho 9 Can còn lại (xem
   * docs/daliuren/DA_LIU_REN_GUIREN_DAYNIGHT_AUDIT.md) — PHẢI giữ nguyên trạng, KHÔNG được che
   * giấu hay nâng cấp. `twelveGenerals` cũng phụ thuộc TRỰC TIẾP vào chính id này (anchor được
   * suy ra từ `nobleSpirit.zhi`) — cùng 1 id, không tạo bản sao riêng cho twelveGenerals. */
  nobleSpiritDayNightAssignmentProvenanceId: string;
  heavenEarthPlateProvenanceId: string;
  fourLessonsProvenanceId: string;
  /** → provenance của CHÍNH pháp 九宗門 đã chọn Sơ truyền (賊克/比用/涉害/遙克/昴星/別責/八專/返吟) — confidence khác nhau tuỳ pháp, xem `threeTransmissions.method` để biết pháp nào. */
  threeTransmissionsInitialProvenanceId: string;
  /** CHỈ có mặt khi Trung/Mạt truyền qua chuỗi tra chuẩn (TYPE A) — VẮNG MẶT với TYPE B (別責/八專/返吟-vô-賊克), đúng hành vi `ThreeTransmissionsComputation.chainProvenanceId` gốc. */
  threeTransmissionsChainProvenanceId?: string;
  twelveGeneralsOrderProvenanceId: string;
  twelveGeneralsAnchorProvenanceId: string;
  twelveGeneralsDirectionProvenanceId: string;
}

export interface DaLiuRenCalculationResult {
  calendar: CalendarData;
  monthGeneral: MonthGeneral;
  dayNight: DayNightDetermination;
  nobleSpirit: NobleSpirit;
  heavenEarthPlate: HeavenEarthPlate;
  fourLessons: FourLessons;
  threeTransmissions: ThreeTransmissions;
  twelveGenerals: TwelveGenerals;
  provenance: DaLiuRenCalculationProvenance;
}
