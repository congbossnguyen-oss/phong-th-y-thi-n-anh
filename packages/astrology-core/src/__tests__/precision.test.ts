import { describe, expect, it } from "vitest";

import {
  ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES,
  ANGULAR_TOLERANCE_FILE_BASED_DEGREES,
  angularPrecisionForClass,
  toDegreesMinutesSeconds,
} from "../precision.js";

describe("angularPrecisionForClass — tái dùng đúng 2 hằng số dung sai đã có, KHÔNG bịa số mới", () => {
  it("file_based -> ANGULAR_TOLERANCE_FILE_BASED_DEGREES", () => {
    expect(angularPrecisionForClass("file_based")).toBe(ANGULAR_TOLERANCE_FILE_BASED_DEGREES);
  });

  it("analytic_fallback -> ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES", () => {
    expect(angularPrecisionForClass("analytic_fallback")).toBe(ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES);
  });

  it("unknown -> NaN (KHÔNG đoán một con số cụ thể khi bản thân không biết)", () => {
    expect(Number.isNaN(angularPrecisionForClass("unknown"))).toBe(true);
  });
});

describe("toDegreesMinutesSeconds — tiện ích hiển thị, KHÔNG lưu vào NormalizedChart (contract không có field DMS)", () => {
  it("0° -> 0°0'0\"", () => {
    expect(toDegreesMinutesSeconds(0)).toEqual({ degrees: 0, minutes: 0, seconds: 0 });
  });

  it("21.4222° (Sun signDegree, fixture Phase 2) -> 21°25'19.92\" (xấp xỉ)", () => {
    const dms = toDegreesMinutesSeconds(21.4222);
    expect(dms.degrees).toBe(21);
    expect(dms.minutes).toBe(25);
    expect(dms.seconds).toBeCloseTo(19.92, 1);
  });

  it("29.9999999° gần 30° KHÔNG bị làm tròn lên thành 30°0'0\" (giữ nguyên độ chính xác, không làm tròn ẩn)", () => {
    const dms = toDegreesMinutesSeconds(29.9999999);
    expect(dms.degrees).toBe(29);
    expect(dms.minutes).toBe(59);
    expect(dms.seconds).toBeCloseTo(59.9996, 2);
  });

  it("360° đầy đủ -> 360°0'0\" (hàm không tự chuẩn hoá về [0,360), caller tự chuẩn hoá longitude trước nếu cần)", () => {
    expect(toDegreesMinutesSeconds(360)).toEqual({ degrees: 360, minutes: 0, seconds: 0 });
  });

  it("deterministic — gọi lại nhiều lần cho cùng kết quả", () => {
    expect(toDegreesMinutesSeconds(123.456)).toEqual(toDegreesMinutesSeconds(123.456));
  });
});
