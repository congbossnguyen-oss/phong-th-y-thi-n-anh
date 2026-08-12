/**
 * LỘC TỒN, QUÝ NHÂN, DỊCH MÃ — 3 bảng tra bổ trợ dùng cho Xem Tuổi Xông Đất/Xông Nhà.
 *
 * - Lộc Tồn: bảng cố định theo Thiên Can, không có dị bản giữa các trường phái Tứ Trụ/Tử Vi.
 * - Dịch Mã: theo tam hợp cục của tuổi (Thân-Tý-Thìn/Dần-Ngọ-Tuất/Tỵ-Dậu-Sửu/Hợi-Mão-Mùi), mỗi
 *   nhóm có Dịch Mã tại 1 Chi cố định — cũng không có dị bản.
 * - Thiên Ất Quý Nhân: theo đúng khẩu quyết cổ "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương,
 *   Bính Đinh trư kê vị, Nhâm Quý thỏ xà tàng, Lục Tân phùng hổ mã". ⚠️ Nguồn có nhiều dị bản
 *   về việc Chi nào là "Dương Quý" và Chi nào là "Âm Quý" cho từng Can — hệ thống GỘP CHUNG
 *   thành 1 danh sách "Quý Nhân" (2 Chi/Can), KHÔNG tách Dương/Âm Quý riêng để tránh gán nhầm
 *   nhãn. Cặp Chi (không phân biệt dương/âm) là kiến thức không tranh cãi.
 */
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export const LOC_TON: Record<Can, Chi> = {
  Giáp: "Dần",
  Ất: "Mão",
  Bính: "Tỵ",
  Đinh: "Ngọ",
  Mậu: "Tỵ",
  Kỷ: "Ngọ",
  Canh: "Thân",
  Tân: "Dậu",
  Nhâm: "Hợi",
  Quý: "Tý",
};

export function getLocTon(can: Can): Chi {
  return LOC_TON[can];
}

export function isLocCuaCan(chi: Chi, can: Can): boolean {
  return getLocTon(can) === chi;
}

export const THIEN_AT_QUY_NHAN: Record<Can, readonly [Chi, Chi]> = {
  Giáp: ["Sửu", "Mùi"],
  Mậu: ["Sửu", "Mùi"],
  Canh: ["Sửu", "Mùi"],
  Ất: ["Tý", "Thân"],
  Kỷ: ["Tý", "Thân"],
  Bính: ["Hợi", "Dậu"],
  Đinh: ["Hợi", "Dậu"],
  Nhâm: ["Mão", "Tỵ"],
  Quý: ["Mão", "Tỵ"],
  Tân: ["Dần", "Ngọ"],
};

export function getQuyNhan(can: Can): readonly [Chi, Chi] {
  return THIEN_AT_QUY_NHAN[can];
}

export function isQuyNhanCuaCan(chi: Chi, can: Can): boolean {
  return (getQuyNhan(can) as readonly Chi[]).includes(chi);
}

const DICH_MA_THEO_TUOI: Record<Chi, Chi> = {
  Thân: "Dần",
  Tý: "Dần",
  Thìn: "Dần",
  Dần: "Thân",
  Ngọ: "Thân",
  Tuất: "Thân",
  Tỵ: "Hợi",
  Dậu: "Hợi",
  Sửu: "Hợi",
  Hợi: "Tỵ",
  Mão: "Tỵ",
  Mùi: "Tỵ",
};

export function getDichMa(chiTuoi: Chi): Chi {
  return DICH_MA_THEO_TUOI[chiTuoi];
}

export function isDichMaCuaTuoi(chi: Chi, chiTuoi: Chi): boolean {
  return getDichMa(chiTuoi) === chi;
}
