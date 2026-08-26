// Gọi Anthropic API trực tiếp (kể cả qua Cloudflare AI Gateway) từ Cloudflare Worker đều bị 403
// "Request not allowed" — xác nhận 26/8/2026 đây là chặn diện rộng theo dải IP/mạng Cloudflare nói
// chung (không riêng Workers, không do key), khớp với báo cáo của nhiều người dùng khác trên chính
// diễn đàn Cloudflare Community. Xem chi tiết trong memory project_ptta_deploy_render.md.
//
// Khắc phục: route qua 1 relay Node.js chạy trên Vercel (hạ tầng AWS Lambda thật, khác hẳn dải mạng
// Cloudflare) — relay chỉ chuyển tiếp nguyên request sang api.anthropic.com, không lưu API key thật.
// Code repo relay: xem thư mục ptta-anthropic-relay (project Vercel riêng, không nằm trong repo này).
const RELAY_URL = "https://ptta-anthropic-relay.vercel.app/api/anthropic-relay";

export const ANTHROPIC_MESSAGES_URL = RELAY_URL;

function layRelaySharedSecret(): string {
  const tuRuntime = typeof process !== "undefined" ? process.env?.RELAY_SHARED_SECRET : undefined;
  return (tuRuntime || "").trim();
}

/** Headers chuẩn cho mọi lệnh gọi Anthropic — thêm x-relay-secret vì URL đích giờ là relay Vercel, không phải api.anthropic.com trực tiếp. */
export function anthropicHeaders(apiKey: string, anthropicVersion: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": anthropicVersion,
    "x-relay-secret": layRelaySharedSecret(),
  };
}
