/**
 * Ranh giới 晝/夜 (Algorithm Spec §3, NÂNG confidence B sau Phase 4 — xem
 * docs/daliuren/DA_LIU_REN_PROFILE_DECISIONS.md Phần C): theo CHI của giờ chiêm (占時),
 * ranh giới Mão(卯)–Dậu(酉) — KHÔNG theo giờ đồng hồ, KHÔNG theo mặt trời mọc/lặn thực (2
 * phương pháp này đã bị Phase 4 bác bỏ trực tiếp, xem report-C-nightday.md RULE 6/RULE 7).
 */
import type { Chi } from "../types/ganzhi.js";
import type { DayOrNight } from "../types/day-night.js";

/** Mão→Thân (6 chi) = 晝 (ban ngày). */
export const DAY_HOUR_CHI: ReadonlySet<Chi> = new Set<Chi>(["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"]);

/** Dậu→Dần (6 chi) = 夜 (ban đêm). */
export const NIGHT_HOUR_CHI: ReadonlySet<Chi> = new Set<Chi>(["Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần"]);

/** Tra cứu trực tiếp — trả `undefined` nếu chi không hợp lệ (KHÔNG throw ở đây, để tầng gọi tự quyết định cách báo lỗi). */
export function lookupDayOrNight(hourChi: Chi): DayOrNight | undefined {
  if (DAY_HOUR_CHI.has(hourChi)) return "day";
  if (NIGHT_HOUR_CHI.has(hourChi)) return "night";
  return undefined;
}
