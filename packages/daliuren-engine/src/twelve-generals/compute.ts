/**
 * 十二天將 (Thập Nhị Thiên Tướng) — Phase 9D. Thuật toán: Algorithm Spec §8. CHỈ vị trí
 * (Tầng FACT) — KHÔNG cát/hung, KHÔNG luận giải, KHÔNG 用神/課體 (xem
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_EVIDENCE.md mục 4 — "KHÔNG chấp nhận đơn giản hoá
 * '6 cát + 6 hung'" — việc đó thuộc RuleDefinition/Signal, ngoài phạm vi file này).
 *
 * Input = `HeavenEarthPlate` (đã dựng, Phase 9A) + `NobleSpiritComputation` (Quý Nhân đã
 * resolve theo Can Ngày + 晝/夜, Phase 5B-3) — KHÔNG tính lại Quý Nhân ở đây, CHỈ dùng
 * `nobleSpirit.zhi` làm điểm neo. Xem provenance.ts cho 1 phát hiện quan trọng: mã thực thi
 * của repo A (`d1210182010/daliuren-web-engine`) có khả năng cao chứa lỗi lập trình ở đúng
 * bước neo/đặt — package này CỐ Ý KHÔNG theo hành vi đó, dùng đúng công thức đã khoá + đã xác
 * minh riêng qua 2 audit độc lập (report-A viết lời + report-C, một codebase khác hoàn toàn).
 */
import type { Chi } from "../types/ganzhi.js";
import type { HeavenEarthPlate } from "../types/plates.js";
import type { TwelveGenerals, TwelveGeneralPlacement } from "../types/twelve-generals.js";
import type { NobleSpiritComputation } from "../noble-spirit/compute.js";
import { earthChiOfHeavenValue } from "../heaven-earth-plate/compute.js";
import { EARTH_PLATE } from "../heaven-earth-plate/table.js";
import { TWELVE_GENERAL_ORDER, THUAN_CHI, NGHICH_CHI } from "./table.js";
import { TWELVE_GENERALS_ORDER_PROVENANCE, TWELVE_GENERALS_ANCHOR_PROVENANCE, TWELVE_GENERALS_DIRECTION_PROVENANCE } from "./provenance.js";
import { TwelveGeneralsError } from "./errors.js";

export interface TwelveGeneralsComputation {
  twelveGenerals: TwelveGenerals;
  /** Vị trí Địa Bàn đặt 貴人 (= earthChiOfHeavenValue(nobleSpirit.zhi)). */
  anchor: Chi;
  /** → ProvenanceEntry.id (twelve-generals/provenance.ts) — công thức tính anchor, confidence A. */
  anchorProvenanceId: string;
  /** → ProvenanceEntry.id (twelve-generals/provenance.ts) — ranh giới thuận/nghịch, confidence B. */
  directionProvenanceId: string;
  /** → ProvenanceEntry.id (twelve-generals/provenance.ts) — thứ tự 12 tướng, confidence A. */
  orderProvenanceId: string;
  /**
   * → NobleSpiritComputation.dayNightAssignmentProvenanceId — QUAN TRỌNG, KHÔNG được che giấu:
   * anchor phụ thuộc TRỰC TIẾP vào Quý Nhân upstream, mà chiều 晝/夜 gán cho Can cụ thể CHỈ
   * confidence B cho riêng Giáp, D cho 9 Can còn lại (xem noble-spirit/provenance.ts). Kết quả
   * `twelveGenerals`/`anchor` của package này KHÔNG tự nâng confidence Quý Nhân upstream —
   * tầng gọi PHẢI tự tra provenance này nếu cần cảnh báo D cho 9/10 Can.
   */
  nobleSpiritDayNightAssignmentProvenanceId: string;
  /** → NobleSpiritComputation.pairProvenanceId — cặp vị trí Quý Nhân theo nhóm Can, confidence B, không đổi theo Can cụ thể. */
  nobleSpiritPairProvenanceId: string;
}

/** mod luôn không âm. */
function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/**
 * Dựng 十二天將 từ Thiên Địa Bàn + Quý Nhân đã resolve. NO HIDDEN FALLBACK: nếu
 * `nobleSpirit.nobleSpirit.zhi` không phải 1 trong 12 địa chi hợp lệ (dữ liệu từ nguồn khác đã
 * hỏng), ném lỗi tường minh qua `earthChiOfHeavenValue` (KHÔNG bị nuốt ở đây).
 */
export function computeTwelveGenerals(heavenEarthPlate: HeavenEarthPlate, nobleSpirit: NobleSpiritComputation): TwelveGeneralsComputation {
  const anchor = earthChiOfHeavenValue(heavenEarthPlate, nobleSpirit.nobleSpirit.zhi);
  const anchorIndex = EARTH_PLATE.indexOf(anchor);

  let direction: 1 | -1;
  if (THUAN_CHI.has(anchor)) {
    direction = 1;
  } else if (NGHICH_CHI.has(anchor)) {
    direction = -1;
  } else {
    // Không thể xảy ra: THUAN_CHI ∪ NGHICH_CHI = toàn bộ 12 Chi (xem table.ts) — tự vệ trước dữ liệu hỏng.
    throw new TwelveGeneralsError("UNKNOWN_CHI", `Vị trí anchor "${anchor}" không thuộc THUAN_CHI lẫn NGHICH_CHI — dữ liệu Chi không hợp lệ.`);
  }

  const placements: TwelveGeneralPlacement[] = TWELVE_GENERAL_ORDER.map((general, offset) => ({
    zhi: EARTH_PLATE[mod12(anchorIndex + direction * offset)]!,
    general,
  }));

  // Sắp lại theo thứ tự Địa Bàn Tý..Hợi (KHÔNG theo thứ tự đã đặt) để `twelveGenerals[i]` luôn tương ứng `EARTH_PLATE[i]` — nhất quán với các tuple 12-phần-tử khác trong engine (vd HeavenPlate).
  const byEarthPosition = [...placements].sort((a, b) => EARTH_PLATE.indexOf(a.zhi) - EARTH_PLATE.indexOf(b.zhi));

  return {
    twelveGenerals: byEarthPosition as unknown as TwelveGenerals,
    anchor,
    anchorProvenanceId: TWELVE_GENERALS_ANCHOR_PROVENANCE.id,
    directionProvenanceId: TWELVE_GENERALS_DIRECTION_PROVENANCE.id,
    orderProvenanceId: TWELVE_GENERALS_ORDER_PROVENANCE.id,
    nobleSpiritDayNightAssignmentProvenanceId: nobleSpirit.dayNightAssignmentProvenanceId,
    nobleSpiritPairProvenanceId: nobleSpirit.pairProvenanceId,
  };
}
