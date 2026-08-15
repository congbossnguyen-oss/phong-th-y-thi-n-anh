/**
 * NGÀY TỐT ĐI LỄ – VIẾNG MỘ — 2 mục đích riêng biệt (WORSHIP: đi lễ/cầu an/cầu tài/cầu công
 * danh — GRAVE_VISIT: viếng mộ/tảo mộ/dọn mộ/cúng lễ tại mộ), KHÔNG dùng chung 1 bộ tiêu chí.
 * Cùng kiến trúc "nền Trạch Cát + lớp mục đích (+ lớp tuổi tùy chọn)" đã dùng ở
 * `ngayKhaiTruong.ts`/`chonNgayGiaoDich.ts`.
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA. Hệ thống CHƯA có Lục Diệu (không có
 * bảng nào trong codebase khớp tên này — có 1 bảng gần giống về hình thức là Tiểu Lục Nhâm ở
 * `trach-nhat/tieuLucNham.ts`, nhưng CHƯA xác nhận được đây có phải "Lục Diệu" theo đúng nguồn
 * dân gian hay không, nên KHÔNG dùng thay thế) — tiêu chí Lục Diệu bị bỏ qua hoàn toàn (đúng
 * quy tắc "DATA_NOT_AVAILABLE thì bỏ qua, không suy đoán"). Nhị Thập Bát Tú dùng qua lớp nền
 * chung (`nhiThapBatTuCatHung`) như các module khác, không tách lớp riêng vì hệ thống chỉ có
 * cát/hung của Tú chứ chưa phân loại theo từng mục đích cụ thể.
 *
 * Bách Kỵ (`trach-nhat/ngayBachKy.ts`, bảng OCR không đầy đủ): chỉ phạt điểm khi điều kỵ của
 * Can/Chi ngày đó có liên quan trực tiếp tới tế lễ/cúng bái (khớp từ khóa "tế"/"cúng"/"lễ")
 * — các điều kỵ khác (vd "không mở kho", "không trồng trọt") không liên quan tới mục đích của
 * module này nên chỉ hiển thị tham khảo, không trừ điểm.
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  tinhQuanHeCan,
  tinhQuanHeChi,
  type CanRelationRules,
  type CanRelationResult,
  type ChiRelationRules,
  type ChiRelationResult,
} from "./canChiRelationScoring.js";
import { tinhTrachCatDayBase, type TrachCatDayBaseInput, type TrachCatDayBaseRules, type TrachCatDayBaseResult } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";
import type { BachKyEntry } from "../trach-nhat/ngayBachKy.js";

type Can = Data.Can;
type Chi = Data.Chi;

export type LeViengMoPurpose = "WORSHIP" | "GRAVE_VISIT";

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}
function round1(diem: number): number {
  return Math.round(diem * 10) / 10;
}

const BASE_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 1.2, "hắc đạo": -1.2, "không xác định": 0 },
  nhiThapBatTu: { cat: 0.8, hung: -0.8 },
  // "Mãn" = đầy đủ, sung túc — chủ dự án chốt 2026-08-15 xếp nhóm tốt cho mọi loại việc.
  trucTot: ["Mãn", "Thành", "Khai", "Kiến", "Định", "Trừ"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

const WORSHIP_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Thành", "Khai", "Kiến"],
  trucXau: ["Phá", "Bế"],
  diemTrucTot: 2,
  diemTrucXau: -2,
  thanSat: {
    diemMoiCat: 0,
    diemMoiHung: 0,
    tenUuTien: { "Thiên Đức": 1.5, "Nguyệt Đức": 1.5, "Thiên Ân": 1.2, "Phúc Sinh": 1.2, "Giải Thần": 1, "Địa Giải": 1 },
  },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1.5 },
};

const GRAVE_VISIT_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Thành", "Định", "Trừ"],
  trucXau: ["Phá", "Bế"],
  diemTrucTot: 2,
  diemTrucXau: -2,
  thanSat: {
    diemMoiCat: 0,
    diemMoiHung: 0,
    tenUuTien: { "Thiên Đức": 1.3, "Nguyệt Đức": 1.3, "Giải Thần": 1.3, "Địa Giải": 1.3 },
  },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1.2 },
};

function purposeRules(purpose: LeViengMoPurpose): TrachCatDayBaseRules {
  return purpose === "WORSHIP" ? WORSHIP_RULES : GRAVE_VISIT_RULES;
}

export const LE_VIENG_MO_SCORING_RULES = {
  trongSoCoTuoi: { base: 0.6, mucDich: 0.25, canNhan: 0.15 },
  trongSoKhongTuoi: { base: 0.7, mucDich: 0.3 },
  base: BASE_RULES,
  diemPhatBachKy: 2,
  canNhan: {
    trongSoPhu: { can: 0.4, chi: 0.6 },
    can: { diemNenTang: 5, hopDiem: 3, sinhDiem: 1.5, binhHoaDiem: 0, khacDiem: -2, khacManhDiem: -3 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 5, lucHopDiem: 3, binhHoaDiem: 0, hinhHaiPhaDiem: -3.5, xungDiem: -8 } satisfies ChiRelationRules,
  },
} as const;

export type LeViengMoHang = "dai-cat" | "cat" | "binh" | "khong-uu-tien" | "khong-nen-dung";

const NHAN_THEO_HANG: Record<LeViengMoHang, string> = {
  "dai-cat": "⭐ Đại Cát",
  cat: "🟢 Cát",
  binh: "🟡 Bình",
  "khong-uu-tien": "🟠 Không ưu tiên",
  "khong-nen-dung": "🔴 Không nên dùng",
};

export function getLeViengMoRating(diem: number): LeViengMoHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 7) return "cat";
  if (diem >= 5) return "binh";
  if (diem >= 3) return "khong-uu-tien";
  return "khong-nen-dung";
}

export function calculateLeViengMoBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, LE_VIENG_MO_SCORING_RULES.base);
}

export function calculateLeViengMoPurposeCompatibility(input: TrachCatDayBaseInput, purpose: LeViengMoPurpose): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, purposeRules(purpose));
}

export interface BachKyCheckResult {
  lienQuan: boolean;
  chiTiet: BachKyEntry[];
}

const TU_KHOA_LIEN_QUAN_LE_BAI = ["tế", "cúng", "lễ"];

export function checkBachKyLienQuan(bachKyNgay: readonly BachKyEntry[]): BachKyCheckResult {
  const chiTiet = bachKyNgay.filter((e) => TU_KHOA_LIEN_QUAN_LE_BAI.some((tu) => e.viec.includes(tu)));
  return { lienQuan: chiTiet.length > 0, chiTiet };
}

export interface LeViengMoPersonalResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
}

export function calculateLeViengMoPersonalCompatibility(nguoi: NguoiTuoi, dayCan: Can, dayChi: Chi): LeViengMoPersonalResult {
  const R = LE_VIENG_MO_SCORING_RULES.canNhan;
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi;
  return { diem: round1(clamp10(diem)), can, chi };
}

export interface LeViengMoResult {
  diem: number;
  hang: LeViengMoHang;
  nhan: string;
  purpose: LeViengMoPurpose;
  base: TrachCatDayBaseResult;
  mucDich: TrachCatDayBaseResult;
  bachKy: BachKyCheckResult;
  canNhan: LeViengMoPersonalResult | null;
}

export function calculateLeViengMoScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  purpose: LeViengMoPurpose,
  bachKyNgay: readonly BachKyEntry[],
  nguoi?: NguoiTuoi,
): LeViengMoResult {
  const base = calculateLeViengMoBaseScore(dayInput);
  const mucDich = calculateLeViengMoPurposeCompatibility(dayInput, purpose);
  const bachKy = checkBachKyLienQuan(bachKyNgay);
  const canNhan = nguoi ? calculateLeViengMoPersonalCompatibility(nguoi, dayCan, dayChi) : null;

  let diem: number;
  if (canNhan) {
    const T = LE_VIENG_MO_SCORING_RULES.trongSoCoTuoi;
    diem = base.diem * T.base + mucDich.diem * T.mucDich + canNhan.diem * T.canNhan;
  } else {
    const T = LE_VIENG_MO_SCORING_RULES.trongSoKhongTuoi;
    diem = base.diem * T.base + mucDich.diem * T.mucDich;
  }

  if (bachKy.lienQuan) {
    diem -= LE_VIENG_MO_SCORING_RULES.diemPhatBachKy;
  }
  if (base.phamDaiKy) {
    diem = Math.min(diem, LE_VIENG_MO_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getLeViengMoRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], purpose, base, mucDich, bachKy, canNhan };
}
