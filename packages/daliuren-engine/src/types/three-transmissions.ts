/**
 * NineMethods (九宗門 Cửu Tông Môn) + ThreeTransmissions (三傳 Tam Truyền) — Algorithm Spec §7.
 * CONFIDENCE B cho cấu trúc cascade (nâng sau Phase 2 — dispatch của repo C xác nhận là nguồn
 * độc lập thật, không cùng dòng A/F, xem docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md mục 3.7).
 * CONFIDENCE A cho cơ chế lặp Trung/Mạt truyền (toán học thuần, không tranh cãi).
 */
import type { Chi } from "./ganzhi.js";

/**
 * 9 pháp, đúng thứ tự ưu tiên cascade đã chốt (Algorithm Spec §7.1-7.2):
 * pre-check cấu trúc (fuyin, fanyin) → cascade (zeike ⊃ biyong ⊃ shehai → yaoke → maoxing → bieze → bazhuan).
 */
export type NineMethod =
  | "fuyin" // 伏吟 — CONFIDENCE A
  | "fanyin" // 返吟 — CONFIDENCE A
  | "zeike" // 賊克法 — CONFIDENCE A (thuộc cascade, không tranh cãi)
  | "biyong" // 比用法 — CONFIDENCE A
  | "shehai" // 涉害法 — CONFIDENCE B/C: ý nghĩa B, công thức lập có CONFLICTING SCHOOLS giữa 2 nguồn
  //           thứ cấp Phase 2 (2 khóa vs 3 khóa liên quan) — xem DA_LIU_REN_INTERPRETATION_GAPS.md mục 4
  | "yaoke" // 遙克法 — CONFIDENCE A cho điều kiện kích hoạt; 2 tiểu loại (蒿矢格/彈射格) PARTIAL, xem dưới
  | "maoxing" // 昴星法 — CONFIDENCE A
  | "bieze" // 別責法 — CONFIDENCE A cho điều kiện + ý nghĩa (Phase 2 report-2 xác nhận, trước đây chỉ có điều kiện)
  | "bazhuan"; // 八專法 — CONFIDENCE A, đúng 5 ngày cố định

/**
 * 2 tiểu loại của Diêu Khắc (蒿矢格/彈射格) — CONFIDENCE D, tên chính xác CHƯA xác minh đủ
 * (Algorithm Spec §7.2 mục 4). KHÔNG dùng để rẽ nhánh logic ở Checkpoint 1 — chỉ khai báo type
 * để Calendar Layer (tương lai) không phải đoán hình dạng, nhưng field liên quan phải optional
 * và ĐƯỢC PHÉP để trống cho đến khi có thêm nghiên cứu.
 */
export type YaoKeSubcase = "haoshi" | "danshe"; // ⚠️ CHƯA ĐỦ CƠ SỞ — xem ghi chú trên

export interface ThreeTransmissions {
  method: NineMethod;
  /**
   * Mô tả phụ (vd tên tiểu loại cụ thể: "元首", "自任卦"...) — CHỈ để hiển thị Expert Mode,
   * KHÔNG được Interpretation Engine dùng để suy luận logic (bài học từ repo C, xem
   * docs/daliuren/DA_LIU_REN_ARCHITECTURE.md §3 — mọi quyết định phải là enum có cấu trúc).
   */
  methodSubcase?: string;
  /** Chỉ có giá trị khi `method === 'yaoke'` — optional vì CONFIDENCE D, có thể chưa xác định được. */
  yaoKeSubcase?: YaoKeSubcase;
  initial: Chi; // 初傳
  middle: Chi; // 中傳
  final: Chi; // 末傳
}
