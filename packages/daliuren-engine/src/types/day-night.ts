/**
 * DayNight (晝夜) — Algorithm Spec §3, nâng cấp CONFIDENCE B sau Phase 4 (xem
 * docs/daliuren/DA_LIU_REN_PROFILE_DECISIONS.md Phần C). Xác định theo CHI của giờ chiêm
 * (占時), ranh giới Mão(卯)-Dậu(酉) — KHÔNG theo giờ đồng hồ, KHÔNG theo mặt trời mọc/lặn thực.
 * Đây là MỘT cơ chế duy nhất chi phối cả (i) chọn nhánh Quý Nhân và (ii) hướng thuận/nghịch
 * 12 Thiên Tướng — xem `NobleSpirit`.
 */
export type DayOrNight = "day" | "night";

export interface DayNightDetermination {
  value: DayOrNight;
  /** Luôn 'occasion-hour-chi' ở v1 — xem `DayNightBoundaryMethod` trong profiles/types.ts. */
  method: "occasion-hour-chi";
}
