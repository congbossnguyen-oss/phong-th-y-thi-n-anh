import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { BeVietnamProRegularBase64 } from "./fonts/BeVietnamPro-Regular";
import { BeVietnamProSemiBoldBase64 } from "./fonts/BeVietnamPro-SemiBold";
import { BeVietnamProBoldBase64 } from "./fonts/BeVietnamPro-Bold";
import { BeVietnamProItalicBase64 } from "./fonts/BeVietnamPro-Italic";

const COLOR = {
  ink: rgb(0x24 / 255, 0x1a / 255, 0x15 / 255),
  inkMuted: rgb(0x6b / 255, 0x5c / 255, 0x4c / 255),
  ivory: rgb(0xfd / 255, 0xfa / 255, 0xf5 / 255),
  cinnabar: rgb(0xa3 / 255, 0x35 / 255, 0x2a / 255),
  gold300: rgb(0xdc / 255, 0xbd / 255, 0x7a / 255),
  gold500: rgb(0xad / 255, 0x88 / 255, 0x43 / 255),
  gold700: rgb(0x7c / 255, 0x62 / 255, 0x30 / 255),
};

function centeredText(page: PDFPage, text: string, opts: { y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb> }) {
  const width = opts.font.widthOfTextAtSize(text, opts.size);
  page.drawText(text, {
    x: (page.getWidth() - width) / 2,
    y: opts.y,
    size: opts.size,
    font: opts.font,
    color: opts.color,
  });
}

export interface CertificateParams {
  studentName: string;
  courseName: string;
  certificateCode: string;
  issuedAt: Date;
}

export async function generateCertificatePdf(params: CertificateParams): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const [regular, semibold, bold, italic] = await Promise.all([
    doc.embedFont(Buffer.from(BeVietnamProRegularBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProSemiBoldBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProBoldBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProItalicBase64, "base64")),
  ]);

  const width = 841.89; // A4 landscape (pt)
  const height = 595.28;
  const page = doc.addPage([width, height]);

  page.drawRectangle({ x: 0, y: 0, width, height, color: COLOR.ivory });

  // Khung viền đôi màu vàng đồng.
  const margin = 28;
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    borderColor: COLOR.gold500,
    borderWidth: 2,
  });
  const innerMargin = margin + 10;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: width - innerMargin * 2,
    height: height - innerMargin * 2,
    borderColor: COLOR.gold300,
    borderWidth: 1,
  });

  // Trang trí góc — 4 chấm vàng nhỏ tại 4 góc khung trong.
  for (const [cx, cy] of [
    [innerMargin, innerMargin],
    [width - innerMargin, innerMargin],
    [innerMargin, height - innerMargin],
    [width - innerMargin, height - innerMargin],
  ]) {
    page.drawCircle({ x: cx, y: cy, size: 3, color: COLOR.gold500 });
  }

  centeredText(page, "PHONG THỦY THIÊN ANH", { y: height - 100, size: 15, font: bold, color: COLOR.cinnabar });

  // Đường kẻ trang trí dưới tên công ty.
  page.drawLine({
    start: { x: width / 2 - 60, y: height - 112 },
    end: { x: width / 2 + 60, y: height - 112 },
    thickness: 1,
    color: COLOR.gold500,
  });

  centeredText(page, "CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC", { y: height - 165, size: 32, font: bold, color: COLOR.ink });

  centeredText(page, "Chứng nhận rằng", { y: height - 215, size: 13, font: italic, color: COLOR.inkMuted });

  centeredText(page, params.studentName, { y: height - 265, size: 30, font: semibold, color: COLOR.cinnabar });

  centeredText(page, "đã hoàn thành đầy đủ nội dung khóa học", { y: height - 305, size: 13, font: italic, color: COLOR.inkMuted });

  centeredText(page, params.courseName, { y: height - 345, size: 20, font: bold, color: COLOR.ink });

  const dateLabel = params.issuedAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Cột trái: mã chứng chỉ + ngày cấp.
  page.drawText(`Mã chứng chỉ: ${params.certificateCode}`, {
    x: innerMargin + 40,
    y: 95,
    size: 10,
    font: regular,
    color: COLOR.inkMuted,
  });
  page.drawText(`Ngày cấp: ${dateLabel}`, {
    x: innerMargin + 40,
    y: 78,
    size: 10,
    font: regular,
    color: COLOR.inkMuted,
  });

  // Cột phải: chữ ký.
  const signX = width - innerMargin - 220;
  page.drawLine({ start: { x: signX, y: 95 }, end: { x: signX + 180, y: 95 }, thickness: 1, color: COLOR.gold500 });
  const signLabel = "Giám đốc đào tạo";
  const signLabelWidth = semibold.widthOfTextAtSize(signLabel, 11);
  page.drawText(signLabel, { x: signX + (180 - signLabelWidth) / 2, y: 78, size: 11, font: semibold, color: COLOR.ink });
  const signSub = "Phong Thủy Thiên Anh";
  const signSubWidth = regular.widthOfTextAtSize(signSub, 9);
  page.drawText(signSub, { x: signX + (180 - signSubWidth) / 2, y: 64, size: 9, font: regular, color: COLOR.inkMuted });

  return doc.save();
}
