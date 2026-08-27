import { getResendClient, getFromAddress } from "./client";
import { siteConfig } from "../site-config";
import {
  productOrderConfirmedEmail,
  courseOrderConfirmedEmail,
  courseCertificateEmail,
  consultationRequestEmail,
  baoCaoGoogleSheetEmail,
  hoSoTangLeEmail,
  nghePdfEmail,
  trachNhatSinhNoPdfEmail,
  hopHonPdfEmail,
  kyMonMenhPdfEmail,
  batTuToanDienCoBanPdfEmail,
  batTuToanDienNangCaoPdfEmail,
  luanGiaiTuViCoBanPdfEmail,
  luanGiaiTuViNangCaoPdfEmail,
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

/**
 * Gửi HỒ SƠ PDF tang lễ kèm email (module Giờ Liệm – Hạ Huyệt).
 *
 * Dùng `safeSend` như mọi email khác: gửi thất bại chỉ log lại, KHÔNG throw — webhook SePay phải
 * trả 200 trong 30s, và tuyệt đối không được để lỗi email làm hỏng việc ghi nhận đơn đã thanh
 * toán. Khách vẫn tải được hồ sơ từ trang kết quả, nên email hụt không làm mất thứ đã mua.
 */
export async function sendHoSoTangLeEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  hoTenNguoiMat?: string | null;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = hoSoTangLeEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `ho-so-tang-le-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Định hướng nghề nghiệp kèm email (module Định Hướng Nghề Nghiệp). Dùng safeSend — lỗi chỉ log. */
export async function sendNghePdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = nghePdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `dinh-huong-nghe-nghiep-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Trạch Nhật Sinh Nở kèm email (module Trạch Nhật Sinh Nở). Dùng safeSend — lỗi chỉ log. */
export async function sendTrachNhatSinhNoPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = trachNhatSinhNoPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `trach-nhat-sinh-no-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Hợp Hôn Bát Tự × Tử Vi kèm email. Dùng safeSend — lỗi chỉ log. */
export async function sendHopHonPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = hopHonPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `hop-hon-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Luận Giải Kỳ Môn Mệnh chi tiết kèm email. Dùng safeSend — lỗi chỉ log. */
export async function sendKyMonMenhPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = kyMonMenhPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `ky-mon-menh-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Luận Giải Bát Tự Toàn Diện — Cơ Bản kèm email. Dùng safeSend — lỗi chỉ log. */
export async function sendBatTuToanDienCoBanPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = batTuToanDienCoBanPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `luan-giai-bat-tu-co-ban-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Luận Giải Bát Tự Toàn Diện — Nâng Cao kèm email. Dùng safeSend — lỗi chỉ log. */
export async function sendBatTuToanDienNangCaoPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = batTuToanDienNangCaoPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `luan-giai-bat-tu-nang-cao-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Luận Giải Tử Vi — Cơ Bản kèm email. Dùng safeSend — lỗi chỉ log. */
export async function sendLuanGiaiTuViCoBanPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = luanGiaiTuViCoBanPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `luan-giai-tu-vi-co-ban-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}

/** Gửi PDF Luận Giải Tử Vi — Nâng Cao kèm email. Dùng safeSend — lỗi chỉ log. */
export async function sendLuanGiaiTuViNangCaoPdfEmail(params: {
  to: string;
  orderCode: string;
  customerName: string;
  pdfBytes: Uint8Array;
}) {
  const { subject, html } = luanGiaiTuViNangCaoPdfEmail(params);
  await safeSend(params.to, subject, html, [
    { filename: `luan-giai-tu-vi-nang-cao-${params.orderCode}.pdf`, content: Buffer.from(params.pdfBytes) },
  ]);
}
