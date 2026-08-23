/**
 * GỬI THÔNG BÁO ĐẨY (Web Push) — tự cài bằng `node:crypto`, KHÔNG dùng thư viện ngoài.
 *
 * Lý do không dùng gói `web-push`: npm trên máy này liên tục hết bộ nhớ khi giải phụ thuộc cho dự
 * án (lỗi môi trường, không phải lỗi gói). Phần bắt buộc phải có chỉ là ký VAPID bằng ES256 —
 * `node:crypto` làm được sẵn, nên tự cài gọn hơn là thêm một cây phụ thuộc.
 *
 * CÁCH TIẾP CẬN: gửi push KHÔNG KÈM NỘI DUNG (data-less push, đúng chuẩn Push API). Service worker
 * nhận được tín hiệu rồi tự gọi API lấy nội dung mới nhất để hiển thị.
 *   - Ưu: khỏi phải tự cài mã hóa payload theo RFC 8291 (ECDH + HKDF + AES-GCM) — đây mới là chỗ
 *     dễ sai âm thầm và gần như không kiểm thử được nếu không có endpoint đẩy thật.
 *   - Ưu: nội dung lấy lúc hiển thị nên luôn đúng ngày, không sợ tồn đọng nội dung cũ trong hàng đợi.
 *   - Nhược: máy khách phải có mạng lúc nhận (vốn dĩ nhận push đã cần mạng), và nếu gọi API hỏng
 *     thì hiện lời nhắc chung chung — service worker đã có sẵn phương án dự phòng cho việc này.
 */
import { createPrivateKey, generateKeyPairSync, sign as cryptoSign } from "node:crypto";
import { docBien } from "./env";

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export interface VapidKeys {
  publicKey: string; // base64url của điểm EC không nén (65 byte: 0x04 || x || y)
  privateKey: string; // base64url của khóa riêng (32 byte)
}

/** Sinh cặp khóa VAPID. Chạy MỘT LẦN, lưu vào biến môi trường — đổi khóa là mất sạch đăng ký cũ. */
export function taoKhoaVapid(): VapidKeys {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const pubJwk = publicKey.export({ format: "jwk" }) as { x: string; y: string };
  const privJwk = privateKey.export({ format: "jwk" }) as { d: string };

  const x = fromB64url(pubJwk.x);
  const y = fromB64url(pubJwk.y);
  // Điểm không nén: 0x04 rồi tới x (32 byte) rồi y (32 byte). Phải đệm cho đủ 32 byte mỗi phần,
  // vì số nhỏ có thể được mã hóa ngắn hơn.
  const point = Buffer.concat([Buffer.from([0x04]), pad32(x), pad32(y)]);

  return { publicKey: b64url(point), privateKey: privJwk.d };
}

function pad32(b: Buffer): Buffer {
  if (b.length === 32) return b;
  if (b.length > 32) return b.subarray(b.length - 32);
  return Buffer.concat([Buffer.alloc(32 - b.length), b]);
}

/** Dựng KeyObject khóa riêng từ cặp khóa VAPID dạng chuỗi. */
function khoaRieng(keys: VapidKeys) {
  const point = fromB64url(keys.publicKey);
  if (point.length !== 65 || point[0] !== 0x04) {
    throw new Error("VAPID_PUBLIC_KEY không đúng định dạng điểm EC không nén 65 byte.");
  }
  return createPrivateKey({
    key: {
      kty: "EC",
      crv: "P-256",
      x: b64url(point.subarray(1, 33)),
      y: b64url(point.subarray(33, 65)),
      d: keys.privateKey,
    },
    format: "jwk",
  });
}

/**
 * Ký JWT VAPID cho một endpoint. `aud` phải là origin của endpoint (ví dụ
 * https://fcm.googleapis.com), không phải toàn bộ đường dẫn.
 */
export function kyJwtVapid(endpoint: string, keys: VapidKeys, subject: string, hanGioSong = 12): string {
  const aud = new URL(endpoint).origin;
  const header = b64url(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        aud,
        exp: Math.floor(Date.now() / 1000) + hanGioSong * 3600,
        sub: subject,
      }),
    ),
  );
  const data = Buffer.from(`${header}.${payload}`);
  // ieee-p1363 cho chữ ký dạng r||s 64 byte — đúng thứ JWS ES256 cần (KHÁC mặc định DER của Node).
  const chuKy = cryptoSign("sha256", data, { key: khoaRieng(keys), dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${b64url(chuKy)}`;
}

export type KetQuaGui = "da-gui" | "het-han" | "loi";

/**
 * Gửi một tín hiệu đẩy (không kèm nội dung) tới một máy đã đăng ký.
 * - "da-gui": dịch vụ đẩy đã nhận.
 * - "het-han": máy đã gỡ đăng ký (404/410) — người gọi PHẢI xóa dòng đăng ký này khỏi cơ sở dữ liệu.
 * - "loi": lỗi tạm thời, để lần sau thử lại.
 */
export async function guiTinHieuDay(
  endpoint: string,
  keys: VapidKeys,
  subject: string,
  ttlGiay = 12 * 3600,
): Promise<KetQuaGui> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${kyJwtVapid(endpoint, keys, subject)}, k=${keys.publicKey}`,
        TTL: String(ttlGiay),
        // Không có thân yêu cầu, nhưng vẫn phải khai độ dài bằng 0 cho một số dịch vụ đẩy.
        "Content-Length": "0",
      },
    });

    if (res.status === 404 || res.status === 410) return "het-han";
    if (res.ok) return "da-gui"; // thường là 201
    return "loi";
  } catch {
    return "loi";
  }
}

/** Đọc cặp khóa VAPID từ biến môi trường. Trả null nếu chưa cấu hình (để trang không sập). */
export function docKhoaVapid(): VapidKeys | null {
  const publicKey = docBien("VAPID_PUBLIC_KEY");
  const privateKey = docBien("VAPID_PRIVATE_KEY");
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey };
}

/** Địa chỉ liên hệ gắn vào JWT — dịch vụ đẩy dùng để báo khi có sự cố. */
export function chuThePush(): string {
  return docBien("VAPID_SUBJECT") || "mailto:lienhe@phongthuythienanh.com";
}
