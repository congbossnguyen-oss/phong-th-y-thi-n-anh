// Phase 12 — DỤNG THẦN → KẾT LUẬN SỰ VIỆC. Deterministic, score-free.
// Ma trận dùng adapter thuần (dungThanSynthesisFrom / concludeDung) với currentState + knd dựng tay;
// end-to-end qua ketLuanSuViec(cast,...) cho Thế/Ứng, Tam Hợp, Phản/Phục Ngâm, thiếu dữ liệu.
import { describe, it, expect } from "vitest";
import {
  dungThanSynthesisFrom, theUngSynthesisFrom, ketLuanSuViec, strengthFrom,
} from "./ket-luan-su-viec";
import type { KyNguyenDungSynthesis } from "./ky-nguyen-dung";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { HaoStrengthState } from "./can-luc-hao";
import type { DungThanResolved, FourGods, FourGodMember } from "./advisory-engine";

type CS = HaoStrengthState["currentState"];
function cs(over: Partial<CS> = {}): CS {
  return { base: "Vượng", effective: "Vượng", reduced: false, restrained: false, hidden: false, temporalExistence: "PRESENT", reasons: [], ...over };
}
function knd(over: Partial<KyNguyenDungSynthesis> = {}): KyNguyenDungSynthesis {
  return { chains: [], kyPressure: "NONE", nguyenSupport: "NONE", dungProtection: "UNCLEAR", currentState: "NO_DIRECT_CHAIN", reasons: [], ...over };
}
const D = (over: Partial<CS>, k: Partial<KyNguyenDungSynthesis>) => dungThanSynthesisFrom(6, cs(over), knd(k));

describe("Phase 12 — Dụng + Kỵ/Nguyên (strength/support/protection)", () => {
  it("1. Dụng Vượng + Nguyên sinh Dụng → protected, FAVORABLE", () => {
    const d = D({}, { nguyenSupport: "STRONG", dungProtection: "PROTECTED", kyPressure: "LIMITED" });
    expect(d.protection).toBe("PROTECTED");
    expect(d.conclusion).toBe("FAVORABLE");
  });
  it("2. Dụng Vượng + Kỵ yếu → FAVORABLE", () => {
    const d = D({}, { dungProtection: "PROTECTED", kyPressure: "LIMITED" });
    expect(d.conclusion).toBe("FAVORABLE");
  });
  it("3. Dụng Suy + Kỵ mạnh → UNDER_ATTACK, UNFAVORABLE", () => {
    const d = D({ effective: "Suy" }, { dungProtection: "UNDER_PRESSURE", kyPressure: "STRONG", nguyenSupport: "NONE" });
    expect(d.protection).toBe("UNDER_ATTACK");
    expect(d.conclusion).toBe("UNFAVORABLE");
  });
  it("4. Dụng Suy + Kỵ yếu → KHÔNG tự UNFAVORABLE (MIXED)", () => {
    const d = D({ effective: "Suy" }, { dungProtection: "PROTECTED", kyPressure: "LIMITED" });
    expect(d.conclusion).not.toBe("UNFAVORABLE");
    expect(d.conclusion).toBe("MIXED");
  });
  it("5. Kỵ mạnh + Nguyên mạnh + tham sinh → PROTECTED, FAVORABLE", () => {
    const d = D({}, { nguyenSupport: "STRONG", kyPressure: "STRONG", dungProtection: "PROTECTED" });
    expect(d.protection).toBe("PROTECTED");
    expect(d.conclusion).toBe("FAVORABLE");
  });
  it("6. Kỵ mạnh + Nguyên yếu → UNDER_ATTACK, DIFFICULT (Dụng còn nền)", () => {
    const d = D({}, { nguyenSupport: "LIMITED", kyPressure: "STRONG", dungProtection: "UNDER_PRESSURE" });
    expect(d.protection).toBe("UNDER_ATTACK");
    expect(d.conclusion).toBe("DIFFICULT");
  });
  it("7. Kỵ Không Vong + Dụng → Kỵ chưa hiện, Dụng PROTECTED", () => {
    const d = D({}, { kyPressure: "EMPTY", dungProtection: "PROTECTED" });
    expect(d.conclusion).toBe("FAVORABLE");
  });
  it("8. Kỵ Phá + Dụng → Kỵ hạn chế, Dụng PROTECTED", () => {
    const d = D({}, { kyPressure: "LIMITED", dungProtection: "PROTECTED" });
    expect(d.conclusion).toBe("FAVORABLE");
  });
});

