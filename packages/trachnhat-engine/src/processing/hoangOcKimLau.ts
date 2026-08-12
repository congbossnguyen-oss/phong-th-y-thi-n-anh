/**
 * HOÀNG ỐC – KIM LÂU – TAM TAI — lớp facade mỏng bọc `HoangOcKimLau` (rule-engine): validate
 * năm 1900-2100, cung cấp 2 chế độ — xem 1 năm, và quét 1 khoảng năm để tìm năm tốt xây nhà.
 */
import { HoangOcKimLau } from "@thien-anh/rule-engine";

const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;

export interface HoangOcKimLauInput {
  namSinh: number;
  namXem: number;
}

export interface HoangOcKimLauRangeInput {
  namSinh: number;
  tuNam: number;
  denNam: number;
}

export type HoangOcKimLauResult = HoangOcKimLau.HoangOcKimLauTamTaiResult;

const KHOANG_NAM_QUET_TOI_DA = 30;

function validateNam(nam: number, nhan: string): void {
  if (!Number.isInteger(nam) || nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) {
    throw new Error(`${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
}

export function calculateHoangOcKimLau(input: HoangOcKimLauInput): HoangOcKimLauResult {
  validateNam(input.namSinh, "Năm sinh");
  validateNam(input.namXem, "Năm cần xem");
  return HoangOcKimLau.tinhHoangOcKimLauTamTai(input.namSinh, input.namXem);
}

export function calculateHoangOcKimLauRange(input: HoangOcKimLauRangeInput): HoangOcKimLauResult[] {
  validateNam(input.namSinh, "Năm sinh");
  validateNam(input.tuNam, "Từ năm");
  validateNam(input.denNam, "Đến năm");
  if (input.tuNam > input.denNam) {
    throw new Error("Từ năm phải nhỏ hơn hoặc bằng Đến năm.");
  }
  if (input.denNam - input.tuNam + 1 > KHOANG_NAM_QUET_TOI_DA) {
    throw new Error(`Khoảng năm quét tối đa ${KHOANG_NAM_QUET_TOI_DA} năm.`);
  }
  return HoangOcKimLau.rankGoodHouseBuildingYears(input.namSinh, input.tuNam, input.denNam);
}
