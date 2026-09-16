import { describe, expect, it } from "vitest";
import { normalizeResolution, uocTinhChiPhi } from "./cost";

describe("normalizeResolution — STEP 6 §2 (sửa bug so chuỗi thô '1080p')", () => {
  it.each([
    ["480p", "480p"],
    ["720p", "720p"],
    ["1080p", "1080p"],
    ["1080P", "1080p"], // Wan trả hoa — bug cũ không khớp
    ["720P", "720p"],
    ["1920x1080", "1080p"], // LTX dạng WIDTHxHEIGHT — bug cũ không khớp
    ["1280x720", "720p"],
    ["3840x2160", "2160p"],
    ["2560x1440", "1440p"],
    ["720x1280", "720p"], // dọc — vẫn cùng mức với ngang "1280x720"
    ["1080x1920", "1080p"],
  ] as const)("normalizeResolution(%s) === %s", (input, expected) => {
    expect(normalizeResolution(input)).toBe(expected);
  });

  it.each([undefined, null, "", "xyz", "4k", "abcxdef", "100x100"] as const)(
    "giá trị không hợp lệ (%s) -> null, không đoán mò",
    (input) => {
      expect(normalizeResolution(input)).toBeNull();
    },
  );
});

describe("uocTinhChiPhi", () => {
  it("tổ hợp provider:model chưa có giá -> trả 0 và khoaGia null, KHÔNG throw (không chặn generate)", () => {
    const est = uocTinhChiPhi({ provider: "wan", model: "model-khong-ton-tai" });
    expect(est.khoaGia).toBeNull();
    expect(est.usd).toBe(0);
  });

  it("có giá -> usd tỉ lệ thuận với số giây", () => {
    const est5s = uocTinhChiPhi({ provider: "wan", model: "wanx2.1-t2v-turbo", durationSeconds: 5 });
    const est10s = uocTinhChiPhi({ provider: "wan", model: "wanx2.1-t2v-turbo", durationSeconds: 10 });
    expect(est5s.khoaGia).not.toBeNull();
    expect(est10s.usd).toBeCloseTo(est5s.usd * 2, 4);
  });

  it("resolution '1080p' (chuỗi canonical thẳng) tính hệ số cao hơn '720p'", () => {
    const est720 = uocTinhChiPhi({ provider: "wan", model: "wanx2.1-t2v-turbo", durationSeconds: 5, resolution: "720p" });
    const est1080 = uocTinhChiPhi({ provider: "wan", model: "wanx2.1-t2v-turbo", durationSeconds: 5, resolution: "1080p" });
    expect(est1080.usd).toBeGreaterThan(est720.usd);
  });

  it("BUG ĐÃ SỬA: resolution THẬT của Wan ('1080P', hoa) phải được tính hệ số 1080p, không rơi về mặc định", () => {
    const estThapChuHoa = uocTinhChiPhi({ provider: "wan", model: "wanx2.1-t2v-turbo", durationSeconds: 5, resolution: "1080P" });
    const est1080Canonical = uocTinhChiPhi({ provider: "wan", model: "wanx2.1-t2v-turbo", durationSeconds: 5, resolution: "1080p" });
    expect(estThapChuHoa.usd).toBe(est1080Canonical.usd);
  });

  it("BUG ĐÃ SỬA: resolution THẬT của LTX ('1920x1080', dạng kích thước) phải được tính hệ số 1080p", () => {
    const estLtx1080 = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-5-fast", durationSeconds: 6, resolution: "1920x1080" });
    const estLtx720 = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-5-fast", durationSeconds: 6, resolution: "1280x720" });
    expect(estLtx1080.usd).toBeGreaterThan(estLtx720.usd);
  });

  it("resolution không nhận dạng được -> dùng hệ số mặc định 1, KHÔNG throw", () => {
    const est = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-5-fast", durationSeconds: 6, resolution: "khong-hop-le" });
    expect(est.khoaGia).not.toBeNull();
    const estKhongResolution = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-5-fast", durationSeconds: 6 });
    expect(est.usd).toBe(estKhongResolution.usd);
  });

  describe("ltx-2-3-fast — default V1 (13/9/2026, giá chính thức)", () => {
    it("6s @ 720p (1280x720) -> ĐÚNG $0.18, khớp số thật LTX từng báo (insufficient_funds: 'Required: 18 cents')", () => {
      const est = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-3-fast", durationSeconds: 6, resolution: "1280x720" });
      expect(est.khoaGia).toBe("ltx:ltx-2-3-fast");
      expect(est.usd).toBe(0.18);
    });

    it("hệ số theo resolution tăng đúng tỉ lệ giá chính thức (1080p=2x, 1440p=4x, 4K=8x so với 720p)", () => {
      const p720 = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-3-fast", durationSeconds: 6, resolution: "1280x720" });
      const p1080 = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-3-fast", durationSeconds: 6, resolution: "1920x1080" });
      const p1440 = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-3-fast", durationSeconds: 6, resolution: "2560x1440" });
      const p4k = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-3-fast", durationSeconds: 6, resolution: "3840x2160" });
      expect(p1080.usd).toBeCloseTo(p720.usd * 2, 6);
      expect(p1440.usd).toBeCloseTo(p720.usd * 4, 6);
      expect(p4k.usd).toBeCloseTo(p720.usd * 8, 6);
    });

    it("ltx-2-5-fast KHÔNG bị đổi giá bởi việc thêm entry ltx-2-3-fast", () => {
      const est = uocTinhChiPhi({ provider: "ltx", model: "ltx-2-5-fast", durationSeconds: 6, resolution: "1280x720" });
      expect(est.usd).toBe(0.54); // 6 * 0.09, y hệt trước khi thêm ltx-2-3-fast
    });
  });
});
