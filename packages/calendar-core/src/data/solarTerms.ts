/**
 * Dữ liệu tĩnh 24 Tiết Khí (Solar Terms): tên và kinh độ mặt trời biểu kiến (apparent
 * solar longitude, độ) mà tại đó tiết khí xảy ra. Đây KHÔNG phải bảng tra ngày theo năm
 * (điều mà đề bài cấm) — chỉ là định nghĩa "tiết khí X xảy ra khi mặt trời ở kinh độ Y",
 * một hằng số hình học không đổi qua các năm. Ngày/giờ cụ thể của từng tiết khí trong một
 * năm cho trước được TÍNH bằng thuật toán ở calendar/solarTerms.ts (Newton-Raphson trên
 * astronomy/solar.ts), không tra bảng.
 *
 * 12 "Tiết" (節, chỉ số lẻ trong mảng, bắt đầu chu kỳ tháng) và 12 "Trung Khí" (中氣, chỉ
 * số chẵn) xen kẽ nhau cách nhau 15°. "Trung Khí" là các mốc dùng để xác định tháng nhuận
 * âm lịch (xem calendar/lunarCalendar.ts) và để đặt tên tháng Kiến (Dần, Mão, ...).
 */

export type SolarTermKind = "tiet" | "trungKhi";

export interface SolarTermDefinition {
  /** Index 0-23 theo thứ tự kinh độ tăng dần bắt đầu từ Xuân Phân (0°). */
  index: number;
  /** Tên tiếng Việt. */
  name: string;
  /** Tên Hán Việt/chữ Hán tham khảo. */
  nameHan: string;
  /** Kinh độ mặt trời biểu kiến (độ, 0-345, bước 15°) tại đó tiết khí này xảy ra. */
  longitude: number;
  /** "tiet" = Tiết (đầu tháng Kiến) | "trungKhi" = Trung Khí (giữa tháng, quyết định tháng nhuận). */
  kind: SolarTermKind;
}

/**
 * 24 tiết khí, sắp theo kinh độ mặt trời tăng dần bắt đầu từ Xuân Phân (0°).
 * Đây là thứ tự thiên văn chuẩn; thứ tự xuất hiện trong một năm dương lịch cụ thể
 * (thường bắt đầu bằng Tiểu Hàn/Đại Hàn vào tháng 1) do calendar/solarTerms.ts sắp lại.
 */
export const SOLAR_TERMS: readonly SolarTermDefinition[] = [
  { index: 0, name: "Xuân Phân", nameHan: "春分", longitude: 0, kind: "trungKhi" },
  { index: 1, name: "Thanh Minh", nameHan: "清明", longitude: 15, kind: "tiet" },
  { index: 2, name: "Cốc Vũ", nameHan: "穀雨", longitude: 30, kind: "trungKhi" },
  { index: 3, name: "Lập Hạ", nameHan: "立夏", longitude: 45, kind: "tiet" },
  { index: 4, name: "Tiểu Mãn", nameHan: "小滿", longitude: 60, kind: "trungKhi" },
  { index: 5, name: "Mang Chủng", nameHan: "芒種", longitude: 75, kind: "tiet" },
  { index: 6, name: "Hạ Chí", nameHan: "夏至", longitude: 90, kind: "trungKhi" },
  { index: 7, name: "Tiểu Thử", nameHan: "小暑", longitude: 105, kind: "tiet" },
  { index: 8, name: "Đại Thử", nameHan: "大暑", longitude: 120, kind: "trungKhi" },
  { index: 9, name: "Lập Thu", nameHan: "立秋", longitude: 135, kind: "tiet" },
  { index: 10, name: "Xử Thử", nameHan: "處暑", longitude: 150, kind: "trungKhi" },
  { index: 11, name: "Bạch Lộ", nameHan: "白露", longitude: 165, kind: "tiet" },
  { index: 12, name: "Thu Phân", nameHan: "秋分", longitude: 180, kind: "trungKhi" },
  { index: 13, name: "Hàn Lộ", nameHan: "寒露", longitude: 195, kind: "tiet" },
  { index: 14, name: "Sương Giáng", nameHan: "霜降", longitude: 210, kind: "trungKhi" },
  { index: 15, name: "Lập Đông", nameHan: "立冬", longitude: 225, kind: "tiet" },
  { index: 16, name: "Tiểu Tuyết", nameHan: "小雪", longitude: 240, kind: "trungKhi" },
  { index: 17, name: "Đại Tuyết", nameHan: "大雪", longitude: 255, kind: "tiet" },
  { index: 18, name: "Đông Chí", nameHan: "冬至", longitude: 270, kind: "trungKhi" },
  { index: 19, name: "Tiểu Hàn", nameHan: "小寒", longitude: 285, kind: "tiet" },
  { index: 20, name: "Đại Hàn", nameHan: "大寒", longitude: 300, kind: "trungKhi" },
  { index: 21, name: "Lập Xuân", nameHan: "立春", longitude: 315, kind: "tiet" },
  { index: 22, name: "Vũ Thủy", nameHan: "雨水", longitude: 330, kind: "trungKhi" },
  { index: 23, name: "Kinh Trập", nameHan: "驚蟄", longitude: 345, kind: "tiet" },
];

/**
 * 12 "Tiết" theo thứ tự bắt đầu năm Kiến Dần (Lập Xuân mở đầu), dùng để xác định
 * tháng Chi trong Tứ Trụ (Bát Tự): monthOrderIndex 0 = Dần (bắt đầu từ Lập Xuân),
 * 1 = Mão (Kinh Trập), ..., 11 = Sửu (Tiểu Hàn).
 * Đây chính là 12 phần tử có kind === "tiet" trong SOLAR_TERMS, sắp lại theo vòng năm.
 */
export const MONTH_BOUNDARY_TERMS: readonly SolarTermDefinition[] = [
  SOLAR_TERMS[21]!, // Lập Xuân   -> Dần
  SOLAR_TERMS[23]!, // Kinh Trập  -> Mão
  SOLAR_TERMS[1]!, // Thanh Minh -> Thìn
  SOLAR_TERMS[3]!, // Lập Hạ     -> Tỵ
  SOLAR_TERMS[5]!, // Mang Chủng -> Ngọ
  SOLAR_TERMS[7]!, // Tiểu Thử   -> Mùi
  SOLAR_TERMS[9]!, // Lập Thu    -> Thân
  SOLAR_TERMS[11]!, // Bạch Lộ    -> Dậu
  SOLAR_TERMS[13]!, // Hàn Lộ     -> Tuất
  SOLAR_TERMS[15]!, // Lập Đông   -> Hợi
  SOLAR_TERMS[17]!, // Đại Tuyết  -> Tý
  SOLAR_TERMS[19]!, // Tiểu Hàn   -> Sửu
];
