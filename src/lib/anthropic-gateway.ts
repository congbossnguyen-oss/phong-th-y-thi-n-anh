// Gọi Anthropic API trực tiếp từ Cloudflare Worker bị chặn 403 "Request not allowed" — Anthropic/WAF
// chặn traffic có nguồn gốc mạng Cloudflare Workers (phát hiện 25/8/2026, xem memory
// project_ptta_deploy_render.md). Khắc phục: đi qua Cloudflare AI Gateway (đã tạo sẵn trên dashboard,
// tên "phongthuythienanh") thay vì gọi thẳng api.anthropic.com — Gateway forward request sang Anthropic
// bằng chính x-api-key của mình, không cần thêm xác thực Cloudflare nào khác.
const CLOUDFLARE_ACCOUNT_ID = "29cda6fc04f7fe86e130db6e2872eed3";
// Cloudflare tự đổi tên Gateway "phongthuythienanh" thành slug này (tách từng ký tự bằng "-") — lấy
// đúng theo URL thật trên dashboard (AI Gateway → Gateways → ...), không phải tên gốc đã nhập.
const AI_GATEWAY_NAME = "p-h-o-n-g-t-h-u-y-t-h-i-e-n-a-n-h";

export const ANTHROPIC_MESSAGES_URL = `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${AI_GATEWAY_NAME}/anthropic/v1/messages`;
