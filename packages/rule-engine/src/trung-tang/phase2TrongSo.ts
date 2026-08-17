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

// -------------------------------------------------------------------------------------------
// MỨC ĐỘ THẦN SÁT — LOẠI THẲNG hay TRỪ ĐIỂM
// -------------------------------------------------------------------------------------------

/**
 * Chủ dự án chốt 2026-08-17: "trừ điểm thì hay hơn... kể cả xét tọa hướng ok rồi, nếu thần sát
 * xấu vẫn phải cân nhắc, nếu được giờ hoàng đạo thì cực tốt".
 *
 * Lý do đổi: khi nối đủ mọi bộ lọc theo đúng đặc tả, đo được chỉ còn 1-8 trong 24 sơn có phương
 * án — phần lớn tang gia nhập tọa mộ vào là nhận màn hình "chưa thu phí". Không phải engine sai,
 * mà là chồng quá nhiều mức tuyệt đối lên nhau. Nay chỉ giữ tuyệt đối những gì chủ dự án đã nói
 * rõ là KHÔNG HOÁ GIẢI ĐƯỢC; phần còn lại hạ xuống trừ điểm và hiện cảnh báo để thầy cân nhắc.
 *
 * ⚠️ Danh sách LOẠI THẲNG dưới đây là thứ chủ dự án đã chốt bằng lời, không được tự ý nới:
 * "không hóa được nhé" (2026-08-16) cho Kim Thần Thất Sát / Thọ Tử / Sát Chủ / Trung Cung -
 * Bạch Hổ, cộng nhóm tuyệt đối riêng của tang sự.
 */
export const THAN_SAT_LOAI_THANG: readonly string[] = [
  "Kim Thần Thất Sát",
  "Thọ Tử",
  "Sát Chủ Âm",
  "Nguyệt Phá (Trực Phá)",
  "Đại Hao",
  "Trùng Nhật",
  "Phục Nhật",
  "Xung tuổi vong",
];

/**
 * Điểm trừ cho các mục nay chỉ CÂN NHẮC chứ không loại.
 *
 * ⚠️ MỌI mức trừ PHẢI lớn hơn điểm dương tối đa một phương án có thể đạt:
 *     7 chiều (30+22+16+12+9+6+5 = 100) + thưởng giờ hoàng đạo (40) = 140.
 *
 * Vì sao bắt buộc: phương án sạch phải LUÔN đứng trên phương án dính sát. Bản đầu đặt 50-120 và
 * đo thấy ngay hậu quả — phương án đứng số 1 lại mang ghi chú "chỉ 0 trụ hỗ trợ (tuyệt đối
 * tránh)", chỉ vì được giờ hoàng đạo nên điểm vượt lên. Gia đình đọc hồ sơ là lấy phương án số 1,
 * nên để một phương án có sát đứng đầu là nguy hiểm hơn hẳn việc nó bị xếp cuối.
 *
 * Sát nặng hơn thì trừ nhiều hơn, để khi buộc phải chọn trong đám có sát thì cái nhẹ vẫn nổi lên.
 */
export const DIEM_TRU_THAN_SAT: Readonly<Record<string, number>> = {
  "Tam Sát": 320,
  "Bát Sát": 300,
  "Ngũ Hoàng tháng": 260,
  "Tam Tài không giao": 220,
  "Thiếu trụ hỗ trợ": 200,
  "Sao 28 kỵ an táng": 180,
};

/** Trừ mặc định khi gặp tên lạ — vẫn phải nặng hơn mọi phần thưởng cộng lại (tối đa 140). */
export const DIEM_TRU_MAC_DINH = 200;

/**
 * Thưởng thêm khi phương án rơi đúng GIỜ HOÀNG ĐẠO — chủ dự án: "nếu được giờ hoàng đạo thì cực
 * tốt". Đặt cao hơn chiều nặng nhất (Nhật Khóa ↔ Tọa = 30) để nó thật sự kéo được thứ hạng, song
 * vẫn thấp hơn mọi mức trừ ở trên nên KHÔNG cứu nổi một phương án dính sát nặng.
 */
export const DIEM_THUONG_GIO_HOANG_DAO = 40;
