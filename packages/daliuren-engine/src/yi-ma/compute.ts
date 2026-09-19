/**
 * 驛馬 (Yi Ma) — Phase 9C. Module TỐI THIỂU, CHỈ phần vị trí — KHÔNG kéo theo 十二天將/神煞
 * khác/interpretation (xem Phase 9C Mini-Preflight mục C). Dùng LÀM INPUT cho 返吟-vô-賊克
 * (three-transmissions/), KHÔNG dùng cho mục đích nào khác ở Checkpoint này.
 */
import type { Chi } from "../types/ganzhi.js";
import { YI_MA_TABLE } from "./table.js";
import { YI_MA_PROVENANCE } from "./provenance.js";
import { YiMaError } from "./errors.js";

export interface YiMaComputation {
  yiMa: Chi;
  provenanceId: string;
}

/** NO HIDDEN FALLBACK: Chi không hợp lệ (dữ liệu từ nguồn khác đã hỏng) ném lỗi tường minh — KHÔNG đoán. */
export function computeYiMa(chi: Chi): YiMaComputation {
  const yiMa = YI_MA_TABLE[chi];
  if (!yiMa) {
    throw new YiMaError("UNKNOWN_CHI", `Chi không hợp lệ khi tra 驛馬: "${chi}".`);
  }
  return { yiMa, provenanceId: YI_MA_PROVENANCE.id };
}
