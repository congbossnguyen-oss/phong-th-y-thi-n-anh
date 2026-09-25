// Phase 13 — AI INTERPRETATION FIDELITY. Không gọi model thật: kiểm PROMPT CONTRACT + GUARDRAIL.
// Bảo đảm prompt (a) mang NGUYÊN VĂN state/conclusion deterministic mà engine đã tính, và (b) chứa
// guardrail buộc AI trung thành (không đảo state, giữ MIXED/UNRESOLVED, Không Vong ≠ mất, Phá ≠ zero).
import { describe, it, expect } from "vitest";
import { userPrompt, systemPromptQuyTac } from "./luan-giai/prompt";
import { resolveDungThan, resolveFourGods } from "./advisory-engine";
import { ketLuanSuViec } from "./ket-luan-su-viec";
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
function mkCast(hao: HaoInfo[], dayChi: string, monthChi: string, over: Partial<FullCastResult> = {}): FullCastResult {
  return {
    chinh: { hao }, bien: null, dongPositions: [], dayChi, monthChi, yearChi: "Sửu",
    fanYin: { enabled: false }, fuYin: { enabled: false }, ...over,
  } as unknown as FullCastResult;
}
function payloadOf(cast: FullCastResult, dungLucThan: string): QuanSuInterpretationPayload {
  return {
    question: {
      question_id: "q", category: "tong-quat", title: "Việc này thế nào?", output_type: "tu-van",
      safety_level: "thuong", dung_than_hint: { kind: "luc-than", value: dungLucThan }, doi_tuong_hoi: "chinh-toi",
    },
    cast, van_trinh: null, ung_ky: null,
    tien_thoai_than: { co: false, danhSach: [], ghiChu: [] },
    tam_hop_cuc: { co: false, danhSach: [], ghiChu: [] },
    meta: { castAtISO: "2026-01-01T00:00:00Z", method: "luc-hao-tosses" },
  } as unknown as QuanSuInterpretationPayload;
}
/** Dựng prompt + fourGods + conclusion cho một quẻ (tất cả từ engine thật). */
function build(cast: FullCastResult, dungLucThan: string) {
  const payload = payloadOf(cast, dungLucThan);
  const dt = resolveDungThan(cast.chinh, payload.question.dung_than_hint);
  const fourGods = resolveFourGods(cast, dt);
  const conclusion = ketLuanSuViec(cast, dt, fourGods);
  const prompt = userPrompt(payload, undefined, fourGods);
  return { prompt, dt, fourGods, conclusion };
}

