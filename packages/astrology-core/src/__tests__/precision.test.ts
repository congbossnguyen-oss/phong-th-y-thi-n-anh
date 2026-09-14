import { describe, expect, it } from "vitest";

import {
  ANGULAR_TOLERANCE_ANALYTIC_FALLBACK_DEGREES,
  ANGULAR_TOLERANCE_FILE_BASED_DEGREES,
  angularPrecisionForClass,
  normalizeDegrees,
  toDegreesMinutesSeconds,
} from "../precision.js";

/**
 * Characterization tests — Phase 4 Step 2. Ghi lại CHÍNH XÁC hành vi hiện có của 5 bản
 * `normalizeDegrees()` độc lập (đã xác nhận byte-for-byte giống hệt nhau bằng đọc trực tiếp
 * trước khi trích xuất, tại `western/aspects.ts`, `western/housePlacement.ts`,
 * `western/houses.ts`, `western/zodiac.ts`, `astronomical/providers/SwissEphemerisProvider.ts`)
 * TRƯỚC KHI xoá các bản đó — đây là bài kiểm tra HÀNH VI ĐÃ CÓ, KHÔNG phải hành vi "nên có".
 */
describe("normalizeDegrees — characterization (hành vi hiện có, giữ nguyên khi trích xuất Phase 4 Step 2)", () => {
  it("giá trị dương trong [0,360) giữ nguyên", () => {
    expect(normalizeDegrees(45)).toBe(45);
    expect(normalizeDegrees(180)).toBe(180);
    expect(normalizeDegrees(359.9999999)).toBe(359.9999999);
  });

  it("giá trị âm được cộng 360 (một lần)", () => {
    expect(normalizeDegrees(-45)).toBe(315);
    expect(normalizeDegrees(-180)).toBe(180);
    expect(normalizeDegrees(-0.0001)).toBeCloseTo(359.9999, 9);
  });

  it("giá trị > 360 chuẩn hoá đúng bằng phần dư", () => {
    expect(normalizeDegrees(400)).toBe(40);
    expect(normalizeDegrees(720)).toBe(0);
  });

  it("giá trị < -360 chuẩn hoá đúng (nhiều vòng âm)", () => {
    expect(normalizeDegrees(-400)).toBe(320);
    expect(normalizeDegrees(-350.5)).toBeCloseTo(9.5, 9);
  });

  it("đúng 0 -> 0", () => {
    expect(normalizeDegrees(0)).toBe(0);
  });

  it("đúng 360 -> 0 (dương, KHÔNG phải -0)", () => {
    const result = normalizeDegrees(360);
    expect(result).toBe(0);
    expect(Object.is(result, -0)).toBe(false);
  });

  it("HÀNH VI BIÊN đã xác nhận và GIỮ NGUYÊN (không phải bug mới): bội số ÂM chính xác của 360 (vd. -360, -720) cho ra -0 (âm), không phải 0 dương — do `value % 360` của JavaScript trả -0 cho trường hợp này và -0 < 0 là false nên nhánh +360 không áp dụng. -0 tương đương 0 trong mọi so sánh/số học thông thường nên KHÔNG có evidence hành vi này gây lỗi ở bất kỳ call site nào hiện tại — KHÔNG tự ý sửa.", () => {
    expect(Object.is(normalizeDegrees(-360), -0)).toBe(true);
    expect(Object.is(normalizeDegrees(-720), -0)).toBe(true);
    expect(normalizeDegrees(-360) === 0).toBe(true); // -0 === 0 vẫn true về mặt số học
  });

  it("số thập phân (floating-point) giữ nguyên độ chính xác, không làm tròn", () => {
    expect(normalizeDegrees(123.456789)).toBe(123.456789);
    expect(normalizeDegrees(-123.456789)).toBeCloseTo(236.543211, 9);
  });

  it("deterministic — gọi lại nhiều lần cho cùng kết quả", () => {
    expect(normalizeDegrees(37.5)).toBe(normalizeDegrees(37.5));
  });
});

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
