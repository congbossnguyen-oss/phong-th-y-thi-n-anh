/**
 * KHUNG PDF DÙNG CHUNG cho các phiếu kết quả công cụ thu phí (Nhận Chức, Ký Hợp Đồng, Cưới Hỏi,
 * Xem Ngày Cao Cấp, Đặt Tên…).
 *
 * Tách ra từ bố cục đã kiểm chứng của `ho-so-tang-le-pdf.ts` (Giờ Liệm) — bút vẽ tự ngắt trang,
 * font tiếng Việt nhúng sẵn (dùng lại bộ font chứng chỉ, KHÔNG nhúng thêm bản sao), header có
 * logo + tiêu đề, footer đánh số trang. Mỗi tool chỉ cần viết phần NỘI DUNG ở giữa.
 *
 * ⚠️ CỐ Ý không sửa `ho-so-tang-le-pdf.ts` (bản đang chạy) để khỏi rủi ro — module này là bản
 * dùng chung cho các phiếu MỚI. Khi rảnh có thể cho Giờ Liệm dùng lại khung này để bớt trùng.
 */
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { BeVietnamProRegularBase64 } from "../certificate/fonts/BeVietnamPro-Regular";
import { BeVietnamProSemiBoldBase64 } from "../certificate/fonts/BeVietnamPro-SemiBold";
import { BeVietnamProBoldBase64 } from "../certificate/fonts/BeVietnamPro-Bold";
import { BeVietnamProItalicBase64 } from "../certificate/fonts/BeVietnamPro-Italic";
import { siteConfig } from "../site-config";
import { LogoThienAnhBase64 } from "./assets/logo-thien-anh";

export const A4 = { w: 595.28, h: 841.89 };
export const LE = 48; // lề trái/phải
const DAY_CUOI = 64; // chừa chỗ cho chân trang

export const MAU = {
  muc: rgb(0x24 / 255, 0x1a / 255, 0x10 / 255),
  mucNhat: rgb(0x6b / 255, 0x5c / 255, 0x4c / 255),
  vang: rgb(0x7c / 255, 0x62 / 255, 0x30 / 255),
  vangNhat: rgb(0xdc / 255, 0xbd / 255, 0x7a / 255),
  son: rgb(0xa3 / 255, 0x35 / 255, 0x2a / 255),
  nen: rgb(0xfd / 255, 0xfa / 255, 0xf5 / 255),
  luc: rgb(0x2f / 255, 0x6d / 255, 0x4a / 255),
  lam: rgb(0x2b / 255, 0x54 / 255, 0x7e / 255),
} as const;

export interface Fonts {
  thuong: PDFFont;
  vua: PDFFont;
  dam: PDFFont;
  nghieng: PDFFont;
}

/**
 * Bút vẽ có tự ngắt trang. Mọi hàm vẽ đều đi qua đây để chữ không bao giờ tràn khỏi trang —
 * phiếu này in ra giấy nên tràn là hỏng, không như web còn cuộn được.
 */
export class But {
  page: PDFPage;
  y: number;
  private soTrang = 1;
  /**
   * Khoảng cách THÊM giữa các dòng trong `doan()` (đoạn văn tự xuống dòng), ngoài chiều cao font.
   * Mặc định 3 (hành vi cũ, giữ nguyên cho mọi phiếu hiện có). Đổi giá trị này ngay sau khi tạo `But`
   * để giãn dòng cho CẢ tài liệu — dùng cho báo cáo dài chữ dày đặc (Bát Tự/Tử Vi) đỡ căng mắt hơn,
   * không đụng tới các phiếu ngắn khác đang dùng mặc định.
   */
  giaDong = 3;

  constructor(
    private doc: PDFDocument,
    private f: Fonts,
  ) {
    this.page = this.trangMoi();
    this.y = A4.h - 56;
  }

  private trangMoi(): PDFPage {
    const p = this.doc.addPage([A4.w, A4.h]);
    p.drawRectangle({ x: 0, y: 0, width: A4.w, height: A4.h, color: MAU.nen });
    return p;
  }

  /** Đảm bảo còn đủ `can` điểm chiều cao; không đủ thì sang trang mới. */
  chua(can: number): void {
    if (this.y - can >= DAY_CUOI) return;
    this.page = this.trangMoi();
    this.soTrang++;
    this.y = A4.h - 56;
  }

  xuong(d: number): void {
    this.y -= d;
  }

