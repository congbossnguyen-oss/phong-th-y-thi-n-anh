/**
 * XEM TUỔI XÔNG ĐẤT / XÔNG NHÀ — chọn tuổi người xông phù hợp nhất với gia chủ trong 1 năm cụ
 * thể. Pipeline đúng thứ tự đặc tả: loại trừ (Xung/Hình/Hại/Phá gia chủ, Tam Tai, Thái Tuế của
 * năm xông) → ưu tiên Địa Chi người xông với NĂM xông (Tam Hợp/Lục Hợp) → Thiên Can người xông
 * với GIA CHỦ → cộng Lộc/Quý Nhân/Dịch Mã của gia chủ → xếp hạng.
 *
 * Xông đất và xông nhà dùng chung 1 bộ quy tắc (chỉ khác nhãn hiển thị ở tầng UI).
 */
import { Data } from "@thien-anh/calendar-core";
import { getCan, getChi } from "../scoring/tuoiHopLamAn.js";
import { isCanHop } from "../trach-nhat/canHop.js";
import { isTamHop } from "../trach-nhat/tamHop.js";
import { isLucHop } from "../trach-nhat/lucHop.js";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import { getHinhThaiTueChi, getHaiThaiTueChi, getPhaThaiTueChi, TU_HINH, getPhamThaiTueTheoNam } from "../trach-nhat/thaiTue.js";
import { getNhomTuoiPhamTamTai } from "../trach-nhat/tamTai.js";
import { getNguHanhQuanHe } from "../trach-nhat/nguHanhQuanHe.js";
import { getLocTon, getQuyNhan, getDichMa } from "./locQuyNhanDichMa.js";

type Can = Data.Can;
type Chi = Data.Chi;

export interface XongDatNguoi {
  namSinh: number;
  can: Can;
  chi: Chi;
}

export function getXongDatNguoi(namSinh: number): XongDatNguoi {
  return { namSinh, can: getCan(namSinh), chi: getChi(namSinh) };
}

export const XONG_DAT_SCORING_RULES = {
  diaChiNam: { tamHop: 30, lucHop: 28, binhHoa: 15 },
  thienCanGiaChu: { tuongHop: 20, tuongSinh: 18, binh: 10, khac: 0 },
  loc: 10,
  quyNhan: 8,
  dichMa: 6,
} as const;

const DIEM_TOI_DA =
  XONG_DAT_SCORING_RULES.diaChiNam.tamHop +
  XONG_DAT_SCORING_RULES.thienCanGiaChu.tuongHop +
  XONG_DAT_SCORING_RULES.loc +
  XONG_DAT_SCORING_RULES.quyNhan +
  XONG_DAT_SCORING_RULES.dichMa;

function isXungHinhHaiPhaGiaChu(chiUngVien: Chi, chiGiaChu: Chi): string[] {
  const loai: string[] = [];
  if (getLucXungChi(chiGiaChu) === chiUngVien) loai.push("Xung");
  if (chiUngVien === chiGiaChu && (TU_HINH as readonly Chi[]).includes(chiUngVien)) {
    loai.push("Tự hình");
  } else if (getHinhThaiTueChi(chiGiaChu).includes(chiUngVien)) {
    loai.push("Hình");
  }
  if (getHaiThaiTueChi(chiGiaChu) === chiUngVien) loai.push("Hại");
  if (getPhaThaiTueChi(chiGiaChu) === chiUngVien) loai.push("Phá");
  return loai;
}

function isPhamTamTai(chiUngVien: Chi, chiNamXong: Chi): boolean {
  return getNhomTuoiPhamTamTai(chiNamXong).some((nhom) => (nhom as readonly Chi[]).includes(chiUngVien));
}

function getLyDoPhamThaiTue(chiUngVien: Chi, chiNamXong: Chi): string[] {
  const r = getPhamThaiTueTheoNam(chiNamXong);
  const loai: string[] = [];
  if (chiUngVien === r.tuoiPhamThaiTue) loai.push("Trực Thái Tuế");
  if (chiUngVien === r.tuoiXungThaiTue) loai.push("Xung Thái Tuế");
  if (r.tuoiHinhThaiTue.includes(chiUngVien)) loai.push("Hình Thái Tuế");
  if (chiUngVien === r.tuoiHaiThaiTue) loai.push("Hại Thái Tuế");
  if (chiUngVien === r.tuoiPhaThaiTue) loai.push("Phá Thái Tuế");
  return loai;
}

export interface XongDatExclusion {
  loaiTru: boolean;
  lyDo: string[];
}

export function isXongDatExcluded(ungVien: XongDatNguoi, giaChu: XongDatNguoi, chiNamXong: Chi): XongDatExclusion {
  const lyDo: string[] = [];
  const xungHinhHaiPha = isXungHinhHaiPhaGiaChu(ungVien.chi, giaChu.chi);
  lyDo.push(...xungHinhHaiPha.map((l) => `${l} gia chủ`));
  if (isPhamTamTai(ungVien.chi, chiNamXong)) lyDo.push("Phạm Tam Tai");
  lyDo.push(...getLyDoPhamThaiTue(ungVien.chi, chiNamXong).map((l) => `Phạm ${l}`));
  return { loaiTru: lyDo.length > 0, lyDo };
}

