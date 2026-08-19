/**
 * NGÀY KÝ HỢP ĐỒNG — tìm và xếp hạng ngày đẹp cho ký kết/giao dịch/hợp tác, KHÔNG dùng chung
 * công thức với Khai Trương/Cầu Tài/Giao Tế. Hỗ trợ 2 chế độ: chung (không cần tuổi người ký)
 * và theo người ký (bổ sung lớp NGÀY ↔ NGƯỜI KÝ).
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA. Đặc tả gốc liệt kê 6 dòng trọng số
 * (Nền 25% / Ký kết-Văn thư-Giao dịch 30% / Hợp tác-Ổn định-Cam kết 15% / Hoàng-Hắc 10% /
 * Cát-Hung tinh 10% / Người ký 10%) và 5 hàm phụ (Contract/Transaction/Cooperation/
 * FinancialTransaction/Document). Hệ thống gộp Hoàng-Hắc + Cát-Hung chung vào
 * `calculateKyHopDongBaseScore` (25%+10%+10%=45%, cùng cách xử lý đã áp dụng ở
 * `ngayKhaiTruong.ts`), rồi chia 30% "Ký kết/Văn thư/Giao dịch" cho 3 hàm
 * (`calculateContractScore` 12% / `calculateDocumentScore` 8% / `calculateTransactionScore`
 * 10%), và 15% "Hợp tác/Ổn định/Cam kết" cho 2 hàm (`calculateCooperationScore` 9% /
 * `calculateFinancialTransactionScore` 6%). Tổng vẫn = 100% (45+30+15+10 người ký).
 *
 * Vì hệ thống CHƯA có bảng thần sát phân loại riêng theo "ký kết"/"văn thư"/"giao dịch" (chỉ
 * có thần sát tổng quát + Trực), 3 hàm Contract/Document/Transaction hiện dùng CHUNG 1 bộ quy
 * tắc (ưu tiên Trực Thành/Định/Kiến — các Trực mang ý nghĩa "xác lập, ổn định" gần với ký kết
 * — cộng Thiên Đức Hợp/Thiên Xá) — tách hàm riêng đúng kiến trúc yêu cầu, có thể tinh chỉnh
 * khác nhau khi có nguồn dữ liệu phân loại chi tiết hơn.
 */
import type { Data } from "@thien-anh/calendar-core";
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
} from "./canChiRelationScoring.js";
import { tinhTrachCatDayBase, type TrachCatDayBaseInput, type TrachCatDayBaseRules, type TrachCatDayBaseResult } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";
import { tinhCatTinhCaNhan, type CatTinhCaNhan } from "../trach-nhat/catTinhCaNhan.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

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
  trucTot: ["Mãn", "Thành", "Kiến", "Định"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

const KY_KET_VAN_THU_GIAO_DICH_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Thành", "Định", "Kiến"],
  trucXau: ["Phá", "Bế"],
  diemTrucTot: 3,
  diemTrucXau: -3,
  thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: { "Thiên Đức Hợp": 1, "Thiên Xá": 1 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1.5 },
};

const HOP_TAC_ON_DINH_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: ["Mãn"],
  trucXau: [],
  diemTrucTot: 2,
  diemTrucXau: 0,
  thanSat: { diemMoiCat: 0.5, diemMoiHung: -0.5, tenUuTien: { "Thiên Hỷ": 1.5, "Tam Hợp": 1.5 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1 },
};

const TAI_CHINH_RULES: TrachCatDayBaseRules = {
  diemNenTang: 5,
  hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
  nhiThapBatTu: { cat: 0, hung: 0 },
  trucTot: [],
  trucXau: [],
  diemTrucTot: 0,
  diemTrucXau: 0,
  thanSat: { diemMoiCat: 0.5, diemMoiHung: -0.5, tenUuTien: { "Sinh Khí (cầu tài)": 2.5 } },
  ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
  ngayCatKhac: { diemMoiNgayCat: 1 },
};

export const KY_HOP_DONG_SCORING_RULES = {
  trongSoCoNguoiKy: { base: 0.45, contract: 0.12, document: 0.08, transaction: 0.1, cooperation: 0.09, financial: 0.06, nguoiKy: 0.1 },
  trongSoKhongNguoiKy: { base: 0.5, contract: 0.13, document: 0.09, transaction: 0.11, cooperation: 0.1, financial: 0.07 },
  base: BASE_RULES,
  kyKetVanThuGiaoDich: KY_KET_VAN_THU_GIAO_DICH_RULES,
  hopTacOnDinh: HOP_TAC_ON_DINH_RULES,
  taiChinh: TAI_CHINH_RULES,
  nguoiKy: {
    trongSoPhu: { can: 0.3, chi: 0.45, nguHanh: 0.25 },
    can: { diemNenTang: 5, hopDiem: 2, sinhDiem: 1, binhHoaDiem: 0, khacDiem: -1.5, khacManhDiem: -2.5 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 2.5, lucHopDiem: 2, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3 } satisfies ChiRelationRules,
    nguHanh: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -1.5 } satisfies NguHanhRelationRules,
  },
} as const;

