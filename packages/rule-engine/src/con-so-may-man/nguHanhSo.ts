/**
 * NGŨ HÀNH CHỮ SỐ 0-9 — theo bảng Hà Đồ/Lạc Thư (số 1-9 ứng Hậu Thiên Bát Quái: Khảm-Khôn-
 * Chấn-Tốn-trung cung-Càn-Đoài-Cấn-Ly), là bảng phổ biến nhất trong phong thủy số (SIM, biển
 * số...). ⚠️ Riêng số 0: hệ thống xếp cùng nhóm "trung cung" với số 5 (Thổ) theo quy ước dân
 * dụng phổ biến nhất — một số nguồn khác quy 0 về số 10 (=1+0, tính như số 1, Thủy). Chưa đối
 * chiếu được với 1 nguồn sách cụ thể; nếu Công có nguồn xác định khác, chỉ cần sửa bảng này.
 */
import type { Data } from "@thien-anh/calendar-core";

type NguHanh = Data.NguHanh;

export const LUCKY_NUMBER_ELEMENT_RULES: Record<number, NguHanh> = {
  0: "Thổ",
  1: "Thủy",
  2: "Thổ",
  3: "Mộc",
  4: "Mộc",
  5: "Thổ",
  6: "Kim",
  7: "Kim",
  8: "Thổ",
  9: "Hỏa",
};

export function getNguHanhChuSo(chuSo: number): NguHanh {
  if (!Number.isInteger(chuSo) || chuSo < 0 || chuSo > 9) {
    throw new Error(`Chữ số không hợp lệ: ${chuSo} (phải là số nguyên 0-9).`);
  }
  return LUCKY_NUMBER_ELEMENT_RULES[chuSo]!;
}

export interface NguHanhSoResult {
  hangChuc: NguHanh;
  hangDonVi: NguHanh;
}

export function calculateNumberElement(soMay: number): NguHanhSoResult {
  if (!Number.isInteger(soMay) || soMay < 0 || soMay > 99) {
    throw new Error(`Số may mắn không hợp lệ: ${soMay} (phải là số nguyên 00-99).`);
  }
  return {
    hangChuc: getNguHanhChuSo(Math.floor(soMay / 10)),
    hangDonVi: getNguHanhChuSo(soMay % 10),
  };
}

/** Định dạng số luôn đủ 2 chữ số, vd 6 -> "06". */
export function formatSoMayMan(soMay: number): string {
  return String(soMay).padStart(2, "0");
}
