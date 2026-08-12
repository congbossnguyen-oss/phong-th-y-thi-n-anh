/**
 * CHỌN TUỔI KẾT HÔN — so sánh 2 người theo 5 tiêu chí: Mệnh, Thiên Can, Địa Chi, Cung Mệnh
 * (Bát Trạch), Niên Mệnh Năm Sinh.
 *
 * ⚠️ Phân biệt "Mệnh" và "Niên Mệnh Năm Sinh": đặc tả gốc cảnh báo không được nhầm 2 khái niệm
 * này nếu hệ thống định nghĩa khác nhau. Hệ thống hiện có đúng 2 bảng Ngũ Hành độc lập theo năm
 * sinh: (a) Ngũ Hành NẠP ÂM (chu kỳ 60 năm, "Mệnh" — dùng ở mọi module khác, vd Tuổi Hợp Làm Ăn)
 * và (b) Ngũ Hành ĐỊA CHI thuần túy (12 giá trị, `Data.CHI_NGU_HANH`). Module này dùng (a) cho
 * tiêu chí "Mệnh" và (b) cho tiêu chí "Niên Mệnh Năm Sinh" — 2 hệ quy chiếu có thật, khác nhau,
 * đã có sẵn trong hệ thống, không tự bịa thêm khái niệm thứ 3.
 *
 * Can/Chi/Mệnh tái dùng đúng `Scoring.calculateCanCompatibility/calculateChiCompatibility/
 * calculateMenhCompatibility` (Tuổi Hợp Làm Ăn) — quan hệ Ngũ Hành/Can/Chi nền tảng không đổi
 * giữa các module, chỉ trọng số tổng hợp là khác nhau (xem `KET_HON_SCORING_RULES`).
 */
import { Data } from "@thien-anh/calendar-core";
import {
  getNguoiTuoi,
  calculateCanCompatibility,
  calculateChiCompatibility,
  calculateMenhCompatibility,
  type NguoiTuoi,
  type TuoiHopLamAnTieuChi,
} from "../scoring/tuoiHopLamAn.js";
import { getNguHanhQuanHe } from "../trach-nhat/nguHanhQuanHe.js";
import { calculateCungPhi, type CungBatTrach, type GioiTinh } from "../cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO } from "../cung-menh-bat-trach/duNienBatQuai.js";

type NguHanh = Data.NguHanh;

export const KET_HON_SCORING_RULES = {
  trongSo: {
    menh: 0.2,
    thienCan: 0.15,
    diaChi: 0.2,
    cungMenh: 0.3,
    nienMenh: 0.15,
  },
  cungMenhDiem: {
    "sinh-khi": 10,
    "thien-y": 9,
    "dien-nien": 9,
    "phuc-vi": 8,
    "hoa-hai": 4,
    "luc-sat": 3,
    "ngu-quy": 2,
    "tuyet-menh": 0,
  } as Record<ReturnType<typeof getKhiBatTrach>, number>,
  nienMenhDiem: {
    tuongSinh: 10,
    binhHoa: 8,
    tuongKhac: 2,
  },
} as const;

export type KetHonHang = "rat-hop" | "hop-rat-tot" | "kha-hop" | "trung-binh" | "khong-thuan" | "rat-ky";

const NHAN_THEO_HANG: Record<KetHonHang, string> = {
  "rat-hop": "⭐ Rất hợp",
  "hop-rat-tot": "⭐ Hợp rất tốt",
  "kha-hop": "🟢 Khá hợp",
  "trung-binh": "🟡 Trung bình",
  "khong-thuan": "🟠 Không thuận",
  "rat-ky": "🔴 Rất kỵ",
};

export function getKetHonRating(diem: number): KetHonHang {
  if (diem >= 9) return "rat-hop";
  if (diem >= 8) return "hop-rat-tot";
  if (diem >= 7) return "kha-hop";
  if (diem >= 5) return "trung-binh";
  if (diem >= 3) return "khong-thuan";
  return "rat-ky";
}

export interface KetHonNguoi extends NguoiTuoi {
  gioiTinh: GioiTinh;
  cungPhi: CungBatTrach;
  nienMenh: NguHanh;
}

export function getKetHonNguoi(namSinh: number, gioiTinh: GioiTinh): KetHonNguoi {
  const nguoiTuoi = getNguoiTuoi(namSinh);
  return {
    ...nguoiTuoi,
    gioiTinh,
    cungPhi: calculateCungPhi(namSinh, gioiTinh),
    nienMenh: Data.CHI_NGU_HANH[Data.CHI.indexOf(nguoiTuoi.chi)]!,
  };
}

