// Phase 17 — HÀO ↔ NHẬT/NGUYỆT FACT layer. DETECT/PRESERVE/SURFACE. Giữ riêng Nhật vs Nguyệt, no score.
import { describe, it, expect } from "vitest";
import { synthesizeHaoTimeFacts, type HaoTimeRelation } from "./hao-time-relations";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo, HaoRelation } from "../luc-hao";
import type { DungThanResolved, FourGods, FourGodMember } from "./advisory-engine";

function mkHao(hao: number, chiName: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chiName);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
const mkCast = (hao: HaoInfo[], dayChi: string, monthChi: string): FullCastResult =>
  ({ chinh: { hao }, bien: null, dongPositions: [], dayChi, monthChi, yearChi: "Sửu" } as unknown as FullCastResult);
const dtHien = (hao: HaoInfo): DungThanResolved => ({ hao, target: "Huynh Đệ", trangThai: "hien", lyDo: "" });
const member = (hao: number, nguHanh?: string): FourGodMember => ({ hao, nguHanh } as unknown as FourGodMember);
const fg = (over: Partial<FourGods> = {}): FourGods =>
  ({ dungThanNguHanh: "Mộc", trangThai: "hien", nguyenThan: [], kyThan: [], cuuThan: { resolved: false, lyDo: "" }, ...over } as unknown as FourGods);
const rel = (type: HaoRelation["type"], source: HaoRelation["source"]): HaoRelation => ({ type, source, target: "HAO" });

// Quẻ 1 hào để test directional gọn (hào 6 = Dụng).
function one(chi: string, dayChi: string, monthChi: string, over: Partial<HaoInfo> = {}) {
  const hao = [mkHao(1, "Sửu"), mkHao(2, "Sửu"), mkHao(3, "Sửu"), mkHao(4, "Sửu"), mkHao(5, "Sửu"), mkHao(6, chi, over)];
  const cast = mkCast(hao, dayChi, monthChi);
  return synthesizeHaoTimeFacts(cast, dtHien(hao[5]), fg({ dungThanNguHanh: CHI_NGU_HANH[CHI.indexOf(chi)] as FourGods["dungThanNguHanh"] }));
}
const nhatOf = (f: ReturnType<typeof one>, line: number) => f.nhat.filter((r) => r.lineIndex === line).map((r) => r.kind);
const nguyetOf = (f: ReturnType<typeof one>, line: number) => f.nguyet.filter((r) => r.lineIndex === line).map((r) => r.kind);

describe("Phase 17 — directional (ngũ hành, giữ chiều)", () => {
  it("1/2. Nhật/Nguyệt sinh hào (Mộc, nguồn Thủy)", () => {
    expect(nhatOf(one("Dần", "Tý", "Ngọ"), 6)).toContain("SINH_HAO");
    expect(nguyetOf(one("Dần", "Ngọ", "Tý"), 6)).toContain("SINH_HAO");
  });
  it("3/4. hào sinh Nhật/Nguyệt (Mộc sinh Hỏa = tiết)", () => {
    expect(nhatOf(one("Dần", "Ngọ", "Sửu"), 6)).toContain("HAO_SINH");
    expect(nguyetOf(one("Dần", "Sửu", "Ngọ"), 6)).toContain("HAO_SINH");
  });
  it("5/6. Nhật/Nguyệt khắc hào (Kim khắc Mộc)", () => {
    expect(nhatOf(one("Dần", "Dậu", "Sửu"), 6)).toContain("KHAC_HAO");
    expect(nguyetOf(one("Dần", "Sửu", "Dậu"), 6)).toContain("KHAC_HAO");
  });
  it("7/8. hào khắc Nhật/Nguyệt (Mộc khắc Thổ)", () => {
    expect(nhatOf(one("Dần", "Thìn", "Ngọ"), 6)).toContain("HAO_KHAC");
    expect(nguyetOf(one("Dần", "Ngọ", "Thìn"), 6)).toContain("HAO_KHAC");
  });
  it("9/10. đồng hành (cùng hành, khác chi)", () => {
    expect(nhatOf(one("Dần", "Mão", "Ngọ"), 6)).toContain("DONG_HANH");
    expect(nguyetOf(one("Dần", "Ngọ", "Mão"), 6)).toContain("DONG_HANH");
  });
  it("11/12. Lâm Nhật/Nguyệt Kiến (chi trùng) → LAM_KIEN, KHÔNG kèm DONG_HANH", () => {
    const fN = one("Dần", "Dần", "Ngọ");
    expect(nhatOf(fN, 6)).toContain("LAM_KIEN");
    expect(nhatOf(fN, 6)).not.toContain("DONG_HANH");
    expect(nguyetOf(one("Dần", "Ngọ", "Dần"), 6)).toContain("LAM_KIEN");
  });
});

