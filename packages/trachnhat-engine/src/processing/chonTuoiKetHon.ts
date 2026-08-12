/**
 * CHỌN TUỔI KẾT HÔN — lớp facade bọc `ChonTuoiKetHon` (rule-engine): validate năm sinh
 * 1900-2100 + giới tính, cung cấp 2 chế độ — so sánh 2 người cụ thể, và tìm N tuổi hợp nhất
 * trong 1 khoảng năm.
 */
import { ChonTuoiKetHon } from "@thien-anh/rule-engine";

const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
const KHOANG_NAM_QUET_TOI_DA = 30;

export type GioiTinh = "nam" | "nu";

export interface KetHonPersonInput {
  namSinh: number;
  gioiTinh: GioiTinh;
}

export interface ChonTuoiKetHonInput {
  nguoi1: KetHonPersonInput;
  nguoi2: KetHonPersonInput;
}

export type ChonTuoiKetHonResult = ChonTuoiKetHon.KetHonResult;

export interface TimTuoiKetHonInput {
  coDinh: KetHonPersonInput;
  timGioiTinh: GioiTinh;
  tuNam: number;
  denNam: number;
}

export type TimTuoiKetHonResult = ChonTuoiKetHon.MarriageMatchCandidate[];

function validateNguoi(nguoi: KetHonPersonInput, nhan: string): void {
  if (!Number.isInteger(nguoi.namSinh) || nguoi.namSinh < NAM_TOI_THIEU || nguoi.namSinh > NAM_TOI_DA) {
    throw new Error(`Năm sinh ${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (nguoi.gioiTinh !== "nam" && nguoi.gioiTinh !== "nu") {
    throw new Error(`Giới tính ${nhan} không hợp lệ.`);
  }
}

export function calculateChonTuoiKetHon(input: ChonTuoiKetHonInput): ChonTuoiKetHonResult {
  validateNguoi(input.nguoi1, "người 1");
  validateNguoi(input.nguoi2, "người 2");

  const nguoi1 = ChonTuoiKetHon.getKetHonNguoi(input.nguoi1.namSinh, input.nguoi1.gioiTinh);
  const nguoi2 = ChonTuoiKetHon.getKetHonNguoi(input.nguoi2.namSinh, input.nguoi2.gioiTinh);
  return ChonTuoiKetHon.calculateKetHonScore(nguoi1, nguoi2);
}

export function timTuoiKetHonPhuHop(input: TimTuoiKetHonInput): TimTuoiKetHonResult {
  validateNguoi(input.coDinh, "cố định");
  if (input.timGioiTinh !== "nam" && input.timGioiTinh !== "nu") {
    throw new Error("Giới tính cần tìm không hợp lệ.");
  }
  if (!Number.isInteger(input.tuNam) || input.tuNam < NAM_TOI_THIEU || input.tuNam > NAM_TOI_DA) {
    throw new Error(`Từ năm không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (!Number.isInteger(input.denNam) || input.denNam < NAM_TOI_THIEU || input.denNam > NAM_TOI_DA) {
    throw new Error(`Đến năm không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (input.tuNam > input.denNam) {
    throw new Error("Từ năm phải nhỏ hơn hoặc bằng Đến năm.");
  }
  if (input.denNam - input.tuNam + 1 > KHOANG_NAM_QUET_TOI_DA) {
    throw new Error(`Khoảng năm quét tối đa ${KHOANG_NAM_QUET_TOI_DA} năm.`);
  }

  const coDinh = ChonTuoiKetHon.getKetHonNguoi(input.coDinh.namSinh, input.coDinh.gioiTinh);
  return ChonTuoiKetHon.findBestMarriageMatches(coDinh, input.timGioiTinh, input.tuNam, input.denNam);
}
