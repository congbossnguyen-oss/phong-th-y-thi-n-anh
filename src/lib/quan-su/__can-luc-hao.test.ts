// Phase 10C — CÂN LỰC HÀO (HaoStrength). FACT/deterministic, KHÔNG điểm số.
// Quẻ tổng hợp (synthetic) để kiểm đúng từng rule Vượng/Suy + hóa biến + trục tổn thương đã khóa.
import { describe, it, expect } from "vitest";
import { canLucHao } from "./can-luc-hao";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo, HaoRelation } from "../luc-hao";

// --- builders ------------------------------------------------------------------------------------
function mkHao(hao: number, chiIndex: number, over: Partial<HaoInfo> = {}): HaoInfo {
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex,
    nguHanh: CHI_NGU_HANH[chiIndex], lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null,
    phucThan: null, vuongSuy: "Hưu", growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false,
    ...over,
  } as HaoInfo;
}
function rel(type: HaoRelation["type"], source: HaoRelation["source"] = "DAY"): HaoRelation {
  return { type, source, target: "HAO" };
}
interface CastOpts {
  hao: HaoInfo[];
  dayChi: string; monthChi: string; yearChi?: string;
  dong?: number[];
  bien?: HaoInfo[] | null;
}
function mkCast(o: CastOpts): FullCastResult {
  return {
    chinh: { hao: o.hao },
    bien: o.bien ? { hao: o.bien } : null,
    dongPositions: o.dong ?? [],
    dayChi: o.dayChi, monthChi: o.monthChi, yearChi: o.yearChi ?? "Sửu",
  } as unknown as FullCastResult;
}
const c = (name: string) => CHI.indexOf(name);

// --- Vượng/Suy 7 case ----------------------------------------------------------------------------
describe("Phase 10C — baseForce (7 case Vượng/Suy)", () => {
  it("Case 1: Ngày sinh + Tháng sinh → Vượng", () => {
    // hào Dần (Mộc); Ngày Tý (Thủy sinh Mộc, không nhị hợp), Tháng Hợi (Thủy sinh Mộc).
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Hợi" }), 1);
    expect(s.baseForce).toBe("Vượng");
  });
  it("Case 2: Ngày Nhị Hợp + Tháng sinh → Rất Vượng", () => {
    // hào Dần; Ngày Hợi (Dần-Hợi lục hợp), Tháng Tý (Thủy sinh Mộc).
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Hợi", monthChi: "Tý" }), 1);
    expect(s.baseForce).toBe("Rất Vượng");
  });
  it("Case 3: Ngày đồng hành + Tháng sinh → Vượng", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Mão", monthChi: "Tý" }), 1);
    expect(s.baseForce).toBe("Vượng");
  });
  it("Case 4: Ngày trợ + Tháng khắc (không hào động) → Trung Hòa", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Dậu" }), 1);
    expect(s.baseForce).toBe("Trung Hòa");
  });
  it("Case 5: bị tiết + không hào động quyết định → Trung Hòa", () => {
    // hào Dần sinh Ngày Tỵ (Mộc sinh Hỏa = tiết); Tháng Mùi (Mộc khắc Thổ = cũng tiết); không hào động.
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tỵ", monthChi: "Mùi" }), 1);
    expect(s.baseForce).toBe("Trung Hòa");
  });
  it("Case 5: bị tiết + hào động đến sinh → Vượng", () => {
    const hao = [mkHao(1, c("Dần")), mkHao(2, c("Sửu")), mkHao(3, c("Sửu")), mkHao(4, c("Tý"), { isDong: true })]; // hào 4 Tý (Thủy) sinh Mộc
    const s = canLucHao(mkCast({ hao, dayChi: "Tỵ", monthChi: "Mùi", dong: [4] }), 1);
    expect(s.baseForce).toBe("Vượng");
  });
  it("Case 5: bị tiết + hào động đến khắc → Suy", () => {
    const hao = [mkHao(1, c("Dần")), mkHao(2, c("Sửu")), mkHao(3, c("Sửu")), mkHao(4, c("Thân"), { isDong: true })]; // hào 4 Thân (Kim) khắc Mộc
    const s = canLucHao(mkCast({ hao, dayChi: "Tỵ", monthChi: "Mùi", dong: [4] }), 1);
    expect(s.baseForce).toBe("Suy");
  });
  it("Nhật/Nguyệt khắc hào → Suy", () => {
    // hào Dần; Ngày Dậu (Kim khắc Mộc), Tháng Thân (Kim khắc Mộc).
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Dậu", monthChi: "Thân" }), 1);
    expect(s.baseForce).toBe("Suy");
  });
});

