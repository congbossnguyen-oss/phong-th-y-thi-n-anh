import { describe, expect, it } from "vitest";
import { resolveBirthDataInstant } from "../resolveBirthDataInstant.js";
import type { BirthData } from "../../types.js";

describe("resolveBirthDataInstant — thành công", () => {
  it("trả UTC chính xác cho BirthData hợp lệ (benchmark Hanoi 1985-03-12 08:30)", () => {
    const result = resolveBirthDataInstant({
      date: { year: 1985, month: 3, day: 12 },
      localTime: { hour: 8, minute: 30 },
      timezoneId: "Asia/Ho_Chi_Minh",
      latitude: 21.0285,
      longitude: 105.8542,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("unreachable");
    expect(result.utc.toISOString()).toBe("1985-03-12T01:30:00.000Z");
    expect(result.utcOffsetMinutes).toBe(420);
  });

  it("localTime = null vẫn resolve được (dùng 00:00:00 làm mốc ngày, KHÔNG lỗi)", () => {
    const result = resolveBirthDataInstant({
      date: { year: 1985, month: 3, day: 12 },
      localTime: null,
      timezoneId: "Asia/Ho_Chi_Minh",
      latitude: 21.0285,
      longitude: 105.8542,
    });
    expect(result.ok).toBe(true);
  });
});

describe("resolveBirthDataInstant — validation errors không lộ exception thô", () => {
  const invalid: BirthData = {
    date: { year: 2023, month: 2, day: 30 },
    localTime: { hour: 8, minute: 30 },
    timezoneId: "Asia/Ho_Chi_Minh",
    latitude: 21.0285,
    longitude: 105.8542,
  };

  it("trả {ok:false, errors} có mã ổn định thay vì throw", () => {
    expect(() => resolveBirthDataInstant(invalid)).not.toThrow();
    const result = resolveBirthDataInstant(invalid);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.errors[0]?.code).toBe("INVALID_BIRTH_DATE");
  });
});

describe("resolveBirthDataInstant — ambiguous/nonexistent là hard stop, không đoán", () => {
  it("giờ ambiguous trả AMBIGUOUS_LOCAL_TIME kèm cả 2 ứng viên trong details", () => {
    const result = resolveBirthDataInstant({
      date: { year: 2024, month: 11, day: 3 },
      localTime: { hour: 1, minute: 30 },
      timezoneId: "America/New_York",
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe("AMBIGUOUS_LOCAL_TIME");
    const details = result.errors[0]?.details as { candidates: unknown[] } | undefined;
    expect(details?.candidates).toHaveLength(2);
  });

  it("giờ nonexistent trả NONEXISTENT_LOCAL_TIME kèm gapMinutes trong details", () => {
    const result = resolveBirthDataInstant({
      date: { year: 2024, month: 3, day: 10 },
      localTime: { hour: 2, minute: 30 },
      timezoneId: "America/New_York",
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("unreachable");
    expect(result.errors[0]?.code).toBe("NONEXISTENT_LOCAL_TIME");
    const details = result.errors[0]?.details as { gapMinutes: number } | undefined;
    expect(details?.gapMinutes).toBe(60);
  });
});

describe("resolveBirthDataInstant — reproducibility (Definition of Done bắt buộc)", () => {
  const birthData: BirthData = {
    date: { year: 1985, month: 3, day: 12 },
    localTime: { hour: 8, minute: 30 },
    timezoneId: "Asia/Ho_Chi_Minh",
    latitude: 21.0285,
    longitude: 105.8542,
  };

  it("cùng BirthData (khác reference object, cùng giá trị) cho cùng UTC tuyệt đối", () => {
    const a = resolveBirthDataInstant(birthData);
    const b = resolveBirthDataInstant(JSON.parse(JSON.stringify(birthData)) as BirthData);
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("unreachable");
    expect(a.utc.getTime()).toBe(b.utc.getTime());
    expect(a.utcOffsetMinutes).toBe(b.utcOffsetMinutes);
  });

  it("gọi lặp lại nhiều lần liên tiếp cho kết quả giống hệt nhau (không phụ thuộc trạng thái ẩn)", () => {
    const results = Array.from({ length: 5 }, () => resolveBirthDataInstant(birthData));
    const times = results.map((r) => (r.ok ? r.utc.getTime() : null));
    expect(new Set(times).size).toBe(1);
    expect(times[0]).not.toBeNull();
  });
});
