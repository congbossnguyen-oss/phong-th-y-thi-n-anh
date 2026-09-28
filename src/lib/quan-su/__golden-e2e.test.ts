// Phase 20 — GOLDEN E2E / REAL CASE VALIDATION.
// Chạy fixture → buildAdvisoryReport() → userPrompt(..., report) trên ĐÚNG production path. VALIDATE only:
// không methodology mới, không score, không AI call. Assert report có synthesis + prompt SERIALIZE đúng.
import { describe, it, expect } from "vitest";
import { buildAdvisoryReport } from "./advisory-engine";
import { userPrompt } from "./luan-giai/prompt";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo, HaoRelation } from "../luc-hao";
import type { QuanSuInterpretationPayload } from "./divination";

function H(hao: number, chi: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chi);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
const rel = (type: HaoRelation["type"], source: HaoRelation["source"]): HaoRelation => ({ type, source, target: "HAO" });
interface CastOpts { hao: HaoInfo[]; dayChi: string; monthChi: string; yearChi?: string; dong?: number[]; bien?: HaoInfo[]; }
function C(o: CastOpts): FullCastResult {
  return {
    chinh: { hao: o.hao }, bien: o.bien ? { hao: o.bien } : null, dongPositions: o.dong ?? [],
    dayChi: o.dayChi, monthChi: o.monthChi, yearChi: o.yearChi ?? "Sửu", tuanKhong: "Tuất Hợi",
    fanYin: { enabled: false }, fuYin: { enabled: false },
  } as unknown as FullCastResult;
}
function P(cast: FullCastResult, dung: string): QuanSuInterpretationPayload {
  return {
    question: { question_id: "q", category: "tong-quat", title: "?", output_type: "tu-van", safety_level: "thuong", dung_than_hint: { kind: "luc-than", value: dung }, doi_tuong_hoi: "chinh-toi" },
    cast, van_trinh: null, ung_ky: null,
    tien_thoai_than: { co: false, danhSach: [], ghiChu: [] }, tam_hop_cuc: { co: false, danhSach: [], ghiChu: [] },
    meta: { castAtISO: "2026-01-01T00:00:00Z", method: "luc-hao-tosses" },
  } as unknown as QuanSuInterpretationPayload;
}
/** E2E: fixture → report → prompt(report). */
function e2e(cast: FullCastResult, dung: string) {
  const payload = P(cast, dung);
  const report = buildAdvisoryReport(payload);
  const prompt = userPrompt(payload, undefined, report.fourGods, report);
  return { report, prompt };
}
// Bộ hào chuẩn: Dụng Thê Tài Mộc (hào6 Dần); Nguyên Tử Tôn Thủy (hào1 Tý); Kỵ Huynh Đệ Kim (hào3 Dậu); Cừu Thổ (hào2 Sửu).
const std = (dung6: Partial<HaoInfo> = {}, over: Partial<Record<1 | 2 | 3 | 4 | 5, Partial<HaoInfo>>> = {}) => [
  H(1, "Tý", { lucThan: "Tử Tôn", ...over[1] }), H(2, "Sửu", over[2]), H(3, "Dậu", over[3]),
  H(4, "Mão", over[4]), H(5, "Mão", over[5]), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế", ...dung6 }),
];
const dungCL = (r: ReturnType<typeof e2e>["report"]) => r.canLuc!.find((c) => c.vaiTro === "Dụng Thần")!;

