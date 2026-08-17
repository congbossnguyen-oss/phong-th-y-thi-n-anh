/**
 * Bảng tra Bát Tinh + ngũ hành Hậu Thiên.
 *
 * Nguồn: `data/bang-tra-bat-tinh.md` của gói "luan-so-dien-thoai" (Bát Cực Linh Số — Thẩm Lập Minh,
 * + "Sim Nói Gì Về Bạn"), chủ dự án cung cấp 2026-08-17. Chép 1-1, KHÔNG suy diễn thêm cặp nào.
 */
import type { CapDo, CatHung, DongTinh, NguHanh, TenTinh } from "../types.js";

/**
 * Ngũ hành Hậu Thiên của 8 chữ số nằm trong Bát Quái.
 *
 * Số 0 và số 5 KHÔNG có trong bảng này vì không có mặt trong 8 quẻ Hậu Thiên — chúng có bản chất
 * riêng (0 = Thủy vượng, 5 = Hỏa dương) và chỉ tham gia ở lớp hiệu ứng, xem `hieuUng50.ts`.
 */
export const NGU_HANH_SO: Readonly<Record<number, NguHanh>> = {
  1: "Thủy",
  2: "Thổ",
  3: "Mộc",
  4: "Mộc",
  6: "Kim",
  7: "Kim",
  8: "Thổ",
  9: "Hỏa",
};

/** Bản chất ngũ hành riêng của 0 và 5 — dùng để diễn giải, không tham gia tra cặp Bát tinh. */
export const NGU_HANH_SO_DAC_BIET: Readonly<Record<number, { nguHanh: NguHanh; moTa: string }>> = {
  0: { nguHanh: "Thủy", moTa: "Thủy vượng — trí tuệ, sâu lắng, nhưng cũng là trống rỗng, cạn kiệt" },
  5: { nguHanh: "Hỏa", moTa: "Hỏa dương — năng động, mạnh mẽ, nhưng cũng nóng nảy, cực đoan" },
};

export interface DinhNghiaTinh {
  ten: TenTinh;
  catHung: CatHung;
  nguHanh: NguHanh;
  /** Mô tả ngắn dùng làm nhãn, vd "Tài phú". */
  chuDe: string;
  /** 4 cấp, index 0 = Cấp 1 (mạnh nhất). Mỗi cấp là danh sách cặp 2 chữ số. */
  capTheoCapDo: readonly (readonly string[])[];
}

/** 4 Cát Tinh. */
export const CAT_TINH: readonly DinhNghiaTinh[] = [
  {
    ten: "Thiên Y",
    catHung: "cát",
    nguHanh: "Thổ",
    chuDe: "Tài phú",
    capTheoCapDo: [["13", "31"], ["68", "86"], ["94", "49"], ["72", "27"]],
  },
  {
    ten: "Diên Niên",
    catHung: "cát",
    nguHanh: "Kim",
    chuDe: "Quyền lực, sự nghiệp, sức khỏe",
    capTheoCapDo: [["19", "91"], ["87", "78"], ["43", "34"], ["26", "62"]],
  },
  {
    ten: "Sinh Khí",
    catHung: "cát",
    nguHanh: "Mộc",
    chuDe: "Quý nhân",
    capTheoCapDo: [["14", "41"], ["67", "76"], ["93", "39"], ["82", "28"]],
  },
  {
    ten: "Phục Vị",
    catHung: "cát",
    nguHanh: "Mộc",
    chuDe: "Trung tính, giữ nguyên trạng",
    capTheoCapDo: [["11", "22"], ["99", "88"], ["77", "66"], ["44", "33"]],
  },
];

/** 4 Hung Tinh. */
export const HUNG_TINH: readonly DinhNghiaTinh[] = [
  {
    ten: "Tuyệt Mệnh",
    catHung: "hung",
    nguHanh: "Kim",
    chuDe: "Phá tài, kiện tụng, bệnh tật",
    capTheoCapDo: [["12", "21"], ["69", "96"], ["84", "48"], ["73", "37"]],
  },
  {
    ten: "Ngũ Quỷ",
    catHung: "hung",
    nguHanh: "Hỏa",
    chuDe: "Biến động, thị phi",
    capTheoCapDo: [["18", "81"], ["97", "79"], ["36", "63"], ["42", "24"]],
  },
  {
    ten: "Lục Sát",
    catHung: "hung",
    nguHanh: "Thủy",
    chuDe: "Đào hoa, thương tổn tình cảm",
    capTheoCapDo: [["16", "61"], ["74", "47"], ["38", "83"], ["92", "29"]],
  },
  {
    ten: "Họa Hại",
    catHung: "hung",
    nguHanh: "Thổ",
    chuDe: "Khẩu thiệt, tai họa bất ngờ",
    capTheoCapDo: [["17", "71"], ["89", "98"], ["64", "46"], ["32", "23"]],
  },
];

