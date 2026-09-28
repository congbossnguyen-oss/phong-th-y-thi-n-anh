// Phase 11 — KỴ → NGUYÊN → DỤNG synthesis. Deterministic, score-free.
// Phần lớn test dùng synthesizeChain với NODE dựng tay (điều khiển chính xác currentState) — kiểm logic
// tổng hợp. 2 test cuối đi end-to-end qua synthesizeKyNguyenDung(cast,...) để kiểm builder + canLucHao.
import { describe, it, expect } from "vitest";
import {
  synthesizeChain, synthesizeKyNguyenDung,
  type ChainNode, type ChainRole,
} from "./ky-nguyen-dung";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI, type NguHanh } from "../menh-nap-am";
import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { HaoStrengthState } from "./can-luc-hao";
import type { DungThanResolved, FourGods, FourGodMember } from "./advisory-engine";

type CS = HaoStrengthState["currentState"];
function cs(over: Partial<CS> = {}): CS {
  return { base: "Vượng", effective: "Vượng", reduced: false, restrained: false, hidden: false, temporalExistence: "PRESENT", reasons: [], ...over };
}
function node(lineIndex: number, role: ChainRole, nguHanh: NguHanh, over: Partial<CS> = {}): ChainNode {
  return { lineIndex, role, nguHanh, strength: { currentState: cs(over) } as unknown as HaoStrengthState };
}
// presets
const STRONG = {}; // Vượng, không hạn chế → availability STRONG
const SUY = { effective: "Suy" as const }; // → LIMITED
const KHONG = { temporalExistence: "EMPTY" as const }; // Không Vong → EMPTY
const PHA = { reduced: true }; // Phá/Hồi Đầu Khắc, base giữ → LIMITED
const HOAHOP = { restrained: true }; // Hóa Hợp níu chân → LIMITED
const MO = { hidden: true }; // Nhập Mộ → HIDDEN

// Canonical: Dụng Mộc; Nguyên Thủy (sinh Mộc); Kỵ Kim (khắc Mộc, và Kim sinh Thủy = tham sinh).
const DUNG_M = (over = {}) => node(6, "DUNG", "Mộc", over);
const NGUYEN_T = (li = 1, over = {}) => node(li, "NGUYEN", "Thủy", over);
const KY_K = (li = 3, over = {}) => node(li, "KI", "Kim", over);

describe("Phase 11 — Kỵ → Nguyên (quan hệ + effective)", () => {
  it("1. Kỵ khắc Nguyên + Kỵ Vượng → OVERCOMES, effective STRONG", () => {
    // non-canonical: Kỵ Thổ khắc Nguyên Thủy (test cơ chế §VI CASE A).
    const r = synthesizeChain(DUNG_M(), [node(3, "KI", "Thổ", STRONG)], [NGUYEN_T()]);
    const i = r.chains[0].kyToNguyen[0];
    expect(i.relation).toBe("OVERCOMES");
    expect(i.effective).toBe("STRONG");
  });
  it("2. Kỵ khắc Nguyên + Kỵ Suy → OVERCOMES, effective LIMITED", () => {
    const r = synthesizeChain(DUNG_M(), [node(3, "KI", "Thổ", SUY)], [NGUYEN_T()]);
    expect(r.chains[0].kyToNguyen[0].effective).toBe("LIMITED");
  });
  it("3. Kỵ khắc Nguyên + Kỵ Không Vong → relation vẫn OVERCOMES, effective EMPTY", () => {
    const r = synthesizeChain(DUNG_M(), [node(3, "KI", "Thổ", KHONG)], [NGUYEN_T()]);
    expect(r.chains[0].kyToNguyen[0].relation).toBe("OVERCOMES");
    expect(r.chains[0].kyToNguyen[0].effective).toBe("EMPTY");
  });
  it("4. Kỵ khắc Nguyên + Kỵ Phá → effective LIMITED, base giữ (không zero)", () => {
    const kyNode = node(3, "KI", "Thổ", { ...PHA, base: "Vượng" });
    const r = synthesizeChain(DUNG_M(), [kyNode], [NGUYEN_T()]);
    expect(r.chains[0].kyToNguyen[0].effective).toBe("LIMITED");
    expect(r.chains[0].ky[0].strength.currentState.base).toBe("Vượng");
  });
  it("5. Kỵ sinh Nguyên (canonical Kim→Thủy) → GENERATES", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K()], [NGUYEN_T()]);
    expect(r.chains[0].kyToNguyen[0].relation).toBe("GENERATES");
  });
  it("6. Kỵ đồng hành Nguyên → SAME_ELEMENT", () => {
    const r = synthesizeChain(DUNG_M(), [node(3, "KI", "Thủy", STRONG)], [NGUYEN_T()]);
    expect(r.chains[0].kyToNguyen[0].relation).toBe("SAME_ELEMENT");
  });
});

