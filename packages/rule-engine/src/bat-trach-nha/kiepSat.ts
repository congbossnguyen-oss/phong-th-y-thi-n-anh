/**
 * BÁT TRẠCH NHÀ — Kiếp Sát theo TỌA nhà (bảng 24 sơn). Nguồn: bảng chép tay của anh Công (ảnh
 * "Kiếp Sát", đã đối chiếu xác nhận từng ô 30/8/2026 — anh Công sửa trực tiếp 3 ô em đọc sai:
 * Cấn→Đinh, Tỵ→Dậu, Ngọ→Dậu).
 *
 * ⚠️ Đây là bảng theo TRƯỜNG PHÁI RIÊNG của anh Công, KHÔNG suy ra được bằng công thức Kiếp Sát
 * tam hợp phổ thông (Thân-Tý-Thìn→Tỵ...): bảng này phụ thuộc từng Tọa cụ thể (đảo Tọa↔Hướng thì
 * Kiếp Sát đổi — vd Tọa Nhâm→Thân nhưng Tọa Bính→Tân). Vì vậy là BẢNG TRA CỨU TĨNH nguyên bản,
 * KHÔNG tự tính/suy diễn ô nào. Cột "Hướng" trong bảng gốc chỉ là sơn đối diện (Tọa+180°) nên
 * không cần lưu — engine tự tính Tọa từ Hướng nhà.
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { SON_24_TOI_CUNG, type Son24 } from "./toaHuong.js";

/** Tọa sơn (24 sơn) → sơn đóng Kiếp Sát. Nguyên bản bảng anh Công cung cấp, không suy diễn. */
export const KIEP_SAT_THEO_TOA: Record<Son24, Son24> = {
  // Nửa trái bảng
  Nhâm: "Thân",
  Tý: "Tỵ",
  Quý: "Tỵ",
  Sửu: "Thìn",
  Cấn: "Đinh",
  Dần: "Mùi",
  Giáp: "Bính",
  Mão: "Đinh",
  Ất: "Thân",
  Thìn: "Mùi",
  Tốn: "Quý",
  Tỵ: "Dậu",
  // Nửa phải bảng (12 Tọa đối diện)
  Bính: "Tân",
  Ngọ: "Dậu",
  Đinh: "Dần",
  Mùi: "Quý",
  Khôn: "Ất",
  Thân: "Quý",
  Canh: "Ngọ",
  Dậu: "Dần",
  Tân: "Sửu",
  Tuất: "Sửu",
  Càn: "Mão",
  Hợi: "Ất",
};

export interface KetQuaKiepSat {
  /** Tọa sơn của nhà (24 sơn) — mốc để tra Kiếp Sát. */
  sonToa: Son24;
  /** Sơn đóng Kiếp Sát (kỵ mở cửa/đặt bếp/động thổ tại đây). */
  sonKiepSat: Son24;
  /** Cung Bát Quái chứa sơn Kiếp Sát (để đối chiếu nhanh 8 phương). */
  cungKiepSat: CungBatTrach;
}

/** Tra Kiếp Sát theo TỌA sơn (24 sơn). `sonToa` lấy từ `doToSon(huongToToa(huongDo))`. */
export function kiemKiepSat(sonToa: Son24): KetQuaKiepSat {
  const sonKiepSat = KIEP_SAT_THEO_TOA[sonToa];
  return { sonToa, sonKiepSat, cungKiepSat: SON_24_TOI_CUNG[sonKiepSat] };
}
