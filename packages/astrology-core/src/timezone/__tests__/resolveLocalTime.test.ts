/**
 * Mọi số liệu offset/thời điểm chuyển giờ dưới đây đã được xác minh ĐỘC LẬP bằng cách gọi
 * trực tiếp `Intl.DateTimeFormat` (dữ liệu ICU/tzdata thật của runtime chạy test) TRƯỚC khi
 * viết assertion — KHÔNG suy đoán/hardcode ước lượng. Xem ghi chú riêng từng test cho phép
 * kiểm chứng độc lập tương đương.
 */
import { describe, expect, it } from "vitest";
import { resolveLocalTimeToUtc } from "../resolveLocalTime.js";
import type { CalendarDate } from "../../types.js";

describe("resolveLocalTimeToUtc — bình thường (không DST)", () => {
  it("UTC: giờ địa phương = giờ UTC, offset 0", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 6, day: 15 }, { hour: 12, minute: 0 }, "UTC");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(0);
    expect(r.utc.toISOString()).toBe("2024-06-15T12:00:00.000Z");
  });

  it("UTC+7 không DST (Asia/Ho_Chi_Minh) — đúng dữ liệu benchmark 1985-03-12 08:30", () => {
    const r = resolveLocalTimeToUtc({ year: 1985, month: 3, day: 12 }, { hour: 8, minute: 30 }, "Asia/Ho_Chi_Minh");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(420);
    expect(r.utc.toISOString()).toBe("1985-03-12T01:30:00.000Z");
  });

  it("offset âm (America/New_York giờ mùa đông, EST = -300 phút)", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 1, day: 15 }, { hour: 10, minute: 0 }, "America/New_York");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(-300);
    expect(r.utc.toISOString()).toBe("2024-01-15T15:00:00.000Z");
  });

  it("ngay TRƯỚC ngày chuyển giờ mùa hè vẫn resolved bình thường (EST)", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 3, day: 9 }, { hour: 10, minute: 0 }, "America/New_York");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(-300);
  });

  it("ngay SAU ngày chuyển giờ mùa hè vẫn resolved bình thường (EDT)", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 3, day: 11 }, { hour: 10, minute: 0 }, "America/New_York");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(-240);
  });

  it("giờ nằm trên CÙNG ngày có chuyển giờ nhưng NGOÀI vùng biên vẫn resolved (không bị báo nhầm ambiguous/nonexistent)", () => {
    // 2024-11-03 (ngày lùi giờ mùa hè của America/New_York) lúc 10:00 — xa vùng biên 01:00-02:00, chỉ có 1 offset hợp lệ (EST, đã lùi xong).
    const r = resolveLocalTimeToUtc({ year: 2024, month: 11, day: 3 }, { hour: 10, minute: 0 }, "America/New_York");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(-300);
  });
});

describe("resolveLocalTimeToUtc — ambiguous local time (lùi giờ mùa hè)", () => {
  // Xác minh độc lập: offset America/New_York tại 2024-11-03T05:30:00Z = -240 (EDT), tại
  // 2024-11-03T06:30:00Z = -300 (EST) — tức 01:30 giờ địa phương xảy ra ở CẢ HAI thời điểm UTC
  // này (05:30Z là 01:30 EDT, 06:30Z là 01:30 EST).
  it("01:30 ngày 2024-11-03 tại America/New_York là ambiguous với đúng 2 ứng viên", () => {
    const date: CalendarDate = { year: 2024, month: 11, day: 3 };
    const r = resolveLocalTimeToUtc(date, { hour: 1, minute: 30 }, "America/New_York");
    expect(r.status).toBe("ambiguous");
    if (r.status !== "ambiguous") throw new Error("unreachable");

    const [first, second] = r.candidates;
    expect(first.utc.toISOString()).toBe("2024-11-03T05:30:00.000Z");
    expect(first.utcOffsetMinutes).toBe(-240);
    expect(second.utc.toISOString()).toBe("2024-11-03T06:30:00.000Z");
    expect(second.utcOffsetMinutes).toBe(-300);
    // Sắp theo thời gian UTC tăng dần.
    expect(first.utc.getTime()).toBeLessThan(second.utc.getTime());
  });

  it("01:59:59 (giây cuối trước khi lùi giờ) vẫn ambiguous — đúng vùng biên", () => {
    const r = resolveLocalTimeToUtc(
      { year: 2024, month: 11, day: 3 },
      { hour: 1, minute: 59, second: 59 },
      "America/New_York",
    );
    expect(r.status).toBe("ambiguous");
  });
});

