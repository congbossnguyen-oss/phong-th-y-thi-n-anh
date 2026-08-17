/**
 * CƯỚI HỎI — KHÍ VÃNG VONG (氣往亡), chỉ áp cho THÀNH HÔN / giá thú.
 *
 * Công thức do chủ dự án cấp 2026-08-17.
 *
 * ⚠️ KHÁC "Vãng Vong theo tháng" (往亡): sát này đếm theo TIẾT KHÍ, không theo tháng âm lịch.
 * Mỗi mùa gắn với đúng 3 tiết (12 "Tiết" 節, không dùng 12 "Trung Khí" 中氣), và ngày Khí Vãng
 * Vong là ngày thứ N kể từ ngày vào tiết đó.
 *
 * Quy luật rất gọn — bước nhảy chính là số của mùa:
 *     Xuân  bước 7  → Lập Xuân 7,  Kinh Trập 14, Thanh Minh 21
 *     Hạ    bước 8  → Lập Hạ   8,  Mang Chủng 16, Tiểu Thử 24
 *     Thu   bước 9  → Lập Thu  9,  Bạch Lộ   18, Hàn Lộ   27
 *     Đông  bước 10 → Lập Đông 10, Đại Tuyết 20, Tiểu Hàn 30
 *
 * Lớp này CỐ Ý thuần: chỉ nhận "tên tiết khí + đã sang ngày thứ mấy", không tự tính thiên văn.
 * Việc quy một ngày dương lịch về (tiết khí nào, ngày thứ mấy) là của tầng facade, nơi có sẵn
 * `getSolarTerms` tính bằng Newton-Raphson chứ không tra bảng.
 */

/** 12 Tiết (節) có Khí Vãng Vong, kèm số ngày đếm từ chính ngày vào tiết. */
export const KHI_VANG_VONG_THEO_TIET: Readonly<Record<string, number>> = {
  // Xuân — bước 7
  "Lập Xuân": 7,
  "Kinh Trập": 14,
  "Thanh Minh": 21,
  // Hạ — bước 8
  "Lập Hạ": 8,
  "Mang Chủng": 16,
  "Tiểu Thử": 24,
  // Thu — bước 9
  "Lập Thu": 9,
  "Bạch Lộ": 18,
  "Hàn Lộ": 27,
  // Đông — bước 10
  "Lập Đông": 10,
  "Đại Tuyết": 20,
  "Tiểu Hàn": 30,
};

/** Bước nhảy theo mùa — giữ lại để test khẳng định quy luật, không chỉ khớp từng con số rời. */
export const BUOC_THEO_MUA: Readonly<Record<"Xuân" | "Hạ" | "Thu" | "Đông", number>> = {
  Xuân: 7,
  Hạ: 8,
  Thu: 9,
  Đông: 10,
};

export interface KetQuaKhiVangVong {
  pham: boolean;
  /** Tên tiết khí đang chứa ngày xét; rỗng nếu tiết đó không có Khí Vãng Vong. */
  tietKhi: string;
  /** Ngày xét là ngày thứ mấy kể từ ngày vào tiết (ngày vào tiết tính là ngày 1). */
  ngayThu: number;
  lyDo: string;
}

/**
 * Xét Khí Vãng Vong.
 *
 * @param tenTietKhi Tên tiết khí (Tiết 節) đang chứa ngày cần xét — dùng đúng tên tiếng Việt của
 *                   `calendar-core` (vd "Lập Xuân", "Mang Chủng").
 * @param ngayThu    Ngày xét là ngày thứ mấy kể từ ngày vào tiết; ngày vào tiết là ngày 1.
 */
export function xetKhiVangVong(tenTietKhi: string, ngayThu: number): KetQuaKhiVangVong {
  const moc = KHI_VANG_VONG_THEO_TIET[tenTietKhi];
  if (moc === undefined) {
    // 12 Trung Khí không có Khí Vãng Vong — không phải lỗi, chỉ là không áp dụng.
    return { pham: false, tietKhi: tenTietKhi, ngayThu, lyDo: "" };
  }
  const pham = ngayThu === moc;
  return {
    pham,
    tietKhi: tenTietKhi,
    ngayThu,
    lyDo: pham ? `Ngày thứ ${moc} kể từ ${tenTietKhi} — phạm Khí Vãng Vong.` : "",
  };
}

/** Tiết khí này có Khí Vãng Vong hay không (12 Tiết có, 12 Trung Khí không). */
export function tietCoKhiVangVong(tenTietKhi: string): boolean {
  return KHI_VANG_VONG_THEO_TIET[tenTietKhi] !== undefined;
}
