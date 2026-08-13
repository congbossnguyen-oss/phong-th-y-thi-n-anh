/**
 * GIỜ TỐT TRONG NGÀY — phân tích 12 giờ Địa Chi của 1 ngày và xếp hạng tốt/xấu, dựa trên: nền
 * Trạch Cát của ngày (dùng chung, xem `trachCatDayBase.ts`), quan hệ Can/Chi/Ngũ Hành giữa GIỜ
 * và NGÀY (dùng chung, xem `canChiRelationScoring.ts`), Hoàng Đạo/Hắc Đạo giờ, Tiểu Lục Nhâm
 * giờ (đóng vai trò "cát/hung tinh theo giờ" — hệ thống hiện chưa có bảng thần sát riêng theo
 * giờ ngoài 2 nguồn này), và (tùy chọn) lớp bổ sung "giờ ↔ cá nhân" KHÔNG được thay thế nền
 * giờ/ngày (chỉ cộng/trừ có giới hạn).
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA — KHÔNG trích dẫn từ 1 trang sách cụ
 * thể. `GIO_PURPOSE_RULES` là bộ hệ số lệch trọng số theo mục đích sử dụng (tự đặt, có thể
 * chỉnh sau) — không dùng cùng 1 điểm giờ cho mọi mục đích.
 */
import type { Data } from "@thien-anh/calendar-core";
import type { CatHung } from "../trach-nhat/catHung.js";
import {
  tinhQuanHeCan,
  tinhQuanHeChi,
  tinhQuanHeNguHanh,
  nguHanhCuaChi,
  type CanRelationRules,
  type ChiRelationRules,
  type NguHanhRelationRules,
} from "./canChiRelationScoring.js";
import type { TrachCatDayBaseRules } from "./trachCatDayBase.js";
import type { NguoiTuoi } from "./tuoiHopLamAn.js";

type Can = Data.Can;
type Chi = Data.Chi;

export const GIO_PURPOSE_LIST = [
  "GENERAL",
  "CAU_TAI",
  "GIAO_TIEP_TIEC_TUNG",
  "DONG_PHONG",
  "KHAI_TRUONG",
  "KY_HOP_DONG",
  "XUAT_HANH",
  "CUOI_HOI",
  "KHAI_QUANG",
  // 8 mục đích riêng của module Xuất Hành Cá Nhân Tổng Hợp — 4 mục đích còn lại của module đó
  // (Xuất hành chung/Ký hợp đồng/Cầu tài/Gặp gỡ-giao tế) tái dùng thẳng 4 khóa đã có ở trên
  // (XUAT_HANH/KY_HOP_DONG/CAU_TAI/GIAO_TIEP_TIEC_TUNG) thay vì tạo khóa trùng lặp.
  "DI_CONG_VIEC",
  "GAP_KHACH_HANG",
  "GAP_DOI_TAC",
  "DI_LAM_AN",
  "DI_XA",
  "PHONG_VAN",
  "DOI_NO",
  "GIAO_DICH",
  // Module Chọn Ngày Giờ Sửa Chữa – Cải Tạo Nhà — việc "khởi công/động thổ", gần bản chất với
  // KHAI_TRUONG/DONG_PHONG (đều cần nền ngày + Hoàng Đạo giờ vững chắc hơn các mục đích giao
  // tiếp thông thường) nên nhấn 2 yếu tố này, giống cách 2 module đó đã cấu hình.
  "SUA_CHUA_CAI_TAO",
] as const;
export type GioPurpose = (typeof GIO_PURPOSE_LIST)[number];

type TrongSoGio = {
  nenNgay: number;
  can: number;
  chi: number;
  nguHanh: number;
  hoangHacGio: number;
  catHungGio: number;
};

