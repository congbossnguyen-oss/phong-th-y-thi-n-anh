import { describe, expect, it } from "vitest";
import { normalizeChartInstant } from "../../../src/calendar/input.js";
import { CalendarFoundationError } from "../../../src/calendar/errors.js";
import type { ChartInput } from "../../../src/types/chart.js";

/** Helper: gọi `normalizeChartInstant` và khẳng định đúng `CalendarFoundationErrorCode`. */
function expectCode(input: ChartInput, code: string): void {
  try {
    normalizeChartInstant(input);
    expect.fail(`Kỳ vọng ném CalendarFoundationError(${code}) nhưng không có lỗi nào được ném.`);
  } catch (error) {
    expect(error).toBeInstanceOf(CalendarFoundationError);
    expect((error as CalendarFoundationError).code).toBe(code);
  }
}

const VALID: ChartInput = { date: "2024-01-01", hour: 10, timeZone: "Asia/Ho_Chi_Minh" };

describe("daliuren-engine/calendar/input — normalizeChartInstant", () => {
  it("input hợp lệ chuẩn hóa đúng 3 khái niệm tách biệt: local date/hour, timeZone, utcInstant", () => {
    const normalized = normalizeChartInstant(VALID);
    expect(normalized.localDate).toEqual({ year: 2024, month: 1, day: 1 });
    expect(normalized.localHour).toBe(10);
    expect(normalized.localMinute).toBe(0);
    expect(normalized.timeZone).toBe("Asia/Ho_Chi_Minh");
    // MATHEMATICAL TEST: Asia/Ho_Chi_Minh là UTC+7 CỐ ĐỊNH quanh năm (không DST) — một sự
    // thật lịch pháp độc lập, không phải suy ra từ chạy chính implementation.
    expect(normalized.utcInstant.toISOString()).toBe("2024-01-01T03:00:00.000Z");
  });

  it("MISSING_REQUIRED_FIELD: thiếu date", () => {
    expectCode({ ...VALID, date: undefined as unknown as string }, "MISSING_REQUIRED_FIELD");
  });

  it("MISSING_REQUIRED_FIELD: thiếu hour", () => {
    expectCode({ ...VALID, hour: undefined as unknown as number }, "MISSING_REQUIRED_FIELD");
  });

  it("MISSING_TIMEZONE: timeZone undefined — KHÔNG được âm thầm dùng múi giờ máy chủ hay UTC (lỗ hổng Intl.DateTimeFormat đã phát hiện Phase 5B-1)", () => {
    expectCode({ ...VALID, timeZone: undefined as unknown as string }, "MISSING_TIMEZONE");
  });

  it("MISSING_TIMEZONE: timeZone null", () => {
    expectCode({ ...VALID, timeZone: null as unknown as string }, "MISSING_TIMEZONE");
  });

  it("MISSING_TIMEZONE: timeZone rỗng", () => {
    expectCode({ ...VALID, timeZone: "" }, "MISSING_TIMEZONE");
  });

  it("INVALID_DATETIME_INPUT: timeZone không phải tên IANA hợp lệ", () => {
    expectCode({ ...VALID, timeZone: "Not/ARealZone" }, "INVALID_DATETIME_INPUT");
  });

  it("INVALID_DATE_FORMAT: date không đúng YYYY-MM-DD", () => {
    expectCode({ ...VALID, date: "01/01/2024" }, "INVALID_DATE_FORMAT");
  });

  it("INVALID_DATETIME_INPUT: ngày ảo không tồn tại (30/2)", () => {
    expectCode({ ...VALID, date: "2024-02-30" }, "INVALID_DATETIME_INPUT");
  });

  it("INVALID_DATETIME_INPUT: hour ngoài phạm vi 0-23", () => {
    expectCode({ ...VALID, hour: 24 }, "INVALID_DATETIME_INPUT");
  });

  it("INVALID_DATETIME_INPUT: minute ngoài phạm vi 0-59", () => {
    expectCode({ ...VALID, minute: 60 }, "INVALID_DATETIME_INPUT");
  });

  it("deterministic: chuẩn hóa cùng 1 input nhiều lần cho cùng utcInstant (không phụ thuộc machine timezone/locale/thời điểm chạy)", () => {
    const a = normalizeChartInstant(VALID);
    const b = normalizeChartInstant(VALID);
    expect(a.utcInstant.getTime()).toBe(b.utcInstant.getTime());
    expect(a.toDateTimeInput()).toEqual(b.toDateTimeInput());
  });
});
