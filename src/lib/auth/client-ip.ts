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
