// Kiểm chứng phần ký VAPID. Đây là mã hóa — sai thì dịch vụ đẩy lặng lẽ từ chối chứ không báo
// lỗi rõ ràng, nên phải xác minh chữ ký bằng khóa công khai chứ không chỉ xem "có chạy không".
import { describe, it, expect } from "vitest";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { taoKhoaVapid, kyJwtVapid } from "./web-push";

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

describe("ký VAPID", () => {
  it("sinh khóa đúng định dạng điểm EC không nén 65 byte", () => {
    const k = taoKhoaVapid();
    const point = fromB64url(k.publicKey);
    expect(point.length).toBe(65);
    expect(point[0]).toBe(0x04);
    expect(fromB64url(k.privateKey).length).toBe(32);
  });

  it("JWT có 3 phần, header đúng chuẩn ES256", () => {
    const k = taoKhoaVapid();
    const jwt = kyJwtVapid("https://fcm.googleapis.com/fcm/send/abc123", k, "mailto:a@b.com");
    const phan = jwt.split(".");
    expect(phan).toHaveLength(3);
    expect(JSON.parse(fromB64url(phan[0]).toString())).toEqual({ typ: "JWT", alg: "ES256" });
  });

  it("aud là ORIGIN của endpoint, không phải toàn bộ đường dẫn", () => {
    const k = taoKhoaVapid();
    const jwt = kyJwtVapid("https://updates.push.services.mozilla.com/wpush/v2/gAAA...", k, "mailto:a@b.com");
    const payload = JSON.parse(fromB64url(jwt.split(".")[1]).toString());
    expect(payload.aud).toBe("https://updates.push.services.mozilla.com");
    expect(payload.sub).toBe("mailto:a@b.com");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("chữ ký xác minh được bằng chính khóa công khai (r||s 64 byte)", () => {
    const k = taoKhoaVapid();
    const jwt = kyJwtVapid("https://fcm.googleapis.com/fcm/send/abc", k, "mailto:a@b.com");
    const [h, p, s] = jwt.split(".");
    const chuKy = fromB64url(s);
    expect(chuKy.length).toBe(64); // ES256 phải là r||s, KHÔNG phải DER

    const point = fromB64url(k.publicKey);
    const pub = createPublicKey({
      key: {
        kty: "EC",
        crv: "P-256",
        x: point.subarray(1, 33).toString("base64url"),
        y: point.subarray(33, 65).toString("base64url"),
      },
      format: "jwk",
    });

    const hopLe = cryptoVerify("sha256", Buffer.from(`${h}.${p}`), { key: pub, dsaEncoding: "ieee-p1363" }, chuKy);
    expect(hopLe).toBe(true);
  });

  it("chữ ký KHÔNG xác minh được bằng khóa của cặp khác", () => {
    const k1 = taoKhoaVapid();
    const k2 = taoKhoaVapid();
    const jwt = kyJwtVapid("https://fcm.googleapis.com/fcm/send/abc", k1, "mailto:a@b.com");
    const [h, p, s] = jwt.split(".");

    const point = fromB64url(k2.publicKey);
    const pub = createPublicKey({
      key: {
        kty: "EC",
        crv: "P-256",
        x: point.subarray(1, 33).toString("base64url"),
        y: point.subarray(33, 65).toString("base64url"),
      },
      format: "jwk",
    });

    expect(
      cryptoVerify("sha256", Buffer.from(`${h}.${p}`), { key: pub, dsaEncoding: "ieee-p1363" }, fromB64url(s)),
    ).toBe(false);
  });
});
