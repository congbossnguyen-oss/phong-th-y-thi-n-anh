// Unit test cho module Quái Phục Ngâm (calculateFuYin) — CHỈ CẤP QUÁI, theo spec:
// "THÊM ENGINE: QUÁI PHỤC NGÂM — LỤC HÀO, VERSION 1.0".
//
// Nguồn sự thật là bảng 14 cặp quẻ Phục Ngâm cố định (2 chiều) — không suy diễn bằng
// "Quẻ Chính = Quẻ Biến" hay bằng quan hệ đối quái cấp đơn (Càn ↔ Chấn).

import { describe, expect, it } from "vitest";
import { calculateFuYin, lucHaoCastManual } from "../src/lib/luc-hao";

// Bảng 14 cặp đúng theo spec mục 2 + phân loại mục 4 — dùng để sinh đủ tối thiểu 28 test 2 chiều.
const FU_YIN_PAIRS: [string, string, "inner" | "outer" | "inner_outer"][] = [
  ["Thuần Càn", "Thuần Chấn", "inner_outer"],
  ["Thiên Lôi Vô Vọng", "Lôi Thiên Đại Tráng", "inner_outer"],
  ["Thiên Phong Cấu", "Lôi Phong Hằng", "outer"],
  ["Thiên Sơn Độn", "Lôi Sơn Tiểu Quá", "outer"],
  ["Thiên Địa Bĩ", "Lôi Địa Dự", "outer"],
  ["Lôi Hỏa Phong", "Thiên Hỏa Đồng Nhân", "outer"],
  ["Thiên Trạch Lý", "Lôi Trạch Quy Muội", "outer"],
  ["Lôi Thủy Giải", "Thiên Thủy Tụng", "outer"],
  ["Hỏa Thiên Đại Hữu", "Hỏa Lôi Phệ Hạp", "inner"],
  ["Thủy Lôi Truân", "Thủy Thiên Nhu", "inner"],
  ["Sơn Thiên Đại Súc", "Sơn Lôi Di", "inner"],
  ["Trạch Thiên Quải", "Trạch Lôi Tùy", "inner"],
  ["Phong Thiên Tiểu Súc", "Phong Lôi Ích", "inner"],
  ["Địa Thiên Thái", "Địa Lôi Phục", "inner"],
];

const LABELS = { inner: "Nội Quái Phục Ngâm", outer: "Ngoại Quái Phục Ngâm", inner_outer: "Toàn Quái Phục Ngâm" };

describe("calculateFuYin — 14 cặp x 2 chiều (28 test bắt buộc theo spec mục 10)", () => {
  for (const [a, b, type] of FU_YIN_PAIRS) {
    it(`${a} → ${b} => ${type}`, () => {
      const r = calculateFuYin(a, b);
      expect(r.enabled).toBe(true);
      expect(r.type).toBe(type);
      expect(r.label).toBe(LABELS[type]);
      expect(r.originalHexagram).toBe(a);
      expect(r.changedHexagram).toBe(b);
    });

    it(`${b} → ${a} => ${type} (chiều ngược)`, () => {
      const r = calculateFuYin(b, a);
      expect(r.enabled).toBe(true);
      expect(r.type).toBe(type);
      expect(r.label).toBe(LABELS[type]);
      expect(r.originalHexagram).toBe(b);
      expect(r.changedHexagram).toBe(a);
    });
  }
});

