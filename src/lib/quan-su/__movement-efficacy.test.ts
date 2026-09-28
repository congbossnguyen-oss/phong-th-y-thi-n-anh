// Phase 25G — MOVEMENT EFFICACY axis (Model 1, khóa Phase 25F §3.10.1).
// Trục hiệu-lực-động MÔ TẢ, TRỰC GIAO base strength. Suy từ 4 nhãn Nhật-xung (engine Phase 25B).
//   Ám Động→LATENT_ACTIVATED · Nhật Phá→BROKEN_STATIC · Nhật Tán/散→DISPERSED · 愈动→INTENSIFIED · else null.
// Engine THẬT: lapQueDayDu → FullCastResult → canLucHao (không synthetic cho 4 case chính).
import { describe, it, expect } from "vitest";
import { lapQueDayDu } from "../luc-hao";
import { canLucHao } from "./can-luc-hao";
import { buildAdvisoryReport } from "./advisory-engine";
import { CHI } from "../menh-nap-am";
import { CHI_NGU_HANH } from "../bat-tu";
import type { LineVal, HaoInfo, HaoRelation, FullCastResult } from "../luc-hao";
import type { QuanSuInterpretationPayload } from "./divination";

const XUNG = (chi: number) => (chi + 6) % 12;
const CAN_GIAP = 0;
const CAN: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal] = [1, 1, 1, 1, 1, 1];

/** Bọc QueDayDu thành FullCastResult tối thiểu để gọi canLucHao (engine thật). */
function wrap(q: ReturnType<typeof lapQueDayDu>, dayChiIdx: number, monthChiIdx: number, dong: number[]): FullCastResult {
  return {
    chinh: q, bien: null, dongPositions: dong,
    dayChi: CHI[dayChiIdx], monthChi: monthChiIdx >= 0 ? CHI[monthChiIdx] : CHI[0], yearChi: "Sửu",
  } as unknown as FullCastResult;
}

/** Build cast THẬT: hào `pos` bị Nhật xung, ép động/tĩnh, tìm tháng cho đúng vượng/suy; trả canLucHao + relations. */
function build(pos: number, isDong: boolean, want: "vuong" | "suy") {
  const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
  const targetChi = probe.hao[pos - 1].chiIndex;
  const dayChi = XUNG(targetChi);
  for (let m = 0; m < 12; m++) {
    const dong = isDong ? [pos] : [];
    const q = lapQueDayDu(CAN, CAN_GIAP, dong, m, null, dayChi);
    const h = q.hao[pos - 1];
    const isVuong = h.vuongSuy === "Vượng" || h.vuongSuy === "Tướng";
    if (want === "vuong" ? isVuong : !isVuong) {
      const st = canLucHao(wrap(q, dayChi, m, dong), pos);
      const dayLabels = h.relations.filter((r) => r.source === "DAY").map((r) => r.type);
      return { st, dayLabels, vuongSuy: h.vuongSuy };
    }
  }
  throw new Error(`không tìm được tháng ${want} cho hào ${pos}`);
}

