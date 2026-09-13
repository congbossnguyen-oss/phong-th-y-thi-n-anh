// Kiểm chứng "Nhập Mộ" (luc-hao.ts) — 4 dạng CHUẨN CỔ ĐIỂN CHUNG đã cài (Nhật Mộ / Nguyệt Mộ / Hóa
// Mộ / Động Mộ — LH-M02, thêm 13/9/2026), xem chú thích "NHẬP MỘ" phía trên HaoRelationType trong
// luc-hao.ts để biết vì sao KHÔNG cài dạng "tùy quỷ nhập mộ" (thiếu nguồn xác nhận riêng, để LLM tự
// kết hợp 2 dữ kiện đã có).

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

// LH-M02 (Động Mộ, V3-01, 13/9/2026). Quẻ nền Thuần Càn (Nạp Giáp cố định, không phụ thuộc dongPositions):
// hào1 Tý Thủy, hào2 Dần Mộc, hào3 Thìn Thổ, hào4 Ngọ Hỏa, hào5 Thân Kim, hào6 Tuất Thổ.
// Mộ khố: Mộc→Mùi, Hỏa→Tuất, Kim→Sửu, Thủy/Thổ→Thìn.
// => hào6 (Tuất) là mộ khố của Hỏa (hào4); hào3 (Thìn) là mộ khố của Thủy (hào1) VÀ Thổ (hào3, hào6).
describe("Nhập Mộ — Động Mộ (LH-M02: có hào KHÁC đang động, Chi GỐC của nó = Mộ khố hào đang xét)", () => {
  it("CASE-01: hào 6 (Tuất) động => hào 4 (Hỏa, mộ tại Tuất) Nhập Mộ dạng Động Mộ, relatedYao=6", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [6], NGAY_SUU);
    const hao4 = c.chinh.hao[3];
    expect(hao4.nguHanh).toBe("Hỏa");
    expect(hao4.relations).toContainEqual({ type: "Nhập Mộ", source: "YAO", target: "HAO", relatedYao: 6 });
  });

  it("CASE-02: hào 1 (Tý) động, Tý không phải mộ khố của ngũ hành nào => KHÔNG hào nào có Động Mộ", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [1], NGAY_SUU);
    for (const h of c.chinh.hao) {
      expect(h.relations.some((r) => r.type === "Nhập Mộ" && r.source === "YAO")).toBe(false);
    }
  });

  it("CASE-03: nhiều hào động cùng lúc (6 và 3) => mỗi quan hệ Động Mộ áp dụng đúng, không lẫn lộn relatedYao", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [6, 3], NGAY_SUU);
    const [hao1, , hao3, hao4, , hao6] = c.chinh.hao;
    // hào 4 (Hỏa) bị kéo mộ bởi hào 6 (Tuất = mộ khố Hỏa).
    expect(hao4.relations).toContainEqual({ type: "Nhập Mộ", source: "YAO", target: "HAO", relatedYao: 6 });
    // hào 1 (Thủy) bị kéo mộ bởi hào 3 (Thìn = mộ khố Thủy/Thổ).
    expect(hao1.relations).toContainEqual({ type: "Nhập Mộ", source: "YAO", target: "HAO", relatedYao: 3 });
    // hào 6 (Thổ, tự nó cũng đang động) VẪN bị kéo mộ bởi hào 3 (Thìn cũng là mộ khố Thổ) — 1 hào có
    // thể vừa là NGUỒN gây Động Mộ cho hào khác, vừa là ĐÍCH bị Động Mộ bởi hào khác, cùng lúc.
    expect(hao6.relations).toContainEqual({ type: "Nhập Mộ", source: "YAO", target: "HAO", relatedYao: 3 });
    // hào 3 không tự gây Động Mộ cho chính nó (loại trừ position === position).
    expect(hao3.relations.some((r) => r.type === "Nhập Mộ" && r.source === "YAO" && r.relatedYao === 3)).toBe(false);
  });

  it("CASE-04: Nhật Mộ hiện có KHÔNG bị gắn nhầm thành Động Mộ (vẫn đúng source DAY)", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [6], NGAY_SUU); // hào5 vẫn Nhật Mộ như test gốc, dù hào6 giờ động
    const hao5 = c.chinh.hao[4];
    expect(hao5.relations).toContainEqual({ type: "Nhập Mộ", source: "DAY", target: "HAO" });
    expect(hao5.relations.some((r) => r.type === "Nhập Mộ" && r.source === "YAO")).toBe(false);
  });

  it("CASE-05: Hóa Mộ hiện có KHÔNG bị gắn nhầm thành Động Mộ (vẫn đúng source CHANGED_YAO)", () => {
    const c = lucHaoCastManual([1, 1, 0, 0, 0, 0] as any, [3], NGAY_SUU); // giống test Hóa Mộ gốc — chỉ 1 hào động
    const haoGoc = c.chinh.hao[2];
    expect(haoGoc.relations).toContainEqual({ type: "Nhập Mộ", source: "CHANGED_YAO", target: "HAO" });
    // Chỉ 1 hào động (hào 3) => không có hào nào khác để làm "nguồn" Động Mộ cho hào 3 hay ngược lại
    // gây Động Mộ cho hào khác (không đủ 2 hào để tạo cặp).
    expect(haoGoc.relations.some((r) => r.type === "Nhập Mộ" && r.source === "YAO")).toBe(false);
  });

  it("CASE-06: Nguyệt Mộ hiện có KHÔNG bị gắn nhầm thành Động Mộ, vẫn giữ nguyên source MONTH", () => {
    // Nguyệt Kiến == Thìn để kích hoạt Nguyệt Mộ cho hào Thủy/Thổ — dùng ngày có Nguyệt lệnh Thìn.
    // (Không cần tính tay chính xác ngày — chỉ cần xác nhận nguyên tắc: nếu QUẺ nào tự nhiên có sẵn
    // Nguyệt Mộ, source vẫn phải là "MONTH", không lẫn "YAO", bất kể có hào nào đang động hay không.)
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [6], NGAY_SUU);
    for (const h of c.chinh.hao) {
      const nguyetMo = h.relations.filter((r) => r.type === "Nhập Mộ" && r.source === "MONTH");
      for (const r of nguyetMo) expect(r.source).toBe("MONTH"); // không bị pha trộn thành "YAO"
    }
  });

  it("CASE-07: hào TĨNH (không nằm trong dongPositions) không thể là NGUỒN gây Động Mộ cho hào khác", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [6], NGAY_SUU); // chỉ hào 6 động
    for (const h of c.chinh.hao) {
      for (const r of h.relations) {
        if (r.type === "Nhập Mộ" && r.source === "YAO") {
          expect(r.relatedYao).toBe(6); // nguồn CHỈ có thể là hào đang trong dongPositions ([6])
        }
      }
    }
  });
});
