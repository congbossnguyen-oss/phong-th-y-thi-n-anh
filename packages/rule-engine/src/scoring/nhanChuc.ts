/**
 * NGÀY GIỜ NHẬN CHỨC — dịch vụ VIP (thu phí).
 *
 * Nguồn đặc tả: "MODULE CHỌN NGÀY GIỜ NHẬN CHỨC — THIÊN ANH — FINAL SPEC v2.0" (chủ dự án cung
 * cấp trực tiếp 2026-08-18). Đặc tả này BẮT BUỘC:
 *   - Chỉ dùng công thức đã có trong engine (không viết lại Can Chi/thần sát đã có).
 *   - Phân loại rõ mỗi quy tắc: CONFIRMED (đã có công thức) / PENDING_CONFIRMATION (có công thức
 *     nhưng chưa xác nhận áp dụng cho Nhận Chức) / TODO (chưa có công thức, không tự suy diễn).
 *   - Hard filter tách biệt hoàn toàn khỏi scoring; scoring không được đảo hardBlock.
 *
 * Cấu trúc mô phỏng SÁT `kyHopDongCaoCap.ts` (module VIP chị em gần nhất: cùng dạng "chọn ngày
 * cho 1 sự kiện, xét tuổi người chủ sự, không có Tọa nhà") — tái dùng `trachCatDayBase.ts` cho
 * điểm nền, tự viết quan hệ Địa Chi tại chỗ (cùng quy ước với `kyHopDongCaoCap.ts`), và tái dùng
 * `tinhThapThan` từ chính module đó thay vì viết lại (mục 20 đặc tả: không tự tạo Bát Tự Engine
 * đơn giản hoá — chỉ dùng lại đúng 1 hàm Thập Thần đã có, không mở rộng thêm).
 */
import type { Data } from "@thien-anh/calendar-core";
import {
  tinhTrachCatDayBase,
  type TrachCatDayBaseInput,
  type TrachCatDayBaseRules,
  type TrachCatDayBaseResult,
} from "./trachCatDayBase.js";
// Tái dùng LyDoLoai/YeuToDiem/ThapThan từ module VIP chị em thay vì khai lại (tránh trùng tên khi
// re-export gộp ở scoring/index.ts, và giữ đúng một định nghĩa duy nhất).
import { tinhThapThan, type ThapThan, type LyDoLoai, type YeuToDiem } from "./kyHopDongCaoCap.js";
// Bảng 12 Trực + nên/kỵ theo mục đích (chủ dự án bổ sung 2026-08-18). Dùng đánh giá Trực CHUẨN cho
// việc nhận chức + câu mô tả sẵn cho khách, thay lớp Kiết/Hung "tạm thời" trước đây.
import { danhGiaTrucTheoMucDich, type MucDo } from "../trach-nhat/trucDanhGiaTongQuat.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

// ---------------------------------------------------------------------------------------
// Mục 10 đặc tả — Sát / Bạch Hổ Nhập Trung Cung: giữ trạng thái CHƯA XÁC NHẬN cho Nhận Chức.
// ---------------------------------------------------------------------------------------

/**
 * Công thức `(dayIndex + 5) % 9 === 0` đã có và được chủ dự án xác nhận là đại sát thật
 * (`nhapTrungCung.ts`, 2026-08-16). NHƯNG chính file đó tự ghi "đã báo chủ dự án; chưa tự quyết
 * cách xử lý" vì 7 ngày này trùng khít Trực Tinh nhóm Tứ Mạnh (tamDaiCatTinh.ts). Đặc tả Nhận
 * Chức mục 10 yêu cầu giữ `enabled: false` cho tới khi có xác nhận riêng cho use-case Nhận Chức.
 */
export const SAT_NHAP_TRUNG_CUNG_CONFIG = {
  formula: "(dayIndex + 5) % 9 === 0",
  enabled: false,
  canXacNhan: true,
  ghiChu:
    "Công thức đã có (nhapTrungCung.ts, xác nhận 2026-08-16) và trùng số học với Trực Tinh nhóm " +
    "Tứ Mạnh — nguồn tự ghi chưa quyết cách xử lý xung đột này. Giữ enabled=false cho module Nhận " +
    "Chức tới khi chủ dự án xác nhận đây có phải hard block cho việc nhận chức hay không.",
} as const;

