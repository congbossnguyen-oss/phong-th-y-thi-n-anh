/**
 * Lục Hợp (6 cặp Địa Chi hòa hợp): Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tỵ-Thân, Ngọ-Mùi.
 *
 * Đây là kiến thức nền tảng cố định của Can Chi học (không có dị bản giữa các trường phái,
 * không cần đối chiếu nguồn riêng — cùng cách xử lý với `lucXung.ts`/`tamHop.ts` đã có).
 */
import { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export const LUC_HOP: readonly (readonly [Chi, Chi])[] = [
  ["Tý", "Sửu"],
  ["Dần", "Hợi"],
  ["Mão", "Tuất"],
  ["Thìn", "Dậu"],
  ["Tỵ", "Thân"],
  ["Ngọ", "Mùi"],
];

/** 2 Chi khác nhau có phải 1 cặp Lục Hợp hay không. */
export function isLucHop(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return LUC_HOP.some((cap) => cap.includes(chiA) && cap.includes(chiB));
}