export const GIO_SCORING_RULES = {
  diemNenTang: 5,
  /** Trọng số mặc định (mục đích GENERAL) — tổng = 1, khớp đặc tả mục 7. */
  trongSoMacDinh: {
    nenNgay: 0.2,
    can: 0.15,
    chi: 0.25,
    nguHanh: 0.2,
    hoangHacGio: 0.1,
    catHungGio: 0.1,
  } satisfies TrongSoGio,
  can: { diemNenTang: 5, hopDiem: 2, sinhDiem: 1, binhHoaDiem: 0, khacDiem: -1.5, khacManhDiem: -2.5 } satisfies CanRelationRules,
  chi: { diemNenTang: 5, tamHopDiem: 2.5, lucHopDiem: 2, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3 } satisfies ChiRelationRules,
  nguHanh: { diemNenTang: 5, sinhDiem: 1.5, tuongHoaDiem: 0.5, khacDiem: -1.5 } satisfies NguHanhRelationRules,
  hoangHacGio: { cat: 2, hung: -2 },
  catHungGio: { cat: 1.5, hung: -1.5 },
  nenTrachCatNgay: {
    diemNenTang: 5,
    hoangDaoHacDao: { "hoàng đạo": 1.5, "hắc đạo": -1.5, "không xác định": 0 } as Record<
      "hoàng đạo" | "hắc đạo" | "không xác định",
      number
    >,
    nhiThapBatTu: { cat: 1, hung: -1 },
    trucTot: ["Mãn", "Thành", "Khai", "Kiến", "Bình", "Định"] as readonly string[],
    trucXau: ["Phá", "Nguy", "Bế"] as readonly string[],
    diemTrucTot: 0.5,
    diemTrucXau: -1,
    thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} as Record<string, number> },
    ngayDaiKy: { nguyetKy: -1, tamNuong: -1, duongCongKyNhat: -1.5, satChu: -1, diemTranNeuPham: 4 },
    ngayCatKhac: { diemMoiNgayCat: 0.3 },
  } satisfies TrachCatDayBaseRules,
  /** Lớp bổ sung "giờ ↔ cá nhân" — CHỈ cộng/trừ có giới hạn, không thay thế nền giờ/ngày. */
  canNhan: {
    heSoThuNho: 0.2,
    bonusToiDa: 1,
    penaltyToiDa: -1.5,
    can: { diemNenTang: 5, hopDiem: 3, sinhDiem: 1.5, binhHoaDiem: 0, khacDiem: -2, khacManhDiem: -3.5 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 3.5, lucHopDiem: 3, binhHoaDiem: 0, hinhHaiPhaDiem: -1.5, xungDiem: -3.5 } satisfies ChiRelationRules,
  },
} as const;

/** Hệ số lệch trọng số theo mục đích — merge đè lên `trongSoMacDinh` rồi chuẩn hóa lại tổng = 1. */
export const GIO_PURPOSE_RULES: Record<GioPurpose, Partial<TrongSoGio>> = {
  GENERAL: {},
  CAU_TAI: { nguHanh: 0.28, chi: 0.22, nenNgay: 0.18 },
  GIAO_TIEP_TIEC_TUNG: { hoangHacGio: 0.15, catHungGio: 0.15, nenNgay: 0.15, chi: 0.22 },
  DONG_PHONG: { chi: 0.32, nenNgay: 0.13, can: 0.12 },
  KHAI_TRUONG: { nenNgay: 0.25, catHungGio: 0.15, nguHanh: 0.18 },
  KY_HOP_DONG: { can: 0.2, chi: 0.28, nenNgay: 0.18 },
  XUAT_HANH: { hoangHacGio: 0.15, nguHanh: 0.15, chi: 0.22 },
  CUOI_HOI: { chi: 0.3, hoangHacGio: 0.15, nenNgay: 0.15 },
  // Giống KHAI_TRUONG (cùng tính chất "khởi đầu trang trọng") nhưng nhấn nền ngày (Trực/Hoàng
  // Đạo/thần sát chung) cao hơn một chút vì khai quang thiên về tính chất nghi lễ/tôn nghiêm.
  KHAI_QUANG: { nenNgay: 0.28, catHungGio: 0.16, hoangHacGio: 0.14 },

  // 8 mục đích của module Xuất Hành Cá Nhân Tổng Hợp — nhóm theo tính chất gần nhất với các
  // mục đích đã có sẵn ở trên (không tự bịa hệ số riêng biệt cho từng cái khi bản chất giống
  // nhau), điều chỉnh nhẹ theo đặc thù riêng của từng việc.
  DI_CONG_VIEC: { hoangHacGio: 0.15, nguHanh: 0.15, chi: 0.22 }, // như XUAT_HANH
  GAP_KHACH_HANG: { hoangHacGio: 0.15, catHungGio: 0.15, nenNgay: 0.15, chi: 0.22 }, // như GIAO_TIEP_TIEC_TUNG
  GAP_DOI_TAC: { can: 0.2, chi: 0.28, nenNgay: 0.18 }, // như KY_HOP_DONG (quan hệ trang trọng)
  DI_LAM_AN: { nguHanh: 0.26, chi: 0.24, nenNgay: 0.16 }, // pha giữa CAU_TAI và XUAT_HANH
  DI_XA: { hoangHacGio: 0.2, nguHanh: 0.15, chi: 0.2 }, // như XUAT_HANH, nhấn Hoàng Đạo hơn (đi xa cần yên tâm)
  PHONG_VAN: { nenNgay: 0.24, can: 0.2, catHungGio: 0.14 }, // nhấn "bản thân trình diện" (Can) + nền ngày
  // Đòi nợ: việc đối đầu/khẩu thiệt — nhấn Tiểu Lục Nhâm (catHungGio, để tránh Xích Khẩu) hơn
  // hẳn các mục đích khác. Đây là suy luận hợp lý từ ý nghĩa Xích Khẩu ("khẩu thiệt, tranh
  // luận") đã ghi trong `TIEU_LUC_NHAM_NAMES`, không phải trích dẫn trực tiếp 1 nguồn cổ.
  DOI_NO: { catHungGio: 0.22, chi: 0.24, can: 0.16 },
  GIAO_DICH: { can: 0.2, chi: 0.28, nenNgay: 0.18 }, // như KY_HOP_DONG
  SUA_CHUA_CAI_TAO: { nenNgay: 0.28, hoangHacGio: 0.16, chi: 0.22 }, // như KHAI_TRUONG, nhấn nền ngày + Hoàng Đạo giờ
};

