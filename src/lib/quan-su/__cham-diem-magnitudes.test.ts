// G-TU3/G-TU2 — Lock chamDiem magnitude behavior (TEST-ONLY, no production change).
// chamDiem không export → test qua buildAdvisoryReport().bangChamDiem (component breakdown) + mucDoThuan/ketLuan.
// Magnitude & flow theo docs/CHAM_DIEM_HEURISTICS_METHODOLOGY_LOCK.md (bf044d3). KHÔNG assert double-count.
import { describe, it, expect } from "vitest";
import { buildAdvisoryReport } from "./advisory-engine";
import { CHI } from "../menh-nap-am";
import { CHI_NGU_HANH } from "../bat-tu";
import type { HaoInfo, HaoRelation, FullCastResult, VuongSuy } from "../luc-hao";
import type { QuanSuInterpretationPayload } from "./divination";

function H(hao: number, chi: string, over: Partial<HaoInfo> = {}): HaoInfo {
  const chiIndex = CHI.indexOf(chi);
  return {
    hao, value: 7, isDong: false, canIndex: 0, chiIndex, nguHanh: CHI_NGU_HANH[chiIndex],
    lucThan: "Huynh Đệ", lucThu: "Thanh Long", theUng: null, phucThan: null, vuongSuy: "Hưu",
    growthDay: "Dưỡng", growthMonth: "Dưỡng", relations: [], xunKong: false, ...over,
  } as HaoInfo;
}
const rel = (t: HaoRelation["type"], s: HaoRelation["source"] = "DAY"): HaoRelation => ({ type: t, source: s, target: "HAO" });

interface Opts { the?: string; ung?: string; phucTai?: boolean; }
// Dụng = hào6 Thê Tài (Mộc/Dần). Các hào khác KHÔNG Thê Tài, KHÔNG theUng (trừ khi opts.the/ung).
function mkCast(dung6: Partial<HaoInfo>, opts: Opts = {}): FullCastResult {
  const hao: HaoInfo[] = [
    H(1, "Tý", { lucThan: "Tử Tôn" }),
    H(2, "Sửu", { lucThan: "Quan Quỷ" }),
    H(3, "Dậu", { lucThan: "Huynh Đệ" }),
    H(4, "Mão", { lucThan: "Phụ Mẫu" }),
    H(5, "Ngọ", { lucThan: "Phụ Mẫu" }),
    H(6, "Dần", { lucThan: opts.phucTai ? "Huynh Đệ" : "Thê Tài", ...dung6 }),
  ];
  if (opts.phucTai) hao[5].phucThan = { lucThan: "Thê Tài", canIndex: 0, chiIndex: CHI.indexOf("Dần"), nguHanh: "Mộc" } as any;
  if (opts.the) hao[3] = H(4, opts.the, { lucThan: "Phụ Mẫu", theUng: "Thế" });
  if (opts.ung) hao[4] = H(5, opts.ung, { lucThan: "Phụ Mẫu", theUng: "Ứng" });
  return { chinh: { hao }, bien: null, dongPositions: [], dayChi: "Thân", monthChi: "Dậu", yearChi: "Sửu", tuanKhong: "Tuất Hợi", fanYin: { enabled: false }, fuYin: { enabled: false } } as unknown as FullCastResult;
}
const luckOf = (dvBand: string, lnBand: string) => ({
  daiVanHienTai: { band: dvBand, danhGia: dvBand === "trung_binh" ? "trung_tinh" : (dvBand.includes("thuan") ? "tot" : "xau"), can: "Giáp", chi: "Tý" },
  luuNienHienTai: { band: lnBand, danhGia: lnBand === "trung_binh" ? "trung_tinh" : (lnBand.includes("thuan") ? "tot" : "xau"), nam: 2026, can: "Bính", chi: "Ngọ" },
  // vanTrinhTomTat/khuyen đọc luck.dimensions (bien-dong.score) — test fixture, KHÔNG ảnh hưởng chamDiem.
  dimensions: [
    { key: "su-nghiep", label: "Sự nghiệp", score: 5, higherIsBetter: true },
    { key: "tai-chinh", label: "Tài chính", score: 5, higherIsBetter: true },
    { key: "co-hoi", label: "Cơ hội", score: 5, higherIsBetter: true },
    { key: "bien-dong", label: "Biến động", score: 5, higherIsBetter: false },
  ],
});
function run(dung6: Partial<HaoInfo>, opts: Opts = {}, luck: any = null) {
  const payload = {
    question: { question_id: "q", category: "tong-quat", title: "?", output_type: "tu-van", safety_level: "thuong", dung_than_hint: { kind: "luc-than", value: "Thê Tài" }, doi_tuong_hoi: "chinh-toi" },
    cast: mkCast(dung6, opts), van_trinh: luck, ung_ky: null,
    tien_thoai_than: { co: false, danhSach: [], ghiChu: [] }, tam_hop_cuc: { co: false, danhSach: [], ghiChu: [] },
    meta: { castAtISO: "2026-01-01T00:00:00Z", method: "luc-hao-tosses" },
  } as unknown as QuanSuInterpretationPayload;
  const r = buildAdvisoryReport(payload);
  const map = new Map<string, number>(r.bangChamDiem.map((i: any) => [i.factor, i.delta]));
  return { report: r, map, mucDoThuan: r.mucDoThuan, ketLuan: r.ketLuan };
}

