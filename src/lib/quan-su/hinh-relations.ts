// QUÂN SƯ THIÊN ANH — HÌNH (刑) RELATIONS, deterministic FACT layer (Phase 15).
//
// CHỈ DETECT → PRESERVE → SURFACE. KHÔNG interpret, KHÔNG score, KHÔNG verdict. Hình KHÔNG = Khắc, và
// KHÔNG tự làm Suy/Hung/giảm lực — đó là việc của phase khác (nếu methodology khóa). File này chỉ nêu
// quan hệ + role + provenance.
//
// NGUỒN (khóa trong `docs/quan-su-thien-anh/LUAN_QUE_LUC_HAO_SPEC.md` §3.7):
//   • Tam Hình THẬT: Dần-Tỵ-Thân (cần đủ CẢ 3 chi).
//   • Tương Hình: Tý-Mão (cặp 2 chi).
// §348 (mục "còn thiếu") của CHÍNH spec ghi rõ: "Danh sách đầy đủ Tam Hình ngoài Dần-Tỵ-Thân và Tý-Mão
//   — cần đối chiếu thêm nguồn khác." ⇒ Sửu-Tuất-Mùi và Tự Hình (Thìn/Ngọ/Dậu/Hợi) CHƯA KHÓA →
//   KHÔNG implement (báo DATA GAP), dù án lệ có nhắc "Dậu/Hợi tự hình" (án lệ < spec).
// PHẠM VI: chỉ giữa 6 hào CHÍNH (chi-based, gồm cả hào động/tĩnh). Nhật/Nguyệt/năm/hào-biến/Phục làm
//   thành viên Hình: spec KHÔNG khóa điều kiện (khác Tam Hợp có §129) → KHÔNG xét ở đây (báo gap).

import type { FullCastResult } from "../luc-hao";
import { CHI } from "../menh-nap-am";
import type { DungThanResolved, FourGods } from "./advisory-engine";

export type HinhKind = "TAM_HINH" | "TUONG_HINH";
export type HinhRole = "DUNG" | "NGUYEN" | "KY" | "THE" | "UNG" | "OTHER";

export interface HinhMember {
  lineIndex: number;
  chi: string;
  role: HinhRole;
  isDong: boolean;
}

export interface HinhRelation {
  kind: HinhKind;
  label: string; // "Tam Hình Dần-Tỵ-Thân" / "Tương Hình Tý-Mão"
  members: HinhMember[];
  lineIndices: number[];
  chi: string[];
  reason: string[];
}

export interface HinhResult {
  relations: HinhRelation[];
  ghiChu: string[];
}

const I = (name: string) => {
  const idx = CHI.indexOf(name);
  if (idx < 0) throw new Error(`hinh-relations: chi "${name}" không có trong bảng CHI`);
  return idx;
};
// LƯU Ý: bảng CHI dùng "Tỵ" (không phải "Tị" như spec viết tay) — dùng đúng chính tả canonical.
const TAM_HINH_CHI = [I("Dần"), I("Tỵ"), I("Thân")]; // cần đủ cả 3
const TUONG_HINH_CHI = [I("Tý"), I("Mão")]; // cặp

/** Vai trò của một hào (Dụng > Nguyên/Kỵ > Thế/Ứng > OTHER). */
export function buildRoleOf(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): (lineIndex: number) => HinhRole {
  const dungLine = dt.trangThai === "hien" && dt.hao ? dt.hao.hao : undefined;
  const nguyen = new Set(fourGods.nguyenThan.map((m) => m.hao));
  const ky = new Set(fourGods.kyThan.map((m) => m.hao));
  return (lineIndex: number): HinhRole => {
    if (lineIndex === dungLine) return "DUNG";
    if (nguyen.has(lineIndex)) return "NGUYEN";
    if (ky.has(lineIndex)) return "KY";
    const h = cast.chinh.hao[lineIndex - 1];
    if (h?.theUng === "Thế") return "THE";
    if (h?.theUng === "Ứng") return "UNG";
    return "OTHER";
  };
}

