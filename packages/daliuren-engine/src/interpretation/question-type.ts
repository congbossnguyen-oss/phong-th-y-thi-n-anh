/**
 * QuestionType — 15 loại theo docs/daliuren/DA_LIU_REN_QUESTION_TYPES_RESEARCH.md +
 * docs/daliuren/DA_LIU_REN_QUESTION_TEST_SPEC.md. Trạng thái từng loại (READY/PARTIAL/
 * UNVERIFIED/DO_NOT_IMPLEMENT) được ghi ở `QUESTION_TYPE_STATUS` — KHÔNG được tự nâng cấp
 * PARTIAL lên READY khi implement Rule Registry (Phase 5A mục "QUY TẮC CUỐI").
 */
export type QuestionType =
  | "quan-chuc"
  | "hon-nhan"
  | "kien-tung"
  | "thi-cu"
  | "tim-do"
  | "suc-khoe"
  | "su-nghiep"
  | "tinh-cam"
  | "tai-chinh"
  | "kinh-doanh"
  | "bat-dong-san"
  | "mua-ban"
  | "hop-tac"
  | "xuat-hanh"
  | "nhan-su"
  | "khac";

export type QuestionTypeStatus = "READY" | "PARTIAL" | "UNVERIFIED" | "DO_NOT_IMPLEMENT";

/**
 * Trạng thái đã chốt sau Phase 4 Phần F (thiết kế test lộ ra 2 dependency conflict — xem
 * DA_LIU_REN_QUESTION_TEST_SPEC.md mục "Tổng kết"). Dùng để CHẶN Rule Registry đăng ký rule
 * cho loại đang DO_NOT_IMPLEMENT/UNVERIFIED — xem validation/rule-registry.ts.
 */
export const QUESTION_TYPE_STATUS: Readonly<Record<QuestionType, QuestionTypeStatus>> = {
  "quan-chuc": "READY",
  "hon-nhan": "READY",
  "tim-do": "READY",
  "kien-tung": "PARTIAL", // rule chính phụ thuộc 12 Trường Sinh (DO_NOT_IMPLEMENT) — chỉ 2 rule phụ dùng được
  "thi-cu": "PARTIAL", // rule chính phụ thuộc 帘幕貴人, công thức TÍNH chưa audit
  "suc-khoe": "PARTIAL", // cùng dependency conflict như kien-tung
  "tai-chinh": "PARTIAL",
  "kinh-doanh": "UNVERIFIED", // không có category cổ điển riêng biệt với 财/买卖 — chưa nghiên cứu chuyên biệt
  "bat-dong-san": "PARTIAL",
  "mua-ban": "PARTIAL",
  "hop-tac": "PARTIAL",
  "xuat-hanh": "PARTIAL",
  "nhan-su": "PARTIAL",
  "su-nghiep": "UNVERIFIED", // không tồn tại phạm trù cổ điển riêng
  "tinh-cam": "UNVERIFIED", // cổ thư không phân biệt với hôn nhân
  khac: "UNVERIFIED",
};
