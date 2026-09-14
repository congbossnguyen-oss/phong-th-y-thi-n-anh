/**
 * CANONICAL BIRTH DATE (V3-07B, Phase B) — biểu diễn chuẩn DUY NHẤT cho "ngày sinh" trong hệ thống.
 *
 * Mục tiêu kiến trúc (V306_CANONICAL_BIRTH_DATE_MODEL.md):
 *   - GIỮ nguyên input gốc (năm, và ngày/giờ nếu có) + timezone — không mất thông tin.
 *   - KHÔNG lưu sẵn nhiều "số năm" trùng lặp. BirthDate chỉ là DỮ KIỆN gốc; các quy ước năm
 *     (Gregorian / Ganzhi-1/1 / Lập Xuân / Tết) được DẪN XUẤT khi cần qua `resolveYearContext`.
 *   - Ghi rõ ĐỘ CHÍNH XÁC (`precision`): nhiều tính năng (Trạch Nhật, Hợp Tuổi...) chỉ có năm sinh,
 *     không có ngày/tháng — kiến trúc phải PHÂN BIỆT rõ "chỉ biết năm" với "biết đủ ngày", để KHÔNG
 *     bao giờ âm thầm bịa ra 1/1 rồi áp 1 quy ước phụ thuộc ngày (Lập Xuân/Tết) lên đó.
 *
 * NGUYÊN TẮC TRUNG LẬP: file này (và toàn bộ calendar-core) KHÔNG biết "phương pháp nào cần quy ước
 * năm nào". Nó chỉ mô tả 1 dữ kiện lịch. Quyết định "method X cần convention Y" nằm ở TẦNG PHƯƠNG
 * PHÁP (application/rule-engine), qua MethodYearContract.
 *
 * Đại lịch nguồn sự thật DUY NHẤT là DƯƠNG LỊCH: mọi field ngày/tháng/năm trong BirthDate là Dương
 * lịch. Nếu input gốc của khách là Âm lịch, tầng gọi phải quy đổi sang Dương lịch TRƯỚC khi dựng
 * BirthDate (và có thể ghi `originalCalendar: "lunar"` để truy vết provenance) — không lưu song song
 * 2 "ngày gốc" khác lịch.
 */

/** Lịch gốc mà input của khách được khai — chỉ để TRUY VẾT provenance; field ngày/tháng/năm luôn là Dương lịch. */
export type OriginalCalendar = "gregorian" | "lunar";

/**
 * Độ chính xác của BirthDate:
 *   - "year"     : chỉ biết năm sinh (Dương lịch). KHÔNG đủ cho quy ước phụ thuộc ngày (Lập Xuân/Tết).
 *   - "date"     : biết năm + tháng + ngày.
 *   - "datetime" : biết thêm giờ (và phút).
 */
export type BirthDatePrecision = "year" | "date" | "datetime";

/**
 * Biểu diễn chuẩn của ngày sinh. Bất biến (readonly). Dựng qua các constructor bên dưới, không tự
 * tạo object thô để đảm bảo `precision` luôn nhất quán với các field có mặt.
 */
export interface BirthDate {
  /** Năm Dương lịch. */
  readonly gregorianYear: number;
  /** Tháng Dương lịch 1-12, hoặc null khi chỉ biết năm. */
  readonly gregorianMonth: number | null;
  /** Ngày Dương lịch 1-31, hoặc null khi chỉ biết năm. */
  readonly gregorianDay: number | null;
  /** Giờ 0-23, hoặc null khi không biết giờ. */
  readonly hour: number | null;
  /** Phút 0-59, hoặc null. */
  readonly minute: number | null;
  /** Múi giờ IANA (vd "Asia/Ho_Chi_Minh"). Luôn tường minh — không hard-code rải rác nơi khác. */
  readonly timeZone: string;
  readonly precision: BirthDatePrecision;
  /** Provenance tùy chọn: lịch gốc của input trước khi quy đổi về Dương lịch. */
  readonly originalCalendar?: OriginalCalendar;
}

/** Lỗi input BirthDate không hợp lệ. */
export class InvalidBirthDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBirthDateError";
  }
}

function assertIntInRange(value: number, min: number, max: number, label: string): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new InvalidBirthDateError(`${label} không hợp lệ: ${value} (cần số nguyên trong [${min}, ${max}]).`);
  }
}

function assertTimeZone(timeZone: string): void {
  if (typeof timeZone !== "string" || timeZone.length === 0) {
    throw new InvalidBirthDateError(`Múi giờ (timeZone) bắt buộc và phải là chuỗi IANA, nhận: ${JSON.stringify(timeZone)}.`);
  }
}

/**
 * Dựng BirthDate CHỈ TỪ NĂM SINH Dương lịch (precision = "year").
 * Dùng cho Trạch Nhật, Hợp Tuổi, và mọi tính năng người dùng chỉ nhập năm.
 */
export function birthDateFromGregorianYear(
  gregorianYear: number,
  timeZone: string,
  options: { originalCalendar?: OriginalCalendar } = {},
): BirthDate {
  if (!Number.isInteger(gregorianYear) || gregorianYear < 1) {
    throw new InvalidBirthDateError(`Năm sinh không hợp lệ: ${gregorianYear} (cần số nguyên ≥ 1).`);
  }
  assertTimeZone(timeZone);
  return {
    gregorianYear,
    gregorianMonth: null,
    gregorianDay: null,
    hour: null,
    minute: null,
    timeZone,
    precision: "year",
    ...(options.originalCalendar ? { originalCalendar: options.originalCalendar } : {}),
  };
}

/**
 * Dựng BirthDate từ ngày sinh Dương lịch đầy đủ (và tùy chọn giờ/phút).
 * precision = "datetime" nếu có `hour`, ngược lại "date".
 */
export function birthDateFromGregorian(
  input: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    timeZone: string;
    originalCalendar?: OriginalCalendar;
  },
): BirthDate {
  if (!Number.isInteger(input.year) || input.year < 1) {
    throw new InvalidBirthDateError(`Năm sinh không hợp lệ: ${input.year} (cần số nguyên ≥ 1).`);
  }
  assertIntInRange(input.month, 1, 12, "Tháng");
  assertIntInRange(input.day, 1, 31, "Ngày");
  assertTimeZone(input.timeZone);
  const hasHour = input.hour !== undefined;
  if (hasHour) assertIntInRange(input.hour as number, 0, 23, "Giờ");
  if (input.minute !== undefined) assertIntInRange(input.minute, 0, 59, "Phút");
  return {
    gregorianYear: input.year,
    gregorianMonth: input.month,
    gregorianDay: input.day,
    hour: hasHour ? (input.hour as number) : null,
    minute: input.minute ?? null,
    timeZone: input.timeZone,
    precision: hasHour ? "datetime" : "date",
    ...(input.originalCalendar ? { originalCalendar: input.originalCalendar } : {}),
  };
}

/** true nếu BirthDate biết đủ ngày/tháng (precision "date" hoặc "datetime"). */
export function hasCalendarDate(birthDate: BirthDate): boolean {
  return birthDate.precision === "date" || birthDate.precision === "datetime";
}