  /** Vẽ 1 dòng CĂN GIỮA trang. */
  dongGiua(text: string, o: { size?: number; font?: PDFFont; mau?: RGB; dan?: number } = {}): void {
    const size = o.size ?? 10;
    const font = o.font ?? this.f.thuong;
    this.chua(size + 4);
    const chu = catVua(text, font, size, A4.w - LE * 2);
    this.page.drawText(chu, {
      x: (A4.w - font.widthOfTextAtSize(chu, size)) / 2,
      y: this.y,
      size,
      font,
      color: o.mau ?? MAU.muc,
    });
    this.y -= size + (o.dan ?? 4);
  }

  /** Vẽ ảnh ở tọa độ tuyệt đối, không đụng con trỏ dòng. */
  anh(img: { width: number; height: number }, x: number, yDay: number, rong: number): void {
    const cao = (img.height / img.width) * rong;
    this.page.drawImage(img as Parameters<PDFPage["drawImage"]>[0], { x, y: yDay, width: rong, height: cao });
  }

  /** Vẽ 1 dòng, tự cắt cho vừa bề ngang. */
  dong(text: string, o: { size?: number; font?: PDFFont; mau?: RGB; x?: number; dan?: number } = {}): void {
    const size = o.size ?? 10;
    const font = o.font ?? this.f.thuong;
    const x = o.x ?? LE;
    this.chua(size + 4);
    this.page.drawText(catVua(text, font, size, A4.w - x - LE), {
      x,
      y: this.y,
      size,
      font,
      color: o.mau ?? MAU.muc,
    });
    this.y -= size + (o.dan ?? 4);
  }

  /** Vẽ đoạn dài, tự xuống dòng theo bề ngang. CHÚ Ý: gộp mọi khoảng trắng kể cả "\n" gốc trong
   *  `text` (ngatDong tách theo \s+) — dùng cho văn xuôi liền mạch, không giữ được xuống dòng/gạch
   *  đầu dòng có chủ đích. Nội dung có cấu trúc (nhiều đoạn/liệt kê) thì dùng `doanCoCauTruc`. */
  doan(text: string, o: { size?: number; font?: PDFFont; mau?: RGB; x?: number; dan?: number } = {}): void {
    const size = o.size ?? 9;
    const font = o.font ?? this.f.thuong;
    const x = o.x ?? LE;
    for (const d of ngatDong(text, font, size, A4.w - x - LE)) {
      this.dong(d, { ...o, size, font, x, dan: o.dan ?? this.giaDong });
    }
  }

  /**
   * Như `doan()` nhưng GIỮ NGUYÊN xuống dòng thật ("\n") trong `text` — mỗi dòng gốc tự xuống dòng
   * riêng theo bề ngang (không gộp chung 1 khối). Dòng bắt đầu bằng "- " hoặc "•" được vẽ thành mục
   * liệt kê thụt lề (đổi dấu về "•" thống nhất). Dùng cho nội dung AI viết theo cấu trúc "đoạn ngắn
   * + liệt kê" (anh Công yêu cầu 2/9/2026, xem ai-narrative.ts "Yêu cầu định dạng") — trước đó mọi
   * nội dung AI đều là 1 khối văn xuôi liền mạch nên chỉ cần `doan()` là đủ.
   */
  doanCoCauTruc(text: string, o: { size?: number; font?: PDFFont; mau?: RGB; x?: number } = {}): void {
    const size = o.size ?? 9;
    const font = o.font ?? this.f.thuong;
    const xGoc = o.x ?? LE;
    const dong = text
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
    for (const d of dong) {
      const laGachDau = /^[-•]\s*/.test(d);
      const noiDung = laGachDau ? `• ${d.replace(/^[-•]\s*/, "")}` : d;
      this.doan(noiDung, { size, font, mau: o.mau, x: laGachDau ? xGoc + 10 : xGoc });
    }
  }

  /** Tiêu đề mục — chip vuông màu + chữ hoa, gạch chân đôi (vàng chính + son điểm nhấn ngắn). */
  muc(text: string): void {
    this.chua(36);
    this.y -= 12;
    const size = 11;
    const chip = 8;
    this.page.drawRectangle({ x: LE, y: this.y + (size - chip) / 2, width: chip, height: chip, color: MAU.son });
    this.dong(text.toUpperCase(), { size, font: this.f.dam, mau: MAU.vang, x: LE + chip + 8, dan: 6 });
    this.page.drawLine({
      start: { x: LE, y: this.y + 4 },
      end: { x: A4.w - LE, y: this.y + 4 },
      thickness: 0.8,
      color: MAU.vangNhat,
    });
    this.page.drawLine({
      start: { x: LE, y: this.y + 4 },
      end: { x: LE + 26, y: this.y + 4 },
      thickness: 1.6,
      color: MAU.son,
    });
    this.y -= 8;
  }

