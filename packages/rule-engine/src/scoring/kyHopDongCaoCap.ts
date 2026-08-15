/**
 * NGÀY KÝ HỢP ĐỒNG — BẢN CAO CẤP (dịch vụ thu phí).
 *
 * Tách hoàn toàn khỏi `ngayKyHopDong.ts` (bản miễn phí) theo yêu cầu "không trộn logic". Hai bản
 * cùng tồn tại có chủ đích:
 *   • Bản miễn phí chỉ nhận NĂM sinh → chỉ so được Chi năm.
 *   • Bản cao cấp nhận đủ NGÀY-THÁNG-NĂM sinh → tính được Nhật Chủ (Can trụ NGÀY sinh), nhờ đó
 *     mới chạy được lớp Thập Thần / Thê Tài — đây chính là phần đắt giá của phương pháp.
 *
 * ⚠️ CHỐNG TRÙNG TÊN (mục N3 của đặc tả):
 *   - `SINH_KHI_TRUC` ở đây = Trực Khai, KHÁC "Sinh Khí" cặp Hà Đồ của Huyền Không Đại Quái
 *     (nằm ở `xem-ngay-cao-cap/buoc5CachCuc.ts`) — hai hệ khác hẳn nhau.
 *   - `THIEN_DUC_TEN_KHAC_TRUC` = tên gọi khác của Trực Chấp, KHÁC cát tinh Thiên Đức Hợp trong
 *     `trach-nhat/thienDucHop.ts`.
 *
 * ⚠️ SAI KHÁC CÓ CHỦ Ý so với đặc tả: đặc tả xếp Thiên Đức Hợp / Thiên Xá vào nhóm "chưa có công
 * thức → bỏ qua và phân bổ lại trọng số". Nhưng repo ĐÃ CÓ công thức thật cho cả hai
 * (`trach-nhat/thienDucHop.ts`, `trach-nhat/thienXa.ts`, nguồn: bảng do chủ dự án cung cấp
 * 2026-08-11). Bỏ đi là tự làm yếu kết quả, nên ở đây VẪN TÍNH và giữ nguyên phần trọng số cát
 * tinh. Danh sách các mục THẬT SỰ chưa có công thức nằm ở `THIEU_DU_LIEU_MAC_DINH` bên dưới, đã
 * đối chiếu với thanSat.ts — Thiên Giải, Địa Giải, Nguyệt Đức đều đã có nên KHÔNG kê vào đó.
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  tinhTrachCatDayBase,
  type TrachCatDayBaseInput,
  type TrachCatDayBaseRules,
  type TrachCatDayBaseResult,
} from "./trachCatDayBase.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

// ---------------------------------------------------------------------------------------
// Hằng số chống trùng tên (mục N3)
// ---------------------------------------------------------------------------------------

/** Trực Khai — sách còn gọi là "Sinh Khí". KHÁC Sinh Khí cặp Hà Đồ của Huyền Không Đại Quái. */
export const SINH_KHI_TRUC = "Khai" as const;
/** Trực Chấp — sách còn gọi là "Thiên Đức". KHÁC cát tinh Thiên Đức Hợp (thienDucHop.ts). */
export const THIEN_DUC_TEN_KHAC_TRUC = "Chấp" as const;

// ---------------------------------------------------------------------------------------
// Bước 1 — Lọc loại (early exit, chạy TRƯỚC khi chấm điểm)
// ---------------------------------------------------------------------------------------

/** Trực đại hung — loại thẳng, không chấm điểm (đặc tả mục 2). */
export const TRUC_LOAI_THANG: readonly string[] = ["Phá", "Bế"];

export interface KyHopDongCaoCapDayInput extends TrachCatDayBaseInput {
  /** Chi của ngày — dùng cho lớp Tứ Mộ/Tứ Xung và đối chiếu tuổi người ký. */
  chiNgay: Chi;
  /** Can của ngày — dùng cho lớp Thập Thần với Nhật Chủ người ký. */
  canNgay: Can;
  /** Ngũ hành Nạp Âm của ngày — dùng so với Nạp Âm mệnh người ký. */
  napAmNgay: NguHanh;
  /** Tiểu Lục Nhâm của ngày (Đại An / Tốc Hỷ / Tiểu Cát / Lưu Niên / Xích Khẩu / Không Vong). */
  tieuLucNham: string;
  /** Các ngày đại kỵ khác khiến phải loại thẳng (Tứ Ly, Tứ Tuyệt, Nguyệt Tận, Thọ Tử...). */
  ngayDaiKyKhac?: readonly string[];
}

