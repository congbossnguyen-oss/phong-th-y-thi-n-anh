/**
 * Domain types — Phase 1 (Core Foundation) của Astrology Module.
 * Đúng `docs/astrology-module/ARCHITECTURE/DOMAIN_MODEL.md` §1 (BirthData) và §3
 * (AstronomicalProvider — xem `astronomical/AstronomicalProvider.ts`).
 *
 * KHÔNG có business logic chiêm tinh ở đây (không sign, không house-meaning, không dignity).
 * Đây thuần là kiểu dữ liệu.
 */

/**
 * Ngày dương lịch (proleptic Gregorian). Cố ý KHÔNG import `CalendarDate` từ
 * `@thien-anh/calendar-core` dù shape giống hệt: type đó dùng nội bộ trong `.d.ts` đã build
 * của calendar-core (vd. làm kiểu trả về của `getSolarDateFromLunar`) nhưng KHÔNG được
 * `export type` theo tên ở biên công khai của package đó — `tsc` xác nhận không import được
 * theo tên (`has no exported member named 'CalendarDate'`). Vì đây là package
 * `calendar-core` dùng chung cho nhiều Engine khác đang chạy production, Phase 1 của
 * Astrology Module KHÔNG được phép sửa biên xuất của nó chỉ để tiện cho mình — định nghĩa
 * type tương thích cấu trúc riêng ở đây là lựa chọn an toàn hơn (TypeScript structural typing
 * vẫn đảm bảo tương thích 2 chiều với bất kỳ chỗ nào trong calendar-core dùng shape này).
 */
export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

/** Giờ "treo tường" (wall-clock) tại nơi sinh — CHƯA quy đổi UTC. */
export interface LocalTime {
  hour: number; // 0-23
  minute: number; // 0-59
  second?: number; // 0-59.999..., mặc định 0 nếu bỏ trống
}

/**
 * Input thô của người dùng. `timezoneId` BẮT BUỘC là tên IANA (vd. "Asia/Ho_Chi_Minh"),
 * KHÔNG được là offset số cứng (vd. "+7") — offset cứng không thể biểu diễn lịch sử DST/đổi
 * múi giờ (xem ARCHITECTURE_FREEZE.md mục 4.3 và ADR-010).
 */
export interface BirthData {
  date: CalendarDate;
  /**
   * `null` = không rõ giờ sinh — một trạng thái hợp lệ, không phải lỗi. Hệ quả tính toán
   * (không có house/ASC/MC) được quyết định ở Chart Calculation (Phase 3), KHÔNG xử lý ở đây.
   */
  localTime: LocalTime | null;
  timezoneId: string;
  latitude: number; // độ, -90..90
  longitude: number; // độ, -180..180
  /** Mét trên mực nước biển — tuỳ chọn, dùng cho tinh chỉnh topocentric ở Phase 3+. */
  altitudeMeters?: number;
  /** Nhãn hiển thị (vd. "Hà Nội, Việt Nam") — CHỈ để hiển thị, KHÔNG BAO GIỜ dùng trong tính toán. */
  locationLabel?: string;
  /** Độ bất định của giờ sinh (phút) — lan truyền như tín hiệu độ tin cậy, CHƯA dùng ở Phase 1. */
  timeUncertaintyMinutes?: number;
}
