// QUÂN SƯ THIÊN ANH — Kiểu dữ liệu cho Thư Viện Câu Hỏi (Question Library).
//
// Người dùng KHÔNG bắt đầu bằng ô chat tự do — họ bắt đầu bằng "Anh đang quan tâm điều gì?",
// chọn 1 nhóm vấn đề, rồi chọn 1 câu hỏi cụ thể trong nhóm. Toàn bộ câu hỏi là DỮ LIỆU
// (xem questions.ts), UI chỉ đọc từ đây — không hard-code câu hỏi vào component.
//
// Kiến trúc gốc: docs/quan-su-thien-anh/ (Phase 1). Kinh Dịch (Lục Hào) là engine luận đoán chính
// và luôn chạy — vì vậy KHÔNG nằm trong `recommended_engines` (đó chỉ là các engine NGỮ CẢNH tùy chọn:
// Bát Tự / Tử Vi đưa sơ đồ vận trình, Trạch Nhật chọn ngày giờ).

/** Nhóm vấn đề (15 nhóm). Xem categories.ts để biết tiêu đề/thứ tự hiển thị. */
export type CategoryId =
  | "su-nghiep"
  | "kinh-doanh"
  | "tai-chinh"
  | "dau-tu"
  | "bat-dong-san"
  | "nha-cua" // Nhà cửa / Phong thủy — luận NHÀ qua Kinh Dịch (Lục Hào), KHÔNG dùng Bát Trạch/Huyền Không
  | "hop-tac"
  | "tinh-duyen-hon-nhan"
  | "thi-cu"
  | "thi-dau-canh-tranh"
  | "kien-tung-tranh-chap"
  | "suc-khoe"
  | "xuat-hanh"
  | "chon-ngay-gio"
  | "quyet-dinh";

/**
 * Engine NGỮ CẢNH tùy chọn (không gồm Kinh Dịch — Kinh Dịch là divination_method, luôn chạy).
 * - "bat-tu" / "tu-vi": chỉ đưa SƠ ĐỒ VẬN TRÌNH (đại vận/lưu niên tốt hay xấu), không luận chi tiết.
 * - "trach-nhat": chọn ngày giờ tốt (nhóm "chọn-ngay-gio"), tái dùng trachnhat-engine có sẵn.
 * KHÔNG có "ky-mon" / "phong-thuy" — quyết định phạm vi của Thầy (không dùng trong app này).
 */
export type EngineRef = "bat-tu" | "tu-vi" | "trach-nhat";

/** Phương pháp luận đoán chính của câu hỏi. */
export type DivinationMethod =
  | "luc-hao" // gieo quẻ Kinh Dịch (Lục Hào) — engine chính, dùng cho hầu hết câu hỏi
  | "trach-nhat"; // chọn ngày giờ deterministic (nhóm "chọn-ngay-gio"), không gieo quẻ

/** Dạng kết quả trả cho người dùng. */
export type OutputType =
  | "luan-giai" // bài luận Mở bài / Thân bài / Kết luận (mặc định)
  | "chon-thoi-diem" // danh sách ngày/giờ tốt được xếp hạng (nhóm chọn ngày giờ)
  | "so-sanh-phuong-an"; // so sánh 2-3 phương án (nhóm quyết định, chọn A/B/C...)

/**
 * Tầng gói của câu hỏi — CHỈ 2 tầng, khớp đúng 2 gói thuê bao (Cơ bản / Cao cấp).
 *
 * Nguyên tắc phân tầng (theo PHASE_QUESTION_LIBRARY, Thầy chốt 2026-08-23) — phân theo DẠNG LUẬN,
 * không phân theo chủ đề hay mức rủi ro (rủi ro đã có `safety_level` lo riêng):
 *
 * - "co-ban"  → "Hỏi một việc — nhận một lời khuyên": một câu hỏi đóng ("Có nên… không?"),
 *               gieo một quẻ, ra một kết luận NÊN / KHÔNG NÊN / NÊN CHỜ / CÓ ĐIỀU KIỆN.
 * - "cao-cap" → "Đưa vấn đề — Quân Sư phân tích cùng anh/chị": so sánh nhiều phương án, hoặc câu
 *               hỏi mở cần phân tích sâu (chẩn đoán "điều gì đang cản trở", chiến lược "nên thế
 *               nào", thời điểm "khi nào nên"). Cần nhiều quẻ hoặc nhiều lớp dữ liệu hơn.
 */
export type PricingTier = "co-ban" | "cao-cap";

/**
 * Mức nhạy cảm — quyết định tầng cảnh báo an toàn bắt buộc (xem QUESTION_SCHEMA.md mục 8).
 * - "cao": Sức khỏe, Kiện tụng — bắt buộc cảnh báo không thay thế bác sĩ / luật sư.
 * - "nhay-cam": Tài chính, Đầu tư — không cam kết lợi nhuận, không thay tư vấn tài chính.
 * - "thuong": còn lại.
 */
export type SafetyLevel = "thuong" | "nhay-cam" | "cao";

/** Kiểu ô nhập liệu. */
export type InputType =
  | "text"
  | "date"
  | "time"
  | "select"
  | "number"
  | "date-range"
  | "gieo-que" // bước gieo quẻ Kinh Dịch (không phải ô nhập thường)
  | "phuong-an-list"; // danh sách phương án người dùng tự nhập (nhóm quyết định)

export interface InputField {
  key: string;
  label: string;
  type: InputType;
  required: boolean;
  helpText?: string;
  /** Chỉ dùng cho type "select". */
  options?: string[];
}

/**
 * Một câu hỏi trong Thư Viện. Đây là DỮ LIỆU thuần — UI đọc từ đây, không hard-code.
 * (Phase 1 gọi field engine là `required_engines`; Phase 2 đổi tên thành `recommended_engines`
 * cho đúng bản chất "engine ngữ cảnh tùy chọn, chỉ dùng khi phù hợp" — routing không đổi.)
 */
export interface QuestionDefinition {
  question_id: string; // slug duy nhất toàn hệ thống, vd "chuyen-viec"
  category: CategoryId;
  title: string; // câu hỏi hiển thị, giọng đời thường
  subtitle: string; // 1 câu mô tả ngắn, giọng "quân sư đồng hành", không thuật ngữ
  required_inputs: InputField[]; // bắt buộc mới chạy được
  optional_inputs: InputField[]; // có thì dùng, không có thì bỏ qua (không suy đoán)
  recommended_engines: EngineRef[]; // engine ngữ cảnh nên gọi (Kinh Dịch luôn chạy, không liệt kê ở đây)
  divination_method: DivinationMethod;
  output_type: OutputType;
  pricing_tier: PricingTier;
  safety_level: SafetyLevel;
}

export interface CategoryDefinition {
  id: CategoryId;
  title: string; // tên nhóm hiển thị
  icon: string; // emoji cho thẻ chọn nhóm
  subtitle: string; // 1 câu mô tả nhóm
  order: number; // thứ tự hiển thị
  /** Cảnh báo bắt buộc hiện ở đầu nhóm (vd Sức khỏe). Rỗng nếu không cần. */
  notice?: string;
}