/** Thông tin người ký — bản cao cấp cần ĐỦ ngày-tháng-năm sinh để có Nhật Chủ. */
export interface NguoiKyCaoCap {
  /** Chi của năm sinh — lớp 2 (Lục Hợp/Tam Hợp/Lục Xung...). */
  chiNamSinh: Chi;
  /** Can trụ NGÀY sinh = Nhật Chủ — lớp 1 (Thập Thần). KHÔNG phải Can năm sinh. */
  canNhatChu: Can;
  /** Ngũ hành Nạp Âm mệnh (từ trụ năm sinh) — lớp 3. */
  napAmMenh: NguHanh;
}

export interface LyDoLoai {
  ma: string;
  moTa: string;
}

// ---------------------------------------------------------------------------------------
// Quan hệ Địa Chi (mục N4 lớp 2) — kiến thức nền, không cần file dữ liệu riêng
// ---------------------------------------------------------------------------------------

const CHI_THU_TU: readonly Chi[] = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
];
const chiIndex = (c: Chi): number => CHI_THU_TU.indexOf(c);

/** Lục Hợp: Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tỵ-Thân, Ngọ-Mùi. Tổng chỉ số ≡ 1 (mod 12). */
export function laLucHop(a: Chi, b: Chi): boolean {
  return (chiIndex(a) + chiIndex(b)) % 12 === 1;
}
/** Lục Xung: cách nhau đúng 6 cung. */
export function laLucXung(a: Chi, b: Chi): boolean {
  return Math.abs(chiIndex(a) - chiIndex(b)) === 6;
}
/** Tam Hợp: Thân-Tý-Thìn, Hợi-Mão-Mùi, Dần-Ngọ-Tuất, Tỵ-Dậu-Sửu. */
export function laTamHop(a: Chi, b: Chi): boolean {
  if (a === b) return false;
  const d = Math.abs(chiIndex(a) - chiIndex(b));
  return d === 4 || d === 8;
}
/** Lục Hại: Tý-Mùi, Sửu-Ngọ, Dần-Tỵ, Mão-Thìn, Thân-Hợi, Dậu-Tuất. Tổng ≡ 7 (mod 12). */
export function laLucHai(a: Chi, b: Chi): boolean {
  return (chiIndex(a) + chiIndex(b)) % 12 === 7;
}
/** Lục Phá: Tý-Dậu, Ngọ-Mão, Thân-Tỵ, Dần-Hợi, Thìn-Sửu, Tuất-Mùi. */
const LUC_PHA: readonly (readonly [Chi, Chi])[] = [
  ["Tý", "Dậu"], ["Ngọ", "Mão"], ["Thân", "Tỵ"], ["Dần", "Hợi"], ["Thìn", "Sửu"], ["Tuất", "Mùi"],
];
export function laLucPha(a: Chi, b: Chi): boolean {
  return LUC_PHA.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
/** Tam Hình: Dần-Tỵ-Thân, Sửu-Tuất-Mùi, Tý-Mão (vô lễ), và tự hình Thìn/Ngọ/Dậu/Hợi. */
const TAM_HINH_NHOM: readonly (readonly Chi[])[] = [
  ["Dần", "Tỵ", "Thân"],
  ["Sửu", "Tuất", "Mùi"],
  ["Tý", "Mão"],
];
const TU_HINH: readonly Chi[] = ["Thìn", "Ngọ", "Dậu", "Hợi"];
export function laTamHinh(a: Chi, b: Chi): boolean {
  if (a === b) return TU_HINH.includes(a);
  return TAM_HINH_NHOM.some((nhom) => nhom.includes(a) && nhom.includes(b));
}

/** Tứ Mộ — "kho, chứa, giữ": hợp đồng cần bền lâu. */
export const TU_MO: readonly Chi[] = ["Thìn", "Tuất", "Sửu", "Mùi"];
/** Tứ Xung (tứ sinh) — tính động, dịch chuyển: trừ nhẹ cho hợp đồng cần ổn định. */
export const TU_XUNG: readonly Chi[] = ["Dần", "Thân", "Tỵ", "Hợi"];

// ---------------------------------------------------------------------------------------
// Thập Thần (mục N4 lớp 1) — quan hệ Can ngày ↔ Nhật Chủ
// ---------------------------------------------------------------------------------------

const CAN_THU_TU: readonly Can[] = [
  "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý",
];
/** Ngũ hành của 10 Thiên Can, theo thứ tự trên: Mộc Mộc Hỏa Hỏa Thổ Thổ Kim Kim Thủy Thủy. */
const CAN_NGU_HANH: readonly NguHanh[] = [
  "Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy",
];
/** Can dương ở vị trí chẵn (Giáp, Bính, Mậu, Canh, Nhâm). */
const canLaDuong = (c: Can): boolean => CAN_THU_TU.indexOf(c) % 2 === 0;
const canNguHanh = (c: Can): NguHanh => CAN_NGU_HANH[CAN_THU_TU.indexOf(c)]!;

const VONG_SINH: Record<NguHanh, NguHanh> = {
  "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc",
};
const VONG_KHAC: Record<NguHanh, NguHanh> = {
  "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc",
};

export type ThapThan =
  | "Tỷ Kiên" | "Kiếp Tài"
  | "Thực Thần" | "Thương Quan"
  | "Chính Tài" | "Thiên Tài"
  | "Chính Quan" | "Thất Sát"
  | "Chính Ấn" | "Thiên Ấn";

/**
 * Thập Thần của Can ngày so với Nhật Chủ.
 *
 * Quy tắc: xét quan hệ ngũ hành trước (đồng/sinh ra/khắc ra/bị khắc/được sinh), rồi xét cùng âm
 * dương hay khác âm dương để chọn tên "chính" hay "thiên/lệch".
 */
export function tinhThapThan(canNhatChu: Can, canNgay: Can): ThapThan {
  const nhNhatChu = canNguHanh(canNhatChu);
  const nhNgay = canNguHanh(canNgay);
  const cungAmDuong = canLaDuong(canNhatChu) === canLaDuong(canNgay);

  if (nhNgay === nhNhatChu) return cungAmDuong ? "Tỷ Kiên" : "Kiếp Tài";
  if (VONG_SINH[nhNhatChu] === nhNgay) return cungAmDuong ? "Thực Thần" : "Thương Quan";
  if (VONG_KHAC[nhNhatChu] === nhNgay) return cungAmDuong ? "Thiên Tài" : "Chính Tài";
  if (VONG_KHAC[nhNgay] === nhNhatChu) return cungAmDuong ? "Thất Sát" : "Chính Quan";
  return cungAmDuong ? "Thiên Ấn" : "Chính Ấn";
}

/** Nhóm Thê Tài — đúng mục đích "cần tài lộc, giao dịch, mua bán" (đặc tả 4c, nguyên văn nguồn). */
export const NHOM_THE_TAI: readonly ThapThan[] = ["Chính Tài", "Thiên Tài"];

// ---------------------------------------------------------------------------------------
// Cấu hình trọng số — KHÔNG hard-code trong UI, sửa được ở đây (đặc tả mục 6)
// ---------------------------------------------------------------------------------------

export interface KyHopDongCaoCapRules {
  nen: TrachCatDayBaseRules;
  /** Trọng số khi CÓ tuổi người ký (chế độ 2). Tổng = 1. */
  trongSoCoTuoi: {
    nen: number;
    chuyenBiet: number;
    theTai: number;
    hoangHacDao: number;
    tuongTacNguoi: number;
    tieuLucNham: number;
  };
  /** Trọng số khi KHÔNG có tuổi (chế độ 1) — phần của người ký phân bổ lại. Tổng = 1. */
  trongSoKhongTuoi: {
    nen: number;
    chuyenBiet: number;
    hoangHacDao: number;
    tieuLucNham: number;
  };
  /** Điểm 0-10 cho từng Trực xét riêng góc độ KÝ KẾT (đặc tả 4a — suy luận mở rộng). */
  trucHopKyKet: Record<string, number>;
  /** Điểm nền cho Trực xét theo Kiết/Hung tổng quát (đặc tả mục 3). */
  trucDiemNen: Record<string, number>;
  tuMoCong: number;
  tuXungTru: number;
  tieuLucNhamDiem: Record<string, number>;
  tuongTacNguoi: {
    lucHop: number;
    tamHop: number;
    napAmSinhMenh: number;
    napAmKhacMenh: number;
    lucPha: number;
    lucHai: number;
    tamHinh: number;
    binhHoa: number;
  };
}

export const KY_HOP_DONG_CAO_CAP_SCORING_RULES: KyHopDongCaoCapRules = {
  nen: {
    diemNenTang: 5,
    hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 }, // tính riêng ở nhóm Hoàng/Hắc
    nhiThapBatTu: { cat: 1.0, hung: -1.0 },
    // Kiết/Hung tổng quát của Trực đã tính riêng qua `trucDiemNen`, nên để trống ở đây.
    trucTot: [],
    trucXau: [],
    diemTrucTot: 0,
    diemTrucXau: 0,
    thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.5, tenUuTien: {} },
    ngayDaiKy: { nguyetKy: -3, tamNuong: -3, duongCongKyNhat: -2.5, satChu: -3, diemTranNeuPham: 3 },
    ngayCatKhac: { diemMoiNgayCat: 0.7 },
  },
  // Đặc tả mục 6. Nhóm cát tinh giữ nguyên trong "nen" vì repo có dữ liệu thật (xem đầu file).
  trongSoCoTuoi: { nen: 0.3, chuyenBiet: 0.3, theTai: 0.15, hoangHacDao: 0.1, tuongTacNguoi: 0.1, tieuLucNham: 0.05 },
  trongSoKhongTuoi: { nen: 0.4, chuyenBiet: 0.4, hoangHacDao: 0.13, tieuLucNham: 0.07 },

  // 4a — suy luận mở rộng từ ý nghĩa từng Trực, KHÔNG phải bảng nguyên văn sách.
  trucHopKyKet: {
    "Thành": 10, // Tam Hợp — "thành tựu", ký kết chốt được
    "Định": 10, // Kim Quỹ — "tủ vàng", ổn định lâu dài
    "Chấp": 8, // Thiên Đức (tên khác của Trực) — "ôm vào", cam kết
    "Thâu": 5, // Tặc Kiếp — hợp thu tiền, kỵ hợp tác cần tin cậy
    "Khai": 5, // Sinh Khí — hợp khai trương hơn ký kết
    "Trừ": 5, // Minh Đường — hợp thanh lý hợp đồng cũ hơn ký mới
    "Kiến": 5,
    // ⚠️ SAI KHÁC CÓ CHỦ Ý so với đặc tả (đặc tả xếp Mãn là Hung 2-3 điểm vì tên khác là "Thiên
    // Hình"). Chủ dự án chốt ngày 2026-08-15: với RIÊNG việc ký kết/hợp đồng thì Mãn xếp nhóm
    // TỐT — bản chất "Mãn" là đầy đủ, sung túc, hoàn thành, hợp việc thu hoạch, thu tiền, hoàn
    // tất giao dịch. Đây là phán định nghề của chủ dự án, không phải suy luận của hệ thống.
    "Mãn": 9,
    "Bình": 2, // Quyên Thiệt — khẩu thiệt, dễ tranh chấp giấy tờ
    "Nguy": 2,
  },
  // Mục 3 — Kiết/Hung tổng quát. Phá/Bế không có ở đây vì đã bị loại từ Bước 1.
  trucDiemNen: {
    "Trừ": 9, "Định": 9, "Chấp": 9, "Thành": 10, "Khai": 9,
    "Kiến": 6, "Thâu": 5,
    "Nguy": 4.5,
    // Mãn nâng theo phán định của chủ dự án (xem chú thích ở `trucHopKyKet`) — module này chỉ
    // dùng cho ký kết nên không ảnh hưởng các module khác.
    "Mãn": 8,
    "Bình": 2.5,
  },
  tuMoCong: 1.0,
  tuXungTru: -0.8,
  tieuLucNhamDiem: {
    "Đại An": 10, "Tốc Hỷ": 9, "Tiểu Cát": 9,
    "Lưu Niên": 4, "Xích Khẩu": 2, "Không Vong": 2,
  },
  tuongTacNguoi: {
    lucHop: 10, tamHop: 9, napAmSinhMenh: 8, napAmKhacMenh: 3,
    lucPha: 4, lucHai: 3, tamHinh: 2.5, binhHoa: 6,
  },
};

