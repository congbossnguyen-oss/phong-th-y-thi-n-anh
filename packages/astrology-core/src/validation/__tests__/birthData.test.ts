import { describe, expect, it } from "vitest";
import { validateBirthData } from "../birthData.js";
import type { BirthData } from "../../types.js";

const validBase: BirthData = {
  date: { year: 1985, month: 3, day: 12 },
  localTime: { hour: 8, minute: 30, second: 0 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 21.0285,
  longitude: 105.8542,
};

describe("validateBirthData — valid input", () => {
  it("trả mảng rỗng cho BirthData hợp lệ đầy đủ", () => {
    expect(validateBirthData(validBase)).toEqual([]);
  });

  it("chấp nhận localTime = null (không rõ giờ sinh) là trạng thái hợp lệ", () => {
    const input: BirthData = { ...validBase, localTime: null };
    expect(validateBirthData(input)).toEqual([]);
  });

  it("chấp nhận second bỏ trống (mặc định 0)", () => {
    const input: BirthData = { ...validBase, localTime: { hour: 8, minute: 30 } };
    expect(validateBirthData(input)).toEqual([]);
  });

  it("chấp nhận toạ độ biên hợp lệ (cực và đường đổi ngày)", () => {
    expect(validateBirthData({ ...validBase, latitude: 90, longitude: 180 })).toEqual([]);
    expect(validateBirthData({ ...validBase, latitude: -90, longitude: -180 })).toEqual([]);
  });
});

describe("validateBirthData — invalid date", () => {
  it("báo INVALID_BIRTH_DATE cho ngày không tồn tại (30/2)", () => {
    const errors = validateBirthData({ ...validBase, date: { year: 2024, month: 2, day: 30 } });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe("INVALID_BIRTH_DATE");
    expect(errors[0]?.field).toBe("date");
  });

  it("báo INVALID_BIRTH_DATE cho ngày 29/2 của năm KHÔNG nhuận", () => {
    const errors = validateBirthData({ ...validBase, date: { year: 2023, month: 2, day: 29 } });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe("INVALID_BIRTH_DATE");
  });

  it("chấp nhận 29/2 của năm nhuận thật (2024)", () => {
    expect(validateBirthData({ ...validBase, date: { year: 2024, month: 2, day: 29 } })).toEqual([]);
  });

  it("báo INVALID_BIRTH_DATE cho tháng ngoài 1-12", () => {
    const errors = validateBirthData({ ...validBase, date: { year: 2024, month: 13, day: 1 } });
    expect(errors[0]?.code).toBe("INVALID_BIRTH_DATE");
  });

  it("báo INVALID_BIRTH_DATE cho năm không phải số nguyên", () => {
    const errors = validateBirthData({ ...validBase, date: { year: 1985.5, month: 3, day: 12 } });
    expect(errors[0]?.code).toBe("INVALID_BIRTH_DATE");
    expect(errors[0]?.field).toBe("date");
  });
});

describe("validateBirthData — invalid time", () => {
  it("báo INVALID_BIRTH_TIME cho giờ = 24", () => {
    const errors = validateBirthData({ ...validBase, localTime: { hour: 24, minute: 0 } });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe("INVALID_BIRTH_TIME");
    expect(errors[0]?.field).toBe("localTime.hour");
  });

  it("báo INVALID_BIRTH_TIME cho phút = 60", () => {
    const errors = validateBirthData({ ...validBase, localTime: { hour: 8, minute: 60 } });
    expect(errors[0]?.code).toBe("INVALID_BIRTH_TIME");
    expect(errors[0]?.field).toBe("localTime.minute");
  });

  it("báo INVALID_BIRTH_TIME cho giây âm", () => {
    const errors = validateBirthData({ ...validBase, localTime: { hour: 8, minute: 30, second: -1 } });
    expect(errors[0]?.code).toBe("INVALID_BIRTH_TIME");
    expect(errors[0]?.field).toBe("localTime.second");
  });

  it("gộp nhiều lỗi giờ/phút/giây cùng lúc nếu tất cả đều sai", () => {
    const errors = validateBirthData({ ...validBase, localTime: { hour: -1, minute: 99, second: 60 } });
    expect(errors).toHaveLength(3);
    expect(errors.map((e) => e.field).sort()).toEqual(["localTime.hour", "localTime.minute", "localTime.second"]);
  });
});

describe("validateBirthData — invalid coordinates", () => {
  it("báo INVALID_COORDINATES cho vĩ độ > 90", () => {
    const errors = validateBirthData({ ...validBase, latitude: 91 });
    expect(errors[0]?.code).toBe("INVALID_COORDINATES");
    expect(errors[0]?.field).toBe("latitude");
  });

  it("báo INVALID_COORDINATES cho kinh độ < -180", () => {
    const errors = validateBirthData({ ...validBase, longitude: -181 });
    expect(errors[0]?.code).toBe("INVALID_COORDINATES");
    expect(errors[0]?.field).toBe("longitude");
  });

  it("báo INVALID_COORDINATES cho NaN/Infinity", () => {
    expect(validateBirthData({ ...validBase, latitude: Number.NaN })[0]?.code).toBe("INVALID_COORDINATES");
    expect(validateBirthData({ ...validBase, longitude: Number.POSITIVE_INFINITY })[0]?.code).toBe(
      "INVALID_COORDINATES",
    );
  });

  it("báo INVALID_COORDINATES cho altitudeMeters không hữu hạn nếu có truyền", () => {
    const errors = validateBirthData({ ...validBase, altitudeMeters: Number.NaN });
    expect(errors[0]?.code).toBe("INVALID_COORDINATES");
    expect(errors[0]?.field).toBe("altitudeMeters");
  });
});

describe("validateBirthData — invalid timezone", () => {
  it("báo INVALID_TIMEZONE cho chuỗi rỗng", () => {
    const errors = validateBirthData({ ...validBase, timezoneId: "" });
    expect(errors[0]?.code).toBe("INVALID_TIMEZONE");
  });

  it("báo TIMEZONE_NOT_FOUND cho tên IANA không tồn tại", () => {
    const errors = validateBirthData({ ...validBase, timezoneId: "Not/A_Real_Zone" });
    expect(errors[0]?.code).toBe("TIMEZONE_NOT_FOUND");
    expect(errors[0]?.details).toEqual({ actual: "Not/A_Real_Zone" });
  });

  it("báo INVALID_TIMEZONE cho offset số cứng thay vì tên IANA (đúng yêu cầu KHÔNG chấp nhận UTC+7) — dù Intl/ICU coi đây là cú pháp hợp lệ", () => {
    for (const raw of ["+07:00", "+0700", "-05:00", "UTC+7", "GMT+7"]) {
      const errors = validateBirthData({ ...validBase, timezoneId: raw });
      expect(errors[0]?.code, `timezoneId="${raw}"`).toBe("INVALID_TIMEZONE");
    }
  });

  it("vẫn chấp nhận vùng IANA hợp lệ có chứa số/gạch ngang (không bị regex offset bắt nhầm)", () => {
    expect(validateBirthData({ ...validBase, timezoneId: "Etc/GMT+7" })).toEqual([]);
    expect(validateBirthData({ ...validBase, timezoneId: "America/New_York" })).toEqual([]);
  });
});

describe("validateBirthData — malformed input tổng hợp", () => {
  it("gộp lỗi từ nhiều field khác nhau trong một lần validate", () => {
    const errors = validateBirthData({
      date: { year: 2023, month: 2, day: 30 },
      localTime: { hour: 25, minute: 0 },
      timezoneId: "Not/Real",
      latitude: 200,
      longitude: 0,
    });
    const codes = errors.map((e) => e.code).sort();
    expect(codes).toEqual(
      ["INVALID_BIRTH_DATE", "INVALID_BIRTH_TIME", "INVALID_COORDINATES", "TIMEZONE_NOT_FOUND"].sort(),
    );
  });
});
