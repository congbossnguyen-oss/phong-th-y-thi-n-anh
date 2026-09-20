/**
 * 空亡 CORE — 旬空/日旬空 (Phase 11-A2, Decision A). CHỈ phần LÕI: 1 cặp Void Branches tính từ
 * chu kỳ 60 Can-Chi của Ngày + membership theo vị trí Tam Truyền — TUYỆT ĐỐI KHÔNG bao gồm
 * 孤辰/寡宿 (DEFERRED, xem docs/daliuren/DA_LIU_REN_PHASE_11A2_DECISION_RECORD.md Decision B —
 * 3 cách đọc cổ văn không thống nhất, chưa có quyết định).
 *
 * Công thức (Algorithm Spec §10b "Cách tính", CONFIDENCE B): trong 1 tuần Giáp (10 cycleIndex liên
 * tiếp, `Math.floor(cycleIndex/10)`), 10 Thiên Can phối hết 10/12 Địa Chi liên tiếp bắt đầu từ
 * `decadeStartChiIndex = (tuần*10) mod 12` — 2 Chi CÒN LẠI (offset +10, +11 mod 12 so với
 * `decadeStartChiIndex`) là Không Vong của tuần đó. BẮT BUỘC dùng `cycleIndex` của trụ NGÀY, KHÔNG
 * phải Giờ/Tháng/Năm (Pre-Implementation Audit A2 mục 7).
 *
 * Thứ tự trong `pair`: theo offset tăng dần (+10 rồi +11) — đây là quy ước TRIỂN KHAI để đảm bảo
 * deterministic, KHÔNG phải 1 khẳng định thứ tự có ý nghĩa cổ văn riêng (evidence hiện có không
 * xác nhận thứ tự có ý nghĩa).
 */
import { Data } from "@thien-anh/calendar-core";
import type { Chi } from "../types/ganzhi.js";
import type { ThreeTransmissions } from "../types/three-transmissions.js";
import type { VoidBranches } from "../types/void-branches.js";
import { VOID_BRANCHES_PROVENANCE } from "./provenance.js";
import { VoidBranchesError } from "./errors.js";

export interface VoidBranchesComputation {
  voidBranches: VoidBranches;
  provenanceId: string;
}

function voidPairOf(dayCycleIndex: number): readonly [Chi, Chi] {
  if (!Number.isInteger(dayCycleIndex) || dayCycleIndex < 0 || dayCycleIndex > 59) {
    throw new VoidBranchesError("INVALID_CYCLE_INDEX", `cycleIndex phải là số nguyên 0-59, nhận: ${dayCycleIndex}.`);
  }

  const decadeStartChiIndex = (Math.floor(dayCycleIndex / 10) * 10) % 12;
  const voidChiIndex1 = (decadeStartChiIndex + 10) % 12;
  const voidChiIndex2 = (decadeStartChiIndex + 11) % 12;
  return [Data.CHI[voidChiIndex1]!, Data.CHI[voidChiIndex2]!];
}

/** `dayCycleIndex`: `calendar.dayPillar.cycleIndex` (0-59) — BẮT BUỘC trụ NGÀY, KHÔNG trụ khác. */
export function computeVoidBranches(dayCycleIndex: number, transmissions: Pick<ThreeTransmissions, "initial" | "middle" | "final">): VoidBranchesComputation {
  const pair = voidPairOf(dayCycleIndex);
  const isVoid = (chi: Chi): boolean => chi === pair[0] || chi === pair[1];

  return {
    voidBranches: {
      pair,
      affects: {
        initial: isVoid(transmissions.initial),
        middle: isVoid(transmissions.middle),
        final: isVoid(transmissions.final),
      },
    },
    provenanceId: VOID_BRANCHES_PROVENANCE.id,
  };
}