describe("chamDiem — Vượng/Suy magnitudes (B strength axis)", () => {
  const cases: [VuongSuy, number][] = [["Vượng", 12], ["Tướng", 6], ["Hưu", -2], ["Tù", -8], ["Tử", -12]];
  for (const [vs, delta] of cases) {
    it(`${vs} → ${delta}`, () => {
      expect(run({ vuongSuy: vs }).map.get("Vượng suy")).toBe(delta);
    });
  }
});

describe("chamDiem — Dụng state penalties", () => {
  it("Không Vong → -12", () => expect(run({ vuongSuy: "Hưu", xunKong: true }).map.get("Không Vong")).toBe(-12));
  it("Phục tàng → -10 (Dụng ẩn dưới Phi Thần)", () => {
    const { map, ketLuan } = run({}, { phucTai: true });
    expect(map.get("Phục tàng")).toBe(-10);
    expect(map.has("Vượng suy")).toBe(false); // block Dụng-hiện bị skip khi phuc_tang
    expect(ketLuan).toBe("KHONG_NEN"); // 50-10=40 <42
  });
});

describe("chamDiem — Dụng relations", () => {
  const cases: [HaoRelation["type"], string, number][] = [
    ["Sinh", "Được sinh", 7], ["Khắc", "Bị khắc", -7], ["Nguyệt Phá", "Nguyệt Phá", -14],
    ["Nhật Phá", "Nhật Phá", -10], ["Ám Động", "Ám động", 5], ["Hợp", "Được hợp", 3],
    ["Xung", "Bị xung", -3], ["Hại", "Bị hại", -3],
  ];
  for (const [type, factor, delta] of cases) {
    it(`${type} → ${factor} ${delta}`, () => {
      expect(run({ vuongSuy: "Hưu", relations: [rel(type)] }).map.get(factor)).toBe(delta);
    });
  }
  it("Lâm Nhật → Đương lệnh +6", () => expect(run({ vuongSuy: "Hưu", relations: [rel("Lâm Nhật")] }).map.get("Đương lệnh")).toBe(6));
  it("Lâm Nguyệt → Đương lệnh +6", () => expect(run({ vuongSuy: "Hưu", relations: [rel("Lâm Nguyệt", "MONTH")] }).map.get("Đương lệnh")).toBe(6));
});

