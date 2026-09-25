// Phase 2 — TỨ THẦN (Dụng/Nguyên/Kỵ Thần) structured, deterministic ở RULE LAYER.
// Kiểm tra STRUCTURED DATA (không phải prose). Bất biến sinh/khắc được assert generic theo ngũ hành
// Dụng Thần đã resolve — không hardcode hào cụ thể, nên không phụ thuộc ngày gieo quẻ.
import { describe, it, expect } from "vitest";
import {
  resolveDungThan,
  resolveFourGods,
  type DungThanResolved,
  type FourGods,
} from "./advisory-engine";
import { castLucHaoFromTosses, castInputNow, buildInterpretationPayload } from "./divination";
import { getQuestion } from "./index";
import { buildAdvisoryReport } from "./advisory-engine";
import type { CoinLineValue } from "../luc-hao";
import type { NguHanh } from "../menh-nap-am";

// Nạp Giáp (ngũ hành từng hào) là xác định từ TOSSES, độc lập ngày → four-god classification xác định.
const TOSSES: CoinLineValue[] = [7, 8, 9, 7, 6, 8]; // có hào động (9 ở hào 3, 6 ở hào 5)
const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

function castMau() {
  return castLucHaoFromTosses(TOSSES, castInputNow());
}

/** Dụng Thần = Hào Thế (luôn hiện) → element xác định, tiện kiểm bất biến. */
function fourGodsTheHao(): { fg: FourGods; dt: DungThanResolved; chinh: ReturnType<typeof castMau>["chinh"]; cast: ReturnType<typeof castMau> } {
  const cast = castMau();
  const dt = resolveDungThan(cast.chinh, { kind: "the-hao" });
  return { fg: resolveFourGods(cast, dt), dt, chinh: cast.chinh, cast };
}

describe("Phase 2 — Tứ Thần structured (Dụng → Nguyên/Kỵ; Cừu hoãn)", () => {
  it("Nguyên Thần: mọi thành viên đều SINH Dụng Thần, đủ provenance, đầy đủ (completeness)", () => {
    const { fg, dt, chinh } = fourGodsTheHao();
    expect(fg.dungThanNguHanh).not.toBeNull();
    const dung = fg.dungThanNguHanh!;
    for (const m of fg.nguyenThan) {
      expect(SINH[m.nguHanh]).toBe(dung); // đúng quan hệ sinh Dụng
      expect(m.quanHe).toBe("sinh-dung-than");
      expect(typeof m.hao).toBe("number");
      expect(m.lucThan).toBeTruthy();
      expect(m.lyDo).toContain("Nguyên Thần");
    }
    // Completeness: mọi hào hiện (trừ hào Dụng Thần) mà SINH === dung đều có mặt.
    const dungPos = dt.hao?.hao;
    const expected = chinh.hao.filter((h) => h.hao !== dungPos && SINH[h.nguHanh] === dung).map((h) => h.hao).sort();
    expect(fg.nguyenThan.map((m) => m.hao).sort()).toEqual(expected);
  });

  it("Kỵ Thần: mọi thành viên đều KHẮC Dụng Thần, đầy đủ (completeness)", () => {
    const { fg, dt, chinh } = fourGodsTheHao();
    const dung = fg.dungThanNguHanh!;
    for (const m of fg.kyThan) {
      expect(KHAC[m.nguHanh]).toBe(dung);
      expect(m.quanHe).toBe("khac-dung-than");
      expect(m.lyDo).toContain("Kỵ Thần");
    }
    const dungPos = dt.hao?.hao;
    const expected = chinh.hao.filter((h) => h.hao !== dungPos && KHAC[h.nguHanh] === dung).map((h) => h.hao).sort();
    expect(fg.kyThan.map((m) => m.hao).sort()).toEqual(expected);
  });

  it("Nguyên Thần và Kỵ Thần rời nhau (một hào không thể vừa sinh vừa khắc)", () => {
    const { fg } = fourGodsTheHao();
    const nguyen = new Set(fg.nguyenThan.map((m) => m.hao));
    for (const m of fg.kyThan) expect(nguyen.has(m.hao)).toBe(false);
  });

  it("Hào Dụng Thần (khi hiện) KHÔNG tự là Nguyên/Kỵ của chính nó", () => {
    const { fg, dt } = fourGodsTheHao();
    const dungPos = dt.hao!.hao;
    expect(fg.nguyenThan.some((m) => m.hao === dungPos)).toBe(false);
    expect(fg.kyThan.some((m) => m.hao === dungPos)).toBe(false);
  });

  it("moving/static không làm sai phân loại: isDong chỉ là metadata, đúng theo hào gốc", () => {
    const { fg, chinh } = fourGodsTheHao();
    for (const m of [...fg.nguyenThan, ...fg.kyThan]) {
      const h = chinh.hao.find((x) => x.hao === m.hao)!;
      expect(m.isDong).toBe(h.isDong); // metadata trung thực, không đổi phân loại
    }
  });

  it("Cừu Thần: HOÃN ở Phase 2 (resolved=false + lý do), không tự chọn định nghĩa", () => {
    const { fg } = fourGodsTheHao();
    expect(fg.cuuThan.resolved).toBe(false);
    expect(fg.cuuThan.lyDo).toContain("Cừu Thần");
  });

  it("Không có candidate / Dụng Thần không hiện: dungThanNguHanh null, mảng rỗng", () => {
    const cast = castMau();
    const dtKhong: DungThanResolved = { hao: null, target: "Thê Tài", trangThai: "khong_hien", lyDo: "" };
    const fg = resolveFourGods(cast, dtKhong);
    expect(fg.dungThanNguHanh).toBeNull();
    expect(fg.nguyenThan).toEqual([]);
    expect(fg.kyThan).toEqual([]);
    expect(fg.cuuThan.resolved).toBe(false);
  });

  it("Phục Thần (nếu quẻ hiện tại có): dung ngũ hành lấy theo Chi của Phục Thần", async () => {
    const cast = castMau();
    const host = cast.chinh.hao.find((h) => h.phucThan);
    if (!host) return; // quẻ này không có Phục Thần — nhánh null/hien đã phủ; bỏ qua đúng "nếu hỗ trợ"
    const dtPhuc: DungThanResolved = { hao: host, target: host.phucThan!.lucThan, trangThai: "phuc_tang", lyDo: "" };
    const fg = resolveFourGods(cast, dtPhuc);
    // Không loại hào host (Dụng Thần là phục thần, không phải hào hiện) → derivation vẫn chạy.
    const { CHI_NGU_HANH } = await import("../bat-tu");
    expect(fg.dungThanNguHanh).toBe(CHI_NGU_HANH[host.phucThan!.chiIndex]);
  });

  it("determinism: cùng quẻ + cùng Dụng Thần → kết quả giống hệt", () => {
    const cast = castMau();
    const dt = resolveDungThan(cast.chinh, { kind: "the-hao" });
    expect(resolveFourGods(cast, dt)).toEqual(resolveFourGods(cast, dt));
  });

  it("tích hợp: buildAdvisoryReport().fourGods có mặt và khớp resolveFourGods (không regression)", () => {
    const q = getQuestion("vay-tien")!;
    const cast = castMau();
    const payload = buildInterpretationPayload(q, cast, { method: "luc-hao-tosses" });
    const report = buildAdvisoryReport(payload);
    expect(report.fourGods).toBeDefined();
    const dt = resolveDungThan(cast.chinh, payload.question.dung_than_hint);
    expect(report.fourGods).toEqual(resolveFourGods(cast, dt));
  });
});

