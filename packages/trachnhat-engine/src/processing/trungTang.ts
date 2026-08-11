/**
 * TÍNH TRÙNG TANG — lớp facade bọc `TrungTang.luanTrungTang` (rule-engine) để trang web chỉ
 * cần truyền năm sinh/năm mất dương lịch-âm lịch đơn giản, không phải tự tính Can Chi.
 *
 * Người dùng chỉ cần nhập Giới tính + Năm sinh + Năm/Tháng/Ngày/Giờ mất (âm lịch) — hệ thống tự
 * suy tuổi ta (= năm mất − năm sinh + 1), tự tính Can Chi ngày mất (quy đổi âm→dương rồi tra
 * Can Chi) và Can Chi năm mất/năm sinh (quy ước "năm con giáp" đại chúng, giống
 * `tuoiHopLamAn.ts`), không cần biết trước phong thủy.
 */
import { Data, getCanChi, getSolarDateFromLunar } from "@thien-anh/calendar-core";
import { Scoring, TrungTang } from "@thien-anh/rule-engine";

type Chi = Data.Chi;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;

export interface TrungTangThanQuyenInput {
  truongNam?: Chi;
  conDauLon?: Chi;
  chauNoiLon?: Chi;
  anhTraiLon?: Chi;
  chaMe?: readonly Chi[];
}

export interface TrungTangInput {
  gioiTinh: TrungTang.GioiTinh;
  namSinhAmLich: number;
  namMatAmLich: number;
  thangMatAmLich: number;
  ngayMatAmLich: number;
  /** Tháng mất có phải tháng nhuận hay không — bỏ trống nếu không rõ/không phải. */
  thangNhuan?: boolean;
  /** 1 trong 12 Chi giờ — bỏ trống nếu không rõ giờ mất. */
  gioMat?: Chi;
  timeZone?: string;
  thanQuyen?: TrungTangThanQuyenInput;
}

export type TrungTangResult = TrungTang.LuanTrungTangResult | { duoi10Tuoi: true };

export interface TrungTangOutput {
  tuoiMat: number;
  ketQua: TrungTangResult;
}

function validateNam(nam: number, nhan: string): void {
  if (!Number.isInteger(nam) || nam < NAM_TOI_THIEU || nam > NAM_TOI_DA) {
    throw new Error(`${nhan} không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
}

export function calculateTrungTang(input: TrungTangInput): TrungTangOutput {
  validateNam(input.namSinhAmLich, "namSinhAmLich");
  validateNam(input.namMatAmLich, "namMatAmLich");
  if (!Number.isInteger(input.thangMatAmLich) || input.thangMatAmLich < 1 || input.thangMatAmLich > 12) {
    throw new Error("thangMatAmLich phải từ 1 đến 12.");
  }
  if (!Number.isInteger(input.ngayMatAmLich) || input.ngayMatAmLich < 1 || input.ngayMatAmLich > 30) {
    throw new Error("ngayMatAmLich không hợp lệ.");
  }
  if (input.namMatAmLich < input.namSinhAmLich) {
    throw new Error("namMatAmLich phải sau hoặc bằng namSinhAmLich.");
  }

  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const tuoiMat = input.namMatAmLich - input.namSinhAmLich + 1; // tuổi ta

  if (tuoiMat < TrungTang.TUOI_TOI_THIEU_TINH_TRUNG_TANG) {
    return { tuoiMat, ketQua: { duoi10Tuoi: true } };
  }

  // Quy đổi ngày mất âm lịch -> dương lịch, rồi tra Can Chi Ngày thật (khác cung "đếm tay" ở Bước 1).
  const solarNgayMat = getSolarDateFromLunar(
    { day: input.ngayMatAmLich, month: input.thangMatAmLich, year: input.namMatAmLich, isLeapMonth: input.thangNhuan ?? false },
    timeZone,
  );
  const canChiNgayMat = getCanChi({ ...solarNgayMat, hour: 12, timeZone });

  const chiTuoiVong = Scoring.getChi(input.namSinhAmLich);
  const canNamMat = Scoring.getCan(input.namMatAmLich);
  const chiNamMat = Scoring.getChi(input.namMatAmLich);

  const ketQua = TrungTang.luanTrungTang({
    gioiTinh: input.gioiTinh,
    tuoiMat,
    thangMatAmLich: input.thangMatAmLich,
    ngayMatAmLich: input.ngayMatAmLich,
    gioMat: input.gioMat ?? null,
    canNgayMat: canChiNgayMat.day.can,
    chiNgayMat: canChiNgayMat.day.chi,
    canNamMat,
    chiNamMat,
    chiTuoiVong,
    ...(input.thanQuyen ? { thanQuyen: input.thanQuyen } : {}),
  });

  return { tuoiMat, ketQua };
}
