/**
 * CẤU TRÚC CẶP SỐ — xét quan hệ Ngũ Hành giữa chữ số hàng chục và hàng đơn vị, có phân biệt
 * chiều (68 ≠ 86) theo quy ước: hàng đơn vị SINH hàng chục ("được sinh", tài nhập) được coi là
 * thuận hơn hàng chục SINH hàng đơn vị ("sinh xuất", tài đi ra) — dù cả 2 đều thuộc tương sinh.
 *
 * ⚠️ Đây là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA để đáp ứng yêu cầu "68 khác 86" của đặc tả, KHÔNG
 * trích dẫn từ 1 trang sách cụ thể nào (cùng tính chất với `TUOI_HOP_LAM_AN_SCORING_RULES` ở
 * module Tuổi Hợp Làm Ăn) — trọng số nằm trong `CAU_TRUC_CAP_SO_RULES`, dễ chỉnh sau này.
 */
import { getNguHanhQuanHe } from "../trach-nhat/nguHanhQuanHe.js";
import { calculateNumberElement } from "./nguHanhSo.js";

export const CAU_TRUC_CAP_SO_RULES = {
  diemNenTang: 5,
  tuongHoaDiem: 1.5,
  /** Hàng đơn vị sinh hàng chục — "được sinh", tài nhập. */
  duocSinhDiem: 3.5,
  /** Hàng chục sinh hàng đơn vị — "sinh xuất", tài đi ra, vẫn thuận nhưng kém hơn được sinh. */
  sinhXuatDiem: 2,
  khacDiem: -2.5,
} as const;

export interface CauTrucCapSoResult {
  diem: number;
  moTa: string;
}

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

export function calculateNumberPairStructure(soMay: number): CauTrucCapSoResult {
  const { hangChuc, hangDonVi } = calculateNumberElement(soMay);
  const R = CAU_TRUC_CAP_SO_RULES;
  let diem = R.diemNenTang;

  const quanHe = getNguHanhQuanHe(hangChuc, hangDonVi);
  switch (quanHe) {
    case "tuong-hoa":
      diem += R.tuongHoaDiem;
      return { diem: clamp10(diem), moTa: `Đồng hành (${hangChuc})` };
    case "a-sinh-b":
      diem += R.sinhXuatDiem;
      return { diem: clamp10(diem), moTa: `${hangChuc} sinh ${hangDonVi} (sinh xuất)` };
    case "b-sinh-a":
      diem += R.duocSinhDiem;
      return { diem: clamp10(diem), moTa: `${hangDonVi} sinh ${hangChuc} (được sinh)` };
    case "a-khac-b":
      diem += R.khacDiem;
      return { diem: clamp10(diem), moTa: `${hangChuc} khắc ${hangDonVi}` };
    case "b-khac-a":
      diem += R.khacDiem;
      return { diem: clamp10(diem), moTa: `${hangDonVi} khắc ${hangChuc}` };
  }
}
