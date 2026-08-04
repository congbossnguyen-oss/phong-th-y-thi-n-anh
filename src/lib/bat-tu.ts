// Lập lá số Bát Tự (Tứ Trụ) cơ bản: 4 trụ Can Chi, Tàng Can, Trường Sinh, Thập Thần, Nạp Âm.
// CỐ TÌNH KHÔNG tính: Đại Vận (cần độ chính xác tiết khí ở mức ngày/giờ khởi vận), Thần Sát đầy đủ,
// Mệnh Cung, Thai Nguyên — các phần này có nhiều dị bản giữa các trường phái và rủi ro sai cao hơn
// nếu tự suy diễn, nên chưa đưa vào công cụ tự động này.

import { CAN, CHI, NAP_AM, type NguHanh } from "./menh-nap-am";
import { jdFromDate, getMonthChiIndex, getTietKhiAround } from "./solar-term";

export type AmDuong = "Dương" | "Âm";

const CAN_NGU_HANH: NguHanh[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];
const CAN_AM_DUONG: AmDuong[] = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"];
const CHI_NGU_HANH: NguHanh[] = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
const CHI_AM_DUONG: AmDuong[] = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"];

// Tàng Can — Can ẩn trong mỗi Chi (thứ tự: chính khí trước, tạp khí sau).
const TANG_CAN: number[][] = [
  [9], // Tý: Quý
  [5, 9, 7], // Sửu: Kỷ, Quý, Tân
  [0, 2, 4], // Dần: Giáp, Bính, Mậu
  [1], // Mão: Ất
  [4, 1, 9], // Thìn: Mậu, Ất, Quý
  [2, 4, 6], // Tỵ: Bính, Mậu, Canh
  [3, 5], // Ngọ: Đinh, Kỷ
  [5, 3, 1], // Mùi: Kỷ, Đinh, Ất
  [6, 8, 4], // Thân: Canh, Nhâm, Mậu
  [7], // Dậu: Tân
  [4, 7, 3], // Tuất: Mậu, Tân, Đinh
  [8, 0], // Hợi: Nhâm, Giáp
];

export interface PillarInfo {
  canIndex: number;
  chiIndex: number;
  can: string;
  chi: string;
  napAm: string;
  napAmElement: NguHanh;
  tangCan: { canIndex: number; can: string; thapThan: string }[];
  thapThan: string; // thập thần của Can trụ này so với Nhật Chủ (trụ Ngày để trống — chính là Nhật Chủ)
  truongSinh?: string; // trạng thái Trường Sinh của Nhật Chủ tại Chi trụ này
}

export interface BatTuChart {
  year: PillarInfo;
  month: PillarInfo;
  day: PillarInfo;
  hour: PillarInfo;
  nhatChu: { canIndex: number; can: string; nguHanh: NguHanh; amDuong: AmDuong };
}

function napAmFor(canIndex: number, chiIndex: number): { name: string; element: NguHanh } {
  // Suy ra cycleIndex (0-59) từ can/chi bằng cách dò trong chu kỳ 60 (không có công thức đóng đơn giản
  // vì can chu kỳ 10, chi chu kỳ 12 — dùng CRT thủ công bằng vòng lặp, rẻ vì chỉ tối đa 60 bước).
  for (let cycle = 0; cycle < 60; cycle++) {
    if (cycle % 10 === canIndex && cycle % 12 === chiIndex) {
      return NAP_AM[Math.floor(cycle / 2)];
    }
  }
  throw new Error("Tổ hợp Can Chi không hợp lệ");
}

// Thập Thần: so sánh Can (canIndex) với Nhật Chủ (nhatChuIndex).
export function thapThanOf(canIndex: number, nhatChuIndex: number): string {
  const targetElement = CAN_NGU_HANH[canIndex];
  const selfElement = CAN_NGU_HANH[nhatChuIndex];
  const sameAmDuong = CAN_AM_DUONG[canIndex] === CAN_AM_DUONG[nhatChuIndex];

  if (canIndex === nhatChuIndex) return "Nhật Chủ";

  const SINH: Record<NguHanh, NguHanh> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
  const KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

  if (targetElement === selfElement) return sameAmDuong ? "Tỷ Kiên" : "Kiếp Tài";
  if (SINH[selfElement] === targetElement) return sameAmDuong ? "Thực Thần" : "Thương Quan";
  if (KHAC[selfElement] === targetElement) return sameAmDuong ? "Thiên Tài" : "Chính Tài";
  if (KHAC[targetElement] === selfElement) return sameAmDuong ? "Thất Sát" : "Chính Quan";
  if (SINH[targetElement] === selfElement) return sameAmDuong ? "Thiên Ấn" : "Chính Ấn";
  return "?";
}

const TRUONG_SINH_STAGES = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
];

// Vị trí Chi khởi đầu Trường Sinh và chiều đi (thuận/nghịch) theo từng Can.
const TRUONG_SINH_START: { chiIndex: number; forward: boolean }[] = [
  { chiIndex: 11, forward: true }, // Giáp: Hợi, thuận
  { chiIndex: 6, forward: false }, // Ất: Ngọ, nghịch
  { chiIndex: 2, forward: true }, // Bính: Dần, thuận
  { chiIndex: 9, forward: false }, // Đinh: Dậu, nghịch
  { chiIndex: 2, forward: true }, // Mậu: Dần, thuận (Hỏa Thổ đồng cung)
  { chiIndex: 9, forward: false }, // Kỷ: Dậu, nghịch
  { chiIndex: 5, forward: true }, // Canh: Tỵ, thuận
  { chiIndex: 0, forward: false }, // Tân: Tý, nghịch
  { chiIndex: 8, forward: true }, // Nhâm: Thân, thuận
  { chiIndex: 3, forward: false }, // Quý: Mão, nghịch
];

