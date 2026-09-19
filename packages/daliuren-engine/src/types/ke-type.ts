/**
 * KeType (課體 Khóa Thể) — Algorithm Spec §9. CONFIDENCE B cho 10 loại chính (khớp mục lục
 * thật 《六壬大全》 qua shidianguji + Wikisource, Phase 2 xác nhận cả 10/10 đều có ý nghĩa
 * luận đoán — xem docs/daliuren/DA_LIU_REN_INTERPRETATION_EVIDENCE.md mục 3).
 *
 * `KePrimaryType` ứng 1-1 với `NineMethod` (three-transmissions.ts) VÌ khóa thể chính = tên
 * gọi khác của chính pháp Cửu Tông Môn đã thắng — KHÔNG phải 1 phân loại độc lập cần tính lại
 * (tránh trùng lặp nguồn sự thật). Riêng biến thể của `zeike` (元首/重審/知一) tách thành field
 * `zeikeVariant` optional, CONFIDENCE C (chỉ 1 nguồn — repo D, xem Validation Review dòng 11b).
 */
import type { NineMethod } from "./three-transmissions.js";

/** 3 biến thể của 賊克法 (Tặc Khắc) theo số khóa có khắc và hướng khắc. CONFIDENCE C — 1 nguồn duy nhất. */
export type ZeikeVariant = "yuanShou" | "zhongShen" | "zhiYi"; // 元首 / 重審 / 知一

export interface KePrimary {
  method: NineMethod;
  /** Chỉ có giá trị khi `method === 'zeike'`. CONFIDENCE C, có thể để trống nếu chưa xác định được. */
  zeikeVariant?: ZeikeVariant;
}

/**
 * Cách cục phụ (鑄印/軒蓋/連珠...) — CONFIDENCE D, ⚠️ CHƯA ĐỦ CƠ SỞ (Algorithm Spec §9).
 * Khai báo type để tương lai mở rộng không phá vỡ contract, nhưng mảng PHẢI rỗng ở Checkpoint 1
 * — không có logic nào được phép gán giá trị cho đến khi có 1 vòng audit riêng.
 */
export type KeSecondaryType = "zhuYin" | "lianZhu" | "sanQi" | "liuYi";

export interface KeType {
  primary: KePrimary;
  /** LUÔN rỗng ở phiên bản hiện tại — xem DO_NOT_IMPLEMENT, DA_LIU_REN_IMPLEMENTATION_GATE.md mục 3. */
  secondary: readonly KeSecondaryType[];
}
