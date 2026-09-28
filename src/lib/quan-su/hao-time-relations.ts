// QUÂN SƯ THIÊN ANH — HÀO ↔ NHẬT/NGUYỆT relation FACT layer (Phase 17).
//
// DETECT → PRESERVE → SURFACE. KHÔNG recompute strength, KHÔNG score, KHÔNG verdict, KHÔNG gộp Nhật với
// Nguyệt. Tổng hợp Vượng/Suy đã thuộc canLucHao (Phase 10) — KHÔNG đụng tới.
//
// NGUỒN (canonical, reuse — không duplicate công thức):
//   • Chiều ngũ hành (sinh/khắc/tiết/đồng hành): `nguHanhTac` (primitive canLucHao đã dùng).
//   • Chi-specials (Lâm, Xung, Phá, Ám Động, Hợp, Hại): ĐỌC từ `HaoInfo.relations` — engine luc-hao.ts
//     đã tính sẵn (Nhật Phá vs Ám Động do engine phân biệt theo vượng/suy; ta KHÔNG tính lại).
//   • Năm (Thái Tuế / Tuế Phá): ĐÃ có ở `canLucHao.yearState` (Phase 10E) → KHÔNG lặp lại ở đây.

import type { FullCastResult, HaoInfo } from "../luc-hao";
import type { NguHanh } from "../menh-nap-am";
import { CHI } from "../menh-nap-am";
import { CHI_NGU_HANH } from "../bat-tu";
import { nguHanhTac, type DungThanResolved, type FourGods } from "./advisory-engine";
import { synthesizeCuuThan } from "./cuu-than";

export type HaoTimeSource = "NHAT" | "NGUYET";
export type HaoTimeRole = "DUNG" | "NGUYEN" | "KY" | "CUU" | "THE" | "UNG" | "OTHER";
export type HaoTimeKind =
  | "LAM_KIEN" // Lâm Nhật/Nguyệt Kiến (chi trùng)
  | "SINH_HAO" // Nhật/Nguyệt SINH hào
  | "KHAC_HAO" // Nhật/Nguyệt KHẮC hào
  | "HAO_SINH" // hào sinh Nhật/Nguyệt (bị tiết)
  | "HAO_KHAC" // hào khắc Nhật/Nguyệt
  | "DONG_HANH" // cùng ngũ hành, khác chi
  | "XUNG" // Nhật/Nguyệt xung hào (chi)
  | "PHA" // Nhật Phá / Nguyệt Phá
  | "AM_DONG" // Ám Động (chỉ Nhật; engine derive: hào TĨNH vượng + Nhật xung)
  | "TAN" // Nhật Tán / 散 (chỉ Nhật; hào ĐỘNG hưu/tù + Nhật xung) — Phase 25B
  | "DU_DONG" // 愈动 / Xung càng động (chỉ Nhật; hào ĐỘNG vượng + Nhật xung) — Phase 25B
  | "HOP" | "HAI";

export interface HaoTimeRelation {
  lineIndex: number;
  chi: string;
  role: HaoTimeRole;
  source: HaoTimeSource;
  kind: HaoTimeKind;
  reason: string;
}

export interface HaoTimeFacts {
  nhat: HaoTimeRelation[];
  nguyet: HaoTimeRelation[];
  ghiChu: string[];
}

/** roleOf gồm cả CUU (Phase 16). Ưu tiên: DUNG > NGUYEN > KY > CUU > THE > UNG > OTHER. */
function buildRoleOf(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): (lineIndex: number) => HaoTimeRole {
  const dungLine = dt.trangThai === "hien" && dt.hao ? dt.hao.hao : undefined;
  const nguyen = new Set(fourGods.nguyenThan.map((m) => m.hao));
  const ky = new Set(fourGods.kyThan.map((m) => m.hao));
  const cuuEl = synthesizeCuuThan(cast, fourGods).cuuNguHanh;
  return (lineIndex: number): HaoTimeRole => {
    if (lineIndex === dungLine) return "DUNG";
    if (nguyen.has(lineIndex)) return "NGUYEN";
    if (ky.has(lineIndex)) return "KY";
    const h = cast.chinh.hao[lineIndex - 1];
    if (cuuEl && h?.nguHanh === cuuEl) return "CUU";
    if (h?.theUng === "Thế") return "THE";
    if (h?.theUng === "Ứng") return "UNG";
    return "OTHER";
  };
}

const SRC_LABEL: Record<HaoTimeSource, string> = { NHAT: "Nhật Thần", NGUYET: "Nguyệt Kiến" };
// Loại relation engine (HaoInfo.relations) → source enum của luc-hao.
const engineSource: Record<HaoTimeSource, "DAY" | "MONTH"> = { NHAT: "DAY", NGUYET: "MONTH" };

