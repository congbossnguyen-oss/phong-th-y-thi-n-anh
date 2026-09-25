// Phase 14 — ỨNG KỲ SYNTHESIS. Deterministic ADAPTER over tinhUngKy + phanLoaiSauTamHop. Không score.
import { describe, it, expect } from "vitest";
import { synthesizeUngKy, type UngKyCandidate } from "./ung-ky-synthesis";
import { CHI_NGU_HANH } from "../bat-tu";
import { CHI } from "../menh-nap-am";
import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { DungThanResolved, FourGods, FourGodMember } from "./advisory-engine";

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
    chinh: { hao }, bien: null, dongPositions: [], dayChi, monthChi, yearChi: "Sửu", tuanKhong: "Tuất Hợi",
    fanYin: { enabled: false }, fuYin: { enabled: false }, ...over,
  } as unknown as FullCastResult;
}
const dtHien = (hao: HaoInfo): DungThanResolved => ({ hao, target: "Huynh Đệ", trangThai: "hien", lyDo: "" });
const member = (hao: number): FourGodMember => ({ hao } as unknown as FourGodMember);
const fg = (over: Partial<FourGods> = {}): FourGods =>
  ({ dungThanNguHanh: "Mộc", trangThai: "hien", nguyenThan: [], kyThan: [], cuuThan: { resolved: false, lyDo: "" }, ...over } as unknown as FourGods);
const kinds = (cs: UngKyCandidate[]) => cs.map((c) => c.kind);

describe("Phase 14 — Không Vong / Xuất Không", () => {
  it("1. Dụng Không Vong → XUAT_KHONG + status DELAYED", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { xunKong: true })];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    expect(kinds(r.candidates)).toContain("XUAT_KHONG");
    expect(r.status).toBe("DELAYED");
  });
  it("2. Kỵ Không Vong → candidate role KY, kind XUAT_KHONG", () => {
    // Dụng Mộc (hào6) hiện; Kỵ Kim (hào3 Dậu) Không Vong.
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Dậu", { xunKong: true }), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg({ kyThan: [member(3)] }));
    const ky = r.candidates.find((c) => c.role === "KY");
    expect(ky?.kind).toBe("XUAT_KHONG");
  });
  it("3. Nguyên Không Vong → candidate role NGUYEN", () => {
    const hao = [mkHao(1, "Tý", { xunKong: true }), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const r = synthesizeUngKy(mkCast(hao, "Dần", "Mão"), dtHien(hao[5]), fg({ nguyenThan: [member(1)] }));
    expect(r.candidates.some((c) => c.role === "NGUYEN")).toBe(true);
  });
  it("4/24. Dụng không hiện + không candidate khác → UNRESOLVED", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const dt: DungThanResolved = { hao: null, target: "Thê Tài", trangThai: "khong_hien", lyDo: "" };
    expect(synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dt, fg({ trangThai: "khong_hien" })).status).toBe("UNRESOLVED");
  });
});

describe("Phase 14 — Nhập Mộ / Hóa Mộ (phân biệt, không tự suy)", () => {
  it("5/7. Static Nhập Mộ (growth Mộ) → XUAT_MO (canAudit POSSIBLE)", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { growthDay: "Mộ" })];
    const r = synthesizeUngKy(mkCast(hao, "Mùi", "Hợi"), dtHien(hao[5]), fg());
    const mo = r.candidates.find((c) => c.kind === "XUAT_MO");
    expect(mo).toBeTruthy();
    expect(mo?.status).toBe("POSSIBLE");
    expect(r.status).toBe("DELAYED");
  });
  it("6/8. Hóa Mộ (relation CHANGED_YAO, growth KHÔNG Mộ) → KHÔNG tự tạo XUAT_MO", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"),
      mkHao(6, "Dần", { relations: [{ type: "Nhập Mộ", source: "CHANGED_YAO", target: "HAO" }] })];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    expect(kinds(r.candidates)).not.toContain("XUAT_MO");
  });
});

