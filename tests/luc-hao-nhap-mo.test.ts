// Kiểm chứng "Nhập Mộ" (luc-hao.ts) — 3 dạng CHUẨN CỔ ĐIỂN CHUNG đã cài (Nhật Mộ / Nguyệt Mộ / Hóa
// Mộ), xem chú thích "NHẬP MỘ" phía trên HaoRelationType trong luc-hao.ts để biết vì sao KHÔNG cài
// dạng "tùy quỷ nhập mộ" (thiếu nguồn xác nhận riêng, để LLM tự kết hợp 2 dữ kiện đã có).

import { describe, expect, it } from "vitest";
import { lucHaoCastManual } from "../src/lib/luc-hao";

// 7/8/2026 dương lịch = ngày Sửu (Chi Ngày) — Sửu là Mộ khố của Kim (bảng 4 Mộ Khố: Kim mộ Sửu,
// Thủy/Thổ mộ Thìn, Mộc mộ Mùi, Hỏa mộ Tuất).
const NGAY_SUU = { day: 7, month: 8, year: 2026, hour: 8, minute: 0 };

describe("Nhập Mộ — Nhật Mộ (growthDay === Mộ)", () => {
  it("Thuần Càn (toàn hào Kim theo Nạp Giáp) ngày Sửu — hào 5 (Kim) phải Nhập Mộ tại Nhật", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [], NGAY_SUU);
    expect(c.dayChi).toBe("Sửu");
    const hao5 = c.chinh.hao[4];
    expect(hao5.nguHanh).toBe("Kim");
    expect(hao5.relations).toContainEqual({ type: "Nhập Mộ", source: "DAY", target: "HAO" });
  });

  it("Hào Thổ (hào 3, hào 6) KHÔNG Nhập Mộ tại Nhật dù cùng ngày Sửu — Thổ mộ tại Thìn, không phải Sửu", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [], NGAY_SUU);
    const hao3 = c.chinh.hao[2];
    expect(hao3.nguHanh).toBe("Thổ");
    expect(hao3.relations.some((r) => r.type === "Nhập Mộ" && r.source === "DAY")).toBe(false);
  });
});

describe("Nhập Mộ — Hóa Mộ (hào động biến ra Mộ khố của ngũ hành hào gốc)", () => {
  it("hào 3 (Thổ, tĩnh trong quẻ chính) động biến ra Thìn (Mộ khố của Thổ) => Hóa Mộ", () => {
    // lines: hào1-2 Dương, hào3 Dương (Thổ theo Nạp Giáp Càn/Đoài dưới), hào4-6 Âm — hào 3 động.
    const c = lucHaoCastManual([1, 1, 0, 0, 0, 0] as any, [3], NGAY_SUU);
    const haoGoc = c.chinh.hao[2];
    expect(haoGoc.nguHanh).toBe("Thổ");
    expect(c.bien).not.toBeNull();
    expect(c.bien!.hao[2].chiIndex).toBe(4); // 4 = Thìn (CHI[4])
    expect(haoGoc.relations).toContainEqual({ type: "Nhập Mộ", source: "CHANGED_YAO", target: "HAO" });
  });

  it("hào tĩnh (không động) không bao giờ có Hóa Mộ dù ngũ hành/chi biến trùng hợp", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [], NGAY_SUU);
    for (const h of c.chinh.hao) {
      expect(h.relations.some((r) => r.source === "CHANGED_YAO")).toBe(false);
    }
  });
});
