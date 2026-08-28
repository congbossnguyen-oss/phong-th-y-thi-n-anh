// Kiểu dữ liệu dùng chung cho module luan-van-khi (SPEC.md §1-§6).
//
// Nguồn: docs/quan-su-thien-anh/luan-van-khi-spec/SPEC.md — đọc file đó trước khi sửa module này.
import type { Hanh } from "../../bat-tu-engine/engine";

export type LinhVucKey = "tai_van" | "quan_van" | "suc_khoe" | "tinh_duyen";

export const LINH_VUC_KEYS: LinhVucKey[] = ["tai_van", "quan_van", "suc_khoe", "tinh_duyen"];

/** SPEC.md §2 — kết quả tính lại vượng suy + dụng thần TẠI 1 mốc thời gian (Đại Vận hoặc Lưu Niên). */
export interface TrangThaiThoiDiem {
  loai: "DaiVan" | "LuuNien";
  canChi: { can: string; chi: string };
  namBatDau?: number; // Đại Vận
  nam?: number; // Lưu Niên
  /** Cấp độ vượng suy TẠI thời điểm này (có thể khác nguyên cục nếu Nhóm 1/2). */
  vuongSuyTaiThoiDiem: string;
  dungThanTaiThoiDiem: Hanh;
  hyThan: Hanh;
  kyThan: Hanh;
  /** true nếu Dụng Thần tại mốc này khác Dụng Thần gốc (nguyên cục). */
  dungThanDaDoi: boolean;
  /** Các xung/hợp/hội đang có hiệu lực tại mốc này (sau khi áp Tầng Thứ) — dùng để chấm điểm §3. */
  quanHeKichHoat: string[];
  /** Vết diễn giải — để truy ngược logic, giống dienGiai[] của bat-tu-engine. */
  dienGiai: string[];
}

/** SPEC.md §3 — điểm 1 lĩnh vực tại 1 mốc thời gian. */
export interface DiemLinhVuc {
  linhVuc: LinhVucKey;
  diem: number; // 0-10, số nguyên
  nhan: string; // từ thang_nhan trong config-linh-vuc.json
  mauSac: string; // "xanh lá" | "xanh dương" | "xám" | "vàng" | "cam"
  /** Căn cứ đã cộng/trừ điểm — AI dùng cái này để viết luận, KHÔNG bịa thêm. */
  canCu: string[];
}

export interface LuuNienKhi {
  nam: number;
  tuoi: number;
  canChi: string;
  diemCacLinhVuc: DiemLinhVuc[];
  loiLuan: Record<LinhVucKey, string>;
  /** true nếu lời luận đến từ AI thật; false nếu dùng câu mẫu an toàn dự phòng (không có API key,
   *  lỗi mạng, hoặc hậu kiểm chặn cả sau khi thử lại). App vẫn hiển thị bình thường, chỉ khác nguồn. */
  loiLuanTuAI: boolean;
}

export interface DaiVanKhi {
  canChi: string;
  tuoiBatDau: number;
  tuoiKetThuc: number;
  namBatDau: number;
  /** Điểm 4 lĩnh vực ở mức NỀN 10 năm (mốc Đại Vận, không cộng biến động riêng từng năm). */
  tongQuan: DiemLinhVuc[];
  /** Chỉ Đại Vận đang được xem chi tiết mới có đủ 10 năm; các Đại Vận khác để mảng rỗng (SPEC §6 —
   *  "app hiển thị 1 thẻ tổng quan ĐV + 10 thẻ năm" cho ĐV đang chọn, tránh gọi AI cho cả đời). */
  luuNien: LuuNienKhi[];
}

export interface VanKhiOutput {
  laSo: {
    namCan: string; namChi: string;
    thangCan: string; thangChi: string;
    ngayCan: string; ngayChi: string;
    gioCan: string; gioChi: string;
    nhatChu: string;
    nhatChuHanh: Hanh;
    gioiTinh: "Nam" | "Nữ";
    gioSinhKnown: boolean;
  };
  vuongSuyGoc: { capDo: string; nhom: 1 | 2 | 3 };
  dungThanGoc: { dungThan: Hanh; hyThan: Hanh; kyThan: Hanh; cuuThan: Hanh; phuongPhap: string };
  danhSachDaiVan: DaiVanKhi[];
  /** Index trong danhSachDaiVan đang có Lưu Niên chi tiết (đã tính AI). */
  chiTietDaiVanIndex: number;
  /**
   * 5 năm tới TÍNH TỪ NĂM HIỆN TẠI (không phải 5 năm đầu của Đại Vận) — app chưa có nút đổi Đại Vận
   * nên ai đã đi sâu vào Đại Vận đang chọn (vd 8/10 năm) chỉ còn 2 năm "thật sự tương lai" trong
   * `danhSachDaiVan[chiTietDaiVanIndex].luuNien`. Trường này vắt qua cả Đại Vận kế tiếp nếu cần, lấy
   * lại từ đúng cache theo từng Đại Vận (không tốn AI ngoài dự kiến) — xem tinhVanKhi() trong index.ts.
   * Rỗng nếu "năm hiện tại" nằm ngoài mọi Đại Vận đã tính (hiếm, chỉ khi chiTietDaiVanIndex bị ép
   * qua tham số khác Đại Vận đang chứa tuổi hiện tại).
   */
  nam5NamToi: LuuNienKhi[];
  disclaimer: string;
}
