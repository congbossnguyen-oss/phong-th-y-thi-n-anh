/**
 * Dữ liệu tĩnh Can Chi (Thiên Can - Địa Chi) và Lục Thập Hoa Giáp.
 * Đây là dữ liệu truyền thống cố định (không tính toán, không phụ thuộc năm),
 * dùng làm bảng tra cho calendar/ganzhi.ts.
 *
 * Quy ước index: mọi nơi trong engine dùng index 0-based bắt đầu từ Giáp (Can)
 * và Tý (Chi), để khớp với công thức `(x + offset) % 10` / `% 12` chuẩn thiên văn.
 */

/** 10 Thiên Can, index 0 = Giáp. */
export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;

/** 12 Địa Chi, index 0 = Tý. */
export const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;

export type Can = (typeof CAN)[number];
export type Chi = (typeof CHI)[number];

/** Tên con giáp tương ứng mỗi Địa Chi. */
export const CON_GIAP: Record<Chi, string> = {
  Tý: "Chuột",
  Sửu: "Trâu",
  Dần: "Hổ",
  Mão: "Mèo",
  Thìn: "Rồng",
  Tỵ: "Rắn",
  Ngọ: "Ngựa",
  Mùi: "Dê",
  Thân: "Khỉ",
  Dậu: "Gà",
  Tuất: "Chó",
  Hợi: "Lợn",
};

export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

/** Ngũ Hành của từng Thiên Can (theo thứ tự CAN). */
export const CAN_NGU_HANH: readonly NguHanh[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];

/** Âm/Dương của từng Thiên Can (theo thứ tự CAN). */
export const CAN_AM_DUONG: readonly ("Dương" | "Âm")[] = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"];

/** Ngũ Hành của từng Địa Chi (theo thứ tự CHI). */
export const CHI_NGU_HANH: readonly NguHanh[] = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];

/** Âm/Dương của từng Địa Chi (theo thứ tự CHI). */
export const CHI_AM_DUONG: readonly ("Dương" | "Âm")[] = [
  "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm",
];

/**
 * Tàng Can — các Can ẩn tàng trong mỗi Địa Chi (chính khí liệt kê trước, tạp khí sau).
 * Giá trị là index trong mảng CAN. Dùng cho Bát Tự (không thuộc phạm vi lịch thuần túy
 * nhưng đặt ở đây vì đây là dữ liệu Can Chi tĩnh dùng chung).
 */
export const TANG_CAN: readonly number[][] = [
  [9], // Tý: Quý
  [5, 9, 7], // Sửu: Kỷ, Quý, Tân
  [0, 2, 4], // Dần: Giáp, Bính, Mậu
  [1], // Mão: Ất
  [4, 1, 9], // Thìn: Mậu, Ất, Quý
  [2, 4, 6], // Tỵ: Bính, Mậu, Canh
  [3, 5], // Ngọ: Đinh, Kỷ
  [5, 3, 1], // Mùi: Kỷ, Đinh, Ất
  [6, 8, 4], // Thân: Canh, Nhâm, Mậu
  [7], // Dậu: Tân
  [4, 7, 3], // Tuất: Mậu, Tân, Đinh
  [8, 0], // Hợi: Nhâm, Giáp
];

/**
 * 30 cặp Nạp Âm Ngũ Hành theo đúng thứ tự chu kỳ 60 Can Chi
 * (2 năm/tháng/ngày liên tiếp trong chu kỳ 60 dùng chung 1 Nạp Âm).
 * index = floor(cycleIndex / 2), với cycleIndex là vị trí trong Lục Thập Hoa Giáp (0-59).
 */
export const NAP_AM: readonly { name: string; element: NguHanh }[] = [
  { name: "Hải Trung Kim", element: "Kim" },
  { name: "Lư Trung Hỏa", element: "Hỏa" },
  { name: "Đại Lâm Mộc", element: "Mộc" },
  { name: "Lộ Bàng Thổ", element: "Thổ" },
  { name: "Kiếm Phong Kim", element: "Kim" },
  { name: "Sơn Đầu Hỏa", element: "Hỏa" },
  { name: "Giản Hạ Thủy", element: "Thủy" },
  { name: "Thành Đầu Thổ", element: "Thổ" },
  { name: "Bạch Lạp Kim", element: "Kim" },
  { name: "Dương Liễu Mộc", element: "Mộc" },
  { name: "Tuyền Trung Thủy", element: "Thủy" },
  { name: "Ốc Thượng Thổ", element: "Thổ" },
  { name: "Tích Lịch Hỏa", element: "Hỏa" },
  { name: "Tùng Bách Mộc", element: "Mộc" },
  { name: "Trường Lưu Thủy", element: "Thủy" },
  { name: "Sa Trung Kim", element: "Kim" },
  { name: "Sơn Hạ Hỏa", element: "Hỏa" },
  { name: "Bình Địa Mộc", element: "Mộc" },
  { name: "Bích Thượng Thổ", element: "Thổ" },
  { name: "Kim Bạch Kim", element: "Kim" },
  { name: "Phú Đăng Hỏa", element: "Hỏa" },
  { name: "Thiên Hà Thủy", element: "Thủy" },
  { name: "Đại Trạch Thổ", element: "Thổ" },
  { name: "Thoa Xuyến Kim", element: "Kim" },
  { name: "Tang Đố Mộc", element: "Mộc" },
  { name: "Đại Khê Thủy", element: "Thủy" },
  { name: "Sa Trung Thổ", element: "Thổ" },
  { name: "Thiên Thượng Hỏa", element: "Hỏa" },
  { name: "Thạch Lựu Mộc", element: "Mộc" },
  { name: "Đại Hải Thủy", element: "Thủy" },
];

/** Tra Nạp Âm theo vị trí trong chu kỳ 60 Can Chi (0-59). */
export function napAmForCycleIndex(cycleIndex: number): { name: string; element: NguHanh } {
  const entry = NAP_AM[Math.floor(mod60(cycleIndex) / 2)];
  if (!entry) throw new Error(`cycleIndex không hợp lệ: ${cycleIndex}`);
  return entry;
}

function mod60(n: number): number {
  return ((n % 60) + 60) % 60;
}
