// Phase 10C — 6 trường hợp Tam Hợp (đủ + khuyết). FACT/deterministic, không phán cát hung.
// Dùng Thủy cục Thân-Tý-Thìn; hào không tham gia = filler Mão (không hoàn thành cục nào khác).
import { describe, it, expect } from "vitest";
import { phanLoaiSauTamHop } from "../luc-hao-tam-hop-cuc";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo, HaoRelation } from "../luc-hao";

function mkHao(hao: number, chiName: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chiName);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex,
    nguHanh: CHI_NGU_HANH[chiIndex], lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null,
    phucThan: null, vuongSuy: "Hưu", growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false,
    ...over,
  } as HaoInfo;
}
const amDong: HaoRelation[] = [{ type: "Ám Động", source: "DAY", target: "HAO" }];
function mkCast(o: { hao: HaoInfo[]; dayChi: string; monthChi: string; dong?: number[]; bien?: HaoInfo[] | null }): FullCastResult {
  return {
    chinh: { hao: o.hao }, bien: o.bien ? { hao: o.bien } : null,
    dongPositions: o.dong ?? [], dayChi: o.dayChi, monthChi: o.monthChi, yearChi: "Sửu",
  } as unknown as FullCastResult;
}
const filler = (n: number) => mkHao(n, "Mão");
const thuy = (d: FullCastResult) => phanLoaiSauTamHop(d).danhSach.find((x) => x.nguHanh === "Thủy");

describe("Phase 10C — 6 Tam Hợp cases", () => {
  it("TH1 — 3 hào động", () => {
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), mkHao(3, "Thìn", { isDong: true }), filler(4), filler(5), filler(6)];
    const r = thuy(mkCast({ hao, dayChi: "Tỵ", monthChi: "Dậu", dong: [1, 2, 3] }))!;
    expect(r.case).toBe("TH1_FULL");
    expect(r.full).toBe(true);
    expect(r.participatingLines.sort()).toEqual([1, 2, 3]);
  });

  it("TH2 — 2 động + 1 an tĩnh (khuyết), ứng kỳ = chi hào an tĩnh", () => {
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), mkHao(3, "Thìn"), filler(4), filler(5), filler(6)];
    const r = thuy(mkCast({ hao, dayChi: "Tỵ", monthChi: "Dậu", dong: [1, 2] }))!;
    expect(r.case).toBe("TH2_MISSING_STATIC");
    expect(r.full).toBe(false);
    expect(r.staticLine).toBe(3);
    expect(r.ungKyChi).toBe("Thìn");
  });

  it("TH3 — minh động + ám động + an tĩnh (khuyết)", () => {
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { relations: amDong }), mkHao(3, "Thìn"), filler(4), filler(5), filler(6)];
    const r = thuy(mkCast({ hao, dayChi: "Tỵ", monthChi: "Dậu", dong: [1] }))!;
    expect(r.case).toBe("TH3_MINH_DONG_AM_DONG_STATIC");
    expect(r.staticLine).toBe(3);
    expect(r.ungKyChi).toBe("Thìn");
  });

  it("TH4 — Nhật + Nguyệt + 1 hào động", () => {
    const hao = [mkHao(1, "Tý", { isDong: true }), filler(2), filler(3), filler(4), filler(5), filler(6)];
    const r = thuy(mkCast({ hao, dayChi: "Thân", monthChi: "Thìn", dong: [1] }))!;
    expect(r.case).toBe("TH4_DAY_MONTH_MOVING");
    expect(r.full).toBe(true);
    expect(r.participatingLines).toEqual([1]);
  });

  it("TH5 — 2 động + hào biến của chính 1 hào động ra chi thiếu", () => {
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), filler(3), filler(4), filler(5), filler(6)];
    const bien = [mkHao(1, "Thân"), mkHao(2, "Thìn"), filler(3), filler(4), filler(5), filler(6)]; // hào 2 hóa Thìn
    const r = thuy(mkCast({ hao, bien, dayChi: "Tỵ", monthChi: "Dậu", dong: [1, 2] }))!;
    expect(r.case).toBe("TH5_TWO_MOVING_ONE_TRANSFORMED");
    expect(r.transformedLine).toBe(2);
  });

  it("TH5 reject — hào biến không thuộc 2 hào động trong cục", () => {
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), mkHao(3, "Dần", { isDong: true }), filler(4), filler(5), filler(6)];
    const bien = [mkHao(1, "Thân"), mkHao(2, "Tý"), mkHao(3, "Thìn"), filler(4), filler(5), filler(6)]; // Thìn từ hào 3 (Dần, ngoài cục)
    const list = phanLoaiSauTamHop(mkCast({ hao, bien, dayChi: "Tỵ", monthChi: "Dậu", dong: [1, 2, 3] })).danhSach;
    expect(list.some((x) => x.case === "TH5_TWO_MOVING_ONE_TRANSFORMED")).toBe(false);
  });

  it("TH6 — 2 động + Phục Thần (khuyết)", () => {
    const phi = mkHao(3, "Mão", { phucThan: { lucThan: "Thê Tài", canIndex: 0, chiIndex: CHI.indexOf("Thìn") } });
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), phi, filler(4), filler(5), filler(6)];
    const r = thuy(mkCast({ hao, dayChi: "Tỵ", monthChi: "Dậu", dong: [1, 2] }))!;
    expect(r.case).toBe("TH6_TWO_MOVING_PHUC_THAN");
    expect(r.phucLine?.hao).toBe(3);
    expect(r.phucLine?.quaSuy).toBe(false);
  });

  it("TH6 — Phục Thần quá suy (Nhật+Nguyệt đều khắc) → cờ quaSuy", () => {
    const phi = mkHao(3, "Ngọ", { phucThan: { lucThan: "Thê Tài", canIndex: 0, chiIndex: CHI.indexOf("Thìn") } });
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), phi, filler(4), filler(5), filler(6)];
    const r = thuy(mkCast({ hao, dayChi: "Dần", monthChi: "Mão", dong: [1, 2] }))!; // Mộc khắc Thổ (Phục Thìn=Thổ)
    expect(r.case).toBe("TH6_TWO_MOVING_PHUC_THAN");
    expect(r.phucLine?.quaSuy).toBe(true);
  });

  it("không nhầm cục với quan hệ Nhật/Nguyệt đơn lẻ", () => {
    // 1 hào tĩnh Tý + Nhật Thân, KHÔNG hào động → không hình thành cục.
    const hao = [mkHao(1, "Tý"), filler(2), filler(3), filler(4), filler(5), filler(6)];
    const res = phanLoaiSauTamHop(mkCast({ hao, dayChi: "Thân", monthChi: "Dậu", dong: [] }));
    expect(res.co).toBe(false);
  });
});