describe("Phase 20 — golden E2E (fixture → report → prompt)", () => {
  it("G1 Dụng Vượng → baseForce Vượng, conclusion ≠ UNRESOLVED, prompt serialize", () => {
    const { report, prompt } = e2e(C({ hao: std(), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    expect(dungCL(report).baseForce).toBe("Vượng");
    expect(report.ketLuanSuViec!.conclusion).not.toBe("UNRESOLVED");
    expect(prompt).toContain('"baseForce": "Vượng"');
  });
  it("G2 Dụng Suy → baseForce Suy, ket-luan tiêu thụ đúng strength (WEAK)", () => {
    const { report } = e2e(C({ hao: std(), dayChi: "Dậu", monthChi: "Thân" }), "Thê Tài");
    expect(dungCL(report).baseForce).toBe("Suy");
    expect(["WEAK", "VERY_WEAK"]).toContain(report.ketLuanSuViec!.dungThan!.strength);
  });
  it("G3 Không Vong → temporalExistence EMPTY, base KHÔNG bị zero, ứng kỳ candidate", () => {
    const { report, prompt } = e2e(C({ hao: std({ xunKong: true }), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    const d = dungCL(report);
    expect(d.currentState.temporalExistence).toBe("EMPTY");
    expect(d.baseForce).toBe("Vượng"); // Không Vong ≠ mất lực
    expect(report.ungKy!.status).toBe("DELAYED");
    expect(prompt).toContain('"temporalExistence": "EMPTY"');
  });
  it("G4 Nguyệt Phá + nền mạnh (Lâm Nhật) → reduced=true nhưng base giữ", () => {
    // hào Dần Lâm Nhật (day Dần) → Vượng; month Thân xung Dần → Nguyệt Phá (set relation).
    const { report } = e2e(C({ hao: std({ relations: [rel("Nguyệt Phá", "MONTH"), rel("Xung", "MONTH")] }), dayChi: "Dần", monthChi: "Thân" }), "Thê Tài");
    const d = dungCL(report);
    expect(d.baseForce).toBe("Vượng");
    expect(d.currentState.reduced).toBe(true);
    expect(d.currentState.base).toBe("Vượng"); // Phá không erase
  });
  it("G5 Nhật Phá ≠ Ám Động (không nhập làm một)", () => {
    const amDong = e2e(C({ hao: std({ relations: [rel("Xung", "DAY"), rel("Ám Động", "DAY")] }), dayChi: "Thân", monthChi: "Hợi" }), "Thê Tài");
    const nhatPha = e2e(C({ hao: std({ relations: [rel("Xung", "DAY"), rel("Nhật Phá", "DAY")] }), dayChi: "Thân", monthChi: "Dậu" }), "Thê Tài");
    const amKinds = amDong.report.haoTimeRelations!.nhat.filter((x) => x.lineIndex === 6).map((x) => x.kind);
    const phaKinds = nhatPha.report.haoTimeRelations!.nhat.filter((x) => x.lineIndex === 6).map((x) => x.kind);
    expect(amKinds).toContain("AM_DONG");
    expect(amKinds).not.toContain("PHA");
    expect(phaKinds).toContain("PHA");
    expect(phaKinds).not.toContain("AM_DONG");
  });
  it("G6 Hóa Hợp → hoaHop=true, restrained, KHÔNG tự thành Suy", () => {
    // Dụng Sửu(Thổ) động biến Tý(Thủy): Sửu-Tý hợp; base Vượng (day Tỵ + month Ngọ sinh Thổ).
    const hao = std();
    hao[5] = H(6, "Sửu", { lucThan: "Thê Tài", theUng: "Thế", isDong: true });
    const bien = hao.map((h) => (h.hao === 6 ? H(6, "Tý", { lucThan: "Thê Tài" }) : H(h.hao, CHI[h.chiIndex])));
    const { report } = e2e(C({ hao, bien, dong: [6], dayChi: "Tỵ", monthChi: "Ngọ" }), "Thê Tài");
    const d = dungCL(report);
    expect(d.transformationState.hoaHop).toBe(true);
    expect(d.currentState.restrained).toBe(true);
    expect(d.currentState.effective).not.toBe("Suy");
  });
  it("G7 Hồi Đầu Sinh → hoiDauSinh, effective ≥ base (không bị níu như Hóa Hợp)", () => {
    const hao = std({ isDong: true });
    const bien = hao.map((h) => (h.hao === 6 ? H(6, "Tý", { lucThan: "Thê Tài" }) : H(h.hao, CHI[h.chiIndex]))); // Thủy sinh Mộc
    const { report } = e2e(C({ hao, bien, dong: [6], dayChi: "Tý", monthChi: "Dậu" }), "Thê Tài"); // base Case4 Trung Hòa
    const d = dungCL(report);
    expect(d.transformationState.hoiDauSinh).toBe(true);
    expect(d.currentState.restrained).toBe(false);
    expect(["Vượng", "Rất Vượng"]).toContain(d.currentState.effective);
  });
  it("G8 Hồi Đầu Khắc + nền mạnh → reduced nhưng base giữ", () => {
    const hao = std({ isDong: true });
    const bien = hao.map((h) => (h.hao === 6 ? H(6, "Dậu", { lucThan: "Thê Tài" }) : H(h.hao, CHI[h.chiIndex]))); // Kim khắc Mộc
    const { report } = e2e(C({ hao, bien, dong: [6], dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài"); // base Vượng
    const d = dungCL(report);
    expect(d.transformationState.hoiDauKhac).toBe(true);
    expect(d.currentState.reduced).toBe(true);
    expect(d.currentState.base).toBe("Vượng");
  });
  it("G9 Hóa Thoái → effective Suy; transformationState đúng", () => {
    const hao = std();
    hao[5] = H(6, "Mão", { lucThan: "Thê Tài", theUng: "Thế", isDong: true });
    const bien = hao.map((h) => (h.hao === 6 ? H(6, "Dần", { lucThan: "Thê Tài" }) : H(h.hao, CHI[h.chiIndex]))); // Mão→Dần thoái
    const { report } = e2e(C({ hao, bien, dong: [6], dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    const d = dungCL(report);
    expect(d.transformationState.hoaThoai).toBe(true);
    expect(d.currentState.effective).toBe("Suy");
  });
  it("G10 Kỵ → Nguyên → Dụng: chain + protection/support, KHÔNG score", () => {
    const { report } = e2e(C({ hao: std(), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    const knd = report.kyNguyenDung!;
    expect(knd.chains[0].kyToNguyen[0].relation).toBe("GENERATES"); // Kim sinh Thủy (tham sinh)
    expect(knd.chains[0].nguyenToDung[0].relation).toBe("GENERATES"); // Thủy sinh Mộc
    expect(typeof knd.dungProtection).toBe("string");
    expect(JSON.stringify(knd).toLowerCase()).not.toContain("score");
  });
  it("G11 Kỵ Không Vong → relation OVERCOMES nhưng effective EMPTY", () => {
    const { report } = e2e(C({ hao: std({}, { 3: { xunKong: true } }), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    const direct = report.kyNguyenDung!.chains[0].directPressure.find((i) => i.sourceLineIndex === 3)!;
    expect(direct.relation).toBe("OVERCOMES");
    expect(direct.effective).toBe("EMPTY");
  });
  it("G12 Dụng + Nguyên cứu → protection phản ánh cứu viện (tham sinh)", () => {
    const { report } = e2e(C({ hao: std(), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    expect(["PROTECTED", "PARTIALLY_PROTECTED"]).toContain(report.kyNguyenDung!.dungProtection);
  });
  it("G13 MIXED → conclusion MIXED giữ nguyên trong prompt", () => {
    // Dụng Suy (day/month Kim khắc) + không Kỵ/Nguyên hào → protected+weak → MIXED.
    const hao = [H(1, "Mão"), H(2, "Mão"), H(3, "Mão"), H(4, "Mão"), H(5, "Mão"), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" })];
    const { report, prompt } = e2e(C({ hao, dayChi: "Dậu", monthChi: "Thân" }), "Thê Tài");
    expect(report.ketLuanSuViec!.conclusion).toBe("MIXED");
    expect(prompt).toContain('"conclusion": "MIXED"');
    expect(prompt).toMatch(/MIXED.*GIỮ NGUYÊN|GIỮ NGUYÊN.*MIXED/s);
  });
  it("G14 UNRESOLVED (Dụng phục tàng) → conclusion UNRESOLVED giữ nguyên", () => {
    const hao = std({}, { 1: { phucThan: { lucThan: "Quan Quỷ", canIndex: 0, chiIndex: CHI.indexOf("Dậu") } } });
    // hint = Quan Quỷ (không hiện trên quẻ, chỉ phục dưới hào1) → phục_tang.
    const { report, prompt } = e2e(C({ hao, dayChi: "Tý", monthChi: "Hợi" }), "Quan Quỷ");
    expect(report.ketLuanSuViec!.conclusion).toBe("UNRESOLVED");
    expect(prompt).toContain('"conclusion": "UNRESOLVED"');
  });
  it("G15 MULTIPLE_CANDIDATES → primary null, prompt không tự chọn", () => {
    const { report } = e2e(C({ hao: std(), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    expect(report.ungKy!.status).toBe("MULTIPLE_CANDIDATES");
    expect(report.ungKy!.primary).toBeUndefined();
  });
  it("G16 Hình/Cừu/Nhật-Nguyệt facts giữ đúng loại + source", () => {
    // Tam Hình Dần-Tỵ-Thân: Dụng Dần(6), Tỵ(4), Thân... nhưng Kỵ Dậu(3). Đặt Tỵ ở hào4, Thân ở hào5.
    const hao = [
      H(1, "Tý", { lucThan: "Tử Tôn" }), H(2, "Sửu"), H(3, "Dậu"),
      H(4, "Tỵ"), H(5, "Thân"), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế", relations: [rel("Xung", "DAY"), rel("Nhật Phá", "DAY")] }),
    ];
    const { report } = e2e(C({ hao, dayChi: "Thân", monthChi: "Hợi" }), "Thê Tài");
    // Hình = TAM_HINH (không phải Khắc)
    expect(report.hinh!.relations.some((x) => x.kind === "TAM_HINH")).toBe(true);
    // Cừu = Thổ (role CUU, ≠ Kỵ)
    expect(report.cuuThan!.cuuNguHanh).toBe("Thổ");
    // Nhật Phá giữ là PHA, không thành AM_DONG (source NHAT)
    const nhat6 = report.haoTimeRelations!.nhat.filter((x) => x.lineIndex === 6);
    expect(nhat6.some((x) => x.kind === "PHA")).toBe(true);
    expect(nhat6.some((x) => x.kind === "AM_DONG")).toBe(false);
    expect(nhat6.every((x) => x.source === "NHAT")).toBe(true);
  });
});

describe("Phase 20 — negative / adversarial (A–J)", () => {
  it("A. Không Vong KHÔNG thành zero force", () => {
    const { report } = e2e(C({ hao: std({ xunKong: true }), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    expect(dungCL(report).baseForce).toBe("Vượng");
    expect(dungCL(report).currentState.base).toBe("Vượng");
  });
  it("B. Phá KHÔNG erase base force", () => {
    const { report } = e2e(C({ hao: std({ relations: [rel("Nguyệt Phá", "MONTH"), rel("Xung", "MONTH")] }), dayChi: "Dần", monthChi: "Thân" }), "Thê Tài");
    expect(dungCL(report).currentState.base).toBe("Vượng");
  });
  it("C. Hình KHÔNG thành Khắc", () => {
    const hao = [H(1, "Tý", { lucThan: "Tử Tôn" }), H(2, "Sửu"), H(3, "Dậu"), H(4, "Tỵ"), H(5, "Thân"), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" })];
    const { report } = e2e(C({ hao, dayChi: "Thân", monthChi: "Hợi" }), "Thê Tài");
    const th = report.hinh!.relations.find((x) => x.kind === "TAM_HINH")!;
    expect(["TAM_HINH", "TUONG_HINH"]).toContain(th.kind);
    expect(th.reason.join(" ")).toMatch(/KHÔNG phải Khắc/);
  });
  it("D. Cừu KHÔNG thành Kỵ (element khác, role CUU)", () => {
    const { report } = e2e(C({ hao: std(), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    expect(report.cuuThan!.cuuNguHanh).toBe("Thổ"); // Kỵ = Kim, Cừu = Thổ ≠ Kim
    expect(report.cuuThan!.members.some((m) => m.lineIndex === 2)).toBe(true); // hào Sửu Thổ = Cừu
  });
  it("E. Nhật Phá KHÔNG thành Ám Động", () => {
    const { report } = e2e(C({ hao: std({ relations: [rel("Xung", "DAY"), rel("Nhật Phá", "DAY")] }), dayChi: "Thân", monthChi: "Dậu" }), "Thê Tài");
    const nhat6 = report.haoTimeRelations!.nhat.filter((x) => x.lineIndex === 6).map((x) => x.kind);
    expect(nhat6).toContain("PHA");
    expect(nhat6).not.toContain("AM_DONG");
  });
  it("F. MIXED không bị flip trong prompt", () => {
    const hao = [H(1, "Mão"), H(2, "Mão"), H(3, "Mão"), H(4, "Mão"), H(5, "Mão"), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" })];
    const { report, prompt } = e2e(C({ hao, dayChi: "Dậu", monthChi: "Thân" }), "Thê Tài");
    expect(report.ketLuanSuViec!.conclusion).toBe("MIXED");
    expect(prompt).not.toContain('"conclusion": "FAVORABLE"');
    expect(prompt).not.toContain('"conclusion": "UNFAVORABLE"');
  });
  it("G. UNRESOLVED không bị flip", () => {
    const hao = std({}, { 1: { phucThan: { lucThan: "Quan Quỷ", canIndex: 0, chiIndex: CHI.indexOf("Dậu") } } });
    const { report, prompt } = e2e(C({ hao, dayChi: "Tý", monthChi: "Hợi" }), "Quan Quỷ");
    expect(report.ketLuanSuViec!.conclusion).toBe("UNRESOLVED");
    expect(prompt).not.toContain('"conclusion": "FAVORABLE"');
  });
  it("H. MULTIPLE_CANDIDATES không tự chọn primary", () => {
    const { report } = e2e(C({ hao: std(), dayChi: "Tý", monthChi: "Hợi" }), "Thê Tài");
    expect(report.ungKy!.status).toBe("MULTIPLE_CANDIDATES");
    expect(report.ungKy!.primary).toBeUndefined();
  });
  it("I. Hóa Hợp KHÔNG thành Suy", () => {
    const hao = std();
    hao[5] = H(6, "Sửu", { lucThan: "Thê Tài", theUng: "Thế", isDong: true });
    const bien = hao.map((h) => (h.hao === 6 ? H(6, "Tý", { lucThan: "Thê Tài" }) : H(h.hao, CHI[h.chiIndex])));
    const { report } = e2e(C({ hao, bien, dong: [6], dayChi: "Tỵ", monthChi: "Ngọ" }), "Thê Tài");
    expect(dungCL(report).currentState.effective).not.toBe("Suy");
  });
  it("J. Hồi Đầu Sinh KHÔNG bị coi là Hóa Hợp", () => {
    const hao = std({ isDong: true });
    const bien = hao.map((h) => (h.hao === 6 ? H(6, "Tý", { lucThan: "Thê Tài" }) : H(h.hao, CHI[h.chiIndex])));
    const { report } = e2e(C({ hao, bien, dong: [6], dayChi: "Tý", monthChi: "Dậu" }), "Thê Tài");
    const d = dungCL(report);
    expect(d.transformationState.hoiDauSinh).toBe(true);
    expect(d.transformationState.hoaHop).toBe(false);
  });
});

describe("Phase 20 — generic report→prompt drift (prompt là consumer, không phải engine thứ 2)", () => {
  it("mutate mỗi field deterministic → prompt phản ánh", () => {
    const base = () => {
      const payload = P(C({ hao: std({ relations: [rel("Xung", "DAY"), rel("Nhật Phá", "DAY")] }), dayChi: "Thân", monthChi: "Hợi" }), "Thê Tài");
      return { payload, report: buildAdvisoryReport(payload) };
    };
    // canLuc baseForce
    { const { payload, report } = base(); report.canLuc![0].baseForce = "Rất Vượng"; expect(userPrompt(payload, undefined, report.fourGods, report)).toContain('"baseForce": "Rất Vượng"'); }
    // kyPressure
    { const { payload, report } = base(); const v: "EMPTY" | "HIDDEN" = report.kyNguyenDung!.kyPressure === "HIDDEN" ? "EMPTY" : "HIDDEN"; report.kyNguyenDung!.kyPressure = v; const p = userPrompt(payload, undefined, report.fourGods, report); expect(p).toContain(`"ky_pressure": "${v}"`); }
    // nguyenSupport
    { const { payload, report } = base(); report.kyNguyenDung!.nguyenSupport = "HIDDEN"; expect(userPrompt(payload, undefined, report.fourGods, report)).toContain('"nguyen_support": "HIDDEN"'); }
    // conclusion
    { const { payload, report } = base(); report.ketLuanSuViec!.conclusion = "DIFFICULT"; expect(userPrompt(payload, undefined, report.fourGods, report)).toContain('"conclusion": "DIFFICULT"'); }
    // ungKy.status
    { const { payload, report } = base(); report.ungKy!.status = "UNRESOLVED"; expect(userPrompt(payload, undefined, report.fourGods, report)).toContain('"status": "UNRESOLVED"'); }
    // haoTimeRelations kind
    { const { payload, report } = base(); const n = report.haoTimeRelations!.nhat.find((x) => x.lineIndex === 6)!; n.reason = "DRIFT_SENTINEL_HAOTIME"; expect(userPrompt(payload, undefined, report.fourGods, report)).toContain("DRIFT_SENTINEL_HAOTIME"); }
  });
});