describe("Phase 3 — four-god FACT signals (state + interactions, không scoring)", () => {
  it("state fidelity: vuongSuy / khongVong / trườngSinh / Nguyệt-Nhật Phá đúng theo hào gốc", async () => {
    const { fg, chinh, cast } = fourGodsTheHao();
    const { tienThoaiCuaHao } = await import("../luc-hao-tien-thoai-than");
    for (const m of [...fg.nguyenThan, ...fg.kyThan]) {
      const h = chinh.hao.find((x) => x.hao === m.hao)!;
      // state = FACT đã tính trên HaoInfo, không tính lại.
      expect(m.state.vuongSuy).toBe(h.vuongSuy);
      expect(m.state.khongVong).toBe(h.xunKong);
      expect(m.state.truongSinh.nhat).toBe(h.growthDay);
      expect(m.state.truongSinh.nguyet).toBe(h.growthMonth);
      expect(m.state.nguyetPha).toBe(h.relations.some((r) => r.type === "Nguyệt Phá"));
      expect(m.state.nhatPha).toBe(h.relations.some((r) => r.type === "Nhật Phá"));
      // interactions = dữ liệu engine hiện có (không duplicate calc).
      expect(m.interactions.nhatNguyet).toEqual(h.relations);
      expect(m.interactions.tienThoai).toEqual(tienThoaiCuaHao(cast, h.hao));
    }
  });

  it("KHÔNG có strength score / weight (Phase 3 chỉ expose FACT)", () => {
    const { fg } = fourGodsTheHao();
    for (const m of [...fg.nguyenThan, ...fg.kyThan]) {
      for (const banned of ["strengthScore", "powerScore", "weight", "mucDoManh", "score", "diem"]) {
        expect(m).not.toHaveProperty(banned);
        expect(m.state).not.toHaveProperty(banned);
      }
    }
  });

  it("mỗi member có đủ state + interactions (schema đầy đủ)", () => {
    const { fg } = fourGodsTheHao();
    for (const m of [...fg.nguyenThan, ...fg.kyThan]) {
      expect(m.state).toBeDefined();
      expect(m.interactions).toBeDefined();
      expect(m.interactions).toHaveProperty("nhatNguyet");
      expect(m.interactions).toHaveProperty("tienThoai");
    }
  });
});