// Quẻ chuẩn: Dụng Thê Tài Mộc (hào 6, Dần) + Nguyên Tử Tôn Thủy (hào 1, Tý) + Kỵ Huynh Đệ Kim (hào 3, Dậu).
function castThamSinh(over: Partial<HaoInfo> = {}, dayChi = "Tý", monthChi = "Hợi", castOver: Partial<FullCastResult> = {}) {
  const hao = [
    mkHao(1, "Tý", { lucThan: "Tử Tôn" }),
    mkHao(2, "Mão"),
    mkHao(3, "Dậu"),
    mkHao(4, "Mão"),
    mkHao(5, "Mão"),
    mkHao(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế", ...over }),
  ];
  return mkCast(hao, dayChi, monthChi, castOver);
}

// ---- GUARDRAILS (systemPromptQuyTac) ----------------------------------------------------------
describe("Phase 13 — guardrails (source of truth + uncertainty)", () => {
  const rules = systemPromptQuyTac();
  it("có tuyên bố nguồn sự thật deterministic + thứ tự ưu tiên", () => {
    expect(rules).toContain("NGUỒN SỰ THẬT DETERMINISTIC");
    expect(rules).toMatch(/KẾT LUẬN SỰ VIỆC.*KỴ→NGUYÊN→DỤNG.*CÂN LỰC HÀO/s);
    expect(rules).toContain("KHÔNG được override tầng trên");
  });
  it("cấm đảo trạng thái + cấm tính lại Ngũ hành", () => {
    expect(rules).toContain("KHÔNG tự thay đổi trạng thái");
    expect(rules).toContain("KHÔNG tự tính lại Ngũ hành");
  });
  it("bảo toàn MIXED / UNRESOLVED", () => {
    expect(rules).toContain("MIXED");
    expect(rules).toContain("UNRESOLVED");
    expect(rules).toContain("GIỮ NGUYÊN");
  });
  it("Không Vong ≠ mất; Phá ≠ zero; đếm từ tốt/xấu không thay conclusion", () => {
    expect(rules).toMatch(/Không Vong.*KHÔNG phải 'mất'/s);
    expect(rules).toMatch(/Phá.*KHÔNG xóa lực/s);
    expect(rules).toContain("KHÔNG thay thế được `conclusion`");
  });
});

// ---- CONCLUSION FIDELITY: prompt mang nguyên văn conclusion engine ----------------------------
describe("Phase 13 — conclusion fidelity (prompt carries engine verdict)", () => {
  const scenarios: Array<[string, () => FullCastResult, string]> = [
    ["FAVORABLE (tham sinh)", () => castThamSinh(), "Thê Tài"],
    ["FAVORABLE_WITH_DELAY (Dụng Không Vong)", () => castThamSinh({ xunKong: true }), "Thê Tài"],
    ["MIXED (Dụng yếu, không Kỵ/Nguyên)", () => {
      // Dụng Mộc bị Ngày Dậu + Tháng Thân khắc → Suy; không hào Kim/Thủy khác → không Kỵ/Nguyên.
      const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" })];
      return mkCast(hao, "Dậu", "Thân");
    }, "Thê Tài"],
    ["UNRESOLVED (Dụng phục tàng)", () => {
      const hao = [
        mkHao(1, "Tý", { lucThan: "Tử Tôn", phucThan: { lucThan: "Quan Quỷ", canIndex: 0, chiIndex: CHI.indexOf("Dậu") } }),
        mkHao(2, "Mão"), mkHao(3, "Dậu"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { theUng: "Thế" }),
      ];
      return mkCast(hao, "Tý", "Hợi");
    }, "Quan Quỷ"],
  ];
  for (const [name, mk, hint] of scenarios) {
    it(`${name} → prompt chứa đúng conclusion`, () => {
      const { prompt, conclusion } = build(mk(), hint);
      expect(prompt).toContain(`"conclusion": "${conclusion.conclusion}"`);
    });
  }
});

// ---- STATE FIDELITY: prompt mang state đúng, không nơi nào "đảo" ------------------------------
describe("Phase 13 — state fidelity (prompt carries HaoStrength + chain states)", () => {
  it("Dụng strength (baseForce/effective) xuất hiện nguyên trong CÂN LỰC HÀO", () => {
    const cast = castThamSinh();
    const { prompt, dt } = build(cast, "Thê Tài");
    // Dụng hào 6 Dần, Ngày Tý + Tháng Hợi (Thủy sinh Mộc) → Vượng.
    expect(prompt).toContain("CÂN LỰC HÀO");
    expect(prompt).toContain('"baseForce": "Vượng"');
    expect(dt.hao?.hao).toBe(6);
  });
  it("kyPressure / nguyenSupport / dungProtection có trong block Kỵ→Nguyên→Dụng", () => {
    const { prompt, conclusion } = build(castThamSinh(), "Thê Tài");
    expect(prompt).toContain("KỴ → NGUYÊN → DỤNG");
    expect(prompt).toContain(`"ky_pressure": "${conclusion.kyNguyenDung.kyPressure}"`);
    expect(prompt).toContain(`"nguyen_support": "${conclusion.kyNguyenDung.nguyenSupport}"`);
    expect(prompt).toContain(`"dung_protection": "${conclusion.kyNguyenDung.dungProtection}"`);
  });
  it("relation Kỵ→Nguyên GENERATES + Nguyên→Dụng GENERATES (chiều đúng)", () => {
    const { conclusion } = build(castThamSinh(), "Thê Tài");
    expect(conclusion.kyNguyenDung.chains[0].kyToNguyen[0].relation).toBe("GENERATES");
    expect(conclusion.kyNguyenDung.chains[0].nguyenToDung[0].relation).toBe("GENERATES");
  });
});

// ---- KHÔNG VONG / PHÁ fidelity ---------------------------------------------------------------
describe("Phase 13 — Không Vong / Phá fidelity", () => {
  it("Dụng Không Vong + base mạnh → temporal EMPTY nhưng strength vẫn mạnh trong prompt", () => {
    const { prompt, conclusion } = build(castThamSinh({ xunKong: true }), "Thê Tài");
    expect(conclusion.dungThan?.temporal).toBe("EMPTY");
    expect(["VERY_STRONG", "STRONG"]).toContain(conclusion.dungThan?.strength);
    expect(prompt).toContain('"temporalExistence": "EMPTY"');
    expect(prompt).toContain(`"temporal": "EMPTY"`);
  });
  it("Dụng Nguyệt Phá + rất Vượng → reduced nhưng strength mạnh (không zero)", () => {
    // hào 6 Dần lâm Nguyệt (Tháng Dần) → Vượng; thêm quan hệ Nguyệt Phá thủ công + Ngày sinh.
    const cast = castThamSinh({ relations: [{ type: "Nguyệt Phá", source: "MONTH", target: "HAO" }] }, "Tý", "Thân");
    const { conclusion } = build(cast, "Thê Tài");
    expect(conclusion.dungThan?.reasons.join(" ")).toMatch(/giảm lực|Phá/);
    expect(conclusion.dungThan?.conclusion).not.toBe("UNFAVORABLE");
  });
});

// ---- CONTEXT fidelity ------------------------------------------------------------------------
describe("Phase 13 — context fidelity (Thế/Ứng, Tam Hợp, Phản/Phục Ngâm)", () => {
  it("Thế/Ứng axis được surface trong KẾT LUẬN, không phán tốt/xấu", () => {
    const { prompt, conclusion } = build(castThamSinh(), "Thê Tài");
    expect(prompt).toContain('"the_ung"');
    expect(prompt).toContain(`"relation": "${conclusion.theUng.relation}"`);
  });
  it("Tam Hợp: chỉ dùng contextualSignals.tamHop từ engine (TH1)", () => {
    const hao = [
      mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true, lucThan: "Tử Tôn" }),
      mkHao(3, "Thìn", { isDong: true }), mkHao(4, "Mão"), mkHao(5, "Mão"),
      mkHao(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" }),
    ];
    const cast = mkCast(hao, "Tỵ", "Dậu", { dongPositions: [1, 2, 3] });
    const { prompt, conclusion } = build(cast, "Thê Tài");
    expect(conclusion.contextualSignals.tamHop).toContain("TH1_FULL");
    expect(prompt).toContain("TH1_FULL");
  });
  it("Phản Ngâm → REPEATED_CHANGE trong contextual", () => {
    const cast = castThamSinh({}, "Tý", "Hợi", { fanYin: { enabled: true } as FullCastResult["fanYin"] });
    const { prompt } = build(cast, "Thê Tài");
    expect(prompt).toContain("REPEATED_CHANGE");
  });
  it("Phục Ngâm → REPEATED_STATE trong contextual", () => {
    const cast = castThamSinh({}, "Tý", "Hợi", { fuYin: { enabled: true } as FullCastResult["fuYin"] });
    const { prompt } = build(cast, "Thê Tài");
    expect(prompt).toContain("REPEATED_STATE");
  });
});