describe("Phase 12 — temporal / transformation (không tính lại, không zero)", () => {
  it("9. Dụng Không Vong → temporal EMPTY, FAVORABLE_WITH_DELAY (nền mạnh)", () => {
    const d = D({ temporalExistence: "EMPTY" }, { dungProtection: "PROTECTED" });
    expect(d.temporal).toBe("EMPTY");
    expect(d.conclusion).toBe("FAVORABLE_WITH_DELAY");
  });
  it("10. Dụng Phá nhưng base rất mạnh → VERY_STRONG, KHÔNG UNFAVORABLE", () => {
    const d = D({ base: "Rất Vượng", effective: "Rất Vượng", reduced: true }, { dungProtection: "PROTECTED" });
    expect(d.strength).toBe("VERY_STRONG");
    expect(d.reasons.join(" ")).toMatch(/Phá|giảm lực/);
    expect(d.conclusion).not.toBe("UNFAVORABLE");
  });
  it("11. Dụng Hóa Hợp → STRONG + níu chân", () => {
    const d = D({ restrained: true }, { dungProtection: "PROTECTED" });
    expect(d.strength).toBe("STRONG");
    expect(d.reasons.join(" ")).toMatch(/níu chân/);
  });
  it("12. Dụng Hồi Đầu Sinh (effective Vượng) → STRONG", () => {
    expect(D({ effective: "Vượng" }, {}).strength).toBe("STRONG");
  });
  it("13. Dụng Hồi Đầu Khắc → STRONG (base giữ) + reduced", () => {
    const d = D({ effective: "Vượng", reduced: true }, { dungProtection: "PROTECTED" });
    expect(d.strength).toBe("STRONG");
    expect(d.reasons.join(" ")).toMatch(/giảm lực/);
  });
  it("14. Dụng Hóa Tiến (effective Rất Vượng) → VERY_STRONG", () => {
    expect(D({ effective: "Rất Vượng" }, {}).strength).toBe("VERY_STRONG");
  });
  it("15. Dụng Hóa Thoái (effective Suy) → WEAK", () => {
    expect(D({ effective: "Suy" }, {}).strength).toBe("WEAK");
  });
  it("16. Dụng Hóa Mộ → temporal HIDDEN, base giữ", () => {
    const d = D({ hidden: true, reduced: true }, { dungProtection: "PROTECTED" });
    expect(d.temporal).toBe("HIDDEN");
    expect(d.strength).toBe("STRONG");
  });
  it("17. Dụng Hóa Tuyệt → reduced, giữ nền", () => {
    const d = D({ reduced: true, effective: "Vượng" }, { dungProtection: "PROTECTED" });
    expect(d.reasons.join(" ")).toMatch(/giảm lực/);
    expect(d.strength).toBe("STRONG");
  });
  it("26. Tín hiệu mâu thuẫn (có cứu + có công) → MIXED", () => {
    const d = D({}, { nguyenSupport: "STRONG", kyPressure: "STRONG", dungProtection: "PARTIALLY_PROTECTED" });
    expect(d.conclusion).toBe("MIXED");
  });
  it("28. Không có field score/weight/threshold", () => {
    const d = D({}, { dungProtection: "PROTECTED" });
    for (const b of ["score", "weight", "threshold", "diem", "point", "percent"]) {
      expect(JSON.stringify(d).toLowerCase()).not.toContain(b);
    }
  });
});

// ---- End-to-end qua cast ----------------------------------------------------------------------
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
const member = (hao: number): FourGodMember => ({ hao } as unknown as FourGodMember);
const fg = (over: Partial<FourGods> = {}): FourGods =>
  ({ dungThanNguHanh: "Mộc", trangThai: "hien", nguyenThan: [], kyThan: [], cuuThan: { resolved: false, lyDo: "" }, ...over } as unknown as FourGods);

describe("Phase 12 — Thế/Ứng (axis riêng, không phán tốt/xấu)", () => {
  it("20. Thế mạnh (Lâm Nhật) / Ứng yếu (bị khắc)", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Ngọ", { theUng: "Ứng" }), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Tý", { theUng: "Thế" })];
    const t = theUngSynthesisFrom(mkCast(hao, "Tý", "Hợi")); // Thế Tý Thủy Lâm Nhật; Ứng Ngọ Hỏa bị Thủy khắc
    expect(t.theStrength).toBe("STRONG");
    expect(t.ungStrength).toBe("WEAK");
    expect(t.relation).toBe("UNG_UNDER_PRESSURE"); // Thế khắc Ứng
  });
  it("21. Thế yếu / Ứng mạnh", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Tý", { theUng: "Ứng" }), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Ngọ", { theUng: "Thế" })];
    const t = theUngSynthesisFrom(mkCast(hao, "Tý", "Hợi"));
    expect(t.theStrength).toBe("WEAK");
    expect(t.ungStrength).toBe("STRONG");
  });
  it("22. Thế/Ứng đồng hành → BALANCED", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Hợi", { theUng: "Ứng" }), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Tý", { theUng: "Thế" })];
    expect(theUngSynthesisFrom(mkCast(hao, "Dần", "Mão")).relation).toBe("BALANCED"); // Tý & Hợi đều Thủy
  });
});