  /** Khung nổi bật (callout) nền màu nhạt + viền — dùng cho khối "Lưu ý" hoặc số liệu tổng quan. */
  khoi(cao: number, mauVien: RGB = MAU.vangNhat): void {
    this.chua(cao + 6);
    const yDay = this.y - cao;
    this.page.drawRectangle({ x: LE, y: yDay, width: A4.w - LE * 2, height: cao, color: mauVien, opacity: 0.07 });
    this.page.drawRectangle({
      x: LE,
      y: yDay,
      width: A4.w - LE * 2,
      height: cao,
      borderColor: mauVien,
      borderWidth: 0.8,
    });
  }

  /** Nhãn dạng viên thuốc (pill) nền màu đậm, chữ trắng — cho xếp hạng/mức độ ("TOP 1", "TỐT"…).
   *  Vẽ tại toạ độ tuyệt đối (x, yDay = mép dưới), không đụng con trỏ dòng. Trả về bề rộng đã vẽ. */
  nhan(text: string, x: number, yDay: number, o: { mau: RGB; font?: PDFFont; size?: number } ): number {
    const font = o.font ?? this.f.dam;
    const size = o.size ?? 8;
    const padX = 7;
    const h = size + 7;
    const r = h / 2;
    const w = Math.max(h, font.widthOfTextAtSize(text, size) + padX * 2);
    this.page.drawEllipse({ x: x + r, y: yDay + r, xScale: r, yScale: r, color: o.mau });
    this.page.drawEllipse({ x: x + w - r, y: yDay + r, xScale: r, yScale: r, color: o.mau });
    if (w > h) this.page.drawRectangle({ x: x + r, y: yDay, width: w - h, height: h, color: o.mau });
    this.page.drawText(text, {
      x: x + (w - font.widthOfTextAtSize(text, size)) / 2,
      y: yDay + (h - size) / 2 + 1,
      size,
      font,
      color: rgb(1, 1, 1),
    });
    return w;
  }

  /** Ghi lại vị trí hiện tại — dùng với `thanhNhan()` để vẽ thanh màu bên trái SAU khi đã vẽ xong
   *  nội dung 1 khối (tránh phải đo trước chiều cao khi số dòng thay đổi tuỳ dữ liệu). */
  danhDau(): { page: PDFPage; y: number } {
    return { page: this.page, y: this.y };
  }

  /** Vẽ thanh nhấn màu dọc bên trái từ mốc `danhDau()` tới vị trí hiện tại. Bỏ qua nếu khối đã
   *  tràn sang trang mới (hiếm, và không đáng để trang trí phức tạp thêm). */
  thanhNhan(moc: { page: PDFPage; y: number }, mau: RGB): void {
    if (moc.page !== this.page) return;
    const cao = moc.y - this.y;
    if (cao <= 0) return;
    this.page.drawRectangle({ x: LE - 10, y: this.y, width: 3, height: cao, color: mau });
  }

  get tongTrang(): number {
    return this.soTrang;
  }
}

export function catVua(text: string, font: PDFFont, size: number, rong: number): string {
  if (font.widthOfTextAtSize(text, size) <= rong) return text;
  let s = text;
  while (s.length > 1 && font.widthOfTextAtSize(s + "…", size) > rong) s = s.slice(0, -1);
  return s + "…";
}

export function ngatDong(text: string, font: PDFFont, size: number, rong: number): string[] {
  const tu = text.split(/\s+/).filter(Boolean);
  const ra: string[] = [];
  let hienTai = "";
  for (const t of tu) {
    const thu = hienTai ? `${hienTai} ${t}` : t;
    if (font.widthOfTextAtSize(thu, size) <= rong) {
      hienTai = thu;
    } else {
      if (hienTai) ra.push(hienTai);
      hienTai = t;
    }
  }
  if (hienTai) ra.push(hienTai);
  return ra;
}

/** Đổi màu hex ("#166534") sang RGB pdf-lib — để tái dùng đúng màu badge đã tính sẵn trên web. */
export function hex(ma: string): RGB {
  const s = ma.replace("#", "");
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const bl = parseInt(s.slice(4, 6), 16) / 255;
  return rgb(r, g, bl);
}

export function ngayVN(d: { day: number; month: number; year: number }): string {
  return `${String(d.day).padStart(2, "0")}/${String(d.month).padStart(2, "0")}/${d.year}`;
}

