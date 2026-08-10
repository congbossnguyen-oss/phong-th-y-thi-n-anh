/**
 * Tam Nương Sát — 6 ngày Âm lịch mùng 3, 7, 13, 18, 22, 27 hàng tháng (áp dụng mọi tháng như
 * nhau, không đổi theo Can Chi).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR), mục "NGÀY CÔ THẦN TÚ QỦA": "Tam
 * Nương sách bách sự kỵ. Đầu tháng ngày mùng 3, mùng bảy... Giữa tháng kiêng ngày 13, 18...
 * Cuối tháng kiêng ngày 22, 27." — chủ dự án xác nhận đúng 6 ngày trên (2026-08-10).
 *
 * ⚠️ Sách còn 1 đoạn khác ("NHỮNG NGAY TAM LƯƠNG", dạng thơ lục bát) ghi "mười hai, mười
 * tám" (12 thay vì 13) — khả năng OCR/thơ đọc nhầm "mười ba" thành "mười hai". Dùng 13 theo
 * đúng xác nhận của chủ dự án, không dùng giá trị 12 ở đoạn thơ.
 *
 * Kỵ: khởi sự lớn (làm nhà, cưới gả, xuất hành, chăn nuôi gia súc...).
 */
export const TAM_NUONG_LUNAR_DAYS = [3, 7, 13, 18, 22, 27] as const;

export function isTamNuong(lunarDay: number): boolean {
  return (TAM_NUONG_LUNAR_DAYS as readonly number[]).includes(lunarDay);
}