describe("Phase 11 — Nguyên → Dụng (quan hệ + effective)", () => {
  it("7. Nguyên sinh Dụng + Nguyên Vượng → GENERATES, STRONG", () => {
    const r = synthesizeChain(DUNG_M(), [], [NGUYEN_T(1, STRONG)]);
    expect(r.chains[0].nguyenToDung[0].relation).toBe("GENERATES");
    expect(r.chains[0].nguyenToDung[0].effective).toBe("STRONG");
  });
  it("8. Nguyên sinh Dụng + Nguyên Suy → LIMITED", () => {
    const r = synthesizeChain(DUNG_M(), [], [NGUYEN_T(1, SUY)]);
    expect(r.chains[0].nguyenToDung[0].effective).toBe("LIMITED");
  });
  it("9. Nguyên sinh Dụng + Nguyên Không Vong → EMPTY (hỗ trợ chưa hiện hữu)", () => {
    const r = synthesizeChain(DUNG_M(), [], [NGUYEN_T(1, KHONG)]);
    expect(r.chains[0].nguyenToDung[0].effective).toBe("EMPTY");
    expect(r.dungProtection).toBe("DELAYED");
  });
  it("10. Nguyên khắc Dụng → OVERCOMES (không phải hỗ trợ)", () => {
    // Dụng Thổ; 'Nguyên' Mộc khắc Thổ.
    const r = synthesizeChain(node(6, "DUNG", "Thổ", STRONG), [], [node(1, "NGUYEN", "Mộc", STRONG)]);
    expect(r.chains[0].nguyenToDung[0].relation).toBe("OVERCOMES");
    expect(r.nguyenSupport).toBe("NONE"); // khắc KHÔNG tính là hỗ trợ
  });
  it("11. Nguyên đồng hành Dụng → SAME_ELEMENT", () => {
    const r = synthesizeChain(DUNG_M(), [], [node(1, "NGUYEN", "Mộc", STRONG)]);
    expect(r.chains[0].nguyenToDung[0].relation).toBe("SAME_ELEMENT");
  });
});

describe("Phase 11 — multi-node + no-Nguyên + direct pressure", () => {
  it("12. Nhiều Kỵ → đánh giá từng cái, KHÔNG cộng lực", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, STRONG), KY_K(4, KHONG)], [NGUYEN_T()]);
    expect(r.chains[0].ky).toHaveLength(2);
    expect(r.chains[0].directPressure).toHaveLength(2);
    const effs = r.chains[0].directPressure.map((i) => i.effective).sort();
    expect(effs).toEqual(["EMPTY", "STRONG"]); // mỗi Kỵ giữ effective riêng
  });
  it("13. Nhiều Nguyên → từng Nguyên → Dụng riêng", () => {
    const r = synthesizeChain(DUNG_M(), [], [NGUYEN_T(1, STRONG), NGUYEN_T(2, SUY)]);
    expect(r.chains[0].nguyenToDung).toHaveLength(2);
    expect(r.nguyenSupport).toBe("STRONG"); // max, KHÔNG cộng
  });
  it("14. Nhiều Dụng → mỗi Dụng một chain độc lập (gọi per-Dụng)", () => {
    const rA = synthesizeChain(DUNG_M(STRONG), [KY_K(3, STRONG)], []);
    const rB = synthesizeChain(node(5, "DUNG", "Mộc", STRONG), [KY_K(3, SUY)], [NGUYEN_T(1, STRONG)]);
    expect(rA.currentState).not.toBe(rB.currentState); // độc lập, không gộp
  });
  it("15. Không có Nguyên → chuỗi Kỵ → [NONE] → Dụng, KY_DOMINANT", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, STRONG)], []);
    expect(r.chains[0].nguyen).toHaveLength(0);
    expect(r.currentState).toBe("KY_DOMINANT");
    expect(r.dungProtection).toBe("UNDER_PRESSURE");
  });
  it("16. Kỵ trực tiếp khắc Dụng → directPressure OVERCOMES", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, STRONG)], []);
    expect(r.chains[0].directPressure[0].relation).toBe("OVERCOMES");
  });
});

