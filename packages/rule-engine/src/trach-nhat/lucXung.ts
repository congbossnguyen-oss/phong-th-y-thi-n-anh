/**
 * Lục Xung (6 cặp Địa Chi xung khắc): Tý-Ngọ, Sửu-Mùi, Dần-Thân, Mão-Dậu, Thìn-Tuất, Tỵ-Hợi.
 *
 * Đây là kiến thức nền tảng cố định của Can Chi học (không có dị bản giữa các trường phái,
 * không cần đối chiếu nguồn riêng — khác với Thần Sát/Nhị Thập Bát Tú vốn có nhiều dị bản).
 * Quy luật: mỗi cặp xung luôn cách nhau đúng 6 vị trí trong vòng 12 Địa Chi.
 */

import { mod } from "../utils/math.js";
import { Data } from "@thien-anh/calendar-core";

const { CHI } = Data;
type Chi = Data.Chi;

/** Địa Chi xung với Chi cho trước (theo index 0-11, 0=Tý). */
export function getLucXungChiIndex(chiIndex: number): number {
  return mod(chiIndex + 6, 12);
}

/** Tiện ích: trả về tên Chi (thay vì index) xung với Chi cho trước. */
export function getLucXungChi(chi: Chi): Chi {
  const chiIndex = CHI.indexOf(chi);
  return CHI[getLucXungChiIndex(chiIndex)]!;
}

/** Kiểm tra 2 Chi có xung nhau hay không. */
export function isLucXung(chiIndexA: number, chiIndexB: number): boolean {
  return getLucXungChiIndex(chiIndexA) === mod(chiIndexB, 12);
}
