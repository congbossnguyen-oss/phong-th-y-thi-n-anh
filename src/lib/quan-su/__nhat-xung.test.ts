// Phase 25B — NHẬT XUNG N1–N4 (profile 《增删卜易》, khóa Phase 24 — LUAN_QUE_LUC_HAO_SPEC §3.10).
// Engine-level: lapQueDayDu drive getDayRelations THẬT (không inject synthetic) để chứng minh 4 nhãn.
//   N1 tĩnh+vượng → Ám Động · N2 tĩnh+hưu/tù → Nhật Phá · N3 động+hưu/tù → Nhật Tán/散 · N4 động+vượng → 愈动.
//   Ngoại lệ 月建: lâm Nguyệt → vượng → động+Nhật xung = 愈动 (KHÔNG 散).
import { describe, it, expect } from "vitest";
import { lapQueDayDu } from "../luc-hao";
import { buildAdvisoryReport } from "./advisory-engine";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { LineVal, HaoRelationType, HaoInfo, HaoRelation, FullCastResult } from "../luc-hao";
import type { QuanSuInterpretationPayload } from "./divination";

const XUNG = (chi: number) => (chi + 6) % 12;
const CANDIDATES: HaoRelationType[] = ["Ám Động", "Nhật Phá", "Nhật Tán", "愈动"];
const CAN_GIAP = 0;
// Quẻ Thuần Càn (6 hào dương): mỗi hào 1 chi khác nhau — đọc chi động từ engine, không hardcode napGiap.
const CAN: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal] = [1, 1, 1, 1, 1, 1];

/** Nhãn Nhật-xung THẬT của hào `pos`: ép động/tĩnh + tìm tháng cho đúng vượng/suy. */
function clashOf(pos: number, isDong: boolean, want: "vuong" | "suy") {
  const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
  const targetChi = probe.hao[pos - 1].chiIndex;
  const dayChi = XUNG(targetChi); // ép Nhật xung đúng hào target
  for (let m = 0; m < 12; m++) {
    const q = lapQueDayDu(CAN, CAN_GIAP, isDong ? [pos] : [], m, null, dayChi);
    const h = q.hao[pos - 1];
    const isVuong = h.vuongSuy === "Vượng" || h.vuongSuy === "Tướng";
    if (want === "vuong" ? isVuong : !isVuong) {
      const dayRel = h.relations.filter((r) => r.source === "DAY").map((r) => r.type);
      return {
        clash: dayRel.filter((t) => CANDIDATES.includes(t)),
        hasXung: dayRel.includes("Xung"),
        vuongSuy: h.vuongSuy,
        isDong: h.isDong,
      };
    }
  }
  throw new Error(`không tìm được tháng cho ${want} ở hào ${pos}`);
}

describe("Phase 25B — Nhật Xung N1–N4 (engine THẬT)", () => {
  it("T1. Tĩnh + Vượng + Nhật xung → Ám Động (đúng 1 nhãn)", () => {
    const r = clashOf(1, false, "vuong");
    expect(r.hasXung).toBe(true);
    expect(r.isDong).toBe(false);
    expect(r.clash).toEqual(["Ám Động"]); // KHÔNG Nhật Phá/Nhật Tán/愈动
  });

  it("T2. Tĩnh + Hưu/Tù + Nhật xung → Nhật Phá (đúng 1 nhãn)", () => {
    const r = clashOf(1, false, "suy");
    expect(r.hasXung).toBe(true);
    expect(r.isDong).toBe(false);
    expect(["Hưu", "Tù", "Tử"]).toContain(r.vuongSuy);
    expect(r.clash).toEqual(["Nhật Phá"]);
  });

  it("T3. Động + Hưu/Tù + Nhật xung → Nhật Tán/散 (KHÔNG Nhật Phá)", () => {
    const r = clashOf(1, true, "suy");
    expect(r.hasXung).toBe(true);
    expect(r.isDong).toBe(true);
    expect(["Hưu", "Tù", "Tử"]).toContain(r.vuongSuy);
    expect(r.clash).toEqual(["Nhật Tán"]);
    expect(r.clash).not.toContain("Nhật Phá");
  });

  it("T4. Động + Vượng + Nhật xung → 愈动 (KHÔNG Ám Động)", () => {
    const r = clashOf(1, true, "vuong");
    expect(r.hasXung).toBe(true);
    expect(r.isDong).toBe(true);
    expect(r.clash).toEqual(["愈动"]);
    expect(r.clash).not.toContain("Ám Động");
  });

  it("T5. Lâm Nguyệt + Động + Nhật xung → 愈动, KHÔNG 散 (爻逢月建，日冲而不散)", () => {
    const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
    const targetChi = probe.hao[0].chiIndex;
    const q = lapQueDayDu(CAN, CAN_GIAP, [1], targetChi /* month = lâm Nguyệt */, null, XUNG(targetChi));
    const h = q.hao[0];
    expect(h.relations.some((r) => r.type === "Lâm Nguyệt")).toBe(true);
    expect(h.isDong).toBe(true);
    const clash = h.relations.filter((r) => r.source === "DAY" && CANDIDATES.includes(r.type)).map((r) => r.type);
    expect(clash).toEqual(["愈动"]);
    expect(clash).not.toContain("Nhật Tán");
  });

  it("T6. KHÔNG Nhật xung (Lâm Nhật) → không sinh 4 nhãn Nhật-xung", () => {
    const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
    const targetChi = probe.hao[0].chiIndex;
    const q = lapQueDayDu(CAN, CAN_GIAP, [1], null, null, targetChi /* day = chính chi → Lâm Nhật, không xung */);
    const h = q.hao[0];
    expect(h.relations.some((r) => r.type === "Lâm Nhật")).toBe(true);
    const clash = h.relations.filter((r) => r.source === "DAY" && CANDIDATES.includes(r.type));
    expect(clash).toHaveLength(0);
  });

  it("T7. Control tĩnh↔động cùng vượng/suy cho nhãn KHÁC nhau", () => {
    expect(clashOf(1, false, "vuong").clash).toEqual(["Ám Động"]);
    expect(clashOf(1, true, "vuong").clash).toEqual(["愈动"]);
    expect(clashOf(1, false, "suy").clash).toEqual(["Nhật Phá"]);
    expect(clashOf(1, true, "suy").clash).toEqual(["Nhật Tán"]);
  });
});