/** Chiều ngũ hành hào ↔ (Nhật/Nguyệt) — dùng nguHanhTac, KHÔNG tính lại strength. */
function directionalRelations(
  h: HaoInfo, sourceChiIndex: number, sourceNH: NguHanh, source: HaoTimeSource, role: HaoTimeRole,
): HaoTimeRelation[] {
  const base = { lineIndex: h.hao, chi: CHI[h.chiIndex], role, source };
  // Lâm (chi trùng) → LAM_KIEN, KHÔNG kèm DONG_HANH (Lâm cụ thể hơn).
  if (h.chiIndex === sourceChiIndex) {
    return [{ ...base, kind: "LAM_KIEN", reason: `Hào ${h.hao} (${CHI[h.chiIndex]}) trùng Chi ${SRC_LABEL[source]} → Lâm ${source === "NHAT" ? "Nhật" : "Nguyệt"} Kiến (FACT).` }];
  }
  const rel = nguHanhTac(h.nguHanh, sourceNH); // a = hào, b = Nhật/Nguyệt
  const kind: HaoTimeKind =
    rel === "b-sinh-a" ? "SINH_HAO"
    : rel === "b-khac-a" ? "KHAC_HAO"
    : rel === "a-sinh-b" ? "HAO_SINH"
    : rel === "a-khac-b" ? "HAO_KHAC"
    : "DONG_HANH";
  const desc: Record<HaoTimeKind, string> = {
    SINH_HAO: `${SRC_LABEL[source]} sinh hào`, KHAC_HAO: `${SRC_LABEL[source]} khắc hào`,
    HAO_SINH: `hào sinh ${SRC_LABEL[source]} (bị tiết)`, HAO_KHAC: `hào khắc ${SRC_LABEL[source]}`,
    DONG_HANH: `hào đồng hành ${SRC_LABEL[source]}`,
    LAM_KIEN: "", XUNG: "", PHA: "", AM_DONG: "", TAN: "", DU_DONG: "", HOP: "", HAI: "",
  };
  return [{ ...base, kind, reason: `Hào ${h.hao} (${h.nguHanh}) — ${desc[kind]} (${SRC_LABEL[source]} ${sourceNH}) — FACT ngũ hành.` }];
}

/** Chi-specials từ HaoInfo.relations (canonical engine): Xung/Phá/Ám Động/Hợp/Hại theo source. */
function specialRelations(h: HaoInfo, source: HaoTimeSource, role: HaoTimeRole): HaoTimeRelation[] {
  const src = engineSource[source];
  const base = { lineIndex: h.hao, chi: CHI[h.chiIndex], role, source };
  const out: HaoTimeRelation[] = [];
  const has = (type: string) => h.relations.some((r) => r.type === type && r.source === src);
  const phaType = source === "NHAT" ? "Nhật Phá" : "Nguyệt Phá";
  if (has("Xung")) out.push({ ...base, kind: "XUNG", reason: `${SRC_LABEL[source]} xung hào ${h.hao} (chi) — FACT engine.` });
  if (has(phaType)) out.push({ ...base, kind: "PHA", reason: `${phaType} hào ${h.hao} — engine tính (Phá = giảm/tổn thương, KHÔNG mất hết lực).` });
  if (source === "NHAT" && has("Ám Động")) out.push({ ...base, kind: "AM_DONG", reason: `Ám Động hào ${h.hao} — engine derive (hào TĨNH vượng + Nhật xung). KHÔNG phải Nhật Phá.` });
  if (source === "NHAT" && has("Nhật Tán")) out.push({ ...base, kind: "TAN", reason: `Nhật Tán (散) hào ${h.hao} — engine derive (hào ĐỘNG hưu/tù + Nhật xung → tán, mất tác dụng động). KHÁC Nhật Phá (tĩnh-suy).` });
  if (source === "NHAT" && has("愈动")) out.push({ ...base, kind: "DU_DONG", reason: `愈动 (Xung càng động) hào ${h.hao} — engine derive (hào ĐỘNG vượng + Nhật xung → càng động). KHÁC Ám Động (tĩnh-vượng).` });
  if (has("Hợp")) out.push({ ...base, kind: "HOP", reason: `${SRC_LABEL[source]} hợp hào ${h.hao} — FACT engine.` });
  if (has("Hại")) out.push({ ...base, kind: "HAI", reason: `${SRC_LABEL[source]} hại hào ${h.hao} — FACT engine.` });
  return out;
}

/**
 * Surface toàn bộ quan hệ hào ↔ Nhật Thần và hào ↔ Nguyệt Kiến, GIỮ RIÊNG hai nguồn. Pure/deterministic.
 * KHÔNG recompute strength, KHÔNG score, KHÔNG verdict.
 */
export function synthesizeHaoTimeFacts(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): HaoTimeFacts {
  const roleOf = buildRoleOf(cast, dt, fourGods);
  const dayChiIndex = CHI.indexOf(cast.dayChi);
  const monthChiIndex = CHI.indexOf(cast.monthChi);
  const dayNH = CHI_NGU_HANH[dayChiIndex];
  const monthNH = CHI_NGU_HANH[monthChiIndex];

  const nhat: HaoTimeRelation[] = [];
  const nguyet: HaoTimeRelation[] = [];
  for (const h of cast.chinh.hao) {
    const role = roleOf(h.hao);
    nhat.push(...directionalRelations(h, dayChiIndex, dayNH, "NHAT", role), ...specialRelations(h, "NHAT", role));
    nguyet.push(...directionalRelations(h, monthChiIndex, monthNH, "NGUYET", role), ...specialRelations(h, "NGUYET", role));
  }

  return {
    nhat, nguyet,
    ghiChu: [
      "Quan hệ hào ↔ Nhật/Nguyệt là FACT (chiều ngũ hành + chi-specials engine tính). GIỮ RIÊNG Nhật vs Nguyệt — KHÔNG gộp.",
      "KHÔNG tự đảo chiều sinh/khắc, KHÔNG biến relation thành kết luận cát/hung; tổng hợp Vượng/Suy thuộc canLucHao. Phá = giảm lực (không zero). Thái Tuế/Tuế Phá xem canLucHao.yearState (Phase 10E).",
    ],
  };
}
