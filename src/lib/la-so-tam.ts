/**
 * GIỮ LẠI LÁ SỐ KHÁCH VỪA LẬP, để khi họ sang bản trả phí (và phải đăng nhập giữa chừng) thì KHÔNG
 * phải nhập lại ngày giờ sinh từ đầu.
 *
 * ⚠️ VÌ SAO CÓ FILE NÀY (anh Công phản ánh 27/8/2026): khách chưa đăng nhập điền đủ ngày giờ sinh →
 * lập được lá số → bấm sang bản trả phí → bị bắt đăng nhập → đăng nhập xong bị đá về trang học viên
 * → phải điền lại từ đầu. Mất khách đúng lúc họ đã sẵn sàng trả tiền.
 *
 * Ba mắt xích trước đây đều gãy, nay nối lại:
 *   1. Trang lập lá số (miễn phí) KHÔNG lưu gì  → nay `luuLaSoTam()` khi lập xong.
 *   2. Link đăng nhập KHÔNG kèm `?tiep=`        → nay `duongDanDangNhap()` luôn kèm đường quay lại
 *      (trang đăng nhập vốn ĐÃ hỗ trợ sẵn tham số `tiep`, chỉ là chưa ai dùng).
 *   3. Trang trả phí KHÔNG đọc lại dữ liệu      → nay `docLaSoTam()` để điền sẵn form.
 *
 * ⚠️ Cố ý dùng localStorage chứ KHÔNG nhét ngày sinh vào URL: ngày giờ sinh là thông tin cá nhân,
 * đưa lên URL sẽ nằm lại trong lịch sử trình duyệt, log máy chủ và trường Referer gửi sang bên thứ
 * ba. Đánh đổi: đổi trình duyệt/thiết bị thì mất — chấp nhận được, vì lúc đó form vẫn trống như cũ
 * chứ không hỏng gì.
 */

export type GioiTinhLaSo = "Nam" | "Nữ";

export interface LaSoTam {
  /** Loại lá số — tránh lấy nhầm dữ liệu Bát Tự điền sang form Tử Vi. */
  loai: "bat-tu" | "tu-vi";
  ngay: number;
  thang: number;
  nam: number;
  gio: number;
  phut?: number;
  gioiTinh: GioiTinhLaSo;
  /** Tên người xem, nếu khách có nhập (không bắt buộc). */
  hoTen?: string;
  /** Thời điểm lưu (ms). Dùng để bỏ qua dữ liệu quá cũ. */
  luuLuc: number;
}

const KHOA = "ptta:la-so-tam";
/** Quá hạn này coi như khách đã sang việc khác, không điền sẵn nữa để tránh gây bất ngờ. */
const HAN_MS = 24 * 60 * 60 * 1000;

/** Lưu lá số khách vừa lập. Mọi lỗi đều nuốt: đây là tiện ích, hỏng cũng không được chặn luồng chính. */
export function luuLaSoTam(du: Omit<LaSoTam, "luuLuc">): void {
  try {
    localStorage.setItem(KHOA, JSON.stringify({ ...du, luuLuc: Date.now() }));
  } catch {
    /* trình duyệt chặn lưu (chế độ riêng tư…) — bỏ qua, khách chỉ phải nhập lại như trước */
  }
}

/** Đọc lá số đã lưu, đúng loại và còn hạn. Trả `null` nếu không có/không hợp lệ. */
export function docLaSoTam(loai: LaSoTam["loai"]): LaSoTam | null {
  try {
    const raw = localStorage.getItem(KHOA);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<LaSoTam>;
    if (d.loai !== loai) return null;
    if (typeof d.luuLuc !== "number" || Date.now() - d.luuLuc > HAN_MS) return null;
    // Kiểm tra tối thiểu để không điền rác vào form.
    const hopLe =
      Number.isInteger(d.ngay) && Number.isInteger(d.thang) && Number.isInteger(d.nam) &&
      Number.isInteger(d.gio) && (d.gioiTinh === "Nam" || d.gioiTinh === "Nữ");
    return hopLe ? (d as LaSoTam) : null;
  } catch {
    return null;
  }
}

/** Xoá — dùng cho nút "Lập lá số khác". */
export function xoaLaSoTam(): void {
  try {
    localStorage.removeItem(KHOA);
  } catch {
    /* bỏ qua */
  }
}

/**
 * Đường dẫn đăng nhập có kèm chỗ quay lại. Trang đăng nhập chỉ nhận đường dẫn NỘI BỘ (chặn
 * "//tên-miền-lạ"), nên chỉ truyền pathname + query của chính trang hiện tại.
 */
export function duongDanDangNhap(quayVe?: string): string {
  const dich = quayVe ?? (typeof location !== "undefined" ? location.pathname + location.search : "/");
  return `/hoc-vien/dang-nhap?tiep=${encodeURIComponent(dich)}`;
}