describe("Phase 12 — end-to-end (roles coexist, contextual, unresolved)", () => {
  const baseHao = () => [mkHao(1, "Tý"), mkHao(2, "Mão"), mkHao(3, "Dậu"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { theUng: "Thế" })];
  it("18. Dụng đồng thời là Thế → giữ cả hai role", () => {
    const hao = baseHao();
    const cast = mkCast(hao, "Tý", "Hợi");
    const dt: DungThanResolved = { hao: hao[5], target: "Huynh Đệ", trangThai: "hien", lyDo: "" };
    const r = ketLuanSuViec(cast, dt, fg({ nguyenThan: [member(1)], kyThan: [member(3)] }));
    expect(r.dungThan?.lineIndex).toBe(6);
    expect(r.theUng.theLineIndex).toBe(6); // cùng hào, cả 2 role tồn tại
  });
  it("19. Dụng đồng thời là Ứng → giữ cả hai role", () => {
    const hao = [mkHao(1, "Tý"), mkHao(2, "Mão"), mkHao(3, "Dậu"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { theUng: "Ứng" })];
    const cast = mkCast(hao, "Tý", "Hợi");
    const dt: DungThanResolved = { hao: hao[5], target: "Huynh Đệ", trangThai: "hien", lyDo: "" };
    const r = ketLuanSuViec(cast, dt, fg({ nguyenThan: [member(1)], kyThan: [member(3)] }));
    expect(r.dungThan?.lineIndex).toBe(6);
    expect(r.theUng.ungLineIndex).toBe(6);
  });
  it("23. Dụng + Tam Hợp → contextualSignals.tamHop", () => {
    // Thủy cục Thân-Tý-Thìn, 3 hào động → TH1.
    const hao = [mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }), mkHao(3, "Thìn", { isDong: true }), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { theUng: "Thế" })];
    const cast = mkCast(hao, "Tỵ", "Dậu", { dongPositions: [1, 2, 3] });
    const dt: DungThanResolved = { hao: hao[5], target: "Huynh Đệ", trangThai: "hien", lyDo: "" };
    const r = ketLuanSuViec(cast, dt, fg());
    expect(r.contextualSignals.tamHop).toContain("TH1_FULL");
  });
  it("24. Dụng + Phản Ngâm → REPEATED_CHANGE", () => {
    const hao = baseHao();
    const cast = mkCast(hao, "Tý", "Hợi", { fanYin: { enabled: true } as FullCastResult["fanYin"] });
    const dt: DungThanResolved = { hao: hao[5], target: "Huynh Đệ", trangThai: "hien", lyDo: "" };
    expect(ketLuanSuViec(cast, dt, fg()).contextualSignals.phanNgam).toBe("REPEATED_CHANGE");
  });
  it("25. Dụng + Phục Ngâm → REPEATED_STATE", () => {
    const hao = baseHao();
    const cast = mkCast(hao, "Tý", "Hợi", { fuYin: { enabled: true } as FullCastResult["fuYin"] });
    const dt: DungThanResolved = { hao: hao[5], target: "Huynh Đệ", trangThai: "hien", lyDo: "" };
    expect(ketLuanSuViec(cast, dt, fg()).contextualSignals.phucNgam).toBe("REPEATED_STATE");
  });
  it("27. Dụng không hiện → UNRESOLVED", () => {
    const hao = baseHao();
    const cast = mkCast(hao, "Tý", "Hợi");
    const dt: DungThanResolved = { hao: null, target: "Thê Tài", trangThai: "khong_hien", lyDo: "" };
    const r = ketLuanSuViec(cast, dt, fg({ trangThai: "khong_hien" }));
    expect(r.conclusion).toBe("UNRESOLVED");
    expect(r.dungThan).toBeNull();
  });
});

describe("Phase 12 — strengthFrom adapter", () => {
  it("Không Vong KHÔNG biến Vượng thành yếu (strength theo effective, temporal riêng)", () => {
    expect(strengthFrom(cs({ effective: "Vượng", temporalExistence: "EMPTY" }))).toBe("STRONG");
  });
});
