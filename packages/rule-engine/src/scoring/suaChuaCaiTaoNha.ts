/**
 * CHỌN NGÀY GIỜ SỬA CHỮA – CẢI TẠO NHÀ — lớp ĐIỂM "AN TOÀN PHƯƠNG VỊ/NĂM" (không phụ thuộc
 * ngày cụ thể, tính 1 lần cho cả đợt sửa chữa) + lớp ĐIỂM NGÀY. Lớp ĐIỂM GIỜ tái dùng nguyên
 * `calculateHourScore` của `gioTotTrongNgay.ts` (đúng nguyên tắc đã áp dụng ở
 * `xuatHanhCaNhanTongHop.ts`) — orchestration ngày×giờ nằm ở trachnhat-engine.
 *
 * ⚠️ PHẠM VI TRIỂN KHAI (theo đúng lộ trình Phase 1-2 mà chính đặc tả module đề xuất ở mục 36 —
 * KHÔNG phải cắt giảm tùy tiện):
 *   - Phương vị chỉ xét ở độ chi tiết 8 PHƯƠNG (Bát Quái: Càn/Khảm/Cấn/Chấn/Tốn/Ly/Khôn/Đoài),
 *     KHÔNG xét chính xác 24 sơn/độ số — hạ tầng phương vị sẵn có trong hệ thống
 *     (`cung-menh-bat-trach/*`) đều làm việc ở cấp 8 phương; đặc tả cũng xếp "24 sơn/độ số
 *     chính xác" vào "chế độ chuyên gia" không bắt buộc (mục 30).
 *   - HOÀN TOÀN BỎ QUA lớp Huyền Không Phi Tinh (Vận/tinh bàn/niên-nguyệt phi tinh, Ngũ
 *     Hoàng/Nhị Hắc — mục 10, Phase 3 của đặc tả): hệ thống chưa có bảng Vận (20 năm/vận) hay
 *     quy tắc dựng tinh bàn đã xác thực — đây là hệ thống phức tạp, nhiều trường phái khác nhau
 *     (Phi Tinh, Phi Bạch, thuận/nghịch phi theo sơn hướng...), không thể tự suy ra mà không có
 *     nguồn cụ thể. `method?.usePhiTinh` được NHẬN làm input nhưng KHÔNG có tác dụng.
 *   - HOÀN TOÀN BỎ QUA Bát Tự cá nhân nâng cao (giờ sinh, nhật chủ vượng/suy, hỷ dụng — mục 3,
 *     MODE=CA_NHAN_NANG_CAO): đúng như đặc tả tự nói rõ, đây là tùy chọn không bắt buộc ở bản
 *     cơ bản; bản cơ bản (năm sinh + giới tính) đã đủ dùng.
 *   - "Quan hệ với tọa hướng nhà" (mục 24, `checkNatalHouseRelation`) KHÔNG có công thức cụ thể
 *     trong đặc tả — tọa/hướng nhà được NHẬN làm input để ghi nhận/hiển thị nhưng KHÔNG ảnh
 *     hưởng điểm số (tránh tự bịa công thức).
 *
 * Các lớp CÓ triển khai đầy đủ, đúng công thức đặc tả đưa ra: phân loại mức độ động (mục 3),
 * Thái Tuế/Tuế Phá/Tam Sát theo phương vị (mục 7-9, dùng `cung-menh-bat-trach/thaiTueTamSat.ts`),
 * Kim Lâu/Hoàng Ốc/Tam Tai của chủ nhà theo NĂM sửa chữa (tái dùng nguyên `hoang-oc-kim-lau`),
 * quan hệ Chi năm sửa ↔ Chi tuổi chủ (Xung nặng hơn Hình/Hại/Phá — mục 16, dùng lại
 * `tinhQuanHeChi` đã có sẵn đúng thứ tự ưu tiên này), Ngũ Hành ngày ↔ bản mệnh chủ + ↔ phương vị
 * đang động (mục 17), Trực ưu tiên theo mức độ động (mục 15, giá trị lấy ĐÚNG NGUYÊN VĂN đặc tả:
 * "Động thổ: Thành/Khai/Định/Mãn, tránh Phá/Nguy/Bế — Sửa chữa: Thành/Khai/Định, tránh Phá/Bế").
 */
