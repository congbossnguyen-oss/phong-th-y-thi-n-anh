import type { APIContext } from "astro";
import { getClientIp } from "./auth/client-ip";

/**
 * Rate limiter in-memory ĐƠN GIẢN theo cửa sổ cố định (fixed-window), khoá theo `route:IP`.
 *
 * Vì sao tự viết thay vì thêm package: nhu cầu chỉ là chặn lạm dụng cơ bản (brute-force, spam,
 * dội endpoint tính toán nặng) — vài chục dòng là đủ, không cần thêm bề mặt phụ thuộc.
 *
 * ⚠️ GIỚI HẠN cần biết: bộ đếm nằm trong RAM của MỘT tiến trình. Đúng với hiện trạng (Render Free
 * chạy 1 instance). Nếu sau này chạy nhiều instance / auto-scale thì mỗi instance đếm riêng —
 * lúc đó nên chuyển sang bộ đếm dùng chung (Redis, hoặc bảng đếm trong Neon). Bộ đếm cũng reset khi
 * server khởi động lại; chấp nhận được cho mục đích chống lạm dụng (không phải chống gian lận tiền —
 * việc đó đã có xác thực webhook + kiểm số tiền ở tầng thanh toán).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Dọn rác lười: cứ mỗi 5 phút, lần gọi đầu tiên sẽ xoá các khoá đã hết hạn để Map không phình vô hạn.
const SWEEP_INTERVAL_MS = 5 * 60_000;
let lastSweep = Date.now();

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Tiền tố định danh route (mỗi route đếm riêng, không ăn chung hạn mức). */
  key: string;
  /** Số request tối đa trong một cửa sổ. */
  max: number;
  /** Độ dài cửa sổ, mili-giây. */
  windowMs: number;
  /** Thông báo tuỳ chỉnh khi vượt hạn mức (vd hạn mức theo ngày). Mặc định: thông báo "thao tác quá nhanh". */
  message?: string;
}

/**
 * Kiểm tra hạn mức cho request hiện tại.
 * @returns `null` nếu CÒN hạn mức (cho đi tiếp); `Response` 429 (kèm `Retry-After`) nếu ĐÃ vượt.
 *
 * Cách dùng trong một API route:
 *   const limited = checkRateLimit(context, { key: "login", max: 8, windowMs: 60_000 });
 *   if (limited) return limited;
 */
export function checkRateLimit(
  context: Pick<APIContext, "request" | "clientAddress">,
  opts: RateLimitOptions,
): Response | null {
  const now = Date.now();
  sweep(now);

  const key = `${opts.key}:${getClientIp(context)}`;
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  if (bucket.count >= opts.max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ ok: false, error: opts.message ?? "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) } },
    );
  }

  bucket.count += 1;
  return null;
}
