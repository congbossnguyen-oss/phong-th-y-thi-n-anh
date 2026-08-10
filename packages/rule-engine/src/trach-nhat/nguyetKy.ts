/**
 * Nguyệt Kỵ — 3 ngày Âm lịch mùng 5, 14, 23 hàng tháng (áp dụng mọi tháng như nhau, không
 * đổi theo Can Chi).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR), mục "NHỮNG NGÀY NGUYỆT KỴ".
 * Kỵ: cầu tài, xuất hành, giá thú, nhập trạch, cất nóc, hạ móng.
 *
 * Ghi chú: một số tài liệu phong thủy khác gọi cùng 3 ngày này là "Ngũ Quỷ" — tên khác,
 * cùng 1 bộ ngày, không tạo module riêng.
 */
export const NGUYET_KY_LUNAR_DAYS = [5, 14, 23] as const;

export function isNguyetKy(lunarDay: number): boolean {
  return (NGUYET_KY_LUNAR_DAYS as readonly number[]).includes(lunarDay);
}
