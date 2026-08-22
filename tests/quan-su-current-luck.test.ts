// Kiểm tra engine "Vận Trình Hiện Tại" (Quân Sư Thiên Anh — Phase 4).
// Mục tiêu: (1) tái dùng đúng engine Bát Tự/Tử Vi, (2) trích đại vận/lưu niên hiện tại hợp lệ,
// (3) 4 thanh chỉ số nằm trong [0,10], (4) chạy được cả khi thiếu giờ sinh, (5) là context bổ trợ
// (không luận sự việc). Không kiểm giá trị luận cụ thể (đó là bản nháp cần Thầy hiệu chỉnh).

import { describe, expect, it } from "vitest";
import { tinhVanTrinhHienTai } from "../src/lib/quan-su/current-luck";

const NGUOI_A = { day: 20, month: 5, year: 1990, hour: 10, gender: "Nam" as const, nowYear: 2024 };

describe("Current Luck — trích vận trình từ engine có sẵn", () => {
  it("trả đủ cấu trúc: đại vận + lưu niên hiện tại + dụng thần + 4 thanh + timeline", () => {
    const ctx = tinhVanTrinhHienTai(NGUOI_A);
    expect(ctx.nguon).toBe("bat-tu");
    expect(ctx.tuoiHienTai).toBe(2024 - 1990 + 1); // tuổi mụ
    expect(ctx.daiVanHienTai.can.length).toBeGreaterThan(0);
    expect(ctx.daiVanHienTai.chi.length).toBeGreaterThan(0);
    expect(["tot", "binh_thuong", "xau"]).toContain(ctx.daiVanHienTai.danhGia);
    expect(ctx.luuNienHienTai.nam).toBe(2024);
    expect(ctx.dungThan.dungThan).toBeTruthy();
    expect(ctx.timeline.length).toBe(10); // 10 giai đoạn đại vận
    expect(ctx.coNhap).toBe(true); // đánh dấu bản nháp
  });

  it("đại vận hiện tại chứa đúng tuổi mụ, và timeline có đúng 1 giai đoạn 'laHienTai'", () => {
    const ctx = tinhVanTrinhHienTai(NGUOI_A);
    const dv = ctx.daiVanHienTai;
    expect(ctx.tuoiHienTai).toBeGreaterThanOrEqual(dv.tuoiBatDau);
    expect(ctx.tuoiHienTai).toBeLessThanOrEqual(dv.tuoiKetThuc);
    expect(ctx.timeline.filter((t) => t.laHienTai)).toHaveLength(1);
  });

  it("4 thanh chỉ số: đúng key, điểm trong [0,10] số nguyên; Biến động = higherIsBetter false", () => {
    const ctx = tinhVanTrinhHienTai(NGUOI_A);
    expect(ctx.dimensions.map((d) => d.key)).toEqual(["su-nghiep", "tai-chinh", "co-hoi", "bien-dong"]);
    for (const d of ctx.dimensions) {
      expect(Number.isInteger(d.score), d.key).toBe(true);
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(10);
    }
    expect(ctx.dimensions.find((d) => d.key === "bien-dong")!.higherIsBetter).toBe(false);
    expect(ctx.dimensions.find((d) => d.key === "su-nghiep")!.higherIsBetter).toBe(true);
  });

  it("có giờ sinh → thử chạy lớp Tử Vi (null nếu engine lỗi ở mốc này, không được ném)", () => {
    const ctx = tinhVanTrinhHienTai(NGUOI_A);
    // tuVi hoặc là object hợp lệ, hoặc null — KHÔNG được làm cả hàm ném lỗi.
    if (ctx.tuVi !== null) {
      expect(ctx.tuVi.daiVanCung.length).toBeGreaterThan(0);
      expect(Array.isArray(ctx.tuVi.chinhTinh)).toBe(true);
    }
  });

  it("KHÔNG có giờ sinh → vẫn chạy được (Bát Tự), gắn cờ gioSinhKnown=false, bỏ lớp Tử Vi", () => {
    const ctx = tinhVanTrinhHienTai({ day: 20, month: 5, year: 1990, gender: "Nam", nowYear: 2024 });
    expect(ctx.gioSinhKnown).toBe(false);
    expect(ctx.tuVi).toBeNull();
    expect(ctx.dimensions).toHaveLength(4);
    expect(ctx.signals.some((s) => s.includes("giờ sinh"))).toBe(true);
  });

  it("có tóm tắt 3 dòng + signals không rỗng (deterministic, cho LLM viết lại)", () => {
    const ctx = tinhVanTrinhHienTai(NGUOI_A);
    expect(ctx.tomTat.length).toBeGreaterThanOrEqual(3);
    expect(ctx.signals.length).toBeGreaterThan(0);
  });

  it("nhiều người sinh khác nhau → đại vận/dụng thần khác nhau (không phải hằng số cứng)", () => {
    const a = tinhVanTrinhHienTai(NGUOI_A);
    const b = tinhVanTrinhHienTai({ day: 3, month: 11, year: 1978, hour: 6, gender: "Nữ", nowYear: 2024 });
    // ít nhất 1 trong 2 khác nhau (đại vận hoặc dụng thần) — chứng tỏ có tính theo người thật.
    const khac = a.daiVanHienTai.can !== b.daiVanHienTai.can || a.dungThan.dungThan !== b.dungThan.dungThan;
    expect(khac).toBe(true);
  });
});