describe("chamDiem — Thế/Ứng directions (abd5968)", () => {
  // Thế = hào4 (chi opts.the), Ứng = hào5 (chi opts.ung). Dụng vẫn hào6 Thê Tài.
  it("Ứng sinh Thế → +5 (Thế Mộc, Ứng Thủy)", () => expect(run({ vuongSuy: "Hưu" }, { the: "Dần", ung: "Tý" }).map.get("Ứng sinh Thế")).toBe(5));
  it("Ứng khắc Thế → -6 (Thế Mộc, Ứng Kim)", () => expect(run({ vuongSuy: "Hưu" }, { the: "Dần", ung: "Dậu" }).map.get("Ứng khắc Thế")).toBe(-6));
  it("Thế khắc Ứng → +3 (Thế Mộc, Ứng Thổ)", () => expect(run({ vuongSuy: "Hưu" }, { the: "Dần", ung: "Sửu" }).map.get("Thế khắc Ứng")).toBe(3));
  it("Thế sinh Ứng → -2 (Thế Mộc, Ứng Hỏa)", () => expect(run({ vuongSuy: "Hưu" }, { the: "Dần", ung: "Ngọ" }).map.get("Thế sinh Ứng")).toBe(-2));
  it("đồng hành → 0 contribution (Thế Mộc, Ứng Mộc)", () => {
    const { map } = run({ vuongSuy: "Hưu" }, { the: "Dần", ung: "Mão" });
    for (const k of ["Ứng sinh Thế", "Ứng khắc Thế", "Thế khắc Ứng", "Thế sinh Ứng"]) expect(map.has(k)).toBe(false);
  });
});

describe("chamDiem — Đại vận / Lưu niên (band multipliers)", () => {
  it("Đại vận min (nghich ×5) → -10", () => expect(run({ vuongSuy: "Hưu" }, {}, luckOf("nghich", "trung_binh")).map.get("Đại vận")).toBe(-10));
  it("Đại vận max (rat_thuan ×5) → +10", () => expect(run({ vuongSuy: "Hưu" }, {}, luckOf("rat_thuan", "trung_binh")).map.get("Đại vận")).toBe(10));
  it("Đại vận mid (trung_binh) → không item", () => expect(run({ vuongSuy: "Hưu" }, {}, luckOf("trung_binh", "trung_binh")).map.has("Đại vận")).toBe(false));
  it("Lưu niên min (nghich ×2.5) → -5", () => expect(run({ vuongSuy: "Hưu" }, {}, luckOf("trung_binh", "nghich")).map.get("Lưu niên")).toBe(-5));
  it("Lưu niên max (rat_thuan ×2.5) → +5", () => expect(run({ vuongSuy: "Hưu" }, {}, luckOf("trung_binh", "rat_thuan")).map.get("Lưu niên")).toBe(5));
  it("Lưu niên mid (trung_binh) → không item", () => expect(run({ vuongSuy: "Hưu" }, {}, luckOf("trung_binh", "trung_binh")).map.has("Lưu niên")).toBe(false));
});

