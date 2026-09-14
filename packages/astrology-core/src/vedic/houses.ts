/**
 * Phase 5 — Whole Sign House (Nhà Nguyên Cung). HÀM THUẦN, KHÔNG cần `AstronomicalProvider`
 * (giống `vedic/nakshatra.ts` — chỉ cần Rashi/sign đã có, không cần thêm dữ kiện thiên văn nào) —
 * KHÔNG gọi Swiss Ephemeris house-cusp API nào (`provider.getHouseCusps`) cho Whole Sign, ĐÚNG
 * quyết định Phase 5 #11/#12: "No house cusp calculation is required for V1. Whole Sign houses
 * must use pure Rashi-index arithmetic."
 *
 * CÔNG THỨC (xác nhận qua CẢ HAI oracle trong PHASE5_PREFLIGHT_ASCENDANT_HOUSES.md §3):
 *   house = ((bodyRashiIndex - lagnaRashiIndex + 12) % 12) + 1
 * Khớp ĐÚNG cách vedic-calc's `build_houses()`/`sign_to_house` biểu diễn (đảo ngược công thức
 * `house_sign = (lagna_sign_value - 1 + house_index) % 12 + 1` của chính vedic-calc) và cách
 * PyJHora's method 5 "Each Rasi is the house" hoạt động — KHÔNG suy đoán, đã đối chiếu trực tiếp.
 *
 * KHÔNG import `western/` (Rule A). KHÔNG import `sweph` (Rule B — file này không đụng
 * `AstronomicalProvider` nên không có cơ hội vi phạm). KHÔNG có ruler/lord/dignity/house strength
 * nào ở đây — house ruler CỐ Ý bị hoãn (Phase 5 quyết định #8, khớp đúng khoảng trống hiện tại
 * của CHÍNH Western — `western/chart.ts::buildWesternChart` cũng chưa điền `houses[].ruler`).
 */

import { ZODIAC_SIGNS, type HouseNumber, type ZodiacSign } from "../chart/types.js";

/**
 * Nhà Whole Sign (1-12) chứa `bodyRashi`, tương đối so với `lagnaRashi` (Rashi của Lagna/Ascendant
 * — Nhà 1). KHÔNG dùng cusp-degree nào — thuần tuý đếm khoảng cách cung theo thứ tự hoàng đạo.
 * `ZODIAC_SIGNS.indexOf(...)` không bao giờ trả -1 ở đây vì `ZodiacSign` là union đóng đúng 12 giá
 * trị trùng khớp `ZODIAC_SIGNS` — không cần phòng vệ `noUncheckedIndexedAccess` (đây là
 * `.indexOf()`, không phải truy cập mảng bằng số).
 */
export function getWholeSignHouseNumber(bodyRashi: ZodiacSign, lagnaRashi: ZodiacSign): HouseNumber {
  const bodyIndex = ZODIAC_SIGNS.indexOf(bodyRashi);
  const lagnaIndex = ZODIAC_SIGNS.indexOf(lagnaRashi);
  const house = ((bodyIndex - lagnaIndex + 12) % 12) + 1;
  return house as HouseNumber;
}
