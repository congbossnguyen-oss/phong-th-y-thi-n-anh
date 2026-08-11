/**
 * Ngũ Hợp Thiên Can (5 cặp Can hòa hợp): Giáp-Kỷ, Ất-Canh, Bính-Tân, Đinh-Nhâm, Mậu-Quý.
 *
 * Đây là kiến thức nền tảng cố định của Can Chi học (không có dị bản giữa các trường phái,
 * không cần đối chiếu nguồn riêng — cùng cách xử lý với `lucXung.ts`/`lucHop.ts` đã có).
 */
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;

export const CAN_HOP: readonly (readonly [Can, Can])[] = [
  ["Giáp", "Kỷ"],
  ["Ất", "Canh"],
  ["Bính", "Tân"],
  ["Đinh", "Nhâm"],
  ["Mậu", "Quý"],
];

/** 2 Can khác nhau có phải 1 cặp Ngũ Hợp hay không. */
export function isCanHop(canA: Can, canB: Can): boolean {
  if (canA === canB) return false;
  return CAN_HOP.some((cap) => cap.includes(canA) && cap.includes(canB));
}
