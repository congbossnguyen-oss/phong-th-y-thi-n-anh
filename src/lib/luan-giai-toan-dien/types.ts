// Kiểu dữ liệu dùng chung cho module Luận Giải Bát Tự Toàn Diện.
// Xem SPEC gốc (đã chuyển vào content/bat-tu/ + handoff) — 3 tầng: Findings (code) → AI Narrative → Hậu kiểm (code).

export type MaGiaiDoan = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

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

export interface BaoCaoCoBan {
  laSo: LaSoHienThi;
  disclaimerDauBai: string;
  giaiDoan: GiaiDoanNoiDung[];
  disclaimerCuoiBai: string;
  ctaNangCao: string;
}

export interface BaoCaoNangCao {
  laSo: LaSoHienThi;
  giaiDoan: GiaiDoanNoiDung[];
  disclaimerCuoiBai: string;
}

/** Lát cắt lá số dùng để hiển thị lại đầu báo cáo — không tính lại, lấy nguyên từ BatTuChart/BatTuAnalysis. */
export interface LaSoHienThi {
  tuTru: { tru: string; can: string; chi: string }[];
  nhatChu: string;
  capDoVuongSuy: string;
  dungThan: string;
  hyThan: string;
  kyThan: string;
}
