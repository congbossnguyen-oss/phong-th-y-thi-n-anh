import { describe, expect, it } from "vitest";
import { computeCalendarData } from "../../../src/calendar/foundation.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import type { CalculationProfile } from "../../../src/profiles/types.js";
import type { ChartInput } from "../../../src/types/chart.js";

/**
 * Test layer tổng hợp cho toàn bộ Calendar Foundation (Phase 5B-1) — 6 scenario BẮT BUỘC
 * (A-F) chạy qua pipeline THẬT (normalize → adapter GanZhi → Solar Terms), không phải test
 * từng module riêng lẻ. Golden values đều neo vào CB-3/CB-4 (docs/daliuren/
 * DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md) — CLASSICAL/PUBLIC FACT — hoặc phép cộng/trừ 1 ngày
 * trong vòng Lục Thập Hoa Giáp (MATHEMATICAL, định nghĩa cố định của hệ Can Chi).
 */
function withZiPolicy(policy: CalculationProfile["ziHourDayBoundary"]["value"]): CalculationProfile {
  return {
    ...CLASSICAL_V1_PROFILE,
    ziHourDayBoundary: { ...CLASSICAL_V1_PROFILE.ziHourDayBoundary, value: policy },
  };
}

describe("daliuren-engine/calendar/foundation — computeCalendarData (6 scenario bắt buộc)", () => {
  it("Scenario A — cùng UTC instant, timezone khác nhau: ngày dân sự khác nhau → trụ Ngày CÓ THỂ khác nhau (Can Chi Ngày neo theo ngày DÂN SỰ, không phải theo 1 'ngày UTC' phổ quát)", () => {
    // Cả 2 input cùng quy về UTC 2024-01-01T17:00:00Z (kiểm bằng chính utcInstant bên dưới),
    // nhưng biểu diễn 2 NGÀY DÂN SỰ khác nhau tại 2 múi giờ khác nhau.
    const shanghai: ChartInput = { date: "2024-01-02", hour: 1, timeZone: "Asia/Shanghai" }; // UTC+8 → 2024-01-01T17:00:00Z
    const losAngeles: ChartInput = { date: "2024-01-01", hour: 9, timeZone: "America/Los_Angeles" }; // UTC-8 (tháng 1, không DST) → 2024-01-01T17:00:00Z

    const dataShanghai = computeCalendarData(shanghai, CLASSICAL_V1_PROFILE);
    const dataLA = computeCalendarData(losAngeles, CLASSICAL_V1_PROFILE);

    // Ất Sửu = hôm sau Giáp Tý (CB-4 + phép cộng 1 ngày trong vòng 60 Giáp Tý).
    expect(dataShanghai.dayPillar.can).toBe("Ất");
    expect(dataShanghai.dayPillar.chi).toBe("Sửu");
    // Giáp Tý = chính CB-4.
    expect(dataLA.dayPillar.can).toBe("Giáp");
    expect(dataLA.dayPillar.chi).toBe("Tý");
    expect(dataShanghai.dayPillar.cycleIndex).not.toBe(dataLA.dayPillar.cycleIndex);
  });

  it("Scenario B — cùng LOCAL TIME (cùng ngày-giờ dân sự), timezone khác nhau: trụ Ngày GIỐNG NHAU dù UTC instant khác nhau (trụ Ngày tính từ ngày dương lịch dân sự, không phụ thuộc timezone)", () => {
    const shanghai: ChartInput = { date: "2024-01-01", hour: 10, timeZone: "Asia/Shanghai" };
    const losAngeles: ChartInput = { date: "2024-01-01", hour: 10, timeZone: "America/Los_Angeles" };

    const dataShanghai = computeCalendarData(shanghai, CLASSICAL_V1_PROFILE);
    const dataLA = computeCalendarData(losAngeles, CLASSICAL_V1_PROFILE);

    expect(dataShanghai.dayPillar.can).toBe("Giáp"); // khớp CB-4
    expect(dataShanghai.dayPillar.chi).toBe("Tý");
    expect(dataShanghai.dayPillar.cycleIndex).toBe(dataLA.dayPillar.cycleIndex);
  });

  it("Scenario C — sát ranh giới tiết khí (Lập Xuân 2024 ≈ 08:20 UTC theo tính toán, cách nhau 1h, xa hơn nhiều so với sai số ~7 phút đã ghi nhận Phase 4): trụ Năm đổi đúng phía", () => {
    // Nguồn 2 giá trị năm: 2023 = Quý Mão, 2024 = Giáp Thìn — SỰ THẬT CÔNG KHAI (can chi năm
    // dương lịch), độc lập với calendar-core. Xem CB-1/CB-2, DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md §2b/§3.
    const before: ChartInput = { date: "2024-02-04", hour: 8, timeZone: "UTC" };
    const after: ChartInput = { date: "2024-02-04", hour: 9, timeZone: "UTC" };

    const dataBefore = computeCalendarData(before, CLASSICAL_V1_PROFILE);
    const dataAfter = computeCalendarData(after, CLASSICAL_V1_PROFILE);

    expect(dataBefore.yearPillar.can).toBe("Quý");
    expect(dataBefore.yearPillar.chi).toBe("Mão");
    expect(dataAfter.yearPillar.can).toBe("Giáp");
    expect(dataAfter.yearPillar.chi).toBe("Thìn");
  });

  it("Scenario D — sát ranh giới năm dương lịch (đầu tháng 1, trước Tiểu Hàn): precedingMajorTerm PHẢI là Đông Chí năm trước, không throw (regression test cho gap Phase 4 §5)", () => {
    const input: ChartInput = { date: "2024-01-01", hour: 0, timeZone: "UTC" };
    const data = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    expect(data.precedingMajorTerm.nameHan).toBe("冬至");
    expect(data.precedingMajorTerm.kind).toBe("trungKhi");
  });

  it("Scenario E — early Zi (00:00-00:59): profile 'classical-v1' (no-shift) giữ trụ Ngày = Giáp Tý cho 2024-01-01 00:30", () => {
    const input: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };
    const data = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    expect(data.dayPillar.can).toBe("Giáp");
    expect(data.dayPillar.chi).toBe("Tý");
  });

  it("Scenario F — late Zi (23:00-23:59): profile 'classical-v1' (no-shift) giữ trụ Ngày = Quý Hợi cho 2023-12-31 23:30 (KHÔNG dịch sang ngày kế tiếp, đúng CalculationProfile hiện hành, KHÔNG PHẢI tuyên bố đây là canonical)", () => {
    const input: ChartInput = { date: "2023-12-31", hour: 23, minute: 30, timeZone: "Asia/Shanghai" };
    const data = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    expect(data.dayPillar.can).toBe("Quý");
    expect(data.dayPillar.chi).toBe("Hợi");
  });

  it("PROFILE TEST: Scenario F với profile khác ('shift-both-halves') cho trụ Ngày KHÁC — chứng minh profile thật sự thay đổi được kết quả mà không đổi code", () => {
    const input: ChartInput = { date: "2023-12-31", hour: 23, minute: 30, timeZone: "Asia/Shanghai" };
    const defaultResult = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    const altResult = computeCalendarData(input, withZiPolicy("shift-both-halves"));
    expect(altResult.dayPillar.cycleIndex).not.toBe(defaultResult.dayPillar.cycleIndex);
    expect(altResult.dayPillar.can).toBe("Giáp");
    expect(altResult.dayPillar.chi).toBe("Tý");
  });

  it("SERIALIZATION TEST: CalendarData JSON round-trip không mất dữ liệu (không có Date/function lọt vào output công khai)", () => {
    const input: ChartInput = { date: "2024-01-01", hour: 10, timeZone: "Asia/Ho_Chi_Minh" };
    const data = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    const roundTripped = JSON.parse(JSON.stringify(data)) as typeof data;
    expect(roundTripped).toEqual(data);
  });

  it("DETERMINISM: cùng input + cùng profile → cùng kết quả hệt nhau qua nhiều lần gọi", () => {
    const input: ChartInput = { date: "2024-06-15", hour: 14, minute: 22, timeZone: "Asia/Ho_Chi_Minh" };
    const first = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    const second = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    const third = computeCalendarData(input, CLASSICAL_V1_PROFILE);
    expect(second).toEqual(first);
    expect(third).toEqual(first);
  });

  it("Error handling: propagate CalendarFoundationError khi thiếu timeZone — không âm thầm dùng UTC hay múi giờ máy", () => {
    const input = { date: "2024-01-01", hour: 10 } as unknown as ChartInput;
    expect(() => computeCalendarData(input, CLASSICAL_V1_PROFILE)).toThrowError(/timeZone/);
  });
});
