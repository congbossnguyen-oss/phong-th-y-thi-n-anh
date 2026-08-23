/**
 * NHẮC NGÀY MÙNG MỘT / NGÀY RẰM — phần lõi, KHÔNG phụ thuộc kênh gửi.
 *
 * Thầy đặt (2026-08-23), có hai phương án gửi và module này đỡ được CẢ HAI, chỉ đổi cấu hình:
 *   - "bao-truoc": trước ngày lễ một hôm, lúc 11 giờ trưa.
 *   - "dung-hom-do": đúng sáng ngày lễ, lúc 6 giờ.
 *
 * Tách riêng phần "có phải ngày cần nhắc không + soạn lời nhắn" khỏi phần "gửi bằng gì" (Web Push
 * / Zalo / email) — vì kênh gửi còn có thể đổi, còn logic âm lịch thì không.
 *
 * Múi giờ: solarToLunar() của dự án quy đổi theo giờ Việt Nam, nên mọi ngày đưa vào đây phải là
 * ngày theo giờ Việt Nam. Máy chủ Render chạy giờ UTC — luôn dùng ngayVietNam() để lấy cho đúng.
 */
import { solarToLunar } from "../lunar-calendar";

export type LoaiNgayLe = "mung-mot" | "ram";

/** Kiểu nhắc: báo trước một hôm, hay báo đúng sáng hôm đó. */
export type KieuNhac = "bao-truoc" | "dung-hom-do";

export interface NgayDuong {
  ngay: number;
  thang: number;
  nam: number;
}

export interface NgayLeCanNhac {
  loai: LoaiNgayLe;
  kieu: KieuNhac;
  /** Ngày dương lịch của chính ngày lễ. */
  duong: NgayDuong;
  /** Ngày âm lịch tương ứng (ngày sẽ là 1 hoặc 15). */
  am: { ngay: number; thang: number; nam: number };
  /** Tên năm âm lịch theo Can Chi, ví dụ "Bính Ngọ". */
  canChiNam: string;
}

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

/** Can Chi của một năm âm lịch. Công thức nhỏ, replicate tại chỗ theo đúng lệ của dự án. */
export function canChiNamAm(namAm: number): string {
  return `${CAN[(namAm + 6) % 10]} ${CHI[(namAm + 8) % 12]}`;
}

/** Ngày hiện tại theo GIỜ VIỆT NAM, bất kể máy chủ đang ở múi giờ nào. */
export function ngayVietNam(now: Date = new Date()): NgayDuong {
  // en-CA cho ra định dạng YYYY-MM-DD, khỏi phải tự bù offset và tự xử lý chuyện đổi ngày.
  const s = now.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const [nam, thang, ngay] = s.split("-").map(Number);
  return { ngay, thang, nam };
}

/** Cộng thêm số ngày vào một ngày dương lịch (dùng UTC để không dính chuyện lệch múi giờ). */
function congNgay(g: NgayDuong, them: number): NgayDuong {
  const t = new Date(Date.UTC(g.nam, g.thang - 1, g.ngay + them));
  return { ngay: t.getUTCDate(), thang: t.getUTCMonth() + 1, nam: t.getUTCFullYear() };
}

/** Ngày dương lịch này có phải mùng Một hoặc ngày Rằm không. */
export function laNgayLe(g: NgayDuong): LoaiNgayLe | null {
  const am = solarToLunar(g.ngay, g.thang, g.nam);
  if (am.day === 1) return "mung-mot";
  if (am.day === 15) return "ram";
  return null;
}

/**
 * Hôm nay có cần gửi lời nhắc không.
 * - kieu="bao-truoc"   → xét NGÀY MAI có phải ngày lễ (job chạy 11 giờ trưa).
 * - kieu="dung-hom-do" → xét CHÍNH HÔM NAY có phải ngày lễ (job chạy 6 giờ sáng).
 *
 * Trả `null` nghĩa là hôm nay không gửi gì cả.
 */
export function cannhacHomNay(homNay: NgayDuong, kieu: KieuNhac): NgayLeCanNhac | null {
  const ngayLe = kieu === "bao-truoc" ? congNgay(homNay, 1) : homNay;
  const loai = laNgayLe(ngayLe);
  if (!loai) return null;

  const am = solarToLunar(ngayLe.ngay, ngayLe.thang, ngayLe.nam);
  return {
    loai,
    kieu,
    duong: ngayLe,
    am: { ngay: am.day, thang: am.month, nam: am.year },
    canChiNam: canChiNamAm(am.year),
  };
}

/** Tiêu đề ngắn hiển thị trên thông báo đẩy. */
export function tieuDeThongBao(le: NgayLeCanNhac): string {
  const ten = le.loai === "ram" ? "ngày Rằm" : "mùng Một";
  return le.kieu === "bao-truoc" ? `Ngày mai là ${ten}` : `Hôm nay là ${ten}`;
}

/**
 * Nội dung lời nhắc. Giọng theo đúng lời Thầy đặt — gọi chung "quý bằng hữu" vì đây là lời nhắn
 * gửi cho nhiều người cùng lúc, khác với lúc luận quẻ riêng cho từng người (xem giong-van.ts).
 */
export function noiDungThongBao(le: NgayLeCanNhac): string {
  const ten = le.loai === "ram" ? "ngày Rằm" : "mùng Một";
  const moc = le.kieu === "bao-truoc" ? "Ngày mai" : "Hôm nay";
  return (
    `${moc}, ${le.duong.ngay} tháng ${le.duong.thang} năm ${le.duong.nam} dương lịch, ` +
    `nhằm ${ten} tháng ${le.am.thang} năm ${le.canChiNam}. ` +
    `Quý bằng hữu nhớ lưu tâm chuyện thờ cúng.`
  );
}
