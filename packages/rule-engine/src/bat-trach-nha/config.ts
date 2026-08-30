/**
 * BÁT TRẠCH NHÀ — cờ cấu hình cho 3 điểm mà nguồn (skill `bat-trach-luan-nha`) không rõ hoặc tự
 * mâu thuẫn. Chốt tạm theo `data/00-quyet-dinh-mac-dinh.md` của gói build — KHÔNG hardcode rải
 * rác trong engine, mọi nhánh rẽ đọc từ đây để sau này đảo mặc định chỉ cần đổi 1 chỗ.
 *
 * Nguồn gốc gói build: xem GHI-CHU-CAN-CHU-SITE-XEM.md ở gốc dự án phong-thuy-thien-anh.
 */

/** MĐ-1 — luận hợp mệnh gia chủ lấy Hướng hay Tọa làm chính (bên kia in kèm để đối chiếu). */
export type LuanHopMenhTheo = "huong" | "toa";

/** MĐ-2 — quy tắc lọc "cung sao đồng đạo" khi xét sinh khắc Cung–Sao (data/09 mục 4). */
export type SinhKhacCungSaoPhuongAn = "A" | "B" | "theoNguCanh";

/** MĐ-3 — Tầng 1 của Xuyên Cung Cửu Tinh khởi từ đâu (data/07 mục 4, còn tranh cãi). */
export type XuyenCungTang1 = "duNienToaMon" | "theoViDuSach";

export interface BatTrachConfig {
  luanHopMenhTheo: LuanHopMenhTheo;
  sinhKhacCungSao: SinhKhacCungSaoPhuongAn;
  xuyenCungTang1: XuyenCungTang1;
}

/**
 * Mặc định chốt trong data/00 (đợt bổ sung 5):
 * - luanHopMenhTheo: "huong" — cách phổ biến trong thực hành VN, cũng là cách khách hiểu.
 * - sinhKhacCungSao: "theoNguCanh" — dùng CẢ HAI phương án A/B theo ngữ cảnh (đánh giá tổng thể
 *   1 trạch dùng A; luận 1 cặp cụ thể dùng B) — đây là giá trị đặc biệt "dùng cả hai", KHÔNG phải
 *   1 phương án đơn — engine tự chọn A hay B theo hàm gọi (`ngữ cảnh` truyền vào), không đọc cờ
 *   này để ép cứng 1 phương án khi giá trị là "theoNguCanh".
 * - xuyenCungTang1: "duNienToaMon" — Khả năng 1 (nhất quán hệ thống), kèm dòng đối chiếu Khả
 *   năng 2 (theo ví dụ sách) trong output.
 */
export const DEFAULT_BAT_TRACH_CONFIG: BatTrachConfig = {
  luanHopMenhTheo: "huong",
  sinhKhacCungSao: "theoNguCanh",
  xuyenCungTang1: "duNienToaMon",
};