describe("Phase 17 — chi-specials (đọc HaoInfo.relations canonical)", () => {
  it("13/14. Nhật/Nguyệt Xung", () => {
    expect(nhatOf(one("Dần", "Thân", "Ngọ", { relations: [rel("Xung", "DAY")] }), 6)).toContain("XUNG");
    expect(nguyetOf(one("Dần", "Ngọ", "Thân", { relations: [rel("Xung", "MONTH")] }), 6)).toContain("XUNG");
  });
  it("15/16/18. Nhật Phá / Nguyệt Phá (Phá ≠ mất hết lực)", () => {
    const fN = one("Dần", "Thân", "Ngọ", { relations: [rel("Nhật Phá", "DAY")] });
    expect(nhatOf(fN, 6)).toContain("PHA");
    expect(fN.nhat.find((r) => r.kind === "PHA")?.reason).toMatch(/KHÔNG mất hết lực/);
    expect(nguyetOf(one("Dần", "Ngọ", "Thân", { relations: [rel("Nguyệt Phá", "MONTH")] }), 6)).toContain("PHA");
  });
  it("17/19. Ám Động (chỉ Nhật; hào vượng + Nhật xung) — KHÁC Nhật Phá", () => {
    const f = one("Dần", "Thân", "Ngọ", { relations: [rel("Xung", "DAY"), rel("Ám Động", "DAY")] });
    expect(nhatOf(f, 6)).toContain("AM_DONG");
    expect(nhatOf(f, 6)).not.toContain("PHA");
    expect(f.nhat.find((r) => r.kind === "AM_DONG")?.source).toBe("NHAT");
  });
  it("Hợp / Hại", () => {
    expect(nhatOf(one("Dần", "Hợi", "Ngọ", { relations: [rel("Hợp", "DAY")] }), 6)).toContain("HOP");
    expect(nhatOf(one("Dần", "Tỵ", "Ngọ", { relations: [rel("Hại", "DAY")] }), 6)).toContain("HAI");
  });
  it("Phase 25B — Nhật Tán/散 (chỉ Nhật; hào ĐỘNG suy) surface → TAN, KHÁC Nhật Phá & Ám Động", () => {
    const f = one("Dần", "Thân", "Ngọ", { isDong: true, relations: [rel("Xung", "DAY"), rel("Nhật Tán", "DAY")] });
    expect(nhatOf(f, 6)).toContain("TAN");
    expect(nhatOf(f, 6)).not.toContain("PHA");
    expect(nhatOf(f, 6)).not.toContain("AM_DONG");
    expect(f.nhat.find((r) => r.kind === "TAN")?.source).toBe("NHAT");
  });
  it("Phase 25B — 愈动 (chỉ Nhật; hào ĐỘNG vượng) surface → DU_DONG, KHÁC Ám Động", () => {
    const f = one("Dần", "Thân", "Ngọ", { isDong: true, relations: [rel("Xung", "DAY"), rel("愈动", "DAY")] });
    expect(nhatOf(f, 6)).toContain("DU_DONG");
    expect(nhatOf(f, 6)).not.toContain("AM_DONG");
    expect(nhatOf(f, 6)).not.toContain("TAN");
  });
});

describe("Phase 17 — source separation + role preservation", () => {
  it("27. Nhật và Nguyệt MÂU THUẪN → giữ riêng 2 fact", () => {
    // Mộc: Ngày Thủy (sinh), Tháng Kim (khắc).
    const f = one("Dần", "Tý", "Dậu");
    expect(nhatOf(f, 6)).toContain("SINH_HAO");
    expect(nguyetOf(f, 6)).toContain("KHAC_HAO");
  });
  it("20-25. role preservation (Dụng/Nguyên/Kỵ/Cừu/Thế/Ứng)", () => {
    // Dụng Mộc(hào6 Dần); Nguyên Thủy(hào1 Tý); Kỵ Kim(hào3 Dậu); Cừu Thổ(hào2 Sửu); Thế hào4; Ứng hào5.
    const hao = [mkHao(1, "Tý"), mkHao(2, "Sửu"), mkHao(3, "Dậu"), mkHao(4, "Mão", { theUng: "Thế" }), mkHao(5, "Ngọ", { theUng: "Ứng" }), mkHao(6, "Dần")];
    const cast = mkCast(hao, "Tý", "Hợi");
    const f = synthesizeHaoTimeFacts(cast, dtHien(hao[5]), fg({ dungThanNguHanh: "Mộc", nguyenThan: [member(1, "Thủy")], kyThan: [member(3, "Kim")] }));
    const roleOfLine = (line: number) => f.nhat.find((r) => r.lineIndex === line)?.role;
    expect(roleOfLine(6)).toBe("DUNG");
    expect(roleOfLine(1)).toBe("NGUYEN");
    expect(roleOfLine(3)).toBe("KY");
    expect(roleOfLine(2)).toBe("CUU"); // Thổ = Cừu của Dụng Mộc
    expect(roleOfLine(4)).toBe("THE");
    expect(roleOfLine(5)).toBe("UNG");
  });
});

describe("Phase 17 — provenance / deterministic / no-score", () => {
  it("28. mọi relation có reason + source + role", () => {
    const f = one("Dần", "Tý", "Dậu");
    for (const r of [...f.nhat, ...f.nguyet]) {
      expect(r.reason.length).toBeGreaterThan(0);
      expect(["NHAT", "NGUYET"]).toContain(r.source);
      expect(typeof r.role).toBe("string");
    }
  });
  it("29. deterministic", () => {
    const build = () => one("Dần", "Tý", "Dậu");
    expect(build()).toEqual(build());
  });
  it("30/31/32. không field score/strength/verdict/conclusion", () => {
    const f = one("Dần", "Tý", "Dậu");
    for (const b of ["score", "weight", "threshold", "diem", "point", "percent", "verdict", "strength", "baseforce", "conclusion", "favorable"]) {
      expect(JSON.stringify(f).toLowerCase()).not.toContain(b);
    }
  });
});