// ---- T8: downstream FACT-only (chamDiem KHÔNG chấm điểm 2 nhãn mới; conclusion vẫn chạy) ----
function H(hao: number, chi: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chi);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
const rel = (type: HaoRelationType, source: HaoRelation["source"]): HaoRelation => ({ type, source, target: "HAO" });
const stdHao = (dung6: Partial<HaoInfo>): HaoInfo[] => [
  H(1, "Tý", { lucThan: "Tử Tôn" }), H(2, "Sửu"), H(3, "Dậu"),
  H(4, "Mão"), H(5, "Mão"), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế", ...dung6 }),
];
function C(hao: HaoInfo[], dayChi: string, monthChi: string, dong: number[] = []): FullCastResult {
  return {
    chinh: { hao }, bien: null, dongPositions: dong,
    dayChi, monthChi, yearChi: "Sửu", tuanKhong: "Tuất Hợi",
    fanYin: { enabled: false }, fuYin: { enabled: false },
  } as unknown as FullCastResult;
}
function P(cast: FullCastResult): QuanSuInterpretationPayload {
  return {
    question: { question_id: "q", category: "tong-quat", title: "?", output_type: "tu-van", safety_level: "thuong", dung_than_hint: { kind: "luc-than", value: "Thê Tài" }, doi_tuong_hoi: "chinh-toi" },
    cast, van_trinh: null, ung_ky: null,
    tien_thoai_than: { co: false, danhSach: [], ghiChu: [] }, tam_hop_cuc: { co: false, danhSach: [], ghiChu: [] },
    meta: { castAtISO: "2026-01-01T00:00:00Z", method: "luc-hao-tosses" },
  } as unknown as QuanSuInterpretationPayload;
}
const mentionsNew = (s: string) => /Tán|愈动|càng động/i.test(s);

describe("Phase 25B — T8 downstream FACT-only", () => {
  it("Nhật Tán / 愈动 KHÔNG tạo mục chấm điểm (chamDiem bỏ qua) — conclusion vẫn chạy", () => {
    for (const t of ["Nhật Tán", "愈动"] as HaoRelationType[]) {
      const cast = C(stdHao({ isDong: true, relations: [rel("Xung", "DAY"), rel(t, "DAY")] }), "Thân", "Hợi", [6]);
      const report = buildAdvisoryReport(P(cast));
      expect(report.bangChamDiem.some((i) => mentionsNew(i.factor) || mentionsNew(i.reason))).toBe(false);
      expect(report.ketLuanSuViec).toBeTruthy();
    }
  });

  it("Positive control: Nhật Phá VẪN tạo mục chấm điểm (chứng tỏ FACT-only chỉ riêng 2 nhãn mới)", () => {
    const cast = C(stdHao({ relations: [rel("Xung", "DAY"), rel("Nhật Phá", "DAY")] }), "Thân", "Dậu");
    const report = buildAdvisoryReport(P(cast));
    expect(report.bangChamDiem.some((i) => /Nhật Phá/.test(i.factor))).toBe(true);
  });
});