describe("Phase 14 — động / tĩnh / biến / Tiến / Thoái", () => {
  it("9. Hào động → DONG_YAO candidate", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { isDong: true })];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, "Tý") : mkHao(h.hao, CHI[h.chiIndex]))); // biến khác hành → không tiến/thoái
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi", { dongPositions: [6], bien: { hao: bien } as unknown as FullCastResult["bien"] }), dtHien(hao[5]), fg());
    expect(kinds(r.candidates)).toContain("DONG_YAO");
  });
  it("10. Hào tĩnh → base Trị/Xung (OTHER), status MULTIPLE_CANDIDATES", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    expect(kinds(r.candidates)).toContain("OTHER");
    expect(r.status).toBe("MULTIPLE_CANDIDATES");
  });
  it("12/11. Tiến Thần → TIEN_THAN candidate lấy hào biến làm mốc", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { isDong: true })];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, "Mão") : mkHao(h.hao, CHI[h.chiIndex]))); // Dần→Mão tiến
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi", { dongPositions: [6], bien: { hao: bien } as unknown as FullCastResult["bien"] }), dtHien(hao[5]), fg());
    const tt = r.candidates.find((c) => c.kind === "TIEN_THAN");
    expect(tt?.chi).toBe("Mão");
  });
  it("13. Thoái Thần → THOAI_THAN candidate", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Mão", { isDong: true })];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, "Dần") : mkHao(h.hao, CHI[h.chiIndex]))); // Mão→Dần thoái
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi", { dongPositions: [6], bien: { hao: bien } as unknown as FullCastResult["bien"] }), dtHien(hao[5]), fg());
    expect(kinds(r.candidates)).toContain("THOAI_THAN");
  });
  it("33. Hào biến KHÁC hành → KHÔNG tự biến thành mốc (chỉ tiến/thoái mới có rule)", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { isDong: true })];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, "Tý") : mkHao(h.hao, CHI[h.chiIndex]))); // Thủy, không cùng hành
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi", { dongPositions: [6], bien: { hao: bien } as unknown as FullCastResult["bien"] }), dtHien(hao[5]), fg());
    expect(kinds(r.candidates)).not.toContain("TIEN_THAN");
    expect(kinds(r.candidates)).not.toContain("THOAI_THAN");
  });
});

describe("Phase 14 — Tam Hợp ứng kỳ (dùng ungKyChi detector)", () => {
  // Thủy cục Thân-Tý-Thìn. Dụng Mộc hào 6.
  function castTH(over: { line3?: Partial<HaoInfo>; dong: number[]; bien?: HaoInfo[] }, l2Extra: Partial<HaoInfo> = {}) {
    const hao = [
      mkHao(1, "Thân", { isDong: over.dong.includes(1) }),
      mkHao(2, "Tý", { isDong: over.dong.includes(2), ...l2Extra }),
      mkHao(3, "Thìn", { isDong: over.dong.includes(3), ...over.line3 }),
      mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần"),
    ];
    return mkCast(hao, "Tỵ", "Dậu", { dongPositions: over.dong, ...(over.bien ? { bien: { hao: over.bien } as unknown as FullCastResult["bien"] } : {}) });
  }
  it("14. TH1 (3 động, không bệnh) → không có mốc chi TAM_HOP (ungKyChi null)", () => {
    const cast = castTH({ dong: [1, 2, 3] });
    const r = synthesizeUngKy(cast, dtHien(cast.chinh.hao[5]), fg());
    expect(kinds(r.candidates)).not.toContain("TAM_HOP");
  });
  it("15/20. TH2 (2 động + 1 an tĩnh) → TAM_HOP chi = Thìn (hào an tĩnh)", () => {
    const cast = castTH({ dong: [1, 2] }); // hào3 Thìn tĩnh
    const r = synthesizeUngKy(cast, dtHien(cast.chinh.hao[5]), fg());
    const th = r.candidates.find((c) => c.kind === "TAM_HOP");
    expect(th?.chi).toBe("Thìn");
  });
  it("16. TH3 (minh + ám động + tĩnh) → TAM_HOP", () => {
    const cast = castTH({ dong: [1], line3: {} }, { relations: [{ type: "Ám Động", source: "DAY", target: "HAO" }], isDong: false });
    const r = synthesizeUngKy(cast, dtHien(cast.chinh.hao[5]), fg());
    expect(kinds(r.candidates)).toContain("TAM_HOP");
  });
  it("19/21. TH6 (2 động + Phục Thần) → TAM_HOP, benhLine trong reason", () => {
    const hao = [
      mkHao(1, "Thân", { isDong: true }), mkHao(2, "Tý", { isDong: true }),
      mkHao(3, "Mão", { phucThan: { lucThan: "Thê Tài", canIndex: 0, chiIndex: CHI.indexOf("Thìn") } }),
      mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần"),
    ];
    const cast = mkCast(hao, "Tỵ", "Dậu", { dongPositions: [1, 2] });
    const r = synthesizeUngKy(cast, dtHien(hao[5]), fg());
    const th = r.candidates.find((c) => c.kind === "TAM_HOP");
    expect(th).toBeTruthy();
    expect(th?.reason.join(" ")).toMatch(/bệnh|hào 3/);
  });
});

