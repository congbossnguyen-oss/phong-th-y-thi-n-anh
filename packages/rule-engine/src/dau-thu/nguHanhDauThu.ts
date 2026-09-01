/**
 * Ngũ hành ĐẨU THỦ của 24 sơn — Bước 1 phương pháp Đẩu Thủ Chọn Ngày.
 *
 * ⚠️ KHÁC HẲN Chính Ngũ Hành thường của sơn (vd Giáp sơn = Mộc theo Chính Ngũ Hành, nhưng =
 * Thủy theo Đẩu Thủ). Bảng dưới lấy nguyên văn từ `data/dau-thu-chon-ngay.md` Bước 1 (nguồn
 * "Trạch Nhật Cao Cấp" - Ánh Dương, chủ dự án cung cấp 31/8/2026) — 24 sơn ghép 12 cặp liền kề,
 * mỗi cặp chung 1 hành. Dùng CHỈ cho module Đẩu Thủ, không dùng lẫn với Chính Ngũ Hành thường.
 */
import type { TenSon } from "../xem-ngay-cao-cap/data/sonBatQuai.js";

export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

const NGU_HANH_DAU_THU: Readonly<Record<TenSon, NguHanh>> = {
  Nhâm: "Thổ", Tý: "Thổ",
  Quý: "Hỏa", Sửu: "Hỏa",
  Cấn: "Mộc", Dần: "Mộc",
  Giáp: "Thủy", Mão: "Thủy",
  Ất: "Kim", Thìn: "Kim",
  Tốn: "Thổ", Tỵ: "Thổ",
  Bính: "Hỏa", Ngọ: "Hỏa",
  Đinh: "Mộc", Mùi: "Mộc",
  Khôn: "Thủy", Thân: "Thủy",
  Canh: "Kim", Dậu: "Kim",
  Tân: "Thổ", Tuất: "Thổ",
  Càn: "Hỏa", Hợi: "Hỏa",
};

/** Ngũ hành Đẩu Thủ của 1 sơn (Sơn Đầu). */
export function nguHanhDauThuCuaSon(son: TenSon): NguHanh {
  return NGU_HANH_DAU_THU[son];
}
