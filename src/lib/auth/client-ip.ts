import type { APIContext } from "astro";

/**
 * Lấy IP thật của client. Ưu tiên header X-Forwarded-For (Render, Nginx reverse proxy trên VPS
 * đều gắn header này) vì context.clientAddress phía sau proxy thường chỉ là IP nội bộ của proxy.
 */
export function getClientIp(context: Pick<APIContext, "request" | "clientAddress">): string {
  const forwarded = context.request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  try {
    return context.clientAddress;
  } catch {
    return "unknown";
  }
}
