import { describe, expect, it } from "vitest";
import { computeBirthDataFingerprint } from "../birthDataFingerprint.js";
import type { BirthData } from "../../types.js";

const benchmark: BirthData = {
  date: { year: 1985, month: 3, day: 12 },
  localTime: { hour: 8, minute: 30 },
  timezoneId: "Asia/Ho_Chi_Minh",
  latitude: 21.0285,
  longitude: 105.8542,
};

describe("computeBirthDataFingerprint", () => {
  it("xác định (deterministic): cùng nội dung, khác reference object, cùng fingerprint", () => {
    const a = computeBirthDataFingerprint(benchmark);
    const b = computeBirthDataFingerprint(JSON.parse(JSON.stringify(benchmark)) as BirthData);
    expect(a).toBe(b);
  });

  it("có tiền tố thuật toán tường minh (sha256:) — không phải chuỗi hash trần khó nhận diện", () => {
    expect(computeBirthDataFingerprint(benchmark)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("khác ngày/giờ/toạ độ => khác fingerprint", () => {
    const a = computeBirthDataFingerprint(benchmark);
    const b = computeBirthDataFingerprint({ ...benchmark, latitude: 10.762622 });
    expect(a).not.toBe(b);
  });

  it("KHÁC locationLabel nhưng CÙNG ngày/giờ/toạ độ => CÙNG fingerprint (label chỉ hiển thị)", () => {
    const a = computeBirthDataFingerprint({ ...benchmark, locationLabel: "Hà Nội" });
    const b = computeBirthDataFingerprint({ ...benchmark, locationLabel: "Hanoi, Vietnam" });
    expect(a).toBe(b);
  });

  it("localTime=null cho fingerprint khác với có localTime cụ thể", () => {
    const a = computeBirthDataFingerprint(benchmark);
    const b = computeBirthDataFingerprint({ ...benchmark, localTime: null });
    expect(a).not.toBe(b);
  });
});