import {
  tinhQuanHeCan,
  tinhQuanHeChi,
  tinhQuanHeNguHanh,
  type CanRelationRules,
  type CanRelationResult,
  type ChiRelationRules,
  type ChiRelationResult,
  type NguHanhRelationRules,
  type NguHanhRelationResult,
  nguHanhCuaChi,
} from "./canChiRelationScoring.js";
import { tinhTrachCatDayBase, type TrachCatDayBaseInput, type TrachCatDayBaseRules, type TrachCatDayBaseResult } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";
import { getChi } from "./tuoiHopLamAn.js";
import { tinhHoangOcKimLauTamTai, type HoangOcKimLauTamTaiResult } from "../hoang-oc-kim-lau/tongHop.js";
import { getPhuongViRuiRoTheoNam, CUNG_BAT_TRACH_NGU_HANH, type CungBatTrach } from "../cung-menh-bat-trach/index.js";
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export const RENOVATION_TYPE_LIST = [
  "light",
  "medium",
  "major",
  "ground_breaking",
  "kitchen",
  "main_door",
  "stair",
  "roof",
  "extension",
] as const;
export type RenovationType = (typeof RENOVATION_TYPE_LIST)[number];

export type RenovationLevel = "nhe" | "vua" | "lon" | "dong-tho";

export interface RenovationFlags {
  type: RenovationType;
  affectsStructure: boolean;
  digsGround: boolean;
}

const NHAN_MUC_DO: Record<RenovationLevel, string> = {
  nhe: "Sửa nhẹ",
  vua: "Sửa vừa",
  lon: "Sửa lớn",
  "dong-tho": "Động thổ",
};

/** Phân loại mức độ động — đúng mục 3 của đặc tả: cờ digsGround/affectsStructure luôn LẤN ÁT type gốc. */
export function classifyRenovationLevel(flags: RenovationFlags): RenovationLevel {
  if (flags.digsGround) return "dong-tho";
  if (flags.affectsStructure) return "lon";
  switch (flags.type) {
    case "ground_breaking":
      return "dong-tho";
    case "major":
    case "roof":
    case "stair":
    case "extension":
      return "lon";
    case "medium":
    case "kitchen":
    case "main_door":
      return "vua";
    case "light":
    default:
      return "nhe";
  }
}
export function renovationLevelNhan(level: RenovationLevel): string {
  return NHAN_MUC_DO[level];
}

// ─────────────────────────── LỚP AN TOÀN PHƯƠNG VỊ / NĂM ───────────────────────────

export type PhuongViSeverity = "none" | "low" | "medium" | "high" | "critical";

export interface DirectionRisk {
  cung: CungBatTrach;
  thaiTue: boolean;
  tuePha: boolean;
  tamSat: boolean;
  severity: PhuongViSeverity;
  reasons: { code: string; title: string; severity: PhuongViSeverity; description: string }[];
}