/** Tạo tài liệu PDF + nhúng 4 kiểu font tiếng Việt. Dùng ở đầu mọi generator. */
export async function taoTaiLieuPdf(): Promise<{ doc: PDFDocument; f: Fonts; b: But }> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [thuong, vua, dam, nghieng] = await Promise.all([
    doc.embedFont(Buffer.from(BeVietnamProRegularBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProSemiBoldBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProBoldBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProItalicBase64, "base64")),
  ]);
  const f: Fonts = { thuong, vua, dam, nghieng };
  return { doc, f, b: new But(doc, f) };
}

/** Vẽ đầu phiếu: dải nền màu ngà + logo góc trái + tiêu đề/phụ đề căn giữa + tên & khẩu hiệu công ty. */
export async function veDauTrang(
  doc: PDFDocument,
  b: But,
  f: Fonts,
  o: { tieuDe: string; phuDe?: string },
): Promise<void> {
  const logo = await doc.embedPng(Buffer.from(LogoThienAnhBase64, "base64"));
  const LOGO_RONG = 62;
  const logoCao = (logo.height / logo.width) * LOGO_RONG;
  const BAND_CAO = 132;
  b.page.drawRectangle({ x: 0, y: A4.h - BAND_CAO, width: A4.w, height: BAND_CAO, color: MAU.vangNhat, opacity: 0.14 });
  b.anh(logo, LE, A4.h - 46 - logoCao, LOGO_RONG);

  b.y = A4.h - 58;
  b.dongGiua(o.tieuDe.toUpperCase(), { size: 16, font: f.dam, mau: MAU.son, dan: 6 });
  if (o.phuDe) b.dongGiua(o.phuDe, { size: 10, font: f.vua, mau: MAU.vang, dan: 6 });
  b.dongGiua(siteConfig.name.toUpperCase(), { size: 9, font: f.vua, mau: MAU.mucNhat, dan: 2 });
  b.dongGiua(siteConfig.tagline, { size: 8, font: f.nghieng, mau: MAU.mucNhat, dan: 8 });
  b.y = Math.min(b.y, A4.h - BAND_CAO - 4);
  b.page.drawLine({ start: { x: LE, y: b.y + 4 }, end: { x: A4.w - LE, y: b.y + 4 }, thickness: 1.2, color: MAU.vang });
  b.page.drawLine({
    start: { x: A4.w / 2 - 16, y: b.y },
    end: { x: A4.w / 2 + 16, y: b.y },
    thickness: 1.6,
    color: MAU.son,
  });
  b.y -= 14;
}

/** Khối "Lưu ý & liên hệ" chuẩn ở cuối phiếu. */
export function veLuuYVaLienHe(b: But, f: Fonts, luuY: string): void {
  b.muc("Lưu ý");
  b.doan(luuY, { size: 9, font: f.thuong });
  b.doan(
    "Kết quả được tính theo phương pháp mệnh lý cổ truyền đã cấu hình trong hệ thống, mang tính tham khảo. " +
      "Với tình huống đặc biệt, xin trao đổi trực tiếp với chuyên gia trước khi quyết định.",
    { size: 9, mau: MAU.mucNhat },
  );
  b.xuong(6);
  b.doan(`${siteConfig.name} · Hotline ${siteConfig.hotline} · ${siteConfig.email}`, { size: 9, font: f.vua });
  b.doan(siteConfig.address, { size: 8.5, mau: MAU.mucNhat });
}

/** Vẽ chân trang (tên công ty + số trang) trên MỌI trang. Gọi cuối cùng, ngay trước doc.save(). */
export function veChanTrang(doc: PDFDocument, f: Fonts, maDon?: string): void {
  const ngayXuat = new Date().toLocaleDateString("vi-VN");
  const trangs = doc.getPages();
  trangs.forEach((page, i) => {
    page.drawLine({
      start: { x: LE, y: 44 },
      end: { x: A4.w - LE, y: 44 },
      thickness: 0.6,
      color: MAU.vangNhat,
    });
    const trai = `${siteConfig.name} — lập ngày ${ngayXuat}${maDon ? ` · đơn ${maDon}` : ""}`;
    page.drawText(catVua(trai, f.thuong, 7.5, A4.w - LE * 2 - 60), {
      x: LE,
      y: 32,
      size: 7.5,
      font: f.thuong,
      color: MAU.mucNhat,
    });
    const so = `Trang ${i + 1}/${trangs.length}`;
    page.drawText(so, {
      x: A4.w - LE - f.thuong.widthOfTextAtSize(so, 7.5),
      y: 32,
      size: 7.5,
      font: f.thuong,
      color: MAU.mucNhat,
    });
  });
}