function truongSinhTrangThai(nhatChuIndex: number, chiIndex: number): string {
  const { chiIndex: start, forward } = TRUONG_SINH_START[nhatChuIndex];
  const diff = forward ? (chiIndex - start + 12) % 12 : (start - chiIndex + 12) % 12;
  return TRUONG_SINH_STAGES[diff];
}

// Ngũ Hổ Độn Nguyệt: Can của tháng Dần theo Can năm.
function thangDanCanIndex(yearCanIndex: number): number {
  return ((yearCanIndex % 5) * 2 + 2) % 10;
}

// Ngũ Thử Độn Giờ: Can của giờ Tý theo Can ngày.
function gioTyCanIndex(dayCanIndex: number): number {
  return ((dayCanIndex % 5) * 2) % 10;
}

export interface BatTuInput {
  day: number;
  month: number; // 1-12, dương lịch
  year: number;
  hour: number; // 0-23, giờ địa phương Việt Nam
}

function buildPillar(canIndex: number, chiIndex: number, nhatChuIndex: number, isNhatChu: boolean): PillarInfo {
  const napAm = napAmFor(canIndex, chiIndex);
  const tangCan = TANG_CAN[chiIndex].map((tcIdx) => ({
    canIndex: tcIdx,
    can: CAN[tcIdx],
    thapThan: thapThanOf(tcIdx, nhatChuIndex),
  }));
  return {
    canIndex,
    chiIndex,
    can: CAN[canIndex],
    chi: CHI[chiIndex],
    napAm: napAm.name,
    napAmElement: napAm.element,
    tangCan,
    thapThan: isNhatChu ? "Nhật Chủ" : thapThanOf(canIndex, nhatChuIndex),
    truongSinh: truongSinhTrangThai(nhatChuIndex, chiIndex),
  };
}

export function tinhBatTu(input: BatTuInput): BatTuChart {
  const { day, month, year, hour } = input;

  // Trụ ngày (chu kỳ 60 ngày liên tục qua Julian Day Number) — sinh từ 23h thuộc ngày hôm sau.
  const effectiveDay = hour >= 23 ? { day, month, year, shiftedForward: true } : { day, month, year, shiftedForward: false };
  let jdDay = jdFromDate(day, month, year);
  if (hour >= 23) jdDay += 1;
  const dayCanIndex = (jdDay + 9) % 10;
  const dayChiIndex = (jdDay + 1) % 12;
  const nhatChuIndex = dayCanIndex;

  // Trụ năm: ranh giới là Lập Xuân, không phải 1/1 dương lịch.
  const monthChiIndexNow = getMonthChiIndex(day, month, year, hour);
  // Nếu Chi tháng đã là Dần trở đi trong chu kỳ Dần..Sửu mà thời điểm hiện tại nằm TRƯỚC Lập Xuân
  // (tức Chi tháng vẫn thuộc nhóm Tý/Sửu của "năm Bát Tự trước"), năm Bát Tự lùi lại 1.
  // Cách xác định đơn giản và chắc chắn: so sánh trực tiếp với thời điểm Lập Xuân của năm dương lịch hiện tại.
  const jdNow = jdFromDate(day, month, year) + (hour - 12) / 24 - 7 / 24;
  const jdLapXuanNam = findLapXuanJD(year);
  const batTuYear = jdNow < jdLapXuanNam ? year - 1 : year;

  const yearCycleIndex = ((batTuYear - 4) % 60 + 60) % 60;
  const yearCanIndex = yearCycleIndex % 10;
  const yearChiIndex = yearCycleIndex % 12;

  // Trụ tháng
  const monthChiIndex = monthChiIndexNow;
  const danCan = thangDanCanIndex(yearCanIndex);
  const monthOffsetFromDan = (monthChiIndex - 2 + 12) % 12;
  const monthCanIndex = (danCan + monthOffsetFromDan) % 10;

  // Trụ giờ
  const hourChiIndex = Math.floor(((hour + 1) % 24) / 2);
  const tyCan = gioTyCanIndex(dayCanIndex);
  const hourCanIndex = (tyCan + hourChiIndex) % 10;

  return {
    year: buildPillar(yearCanIndex, yearChiIndex, nhatChuIndex, false),
    month: buildPillar(monthCanIndex, monthChiIndex, nhatChuIndex, false),
    day: buildPillar(dayCanIndex, dayChiIndex, nhatChuIndex, true),
    hour: buildPillar(hourCanIndex, hourChiIndex, nhatChuIndex, false),
    nhatChu: {
      canIndex: nhatChuIndex,
      can: CAN[nhatChuIndex],
      nguHanh: CAN_NGU_HANH[nhatChuIndex],
      amDuong: CAN_AM_DUONG[nhatChuIndex],
    },
  };
}

// Tìm JD của Lập Xuân trong năm dương lịch cho trước (dùng lại logic dò nhị phân của solar-term).
function findLapXuanJD(year: number): number {
  const crossings = getTietKhiAround(year);
  const lapXuan = crossings
    .filter((c) => c.name === "Lập Xuân")
    .sort((a, b) => a.jd - b.jd)
    .find((c) => {
      const approxJdJan1 = jdFromDate(1, 1, year);
      return c.jd >= approxJdJan1 - 40 && c.jd <= approxJdJan1 + 60;
    });
  if (!lapXuan) throw new Error("Không tìm thấy Lập Xuân cho năm " + year);
  return lapXuan.jd;
}

export { CAN_NGU_HANH, CAN_AM_DUONG, CHI_NGU_HANH, CHI_AM_DUONG };