describe("chamDiem — base 50 + additive + clamp + round", () => {
  it("base 50 + additive: mucDoThuan === clamp(50 + Σdelta)", () => {
    const { map, mucDoThuan } = run({ vuongSuy: "Vượng", relations: [rel("Sinh")] }); // 50+12+7=69
    const sum = [...map.values()].reduce((a, b) => a + b, 0);
    expect(mucDoThuan).toBe(Math.max(0, Math.min(100, Math.round(50 + sum))));
    expect(mucDoThuan).toBe(69);
  });
  it("clamp trên: Σ>+50 → 100", () => {
    // Vượng12 + Sinh7 + Ám5 + Lâm6 + Hợp3 = 33 ; + Ứng sinh Thế5 ; + luck +10+5 = 53 → 103 → 100
    const { mucDoThuan } = run({ vuongSuy: "Vượng", relations: [rel("Sinh"), rel("Ám Động"), rel("Lâm Nhật"), rel("Hợp")] }, { the: "Dần", ung: "Tý" }, luckOf("rat_thuan", "rat_thuan"));
    expect(mucDoThuan).toBe(100);
  });
  it("clamp dưới: Σ<-50 → 0", () => {
    // Tử-12 + Nguyệt Phá-14 + Khắc-7 + Xung-3 + Hại-3 + Không Vong-12 = -51 → -1 → 0
    const { mucDoThuan } = run({ vuongSuy: "Tử", xunKong: true, relations: [rel("Nguyệt Phá", "MONTH"), rel("Khắc"), rel("Xung"), rel("Hại")] });
    expect(mucDoThuan).toBe(0);
  });
  it("round: Lưu niên ×2.5 → mucDoThuan là số nguyên (round .5)", () => {
    // Hưu-2 + Lưu niên thuan(+2.5) = 50.5 → round 51 ; assert Lưu niên=2.5 và mucDoThuan nguyên
    const { map, mucDoThuan } = run({ vuongSuy: "Hưu" }, {}, luckOf("trung_binh", "thuan"));
    expect(map.get("Lưu niên")).toBe(2.5);
    expect(Number.isInteger(mucDoThuan)).toBe(true);
    expect(mucDoThuan).toBe(51);
  });
});

describe("chamDiem — thresholds (suyKetLuan)", () => {
  it("72 → NEN", () => expect(run({ vuongSuy: "Vượng", relations: [rel("Sinh"), rel("Hợp")] }).ketLuan).toBe("NEN")); // 50+12+7+3
  it("69 → CO_DIEU_KIEN (straddle 72)", () => expect(run({ vuongSuy: "Vượng", relations: [rel("Sinh")] }).ketLuan).toBe("CO_DIEU_KIEN")); // 69
  it("58 → CO_DIEU_KIEN", () => expect(run({ vuongSuy: "Hưu", relations: [rel("Sinh"), rel("Hợp")] }).ketLuan).toBe("CO_DIEU_KIEN")); // 50-2+7+3=58
  it("55 → NEN_CHO (straddle 58)", () => expect(run({ vuongSuy: "Hưu", relations: [rel("Sinh")] }).ketLuan).toBe("NEN_CHO")); // 55
  it("42 → NEN_CHO", () => expect(run({ vuongSuy: "Tù" }).ketLuan).toBe("NEN_CHO")); // 50-8=42
  it("38 → KHONG_NEN (straddle 42)", () => expect(run({ vuongSuy: "Tử" }).ketLuan).toBe("KHONG_NEN")); // 50-12=38
});

describe("chamDiem — timingBlocker → NEN_CHO", () => {
  it("in-band 65 + timingBlocker (Nhật Phá) → NEN_CHO", () => {
    // Vượng12 + Sinh7 + Lâm6 + Nhật Phá-10 = 65 ; tb=true → NEN_CHO
    expect(run({ vuongSuy: "Vượng", relations: [rel("Sinh"), rel("Lâm Nhật"), rel("Nhật Phá")] }).ketLuan).toBe("NEN_CHO");
  });
  it("in-band 65 KHÔNG timingBlocker → CO_DIEU_KIEN (chứng minh tb là nguyên nhân)", () => {
    // Vượng12 + Lâm6 + Xung-3 = 65 ; no tb → CO_DIEU_KIEN
    expect(run({ vuongSuy: "Vượng", relations: [rel("Lâm Nhật"), rel("Xung")] }).ketLuan).toBe("CO_DIEU_KIEN");
  });
});

describe("chamDiem — multi-axis additive (strength + relational, KHÔNG double-count)", () => {
  it("Suy(Tử) + Nhật Phá cùng cộng (additive)", () => {
    const { map, mucDoThuan } = run({ vuongSuy: "Tử", relations: [rel("Nhật Phá")] });
    expect(map.get("Vượng suy")).toBe(-12);
    expect(map.get("Nhật Phá")).toBe(-10);
    expect(mucDoThuan).toBe(28); // 50-12-10
  });
});
