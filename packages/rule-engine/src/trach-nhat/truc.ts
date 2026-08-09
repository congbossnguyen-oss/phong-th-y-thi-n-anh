/**
 * 12 Trực (Kiến Trừ Thập Nhị Khách / Thập Nhị Kiến Tinh).
 *
 * Nguồn: "Ngọc Hạp Thông Thư – Hứa Chân Quân" (bản OCR do chủ dự án cung cấp 2026-08-05),
 * mục "CÁCH TÍNH NGÀY TRỰC" (~tr.153):
 *
 *   "Sau Lập Xuân trực Kiến tại Dần. Sau [Kinh Trập tại] Mão. Sau Thanh Minh [tại] Thìn.
 *   Sau Lập Hạ [tại] Tỵ. Sau Mang Chủng [tại] Ngọ. Sau Tiểu Thử [tại] Mùi. Sau [Lập Thu tại]
 *   Thân. Sau Bạch Lộ [tại] Dậu. Sau Hàn Lộ [tại] Tuất. Sau Lập Đông [tại] Hợi. Sau [Đại
 *   Tuyết tại] Tý. Sau Tiểu Hàn [tại] Sửu."
 *   "Kiến - Trừ - Mãn - Bình - Định - Chấp - Phá - Nguy - Thành - Thu - Khai - Bế."
 *
 * Quan trọng: 12 mốc "Sau [Tiết] tại [Chi]" ở trên CHÍNH LÀ 12 "Tiết" (ranh giới tháng Kiến)
 * đã có sẵn ở `calendar-core` (`Calendar.monthBoundaryOrderIndex`, dùng cho trụ Tháng Bát
 * Tự) — không phải một hệ quy tắc tiết khí riêng, không suy đoán thêm. Trực Kiến luôn khởi
 * tại đúng Chi mà tháng Kiến (theo tiết khí) đang ở, rồi 11 Trực còn lại xoay vòng tuần tự
 * theo Chi ngày tăng dần.
 */

import { mod } from "../utils/math.js";

export const TRUC_NAMES = [
  "Kiến",
  "Trừ",
  "Mãn",
  "Bình",
  "Định",
  "Chấp",
  "Phá",
  "Nguy",
  "Thành",
  "Thu",
  "Khai",
  "Bế",
] as const;

export type TrucName = (typeof TRUC_NAMES)[number];

export interface TrucResult {
  index: number; // 0-11, 0 = Kiến
  name: TrucName;
}

/**
 * Tính Trực của một ngày.
 *
 * @param dayChiIndex Index Địa Chi của NGÀY (0-11, 0=Tý) — lấy từ `getGanzhiDay(jdn).chiIndex`
 *   của calendar-core.
 * @param monthOrderIndex Thứ tự tháng Kiến theo tiết khí (0=Dần, 1=Mão, ..., 11=Sửu) — lấy từ
 *   `Calendar.monthBoundaryOrderIndex(jdUT)` của calendar-core. ĐÂY LÀ THAM SỐ BẮT BUỘC PHẢI
 *   TÍNH TỪ TIẾT KHÍ, không phải suy ra từ số tháng âm lịch (âm lịch có thể lệch vài ngày so
 *   với ranh giới tiết khí thật, đặc biệt gần đầu/cuối tháng).
 */
export function getTruc(dayChiIndex: number, monthOrderIndex: number): TrucResult {
  // Chi mà trực Kiến khởi trong tháng này: Dần (index 2 trong CHI) + monthOrderIndex bước.
  const kienChiIndex = mod(2 + monthOrderIndex, 12);
  const index = mod(dayChiIndex - kienChiIndex, 12);
  return { index, name: TRUC_NAMES[index]! };
}
