// Phase 7 — PHI THẦN ↔ PHỤC THẦN structured FACT (quan hệ ngũ hành, không verdict/điểm).
// Kiểm STRUCTURED DATA. Bất biến quan hệ assert generic theo ngũ hành (Phục lấy từ CHI_NGU_HANH),
// deterministic vì Nạp Giáp/ngũ hành hào chủ xác định từ TOSSES.
import { describe, it, expect } from "vitest";
import { getPhiPhucRelations, type PhiPhucRelation } from "./advisory-engine";
import { castLucHaoFromTosses, castInputNow } from "./divination";
import { CHI_NGU_HANH } from "../bat-tu";
import type { CoinLineValue, FullCastResult, LucThan } from "../luc-hao";
import type { NguHanh } from "../menh-nap-am";

const TOSSES: CoinLineValue[] = [7, 8, 9, 7, 6, 8];
const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
const castMau = () => castLucHaoFromTosses(TOSSES, castInputNow());

/** Oracle độc lập cho quan hệ Phi↔Phục (a=Phục, b=Phi). */
function expectQuanHe(phuc: NguHanh, phi: NguHanh): PhiPhucRelation["quanHe"] {
  if (phuc === phi) return "ti-hoa";
  if (SINH[phuc] === phi) return "phuc-sinh-phi";
  if (SINH[phi] === phuc) return "phi-sinh-phuc";
  if (KHAC[phuc] === phi) return "phuc-khac-phi";
  if (KHAC[phi] === phuc) return "phi-khac-phuc";
  return "ti-hoa";
}

/** Gán phục thần (immutable clone) cho một số vị trí hào. */
function withPhuc(cast: FullCastResult, overrides: Record<number, { lucThan: LucThan; chiIndex: number } | null>): FullCastResult {
  const hao = cast.chinh.hao.map((h) =>
    h.hao in overrides
      ? { ...h, phucThan: overrides[h.hao] ? { lucThan: overrides[h.hao]!.lucThan, canIndex: 0, chiIndex: overrides[h.hao]!.chiIndex } : null }
      : h,
  );
  return { ...cast, chinh: { ...cast.chinh, hao } };
}
/** Xóa hết phục thần (mọi hào). */
function clearPhuc(cast: FullCastResult): FullCastResult {
  return { ...cast, chinh: { ...cast.chinh, hao: cast.chinh.hao.map((h) => ({ ...h, phucThan: null })) } };
}

describe("Phase 7 — getPhiPhucRelations (FACT quan hệ Phi↔Phục)", () => {
  it("một phục thần → đúng 1 quan hệ, provenance + mapping đúng", () => {
    const chiIndex = 6; // Ngọ = Hỏa
    const cast = withPhuc(clearPhuc(castMau()), { 3: { lucThan: "Thê Tài", chiIndex } });
    const rels = getPhiPhucRelations(cast);
    expect(rels).toHaveLength(1);
    const r = rels[0]!;
    const phi = cast.chinh.hao[2]!; // hào 3
    expect(r.hao).toBe(3);
    expect(r.phucThan.nguHanh).toBe(CHI_NGU_HANH[chiIndex]); // Hỏa
    expect(r.phucThan.lucThan).toBe("Thê Tài");
    expect(r.phiThan.nguHanh).toBe(phi.nguHanh);
    expect(r.phiThan.lucThan).toBe(phi.lucThan);
    expect(r.quanHe).toBe(expectQuanHe(CHI_NGU_HANH[chiIndex]!, phi.nguHanh)); // khớp oracle
    expect(r.lyDo).toContain("Phục");
  });

  it("không có phục thần → mảng rỗng", () => {
    expect(getPhiPhucRelations(clearPhuc(castMau()))).toEqual([]);
  });

  it("nhiều phục thần → nhiều quan hệ, mỗi cái mapping đúng", () => {
    const cast = withPhuc(clearPhuc(castMau()), {
      2: { lucThan: "Quan Quỷ", chiIndex: 6 }, // Ngọ Hỏa
      5: { lucThan: "Phụ Mẫu", chiIndex: 8 }, // Thân Kim
    });
    const rels = getPhiPhucRelations(cast);
    expect(rels).toHaveLength(2);
    for (const r of rels) {
      const phi = cast.chinh.hao[r.hao - 1]!;
      expect(r.quanHe).toBe(expectQuanHe(r.phucThan.nguHanh, phi.nguHanh));
      expect(r.phiThan.nguHanh).toBe(phi.nguHanh);
    }
  });

  it("KHÔNG có điểm số / verdict trong quan hệ (chỉ FACT)", () => {
    const cast = withPhuc(clearPhuc(castMau()), { 3: { lucThan: "Thê Tài", chiIndex: 6 } });
    const r = getPhiPhucRelations(cast)[0]!;
    for (const banned of ["score", "diem", "strength", "weight", "verdict", "tot", "xau"]) {
      expect(r).not.toHaveProperty(banned);
    }
  });

  it("deterministic", () => {
    const cast = withPhuc(clearPhuc(castMau()), { 4: { lucThan: "Tử Tôn", chiIndex: 2 } });
    expect(getPhiPhucRelations(cast)).toEqual(getPhiPhucRelations(cast));
  });
});
