// Phase 19 — REPORT → PROMPT integration + DRIFT GUARD.
// Chứng minh: (1) buildAdvisoryReport tạo report đủ synthesis layers; (2) userPrompt(report) SERIALIZE
// từ report, KHÔNG tính lại (mutate report → prompt phản ánh); (3) report-path == fallback-path (no drift).
import { describe, it, expect } from "vitest";
import { buildAdvisoryReport } from "./advisory-engine";
import { userPrompt } from "./luan-giai/prompt";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { QuanSuInterpretationPayload } from "./divination";

function mkHao(hao: number, chiName: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chiName);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
function mkPayload(): QuanSuInterpretationPayload {
  // Dụng Thê Tài Mộc (hào6 Dần); Nguyên Tử Tôn Thủy (hào1 Tý); Kỵ Huynh Đệ Kim (hào3 Dậu).
  const hao = [
    mkHao(1, "Tý", { lucThan: "Tử Tôn" }), mkHao(2, "Mão"), mkHao(3, "Dậu"),
    mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" }),
  ];
  const cast = {
    chinh: { hao }, bien: null, dongPositions: [], dayChi: "Tý", monthChi: "Hợi", yearChi: "Sửu",
    tuanKhong: "Tuất Hợi", fanYin: { enabled: false }, fuYin: { enabled: false },
  } as unknown as FullCastResult;
  return {
    question: {
      question_id: "q", category: "tong-quat", title: "Việc này thế nào?", output_type: "tu-van",
      safety_level: "thuong", dung_than_hint: { kind: "luc-than", value: "Thê Tài" }, doi_tuong_hoi: "chinh-toi",
    },
    cast, van_trinh: null, ung_ky: null,
    tien_thoai_than: { co: false, danhSach: [], ghiChu: [] },
    tam_hop_cuc: { co: false, danhSach: [], ghiChu: [] },
    meta: { castAtISO: "2026-01-01T00:00:00Z", method: "luc-hao-tosses" },
  } as unknown as QuanSuInterpretationPayload;
}

describe("Phase 19 — report → prompt integration", () => {
  it("buildAdvisoryReport chứa đủ synthesis layers", () => {
    const r = buildAdvisoryReport(mkPayload());
    expect(r.fourGods).toBeTruthy();
    expect(r.kyNguyenDung).toBeTruthy();
    expect(r.ketLuanSuViec).toBeTruthy();
    expect(r.ungKy).toBeTruthy();
    expect(r.hinh).toBeTruthy();
    expect(r.cuuThan).toBeTruthy();
    expect(r.haoTimeRelations).toBeTruthy();
    expect(Array.isArray(r.canLuc)).toBe(true);
  });

  it("prompt(report) SERIALIZE đúng values của report (drift guard: conclusion / chain / canLuc)", () => {
    const payload = mkPayload();
    const report = buildAdvisoryReport(payload);
    const prompt = userPrompt(payload, undefined, report.fourGods, report);
    expect(prompt).toContain(`"conclusion": "${report.ketLuanSuViec!.conclusion}"`);
    expect(prompt).toContain(`"ky_pressure": "${report.kyNguyenDung!.kyPressure}"`);
    expect(prompt).toContain(`"nguyen_support": "${report.kyNguyenDung!.nguyenSupport}"`);
    expect(prompt).toContain(`"status": "${report.ungKy!.status}"`);
    expect(prompt).toContain(`"baseForce": "${report.canLuc![0].baseForce}"`);
  });

  it("DRIFT GUARD: mutate report → prompt phản ánh (chứng minh KHÔNG recompute)", () => {
    const payload = mkPayload();
    const report = buildAdvisoryReport(payload);
    const original = report.ketLuanSuViec!.conclusion;
    // Ép conclusion sang một giá trị KHÁC — nếu prompt tự tính lại, nó sẽ bỏ qua mutation này.
    const forced = original === "UNRESOLVED" ? "MIXED" : "UNRESOLVED";
    report.ketLuanSuViec!.conclusion = forced as typeof original;
    // Top-level `conclusion: forced` chỉ xuất hiện nếu prompt SERIALIZE report (recompute sẽ ra giá trị thật, không phải forced).
    const prompt = userPrompt(payload, undefined, report.fourGods, report);
    expect(prompt).toContain(`"conclusion": "${forced}"`);
    // Mutate thêm kyPressure (xuất hiện đúng 1 lần) để drift guard rõ ràng hơn.
    const kp = report.kyNguyenDung!.kyPressure;
    const kpForced = kp === "HIDDEN" ? "EMPTY" : "HIDDEN";
    report.kyNguyenDung!.kyPressure = kpForced as typeof kp;
    const prompt2 = userPrompt(payload, undefined, report.fourGods, report);
    expect(prompt2).toContain(`"ky_pressure": "${kpForced}"`);
    expect(prompt2).not.toContain(`"ky_pressure": "${kp}"`);
  });

  it("report-path == fallback-path (serialize == recompute, no drift giữa 2 đường)", () => {
    const payload = mkPayload();
    const report = buildAdvisoryReport(payload);
    const withReport = userPrompt(payload, undefined, report.fourGods, report);
    const fallback = userPrompt(payload, undefined, report.fourGods); // không report → tính tại chỗ
    expect(withReport).toBe(fallback);
  });
});
