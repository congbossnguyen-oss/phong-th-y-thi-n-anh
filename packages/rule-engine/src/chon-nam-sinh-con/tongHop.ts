/**
 * CHỌN NĂM SINH CON — so sánh Cha→Con và Mẹ→Con theo cùng 5 tiêu chí đã có ở Chọn Tuổi Kết Hôn
 * (Mệnh/Thiên Can/Địa Chi/Cung Mệnh/Niên Mệnh), trọng số riêng theo đặc tả module này. Cung
 * Mệnh của con BẮT BUỘC tính theo giới tính của con (khác cha/mẹ có thể khác giới).
 *
 * Tái dùng trực tiếp `getKetHonNguoi`/`calculateCungMenhCompatibility`/
 * `calculateNienMenhCompatibility` (Chọn Tuổi Kết Hôn) và `calculateCanCompatibility/
 * calculateChiCompatibility/calculateMenhCompatibility` (Tuổi Hợp Làm Ăn) — quan hệ Ngũ Hành/
 * Can/Chi/Cung Mệnh nền tảng không đổi giữa các module, chỉ trọng số tổng hợp khác nhau.
 */
import {
  calculateCanCompatibility,
  calculateChiCompatibility,
  calculateMenhCompatibility,
  type TuoiHopLamAnTieuChi,
} from "../scoring/tuoiHopLamAn.js";
import { getKetHonNguoi, calculateCungMenhCompatibility, calculateNienMenhCompatibility, type KetHonNguoi } from "../chon-tuoi-ket-hon/tongHop.js";
import type { GioiTinh } from "../cung-menh-bat-trach/cungPhi.js";

export const CHON_NAM_SINH_CON_SCORING_RULES = {
  trongSo: {
    menh: 0.25,
    thienCan: 0.2,
    diaChi: 0.2,
    cungMenh: 0.2,
    nienMenh: 0.15,
  },
} as const;

export type ChonNamSinhConHang = "dai-cat" | "rat-tot" | "tot" | "kha" | "khong-thuan" | "khong-nen";

const NHAN_THEO_HANG: Record<ChonNamSinhConHang, string> = {
  "dai-cat": "⭐ Đại cát",
  "rat-tot": "⭐ Rất tốt",
  tot: "🟢 Tốt",
  kha: "🟡 Khá / Có thể cân nhắc",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen": "🔴 Không nên ưu tiên",
};

export function getChildYearRating(diem: number): ChonNamSinhConHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 8) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 5) return "kha";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen";
}

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

export interface ParentChildScore {
  diem: number;
  menh: TuoiHopLamAnTieuChi;
  thienCan: TuoiHopLamAnTieuChi;
  diaChi: TuoiHopLamAnTieuChi;
  cungMenh: TuoiHopLamAnTieuChi;
  nienMenh: TuoiHopLamAnTieuChi;
}

function calculateParentChildScore(phuHuynh: KetHonNguoi, con: KetHonNguoi): ParentChildScore {
  const R = CHON_NAM_SINH_CON_SCORING_RULES.trongSo;
  const menh = calculateMenhCompatibility(phuHuynh, con);
  const thienCan = calculateCanCompatibility(phuHuynh, con);
  const diaChi = calculateChiCompatibility(phuHuynh, con);
  const cungMenh = calculateCungMenhCompatibility(phuHuynh, con);
  const nienMenh = calculateNienMenhCompatibility(phuHuynh, con);

  let diem = menh.diem * R.menh + thienCan.diem * R.thienCan + diaChi.diem * R.diaChi + cungMenh.diem * R.cungMenh + nienMenh.diem * R.nienMenh;
  diem = Math.round(clamp10(diem) * 10) / 10;

  return { diem, menh, thienCan, diaChi, cungMenh, nienMenh };
}

export const calculateFatherChildScore = calculateParentChildScore;
export const calculateMotherChildScore = calculateParentChildScore;

export interface ChildYearResult {
  namSinhCon: number;
  gioiTinhCon: GioiTinh;
  cha: ParentChildScore;
  me: ParentChildScore;
  diem: number;
  hang: ChonNamSinhConHang;
  nhan: string;
}

export function calculateChildYearScore(cha: KetHonNguoi, me: KetHonNguoi, namSinhCon: number, gioiTinhCon: GioiTinh): ChildYearResult {
  const con = getKetHonNguoi(namSinhCon, gioiTinhCon);
  const chaScore = calculateFatherChildScore(cha, con);
  const meScore = calculateMotherChildScore(me, con);

  const diem = Math.round(clamp10(chaScore.diem * 0.5 + meScore.diem * 0.5) * 10) / 10;
  const hang = getChildYearRating(diem);

  return { namSinhCon, gioiTinhCon, cha: chaScore, me: meScore, diem, hang, nhan: NHAN_THEO_HANG[hang] };
}

export function rankChildBirthYears(
  chaNamSinh: number,
  meNamSinh: number,
  gioiTinhCon: GioiTinh,
  tuNam: number,
  denNam: number,
): ChildYearResult[] {
  const cha = getKetHonNguoi(chaNamSinh, "nam");
  const me = getKetHonNguoi(meNamSinh, "nu");
  const results: ChildYearResult[] = [];
  for (let nam = tuNam; nam <= denNam; nam++) {
    results.push(calculateChildYearScore(cha, me, nam, gioiTinhCon));
  }
  return results.slice().sort((a, b) => b.diem - a.diem || a.namSinhCon - b.namSinhCon);
}