// --- Nguyệt Phá / Phá không xóa nền -------------------------------------------------------------
describe("Phase 10C — Phá không xóa nền lực", () => {
  it("Nhật sinh + Nguyệt Phá + hào động sinh → Vượng (không zero)", () => {
    // hào Dần: Ngày Tý (Thủy sinh), Tháng Thân (Kim khắc + Thân xung Dần = Nguyệt Phá); hào 4 Tý sinh.
    const self = mkHao(1, c("Dần"), { relations: [rel("Nguyệt Phá", "MONTH")] });
    const hao = [self, mkHao(2, c("Sửu")), mkHao(3, c("Sửu")), mkHao(4, c("Tý"), { isDong: true })];
    const s = canLucHao(mkCast({ hao, dayChi: "Tý", monthChi: "Thân", dong: [4] }), 1);
    expect(s.baseForce).toBe("Vượng");
    expect(s.currentState.reduced).toBe(true); // Nguyệt Phá ghi nhận tổn thương
    expect(s.currentState.temporalExistence).toBe("PRESENT");
  });
  it("Vượng + Nguyệt Phá → giữ nền, chỉ giảm lực (không Suy tuyệt đối)", () => {
    const self = mkHao(1, c("Dần"), { relations: [rel("Nguyệt Phá", "MONTH")] });
    const hao = [self, mkHao(2, c("Sửu")), mkHao(3, c("Sửu")), mkHao(4, c("Tý"), { isDong: true })];
    const s = canLucHao(mkCast({ hao, dayChi: "Tý", monthChi: "Thân", dong: [4] }), 1);
    expect(s.currentState.base).toBe("Vượng");
    expect(s.currentState.reduced).toBe(true);
    expect(s.currentState.effective).not.toBe("Suy");
  });
});

// --- Hóa biến -----------------------------------------------------------------------------------
describe("Phase 10C — hóa biến (giữ nền lực)", () => {
  const dayMonthVuong = { dayChi: "Tý", monthChi: "Hợi" }; // Thủy sinh Mộc → Vượng cho hào Dần

  it("Hóa Hợp → còn lực nhưng bị níu chân", () => {
    // hào Sửu (Thổ) động biến Tý (Thủy) — Tý-Sửu lục hợp, biến không sinh/khắc gốc.
    const self = mkHao(1, c("Sửu"), { isDong: true });
    const bien = [mkHao(1, c("Tý"))];
    const s = canLucHao(mkCast({ hao: [self], bien, dayChi: "Tỵ", monthChi: "Ngọ", dong: [1] }), 1); // Hỏa sinh Thổ → Vượng
    expect(s.transformationState.hoaHop).toBe(true);
    expect(s.transformationState.hoiDauSinh).toBe(false);
    expect(s.currentState.restrained).toBe(true);
    expect(s.currentState.base).toBe("Vượng");
  });
  it("Hồi Đầu Sinh → tăng lực (Trung Hòa → Vượng)", () => {
    const self = mkHao(1, c("Dần"), { isDong: true });
    const bien = [mkHao(1, c("Tý"))]; // Thủy sinh Mộc
    const s = canLucHao(mkCast({ hao: [self], bien, dayChi: "Tý", monthChi: "Dậu", dong: [1] }), 1); // Case4 Trung Hòa
    expect(s.transformationState.hoiDauSinh).toBe(true);
    expect(s.currentState.base).toBe("Trung Hòa");
    expect(s.currentState.effective).toBe("Vượng");
  });
  it("Hóa Tiến → rất Vượng", () => {
    const self = mkHao(1, c("Dần"), { isDong: true });
    const bien = [mkHao(1, c("Mão"))]; // Dần→Mão tiến (cùng Mộc)
    const s = canLucHao(mkCast({ hao: [self], bien, dayChi: "Tý", monthChi: "Dậu", dong: [1] }), 1);
    expect(s.transformationState.hoaTien).toBe(true);
    expect(s.currentState.effective).toBe("Rất Vượng");
  });
  it("Hồi Đầu Khắc → giảm lực nhưng GIỮ nền", () => {
    const self = mkHao(1, c("Dần"), { isDong: true });
    const bien = [mkHao(1, c("Dậu"))]; // Kim khắc Mộc (không xung Dần, không Tuyệt)
    const s = canLucHao(mkCast({ hao: [self], bien, ...dayMonthVuong, dong: [1] }), 1);
    expect(s.transformationState.hoiDauKhac).toBe(true);
    expect(s.currentState.base).toBe("Vượng");
    expect(s.currentState.effective).toBe("Vượng"); // không hạ hẳn
    expect(s.currentState.reduced).toBe(true);
  });
  it("Hóa Tuyệt → giảm lực, giữ nền nếu nền rất mạnh", () => {
    // hào Tý (Thủy) động biến Tỵ — Thủy Tuyệt tại Tỵ (không xung Tý, không hồi đầu).
    const self = mkHao(1, c("Tý"), { isDong: true });
    const bien = [mkHao(1, c("Tỵ"))];
    const s = canLucHao(mkCast({ hao: [self], bien, dayChi: "Dậu", monthChi: "Thân", dong: [1] }), 1); // Kim sinh Thủy → Vượng
    expect(s.transformationState.hoaTuyet).toBe(true);
    expect(s.currentState.base).toBe("Vượng");
    expect(s.currentState.reduced).toBe(true);
  });
  it("Hóa Mộ khác Nhập Mộ tĩnh", () => {
    const hoaMo = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"), { relations: [rel("Nhập Mộ", "CHANGED_YAO")] })], dayChi: "Tý", monthChi: "Hợi" }), 1);
    expect(hoaMo.burialState.hoaMo).toBe(true);
    expect(hoaMo.burialState.nhapMo).toBe(false);
    const tinh = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"), { relations: [rel("Nhập Mộ", "MONTH")] })], dayChi: "Tý", monthChi: "Hợi" }), 1);
    expect(tinh.burialState.nhapMo).toBe(true);
    expect(tinh.burialState.hoaMo).toBe(false);
    expect(tinh.currentState.hidden).toBe(true);
  });
  it("Hóa Thoái → Suy", () => {
    const self = mkHao(1, c("Mão"), { isDong: true });
    const bien = [mkHao(1, c("Dần"))]; // Mão→Dần thoái
    const s = canLucHao(mkCast({ hao: [self], bien, ...dayMonthVuong, dong: [1] }), 1);
    expect(s.transformationState.hoaThoai).toBe(true);
    expect(s.currentState.effective).toBe("Suy");
  });
});

