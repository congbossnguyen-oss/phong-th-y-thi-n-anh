import type { APIContext } from "astro";

/**
 * Lấy IP thật của client.
 *
 * ⚠️ ĐỔI ƯU TIÊN 30/8/2026 (production đã chuyển hẳn sang Cloudflare Worker, không còn Render/Nginx):
 * ưu tiên `context.clientAddress` trước — trên Cloudflare, @astrojs/cloudflare lấy giá trị này
 * TRỰC TIẾP từ header `CF-Connecting-IP` (`getClientAddress()` trong cf-helpers.js của adapter),
 * do chính Cloudflare edge gắn vào nên KHÔNG spoof được và ổn định giữa các request. Trước đây hàm
 * này ưu tiên `X-Forwarded-For` (đúng cho Render/Nginx cũ, vì `clientAddress` khi đó chỉ là IP nội
 * bộ của proxy) — nhưng trên Cloudflare, `X-Forwarded-For` không đảm bảo có mặt/ổn định giống nhau
 * ở mọi request, nên 2 request liên tiếp từ CÙNG một trình duyệt có thể bị hàm cũ trả về 2 giá trị
 * IP khác nhau (khi 1 request có XFF, request kia lại rơi về clientAddress) → khiến
 * `validateSessionToken()` (session.ts) tưởng nhầm là đổi IP và hủy phiên đăng nhập oan. Đây là
 * nguyên nhân thật gây ra ca admin (congboss.nguyen@gmail.com, is_admin=true, session còn hạn)
 * vẫn bị coi như chưa đăng nhập dù đã áp dụng `cungMangIp()` nới lỏng IPv6 (30/8/2026).
 * `X-Forwarded-For` giữ lại làm phương án dự phòng cuối cùng nếu vì lý do gì đó `clientAddress`
 * không đọc được.
 */
export function getClientIp(context: Pick<APIContext, "request" | "clientAddress">): string {
  try {
    return context.clientAddress;
  } catch {
    // Không có clientAddress hợp lệ (vd chạy ngoài môi trường SSR có adapter) — dự phòng bằng XFF.
  }
  const forwarded = context.request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

/**
 * Quy về 4 nhóm hex ĐẦU (64-bit prefix, phần mạng) của 1 địa chỉ IPv6, đã giải nén "::". Trả về
 * `null` nếu chuỗi không phải IPv6 hợp lệ.
 */
function ipv6Prefix64(ip: string): string | null {
  const clean = ip.replace(/^\[|\]$/g, "").split("%")[0]; // bỏ ngoặc vuông + zone id (fe80::1%eth0)
  if (!clean || !clean.includes(":")) return null;

  const parts = clean.split("::");
  if (parts.length > 2) return null; // "::" chỉ được xuất hiện tối đa 1 lần trong địa chỉ hợp lệ

  let groups: string[];
  if (parts.length === 1) {
    groups = clean.split(":");
    if (groups.length !== 8) return null;
  } else {
    const head = parts[0] ? parts[0].split(":") : [];
    const tail = parts[1] ? parts[1].split(":") : [];
    const soThieu = 8 - head.length - tail.length;
    if (soThieu < 0) return null;
    groups = [...head, ...Array(soThieu).fill("0"), ...tail];
  }

  return groups
    .slice(0, 4)
    .map((g) => g.toLowerCase())
    .join(":");
}

/**
 * So khớp 2 địa chỉ IP có cùng thuộc 1 "mạng" hay không — dùng để nới lỏng khóa IP theo phiên
 * đăng nhập (`session.ts`). CHỈ nới lỏng cho IPv6: 64-bit CUỐI (định danh giao diện) trên mạng di
 * động Việt Nam thường tự đổi theo từng phiên kết nối (RFC 4941 "privacy extensions"), không phải
 * dấu hiệu tài khoản bị dùng chung — khóa cứng toàn bộ 128-bit khiến admin dùng 4G/5G bị đăng xuất
 * oan liên tục (anh Công báo 30/8/2026: đăng nhập đúng tài khoản admin vẫn không vào được trang
 * admin-only). IPv4 vẫn so khớp CHÍNH XÁC như cũ — không nới lỏng (không có hiện tượng đổi tương tự).
 */
export function cungMangIp(ipA: string, ipB: string): boolean {
  if (ipA === ipB) return true;
  const prefixA = ipv6Prefix64(ipA);
  const prefixB = ipv6Prefix64(ipB);
  return prefixA !== null && prefixB !== null && prefixA === prefixB;
}
