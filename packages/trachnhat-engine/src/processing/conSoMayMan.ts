/**
 * CON SỐ MAY MẮN 00-99 — lớp facade bọc `ConSoMayMan` (rule-engine): validate năm sinh
 * 1900-2100 + ngày tính, tự suy Ngũ Hành bản mệnh (từ năm sinh) và Nạp Âm ngày (từ ngày tính
 * dương lịch) qua calendar-core, rồi trả về Top N số may mắn.
 */
import { getCanChi } from "@thien-anh/calendar-core";
import { ConSoMayMan } from "@thien-anh/rule-engine";

const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const TOP_N_MAC_DINH = 3;

export interface ConSoMayManInput {
  namSinh: number;
  ngayTinh: { day: number; month: number; year: number };
  purpose?: ConSoMayMan.LuckyNumberPurpose;
  limit?: number;
  timeZone?: string;
}

export type ConSoMayManResult = ConSoMayMan.LuckyNumberResult;

function validateNamSinh(namSinh: number): void {
  if (!Number.isInteger(namSinh) || namSinh < NAM_TOI_THIEU || namSinh > NAM_TOI_DA) {
    throw new Error(`Năm sinh không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
}

export function calculateConSoMayMan(input: ConSoMayManInput): ConSoMayManResult[] {
  validateNamSinh(input.namSinh);
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;

  const nguoi = ConSoMayMan.getNguoiTuoi(input.namSinh);
  const canChiNgay = getCanChi({
    year: input.ngayTinh.year,
    month: input.ngayTinh.month,
    day: input.ngayTinh.day,
    hour: 12,
    timeZone,
  });
  const nguHanhNgay = canChiNgay.day.napAm.element;
  const purpose = input.purpose ?? "TONG_VAN";
  const limit = input.limit ?? TOP_N_MAC_DINH;

  return ConSoMayMan.getTopLuckyNumbers(nguoi, nguHanhNgay, purpose, limit);
}
