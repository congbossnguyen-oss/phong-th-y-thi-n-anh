/**
 * TUỔI HỢP LÀM ĂN — lớp facade mỏng bọc `Scoring.calculateBusinessCompatibility` (rule-engine)
 * để trang web chỉ cần gọi 1 hàm duy nhất với 2 năm sinh, không cần tự dựng `NguoiTuoi`.
 */
import { Scoring } from "@thien-anh/rule-engine";

const NAM_SINH_TOI_THIEU = 1900;
const NAM_SINH_TOI_DA = 2100;

export interface TuoiHopLamAnInput {
  namSinh1: number;
  namSinh2: number;
}

export type TuoiHopLamAnResult = Scoring.TuoiHopLamAnResult;

function validateNamSinh(namSinh: number, nhan: string): void {
  if (!Number.isInteger(namSinh) || namSinh < NAM_SINH_TOI_THIEU || namSinh > NAM_SINH_TOI_DA) {
    throw new Error(`${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_SINH_TOI_THIEU}-${NAM_SINH_TOI_DA}.`);
  }
}

export function calculateTuoiHopLamAn(input: TuoiHopLamAnInput): TuoiHopLamAnResult {
  validateNamSinh(input.namSinh1, "namSinh1");
  validateNamSinh(input.namSinh2, "namSinh2");

  const nguoi1 = Scoring.getNguoiTuoi(input.namSinh1);
  const nguoi2 = Scoring.getNguoiTuoi(input.namSinh2);
  return Scoring.calculateBusinessCompatibility(nguoi1, nguoi2);
}