// ---------------------------------------------------------------------------------------
// Mục 7 đặc tả — TRUC_RULES.NHAN_CHUC = TODO. Lớp Kiết/Hung TẠM THỜI theo đúng văn bản đặc tả,
// KHÔNG tự suy diễn trọng số mới ngoài những gì đặc tả đã cho.
// ---------------------------------------------------------------------------------------

export const TRUC_NHAN_CHUC_HARD_BLOCK: readonly string[] = ["Phá", "Bế"];
export const TRUC_NHAN_CHUC_KIET_TAM_THOI: readonly string[] = ["Trừ", "Định", "Chấp", "Thành", "Khai"];
export const TRUC_NHAN_CHUC_HUNG_TAM_THOI: readonly string[] = ["Mãn", "Bình"];
/** Kiến, Nguy, Thâu — đặc tả không xếp vào Kiết/Hung tạm thời, giữ trung tính, không suy diễn. */
export const TRUC_RULES_NHAN_CHUC_TODO = true;

// ---------------------------------------------------------------------------------------
// Mục 13 đặc tả — Nhị Thập Bát Tú: 5 sao có đánh giá riêng cho Nhận Chức, do CHÍNH đặc tả cung
// cấp trực tiếp (không phải suy diễn của engine) — coi là CONFIRMED cho phạm vi module này.
// ---------------------------------------------------------------------------------------

export type NhiThapBatTuNhanChucDanhGia = "tot" | "xau" | "ngoai_le_tot";

export const NHI_THAP_BAT_TU_NHAN_CHUC: Readonly<Record<string, { danhGia: NhiThapBatTuNhanChucDanhGia; ghiChu: string }>> = {
  "Lâu": { danhGia: "tot", ghiChu: "Tốt — có ghi nhận chức." },
  "Vĩ": { danhGia: "tot", ghiChu: "Tốt — có thăng chức." },
  "Chẩn": { danhGia: "tot", ghiChu: "Tốt — có thăng quan tiến chức." },
  "Mão": { danhGia: "xau", ghiChu: "Xấu — có ghi kiêng nhậm chức." },
  "Tinh": { danhGia: "ngoai_le_tot", ghiChu: "Có ngoại lệ tốt cho công danh." },
};

// ---------------------------------------------------------------------------------------
// Quan hệ Địa Chi — CÙNG quy ước với `kyHopDongCaoCap.ts` (kiến thức nền, không dị bản).
// ---------------------------------------------------------------------------------------

const CHI_THU_TU: readonly Chi[] = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
];
const chiIndex = (c: Chi): number => CHI_THU_TU.indexOf(c);