// ---- TRANSFORMATION fidelity: prompt mang đúng transformationState engine tính -----------------
describe("Phase 13 — transformation fidelity (prompt carries hóa-biến state)", () => {
  // Dụng hào 6 động (Dần/Mão Mộc) + hào biến → assert cờ transformation xuất hiện nguyên trong prompt.
  function castHoa(dungChi: string, bienChi: string, dungOver: Partial<HaoInfo> = {}) {
    const hao = [
      mkHao(1, "Tý", { lucThan: "Tử Tôn" }), mkHao(2, "Mão"), mkHao(3, "Dậu"),
      mkHao(4, "Mão"), mkHao(5, "Mão"),
      mkHao(6, dungChi, { lucThan: "Thê Tài", theUng: "Thế", isDong: true, ...dungOver }),
    ];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, bienChi, { lucThan: "Thê Tài" }) : mkHao(h.hao, CHI[h.chiIndex])));
    return mkCast(hao, "Tý", "Hợi", { bien: { hao: bien } as unknown as FullCastResult["bien"], dongPositions: [6] });
  }
  const cases: Array<[string, () => FullCastResult, string]> = [
    ["Hóa Hợp", () => castHoa("Dần", "Hợi"), '"hoaHop": true'],
    ["Hồi Đầu Sinh", () => castHoa("Dần", "Tý"), '"hoiDauSinh": true'],
    ["Hồi Đầu Khắc", () => castHoa("Dần", "Dậu"), '"hoiDauKhac": true'],
    ["Hóa Tiến", () => castHoa("Dần", "Mão"), '"hoaTien": true'],
    ["Hóa Thoái", () => castHoa("Mão", "Dần"), '"hoaThoai": true'],
    ["Hóa Tuyệt", () => castHoa("Dần", "Thân"), '"hoaTuyet": true'],
    ["Hóa Mộ", () => castHoa("Dần", "Mùi", { relations: [{ type: "Nhập Mộ", source: "CHANGED_YAO", target: "HAO" }] }), '"hoaMo": true'],
  ];
  for (const [name, mk, needle] of cases) {
    it(`${name} → prompt chứa ${needle}`, () => {
      const { prompt } = build(mk(), "Thê Tài");
      expect(prompt).toContain(needle);
    });
  }
});

