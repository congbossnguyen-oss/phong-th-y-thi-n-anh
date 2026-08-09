/**
 * Xử lý múi giờ dựa trên cơ sở dữ liệu IANA Time Zone (tzdata) đã đóng gói sẵn trong
 * runtime JavaScript (ICU) — KHÔNG gọi mạng, KHÔNG dùng bảng offset tự viết tay (vốn sẽ
 * sai với các múi giờ có giờ mùa hè DST hoặc từng đổi offset trong lịch sử).
 *
 * Cơ chế: mọi runtime JS hiện đại (Node.js ≥ 14, mọi trình duyệt hiện đại) đều nhúng sẵn
 * dữ liệu ICU/tzdata đầy đủ và dùng nó cho `Intl.DateTimeFormat`. Việc đọc offset qua
 * `Intl` vì vậy là xác định (deterministic) và hoạt động hoàn toàn offline.
 */

export interface WallClockDateTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Kiểm tra một chuỗi có phải tên IANA time zone hợp lệ theo dữ liệu ICU của runtime hay không. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset UTC (phút, dương nếu múi giờ đi trước UTC — vd. Asia/Ho_Chi_Minh = +420) của một
 * múi giờ IANA tại một thời điểm UTC cụ thể. Tự động xử lý đúng giờ mùa hè (DST) vì offset
 * phụ thuộc thời điểm, không phải hằng số theo múi giờ.
 */
export function getUtcOffsetMinutes(timeZone: string, instantUtc: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(instantUtc).reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  // "24" đôi khi xuất hiện thay vì "00" ở một số runtime khi hourCycle=h23 tại nửa đêm.
  const hour = parts.hour === "24" ? 0 : Number(parts.hour);

  const asUtcIfWallClockWereUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUtcIfWallClockWereUtc - instantUtc.getTime()) / 60000;
}

/**
 * Chuyển một thời điểm "giờ treo tường" (wall-clock) tại một múi giờ IANA thành `Date` UTC
 * chính xác. Dùng phương pháp 2 bước hội tụ (giống cách date-fns-tz/luxon xử lý nội bộ):
 * ước lượng offset bằng UTC thô, áp dụng, rồi kiểm tra lại vì offset có thể đổi ngay tại
 * thời điểm chuyển DST.
 */
export function zonedTimeToUtc(local: WallClockDateTime, timeZone: string): Date {
  const naiveUtcMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );

  let offsetMinutes = getUtcOffsetMinutes(timeZone, new Date(naiveUtcMs));
  let candidateMs = naiveUtcMs - offsetMinutes * 60000;

  // Bước hội tụ thứ hai: offset tính lại tại thời điểm UTC ứng viên có thể khác bước đầu
  // (xảy ra gần ranh giới chuyển giờ mùa hè). Một lần lặp lại là đủ trong tuyệt đại đa số
  // trường hợp vì offset chỉ đổi tối đa 1-2 giờ quanh mốc chuyển DST.
  const refinedOffset = getUtcOffsetMinutes(timeZone, new Date(candidateMs));
  if (refinedOffset !== offsetMinutes) {
    offsetMinutes = refinedOffset;
    candidateMs = naiveUtcMs - offsetMinutes * 60000;
  }

  return new Date(candidateMs);
}

/** Chuyển một thời điểm UTC (`Date`) thành giờ treo tường tại một múi giờ IANA. */
export function utcToZonedTime(instantUtc: Date, timeZone: string): WallClockDateTime {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(instantUtc).reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const hour = parts.hour === "24" ? 0 : Number(parts.hour);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/**
 * Offset UTC hiện hành (giờ, có thể lẻ như +5.5, +5.75) của một múi giờ IANA tại thời
 * điểm "giờ treo tường" cho trước — tiện dùng khi cần con số `utcOffsetHours` truyền vào
 * astronomy/julianDay.ts (`dateTimeToJulianDay`).
 */
export function getUtcOffsetHoursForLocalTime(local: WallClockDateTime, timeZone: string): number {
  const utcInstant = zonedTimeToUtc(local, timeZone);
  return getUtcOffsetMinutes(timeZone, utcInstant) / 60;
}
