/**
 * XEM TUỔI XÔNG ĐẤT / XÔNG NHÀ — lớp facade bọc `XemTuoiXongDat` (rule-engine): validate năm
 * sinh gia chủ, năm xông, và khoảng năm sinh ứng viên (tối đa 60 năm — phạm vi ứng viên cần
 * rộng hơn các module khác vì phải quét đủ nhiều thế hệ).
 */
import { XemTuoiXongDat } from "@thien-anh/rule-engine";

const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
const KHOANG_NAM_UNG_VIEN_TOI_DA = 60;
const TOP_N_MAC_DINH = 5;

export interface XemTuoiXongDatInput {
  giaChuNamSinh: number;
  namXong: number;
  tuNamSinhUngVien: number;
  denNamSinhUngVien: number;
  limit?: number;
}

export type XongDatCandidateResult = XemTuoiXongDat.XongDatCandidateResult;
export type XongDatExcludedResult = XemTuoiXongDat.XongDatExcludedResult;

export interface XemTuoiXongDatOutput {
  hopLe: XongDatCandidateResult[];
  loaiTru: XongDatExcludedResult[];
}

function validateNam(nam: number, nhan: string): void {
  if (!Number.isInteger(nam) || nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) {
    throw new Error(`${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
}

export function calculateXemTuoiXongDat(input: XemTuoiXongDatInput): XemTuoiXongDatOutput {
  validateNam(input.giaChuNamSinh, "Năm sinh gia chủ");
  validateNam(input.namXong, "Năm xông");
  validateNam(input.tuNamSinhUngVien, "Từ năm sinh ứng viên");
  validateNam(input.denNamSinhUngVien, "Đến năm sinh ứng viên");
  if (input.tuNamSinhUngVien > input.denNamSinhUngVien) {
    throw new Error("Từ năm sinh ứng viên phải nhỏ hơn hoặc bằng Đến năm sinh ứng viên.");
  }
  if (input.denNamSinhUngVien - input.tuNamSinhUngVien + 1 > KHOANG_NAM_UNG_VIEN_TOI_DA) {
    throw new Error(`Khoảng năm sinh ứng viên tối đa ${KHOANG_NAM_UNG_VIEN_TOI_DA} năm.`);
  }

  const limit = input.limit ?? TOP_N_MAC_DINH;
  const hopLe = XemTuoiXongDat.getTopXongDatCandidates(
    input.giaChuNamSinh,
    input.namXong,
    input.tuNamSinhUngVien,
    input.denNamSinhUngVien,
    limit,
  );
  const loaiTru = XemTuoiXongDat.getExcludedXongDatCandidates(
    input.giaChuNamSinh,
    input.namXong,
    input.tuNamSinhUngVien,
    input.denNamSinhUngVien,
  );

  return { hopLe, loaiTru };
}
