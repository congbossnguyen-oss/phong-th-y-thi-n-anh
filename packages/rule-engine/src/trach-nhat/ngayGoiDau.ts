/**
 * Ngày Gội Đầu — ngày nên gội đầu, xét theo ngày Âm lịch trong tháng HOẶC Trực của ngày.
 *
 * Nguồn: OCR "Hiệp Kỷ Biện Phương Thư Tập 2" (Mai Cốc Thành, chủ dự án cung cấp 2026-08-11),
 * mục "NGÀY GỘI ĐẦU", dòng 21533-21535: "Mỗi tháng nên ngày 3, ngày 4, ngày 8, ngày 9, ngày
 * 10, ngày 11, ngày 13, ngày 14, ngày 15, ngày 22, ngày 23, ngày 26, ngày 27 ngày Phục, ngày
 * Xá, ngày Kiến, Phá, Bình, Thu."
 *
 * ⚠️ Nguyên văn còn nhắc thêm "ngày Phục" và "ngày Xá" — 2 loại ngày này engine hiện chưa có
 * (khác với các khái niệm "Phục"/"Xá" thần đã cài ở module khác, chưa xác minh có phải cùng 1
 * thứ không) nên KHÔNG đưa vào điều kiện dưới đây, chỉ dùng phần đã xác định rõ (ngày Âm lịch
 * cụ thể + tên Trực), tránh nhầm lẫn 2 khái niệm khác nhau.
 */
export const NGAY_GOI_DAU_AM_LICH = [3, 4, 8, 9, 10, 11, 13, 14, 15, 22, 23, 26, 27] as const;
export const NGAY_GOI_DAU_TRUC = ["Kiến", "Phá", "Bình", "Thu"] as const;

export function isNgayGoiDauTot(lunarDay: number, tenTruc: string): boolean {
  return (
    (NGAY_GOI_DAU_AM_LICH as readonly number[]).includes(lunarDay) ||
    (NGAY_GOI_DAU_TRUC as readonly string[]).includes(tenTruc)
  );
}
