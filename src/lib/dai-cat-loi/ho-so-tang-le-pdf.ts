/**
 * HỒ SƠ PDF — Chọn giờ liệm / đóng quan / ngày giờ hạ huyệt (+ Phase 2 nếu có tọa hướng mộ).
 *
 * Đặc tả Phase 2 mục 9: ở mức giá này đầu ra phải là HỒ SƠ tải về được, không chỉ bảng HTML —
 * "khách trả 999k kỳ vọng thứ cầm được, in được, đưa họ hàng xem".
 *
 * Dùng lại nguyên bộ font tiếng Việt đã nhúng cho chứng chỉ khóa học (`src/lib/certificate/fonts`)
 * — KHÔNG nhúng thêm bản sao font, file base64 rất nặng.
 */
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { BeVietnamProRegularBase64 } from "../certificate/fonts/BeVietnamPro-Regular";
import { BeVietnamProSemiBoldBase64 } from "../certificate/fonts/BeVietnamPro-SemiBold";
import { BeVietnamProBoldBase64 } from "../certificate/fonts/BeVietnamPro-Bold";
import { BeVietnamProItalicBase64 } from "../certificate/fonts/BeVietnamPro-Italic";
import { siteConfig } from "../site-config";
import { LogoThienAnhBase64 } from "./assets/logo-thien-anh";

const A4 = { w: 595.28, h: 841.89 };
const LE = 48; // lề trái/phải
const DAY_CUOI = 64; // chừa chỗ cho chân trang

const MAU = {
  muc: rgb(0x24 / 255, 0x1a / 255, 0x10 / 255),
  mucNhat: rgb(0x6b / 255, 0x5c / 255, 0x4c / 255),
  vang: rgb(0x7c / 255, 0x62 / 255, 0x30 / 255),
  vangNhat: rgb(0xdc / 255, 0xbd / 255, 0x7a / 255),
  son: rgb(0xa3 / 255, 0x35 / 255, 0x2a / 255),
  nen: rgb(0xfd / 255, 0xfa / 255, 0xf5 / 255),
};

interface Fonts {
  thuong: PDFFont;
  vua: PDFFont;
  dam: PDFFont;
  nghieng: PDFFont;
}

/**
 * Bút vẽ có tự ngắt trang. Mọi hàm vẽ đều đi qua đây để không bao giờ có chữ tràn khỏi trang —
 * hồ sơ này in ra giấy nên tràn là hỏng hẳn, không như trên web còn cuộn được.
 */
class But {
  page: PDFPage;
  y: number;
  private soTrang = 1;

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

  /** Vẽ ảnh ở tọa độ tuyệt đối, không đụng tới con trỏ dòng. */
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

  /** Vẽ đoạn dài, tự xuống dòng theo bề ngang. */
  doan(text: string, o: { size?: number; font?: PDFFont; mau?: RGB; x?: number } = {}): void {
    const size = o.size ?? 9;
    const font = o.font ?? this.f.thuong;
    const x = o.x ?? LE;
    for (const d of ngatDong(text, font, size, A4.w - x - LE)) {
      this.dong(d, { ...o, size, font, x, dan: 3 });
    }
  }

  /** Tiêu đề mục, có gạch chân vàng. */
  muc(text: string): void {
    this.chua(34);
    this.y -= 10;
    this.dong(text.toUpperCase(), { size: 11, font: this.f.dam, mau: MAU.vang, dan: 5 });
    this.page.drawLine({
      start: { x: LE, y: this.y + 4 },
      end: { x: A4.w - LE, y: this.y + 4 },
      thickness: 0.8,
      color: MAU.vangNhat,
    });
    this.y -= 8;
  }

  get tongTrang(): number {
    return this.soTrang;
  }
}

function catVua(text: string, font: PDFFont, size: number, rong: number): string {
  if (font.widthOfTextAtSize(text, size) <= rong) return text;
  let s = text;
  while (s.length > 1 && font.widthOfTextAtSize(s + "…", size) > rong) s = s.slice(0, -1);
  return s + "…";
}