export const TAT_CA_TINH: readonly DinhNghiaTinh[] = [...CAT_TINH, ...HUNG_TINH];

export interface TraCuuCap {
  ten: TenTinh;
  catHung: CatHung;
  capDo: CapDo;
  nguHanh: NguHanh;
  chuDe: string;
}

/** Bảng tra phẳng cặp 2 chữ số → Bát tinh. Dựng 1 lần lúc nạp module. */
const BANG_TRA: ReadonlyMap<string, TraCuuCap> = (() => {
  const m = new Map<string, TraCuuCap>();
  for (const tinh of TAT_CA_TINH) {
    tinh.capTheoCapDo.forEach((danhSach, i) => {
      const capDo = (i + 1) as CapDo;
      for (const cap of danhSach) {
        // Trùng cặp giữa 2 tinh là lỗi dữ liệu — ném ngay lúc nạp chứ không im lặng ghi đè.
        const cu = m.get(cap);
        if (cu) {
          throw new Error(`Cặp ${cap} bị khai báo 2 lần: ${cu.ten} và ${tinh.ten}`);
        }
        m.set(cap, {
          ten: tinh.ten,
          catHung: tinh.catHung,
          capDo,
          nguHanh: tinh.nguHanh,
          chuDe: tinh.chuDe,
        });
      }
    });
  }
  return m;
})();

/** Tra một cặp 2 chữ số. Trả null nếu cặp không có trong bảng (vd có chứa 0 hoặc 5). */
export function traCap(cap: string): TraCuuCap | null {
  return BANG_TRA.get(cap) ?? null;
}

/** Toàn bộ cặp đã khai báo — dùng cho test bao phủ. */
export function tatCaCapDaKhaiBao(): string[] {
  return [...BANG_TRA.keys()];
}

/**
 * Cấp 1-2 = "động số" (việc đã thành hiện thực), cấp 3-4 = "tĩnh số" (mới dừng ở ý nghĩ).
 * Nguồn: mục 4d.
 */
export function dongHayTinh(capDo: CapDo): DongTinh {
  return capDo <= 2 ? "động" : "tĩnh";
}

/** Ý nghĩa riêng khi 3 số đuôi rơi vào từng tinh (mục 4c). */
export const Y_NGHIA_DUOI_SO: Readonly<Partial<Record<TenTinh, string>>> = {
  "Diên Niên": "hiểu năng lực, hiểu giữ tiền",
  "Thiên Y": "hiểu kiếm tiền, hiểu tình cảm",
  "Sinh Khí": "hiểu vui vẻ, hiểu giữ bạn bè",
};

/**
 * Tổ hợp 3 chữ số cần đặc biệt lưu ý (mục 5) — cảnh báo mạnh hơn khi nằm ở 4 vị trí cuối.
 *
 * Nhóm "Tuyệt Mệnh" trong tài liệu gốc liệt kê các cặp 2 chữ số (12, 21, 37...) chứ không phải bộ 3
 * — giữ nguyên đúng như nguồn, engine tự phân biệt độ dài khi dò.
 */
export const TO_HOP_CANH_BAO: readonly { nhom: string; moTa: string; toHop: readonly string[] }[] = [
  {
    nhom: "Tổ Họa Hại",
    moTa: "tai họa bất ngờ",
    toHop: ["246", "642", "179", "719", "236", "632"],
  },
  {
    nhom: "Tổ Tuyệt Mệnh",
    moTa: "kiện tụng, bệnh tật, phá tài",
    toHop: ["12", "21", "37", "73", "69", "96", "84", "48"],
  },
  {
    nhom: "Tổ tăng cường Tuyệt Mệnh",
    moTa: "kiện tụng, bệnh tật, phá tài — mức mạnh hơn",
    toHop: ["712", "217", "237", "732", "469", "964", "984", "489"],
  },
  {
    nhom: "Tổ Lục Sát",
    moTa: "thương tổn tình cảm hoặc thân thể",
    toHop: ["216", "621", "473", "374", "296", "692", "384", "483"],
  },
];
