// Phase 24 — test matrix đầy đủ cho Thiên Khôi / Thiên Việt / Văn Xương / Văn Khúc / Tả Phù / Hữu Bật
// theo đúng mục IX yêu cầu. Thiên Khôi/Thiên Việt (10 Can) đã có test riêng ở tu-vi-thien-viet.test.ts,
// không lặp lại ở đây — file này tập trung: (1) Văn Xương/Văn Khúc đủ 12 Chi giờ sinh, (2) Tả Phù/Hữu Bật
// đủ 12 tháng sinh, (3) đối chiếu nguồn hocvienlyso.org (Level 1), (4) ghi nhận GM coverage.

import { describe, expect, it } from "vitest";
import { taPhuIndex, huuBatIndex, vanKhucIndex, vanXuongIndex } from "../src/lib/tu-vi/rules";
import { CHI } from "../src/lib/menh-nap-am";

describe("Phase 24 — C. Văn Xương: đủ 12 Chi giờ sinh, khởi Tuất tại giờ Tý, đếm nghịch (nguồn hocvienlyso.org)", () => {
  it("Giờ Tý (hourChiIndex=0): Văn Xương tại Tuất (điểm khởi)", () => {
    expect(vanXuongIndex(0)).toBe(10);
  });
  for (let h = 0; h < 12; h++) {
    it(`Giờ ${CHI[h]} (index ${h}): Văn Xương tại chi index ${(10 - h + 12) % 12} (đếm nghịch từ Tuất)`, () => {
      expect(vanXuongIndex(h)).toBe((10 - h + 12) % 12);
    });
  }
});

describe("Phase 24 — D. Văn Khúc: đủ 12 Chi giờ sinh, khởi Thìn tại giờ Tý, đếm thuận (nguồn hocvienlyso.org)", () => {
  it("Giờ Tý (hourChiIndex=0): Văn Khúc tại Thìn (điểm khởi)", () => {
    expect(vanKhucIndex(0)).toBe(4);
  });
  for (let h = 0; h < 12; h++) {
    it(`Giờ ${CHI[h]} (index ${h}): Văn Khúc tại chi index ${(4 + h) % 12} (đếm thuận từ Thìn)`, () => {
      expect(vanKhucIndex(h)).toBe((4 + h) % 12);
    });
  }
});

describe("Phase 24 — E. Tả Phù: đủ 12 tháng sinh, khởi Thìn tại tháng 1, đếm thuận (nguồn hocvienlyso.org)", () => {
  it("Tháng 1: Tả Phù tại Thìn (điểm khởi)", () => {
    expect(taPhuIndex(1)).toBe(4);
  });
  for (let m = 1; m <= 12; m++) {
    it(`Tháng ${m}: Tả Phù tại chi index ${(4 + (m - 1)) % 12} (đếm thuận từ Thìn)`, () => {
      expect(taPhuIndex(m)).toBe((4 + (m - 1)) % 12);
    });
  }
});

describe("Phase 24 — F. Hữu Bật: đủ 12 tháng sinh, khởi Tuất tại tháng 1, đếm nghịch (nguồn hocvienlyso.org)", () => {
  it("Tháng 1: Hữu Bật tại Tuất (điểm khởi)", () => {
    expect(huuBatIndex(1)).toBe(10);
  });
  for (let m = 1; m <= 12; m++) {
    it(`Tháng ${m}: Hữu Bật tại chi index ${(10 - (m - 1) + 12) % 12} (đếm nghịch từ Tuất)`, () => {
      expect(huuBatIndex(m)).toBe((10 - (m - 1) + 12) % 12);
    });
  }
});

describe("Phase 24 — Golden Master coverage cho cả 6 sao (Thiên Khôi/Việt/Văn Xương/Văn Khúc/Tả Phù/Hữu Bật)", () => {
  it("0/6 Golden Master (GM-001→006) ghi vị trí bất kỳ sao nào trong nhóm này — ghi nhận rõ, không tự tạo expected value từ GM", () => {
    // Đã rà lại toàn bộ TuVi_Golden_Master_Pack_V1.md ở Phase 24 — phần "Principal stars" của cả 6 GM chỉ
    // liệt kê 14 chính tinh, không có phụ tinh nào. Đây là giới hạn của chính bộ GM hiện có (đã ghi nhận
    // từ Phase 19 mục "Ghi chú quan trọng"), không phải thiếu sót riêng của nhóm sao này.
    expect(true).toBe(true);
  });
});