function ngatDong(text: string, font: PDFFont, size: number, rong: number): string[] {
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

/**
 * Đổi mã nội bộ sang chữ tiếng Việt. Hồ sơ giao cho tang gia TUYỆT ĐỐI không được lọt mã kỹ thuật
 * kiểu "nhap-mo", "tam-hop" — đây là giấy đưa họ hàng đọc, không phải log hệ thống.
 */
const NHAN_PHAN_LOAI: Record<string, string> = {
  "nhap-mo": "Nhập Mộ",
  "thien-di": "Thiên Di",
  "trung-tang": "Trùng Tang",
};
const NHAN_HOP_VONG: Record<string, string> = {
  "tam-hop": "tam hợp",
  "luc-hop": "lục hợp",
};

/** Trả về chữ tiếng Việt; gặp mã lạ thì bỏ qua hẳn thay vì in mã ra cho khách đọc. */
function chuViet(bang: Record<string, string>, ma: unknown): string | null {
  return typeof ma === "string" ? (bang[ma] ?? null) : null;
}

function ngayVN(d: { ngay: number; thang: number; nam: number }): string {
  return `${String(d.ngay).padStart(2, "0")}/${String(d.thang).padStart(2, "0")}/${d.nam}`;
}

// -------------------------------------------------------------------------------------------

export interface HoSoTangLeParams {
  /** Họ tên người mất — để trống thì hồ sơ ghi "(chưa cung cấp)", không bịa. */
  hoTenNguoiMat?: string;
  gioiTinh: "nam" | "nu";
  namSinhDuongLich: number;
  ngayMat: { ngay: number; thang: number; nam: number };
  chiGioMat: string;
  /** Kết quả Phase 1 (kiểu lỏng để tầng này không phụ thuộc ngược vào engine). */
  ketQua: any;
  /** Kết quả Phase 2, có thì in thêm mục tọa hướng. */
  phase2?: any;
  /** Ngày âm lịch tương ứng từng phương án hạ huyệt, do tầng gọi tra sẵn. */
  amLichHaHuyet?: Record<string, string>;
}

export async function generateHoSoTangLePdf(p: HoSoTangLeParams): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [thuong, vua, dam, nghieng] = await Promise.all([
    doc.embedFont(Buffer.from(BeVietnamProRegularBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProSemiBoldBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProBoldBase64, "base64")),
    doc.embedFont(Buffer.from(BeVietnamProItalicBase64, "base64")),
  ]);
  const f: Fonts = { thuong, vua, dam, nghieng };
  const b = new But(doc, f);
  const r = p.ketQua ?? {};

  // --- Đầu hồ sơ: logo góc trái, tiêu đề căn giữa ---
  const logo = await doc.embedPng(Buffer.from(LogoThienAnhBase64, "base64"));
  const LOGO_RONG = 62;
  const logoCao = (logo.height / logo.width) * LOGO_RONG;
  // Vẽ logo trước, neo theo mép trên; khối tiêu đề căn giữa theo bề ngang cả trang nên không bị
  // logo đẩy lệch — logo nằm ở lớp riêng, không chiếm chỗ trong dòng chảy văn bản.
  b.anh(logo, LE, A4.h - 46 - logoCao, LOGO_RONG);

  b.y = A4.h - 58;
  b.dongGiua("HỒ SƠ CHỌN NGÀY TANG LỄ", { size: 16, font: dam, mau: MAU.son, dan: 6 });
  b.dongGiua("Giờ liệm · Giờ đóng quan · Di quan · Hạ huyệt", { size: 10, font: vua, mau: MAU.vang, dan: 6 });
  // Tên và khẩu hiệu công ty lùi xuống dưới tiêu đề, vẫn căn giữa cho cân với logo bên trái.
  b.dongGiua(siteConfig.name.toUpperCase(), { size: 9, font: vua, mau: MAU.mucNhat, dan: 2 });
  b.dongGiua(siteConfig.tagline, { size: 8, font: nghieng, mau: MAU.mucNhat, dan: 8 });
  // Chừa đủ chỗ nếu logo cao hơn khối chữ, tránh mục đầu tiên đè lên logo.
  b.y = Math.min(b.y, A4.h - 46 - logoCao - 14);

  // --- Thông tin người mất ---
  b.muc("Thông tin người mất");
  b.dong(`Họ tên: ${p.hoTenNguoiMat?.trim() || "(chưa cung cấp)"}`);
  b.dong(`Giới tính: ${p.gioiTinh === "nam" ? "Nam" : "Nữ"}   ·   Năm sinh: ${p.namSinhDuongLich}   ·   Tuổi ta: ${r.tuoiTa ?? "—"}`);
  b.dong(`Mất: ${ngayVN(p.ngayMat)} (dương lịch), giờ ${p.chiGioMat}`);
  if (r.bonCung) {
    b.dong(
      `Bốn cung chưởng pháp — Tuổi: ${r.bonCung.cungTuoi} · Tháng: ${r.bonCung.cungThang} · Ngày: ${r.bonCung.cungNgay} · Giờ: ${r.bonCung.cungGio}`,
      { size: 9, mau: MAU.mucNhat },
    );
  }

  // --- Giờ liệm / đóng quan ---
  b.muc("Giờ liệm — giờ đóng quan");
  const gioLiem: any[] = r.gioLiemDongQuan ?? [];
  if (gioLiem.length === 0) {
    b.doan("Không tìm được giờ phù hợp trong khung 12 giờ sau khi mất — vui lòng liên hệ tư vấn trực tiếp.");
  }
  gioLiem.forEach((g, i) => {
    b.chua(30);
    b.dong(`${i + 1}. Giờ ${g.chiGio} (${g.canGio} ${g.chiGio}) — ${g.khungGio.batDau}–${g.khungGio.ketThuc} ngày ${ngayVN(g.khungGio.ngayBatDau)}`, {
      size: 10,
      font: vua,
    });
    const phanLoai = chuViet(NHAN_PHAN_LOAI, g.phanLoaiCung);
    const nhan = [
      `Cung giờ ${g.cungGio}${phanLoai ? ` (${phanLoai})` : ""}`,
      g.nhapMoTuKy ? "Tứ Kỵ — bất đắc dĩ mới dùng" : null,
      `${g.hoangDaoTen}${g.hoangDaoLaCat ? " (hoàng đạo)" : ""}`,
      g.canGioDatBangDep ? "Can giờ hợp bảng Trần Tử Tánh" : null,
    ].filter(Boolean);
    b.doan(nhan.join(" · "), { size: 8.5, x: LE + 14, mau: MAU.mucNhat });
  });
  if (r.thanQuyenDaNoiLong) {
    b.doan("Đã bỏ ràng buộc tuổi thân quyến do không còn ứng viên hợp lệ nào phù hợp.", { size: 8.5, font: nghieng, mau: MAU.son });
  }
  if (r.daNoiLongGioSatChu) {
    b.doan("Mọi giờ hợp lệ trong ngày đều phạm Giờ Sát Chủ nên buộc phải giữ lại — vui lòng hỏi thầy trực tiếp trước khi dùng.", {
      size: 8.5,
      font: nghieng,
      mau: MAU.son,
    });
  }

  // --- Ngày giờ hạ huyệt ---
  b.muc("Ngày giờ hạ huyệt");
  const haHuyet: any[] = r.ngayGioHaHuyet ?? [];
  if (r.apDungMienTru3Ngay) {
    b.doan("Áp dụng quy tắc miễn trừ (chôn trong ≤3 ngày): chỉ chọn giờ, giữ nguyên ngày mất.", { size: 8.5, font: nghieng, mau: MAU.mucNhat });
  }
  if (haHuyet.length === 0) b.doan("Chưa có ứng viên phù hợp.");
  haHuyet.forEach((h, i) => {
    b.chua(30);
    const khoa = `${ngayVN(h.ngayDuongLich)}|${h.chiGio}`;
    const am = p.amLichHaHuyet?.[khoa];
    b.dong(
      `${i + 1}. ${ngayVN(h.ngayDuongLich)}${am ? ` (âm lịch ${am})` : ""} — giờ ${h.chiGio}, ${h.khungGio.batDau}–${h.khungGio.ketThuc}`,
      { size: 10, font: vua },
    );
    const phanLoai = chuViet(NHAN_PHAN_LOAI, h.phanLoaiCung);
    const hopVong = chuViet(NHAN_HOP_VONG, h.ngayHopVoiVong);
    const nhan = [
      `Ngày ${h.canChiNgay.can} ${h.canChiNgay.chi}`,
      `cung giờ ${h.cungGio}${phanLoai ? ` (${phanLoai})` : ""}`,
      `${h.hoangDaoTen}${h.hoangDaoLaCat ? " (hoàng đạo)" : ""}`,
      h.tamDaiCatTinh?.co ? h.tamDaiCatTinh.ten : null,
      hopVong ? `ngày ${hopVong} với tuổi vong` : null,
    ].filter(Boolean);
    b.doan(nhan.join(" · "), { size: 8.5, x: LE + 14, mau: MAU.mucNhat });
    if (h.hungDaHoaGiai?.length) {
      b.doan(`Hung tinh đã được cát tinh hoá: ${h.hungDaHoaGiai.join(", ")}`, { size: 8.5, x: LE + 14, font: nghieng, mau: MAU.son });
    }
  });

  // --- Giờ động quan ---
  if (r.gioDongQuan) {
    b.muc("Giờ động quan (giờ rời nhà)");
    b.dong(`Sớm nhất ${r.gioDongQuan.somNhat} — muộn nhất ${r.gioDongQuan.muonNhat}`, { size: 10, font: vua });
    b.doan("Tính lùi từ giờ hạ huyệt phương án 1, đã trừ thời gian di chuyển và đệm đi sớm.", { size: 8.5, mau: MAU.mucNhat });
  }

  // --- PHASE 2 ---
  if (p.phase2 && (p.phase2.ketCuc === "A" || p.phase2.ketCuc === "B")) {
    const p2 = p.phase2;
    b.muc("Lọc & xếp hạng theo tọa hướng huyệt mộ");
    b.dong(
      `Tọa ${p2.toaHuong.sonToa} ${p2.toaHuong.doSoToa.toFixed(1)}° — hướng ${p2.toaHuong.sonHuong} ${p2.toaHuong.doSoHuong.toFixed(1)}°`,
      { size: 10, font: vua },
    );
    b.doan("Đã rà toàn bộ ngày giờ trong khung quét và loại hết phương án có sát phương vị đáo tọa hoặc đáo hướng.", {
      size: 8.5,
      mau: MAU.mucNhat,
    });
    b.xuong(4);
    for (const pa of p2.phuongAn ?? []) {
      b.chua(44);
      b.dong(`Phương án ${pa.thuHang} — ${pa.id}`, { size: 10, font: vua });
      // Hai phần này BẮT BUỘC tách riêng (đặc tả mục 6), và tuyệt đối không kèm điểm số.
      b.doan(`Cách cục nền: ${pa.cachCuc.tenLop}`, { size: 9, x: LE + 14 });
      b.doan(`Quan hệ đạt: ${pa.quanHeDat.length ? pa.quanHeDat.join(" · ") : "—"}`, { size: 9, x: LE + 14, mau: MAU.mucNhat });
      if (pa.canhBao?.length) {
        b.doan(`Ghi chú: ${pa.canhBao.join("; ")}`, { size: 8.5, x: LE + 14, font: nghieng, mau: MAU.son });
      }
    }
    if (p2.cauKetLuan) b.doan(p2.cauKetLuan, { size: 9, font: vua });
  } else if (p.phase2?.ketCuc === "mien-tru") {
    b.muc("Lọc theo tọa hướng huyệt mộ");
    b.dong(`Áp dụng phép quyền biến: ${p.phase2.nhanh}`, { size: 10, font: vua });
    b.doan(p.phase2.giaiThich, { size: 9, mau: MAU.mucNhat });
  }

  // --- Tuổi cần tránh mặt ---
  const t = r.tuoiCanTranh;
  if (t) {
    b.muc("Các tuổi cần tránh mặt");
    // Nhóm 4 có cấu trúc KHÁC các nhóm còn lại: là object { xung, hinh } chứ không phải mảng Chi.
    // Gộp chung vào vòng lặp mảng thì `Array.isArray` trả false và cả dòng biến mất khỏi hồ sơ —
    // mất đúng mục quan trọng nhất về an toàn. Vì vậy trải phẳng riêng ở đây.
    const nhom4 = t.nhom4XungHinh
      ? [t.nhom4XungHinh.xung, ...(t.nhom4XungHinh.hinh ?? [])].filter(Boolean)
      : [];
    const nhom: [string, unknown][] = [
      ["Long Hổ Kê Xà (luôn tránh)", t.nhom1LongHoKeXa],
      ["Tam hợp với cung phạm", t.nhom2TamHopCungPham],
      ["Tam hợp với tuổi vong", t.nhom3TamHopTuoiVong],
      ["Xung / hình với tuổi vong", nhom4],
      ["Thân quyến kỵ giờ liệm", t.nhom6GioLiemKyThanQuyen],
    ];
    for (const [ten, ds] of nhom) {
      const arr = Array.isArray(ds) ? ds : [];
      if (arr.length === 0) continue;
      b.doan(`${ten}: ${arr.join(", ")}`, { size: 9 });
    }
    b.doan(
      "Người thuộc các tuổi trên không nên có mặt lúc khâm liệm, nhập quan, đóng cá và hạ huyệt. Nếu buộc phải có mặt thì đứng tránh ra, không nhìn trực tiếp.",
      { size: 8.5, font: nghieng, mau: MAU.mucNhat },
    );
  }

  // --- Lưu ý & liên hệ ---
  b.muc("Lưu ý");
  b.doan(
    "Hồ sơ này áp dụng cho trường hợp người mất KHÔNG phạm Trùng Tang. Nếu có phạm Trùng Tang, hướng xử lý là tiến hành hoá giải và mang ra ngoài liệm — vui lòng liên hệ để được tư vấn riêng.",
    { size: 9 },
  );
  b.doan(
    "Kết quả được tính theo chưởng pháp và thần sát trạch nhật cổ truyền, mang tính tham khảo. Với những tình huống đặc biệt, xin trao đổi trực tiếp với thầy trước khi quyết định.",
    { size: 9, mau: MAU.mucNhat },
  );
  b.xuong(6);
  b.doan(`${siteConfig.name} · Hotline ${siteConfig.hotline} · ${siteConfig.email}`, { size: 9, font: vua });
  b.doan(siteConfig.address, { size: 8.5, mau: MAU.mucNhat });

  // --- Chân trang trên mọi trang ---
  const ngayXuat = new Date().toLocaleDateString("vi-VN");
  const trangs = doc.getPages();
  trangs.forEach((page, i) => {
    page.drawText(`${siteConfig.name} — lập ngày ${ngayXuat}`, {
      x: LE,
      y: 32,
      size: 7.5,
      font: thuong,
      color: MAU.mucNhat,
    });
    const so = `Trang ${i + 1}/${trangs.length}`;
    page.drawText(so, {
      x: A4.w - LE - thuong.widthOfTextAtSize(so, 7.5),
      y: 32,
      size: 7.5,
      font: thuong,
      color: MAU.mucNhat,
    });
  });

  return doc.save();
}