// ---------------------------------------------------------------------------------------
// Kết quả
// ---------------------------------------------------------------------------------------

export interface YeuToDiem {
  ten: string;
  diem: number;
  ghiChu?: string;
}

export interface KyHopDongCaoCapResult {
  /** true nếu ngày bị loại ở Bước 1 — khi đó `diem` = 0 và không có điểm thành phần. */
  biLoai: boolean;
  lyDoLoai: LyDoLoai[];
  diem: number;
  xepHang: string;
  /** Điểm từng nhóm (thang 0-10) trước khi nhân trọng số. */
  diemThanhPhan: {
    nen: number;
    chuyenBiet: number;
    theTai: number | null;
    hoangHacDao: number;
    tuongTacNguoi: number | null;
    tieuLucNham: number;
  };
  /** Điểm phụ để hiển thị (đặc tả mục 7). */
  diemPhu: {
    contract: number;
    transaction: number | null;
    cooperation: number | null;
    financial: number | null;
  };
  yeuTo: YeuToDiem[];
  thapThan: ThapThan | null;
  /** Các yếu tố chưa có công thức nên KHÔNG được cho điểm — minh bạch với khách. */
  thieuDuLieu: string[];
  nenTangChiTiet: TrachCatDayBaseResult;
}

/** Thang điểm mục N5 — không hard-code ngày nào mấy điểm, điểm phải tính ra từ dữ liệu. */
export function getKyHopDongCaoCapRating(diem: number): string {
  if (diem >= 9) return "⭐ Đại cát – Rất tốt";
  if (diem >= 8) return "⭐ Rất tốt";
  if (diem >= 7) return "🟢 Tốt";
  if (diem >= 5) return "🟡 Có thể dùng";
  if (diem >= 3) return "🟠 Không thuận";
  return "🔴 Không nên chọn";
}

