/**
 * Output của `calculateDaLiuRenChartWithKeType` (Phase 11-A1) — SUPERSET ADDITIVE của
 * `DaLiuRenCalculationResult` (8-field freeze, KHÔNG bị sửa 1 ký tự nào — xem type gốc + Phase
 * 11-A Pre-Implementation Audit mục "Schema/API Impact"). Đúng nguyên tắc Phase 9E đã áp dụng
 * cho chính `DaLiuRenCalculationResult`: field mới CHƯA verify/implement không được thêm vào
 * type cũ bằng field rỗng — khi implement xong, tạo type MỚI thay thế/mở rộng.
 *
 * CHỈ thêm `keType` (課體, Phase 11-A1) — KHÔNG thêm `voidBranches`/`wangShuai`/`shenSha` (A2/A3/
 * A4, chưa implement ở phase này).
 */
import type { DaLiuRenCalculationResult, DaLiuRenCalculationProvenance } from "./da-liu-ren-calculation-result.js";
import type { KeType } from "./types/ke-type.js";

export interface DaLiuRenCalculationProvenanceWithKeType extends DaLiuRenCalculationProvenance {
  /** → CÙNG giá trị với `threeTransmissionsInitialProvenanceId` — 課體 là identity của pháp Cửu Tông Môn đã chọn, không có provenance riêng (xem `ke-type/compute.ts`). */
  keTypeProvenanceId: string;
}

export interface DaLiuRenChartWithKeType extends Omit<DaLiuRenCalculationResult, "provenance"> {
  keType: KeType;
  provenance: DaLiuRenCalculationProvenanceWithKeType;
}