function laLucHop(a: Chi, b: Chi): boolean {
  return (chiIndex(a) + chiIndex(b)) % 12 === 1;
}
function laLucXung(a: Chi, b: Chi): boolean {
  return Math.abs(chiIndex(a) - chiIndex(b)) === 6;
}
function laTamHop(a: Chi, b: Chi): boolean {
  if (a === b) return false;
  const d = Math.abs(chiIndex(a) - chiIndex(b));
  return d === 4 || d === 8;
}
function laLucHai(a: Chi, b: Chi): boolean {
  return (chiIndex(a) + chiIndex(b)) % 12 === 7;
}
const LUC_PHA: readonly (readonly [Chi, Chi])[] = [
  ["Tý", "Dậu"], ["Ngọ", "Mão"], ["Thân", "Tỵ"], ["Dần", "Hợi"], ["Thìn", "Sửu"], ["Tuất", "Mùi"],
];
function laLucPha(a: Chi, b: Chi): boolean {
  return LUC_PHA.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
const TAM_HINH_NHOM: readonly (readonly Chi[])[] = [
  ["Dần", "Tỵ", "Thân"],
  ["Sửu", "Tuất", "Mùi"],
  ["Tý", "Mão"],
];
const TU_HINH: readonly Chi[] = ["Thìn", "Ngọ", "Dậu", "Hợi"];
function laTamHinh(a: Chi, b: Chi): boolean {
  if (a === b) return TU_HINH.includes(a);
  return TAM_HINH_NHOM.some((nhom) => nhom.includes(a) && nhom.includes(b));
}

const VONG_SINH: Record<NguHanh, NguHanh> = {
  "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc",
};
const VONG_KHAC: Record<NguHanh, NguHanh> = {
  "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc",
};

// ---------------------------------------------------------------------------------------
// Đầu vào / kết quả
// ---------------------------------------------------------------------------------------

export interface NhanChucDayInput extends TrachCatDayBaseInput {
  chiNgay: Chi;
  canNgay: Can;
  napAmNgay: NguHanh;
  /**
   * Nhị Thập Bát Tú của ngày — cần cả TÊN sao (không chỉ cát/hung) cho lớp chuyên biệt 5 sao
   * Lâu/Vĩ/Chẩn/Mão/Tinh (mục 13). `catHung` tổng quát vẫn giữ ở `nhiThapBatTuCatHung` của lớp nền.
   */
  nhiThapBatTu: { name: string; catHung: "cát" | "hung" };
  /** (Các) Can năm sinh bị kỵ Kim Thần Thất Sát vào đúng ngày này — từ `ngayInfo.ts`. */
  canNamSinhKyKimThanThatSat: readonly Can[];
  /** Ngày có phạm Thọ Tử (sách ghi "Thụ Tử") hay không — tách riêng khỏi mảng `thanSat` để hard-filter đọc thẳng. */
  thoTu: boolean;
  /** Tên các Tam Đại Cát Tinh có mặt — dùng cho quy tắc hoá giải hung tinh thông thường. */
  tamDaiCatTinh?: readonly string[];
}

/** Thông tin người nhận chức — tối thiểu cần đủ ngày-tháng-năm sinh dương lịch. */
export interface NguoiNhanChuc {
  canNamSinh: Can;
  chiNamSinh: Chi;
  /** Can trụ NGÀY sinh = Nhật Chủ — dùng cho lớp Thập Thần Quan/Sát (mục 20, chỉ khi có đủ ngày sinh). */
  canNhatChu: Can;
  napAmMenh: NguHanh;
}

/** Mục 24 đặc tả — khung điểm theo 4 nhóm + phạt, giữ đúng tên trường yêu cầu. */
export interface NhanChucScoreBreakdown {
  auspicious: number;
  career: number;
  personal: number | null;
  hour: number | null;
  penalty: number;
}

export type NhanChucStatus = "ĐẠI TỐT" | "TỐT" | "KHÁ" | "TRUNG BÌNH" | "XẤU" | "LOẠI";

export interface NhanChucResult {
  hardBlock: boolean;
  lyDoLoai: LyDoLoai[];
  diem: number;
  status: NhanChucStatus;
  score: NhanChucScoreBreakdown;
  yeuTo: YeuToDiem[];
  thapThan: ThapThan | null;
  /**
   * Có công thức nhưng CHƯA xác nhận áp dụng cho Nhận Chức — không được âm thầm biến thành luật
   * (mục 4, PENDING_CONFIRMATION).
   */
  canXacNhan: string[];
  /** Có tên/yêu cầu nhưng CHƯA có công thức — không tự suy diễn (mục 4, TODO). */
  thieuDuLieu: string[];
  nenTangChiTiet: TrachCatDayBaseResult;
}

// ---------------------------------------------------------------------------------------
// Cấu hình trọng số — KHÔNG hard-code điểm ngày cụ thể, chỉ cấu hình trọng số/thang điểm.
// ---------------------------------------------------------------------------------------

export interface NhanChucRules {
  nen: TrachCatDayBaseRules;
  /** Trọng số khi CÓ tuổi người nhận chức. Tổng = 1. */
  trongSoCoTuoi: { nen: number; chuyenBiet: number; thapThan: number; hoangHacDao: number; tuoiVaMenh: number };
  /** Trọng số khi KHÔNG có tuổi — phần "tuoiVaMenh"/"thapThan" phân bổ lại. Tổng = 1. */
  trongSoKhongTuoi: { nen: number; chuyenBiet: number; hoangHacDao: number };
  nhiThapBatTuNhanChucDiem: Record<NhiThapBatTuNhanChucDanhGia, number>;
  /** Điểm Trực theo mức độ phù hợp việc nhận chức (bảng nên/kỵ theo mục đích của chủ dự án). */
  trucTheoMucDo: Record<MucDo, number>;
  trucTrungTinh: number;
  /** Thập Thần Quan/Sát (mục 20 — "suy luận mở rộng", không phải Bát Tự đầy đủ). */
  thapThanDiem: Record<ThapThan, number>;
  tuoiVaMenh: {
    lucHop: number;
    tamHop: number;
    lucHai: number;
    lucPha: number;
    tamHinh: number;
    binhHoa: number;
    napAmSinhMenh: number;
    napAmKhacMenh: number;
  };
}

export const NHAN_CHUC_SCORING_RULES: NhanChucRules = {
  nen: {
    diemNenTang: 5,
    hoangDaoHacDao: { "hoàng đạo": 0, "hắc đạo": 0, "không xác định": 0 }, // tính riêng ở nhóm hoangHacDao
    // Nhị Thập Bát Tú tổng quát (24 sao còn lại) — trọng số THẤP HƠN lớp chuyên biệt Nhận Chức
    // (mục 13: "24 sao còn lại dùng đánh giá tổng quát với trọng số thấp hơn").
    nhiThapBatTu: { cat: 0.5, hung: -0.5 },
    trucTot: [], // Trực tính riêng ở lớp chuyên biệt (đặc tả mục 7), không lặp ở nền.
    trucXau: [],
    diemTrucTot: 0,
    diemTrucXau: 0,
    thanSat: { diemMoiCat: 0.4, diemMoiHung: -0.5, tenUuTien: {} },
    ngayDaiKy: { nguyetKy: -3, tamNuong: -3, duongCongKyNhat: -2.5, satChu: -3, diemTranNeuPham: 3, nhapTrungCung: -3 },
    ngayCatKhac: { diemMoiNgayCat: 0.7 },
  },
  trongSoCoTuoi: { nen: 0.3, chuyenBiet: 0.25, thapThan: 0.15, hoangHacDao: 0.1, tuoiVaMenh: 0.2 },
  trongSoKhongTuoi: { nen: 0.45, chuyenBiet: 0.35, hoangHacDao: 0.2 },
  nhiThapBatTuNhanChucDiem: { tot: 10, ngoai_le_tot: 8, xau: 1 },
  trucTheoMucDo: { "dai-cat": 10, hop: 8, "binh-thuong": 5.5, ky: 3 },
  trucTrungTinh: 5.5,
  // Chính Quan = quyền lực chính danh (đúng bản chất "nhận chức"). Chính Ấn = văn bằng/quyết định
  // bổ nhiệm — cũng rất hợp nhưng KHÔNG nằm trong "Quan/Quỷ" mà đặc tả mục 20 cho phép dùng, nên
  // xếp trung tính như các Thập Thần còn lại, không tự mở rộng thêm ngoài Quan/Sát đã được cho phép.
  thapThanDiem: {
    "Chính Quan": 10,
    "Thất Sát": 6,
    "Tỷ Kiên": 5.5,
    "Kiếp Tài": 5.5,
    "Thực Thần": 5.5,
    "Thương Quan": 5.5,
    "Chính Tài": 5.5,
    "Thiên Tài": 5.5,
    "Chính Ấn": 5.5,
    "Thiên Ấn": 5.5,
  },
  tuoiVaMenh: {
    lucHop: 10, tamHop: 9, lucHai: 3, lucPha: 4, tamHinh: 2.5, binhHoa: 6,
    napAmSinhMenh: 8, napAmKhacMenh: 3,
  },
};

// ---------------------------------------------------------------------------------------
// Mục 34 đặc tả — danh sách dữ liệu còn thiếu (TODO, không suy diễn).
// ---------------------------------------------------------------------------------------

export const THIEU_DU_LIEU_NHAN_CHUC: readonly string[] = [
  "gio_quy_nhan_dang_thien_mon", // thiếu phân biệt Dương/Âm Quý + Nguyệt Tướng theo tiết khí.
  "cuu_suu",
  "diet_mot",
  "bang_tieu_ngoa_giai",
  "quan_phu",
  "menh_nhat",
  "cuu_tho_quy",
  "vang_vong",
  "tu_phe_theo_nhan_chuc",
  "luc_hac_dao_cap_ngay",
  "tu_ly",
  "tu_tuyet",
  "nguyet_tan",
  "truong_sinh_tuyet_cho_nguoi_nhan_chuc", // suy diễn có cơ sở nhưng chưa kiểm chứng độc lập — PENDING, không dùng làm hard block.
  "bat_tu_day_du", // chỉ có lớp Thập Thần đơn giản, không có vượng suy/Dụng Thần/tương tác đủ Tứ Trụ.
  "nhi_thap_bat_tu_24_sao_con_lai_theo_nhan_chuc", // chỉ 5 sao (Lâu/Vĩ/Chẩn/Mão/Tinh) có đánh giá riêng, 24 sao còn lại dùng cát/hung tổng quát.
];

const clamp10 = (d: number): number => Math.max(0, Math.min(10, d));
const round1 = (d: number): number => Math.round(d * 10) / 10;

// ---------------------------------------------------------------------------------------
// Bước 1 — Hard filter (mục 9, 21 bước 8). Tách biệt hoàn toàn khỏi scoring.
// ---------------------------------------------------------------------------------------

export function locLoaiNhanChuc(
  day: NhanChucDayInput,
  nguoiNhanChuc?: NguoiNhanChuc,
  config: { enabled: boolean } = SAT_NHAP_TRUNG_CUNG_CONFIG,
): { lyDoLoai: LyDoLoai[]; canXacNhan: string[] } {
  const lyDoLoai: LyDoLoai[] = [];
  const canXacNhan: string[] = [];

  // Trực Phá/Bế — hard block, cát tinh KHÔNG cứu được (mục 9, mục 33: không cho Tam Đại Cát Tinh
  // hoá giải Trung Cung/hard block khác).
  if (TRUC_NHAN_CHUC_HARD_BLOCK.includes(day.trucName)) {
    lyDoLoai.push({
      ma: "truc_dai_hung",
      moTa: `Trực ${day.trucName} — đại hung, không dùng để nhận chức (hard block, cát tinh không cứu được).`,
    });
  }

  // Kim Thần Thất Sát theo Can năm sinh người nhận chức — hard block cấp cao nhất.
  if (nguoiNhanChuc && day.canNamSinhKyKimThanThatSat.includes(nguoiNhanChuc.canNamSinh)) {
    lyDoLoai.push({
      ma: "kim_than_that_sat",
      moTa: `Ngày phạm Kim Thần Thất Sát với tuổi Can ${nguoiNhanChuc.canNamSinh} — hard block.`,
    });
  }

  // Sát Chủ — hard block.
  if (day.satChu) {
    lyDoLoai.push({ ma: "sat_chu", moTa: "Ngày Sát Chủ — hard block, không hoá giải được." });
  }

  // Thọ Tử (sách ghi "Thụ Tử") — hard block.
  if (day.thoTu) {
    lyDoLoai.push({ ma: "tho_tu", moTa: "Ngày Thọ Tử (Thụ Tử) — hard block, không hoá giải được." });
  }

  // Sát / Bạch Hổ Nhập Trung Cung — CHỈ hard block khi cấu hình đã được BẬT xác nhận (mục 10).
  if (day.nhapTrungCung) {
    if (config.enabled) {
      lyDoLoai.push({
        ma: "nhap_trung_cung",
        moTa: "Ngày Sát / Bạch Hổ Nhập Trung Cung — hard block (cấu hình đã xác nhận bật).",
      });
    } else {
      canXacNhan.push(
        "Sát / Bạch Hổ Nhập Trung Cung — công thức đã có nhưng CHƯA xác nhận là hard block riêng " +
          "cho việc nhận chức (SAT_NHAP_TRUNG_CUNG_CONFIG.enabled = false). Cần xem xét thêm.",
      );
    }
  }

  // Tam Nương / Nguyệt Kỵ — hung tinh thông thường theo hệ luật hiện tại của engine (đã áp dụng
  // nhất quán ở `kyHopDongCaoCap.ts`), hoá giải được khi ngày có Tam Đại Cát Tinh.
  const coCatTinh = (day.tamDaiCatTinh ?? []).length > 0;
  if (day.tamNuong && !coCatTinh) {
    lyDoLoai.push({ ma: "tam_nuong", moTa: "Ngày Tam Nương Sát." });
  }
  if (day.nguyetKy && !coCatTinh) {
    lyDoLoai.push({ ma: "nguyet_ky", moTa: "Ngày Nguyệt Kỵ (Ngũ Quỷ)." });
  }

  // Dương Công Kỵ Nhật — repo chưa có quy tắc hoá giải chính thức (xem HUNG_TINH_CHUA_CO_QUY_TAC ở
  // tamDaiCatTinh.ts) — cảnh báo minh bạch, KHÔNG tự loại thẳng.
  if (day.duongCongKyNhat) {
    canXacNhan.push(
      "Dương Công Kỵ Nhật — có mặt trong ngày, nhưng quy tắc hoá giải chưa được xác nhận " +
        "(không tự kết luận loại hay giữ).",
    );
  }

  // Lục Xung trực tiếp với tuổi năm sinh — hard block theo CONFIG hiện tại của engine (đúng quy
  // tắc đã áp dụng ở `kyHopDongCaoCap.ts` mục N4: Lục Xung tuổi luôn hard block, không chỉ trừ điểm).
  if (nguoiNhanChuc && laLucXung(day.chiNgay, nguoiNhanChuc.chiNamSinh)) {
    lyDoLoai.push({
      ma: "luc_xung_tuoi",
      moTa: `Chi ngày ${day.chiNgay} Lục Xung với tuổi ${nguoiNhanChuc.chiNamSinh} — hard block.`,
    });
  }

  return { lyDoLoai, canXacNhan };
}

// ---------------------------------------------------------------------------------------
// Bước 2 — điểm nền Trạch Cát chung (tái dùng `trachCatDayBase.ts`).
// ---------------------------------------------------------------------------------------

export function tinhDiemNenNhanChuc(
  day: NhanChucDayInput,
  rules: NhanChucRules = NHAN_CHUC_SCORING_RULES,
): { diem: number; chiTiet: TrachCatDayBaseResult } {
  const chiTiet = tinhTrachCatDayBase(day, rules.nen);
  return { diem: chiTiet.diem, chiTiet };
}

// ---------------------------------------------------------------------------------------
// Bước 3 — lớp chuyên biệt Nhận Chức: Trực (Kiết/Hung tạm thời) + 28 Tú chuyên biệt.
// ---------------------------------------------------------------------------------------

export function tinhDiemChuyenBietNhanChuc(
  day: NhanChucDayInput,
  rules: NhanChucRules = NHAN_CHUC_SCORING_RULES,
): { diem: number; yeuTo: YeuToDiem[] } {
  const yeuTo: YeuToDiem[] = [];

  // Điểm + nhận xét Trực lấy từ bảng nên/kỵ theo mục đích "nhan-chuc" (dữ liệu chuẩn của chủ dự án).
  // `moTa` là câu đã viết sẵn cho khách đọc, không phải mã kỹ thuật.
  const trucMd = danhGiaTrucTheoMucDich(day.trucName, "nhan-chuc");
  const diemTruc = trucMd ? rules.trucTheoMucDo[trucMd.mucDo] : rules.trucTrungTinh;
  yeuTo.push({ ten: `Trực ${day.trucName}`, diem: diemTruc, ...(trucMd ? { ghiChu: trucMd.moTa } : {}) });

  return { diem: round1(clamp10(diemTruc)), yeuTo };
}

/** 28 Tú chuyên biệt Nhận Chức — tách riêng vì cần TÊN sao, không chỉ cát/hung. */
export function tinh28TuNhanChuc(
  tenSao: string,
  catHungTongQuat: "cát" | "hung",
  rules: NhanChucRules = NHAN_CHUC_SCORING_RULES,
): { diem: number; yeuTo: YeuToDiem } {
  const rieng = NHI_THAP_BAT_TU_NHAN_CHUC[tenSao];
  if (rieng) {
    const diem = rules.nhiThapBatTuNhanChucDiem[rieng.danhGia];
    return {
      diem,
      yeuTo: { ten: `Sao ${tenSao} (Nhị Thập Bát Tú)`, diem, ghiChu: rieng.ghiChu },
    };
  }
  const diem = catHungTongQuat === "cát" ? 6.5 : 4;
  return {
    diem,
    yeuTo: { ten: `Sao ${tenSao} (Nhị Thập Bát Tú — ${catHungTongQuat})`, diem },
  };
}

// ---------------------------------------------------------------------------------------
// Bước 4 — Thập Thần Quan/Sát (chỉ chạy khi có đủ ngày sinh, mục 20).
// ---------------------------------------------------------------------------------------

export function tinhDiemThapThanNhanChuc(
  canNgay: Can,
  nguoiNhanChuc: NguoiNhanChuc,
  rules: NhanChucRules = NHAN_CHUC_SCORING_RULES,
): { diem: number; thapThan: ThapThan; yeuTo: YeuToDiem } {
  const thapThan = tinhThapThan(nguoiNhanChuc.canNhatChu, canNgay);
  const diem = rules.thapThanDiem[thapThan];
  const ghiChu =
    thapThan === "Chính Quan"
      ? "Quyền lực chính danh — rất hợp việc nhận chức."
      : thapThan === "Thất Sát"
        ? "Quyền uy mạnh, đi kèm áp lực và cạnh tranh."
        : "Trung tính với mục tiêu nhận chức.";
  return {
    diem,
    thapThan,
    yeuTo: { ten: `Can ngày ${canNgay} là ${thapThan} so với Nhật Chủ ${nguoiNhanChuc.canNhatChu}`, diem, ghiChu },
  };
}

// ---------------------------------------------------------------------------------------
// Bước 5 — tuổi & mệnh (Lục Hợp/Tam Hợp/Lục Hại/Lục Phá/Tam Hình + Nạp Âm). Lục Xung đã hard
// block ở Bước 1 nên không xét lại ở đây.
// ---------------------------------------------------------------------------------------

export function tinhTuoiVaMenhNhanChuc(
  day: NhanChucDayInput,
  nguoiNhanChuc: NguoiNhanChuc,
  rules: NhanChucRules = NHAN_CHUC_SCORING_RULES,
): { diem: number; yeuTo: YeuToDiem[] } {
  const r = rules.tuoiVaMenh;
  const yeuTo: YeuToDiem[] = [];
  const chi = day.chiNgay;
  const chiNguoi = nguoiNhanChuc.chiNamSinh;

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

  let diemNapAm: number;
  if (VONG_SINH[day.napAmNgay] === nguoiNhanChuc.napAmMenh || day.napAmNgay === nguoiNhanChuc.napAmMenh) {
    diemNapAm = r.napAmSinhMenh;
    yeuTo.push({ ten: `Nạp Âm ngày (${day.napAmNgay}) sinh/hòa mệnh (${nguoiNhanChuc.napAmMenh})`, diem: diemNapAm });
  } else if (VONG_KHAC[day.napAmNgay] === nguoiNhanChuc.napAmMenh) {
    diemNapAm = r.napAmKhacMenh;
    yeuTo.push({ ten: `Nạp Âm ngày (${day.napAmNgay}) khắc mệnh (${nguoiNhanChuc.napAmMenh})`, diem: diemNapAm });
  } else {
    diemNapAm = r.binhHoa;
    yeuTo.push({ ten: `Nạp Âm ngày (${day.napAmNgay}) bình hòa với mệnh`, diem: diemNapAm });
  }

  return { diem: round1(clamp10((diemChi + diemNapAm) / 2)), yeuTo };
}

// ---------------------------------------------------------------------------------------
// Mục 24 — thang xếp hạng 6 bậc, không hard-code ngày nào mấy điểm.
// ---------------------------------------------------------------------------------------

export function getNhanChucRating(diem: number): NhanChucStatus {
  if (diem >= 9) return "ĐẠI TỐT";
  if (diem >= 8) return "TỐT";
  if (diem >= 7) return "KHÁ";
  if (diem >= 5) return "TRUNG BÌNH";
  if (diem >= 3) return "XẤU";
  return "LOẠI";
}

// ---------------------------------------------------------------------------------------
// Tổng hợp — hàm chính, tương đương `calculateKyHopDongCaoCapScore`.
// ---------------------------------------------------------------------------------------

export function calculateNhanChucScore(
  day: NhanChucDayInput,
  nguoiNhanChuc?: NguoiNhanChuc,
  rules: NhanChucRules = NHAN_CHUC_SCORING_RULES,
  trungCungConfig: { enabled: boolean } = SAT_NHAP_TRUNG_CUNG_CONFIG,
): NhanChucResult {
  const thieuDuLieu = [...THIEU_DU_LIEU_NHAN_CHUC];
  const { lyDoLoai, canXacNhan } = locLoaiNhanChuc(day, nguoiNhanChuc, trungCungConfig);

  const nen = tinhDiemNenNhanChuc(day, rules);
  const chuyenBietTruc = tinhDiemChuyenBietNhanChuc(day, rules);
  const chuyenBiet28Tu = tinh28TuNhanChuc(day.nhiThapBatTu.name, day.nhiThapBatTuCatHung, rules);
  const chuyenBietDiem = round1(clamp10((chuyenBietTruc.diem + chuyenBiet28Tu.diem) / 2));

  const hoangHacDiem = day.hoangDaoHacDao === "hoàng đạo" ? 9 : day.hoangDaoHacDao === "hắc đạo" ? 3 : 5.5;

  const yeuTo: YeuToDiem[] = [
    ...chuyenBietTruc.yeuTo,
    chuyenBiet28Tu.yeuTo,
    { ten: `Ngày ${day.hoangDaoHacDao}`, diem: hoangHacDiem },
  ];

  let thapThan: ThapThan | null = null;
  let thapThanDiem: number | null = null;
  let tuoiVaMenhDiem: number | null = null;

  if (nguoiNhanChuc) {
    const tt = tinhDiemThapThanNhanChuc(day.canNgay, nguoiNhanChuc, rules);
    thapThan = tt.thapThan;
    thapThanDiem = tt.diem;
    yeuTo.push(tt.yeuTo);

    const tvm = tinhTuoiVaMenhNhanChuc(day, nguoiNhanChuc, rules);
    tuoiVaMenhDiem = tvm.diem;
    yeuTo.push(...tvm.yeuTo);
  }

  let diem: number;
  if (nguoiNhanChuc && thapThanDiem !== null && tuoiVaMenhDiem !== null) {
    const w = rules.trongSoCoTuoi;
    diem =
      nen.diem * w.nen +
      chuyenBietDiem * w.chuyenBiet +
      thapThanDiem * w.thapThan +
      hoangHacDiem * w.hoangHacDao +
      tuoiVaMenhDiem * w.tuoiVaMenh;
  } else {
    const w = rules.trongSoKhongTuoi;
    diem = nen.diem * w.nen + chuyenBietDiem * w.chuyenBiet + hoangHacDiem * w.hoangHacDao;
    thieuDuLieu.push("chua_nhap_tuoi_nguoi_nhan_chuc_chi_cham_diem_chung");
  }
  diem = round1(clamp10(diem));

  const hardBlock = lyDoLoai.length > 0;
  const penalty = hardBlock ? diem : 0;
  if (hardBlock) diem = 0;

  return {
    hardBlock,
    lyDoLoai,
    diem,
    status: hardBlock ? "LOẠI" : getNhanChucRating(diem),
    score: {
      auspicious: round1((nen.diem + hoangHacDiem) / 2),
      career: chuyenBietDiem,
      personal: tuoiVaMenhDiem,
      hour: null, // Giờ tính riêng ở tầng chọn giờ (xem `chonGioNhanChuc` ở trachnhat-engine).
      penalty,
    },
    yeuTo,
    thapThan,
    canXacNhan,
    thieuDuLieu,
    nenTangChiTiet: nen.chiTiet,
  };
}