function diemThienCanGiaChu(canUngVien: Can, canGiaChu: Can): { diem: number; moTa: string } {
  const R = XONG_DAT_SCORING_RULES.thienCanGiaChu;
  if (isCanHop(canUngVien, canGiaChu)) return { diem: R.tuongHop, moTa: "Tương Hợp" };
  const nguHanhUngVien = Data.CAN_NGU_HANH[Data.CAN.indexOf(canUngVien)]!;
  const nguHanhGiaChu = Data.CAN_NGU_HANH[Data.CAN.indexOf(canGiaChu)]!;
  const quanHe = getNguHanhQuanHe(nguHanhUngVien, nguHanhGiaChu);
  switch (quanHe) {
    case "a-sinh-b":
    case "b-sinh-a":
      return { diem: R.tuongSinh, moTa: "Tương Sinh" };
    case "tuong-hoa":
      return { diem: R.binh, moTa: "Bình (cùng Ngũ Hành Can)" };
    case "a-khac-b":
    case "b-khac-a":
      return { diem: R.khac, moTa: "Khắc" };
  }
}

function diemDiaChiNam(chiUngVien: Chi, chiNamXong: Chi): { diem: number; moTa: string } {
  const R = XONG_DAT_SCORING_RULES.diaChiNam;
  if (isTamHop(chiUngVien, chiNamXong)) return { diem: R.tamHop, moTa: "Tam Hợp với năm" };
  if (isLucHop(chiUngVien, chiNamXong)) return { diem: R.lucHop, moTa: "Lục Hợp với năm" };
  return { diem: R.binhHoa, moTa: "Bình hòa với năm" };
}

export interface XongDatBonus {
  loc: boolean;
  quyNhan: boolean;
  dichMa: boolean;
}

function tinhBonus(ungVien: XongDatNguoi, giaChu: XongDatNguoi): XongDatBonus {
  return {
    loc: getLocTon(giaChu.can) === ungVien.chi,
    quyNhan: (getQuyNhan(giaChu.can) as readonly Chi[]).includes(ungVien.chi),
    dichMa: getDichMa(giaChu.chi) === ungVien.chi,
  };
}

export interface XongDatScoreResult {
  ungVien: XongDatNguoi;
  diem: number;
  diaChiNam: { diem: number; moTa: string };
  thienCanGiaChu: { diem: number; moTa: string };
  bonus: XongDatBonus;
  lyDoNoiBat: string[];
}

export function calculateXongDatScore(ungVien: XongDatNguoi, giaChu: XongDatNguoi, chiNamXong: Chi): XongDatScoreResult {
  const diaChiNam = diemDiaChiNam(ungVien.chi, chiNamXong);
  const thienCanGiaChu = diemThienCanGiaChu(ungVien.can, giaChu.can);
  const bonus = tinhBonus(ungVien, giaChu);
  const R = XONG_DAT_SCORING_RULES;

  const diemTho = diaChiNam.diem + thienCanGiaChu.diem + (bonus.loc ? R.loc : 0) + (bonus.quyNhan ? R.quyNhan : 0) + (bonus.dichMa ? R.dichMa : 0);
  const diem = Math.round(Math.max(0, Math.min(10, (diemTho / DIEM_TOI_DA) * 10)) * 10) / 10;

  const lyDoNoiBat: string[] = [diaChiNam.moTa, `Thiên Can ↔ gia chủ: ${thienCanGiaChu.moTa}`];
  if (bonus.loc) lyDoNoiBat.push("Có Lộc của gia chủ");
  if (bonus.quyNhan) lyDoNoiBat.push("Là Quý Nhân của gia chủ");
  if (bonus.dichMa) lyDoNoiBat.push("Là Dịch Mã của gia chủ");

  return { ungVien, diem, diaChiNam, thienCanGiaChu, bonus, lyDoNoiBat };
}

export interface XongDatCandidateResult extends XongDatScoreResult {
  loaiTru: false;
}
export interface XongDatExcludedResult {
  ungVien: XongDatNguoi;
  loaiTru: true;
  lyDo: string[];
}

export function rankXongDatCandidates(
  giaChuNamSinh: number,
  namXong: number,
  tuNamSinhUngVien: number,
  denNamSinhUngVien: number,
): XongDatCandidateResult[] {
  const giaChu = getXongDatNguoi(giaChuNamSinh);
  const chiNamXong = getChi(namXong);

  const ketQua: XongDatCandidateResult[] = [];
  for (let namSinh = tuNamSinhUngVien; namSinh <= denNamSinhUngVien; namSinh++) {
    const ungVien = getXongDatNguoi(namSinh);
    const exclusion = isXongDatExcluded(ungVien, giaChu, chiNamXong);
    if (exclusion.loaiTru) continue;
    ketQua.push({ ...calculateXongDatScore(ungVien, giaChu, chiNamXong), loaiTru: false });
  }
  return ketQua.slice().sort((a, b) => b.diem - a.diem || b.ungVien.namSinh - a.ungVien.namSinh);
}

export function getExcludedXongDatCandidates(
  giaChuNamSinh: number,
  namXong: number,
  tuNamSinhUngVien: number,
  denNamSinhUngVien: number,
): XongDatExcludedResult[] {
  const giaChu = getXongDatNguoi(giaChuNamSinh);
  const chiNamXong = getChi(namXong);

  const ketQua: XongDatExcludedResult[] = [];
  for (let namSinh = tuNamSinhUngVien; namSinh <= denNamSinhUngVien; namSinh++) {
    const ungVien = getXongDatNguoi(namSinh);
    const exclusion = isXongDatExcluded(ungVien, giaChu, chiNamXong);
    if (exclusion.loaiTru) ketQua.push({ ungVien, loaiTru: true, lyDo: exclusion.lyDo });
  }
  return ketQua;
}

export function getTopXongDatCandidates(
  giaChuNamSinh: number,
  namXong: number,
  tuNamSinhUngVien: number,
  denNamSinhUngVien: number,
  limit = 5,
): XongDatCandidateResult[] {
  return rankXongDatCandidates(giaChuNamSinh, namXong, tuNamSinhUngVien, denNamSinhUngVien).slice(0, limit);
}
