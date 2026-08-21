import { siteConfig } from "../site-config";

const BRAND = {
  ink: "#241a15",
  ivory: "#fdfaf5",
  cinnabar: "#a3352a",
  gold: "#ad8843",
};

const formatPrice = (price: number) =>
  Number(price).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

/**
 * Trung hoà ký tự HTML trước khi chèn dữ liệu người dùng vào email — chống HTML/link injection
 * (vd khách nhập thẻ <a> vào ô "Nội dung" form liên hệ → chèn link giả mạo vào hộp thư quản trị).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function siteUrl(): string {
  return (import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321").replace(/\/$/, "");
}

function layout(opts: { previewText: string; title: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:0;background-color:#f3ede2;font-family:Georgia,'Times New Roman',serif;">
    <span style="display:none;font-size:1px;color:#f3ede2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.previewText)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3ede2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background-color:${BRAND.ivory};border-radius:12px;overflow:hidden;border:1px solid #e8dfcd;">
            <tr>
              <td style="background-color:${BRAND.cinnabar};padding:24px 32px;">
                <span style="color:${BRAND.ivory};font-size:20px;font-weight:bold;letter-spacing:0.5px;">Phong Thủy Thiên Anh</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${BRAND.ink};font-size:15px;line-height:1.6;">
                <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND.ink};">${escapeHtml(opts.title)}</h1>
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f4e9cf22;border-top:1px solid #e8dfcd;color:#8a7a68;font-size:12px;">
                Đây là email tự động từ hệ thống Phong Thủy Thiên Anh — vui lòng không trả lời trực tiếp email này.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#6b5c4c;font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;text-align:right;font-weight:bold;color:${BRAND.ink};font-size:14px;">${escapeHtml(value)}</td>
  </tr>`;
}

export function productOrderConfirmedEmail(params: {
  orderCode: string;
  customerName: string;
  totalAmount: number;
  items: { name: string; qty: number; price: number }[];
  shippingAddress: string;
}): { subject: string; html: string } {
  const itemsHtml = params.items
    .map(
      (it) => `<tr>
        <td style="padding:6px 0;color:${BRAND.ink};font-size:14px;">${escapeHtml(it.name)} × ${it.qty}</td>
        <td style="padding:6px 0;text-align:right;color:${BRAND.ink};font-size:14px;">${formatPrice(it.price * it.qty)}</td>
      </tr>`
    )
    .join("");

  const bodyHtml = `
    <p>Xin chào ${escapeHtml(params.customerName)},</p>
    <p>Thiên Anh đã nhận được thanh toán cho đơn hàng <strong>#${escapeHtml(params.orderCode)}</strong>. Đơn hàng của bạn đang được chuẩn bị và sẽ sớm được giao đến địa chỉ đã cung cấp.</p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${itemsHtml}
    </table>
    <table role="presentation" width="100%" style="margin-top:8px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Tổng cộng", formatPrice(params.totalAmount))}
      ${infoRow("Địa chỉ giao hàng", params.shippingAddress)}
    </table>
    <p style="margin-top:20px;">Cảm ơn bạn đã tin tưởng Phong Thủy Thiên Anh.</p>
  `;

  return {
    subject: `Đã xác nhận thanh toán đơn hàng #${params.orderCode}`,
    html: layout({ previewText: `Đơn hàng #${params.orderCode} đã được xác nhận thanh toán.`, title: "Thanh toán thành công", bodyHtml }),
  };
}

export function courseOrderConfirmedEmail(params: {
  orderCode: string;
  customerName: string;
  courseName: string;
  totalAmount: number;
  courseSlug: string;
}): { subject: string; html: string } {
  const courseUrl = `${siteUrl()}/hoc-vien/khoa-hoc/${params.courseSlug}`;

  const bodyHtml = `
    <p>Xin chào ${escapeHtml(params.customerName)},</p>
    <p>Cảm ơn bạn đã đăng ký khóa học <strong>${escapeHtml(params.courseName)}</strong> tại Phong Thủy Thiên Anh. Thanh toán của bạn đã được xác nhận và khóa học đã được kích hoạt trong tài khoản.</p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Mã đơn hàng", `#${params.orderCode}`)}
      ${infoRow("Học phí", formatPrice(params.totalAmount))}
    </table>
    <div style="margin-top:24px;text-align:center;">
      <a href="${courseUrl}" style="display:inline-block;background-color:${BRAND.cinnabar};color:${BRAND.ivory};text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px;">Vào học ngay</a>
    </div>
    <p style="margin-top:20px;">Chúc bạn học tập hiệu quả cùng Thiên Anh.</p>
  `;

  return {
    subject: `Đăng ký thành công khóa học: ${params.courseName}`,
    html: layout({ previewText: `Khóa học ${params.courseName} đã được kích hoạt.`, title: "Đăng ký khóa học thành công", bodyHtml }),
  };
}

export function consultationRequestEmail(params: {
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p>Có 1 yêu cầu đặt lịch tư vấn mới từ website.</p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Họ tên", params.name)}
      ${infoRow("Số điện thoại", params.phone)}
      ${params.email ? infoRow("Email", params.email) : ""}
      ${params.topic ? infoRow("Nhu cầu tư vấn", params.topic) : ""}
    </table>
    ${params.message ? `<p style="margin-top:16px;color:${BRAND.ink};"><strong>Nội dung:</strong><br/>${escapeHtml(params.message).replace(/\n/g, "<br/>")}</p>` : ""}
    <p style="margin-top:20px;">Vui lòng liên hệ lại khách trong vòng 24 giờ làm việc.</p>
  `;

  return {
    subject: `Yêu cầu tư vấn mới: ${params.name} (${params.phone})`,
    html: layout({ previewText: `${params.name} — ${params.phone} vừa gửi yêu cầu tư vấn.`, title: "Yêu cầu đặt lịch tư vấn mới", bodyHtml }),
  };
}

export function courseCertificateEmail(params: {
  customerName: string;
  courseName: string;
  certificateCode: string;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p>Xin chào ${escapeHtml(params.customerName)},</p>
    <p>Chúc mừng bạn đã hoàn thành khóa học <strong>${escapeHtml(params.courseName)}</strong>! Chứng chỉ hoàn thành khóa học được đính kèm trong email này.</p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Mã chứng chỉ", params.certificateCode)}
    </table>
    <p style="margin-top:20px;">Cảm ơn bạn đã đồng hành cùng Phong Thủy Thiên Anh trong suốt khóa học.</p>
  `;

  return {
    subject: `Chứng chỉ hoàn thành khóa học: ${params.courseName}`,
    html: layout({ previewText: `Chứng chỉ hoàn thành khóa học ${params.courseName}.`, title: "Chúc mừng bạn đã hoàn thành khóa học!", bodyHtml }),
  };
}

/**
 * Báo cáo nội bộ gửi cho anh Công MỖI KHI có bản ghi mới đẩy sang Google Sheet.
 *
 * Yêu cầu của anh Công 2026-08-16: Sheet ghi gì thì email báo cái đó. Lý do thực tế — Sheet có thể
 * ghi hụt (Apps Script lỗi, hết quota, deploy sai version) mà không ai biết; email là bản sao độc
 * lập để đối chiếu.
 */
