/**
 * BenMing (本命) / XingNian (行年) — Algorithm Spec §13. CONFIDENCE B cho cả 2 công thức.
 * Quy ước tuổi = 虛歲 (tuổi hư/mụ) — đã giải quyết gap ở Phase 2, xem
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_EVIDENCE.md mục 10d. Cần test cross-check công thức
 * modulo (repo D) vs date-probe (repo A) trước khi coi là CONFIDENCE A — xem Test Spec #17.
 */
import type { Can, Chi } from "./ganzhi.js";

export interface BenMing {
  can: Can;
  chi: Chi;
}

export interface XingNian {
  can: Can;
  chi: Chi;
  /** Tuổi HƯ (虛歲) tại thời điểm chiêm — KHÔNG PHẢI tuổi thực dương lịch. */
  ageXuSui: number;
}