// --- Không Vong / Ám Động / Nhật Phá / Năm ------------------------------------------------------
describe("Phase 10C — trục hiện hữu, ám động, năm", () => {
  it("Vượng + Không Vong → lực ≠ zero; EMPTY là trục riêng", () => {
    const self = mkHao(1, c("Dần"), { xunKong: true });
    const s = canLucHao(mkCast({ hao: [self], dayChi: "Tý", monthChi: "Hợi" }), 1);
    expect(s.baseForce).toBe("Vượng");
    expect(s.currentState.temporalExistence).toBe("EMPTY");
    expect(s.currentState.base).toBe("Vượng"); // không bị coi là 0
  });
  it("Vượng + Nhật xung → Ám Động (engine derive)", () => {
    const self = mkHao(1, c("Dần"), { relations: [rel("Ám Động", "DAY")] });
    const s = canLucHao(mkCast({ hao: [self], dayChi: "Tý", monthChi: "Hợi" }), 1);
    expect(s.interactionState.amDong).toBe(true);
  });
  it("Suy + Nhật xung → Nhật Phá, KHÔNG Ám Động", () => {
    const self = mkHao(1, c("Dần"), { relations: [rel("Nhật Phá", "DAY")] });
    const s = canLucHao(mkCast({ hao: [self], dayChi: "Dậu", monthChi: "Thân" }), 1);
    expect(s.temporalState.nhatPha).toBe(true);
    expect(s.interactionState.amDong).toBe(false);
  });
  it("Thái Tuế: Chi hào = Chi Năm — KHÔNG tự thành Vượng", () => {
    // hào Dần bị Ngày/Tháng khắc (Suy), Năm Dần → Thái Tuế nhưng base vẫn Suy.
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Dậu", monthChi: "Thân", yearChi: "Dần" }), 1);
    expect(s.yearState.thaiTue).toBe(true);
    expect(s.baseForce).toBe("Suy"); // Thái Tuế không nâng lực
  });
  it("Tuế Phá: Chi Năm xung Chi hào → ghi nhận suy mạnh", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Hợi", yearChi: "Thân" }), 1);
    expect(s.yearState.tuePha).toBe(true);
    expect(s.temporalState.tuePha).toBe(true);
    expect(s.currentState.reduced).toBe(true);
  });
});

