// Kiểu dữ liệu dùng chung cho module Luận Giải Bát Tự Toàn Diện.
// Xem SPEC gốc (đã chuyển vào content/bat-tu/ + handoff) — 3 tầng: Findings (code) → AI Narrative → Hậu kiểm (code).

export type MaGiaiDoan = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M";

export interface GiaiDoanFindings {
  maGiaiDoan: MaGiaiDoan;
  tenGiaiDoan: string;
  ketQua: Record<string, unknown>;
  /** Tên file/mục trong content/bat-tu/ đã dùng — để AI/hậu kiểm truy vết, không bịa nguồn. */
  canCu: string[];
}

export interface GiaiDoanNoiDung {
  ma: MaGiaiDoan;
  tieuDe: string;
  noiDung: string;
}

/** 1 mốc trong đồ hình MỒI (Đại Vận trọn đời hoặc Lưu Niên vài năm) — điểm thô 1 chiều, KHÔNG phải
 *  4 khía cạnh AI như bản Nâng Cao, chỉ để gợi mở. Dùng chung hình dạng cho cả Đại Vận lẫn Lưu Niên. */
export interface MocDoHinhMoi {
  nhan: string; // "4-13 tuổi" (Đại Vận) hoặc "2026" (Lưu Niên)
  canChi: string; // "Ất Dậu"
  /** -1..1: điểm thô so Dụng/Hỷ (+) hay Kỵ/Cừu (-) Thần NGUYÊN CỤC — thuần code, không gọi AI. */
  diem: number;
}

export interface BaoCaoCoBan {
  laSo: LaSoHienThi;
  disclaimerDauBai: string;
  giaiDoan: GiaiDoanNoiDung[];
  disclaimerCuoiBai: string;
  ctaNangCao: string;
  /** Đồ hình MỒI — ước tính thô thuần code, KHÔNG gọi AI, mời nâng cấp Nâng Cao (xem lại Dụng Thần
   *  đúng theo Đại Vận + chấm điểm AI 4 khía cạnh + luận chi tiết từng năm). */
  moiDaiVan: MocDoHinhMoi[];
  moiLuuNien: MocDoHinhMoi[];
}

/** 1 giai đoạn/năm được AI chấm điểm 4 khía cạnh (thang -2..2) + 1 câu tóm tắt ngắn — dùng vẽ đồ hình. */
export interface DiemGiaiDoanVan {
  nhan: string; // "4-13 tuổi" (Đại Vận) hoặc "2026" (Lưu Niên)
  canChi: string; // "Ất Dậu"
  tuoi: string; // "4-13" hoặc "47"
  sucKhoe: number;
  congViec: number;
  taiLoc: number;
  lucThan: number;
  tomTat: string;
  /** Dụng Thần TÍNH RIÊNG cho vận này (Đại Vận nhập cục như trụ thứ 5) — có thể khác Dụng Thần nguyên cục. */
  dungThanVan: string;
  /** true = Dụng Thần vận này khác nguyên cục (đáng lưu ý khi luận). */
  dungThanDoi: boolean;
  /** Luận chi tiết riêng cho mục này — hiện chỉ dùng cho Lưu Niên (đồ hình chỉ là tổng quan). */
  chiTiet?: string;
}

export interface BaoCaoNangCao {
  laSo: LaSoHienThi;
  giaiDoan: GiaiDoanNoiDung[];
  daiVanBieuDo: DiemGiaiDoanVan[];
  luuNienBieuDo: DiemGiaiDoanVan[];
  disclaimerCuoiBai: string;
}

/** Lát cắt lá số dùng để hiển thị lại đầu báo cáo — không tính lại, lấy nguyên từ BatTuChart/BatTuAnalysis. */
export interface LaSoHienThi {
  tuTru: { tru: string; can: string; chi: string }[];
  gioiTinh: string;
  nhatChu: string;
  capDoVuongSuy: string;
  dungThan: string;
  hyThan: string;
  kyThan: string;
  /** "Sinh mùa Đông/Hè — cân nhắc thêm Hỏa/Thủy để điều hậu." — chỉ có khi sinh tháng hàn/nhiệt (Hợi/Tý/Sửu hoặc Tị/Ngọ/Mùi). */
  dieuHauNote: string | null;
}
