// Lập lá số Bát Tự (Tứ Trụ) đầy đủ: 4 trụ Can Chi, Tàng Can, Trường Sinh, Thập Thần, Nạp Âm,
// Đại Vận, Lưu Niên, Mệnh Cung, Thai Nguyên, Niên/Nhật Không, Thần Sát Nguyên Cục (~30 loại).
// Công thức Đại Vận/Mệnh Cung/Thai Nguyên/Không Vong lấy từ tài liệu "Bát Tự Nền Tảng" (Vũ Thiện Minh)
// và cross-check khớp 100% với ví dụ tham chiếu (31/8/1980 11:50, Dương Nam, GMT+7) từ hocvienlyso.org.
// Thần Sát: bảng tra lấy từ "Bát Tự Nền Tảng - Phần 3: Bát tự Thần sát" (Vũ Thiện Minh, 2022), mỗi
// bảng đã được đối chiếu lại từng ô số với tài liệu gốc trước khi đưa vào code (xem chi tiết ở khối
// "Bảng tra Thần Sát Nguyên Cục" bên dưới). Một số thần sát trong tài liệu (Học Đường/Từ Quán, Phúc
// Tinh Quý Nhân, Kim Thần, 13 biến thể chi tiết của Đào Hoa, Triệt Lộ/Tứ Đại Không Vong) bị CHỦ ĐỘNG
// BỎ QUA vì bảng OCR gốc bị rách/mâu thuẫn hoặc đòi hỏi phân tích cấu trúc nhiều điều kiện — không
// đoán ẩu công thức phong thủy khi nguồn không rõ ràng.

import { CAN, CHI, NAP_AM, type NguHanh } from "./menh-nap-am";
import { jdFromDate, getMonthChiIndex, getTietKhiAround } from "./solar-term";

export type AmDuong = "Dương" | "Âm";
export type Gender = "Nam" | "Nữ";

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

export interface DaiVanPeriod {
  canIndex: number;
  chiIndex: number;
  can: string;
  chi: string;
  startAge: number; // tuổi (mụ) khi bước vào đại vận này
  endAge: number;
  startDate: { d: number; m: number; y: number };
}

export interface LuuNienYear {
  year: number;
  tuoi: number;
  canIndex: number;
  chiIndex: number;
  can: string;
  chi: string;
}

export type PillarKey = "year" | "month" | "day" | "hour";

export interface BatTuChart {
  year: PillarInfo;
  month: PillarInfo;
  day: PillarInfo;
  hour: PillarInfo;
  nhatChu: { canIndex: number; can: string; nguHanh: NguHanh; amDuong: AmDuong };
  gender: Gender;
  daiVanForward: boolean;
  daiVan: DaiVanPeriod[];
  menhCung: { canIndex: number; chiIndex: number; can: string; chi: string };
  thaiNguyen: { canIndex: number; chiIndex: number; can: string; chi: string };
  nienKhong: string;
  nhatKhong: string;
  thanSat: Record<PillarKey, string[]>;
}

function napAmFor(canIndex: number, chiIndex: number): { name: string; element: NguHanh } {
  return NAP_AM[Math.floor(cycleIndexOf(canIndex, chiIndex) / 2)];
}

