/**
 * Nạp config trach-nhat-sinh-no.json — đọc từ FILE, không hard-code trọng số/ngưỡng trong code
 * (đúng quy ước dự án). Nhiều mục trong file này đánh dấu ⚠️ = quy ước làm việc của tài liệu nguồn,
 * chưa đối chiếu án lệ — xem `_warn` trong từng mục.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface TrachNhatConfig {
  chin_tieu_chi: string[];
  hard_filters: {
    L6_loai_gio_ty: boolean;
    /** false → "đủ 5 hành" chỉ còn là điểm cộng/trừ, không loại (đúng câu chữ "là tốt nhất"). */
    L4_bat_buoc_du_5_hanh?: boolean;
    /** false → chỉ cần Ấn CÓ MẶT là qua (đúng câu chữ tiêu chí 8), không bắt thêm "có căn". */
    L7_bat_buoc_an_co_can?: boolean;
    /** false → "trụ giờ xung trụ tháng" không loại nữa, chỉ trừ điểm Gia đạo (không có trong 9 tiêu chí). */
    L5_bat_buoc_khong_xung_gio_thang?: boolean;
  };
  L8_tong_cach_nghi_ngo: { mot_hanh_chiem_toi_thieu_phan_tram: number; trong_so_chinh_khi: number; trong_so_du_trung_khi: number };
  chat_luong_goc: { nguong_toi_thieu_lop: "A" | "B" | "C" | "D"; nguong_toi_thieu_diem_thong_can: number };
  an_tinh: { nguong_qua_thua_so_phan: number };
  dai_van_trong_so: Record<string, string>;
  tu_vi_veto: { so_sat_tinh_toi_thieu_de_loai: number; sat_tinh_ten: string[] };
  phan_xu: { bat_tu_xep_hang_ngay: boolean; tu_vi_chon_gio_trong_ngay: boolean; khong_cong_diem_cheo: boolean; phu_quyet_thang_xep_hang: boolean };
  chua_tich_hop_giai_doan_1: string[];
}

let cached: TrachNhatConfig | null = null;

export function loadTrachNhatConfig(): TrachNhatConfig {
  if (cached) return cached;
  const raw = readFileSync(join(process.cwd(), "handoff", "config", "trach-nhat-sinh-no.json"), "utf-8");
  cached = JSON.parse(raw) as TrachNhatConfig;
  return cached;
}
