/**
 * ShenSha (神煞) — Algorithm Spec §10. Theo Implementation Gate + Phase 5A mục 15 (CẤM),
 * Checkpoint 1 CHỈ khai báo type cho 1 thần sát duy nhất: 驛馬 (Dịch Mã), CONFIDENCE B.
 * 天馬/河魁-叢魁/thần sát khác = DO_NOT_IMPLEMENT — KHÔNG thêm literal nào khác vào union này
 * cho đến khi có quyết định implementation mới.
 */
import type { Chi } from "./ganzhi.js";

/** Chỉ 1 giá trị hợp lệ ở Checkpoint 1 — xem docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md mục 2. */
export type ShenShaName = "yiMa";

export interface ShenShaPlacement {
  name: ShenShaName;
  zhi: Chi;
  /**
   * Có bị Không Vong án ngữ hay không (Phase 2: "馬空不能行" — CONFIDENCE B, xem
   * docs/daliuren/DA_LIU_REN_PROVENANCE.md Nút 10). Field CHỈ mô tả FACT (trùng vị trí Không
   * Vong hay không) — Ý NGHĨA "hữu danh vô thực" là việc của Tầng 2.
   */
  isVoid: boolean;
}
