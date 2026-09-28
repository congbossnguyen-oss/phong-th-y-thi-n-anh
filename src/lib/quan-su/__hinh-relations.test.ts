// Phase 15 — HÌNH relations. DETECT/PRESERVE/SURFACE only. Chỉ 2 bộ spec §3.7 khóa:
// Tam Hình Dần-Tỵ-Thân + Tương Hình Tý-Mão. Tự Hình / Sửu-Tuất-Mùi CHƯA khóa (spec §348) → không detect.
import { describe, it, expect } from "vitest";
import { synthesizeHinh, detectHinh, buildRoleOf } from "./hinh-relations";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { DungThanResolved, FourGods, FourGodMember } from "./advisory-engine";

function mkHao(hao: number, chiName: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chiName);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
function mkCast(hao: HaoInfo[], over: Partial<FullCastResult> = {}): FullCastResult {
  return { chinh: { hao }, bien: null, dongPositions: [], dayChi: "Sửu", monthChi: "Sửu", yearChi: "Sửu", ...over } as unknown as FullCastResult;
}
const dtHien = (hao: HaoInfo): DungThanResolved => ({ hao, target: "Huynh Đệ", trangThai: "hien", lyDo: "" });
const member = (hao: number): FourGodMember => ({ hao } as unknown as FourGodMember);
const fg = (over: Partial<FourGods> = {}): FourGods =>
  ({ dungThanNguHanh: "Mộc", trangThai: "hien", nguyenThan: [], kyThan: [], cuuThan: { resolved: false, lyDo: "" }, ...over } as unknown as FourGods);

// Tam Hình Dần-Tỵ-Thân trên hào 1/3/5; filler Sửu.
const tamHinhHao = (over: Record<number, Partial<HaoInfo>> = {}) => [
  mkHao(1, "Dần", over[1]), mkHao(2, "Sửu", over[2]), mkHao(3, "Tỵ", over[3]),
  mkHao(4, "Sửu", over[4]), mkHao(5, "Thân", over[5]), mkHao(6, "Sửu", over[6]),
];
const noRole = () => "OTHER" as const;

describe("Phase 15 — detection (2 bộ spec khóa)", () => {
  it("1. Không có Hình → relations rỗng", () => {
    const cast = mkCast([mkHao(1, "Sửu"), mkHao(2, "Sửu"), mkHao(3, "Sửu"), mkHao(4, "Sửu"), mkHao(5, "Sửu"), mkHao(6, "Sửu")]);
    expect(detectHinh(cast, noRole).relations).toHaveLength(0);
  });
  it("4. Tam Hình Dần-Tỵ-Thân → detect", () => {
    const cast = mkCast(tamHinhHao());
    const r = detectHinh(cast, noRole);
    const th = r.relations.find((x) => x.kind === "TAM_HINH");
    expect(th).toBeTruthy();
    expect(th?.chi).toEqual(["Dần", "Tỵ", "Thân"]);
    expect(th?.lineIndices.sort()).toEqual([1, 3, 5]);
  });
  it("Tam Hình cần ĐỦ 3 chi — thiếu Thân thì KHÔNG detect", () => {
    const cast = mkCast([mkHao(1, "Dần"), mkHao(2, "Sửu"), mkHao(3, "Tỵ"), mkHao(4, "Sửu"), mkHao(5, "Sửu"), mkHao(6, "Sửu")]);
    expect(detectHinh(cast, noRole).relations.some((x) => x.kind === "TAM_HINH")).toBe(false);
  });
  it("3. Tương Hình Tý-Mão → detect", () => {
    const cast = mkCast([mkHao(1, "Tý"), mkHao(2, "Sửu"), mkHao(3, "Mão"), mkHao(4, "Sửu"), mkHao(5, "Sửu"), mkHao(6, "Sửu")]);
    const tuong = detectHinh(cast, noRole).relations.find((x) => x.kind === "TUONG_HINH");
    expect(tuong?.chi).toEqual(["Tý", "Mão"]);
  });
  it("2. Tự Hình (2 Dậu) → KHÔNG detect (spec §348 chưa khóa)", () => {
    const cast = mkCast([mkHao(1, "Dậu"), mkHao(2, "Dậu"), mkHao(3, "Sửu"), mkHao(4, "Sửu"), mkHao(5, "Sửu"), mkHao(6, "Sửu")]);
    expect(detectHinh(cast, noRole).relations).toHaveLength(0);
  });
  it("Sửu-Tuất-Mùi → KHÔNG detect (spec §348 chưa khóa)", () => {
    const cast = mkCast([mkHao(1, "Sửu"), mkHao(2, "Tuất"), mkHao(3, "Mùi"), mkHao(4, "Dần"), mkHao(5, "Dần"), mkHao(6, "Dần")]);
    expect(detectHinh(cast, noRole).relations).toHaveLength(0);
  });
  it("7. Hào biến hoàn thành triad → KHÔNG detect (chỉ xét 6 hào chính)", () => {
    // Chính chỉ có Dần + Tị (thiếu Thân); hào biến Thân → KHÔNG được tính.
    const hao = [mkHao(1, "Dần"), mkHao(2, "Sửu"), mkHao(3, "Tỵ"), mkHao(4, "Sửu"), mkHao(5, "Sửu"), mkHao(6, "Sửu")];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, "Thân") : mkHao(h.hao, CHI[h.chiIndex])));
    const cast = mkCast(hao, { dongPositions: [6], bien: { hao: bien } as unknown as FullCastResult["bien"] });
    expect(detectHinh(cast, noRole).relations.some((x) => x.kind === "TAM_HINH")).toBe(false);
  });
});