describe("Phase 11 — chain combinations (consume HaoStrengthState)", () => {
  it("17. Kỵ khắc Nguyên + Nguyên sinh Dụng → giữ cả 2 quan hệ", () => {
    const r = synthesizeChain(DUNG_M(), [node(3, "KI", "Thổ", STRONG)], [NGUYEN_T(1, STRONG)]);
    expect(r.chains[0].kyToNguyen[0].relation).toBe("OVERCOMES");
    expect(r.chains[0].nguyenToDung[0].relation).toBe("GENERATES");
  });
  it("18. Kỵ khắc Nguyên + Nguyên suy → hỗ trợ Nguyên yếu đi", () => {
    const r = synthesizeChain(DUNG_M(), [node(3, "KI", "Thổ", STRONG)], [NGUYEN_T(1, SUY)]);
    expect(r.nguyenSupport).toBe("LIMITED");
  });
  it("19. Kỵ Không Vong + Nguyên sinh Dụng → Kỵ EMPTY, Dụng PROTECTED", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, KHONG)], [NGUYEN_T(1, STRONG)]);
    expect(r.chains[0].directPressure[0].effective).toBe("EMPTY");
    expect(r.dungProtection).toBe("PROTECTED");
  });
  it("20. Kỵ Phá + Nguyên sinh Dụng → Kỵ LIMITED, base giữ, Dụng PROTECTED", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, { ...PHA, base: "Vượng" })], [NGUYEN_T(1, STRONG)]);
    expect(r.chains[0].directPressure[0].effective).toBe("LIMITED");
    expect(r.chains[0].ky[0].strength.currentState.base).toBe("Vượng");
    expect(r.dungProtection).toBe("PROTECTED");
  });
  it("21. Kỵ mạnh + Nguyên mạnh + Dụng mạnh → tham sinh → PROTECTED / NGUYEN_SUPPORTS_DUNG", () => {
    const r = synthesizeChain(DUNG_M(STRONG), [KY_K(3, STRONG)], [NGUYEN_T(1, STRONG)]);
    expect(r.dungProtection).toBe("PROTECTED");
    expect(r.currentState).toBe("NGUYEN_SUPPORTS_DUNG");
  });
  it("22. Kỵ mạnh + Nguyên yếu → KY_DOMINANT / UNDER_PRESSURE", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, STRONG)], [NGUYEN_T(1, SUY)]);
    expect(r.currentState).toBe("KY_DOMINANT");
    expect(r.dungProtection).toBe("UNDER_PRESSURE");
  });
  it("23. Kỵ yếu + Nguyên mạnh → NGUYEN_SUPPORTS_DUNG / PROTECTED", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, SUY)], [NGUYEN_T(1, STRONG)]);
    expect(r.currentState).toBe("NGUYEN_SUPPORTS_DUNG");
    expect(r.dungProtection).toBe("PROTECTED");
  });
  it("24. Kỵ mạnh + 'Nguyên' mạnh nhưng Nguyên KHẮC Dụng → UNDER_PRESSURE (không nhảy kết luận)", () => {
    const r = synthesizeChain(
      node(6, "DUNG", "Thổ", STRONG),
      [node(3, "KI", "Mộc", STRONG)], // Mộc khắc Thổ
      [node(1, "NGUYEN", "Mộc", STRONG)], // 'Nguyên' Mộc cũng khắc Thổ
    );
    expect(r.dungProtection).toBe("UNDER_PRESSURE");
  });
});

