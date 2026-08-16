/**
 * SÁT NHẬP TRUNG CUNG · BẠCH HỔ NHẬP TRUNG CUNG — hai đại sát tra theo vị trí ngày trong vòng
 * 60 Hoa Giáp.
 *
 * Nguồn: công thức chủ dự án cung cấp trực tiếp 2026-08-16.
 *
 * Cách tính: phi thuận Cửu Cung từ Khảm 1, lấy Giáp Tý = 0 làm mốc.
 *   Giáp Tý → Khảm 1 · Ất Sửu → Khôn 2 · … · Mậu Thìn → Trung Cung 5
 * Ngày rơi vào Trung Cung khi `(dayIndex + 5) % 9 === 0`.
 *
 * Bạch Hổ Nhập Trung Cung dùng CHÍNH bộ ngày đó — không phải bảng riêng.
 *
 * ⚠️ KHÔNG NHẦM VỚI:
 *   • "Bạch Hổ" thông thường — sao khác, hệ khác.
 *   • "Lôi Đình Bạch Hổ Nhập Trung Cung" (雷霆白虎入中宮) — hệ riêng, phụ thuộc CAN CỦA THÁNG,
 *     hiện repo chưa có công thức.
 *
 * ⚠️ TRÙNG BỘ NGÀY VỚI TRỰC TINH: bảy ngày này (Mậu Thìn, Đinh Sửu, Bính Tuất, Ất Mùi, Giáp Thìn,
 * Quý Sửu, Nhâm Tuất) trùng khít danh sách `TRUC_TINH["Tứ Mạnh"]` trong `tamDaiCatTinh.ts`. Nghĩa
 * là trong các tháng Tứ Mạnh (1, 4, 7, 10), một ngày vừa là Trực Tinh (đại cát) vừa là Sát/Bạch Hổ
 * Nhập Trung Cung (đại hung) — mà theo sơ đồ hoá giải của chủ dự án thì Trung Cung KHÔNG hoá giải
 * được kể cả khi có Tam Đại Cát Tinh. Đã báo chủ dự án; chưa tự quyết cách xử lý.
 */
import { Data } from "@thien-anh/calendar-core";
import type { CatHung } from "./catHung.js";

type Can = Data.Can;
type Chi = Data.Chi;

const CAN_THU_TU: readonly Can[] = [
  "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý",
];
const CHI_THU_TU: readonly Chi[] = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
];

/**
 * Vị trí của một trụ Can-Chi trong vòng 60 Hoa Giáp, quy ước Giáp Tý = 0.
 *
 * Tách riêng ở đây để nhiều module dùng chung — trước mỗi nơi tự viết một bản.
 */
export function chiSoVong60(can: Can, chi: Chi): number {
  const ci = CAN_THU_TU.indexOf(can);
  const zi = CHI_THU_TU.indexOf(chi);
  if (ci < 0 || zi < 0) throw new Error(`Cặp Can-Chi không hợp lệ: ${can} ${chi}`);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ci && i % 12 === zi) return i;
  }
  // Không tới được: mọi cặp Can-Chi hợp lệ (cùng tính chẵn/lẻ) đều có chỗ trong vòng 60.
  throw new Error(`Cặp Can-Chi không tồn tại trong vòng 60 Hoa Giáp: ${can} ${chi}`);
}

/**
 * Ngày có phi vào Trung Cung không.
 *
 * @param dayIndex Vị trí ngày trong vòng 60 Hoa Giáp (Giáp Tý = 0). Nhận giá trị ngoài 0-59 cũng
 *   được — hàm tự quy về vòng, để tầng gọi truyền thẳng số đếm liên tục mà không phải chuẩn hoá.
 */
export function isSatNhapTrungCung(dayIndex: number): boolean {
  if (!Number.isInteger(dayIndex)) {
    throw new Error(`dayIndex phải là số nguyên: ${dayIndex}`);
  }
  const i = ((dayIndex % 60) + 60) % 60;
  return (i + 5) % 9 === 0;
}

/**
 * Bạch Hổ Nhập Trung Cung — dùng chính bộ ngày của Sát Nhập Trung Cung.
 *
 * Giữ thành hàm riêng (thay vì để tầng gọi tự biết là như nhau) vì đây là HAI SAO KHÁC NHAU về ý
 * nghĩa, chỉ tình cờ chung bảng tra. Nếu sau này nguồn tách bảng thì chỉ sửa ở đây.
 */
export function isBachHoNhapTrungCung(dayIndex: number): boolean {
  return isSatNhapTrungCung(dayIndex);
}

export interface NhapTrungCungEntry {
  name: "Sát Nhập Trung Cung" | "Bạch Hổ Nhập Trung Cung";
  catHung: CatHung;
  nguon: string;
}

/** Cả hai đại sát Trung Cung có mặt trong ngày (nếu có). */
export function getNhapTrungCungTrongNgay(canNgay: Can, chiNgay: Chi): NhapTrungCungEntry[] {
  const nguon = "Công thức chủ dự án cung cấp 2026-08-16 (phi thuận Cửu Cung từ Khảm 1)";
  const dayIndex = chiSoVong60(canNgay, chiNgay);
  if (!isSatNhapTrungCung(dayIndex)) return [];
  return [
    { name: "Sát Nhập Trung Cung", catHung: "hung", nguon },
    { name: "Bạch Hổ Nhập Trung Cung", catHung: "hung", nguon },
  ];
}
