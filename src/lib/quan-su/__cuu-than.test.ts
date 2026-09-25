// Phase 16 — CỪU THẦN. Deterministic contextual FACT (spec §260/§229): hành SINH Kỵ = KHẮC Nguyên.
// Cừu ≠ Kỵ. Không score/verdict, không đưa vào chuỗi, không override kết luận.
import { describe, it, expect } from "vitest";
import { synthesizeCuuThan } from "./cuu-than";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { FourGods, FourGodMember } from "./advisory-engine";

function mkHao(hao: number, chiName: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chiName);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
const mkCast = (hao: HaoInfo[]): FullCastResult => ({ chinh: { hao }, bien: null, dongPositions: [], dayChi: "Sửu", monthChi: "Sửu", yearChi: "Sửu" } as unknown as FullCastResult);
const member = (hao: number, nguHanh: string): FourGodMember => ({ hao, nguHanh } as unknown as FourGodMember);
const fg = (over: Partial<FourGods>): FourGods =>
  ({ dungThanNguHanh: "Mộc", trangThai: "hien", nguyenThan: [], kyThan: [], cuuThan: { resolved: false, lyDo: "" }, ...over } as unknown as FourGods);

// Dụng Mộc → Kỵ Kim → Cừu Thổ (sinh Kim, khắc Nguyên Thủy). Nguyên Thủy.
// hào1 Tý(Thủy)=Nguyên, hào2 Sửu(Thổ)=Cừu, hào3 Dậu(Kim)=Kỵ, hào4 Ngọ(Hỏa)=tiết, hào6 Dần(Mộc)=Dụng.
const casePack = () => {
  const hao = [mkHao(1, "Tý"), mkHao(2, "Sửu"), mkHao(3, "Dậu"), mkHao(4, "Ngọ"), mkHao(5, "Mão"), mkHao(6, "Dần")];
  const cast = mkCast(hao);
  const fourGods = fg({ dungThanNguHanh: "Mộc", nguyenThan: [member(1, "Thủy")], kyThan: [member(3, "Kim")] });
  return { cast, fourGods };
};

describe("Phase 16 — Cừu Thần formation (spec-locked)", () => {
  it("Dụng Mộc → Cừu = Thổ (sinh Kỵ Kim, khắc Nguyên Thủy)", () => {
    const { cast, fourGods } = casePack();
    const r = synthesizeCuuThan(cast, fourGods);
    expect(r.cuuNguHanh).toBe("Thổ");
    expect(r.members.map((m) => m.lineIndex)).toEqual([2]); // hào Sửu (Thổ)
    expect(r.members[0].nguHanh).toBe("Thổ");
  });
  it("Cừu ≠ Kỵ: hào Kỵ (Kim) KHÔNG bị coi là Cừu", () => {
    const { cast, fourGods } = casePack();
    const r = synthesizeCuuThan(cast, fourGods);
    expect(r.members.some((m) => m.lineIndex === 3)).toBe(false); // hào3 là Kỵ, không phải Cừu
    expect(r.cuuNguHanh).not.toBe("Kim");
  });
  it("no false positive: hào tiết (Hỏa) và Nguyên (Thủy) KHÔNG là Cừu", () => {
    const { cast, fourGods } = casePack();
    const r = synthesizeCuuThan(cast, fourGods);
    const lines = r.members.map((m) => m.lineIndex);
    expect(lines).not.toContain(4); // Ngọ Hỏa (tiết)
    expect(lines).not.toContain(1); // Tý Thủy (Nguyên)
  });
  it("Cừu không xuất hiện trên quẻ → members rỗng, cuuNguHanh vẫn xác định", () => {
    const hao = [mkHao(1, "Tý"), mkHao(2, "Mão"), mkHao(3, "Dậu"), mkHao(4, "Ngọ"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const r = synthesizeCuuThan(mkCast(hao), fg({ dungThanNguHanh: "Mộc", nguyenThan: [member(1, "Thủy")], kyThan: [member(3, "Kim")] }));
    expect(r.cuuNguHanh).toBe("Thổ");
    expect(r.members).toHaveLength(0);
  });
  it("mọi hành Dụng → Cừu = 'sinh Kỵ' và 'khắc Nguyên' cho CÙNG một hành (nhất quán)", () => {
    // kiểm 5 hành: Cừu(Dụng) đã biết cổ điển: Mộc→Thổ, Hỏa→Kim, Thổ→Thủy, Kim→Mộc, Thủy→Hỏa.
    const expected: Record<string, string> = { "Mộc": "Thổ", "Hỏa": "Kim", "Thổ": "Thủy", "Kim": "Mộc", "Thủy": "Hỏa" };
    for (const [dung, cuu] of Object.entries(expected)) {
      const r = synthesizeCuuThan(mkCast([mkHao(1, "Tý")]), fg({ dungThanNguHanh: dung as FourGods["dungThanNguHanh"] }));
      expect(r.cuuNguHanh).toBe(cuu);
    }
  });
});

describe("Phase 16 — relations + provenance + role", () => {
  it("quan hệ FACT: Cừu → Kỵ (SINH_KY) và Cừu → Nguyên (KHAC_NGUYEN)", () => {
    const { cast, fourGods } = casePack();
    const r = synthesizeCuuThan(cast, fourGods);
    const sinhKy = r.relations.find((x) => x.kind === "SINH_KY");
    const khacNg = r.relations.find((x) => x.kind === "KHAC_NGUYEN");
    expect(sinhKy).toMatchObject({ fromLineIndex: 2, toLineIndex: 3, toRole: "KY" });
    expect(khacNg).toMatchObject({ fromLineIndex: 2, toLineIndex: 1, toRole: "NGUYEN" });
  });
  it("provenance non-empty; ghi chú nêu rõ Cừu ≠ Kỵ + không override", () => {
    const { cast, fourGods } = casePack();
    const r = synthesizeCuuThan(cast, fourGods);
    expect(r.members[0].reason.length).toBeGreaterThan(0);
    expect(r.ghiChu.join(" ")).toMatch(/KHÔNG phải Kỵ Thần/);
    expect(r.ghiChu.join(" ")).toMatch(/override|chuỗi Kỵ→Nguyên→Dụng/);
  });
  it("Dụng Thần chưa xác định ngũ hành → không có Cừu", () => {
    const r = synthesizeCuuThan(mkCast([mkHao(1, "Tý")]), fg({ dungThanNguHanh: null }));
    expect(r.cuuNguHanh).toBeNull();
    expect(r.members).toHaveLength(0);
  });
});

describe("Phase 16 — no-score / deterministic / isolated", () => {
  it("deterministic", () => {
    const { cast, fourGods } = casePack();
    expect(synthesizeCuuThan(cast, fourGods)).toEqual(synthesizeCuuThan(cast, fourGods));
  });
  it("không field score/verdict/strength", () => {
    const { cast, fourGods } = casePack();
    const r = synthesizeCuuThan(cast, fourGods);
    for (const b of ["score", "weight", "threshold", "diem", "point", "percent", "verdict", "strength", "baseforce", "conclusion"]) {
      expect(JSON.stringify(r).toLowerCase()).not.toContain(b);
    }
  });
});
