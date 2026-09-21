/**
 * 神煞 — 驛馬 (Yi Ma) placement (Phase 11-A4). Composition/adaptation layer THUẦN — KHÔNG duplicate
 * bảng tra 驛馬 (gọi lại `computeYiMa()` nguyên vẹn, KHÔNG sửa `src/yi-ma/`), CHỈ lắp ráp thêm
 * `isVoid` (membership với A2 Core `voidBranches.pair`) để khớp shape đích `ShenShaPlacement`
 * (`types/shen-sha.ts`, đã đóng băng từ Checkpoint 1).
 *
 * Source branch (CURRENT OPERATIONAL CONTRACT, xem Pre-Implementation Audit A4 mục 3 C1): Chi
 * NGÀY — khớp ĐÚNG contract đang vận hành thật trong `nine-methods/compute.ts` dòng 343
 * (`computeYiMa(fourLessons.lesson3.lower)`, mà `four-lessons/compute.ts` xác nhận
 * `lesson3.lower = dayChi`). C1 Ngày-vs-Năm VẪN LÀ documented gap (六壬大全 có ghi nhận khả năng
 * dùng Chi Năm "tuỳ ngữ cảnh", xem DA_LIU_REN_PROVENANCE.md Nút 9) — KHÔNG được coi là "đã chứng
 * minh tuyệt đối theo mọi trường phái cổ điển", CHỈ là contract HIỆN HÀNH đang dùng. KHÔNG tự
 * research lại/tự chọn yearChi/monthChi/hourChi, KHÔNG thêm fallback tự động, KHÔNG thêm tham số
 * `sourceType`.
 *
 * `isVoid = voidBranches.pair.includes(zhi)` — CHỈ membership boolean thuần (Tầng 1 FACT), KHÔNG
 * gán ý nghĩa luận giải "hữu danh vô thực" (Tầng 2, xem DA_LIU_REN_PROVENANCE.md Nút 10, ngoài
 * phạm vi module này). KHÔNG dùng 孤辰/寡宿 (vẫn DEFERRED), KHÔNG dùng Không Vong theo Giờ, KHÔNG
 * xét Tam Truyền (`voidBranches.affects` không liên quan — Yi Ma là 1 Chi đơn, không phải vị trí
 * Tam Truyền).
 *
 * Provenance: TÁI DÙNG NGUYÊN VẸN `YI_MA_PROVENANCE.id` (cho `zhi`) + provenance id của
 * `voidBranches` do CALLER truyền vào (cho `isVoid`) — KHÔNG tạo entry mới, vì `isVoid` là suy
 * luận logic tất yếu (set membership) từ 2 nguồn đã có, không phải 1 khẳng định cổ văn mới (đúng
 * nguyên tắc đã chốt ở A1 Decision Record: không tạo provenance chỉ để "có provenance").
 */
import type { Chi } from "../types/ganzhi.js";
import type { ShenShaPlacement } from "../types/shen-sha.js";
import type { VoidBranches } from "../types/void-branches.js";
import { computeYiMa } from "../yi-ma/compute.js";
import { YI_MA_PROVENANCE } from "../yi-ma/provenance.js";

export interface YiMaPlacementComputation {
  placement: ShenShaPlacement;
  /** → `YI_MA_PROVENANCE.id` — chứng minh giá trị `zhi`. */
  zhiProvenanceId: string;
  /** → id `voidBranches` do caller truyền vào (pass-through từ A2's `computeVoidBranches()`) — chứng minh `isVoid`. */
  voidBranchesProvenanceId: string;
}

/**
 * `dayChi`: `calendar.dayPillar.chi` — BẮT BUỘC Chi NGÀY (contract hiện hành, xem module docstring).
 * `voidBranches`: kết quả ĐÃ TÍNH từ A2's `computeVoidBranches()` — hàm này KHÔNG tự gọi lại A2.
 * `voidBranchesProvenanceId`: id đã nhận được từ chính lần gọi A2 đó (pass-through, không tạo mới).
 */
export function computeYiMaPlacement(dayChi: Chi, voidBranches: VoidBranches, voidBranchesProvenanceId: string): YiMaPlacementComputation {
  const { yiMa } = computeYiMa(dayChi);
  const isVoid = voidBranches.pair.includes(yiMa);

  return {
    placement: { name: "yiMa", zhi: yiMa, isVoid },
    zhiProvenanceId: YI_MA_PROVENANCE.id,
    voidBranchesProvenanceId,
  };
}