/**
 * Nhóm THẬT SỰ chưa có công thức nên không được cho điểm (đặc tả N2).
 *
 * Danh sách này đã đối chiếu với `trach-nhat/thanSat.ts`, `thienDucHop.ts`, `thienXa.ts` — chỉ giữ
 * lại những mục repo KHÔNG có. Nguyệt Đức, Thiên Giải, Địa Giải, Thiên Đức Hợp, Thiên Xá đều đã có
 * công thức thật và ĐANG được chấm điểm ở lớp nền, nên không được kê vào đây: nói với khách là
 * "chưa tính" trong khi thực ra đã tính là thông tin sai trong một sản phẩm thu phí.
 */
export const THIEU_DU_LIEU_MAC_DINH: readonly string[] = [
  // Chủ dự án đánh dấu "pending_source_verification" ngày 2026-08-15 — chưa chốt được hệ chính.
  "thien_nguyen",
  // Có phương pháp (phân tầng Đại Sát / Trung Sát / Tiểu Sát) nhưng chưa có bảng xếp sát nào vào
  // tầng nào, cũng chưa có bảng cát tinh nào cứu được sát nào → chưa cài được.
  "dai_cat_tinh_hoa_giai",
];

const clamp10 = (d: number): number => Math.max(0, Math.min(10, d));
const round1 = (d: number): number => Math.round(d * 10) / 10;

