import { getResendClient, getFromAddress } from "./client";
import { siteConfig } from "../site-config";
import {
  productOrderConfirmedEmail,
  courseOrderConfirmedEmail,
  courseCertificateEmail,
  consultationRequestEmail,
  baoCaoGoogleSheetEmail,
} from "./templates";

// Gửi email không được phép làm sập luồng nghiệp vụ chính (vd webhook thanh toán phải trả 200
// cho SePay trong 30s) — mọi lỗi gửi email chỉ log lại, không throw ra ngoài.
async function safeSend(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: Buffer }[],
  cc?: string,
) {
  try {
    await getResendClient().emails.send({
      from: getFromAddress(),
      to,
      cc,
      subject,
      html,
      attachments,
    });
  } catch (err) {
    console.error("[email] Gửi email thất bại:", err);
  }
}

export async function sendProductOrderConfirmedEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  items: { name: string; qty: number; price: number }[];
  shippingAddress: string;
}) {
  const { subject, html } = productOrderConfirmedEmail(params);
  await safeSend(params.to, subject, html);
}

export async function sendCourseOrderConfirmedEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  courseName: string;
  courseSlug: string;
  totalAmount: number;
}) {
  const { subject, html } = courseOrderConfirmedEmail(params);
  await safeSend(params.to, subject, html);
}

export async function sendConsultationRequestEmail(params: {
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
}) {
  const to = import.meta.env.CONTACT_NOTIFICATION_EMAIL || siteConfig.email;
  const cc = import.meta.env.CONTACT_NOTIFICATION_CC_EMAIL || "congboss.nguyen@gmail.com";
  const { subject, html } = consultationRequestEmail(params);
  await safeSend(to, subject, html, undefined, cc);
}

export async function sendCourseCertificateEmail(params: {
  to: string;
  customerName: string;
  courseName: string;
  certificateCode: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = courseCertificateEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `chung-chi-${params.certificateCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/**
 * Email báo cáo nội bộ mỗi khi có bản ghi đẩy sang Google Sheet (yêu cầu anh Công 2026-08-16).
 *
 * Gửi về cùng hòm thư nhận thông báo tư vấn, dùng chung `safeSend` nên lỗi gửi mail không bao giờ
 * làm hỏng đơn hàng của khách.
 */
export async function sendBaoCaoGoogleSheetEmail(params: {
  loai: string;
  tomTat: string;
  dong: { nhan: string; giaTri: string }[];
  linkSheet?: string;
  sheetLoi?: boolean;
}) {
  const { subject, html } = baoCaoGoogleSheetEmail(params);
  const to = import.meta.env.CONTACT_NOTIFICATION_EMAIL || siteConfig.email;
  const cc = import.meta.env.CONTACT_NOTIFICATION_CC_EMAIL || "congboss.nguyen@gmail.com";
  await safeSend(to, subject, html, undefined, cc);
}