describe("Phase 14 — precedence / primary / status", () => {
  it("22/31. Nhiều mốc ngang priority → MULTIPLE_CANDIDATES, KHÔNG ép primary", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần")];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    expect(r.status).toBe("MULTIPLE_CANDIDATES");
    expect(r.primary).toBeUndefined();
  });
  it("23. Có precedence duy nhất (động + Nhập Mộ) → primary set, từ uuTien", () => {
    // động + growth Mộ: nhap-mo (Xung Mộ, uuTien 2) là mốc DUY NHẤT ở priority thấp nhất; nền động ở priority 3.
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { isDong: true, growthDay: "Mộ" })];
    const bien = hao.map((h) => (h.hao === 6 ? mkHao(6, "Tý") : mkHao(h.hao, CHI[h.chiIndex])));
    const r = synthesizeUngKy(mkCast(hao, "Mùi", "Hợi", { dongPositions: [6], bien: { hao: bien } as unknown as FullCastResult["bien"] }), dtHien(hao[5]), fg());
    expect(r.primary).toBeTruthy();
    expect(r.primary?.kind).toBe("XUAT_MO");
    expect(r.status).toBe("DELAYED");
  });
});

describe("Phase 14 — roles, provenance, no-score", () => {
  it("25/34. Dụng candidate role = DUNG (role preservation)", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { xunKong: true })];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    expect(r.candidates.filter((c) => c.kind === "XUAT_KHONG").every((c) => c.role === "DUNG")).toBe(true);
  });
  it("35. Mỗi candidate có provenance (reason non-empty) + chi", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { xunKong: true })];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    for (const c of r.candidates) {
      expect(c.reason.length).toBeGreaterThan(0);
      expect(c.priority).toBeGreaterThan(0);
    }
  });
  it("30. Không có field score/weight/ranking", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { xunKong: true })];
    const r = synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    for (const b of ["score", "weight", "ranking", "diem", "percent"]) {
      expect(JSON.stringify(r).toLowerCase()).not.toContain(b);
    }
  });
  it("deterministic — cùng input cùng output", () => {
    const hao = [mkHao(1, "Mão"), mkHao(2, "Mão"), mkHao(3, "Mão"), mkHao(4, "Mão"), mkHao(5, "Mão"), mkHao(6, "Dần", { xunKong: true })];
    const build = () => synthesizeUngKy(mkCast(hao, "Tý", "Hợi"), dtHien(hao[5]), fg());
    expect(build()).toEqual(build());
  });
});
