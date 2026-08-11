/**
 * Ngày Bách Kỵ — kỵ theo Can/Chi của NGÀY hiện tại (khác với các bảng kỵ theo tháng khác
 * trong `trach-nhat/`), mỗi Can/Chi ứng với đúng 1 việc cụ thể nên tránh vào ngày mang
 * Can/Chi đó.
 *
 * Nguồn: OCR "Hiệp Kỷ Biện Phương Thư Tập 2" (Mai Cốc Thành, chủ dự án cung cấp 2026-08-11),
 * mục "NGÀY BÁCH KỊ", dòng 21493-21526.
 *
 * ⚠️ Bản OCR bị RỚT (mất hẳn, không phải xáo trộn) một số dòng trong bảng: thiếu Can Nhâm,
 * thiếu Chi Thìn/Tỵ/Ngọ, và dòng Hợi chỉ còn sót lại vế "đón dâu" trôi nổi không kèm nhãn
 * "Hợi không..." rõ ràng nên bỏ luôn, không suy đoán ghép lại. Các dòng còn lại (9/10 Can,
 * 8/12 Chi) mỗi dòng độc lập, không bị xáo trộn thứ tự từ như các bảng Nghi/Kỵ khác đã trích
 * ở Tập 1 — đã chuẩn hoá chính tả OCR hiển nhiên (vd. "khong"→"không", "Mạu"→"Mậu",
 * "Tàn"→"Tân", "Dàn"→"Dần", "Than"→"Thân", "Dạu"→"Dậu"), không suy đoán thêm nội dung.
 */
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export const CAN_BACH_KY: Partial<Record<Can, string>> = {
  "Giáp": "không mở kho",
  "Ất": "không trồng trọt",
  "Bính": "không tu sửa bếp",
  "Đinh": "không cắt tóc, cạo đầu",
  "Mậu": "không nhận ruộng",
  "Kỷ": "không phá khoán (huỷ hợp đồng)",
  "Canh": "không đan dệt",
  "Tân": "không làm tương",
  "Quý": "không từ tụng (kiện tụng)",
  // Nhâm: dòng bị rớt khỏi OCR, không có dữ liệu — không suy đoán.
};

export const CHI_BACH_KY: Partial<Record<Chi, string>> = {
  "Tý": "không xem bói",
  "Sửu": "không làm lễ đội mũ, đeo thắt lưng",
  "Dần": "không tế cúng",
  "Mão": "không đào giếng",
  "Mùi": "không uống thuốc",
  "Thân": "không kê giường",
  "Dậu": "không đãi khách",
  "Tuất": "không xin chó",
  // Thìn, Tỵ, Ngọ, Hợi: dòng bị rớt khỏi OCR, không có dữ liệu — không suy đoán.
};

export interface BachKyEntry {
  nhan: string; // "Giáp" hoặc "Tý" — Can/Chi gây kỵ
  viec: string;
}

/** (Các) điều kỵ Bách Kỵ áp dụng cho ngày có Can/Chi cho trước — 0, 1 hoặc 2 kết quả. */
export function getBachKyNgay(canNgay: Can, chiNgay: Chi): BachKyEntry[] {
  const result: BachKyEntry[] = [];
  const can = CAN_BACH_KY[canNgay];
  if (can) result.push({ nhan: canNgay, viec: can });
  const chi = CHI_BACH_KY[chiNgay];
  if (chi) result.push({ nhan: chiNgay, viec: chi });
  return result;
}
