/**
 * DU NIÊN BÁT QUÁI (BÁT BIẾN DU NIÊN) — bảng quan hệ giữa 2 Cung Bát Trạch bất kỳ, ra 1 trong
 * 8 khí (4 cát: Sinh Khí/Thiên Y/Diên Niên/Phục Vị — 4 hung: Họa Hại/Ngũ Quỷ/Lục Sát/Tuyệt
 * Mệnh). Nguồn: skill nội bộ `bat-trach-luan-nha` (đã đối chiếu khớp toàn bộ ví dụ trong tài
 * liệu gốc). Bảng có tính đối xứng (Gốc A → B ra khí K thì Gốc B → A cũng ra khí K).
 */
import type { CungBatTrach } from "./cungPhi.js";

export type KhiBatTrach =
  | "sinh-khi"
  | "thien-y"
  | "dien-nien"
  | "phuc-vi"
  | "hoa-hai"
  | "ngu-quy"
  | "luc-sat"
  | "tuyet-menh";

export const KHI_BAT_TRACH_INFO: Record<KhiBatTrach, { ten: string; cat: boolean; yNghia: string }> = {
  "sinh-khi": { ten: "Sinh Khí", cat: true, yNghia: "Cát (thượng cát) — sinh con vượng tài, thăng quan tiến chức" },
  "thien-y": { ten: "Thiên Y", cat: true, yNghia: "Cát — nhân đinh và tài vận hưng thịnh, tốt cho sức khỏe" },
  "dien-nien": { ten: "Diên Niên", cat: true, yNghia: "Cát — vượng tài phát đạt, gia đạo hòa thuận, trường thọ" },
  "phuc-vi": { ten: "Phục Vị", cat: true, yNghia: "Cát (bình hòa) — ổn định nhưng ít đột phá" },
  "hoa-hai": { ten: "Họa Hại", cat: false, yNghia: "Hung — tổn thương người, hao tài, bại sản" },
  "ngu-quy": { ten: "Ngũ Quỷ", cat: false, yNghia: "Hung (nặng) — hỏa hoạn, trộm cướp, thị phi khẩu thiệt" },
  "luc-sat": { ten: "Lục Sát", cat: false, yNghia: "Hung — kiện tụng, bệnh tật, hao tài" },
  "tuyet-menh": { ten: "Tuyệt Mệnh", cat: false, yNghia: "Hung (nặng nhất) — tổn hại nghiêm trọng nhất" },
};

export const DU_NIEN_BAT_QUAI: Record<CungBatTrach, Record<CungBatTrach, KhiBatTrach>> = {
  Càn: { Càn: "phuc-vi", Đoài: "sinh-khi", Cấn: "thien-y", Khôn: "dien-nien", Tốn: "hoa-hai", Khảm: "luc-sat", Chấn: "ngu-quy", Ly: "tuyet-menh" },
  Khảm: { Khảm: "phuc-vi", Tốn: "sinh-khi", Chấn: "thien-y", Ly: "dien-nien", Đoài: "hoa-hai", Càn: "luc-sat", Cấn: "ngu-quy", Khôn: "tuyet-menh" },
  Cấn: { Cấn: "phuc-vi", Khôn: "sinh-khi", Càn: "thien-y", Đoài: "dien-nien", Ly: "hoa-hai", Chấn: "luc-sat", Khảm: "ngu-quy", Tốn: "tuyet-menh" },
  Chấn: { Chấn: "phuc-vi", Ly: "sinh-khi", Khảm: "thien-y", Tốn: "dien-nien", Khôn: "hoa-hai", Cấn: "luc-sat", Càn: "ngu-quy", Đoài: "tuyet-menh" },
  Tốn: { Tốn: "phuc-vi", Khảm: "sinh-khi", Ly: "thien-y", Chấn: "dien-nien", Càn: "hoa-hai", Đoài: "luc-sat", Khôn: "ngu-quy", Cấn: "tuyet-menh" },
  Ly: { Ly: "phuc-vi", Chấn: "sinh-khi", Tốn: "thien-y", Khảm: "dien-nien", Cấn: "hoa-hai", Khôn: "luc-sat", Đoài: "ngu-quy", Càn: "tuyet-menh" },
  Khôn: { Khôn: "phuc-vi", Cấn: "sinh-khi", Đoài: "thien-y", Càn: "dien-nien", Chấn: "hoa-hai", Ly: "luc-sat", Tốn: "ngu-quy", Khảm: "tuyet-menh" },
  Đoài: { Đoài: "phuc-vi", Càn: "sinh-khi", Khôn: "thien-y", Cấn: "dien-nien", Khảm: "hoa-hai", Tốn: "luc-sat", Ly: "ngu-quy", Chấn: "tuyet-menh" },
};

export function getKhiBatTrach(cungGoc: CungBatTrach, cungDoiChieu: CungBatTrach): KhiBatTrach {
  return DU_NIEN_BAT_QUAI[cungGoc][cungDoiChieu];
}
