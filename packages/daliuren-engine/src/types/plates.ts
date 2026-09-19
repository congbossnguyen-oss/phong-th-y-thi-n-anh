/**
 * HeavenPlate / EarthPlate (天地盤) — Algorithm Spec §5. CONFIDENCE A, không tranh cãi
 * giữa mọi nguồn đã audit (định nghĩa toán học thuần túy).
 */
import type { Chi } from "./ganzhi.js";

/** Địa Bàn: 12 phần tử CỐ ĐỊNH, index 0=Tý..11=Hợi — luôn bằng đúng thứ tự CHI. */
export type EarthPlate = readonly [Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi];

/**
 * Thiên Bàn: 12 phần tử, `heavenPlate[i]` = chữ Thiên Bàn phủ lên VỊ TRÍ Địa Bàn thứ i
 * (tức `earthPlate[i]`). Được suy ra bằng cách đặt Nguyệt Tướng vào vị trí Địa Bàn của chi
 * giờ chiêm rồi dịch chuyển các chi còn lại theo thứ tự tự nhiên Tý→Sửu→Dần...
 */
export type HeavenPlate = readonly [Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi, Chi];

export interface HeavenEarthPlate {
  earthPlate: EarthPlate;
  heavenPlate: HeavenPlate;
}