/** 1 phương vị bị động, đối chiếu với Thái Tuế/Tuế Phá/Tam Sát của năm sửa chữa. */
export function calculateDirectionRisk(namChi: Chi, cungDong: CungBatTrach, level: RenovationLevel): DirectionRisk {
  const { thaiTueCung, tuePhaCung, tamSatCung } = getPhuongViRuiRoTheoNam(namChi);
  const phamThaiTue = cungDong === thaiTueCung;
  const phamTuePha = cungDong === tuePhaCung;
  const phamTamSat = cungDong === tamSatCung;
  const dongManh = level === "dong-tho" || level === "lon";

  const reasons: DirectionRisk["reasons"] = [];
  let severity: PhuongViSeverity = "none";

  function nang(hon: PhuongViSeverity) {
    const bacThang: PhuongViSeverity[] = ["none", "low", "medium", "high", "critical"];
    if (bacThang.indexOf(hon) > bacThang.indexOf(severity)) severity = hon;
  }

  if (phamThaiTue) {
    const sv: PhuongViSeverity = dongManh ? "critical" : "high";
    nang(sv);
    reasons.push({
      code: "TAI_SUI",
      title: "Phương vị phạm Thái Tuế",
      severity: sv,
      description: "Phương vị bị động trùng phương Thái Tuế của năm.",
    });
  }
  if (phamTuePha) {
    const sv: PhuongViSeverity = dongManh ? "critical" : "high";
    nang(sv);
    reasons.push({
      code: "SUI_PO",
      title: "Phương vị phạm Tuế Phá",
      severity: sv,
      description: "Phương vị bị động đối xung với Thái Tuế của năm (Tuế Phá).",
    });
  }
  if (phamTamSat) {
    const sv: PhuongViSeverity = dongManh ? "critical" : "high";
    nang(sv);
    reasons.push({
      code: "TAM_SAT",
      title: "Phương vị phạm Tam Sát",
      severity: sv,
      description: "Phương vị bị động thuộc nhóm Tam Sát của năm (đối xung với cục Tam Hợp năm nay).",
    });
  }
  if (severity === "none") {
    severity = "low";
    reasons.push({
      code: "OK",
      title: "Không phạm Thái Tuế/Tuế Phá/Tam Sát",
      severity: "low",
      description: "Phương vị bị động không trùng Thái Tuế, Tuế Phá hay Tam Sát của năm.",
    });
  }

  return { cung: cungDong, thaiTue: phamThaiTue, tuePha: phamTuePha, tamSat: phamTamSat, severity, reasons };
}

const DIEM_THEO_SEVERITY: Record<PhuongViSeverity, number> = { none: 9, low: 9, medium: 6, high: 3.5, critical: 1 };

export interface SiteSafetyResult {
  diem: number;
  phamNghiemTrong: boolean;
  directionRisks: DirectionRisk[];
}

/** Gộp rủi ro của TẤT CẢ phương vị bị động — lấy phương vị NẶNG NHẤT làm điểm chung (thận trọng). */
export function calculateSiteSafety(namSuaChua: number, cungDongList: readonly CungBatTrach[], level: RenovationLevel): SiteSafetyResult {
  const namChi = getChi(namSuaChua);
  const directionRisks = cungDongList.map((cung) => calculateDirectionRisk(namChi, cung, level));
  const diem = directionRisks.length > 0 ? Math.min(...directionRisks.map((r) => DIEM_THEO_SEVERITY[r.severity])) : 9;
  const phamNghiemTrong = directionRisks.some((r) => r.severity === "critical");
  return { diem, phamNghiemTrong, directionRisks };
}

// ─────────────────────────── LỚP CHỦ NHÀ ↔ NĂM SỬA CHỮA ───────────────────────────

const OWNER_YEAR_CHI_RULES: ChiRelationRules = {
  diemNenTang: 5,
  tamHopDiem: 3,
  lucHopDiem: 2,
  binhHoaDiem: 0,
  hinhHaiPhaDiem: -3,
  xungDiem: -7,
};
const HOANG_OC_KIM_LAU_DIEM: Record<HoangOcKimLauTamTaiResult["ketLuan"]["mucDo"], number> = {
  tot: 9,
  "can-can-nhac": 5.5,
  "khong-nen": 2.5,
};

export interface OwnerYearResult {
  diem: number;
  hoangOcKimLauTamTai: HoangOcKimLauTamTaiResult;
  chiNamQuanHe: ChiRelationResult;
}