// -------------------------------------------------------------------------------------------------
// Phase 10E — GAP-1 (một trụ sinh/phù + trụ kia khắc → Trung Hòa) + GAP-2 (Nguyệt phù = nguồn Vượng).
// Golden-case fixtures lấy từ án lệ đã validate ở Phase 10D.
describe("Phase 10E — GAP-1: cân bằng khi một trụ trợ + một trụ khắc", () => {
  it("Day sinh + Month khắc → Trung Hòa", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Dậu" }), 1);
    expect(s.baseForce).toBe("Trung Hòa");
  });
  it("Day khắc + Month sinh → Trung Hòa (đối xứng — án lệ 'Thuốc đến bệnh trừ')", () => {
    // hào Mão (Mộc); Ngày Dậu (Kim khắc Mộc) + Tháng Tý (Thủy sinh Mộc) → suy vượng tương đương.
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Mão"))], dayChi: "Dậu", monthChi: "Tý" }), 1);
    expect(s.baseForce).toBe("Trung Hòa");
  });
  it("Day đồng hành + Month khắc → Trung Hòa", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Mão", monthChi: "Dậu" }), 1);
    expect(s.baseForce).toBe("Trung Hòa");
  });
  it("khắc trực tiếp KHÔNG có trụ trợ vẫn Suy (không nới lỏng quá tay)", () => {
    // hào Dần; Ngày Dậu + Tháng Thân đều khắc (Kim khắc Mộc), không trụ nào trợ → Suy.
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Dậu", monthChi: "Thân" }), 1);
    expect(s.baseForce).toBe("Suy");
  });
});

describe("Phase 10E — GAP-2: Nguyệt phù (Tháng đồng hành) = nguồn Vượng", () => {
  it("Month đồng hành + Day không khắc → Vượng (án lệ 'Con gái khóc thức giấc')", () => {
    // hào Mão (Mộc); Tháng Dần (Mộc, Nguyệt phù, khác Chi) + Ngày Mùi (hào khắc Ngày = tiết, không khắc hào).
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Mão"))], dayChi: "Mùi", monthChi: "Dần" }), 1);
    expect(s.baseForce).toBe("Vượng");
  });
  it("Nguyệt phù nhận diện được dù KHÔNG trùng đúng Chi", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Mão"))], dayChi: "Mùi", monthChi: "Dần" }), 1);
    expect(s.interactionState.nguyetPhu).toBe(true);
  });
  it("Nguyệt phù KHÔNG tự động → Rất Vượng (chỉ Vượng)", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Mão"))], dayChi: "Mùi", monthChi: "Dần" }), 1);
    expect(s.baseForce).not.toBe("Rất Vượng");
  });
  it("Lâm Nguyệt Kiến (trùng Chi) vẫn Vượng, và KHÔNG bị gắn cờ Nguyệt phù", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Sửu", monthChi: "Dần" }), 1);
    expect(s.baseForce).toBe("Vượng");
    expect(s.interactionState.nguyetPhu).toBe(false); // Lâm ≠ Nguyệt phù
  });
});

describe("Phase 10E — Case 6 Tam Hợp GIỮ NGUYÊN", () => {
  it("Ngày trợ + hào sinh Tháng (tiết) → vẫn Trung Hòa (đã khóa)", () => {
    // hào Dần; Ngày Tý (Thủy sinh Mộc = trợ) + Tháng Tỵ (Mộc sinh Hỏa = hào sinh Tháng, tiết).
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Tỵ" }), 1);
    expect(s.baseForce).toBe("Trung Hòa");
  });
});

describe("Phase 10C — deterministic + không điểm số", () => {
  it("cùng input → cùng output", () => {
    const build = () => canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Hợi" }), 1);
    expect(build()).toEqual(build());
  });
  it("không có field score/diem/weight", () => {
    const s = canLucHao(mkCast({ hao: [mkHao(1, c("Dần"))], dayChi: "Tý", monthChi: "Hợi" }), 1);
    for (const banned of ["score", "diem", "weight", "point", "threshold"]) {
      expect(JSON.stringify(s).toLowerCase()).not.toContain(banned);
    }
  });
});