export function baoCaoGoogleSheetEmail(params: {
  /** Loại bản ghi, vd "Đơn thu phí" / "Lượt dùng mã khuyến mãi". */
  loai: string;
  /** Tiêu đề ngắn để nhận ra ngay trong hộp thư. */
  tomTat: string;
  /** Các dòng thông tin, hiển thị theo đúng thứ tự truyền vào. */
  dong: { nhan: string; giaTri: string }[];
  /** Đường dẫn tới Sheet tương ứng, nếu có. */
  linkSheet?: string;
  /** true nếu ghi Sheet THẤT BẠI — email lúc này là bản ghi duy nhất, phải nổi bật. */
  sheetLoi?: boolean;
}): { subject: string; html: string } {
  const canhBao = params.sheetLoi
    ? `<p style="margin:0 0 16px;padding:12px;border-radius:8px;background:#fdecea;color:#8a1c12;">
         <strong>⚠️ Ghi Google Sheet THẤT BẠI.</strong> Email này đang là bản ghi duy nhất —
         vui lòng nhập tay vào Sheet để không thất lạc số liệu.
       </p>`
    : "";

  const bodyHtml = `
    ${canhBao}
    <p>${escapeHtml(params.loai)} vừa được ghi nhận trên website.</p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${params.dong.map((d) => infoRow(d.nhan, d.giaTri)).join("")}
    </table>
    ${params.linkSheet ? `<p style="margin-top:20px;"><a href="${params.linkSheet}">Mở Google Sheet để xem đầy đủ</a></p>` : ""}
  `;

  return {
    subject: `[${params.loai}] ${params.tomTat}`,
    html: layout({ previewText: params.tomTat, title: params.loai, bodyHtml }),
  };
}