/** Bước 1 — lọc loại. Trả về danh sách lý do; rỗng nghĩa là ngày qua được vòng lọc. */
export function locLoaiKyHopDong(
  day: KyHopDongCaoCapDayInput,
  nguoiKy?: NguoiKyCaoCap,
): LyDoLoai[] {
  const lyDo: LyDoLoai[] = [];

  if (TRUC_LOAI_THANG.includes(day.trucName)) {
    lyDo.push({ ma: "truc_dai_hung", moTa: `Trực ${day.trucName} — đại hung, không dùng để ký kết.` });
  }
  if (day.tamNuong) lyDo.push({ ma: "tam_nuong", moTa: "Ngày Tam Nương Sát." });
  if (day.nguyetKy) lyDo.push({ ma: "nguyet_ky", moTa: "Ngày Nguyệt Kỵ (Ngũ Quỷ)." });
  if (day.satChu) lyDo.push({ ma: "sat_chu", moTa: "Ngày Sát Chủ." });
  for (const ten of day.ngayDaiKyKhac ?? []) {
    lyDo.push({ ma: "dai_ky_khac", moTa: `Ngày ${ten}.` });
  }

  // Lục Xung với Chi năm sinh người ký → LOẠI ngày, không phải chỉ trừ điểm (đặc tả N4).
  if (nguoiKy && laLucXung(day.chiNgay, nguoiKy.chiNamSinh)) {
    lyDo.push({
      ma: "luc_xung_tuoi",
      moTa: `Chi ngày ${day.chiNgay} Lục Xung với tuổi ${nguoiKy.chiNamSinh} của người ký — đại kỵ.`,
    });
  }

  return lyDo;
}