/** Chủ nhà ↔ NĂM sửa chữa: Kim Lâu/Hoàng Ốc/Tam Tai (tái dùng nguyên) + Chi năm ↔ Chi tuổi chủ. */
export function calculateOwnerYearCompatibility(namSinh: number, namSuaChua: number): OwnerYearResult {
  const hoangOcKimLauTamTai = tinhHoangOcKimLauTamTai(namSinh, namSuaChua);
  const chiTuoi = getChi(namSinh);
  const chiNam = getChi(namSuaChua);
  const chiNamQuanHe = tinhQuanHeChi(chiNam, chiTuoi, OWNER_YEAR_CHI_RULES);
  const diem = (HOANG_OC_KIM_LAU_DIEM[hoangOcKimLauTamTai.ketLuan.mucDo] + chiNamQuanHe.diem) / 2;
  return { diem: Math.round(diem * 10) / 10, hoangOcKimLauTamTai, chiNamQuanHe };
}

// ─────────────────────────── LỚP NGÀY ───────────────────────────

const BASE_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 1.2, "hắc đạo": -1.2, "không xác định": 0 },
  nhiThapBatTu: { cat: 0.8, hung: -0.8 },
  // ⚠️ KHÔNG có "Mãn" ở đây là CÓ CHỦ Ý. Bảng Trực tổng quát chủ dự án cung cấp 2026-08-15 xếp
  // Mãn ở mức ⚠️ (thận trọng), không phải ✅. Mãn chỉ được tính là tốt ở module Ký Hợp Đồng —
  // nơi ý nghĩa "đầy đủ, thu hoạch, hoàn tất giao dịch" đúng với tính chất công việc.
  trucTot: ["Thành", "Khai", "Kiến", "Định", "Trừ"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

/** Trực ưu tiên theo mức độ động — giá trị lấy nguyên văn mục 15 của đặc tả. */
function purposeRules(level: RenovationLevel): TrachCatDayBaseRules {
  const khungChung = {
    diemNenTang: 5,
    hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 } as Record<"hoàng đạo" | "hắc đạo" | "không xác định", number>,
    nhiThapBatTu: { cat: 0, hung: 0 },
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: {} },
    ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
    ngayCatKhac: { diemMoiNgayCat: 1.2 },
  };
  if (level === "dong-tho") {
    return { ...khungChung, trucTot: ["Thành", "Khai", "Định", "Mãn"], trucXau: ["Phá", "Nguy", "Bế"], diemTrucTot: 2.2, diemTrucXau: -2.2 };
  }
  return { ...khungChung, trucTot: ["Thành", "Khai", "Định"], trucXau: ["Phá", "Bế"], diemTrucTot: 2, diemTrucXau: -2 };
}

export const SUA_CHUA_DAY_SCORING_RULES = {
  trongSo: { base: 0.45, mucDich: 0.25, canNhan: 0.3 },
  base: BASE_RULES,
  canNhan: {
    trongSoPhu: { nguHanh: 0.3, can: 0.25, chi: 0.35, nguHanhPhuongVi: 0.1 },
    nguHanh: { diemNenTang: 5, sinhDiem: 2, tuongHoaDiem: 1, khacDiem: -3 } satisfies NguHanhRelationRules,
    can: { diemNenTang: 5, hopDiem: 3, sinhDiem: 1.5, binhHoaDiem: 0, khacDiem: -2, khacManhDiem: -3 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 5, lucHopDiem: 3, binhHoaDiem: 0, hinhHaiPhaDiem: -3.5, xungDiem: -8 } satisfies ChiRelationRules,
    nguHanhPhuongVi: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -2 } satisfies NguHanhRelationRules,
  },
} as const;

export type SuaChuaHang = "rat-tot" | "tot" | "kha-tot" | "co-the-dung" | "khong-thuan" | "khong-nen-chon";