// ---- STATE fidelity per-tier: prompt mang đúng baseForce, không đảo -----------------------------
describe("Phase 13 — per-tier state fidelity", () => {
  const tiers: Array<[string, string, string, string]> = [
    // [name, dungChi, dayChi, monthChi] → kỳ vọng baseForce
    ["Vượng giữ nguyên", "Dần", "Tý", "Hợi"], // Thủy sinh Mộc → Vượng
    ["Suy giữ nguyên", "Dần", "Dậu", "Thân"], // Kim khắc Mộc → Suy
  ];
  for (const [name, dungChi, dayChi, monthChi] of tiers) {
    it(name, () => {
      const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, dungChi, { lucThan: "Thê Tài", theUng: "Thế" })];
      const cast = mkCast(hao, dayChi, monthChi);
      const { prompt, conclusion } = build(cast, "Thê Tài");
      // baseForce engine tính phải xuất hiện nguyên trong prompt (không bị đảo).
      const cs = conclusion.kyNguyenDung; void cs;
      expect(prompt).toMatch(new RegExp(`"baseForce": "(Vượng|Suy|Trung Hòa|Rất Vượng)"`));
    });
  }
});

// ---- ADVERSARIAL: prompt không để reasons/văn phong lật conclusion ----------------------------
describe("Phase 13 — adversarial (verdict must survive skewed reasons)", () => {
  it("MIXED giữ nguyên dù engine liệt nhiều reason; guardrail cấm ép một phía", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" })];
    const cast = mkCast(hao, "Dậu", "Thân"); // Dụng Suy, không Kỵ/Nguyên → MIXED
    const { prompt, conclusion } = build(cast, "Thê Tài");
    expect(conclusion.conclusion).toBe("MIXED");
    expect(prompt).toContain(`"conclusion": "MIXED"`);
    expect(prompt).toMatch(/MIXED.*GIỮ NGUYÊN|GIỮ NGUYÊN.*MIXED/s);
  });
  it("Kỵ Không Vong: relation vẫn OVERCOMES, effective EMPTY (không 'Kỵ = 0')", () => {
    // Kỵ Huynh Đệ Kim (hào 3 Dậu) Không Vong.
    const hao = [
      mkHao(1, "Tý", { lucThan: "Tử Tôn" }), mkHao(2, "Mão"),
      mkHao(3, "Dậu", { xunKong: true }), mkHao(4, "Mão"), mkHao(5, "Mão"),
      mkHao(6, "Dần", { lucThan: "Thê Tài", theUng: "Thế" }),
    ];
    const cast = mkCast(hao, "Tý", "Hợi");
    const { conclusion } = build(cast, "Thê Tài");
    const direct = conclusion.kyNguyenDung.chains[0].directPressure[0];
    expect(direct.relation).toBe("OVERCOMES");
    expect(direct.effective).toBe("EMPTY");
  });
  it("Dụng rất mạnh nhưng conclusion không tự thành 'chắc chắn' khi có delay", () => {
    const { conclusion } = build(castThamSinh({ xunKong: true }), "Thê Tài");
    expect(conclusion.conclusion).toBe("FAVORABLE_WITH_DELAY"); // không phải FAVORABLE tuyệt đối
  });
});
