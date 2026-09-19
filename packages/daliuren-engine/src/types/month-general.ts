/**
 * MonthGeneral (月將 Nguyệt Tướng) — Algorithm Spec §2. CONFIDENCE B (Validation Review +
 * Phase 2): bảng 12 tên cổ có nguồn, nhưng report-G ghi nhận 1 tranh luận học thuật thật về
 * cách lấy Nguyệt Tướng mà nghiên cứu chưa đọc được toàn văn — KHÔNG tự nhận "đã đồng thuận tuyệt đối".
 */
import type { Chi } from "./ganzhi.js";

/** 12 tên cổ của Nguyệt Tướng, đúng thứ tự đối ứng trung khí trong Algorithm Spec §2. */
export type MonthGeneralClassicalName =
  | "đăngMinh" // 登明, sau Vũ Thủy, tại Hợi
  | "hàKhôi" // 河魁, sau Xuân Phân, tại Tuất
  | "tùngKhôi" // 從魁, sau Cốc Vũ, tại Dậu
  | "truyềnTống" // 傳送, sau Tiểu Mãn, tại Thân
  | "tiểuCát" // 小吉, sau Hạ Chí, tại Mùi
  | "thắngQuang" // 勝光, sau Đại Thử, tại Ngọ
  | "tháiẤt" // 太乙, sau Xử Thử, tại Tị
  | "thiênCương" // 天罡, sau Thu Phân, tại Thìn
  | "tháiXung" // 太衝, sau Sương Giáng, tại Mão
  | "côngTào" // 功曹, sau Tiểu Tuyết, tại Dần
  | "đạiCát" // 大吉, sau Đông Chí, tại Sửu
  | "thầnHậu"; // 神后, sau Đại Hàn, tại Tý

export interface MonthGeneral {
  zhi: Chi;
  classicalName: MonthGeneralClassicalName;
}