function resolveTrongSo(purpose: GioPurpose): TrongSoGio {
  const merged = { ...GIO_SCORING_RULES.trongSoMacDinh, ...GIO_PURPOSE_RULES[purpose] };
  const tong = Object.values(merged).reduce((a, b) => a + b, 0);
  const ket = {} as TrongSoGio;
  for (const key of Object.keys(merged) as (keyof TrongSoGio)[]) {
    ket[key] = merged[key] / tong;
  }
  return ket;
}

export interface GioTotYeuTo {
  ten: string;
  diem: number;
}

export type GioTotHang = "rat-tot" | "tot" | "co-the-dung" | "khong-thuan" | "nen-tranh";

const NHAN_THEO_HANG: Record<GioTotHang, string> = {
  "rat-tot": "⭐ Rất tốt",
  "tot": "🟢 Tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "nen-tranh": "🔴 Nên tránh",
};

export function getHourRating(diem: number): GioTotHang {
  if (diem >= 9) return "rat-tot";
  if (diem >= 7) return "tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "nen-tranh";
}

export interface HourDayCompatibilityInput {
  gioCan: Can;
  gioChi: Chi;
  dayCan: Can;
  dayChi: Chi;
}

export interface HourDayCompatibilityResult {
  can: ReturnType<typeof tinhQuanHeCan>;
  chi: ReturnType<typeof tinhQuanHeChi>;
  nguHanh: ReturnType<typeof tinhQuanHeNguHanh>;
}

/** Quan hệ GIỜ ↔ NGÀY (Can/Chi/Ngũ Hành) — không phụ thuộc cá nhân hay mục đích. */
export function calculateHourDayCompatibility(input: HourDayCompatibilityInput): HourDayCompatibilityResult {
  const R = GIO_SCORING_RULES;
  return {
    can: tinhQuanHeCan(input.gioCan, input.dayCan, R.can),
    chi: tinhQuanHeChi(input.gioChi, input.dayChi, R.chi),
    nguHanh: tinhQuanHeNguHanh(nguHanhCuaChi(input.gioChi), nguHanhCuaChi(input.dayChi), R.nguHanh),
  };
}

