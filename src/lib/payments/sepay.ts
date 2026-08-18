import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

// Tiền tố mã đơn hàng — nhúng vào nội dung chuyển khoản để đối soát webhook SePay với đơn hàng.
const ORDER_CODE_PREFIX = "THA";

/**
 * Sinh mã đơn hàng ngắn, duy nhất, dễ đọc khi hiện trên nội dung chuyển khoản
 * (chỉ chữ hoa + số, không ký tự dễ nhầm như 0/O, 1/I).
 */
export function generateOrderCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(8);
  let code = "";
  for (const b of bytes) {
    code += alphabet[b % alphabet.length];
  }
  return `${ORDER_CODE_PREFIX}${code}`;
}

/**
 * Tìm mã đơn hàng (orderCode) bên trong nội dung chuyển khoản do SePay gửi về —
 * nội dung thật do ngân hàng trả về thường có thêm tiền tố/hậu tố do ngân hàng chèn vào,
 * nên phải tìm theo mẫu thay vì so khớp chính xác toàn chuỗi.
 */
export function extractOrderCodeFromContent(content: string): string | null {
  const match = content.toUpperCase().match(new RegExp(`${ORDER_CODE_PREFIX}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}`));
  return match ? match[0] : null;
}

/**
 * Sinh URL ảnh QR VietQR động qua dịch vụ của SePay — quét là điền sẵn số tiền + nội dung
 * chuyển khoản, hạn chế học viên/khách hàng gõ sai nội dung khiến webhook không đối soát được.
 */
export function getSepayQrUrl(params: { amount: number; orderCode: string }): string {
  const bankAccount = import.meta.env.SEPAY_BANK_ACCOUNT;
  const bankName = import.meta.env.SEPAY_BANK_NAME;
  if (!bankAccount || !bankName) {
    throw new Error("Thiếu SEPAY_BANK_ACCOUNT/SEPAY_BANK_NAME trong .env (xem .env.example).");
  }

  const qs = new URLSearchParams({
    acc: bankAccount,
    bank: bankName,
    amount: String(Math.round(params.amount)),
    des: params.orderCode,
    template: "compact",
  });

  return `https://qr.sepay.vn/img?${qs.toString()}`;
}

export interface SepayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  description: string;
  transferAmount: number;
  accumulated: number;
  referenceCode: string;
}

/**
 * So sánh hai chuỗi trong THỜI GIAN HẰNG ĐỊNH để chống timing attack.
 *
 * Băm SHA-256 cả hai vế về đúng 32 byte trước khi `timingSafeEqual`:
 *   - `timingSafeEqual` ném lỗi nếu hai buffer khác độ dài, mà so trực tiếp chuỗi thô còn làm lộ
 *     độ dài secret qua thời gian → băm xong luôn cùng 32 byte, che cả độ dài lẫn nội dung.
 */
function soSanhHangDinh(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Xác thực request webhook thực sự đến từ SePay qua header Authorization: "Apikey <token>"
 * (cấu hình trùng SEPAY_WEBHOOK_SECRET ở SePay dashboard > Webhooks > Authorization).
 */
export function verifySepayWebhookAuth(authorizationHeader: string | null): boolean {
  const secret = import.meta.env.SEPAY_WEBHOOK_SECRET;
  if (!secret || !authorizationHeader) return false;
  return soSanhHangDinh(authorizationHeader, `Apikey ${secret}`);
}