// Suy ra cycleIndex (0-59) từ can/chi bằng vòng lặp (rẻ, tối đa 60 bước) — không có công thức đóng
// đơn giản vì can chu kỳ 10, chi chu kỳ 12 (bài toán CRT thủ công).
function cycleIndexOf(canIndex: number, chiIndex: number): number {
  for (let cycle = 0; cycle < 60; cycle++) {
    if (cycle % 10 === canIndex && cycle % 12 === chiIndex) return cycle;
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

// Thứ tự 12 giai đoạn Trường Sinh — dùng chung cho cả Bát Tự (Can, thuận/nghịch, xem TRUONG_SINH_START
// bên dưới) và Lục Hào (Ngũ Hành, luôn thuận, xem LUC_HAO_TAM_HOP_START trong luc-hao.ts). Chỉ THỨ TỰ
// 12 giai đoạn là dùng chung; điểm khởi Trường Sinh của 2 hệ thống KHÁC NHAU (đặc biệt Thổ) nên không
// được dùng chung TRUONG_SINH_START.
export const TRUONG_SINH_STAGES = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
] as const;
export type TruongSinhStage = (typeof TRUONG_SINH_STAGES)[number];

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

// Ngũ Hổ Độn Nguyệt: Can của tháng Dần theo Can năm (dùng lại cho cả Trụ Tháng và Can Mệnh Cung).
function thangDanCanIndex(yearCanIndex: number): number {
  return ((yearCanIndex % 5) * 2 + 2) % 10;
}

// Ngũ Thử Độn Giờ: Can của giờ Tý theo Can ngày.
function gioTyCanIndex(dayCanIndex: number): number {
  return ((dayCanIndex % 5) * 2) % 10;
}

// --- Bảng tra Thần Sát Nguyên Cục (nguồn: "Bát Tự Nền Tảng" - Vũ Thiện Minh) ---
// Thiên Ất Quý Nhân: tra theo Can Ngày (chính) và Can Năm (phụ).
const THIEN_AT: number[][] = [
  [1, 7], // Giáp: Sửu/Mùi
  [0, 8], // Ất: Tý/Thân
  [9, 11], // Bính: Dậu/Hợi
  [9, 11], // Đinh: Dậu/Hợi
  [1, 7], // Mậu: Sửu/Mùi
  [0, 8], // Kỷ: Tý/Thân
  [2, 6], // Canh: Dần/Ngọ
  [2, 6], // Tân: Dần/Ngọ
  [3, 5], // Nhâm: Mão/Tị
  [3, 5], // Quý: Mão/Tị
];
// Văn Xương Quý Nhân: tra theo Can Ngày.
const VAN_XUONG: number[] = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
// Tướng Tinh: tra theo Chi Ngày, nhóm Tam Hợp → 1 Chi cố định. Index = chiIndex, value = target chiIndex.
const TUONG_TINH: number[] = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
// Tai Sát: tra theo Chi Ngày, nhóm Tứ Sinh/Tứ Vượng → 1 Chi cố định (Tứ Vượng đối xung).
const TAI_SAT: number[] = [6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0, 9];
// Kình Dương (Dương Nhận): tra theo Can Ngày — Địa Chi Đế Vượng của Nhật Can, đủ 10 Can.
const KINH_DUONG: number[] = [3, 2, 6, 5, 6, 5, 9, 8, 0, 11];
// Thái Cực Quý Nhân: Can Năm/Ngày → nhóm Chi (2 hoặc 4 Chi).
const THAI_CUC: number[][] = [
  [0, 6], [0, 6], [3, 9], [3, 9], [4, 10, 1, 7], [4, 10, 1, 7], [2, 11], [2, 11], [5, 8], [5, 8],
];
// Hoa Cái: Chi Năm/Ngày (nhóm Tam Hợp) → 1 Chi Thổ cố định.
const HOA_CAI: number[] = [4, 1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7];
// Nguyệt Đức Quý Nhân: Chi Tháng → 1 Can (chu kỳ 4 tháng).
const NGUYET_DUC: number[] = [8, 6, 2, 0, 8, 6, 2, 0, 8, 6, 2, 0];
// Thiên Đức Quý Nhân: Chi Tháng → mục tiêu (loại mục tiêu đổi giữa Can và Chi tùy theo tháng — theo
// đúng bảng cổ điển, không phải lỗi OCR).
const THIEN_DUC: { type: "can" | "chi"; idx: number }[] = [
  { type: "chi", idx: 5 }, // Tý → Tị
  { type: "can", idx: 6 }, // Sửu → Canh
  { type: "can", idx: 3 }, // Dần → Đinh
  { type: "chi", idx: 8 }, // Mão → Thân
  { type: "can", idx: 8 }, // Thìn → Nhâm
  { type: "can", idx: 7 }, // Tị → Tân
  { type: "chi", idx: 11 }, // Ngọ → Hợi
  { type: "can", idx: 0 }, // Mùi → Giáp
  { type: "can", idx: 9 }, // Thân → Quý
  { type: "chi", idx: 2 }, // Dậu → Dần
  { type: "can", idx: 2 }, // Tuất → Bính
  { type: "can", idx: 1 }, // Hợi → Ất
];
// Quốc Ấn Quý Nhân: Can Năm/Ngày → Chi.
const QUOC_AN: number[] = [10, 11, 1, 2, 1, 2, 4, 5, 7, 8];
// Dịch Mã: Chi Năm/Ngày (nhóm Tứ Sinh/Vượng/Mộ) → 1 Chi.
const DICH_MA: number[] = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5];
// Kim Dư: Can Năm/Ngày → Chi.
const KIM_DU: number[] = [4, 5, 7, 8, 7, 8, 10, 11, 1, 2];
// Thiên Y Quý Nhân: Chi Tháng → Chi (lùi 1 vị).
const THIEN_Y: number[] = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// Lộc Thần: Can Ngày → Chi (vị trí Lâm Quan của Can).
const LOC_THAN: number[] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
// Âm Chú Dương Thụ: Chi Tháng → Chi.
const AM_CHU_DUONG_THU: number[] = [2, 1, 0, 11, 10, 9, 10, 11, 0, 1, 2, 3];
// Hồng Diễm: Can Năm/Ngày → Chi.
const HONG_DIEM: number[] = [6, 8, 2, 7, 4, 4, 8, 9, 0, 10];
// Hồng Loan: Chi Năm → Chi.
const HONG_LOAN: number[] = [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4];
// Thiên Hỷ: Chi Năm → Chi.
const THIEN_HY: number[] = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
// Cô Thần: Chi Năm → Chi.
const CO_THAN: number[] = [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2];
// Quả Tú: Chi Năm → Chi.
const QUA_TU: number[] = [10, 10, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10];
// Kiếp Sát: Chi Năm/Ngày (nhóm Tứ Sinh) → 1 Chi.
const KIEP_SAT: number[] = [5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8];
// Vong Thần: Chi Năm/Ngày (nhóm Tứ Sinh/Vượng/Mộ) → 1 Chi.
const VONG_THAN: number[] = [11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5, 2];
// Huyết Nhẫn: Chi Năm → Chi.
const HUYET_NHAN: number[] = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];
// Đào Hoa (bảng gốc, chưa gồm 13 biến thể chi tiết): Chi Năm/Ngày (nhóm Tam Hợp) → 1 Chi.
const DAO_HOA: number[] = [9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0];

