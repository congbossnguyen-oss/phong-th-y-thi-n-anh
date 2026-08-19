// Các bảng số cố định trích từ SPEC_cho_Claude_Code.md mục 5 (vùng V60:X66 của sheet KỲ MÔN).
// Copy nguyên si theo tài liệu — không tự chế thêm.

/** Bảng B — số can dương (AH49:AI58). CHỈ dùng cho X65 (Trực Phù lạc cung). */
export const CAN_DUONG: Record<string, number> = {
  Mậu: 1,
  Kỷ: 2,
  Canh: 3,
  Tân: 4,
  Nhâm: 5,
  Quý: 6,
  Đinh: 7,
  Bính: 8,
  Ất: 9,
  Giáp: 10,
};

/** Bảng B — số can âm (AH61:AI70). CHỈ dùng cho X65 (Trực Phù lạc cung). */
export const CAN_AM: Record<string, number> = {
  Giáp: 10,
  Ất: 9,
  Bính: 8,
  Đinh: 7,
  Mậu: 6,
  Kỷ: 5,
  Canh: 4,
  Tân: 3,
  Nhâm: 2,
  Quý: 1,
};

/** Bảng A — số can, thứ tự CHUẨN Giáp=1...Quý=10, CỐ ĐỊNH (không đổi theo âm/dương độn — đã
 * xác nhận với Công: Bảng A chỉ có 1 chiều, khác Bảng B vốn có cặp dương/âm riêng). Dùng cho
 * W63 (đầu vào Y63) — KHÔNG dùng Bảng B ở đây (Bảng B chỉ dành cho X65). */
export const CAN_A_DUONG: Record<string, number> = {
  Giáp: 1,
  Ất: 2,
  Bính: 3,
  Đinh: 4,
  Mậu: 5,
  Kỷ: 6,
  Canh: 7,
  Tân: 8,
  Nhâm: 9,
  Quý: 10,
};

/** Bảng số chi (AB49:AC60). */
export const CHI_SO: Record<string, number> = {
  Tý: 1,
  Sửu: 2,
  Dần: 3,
  Mão: 4,
  Thìn: 5,
  Tỵ: 6,
  Ngọ: 7,
  Mùi: 8,
  Thân: 9,
  Dậu: 10,
  Tuất: 11,
  Hợi: 12,
};

/** 12 địa chi theo thứ tự tuần hoàn — dùng để suy chi Không Vong thứ 2 (liền sau tuankhong_chi). */
export const CHI_LIST = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
] as const;

/** Tên hướng theo số cung Lạc Thư (1=Khảm...9=Ly), dùng xuyên suốt km_core_tables.json. */
export const HUONG_BY_CUNG: Record<number, string> = {
  1: "Khảm (Bắc)",
  2: "Khôn (Tây Nam)",
  3: "Chấn (Đông)",
  4: "Tốn (Đông Nam)",
  5: "Trung cung",
  6: "Càn (Tây Bắc)",
  7: "Đoài (Tây)",
  8: "Cấn (Đông Bắc)",
  9: "Ly (Nam)",
};

/** Địa chi cố định gắn với mỗi cung (bát quái phối 12 chi, 4 cung góc giữ 2 chi). */
export const CHI_CUNG: Record<number, string[]> = {
  1: ["Tý"],
  2: ["Mùi", "Thân"],
  3: ["Mão"],
  4: ["Thìn", "Tỵ"],
  5: [],
  6: ["Tuất", "Hợi"],
  7: ["Dậu"],
  8: ["Sửu", "Dần"],
  9: ["Ngọ"],
};

/** Tam hợp cục dùng để suy Mã (Dịch Mã) từ chi giờ — quy tắc cổ truyền phổ thông. */
export const MA_BY_TAM_HOP: Record<string, string> = {
  Thân: "Dần",
  Tý: "Dần",
  Thìn: "Dần",
  Dần: "Thân",
  Ngọ: "Thân",
  Tuất: "Thân",
  Tỵ: "Hợi",
  Dậu: "Hợi",
  Sửu: "Hợi",
  Hợi: "Tỵ",
  Mão: "Tỵ",
  Mùi: "Tỵ",
};

/** MOD kiểu Excel: kết quả luôn nằm trong [1, m] (0 → m), khớp quy ước "(nếu kết quả = 0 thì lấy = 9)". */
export function modWrap(x: number, m: number): number {
  let r = x % m;
  if (r <= 0) r += m;
  return r;
}
