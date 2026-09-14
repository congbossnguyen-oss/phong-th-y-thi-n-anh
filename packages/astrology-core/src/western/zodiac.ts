/**
 * Phase 3B-2 — Longitude → ZodiacSign (tropical). Re-export tương thích ngược: implementation
 * THẬT đã chuyển sang `../precision.js` ở Phase 4 Step 3 (đúng ADR-003, cùng lý do đã dùng cho
 * `normalizeDegrees` ở Step 2 — sign-mapping là hình học thuần, KHÔNG có phán đoán chiêm tinh,
 * giống nhau ở tropical lẫn sidereal, nên Vedic (`vedic/rashi.ts`) cần tái dùng được mà KHÔNG
 * import `western/` — vi phạm school isolation). File này giữ lại CHỈ để mọi import hiện có
 * trong `western/` (vd. `planets.ts`) và test hiện có (`__tests__/zodiac.test.ts`) không phải
 * đổi đường dẫn import — KHÔNG có logic riêng, KHÔNG có bản implementation thứ hai nào ở đây.
 */

export { signOfLongitude, signDegreeOfLongitude } from "../precision.js";
