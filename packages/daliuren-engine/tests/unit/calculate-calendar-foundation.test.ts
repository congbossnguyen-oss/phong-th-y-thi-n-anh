import { describe, expect, it } from "vitest";
import { calculateCalendarFoundation } from "../../src/index.js";
import { CLASSICAL_V1_PROFILE } from "../../src/profiles/classical-v1.js";
import type { ChartInput } from "../../src/types/chart.js";

/**
 * Test cho facade `calculateCalendarFoundation` (Phase 8B, CONG TAIYI v0.1 MVP) — CHỈ kiểm tra
 * đúng contract `EngineResult` (ok/fail, đủ 4 thành phần, determinism, lỗi rõ ràng). KHÔNG lặp
 * lại các test chi tiết đã có ở `tests/unit/calendar/`, `tests/unit/month-general/`,
 * `tests/unit/day-night/`, `tests/unit/noble-spirit/` — facade chỉ NỐI các hàm đã test kỹ đó.
 */
const VALID_INPUT: ChartInput = { date: "2024-06-15", hour: 14, minute: 22, timeZone: "Asia/Ho_Chi_Minh" };

describe("daliuren-engine — calculateCalendarFoundation (Phase 8B facade)", () => {
  it("Test 1 — happy path: input hợp lệ -> ok:true, đủ 4 thành phần", () => {
    const result = calculateCalendarFoundation(VALID_INPUT);

    expect(result.ok).toBe(true);
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    if (!result.data) throw new Error("unreachable — đã assert result.data ở trên");

    expect(result.data.calendar).toBeDefined();
    expect(result.data.monthGeneral).toBeDefined();
    expect(result.data.dayNight).toBeDefined();
    expect(result.data.nobleSpirit).toBeDefined();
    expect(result.data.provenance.monthGeneralProvenanceId).toEqual(expect.any(String));
    expect(result.data.provenance.dayNightProvenanceId).toEqual(expect.any(String));
    expect(result.data.provenance.nobleSpiritPairProvenanceId).toEqual(expect.any(String));
    expect(result.data.provenance.nobleSpiritDayNightAssignmentProvenanceId).toEqual(expect.any(String));

    expect(result.meta.engine).toBe("daliuren-engine");
    expect(result.meta.engineVersion).toEqual(expect.any(String));
    expect(result.meta.coreCalendarVersion).toEqual(expect.any(String));
    expect(result.meta.calculatedAt).toEqual(expect.any(String));
  });

  it("Test 1b — golden case: khớp trực tiếp CalendarData/MonthGeneral/DayNight đã verify ở tests/unit/calendar+month-general (2024-01-01 00:30, Asia/Shanghai, no-shift => Giáp Tý, Sửu/đạiCát, night)", () => {
    const input: ChartInput = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };
    const result = calculateCalendarFoundation(input, CLASSICAL_V1_PROFILE);

    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) throw new Error("unreachable");

    expect(result.data.calendar.dayPillar.can).toBe("Giáp");
    expect(result.data.calendar.dayPillar.chi).toBe("Tý");
    expect(result.data.monthGeneral.zhi).toBe("Sửu");
    expect(result.data.monthGeneral.classicalName).toBe("đạiCát");
    expect(result.data.dayNight.value).toBe("night");
  });

  it("Test 2 — invalid input (thiếu timeZone): ok:false, errors tồn tại, error code rõ ràng, KHÔNG throw", () => {
    const invalidInput = { date: "2024-06-15", hour: 14 } as unknown as ChartInput;

    expect(() => calculateCalendarFoundation(invalidInput)).not.toThrow();

    const result = calculateCalendarFoundation(invalidInput);
    expect(result.ok).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.code).toBe("MISSING_TIMEZONE");
    expect(result.errors?.[0]?.message).toEqual(expect.any(String));
    // meta vẫn phải có mặt kể cả khi lỗi — đúng contract EngineResult (fail() vẫn nhận meta).
    expect(result.meta.engine).toBe("daliuren-engine");
  });

  it("Test 2b — invalid input khác (ngày ảo 30/2): ok:false, error code riêng biệt (không lẫn với MISSING_TIMEZONE)", () => {
    const result = calculateCalendarFoundation({ ...VALID_INPUT, date: "2024-02-30" });
    expect(result.ok).toBe(false);
    expect(result.errors?.[0]?.code).toBe("INVALID_DATETIME_INPUT");
  });

  it("Test 3 — determinism: cùng input + cùng profile, gọi 2 lần -> output giống hệt nhau (trừ calculatedAt)", () => {
    const first = calculateCalendarFoundation(VALID_INPUT, CLASSICAL_V1_PROFILE);
    const second = calculateCalendarFoundation(VALID_INPUT, CLASSICAL_V1_PROFILE);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(second.data).toEqual(first.data);
    // calculatedAt là timestamp THỰC HIỆN phép tính, KHÔNG PHẢI dữ liệu suy ra từ input — cố ý
    // KHÔNG so sánh field này (đúng định nghĩa EngineMeta.calculatedAt, xem engine-contract).
    expect(second.meta.engine).toBe(first.meta.engine);
    expect(second.meta.engineVersion).toBe(first.meta.engineVersion);
    expect(second.meta.coreCalendarVersion).toBe(first.meta.coreCalendarVersion);
  });

  it("gọi với profile khác (đổi ziHourDayBoundary) vẫn ok:true và phản ánh đúng thay đổi (không phải bằng chứng mới, chỉ regression-guard cho facade truyền profile đúng)", () => {
    const zihourInput: ChartInput = { date: "2023-12-31", hour: 23, minute: 30, timeZone: "Asia/Shanghai" };
    const altProfile = {
      ...CLASSICAL_V1_PROFILE,
      ziHourDayBoundary: { ...CLASSICAL_V1_PROFILE.ziHourDayBoundary, value: "shift-both-halves" as const },
    };

    const defaultResult = calculateCalendarFoundation(zihourInput, CLASSICAL_V1_PROFILE);
    const altResult = calculateCalendarFoundation(zihourInput, altProfile);

    expect(defaultResult.ok).toBe(true);
    expect(altResult.ok).toBe(true);
    if (!defaultResult.ok || !defaultResult.data || !altResult.ok || !altResult.data) throw new Error("unreachable");

    expect(defaultResult.data.calendar.dayPillar.can).toBe("Quý");
    expect(altResult.data.calendar.dayPillar.can).toBe("Giáp");
  });
});
