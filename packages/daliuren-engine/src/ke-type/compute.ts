/**
 * 課體 (Khóa Thể) — Phase 11-A1. `KePrimary.method` là ĐỒNG NHẤT (identity) với pháp Cửu Tông
 * Môn đã chọn (`ThreeTransmissions.method`) — "khóa thể chính = tên gọi khác của chính pháp Cửu
 * Tông Môn đã thắng", KHÔNG phải 1 FACT tính riêng (xem `types/ke-type.ts` header comment, đã
 * re-verify ở Phase 11-A Pre-Implementation Audit mục A1 câu 7). Hàm này CHỈ bọc lại giá trị đã
 * có — KHÔNG tính toán gì mới, KHÔNG có nhánh lỗi nào (method luôn hợp lệ vì đã qua
 * `computeThreeTransmissions`).
 *
 * Provenance: TÁI DÙNG NGUYÊN VẸN `threeTransmissionsInitialProvenanceId` (provenance của CHÍNH
 * pháp Cửu Tông Môn đã chọn) — KHÔNG tạo entry provenance mới (Pre-Implementation Audit mục A1
 * câu 4: "KHÔNG tạo provenance mới nếu không cần").
 *
 * `zeikeVariant` (元首/重審/知一) CỐ Ý để trống — CONFIDENCE C, 1 nguồn duy nhất, NGOÀI PHẠM VI
 * 11-A1 (xem docs/daliuren/DA_LIU_REN_PHASE_11_WORK_PACKAGE_AUDIT.md mục 11-A phần E).
 */
import type { NineMethod } from "../types/three-transmissions.js";
import type { KeType } from "../types/ke-type.js";

export interface KeTypeComputation {
  keType: KeType;
  /** → DaLiuRenCalculationProvenance.threeTransmissionsInitialProvenanceId của CHÍNH lá số này — không phải entry mới. */
  provenanceId: string;
}

export function computeKeType(method: NineMethod, threeTransmissionsInitialProvenanceId: string): KeTypeComputation {
  return {
    keType: { primary: { method }, secondary: [] },
    provenanceId: threeTransmissionsInitialProvenanceId,
  };
}