/** Bước 2 — điểm nền Trạch Cát chung. */
export function tinhDiemNenKyHopDong(
  day: KyHopDongCaoCapDayInput,
  rules: KyHopDongCaoCapRules = KY_HOP_DONG_CAO_CAP_SCORING_RULES,
): { diem: number; chiTiet: TrachCatDayBaseResult } {
  const chiTiet = tinhTrachCatDayBase(day, rules.nen);
  const trucNen = rules.trucDiemNen[day.trucName] ?? 5;
  // Trộn điểm nền chung (thần sát, 28 Tú, đại kỵ) với Kiết/Hung của Trực, cân bằng 50/50.
  const diem = clamp10((chiTiet.diem + trucNen) / 2);
  return { diem: round1(diem), chiTiet };
}

/** Bước 3 — điểm chuyên biệt cho ký kết (4a + 4b). */
export function tinhDiemChuyenBietKyKet(
  day: KyHopDongCaoCapDayInput,
  rules: KyHopDongCaoCapRules = KY_HOP_DONG_CAO_CAP_SCORING_RULES,
): { diem: number; yeuTo: YeuToDiem[] } {
  const yeuTo: YeuToDiem[] = [];
  let diem = rules.trucHopKyKet[day.trucName] ?? 5;
  yeuTo.push({
    ten: `Trực ${day.trucName} xét theo ký kết`,
    diem,
    ghiChu: "Suy luận mở rộng từ ý nghĩa của Trực, không phải bảng nguyên văn sách.",
  });

  if (TU_MO.includes(day.chiNgay)) {
    diem += rules.tuMoCong;
    yeuTo.push({ ten: `Chi ngày ${day.chiNgay} thuộc Tứ Mộ (kho, giữ)`, diem: rules.tuMoCong });
  } else if (TU_XUNG.includes(day.chiNgay)) {
    diem += rules.tuXungTru;
    yeuTo.push({ ten: `Chi ngày ${day.chiNgay} thuộc Tứ Xung (động, dịch chuyển)`, diem: rules.tuXungTru });
  }

  return { diem: round1(clamp10(diem)), yeuTo };
}

