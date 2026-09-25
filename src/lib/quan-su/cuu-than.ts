// QUÂN SƯ THIÊN ANH — CỪU THẦN (仇神), deterministic contextual FACT layer (Phase 16).
//
// DETECT → PRESERVE → SURFACE. KHÔNG score, KHÔNG verdict, KHÔNG đưa vào chuỗi Kỵ→Nguyên→Dụng, KHÔNG
// sửa can-luc-hao / ket-luan-su-viec. Cừu chỉ là quan hệ FACT ngữ cảnh.
//
// NGUỒN (khóa trong CHÍNH spec Lục Hào của dự án):
//   • LUAN_QUE_LUC_HAO_SPEC.md §260: "Cừu Thần (sinh Kỵ Thần, khắc Nguyên Thần)".
//   • QUY_TRINH_LUC_HAO_LUAN.md §229: "Cừu Thần: hào SINH Kỵ Thần đồng thời KHẮC Nguyên Thần".
// Hai điều kiện ("sinh Kỵ" + "khắc Nguyên") LUÔN cho ra CÙNG MỘT ngũ hành cho mọi Dụng (kiểm chứng đủ
// 5 hành) → định nghĩa nhất quán, deterministic. Cừu là hành KHÁC Kỵ (nên Cừu ≠ Kỵ). Đây là quy tắc
// spec ĐÃ ĐẶT, không phải tự suy từ ngũ hành. (Ghi đè lưu ý "hoãn" ở Phase 2 — nay spec đã đủ rõ.)

import type { FullCastResult } from "../luc-hao";
import type { NguHanh } from "../menh-nap-am";
import { CHI } from "../menh-nap-am";
import { CHI_NGU_HANH } from "../bat-tu";
import { nguHanhTac, type FourGods } from "./advisory-engine";

export type CuuRelationKind = "SINH_KY" | "KHAC_NGUYEN";

export interface CuuThanMember {
  lineIndex: number;
  chi: string;
  nguHanh: NguHanh;
  lucThan: string;
  isDong: boolean;
  reason: string[];
}

export interface CuuThanRelation {
  fromLineIndex: number; // hào Cừu
  toLineIndex: number; // hào Kỵ hoặc Nguyên
  toRole: "KY" | "NGUYEN";
  kind: CuuRelationKind; // SINH_KY (Cừu sinh Kỵ) / KHAC_NGUYEN (Cừu khắc Nguyên) — raw FACT
  reason: string;
}

export interface CuuThanResult {
  dungThanNguHanh: NguHanh | null;
  cuuNguHanh: NguHanh | null; // ngũ hành Cừu Thần (sinh Kỵ = khắc Nguyên)
  members: CuuThanMember[];
  relations: CuuThanRelation[];
  ghiChu: string[];
}

const ELEMENTS: NguHanh[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"];
/** Hành mà `e` KHẮC `target` (a khắc b). */
const elemThatKhac = (target: NguHanh): NguHanh | undefined => ELEMENTS.find((e) => nguHanhTac(e, target) === "a-khac-b");
/** Hành mà `e` SINH `target` (a sinh b). */
const elemThatSinh = (target: NguHanh): NguHanh | undefined => ELEMENTS.find((e) => nguHanhTac(e, target) === "a-sinh-b");

/**
 * Cừu Thần theo spec: hành SINH Kỵ Thần (đồng thời KHẮC Nguyên Thần). Kỵ = hành khắc Dụng ⇒ Cừu = hành
 * sinh (hành-khắc-Dụng). Pure/deterministic. KHÔNG phán cát hung.
 */
export function synthesizeCuuThan(cast: FullCastResult, fourGods: FourGods): CuuThanResult {
  const ghiChu: string[] = [];
  const dungEl = fourGods.dungThanNguHanh;
  if (!dungEl) {
    return { dungThanNguHanh: null, cuuNguHanh: null, members: [], relations: [], ghiChu: ["Dụng Thần chưa xác định ngũ hành → không xác định được Cừu Thần."] };
  }

  const kyEl = elemThatKhac(dungEl); // hành khắc Dụng
  const cuuEl = kyEl ? elemThatSinh(kyEl) : undefined; // hành sinh Kỵ
  if (!cuuEl) {
    return { dungThanNguHanh: dungEl, cuuNguHanh: null, members: [], relations: [], ghiChu: ["Không suy được ngũ hành Cừu Thần."] };
  }

  // Hào Cừu Thần = hào mang đúng ngũ hành Cừu (loại chính hào Dụng nếu trùng — không thể trùng vì khác hành).
  const members: CuuThanMember[] = cast.chinh.hao
    .filter((h) => h.nguHanh === cuuEl)
    .map((h) => ({
      lineIndex: h.hao, chi: CHI[h.chiIndex], nguHanh: h.nguHanh, lucThan: h.lucThan, isDong: h.isDong,
      reason: [`${h.nguHanh} sinh ${kyEl} (Kỵ Thần) và khắc ${elemThatSinh(dungEl)} (Nguyên Thần) → Cừu Thần theo spec (FACT, KHÔNG phán cát/hung).`],
    }));

  // Quan hệ FACT: Cừu → Kỵ (SINH), Cừu → Nguyên (KHẮC). Chỉ nêu với các hào Kỵ/Nguyên engine đã xác định.
  const relations: CuuThanRelation[] = [];
  for (const c of members) {
    for (const k of fourGods.kyThan) {
      relations.push({ fromLineIndex: c.lineIndex, toLineIndex: k.hao, toRole: "KY", kind: "SINH_KY", reason: `Cừu (hào ${c.lineIndex} ${c.nguHanh}) sinh Kỵ Thần (hào ${k.hao} ${k.nguHanh}) — nuôi Kỵ.` });
    }
    for (const n of fourGods.nguyenThan) {
      relations.push({ fromLineIndex: c.lineIndex, toLineIndex: n.hao, toRole: "NGUYEN", kind: "KHAC_NGUYEN", reason: `Cừu (hào ${c.lineIndex} ${c.nguHanh}) khắc Nguyên Thần (hào ${n.hao} ${n.nguHanh}) — chặn đường cứu viện.` });
    }
  }

  ghiChu.push(
    members.length === 0
      ? `Cừu Thần ngũ hành ${cuuEl} không xuất hiện trên quẻ (không có hào nào mang hành này).`
      : `Cừu Thần = hành ${cuuEl} (sinh Kỵ ${kyEl}, khắc Nguyên ${elemThatSinh(dungEl)}) — QUAN HỆ FACT theo spec §260/§229. KHÔNG phải Kỵ Thần, KHÔNG tự làm Suy/Hung, KHÔNG đưa vào chuỗi Kỵ→Nguyên→Dụng, KHÔNG override kết luận.`,
  );
  return { dungThanNguHanh: dungEl, cuuNguHanh: cuuEl, members, relations, ghiChu };
}
