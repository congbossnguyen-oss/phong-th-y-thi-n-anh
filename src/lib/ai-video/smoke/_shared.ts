/**
 * Helper DÙNG CHUNG cho mọi smoke test API thật của CONG AI VIDEO — đặt tên bắt đầu bằng dấu gạch
 * dưới để không bị Vitest coi là 1 file test. Tách ra từ `real-api.smoke.test.ts` (STEP 2) khi thêm
 * `feng-shui-proof.smoke.test.ts` (STEP 4) để không lặp lại logic gating/nạp env.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Vitest KHÔNG tự nạp `.env` vào `process.env` (khác `astro dev`/`astro build` — xem
 * `loadLocalEnvFallback()` trong astro.config.mjs, vốn giải quyết đúng vấn đề này cho lúc build).
 * Không có bước này, `credentials.ts` sẽ luôn thấy "chưa cấu hình key" dù `.env` đã có key thật —
 * smoke test sẽ tự skip mà không hề gọi mạng, trông như "pass" giả (bug thật gặp ở STEP 2).
 * Copy nguyên cách làm đã có trong astro.config.mjs — không thêm dependency (không dotenv).
 */
export function taiEnvTuFileNeuThieu(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf-8");
  for (const line of text.split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    if (!process.env[key]) process.env[key] = line.slice(i + 1).trim();
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** true nếu biến môi trường có giá trị KHÔNG rỗng — không phân biệt hoa/thường, không log giá trị. */
export function coBienMoiTruong(ten: string): boolean {
  return (process.env[ten] ?? "").trim().length > 0;
}

/**
 * CHỈ true khi có CẢ HAI: cờ bật tường minh `RUN_AI_VIDEO_SMOKE_TEST=1` VÀ API key tương ứng.
 * Chỉ xét "có key" KHÔNG ĐỦ — `.env` production luôn có key (app cần để chạy), nếu vậy mọi lần
 * `vitest run`/CI thường ngày sẽ âm thầm tốn tiền gọi API thật (bug thật gặp ở STEP 2).
 */
export function sanSangChayThat(tenBienApiKey: string): boolean {
  return coBienMoiTruong("RUN_AI_VIDEO_SMOKE_TEST") && coBienMoiTruong(tenBienApiKey);
}
