/**
 * CHỌN NĂM SINH CON — lớp facade bọc `ChonNamSinhCon` (rule-engine): validate năm sinh cha/mẹ
 * 1900-2100 + khoảng năm tìm con (tối đa 30 năm).
 */
import { ChonNamSinhCon } from "@thien-anh/rule-engine";

const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
const KHOANG_NAM_QUET_TOI_DA = 30;

export type GioiTinhCon = "nam" | "nu";

export interface ChonNamSinhConInput {
  namSinhCha: number;
  namSinhMe: number;
  gioiTinhCon: GioiTinhCon;
  tuNam: number;
  denNam: number;
}

export type ChonNamSinhConResult = ChonNamSinhCon.ChildYearResult[];

function validateNam(nam: number, nhan: string): void {
  if (!Number.isInteger(nam) || nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) {
    throw new Error(`${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
}

export function calculateChonNamSinhCon(input: ChonNamSinhConInput): ChonNamSinhConResult {
  validateNam(input.namSinhCha, "Năm sinh cha");
  validateNam(input.namSinhMe, "Năm sinh mẹ");
  if (input.gioiTinhCon !== "nam" && input.gioiTinhCon !== "nu") {
    throw new Error("Giới tính con không hợp lệ.");
  }
  validateNam(input.tuNam, "Từ năm");
  validateNam(input.denNam, "Đến năm");
  if (input.tuNam > input.denNam) {
    throw new Error("Từ năm phải nhỏ hơn hoặc bằng Đến năm.");
  }
  if (input.denNam - input.tuNam + 1 > KHOANG_NAM_QUET_TOI_DA) {
    throw new Error(`Khoảng năm quét tối đa ${KHOANG_NAM_QUET_TOI_DA} năm.`);
  }

  return ChonNamSinhCon.rankChildBirthYears(input.namSinhCha, input.namSinhMe, input.gioiTinhCon, input.tuNam, input.denNam);
}
