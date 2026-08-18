/**
 * Nạp và chuẩn hoá dữ liệu tra cứu tĩnh của Việt Danh Học.
 *
 * Nguồn: "Danh Tính Học Tập 1" (Chương I, II, IV) — chủ dự án cung cấp qua module zip.
 */
import bangChuCaiJson from "./bang-chu-cai.json" with { type: "json" };
import hangSoJson from "./hang-so-ngu-hanh-dinh-danh.json" with { type: "json" };
import bang81Json from "./bang-81-cuc.json" with { type: "json" };
import khoTenJson from "./kho-ten-theo-ngu-hanh.json" with { type: "json" };
import khoTenDepJson from "./kho-ten-dep.json" with { type: "json" };
import type { Cuc, GioiTinh, MaHanh, NguHanh } from "../types.js";

/** Chữ cái Latinh → số nét. Đ đã quy về "DD" trong JSON. */
export const BANG_CHU_CAI: Readonly<Record<string, number>> = bangChuCaiJson.bangChuCai;

/** Hằng số Ngũ Hành Định Danh, dùng khi tên KHÔNG có đệm. */
export const HANG_SO: Readonly<Record<MaHanh, { nam: number; nu: number }>> = hangSoJson.hangSo;

/** 81 cục, index theo `so` (1-81). JSON dùng string cho catHung nên ép kiểu về Cuc. */
export const BANG_81_CUC: readonly Cuc[] = bang81Json.cuc as readonly Cuc[];

export interface AmTietKho {
  hanh: string;
  ten: string;
  soNet: number | null;
  sao: string | null;
  locSoBo: "giu" | "loai";
  /** Có khi kho đã được chủ dự án lọc sạch. */
  dungDatTen?: "x" | "";
}

export const KHO_TEN: readonly AmTietKho[] = khoTenJson.khoTen as AmTietKho[];

/** Kho tên ĐẸP đã chủ dự án lọc tay — có ý nghĩa + giới tính. Là nguồn gợi ý CHÍNH. */
export interface TenDep {
  hanh: MaHanh;
  ten: string;
  gioiTinh: "Nam" | "Nữ" | "Unisex";
  yNghia: string;
  soNet: number | null;
}
export const KHO_TEN_DEP: readonly TenDep[] = khoTenDepJson.khoTenDep as TenDep[];

/** Ánh xạ mã hành Latinh (trong JSON) ↔ tên hành có dấu (hiển thị). */
export const MA_SANG_HANH: Readonly<Record<MaHanh, NguHanh>> = {
  Kim: "Kim",
  Moc: "Mộc",
  Thuy: "Thủy",
  Hoa: "Hỏa",
  Tho: "Thổ",
};
/**
 * Tra hành của một âm tiết tên bất kỳ (khách tự nhập) — gộp cả kho đẹp và kho gốc 3.459 âm tiết.
 * Một âm tiết có thể mang nhiều hành; trả về TẤT CẢ hành tìm thấy. Rỗng nghĩa là không tra được.
 */
const _bangHanhTheoTen: Map<string, Set<NguHanh>> = (() => {
  const m = new Map<string, Set<NguHanh>>();
  const them = (ten: string, hanh: NguHanh) => {
    const k = ten.trim().toLowerCase();
    if (!k) return;
    if (!m.has(k)) m.set(k, new Set());
    m.get(k)!.add(hanh);
  };
  for (const a of KHO_TEN_DEP) them(a.ten, MA_SANG_HANH[a.hanh]);
  for (const a of KHO_TEN) {
    const h = MA_SANG_HANH[a.hanh as MaHanh];
    if (h) them(a.ten, h);
  }
  return m;
})();

export function traHanhCuaTen(ten: string): NguHanh[] {
  return [...(_bangHanhTheoTen.get(ten.trim().toLowerCase()) ?? [])];
}

export const HANH_SANG_MA: Readonly<Record<NguHanh, MaHanh>> = {
  Kim: "Kim",
  Mộc: "Moc",
  Thủy: "Thuy",
  Hỏa: "Hoa",
  Thổ: "Tho",
};

/** Tra một cục theo số. Trả null nếu số ngoài 1-81 (không được xảy ra sau khi rút gọn). */
export function traCuc(so: number): Cuc | null {
  return BANG_81_CUC.find((c) => c.so === so) ?? null;
}

/** Số nét một chữ cái đơn (đã bỏ dấu). Trả 0 nếu không tra được (báo lên tầng trên). */
export function soNetChuCai(ch: string): number {
  return BANG_CHU_CAI[ch] ?? 0;
}

export function hangSoDinhDanh(hanh: NguHanh, gioiTinh: GioiTinh): number {
  const h = HANG_SO[HANH_SANG_MA[hanh]];
  return gioiTinh === "nam" ? h.nam : h.nu;
}