describe("Phase 15 — static/moving + role/line/chi/provenance preservation", () => {
  it("5. Hình giữa hào tĩnh → members isDong=false", () => {
    const cast = mkCast(tamHinhHao());
    const th = detectHinh(cast, noRole).relations[0];
    expect(th.members.every((m) => m.isDong === false)).toBe(true);
  });
  it("6. Hình chứa hào động → member isDong=true", () => {
    const cast = mkCast(tamHinhHao({ 1: { isDong: true } }), { dongPositions: [1] });
    const th = detectHinh(cast, noRole).relations[0];
    expect(th.members.find((m) => m.lineIndex === 1)?.isDong).toBe(true);
  });
  it("8/9/10/11/12/14. role preservation (Dụng/Nguyên/Kỵ/Thế/Ứng)", () => {
    const hao = tamHinhHao({ 1: { theUng: "Thế" }, 5: { theUng: "Ứng" } });
    const cast = mkCast(hao);
    const dt = dtHien(hao[0]); // Dụng = hào 1 (Dần)
    const fourGods = fg({ nguyenThan: [member(3)], kyThan: [member(5)] }); // hào3 Nguyên, hào5 Kỵ
    const roleOf = buildRoleOf(cast, dt, fourGods);
    const th = detectHinh(cast, roleOf).relations[0];
    const byLine = Object.fromEntries(th.members.map((m) => [m.lineIndex, m.role]));
    expect(byLine[1]).toBe("DUNG"); // Dụng ưu tiên trên Thế
    expect(byLine[3]).toBe("NGUYEN");
    expect(byLine[5]).toBe("KY"); // Kỵ ưu tiên trên Ứng
  });
  it("13. Phi/Phục → không đưa vào Hình (ngoài phạm vi)", () => {
    // Phục thần Thân dưới hào (chính không có Thân) → không hoàn thành triad.
    const hao = [mkHao(1, "Dần"), mkHao(2, "Sửu"), mkHao(3, "Tỵ"), mkHao(4, "Sửu"),
      mkHao(5, "Sửu", { phucThan: { lucThan: "Quan Quỷ", canIndex: 0, chiIndex: CHI.indexOf("Thân") } }), mkHao(6, "Sửu")];
    expect(detectHinh(mkCast(hao), noRole).relations.some((x) => x.kind === "TAM_HINH")).toBe(false);
  });
  it("15/16/17. line index + chi + provenance preserved", () => {
    const th = detectHinh(mkCast(tamHinhHao()), noRole).relations[0];
    expect(th.lineIndices.length).toBe(3);
    expect(th.chi.length).toBe(3);
    expect(th.members.every((m) => typeof m.chi === "string" && m.lineIndex >= 1)).toBe(true);
    expect(th.reason.length).toBeGreaterThan(0);
  });
  it("18. deterministic", () => {
    const build = () => detectHinh(mkCast(tamHinhHao()), noRole);
    expect(build()).toEqual(build());
  });
});

describe("Phase 15 — no-verdict / not-Khắc / no-score", () => {
  it("23. Hình KHÔNG bị coi là Khắc (kind là HÌNH, reason ghi rõ)", () => {
    const th = detectHinh(mkCast(tamHinhHao()), noRole).relations[0];
    expect(["TAM_HINH", "TUONG_HINH"]).toContain(th.kind);
    expect(th.reason.join(" ")).toMatch(/KHÔNG phải Khắc/);
  });
  it("19/20/21/22. không có field score/verdict/strength (thuần relational)", () => {
    const r = detectHinh(mkCast(tamHinhHao()), noRole);
    for (const b of ["score", "weight", "threshold", "diem", "point", "percent", "verdict", "strength", "baseforce"]) {
      expect(JSON.stringify(r).toLowerCase()).not.toContain(b);
    }
  });
  it("synthesizeHinh entry point hoạt động qua dt+fourGods", () => {
    const hao = tamHinhHao();
    const r = synthesizeHinh(mkCast(hao), dtHien(hao[0]), fg({ kyThan: [member(5)] }));
    expect(r.relations[0].members.find((m) => m.lineIndex === 5)?.role).toBe("KY");
    expect(r.ghiChu.join(" ")).toMatch(/§348/); // ghi chú giới hạn nguồn
  });
});
