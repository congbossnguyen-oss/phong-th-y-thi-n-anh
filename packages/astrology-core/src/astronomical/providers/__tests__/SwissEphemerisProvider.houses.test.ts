import { describe, expect, it } from "vitest";

import { isWithinTolerance } from "../../../precision.js";
import { SwissEphemerisProvider } from "../SwissEphemerisProvider.js";
import { SwissEphemerisHouseSystemUndefinedAtLatitudeError, SwissEphemerisUnsupportedHouseSystemError } from "../errors.js";

/**
 * QUAN TRỌNG: xem ghi chú process-wide state ở `SwissEphemerisProvider.test.ts` — mỗi test tự
 * dựng provider mới ngay trước khi dùng, KHÔNG dùng chung instance cấp module.
 */
function defaultProvider(): SwissEphemerisProvider {
  return new SwissEphemerisProvider();
}

const J2000_SUMMER = new Date("2000-06-21T12:00:00.000Z");
const VIETNAM_UTC = new Date("1985-03-12T01:30:00.000Z");
const VIETNAM_LAT = 10.7626;
const VIETNAM_LON = 106.6602;

describe("SwissEphemerisProvider — house cusps (Placidus, hình dạng/bất biến chung)", () => {
  it("trả đúng 12 cusp, mỗi giá trị trong [0,360)", () => {
    const cusps = defaultProvider().getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    expect(cusps.cusps).toHaveLength(12);
    for (const c of cusps.cusps) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(360);
    }
  });

  it("houseSystem trả về ĐÚNG BẰNG chuỗi đã truyền vào (không đổi thành mã Swiss Ephemeris nội bộ)", () => {
    const cusps = defaultProvider().getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    expect(cusps.houseSystem).toBe("placidus");
  });

  it("cusp nhà 1 == Ascendant, cusp nhà 10 == Midheaven (bất biến hình học của mọi hệ quadrant-based)", () => {
    const provider = defaultProvider();
    const cusps = provider.getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    const asc = provider.getAscendant(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    const mc = provider.getMidheaven(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    expect(cusps.cusps[0]).toBe(asc.longitude);
    expect(cusps.cusps[9]).toBe(mc.longitude);
  });

  it("cusp nhà 7 == Descendant (ASC+180), cusp nhà 4 == IC (MC+180) — đúng định nghĩa hình học, không phải đo độc lập", () => {
    const provider = defaultProvider();
    const cusps = provider.getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    const asc = provider.getAscendant(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    const mc = provider.getMidheaven(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    expect(cusps.cusps[6]).toBeCloseTo((asc.longitude + 180) % 360, 9);
    expect(cusps.cusps[3]).toBeCloseTo((mc.longitude + 180) % 360, 9);
  });

  it("thứ tự cusp đi vòng quanh 360° một cách đơn điệu (không trùng lặp, không nhảy lộn xộn) — đi qua đúng 1 lần điểm nối 360°/0°", () => {
    const cusps = defaultProvider().getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus").cusps;
    let wraps = 0;
    for (let i = 0; i < 12; i++) {
      const current = cusps[i]!;
      const next = cusps[(i + 1) % 12]!;
      const forwardGap = next > current ? next - current : next + 360 - current;
      expect(forwardGap).toBeGreaterThan(0); // không trùng lặp, luôn tiến về phía trước
      if (next < current) wraps++;
    }
    expect(wraps).toBe(1); // đúng 1 lần đi qua mốc 360°/0° trong 1 vòng đủ 12 cusp
  });

  it("tính toán xác định (deterministic) — gọi lại nhiều lần cho kết quả giống hệt nhau", () => {
    const provider = defaultProvider();
    const first = provider.getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    const second = provider.getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "placidus");
    expect(first.cusps).toEqual(second.cusps);
  });
});

describe("SwissEphemerisProvider — house system không hỗ trợ (chuỗi lạ)", () => {
  it("một chuỗi houseSystem KHÔNG có trong bảng ánh xạ ném SwissEphemerisUnsupportedHouseSystemError — KHÔNG âm thầm trả số liệu (native tự nó KHÔNG báo lỗi cho mã lạ, xác nhận bằng thực nghiệm)", () => {
    const provider = defaultProvider();
    expect(() => provider.getHouseCusps(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "not_a_real_house_system")).toThrow(
      SwissEphemerisUnsupportedHouseSystemError,
    );
    expect(() => provider.getAscendant(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "not_a_real_house_system")).toThrow(
      SwissEphemerisUnsupportedHouseSystemError,
    );
    expect(() => provider.getMidheaven(VIETNAM_UTC, VIETNAM_LAT, VIETNAM_LON, "not_a_real_house_system")).toThrow(
      SwissEphemerisUnsupportedHouseSystemError,
    );
  });
});

describe("SwissEphemerisProvider — vĩ độ cực: Placidus/Koch KHÔNG xác định được (UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE)", () => {
  it("Placidus tại vĩ độ 70°N (trong vòng cực) ném SwissEphemerisHouseSystemUndefinedAtLatitudeError cho cả 3 method", () => {
    const provider = defaultProvider();
    expect(() => provider.getHouseCusps(J2000_SUMMER, 70, 25, "placidus")).toThrow(SwissEphemerisHouseSystemUndefinedAtLatitudeError);
    expect(() => provider.getAscendant(J2000_SUMMER, 70, 25, "placidus")).toThrow(SwissEphemerisHouseSystemUndefinedAtLatitudeError);
    expect(() => provider.getMidheaven(J2000_SUMMER, 70, 25, "placidus")).toThrow(SwissEphemerisHouseSystemUndefinedAtLatitudeError);
  });

  it("Koch tại vĩ độ 70°N CŨNG thất bại (cùng nguyên nhân — phép chia cung giờ)", () => {
    expect(() => defaultProvider().getHouseCusps(J2000_SUMMER, 70, 25, "koch")).toThrow(SwissEphemerisHouseSystemUndefinedAtLatitudeError);
  });

  it("Nam Cực (vĩ độ Nam, trong vòng cực) CŨNG kích hoạt lỗi này, không chỉ Bắc Cực", () => {
    expect(() => defaultProvider().getHouseCusps(J2000_SUMMER, -70, 25, "placidus")).toThrow(
      SwissEphemerisHouseSystemUndefinedAtLatitudeError,
    );
  });

  it("đúng ngay tại cực Bắc (90°) và cực Nam (-90°) — trường hợp biên tuyệt đối", () => {
    expect(() => defaultProvider().getHouseCusps(J2000_SUMMER, 90, 25, "placidus")).toThrow(
      SwissEphemerisHouseSystemUndefinedAtLatitudeError,
    );
    expect(() => defaultProvider().getHouseCusps(J2000_SUMMER, -90, 25, "placidus")).toThrow(
      SwissEphemerisHouseSystemUndefinedAtLatitudeError,
    );
  });

  it("Whole Sign, Equal, Porphyry, Campanus, Regiomontanus KHÔNG bị lỗi này — LUÔN xác định được ở mọi vĩ độ (xác nhận thực nghiệm, không suy đoán)", () => {
    const provider = defaultProvider();
    for (const system of ["whole_sign", "equal", "porphyry", "campanus", "regiomontanus"]) {
      expect(() => provider.getHouseCusps(J2000_SUMMER, 89, 25, system)).not.toThrow();
    }
  });

  it("tại vĩ độ 66.5° (ranh giới vòng cực Bắc) Placidus VẪN tính được — chỉ thất bại rõ ràng phía trong vòng cực hơn nữa (xác nhận thực nghiệm, ngưỡng chính xác do Swiss Ephemeris quyết định, không hardcode lại)", () => {
    expect(() => defaultProvider().getHouseCusps(J2000_SUMMER, 66.5, 25, "placidus")).not.toThrow();
  });
});

describe("SwissEphemerisProvider — địa lý khác: xích đạo, kinh độ đông/tây, quanh nửa đêm", () => {
  it("xích đạo (vĩ độ 0) tính được bình thường", () => {
    const cusps = defaultProvider().getHouseCusps(J2000_SUMMER, 0, 25, "placidus");
    expect(cusps.cusps).toHaveLength(12);
  });

  it("kinh độ Đông và Tây (cùng vĩ độ/thời điểm, kinh độ đối dấu) cho ASC/MC KHÁC NHAU rõ rệt — xác nhận dấu kinh độ có ảnh hưởng thực sự, không bị bỏ qua", () => {
    const provider = defaultProvider();
    const east = provider.getAscendant(J2000_SUMMER, 20, 106.6602, "placidus");
    const west = provider.getAscendant(J2000_SUMMER, 20, -106.6602, "placidus");
    expect(Math.abs(east.longitude - west.longitude)).toBeGreaterThan(5);
  });

  it("giờ đúng nửa đêm UTC và ngay sát nửa đêm cho kết quả liên tục (không nhảy đột ngột bất thường)", () => {
    const provider = defaultProvider();
    const atMidnight = provider.getAscendant(new Date("2010-01-01T00:00:00.000Z"), 21.0285, 105.8542, "placidus");
    const nearMidnight = provider.getAscendant(new Date("2010-01-01T00:00:01.000Z"), 21.0285, 105.8542, "placidus");
    // ASC di chuyển ~360°/ngày sidereal => trong 1 giây, thay đổi rất nhỏ (~0.004°), tuyệt đối không nhảy hàng chục độ.
    expect(isWithinTolerance(atMidnight.longitude, nearMidnight.longitude, 0.1)).toBe(true);
  });
});

describe("SwissEphemerisProvider — ngày ngoài phạm vi ephemeris file cho house calculation", () => {
  it("house calculation KHÔNG cần file .se1 (thuần lượng giác cầu) — vẫn tính được ở ngày ngoài phạm vi 1800-2400 mà getPlanetPosition đã từ chối", () => {
    // Đối lập có chủ đích với Phase 3A: getPlanetPosition ném SwissEphemerisPrecisionDegradedError
    // cho ngày 2500 (ngoài phạm vi file hành tinh) — nhưng house/angle calculation không phụ
    // thuộc ephemeris file (chỉ cần obliquity + sidereal time, Swiss Ephemeris tính analytic đầy
    // đủ chính xác không cần file), nên KHÔNG bị lỗi tương tự. Xác nhận bằng thực nghiệm.
    const farFuture = new Date("2500-01-01T00:00:00.000Z");
    expect(() => defaultProvider().getHouseCusps(farFuture, 21.0285, 105.8542, "placidus")).not.toThrow();
  });
});