/** Bước 4 — tương tác với người ký (chế độ 2). */
export function tinhTuongTacNguoiKy(
  day: KyHopDongCaoCapDayInput,
  nguoiKy: NguoiKyCaoCap,
  rules: KyHopDongCaoCapRules = KY_HOP_DONG_CAO_CAP_SCORING_RULES,
): { diem: number; yeuTo: YeuToDiem[] } {
  const r = rules.tuongTacNguoi;
  const yeuTo: YeuToDiem[] = [];
  const chi = day.chiNgay;
  const chiNguoi = nguoiKy.chiNamSinh;

  // Lục Xung đã bị loại ở Bước 1 nên không xét lại ở đây.
  let diemChi: number;
  if (laLucHop(chi, chiNguoi)) {
    diemChi = r.lucHop;
    yeuTo.push({ ten: `Chi ngày ${chi} Lục Hợp với tuổi ${chiNguoi}`, diem: diemChi });
  } else if (laTamHop(chi, chiNguoi)) {
    diemChi = r.tamHop;
    yeuTo.push({ ten: `Chi ngày ${chi} Tam Hợp với tuổi ${chiNguoi}`, diem: diemChi });
  } else if (laTamHinh(chi, chiNguoi)) {
    diemChi = r.tamHinh;
    yeuTo.push({ ten: `Chi ngày ${chi} Tam Hình với tuổi ${chiNguoi}`, diem: diemChi });
  } else if (laLucHai(chi, chiNguoi)) {
    diemChi = r.lucHai;
    yeuTo.push({ ten: `Chi ngày ${chi} Lục Hại với tuổi ${chiNguoi}`, diem: diemChi });
  } else if (laLucPha(chi, chiNguoi)) {
    diemChi = r.lucPha;
    yeuTo.push({ ten: `Chi ngày ${chi} Lục Phá với tuổi ${chiNguoi}`, diem: diemChi });
  } else {
    diemChi = r.binhHoa;
    yeuTo.push({ ten: `Chi ngày ${chi} bình hòa với tuổi ${chiNguoi}`, diem: diemChi });
  }

  // Lớp 3 — Nạp Âm ngày so với Nạp Âm mệnh.
  let diemNapAm: number;
  if (VONG_SINH[day.napAmNgay] === nguoiKy.napAmMenh || day.napAmNgay === nguoiKy.napAmMenh) {
    diemNapAm = r.napAmSinhMenh;
    yeuTo.push({ ten: `Nạp Âm ngày (${day.napAmNgay}) sinh/hòa mệnh (${nguoiKy.napAmMenh})`, diem: diemNapAm });
  } else if (VONG_KHAC[day.napAmNgay] === nguoiKy.napAmMenh) {
    diemNapAm = r.napAmKhacMenh;
    yeuTo.push({ ten: `Nạp Âm ngày (${day.napAmNgay}) khắc mệnh (${nguoiKy.napAmMenh})`, diem: diemNapAm });
  } else {
    diemNapAm = r.binhHoa;
    yeuTo.push({ ten: `Nạp Âm ngày (${day.napAmNgay}) bình hòa với mệnh`, diem: diemNapAm });
  }

  return { diem: round1(clamp10((diemChi + diemNapAm) / 2)), yeuTo };
}

/** 4c — điểm Thê Tài theo Nhật Chủ người ký. Chỉ chạy được khi có ngày sinh đầy đủ. */
export function tinhDiemTheTai(
  canNgay: Can,
  nguoiKy: NguoiKyCaoCap,
): { diem: number; thapThan: ThapThan; yeuTo: YeuToDiem } {
  const thapThan = tinhThapThan(nguoiKy.canNhatChu, canNgay);
  let diem: number;
  let ghiChu: string;
  if (NHOM_THE_TAI.includes(thapThan)) {
    diem = 10;
    ghiChu = "Đúng mục đích giao dịch/mua bán — nguyên văn trong nguồn.";
  } else if (thapThan === "Tỷ Kiên") {
    diem = 8;
    ghiChu = "Hợp tác bình đẳng — phù hợp hợp đồng liên doanh hơn mua bán.";
  } else if (thapThan === "Kiếp Tài" || thapThan === "Thất Sát") {
    diem = 3;
    ghiChu = "Dễ tranh chấp, chia sẻ lợi ích ngoài ý muốn.";
  } else {
    diem = 5.5;
    ghiChu = "Trung tính với mục đích ký kết.";
  }
  return {
    diem,
    thapThan,
    yeuTo: { ten: `Can ngày ${canNgay} là ${thapThan} so với Nhật Chủ ${nguoiKy.canNhatChu}`, diem, ghiChu },
  };
}