/**
 * Email kèm HỒ SƠ PDF chọn ngày giờ tang lễ (module Giờ Liệm – Hạ Huyệt).
 *
 * Giọng văn phải rất tiết chế: người nhận đang có tang. Không cảm ơn hoa mỹ, không mời chào dịch
 * vụ khác, không "chúc mừng" — chỉ đưa đúng thứ họ đã trả tiền và cách liên hệ khi cần hỏi thêm.
 */
export function hoSoTangLeEmail(params: {
  orderCode: string;
  customerName: string;
  hoTenNguoiMat?: string | null;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p>Kính gửi ${escapeHtml(params.customerName)},</p>
    <p>
      Hồ sơ chọn ngày giờ tang lễ${params.hoTenNguoiMat ? ` cho ${escapeHtml(params.hoTenNguoiMat)}` : ""} được đính kèm
      trong email này, gồm giờ liệm, giờ đóng quan, giờ di quan, ngày giờ hạ huyệt và các tuổi cần tránh mặt.
    </p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Mã đơn hàng", params.orderCode)}
    </table>
    <p style="margin-top:20px;">
      Gia đình nên in hồ sơ ra để tiện đối chiếu tại chỗ. Nếu có điểm nào cần hỏi thêm, xin liên hệ trực tiếp
      hotline ${siteConfig.hotline} — chúng tôi hỗ trợ ngoài giờ trong trường hợp tang sự.
    </p>
  `;

  return {
    subject: `Hồ sơ chọn ngày giờ tang lễ — đơn ${params.orderCode}`,
    html: layout({
      previewText: "Hồ sơ chọn ngày giờ tang lễ được đính kèm trong email này.",
      title: "Hồ sơ chọn ngày giờ tang lễ",
      bodyHtml,
    }),
  };
}

export function nghePdfEmail(params: {
  orderCode: string;
  customerName: string;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p>Kính gửi ${escapeHtml(params.customerName)},</p>
    <p>
      Bản Định hướng nghề nghiệp (kết hợp hai hệ Bát Tự × Tử Vi) được đính kèm dưới dạng PDF trong email này,
      gồm: hồ sơ lá số, 5 trục năng lực, nhóm ngành nên theo, các giai đoạn vận, và mức đồng thuận giữa hai hệ
      kèm gợi ý lộ trình.
    </p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Mã đơn hàng", params.orderCode)}
    </table>
    <p style="margin-top:20px;">
      Đây là định hướng theo mô hình phân tích cấu trúc lá số — mang tính tham khảo, nên kết hợp với năng lực,
      sở thích và điều kiện thực tế. Cần trao đổi thêm, xin liên hệ hotline ${siteConfig.hotline}.
    </p>
  `;

  return {
    subject: `Định hướng nghề nghiệp (Bát Tự × Tử Vi) — đơn ${params.orderCode}`,
    html: layout({
      previewText: "Bản định hướng nghề nghiệp của bạn được đính kèm trong email này.",
      title: "Định hướng nghề nghiệp — Bát Tự × Tử Vi",
      bodyHtml,
    }),
  };
}

export function trachNhatSinhNoPdfEmail(params: {
  orderCode: string;
  customerName: string;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p>Kính gửi ${escapeHtml(params.customerName)},</p>
    <p>
      Bản Chọn Ngày Giờ Sinh Cho Bé (trạch nhật sinh nở, kết hợp Bát Tự × Tử Vi) được đính kèm dưới dạng PDF
      trong email này, gồm: phương án ưu tiên, tối đa 2 phương án dự phòng, giải thích vì sao chọn, và các
      khuyết điểm cần lưu ý của từng phương án.
    </p>
    <table role="presentation" width="100%" style="margin-top:16px;border-top:1px solid #e8dfcd;padding-top:12px;">
      ${infoRow("Mã đơn hàng", params.orderCode)}
    </table>
    <p style="margin-top:20px;">
      <strong>Lưu ý quan trọng:</strong> chỉ định y khoa của bác sĩ luôn là quyết định cuối cùng — kết quả chỉ
      được chọn trong khung thời gian y tế cho phép. Ngày giờ sinh là một biến trong nhiều biến của cuộc đời;
      giáo dục và môi trường nuôi dưỡng quan trọng không kém. Cần trao đổi thêm, xin liên hệ hotline
      ${siteConfig.hotline}.
    </p>
  `;

  return {
    subject: `Chọn Ngày Giờ Sinh Cho Bé — đơn ${params.orderCode}`,
    html: layout({
      previewText: "Bản chọn ngày giờ sinh cho bé được đính kèm trong email này.",
      title: "Chọn Ngày Giờ Sinh Cho Bé",
      bodyHtml,
    }),
  };
}