/** Các hào (1-6) mang một trong các chi cho trước. */
function linesWithChi(cast: FullCastResult, chiSet: number[]): HinhMember[] {
  // roleOf gán ở tầng gọi; ở đây chỉ dựng khung member (role điền sau).
  return cast.chinh.hao
    .filter((h) => chiSet.includes(h.chiIndex))
    .map((h) => ({ lineIndex: h.hao, chi: CHI[h.chiIndex], role: "OTHER" as HinhRole, isDong: h.isDong }));
}

/**
 * Phát hiện Hình giữa 6 hào chính theo ĐÚNG 2 bộ spec khóa. Pure/deterministic. KHÔNG phán cát hung.
 */
export function detectHinh(cast: FullCastResult, roleOf: (lineIndex: number) => HinhRole): HinhResult {
  const relations: HinhRelation[] = [];
  const present = new Set(cast.chinh.hao.map((h) => h.chiIndex));

  // Tam Hình Dần-Tỵ-Thân — cần đủ CẢ 3 chi có mặt trên quẻ.
  if (TAM_HINH_CHI.every((c) => present.has(c))) {
    const members = linesWithChi(cast, TAM_HINH_CHI).map((m) => ({ ...m, role: roleOf(m.lineIndex) }));
    relations.push({
      kind: "TAM_HINH",
      label: "Tam Hình Dần-Tỵ-Thân",
      members,
      lineIndices: members.map((m) => m.lineIndex),
      chi: ["Dần", "Tỵ", "Thân"],
      reason: [`Đủ 3 chi Dần-Tỵ-Thân trên quẻ (hào ${members.map((m) => `${m.lineIndex}=${m.chi}`).join(", ")}) → Tam Hình thật (FACT quan hệ, KHÔNG phải Khắc, KHÔNG tự phán cát/hung).`],
    });
  }

  // Tương Hình Tý-Mão — cần đủ CẢ 2 chi.
  if (TUONG_HINH_CHI.every((c) => present.has(c))) {
    const members = linesWithChi(cast, TUONG_HINH_CHI).map((m) => ({ ...m, role: roleOf(m.lineIndex) }));
    relations.push({
      kind: "TUONG_HINH",
      label: "Tương Hình Tý-Mão",
      members,
      lineIndices: members.map((m) => m.lineIndex),
      chi: ["Tý", "Mão"],
      reason: [`Có cả Tý và Mão trên quẻ (hào ${members.map((m) => `${m.lineIndex}=${m.chi}`).join(", ")}) → Tương Hình (FACT, KHÔNG phải Khắc).`],
    });
  }

  const ghiChu = relations.length === 0
    ? ["Không có Tam Hình Dần-Tỵ-Thân hay Tương Hình Tý-Mão trên quẻ (chỉ xét 2 bộ spec §3.7 đã khóa)."]
    : ["Hình là QUAN HỆ FACT (spec §3.7) — KHÔNG tự coi là Khắc, KHÔNG tự làm Suy/Hung, KHÔNG override kết luận. Ý nghĩa cát/hung chưa được nguồn khóa."];
  // Ghi chú giới hạn (spec §348): các bộ Hình khác chưa khóa → cố ý KHÔNG detect.
  ghiChu.push("Giới hạn (spec §348): Sửu-Tuất-Mùi và Tự Hình (Thìn/Ngọ/Dậu/Hợi) CHƯA khóa nguồn → không xét. Hình với Nhật/Nguyệt/năm/hào-biến/Phục cũng chưa khóa điều kiện → không xét.");

  return { relations, ghiChu };
}

/** Entry point: dựng roleOf từ Dụng/Tứ Thần rồi phát hiện Hình. */
export function synthesizeHinh(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): HinhResult {
  return detectHinh(cast, buildRoleOf(cast, dt, fourGods));
}
