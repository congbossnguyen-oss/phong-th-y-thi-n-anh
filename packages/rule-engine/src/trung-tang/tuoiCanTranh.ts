/**
 * TRÙNG TANG — Bước 5: các nhóm tuổi cần tránh mặt (nguồn Chương 6 §7, Chương 8 mục VII+IX,
 * Chương 9, Chương 11 mục I.2 và I.4 "Sổ Tay Tang Sự"). Tái dùng đúng các bảng Can Chi nền
 * tảng đã có trong `trach-nhat/` (Tam Hợp, Lục Xung, Tam Hình) — không suy đoán quy tắc mới.
 *
 * Phạm vi ảnh hưởng: CHỈ người huyết thống trực hệ với vong (cha mẹ, vợ/chồng, con, anh chị
 * em ruột, cháu nội). Con dâu, con rể, cháu ngoại, người ngoài không chịu tác động — tầng hiển
 * thị phải nhắc rõ điều này.
 *
 * Nhóm 5 (Cung phi Bát Trạch xung khắc với vong mệnh) KHÔNG tính ở đây — cần lập cung mệnh Bát
 * Trạch riêng (khác hệ thống), đề nghị liên hệ tư vấn trực tiếp.
 */
import type { Data } from "@thien-anh/calendar-core";
import { TAM_HOP_NHOM } from "../trach-nhat/tamHop.js";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import { getHinhThaiTueChi, TU_HINH } from "../trach-nhat/thaiTue.js";

type Chi = Data.Chi;

/** Nhóm 1 — Long Hổ Kê Xà tứ sinh nhân ngoại — áp dụng LUÔN, kể cả không phạm trùng tang. */
export const LONG_HO_KE_XA: readonly Chi[] = ["Thìn", "Dần", "Dậu", "Tỵ"];

function tamHopCuaChi(chi: Chi): readonly Chi[] {
  const nhom = TAM_HOP_NHOM.find((n) => (n as readonly Chi[]).includes(chi));
  return nhom ?? [];
}

/** Nhóm 2 — tam hợp của (các) cung phạm Trùng Tang trong 4 cung (Tuổi/Tháng/Ngày/Giờ). */
export function tuoiTranhNhom2(cacCungPham: readonly Chi[]): readonly Chi[] {
  const ket = new Set<Chi>();
  for (const chi of cacCungPham) {
    for (const c of tamHopCuaChi(chi)) ket.add(c);
  }
  return [...ket];
}

/** Nhóm 3 — tam hợp với Chi tuổi (năm sinh) của vong. */
export function tuoiTranhNhom3(chiTuoiVong: Chi): readonly Chi[] {
  return tamHopCuaChi(chiTuoiVong);
}

export interface TuoiTranhNhom4 {
  xung: Chi;
  hinh: readonly Chi[];
}

/** Nhóm 4 — tuổi xung, tuổi hình với Chi tuổi (năm sinh) của vong. */
export function tuoiTranhNhom4(chiTuoiVong: Chi): TuoiTranhNhom4 {
  const xung = getLucXungChi(chiTuoiVong);
  const hinh = [...getHinhThaiTueChi(chiTuoiVong)];
  if ((TU_HINH as readonly Chi[]).includes(chiTuoiVong)) hinh.push(chiTuoiVong); // tự hình
  return { xung, hinh };
}

/** Luôn tránh 4 giờ Dần-Thân-Tỵ-Hợi khi chọn giờ liệm, bất kể có trùng tang hay không. */
export const GIO_LIEM_LUON_TRANH: readonly Chi[] = ["Dần", "Thân", "Tỵ", "Hợi"];

export interface Nhom6ThanQuyen {
  truongNam?: Chi;
  conDauLon?: Chi;
  chauNoiLon?: Chi;
  /** Dùng khi không có con trai/dâu/cháu nội — thay bằng anh trai lớn + cha mẹ. */
  anhTraiLon?: Chi;
  chaMe?: readonly Chi[];
}

/** Nhóm 6 — giờ liệm kỵ theo tuổi thân quyến (kỵ GIỜ, không kỵ mặt) + luôn tránh Dần/Thân/Tỵ/Hợi. */
export function tuoiTranhNhom6(thanQuyen: Nhom6ThanQuyen): readonly Chi[] {
  const ket = new Set<Chi>(GIO_LIEM_LUON_TRANH);
  if (thanQuyen.truongNam) ket.add(thanQuyen.truongNam);
  if (thanQuyen.conDauLon) ket.add(thanQuyen.conDauLon);
  if (thanQuyen.chauNoiLon) ket.add(thanQuyen.chauNoiLon);
  if (thanQuyen.anhTraiLon) ket.add(thanQuyen.anhTraiLon);
  for (const c of thanQuyen.chaMe ?? []) ket.add(c);
  return [...ket];
}

export interface TuoiCanTranhKetQua {
  nhom1LongHoKeXa: readonly Chi[];
  nhom2TamHopCungPham: readonly Chi[];
  nhom3TamHopTuoiVong: readonly Chi[];
  nhom4XungHinh: TuoiTranhNhom4;
  nhom6GioLiemKyThanQuyen: readonly Chi[];
}

export function tinhTuoiCanTranh(cacCungPham: readonly Chi[], chiTuoiVong: Chi, thanQuyen: Nhom6ThanQuyen = {}): TuoiCanTranhKetQua {
  return {
    nhom1LongHoKeXa: LONG_HO_KE_XA,
    nhom2TamHopCungPham: tuoiTranhNhom2(cacCungPham),
    nhom3TamHopTuoiVong: tuoiTranhNhom3(chiTuoiVong),
    nhom4XungHinh: tuoiTranhNhom4(chiTuoiVong),
    nhom6GioLiemKyThanQuyen: tuoiTranhNhom6(thanQuyen),
  };
}
