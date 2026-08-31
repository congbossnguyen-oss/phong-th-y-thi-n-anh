/**
 * Ngũ Hành sinh/khắc dùng chung cho Dương Trạch. Bảng cố định, không có dị bản giữa các
 * trường phái — cùng cách xử lý với `nguHanhQuanHe.ts` của rule-engine (tái dùng để PHÂN LOẠI
 * quan hệ; 2 bảng SINH/KHAC ở đây chỉ để dựng câu "kích bằng.../tiết bằng..." theo đúng chữ
 * nguồn, xem `donThuoc()` trong `khai-mon/index.ts`).
 */
export type Hanh = "Mộc" | "Hỏa" | "Thổ" | "Kim" | "Thủy";

/** Ngũ hành mà `key` SINH ra. */
export const SINH: Record<Hanh, Hanh> = {
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
  Kim: "Thủy",
  Thủy: "Mộc",
};

/** Ngũ hành mà `key` KHẮC. */
export const KHAC: Record<Hanh, Hanh> = {
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
  Kim: "Mộc",
};

/** Ngũ hành SINH RA `key` (nghịch của SINH) — dùng để "kích cát bằng ME[hanh] hoặc hanh". */
export const ME: Record<Hanh, Hanh> = {
  Hỏa: "Mộc",
  Thổ: "Hỏa",
  Kim: "Thổ",
  Thủy: "Kim",
  Mộc: "Thủy",
};
