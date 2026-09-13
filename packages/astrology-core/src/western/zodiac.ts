/**
 * Phase 3B-2 — Longitude → ZodiacSign (tropical). HÀM THUẦN, quy ước toán học phổ quát (0°-30°
 * Aries, 30°-60° Taurus, ...), KHÔNG phải một "quyết định" riêng của trường phái nào (giống hệt
 * cách `types.ts` mô tả `ZodiacSign` — "hằng số thiên văn/quy ước phổ quát" — vẫn CHỈ áp dụng
 * cho tropical ở Phase 3B-2; sidereal (Vedic, Phase 4+) trừ ayanamsa TRƯỚC khi gọi hàm này, hàm
 * này không tự biết ayanamsa).
 *
 * Nằm trong `western/` (không phải `chart/` hay `astronomical/`) vì Phase 3B-2 CHỈ áp dụng tại
 * chart Tây phương tropical — Vedic (Phase 4+) SẼ tái dùng được hàm này (toán học giống hệt),
 * nhưng phải tự trừ ayanamsa trước, một bước KHÔNG thuộc phạm vi module này.
 */

import { ZODIAC_SIGNS, type ZodiacSign } from "../chart/types.js";

const DEGREES_PER_SIGN = 30;

function normalizeDegrees(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Cung hoàng đạo tropical chứa `longitude` (độ hoàng đạo, bất kỳ giá trị nào — tự chuẩn hoá về
 * [0,360) trước khi tính, KHÔNG yêu cầu caller tự chuẩn hoá trước).
 */
export function signOfLongitude(longitude: number): ZodiacSign {
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(11, Math.floor(normalized / DEGREES_PER_SIGN));
  const sign = ZODIAC_SIGNS[index];
  if (sign === undefined) {
    // Không thể xảy ra với normalized trong [0,360) — phòng vệ cho noUncheckedIndexedAccess.
    throw new Error(`signOfLongitude: chỉ số cung không hợp lệ (${index}) cho longitude=${longitude}.`);
  }
  return sign;
}

/**
 * Vị trí TRONG cung (0..30), phần dư sau khi trừ điểm bắt đầu cung — LUÔN đi cùng
 * `signOfLongitude(longitude)`, không dùng riêng lẻ (2 giá trị phải khớp cùng 1 longitude).
 */
export function signDegreeOfLongitude(longitude: number): number {
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(11, Math.floor(normalized / DEGREES_PER_SIGN));
  return normalized - index * DEGREES_PER_SIGN;
}