export type KyHopDongHang = "dai-cat" | "rat-tot" | "tot" | "co-the-dung" | "khong-thuan" | "khong-nen";

const NHAN_THEO_HANG: Record<KyHopDongHang, string> = {
  "dai-cat": "⭐ Đại cát — Rất tốt",
  "rat-tot": "⭐ Rất tốt",
  "tot": "🟢 Tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen": "🔴 Không nên chọn",
};

export function getKyHopDongRating(diem: number): KyHopDongHang {
  if (diem >= 9) return "dai-cat";
  if (diem >= 8) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen";
}

export function calculateKyHopDongBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KY_HOP_DONG_SCORING_RULES.base);
}
export function calculateContractScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KY_HOP_DONG_SCORING_RULES.kyKetVanThuGiaoDich);
}
export function calculateDocumentScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KY_HOP_DONG_SCORING_RULES.kyKetVanThuGiaoDich);
}
export function calculateTransactionScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KY_HOP_DONG_SCORING_RULES.kyKetVanThuGiaoDich);
}
export function calculateCooperationScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KY_HOP_DONG_SCORING_RULES.hopTacOnDinh);
}
export function calculateFinancialTransactionScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KY_HOP_DONG_SCORING_RULES.taiChinh);
}

export interface KyHopDongPersonalResult {
  diem: number;
  can: CanRelationResult;
  chi: ChiRelationResult;
  nguHanh: NguHanhRelationResult;
}

export function calculateKyHopDongPersonalCompatibility(
  nguoiKy: NguoiTuoi,
  dayCan: Can,
  dayChi: Chi,
  dayNguHanh: NguHanh,
): KyHopDongPersonalResult {
  const R = KY_HOP_DONG_SCORING_RULES.nguoiKy;
  const can = tinhQuanHeCan(dayCan, nguoiKy.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoiKy.chi, R.chi);
  const nguHanh = tinhQuanHeNguHanh(dayNguHanh, nguoiKy.nguHanhMenh, R.nguHanh);
  const diem = can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi + nguHanh.diem * R.trongSoPhu.nguHanh;
  return { diem: round1(clamp10(diem)), can, chi, nguHanh };
}

export interface KyHopDongResult {
  diem: number;
  hang: KyHopDongHang;
  nhan: string;
  base: TrachCatDayBaseResult;
  contract: TrachCatDayBaseResult;
  document: TrachCatDayBaseResult;
  transaction: TrachCatDayBaseResult;
  cooperation: TrachCatDayBaseResult;
  financial: TrachCatDayBaseResult;
  nguoiKy: KyHopDongPersonalResult | null;
  /** Cát tinh cá nhân (Chân Lộc/Quý Nhân/Lộc/Tam-Lục Hợp) theo tuổi người ký — null nếu không nhập tuổi. */
  catCaNhan: CatTinhCaNhan | null;
}

export function calculateKyHopDongScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  dayNguHanh: NguHanh,
  nguoiKy?: NguoiTuoi,
): KyHopDongResult {
  const base = calculateKyHopDongBaseScore(dayInput);
  const contract = calculateContractScore(dayInput);
  const document = calculateDocumentScore(dayInput);
  const transaction = calculateTransactionScore(dayInput);
  const cooperation = calculateCooperationScore(dayInput);
  const financial = calculateFinancialTransactionScore(dayInput);
  const nguoiKyResult = nguoiKy ? calculateKyHopDongPersonalCompatibility(nguoiKy, dayCan, dayChi, dayNguHanh) : null;

  let diem: number;
  if (nguoiKyResult) {
    const T = KY_HOP_DONG_SCORING_RULES.trongSoCoNguoiKy;
    diem =
      base.diem * T.base +
      contract.diem * T.contract +
      document.diem * T.document +
      transaction.diem * T.transaction +
      cooperation.diem * T.cooperation +
      financial.diem * T.financial +
      nguoiKyResult.diem * T.nguoiKy;
  } else {
    const T = KY_HOP_DONG_SCORING_RULES.trongSoKhongNguoiKy;
    diem =
      base.diem * T.base +
      contract.diem * T.contract +
      document.diem * T.document +
      transaction.diem * T.transaction +
      cooperation.diem * T.cooperation +
      financial.diem * T.financial;
  }

  // Cát tinh cá nhân (engine dùng chung) — chỉ cộng phần Chân Lộc/Quý Nhân/Lộc (Tam/Lục Hợp đã tính
  // trong `nguoiKy`). Cộng TRƯỚC trần đại kỵ.
  const catCaNhan = nguoiKy ? tinhCatTinhCaNhan(dayCan, dayChi, nguoiKy.can, nguoiKy.chi) : null;
  if (catCaNhan) diem += catCaNhan.diemCongChanLoc;

  if (base.phamDaiKy) {
    diem = Math.min(diem, KY_HOP_DONG_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getKyHopDongRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], base, contract, document, transaction, cooperation, financial, nguoiKy: nguoiKyResult, catCaNhan };
}

export function formatKyHopDongResult(ngayStr: string, result: KyHopDongResult): string {
  return [ngayStr, `${result.nhan} — ${result.diem}/10`].join("\n");
}
