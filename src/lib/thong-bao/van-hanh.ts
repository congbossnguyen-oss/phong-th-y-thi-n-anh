/**
 * THÔNG BÁO VẬN HÀNH cho nhân viên (operator) — CMS Notification V1, Phase 1 (email-only).
 *
 * Mục tiêu: khi có sự kiện quan trọng (yêu cầu tư vấn mới, thanh toán thành công), gửi 1 email ngắn
 * tới hộp thư vận hành để nhân viên biết ngay, không phải liên tục mở CMS.
 *
 * NGUYÊN TẮC:
 *  - Best-effort tuyệt đối: mọi hàm ở đây KHÔNG BAO GIỜ throw ra caller. Lỗi chỉ `console.error`.
 *    Nghiệp vụ chính (lưu form, xác nhận thanh toán) không được rollback vì thông báo thất bại.
 *  - Tái dùng hạ tầng email Resend hiện có (client.ts) — không thêm provider, không đổi send.ts.
 *  - Người nhận lấy từ config hiện có (CONTACT_NOTIFICATION_EMAIL / CONTACT_NOTIFICATION_CC_EMAIL,
 *    fallback siteConfig.email) — KHÔNG hard-code email cá nhân mới.
 *
 * Web Push (kênh bổ sung) DEFERRED sang phase sau: hạ tầng push hiện tại là data-less (tickle) nên
 * chưa mang được nội dung sự kiện cho operator — xem docs/CMS_NOTIFICATION_V1 design.
 */
import { getResendClient, getFromAddress } from "../email/client";
import { siteConfig } from "../site-config";
import { sendConsultationRequestEmail } from "../email/send";

function docBienEnv(ten: string): string | undefined {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const v = env[ten];
  return v && v.trim() ? v.trim() : undefined;
}

/** Người nhận thông báo vận hành — dùng đúng config hiện có, không hard-code email cá nhân mới. */
function nguoiNhanVanHanh(): { to: string; cc?: string } {
  return {
    to: docBienEnv("CONTACT_NOTIFICATION_EMAIL") || siteConfig.email,
    cc: docBienEnv("CONTACT_NOTIFICATION_CC_EMAIL"),
  };
}

/** Gửi 1 email vận hành, best-effort (không bao giờ throw). */
async function guiEmailVanHanh(subject: string, html: string): Promise<void> {
  try {
    const { to, cc } = nguoiNhanVanHanh();
    const ket = await getResendClient().emails.send({ from: getFromAddress(), to, cc, subject, html });
    if (ket.error) {
      console.error(`[van-hanh] Resend từ chối gửi tới ${to}: ${ket.error.name} — ${ket.error.message}`);
    }
  } catch (err) {
    console.error("[van-hanh] Gửi email vận hành thất bại:", err instanceof Error ? `${err.name}: ${err.message}` : err);
  }
}

/**
 * Quyết định có gửi thông báo thanh toán hay không — CHỐNG GỬI TRÙNG.
 * Chỉ gửi khi đơn ĐANG ở "pending_payment" TRƯỚC khi fulfill (tức đây là lần xử lý đầu tiên).
 * Webhook retry / đơn đã "confirmed" → false → không gửi lần 2.
 */
export function nenGuiThongBaoThanhToan(statusTruocKhiFulfill: string | undefined): boolean {
  return statusTruocKhiFulfill === "pending_payment";
}

/** Thông báo: có yêu cầu tư vấn mới. Tái dùng email tư vấn hiện có (send.ts, KHÔNG đổi). */
export async function notifyOperatorConsultation(params: {
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
}): Promise<void> {
  try {
    await sendConsultationRequestEmail(params);
  } catch (err) {
    console.error("[van-hanh] notifyOperatorConsultation lỗi:", err instanceof Error ? `${err.name}: ${err.message}` : err);
  }
}

const NHAN_LOAI_DON: Record<string, string> = {
  product: "Sản phẩm",
  course: "Khóa học",
  tool: "Công cụ",
  subscription: "Gói thuê bao",
};

/** Thông báo: một đơn đã thanh toán thành công. */
export async function notifyOperatorPayment(params: {
  orderCode: string;
  customerName: string;
  totalAmount: number;
  orderType: string;
}): Promise<void> {
  const tien = new Intl.NumberFormat("vi-VN").format(params.totalAmount);
  const loai = NHAN_LOAI_DON[params.orderType] ?? params.orderType;
  const subject = `[THANH TOÁN THÀNH CÔNG] Đơn #${params.orderCode} — ${tien}đ`;
  const html = [
    "<h2>Thanh toán thành công</h2>",
    "<ul>",
    `<li><strong>Mã đơn:</strong> ${params.orderCode}</li>`,
    `<li><strong>Khách:</strong> ${params.customerName}</li>`,
    `<li><strong>Số tiền:</strong> ${tien}đ</li>`,
    `<li><strong>Loại đơn:</strong> ${loai}</li>`,
    "</ul>",
    "<p>→ Mở CMS để kiểm tra đơn.</p>",
  ].join("");
  await guiEmailVanHanh(subject, html);
}
