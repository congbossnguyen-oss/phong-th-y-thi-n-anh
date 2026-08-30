import { describe, expect, it } from "vitest";
import { cungMangIp } from "./client-ip";

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