/** Quan hệ GIỜ ↔ CÁ NHÂN — lớp bổ sung, trả về delta đã giới hạn (chưa cộng vào điểm nền). */
export function calculateHourPersonalCompatibility(gioCan: Can, gioChi: Chi, nguoi: NguoiTuoi): { delta: number; moTa: string } {
  const R = GIO_SCORING_RULES.canNhan;
  const canRel = tinhQuanHeCan(gioCan, nguoi.can, R.can);
  const chiRel = tinhQuanHeChi(gioChi, nguoi.chi, R.chi);
  const rawDelta = (canRel.diem - R.can.diemNenTang + (chiRel.diem - R.chi.diemNenTang)) * R.heSoThuNho;
  const delta = Math.round(Math.max(R.penaltyToiDa, Math.min(R.bonusToiDa, rawDelta)) * 10) / 10;
  return { delta, moTa: `Can: ${canRel.moTa}; Chi: ${chiRel.moTa}` };
}

export interface GioTotInput {
  dayCan: Can;
  dayChi: Chi;
  gioChi: Chi;
  gioCan: Can;
  hoangHacGio: { name: string; catHung: CatHung };
  tieuLucNhamGio: { name: string; catHung: CatHung };
  /** Điểm nền Trạch Cát của ngày — tính 1 lần/ngày, dùng chung cho cả 12 giờ. */
  nenTrachCatNgayDiem: number;
  purpose?: GioPurpose | undefined;
  nguoi?: NguoiTuoi | undefined;
}

export interface GioTotResult {
  diem: number;
  hang: GioTotHang;
  nhan: string;
  yeuTo: GioTotYeuTo[];
}

export function calculateHourScore(input: GioTotInput): GioTotResult {
  const R = GIO_SCORING_RULES;
  const purpose = input.purpose ?? "GENERAL";
  const trongSo = resolveTrongSo(purpose);
  const yeuTo: GioTotYeuTo[] = [];

  const { can, chi, nguHanh } = calculateHourDayCompatibility({
    gioCan: input.gioCan,
    gioChi: input.gioChi,
    dayCan: input.dayCan,
    dayChi: input.dayChi,
  });

  const hoangHacDiem = 5 + (input.hoangHacGio.catHung === "cát" ? R.hoangHacGio.cat : R.hoangHacGio.hung);
  const catHungGioDiem = 5 + (input.tieuLucNhamGio.catHung === "cát" ? R.catHungGio.cat : R.catHungGio.hung);

  let diem =
    input.nenTrachCatNgayDiem * trongSo.nenNgay +
    can.diem * trongSo.can +
    chi.diem * trongSo.chi +
    nguHanh.diem * trongSo.nguHanh +
    hoangHacDiem * trongSo.hoangHacGio +
    catHungGioDiem * trongSo.catHungGio;

  yeuTo.push(
    { ten: `Nền Trạch Cát ngày`, diem: input.nenTrachCatNgayDiem },
    { ten: `Can giờ ↔ Can ngày: ${can.moTa}`, diem: can.diem },
    { ten: `Chi giờ ↔ Chi ngày: ${chi.moTa}`, diem: chi.diem },
    { ten: `Ngũ Hành giờ ↔ ngày: ${nguHanh.moTa}`, diem: nguHanh.diem },
    { ten: `${input.hoangHacGio.name} (giờ ${input.hoangHacGio.catHung})`, diem: hoangHacDiem },
    { ten: `${input.tieuLucNhamGio.name} (${input.tieuLucNhamGio.catHung})`, diem: catHungGioDiem },
  );

  if (input.nguoi) {
    const caNhan = calculateHourPersonalCompatibility(input.gioCan, input.gioChi, input.nguoi);
    if (caNhan.delta !== 0) {
      diem += caNhan.delta;
      yeuTo.push({ ten: `Tương tác cá nhân (${caNhan.moTa})`, diem: caNhan.delta });
    }
  }

  diem = Math.max(0, Math.min(10, diem));
  diem = Math.round(diem * 10) / 10;

  const hang = getHourRating(diem);
  return { diem, hang, nhan: NHAN_THEO_HANG[hang], yeuTo };
}

export function formatHourResult(chiGio: Chi, khungGio: string, result: GioTotResult): string {
  return [`${khungGio} (giờ ${chiGio}) — ${result.diem}/10`, result.nhan, ...result.yeuTo.map((y) => `${y.ten}: ${y.diem >= 0 ? "+" : ""}${y.diem}`)].join(
    "\n",
  );
}
