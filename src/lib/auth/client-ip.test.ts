import { describe, expect, it } from "vitest";
import { cungMangIp, getClientIp } from "./client-ip";

function fakeContext(opts: { xff?: string; clientAddress?: string; throwsOnClientAddress?: boolean }) {
  const headers = new Headers();
  if (opts.xff) headers.set("x-forwarded-for", opts.xff);
  return {
    request: { headers } as unknown as Request,
    get clientAddress(): string {
      if (opts.throwsOnClientAddress) throw new Error("clientAddress not available");
      return opts.clientAddress ?? "";
    },
  };
}

describe("getClientIp — ưu tiên clientAddress (CF-Connecting-IP qua @astrojs/cloudflare)", () => {
  it("có cả clientAddress lẫn X-Forwarded-For -> dùng clientAddress (Cloudflare, không spoof được)", () => {
    const ctx = fakeContext({ xff: "1.2.3.4", clientAddress: "2001:ee0:23f:6dd9::1" });
    expect(getClientIp(ctx)).toBe("2001:ee0:23f:6dd9::1");
  });

  it("chỉ có X-Forwarded-For, clientAddress lỗi -> dự phòng bằng XFF (lấy IP đầu tiên trong chuỗi)", () => {
    const ctx = fakeContext({ xff: "5.6.7.8, 9.9.9.9", throwsOnClientAddress: true });
    expect(getClientIp(ctx)).toBe("5.6.7.8");
  });

  it("không có gì cả -> trả về 'unknown', không throw", () => {
    const ctx = fakeContext({ throwsOnClientAddress: true });
    expect(() => getClientIp(ctx)).not.toThrow();
    expect(getClientIp(ctx)).toBe("unknown");
  });
});

describe("cungMangIp", () => {
  it("IPv6 cùng 64-bit đầu, khác 64-bit cuối -> vẫn coi là cùng mạng (ca thật anh Công báo 30/8/2026)", () => {
    expect(cungMangIp("2001:ee0:23f:6dd9:4c77:967b:f7e4:d4a0", "2001:ee0:23f:6dd9:aaaa:bbbb:cccc:dddd")).toBe(true);
  });

  it("IPv6 khác 64-bit đầu (khác mạng thật) -> không cùng mạng", () => {
    expect(cungMangIp("2001:ee0:23f:6dd9:4c77:967b:f7e4:d4a0", "2401:d800:1234:5678:4c77:967b:f7e4:d4a0")).toBe(false);
  });

  it("IPv6 giống hệt nhau -> cùng mạng", () => {
    expect(cungMangIp("2001:ee0:23f:6dd9::1", "2001:ee0:23f:6dd9::1")).toBe(true);
  });

  it("IPv6 rút gọn '::' được giải nén đúng trước khi so", () => {
    // fe80::1 và fe80:0:0:0:0:0:0:2 cùng prefix 4 nhóm đầu (fe80:0:0:0).
    expect(cungMangIp("fe80::1", "fe80:0:0:0:0:0:0:2")).toBe(true);
  });

  it("IPv4 vẫn đòi khớp CHÍNH XÁC như cũ — không nới lỏng", () => {
    expect(cungMangIp("113.161.1.1", "113.161.1.2")).toBe(false);
    expect(cungMangIp("113.161.1.1", "113.161.1.1")).toBe(true);
  });

  it("IPv4 so với IPv6 -> luôn không khớp, không rơi vào nhánh IPv6 sai", () => {
    expect(cungMangIp("113.161.1.1", "2001:ee0:23f:6dd9::1")).toBe(false);
  });

  it("chuỗi IPv6 không hợp lệ (không đủ 8 nhóm, không có '::') -> không khớp nếu khác chuỗi, không throw", () => {
    expect(() => cungMangIp("1:2:3", "1:2:4")).not.toThrow();
    expect(cungMangIp("1:2:3", "1:2:4")).toBe(false);
  });
});