function addThanSatMatches(
  result: Record<PillarKey, string[]>,
  pillars: Record<PillarKey, { chiIndex: number }>,
  name: string,
  primaryTargets: number[],
  secondaryTargets?: number[],
) {
  (["year", "month", "day", "hour"] as PillarKey[]).forEach((key) => {
    const chi = pillars[key].chiIndex;
    if (primaryTargets.includes(chi)) {
      result[key].push(name);
    } else if (secondaryTargets?.includes(chi)) {
      result[key].push(`${name} (năm)`);
    }
  });
}

function addThanSatCanMatches(
  result: Record<PillarKey, string[]>,
  pillars: Record<PillarKey, { canIndex: number }>,
  name: string,
  primaryTargets: number[],
  secondaryTargets?: number[],
) {
  (["year", "month", "day", "hour"] as PillarKey[]).forEach((key) => {
    const can = pillars[key].canIndex;
    if (primaryTargets.includes(can)) {
      result[key].push(name);
    } else if (secondaryTargets?.includes(can)) {
      result[key].push(`${name} (năm)`);
    }
  });
}

// Thiên Đức Quý Nhân dùng riêng vì mục tiêu đổi loại Can/Chi tùy theo Chi Tháng.
function addThienDucMatch(
  result: Record<PillarKey, string[]>,
  pillars: Record<PillarKey, { canIndex: number; chiIndex: number }>,
  monthChiIndex: number,
) {
  const target = THIEN_DUC[monthChiIndex];
  (["year", "month", "day", "hour"] as PillarKey[]).forEach((key) => {
    const p = pillars[key];
    const hit = target.type === "can" ? p.canIndex === target.idx : p.chiIndex === target.idx;
    if (hit) result[key].push("Thiên Đức");
  });
}

