/**
 * NGÀY GIỜ KHAI QUANG – AN VỊ VẬT PHẨM — 5 mục đích riêng biệt (KHAI_QUANG/AN_VI/THINH/
 * DAT_VAT_PHAM/BAT_DAU_SU_DUNG), cùng kiến trúc "nền Trạch Cát + lớp mục đích + lớp cá nhân"
 * đã dùng ở `ngayKhaiTruong.ts`/`ngayLeViengMo.ts`. Khác các module trước: năm sinh + giới tính
 * chủ là BẮT BUỘC (không có nhánh "không tuổi") vì spec yêu cầu luôn xét quan hệ ngày↔chủ.
 *
 * ⚠️ Toàn bộ trọng số là QUY ƯỚC DO HỆ THỐNG TỰ ĐẶT RA. Theo đúng chỉ dẫn của spec module này
 * ("không tự bịa dữ liệu nếu chưa có bảng quy tắc"), 2 lớp sau bị BỎ QUA hoàn toàn (không tính
 * điểm giả):
 *   - "Nghi/Kỵ riêng theo từng vật phẩm" (KHAI_QUANG_ITEM_RULES trong spec) — hệ thống chưa có
 *     bảng nghi/kỵ khai quang cổ truyền cho từng loại vật phẩm cụ thể. `itemType` vẫn được nhận
 *     làm input và hiển thị lại cho người dùng, nhưng KHÔNG ảnh hưởng tới điểm số.
 *   - "Cung ↔ Ngày" (mục 10 trong spec) — hệ thống có Cung Phi (`cung-menh-bat-trach`) nhưng đó
 *     là quan hệ giữa 2 CUNG (người-người hoặc người-hướng nhà), KHÔNG có bảng "cung hợp/khắc
 *     với 1 ngày cụ thể". `gioiTinh` vẫn được nhận làm input (đúng form spec) nhưng hiện KHÔNG
 *     dùng trong công thức chấm điểm vì chưa có dữ liệu.
 * "Thiên Đức Hợp"/"Thiên Xá" (mục 11) đã có sẵn trong nền chung `trachCatDayBase.ts` (cờ
 * `thienDucHop`/`thienXa`), không cần bảng riêng. "Nghi/Kỵ đúng PURPOSE" (mục 6, trọng số cao
 * nhất theo spec) được xấp xỉ qua lựa chọn Trực + thần sát ưu tiên theo từng mục đích — hệ thống
 * chưa có bảng "nghi/kỵ khai quang" cổ truyền riêng biệt nên không tách thành 1 layer boolean
 * riêng, mà gộp vào đúng cơ chế "lớp mục đích" đã dùng nhất quán ở các module khác.
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
import { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

export type KhaiQuangPurpose = "KHAI_QUANG" | "AN_VI" | "THINH" | "DAT_VAT_PHAM" | "BAT_DAU_SU_DUNG";

export type KhaiQuangItemType =
  | "TUONG_PHAT"
  | "TUONG_THAN"
  | "TY_HUU"
  | "THIEM_THU"
  | "KY_LAN"
  | "SU_TU"
  | "CHO_DA"
  | "NGHE_DA"
  | "VOI_DA"
  | "VAT_PHAM_PHONG_THUY"
  | "VAT_PHAM_CHIEU_TAI"
  | "VAT_PHAM_HO_THAN"
  | "KHAC";

export type KhaiQuangGender = "Nam" | "Nữ";

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
  trucTot: ["Thành", "Khai", "Kiến", "Định", "Trừ"],
  trucXau: ["Phá", "Nguy", "Bế"],
  diemTrucTot: 0.8,
  diemTrucXau: -0.8,
  thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.4, tenUuTien: {} },
  ngayDaiKy: { nguyetKy: -1.5, tamNuong: -1.5, duongCongKyNhat: -2.5, satChu: -1.5, diemTranNeuPham: 3 },
  ngayCatKhac: { diemMoiNgayCat: 0.5 },
};

// Thần sát ưu tiên dùng chung cho cả 5 mục đích — đúng danh sách "Cát thần" nêu ở mục 11 của
// spec, CHỈ lấy những tên đã xác nhận có thật trong `trach-nhat/thanSat.ts` (Thiên Đức, Nguyệt
// Đức, Thiên Giải, Địa Giải, Sinh Khí). Không dùng "Thiên Đức Hợp"/"Thiên Xá" ở đây vì đã có cờ
// riêng trong nền chung `trachCatDayBase.ts`.
const CAT_THAN_UU_TIEN: Record<string, number> = {
  "Thiên Đức": 1.3,
  "Nguyệt Đức": 1.3,
  "Thiên Giải": 1,
  "Thiên Giải (nguồn khác)": 1,
  "Địa Giải": 1,
  "Sinh Khí (cầu tài)": 0.8,
};

// Trực "Khai" (mở/khởi đầu) ưu tiên cho các mục đích mang tính "mở ra lần đầu": Khai Quang,
// Thỉnh (rước về), Bắt Đầu Sử Dụng. Trực "Định" (an định, ổn định tại chỗ) ưu tiên cho các mục
// đích mang tính "đặt yên vị": An Vị, Đặt Vật Phẩm. Cả 2 nhóm đều coi Trực Thành là tốt phụ trợ
// (hoàn thành việc trang trọng) — dựa theo ý nghĩa cổ truyền phổ biến của 12 Trực, không phải
// bảng nghi/kỵ khai quang chuyên biệt (hệ thống chưa có bảng đó, xem ghi chú đầu file).
function purposeRules(purpose: KhaiQuangPurpose): TrachCatDayBaseRules {
  const uuTienKhai: TrachCatDayBaseRules = {
    diemNenTang: 5,
    hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 },
    nhiThapBatTu: { cat: 0, hung: 0 },
    trucTot: ["Khai", "Thành", "Kiến"],
    trucXau: ["Phá", "Bế", "Nguy"],
    diemTrucTot: 2,
    diemTrucXau: -2,
    thanSat: { diemMoiCat: 0, diemMoiHung: 0, tenUuTien: CAT_THAN_UU_TIEN },
    ngayDaiKy: { nguyetKy: 0, tamNuong: 0, duongCongKyNhat: 0, satChu: 0, diemTranNeuPham: 10 },
    ngayCatKhac: { diemMoiNgayCat: 1.5 },
  };
  const uuTienDinh: TrachCatDayBaseRules = {
    ...uuTienKhai,
    trucTot: ["Định", "Thành", "Trừ"],
  };
  switch (purpose) {
    case "KHAI_QUANG":
    case "THINH":
    case "BAT_DAU_SU_DUNG":
      return uuTienKhai;
    case "AN_VI":
    case "DAT_VAT_PHAM":
      return uuTienDinh;
  }
}

export const KHAI_QUANG_SCORING_RULES = {
  trongSo: { base: 0.2, mucDich: 0.4, canNhan: 0.4 },
  base: BASE_RULES,
  canNhan: {
    // Tỉ lệ xấp xỉ theo mục 14 của spec (Ngũ hành 15 : Can 10 : Chi 10 → quy đổi 0.43:0.29:0.29,
    // làm tròn 0.4:0.3:0.3) — Ngũ Hành dùng bản Mệnh (Nạp Âm năm sinh), không dùng Chi ngũ hành,
    // vì đây mới đúng "ngũ hành của chủ" theo nghĩa cổ truyền Bát Tự.
    trongSoPhu: { nguHanh: 0.4, can: 0.3, chi: 0.3 },
    nguHanh: { diemNenTang: 5, sinhDiem: 2, tuongHoaDiem: 1, khacDiem: -3 } satisfies NguHanhRelationRules,
    can: { diemNenTang: 5, hopDiem: 3, sinhDiem: 1.5, binhHoaDiem: 0, khacDiem: -2, khacManhDiem: -3 } satisfies CanRelationRules,
    chi: { diemNenTang: 5, tamHopDiem: 5, lucHopDiem: 3, binhHoaDiem: 0, hinhHaiPhaDiem: -3.5, xungDiem: -8 } satisfies ChiRelationRules,
  },
} as const;

export type KhaiQuangHang = "rat-tot" | "tot" | "kha-tot" | "co-the-dung" | "khong-thuan" | "khong-nen-chon";

const NHAN_THEO_HANG: Record<KhaiQuangHang, string> = {
  "rat-tot": "⭐ Rất tốt",
  tot: "⭐ Tốt",
  "kha-tot": "🟢 Khá tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-thuan": "🟠 Không thuận",
  "khong-nen-chon": "🔴 Không nên chọn",
};

export function getKhaiQuangRating(diem: number): KhaiQuangHang {
  if (diem >= 9) return "rat-tot";
  if (diem >= 8) return "tot";
  if (diem >= 7) return "kha-tot";
  if (diem >= 5) return "co-the-dung";
  if (diem >= 3) return "khong-thuan";
  return "khong-nen-chon";
}

export function calculateKhaiQuangBaseScore(input: TrachCatDayBaseInput): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, KHAI_QUANG_SCORING_RULES.base);
}

export function calculateKhaiQuangPurposeCompatibility(input: TrachCatDayBaseInput, purpose: KhaiQuangPurpose): TrachCatDayBaseResult {
  return tinhTrachCatDayBase(input, purposeRules(purpose));
}

export interface KhaiQuangPersonalResult {
  diem: number;
  nguHanh: NguHanhRelationResult;
  can: CanRelationResult;
  chi: ChiRelationResult;
}

/** Quan hệ ngày ↔ chủ: Ngũ Hành (bản Mệnh) + Thiên Can + Địa Chi — cả 3 đều bắt buộc theo spec. */
export function calculateKhaiQuangPersonalCompatibility(nguoi: NguoiTuoi, dayCan: Can, dayChi: Chi): KhaiQuangPersonalResult {
  const R = KHAI_QUANG_SCORING_RULES.canNhan;
  const nguHanhNgay = nguHanhCuaChi(dayChi);
  const nguHanh = tinhQuanHeNguHanh(nguHanhNgay, nguoi.nguHanhMenh, R.nguHanh);
  const can = tinhQuanHeCan(dayCan, nguoi.can, R.can);
  const chi = tinhQuanHeChi(dayChi, nguoi.chi, R.chi);
  const diem = nguHanh.diem * R.trongSoPhu.nguHanh + can.diem * R.trongSoPhu.can + chi.diem * R.trongSoPhu.chi;
  return { diem: round1(clamp10(diem)), nguHanh, can, chi };
}

