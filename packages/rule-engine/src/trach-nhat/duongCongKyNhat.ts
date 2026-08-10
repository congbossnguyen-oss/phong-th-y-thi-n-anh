/**
 * Dương Công Kỵ Nhật (Dương Công Thập Tam Kỵ) — 13 ngày Âm lịch đại kỵ trong năm, mỗi tháng
 * 1 ngày (riêng tháng 7 có 2 ngày: mùng 1 và 29).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (dữ liệu do chủ dự án cung cấp trực tiếp
 * 2026-08-10; mục tương ứng trong sách: "DƯƠNG CÔNG KỴ NHẬT NGÀY LÀM NHÀ").
 *
 * Kỵ: làm nhà, sửa cửa, động thổ; cưới hỏi, đính hôn; xuất hành đi xa, nhậm chức; khai
 * trương, ký kết hợp đồng lớn; an táng (mai táng).
 */
export interface DuongCongKyNhatEntry {
  lunarMonth: number;
  lunarDay: number;
}

export const DUONG_CONG_KY_NHAT: readonly DuongCongKyNhatEntry[] = [
  { lunarMonth: 1, lunarDay: 13 },
  { lunarMonth: 2, lunarDay: 11 },
  { lunarMonth: 3, lunarDay: 9 },
  { lunarMonth: 4, lunarDay: 7 },
  { lunarMonth: 5, lunarDay: 5 },
  { lunarMonth: 6, lunarDay: 3 },
  { lunarMonth: 7, lunarDay: 1 },
  { lunarMonth: 7, lunarDay: 29 },
  { lunarMonth: 8, lunarDay: 27 },
  { lunarMonth: 9, lunarDay: 25 },
  { lunarMonth: 10, lunarDay: 23 },
  { lunarMonth: 11, lunarDay: 21 },
  { lunarMonth: 12, lunarDay: 19 },
] as const;

export function isDuongCongKyNhat(lunarMonth: number, lunarDay: number): boolean {
  return DUONG_CONG_KY_NHAT.some((e) => e.lunarMonth === lunarMonth && e.lunarDay === lunarDay);
}