// Tam Kỳ Quý Nhân: 3 Thiên Can cụ thể cùng xuất hiện trong tứ trụ (không đòi hỏi liền kề vị trí).
const TAM_KY_GROUPS: { label: string; cans: number[] }[] = [
  { label: "Tam Kỳ (Thiên Thượng)", cans: [0, 4, 6] }, // Giáp Mậu Canh
  { label: "Tam Kỳ (Địa Hạ)", cans: [1, 2, 3] }, // Ất Bính Đinh
  { label: "Tam Kỳ (Nhân Trung)", cans: [9, 7, 8] }, // Quý Tân Nhâm
];
function addTamKyMatches(result: Record<PillarKey, string[]>, pillars: Record<PillarKey, { canIndex: number }>) {
  const keys: PillarKey[] = ["year", "month", "day", "hour"];
  const canSet = new Set(keys.map((k) => pillars[k].canIndex));
  TAM_KY_GROUPS.forEach((group) => {
    if (group.cans.every((c) => canSet.has(c))) {
      keys.forEach((k) => {
        if (group.cans.includes(pillars[k].canIndex)) result[k].push(group.label);
      });
    }
  });
}

// Khôi Cương / Thập Ác Đại Bại / Âm Dương Sai Thố: cách cục cố định, chỉ xét riêng Trụ Ngày.
const KHOI_CUONG_DAY: [number, number][] = [
  [6, 4], [8, 4], [6, 10], [4, 10], // Canh Thìn, Nhâm Thìn, Canh Tuất, Mậu Tuất
];
const THAP_AC_DAI_BAI_DAY: [number, number][] = [
  [0, 4], [1, 5], [2, 8], [3, 11], [4, 10], [5, 1], [6, 4], [7, 5], [8, 8], [9, 11],
]; // Giáp Thìn, Ất Tị, Bính Thân, Đinh Hợi, Mậu Tuất, Kỷ Sửu, Canh Thìn, Tân Tị, Nhâm Thân, Quý Hợi
const AM_DUONG_SAI_THO_DAY: [number, number][] = [
  [2, 0], [3, 1], [4, 2], [7, 3], [8, 4], [9, 5], [2, 6], [3, 7], [4, 8], [7, 9], [8, 10], [9, 11],
]; // Bính Tý, Đinh Sửu, Mậu Dần, Tân Mão, Nhâm Thìn, Quý Tị, Bính Ngọ, Đinh Mùi, Mậu Thân, Tân Dậu, Nhâm Tuất, Quý Hợi

function addDayPillarPatternMatch(
  result: Record<PillarKey, string[]>,
  dayCanIndex: number,
  dayChiIndex: number,
  name: string,
  combos: [number, number][],
) {
  if (combos.some(([c, h]) => c === dayCanIndex && h === dayChiIndex)) {
    result.day.push(name);
  }
}

// Thiên Xá Quý Nhân: mùa sinh (theo Chi Tháng) → 1 tổ hợp Can Chi Ngày cụ thể phải khớp đúng
// ("chỉ đứng ở trụ ngày mà thôi" theo tài liệu gốc).
function addThienXaMatch(
  result: Record<PillarKey, string[]>,
  monthChiIndex: number,
  dayCanIndex: number,
  dayChiIndex: number,
) {
  let target: [number, number];
  if ([2, 3, 4].includes(monthChiIndex)) target = [4, 2]; // Xuân (Dần Mão Thìn) → Mậu Dần
  else if ([5, 6, 7].includes(monthChiIndex)) target = [0, 6]; // Hạ (Tị Ngọ Mùi) → Giáp Ngọ
  else if ([8, 9, 10].includes(monthChiIndex)) target = [4, 8]; // Thu (Thân Dậu Tuất) → Mậu Thân
  else target = [0, 0]; // Đông (Hợi Tý Sửu) → Giáp Tý
  if (target[0] === dayCanIndex && target[1] === dayChiIndex) result.day.push("Thiên Xá");
}

