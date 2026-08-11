/**
 * Ngày đẹp để trang điểm dung nhan, cạo đầu, cắt tóc.
 *
 * Nguồn: OCR "Hiệp Kỷ Biện Phương Thư Tập 1" (Mai Cốc Thành, chủ dự án cung cấp 2026-08-11),
 * mục "TRANG ĐIỂM DUNG NHAN, CẠO ĐẦU, CẮT TÓC", dòng 9350-9352: "Nghi: ngày Trừ, Giải thần".
 *
 * ⚠️ Sách không ghi mục "Kị" riêng cho việc này ngay dưới mục trên (khác việc "SỬA MÓNG TAY,
 * CHÂN" đứng ngay sau đó có Kị riêng rõ ràng) — không suy đoán thêm Kị cho mục này. Ngày Bách
 * Kỵ (`ngayBachKy.ts`, nguồn khác — Tập 2) đã có sẵn "Đinh không cắt tóc, cạo đầu" tính theo
 * Can của NGÀY — hiển thị tách biệt trên giao diện, KHÔNG gộp logic vào hàm dưới đây vì 2
 * nguồn/2 điều kiện độc lập nhau.
 */
export function isNgayDepCatToc(tenTruc: string, tenCacThanSatTrongNgay: readonly string[]): boolean {
  return tenTruc === "Trừ" || tenCacThanSatTrongNgay.includes("Giải Thần");
}
