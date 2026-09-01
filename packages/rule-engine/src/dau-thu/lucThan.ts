/**
 * Xếp Lục Thân — Bước 3 phương pháp Đẩu Thủ Chọn Ngày.
 *
 * Đối chiếu ngũ hành Đẩu Thủ của Sơn Đầu ("tôi") với ngũ hành hóa khí của Can mỗi trụ ("tha"):
 * đồng hành = Nguyên Thần, tha sinh tôi = Tham Quan, tôi sinh tha = Liêm Trinh, tôi khắc tha =
 * Võ Tài, tha khắc tôi = Phá Quân (`dau-thu-chon-ngay.md` Bước 3, "cách suy nhanh").
 *
 * Cài bằng công thức sinh-khắc ngũ hành chuẩn thay vì chép tay bảng 5×5 — đã đối chiếu khớp
 * 100% với bảng tra cho sẵn trong nguồn (cả 5 hàng × 5 cột) trước khi chọn cách này.
 */
import type { NguHanh } from "./nguHanhDauThu.js";

export type VaiLucThan = "Nguyên Thần" | "Tham Quan" | "Liêm Trinh" | "Võ Tài" | "Phá Quân";

/** Hành X sinh ra hành nào (chiều Mộc→Hỏa→Thổ→Kim→Thủy→Mộc). */
const SINH: Readonly<Record<NguHanh, NguHanh>> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
/** Hành X khắc hành nào (chiều Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc). */
const KHAC: Readonly<Record<NguHanh, NguHanh>> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

/** Vai Lục Thân của hóa khí (`tha`) so với ngũ hành Đẩu Thủ của Sơn Đầu (`toi`). */
export function xepLucThan(toi: NguHanh, tha: NguHanh): VaiLucThan {
  if (toi === tha) return "Nguyên Thần";
  if (SINH[tha] === toi) return "Tham Quan"; // tha sinh tôi
  if (SINH[toi] === tha) return "Liêm Trinh"; // tôi sinh tha
  if (KHAC[toi] === tha) return "Võ Tài"; // tôi khắc tha
  return "Phá Quân"; // tha khắc tôi (trường hợp còn lại)
}
