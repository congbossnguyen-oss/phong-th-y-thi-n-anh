/**
 * PHASE 2 — FILE CẤU HÌNH TRỌNG SỐ (đặc tả mục 5, ràng buộc 2: "Trọng số nằm trong file cấu hình,
 * không hardcode — thứ tự là phần Công chốt, con số hiệu chỉnh sau 20-30 ca thật").
 *
 * Sửa số ở ĐÂY, không sửa rải rác trong logic xếp hạng. Thứ tự 7 chiều đã được chủ dự án duyệt và
 * KHÔNG được đổi khi hiệu chỉnh — chỉ được đổi độ lớn, và phải giữ nguyên thứ tự giảm dần.
 */

/** Bảy chiều đo ở Bước ③, xếp theo đúng thứ hạng chủ dự án chốt. */
export type ChieuDoPhase2 =
  | "nhat-khoa-toa"
  | "tru-ho-tro"
  | "nhat-khoa-menh-vong"
  | "dong-khi"
  | "sinh-khac-nhap"
  | "ngu-hanh"
  | "quai-van";

/** Thứ tự hạng 1→7. Test khoá thứ tự này, đổi là gãy test — cố ý. */
export const THU_TU_CHIEU_DO: readonly ChieuDoPhase2[] = [
  "nhat-khoa-toa",
  "tru-ho-tro",
  "nhat-khoa-menh-vong",
  "dong-khi",
  "sinh-khac-nhap",
  "ngu-hanh",
  "quai-van",
];

/** Trọng số đề xuất trong đặc tả mục 5. Đây là con số TẠM, chờ hiệu chỉnh sau 20-30 ca thật. */
export const TRONG_SO_AN_TANG: Readonly<Record<ChieuDoPhase2, number>> = {
  "nhat-khoa-toa": 30,
  "tru-ho-tro": 22,
  "nhat-khoa-menh-vong": 16,
  "dong-khi": 12,
  "sinh-khac-nhap": 9,
  "ngu-hanh": 6,
  "quai-van": 5,
};

/**
 * Hệ số 0-1 cho từng mức của mỗi chiều. Điểm một chiều = trọng số × hệ số mức.
 * Tách khỏi trọng số để khi hiệu chỉnh còn phân biệt được "chiều này quan trọng hơn" với "mức này
 * trong chiều đó tốt hơn mức kia".
 */

/** Chiều 1 — thang RIÊNG của Nhật Khóa ↔ Tọa (đặc tả mục 4 ghi rõ thang này KHÁC thang lớp ở ②). */
export const MUC_NHAT_KHOA_TOA = {
  "dong-quai-khi": 1,
  "hop-thap": 0.85,
  "ha-do": 0.7,
  "ngay-sinh-toa": 0.5,
  "ngay-khac-toa": 0.15,
  "khong-giao": 0,
} as const;
export type MucNhatKhoaToa = keyof typeof MUC_NHAT_KHOA_TOA;

/** Chiều 2 — số trụ hỗ trợ trụ Ngày. 0-1 trụ đã bị Bước ① loại nên không có mức cho nó. */
export const MUC_TRU_HO_TRO = { 3: 1, 2: 0.6 } as const;

/** Chiều 3 — quan hệ ngày với tuổi vong. Xung đã bị Bước ① loại. */
export const MUC_MENH_VONG = { "tam-hop": 1, "luc-hop": 0.75, "trung-tinh": 0.3 } as const;
export type MucMenhVong = keyof typeof MUC_MENH_VONG;

/** Chiều 7 — quan hệ Quái Vận. Cặp Hợp Thập 7-3 bị hạ mức vì nguồn ghi "hạn chế". */
export const MUC_QUAI_VAN = {
  dong_quai: 1,
  hop_thap: 0.85,
  hop_ngu: 0.6,
  ai_tinh_dien_dao: 0.45,
  hop_thap_7_3: 0.3,
  khong_giao: 0,
} as const;

/**
 * ⚠️ CHƯA CÀI — chờ chủ dự án cấp bảng.
 *
 * Đặc tả mục 4 chiều 7 có ghi "Thiên Y — áp theo Quái Vận (Công chốt, KHÔNG áp HKNH)" nhưng
 * `bang-du-lieu-hop-nhat.json` chưa có bảng Thiên Y theo Quái Vận. Thiên Y trong module Bát Trạch
 * (`cung-menh-bat-trach/duNienBatQuai.ts`) là Du Niên Bát Quái — KHÁC hệ, tuyệt đối không mượn
 * sang đây. Vì vậy chiều 7 hiện chỉ tính 4 quan hệ Quái Vận đã có bảng.
 */
export const THIEN_Y_QUAI_VAN_CHUA_CO_BANG = true;