describe("Phase 25G — movementEfficacy (engine thật)", () => {
  it("T1. Tĩnh + Vượng → Ám Động → LATENT_ACTIVATED", () => {
    const { st, dayLabels } = build(1, false, "vuong");
    expect(dayLabels).toContain("Ám Động");
    expect(st.movementEfficacy).toBe("LATENT_ACTIVATED");
  });
  it("T2. Tĩnh + Hưu/Tù → Nhật Phá → BROKEN_STATIC", () => {
    const { st, dayLabels } = build(1, false, "suy");
    expect(dayLabels).toContain("Nhật Phá");
    expect(st.movementEfficacy).toBe("BROKEN_STATIC");
  });
  it("T3. Động + Hưu/Tù → Nhật Tán/散 → DISPERSED", () => {
    const { st, dayLabels } = build(1, true, "suy");
    expect(dayLabels).toContain("Nhật Tán");
    expect(st.movementEfficacy).toBe("DISPERSED");
  });
  it("T4. Động + Vượng → 愈动 → INTENSIFIED", () => {
    const { st, dayLabels } = build(1, true, "vuong");
    expect(dayLabels).toContain("愈动");
    expect(st.movementEfficacy).toBe("INTENSIFIED");
  });

  it("T5. Lâm Nguyệt + Động + Nhật xung → INTENSIFIED, NOT DISPERSED", () => {
    const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
    const targetChi = probe.hao[0].chiIndex;
    const dayChi = XUNG(targetChi);
    const q = lapQueDayDu(CAN, CAN_GIAP, [1], targetChi /* month = lâm Nguyệt */, null, dayChi);
    expect(q.hao[0].relations.some((r) => r.type === "Lâm Nguyệt")).toBe(true);
    const st = canLucHao(wrap(q, dayChi, targetChi, [1]), 1);
    expect(st.movementEfficacy).toBe("INTENSIFIED");
    expect(st.movementEfficacy).not.toBe("DISPERSED");
  });

  it("T6. Không Nhật xung (Lâm Nhật) → movementEfficacy = null", () => {
    const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
    const targetChi = probe.hao[0].chiIndex;
    const q = lapQueDayDu(CAN, CAN_GIAP, [1], null, null, targetChi /* Lâm Nhật, không xung */);
    const st = canLucHao(wrap(q, targetChi, 0, [1]), 1);
    expect(st.movementEfficacy).toBeNull();
  });
  it("T7. Tĩnh, không xung → movementEfficacy = null", () => {
    const probe = lapQueDayDu(CAN, CAN_GIAP, [], null, null, 0);
    const targetChi = probe.hao[0].chiIndex;
    const q = lapQueDayDu(CAN, CAN_GIAP, [], 0, null, targetChi); // Lâm Nhật tĩnh
    const st = canLucHao(wrap(q, targetChi, 0, []), 1);
    expect(st.movementEfficacy).toBeNull();
  });

  it("T8. Isolation: movementEfficacy TÁCH KHỎI base/effective/reduced (không nằm trong currentState)", () => {
    const { st } = build(1, true, "suy"); // DISPERSED
    expect(st.movementEfficacy).toBe("DISPERSED");
    // Không rò rỉ vào sub-object lực:
    expect("movementEfficacy" in st.currentState).toBe(false);
    // base/effective/reduced vẫn là các trục lực độc lập:
    expect(st.currentState).toHaveProperty("base");
    expect(st.currentState).toHaveProperty("effective");
    expect(st.currentState).toHaveProperty("reduced");
    // Mutate efficacy KHÔNG đổi các trục lực:
    const beforeBase = st.currentState.base, beforeEff = st.currentState.effective, beforeRed = st.currentState.reduced;
    st.movementEfficacy = "INTENSIFIED";
    expect(st.currentState.base).toBe(beforeBase);
    expect(st.currentState.effective).toBe(beforeEff);
    expect(st.currentState.reduced).toBe(beforeRed);
  });

  it("T9. Nhật Phá vẫn set reduced=true (base-strength path KHÔNG đổi bởi Model 1)", () => {
    const { st } = build(1, false, "suy"); // Nhật Phá / BROKEN_STATIC
    expect(st.movementEfficacy).toBe("BROKEN_STATIC");
    expect(st.temporalState.nhatPha).toBe(true);
    expect(st.currentState.reduced).toBe(true); // Nhật Phá vẫn vào reduced như trước
  });
});

// ---- T8 (downstream): scoring/conclusion KHÔNG đọc movementEfficacy ----
function H(hao: number, chi: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chi);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
const rel = (type: HaoRelation["type"], source: HaoRelation["source"]): HaoRelation => ({ type, source, target: "HAO" });
const stdHao = (dung6: Partial<HaoInfo>): HaoInfo[] => [
  H(1, "Tý", { lucThan: "Tử Tôn" }), H(2, "Sửu"), H(3, "Dậu"),
  H(4, "Mão"), H(5, "Mão"), H(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế", ...dung6 }),
];
function P(hao: HaoInfo[], dayChi: string, monthChi: string, dong: number[]): QuanSuInterpretationPayload {
  const cast = { chinh: { hao }, bien: null, dongPositions: dong, dayChi, monthChi, yearChi: "Sửu", tuanKhong: "Tuất Hợi", fanYin: { enabled: false }, fuYin: { enabled: false } } as unknown as FullCastResult;
  return {
    question: { question_id: "q", category: "tong-quat", title: "?", output_type: "tu-van", safety_level: "thuong", dung_than_hint: { kind: "luc-than", value: "Thê Tài" }, doi_tuong_hoi: "chinh-toi" },
    cast, van_trinh: null, ung_ky: null,
    tien_thoai_than: { co: false, danhSach: [], ghiChu: [] }, tam_hop_cuc: { co: false, danhSach: [], ghiChu: [] },
    meta: { castAtISO: "2026-01-01T00:00:00Z", method: "luc-hao-tosses" },
  } as unknown as QuanSuInterpretationPayload;
}

describe("Phase 25G — T8 downstream: chamDiem/conclusion KHÔNG đọc movementEfficacy", () => {
  it("Dụng động+xung (散/愈动): bangChamDiem không có mục efficacy, ketLuanSuViec vẫn chạy", () => {
    for (const t of ["Nhật Tán", "愈动"] as HaoRelation["type"][]) {
      const report = buildAdvisoryReport(P(stdHao({ isDong: true, relations: [rel("Xung", "DAY"), rel(t, "DAY")] }), "Thân", "Hợi", [6]));
      expect(report.bangChamDiem.some((i) => /efficacy|movement|散|愈动|Tán|càng động|LATENT|DISPERSED|INTENSIFIED|BROKEN/i.test(i.factor + i.reason))).toBe(false);
      expect(report.ketLuanSuViec).toBeTruthy();
    }
  });
});