export function calculateCungMenhCompatibility(nguoi1: KetHonNguoi, nguoi2: KetHonNguoi): TuoiHopLamAnTieuChi {
  const khi = getKhiBatTrach(nguoi1.cungPhi, nguoi2.cungPhi);
  const diem = KET_HON_SCORING_RULES.cungMenhDiem[khi];
  const info = KHI_BAT_TRACH_INFO[khi];
  return { diem, moTa: `${nguoi1.cungPhi} - ${nguoi2.cungPhi} → ${info.ten}` };
}

export function calculateNienMenhCompatibility(nguoi1: KetHonNguoi, nguoi2: KetHonNguoi): TuoiHopLamAnTieuChi {
  const R = KET_HON_SCORING_RULES.nienMenhDiem;
  const quanHe = getNguHanhQuanHe(nguoi1.nienMenh, nguoi2.nienMenh);
  switch (quanHe) {
    case "tuong-hoa":
      return { diem: R.binhHoa, moTa: `Bình hòa (cùng ${nguoi1.nienMenh})` };
    case "a-sinh-b":
      return { diem: R.tuongSinh, moTa: `${nguoi1.nienMenh} sinh ${nguoi2.nienMenh}` };
    case "b-sinh-a":
      return { diem: R.tuongSinh, moTa: `${nguoi2.nienMenh} sinh ${nguoi1.nienMenh}` };
    case "a-khac-b":
      return { diem: R.tuongKhac, moTa: `${nguoi1.nienMenh} khắc ${nguoi2.nienMenh}` };
    case "b-khac-a":
      return { diem: R.tuongKhac, moTa: `${nguoi2.nienMenh} khắc ${nguoi1.nienMenh}` };
  }
}

export interface KetHonResult {
  diem: number;
  hang: KetHonHang;
  nhan: string;
  menh: TuoiHopLamAnTieuChi;
  thienCan: TuoiHopLamAnTieuChi;
  diaChi: TuoiHopLamAnTieuChi;
  cungMenh: TuoiHopLamAnTieuChi;
  nienMenh: TuoiHopLamAnTieuChi;
}

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

export function calculateKetHonScore(nguoi1: KetHonNguoi, nguoi2: KetHonNguoi): KetHonResult {
  const R = KET_HON_SCORING_RULES.trongSo;
  const menh = calculateMenhCompatibility(nguoi1, nguoi2);
  const thienCan = calculateCanCompatibility(nguoi1, nguoi2);
  const diaChi = calculateChiCompatibility(nguoi1, nguoi2);
  const cungMenh = calculateCungMenhCompatibility(nguoi1, nguoi2);
  const nienMenh = calculateNienMenhCompatibility(nguoi1, nguoi2);

  let diem = menh.diem * R.menh + thienCan.diem * R.thienCan + diaChi.diem * R.diaChi + cungMenh.diem * R.cungMenh + nienMenh.diem * R.nienMenh;
  diem = clamp10(diem);
  diem = Math.round(diem * 10) / 10;

  const hang = getKetHonRating(diem);
  return { diem, hang, nhan: NHAN_THEO_HANG[hang], menh, thienCan, diaChi, cungMenh, nienMenh };
}

export interface MarriageMatchCandidate {
  namSinh: number;
  ketQua: KetHonResult;
}

/** Tìm các năm sinh của `gioiTinhTimKiem` hợp nhất với 1 người cố định, trong 1 khoảng năm. */
export function findBestMarriageMatches(
  nguoiCoDinh: KetHonNguoi,
  gioiTinhTimKiem: GioiTinh,
  tuNam: number,
  denNam: number,
): MarriageMatchCandidate[] {
  const ketQua: MarriageMatchCandidate[] = [];
  for (let namSinh = tuNam; namSinh <= denNam; namSinh++) {
    const ungVien = getKetHonNguoi(namSinh, gioiTinhTimKiem);
    const isNguoi1Fixed = nguoiCoDinh.gioiTinh === "nam";
    const [a, b] = isNguoi1Fixed ? [nguoiCoDinh, ungVien] : [ungVien, nguoiCoDinh];
    ketQua.push({ namSinh, ketQua: calculateKetHonScore(a, b) });
  }
  return ketQua.slice().sort((x, y) => y.ketQua.diem - x.ketQua.diem || x.namSinh - y.namSinh);
}