// Thiên La / Địa Võng: xét sự CÓ MẶT đồng thời của 1 cặp Chi cụ thể trong tứ trụ (không phải lookup
// theo 1 nguồn duy nhất — "Tuất gặp Hợi là Thiên La", "Thìn gặp Tị là Địa Võng").
function addThienLaDiaVongMatches(result: Record<PillarKey, string[]>, pillars: Record<PillarKey, { chiIndex: number }>) {
  const keys: PillarKey[] = ["year", "month", "day", "hour"];
  const chiSet = new Set(keys.map((k) => pillars[k].chiIndex));
  if (chiSet.has(10) && chiSet.has(11)) {
    keys.forEach((k) => { if (pillars[k].chiIndex === 10) result[k].push("Thiên La"); });
  }
  if (chiSet.has(4) && chiSet.has(5)) {
    keys.forEach((k) => { if (pillars[k].chiIndex === 4) result[k].push("Địa Võng"); });
  }
}

// Không Vong (Tuần Không): 2 Chi "dư" của tuần Giáp Tý chứa Can Chi này — công thức giữ nguyên như cũ,
// chỉ tách phần tính chỉ số Chi ra riêng (`khongVongIndicesOf`) để nơi khác (vd Lục Hào, xét từng hào
// có rơi vào Tuần Không hay không) dùng lại được 2 chỉ số thô thay vì phải tự parse ngược chuỗi hiển thị.
function khongVongIndicesOf(canIndex: number, chiIndex: number): [number, number] {
  const cycle = cycleIndexOf(canIndex, chiIndex);
  const tuanStartCycle = Math.floor(cycle / 10) * 10;
  const tuanStartChi = tuanStartCycle % 12;
  const a = (tuanStartChi + 10) % 12;
  const b = (tuanStartChi + 11) % 12;
  return [a, b];
}

function khongVongOf(canIndex: number, chiIndex: number): string {
  const [a, b] = khongVongIndicesOf(canIndex, chiIndex);
  return `${CHI[a]} - ${CHI[b]}`;
}

// Cộng (năm, tháng, ngày) dương lịch theo quy tắc lịch thực (không phải cộng số ngày trung bình).
function addCalendarOffset(base: { d: number; m: number; y: number }, years: number, months: number, days: number) {
  const totalMonthIndex = base.m - 1 + months;
  const y = base.y + years + Math.floor(totalMonthIndex / 12);
  const m = ((totalMonthIndex % 12) + 12) % 12;
  const utc = Date.UTC(y, m, base.d + days);
  const dt = new Date(utc);
  return { d: dt.getUTCDate(), m: dt.getUTCMonth() + 1, y: dt.getUTCFullYear() };
}

export interface BatTuInput {
  day: number;
  month: number; // 1-12, dương lịch
  year: number;
  hour: number; // 0-23, giờ địa phương Việt Nam
  minute?: number; // 0-59, dùng để tăng độ chính xác cho mốc khởi Đại Vận (không đổi Can Chi trụ Giờ)
  gender: Gender;
}