export interface KhaiQuangResult {
  diem: number;
  hang: KhaiQuangHang;
  nhan: string;
  purpose: KhaiQuangPurpose;
  itemType: KhaiQuangItemType;
  base: TrachCatDayBaseResult;
  mucDich: TrachCatDayBaseResult;
  canNhan: KhaiQuangPersonalResult;
}

export function calculateKhaiQuangScore(
  dayInput: TrachCatDayBaseInput,
  dayCan: Can,
  dayChi: Chi,
  purpose: KhaiQuangPurpose,
  itemType: KhaiQuangItemType,
  nguoi: NguoiTuoi,
): KhaiQuangResult {
  const base = calculateKhaiQuangBaseScore(dayInput);
  const mucDich = calculateKhaiQuangPurposeCompatibility(dayInput, purpose);
  const canNhan = calculateKhaiQuangPersonalCompatibility(nguoi, dayCan, dayChi);

  const T = KHAI_QUANG_SCORING_RULES.trongSo;
  let diem = base.diem * T.base + mucDich.diem * T.mucDich + canNhan.diem * T.canNhan;

  if (base.phamDaiKy) {
    diem = Math.min(diem, KHAI_QUANG_SCORING_RULES.base.ngayDaiKy.diemTranNeuPham);
  }

  diem = round1(clamp10(diem));
  const hang = getKhaiQuangRating(diem);

  return { diem, hang, nhan: NHAN_THEO_HANG[hang], purpose, itemType, base, mucDich, canNhan };
}
