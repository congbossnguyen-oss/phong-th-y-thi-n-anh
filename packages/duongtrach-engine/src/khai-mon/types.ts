/** Kiểu dữ liệu Khai Môn Điểm Thần Sát — theo đúng SPEC.md mục 1 (gói khai-mon-module, Công cung cấp). */
import type { Can, Chi, PhanKim } from "../shared/do-so.js";
import type { Hanh } from "../shared/ngu-hanh.js";
import type { TenCung } from "../shared/cuu-cung.js";

export interface KhaiMonInput {
  /** độ toạ, 0-360, lấy tới 0.1°. */
  toaDeg: number;
  /** độ môn khí — TÂM NHÀ tới TÂM CỬA, không phải hướng cửa mở. */
  monDeg: number;
  /** tuỳ chọn; mặc định toaDeg + 180. */
  huongDeg?: number;
  /** tuỳ chọn; chỉ ảnh hưởng phần luận cung Đào hoa. */
  daLapGiaDinh?: boolean;
}

export type LoaiThanSat = "cát" | "cát-điều-kiện" | "hung";
export type Luc = "VƯỢNG" | "MẠNH" | "bị tiết lực";

export interface ODiaBan {
  chi: Chi;
  can: Can;
  canChi: string;
  stt: number;
  buoc: number;
  cung: TenCung;
  huong: string;
  napAm: string;
  hanh: Hanh;
}

export interface ThanSat {
  ten: string;
  loai: LoaiThanSat;
  chiDiaBan: Chi;
  canChi: string;
  stt: number;
  napAm: string;
  hanh: Hanh;
  cung: TenCung;
  huong: string;
  hanhCung: Hanh;
  /** mô tả quan hệ nạp âm ↔ ngũ hành cung. */
  quanHe: string;
  luc: Luc;
  /** true khi luc là VƯỢNG hoặc MẠNH. */
  manhLen: boolean;
  donThuoc: string;
  /** canChi trùng Can Chi môn khí. */
  lamMon: boolean;
}

export interface CanhBao {
  muc: "nặng" | "nhắc";
  ma: "DUOI_0_5" | "SAT_RANH" | "PHAN_KIM_BIEN_GIOI" | "LAM_MON";
  noiDung: string;
}

export interface BanCuuCungO {
  cung: TenCung;
  huong: string;
  hanh: Hanh;
  chiChua: Chi[];
  thanSat: ThanSat[];
  /** có cả cát lẫn hung. */
  honHop: boolean;
}

export interface KhaiMonResult {
  toa: PhanKim;
  huong: PhanKim;
  mon: PhanKim;
  /** cung VẬT LÝ của cửa, tra theo độ. */
  monCung: TenCung;
  monHuong: string;
  /** ví dụ "Canh Dần". */
  nguHoDonKhoi: string;
  diaBan: Record<Chi, ODiaBan>;
  thanSat: ThanSat[];
  banCuuCung: Record<TenCung, BanCuuCungO>;
  cachCucDaiMon: {
    theoCungVatLy: ThanSat[];
    theoLamMon: ThanSat[];
    /** true khi theoLamMon.length > 0. */
    caTreo: boolean;
  };
  canhBao: CanhBao[];
  /** ba cặp chi dùng chung cung có đúng không — false ở ca lâm môn (SPEC.md mục 6). */
  batBienOk: boolean;
}