// Rút gọn tên Thập Thần để hiển thị trong bảng lá số (giống quy ước phần mềm chuyên dụng).
export const THAP_THAN_ABBR: Record<string, string> = {
  "Tỷ Kiên": "Tỷ",
  "Kiếp Tài": "Kiếp",
  "Thực Thần": "Thực",
  "Thương Quan": "Thương",
  "Thiên Tài": "T.Tài",
  "Chính Tài": "Tài",
  "Thất Sát": "Sát",
  "Chính Quan": "Quan",
  "Thiên Ấn": "Kiêu",
  "Chính Ấn": "Ấn",
  "Nhật Chủ": "Nhật Chủ",
};

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
  const { day, month, year, hour, gender } = input;
  const minute = input.minute ?? 0;
  const hourFrac = hour + minute / 60;

  // Trụ ngày (chu kỳ 60 ngày liên tục qua Julian Day Number) — sinh từ 23h thuộc ngày hôm sau.
  let jdDay = jdFromDate(day, month, year);
  if (hour >= 23) jdDay += 1;
  const dayCanIndex = (jdDay + 9) % 10;
  const dayChiIndex = (jdDay + 1) % 12;
  const nhatChuIndex = dayCanIndex;

  // Trụ năm: ranh giới là Lập Xuân, không phải 1/1 dương lịch.
  const monthChiIndexNow = getMonthChiIndex(day, month, year, hourFrac);
  const jdNow = jdFromDate(day, month, year) + (hourFrac - 12) / 24 - 7 / 24;
  const jdLapXuanNam = findLapXuanJD(year);
  const batTuYear = jdNow < jdLapXuanNam ? year - 1 : year;

  const yearCycleIndex = ((batTuYear - 4) % 60 + 60) % 60;
  const yearCanIndex = yearCycleIndex % 10;
  const yearChiIndex = yearCycleIndex % 12;

  // Chiều thuận/nghịch dùng chung cho Đại Vận và các thần sát phụ thuộc giới tính (Nguyên Thần, Câu
  // Giảo Sát): Dương Nam/Âm Nữ đi thuận, Âm Nam/Dương Nữ đi nghịch.
  const yearIsDuong = CAN_AM_DUONG[yearCanIndex] === "Dương";
  const forward = (yearIsDuong && gender === "Nam") || (!yearIsDuong && gender === "Nữ");

  // Trụ tháng
  const monthChiIndex = monthChiIndexNow;
  const danCan = thangDanCanIndex(yearCanIndex);
  const monthOffsetFromDan = (monthChiIndex - 2 + 12) % 12;
  const monthCanIndex = (danCan + monthOffsetFromDan) % 10;

  // Trụ giờ
  const hourChiIndex = Math.floor(((hour + 1) % 24) / 2);
  const tyCan = gioTyCanIndex(dayCanIndex);
  const hourCanIndex = (tyCan + hourChiIndex) % 10;

  const yearPillar = buildPillar(yearCanIndex, yearChiIndex, nhatChuIndex, false);
  const monthPillar = buildPillar(monthCanIndex, monthChiIndex, nhatChuIndex, false);
  const dayPillar = buildPillar(dayCanIndex, dayChiIndex, nhatChuIndex, true);
  const hourPillar = buildPillar(hourCanIndex, hourChiIndex, nhatChuIndex, false);

  // --- Mệnh Cung ---
  // Chi: 14 - (số thứ tự Chi tháng, Dần=1) - (số thứ tự Chi giờ, Dần=1), quy về khoảng 1-12.
  const thangChiNum = ((monthChiIndex - 2 + 12) % 12) + 1;
  const gioChiNum = ((hourChiIndex - 2 + 12) % 12) + 1;
  let menhCungChiNum = 14 - thangChiNum - gioChiNum;
  while (menhCungChiNum <= 0) menhCungChiNum += 12;
  while (menhCungChiNum > 12) menhCungChiNum -= 12;
  const menhCungChiIndex = (menhCungChiNum + 1) % 12; // Dần=1 → chiIndex 2
  const menhCungOffsetFromDan = menhCungChiNum - 1;
  const menhCungCanIndex = (thangDanCanIndex(yearCanIndex) + menhCungOffsetFromDan) % 10;

  // --- Thai Nguyên ---
  const thaiNguyenCanIndex = (monthCanIndex + 1) % 10;
  const thaiNguyenChiIndex = (monthChiIndex + 3) % 12;

  // --- Niên Không / Nhật Không ---
  const nienKhong = khongVongOf(yearCanIndex, yearChiIndex);
  const nhatKhong = khongVongOf(dayCanIndex, dayChiIndex);

  // --- Thần Sát Nguyên Cục ---
  const pillarsMap: Record<PillarKey, PillarInfo> = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
  const thanSat: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };

  // Cát thần
  addThanSatMatches(thanSat, pillarsMap, "Thiên Ất", THIEN_AT[dayCanIndex], THIEN_AT[yearCanIndex]);
  addThanSatMatches(thanSat, pillarsMap, "Thái Cực", THAI_CUC[dayCanIndex], THAI_CUC[yearCanIndex]);
  addThanSatMatches(thanSat, pillarsMap, "Hoa Cái", [HOA_CAI[dayChiIndex]], [HOA_CAI[yearChiIndex]]);
  addThienDucMatch(thanSat, pillarsMap, monthChiIndex);
  addThanSatCanMatches(thanSat, pillarsMap, "Nguyệt Đức", [NGUYET_DUC[monthChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Văn Xương", [VAN_XUONG[dayCanIndex]]);
  addTamKyMatches(thanSat, pillarsMap);
  addThanSatMatches(thanSat, pillarsMap, "Tướng Tinh", [TUONG_TINH[dayChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Quốc Ấn", [QUOC_AN[dayCanIndex]], [QUOC_AN[yearCanIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Dịch Mã", [DICH_MA[dayChiIndex]], [DICH_MA[yearChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Kim Dư", [KIM_DU[dayCanIndex]], [KIM_DU[yearCanIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Thiên Y", [THIEN_Y[monthChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Lộc Thần", [LOC_THAN[dayCanIndex]]);
  addThienXaMatch(thanSat, monthChiIndex, dayCanIndex, dayChiIndex);
  addThanSatMatches(thanSat, pillarsMap, "Âm Chú Dương Thụ", [AM_CHU_DUONG_THU[monthChiIndex]]);
  addDayPillarPatternMatch(thanSat, dayCanIndex, dayChiIndex, "Khôi Cương", KHOI_CUONG_DAY);
  addThanSatMatches(thanSat, pillarsMap, "Hồng Diễm", [HONG_DIEM[dayCanIndex]], [HONG_DIEM[yearCanIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Hồng Loan", [HONG_LOAN[yearChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Thiên Hỷ", [THIEN_HY[yearChiIndex]]);

  // Hung thần
  addThanSatMatches(thanSat, pillarsMap, "Tai Sát", [TAI_SAT[dayChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Kình Dương", [KINH_DUONG[dayCanIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Kiếp Sát", [KIEP_SAT[dayChiIndex]], [KIEP_SAT[yearChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Vong Thần", [VONG_THAN[dayChiIndex]], [VONG_THAN[yearChiIndex]]);
  addThienLaDiaVongMatches(thanSat, pillarsMap);
  addDayPillarPatternMatch(thanSat, dayCanIndex, dayChiIndex, "Thập Ác Đại Bại", THAP_AC_DAI_BAI_DAY);
  addThanSatMatches(thanSat, pillarsMap, "Cô Thần", [CO_THAN[yearChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Quả Tú", [QUA_TU[yearChiIndex]]);
  addDayPillarPatternMatch(thanSat, dayCanIndex, dayChiIndex, "Âm Dương Sai Thố", AM_DUONG_SAI_THO_DAY);
  addThanSatMatches(thanSat, pillarsMap, "Tang Môn", [(yearChiIndex + 2) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Điếu Khách", [(yearChiIndex + 10) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Nguyên Thần", [forward ? (yearChiIndex + 7) % 12 : (yearChiIndex + 5) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Câu Sát", [forward ? (yearChiIndex + 3) % 12 : (yearChiIndex + 9) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Giảo Sát", [forward ? (yearChiIndex + 9) % 12 : (yearChiIndex + 3) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Huyết Nhẫn", [HUYET_NHAN[yearChiIndex]]);
  addThanSatMatches(thanSat, pillarsMap, "Quan Phù", [(yearChiIndex + 4) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Cách Góc", [(dayChiIndex + 2) % 12]);
  addThanSatMatches(thanSat, pillarsMap, "Đào Hoa", [DAO_HOA[dayChiIndex]], [DAO_HOA[yearChiIndex]]);

  // --- Đại Vận ---
  const crossings = getTietKhiAround(year);
  const nearestTietJD = forward
    ? crossings.find((c) => c.jd > jdNow)?.jd
    : [...crossings].reverse().find((c) => c.jd <= jdNow)?.jd;
  if (nearestTietJD === undefined) throw new Error("Không tìm được Tiết Khí gần nhất để tính Đại Vận");

  const daysDiff = Math.abs(nearestTietJD - jdNow);
  const totalMonths = daysDiff * 4; // quy tắc "3 ngày = 1 năm, 1 ngày = 4 tháng"
  const startYears = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;
  const startMonthsPart = Math.floor(remMonths);
  const startDaysPart = Math.round((remMonths - startMonthsPart) * 30);
  const startDate = addCalendarOffset({ d: day, m: month, y: year }, startYears, startMonthsPart, startDaysPart);
  const startAgeMu = startDate.y - year + 1; // tuổi mụ = năm dương lịch - năm sinh + 1

  const monthCycle = cycleIndexOf(monthCanIndex, monthChiIndex);
  const daiVan: DaiVanPeriod[] = [];
  for (let i = 0; i < 10; i++) {
    const step = forward ? i + 1 : -(i + 1);
    const cycle = ((monthCycle + step) % 60 + 60) % 60;
    const canIndex = cycle % 10;
    const chiIndex = cycle % 12;
    const periodStart = addCalendarOffset({ d: startDate.d, m: startDate.m, y: startDate.y }, i * 10, 0, 0);
    daiVan.push({
      canIndex,
      chiIndex,
      can: CAN[canIndex],
      chi: CHI[chiIndex],
      startAge: startAgeMu + i * 10,
      endAge: startAgeMu + i * 10 + 9,
      startDate: periodStart,
    });
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    nhatChu: {
      canIndex: nhatChuIndex,
      can: CAN[nhatChuIndex],
      nguHanh: CAN_NGU_HANH[nhatChuIndex],
      amDuong: CAN_AM_DUONG[nhatChuIndex],
    },
    gender,
    daiVanForward: forward,
    daiVan,
    menhCung: {
      canIndex: menhCungCanIndex,
      chiIndex: menhCungChiIndex,
      can: CAN[menhCungCanIndex],
      chi: CHI[menhCungChiIndex],
    },
    thaiNguyen: {
      canIndex: thaiNguyenCanIndex,
      chiIndex: thaiNguyenChiIndex,
      can: CAN[thaiNguyenCanIndex],
      chi: CHI[thaiNguyenChiIndex],
    },
    nienKhong,
    nhatKhong,
    thanSat,
  };
}

// Tính Lưu Niên (10 năm) bắt đầu từ 1 năm dương lịch cho trước — dùng cho 1 cột Đại Vận đang chọn.
export function tinhLuuNien(startYear: number, birthYear: number, count = 10): LuuNienYear[] {
  const result: LuuNienYear[] = [];
  for (let i = 0; i < count; i++) {
    const yr = startYear + i;
    const cycle = ((yr - 4) % 60 + 60) % 60;
    const canIndex = cycle % 10;
    const chiIndex = cycle % 12;
    result.push({ year: yr, tuoi: yr - birthYear + 1, canIndex, chiIndex, can: CAN[canIndex], chi: CHI[chiIndex] });
  }
  return result;
}

/**
 * Năm BÁT TỰ của một thời điểm — ranh giới là LẬP XUÂN (~4/2), KHÔNG phải 1/1 dương lịch.
 *
 * ⚠️ DÙNG HÀM NÀY, ĐỪNG DÙNG `new Date().getFullYear()` khi cần lưu niên/thái tuế hiện hành.
 * `tinhLuuNien()` cố ý nhận số năm dương lịch thuần (để liệt kê các năm tới theo nhãn dương lịch),
 * nên nếu truyền thẳng getFullYear() vào thì suốt quãng 1/1 → Lập Xuân sẽ lệch nguyên 1 năm — sai
 * âm thầm, không văng lỗi. (Lỗi này đã từng xảy ra thật ở Quân Sư `current-luck.ts`, 8/2026.)
 */
export function namBatTuCuaNgay(day: number, month: number, year: number, hour = 12): number {
  const jdNow = jdFromDate(day, month, year) + (hour - 12) / 24 - 7 / 24;
  return jdNow < findLapXuanJD(year) ? year - 1 : year;
}

/** Năm Bát Tự của "bây giờ", theo giờ Việt Nam. */
export function namBatTuHienTai(now: Date = new Date()): number {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric", month: "numeric", day: "numeric", hour: "numeric", hour12: false,
  }).formatToParts(now);
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return namBatTuCuaNgay(g("day"), g("month"), g("year"), g("hour") % 24);
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

export { CAN_NGU_HANH, CAN_AM_DUONG, CHI_NGU_HANH, CHI_AM_DUONG, khongVongOf, khongVongIndicesOf };