describe("calculateFuYin — ví dụ cụ thể trong spec mục 10", () => {
  it("Toàn quái: #1 Thuần Càn → #51 Thuần Chấn => inner_outer", () => {
    expect(calculateFuYin("Thuần Càn", "Thuần Chấn").type).toBe("inner_outer");
  });
  it("Toàn quái: #51 Thuần Chấn → #1 Thuần Càn => inner_outer", () => {
    expect(calculateFuYin("Thuần Chấn", "Thuần Càn").type).toBe("inner_outer");
  });
  it("Toàn quái: #25 Thiên Lôi Vô Vọng → #34 Lôi Thiên Đại Tráng => inner_outer", () => {
    expect(calculateFuYin("Thiên Lôi Vô Vọng", "Lôi Thiên Đại Tráng").type).toBe("inner_outer");
  });
  it("Toàn quái: #34 Lôi Thiên Đại Tráng → #25 Thiên Lôi Vô Vọng => inner_outer", () => {
    expect(calculateFuYin("Lôi Thiên Đại Tráng", "Thiên Lôi Vô Vọng").type).toBe("inner_outer");
  });
  it("Ngoại quái: #44 Thiên Phong Cấu → #32 Lôi Phong Hằng => outer", () => {
    expect(calculateFuYin("Thiên Phong Cấu", "Lôi Phong Hằng").type).toBe("outer");
  });
  it("Ngoại quái: #32 Lôi Phong Hằng → #44 Thiên Phong Cấu => outer", () => {
    expect(calculateFuYin("Lôi Phong Hằng", "Thiên Phong Cấu").type).toBe("outer");
  });
  it("Nội quái: #14 Hỏa Thiên Đại Hữu → #21 Hỏa Lôi Phệ Hạp => inner", () => {
    expect(calculateFuYin("Hỏa Thiên Đại Hữu", "Hỏa Lôi Phệ Hạp").type).toBe("inner");
  });
  it("Nội quái: #21 Hỏa Lôi Phệ Hạp → #14 Hỏa Thiên Đại Hữu => inner", () => {
    expect(calculateFuYin("Hỏa Lôi Phệ Hạp", "Hỏa Thiên Đại Hữu").type).toBe("inner");
  });
});

describe("calculateFuYin — cặp quẻ không nằm trong bảng 14 cặp", () => {
  it("Thuần Càn → Thuần Khôn (không có trong bảng) => enabled=false, type='none'", () => {
    const r = calculateFuYin("Thuần Càn", "Thuần Khôn");
    expect(r.enabled).toBe(false);
    expect(r.type).toBe("none");
    expect(r.label).toBe("");
  });

  it("Bất kỳ 2 quẻ ngẫu nhiên khác không thuộc bảng => none", () => {
    expect(calculateFuYin("Sơn Hỏa Bí", "Trạch Thủy Khốn").type).toBe("none");
    expect(calculateFuYin("Thuần Ly", "Thuần Khảm").type).toBe("none"); // đối quái nhưng KHÔNG phải Phục Ngâm
  });
});

describe("calculateFuYin — tích hợp qua lucHaoCastManual (quẻ không biến)", () => {
  it("Không có hào động => fuYin.enabled=false, type='none' (không tự động coi là Phục Ngâm)", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], { day: 10, month: 8, year: 2026, hour: 8, minute: 0 });
    expect(cast.bien).toBeNull();
    expect(cast.fuYin.enabled).toBe(false);
    expect(cast.fuYin.type).toBe("none");
  });

  it("fanYin và fuYin độc lập, không suy ra lẫn nhau — case Phục Ngâm toàn quái không phải Phản Ngâm", () => {
    // Thuần Càn (Càn-Càn, bits 1,1,1/1,1,1) -> hào 2,3,5,6 động -> Thuần Chấn (Chấn-Chấn, bits 1,0,0/1,0,0):
    // Phục Ngâm toàn quái, nhưng Càn/Chấn không nằm trong 4 cặp đối quái Phản Ngâm
    // (Càn↔Tốn, Khảm↔Ly, Cấn↔Khôn, Chấn↔Đoài) nên fanYin phải là false trong khi fuYin là true.
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [2, 3, 5, 6], { day: 10, month: 8, year: 2026, hour: 8, minute: 0 });
    expect(cast.chinh.name).toBe("Thuần Càn");
    expect(cast.bien?.name).toBe("Thuần Chấn");
    expect(cast.fuYin.enabled).toBe(true);
    expect(cast.fuYin.type).toBe("inner_outer");
    expect(cast.fanYin.enabled).toBe(false);
  });
});
