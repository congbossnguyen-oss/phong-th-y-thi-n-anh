// Giai Đoạn A (31/8/2026) — kiểm chứng logic MỚI: IP khác lúc đăng nhập không còn hủy session, chỉ
// trả cảnh báo để ghi log. `canhBaoDoiIp` là HÀM THUẦN (không đụng DB) nên test được trực tiếp,
// không cần mock/DB thật — không tạo dữ liệu vào DB production đang dùng cho .env cục bộ.
import { describe, expect, it } from "vitest";
import { canhBaoDoiIp } from "./session";

describe("canhBaoDoiIp — Giai Đoạn A: IP đổi chỉ cảnh báo, không hủy session", () => {
  it("IP giống hệt -> không cảnh báo", () => {
    expect(canhBaoDoiIp("113.161.1.1", "113.161.1.1")).toBeNull();
  });

  it("IPv4 đổi hẳn (WiFi -> 4G) -> CÓ cảnh báo, nhưng đây chỉ là chuỗi để log, không phải tín hiệu chặn", () => {
    const canhBao = canhBaoDoiIp("113.161.1.1", "42.118.5.9");
    expect(canhBao).not.toBeNull();
    expect(canhBao).toContain("113.161.1.1");
    expect(canhBao).toContain("42.118.5.9");
  });

  it("IPv6 cùng 64-bit đầu (đổi định danh giao diện di động) -> không cảnh báo (đúng hành vi cungMangIp cũ)", () => {
    expect(canhBaoDoiIp("2001:ee0:23f:6dd9:4c77:967b:f7e4:d4a0", "2001:ee0:23f:6dd9:aaaa:bbbb:cccc:dddd")).toBeNull();
  });

  it("IPv6 khác 64-bit đầu (đổi mạng thật) -> CÓ cảnh báo", () => {
    const canhBao = canhBaoDoiIp("2001:ee0:23f:6dd9:4c77:967b:f7e4:d4a0", "2401:d800:1234:5678:4c77:967b:f7e4:d4a0");
    expect(canhBao).not.toBeNull();
  });

  it("chuỗi trả về LUÔN là string thuần (không phải object/exception) — an toàn để nối trực tiếp vào console.warn", () => {
    const canhBao = canhBaoDoiIp("1.2.3.4", "5.6.7.8");
    expect(typeof canhBao).toBe("string");
  });
});
