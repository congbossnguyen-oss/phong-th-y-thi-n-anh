import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

import { SwissEphemerisProvider } from "../SwissEphemerisProvider.js";
import { SwissEphemerisUnsupportedAyanamsaError } from "../errors.js";

const EMPTY_EPHEMERIS_DIR = fileURLToPath(new URL(".", import.meta.url)); // thư mục test — không có file .se1 nào.

/**
 * QUAN TRỌNG: xem ghi chú process-wide state ở `SwissEphemerisProvider.test.ts` — mỗi test tự
 * dựng provider mới ngay trước khi dùng. Với `getAyanamsa` còn có thêm state process-wide RIÊNG
 * (`set_sid_mode`, độc lập với `set_ephe_path`) — kiểm tra kỹ tương tác giữa nhiều lần gọi với
 * `ayanamsaId` khác nhau trên CÙNG một instance (không chỉ giữa các instance khác nhau).
 */
function defaultProvider(): SwissEphemerisProvider {
  return new SwissEphemerisProvider();
}

const J2000_UTC = new Date("2000-01-01T12:00:00.000Z");

describe("SwissEphemerisProvider.getAyanamsa — hình dạng kết quả cơ bản", () => {
  it("Lahiri tại J2000.0 nằm trong khoảng hợp lý đã biết công khai (~23-24°, KHÔNG lệch bậc-độ-lớn) — KHÔNG phải một oracle cross-check đầy đủ (dành cho Step 3/4), chỉ là kiểm tra không có lỗi sai bậc/dấu rõ ràng", () => {
    const value = defaultProvider().getAyanamsa(J2000_UTC, "lahiri");
    expect(value).toBeGreaterThan(23);
    expect(value).toBeLessThan(24);
  });

  it("Raman cho giá trị KHÁC Lahiri tại CÙNG thời điểm (xác nhận ayanamsaId thực sự ảnh hưởng kết quả, không phải luôn trả cùng 1 số)", () => {
    const provider = defaultProvider();
    const lahiri = provider.getAyanamsa(J2000_UTC, "lahiri");
    const raman = provider.getAyanamsa(J2000_UTC, "raman");
    expect(lahiri).not.toBeCloseTo(raman, 1);
  });

  it("KP (Krishnamurti) và True Chitrapaksha cũng cho giá trị hợp lệ, hữu hạn, khác Lahiri", () => {
    const provider = defaultProvider();
    const lahiri = provider.getAyanamsa(J2000_UTC, "lahiri");
    const kp = provider.getAyanamsa(J2000_UTC, "kp");
    const trueChitrapaksha = provider.getAyanamsa(J2000_UTC, "true_chitrapaksha");
    for (const value of [kp, trueChitrapaksha]) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(kp).not.toBeCloseTo(lahiri, 1);
  });

  it("KHÔNG làm tròn — giữ nguyên độ chính xác đầy đủ (double), không phải số nguyên/2-thập-phân", () => {
    const value = defaultProvider().getAyanamsa(J2000_UTC, "lahiri");
    // Một giá trị double thực (không bị làm tròn) có nhiều chữ số thập phân — nếu bị làm tròn về
    // vd. 2 chữ số, phần thập phân sẽ ngắn hơn hẳn.
    expect(value.toString().replace(/^-?\d+\./, "").length).toBeGreaterThan(4);
  });
});

describe("SwissEphemerisProvider.getAyanamsa — tuế sai (precession): tăng dần theo thời gian", () => {
  it("Lahiri tại 2020 LỚN HƠN Lahiri tại 1950 (ayanamsa tăng chậm theo tuế sai trục Trái Đất, không giảm/không cố định)", () => {
    const provider = defaultProvider();
    const y1950 = provider.getAyanamsa(new Date("1950-01-01T00:00:00.000Z"), "lahiri");
    const y2020 = provider.getAyanamsa(new Date("2020-01-01T00:00:00.000Z"), "lahiri");
    expect(y2020).toBeGreaterThan(y1950);
    // Tuế sai ~50"/năm => ~70 năm * 50"/năm ≈ 0.97° — kiểm tra biên độ hợp lý (không phải nhảy vọt bất thường hay gần như không đổi).
    expect(y2020 - y1950).toBeGreaterThan(0.5);
    expect(y2020 - y1950).toBeLessThan(1.5);
  });
});

describe("SwissEphemerisProvider.getAyanamsa — an toàn state process-wide (set_sid_mode)", () => {
  it("gọi xen kẽ nhiều ayanamsaId khác nhau trên CÙNG 1 instance vẫn cho đúng giá trị mỗi lần — set_sid_mode được gọi lại mỗi lần gọi, không dùng state cũ của lần gọi trước", () => {
    const provider = defaultProvider();
    const lahiriFirst = provider.getAyanamsa(J2000_UTC, "lahiri");
    const raman = provider.getAyanamsa(J2000_UTC, "raman");
    const lahiriSecond = provider.getAyanamsa(J2000_UTC, "lahiri");
    expect(lahiriSecond).toBe(lahiriFirst); // KHÔNG bị ảnh hưởng bởi lần gọi "raman" ở giữa
    expect(raman).not.toBeCloseTo(lahiriFirst, 1);
  });
});

describe("SwissEphemerisProvider.getAyanamsa — ayanamsa không hỗ trợ", () => {
  it("một ayanamsaId lạ ném SwissEphemerisUnsupportedAyanamsaError, KHÔNG trả số liệu bịa (native KHÔNG tự từ chối sid_mode lạ, PHẢI validate trước)", () => {
    expect(() => defaultProvider().getAyanamsa(J2000_UTC, "not_a_real_ayanamsa")).toThrow(SwissEphemerisUnsupportedAyanamsaError);
  });
});

describe("SwissEphemerisProvider.getAyanamsa — deterministic", () => {
  it("gọi lại nhiều lần cho cùng input luôn cho cùng kết quả tuyệt đối", () => {
    const provider = defaultProvider();
    const first = provider.getAyanamsa(J2000_UTC, "lahiri");
    const second = provider.getAyanamsa(J2000_UTC, "lahiri");
    expect(first).toBe(second);
  });
});

describe("SwissEphemerisProvider.getAyanamsa — KHÔNG cần file ephemeris (xác nhận thực nghiệm, giống house calculation ở Phase 3B-1)", () => {
  it("giá trị GIỐNG HỆT dù trỏ ephemerisPath tới thư mục KHÔNG có file .se1 — ayanamsa là phép tính tuế sai/lượng giác thuần tuý, không phụ thuộc file", () => {
    const withFiles = defaultProvider().getAyanamsa(J2000_UTC, "lahiri");
    const emptyDirProvider = new SwissEphemerisProvider({ ephemerisPath: EMPTY_EPHEMERIS_DIR });
    const withoutFiles = emptyDirProvider.getAyanamsa(J2000_UTC, "lahiri");
    expect(withoutFiles).toBe(withFiles);
  });
});