describe("resolveLocalTimeToUtc — nonexistent local time (tiến giờ mùa hè)", () => {
  // Xác minh độc lập: offset America/New_York tại 2024-03-10T06:30Z = -300 (EST, trước
  // chuyển), tại 2024-03-10T07:30Z = -240 (EDT, sau chuyển) — chuyển giờ thật xảy ra đúng
  // 2024-03-10 07:00 UTC (02:00 EST -> 03:00 EDT), tức khoảng 02:00-02:59 giờ địa phương
  // không tồn tại.
  it("02:30 ngày 2024-03-10 tại America/New_York là nonexistent, khoảng trống 60 phút", () => {
    const r = resolveLocalTimeToUtc(
      { year: 2024, month: 3, day: 10 },
      { hour: 2, minute: 30 },
      "America/New_York",
    );
    expect(r.status).toBe("nonexistent");
    if (r.status !== "nonexistent") throw new Error("unreachable");
    expect(r.gapMinutes).toBe(60);
    // Mốc hợp lệ gần nhất TRƯỚC khoảng trống: 01:59:59 EST = 06:59:59Z.
    expect(r.nearestValidBefore.utc.toISOString()).toBe("2024-03-10T06:59:59.000Z");
    expect(r.nearestValidBefore.utcOffsetMinutes).toBe(-300);
    // Mốc hợp lệ gần nhất SAU khoảng trống: 03:00:00 EDT = 07:00:00Z.
    expect(r.nearestValidAfter.utc.toISOString()).toBe("2024-03-10T07:00:00.000Z");
    expect(r.nearestValidAfter.utcOffsetMinutes).toBe(-240);
  });

  it("02:00:00 (giây đầu của khoảng trống) cũng là nonexistent", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 3, day: 10 }, { hour: 2, minute: 0, second: 0 }, "America/New_York");
    expect(r.status).toBe("nonexistent");
  });

  it("01:59:59 (giây cuối TRƯỚC khoảng trống) là resolved bình thường, không phải nonexistent", () => {
    const r = resolveLocalTimeToUtc(
      { year: 2024, month: 3, day: 10 },
      { hour: 1, minute: 59, second: 59 },
      "America/New_York",
    );
    expect(r.status).toBe("resolved");
  });

  it("03:00:00 (giây đầu SAU khoảng trống) là resolved bình thường, không phải nonexistent", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 3, day: 10 }, { hour: 3, minute: 0, second: 0 }, "America/New_York");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(-240);
  });
});

describe("resolveLocalTimeToUtc — historical timezone (không hardcode offset cố định)", () => {
  // Xác minh độc lập qua Intl trực tiếp: Asia/Ho_Chi_Minh (Sài Gòn cũ) = UTC+8 (480 phút)
  // năm 1960, đổi sang UTC+7 (420 phút) trước 1985. Nếu code dùng bảng offset viết tay
  // ("luôn +7"), test 1960 dưới đây sẽ FAIL — đúng ý đồ: buộc dùng dữ liệu IANA tzdata thật.
  it("Asia/Ho_Chi_Minh năm 1960 là UTC+8, KHÁC với UTC+7 hiện tại", () => {
    const r = resolveLocalTimeToUtc({ year: 1960, month: 1, day: 1 }, { hour: 12, minute: 0 }, "Asia/Ho_Chi_Minh");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(480);
  });

  it("Asia/Ho_Chi_Minh năm 1985 đã là UTC+7", () => {
    const r = resolveLocalTimeToUtc({ year: 1985, month: 3, day: 12 }, { hour: 12, minute: 0 }, "Asia/Ho_Chi_Minh");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utcOffsetMinutes).toBe(420);
  });
});

describe("resolveLocalTimeToUtc — boundary khác", () => {
  it("nửa đêm (00:00:00) một ngày bình thường", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 7, day: 1 }, { hour: 0, minute: 0, second: 0 }, "UTC");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utc.toISOString()).toBe("2024-07-01T00:00:00.000Z");
  });

  it("ngày nhuận 29/2/2024 lúc nửa đêm", () => {
    const r = resolveLocalTimeToUtc({ year: 2024, month: 2, day: 29 }, { hour: 0, minute: 0 }, "UTC");
    expect(r.status).toBe("resolved");
    if (r.status !== "resolved") throw new Error("unreachable");
    expect(r.utc.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });
});
