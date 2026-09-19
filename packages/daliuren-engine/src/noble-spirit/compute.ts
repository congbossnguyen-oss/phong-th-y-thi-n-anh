/**
 * 貴人 (Quý Nhân) — Phase 5B-3. TÁCH RÕ 2 bước theo đúng yêu cầu mục 6 (KHÔNG viết thành 1
 * function black box):
 *   (A) `computeGuiRenPair` — tra CẶP vị trí (晝/夜) theo Can Ngày + bảng ánh xạ đã chọn.
 *   (B) `resolveGuiRenForDayNight` — chọn 1 trong 2 vị trí của cặp, dựa vào 晝/夜 đã xác định
 *       RIÊNG (từ day-night/compute.ts) — KHÔNG tự tính lại 晝/夜 ở đây.
 * `computeNobleSpirit` chỉ là hàm COMPOSE 2 bước trên, không chứa logic riêng nào khác.
 */
import type { Can, Chi } from "../types/ganzhi.js";
import type { DayOrNight } from "../types/day-night.js";
import type { NobleSpirit } from "../types/noble-spirit.js";
import type { CalculationProfile } from "../profiles/types.js";
import { GUI_REN_TRADITIONAL_TABLE, type GuiRenPair } from "./table.js";
import { GUI_REN_PAIR_PROVENANCE, GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE } from "./provenance.js";
import { NobleSpiritError } from "./errors.js";

export interface GuiRenPairComputation {
  pair: GuiRenPair;
  /** → ProvenanceEntry.id — CẶP chi theo nhóm Can, CONFIDENCE B. */
  pairProvenanceId: string;
  /** → ProvenanceEntry.id — CHI NÀO trong cặp là ngày/đêm cho Can CỤ THỂ này, CONFIDENCE C (yếu hơn nhiều, xem provenance.ts). */
  dayNightAssignmentProvenanceId: string;
}

/**
 * (A) Tra cặp vị trí Quý Nhân (晝/夜) theo Can Ngày — KHÔNG cần biết lượt chiêm này là ngày
 * hay đêm (đó là bước (B) riêng). NO HIDDEN FALLBACK: bảng 'guopo-kangxi' CHƯA có giá trị nào
 * được xác minh trong nghiên cứu — ném lỗi tường minh thay vì tự suy đoán hoặc âm thầm dùng
 * bảng 'traditional' thay thế.
 */
export function computeGuiRenPair(dayCan: Can, profile: CalculationProfile): GuiRenPairComputation {
  const mappingTable = profile.guiRenMappingTable.value;

  if (mappingTable === "guopo-kangxi") {
    throw new NobleSpiritError(
      "UNSUPPORTED_MAPPING_TABLE",
      `Bảng Quý Nhân "guopo-kangxi" (phái Quách Phác/Khang Hy) CHƯA có giá trị Can→Chi nào được xác minh trong nghiên cứu (Phase 1-4) — không tự bịa bảng. Chỉ 'traditional' được implement.`,
    );
  }
  if (mappingTable !== "traditional") {
    const exhaustive: never = mappingTable;
    throw new NobleSpiritError(
      "UNSUPPORTED_MAPPING_TABLE",
      `Bảng ánh xạ Quý Nhân không được hỗ trợ: ${String(exhaustive)}.`,
    );
  }

  const pair = GUI_REN_TRADITIONAL_TABLE[dayCan];
  if (!pair) {
    throw new NobleSpiritError("UNKNOWN_DAY_CAN", `Can Ngày không hợp lệ: "${dayCan}" — không có trong bảng Quý Nhân 10 dòng.`);
  }

  return {
    pair,
    pairProvenanceId: GUI_REN_PAIR_PROVENANCE.id,
    dayNightAssignmentProvenanceId: GUIREN_DAYNIGHT_ASSIGNMENT_PROVENANCE.id,
  };
}

/** (B) Chọn 1 trong 2 vị trí của cặp — thuần selection, KHÔNG có bảng/nguồn riêng (nguồn nằm ở bước (A)). */
export function resolveGuiRenForDayNight(pair: GuiRenPair, dayOrNight: DayOrNight): Chi {
  return dayOrNight === "day" ? pair.day : pair.night;
}

export interface NobleSpiritComputation {
  nobleSpirit: NobleSpirit;
  pair: GuiRenPair;
  pairProvenanceId: string;
  dayNightAssignmentProvenanceId: string;
}

/** Compose (A) + (B) — không chứa logic tính toán nào khác ngoài 2 hàm trên. */
export function computeNobleSpirit(dayCan: Can, dayOrNight: DayOrNight, profile: CalculationProfile): NobleSpiritComputation {
  const { pair, pairProvenanceId, dayNightAssignmentProvenanceId } = computeGuiRenPair(dayCan, profile);
  const zhi = resolveGuiRenForDayNight(pair, dayOrNight);

  return {
    nobleSpirit: { zhi, mappingTable: profile.guiRenMappingTable.value },
    pair,
    pairProvenanceId,
    dayNightAssignmentProvenanceId,
  };
}
