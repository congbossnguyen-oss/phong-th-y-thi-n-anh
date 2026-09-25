/**
 * Cờ bật/tắt đường Âm lịch canonical VN (G10) — MẶC ĐỊNH TẮT.
 *
 * TẮT (mặc định): giữ nguyên hành vi legacy (`solarToLunar` của app, và `Asia/Ho_Chi_Minh` thô
 *   ở trachnhat/tang-le) để so sánh và bảo toàn output production hiện tại.
 * BẬT: dùng resolver chính sách VN tường minh + calendar-core (Etc/GMT-7/8, ΔT).
 *
 * Nguồn giá trị (một helper duy nhất cho cả client lẫn server):
 * - CLIENT (bundle Astro/Vite, chạy trong trình duyệt): `import.meta.env.PUBLIC_LUNAR_ENGINE`
 *   được Vite thay TĨNH lúc build. `process.env` KHÔNG tồn tại trong trình duyệt (đây là lỗi P1-A).
 * - SERVER (API/cron/Node/test): `process.env.LUNAR_ENGINE` lúc chạy.
 * Thiếu ở cả hai → false (TẮT). Không có cách nào vô tình bật ở client (phải build với biến PUBLIC_).
 */
export const LUNAR_ENGINE_ENV_VAR = "LUNAR_ENGINE";
export const LUNAR_ENGINE_ON_VALUE = "calendar-core";
export const LUNAR_ENGINE_PUBLIC_VAR = "PUBLIC_LUNAR_ENGINE";

export function isCanonicalVnLunarEnabled(): boolean {
  // Client + build-time: Vite thay `import.meta.env.PUBLIC_LUNAR_ENGINE` thành giá trị bake sẵn.
  try {
    // @ts-ignore import.meta.env do Vite cung cấp trong bundle client; undefined khi chạy Node thuần.
    const pub = import.meta.env.PUBLIC_LUNAR_ENGINE;
    if (pub === LUNAR_ENGINE_ON_VALUE || pub === true || pub === "true") return true;
  } catch {
    /* import.meta.env không tồn tại ở Node thuần → bỏ qua, xét process.env bên dưới */
  }
  // Server runtime (Node API/cron/test).
  try {
    if (
      typeof process !== "undefined" &&
      !!process.env &&
      process.env[LUNAR_ENGINE_ENV_VAR] === LUNAR_ENGINE_ON_VALUE
    ) {
      return true;
    }
  } catch {
    /* không có process → bỏ qua */
  }
  return false;
}