describe("Phase 11 — Phase 10 state precedence (không tự tính lại)", () => {
  it("25. Động nhưng không tự nâng: node effective Suy → LIMITED (dù 'động')", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, { effective: "Suy" })], [NGUYEN_T()]);
    expect(r.chains[0].directPressure[0].effective).toBe("LIMITED");
  });
  it("26. Hóa Hợp giữ force nhưng hạn chế interaction → LIMITED, base giữ", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, { ...HOAHOP, base: "Vượng" })], [NGUYEN_T()]);
    expect(r.chains[0].directPressure[0].effective).toBe("LIMITED");
    expect(r.chains[0].ky[0].strength.currentState.base).toBe("Vượng");
  });
  it("27. Hồi Đầu Sinh hỗ trợ interaction (effective Vượng, không reduced) → STRONG", () => {
    const r = synthesizeChain(DUNG_M(), [], [NGUYEN_T(1, { effective: "Vượng", reduced: false })]);
    expect(r.chains[0].nguyenToDung[0].effective).toBe("STRONG");
  });
  it("28. Không Vong KHÔNG biến force thành zero (base giữ, chỉ EMPTY)", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K(3, { ...KHONG, base: "Vượng", effective: "Vượng" })], [NGUYEN_T()]);
    expect(r.chains[0].directPressure[0].effective).toBe("EMPTY");
    expect(r.chains[0].ky[0].strength.currentState.base).toBe("Vượng"); // KHÔNG = 0
  });
  it("no-score: kết quả không chứa field điểm số", () => {
    const r = synthesizeChain(DUNG_M(), [KY_K()], [NGUYEN_T()]);
    for (const banned of ["score", "diem", "weight", "point", "percent", "threshold"]) {
      expect(JSON.stringify(r).toLowerCase()).not.toContain(banned);
    }
  });
});

// ---- End-to-end qua cast + canLucHao ----------------------------------------------------------
function mkHao(hao: number, chiName: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chiName);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
function mkCast(hao: HaoInfo[], dayChi: string, monthChi: string): FullCastResult {
  return { chinh: { hao }, bien: null, dongPositions: [], dayChi, monthChi, yearChi: "Sửu" } as unknown as FullCastResult;
}
const member = (hao: number): FourGodMember => ({ hao } as unknown as FourGodMember);

describe("Phase 11 — golden end-to-end (builder + canLucHao)", () => {
  it("tham sinh vong khắc: Kỵ + Nguyên sống + Dụng vượng → Dụng được bảo vệ", () => {
    // Dụng Mộc (hào 6, Dần); Nguyên Thủy (hào 1, Tý = Lâm Nhật → Vượng); Kỵ Kim (hào 3, Dậu).
    // Ngày Tý + Tháng Hợi (Thủy) → Dụng Mộc both-support Vượng; Kỵ Kim tiết → Trung Hòa (còn tương tác).
    const hao = [
      mkHao(1, "Tý"), mkHao(2, "Mão"), mkHao(3, "Dậu"),
      mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần"),
    ];
    const cast = mkCast(hao, "Tý", "Hợi");
    const dt: DungThanResolved = { hao: hao[5], target: "Huynh Đệ", trangThai: "hien", lyDo: "" };
    const fourGods = {
      dungThanNguHanh: "Mộc", trangThai: "hien",
      nguyenThan: [member(1)], kyThan: [member(3)], cuuThan: { resolved: false as const, lyDo: "" },
    } as unknown as FourGods;
    const r = synthesizeKyNguyenDung(cast, dt, fourGods);
    expect(r.chains[0].kyToNguyen[0].relation).toBe("GENERATES"); // Kim sinh Thủy (tham sinh)
    expect(r.chains[0].nguyenToDung[0].relation).toBe("GENERATES"); // Thủy sinh Mộc
    expect(r.nguyenSupport).toBe("STRONG");
    expect(r.dungProtection).toBe("PROTECTED");
    expect(r.currentState).toBe("NGUYEN_SUPPORTS_DUNG");
  });

  it("Dụng phục tàng → NO_DIRECT_CHAIN", () => {
    const hao = [mkHao(1, "Tý"), mkHao(2, "Mão"), mkHao(3, "Dậu"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const cast = mkCast(hao, "Tý", "Hợi");
    const dt: DungThanResolved = { hao: hao[0], target: "Thê Tài", trangThai: "phuc_tang", lyDo: "" };
    const fourGods = { dungThanNguHanh: "Mộc", trangThai: "phuc_tang", nguyenThan: [], kyThan: [], cuuThan: { resolved: false as const, lyDo: "" } } as unknown as FourGods;
    const r = synthesizeKyNguyenDung(cast, dt, fourGods);
    expect(r.currentState).toBe("NO_DIRECT_CHAIN");
  });
});
