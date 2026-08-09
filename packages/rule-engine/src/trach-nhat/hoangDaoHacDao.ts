/**
 * Hoàng Đạo / Hắc Đạo theo NGÀY trong tháng âm lịch.
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR, chủ dự án cung cấp 2026-08-05),
 * mục "BẢNG KÊ NGÀY HOÀNG ĐẠO VÀ HẮC ĐẠO THEO LỊCH CAN CHI TỪNG THÁNG". Bảng sạch, không bị
 * OCR làm hỏng — đối chiếu trực tiếp được.
 *
 * ⚠️ CHỈ có phần NGÀY. Phần GIỜ (Lục Nhâm Đại Độn — Đại An/Lưu Niên/Tốc Hỷ/Xích Khẩu/Tiểu
 * Cát/Không Vong dùng để chọn GIỜ xuất hành) CHƯA code được: đoạn mô tả thuật toán ("CÁCH
 * ĐÓN GIỜ ĐI") dùng cơ chế đếm qua 12 "cung" phức tạp hơn nhiều so với chu kỳ 6 đơn giản, và
 * cả đoạn mô tả thuật toán lẫn ví dụ minh họa trong sách đều bị OCR làm xáo trộn nặng, không
 * đủ tin cậy để trích xuất thành công thức. Xem `LUC_NHAM_THANG_KHOI` bên dưới — chỉ mới xác
 * nhận được bảng "tháng nào khởi tại giá trị nào" (rõ ràng), CHƯA xác nhận được cách áp dụng
 * cho từng giờ trong ngày. Cần chủ dự án cung cấp thêm nguồn/ảnh chụp rõ hơn trước khi code
 * tiếp phần này — không tự suy đoán cơ chế đếm 12 cung.
 */

import { Data } from "@thien-anh/calendar-core";

const { CHI } = Data;
type Chi = Data.Chi;

export interface HoangDaoHacDaoNgay {
  hoangDao: readonly Chi[]; // 4 Chi ngày tốt (Hoàng Đạo) trong tháng này
  hacDao: readonly Chi[]; // 4 Chi ngày xấu (Hắc Đạo) trong tháng này
}

/**
 * Bảng Hoàng Đạo/Hắc Đạo theo cặp tháng âm lịch (1&7, 2&8, ..., 6&12).
 * index 0 = tháng Giêng/Bảy, index 1 = tháng Hai/Tám, ..., index 5 = tháng Sáu/Chạp.
 * Chỉ liệt kê đúng 4+4 = 8 trong 12 Chi mỗi tháng — 4 Chi còn lại KHÔNG được sách phân loại
 * Hoàng/Hắc Đạo ở bảng này (không tự suy đoán chúng thuộc loại nào).
 */
const BANG_HOANG_DAO_HAC_DAO_NGAY: readonly HoangDaoHacDaoNgay[] = [
  { hoangDao: ["Tý", "Sửu", "Tỵ", "Mùi"], hacDao: ["Ngọ", "Mão", "Hợi", "Dậu"] }, // Giêng-Bảy
  { hoangDao: ["Dần", "Mão", "Mùi", "Dậu"], hacDao: ["Thìn", "Tỵ", "Hợi", "Sửu"] }, // Hai-Tám
  { hoangDao: ["Thìn", "Tỵ", "Dậu", "Hợi"], hacDao: ["Tuất", "Mùi", "Mão", "Sửu"] }, // Ba-Chín
  { hoangDao: ["Ngọ", "Mùi", "Hợi", "Sửu"], hacDao: ["Tỵ", "Dậu", "Mão", "Tý"] }, // Bốn-Mười
  { hoangDao: ["Thân", "Dậu", "Sửu", "Mão"], hacDao: ["Dần", "Hợi", "Mùi", "Tỵ"] }, // Năm-Một(11)
  { hoangDao: ["Tuất", "Hợi", "Mão", "Tỵ"], hacDao: ["Thìn", "Sửu", "Mùi", "Dậu"] }, // Sáu-Chạp
];

export type NgayHoangHacTrangThai = "hoàng đạo" | "hắc đạo" | "không xác định";

/**
 * Xác định một ngày (Chi ngày) trong tháng âm lịch cho trước là Hoàng Đạo, Hắc Đạo, hay
 * "không xác định" (nằm trong 4 Chi mà bảng gốc không phân loại ở đây).
 *
 * @param lunarMonth Tháng âm lịch 1-12.
 * @param dayChiIndex Index Địa Chi của ngày (0-11, 0=Tý).
 */
export function getNgayHoangDaoHacDao(lunarMonth: number, dayChiIndex: number): NgayHoangHacTrangThai {
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Tháng âm lịch không hợp lệ: ${lunarMonth}`);
  }
  const nhom = BANG_HOANG_DAO_HAC_DAO_NGAY[(lunarMonth - 1) % 6]!;
  const chi = CHI[dayChiIndex];
  if (!chi) throw new Error(`dayChiIndex không hợp lệ: ${dayChiIndex}`);

  if (nhom.hoangDao.includes(chi)) return "hoàng đạo";
  if (nhom.hacDao.includes(chi)) return "hắc đạo";
  return "không xác định";
}
