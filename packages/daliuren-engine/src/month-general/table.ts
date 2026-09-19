/**
 * Bảng 12 trung khí → Nguyệt Tướng — sao chép NGUYÊN VẸN từ
 * docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §2 (không tự đổi thứ tự/tên). Khóa bằng
 * `nameHan` của trung khí (đúng chuỗi calendar-core dùng ở `data/solarTerms.ts`) để tra cứu
 * trực tiếp từ `CalendarData.precedingMajorTerm`, KHÔNG dùng month-number heuristic (bị cấm
 * tường minh ở Phase 5B-2 mục 2 — thuật toán hiện tại yêu cầu ranh giới trung khí thật).
 */
import type { Chi } from "../types/ganzhi.js";
import type { MonthGeneralClassicalName } from "../types/month-general.js";

export interface MonthGeneralTableEntry {
  zhi: Chi;
  classicalName: MonthGeneralClassicalName;
}

/** Khóa = `nameHan` (chữ Hán) của trung khí VỪA QUA — đúng 12 trung khí, KHÔNG bao gồm 12 "tiết". */
export const MONTH_GENERAL_TABLE: Readonly<Record<string, MonthGeneralTableEntry>> = {
  雨水: { zhi: "Hợi", classicalName: "đăngMinh" }, // Vũ Thủy -> 登明
  春分: { zhi: "Tuất", classicalName: "hàKhôi" }, // Xuân Phân -> 河魁
  穀雨: { zhi: "Dậu", classicalName: "tùngKhôi" }, // Cốc Vũ -> 從魁
  小滿: { zhi: "Thân", classicalName: "truyềnTống" }, // Tiểu Mãn -> 傳送
  夏至: { zhi: "Mùi", classicalName: "tiểuCát" }, // Hạ Chí -> 小吉
  大暑: { zhi: "Ngọ", classicalName: "thắngQuang" }, // Đại Thử -> 勝光
  處暑: { zhi: "Tỵ", classicalName: "tháiẤt" }, // Xử Thử -> 太乙
  秋分: { zhi: "Thìn", classicalName: "thiênCương" }, // Thu Phân -> 天罡
  霜降: { zhi: "Mão", classicalName: "tháiXung" }, // Sương Giáng -> 太衝
  小雪: { zhi: "Dần", classicalName: "côngTào" }, // Tiểu Tuyết -> 功曹
  冬至: { zhi: "Sửu", classicalName: "đạiCát" }, // Đông Chí -> 大吉
  大寒: { zhi: "Tý", classicalName: "thầnHậu" }, // Đại Hàn -> 神后
};