const NHAN_THEO_HANG: Record<SuaChuaHang, string> = {
  "rat-tot": "⭐ Rất tốt",
  tot: "⭐ Tốt",
  "kha-tot": "🟢 Khá tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen-chon": "🔴 Không nên chọn",
};
export function getSuaChuaRating(diem: number): SuaChuaHang {
  if (diem >= 9) return "rat-tot";
  if (diem >= 8) return "tot";
  if (diem >= 7) return "kha-tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen-chon";
}
export function suaChuaNhan(diem: number): string {
  return NHAN_THEO_HANG[getSuaChuaRating(diem)];
}

export interface SuaChuaDayPersonalResult {
  diem: number;
  nguHanh: NguHanhRelationResult;
  can: CanRelationResult;
  chi: ChiRelationResult;
  nguHanhPhuongVi: NguHanhRelationResult;
}

export function calculateSuaChuaDayBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, SUA_CHUA_DAY_SCORING_RULES.base);
}
export function calculateSuaChuaDayPurposeScore(input: TrachCatDayBaseInput, level: RenovationLevel): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, purposeRules(level));
}

/** Ngày ↔ chủ nhà: Ngũ Hành (bản Mệnh) + Can + Chi (mục 16-17), CỘNG Ngũ Hành ngày ↔ phương vị đang động (mục 17). */
export function calculateSuaChuaDayPersonal(
  nguoi: NguoiTuoi,
  dayCan: Can,
  dayChi: Chi,
  cungDongChinh: CungBatTrach,
): SuaChuaDayPersonalResult {
  const R = SUA_CHUA_DAY_SCORING_RULES.canNhan;
  const nguHanhNgay = nguHanhCuaChi(dayChi);
  const nguHanh = tinhQuanHeNguHanh(nguHanhNgay, nguoi.nguHanhMenh, R.nguHanh);
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const nguHanhPhuongVi = tinhQuanHeNguHanh(nguHanhNgay, CUNG_BAT_TRACH_NGU_HANH[cungDongChinh], R.nguHanhPhuongVi);
  const diem =
    nguHanh.diem * R.trongSoPhu.nguHanh +
    can.diem * R.trongSoPhu.can +
    chi.diem * R.trongSoPhu.chi +
    nguHanhPhuongVi.diem * R.trongSoPhu.nguHanhPhuongVi;
  return { diem: Math.round(Math.max(0, Math.min(10, diem)) * 10) / 10, nguHanh, can, chi, nguHanhPhuongVi };
}

export interface SuaChuaDayResult {
  diem: number;
  hang: SuaChuaHang;
  nhan: string;
  base: TrachCatDayBaseResult;
  mucDich: TrachCatDayBaseResult;
  canNhan: SuaChuaDayPersonalResult;
}

/** Điểm NGÀY (dayScore) — KHÔNG bao gồm siteSafety/ownerYear (2 lớp đó tính 1 lần/đợt sửa chữa, không đổi theo ngày). */
export function calculateSuaChuaDayScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  level: RenovationLevel,
  nguoi: NguoiTuoi,
  cungDongChinh: CungBatTrach,
): SuaChuaDayResult {
  const base = calculateSuaChuaDayBaseScore(dayInput);
  const mucDich = calculateSuaChuaDayPurposeScore(dayInput, level);
  const canNhan = calculateSuaChuaDayPersonal(nguoi, dayCan, dayChi, cungDongChinh);

  const T = SUA_CHUA_DAY_SCORING_RULES.trongSo;
  let diem = base.diem * T.base + mucDich.diem * T.mucDich + canNhan.diem * T.canNhan;

  if (base.phamDaiKy) {
    diem = Math.min(diem, SUA_CHUA_DAY_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = Math.round(Math.max(0, Math.min(10, diem)) * 10) / 10;
  const hang = getSuaChuaRating(diem);
  return { diem, hang, nhan: NHAN_THEO_HANG[hang], base, mucDich, canNhan };
}