/** Tổng hợp — hàm chính. */
export function calculateKyHopDongCaoCapScore(
  day: KyHopDongCaoCapDayInput,
  nguoiKy?: NguoiKyCaoCap,
  rules: KyHopDongCaoCapRules = KY_HOP_DONG_CAO_CAP_SCORING_RULES,
): KyHopDongCaoCapResult {
  const thieuDuLieu = [...THIEU_DU_LIEU_MAC_DINH];
  const lyDoLoai = locLoaiKyHopDong(day, nguoiKy);

  const nen = tinhDiemNenKyHopDong(day, rules);
  const chuyenBiet = tinhDiemChuyenBietKyKet(day, rules);
  const tieuLucNhamDiem = rules.tieuLucNhamDiem[day.tieuLucNham] ?? 5;
  const hoangHacDiem =
    day.hoangDaoHacDao === "hoàng đạo" ? 9 : day.hoangDaoHacDao === "hắc đạo" ? 3 : 5.5;

  const yeuTo: YeuToDiem[] = [
    ...chuyenBiet.yeuTo,
    { ten: `Ngày ${day.hoangDaoHacDao}`, diem: hoangHacDiem, ghiChu: "Hoàng Đạo KHÔNG tự động là ngày ký tốt — chỉ là một thành phần." },
    { ten: `Tiểu Lục Nhâm: ${day.tieuLucNham}`, diem: tieuLucNhamDiem },
  ];

  let theTaiDiem: number | null = null;
  let thapThan: ThapThan | null = null;
  let tuongTacDiem: number | null = null;

  if (nguoiKy) {
    const tt = tinhDiemTheTai(day.canNgay, nguoiKy);
    theTaiDiem = tt.diem;
    thapThan = tt.thapThan;
    yeuTo.push(tt.yeuTo);

    const tuongTac = tinhTuongTacNguoiKy(day, nguoiKy, rules);
    tuongTacDiem = tuongTac.diem;
    yeuTo.push(...tuongTac.yeuTo);
  }

  let diem: number;
  if (nguoiKy && theTaiDiem !== null && tuongTacDiem !== null) {
    const w = rules.trongSoCoTuoi;
    diem =
      nen.diem * w.nen +
      chuyenBiet.diem * w.chuyenBiet +
      theTaiDiem * w.theTai +
      hoangHacDiem * w.hoangHacDao +
      tuongTacDiem * w.tuongTacNguoi +
      tieuLucNhamDiem * w.tieuLucNham;
  } else {
    const w = rules.trongSoKhongTuoi;
    diem =
      nen.diem * w.nen +
      chuyenBiet.diem * w.chuyenBiet +
      hoangHacDiem * w.hoangHacDao +
      tieuLucNhamDiem * w.tieuLucNham;
  }
  diem = round1(clamp10(diem));

  // Ngày bị loại: điểm về 0 để không bao giờ lọt vào danh sách gợi ý.
  if (lyDoLoai.length > 0) diem = 0;

  const contract = rules.trucHopKyKet[day.trucName] ?? 5;
  return {
    biLoai: lyDoLoai.length > 0,
    lyDoLoai,
    diem,
    xepHang: getKyHopDongCaoCapRating(diem),
    diemThanhPhan: {
      nen: nen.diem,
      chuyenBiet: chuyenBiet.diem,
      theTai: theTaiDiem,
      hoangHacDao: hoangHacDiem,
      tuongTacNguoi: tuongTacDiem,
      tieuLucNham: tieuLucNhamDiem,
    },
    diemPhu: {
      contract,
      transaction: theTaiDiem === null ? null : round1((theTaiDiem + tieuLucNhamDiem) / 2),
      cooperation:
        tuongTacDiem === null ? null : round1((tuongTacDiem + (thapThan === "Tỷ Kiên" ? 10 : 5)) / 2),
      financial:
        theTaiDiem === null ? null : round1((theTaiDiem + (rules.trucHopKyKet[day.trucName] ?? 5)) / 2),
    },
    yeuTo,
    thapThan,
    thieuDuLieu,
    nenTangChiTiet: nen.chiTiet,
  };
}
